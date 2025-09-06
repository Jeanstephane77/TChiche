#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache control headers to prevent caching during development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def run_server():
    port = 5000
    host = '0.0.0.0'  # Bind to all interfaces for Replit
    
    # Change to the directory where the HTML files are located
    web_root = Path(__file__).parent
    os.chdir(web_root)
    
    with socketserver.TCPServer((host, port), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://{host}:{port}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    run_server()