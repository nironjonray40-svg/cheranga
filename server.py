import http.server
import socketserver
import json
import sqlite3
import os

PORT = 8000
DB_FILE = 'school.db'

def get_db_connection():
    return sqlite3.connect(DB_FILE, timeout=30.0)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS local_storage_sync (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    conn.commit()
    conn.close()

class SyncServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching for all requests (API and static files) to ease development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/db':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Fetch all key-values
            data = {}
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT key, value FROM local_storage_sync')
                rows = cursor.fetchall()
                for row in rows:
                    data[row[0]] = row[1]
                conn.close()
            except Exception as e:
                print(f"Database error during GET: {e}")
                
            self.wfile.write(json.dumps(data).encode('utf-8'))
        else:
            # Serve static files normally
            super().do_GET()

    def do_POST(self):
        if self.path in ['/api/db/set', '/api/db/delete', '/api/db/clear']:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8')) if post_data else {}
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Invalid JSON')
                return

            conn = None
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                if self.path == '/api/db/set':
                    key = payload.get('key')
                    value = payload.get('value')
                    if key is not None and value is not None:
                        cursor.execute('INSERT OR REPLACE INTO local_storage_sync (key, value) VALUES (?, ?)', (key, value))
                        conn.commit()
                        
                elif self.path == '/api/db/delete':
                    key = payload.get('key')
                    if key is not None:
                        cursor.execute('DELETE FROM local_storage_sync WHERE key = ?', (key,))
                        conn.commit()
                        
                elif self.path == '/api/db/clear':
                    cursor.execute('DELETE FROM local_storage_sync')
                    conn.commit()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"success"}')
                
            except Exception as e:
                print(f"Database error during POST {self.path}: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'{{"error":"{str(e)}"}}'.encode('utf-8'))
            finally:
                if conn:
                    conn.close()
        else:
            self.send_response(404)
            self.end_headers()

def get_local_ip():
    import socket
    try:
        # Create a dummy socket connection to get the local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == '__main__':
    init_db()
    # Allow address reuse to prevent "Address already in use" errors during quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SyncServerHandler) as httpd:
        local_ip = get_local_ip()
        print(f"Sync Server is running!")
        print(f"  - Local URL:   http://localhost:{PORT}")
        if local_ip != "127.0.0.1":
            print(f"  - Network URL: http://{local_ip}:{PORT}")
        print(f"Database File: {DB_FILE} (SQLite)")
        print("Keep this window open to keep the server running.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
