"""
National Tribal Scholarship Portal - SPA HTTP Server
Serves static assets and provides SPA fallback to index.html for direct URL routing.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SPANoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Resolve requested file path
        path = self.translate_path(self.path)
        # If the file does not exist and does not have an extension, fallback to index.html for SPA
        if not os.path.exists(path) and "." not in os.path.basename(self.path):
            self.path = "/index.html"
        return super().do_GET()

    def end_headers(self):
        # Disable caching for live prototyping development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    # Enable address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SPANoCacheHandler) as httpd:
        print(f"Serving NTSP Portal at http://localhost:{PORT} (SPA Fallback Active)...")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            httpd.server_close()
