from flask import Flask, jsonify, request, send_from_directory
import os

app = Flask(__name__)

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/content/<filename>')
def serve_content(filename):
    return send_from_directory('content', filename)

@app.route('/markdown/<path:filename>')
def serve_markdown(filename):
    return send_from_directory('markdown', filename)

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

# Path to notes file
NOTES_FILE = os.path.join('content', 'notes.txt')

# Helper function to read notes from the file
def read_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r') as f:
            return [line.strip() for line in f.readlines()]
    return []

# Helper function to write notes to the file
def write_notes(notes):
    with open(NOTES_FILE, 'w') as f:
        f.write('\n'.join(notes))

# Route to save a new note
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

# Route to get all notes
@app.route('/get-notes', methods=['GET'])
def get_notes():
    notes = read_notes()
    return jsonify(notes=notes)

# Route to delete a note
@app.route('/delete-note/<int:index>', methods=['DELETE'])
def delete_note(index):
    notes = read_notes()
    if 0 <= index < len(notes):
        notes.pop(index)
        write_notes(notes)
        return jsonify(success=True)
    return jsonify(success=False), 400

# Route to edit a note
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


@app.after_request
def add_headers(response):
    response.headers['Permissions-Policy'] = "clipboard-write=(self), clipboard-read=(self)"
    return response




if __name__ == '__main__':
    app.run(debug=True)
