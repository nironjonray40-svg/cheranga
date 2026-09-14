import os
import sys
import time
import socket
import ssl
import webbrowser
import subprocess
import urllib.request

# Enable Virtual Terminal Processing (ANSI Colors) on Windows
if sys.platform == 'win32':
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass
    os.system('') # Fallback ANSI activator for CMD

# ANSI Color Palette
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"

# Text Colors
GOLD = "\033[38;5;220m"
BRIGHT_CYAN = "\033[1;96m"
CYAN = "\033[96m"
BRIGHT_GREEN = "\033[1;92m"
GREEN = "\033[92m"
BRIGHT_YELLOW = "\033[1;93m"
YELLOW = "\033[93m"
BRIGHT_BLUE = "\033[1;94m"
BLUE = "\033[94m"
BRIGHT_MAGENTA = "\033[1;95m"
MAGENTA = "\033[95m"
BRIGHT_WHITE = "\033[1;97m"
WHITE = "\033[97m"
BRIGHT_RED = "\033[1;91m"
RED = "\033[91m"
GRAY = "\033[90m"

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.environ.get('SCHOOL_DB_PATH', os.path.join(BASE_DIR, 'school.db'))
ERROR_LOG_FILE = os.path.join(BASE_DIR, 'server_errors.log')
VENV_PYTHON = os.path.join(BASE_DIR, '.venv', 'Scripts', 'python.exe')

def get_python_exe():
    if os.path.exists(VENV_PYTHON):
        return VENV_PYTHON
    return sys.executable

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_protocol():
    use_https = os.environ.get('USE_HTTPS', '0').lower() in ['1', 'true', 'yes']
    if use_https:
        cert_path = os.path.join(BASE_DIR, 'cert.pem')
        if os.path.exists(cert_path):
            return "https"
    return "http"

def is_server_running():
    try:
        res = urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/db/meta", timeout=1)
        if res.status == 200:
            return True
    except Exception:
        pass
    try:
        ctx = ssl._create_unverified_context()
        res = urllib.request.urlopen(f"https://127.0.0.1:{PORT}/api/db/meta", context=ctx, timeout=1)
        if res.status == 200:
            return True
    except Exception:
        pass
    return False

def kill_port_process():
    if sys.platform == 'win32':
        try:
            out = subprocess.check_output('netstat -ano', shell=True, text=True, stderr=subprocess.DEVNULL)
            pids = set()
            for line in out.splitlines():
                if re.search(rf':({PORT}|8080|8443)\s', line) and 'LISTENING' in line:
                    parts = line.strip().split()
                    if len(parts) >= 5 and parts[-1].isdigit() and parts[-1] != '0':
                        pids.add(parts[-1])
            for pid in pids:
                subprocess.run(f'taskkill /F /PID {pid}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
        time.sleep(0.4)

def start_server_daemon():
    if not is_server_running():
        kill_port_process()
        py_exe = get_python_exe()
        flags = 0
        if sys.platform == 'win32':
            flags = subprocess.CREATE_NO_WINDOW
        subprocess.Popen([py_exe, 'server.py'], cwd=BASE_DIR, creationflags=flags)
        for _ in range(25):
            if is_server_running():
                break
            time.sleep(0.2)

def restart_server():
    print(f"\n{BRIGHT_YELLOW}[*] Restarting server on Port {PORT}...{RESET}")
    kill_port_process()
    time.sleep(0.5)
    start_server_daemon()
    print(f"{BRIGHT_GREEN}[+] Server successfully restarted and ready!{RESET}\n")
    time.sleep(1)

def get_recent_errors(max_lines=4):
    if not os.path.exists(ERROR_LOG_FILE):
        return []
    try:
        with open(ERROR_LOG_FILE, 'r', encoding='utf-8', errors='replace') as f:
            lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            return lines[-max_lines:]
    except Exception:
        return []

def get_routes():
    proto = get_protocol()
    base_url = f"{proto}://localhost:{PORT}"
    return {
        "1":  ("CMS Website (Public Portal)",         f"{base_url}/",                            "cms.html"),
        "2":  ("ERP Dashboard (School ERP System)",    f"{base_url}/Home",                        "Home.html"),
        "3":  ("Advance Settings (CMS Sync / Control)",f"{base_url}/advance",                     "advance.html"),
        "4":  ("Exam Portal (Exams & Assessment)",    f"{base_url}/exam-portal",                 "exam-portal.html"),
        "5":  ("Seat Plan (Room & Desk Allocation)",  f"{base_url}/seat-plan",                   "seat-plan.html"),
        "6":  ("Admit Card (Print Admit Cards)",      f"{base_url}/Admit%20Card",                "Admit Card.html"),
        "7":  ("Marksheet (Student Marksheets)",      f"{base_url}/Marksheet",                   "Marksheet.html"),
        "8":  ("Tabulation Sheet (Grades/Results)",   f"{base_url}/Tabulation%20Sheet",          "Tabulation Sheet.html"),
        "9":  ("Result Portal (Public Result Search)",f"{base_url}/result-portal",               "result-portal.html"),
        "10": ("Room Seat Topsheet (Seat Summary)",   f"{base_url}/Room%20Seat%20Topshet",       "Room Seat Topshet.html"),
        "11": ("Student Attendance Sheet",            f"{base_url}/Student%20attendance%20sheet", "Student attendance sheet.html"),
        "12": ("Student Data Topsheet",               f"{base_url}/Student%20Data%20Topsheet",   "Student Data Topsheet.html"),
        "13": ("Seating Arrangement Details",         f"{base_url}/Seating%20arrangement%20details", "Seating arrangement details.html"),
        "14": ("Teacher Report (Exam Duties/Summary)",f"{base_url}/Teacher%20Report",            "Teacher Report.html"),
        "15": ("Money Collection (Fee Collection)",   f"{base_url}/Money%20Collect",             "Money Collect.html"),
        "16": ("Fees Management (Fee Structure)",     f"{base_url}/fees",                        "fees.html"),
        "17": ("Notice Board (Official Notices)",     f"{base_url}/notice-board",                "notice-board.html"),
        "18": ("Staff Directory (Teachers & Staff)",  f"{base_url}/staff",                       "staff.html"),
        "19": ("Contact & Messages (Public Inbox)",   f"{base_url}/contact",                     "contact.html"),
        "20": ("Student Portal (Student Records)",     f"{base_url}/student-portal",              "student-portal.html")
    }

def render_dashboard(local_ip):
    os.system('cls' if os.name == 'nt' else 'clear')
    
    server_online = is_server_running()
    status_badge = f"{BRIGHT_GREEN}[SMART DUAL-PROTOCOL (HTTP & HTTPS) ACTIVE]{RESET}" if server_online else f"{BRIGHT_RED}[STOPPED]{RESET}"

    print()
    print(f" {BRIGHT_CYAN}+======================================================================================================+{RESET}")
    print(f" {BRIGHT_CYAN}|{RESET}                                                                                                      {BRIGHT_CYAN}|{RESET}")
    print(f" {BRIGHT_CYAN}|{RESET}            {GOLD}{BOLD}AL-HAJ MOBARAK HOSSAIN ANIRBAN BYDDA TIRTHA M,L HIGH SCHOOL{RESET}                            {BRIGHT_CYAN}|{RESET}")
    print(f" {BRIGHT_CYAN}|{RESET}                 {BRIGHT_WHITE}{BOLD}SMART DUAL-PROTOCOL LOCAL SERVER DASHBOARD (HTTP & HTTPS){RESET}                       {BRIGHT_CYAN}|{RESET}")
    print(f" {BRIGHT_CYAN}|{RESET}                                                                                                      {BRIGHT_CYAN}|{RESET}")
    print(f" {BRIGHT_CYAN}+======================================================================================================+{RESET}")
    print()

    # Network Box
    db_display = DB_FILE if len(DB_FILE) <= 75 else "..." + DB_FILE[-72:]
    db_visible_len = 19 + len(db_display)
    db_pad = " " * max(0, 102 - db_visible_len)

    print(f"  {BRIGHT_YELLOW}+-- [ SERVER & NETWORK STATUS ] -----------------------------------------------------------------------+{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}                                                                                                      {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}   {BRIGHT_WHITE}Server Status :{RESET} {status_badge}  {GRAY}(Dual-Gateway on Port {PORT}){RESET}              {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}   {BRIGHT_WHITE}This PC URL   :{RESET} {BRIGHT_CYAN}http://localhost:{PORT}{RESET}  {GRAY}(Opens CMS Public Website){RESET}                  {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}   {BRIGHT_WHITE}Mobile/LAN URL:{RESET} {BRIGHT_GREEN}http://{local_ip}:{PORT}{RESET}  {GRAY}(Opens CMS for LAN Clients){RESET}               {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}   {BRIGHT_WHITE}Database Path :{RESET} {CYAN}{db_display}{RESET}{db_pad}{BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}   {BRIGHT_WHITE}Zero Warning  :{RESET} {BRIGHT_WHITE}Works in any Mobile/PC browser seamlessly with HTTP or HTTPS!{RESET}            {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}|{RESET}                                                                                                      {BRIGHT_YELLOW}|{RESET}")
    print(f"  {BRIGHT_YELLOW}+------------------------------------------------------------------------------------------------------+{RESET}")
    print()

    # Menu Box with 20 Local Links
    print(f"  {BRIGHT_BLUE}+-- [ DIRECT LOCAL LINKS & TAB NAVIGATION MENU ] ------------------------------------------------------+{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                                                                      {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {GOLD}{BOLD}MAIN PORTALS & ADMIN:{RESET}                               {BRIGHT_MAGENTA}{BOLD}EXAMS, MARKS & SEAT PLANS:{RESET}                    {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[ 1]{RESET} CMS Website (Public Portal)                  {BRIGHT_CYAN}[ 4]{RESET} Exam Portal (Exams & Assessment)         {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[ 2]{RESET} ERP System (Admin/Staff Portal)              {BRIGHT_CYAN}[ 5]{RESET} Seat Plan (Room & Desk Allocation)     {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[ 3]{RESET} Advance Settings (CMS Sync / DB)             {BRIGHT_CYAN}[ 6]{RESET} Admit Card (Print Admit Cards)          {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                    {BRIGHT_CYAN}[ 7]{RESET} Marksheet (Student Marksheets)          {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_GREEN}{BOLD}TOPSHEETS & ATTENDANCE:{RESET}                             {BRIGHT_CYAN}[ 8]{RESET} Tabulation Sheet (Grades/Results)       {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[10]{RESET} Room Seat Topsheet (Seat Summary)          {BRIGHT_CYAN}[ 9]{RESET} Result Portal (Public Result Search)    {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[11]{RESET} Student Attendance Sheet                                                                           {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[12]{RESET} Student Data Topsheet                       {WHITE}{BOLD}ACCOUNTS, NOTICES & STAFF:{RESET}                {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[13]{RESET} Seating Arrangement Details                 {BRIGHT_CYAN}[15]{RESET} Money Collection (Fee Receipts)         {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}   {BRIGHT_CYAN}[14]{RESET} Teacher Report (Exam Duties/Summary)        {BRIGHT_CYAN}[16]{RESET} Fees Management (Fee Structure)         {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                    {BRIGHT_CYAN}[17]{RESET} Notice Board (Official Notices)         {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                    {BRIGHT_CYAN}[18]{RESET} Staff Directory (Teachers & Staff)      {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                    {BRIGHT_CYAN}[19]{RESET} Contact & Messages (Public Inbox)       {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                    {BRIGHT_CYAN}[20]{RESET} Student Portal (Student Records)        {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET}                                                                                                      {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}+------------------------------------------------------------------------------------------------------+{RESET}")
    print(f"  {BRIGHT_BLUE}|{RESET} {BRIGHT_WHITE}[ 0] Open CMS Website{RESET}  {BRIGHT_GREEN}[ L] List All URLs{RESET}  {BRIGHT_YELLOW}[ R] Restart Server{RESET}  {BRIGHT_CYAN}[ C] Clear Logs{RESET}  {BRIGHT_RED}[ X] Exit Launcher{RESET} {BRIGHT_BLUE}|{RESET}")
    print(f"  {BRIGHT_BLUE}+------------------------------------------------------------------------------------------------------+{RESET}")
    print()

    # Errors Box at the Bottom
    errors = get_recent_errors(4)
    print(f"  {BRIGHT_RED}+-- [ LIVE SYSTEM ERRORS & LOGS MONITOR ] -------------------------------------------------------------+{RESET}")
    print(f"  {BRIGHT_RED}|{RESET}                                                                                                      {BRIGHT_RED}|{RESET}")
    if not errors:
        print(f"  {BRIGHT_RED}|{RESET}   {BRIGHT_GREEN}[OK] No active errors detected. System is running smoothly without issues.{RESET}                     {BRIGHT_RED}|{RESET}")
    else:
        for err in errors:
            clean_err = err[:90]
            pad_len = max(0, 90 - len(clean_err))
            padding = " " * pad_len
            print(f"  {BRIGHT_RED}|{RESET}   {BRIGHT_RED}[!] {clean_err}{RESET}{padding} {BRIGHT_RED}|{RESET}")
    print(f"  {BRIGHT_RED}|{RESET}                                                                                                      {BRIGHT_RED}|{RESET}")
    print(f"  {BRIGHT_RED}+------------------------------------------------------------------------------------------------------+{RESET}")
    print()

def show_all_urls(local_ip):
    os.system('cls' if os.name == 'nt' else 'clear')
    proto = get_protocol()
    routes = get_routes()
    print()
    print(f" {BRIGHT_CYAN}+======================================================================================================+{RESET}")
    print(f" {BRIGHT_CYAN}|{RESET}                   {GOLD}{BOLD}COMPLETE LIST OF ALL LOCAL WEBSITE URLs / LINKS (HTTP/2 & HTTP/3){RESET}                 {BRIGHT_CYAN}|{RESET}")
    print(f" {BRIGHT_CYAN}+======================================================================================================+{RESET}")
    print()
    for num, (name, url, html_file) in sorted(routes.items(), key=lambda x: int(x[0])):
        lan_url = url.replace("localhost", local_ip)
        print(f"  {BRIGHT_YELLOW}[{num:>2}]{RESET} {BRIGHT_WHITE}{name:<38}{RESET}")
        print(f"       {BRIGHT_CYAN}Local PC :{RESET} {url}")
        print(f"       {BRIGHT_GREEN}LAN / WiFi:{RESET} {lan_url}")
        print(f"       {GRAY}HTML File :{RESET} {html_file}")
        print(f"  {GRAY}{'-'*98}{RESET}")
    print()
    input(f"  {GOLD}Press Enter to return to main menu...{RESET}")

def main():
    start_server_daemon()
    local_ip = get_local_ip()
    proto = get_protocol()
    routes = get_routes()

    while True:
        render_dashboard(local_ip)
        routes = get_routes()
        try:
            choice = input(f"  {GOLD}>> Enter Option [1-20, 0, L, R, C, X]: {RESET}").strip().upper()
        except (KeyboardInterrupt, EOFError):
            break
        except Exception:
            time.sleep(1)
            continue

        if choice == "X":
            print(f"\n{BRIGHT_RED}Closing Launcher...{RESET}")
            time.sleep(0.5)
            break
        elif choice == "L":
            show_all_urls(local_ip)
        elif choice == "R":
            restart_server()
        elif choice == "C":
            if os.path.exists(ERROR_LOG_FILE):
                try:
                    os.remove(ERROR_LOG_FILE)
                except Exception:
                    pass
            print(f"\n{BRIGHT_GREEN}[+] Error logs cleared!{RESET}")
            time.sleep(0.8)
        elif choice == "0" or choice == "":
            webbrowser.open(f"{proto}://localhost:{PORT}")
        elif choice in routes:
            name, url, _ = routes[choice]
            print(f"\n{BRIGHT_GREEN}[*] Opening: {name}...{RESET}")
            print(f"    {BRIGHT_CYAN}URL:{RESET} {url}")
            webbrowser.open(url)
            time.sleep(0.5)
        else:
            print(f"\n{BRIGHT_RED}[!] Please enter a valid option [1-20, 0, L, R, C, X].{RESET}")
            time.sleep(1.5)

if __name__ == '__main__':
    main()
