from flask import Flask, jsonify, request, send_from_directory
import os
import json

app = Flask(__name__)

# Serve static files (CSS, JS, etc.)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Serve HTML content files
@app.route('/content/<filename>')
def serve_content(filename):
    return send_from_directory('content', filename)

# Serve markdown files
@app.route('/markdown/<path:filename>')
def serve_markdown(filename):
    return send_from_directory('markdown', filename)

# Serve the index HTML file
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

# Path to the JSON notes file
NOTES_FILE = os.path.join('content', 'notes.json')

# Helper function to read notes from the JSON file
def read_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

# Helper function to write notes to the JSON file
def write_notes(notes):
    with open(NOTES_FILE, 'w') as f:
        json.dump(notes, f, indent=4)

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
    with open('content/notes.json', 'r') as file:
        notes = json.load(file)
    return jsonify(notes=notes)

# Route to delete a note by index
@app.route('/delete-note/<int:index>', methods=['DELETE'])
def delete_note(index):
    notes = read_notes()
    if 0 <= index < len(notes):
        notes.pop(index)
        write_notes(notes)
        return jsonify(success=True)
    return jsonify(success=False), 400

# Route to edit a note by index
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

if __name__ == '__main__':
    app.run(debug=True)
