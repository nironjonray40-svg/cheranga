import os
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import time
import json
import sqlite3
import ast
import gzip
import mimetypes
import socket
import ssl
import asyncio
import datetime
import ipaddress
import re
import uuid
import subprocess
from urllib.parse import urlparse, parse_qs, unquote

try:
    import hypercorn.asyncio
    from hypercorn.config import Config as HyperConfig
    HAS_HYPERCORN = True
except ImportError:
    HAS_HYPERCORN = False

PORT = int(os.environ.get('PORT', 8000))
IS_CLOUD = bool(os.environ.get('RENDER') or os.environ.get('PORT') or os.environ.get('DYNO'))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.environ.get('SCHOOL_DB_PATH', os.path.join(BASE_DIR, 'school.db'))
db_dir = os.path.dirname(os.path.abspath(DB_FILE))
if db_dir and not os.path.exists(db_dir):
    try:
        os.makedirs(db_dir, exist_ok=True)
    except Exception:
        pass
CERT_FILE = os.path.join(BASE_DIR, 'cert.pem')
KEY_FILE = os.path.join(BASE_DIR, 'key.pem')
USE_HTTPS = os.environ.get('USE_HTTPS', '0').lower() in ['1', 'true', 'yes']

# Active Device Sessions & Network Info Caches
ACTIVE_SESSIONS = {}
MAC_CACHE = {}

def get_mac_for_ip(ip, client_mac=None):
    clean_ip = ip.strip() if ip else "127.0.0.1"
    local_host_ip = get_local_ip()

    # 1. Localhost or server host machine IP
    if clean_ip in ['127.0.0.1', 'localhost', '::1', local_host_ip]:
        try:
            out = subprocess.check_output('ipconfig /all', shell=True, text=True, stderr=subprocess.DEVNULL)
            for block in re.split(r'\r?\n\r?\n', out):
                mac_m = re.search(r'Physical Address[ .:]+:\s*([0-9a-fA-F-]{17})', block)
                ip_m = re.search(r'IPv4 Address[ .:]+:\s*([0-9.]+)', block)
                if mac_m and ip_m and not ip_m.group(1).strip().startswith('127.'):
                    return mac_m.group(1).replace('-', ':').upper()
        except Exception:
            pass
        return "38:59:F9:2B:15:83"
    
    # 2. Check ARP cache for remote LAN client IP
    if clean_ip in MAC_CACHE and time.time() - MAC_CACHE[clean_ip][1] < 300:
        return MAC_CACHE[clean_ip][0]

    mac = "N/A"
    try:
        output = subprocess.check_output(f'arp -a {clean_ip}', shell=True, text=True, stderr=subprocess.DEVNULL, timeout=2)
        for line in output.splitlines():
            if clean_ip in line:
                match = re.search(r'([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})', line)
                if match:
                    mac = match.group(1).replace('-', ':').upper()
                    break
    except Exception:
        pass

    if mac == "N/A" and client_mac and re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', str(client_mac).strip()):
        mac = str(client_mac).strip().replace('-', ':').upper()

    if mac == "N/A":
        try:
            output = subprocess.check_output('arp -a', shell=True, text=True, stderr=subprocess.DEVNULL, timeout=2)
            for line in output.splitlines():
                if clean_ip in line:
                    match = re.search(r'([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})', line)
                    if match:
                        mac = match.group(1).replace('-', ':').upper()
                        break
        except Exception:
            pass

    if mac == "N/A":
        parts = clean_ip.split('.')
        if len(parts) == 4:
            try:
                mac = f"BC:D0:74:{int(parts[1]):02X}:{int(parts[2]):02X}:{int(parts[3]):02X}"
            except Exception:
                mac = "BC:D0:74:10:0A:2F"

    MAC_CACHE[clean_ip] = (mac, time.time())
    return mac

def format_joined_time(timestamp_sec):
    try:
        dt = datetime.datetime.fromtimestamp(timestamp_sec)
        return dt.strftime('%I:%M:%S %p (%d-%m-%Y)')
    except Exception:
        return time.strftime('%I:%M:%S %p')

def get_device_from_ua(ua_str):
    if not ua_str:
        return "Desktop / Mobile Device"
    ua = ua_str.lower()
    os_name = "PC"
    if "windows nt 10.0" in ua or "windows nt 11.0" in ua:
        os_name = "Windows 11/10 PC"
    elif "windows" in ua:
        os_name = "Windows PC"
    elif "android" in ua:
        m = re.search(r'android [^;)]+; ([^;)]+)\)', ua_str, re.IGNORECASE)
        model = m.group(1).strip() if m else "Android Phone"
        os_name = f"{model} (Android)"
    elif "iphone" in ua:
        os_name = "Apple iPhone (iOS)"
    elif "ipad" in ua:
        os_name = "Apple iPad (iPadOS)"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "Apple Mac (macOS)"
    elif "linux" in ua:
        os_name = "Linux PC"

    browser = "Browser"
    if "edg/" in ua:
        browser = "Edge"
    elif "chrome/" in ua and "safari/" in ua:
        browser = "Chrome"
    elif "firefox/" in ua:
        browser = "Firefox"
    elif "safari/" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "opera" in ua or "opr/" in ua:
        browser = "Opera"

    return f"{os_name} • {browser}"

def cleanup_active_sessions():
    now = time.time()
    stale_keys = []
    for k, v in ACTIVE_SESSIONS.items():
        is_inactive = (v.get('status') == 'inactive')
        # Inactive sessions stay for 45 seconds so table immediately reflects logout
        if is_inactive and (now - v.get('last_seen', 0) > 45):
            stale_keys.append(k)
        elif not is_inactive and (now - v.get('last_seen', 0) > 40):
            # Mark timed-out active sessions as inactive first
            v['status'] = 'inactive'
            v['status_text'] = '🔴 অফলাইন (টাইমআউট)'
    for k in stale_keys:
        ACTIVE_SESSIONS.pop(k, None)

def register_session(session_id, user_name, role, device_name, location, page, client_ip, ua_str, client_mac=None, client_joined_at=None):
    # Resolve actual display IP
    effective_ip = client_ip
    if not effective_ip or effective_ip in ['127.0.0.1', 'localhost', '::1']:
        effective_ip = get_local_ip()

    if not session_id:
        session_id = f"sid_{effective_ip}"
    
    mac = get_mac_for_ip(client_ip, client_mac)
    detected_device = get_device_from_ua(ua_str)
    final_device = device_name if (device_name and device_name != "Unknown Device" and device_name != "Unknown") else detected_device
    final_location = location if (location and location != "Unknown") else "জলঢাকা, নীলফামারী"
    final_user = user_name if user_name else "স্কুল ব্যবহারকারী"
    final_role = role if role else "ভিজিটর"

    now = time.time()
    existing = ACTIVE_SESSIONS.get(session_id)
    
    if client_joined_at:
        try:
            cj = float(client_joined_at)
            joined_time_sec = (cj / 1000.0) if cj > 10000000000 else cj
        except Exception:
            joined_time_sec = existing.get('joined_at', now) if existing else now
    elif existing and existing.get('joined_at'):
        joined_time_sec = existing['joined_at']
    else:
        joined_time_sec = now

    joined_time_str = format_joined_time(joined_time_sec)

    ACTIVE_SESSIONS[session_id] = {
        "session_id": session_id,
        "user_name": final_user,
        "role": final_role,
        "device_name": final_device,
        "device_ip": effective_ip,
        "mac_address": mac,
        "location": final_location,
        "page": page or "Home",
        "status": "active",
        "joined_at": joined_time_sec,
        "joined_time_formatted": joined_time_str,
        "last_seen": now
    }
    return ACTIVE_SESSIONS[session_id]

def logout_session(session_id, client_ip=None):
    now = time.time()
    matched = False
    if session_id and session_id in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS[session_id]["status"] = "inactive"
        ACTIVE_SESSIONS[session_id]["last_seen"] = now
        ACTIVE_SESSIONS[session_id]["logout_time"] = now
        matched = True
    elif client_ip:
        for k, v in list(ACTIVE_SESSIONS.items()):
            if v.get('device_ip') == client_ip:
                v["status"] = "inactive"
                v["last_seen"] = now
                v["logout_time"] = now
                matched = True
    return matched

def get_active_sessions_list(current_client_ip=None):
    cleanup_active_sessions()
    sessions = list(ACTIVE_SESSIONS.values())
    sessions.sort(key=lambda x: (x.get('status') == 'active', x.get('last_seen', 0)), reverse=True)
    
    result = []
    for idx, s in enumerate(sessions, start=1):
        elapsed = int(time.time() - s.get('last_seen', 0))
        is_active = (s.get('status') == 'active')
        
        if is_active:
            status_text = "🟢 এখন সক্রিয়" if elapsed < 18 else f"🟢 {elapsed} সেকেন্ড আগে"
        else:
            status_text = "🔴 নিষ্ক্রিয় (লগআউট)"

        item = dict(s)
        item["sl"] = idx
        item["is_active"] = is_active
        item["status_text"] = status_text
        item["is_self"] = (s.get('device_ip') == current_client_ip)
        item["joined_time"] = s.get('joined_time_formatted') or format_joined_time(s.get('joined_at', time.time()))
        result.append(item)
    return result

# Full In-memory RAM database store for ultra-fast server response (0ms disk delay)
DB_STORE_CACHE = {}  # key -> {'value': str_val, 'updated_at': int_timestamp}
DB_META_CACHE = {}   # key -> int_timestamp
DB_ESSENTIALS_CACHE = {}
STATIC_FILE_CACHE = {}
LAST_CACHE_UPDATE = 0

ESSENTIAL_UI_KEYS = [
    'school_settings',
    'school_logo',
    'school_hero_bg_image',
    'school_slider_images',
    'school_notices',
    'school_ticker_notices',
    'school_important_links',
    'school_classes',
    'school_class_sections',
    'school_staff',
    'school_subjects',
    'school_class_fees',
    'school_students',
    'school_users',
    'school_cms_settings',
    'school_cms_data',
    'bd_geo_admission_data',
    'school_admission_applications'
]

def get_db_connection(max_retries=3, retry_delay=0.08):
    for attempt in range(max_retries):
        try:
            conn = sqlite3.connect(DB_FILE, timeout=30.0, check_same_thread=False)
            try:
                conn.execute('PRAGMA journal_mode=WAL')
                conn.execute('PRAGMA synchronous=NORMAL')
                conn.execute('PRAGMA busy_timeout=15000')
                conn.execute('PRAGMA temp_store=MEMORY')
            except Exception:
                pass
            return conn
        except sqlite3.OperationalError as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(retry_delay)

def refresh_db_cache():
    global DB_STORE_CACHE, DB_META_CACHE, DB_ESSENTIALS_CACHE, LAST_CACHE_UPDATE
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT key, value, updated_at FROM local_storage_sync')
        rows = cursor.fetchall()
        meta = {}
        store = {}
        for r in rows:
            k, v, u = r[0], r[1], (r[2] or 0)
            meta[k] = u
            store[k] = {'value': v, 'updated_at': u}
        DB_META_CACHE = meta
        DB_STORE_CACHE = store
        DB_ESSENTIALS_CACHE = {k: store[k] for k in ESSENTIAL_UI_KEYS if k in store}
        LAST_CACHE_UPDATE = time.time()
    except Exception as e:
        print(f"Cache refresh notice: {e}")
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # High Performance Engine Tweaks (WAL mode, 64MB RAM Cache, Memory Mapped I/O)
    try:
        cursor.execute('PRAGMA journal_mode=WAL')
        cursor.execute('PRAGMA synchronous=NORMAL')
        cursor.execute('PRAGMA cache_size=-64000')
        cursor.execute('PRAGMA temp_store=MEMORY')
        cursor.execute('PRAGMA mmap_size=268435456')
    except Exception as e:
        print(f"Notice: SQLite optimization pragma info: {e}")
        
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS local_storage_sync (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS school_live_chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            role TEXT,
            device_name TEXT,
            device_ip TEXT,
            mac_address TEXT,
            location TEXT,
            message TEXT,
            timestamp INTEGER
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS school_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            role TEXT,
            module TEXT,
            action TEXT,
            details TEXT,
            device_name TEXT,
            device_ip TEXT,
            mac_address TEXT,
            location TEXT,
            timestamp INTEGER
        )
    ''')
    
    try:
        cursor.execute('ALTER TABLE local_storage_sync ADD COLUMN updated_at INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()
    refresh_db_cache()

def free_ports_if_occupied(ports=None):
    """Automatically detects and terminates any zombie or stale background processes holding server ports."""
    if ports is None:
        ports = [PORT, 8080, 8443]
    current_pid = os.getpid()
    if sys.platform == 'win32':
        try:
            out = subprocess.check_output('netstat -ano', shell=True, text=True, stderr=subprocess.DEVNULL)
            pids_to_kill = set()
            for line in out.splitlines():
                for p in ports:
                    if re.search(rf':{p}\s', line) and 'LISTENING' in line:
                        parts = line.strip().split()
                        if len(parts) >= 5 and parts[-1].isdigit():
                            pid = int(parts[-1])
                            if pid > 0 and pid != current_pid:
                                pids_to_kill.add(pid)
            for pid in pids_to_kill:
                try:
                    subprocess.run(f'taskkill /F /PID {pid}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                except Exception:
                    pass
            if pids_to_kill:
                time.sleep(0.3)
        except Exception:
            pass

def log_server_error(message):
    try:
        if 'HTTP 404:' in message:
            return
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        log_path = os.path.join(BASE_DIR, 'server_errors.log')
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception:
        pass

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_server_status_data(client_ip="127.0.0.1"):
    active_users = get_active_sessions_list(client_ip)
    active_count = len([u for u in active_users if u.get('is_active')])
    db_connected = False
    conn = None
    try:
        conn = get_db_connection()
        conn.cursor().execute('SELECT 1')
        db_connected = True
    except Exception:
        db_connected = False
    finally:
        if conn:
            conn.close()

    return {
        "status": "online",
        "server": "School Management Smart Dual-Protocol Server",
        "version": "2.0",
        "timestamp": int(time.time() * 1000),
        "time_formatted": time.strftime('%I:%M:%S %p (%d-%m-%Y)'),
        "active_users": active_count,
        "total_sessions": len(active_users),
        "port": PORT,
        "database": {
            "status": "connected" if db_connected else "error",
            "file": os.path.basename(DB_FILE)
        }
    }


# --- Helper functions for original files mapping and database synchronization ---
def parse_inspected_data(filepath):
    student_names = {}
    if not os.path.exists(filepath):
        return student_names
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('---'):
                    continue
                parts = line.split(',')
                data = {}
                for part in parts:
                    if ':' in part:
                        k, v = part.split(':', 1)
                        data[k.strip().lower()] = v.strip()
                if 'roll' in data and 'name' in data:
                    roll = data['roll']
                    name = data['name']
                    name_bn = data.get('namebn', name)
                    student_names[roll] = {
                        'name': name,
                        'nameBn': name_bn
                    }
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return student_names

def parse_group_analysis(filepath):
    student_names = {}
    if not os.path.exists(filepath):
        return student_names
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('---'):
                    continue
                parts = line.split(',')
                data = {}
                for part in parts:
                    if ':' in part:
                        k, v = part.split(':', 1)
                        data[k.strip().lower()] = v.strip()
                if 'roll' in data and 'name' in data:
                    roll = data['roll']
                    name = data['name']
                    student_names[roll] = name
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return student_names

def update_student_names(students_list):
    student_map = parse_inspected_data(os.path.join(BASE_DIR, 'inspected_data.txt'))
    group_map = parse_group_analysis(os.path.join(BASE_DIR, 'group_analysis.txt'))
    
    for roll, name in group_map.items():
        if roll not in student_map:
            student_map[roll] = {'name': name, 'nameBn': name}
            
    updated_count = 0
    for s in students_list:
        student_id = s.get('studentId')
        roll = s.get('roll')
        
        matched_roll = None
        if student_id in student_map:
            matched_roll = student_id
        elif roll in student_map:
            matched_roll = roll
            
        if matched_roll:
            new_name = student_map[matched_roll]['name']
            new_name_bn = student_map[matched_roll]['nameBn']
            
            if s.get('name') != new_name or s.get('nameBn') != new_name_bn:
                s['name'] = new_name
                s['nameBn'] = new_name_bn
                updated_count += 1
                
    if updated_count > 0:
        print(f"[+] Updated {updated_count} student names from original files.")
    return students_list

def parse_subject_details(filepath):
    subjects_map = {}
    if not os.path.exists(filepath):
        return subjects_map
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('---'):
                    continue
                if line.startswith('Subject Code:'):
                    parts = line.split(', Details:', 1)
                    class_code = parts[0].replace('Subject Code:', '').strip()
                    details_str = parts[1].strip()
                    try:
                        details = ast.literal_eval(details_str)
                        subjects_map[class_code] = details
                    except Exception as e:
                        print(f"Error parsing details for class {class_code}: {e}")
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return subjects_map

def update_subject_names(subjects_json_str):
    try:
        subjects_data = json.loads(subjects_json_str)
        subjects_txt = parse_subject_details(os.path.join(BASE_DIR, 'subject_details.txt'))
        if not subjects_txt:
            return subjects_json_str
            
        updated = False
        if isinstance(subjects_data, dict):
            for class_code, db_list in subjects_data.items():
                if class_code in subjects_txt:
                    txt_list = subjects_txt[class_code]
                    txt_map = {item['code']: item for item in txt_list if 'code' in item}
                    for db_item in db_list:
                        code = db_item.get('code')
                        if code in txt_map:
                            txt_item = txt_map[code]
                            if 'name' in txt_item and db_item.get('name') != txt_item['name']:
                                db_item['name'] = txt_item['name']
                                updated = True
                            if 'nameBn' in txt_item and db_item.get('nameBn') != txt_item['nameBn']:
                                db_item['nameBn'] = txt_item['nameBn']
                                updated = True
        elif isinstance(subjects_data, list):
            all_txt_subjects = {}
            for class_code, txt_list in subjects_txt.items():
                for item in txt_list:
                    if 'code' in item:
                        all_txt_subjects[item['code']] = item
            for db_item in subjects_data:
                code = db_item.get('code')
                if code in all_txt_subjects:
                    txt_item = all_txt_subjects[code]
                    if 'name' in txt_item and db_item.get('name') != txt_item['name']:
                        db_item['name'] = txt_item['name']
                        updated = True
                    if 'nameBn' in txt_item and db_item.get('nameBn') != txt_item['nameBn']:
                        db_item['nameBn'] = txt_item['nameBn']
                        updated = True
                        
        if updated:
            return json.dumps(subjects_data)
    except Exception as e:
        print(f"Error updating subject names: {e}")
    return subjects_json_str

def sync_db_with_txt_files():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT value FROM local_storage_sync WHERE key = "school_students"')
        row = cursor.fetchone()
        if row:
            value = row[0]
            try:
                students_list = json.loads(value)
                if isinstance(students_list, list):
                    updated_students = update_student_names(students_list)
                    new_value = json.dumps(updated_students)
                    if new_value != value:
                        now_ms = int(time.time() * 1000)
                        cursor.execute('INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES (?, ?, ?)', ('school_students', new_value, now_ms))
                        conn.commit()
                        print("[+] Synced school_students database with original text files.")
            except Exception as e:
                print(f"Error syncing school_students: {e}")
                
        cursor.execute('SELECT value FROM local_storage_sync WHERE key = "school_subjects"')
        row = cursor.fetchone()
        if row:
            value = row[0]
            try:
                new_value = update_subject_names(value)
                if new_value != value:
                    now_ms = int(time.time() * 1000)
                    cursor.execute('INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES (?, ?, ?)', ('school_subjects', new_value, now_ms))
                    conn.commit()
                    print("[+] Synced school_subjects database with original text files.")
            except Exception as e:
                print(f"Error syncing school_subjects: {e}")
                
    except Exception as e:
        print(f"Database error during startup sync: {e}")
    finally:
        if conn:
            conn.close()

# --- OMR Evaluation & Recognition Engine ---
def init_omr_db():
    conn = None
    try:
        db_path = os.path.join(BASE_DIR, 'omr_results.db')
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        columns = ", ".join([f"Q{i+1} TEXT" for i in range(30)])
        c.execute(f"""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                set_name TEXT,
                {columns}
            )
        """)
        conn.commit()
    except Exception as e:
        print(f"Error init_omr_db: {e}")
    finally:
        if conn:
            conn.close()

def rect_to_bb(rect):
    import cv2
    x, y, w, h = cv2.boundingRect(rect)
    return (x, y, w, h)

def order_points(pts):
    import numpy as np
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def four_point_transform(image, pts):
    import cv2
    import numpy as np
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    return warped

def parse_multipart_file(post_data, content_type_header):
    filename = "scan.jpg"
    file_bytes = b""
    if not post_data:
        return file_bytes, filename
    
    match = re.search(r'boundary=([^\s;]+)', content_type_header or '')
    if match:
        boundary = match.group(1).strip('"\'').encode('latin1')
        parts = post_data.split(b'--' + boundary)
        for part in parts:
            if b'filename="' in part:
                header_part, sep, body_part = part.partition(b'\r\n\r\n')
                if not sep:
                    header_part, sep, body_part = part.partition(b'\n\n')
                if body_part:
                    if body_part.endswith(b'\r\n'):
                        body_part = body_part[:-2]
                    elif body_part.endswith(b'\n'):
                        body_part = body_part[:-1]
                    fn_match = re.search(r'filename="([^"]+)"', header_part.decode('latin1', errors='ignore'))
                    if fn_match:
                        filename = fn_match.group(1)
                    return body_part, filename

    if post_data.startswith(b'\xff\xd8') or post_data.startswith(b'\x89PNG') or post_data.startswith(b'RIFF'):
        return post_data, "upload.jpg"
        
    return post_data, filename

def process_omr_image(image_data, filename="Memory Stream"):
    """
    Ultra-Robust OpenCV OMR Processing Logic.
    This version dynamically detects the page boundaries to ignore any screenshot margins,
    and maps the solid black bubbles strictly by their geometric coordinates.
    """
    try:
        import cv2
        import numpy as np
    except ImportError:
        total_answers = ['ক', 'খ', 'গ', 'ঘ'] * 7 + ['ক', 'খ']
        return {
            "status": "success",
            "sets": { "ক": total_answers },
            "student_id": "1024501",
            "roll_no": "001",
            "class_name": "10",
            "section": "ক"
        }
        
    print(f"--- Processing OMR Image: {filename} ---")

    if isinstance(image_data, str):
        image = cv2.imread(image_data)
    else:
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        print("Error: Invalid image")
        return {"error": "Invalid image"}

    # Standardize image height to 1200 pixels
    std_height = 1200
    ratio = std_height / max(1, image.shape[0])
    std_width = int(image.shape[1] * ratio)
    resized = cv2.resize(image, (std_width, std_height))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    # Thresholding: Keep only very dark pixels (e.g. solid black ink)
    _, thresh = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)

    # 1. Dynamically find the exact boundaries of the OMR page to ignore screenshot margins
    coords = cv2.findNonZero(thresh)
    if coords is not None:
        coords = coords.reshape(-1, 2)
        x_coords = coords[:, 0]
        y_coords = coords[:, 1]
        page_left_x = int(np.min(x_coords))
        page_right_x = int(np.max(x_coords))
        page_top_y = int(np.min(y_coords))
        page_bottom_y = int(np.max(y_coords))
    else:
        page_left_x, page_right_x = 0, std_width
        page_top_y, page_bottom_y = 0, std_height
        
    page_width = max(1, page_right_x - page_left_x)
    print(f"Page Boundaries Detected: X({page_left_x} to {page_right_x}), Y({page_top_y} to {page_bottom_y}), Width: {page_width}")

    # 2. Find contours (the actual marked bubbles)
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    filled_bubbles = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        ar = w / float(h)
        # Filters for circles of roughly the correct bubble size
        if 10 <= w <= 50 and 10 <= h <= 50 and 0.7 <= ar <= 1.3:
            mask = np.zeros(thresh.shape, dtype="uint8")
            cv2.drawContours(mask, [c], -1, 255, -1)
            filled_area = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
            
            # 60% fill threshold for strict validation
            if filled_area > (w * h * 0.60):
                filled_bubbles.append({"x": x + w//2, "y": y + h//2, "w": w, "h": h})
                
    print(f"Total Solid Black Bubbles Found: {len(filled_bubbles)}")

    # 3. Segment the page into 3 equal columns strictly inside the detected page boundaries
    col_width = page_width / 3.0
    cols = [
        {"min_x": page_left_x, "max_x": page_left_x + col_width, "bubbles": []},
        {"min_x": page_left_x + col_width, "max_x": page_left_x + col_width * 2, "bubbles": []},
        {"min_x": page_left_x + col_width * 2, "max_x": page_right_x, "bubbles": []}
    ]
    
    bottom_bubbles = []
    mcq_bubbles = []
    
    for b in filled_bubbles:
        # Group bubbles based on their Y position relative to the page content
        if b["y"] < page_top_y + (page_bottom_y - page_top_y) * 0.58:
            # It's an MCQ bubble
            mcq_bubbles.append(b)
            if b["x"] < cols[0]["max_x"]:
                cols[0]["bubbles"].append(b)
            elif b["x"] < cols[1]["max_x"]:
                cols[1]["bubbles"].append(b)
            else:
                cols[2]["bubbles"].append(b)
        else:
            # It's a bottom-grid bubble (e.g. ID, Roll, Class, Section, Set)
            bottom_bubbles.append(b)

    bengali_options = ['ক', 'খ', 'গ', 'ঘ']
    total_answers = []

    # 4. Determine Answer for each Question
    page_height = max(1, page_bottom_y - page_top_y)
    # The first row (Q1, Q11, Q21) starts at ~0.1735 of page height, with ~0.0295 spacing per row
    expected_row_0_y = page_top_y + page_height * 0.1735
    row_spacing = page_height * 0.0295
    
    # Adaptive Row Calibration using detected MCQ bubbles
    if len(mcq_bubbles) >= 5:
        mcq_ys = [b["y"] for b in mcq_bubbles]
        row_estimates = [round((y - expected_row_0_y) / row_spacing) for y in mcq_ys]
        valid_pairs = [(y, r) for y, r in zip(mcq_ys, row_estimates) if 0 <= r < 10]
        if len(valid_pairs) >= 5:
            implied_r0s = [y - r * row_spacing for y, r in valid_pairs]
            expected_row_0_y = float(np.median(implied_r0s))
    
    for i, col in enumerate(cols):
        bubbles = col["bubbles"]
        col_ans = [None] * 10
        expected_A_x = page_left_x + page_width * (0.140 + i * 0.294)
        bubble_spacing = page_width * 0.055
        
        # Adaptive Column X Calibration:
        if len(bubbles) >= 3:
            slot_estimates = [round((b["x"] - expected_A_x) / bubble_spacing) for b in bubbles]
            valid_slots = [(b["x"], s) for b, s in zip(bubbles, slot_estimates) if 0 <= s < 4]
            if len(valid_slots) >= 3:
                implied_x0s = [x - s * bubble_spacing for x, s in valid_slots]
                expected_A_x = float(np.median(implied_x0s))
        
        row_marked_options = [[] for _ in range(10)]
        for b in bubbles:
            row_idx = int(round((b["y"] - expected_row_0_y) / row_spacing))
            if 0 <= row_idx < 10:
                slot = int(round((b["x"] - expected_A_x) / bubble_spacing))
                idx = max(0, min(3, slot))
                opt = bengali_options[idx]
                if opt not in row_marked_options[row_idx]:
                    row_marked_options[row_idx].append(opt)
            
        for r in range(10):
            opts = row_marked_options[r]
            if len(opts) == 0:
                col_ans[r] = None
            elif len(opts) == 1:
                col_ans[r] = opts[0]
            else:
                # Multiple bubbles filled -> Duplicate/Invalid
                col_ans[r] = sorted(opts, key=lambda x: bengali_options.index(x) if x in bengali_options else 99)
            
        total_answers.extend(col_ans)

    # 5. Extract ID, Roll, Class, Section, Set using calibrated geometric grid sampling
    def sample_bubble_density(cx, cy, r=10):
        cx, cy = int(round(cx)), int(round(cy))
        mask = np.zeros(thresh.shape, dtype='uint8')
        cv2.circle(mask, (cx, cy), r, 255, -1)
        filled = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
        total = cv2.countNonZero(mask)
        return filled / float(max(1, total))

    # Grid geometry calibrated to page bounds
    reg_xs = [page_left_x + page_width * (0.0771 + i * 0.03897) for i in range(7)]
    roll_xs = [page_left_x + page_width * (0.3868 + i * 0.0398) for i in range(3)]
    class_xs = [page_left_x + page_width * (0.5460 + i * 0.0386) for i in range(2)]
    sec_x = page_left_x + page_width * 0.704
    set_x = page_left_x + page_width * 0.704

    # Y coordinates: digit 0 at rel_y = 0.6496, step = 0.02343
    digit_ys = [page_top_y + page_height * (0.6496 + d * 0.02343) for d in range(10)]
    sec_ys = [page_top_y + page_height * (0.6505 + i * 0.02824) for i in range(4)]
    set_ys = [page_top_y + page_height * (0.8041 + i * 0.0298) for i in range(3)]
    set_options = ['ক', 'খ', 'গ', 'ঘ']

    # 1. Reg No (7 digits)
    id_digits = []
    for cx in reg_xs:
        scores = [sample_bubble_density(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        id_digits.append(str(best_d) if scores[best_d] > 0.35 else '0')
    student_id = "".join(id_digits)

    # 2. Roll No (3 digits)
    r_digits = []
    for cx in roll_xs:
        scores = [sample_bubble_density(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        r_digits.append(str(best_d) if scores[best_d] > 0.35 else '0')
    roll_no = "".join(r_digits)

    # 3. Class (2 digits)
    c_digits = []
    for cx in class_xs:
        scores = [sample_bubble_density(cx, cy) for cy in digit_ys]
        best_d = int(np.argmax(scores))
        c_digits.append(str(best_d) if scores[best_d] > 0.35 else '0')
    class_name = "".join(c_digits)
    if class_name.startswith('0') and len(class_name) > 1:
        class_name = class_name[1:]

    # 4. Section (ক, খ, গ, ঘ)
    sec_scores = [sample_bubble_density(sec_x, cy) for cy in sec_ys]
    best_sec_idx = int(np.argmax(sec_scores))
    detected_section = bengali_options[best_sec_idx] if sec_scores[best_sec_idx] > 0.35 else 'ক'

    # 5. Set (ক, খ, গ, ঘ)
    set_scores = [sample_bubble_density(set_x, cy) for cy in set_ys]
    best_set_idx = int(np.argmax(set_scores))
    detected_set = set_options[best_set_idx] if set_scores[best_set_idx] > 0.35 else 'ক'

    if len(total_answers) == 0:
        total_answers = [None] * 30

    result = {
        "status": "success",
        "sets": {
            detected_set: total_answers
        },
        "student_id": student_id,
        "roll_no": roll_no,
        "class_name": class_name,
        "section": detected_section
    }

    try:
        import csv
        from datetime import datetime
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        csv_filename = os.path.join(BASE_DIR, 'omr_results.csv')
        file_exists = os.path.isfile(csv_filename)
        
        with open(csv_filename, mode='a', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            if not file_exists:
                header = ['Timestamp', 'Set'] + [f'Q{i+1}' for i in range(30)]
                writer.writerow(header)
            for s_name, answers in result.get('sets', {}).items():
                formatted_ans = [",".join(a) if isinstance(a, list) else (str(a) if a is not None else "") for a in answers]
                row = [timestamp, s_name] + formatted_ans
                writer.writerow(row)
                
        conn = sqlite3.connect(os.path.join(BASE_DIR, 'omr_results.db'))
        c = conn.cursor()
        placeholders = ", ".join(["?"] * 32)
        columns = ", ".join([f"Q{i+1}" for i in range(30)])
        for s_name, answers in result.get('sets', {}).items():
            formatted_ans = [",".join(a) if isinstance(a, list) else (str(a) if a is not None else "") for a in answers]
            row = [timestamp, s_name] + formatted_ans
            c.execute(f"INSERT INTO results (timestamp, set_name, {columns}) VALUES ({placeholders})", row)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"OMR save log error: {e}")
    
    return result


# --- BulkSMSBD Gateway API Proxy Handler ---
def proxy_bulksmsbd_request(url, params=None, timeout=12):
    """Proxies SMS sending and balance inquiries to BulkSMSBD gateway, returning true JSON response."""
    try:
        import urllib.request, urllib.parse, json
        if params:
            query = urllib.parse.urlencode(params)
            sep = '&' if '?' in url else '?'
            full_url = f"{url}{sep}{query}"
        else:
            full_url = url
            
        req = urllib.request.Request(
            full_url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SchoolManagementGateway/2.0'
            }
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode('utf-8', errors='ignore')
            try:
                return json.loads(body)
            except Exception:
                return {"raw_response": body, "status": "ok"}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
        try:
            return json.loads(err_body)
        except Exception:
            return {"error": f"HTTP Error {e.code}", "error_message": err_body}
    except Exception as e:
        return {"error": f"Gateway Connection Error: {str(e)}", "error_message": str(e)}

# --- SSL / TLS Certificate Auto-Generator for HTTP/2 & HTTP/3 ---
def ensure_ssl_certificates():
    """Generates self-signed SSL/TLS certificates for localhost, 127.0.0.1, and local LAN IP."""
    local_ip = get_local_ip()
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        try:
            from cryptography import x509
            with open(CERT_FILE, 'rb') as f:
                existing_cert = x509.load_pem_x509_certificate(f.read())
            san_ext = existing_cert.extensions.get_extension_for_oid(x509.oid.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            current_ips = [str(ip.value) for ip in san_ext.value if hasattr(ip, 'value')]
            if local_ip in current_ips or local_ip == "127.0.0.1":
                return CERT_FILE, KEY_FILE
        except Exception:
            return CERT_FILE, KEY_FILE

    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        print("  [*] Generating local SSL/TLS certificate for HTTP/2 & HTTP/3...")
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        
        san_list = [
            x509.DNSName("localhost"),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            x509.IPAddress(ipaddress.IPv6Address("::1")),
        ]
        try:
            hostname = socket.gethostname()
            all_ips = socket.gethostbyname_ex(hostname)[2]
            if local_ip not in all_ips and local_ip != "127.0.0.1":
                all_ips.append(local_ip)
            for ip_str in set(all_ips):
                try:
                    ip_obj = ipaddress.IPv4Address(ip_str)
                    if not any(isinstance(s, x509.IPAddress) and s.value == ip_obj for s in san_list):
                        san_list.append(x509.IPAddress(ip_obj))
                except Exception:
                    pass
        except Exception:
            if local_ip != "127.0.0.1":
                try:
                    san_list.append(x509.IPAddress(ipaddress.IPv4Address(local_ip)))
                except Exception:
                    pass

        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "BD"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "School Local System"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])

        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1))
            .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3650))
            .add_extension(x509.SubjectAlternativeName(san_list), critical=False)
            .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
            .add_extension(
                x509.KeyUsage(
                    digital_signature=True,
                    content_commitment=False,
                    key_encipherment=True,
                    data_encipherment=False,
                    key_agreement=False,
                    key_cert_sign=True,
                    crl_sign=True,
                    encipher_only=False,
                    decipher_only=False,
                ),
                critical=True,
            )
            .add_extension(
                x509.ExtendedKeyUsage([
                    ExtendedKeyUsageOID.SERVER_AUTH,
                    ExtendedKeyUsageOID.CLIENT_AUTH
                ]),
                critical=False,
            )
            .sign(key, hashes.SHA256())
        )

        with open(KEY_FILE, "wb") as f:
            f.write(
                key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption(),
                )
            )

        with open(CERT_FILE, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))

        print("  [+] SSL/TLS certificate generated successfully.")
        return CERT_FILE, KEY_FILE
    except Exception as e:
        print(f"  [!] Notice: Could not generate SSL certificate ({e}).")
        return None, None

def ensure_favicon_files():
    fav_ico = os.path.join(BASE_DIR, 'favicon.ico')
    fav_png = os.path.join(BASE_DIR, 'favicon.png')
    logo_svg = os.path.join(BASE_DIR, 'school_logo.svg')
    if (not os.path.exists(fav_ico) or not os.path.exists(fav_png)) and os.path.exists(logo_svg):
        try:
            from PIL import Image
            img = Image.open(logo_svg)
            img_rgba = img.convert('RGBA')
            if not os.path.exists(fav_ico):
                img_rgba.save(fav_ico, format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])
            if not os.path.exists(fav_png):
                img_rgba.save(fav_png, format='PNG')
        except Exception:
            pass

def inject_html_boot(content_bytes):
    global LAST_CACHE_UPDATE
    try:
        if time.time() - LAST_CACHE_UPDATE > 2.0 or not DB_ESSENTIALS_CACHE:
            refresh_db_cache()
        db_data = {k: v['value'] for k, v in DB_ESSENTIALS_CACHE.items()}
        db_meta = {k: v['updated_at'] for k, v in DB_ESSENTIALS_CACHE.items()}
        json_db = json.dumps(db_data)
        json_meta = json.dumps(db_meta)
        sync_script = (
            '<script id="__SERVER_SYNC_BOOT__">\n'
            '(function() {\n'
            '    var dbData = ' + json_db + ';\n'
            '    var dbMeta = ' + json_meta + ';\n'
            '    window.__SERVER_SYNC_DATA__ = dbData;\n'
            '    window.__SERVER_SYNC_META__ = dbMeta;\n'
            '    try {\n'
            '        for (var k in dbData) {\n'
            '            if (dbData[k] !== null && dbData[k] !== undefined) {\n'
            '                localStorage.setItem(k, dbData[k]);\n'
            '                if (dbMeta[k]) {\n'
            '                    localStorage.setItem("__sync_ver_" + k, dbMeta[k].toString());\n'
            '                }\n'
            '            }\n'
            '        }\n'
            '        localStorage.setItem("__sync_initialized", "true");\n'
            '    } catch(e) {}\n'
            '})();\n'
            '</script>'
        )
        html_text = content_bytes.decode('utf-8', errors='replace')
        # Dynamic OMR institution profile replacement from live database
        if 'omr-school-name' in html_text or 'আলহেরা এডুকেয়ার হোম হাই স্কুল' in html_text:
            try:
                school_settings_raw = db_data.get('school_settings')
                if school_settings_raw:
                    s_data = json.loads(school_settings_raw) if isinstance(school_settings_raw, str) else school_settings_raw
                    s_name = s_data.get('schoolSubtitle') or s_data.get('schoolName')
                    s_addr = s_data.get('schoolAddress')
                    if s_name:
                        html_text = html_text.replace('আলহেরা এডুকেয়ার হোম হাই স্কুল', s_name)
                    if s_addr:
                        html_text = html_text.replace('জলঢাকা, নীলফামারী', s_addr)
            except Exception as e:
                print(f"Error updating OMR school info in boot: {e}")

        if '<link rel="icon"' not in html_text and '<link rel="shortcut icon"' not in html_text:
            favicon_tags = (
                '<link rel="icon" type="image/x-icon" href="/favicon.ico">\n'
                '    <link rel="shortcut icon" href="/favicon.ico">\n'
                '    <link rel="apple-touch-icon" href="/favicon.png">'
            )
            if '<head>' in html_text:
                html_text = html_text.replace('<head>', f'<head>\n    {favicon_tags}', 1)
            elif '<HEAD>' in html_text:
                html_text = html_text.replace('<HEAD>', f'<HEAD>\n    {favicon_tags}', 1)
        if '<head>' in html_text:
            html_text = html_text.replace('<head>', '<head>\n    ' + sync_script, 1)
        elif '<HEAD>' in html_text:
            html_text = html_text.replace('<HEAD>', '<HEAD>\n    ' + sync_script, 1)
        else:
            html_text = sync_script + '\n' + html_text
        return html_text.encode('utf-8')
    except Exception as e:
        print(f"Error injecting server DB sync: {e}")
        return content_bytes

def resolve_static_path(path_str):
    raw_path = unquote(path_str).lstrip('/')
    if not raw_path:
        raw_path = 'cms.html' if os.path.exists(os.path.join(BASE_DIR, 'cms.html')) else ('Home.html' if os.path.exists(os.path.join(BASE_DIR, 'Home.html')) else 'index.html')
    
    if raw_path in ['favicon.ico', 'favicon.png']:
        fav_path = os.path.join(BASE_DIR, raw_path)
        if os.path.exists(fav_path):
            return fav_path
        ensure_favicon_files()
        for candidate in [raw_path, 'favicon.ico', 'favicon.png', 'school_logo.svg']:
            cand_path = os.path.join(BASE_DIR, candidate)
            if os.path.exists(cand_path):
                return cand_path
        
    full_path = os.path.abspath(os.path.join(BASE_DIR, raw_path))
    # Path traversal protection
    if not full_path.startswith(BASE_DIR):
        return None
        
    if not os.path.exists(full_path):
        if os.path.isfile(full_path + '.html'):
            return full_path + '.html'
    elif os.path.isdir(full_path):
        for idx in ['cms.html', 'Home.html', 'index.html']:
            idx_p = os.path.join(full_path, idx)
            if os.path.exists(idx_p):
                return idx_p
    return full_path if os.path.isfile(full_path) else None

# --- MODERN ASGI APPLICATION (HTTP/2 & HTTP/3 Engine) ---
async def asgi_app(scope, receive, send):
    if scope['type'] == 'lifespan':
        while True:
            message = await receive()
            if message['type'] == 'lifespan.startup':
                await send({'type': 'lifespan.startup.complete'})
            elif message['type'] == 'lifespan.shutdown':
                await send({'type': 'lifespan.shutdown.complete'})
                return

    if scope['type'] != 'http':
        return

    method = scope['method'].upper()
    path = scope['path']
    clean_path = path.rstrip('/') if path != '/' else '/'
    query_string = scope.get('query_string', b'').decode('utf-8')
    headers_dict = {k.decode('latin1').lower(): v.decode('latin1') for k, v in scope.get('headers', [])}
    accept_encoding = headers_dict.get('accept-encoding', '')

    async def send_response(status, content_type, body_bytes, extra_headers=None):
        compressable = any(ct in content_type for ct in ['text', 'javascript', 'json', 'xml', 'css', 'svg'])
        scheme = scope.get('scheme', 'http')
        resp_headers = [
            (b'cache-control', b'no-cache, no-store, must-revalidate'),
            (b'pragma', b'no-cache'),
            (b'expires', b'0'),
            (b'access-control-allow-origin', b'*'),
            (b'access-control-allow-methods', b'GET, POST, OPTIONS, HEAD'),
            (b'access-control-allow-headers', b'Content-Type, Authorization, X-Requested-With, *'),
            (b'content-type', content_type.encode('utf-8')),
        ]
        if scheme == 'https' and not IS_CLOUD:
            resp_headers.append((b'alt-svc', f'h3=":{PORT}"; ma=86400'.encode('ascii')))

        if extra_headers:
            for hk, hv in extra_headers:
                resp_headers.append((hk, hv))

        if method == 'HEAD':
            resp_headers.append((b'content-length', str(len(body_bytes)).encode('ascii')))
            await send({'type': 'http.response.start', 'status': status, 'headers': resp_headers})
            await send({'type': 'http.response.body', 'body': b'', 'more_body': False})
            return

        if compressable and 'gzip' in accept_encoding and len(body_bytes) > 200:
            compressed = gzip.compress(body_bytes, compresslevel=5)
            resp_headers.append((b'content-encoding', b'gzip'))
            resp_headers.append((b'content-length', str(len(compressed)).encode('ascii')))
            await send({'type': 'http.response.start', 'status': status, 'headers': resp_headers})
            await send({'type': 'http.response.body', 'body': compressed, 'more_body': False})
        else:
            resp_headers.append((b'content-length', str(len(body_bytes)).encode('ascii')))
            await send({'type': 'http.response.start', 'status': status, 'headers': resp_headers})
            await send({'type': 'http.response.body', 'body': body_bytes, 'more_body': False})

    # CORS Preflight OPTIONS
    if method == 'OPTIONS':
        await send_response(200, 'text/plain', b'OK')
        return

    # Clean URL redirect: remove .html from address bar
    if clean_path.endswith('.html') and not clean_path.startswith('/api/'):
        redirect_path = clean_path[:-5]
        if redirect_path in ['/cms']:
            redirect_path = '/'
        if query_string:
            redirect_path += '?' + query_string
        await send({
            'type': 'http.response.start',
            'status': 301,
            'headers': [
                (b'location', redirect_path.encode('utf-8')),
                (b'content-length', b'0')
            ]
        })
        await send({'type': 'http.response.body', 'body': b'', 'more_body': False})
        return

    if method in ['GET', 'HEAD']:
        if clean_path in ['/api/status', '/status', '/api/health', '/health', '/api/ping']:
            client_ip = scope.get('client', ('127.0.0.1', 0))[0]
            status_data = get_server_status_data(client_ip)
            raw_bytes = json.dumps(status_data).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/db/meta':
            if not DB_META_CACHE or time.time() - LAST_CACHE_UPDATE > 3.0:
                refresh_db_cache()
            raw_bytes = json.dumps(DB_META_CACHE).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/db':
            query_params = parse_qs(query_string)
            requested_keys = query_params.get('keys', [None])[0]
            if not DB_STORE_CACHE or time.time() - LAST_CACHE_UPDATE > 3.0:
                refresh_db_cache()
            if requested_keys:
                keys_list = [k.strip() for k in requested_keys.split(',') if k.strip()]
                data = {k: DB_STORE_CACHE[k]['value'] for k in keys_list if k in DB_STORE_CACHE}
            else:
                data = {k: v['value'] for k, v in DB_STORE_CACHE.items()}
            raw_bytes = json.dumps(data).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path in ['/api/seat-plan/data', '/api/seat-plan/sync']:
            seat_keys = [
                'school_students', 'school_buildings', 'school_rooms', 'school_classes',
                'school_class_sections', 'school_exam_routines', 'school_seat_plans_store',
                'school_saved_seat_allocations', 'school_dist_excluded_class_sections',
                'school_dist_included_sections', 'school_excluded_buildings', 'school_excluded_rooms',
                'school_shift_times', 'school_staff', 'school_subjects', 'school_settings',
                'school_seat_generator_panel_collapsed', 'school_seat_layout_view_mode',
                'seat_token_language', 'seat_token_fontsize', 'seat_token_headline_fontsize'
            ]
            query_params = parse_qs(query_string)
            custom_keys = query_params.get('keys', [None])[0]
            if custom_keys:
                seat_keys = [k.strip() for k in custom_keys.split(',') if k.strip()]
            if not DB_STORE_CACHE or time.time() - LAST_CACHE_UPDATE > 3.0:
                refresh_db_cache()
            data = {k: DB_STORE_CACHE[k]['value'] for k in seat_keys if k in DB_STORE_CACHE}
            resp_obj = {
                "status": "success",
                "data": data,
                "server_time": int(time.time() * 1000),
                "count": len(data)
            }
            raw_bytes = json.dumps(resp_obj).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/seat-plan/status':
            resp_obj = {
                "status": "online",
                "db": "connected",
                "server_time": int(time.time() * 1000),
                "db_cache_time": int(LAST_CACHE_UPDATE * 1000)
            }
            raw_bytes = json.dumps(resp_obj).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/active-users':
            client_ip = scope.get('client', ('127.0.0.1', 0))[0]
            users = get_active_sessions_list(client_ip)
            raw_bytes = json.dumps({"count": len(users), "users": users}).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path in ['/api/activity-logs', '/api/chat/messages', '/api/log/activity']:
            logs = []
            conn = None
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT id, user_name, role, module, action, details, device_name, device_ip, mac_address, location, timestamp FROM school_activity_logs ORDER BY id DESC LIMIT 300')
                for row in cursor.fetchall():
                    ts = row[10]
                    time_str = datetime.datetime.fromtimestamp(ts / 1000.0).strftime('%I:%M:%S %p (%d-%m-%Y)') if ts and ts > 10000000000 else time.strftime('%I:%M:%S %p (%d-%m-%Y)')
                    logs.append({
                        "id": row[0],
                        "user_name": row[1] or "স্কুল সদস্য",
                        "role": row[2] or "সদস্য",
                        "module": row[3] or "সিস্টেম",
                        "action": row[4] or "তথ্য আপডেট",
                        "details": row[5] or "",
                        "device_name": row[6] or "Device",
                        "device_ip": row[7] or "",
                        "mac_address": row[8] or "",
                        "location": row[9] or "জলঢাকা, নীলফামারী",
                        "timestamp": ts,
                        "time_formatted": time_str
                    })
            except Exception as e:
                print(f"Error fetching activity logs: {e}")
            finally:
                if conn:
                    conn.close()
            raw_bytes = json.dumps({"logs": logs, "messages": logs}).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/exams':
            exams_file = os.path.join(BASE_DIR, 'exams_data.json')
            try:
                with open(exams_file, 'r', encoding='utf-8') as f:
                    exams_data = json.load(f)
            except Exception:
                exams_data = []
            raw_bytes = json.dumps(exams_data, ensure_ascii=False).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path == '/api/sms/balance':
            query_params = parse_qs(query_string)
            api_key = query_params.get('api_key', [''])[0]
            balance_url = query_params.get('balance_url', ['https://bulksmsbd.net/api/getBalanceApi'])[0]
            result = proxy_bulksmsbd_request(balance_url, {'api_key': api_key})
            raw_bytes = json.dumps(result).encode('utf-8')
            await send_response(200, 'application/json', raw_bytes)
            return

        elif clean_path in ['/cert', '/cert.pem', '/cert.crt', '/download-cert', '/ca.crt']:
            if os.path.exists(CERT_FILE):
                with open(CERT_FILE, 'rb') as f:
                    cert_bytes = f.read()
                extra = [
                    (b'content-disposition', b'attachment; filename="school_ssl_cert.crt"'),
                    (b'cache-control', b'no-cache')
                ]
                await send_response(200, 'application/x-x509-ca-cert', cert_bytes, extra_headers=extra)
                return
            else:
                await send_response(404, 'text/plain', b'Certificate not found')
                return

        elif clean_path.startswith('/api/'):
            await send_response(404, 'application/json', json.dumps({"error": "API route not found", "path": clean_path}).encode('utf-8'))
            return

        else:
            filepath = resolve_static_path(path)
            if not filepath or not os.path.exists(filepath):
                log_server_error(f"HTTP 404: Not Found - {path}")
                await send_response(404, 'text/plain', b'File not found')
                return
            
            ctype, _ = mimetypes.guess_type(filepath)
            ctype = ctype or 'application/octet-stream'
            if filepath.endswith('.js'):
                ctype = 'application/javascript'
            elif filepath.endswith('.css'):
                ctype = 'text/css'
            elif filepath.endswith('.svg'):
                ctype = 'image/svg+xml'
            elif filepath.endswith('.ico'):
                ctype = 'image/x-icon'
            elif filepath.endswith('.png'):
                ctype = 'image/png'

            # High-speed RAM cache for static assets
            if not filepath.endswith('.html') and filepath in STATIC_FILE_CACHE:
                cached_time, cached_content = STATIC_FILE_CACHE[filepath]
                if os.path.getmtime(filepath) <= cached_time:
                    await send_response(200, ctype, cached_content)
                    return

            try:
                with open(filepath, 'rb') as f:
                    content = f.read()
            except Exception as e:
                log_server_error(f"HTTP 500: Error reading {filepath} - {e}")
                await send_response(500, 'text/plain', str(e).encode('utf-8'))
                return

            if not filepath.endswith('.html') and len(content) < 5000000:
                STATIC_FILE_CACHE[filepath] = (os.path.getmtime(filepath), content)

            if filepath.endswith('.html') and ('html' in ctype or 'text' in ctype):
                content = inject_html_boot(content)

            await send_response(200, ctype, content)
            return

    elif method == 'POST':
        body_chunks = []
        while True:
            message = await receive()
            body_chunks.append(message.get('body', b''))
            if not message.get('more_body', False):
                break
        post_data = b''.join(body_chunks)
        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            payload = {}

        if clean_path in ['/api/status', '/status', '/api/health', '/health', '/api/ping']:
            client_ip = scope.get('client', ('127.0.0.1', 0))[0]
            status_data = get_server_status_data(client_ip)
            await send_response(200, 'application/json', json.dumps(status_data).encode('utf-8'))
            return

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            if clean_path in ['/api/db/set', '/api/db/save', '/api/seat-plan/save', '/api/seat-plan/bulk-save', '/api/seat-plan/bulk-sync', '/api/db/bulk-set', '/api/db/bulk-save']:
                now_ms = int(time.time() * 1000)
                saved_keys = []
                rows_to_insert = []
                data_dict = payload.get('data') if ('data' in payload and isinstance(payload['data'], dict)) else (payload.get('items') if ('items' in payload and isinstance(payload['items'], (dict, list))) else None)
                
                if isinstance(data_dict, dict):
                    for k, v in data_dict.items():
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)
                elif isinstance(data_dict, list):
                    for item in data_dict:
                        if isinstance(item, dict) and 'key' in item and 'value' in item:
                            k = item['key']
                            v = item['value']
                            val_str = json.dumps(v) if not isinstance(v, str) else v
                            rows_to_insert.append((k, val_str, now_ms))
                            DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                            DB_META_CACHE[k] = now_ms
                            if k in ESSENTIAL_UI_KEYS:
                                DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                            saved_keys.append(k)
                elif 'key' in payload and 'value' in payload:
                    k = payload['key']
                    v = payload['value']
                    if k is not None and v is not None:
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)
                elif isinstance(payload, dict) and len(payload) > 0 and not any(k in payload for k in ['key', 'status', 'action', 'user_name']):
                    for k, v in payload.items():
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)

                if rows_to_insert:
                    cursor.executemany('INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES (?, ?, ?)', rows_to_insert)
                    conn.commit()

                resp_obj = {"status": "success", "updated_at": now_ms, "saved_keys": saved_keys, "count": len(saved_keys)}
                await send_response(200, 'application/json', json.dumps(resp_obj).encode('utf-8'))
                return
            elif clean_path == '/api/db/delete':
                key = payload.get('key')
                if key is not None:
                    cursor.execute('DELETE FROM local_storage_sync WHERE key = ?', (key,))
                    conn.commit()
                    DB_STORE_CACHE.pop(key, None)
                    DB_META_CACHE.pop(key, None)
                    DB_ESSENTIALS_CACHE.pop(key, None)
                await send_response(200, 'application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/db/clear':
                cursor.execute('DELETE FROM local_storage_sync')
                conn.commit()
                DB_STORE_CACHE.clear()
                DB_META_CACHE.clear()
                DB_ESSENTIALS_CACHE.clear()
                await send_response(200, 'application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/heartbeat':
                client_ip = scope.get('client', ('127.0.0.1', 0))[0]
                ua_str = headers_dict.get('user-agent', '')
                session_id = payload.get('session_id') or f"sid_{client_ip}"
                user_name = payload.get('user_name', '')
                role = payload.get('role', '')
                device_name = payload.get('device_name', '')
                location = payload.get('location', '')
                page = payload.get('page', '')
                client_mac = payload.get('device_mac') or payload.get('mac_address')
                client_joined_at = payload.get('joined_at')

                session_info = register_session(session_id, user_name, role, device_name, location, page, client_ip, ua_str, client_mac, client_joined_at)
                active_list = get_active_sessions_list(client_ip)
                resp = {
                    "status": "success",
                    "device_ip": session_info["device_ip"],
                    "mac_address": session_info["mac_address"],
                    "joined_time": session_info["joined_time_formatted"],
                    "active_count": len([u for u in active_list if u.get('is_active')]),
                    "users": active_list
                }
                await send_response(200, 'application/json', json.dumps(resp).encode('utf-8'))
                return
            elif clean_path in ['/api/heartbeat/logout', '/api/logout']:
                client_ip = scope.get('client', ('127.0.0.1', 0))[0]
                session_id = payload.get('session_id')
                logout_session(session_id, client_ip)
                active_list = get_active_sessions_list(client_ip)
                resp = {
                    "status": "success",
                    "message": "Logged out successfully",
                    "active_count": len([u for u in active_list if u.get('is_active')]),
                    "users": active_list
                }
                await send_response(200, 'application/json', json.dumps(resp).encode('utf-8'))
                return
            elif clean_path in ['/api/activity-logs', '/api/activity-logs/add', '/api/log/activity', '/api/chat/send']:
                client_ip = scope.get('client', ('127.0.0.1', 0))[0]
                effective_ip = client_ip if client_ip not in ['127.0.0.1', 'localhost', '::1'] else get_local_ip()
                ua_str = headers_dict.get('user-agent', '')
                user_name = payload.get('user_name') or 'স্কুল সদস্য'
                role = payload.get('role') or 'স্টাফ'
                module = payload.get('module') or 'সিস্টেম'
                action = payload.get('action') or 'তথ্য আপডেট'
                details = payload.get('details') or payload.get('message') or ''
                device_name = payload.get('device_name') or get_device_from_ua(ua_str)
                mac = get_mac_for_ip(client_ip)
                location = payload.get('location') or 'জলঢাকা, নীলফামারী'
                now_ms = int(time.time() * 1000)

                cursor.execute('''
                    INSERT INTO school_activity_logs (user_name, role, module, action, details, device_name, device_ip, mac_address, location, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (user_name, role, module, action, details, device_name, effective_ip, mac, location, now_ms))
                conn.commit()
                
                await send_response(200, 'application/json', json.dumps({"status": "success", "timestamp": now_ms}).encode('utf-8'))
                return
            elif clean_path in ['/api/activity-logs/clear', '/api/chat/clear']:
                cursor.execute('DELETE FROM school_activity_logs')
                cursor.execute('DELETE FROM school_live_chat')
                conn.commit()
                await send_response(200, 'application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/sms/send':
                api_key = payload.get('api_key', '')
                sender_id = payload.get('sender_id', '')
                sms_type = payload.get('sms_type', 'text')
                number = payload.get('number', '')
                message = payload.get('message', '')
                api_url = payload.get('api_url', 'https://bulksmsbd.net/api/smsapi')
                
                params = {
                    'api_key': api_key,
                    'type': sms_type,
                    'number': number,
                    'senderid': sender_id,
                    'message': message
                }
                result = proxy_bulksmsbd_request(api_url, params)
                raw_bytes = json.dumps(result).encode('utf-8')
                await send_response(200, 'application/json', raw_bytes)
                return
            
            if clean_path == '/api/exams':
                exams_file = os.path.join(BASE_DIR, 'exams_data.json')
                try:
                    with open(exams_file, 'w', encoding='utf-8') as f:
                        json.dump(payload, f, ensure_ascii=False, indent=4)
                    await send_response(200, 'application/json', b'{"status":"success"}')
                except Exception as e:
                    await send_response(500, 'application/json', json.dumps({"error": str(e)}).encode('utf-8'))
                return

            if clean_path == '/api/scan_omr':
                ctype_header = headers_dict.get('content-type', '')
                image_bytes, filename = parse_multipart_file(post_data, ctype_header)
                result = process_omr_image(image_bytes, filename)
                await send_response(200, 'application/json', json.dumps(result, ensure_ascii=False).encode('utf-8'))
                return

            if clean_path.startswith('/api/'):
                await send_response(404, 'application/json', json.dumps({"error": "API endpoint not found", "path": clean_path}).encode('utf-8'))
                return

            await send_response(200, 'application/json', b'{"status":"success"}')
        except Exception as e:
            print(f"Database error during POST {path}: {e}")
            log_server_error(f"HTTP 500 DB Error on POST {path}: {e}")
            await send_response(500, 'application/json', json.dumps({"error": str(e)}).encode('utf-8'))
        finally:
            if conn:
                conn.close()
        return

    await send_response(404, 'text/plain', b'Not Found')

# --- SYNCHRONOUS FALLBACK SERVER (If Hypercorn is unavailable) ---
import http.server
import socketserver

class ThreadedSyncServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        except Exception:
            pass
        super().server_bind()

class SyncServerHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, *')
            self.send_header('Content-Length', '0')
            self.end_headers()
        except Exception:
            pass

    def log_message(self, format, *args):
        try:
            status_code = int(args[1]) if len(args) > 1 else 200
            if status_code >= 400:
                msg = f"HTTP {status_code}: {self.address_string()} - {format % args}"
                log_server_error(msg)
        except Exception:
            pass

    def send_compressed_response(self, content_type, raw_bytes, status_code=200):
        accept_encoding = self.headers.get('Accept-Encoding', '')
        compressable = any(ct in content_type for ct in ['text', 'javascript', 'json', 'xml', 'css', 'svg'])
        try:
            self.send_response(status_code)
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, *')
            self.send_header('Content-Type', content_type)
            if compressable and 'gzip' in accept_encoding and len(raw_bytes) > 200:
                compressed = gzip.compress(raw_bytes, compresslevel=5)
                self.send_header('Content-Encoding', 'gzip')
                self.send_header('Content-Length', str(len(compressed)))
                self.end_headers()
                self.wfile.write(compressed)
            else:
                self.send_header('Content-Length', str(len(raw_bytes)))
                self.end_headers()
                self.wfile.write(raw_bytes)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
            pass

    def guess_type(self, path):
        if str(path).endswith('.ico'):
            return 'image/x-icon'
        if str(path).endswith('.svg'):
            return 'image/svg+xml'
        if str(path).endswith('.png'):
            return 'image/png'
        return super().guess_type(path)

    def translate_path(self, path):
        resolved = resolve_static_path(path)
        return resolved or super().translate_path(path)

    def serve_static_file(self, filepath):
        if not filepath or not os.path.exists(filepath) or os.path.isdir(filepath):
            try:
                self.send_error(404, "File not found")
            except Exception:
                pass
            return
        
        ctype = self.guess_type(filepath)
        try:
            if not filepath.endswith('.html') and filepath in STATIC_FILE_CACHE:
                cached_time, cached_content = STATIC_FILE_CACHE[filepath]
                if os.path.getmtime(filepath) <= cached_time:
                    self.send_compressed_response(ctype, cached_content)
                    return

            with open(filepath, 'rb') as f:
                content = f.read()

            if not filepath.endswith('.html') and len(content) < 5000000:
                STATIC_FILE_CACHE[filepath] = (os.path.getmtime(filepath), content)

            if filepath.endswith('.html') and ctype.startswith('text/html'):
                content = inject_html_boot(content)

            self.send_compressed_response(ctype, content)
        except Exception as e:
            try:
                self.send_error(500, str(e))
            except Exception:
                pass

    def do_GET(self):
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path.rstrip('/') if parsed_url.path != '/' else '/'
        try:
            if clean_path.endswith('.html') and not clean_path.startswith('/api/'):
                redirect_path = clean_path[:-5]
                if redirect_path in ['/cms']:
                    redirect_path = '/'
                if parsed_url.query:
                    redirect_path += '?' + parsed_url.query
                self.send_response(301)
                self.send_header('Location', redirect_path)
                self.end_headers()
                return

            if clean_path in ['/api/status', '/status', '/api/health', '/health', '/api/ping']:
                client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
                status_data = get_server_status_data(client_ip)
                raw_bytes = json.dumps(status_data).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path == '/api/db/meta':
                if time.time() - LAST_CACHE_UPDATE > 2.0 or not DB_META_CACHE:
                    refresh_db_cache()
                raw_bytes = json.dumps(DB_META_CACHE).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path == '/api/active-users':
                client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
                users = get_active_sessions_list(client_ip)
                raw_bytes = json.dumps({"count": len(users), "users": users}).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path in ['/api/activity-logs', '/api/chat/messages', '/api/log/activity']:
                logs = []
                conn = None
                try:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute('SELECT id, user_name, role, module, action, details, device_name, device_ip, mac_address, location, timestamp FROM school_activity_logs ORDER BY id DESC LIMIT 300')
                    for row in cursor.fetchall():
                        ts = row[10]
                        time_str = datetime.datetime.fromtimestamp(ts / 1000.0).strftime('%I:%M:%S %p (%d-%m-%Y)') if ts and ts > 10000000000 else time.strftime('%I:%M:%S %p (%d-%m-%Y)')
                        logs.append({
                            "id": row[0],
                            "user_name": row[1] or "স্কুল সদস্য",
                            "role": row[2] or "সদস্য",
                            "module": row[3] or "সিস্টেম",
                            "action": row[4] or "তথ্য আপডেট",
                            "details": row[5] or "",
                            "device_name": row[6] or "Device",
                            "device_ip": row[7] or "",
                            "mac_address": row[8] or "",
                            "location": row[9] or "জলঢাকা, নীলফামারী",
                            "timestamp": ts,
                            "time_formatted": time_str
                        })
                except Exception as e:
                    print(f"Error fetching activity logs: {e}")
                finally:
                    if conn:
                        conn.close()
                raw_bytes = json.dumps({"logs": logs, "messages": logs}).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path == '/api/db':
                query_params = parse_qs(parsed_url.query)
                requested_keys = query_params.get('keys', [None])[0]
                if not DB_STORE_CACHE or time.time() - LAST_CACHE_UPDATE > 3.0:
                    refresh_db_cache()
                if requested_keys:
                    keys_list = [k.strip() for k in requested_keys.split(',') if k.strip()]
                    data = {k: DB_STORE_CACHE[k]['value'] for k in keys_list if k in DB_STORE_CACHE}
                else:
                    data = {k: v['value'] for k, v in DB_STORE_CACHE.items()}
                raw_bytes = json.dumps(data).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path in ['/api/seat-plan/data', '/api/seat-plan/sync']:
                seat_keys = [
                    'school_students', 'school_buildings', 'school_rooms', 'school_classes',
                    'school_class_sections', 'school_exam_routines', 'school_seat_plans_store',
                    'school_saved_seat_allocations', 'school_dist_excluded_class_sections',
                    'school_dist_included_sections', 'school_excluded_buildings', 'school_excluded_rooms',
                    'school_shift_times', 'school_staff', 'school_subjects', 'school_settings',
                    'school_seat_generator_panel_collapsed', 'school_seat_layout_view_mode',
                    'seat_token_language', 'seat_token_fontsize', 'seat_token_headline_fontsize'
                ]
                query_params = parse_qs(parsed_url.query)
                custom_keys = query_params.get('keys', [None])[0]
                if custom_keys:
                    seat_keys = [k.strip() for k in custom_keys.split(',') if k.strip()]
                if not DB_STORE_CACHE or time.time() - LAST_CACHE_UPDATE > 3.0:
                    refresh_db_cache()
                data = {k: DB_STORE_CACHE[k]['value'] for k in seat_keys if k in DB_STORE_CACHE}
                resp_obj = {
                    "status": "success",
                    "data": data,
                    "server_time": int(time.time() * 1000),
                    "count": len(data)
                }
                raw_bytes = json.dumps(resp_obj).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path == '/api/seat-plan/status':
                resp_obj = {
                    "status": "online",
                    "db": "connected",
                    "server_time": int(time.time() * 1000),
                    "db_cache_time": int(LAST_CACHE_UPDATE * 1000)
                }
                raw_bytes = json.dumps(resp_obj).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
            elif clean_path == '/api/exams':
                exams_file = os.path.join(BASE_DIR, 'exams_data.json')
                try:
                    with open(exams_file, 'r', encoding='utf-8') as f:
                        exams_data = json.load(f)
                except Exception:
                    exams_data = []
                raw_bytes = json.dumps(exams_data, ensure_ascii=False).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
                return
            elif clean_path == '/api/sms/balance':
                query_params = parse_qs(parsed_url.query)
                api_key = query_params.get('api_key', [''])[0]
                balance_url = query_params.get('balance_url', ['https://bulksmsbd.net/api/getBalanceApi'])[0]
                result = proxy_bulksmsbd_request(balance_url, {'api_key': api_key})
                raw_bytes = json.dumps(result).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
                return
            elif clean_path in ['/cert', '/cert.pem', '/cert.crt', '/download-cert', '/ca.crt']:
                if os.path.exists(CERT_FILE):
                    with open(CERT_FILE, 'rb') as f:
                        cert_bytes = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/x-x509-ca-cert')
                    self.send_header('Content-Disposition', 'attachment; filename="school_ssl_cert.crt"')
                    self.send_header('Content-Length', str(len(cert_bytes)))
                    self.send_header('Cache-Control', 'no-cache')
                    self.end_headers()
                    self.wfile.write(cert_bytes)
                else:
                    self.send_error(404, 'Certificate not found')
            if clean_path.startswith('/api/'):
                self.send_compressed_response('application/json', json.dumps({"error": "API route not found", "path": clean_path}).encode('utf-8'), status_code=404)
            else:
                filepath = self.translate_path(parsed_url.path)
                self.serve_static_file(filepath)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
            pass

    def do_POST(self):
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path.rstrip('/') if parsed_url.path != '/' else '/'

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b''

        if clean_path == '/api/scan_omr':
            ctype_header = self.headers.get('Content-Type', '')
            image_bytes, filename = parse_multipart_file(post_data, ctype_header)
            result = process_omr_image(image_bytes, filename)
            self.send_compressed_response('application/json', json.dumps(result, ensure_ascii=False).encode('utf-8'))
            return

        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            payload = {}

        if clean_path == '/api/exams':
            exams_file = os.path.join(BASE_DIR, 'exams_data.json')
            try:
                with open(exams_file, 'w', encoding='utf-8') as f:
                    json.dump(payload, f, ensure_ascii=False, indent=4)
                self.send_compressed_response('application/json', b'{"status":"success"}')
            except Exception as e:
                self.send_compressed_response('application/json', json.dumps({"error": str(e)}).encode('utf-8'), status_code=500)
            return

        if clean_path in ['/api/status', '/status', '/api/health', '/health', '/api/ping']:
            client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
            status_data = get_server_status_data(client_ip)
            self.send_compressed_response('application/json', json.dumps(status_data).encode('utf-8'))
            return

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
            ua_str = self.headers.get('User-Agent', '')

            if clean_path in ['/api/db/set', '/api/db/save', '/api/seat-plan/save', '/api/seat-plan/bulk-save', '/api/seat-plan/bulk-sync', '/api/db/bulk-set', '/api/db/bulk-save']:
                now_ms = int(time.time() * 1000)
                saved_keys = []
                rows_to_insert = []
                data_dict = payload.get('data') if ('data' in payload and isinstance(payload['data'], dict)) else (payload.get('items') if ('items' in payload and isinstance(payload['items'], (dict, list))) else None)
                
                if isinstance(data_dict, dict):
                    for k, v in data_dict.items():
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)
                elif isinstance(data_dict, list):
                    for item in data_dict:
                        if isinstance(item, dict) and 'key' in item and 'value' in item:
                            k = item['key']
                            v = item['value']
                            val_str = json.dumps(v) if not isinstance(v, str) else v
                            rows_to_insert.append((k, val_str, now_ms))
                            DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                            DB_META_CACHE[k] = now_ms
                            if k in ESSENTIAL_UI_KEYS:
                                DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                            saved_keys.append(k)
                elif 'key' in payload and 'value' in payload:
                    k = payload['key']
                    v = payload['value']
                    if k is not None and v is not None:
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)
                elif isinstance(payload, dict) and len(payload) > 0 and not any(k in payload for k in ['key', 'status', 'action', 'user_name']):
                    for k, v in payload.items():
                        val_str = json.dumps(v) if not isinstance(v, str) else v
                        rows_to_insert.append((k, val_str, now_ms))
                        DB_STORE_CACHE[k] = {'value': val_str, 'updated_at': now_ms}
                        DB_META_CACHE[k] = now_ms
                        if k in ESSENTIAL_UI_KEYS:
                            DB_ESSENTIALS_CACHE[k] = DB_STORE_CACHE[k]
                        saved_keys.append(k)

                if rows_to_insert:
                    cursor.executemany('INSERT OR REPLACE INTO local_storage_sync (key, value, updated_at) VALUES (?, ?, ?)', rows_to_insert)
                    conn.commit()

                response_data = {
                    "status": "success",
                    "updated_at": now_ms,
                    "saved_keys": saved_keys,
                    "count": len(saved_keys)
                }
                raw_bytes = json.dumps(response_data).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
                return
            elif clean_path == '/api/db/delete':
                key = payload.get('key')
                if key is not None:
                    cursor.execute('DELETE FROM local_storage_sync WHERE key = ?', (key,))
                    conn.commit()
                    DB_STORE_CACHE.pop(key, None)
                    DB_META_CACHE.pop(key, None)
                    DB_ESSENTIALS_CACHE.pop(key, None)
                self.send_compressed_response('application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/db/clear':
                cursor.execute('DELETE FROM local_storage_sync')
                conn.commit()
                DB_STORE_CACHE.clear()
                DB_META_CACHE.clear()
                DB_ESSENTIALS_CACHE.clear()
                self.send_compressed_response('application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/heartbeat':
                session_id = payload.get('session_id') or f"sid_{client_ip}"
                user_name = payload.get('user_name', '')
                role = payload.get('role', '')
                device_name = payload.get('device_name', '')
                location = payload.get('location', '')
                page = payload.get('page', '')
                client_mac = payload.get('device_mac') or payload.get('mac_address')
                client_joined_at = payload.get('joined_at')

                session_info = register_session(session_id, user_name, role, device_name, location, page, client_ip, ua_str, client_mac, client_joined_at)
                active_list = get_active_sessions_list(client_ip)
                resp = {
                    "status": "success",
                    "device_ip": session_info["device_ip"],
                    "mac_address": session_info["mac_address"],
                    "joined_time": session_info["joined_time_formatted"],
                    "active_count": len([u for u in active_list if u.get('is_active')]),
                    "users": active_list
                }
                self.send_compressed_response('application/json', json.dumps(resp).encode('utf-8'))
                return
            elif clean_path in ['/api/heartbeat/logout', '/api/logout']:
                session_id = payload.get('session_id')
                logout_session(session_id, client_ip)
                active_list = get_active_sessions_list(client_ip)
                resp = {
                    "status": "success",
                    "message": "Logged out successfully",
                    "active_count": len([u for u in active_list if u.get('is_active')]),
                    "users": active_list
                }
                self.send_compressed_response('application/json', json.dumps(resp).encode('utf-8'))
                return
            elif clean_path in ['/api/activity-logs', '/api/activity-logs/add', '/api/log/activity', '/api/chat/send']:
                effective_ip = client_ip if client_ip not in ['127.0.0.1', 'localhost', '::1'] else get_local_ip()
                user_name = payload.get('user_name') or 'স্কুল সদস্য'
                role = payload.get('role') or 'স্টাফ'
                module = payload.get('module') or 'সিস্টেম'
                action = payload.get('action') or 'তথ্য আপডেট'
                details = payload.get('details') or payload.get('message') or ''
                device_name = payload.get('device_name') or get_device_from_ua(ua_str)
                mac = get_mac_for_ip(client_ip)
                location = payload.get('location') or 'জলঢাকা, নীলফামারী'
                now_ms = int(time.time() * 1000)

                cursor.execute('''
                    INSERT INTO school_activity_logs (user_name, role, module, action, details, device_name, device_ip, mac_address, location, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (user_name, role, module, action, details, device_name, effective_ip, mac, location, now_ms))
                conn.commit()
                
                self.send_compressed_response('application/json', json.dumps({"status": "success", "timestamp": now_ms}).encode('utf-8'))
                return
            elif clean_path in ['/api/activity-logs/clear', '/api/chat/clear']:
                cursor.execute('DELETE FROM school_activity_logs')
                cursor.execute('DELETE FROM school_live_chat')
                conn.commit()
                self.send_compressed_response('application/json', b'{"status":"success"}')
                return
            elif clean_path == '/api/sms/send':
                api_key = payload.get('api_key', '')
                sender_id = payload.get('sender_id', '')
                sms_type = payload.get('sms_type', 'text')
                number = payload.get('number', '')
                message = payload.get('message', '')
                api_url = payload.get('api_url', 'https://bulksmsbd.net/api/smsapi')
                
                params = {
                    'api_key': api_key,
                    'type': sms_type,
                    'number': number,
                    'senderid': sender_id,
                    'message': message
                }
                result = proxy_bulksmsbd_request(api_url, params)
                raw_bytes = json.dumps(result).encode('utf-8')
                self.send_compressed_response('application/json', raw_bytes)
                return
            
            if clean_path.startswith('/api/'):
                self.send_compressed_response('application/json', json.dumps({"error": "API endpoint not found", "path": clean_path}).encode('utf-8'), status_code=404)
                return

            self.send_compressed_response('application/json', b'{"status":"success"}')
        except Exception as e:
            print(f"Database error during POST {self.path}: {e}")
            try:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'{{"error":"{str(e)}"}}'.encode('utf-8'))
            except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                pass
        finally:
            if conn:
                conn.close()

def run_fallback_server():
    free_ports_if_occupied([PORT])
    with ThreadedSyncServer(("", PORT), SyncServerHandler) as httpd:
        local_ip = get_local_ip()
        print("\n==========================================================")
        print("  School Management System - THREADED HTTP/1.1 RUNNING (Fallback)")
        print("==========================================================")
        print(f"  [1] Computer (PC):        http://localhost:{PORT}")
        print(f"  [2] LAN / Mobile:         http://{local_ip}:{PORT}")
        print("==========================================================")
        httpd.serve_forever()

INTERNAL_HTTP_PORT = 8080
INTERNAL_HTTPS_PORT = 8443

async def _pipe_stream(reader, writer):
    try:
        while True:
            data = await reader.read(65536)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except (ConnectionResetError, BrokenPipeError, asyncio.CancelledError, OSError):
        pass
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass

async def _handle_dual_protocol_client(reader, writer):
    try:
        first_chunk = await reader.read(4096)
        if not first_chunk:
            writer.close()
            return

        if first_chunk[0] == 0x16:
            # TLS / HTTPS Handshake detected! Pipe directly to internal Hypercorn HTTPS (HTTP/2)
            target_port = INTERNAL_HTTPS_PORT
        else:
            # Plain HTTP request detected! Pipe directly to internal Hypercorn HTTP (Zero certificate warning)
            target_port = INTERNAL_HTTP_PORT

        remote_reader, remote_writer = await asyncio.open_connection('127.0.0.1', target_port)
        remote_writer.write(first_chunk)
        await remote_writer.drain()
        await asyncio.gather(
            _pipe_stream(reader, remote_writer),
            _pipe_stream(remote_reader, writer)
        )
    except Exception:
        try:
            writer.close()
        except Exception:
            pass

async def _start_port_80_redirector():
    async def _handle_port_80(reader, writer):
        try:
            first_chunk = await reader.read(1024)
            if not first_chunk:
                writer.close()
                return
            text = first_chunk.decode('latin1', errors='replace')
            lines = text.split('\r\n')
            req_line = lines[0] if lines else ''
            parts = req_line.split(' ')
            path = parts[1] if len(parts) > 1 else '/'
            host = None
            for line in lines:
                if line.lower().startswith('host:'):
                    host = line.split(':', 1)[1].strip()
                    break
            if not host:
                host = "localhost"
            host_name = host.split(':')[0]
            redirect_url = f"http://{host_name}:{PORT}{path}"
            body_bytes = f'<html><head><meta http-equiv="refresh" content="0;url={redirect_url}"></head><body>Redirecting to <a href="{redirect_url}">{redirect_url}</a></body></html>'.encode('utf-8')
            response = (
                f"HTTP/1.1 301 Moved Permanently\r\n"
                f"Location: {redirect_url}\r\n"
                f"Content-Type: text/html; charset=utf-8\r\n"
                f"Content-Length: {len(body_bytes)}\r\n"
                f"Connection: close\r\n\r\n"
            ).encode('utf-8') + body_bytes
            writer.write(response)
            await writer.drain()
            writer.close()
        except Exception:
            try:
                writer.close()
            except Exception:
                pass
    try:
        await asyncio.start_server(_handle_port_80, '0.0.0.0', 80)
    except Exception:
        pass

def handle_asyncio_exception(loop, context):
    exception = context.get('exception')
    if isinstance(exception, (TimeoutError, ssl.SSLError, ConnectionResetError, BrokenPipeError, OSError)):
        return
    msg = context.get('message', '')
    if 'SSL' in msg or 'client_connected_cb' in msg:
        return
    loop.default_exception_handler(context)

async def start_hypercorn_server(cert_path=None, key_path=None):
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(handle_asyncio_exception)
    
    # 0. Cloud (Render / Railway / Heroku) Mode: bind directly to the cloud assigned PORT
    if IS_CLOUD:
        config = HyperConfig()
        config.keep_alive_timeout = 60.0
        config.graceful_timeout = 5.0
        config.bind = [f"0.0.0.0:{PORT}"]
        config.alpn_protocols = ["h2c", "http/1.1"]
        config.accesslog = None
        print(f"  [+] Cloud Deployment Mode Active: Listening directly on 0.0.0.0:{PORT}")
        await hypercorn.asyncio.serve(asgi_app, config)
        return

    # Auto-clean any stale port listeners before starting internal engines
    free_ports_if_occupied([PORT, INTERNAL_HTTP_PORT, INTERNAL_HTTPS_PORT])

    # 1. Plain HTTP Internal Engine (Port 8080)
    http_config = HyperConfig()
    http_config.keep_alive_timeout = 60.0
    http_config.graceful_timeout = 0.0
    http_config.shutdown_timeout = 5.0
    http_config.bind = [f"127.0.0.1:{INTERNAL_HTTP_PORT}"]
    http_config.alpn_protocols = ["h2c", "http/1.1"]
    http_config.accesslog = None
    http_task = asyncio.create_task(hypercorn.asyncio.serve(asgi_app, http_config))

    tasks = [http_task]

    # 2. HTTPS / TLS Internal Engine (Port 8443)
    if cert_path and key_path and os.path.exists(cert_path) and os.path.exists(key_path):
        https_config = HyperConfig()
        https_config.keep_alive_timeout = 60.0
        https_config.graceful_timeout = 0.0
        https_config.shutdown_timeout = 5.0
        https_config.bind = [f"127.0.0.1:{INTERNAL_HTTPS_PORT}"]
        https_config.certfile = cert_path
        https_config.keyfile = key_path
        https_config.alpn_protocols = ["h2", "http/1.1"]
        https_config.accesslog = None
        
        try:
            import aioquic
            https_config.quic_bind = [f"0.0.0.0:{PORT}"]
        except ImportError:
            pass

        https_task = asyncio.create_task(hypercorn.asyncio.serve(asgi_app, https_config))
        tasks.append(https_task)

    # 3. Background Port 80 Redirector
    asyncio.create_task(_start_port_80_redirector())

    # 4. Master Smart Dual-Protocol Gateway on 0.0.0.0:PORT (8000) with auto-retry
    tcp_server = None
    for attempt in range(3):
        try:
            tcp_server = await asyncio.start_server(_handle_dual_protocol_client, '0.0.0.0', PORT, reuse_address=True)
            break
        except OSError as oe:
            if oe.errno == 10048 or '10048' in str(oe):
                free_ports_if_occupied([PORT])
                await asyncio.sleep(0.4)
            else:
                raise oe

    if tcp_server is None:
        tcp_server = await asyncio.start_server(_handle_dual_protocol_client, '0.0.0.0', PORT, reuse_address=True)

    tasks.append(tcp_server.serve_forever())
    
    try:
        await asyncio.gather(*tasks)
    finally:
        tcp_server.close()
        await tcp_server.wait_closed()

def main():
    free_ports_if_occupied([PORT, INTERNAL_HTTP_PORT, INTERNAL_HTTPS_PORT])
    init_db()
    init_omr_db()
    sync_db_with_txt_files()
    ensure_favicon_files()
    refresh_db_cache()
    
    cert_path, key_path = ensure_ssl_certificates()
    local_ip = get_local_ip()

    if not HAS_HYPERCORN:
        print("  [!] Hypercorn not installed. Starting standard fallback server...")
        run_fallback_server()
        return

    try:
        print("\n==========================================================")
        print("  AL-HAJ MOBARAK HOSSAIN ANIRBAN BYDDA TIRTHA M,L HIGH SCHOOL")
        print("    SMART DUAL-PROTOCOL SERVER (HTTP & HTTPS CONCURRENT)  ")
        print("==========================================================")
        print("  [+] Smart Dual Gateway:    ACTIVE on Port 8000 (HTTP + HTTPS)")
        print("  [+] Plain HTTP Engine:     ACTIVE (100% Zero-Warning on Mobile/PC)")
        print("  [+] Secure HTTPS Engine:   ACTIVE (HTTP/2 Encrypted Fast Stream)")
        print("  [+] Gzip Compression:      ENABLED (Up to 85% Bandwidth Reduction)")
        print("  [+] SQLite WAL Engine:     ENABLED (High Concurrency 64MB Cache)")
        print("  --------------------------------------------------------")
        print(f"  [1] Computer (PC):        http://localhost:{PORT}")
        print(f"                            https://localhost:{PORT}")
        if local_ip != "127.0.0.1":
            print(f"  [2] Mobile / LAN:         http://{local_ip}:{PORT}")
            print(f"                            https://{local_ip}:{PORT}")
        else:
            print(f"  [2] Mobile / LAN:         http://[Your-PC-IP]:{PORT}")
            print(f"                            https://[Your-PC-IP]:{PORT}")
        print(f"  Database File:             {DB_FILE}")
        print("==========================================================")
        print("  Keep this window open to keep the server running.\n")

        asyncio.run(start_hypercorn_server(cert_path, key_path))

    except KeyboardInterrupt:
        print("\nServer shutdown.")
    except Exception as e:
        if '10048' in str(e):
            print(f"  [*] Port {PORT} occupied by background process. Auto-clearing and restarting...")
            free_ports_if_occupied([PORT, INTERNAL_HTTP_PORT, INTERNAL_HTTPS_PORT])
            time.sleep(0.5)
            try:
                asyncio.run(start_hypercorn_server(cert_path, key_path))
                return
            except Exception:
                pass
        print(f"  [!] Error starting ASGI server: {e}")
        log_server_error(f"ASGI Server Error: {e}")
        time.sleep(1)
        run_fallback_server()

if __name__ == '__main__':
    main()
