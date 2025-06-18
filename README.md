# Pentester Training Web Platform

This is a fully HTML-based training platform built with Django, designed for junior penetration testers and cybersecurity enthusiasts. It covers essential web application security topics, provides examples and explanations, and includes resources for exam preparation and practical hacking exercises.

---

## 🔍 Covered Topics

The platform includes hands-on content and structured explanations for:

- API Testing  
- Access Control  
- Authentication  
- Business Logic Vulnerabilities  
- Clickjacking  
- Command Injection  
- Cross-Origin Resource Sharing (CORS)  
- Cross-site Request Forgery (CSRF)  
- Cross-site Scripting (XSS)  
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
- Server-Side Template Injection  
- Server-side Request Forgery (SSRF)  
- Web Cache Poisoning  
- WebSockets  
- XXE Injection  

Includes examples, diagrams, static images, and references like the [PortSwigger Cheat Sheet](https://portswigger.net/cheat-sheet).

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/your-username/your-repo.git
cd your-repo
2. (Optional) Create & Activate Virtual Environment

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
3. Install Dependencies

pip install -r requirements.txt
4. Run the Server
You can either:

Run the .bat file included
OR

Run the server manually:


python server.py
You’ll see a local address like:


http://127.0.0.1:8000/
Visit it in your browser.

📁 Project Structure
server.py – Django server entry point

templates/ – HTML pages for each topic

static/ – Images, CSS, and JS assets

topics/ – Training content organized by category

.gitignore, requirements.txt, README.md – Environment and repo configs

📚 License & Credits
This project is for educational use only.
Credits to resources such as PortSwigger and OWASP.

🤝 Contributions
Feel free to fork or open pull requests to improve or expand the platform!
