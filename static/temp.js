// main.js — PT-CheatSheet
// Single-file, DOM-ready. Search indexes elements inside HTML content and navigates to them.

(function () {
  // -------------------------
  // Utility helpers
  // -------------------------
  function qs(selector, root = document) { return root.querySelector(selector); }
  function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function escapeHtml(s) { return String(s).replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c])); }


  const SPECIAL_COPY_PAGES = [
  "linuxprivesc",
  "windowsforensics",
  "windowshardening",
  "windowspowershell",
  "windowsactivedir",
  "bashing",
  "linuxhardening"
];


  // temporary highlight helper
  function flashHighlight(targetEl) {
    if (!targetEl) return;
    targetEl.classList.add('pt-search-highlight');
    setTimeout(() => targetEl.classList.remove('pt-search-highlight'), 2200);
  }

  // inject highlight CSS once
  function ensureHighlightStyle() {
    if (document.getElementById('pt-search-highlight-style')) return;
    const s = document.createElement('style');
    s.id = 'pt-search-highlight-style';
    s.textContent = `
      .pt-search-highlight {
        animation: pt-highlight 2s ease forwards;
        box-shadow: 0 0 0 3px rgba(153,0,0,0.12) inset, 0 8px 24px rgba(153,0,0,0.12);
        border-radius: 6px;
      }
      @keyframes pt-highlight {
        0% { background: rgba(153,0,0,0.18); }
        60% { background: transparent; }
        100% { background: transparent; }
      }
    `;
    document.head.appendChild(s);
  }

  // -------------------------
  // Tab loader 
  // -------------------------
  const FILE_MAP = {
    'home': { filename: 'home.html', divId: 'home' },

    // Tools
    'toolscheatsheet':       { filename: 'tools-cheat-sheet.html', divId: 'toolscheatsheet' },
    'portswiggercheatsheet': { filename: 'portswigger-cheat-sheet.html', divId: 'portswigger' },
    'imagescheatsheet':      { filename: 'images-cheat-sheet.html', divId: 'imagescheatsheet' },

    // Windows
    'windowsprivesc':     { filename: 'windows-priv-esc.html',        divId: 'windowsprivesc' },
    'windowsforensics':   { filename: 'windows-forensics.html',       divId: 'windowsforensics' },
    'windowshardening':   { filename: 'windows-hardening.html',       divId: 'windowshardening' },
    'windowstools':       { filename: 'windows-tools.html',           divId: 'windowstools' },
    'windowspowershell':  { filename: 'windows-powershell.html',      divId: 'windowspowershell' },
    'windowsactivedir':   { filename: 'windows-active-directory.html', divId: 'windowsactivedir' },

    // Linux
    'linuxprivesc':   { filename: 'linux-priv-esc.html', divId: 'linuxprivesc' },
    'linuxforensics': { filename: 'linux-forensics.html', divId: 'linuxforensics' },
    'linuxhardening': { filename: 'linux-hardening.html', divId: 'linuxhardening' },
    'bashing':        { filename: 'bashing.html',          divId: 'bashing' },

    // Misc
    'scripts':          { filename: 'scripts-cheat-sheet.html',            divId: 'scripts' },
    'topics':          { filename: 'topics.html',            divId: 'topics' },
    'resources':       { filename: 'resources-links.html',   divId: 'resources' },
    'aiseccheatsheet': { filename: 'ai-sec-cheat-sheet.html', divId: 'aiseccheatsheet' }
  };


  async function loadContentIntoTab(path, preserveTabActive = true) {
    try {
        const res = await fetch('/' + path);
        if (!res.ok) throw new Error('not-found');
        const html = await res.text();
        const contentDiv = document.getElementById('tab-content');
        if (!contentDiv) return;

        // Inject content (normal or markdown)
        if (path.startsWith('markdown/')) {
            contentDiv.innerHTML = `
                <div class="tab-content active"><div class="markdown-body">${html}</div></div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="tab-content active">${html}</div>
            `;
        }

        // PortSwigger styling (if needed)
        ensurePortSwiggerCSS();

        // IMPORTANT: do NOT run copy logic here.
        // It will run in showTab(), AFTER comments are styled.

        if (preserveTabActive === false) return;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        const fname = path.split('/').pop();
        for (const [tid, info] of Object.entries(FILE_MAP)) {
            if (info.filename === fname) {
                const tabEl = document.querySelector(`.tab[onclick="showTab('${tid}')"]`);
                if (tabEl) tabEl.classList.add('active');
                break;
            }
        }
    } catch (err) {
        console.warn('loadContentIntoTab failed for', path, err);
    }
  }


  async function showTab(tabId) {
    const tabInfo = FILE_MAP[tabId];
    if (!tabInfo) return;

    await loadContentIntoTab('content/' + tabInfo.filename);

    // 1. style comments for EVERY page
    stylePreComments();

    // 2. global copy system (except special pages)
    applyGlobalCopyButtons();

    // 3. per-line copy for SPECIAL pages ONLY
    applyInlineCopyOnSpecialPages();
}

  async function showHomePage() { await showTab('home'); }

  function toggleDetails(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
  }

  function collapseAllRows() {
    qsa('.tool-details').forEach(e => e.style.display = 'none');
  }

  function scrollToTop() {
    // collapse open sections
    collapseAllRows();

    // force both scroll roots to zero
    const tab = document.querySelector('#tab-content');
    if (tab) tab.scrollTop = 0;

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // smooth correction to the window in case browser ignores direct assignments
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // expose globals for inline onclicks
  window.showTab = showTab;
  window.showHomePage = showHomePage;
  window.toggleDetails = toggleDetails;
  window.collapseAllRows = collapseAllRows;
  window.scrollToTop = scrollToTop;


  // -------------------------
  // SEARCH — index internal elements (tool-row, portsWigger links, markdown)
  // -------------------------
  document.addEventListener('DOMContentLoaded', () => {
    ensureHighlightStyle();

    // files to check in content and markdown
    const CONTENT_FILES = [
      'home.html',
      'tools-cheat-sheet.html',
      'portswigger-cheat-sheet.html',
      'images-cheat-sheet.html',

      // Windows
      'windows-priv-esc.html',
      'windows-hardening.html',
      'windows-powershell.html',
      'windows-forensics.html',
      'windows-active-directory.html',

      // Linux
      'linux-priv-esc.html',
      'linux-forensics.html',
      'linux-hardening.html',
      'bashing.html',

      // Misc
      'ai-sec-cheat-sheet.html',
      'scripts-cheat-sheet.html',
      'topics.html',
      'resources-links.html',
      'notebook.html'
    ];

    const MARKDOWN_FILES = [
      'access-control.html',
      'api-testing.html',
      'authentication.html',
      'business-logic-vulnerabilities.html',
      'clickjacking.html',
      'command-injection.html',
      'cors.html',
      'csrf.html',
      'xss.html',
      'directory-traversal.html',
      'dom-based-vulnerabilities.html',
      'essential-skills.html',
      'exam-prep.html',
      'file-upload-vulnerabilities.html',
      'graphql-api-vulnerabilities.html',
      'http-host-header-attacks.html',
      'http-request-smuggling.html',
      'information-disclosure.html',
      'insecure-deserialization.html',
      'jwt-attacks.html',
      'nosql-injection.html',
      'oauth-authentication.html',
      'prototype-pollution.html',
      'race-conditions.html',
      'ssrf.html',
      'server-side-template-injection.html',
      'sql-injection.html',
      'web-cache-poisoning.html',
      'websockets.html',
      'xxe-injection.html'
    ];

    const input = qs('#site-search');
    const clearBtn = qs('#search-clear');
    const resultsBox = qs('#search-results');
    const resultsList = qs('#search-results-list');

    if (!input) return;

    let INDEX = []; // entries: {type:'content'|'markdown', path:'file.html', kind:'tool-row'|'link'|'text', key:..., title, excerpt}
    let built = false;

    async function buildIndex() {
      if (built) return;
      INDEX = [];
      // index content files for .tool-row and portswigger anchors
      // --- Parallel indexing ---
      await Promise.all(CONTENT_FILES.map(async (f) => {
        try {
          const res = await fetch('/content/' + f);
          if (!res.ok) return;
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');

          // .tool-row entries
          qsa('.tool-row', doc).forEach((row, idx) => {
            const t = row.querySelector('.tool-name') || row.querySelector('h2') || row.querySelector('h3');
            const title = t ? t.textContent.trim() : '';
            const text = (row.textContent || '').replace(/\s+/g, ' ').trim();
            INDEX.push({ type: 'content', path: f, kind: 'tool-row', index: idx, title: title || `${f} — tool ${idx+1}`, excerpt: text.slice(0,240), body: text });
          });

          // PortSwigger anchors
          if (f.toLowerCase().includes('portswigger')) {
            qsa('a[href]', doc).forEach((a) => {
              const href = a.getAttribute('href') || '';
              const text = (a.textContent || href).trim();
              INDEX.push({ type:'content', path:f, kind:'link', href, title:text, excerpt:(a.title||text).slice(0,200), body:text });
            });
          }

          // Headings fallback
          qsa('h1,h2,h3,p', doc).slice(0,30).forEach(h => {
            const t = (h.textContent || '').trim();
            if (t) INDEX.push({ type:'content', path:f, kind:'text', title:t.slice(0,80), excerpt:t.slice(0,200), body:t });
          });
        } catch {}
      }));

      await Promise.all(MARKDOWN_FILES.map(async (f) => {
        try {
          const res = await fetch('/markdown/' + f);
          if (!res.ok) return;
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          qsa('h1,h2,h3,p,li', doc).slice(0,200).forEach(n => {
            const txt = (n.textContent || '').trim();
            if (txt) INDEX.push({ type:'markdown', path:f, kind:'text', title:txt.slice(0,80), excerpt:txt.slice(0,200), body:txt });
          });
        } catch {}
      }));


      built = true;
      console.log('[Search] Index built, entries:', INDEX.length);
    }

    function renderResultItem(entry) {
      const wrap = document.createElement('div');
      wrap.className = 'pt-search-item';
      wrap.style.padding = '8px 10px';
      wrap.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
      wrap.style.cursor = 'pointer';
      const source = entry.type === 'markdown' ? 'Markdown' : 'Content';
      const kind = entry.kind || 'text';
      wrap.innerHTML = `
        <div style="font-weight:600;color:#fff">${escapeHtml(entry.title || entry.path)}</div>
        <div style="font-size:12px;color:#cfcfcf;margin-top:4px">${escapeHtml(entry.excerpt || '')}</div>
        <div style="font-size:11px;color:#9aa0a6;margin-top:6px">Source: ${escapeHtml(entry.path)} • ${escapeHtml(kind)} • ${escapeHtml(source)}</div>
      `;
      return wrap;
    }

    async function openSearchEntry(entry) {
      try {
        const url = entry.type === 'markdown' ? `/markdown/${entry.path}` : `/content/${entry.path}`;
        // load the containing page
        const res = await fetch(url);
        if (!res.ok) { alert('Could not load content.'); return; }
        const html = await res.text();
        const contentDiv = qs('#tab-content');
        if (!contentDiv) return;
        contentDiv.innerHTML = `<div class="tab-content active">${html}</div>`;
        // now locate the element inside the loaded DOM
        // because content is injected, query against contentDiv
        const root = contentDiv;
        // If tool-row → scroll to nth .tool-row
        if (entry.kind === 'tool-row') {
          const rows = qsa('.tool-row', root);
          const target = rows[entry.index] || rows[0];
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            flashHighlight(target);
          }
        } else if (entry.kind === 'link') {
          // try to find anchor by href or by text
          const anchors = qsa('a[href]', root);
          let target = anchors.find(a => a.getAttribute('href') === entry.href);
          if (!target) {
            target = anchors.find(a => (a.textContent || '').trim() === (entry.title || '').trim());
          }
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            flashHighlight(target);
          } else {
            // fallback: highlight first link
            if (anchors.length) { anchors[0].scrollIntoView({behavior:'smooth', block:'center'}); flashHighlight(anchors[0]); }
          }
        } else {
          // text / markdown → try to find a node whose text contains entry.excerpt
          const allNodes = qsa('h1,h2,h3,p,li,div', root);
          let found = null;
          const needle = (entry.excerpt || entry.title || '').slice(0, 60).toLowerCase();
          for (const n of allNodes) {
            if ((n.textContent || '').toLowerCase().includes(needle)) { found = n; break; }
          }
          if (found) { found.scrollIntoView({behavior:'smooth', block:'center'}); flashHighlight(found); }
        }
      } catch (err) {
        console.warn('openSearchEntry fail', err);
        alert('Failed to open search result');
      }
    }

    // showResults wired to input
    async function showResults(query) {
      resultsList.innerHTML = '';
      if (!query) { resultsBox.style.display = 'none'; return; }
      // if (!built) await buildIndex();

      const q = query.toLowerCase().trim();
      if (!q) { resultsBox.style.display = 'none'; return; }
      // simple scoring: entries that contain whole query earlier boost
      const matches = INDEX
        .map(e => {
          const body = (e.body || '').toLowerCase();
          let score = -1;
          const idx = body.indexOf(q);
          if (idx >= 0) score = 1000 - idx; // earlier = higher score
          // emphasize exact title match
          if ((e.title || '').toLowerCase().includes(q)) score += 200;
          return { e, score };
        })
        .filter(x => x.score >= 0)
        .sort((a,b) => b.score - a.score)
        .slice(0, 30)
        .map(x => x.e);

      if (matches.length === 0) {
        resultsList.innerHTML = `<div style="padding:8px;color:#aaa;">No matches found</div>`;
        resultsBox.style.display = 'block';
        return;
      }

      matches.forEach(entry => {
        const item = renderResultItem(entry);
        item.addEventListener('click', () => { openSearchEntry(entry); resultsBox.style.display = 'none'; input.value = ''; });
        resultsList.appendChild(item);
      });

      resultsBox.style.display = 'block';
    }

    // wire events
    input.addEventListener('focus', () => { if (!built) buildIndex(); });
    input.addEventListener('input', function () { showResults(this.value.trim()); });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; resultsBox.style.display = 'none'; } });

    if (clearBtn) clearBtn.addEventListener('click', () => { input.value = ''; resultsList.innerHTML = ''; resultsBox.style.display = 'none'; input.focus(); });

    document.addEventListener('click', e => {
      if (!e.target.closest('#search-wrapper') && !e.target.closest('#search-results')) resultsBox.style.display = 'none';
    });
  }); // end DOMContentLoaded (search)


  // initialize home on load
  document.addEventListener('DOMContentLoaded', () => {
  showHomePage();
  });

  document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.dropdown-parent');

  tabs.forEach(tab => {
    const panelId = tab.getAttribute('data-menu');
    const panel = document.getElementById(panelId);

    // Position panel under tab
    function positionPanel() {
      const rect = tab.getBoundingClientRect();
      panel.style.top = (rect.bottom + window.scrollY + 4) + 'px';
      panel.style.left = rect.left + 'px';
    }

    tab.addEventListener('mouseenter', () => {
      positionPanel();
      panel.classList.add('open');
    });

    tab.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (!panel.matches(':hover')) panel.classList.remove('open');
      }, 120);
    });

    panel.addEventListener('mouseleave', () => {
      panel.classList.remove('open');
    });
  });
});

})();


// ------------------------------------------------------
// PortSwigger tab CSS loader + link handler (final version)
// ------------------------------------------------------

(function () {
  function ensurePortSwiggerCSS() {
    if (document.getElementById('portswigger-css')) return;
    const link = document.createElement('link');
    link.id = 'portswigger-css';
    link.rel = 'stylesheet';
    link.href = '/static/main.css?v=2';  // <-- add this line
    document.head.appendChild(link);
  }


  const originalShowTab = window.showTab;
  window.showTab = async function (tabId) {
    await originalShowTab(tabId);

    // When PortSwigger tab opens
    if (tabId === 'portswiggercheatsheet' || tabId === 'portswigger') {
      ensurePortSwiggerCSS();

      // Intercept PortSwigger links for in-app display
      setTimeout(() => {
        const root = document.querySelector('#tab-content');
        if (!root) return;
        const links = root.querySelectorAll('a[target="_blank"], a[href^="/markdown/"]');
        links.forEach(a => {
          a.removeAttribute('target');
          a.addEventListener('click', e => {
            e.preventDefault();
            const href = a.getAttribute('href');
            if (!href) return;
            fetch(href)
              .then(res => res.text())
              .then(html => {
                root.innerHTML = `<div class="tab-content active">${html}</div>`;
                ensurePortSwiggerCSS(); // keep style applied for markdown
              })
              .catch(() => alert('Failed to load: ' + href));
          });
        });
      }, 400);
    }

    setTimeout(() => {
        stylePreComments();                 // always style comments
        applyInlineCopyOnSpecialPages();    // ONLY per-line copy on special pages
    }, 60);

  };
})();


function stylePreComments() {
    document.querySelectorAll("pre").forEach(pre => {
        let html = pre.innerHTML;

        // only transform fresh content once
        if (html.includes('comment-line')) return;

        const lines = html.split("\n").map(line => {
            if (line.trim().startsWith("#")) {
                return `<span class="comment-line">${line}</span>`;
            }
            return line;
        });

        pre.innerHTML = lines.join("\n");
    });
}

function applyInlineCopyOnSpecialPages() {
    // detect active tab ID
    const active = document.querySelector('.tab.active');
    if (!active) return;

    const tabId = active.getAttribute('onclick')?.match(/showTab\('(.+)'\)/)?.[1];
    if (!SPECIAL_COPY_PAGES.includes(tabId)) return;

    // apply extra processing ONLY on the special pages
    document.querySelectorAll("pre").forEach(pre => {

        // prevent double work
        if (pre.classList.contains("special-pre-processed")) return;
        pre.classList.add("special-pre-processed");

        const lines = pre.innerText.split("\n");

        const html = lines.map(line => {
            const trimmed = line.trim();

            // COMMENT → keep your styled comment system
            if (trimmed.startsWith("#") || trimmed === "") {
                return `<div class="pre-line comment-line">${escapeHtml(line)}</div>`;
            }

            // NON-COMMENT → add inline copy button
            return `
                <div class="pre-line">
                    <span class="inline-copy-container">
                        <code>${escapeHtml(line)}</code>
                        <button class="inline-copy-btn">Copy</button>
                    </span>
                </div>`;
        }).join("\n");

        pre.innerHTML = html;

        // activate copy buttons for this PRE only
        pre.querySelectorAll(".inline-copy-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const text = btn.parentElement.querySelector("code").innerText;
                navigator.clipboard.writeText(text).then(() => {
                    btn.textContent = "✔";
                    setTimeout(() => btn.textContent = "Copy", 900);
                });
            });
        });
    });
}


function scrollToSection(id) {
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
}


document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.dropdown-parent').forEach(parent => {
        const menuId = parent.getAttribute('data-menu');
        const panel = document.getElementById(menuId);

        if (!panel) return;

        parent.addEventListener('mouseenter', () => {
            const rect = parent.getBoundingClientRect();
            panel.style.left = rect.left + "px";
            panel.style.top = (rect.bottom + 6) + "px";
        });
    });
});



function applyGlobalCopyButtons() {
    // Skip global copy on special pages
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const id = activeTab.getAttribute('onclick')?.match(/showTab\('(.+)'\)/)?.[1];
        if (SPECIAL_COPY_PAGES.includes(id)) return;
    }

    // Remove old wrappers
    document.querySelectorAll(".inline-copy-container").forEach(el => {
        const code = el.querySelector("code");
        if (code) el.replaceWith(code);
    });
    document.querySelectorAll(".inline-copy-btn").forEach(btn => btn.remove());
    document.querySelectorAll(".pre-copy-container").forEach(el => {
        const pre = el.querySelector("pre");
        if (pre) el.replaceWith(pre);
    });
    document.querySelectorAll(".pre-copy-btn").forEach(btn => btn.remove());

    // Wrap <code>
    document.querySelectorAll("code").forEach(code => {
        if (code.parentElement.classList.contains("inline-copy-container")) return;

        const wrap = document.createElement("span");
        wrap.className = "inline-copy-container";
        code.parentNode.insertBefore(wrap, code);
        wrap.appendChild(code);

        const btn = document.createElement("button");
        btn.className = "inline-copy-btn";
        btn.textContent = "Copy";

        btn.onclick = e => {
            e.stopPropagation();
            navigator.clipboard.writeText(code.innerText).then(() => {
                btn.textContent = "✔";
                setTimeout(() => btn.textContent = "Copy", 900);
            });
        };

        wrap.appendChild(btn);
    });

    // Wrap <pre>
    document.querySelectorAll("pre").forEach(pre => {
        if (pre.parentElement.classList.contains("pre-copy-container")) return;

        const wrap = document.createElement("div");
        wrap.className = "pre-copy-container";

        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);

        const btn = document.createElement("button");
        btn.className = "pre-copy-btn";
        btn.textContent = "Copy";

        btn.onclick = () => {
            navigator.clipboard.writeText(pre.innerText).then(() => {
                btn.textContent = "✔";
                setTimeout(() => btn.textContent = "Copy", 900);
            });
        };

        wrap.appendChild(btn);
    });
}


// --- Mobile: auto-close dropdown panels after tapping an item ---
document.addEventListener('click', (e) => {
  if (window.innerWidth > 900) return; // only mobile

  const item = e.target.closest('.dropdown-item');
  if (!item) return;

  const panel = item.closest('.dropdown-panel');
  if (panel) panel.classList.remove('open');
});


function enhancePreWithLineCopy() {
    document.querySelectorAll("pre").forEach(pre => {

        // Skip already processed blocks
        if (pre.classList.contains("enhanced-pre")) return;
        pre.classList.add("enhanced-pre");

        const lines = pre.innerText.split("\n");

        const newHtml = lines.map(line => {
            const trimmed = line.trim();

            if (trimmed.startsWith("#") || trimmed === "") {
                return `<div class="pre-line comment-line">${escapeHtml(line)}</div>`;
            }

            return `
                <div class="pre-line">
                    <span class="inline-copy-container">
                        <code>${escapeHtml(line)}</code>
                        <button class="inline-copy-btn">Copy</button>
                    </span>
                </div>`;
        }).join("\n");

        pre.innerHTML = newHtml;

        // Bind copy buttons inside this PRE only
        pre.querySelectorAll(".inline-copy-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const text = btn.parentElement.querySelector("code").innerText;
                navigator.clipboard.writeText(text).then(() => {
                    btn.textContent = "✔";
                    setTimeout(() => btn.textContent = "Copy", 900);
                });
            });
        });
    });
}
