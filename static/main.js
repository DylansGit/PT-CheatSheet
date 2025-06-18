document.addEventListener('DOMContentLoaded', function () {
    // Ensure tabs and subtabs load after DOM is fully ready

    window.scrollTo(0, 0);

    function showTab(tabId) {
        const fileMap = {
            'home': { filename: 'home.html', divId: 'home' },
            'toolscheatsheet': { filename: 'tools-cheat-sheet.html', divId: 'toolscheatsheet' },
            'portswiggercheatsheet': { filename: 'portswigger-cheat-sheet.html', divId: 'portswigger' },
            'windowsprivesc': { filename: 'windows-priv-esc.html', divId: 'windowsprivesc' },
            'linuxprivesc': { filename: 'linux-priv-esc.html', divId: 'linuxprivesc' },
            'imagescheatsheet': { filename: 'images-cheat-sheet.html', divId: 'imagescheatsheet' },
            'topics': { filename: 'topics.html', divId: 'topics' },
            'notebook': { filename: 'notebook.html', divId: 'notebook' }
        };

        const tabInfo = fileMap[tabId];
        if (!tabInfo) {
            console.error('Invalid tab ID');
            return;
        }

        fetch(`/content/${tabInfo.filename}`)
            .then(response => response.text())
            .then(data => {
                const contentDiv = document.getElementById('tab-content');
                if (contentDiv) {
                    contentDiv.innerHTML = `<div id="${tabInfo.divId}" class="tab-content active">${data}</div>`;
                }

                // Set active class for the clicked tab
                const tabLinks = document.querySelectorAll('.tab');
                tabLinks.forEach(tab => {
                    tab.classList.remove('active');
                });

                const selectedTabLink = document.querySelector(`.tab[onclick="showTab('${tabId}')"]`);
                if (selectedTabLink) {
                    selectedTabLink.classList.add('active');
                }
            })
            .catch(error => console.error('Error loading content:', error));
    }

    function showHomePage() {
        fetch('/content/home.html')
            .then(response => response.text())
            .then(data => {
                const contentDiv = document.getElementById('tab-content');
                if (contentDiv) {
                    contentDiv.innerHTML = `<div id="home" class="tab-content active">${data}</div>`;
                }

                // Set home tab active
                const tabLinks = document.querySelectorAll('.tab');
                tabLinks.forEach(tab => {
                    tab.classList.remove('active');
                });

                const homeTab = document.querySelector('.tab[onclick="showHomePage()"]');
                if (homeTab) {
                    homeTab.classList.add('active');
                }
            })
            .catch(error => console.error('Error loading content:', error));
    }

    function toggleDetails(id) {
        const element = document.getElementById(id);
        if (element.style.display === "none" || element.style.display === "") {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }

    function collapseAllRows() {
        const detailsElements = document.querySelectorAll('.tool-details');
        detailsElements.forEach(element => {
            element.style.display = "none";
        });
    }

    function scrollToTop() {
        collapseAllRows();  // Collapse rows before scrolling
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Make sure functions are accessible globally
    window.showTab = showTab;
    window.showHomePage = showHomePage;
    window.toggleDetails = toggleDetails;
    window.collapseAllRows = collapseAllRows;
    window.scrollToTop = scrollToTop;

    // Load the default home page
    showHomePage();
});

// Sub-tab function
function showSubTab(evt, subTabId) {
    const subTabs = document.getElementsByClassName('sub-tab-content');
    for (let i = 0; i < subTabs.length; i++) {
        subTabs[i].style.display = 'none'; // Hide all sub-tab contents
    }

    document.getElementById(subTabId).style.display = 'block'; // Show the selected sub-tab

    // Load notes when the "View Notes" tab is selected
    if (subTabId === 'view-notes') {
        loadNotes();
    }
}

// Event listener for saving notes
function saveNote() {
    const note = document.getElementById('note-input').value;
    if (!note) {
        alert('Please write something in the note.');
        return;
    }
    fetch('/save-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: note })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
            alert('Note saved successfully!');
            document.getElementById('note-input').value = '';
            loadNotes();  // Refresh notes list
        } else {
            alert('Failed to save the note.');
        }
      });
}

// Delete a note
function deleteNote(index) {
    fetch(`/delete-note/${index}`, {
        method: 'DELETE'
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
            loadNotes();  // Refresh notes list
        }
    });
}

// Edit note prompt
function editNotePrompt(index) {
    const newNote = prompt('Edit your note:');
    if (newNote) {
        fetch(`/edit-note/${index}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ note: newNote })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                loadNotes();  // Refresh notes list
            }
        });
    }
}

function loadNotes() {
    fetch('/get-notes')
        .then(response => response.json())
        .then(data => {
            const notesList = document.getElementById('notes-list');
            notesList.innerHTML = ''; // Clear any previous notes

            const buttonsContainer = document.querySelector('.notes-buttons-fixed');
            buttonsContainer.innerHTML = ''; // Clear previous buttons if necessary

            if (Array.isArray(data.notes) && data.notes.length > 0) {
                data.notes.forEach((note, index) => {
                    notesList.innerHTML += `<li>${note} 
                        <button class="noteslist-buttons" onclick="deleteNote(${index})">Delete</button>
                        <button class="noteslist-buttons" onclick="editNotePrompt(${index})">Edit</button>
                    </li>`;
                });

                // Optionally add extra buttons or features here if needed
                // buttonsContainer.innerHTML = '<button class="noteslist-buttons" onclick="someFunction()">Some Action</button>';
            } else {
                notesList.innerHTML = '<li>No notes available.</li>';
            }
        })
        .catch(error => console.error('Error loading notes:', error));
}


// Attach the loadNotes function to the event listener of the "View Notes" tab
document.querySelector('.sub-tab[onclick="showSubTab(event, \'view-notes\')"]').addEventListener('click', loadNotes);
