#!/usr/bin/env python3
import sys
import time
import http.server
import socketserver
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import webbrowser
import os
import threading

PORT = 8080
WATCH_FILES = ['app.js', 'styles.css', 'links.md']
RELOAD_SCRIPT = b'<script>new EventSource("/es").onmessage = e => location.reload()</script>'

class ReloadHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html')
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def inject_auto_reload(self, content):
        if self.path.endswith('.html'):
            return content.replace(b'</body>', RELOAD_SCRIPT + b'</body>')
        return content

    def do_GET(self):
        if self.path == '/es':
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.end_headers()
            while True:
                time.sleep(5)
                self.wfile.write(b'data: ping\n\n')
            return
            
        super().do_GET()

class ChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if os.path.basename(event.src_path) in WATCH_FILES:
            print(f'\n检测到文件变化: {os.path.basename(event.src_path)}')
            threading.Thread(target=self.reload_clients).start()

    @staticmethod
    def reload_clients():
        print("触发浏览器刷新...")

def check_dependencies():
    try:
        from watchdog.observers import Observer  # noqa
    except ImportError:
        print("请先安装依赖：pip install watchdog")
        sys.exit(1)

def start_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = ReloadHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"服务器运行在 http://localhost:{PORT}")
        webbrowser.open(f'http://localhost:{PORT}')
        
        observer = Observer()
        observer.schedule(ChangeHandler(), path='.', recursive=False)
        observer.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

if __name__ == '__main__':
    check_dependencies()
    print("监控文件:", ', '.join(WATCH_FILES))
    start_server()