// main.js — PT-CheatSheet (refactored)
// Single-file, DOM-ready. Search indexes elements inside HTML content and navigates to them.
// Improvements: caching, debounce, single DOMContentLoaded, safer error handling, smaller surface.

(function () {
  // -------------------------
  // Helpers
  // -------------------------
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from((r || document).querySelectorAll(s));
  const escapeHtml = s => String(s).replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));

  function once(fn) { let done = false; return (...a) => { if (done) return; done = true; return fn(...a); }; }
  function debounce(fn, wait = 250) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; }

  // -------------------------
  // UI helpers
  // -------------------------
  function flashHighlight(el) {
    if (!el) return;
    el.classList.add('pt-search-highlight');
    setTimeout(() => el.classList.remove('pt-search-highlight'), 2200);
  }

  const ensureHighlightStyle = once(() => {
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
  });

  // -------------------------
  // Tab / content loader
  // -------------------------
  const FILE_MAP = {
    'home': { filename: 'home.html', divId: 'home' },
    'toolscheatsheet': { filename: 'tools-cheat-sheet.html', divId: 'toolscheatsheet' },
    'portswiggercheatsheet': { filename: 'portswigger-cheat-sheet.html', divId: 'portswigger' },
    'windowsprivesc': { filename: 'windows-priv-esc.html', divId: 'windowsprivesc' },
    'linuxprivesc': { filename: 'linux-priv-esc.html', divId: 'linuxprivesc' },
    'imagescheatsheet': { filename: 'images-cheat-sheet.html', divId: 'imagescheatsheet' },
    'topics': { filename: 'topics.html', divId: 'topics' },
    'resources': { filename: 'resources-links.html', divId: 'resources' }
  };

  const PAGE_CACHE = {}; // url -> html text

  async function fetchCached(url) {
    if (PAGE_CACHE[url]) return PAGE_CACHE[url];
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('not-found');
      const txt = await r.text();
      PAGE_CACHE[url] = txt;
      return txt;
    } catch (err) {
      console.warn('fetchCached failed', url, err);
      return null;
    }
  }

  async function loadContentIntoTab(path, preserveTabActive = true) {
    const url = '/' + path;
    const html = await fetchCached(url);
    const contentDiv = qs('#tab-content');
    if (!contentDiv) return;
    if (!html) {
      contentDiv.innerHTML = `<div class="tab-content active"><div style="padding:18px;color:#f6f6f6">Failed to load content: ${escapeHtml(path)}</div></div>`;
      return;
    }
    if (path.startsWith('markdown/')) {
      contentDiv.innerHTML = `<div class="tab-content active"><div class="markdown-body">${html}</div></div>`;
    } else {
      contentDiv.innerHTML = `<div class="tab-content active">${html}</div>`;
    }

    if (!preserveTabActive) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const fname = path.split('/').pop();
    for (const [tid, info] of Object.entries(FILE_MAP)) {
      if (info.filename === fname) {
        const tabEl = document.querySelector(`.tab[onclick="showTab('${tid}')"]`);
        if (tabEl) tabEl.classList.add('active');
        break;
      }
    }
  }

  async function showTab(tabId) {
    const tabInfo = FILE_MAP[tabId];
    if (!tabInfo) { console.error('Invalid tab ID', tabId); return; }
    await loadContentIntoTab('content/' + tabInfo.filename);
    // post-load hook: portswigger link interception
    if (tabId === 'portswiggercheatsheet' || tabId === 'portswigger') {
      interceptPortswiggerLinks();
    }
  }

  async function showHomePage() { await showTab('home'); }

  function collapseAllRows() { qsa('.tool-details').forEach(e => e.style.display = 'none'); }
  function scrollToTop() { collapseAllRows(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // expose globals
  window.showTab = showTab;
  window.showHomePage = showHomePage;
  window.collapseAllRows = collapseAllRows;
  window.scrollToTop = scrollToTop;

  // -------------------------
  // Notes (kept for compatibility but safe-guarded)
  // -------------------------
  function saveNote() {
    const note = (qs('#note-input') || {}).value;
    if (!note) return;
    fetch('/save-note', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ note })})
      .then(r => r.json()).then(d => { if (d.success) { if (qs('#note-input')) qs('#note-input').value = ''; loadNotes(); } else console.warn('saveNote failed'); })
      .catch(e => console.warn('saveNote error', e));
  }
  function loadNotes() {
    fetch('/get-notes').then(r => r.json()).then(d => {
      const list = qs('#notes-list'); if (!list) return;
      list.innerHTML = ''; (d.notes||[]).forEach((n,i) => list.insertAdjacentHTML('beforeend', `<li>${escapeHtml(n)} <button onclick="deleteNote(${i})">Delete</button> <button onclick="editNotePrompt(${i})">Edit</button></li>`));
    }).catch(e => console.warn('loadNotes fail', e));
  }
  function deleteNote(idx) { fetch(`/delete-note/${idx}`, { method: 'DELETE' }).then(r => r.json()).then(d => { if (d.success) loadNotes(); }).catch(e => console.warn(e)); }
  function editNotePrompt(idx) {
    const newNote = prompt('Edit your note:'); if (!newNote) return;
    fetch(`/edit-note/${idx}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ note: newNote })})
      .then(r => r.json()).then(d => { if (d.success) loadNotes(); }).catch(e => console.warn(e));
  }

  // -------------------------
  // Search — build index + UI
  // -------------------------
  const CONTENT_FILES = [
    'tools-cheat-sheet.html',
    'portswigger-cheat-sheet.html',
    'windows-priv-esc.html',
    'linux-priv-esc.html',
    'images-cheat-sheet.html',
    'topics.html',
    // notebook intentionally removed from index to avoid noise
    // resources page is external links only — skip indexing it
  ];

  const MARKDOWN_FILES = [
    'access-control.html','api-testing.html','authentication.html','business-logic-vulnerabilities.html',
    'clickjacking.html','command-injection.html','cors.html','csrf.html','xss.html','directory-traversal.html',
    'dom-based-vulnerabilities.html','essential-skills.html','exam-prep.html','file-upload-vulnerabilities.html',
    'graphql-api-vulnerabilities.html','http-host-header-attacks.html','http-request-smuggling.html',
    'information-disclosure.html','insecure-deserialization.html','jwt-attacks.html','nosql-injection.html',
    'oauth-authentication.html','prototype-pollution.html','race-conditions.html','ssrf.html',
    'server-side-template-injection.html','sql-injection.html','web-cache-poisoning.html','websockets.html','xxe-injection.html'
  ];

  let INDEX = [];
  let indexBuilt = false;

  async function buildIndex() {
    if (indexBuilt) return;
    INDEX = [];
    // content pages
    for (const f of CONTENT_FILES) {
      const txt = await fetchCached('/content/' + f);
      if (!txt) continue;
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      // tool rows
      qsa('.tool-row', doc).forEach((row, idx) => {
        const t = row.querySelector('.tool-name') || row.querySelector('h2') || row.querySelector('h3');
        const title = t ? (t.textContent || '').trim() : '';
        const body = (row.textContent || '').replace(/\s+/g,' ').trim();
        INDEX.push({ type:'content', path: f, kind:'tool-row', index: idx, title: title || `${f} — tool ${idx+1}`, excerpt: body.slice(0,240), body });
      });
      // anchors for portswigger
      if (f.toLowerCase().includes('portswigger')) {
        qsa('a[href]', doc).forEach(a => {
          const href = a.getAttribute('href') || '';
          const text = (a.textContent || href).trim();
          INDEX.push({ type:'content', path: f, kind:'link', href, title: text, excerpt: (a.title||text).slice(0,200), body: text });
        });
      }
      // headings fallback
      qsa('h1,h2,h3,p', doc).slice(0,30).forEach(h => {
        const t = (h.textContent||'').trim(); if (!t) return;
        INDEX.push({ type:'content', path: f, kind:'text', title: t.slice(0,80), excerpt: t.slice(0,200), body: t });
      });
    }

    // markdown pages
    for (const f of MARKDOWN_FILES) {
      const txt = await fetchCached('/markdown/' + f);
      if (!txt) continue;
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      qsa('h1,h2,h3,p,li', doc).slice(0,200).forEach(n => {
        const txtn = (n.textContent||'').trim(); if (!txtn) return;
        INDEX.push({ type:'markdown', path: f, kind:'text', title: txtn.slice(0,80), excerpt: txtn.slice(0,200), body: txtn });
      });
    }

    indexBuilt = true;
    console.log('[Search] index built:', INDEX.length);
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
    const url = entry.type === 'markdown' ? `/markdown/${entry.path}` : `/content/${entry.path}`;
    const html = await fetchCached(url);
    const contentDiv = qs('#tab-content');
    if (!contentDiv) return;
    if (!html) { contentDiv.innerHTML = `<div class="tab-content active"><div style="padding:18px;color:#f6f6f6">Failed to load</div></div>`; return; }
    contentDiv.innerHTML = `<div class="tab-content active">${html}</div>`;
    const root = contentDiv;
    // scroll to target
    if (entry.kind === 'tool-row') {
      const rows = qsa('.tool-row', root);
      const target = rows[entry.index] || rows[0];
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); flashHighlight(target); return; }
    }
    if (entry.kind === 'link') {
      const anchors = qsa('a[href]', root);
      let target = anchors.find(a => a.getAttribute('href') === entry.href);
      if (!target) target = anchors.find(a => (a.textContent||'').trim() === (entry.title||'').trim());
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); flashHighlight(target); return; }
    }
    // generic text search fallback
    const list = qsa('h1,h2,h3,p,li,div', root);
    const needle = (entry.excerpt || entry.title || '').slice(0,60).toLowerCase();
    for (const n of list) {
      if ((n.textContent||'').toLowerCase().includes(needle)) { n.scrollIntoView({behavior:'smooth', block:'center'}); flashHighlight(n); return; }
    }
  }

  // wire search UI (single DOMContentLoaded below)
  let inputEl, clearBtn, resultsBox, resultsList;
  function wireSearchUI() {
    inputEl = qs('#site-search'); clearBtn = qs('#search-clear'); resultsBox = qs('#search-results'); resultsList = qs('#search-results-list');
    if (!inputEl) return;
    inputEl.addEventListener('focus', () => { if (!indexBuilt) buildIndex(); });
    inputEl.addEventListener('input', debounce(function () { showResults(this.value || ''); }, 200));
    inputEl.addEventListener('keydown', e => { if (e.key === 'Escape') { inputEl.value=''; resultsBox.style.display='none'; } });
    if (clearBtn) clearBtn.addEventListener('click', () => { inputEl.value=''; resultsList.innerHTML=''; resultsBox.style.display='none'; inputEl.focus(); });
    document.addEventListener('click', e => {
      if (!e.target.closest('#search-wrapper') && !e.target.closest('#search-results')) resultsBox.style.display = 'none';
    });
  }

  async function showResults(query) {
    resultsList.innerHTML = '';
    if (!query) { if (resultsBox) resultsBox.style.display='none'; return; }
    if (!indexBuilt) await buildIndex();
    const q = query.toLowerCase().trim();
    if (!q) { resultsBox.style.display='none'; return; }
    const matches = INDEX.map(e => {
      const body = (e.body || '').toLowerCase();
      let score = -1;
      const idx = body.indexOf(q);
      if (idx >= 0) score = 1000 - idx;
      if ((e.title || '').toLowerCase().includes(q)) score += 200;
      return { e, score };
    }).filter(x => x.score >= 0).sort((a,b) => b.score - a.score).slice(0,30).map(x => x.e);

    if (matches.length === 0) {
      resultsList.innerHTML = `<div style="padding:8px;color:#aaa;">No matches found</div>`; resultsBox.style.display='block'; return;
    }

    matches.forEach(entry => {
      const item = renderResultItem(entry);
      item.addEventListener('click', () => { openSearchEntry(entry); resultsBox.style.display='none'; inputEl.value=''; });
      resultsList.appendChild(item);
    });
    resultsBox.style.display='block';
  }

  // -------------------------
  // PortSwigger link interception (kept but safer)
  // -------------------------
  function ensurePortSwiggerCSS() {
    if (document.getElementById('portswigger-css')) return;
    const link = document.createElement('link');
    link.id = 'portswigger-css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  function interceptPortswiggerLinks() {
    ensurePortSwiggerCSS();
    // small delay to allow injected content to render
    setTimeout(() => {
      const root = qs('#tab-content');
      if (!root) return;
      const links = root.querySelectorAll('a[target="_blank"], a[href^="/markdown/"]');
      links.forEach(a => {
        a.removeAttribute('target');
        a.addEventListener('click', e => {
          e.preventDefault();
          const href = a.getAttribute('href');
          if (!href) return;
          fetchCached(href).then(html => {
            if (!html) { console.warn('Failed to fetch', href); return; }
            root.innerHTML = `<div class="tab-content active">${html}</div>`;
            ensurePortSwiggerCSS();
          }).catch(err => console.warn('Failed to load', href, err));
        });
      });
    }, 300);
  }

  // -------------------------
  // Init: DOM ready once
  // -------------------------
  document.addEventListener('DOMContentLoaded', () => {
    ensureHighlightStyle();
    wireSearchUI();
    // wire notes button if exists (safe)
    const btn = document.querySelector('.sub-tab[onclick="showSubTab(event, \'view-notes\')"]');
    if (btn) btn.addEventListener('click', loadNotes);
    // initial page
    showHomePage().catch(err => console.warn('showHomePage failed', err));
  });

})();
