# 🛡️ PT-CheatSheet  

A modern, forkable penetration-testing reference hub — built for speed, clarity, and accessibility.  
Includes interactive cheat-sheets, quick command references, and a growing library of curated resources for offensive & defensive security learning.  

Live demo: **[Render-hosted instance](https://pt-cheatsheet.onrender.com)** (example — yours may differ).  

---

## ⚙️ Overview  

**PT-CheatSheet** is a lightweight Flask-powered web app serving static HTML cheat sheets.  
Each tab represents a key pentesting domain: web security, privilege escalation, tooling, and curated study resources.  

Everything is fully static — no login, no database, no cookies — just fast access to knowledge.  

---

## 📂 Repository structure  

| Path | Description |
|------|--------------|
| `server.py` | Tiny Flask server that serves all HTML/CSS/JS pages. |
| `templates/` | Base layout (`index.html`). |
| `content/` | Topic cheat sheets (`tools-cheat-sheet.html`, `linux-priv-esc.html`, etc.). |
| `markdown/` | Markdown-converted PortSwigger Academy pages. |
| `static/` | Assets — `main.js`, `style.css`, images, icons. |
| `requirements.txt` | Python dependencies. |
| `Procfile` | Render/Heroku startup command (`gunicorn server:app`). |

---

## 🧭 Current tabs  

- **Tools Cheatsheet** — quick reference for common pentest tools  
- **PortSwigger Cheatsheet** — full list of web vulnerability labs & writeups  
- **Windows PrivEsc** — commands, tools, and PowerShell snippets  
- **Linux PrivEsc** — enumeration, privilege escalation, and post-exploitation commands  
- **Images Cheatsheet** — visual, image-based quick references  
- **Topics** — thematic entry points for each cheat sheet section  
- **Resources** *(new)* — curated collection of external links, learning platforms, and must-have tools  

> 🗑️ The legacy *Notebook* tab was removed for simplicity — all notes and routes related to `/save-note`, `/get-notes`, etc., have been deprecated.  


## 🧰 Cheat sheet categories  

The site includes pages for (among others):

- API Testing  
- Access Control  
- Authentication  
- Business Logic Vulnerabilities  
- Command Injection  
- Cross-Origin Resource Sharing (CORS)  
- Cross-Site Request Forgery (CSRF)  
- Cross-Site Scripting (XSS)  
- Directory Traversal  
- DOM-based Vulnerabilities  
- File Upload Vulnerabilities  
- GraphQL API Vulnerabilities  
- HTTP Request Smuggling  
- JWT Attacks  
- NoSQL Injection  
- OAuth Authentication  
- Prototype Pollution  
- Race Conditions  
- SQL Injection  
- Server-Side Template Injection (SSTI)  
- Server-Side Request Forgery (SSRF)  
- XXE Injection  
- Web Cache Poisoning  
- WebSockets  

…and many others from the PortSwigger Academy collection.  


## 🧠 New “Resources” tab  

A modern grid of curated external links with short descriptions, matching the site’s dark-red gradient theme.  
Includes:

- PayloadsAllTheThings  
- GTFOBins & LOLBAS  
- RevShells  
- CyberChef  
- Sectools.org  
- Exploit-DB  
- TryHackMe / HackTheBox / pwn.college / PortSwigger Academy / BugBountyHunter  
- …and dozens more hand-picked tools and learning platforms.  


## 🚀 Run locally  

# (recommended) create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt

# start Flask development server
python server.py
Then open http://127.0.0.1:5000 in your browser.

☁️ Deploy to Render (or similar)
Render automatically redeploys on every push to GitHub.
If deploying manually, ensure the Start Command is:


gunicorn server:app
🧩 For local testing on Windows, use python server.py instead of Gunicorn.

🔒 Security & usage note
This repository includes educational pentesting materials.
⚠️ Do not upload or distribute executable pentest tools, cracked binaries, or payloads.
Keep this repository strictly for documentation, notes, and references.

Use responsibly — for authorized testing and education only.

🤝 Contributing
Fork → branch → edit → pull request.

All contributions welcome — fix typos, improve styling, add cheat sheets, or propose new resource links.
Please keep commits focused and readable.

🧑‍💻 Credits
Created and maintained by Dylan (@DylansGit)
Design, code, and structure by the PT-CheatSheet project.
All rights reserved to the internet — fork freely, learn openly.