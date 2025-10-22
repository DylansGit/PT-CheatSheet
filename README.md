# PT CheatSheet

A compact, forkable pen-testing cheat sheet web app — quick references, small cheat-sheets, and tools notes for common web / infra security topics.

This site is a lightweight Flask app that serves static HTML cheat sheets, small image cheat-sheets, and a simple notebook for notes. Anyone can fork and contribute — contributions welcome. All rights reserved to the internet.

---

## What this repo contains

- `server.py` — small Flask server used to serve pages and a tiny notes API.  
- `templates/` — base HTML pages (index).  
- `content/` — per-topic HTML cheat sheets (home.html, tools-cheat-sheet.html, etc.).  
- `markdown/` — additional markdown-converted pages and examples.  
- `static/` — CSS, JS and images (`main.js`, `style.css`, images).  
- `requirements.txt` — Python dependencies for deployment.  
- `Procfile` — simple command for production hosts (e.g. Render).

---

## Cheat sheet sections (examples included)

The site includes (but is not limited to) cheat sheets for:

- API Testing  
- Access Control  
- Authentication  
- Business Logic Vulnerabilities  
- Clickjacking  
- Command Injection  
- CORS (Cross-Origin Resource Sharing)  
- CSRF (Cross-site Request Forgery)  
- XSS (Cross-site Scripting)  
- DOM-based Vulnerabilities  
- Directory Traversal  
- Essential Skills  
- Exam Prep  
- File Upload Vulnerabilities  
- GraphQL API Vulnerabilities  
- HTTP Host Header Attacks  
- HTTP Request Smuggling  
- Information Disclosure  
- Insecure Deserialization  
- JWT Attacks  
- NoSQL Injection  
- OAuth Authentication  
- Prototype Pollution  
- Race Conditions  
- SQL Injection  
- Server-Side Template Injection (SSTI)  
- SSRF (Server-side Request Forgery)  
- Web Cache Poisoning  
- WebSockets  
- XXE Injection  

Also included: tools cheat sheets, images cheat sheets, Windows & Linux privilege escalation notes, and small utilities / examples.

---

## Quick start — run locally

> Recommended: create & activate a virtualenv first.

# create venv (optional but recommended)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt

# run locally (Flask dev server)
python server.py

# open http://127.0.0.1:5000 in your browser
Notes:

The Flask app serves index.html from templates/ and loads content from /content/<filename> and /markdown/<filename>.

Notes API endpoints:

POST /save-note — save new note (JSON { "note": "..." })

GET /get-notes — fetch notes

DELETE /delete-note/<index> — delete note by index

POST /edit-note/<index> — edit note (JSON { "note": "..." })

Production (Render / Heroku style)
Procfile in repo root should contain:

makefile
Copy code
web: gunicorn server:app
If deploying to Render, ensure the Start Command is gunicorn server:app.

Do not attempt to run gunicorn on Windows locally — use python server.py locally for testing.

Routes overview
/ → index page (loads tabs UI)

/static/<path:filename> → static assets (CSS / JS / images)

/content/<filename> → HTML cheat sheet fragments

/markdown/<path:filename> → markdown-derived pages

Notes API (see Quick start)

Security & safety note (important)
This repo contains references and example files related to pentesting. Some content (keygens, activators, cracked installers or tools you may have kept locally) will be detected as malicious by antivirus software. Do not upload or reintroduce cracked software or unknown executables. If you include pentest tools (linpeas, binwalk, VMs) keep them in a dedicated, offline folder and only store non-executable notes in the repo.

Contributing
Contributions welcome! Fork the repo, open a branch, make changes, and send a PR with a short description of the change. Keep content focused, cite sources where appropriate, and avoid including potentially malicious binaries in PRs.

Contact & credits
Created and maintained by Dylan — contributions from the community welcome.

All rights reserved to the internet. Anyone can fork and contribute.