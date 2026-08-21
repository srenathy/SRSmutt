import time
import subprocess
import webbrowser
import sys

# Target BookMyShow movie or theater page URL
TARGET_URL = sys.argv[1] if len(sys.argv) > 1 else "https://in.bookmyshow.com/explore/movies-bengaluru"
CHECK_INTERVAL_SECONDS = 3.5

print("====================================================")
print(" 🎟️  BookMyShow Ticket Opening Monitor (Python)")
print("====================================================")
print(f"Target URL : {TARGET_URL}")
print(f"Check Rate : Every {CHECK_INTERVAL_SECONDS} seconds")
print("Press Ctrl+C to exit.\n")

def check_status():
    cmd = [
        "curl.exe", "-s", "-L",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        TARGET_URL
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        html = result.stdout.lower()
        
        has_book_btn = "book tickets" in html or "buytickets" in html or 'data-phase="booking"' in html
        is_coming_soon = "coming soon" in html and not has_book_btn

        if has_book_btn or not is_coming_soon:
            print(f"\n🚨 [{time.strftime('%H:%M:%S')}] TICKETS ARE OPEN! 🚨")
            print(f"Opening browser to: {TARGET_URL}")

            # Sound alarm
            subprocess.run(["powershell", "-c", "[console]::beep(1200, 1000)"])
            # Open browser
            webbrowser.open(TARGET_URL)

            # Beep loop for 15s
            for _ in range(15):
                subprocess.run(["powershell", "-c", "[console]::beep(1000, 400)"])
                time.sleep(0.5)
            return True
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Monitoring... Tickets not yet released.")
            return False
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Error: {e}")
        return False

while True:
    if check_status():
        break
    time.sleep(CHECK_INTERVAL_SECONDS)
