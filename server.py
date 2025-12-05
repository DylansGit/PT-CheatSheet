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
