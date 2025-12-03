from flask import Flask, jsonify, request, send_from_directory, make_response
import os

app = Flask(__name__)

# -----------------------------------------
# STATIC FILES (CSS/JS/images)
# Add NO-CACHE headers so Render CDN NEVER serves stale files
# -----------------------------------------
@app.route('/static/<path:filename>')
def serve_static(filename):
    response = make_response(send_from_directory('static', filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# -----------------------------------------
# CONTENT FILES
# -----------------------------------------
@app.route('/content/<filename>')
def serve_content(filename):
    response = make_response(send_from_directory('content', filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# -----------------------------------------
# MARKDOWN FILES
# -----------------------------------------
@app.route('/markdown/<path:filename>')
def serve_markdown(filename):
    response = make_response(send_from_directory('markdown', filename))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# -----------------------------------------
# INDEX PAGE
# -----------------------------------------
@app.route('/')
def index():
    response = make_response(send_from_directory('templates', 'index.html'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# -----------------------------------------
# NOTES SYSTEM
# -----------------------------------------
NOTES_FILE = os.path.join('content', 'notes.txt')

def read_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r') as f:
            return [line.strip() for line in f.readlines()]
    return []

def write_notes(notes):
    with open(NOTES_FILE, 'w') as f:
        f.write('\n'.join(notes))

@app.route('/save-note', methods=['POST'])
def save_note():
    data = request.json
    note = data.get('note')
    if note:
        notes = read_notes()
        notes.append(note)
        write_notes(notes)
        return jsonify(success=True)
    return jsonify(success=False), 400

@app.route('/get-notes', methods=['GET'])
def get_notes():
    notes = read_notes()
    return jsonify(notes=notes)

@app.route('/delete-note/<int:index>', methods=['DELETE'])
def delete_note(index):
    notes = read_notes()
    if 0 <= index < len(notes):
        notes.pop(index)
        write_notes(notes)
        return jsonify(success=True)
    return jsonify(success=False), 400

@app.route('/edit-note/<int:index>', methods=['POST'])
def edit_note(index):
    data = request.json
    new_note = data.get('note')
    notes = read_notes()
    if 0 <= index < len(notes):
        notes[index] = new_note
        write_notes(notes)
        return jsonify(success=True)
    return jsonify(success=False), 400

# -----------------------------------------
# GLOBAL HEADERS (clipboard permissions)
# -----------------------------------------
@app.after_request
def add_headers(response):
    response.headers['Permissions-Policy'] = "clipboard-write=(self), clipboard-read=(self)"
    return response

# -----------------------------------------
# RUN SERVER
# -----------------------------------------
if __name__ == '__main__':
    app.run(debug=True)
