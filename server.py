#!/usr/bin/env python3
"""
Simple HTTP Server for VeenaTravel Dashboard
Chạy dashboard trên localhost với live reload
"""

import http.server
import socketserver
import os
import webbrowser
import threading
import time
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Thêm CORS headers để tránh lỗi khi load resources
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Nếu truy cập root, redirect đến dashboard.html
        if self.path == '/':
            self.path = '/dashboard.html'
        return super().do_GET()

def start_server(port=8000):
    """Khởi động server HTTP"""
    try:
        # Chuyển đến thư mục chứa dashboard
        os.chdir(Path(__file__).parent)
        
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            pr[object Object]enaTravel Dashboard đang chạy tại:")
            print(f"   http://localhost:{port}")
            print(f"   http://127.0.0.1:{port}")
            print("\n📁 Files được serve:")
            for file in os.listdir('.'):
                if file.endswith(('.html', '.css', '.js')):
                    print(f"   - {file}")
            
            print(f"\n⏹️  Nhấn Ctrl+C để dừng server")
            
            # Mở browser sau 1 giây
            def open_browser():
                time.sleep(1)
                webbrowser.open(f'http://localhost:{port}')
            
            threading.Thread(target=open_browser, daemon=True).start()
            
            # Bắt đầu serve
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 Server đã dừng!")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} đã được sử dụng. Thử port khác...")
            start_server(port + 1)
        else:
            print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    start_server()
