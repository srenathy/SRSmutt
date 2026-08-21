/**
 * BookMyShow Ticket Opening Monitor (Bangalore)
 * 
 * Runs continuously in terminal. When tickets open for the movie:
 * 1. Plays a loud audible alarm tone on Windows speaker.
 * 2. Instantly launches your browser directly to the booking page.
 * 
 * Usage:
 *   node scripts/bms_monitor.js "<YOUR_BOOKMYSHOW_URL>"
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 1. Set your target URL (Movie URL or Specific Cinema URL on BookMyShow)
const TARGET_URL = process.argv[2] || 'https://in.bookmyshow.com/explore/movies-bengaluru';
// 2. Poll interval in milliseconds (3-4 seconds is safe and responsive)
const CHECK_INTERVAL_MS = 3500; 

console.log('====================================================');
console.log(' 🎟️  BookMyShow Ticket Opening Monitor');
console.log('====================================================');
console.log(`Target URL : ${TARGET_URL}`);
console.log(`Polling    : Every ${CHECK_INTERVAL_MS / 1000} seconds`);
console.log('Status     : Monitoring actively... Press Ctrl+C to exit.\n');

let alertTriggered = false;

async function checkStatus() {
  if (alertTriggered) return;

  const timeStr = new Date().toLocaleTimeString('en-IN');

  try {
    // Execute curl with desktop Chrome user-agent headers to bypass basic bot filters
    const cmd = `curl.exe -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" "${TARGET_URL}"`;

    const { stdout } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024 });

    if (!stdout || stdout.length < 500) {
      console.log(`[${timeStr}] Warning: Received short response (possible temporary check). Retrying...`);
      return;
    }

    const html = stdout.toLowerCase();

    // Check if booking buttons or showtimes are available
    const hasBookButton = html.includes('book tickets') || 
                          html.includes('buytickets') || 
                          html.includes('book-button') ||
                          html.includes('data-phase="booking"');

    const isComingSoonOnly = html.includes('coming soon') && !hasBookButton;

    if (hasBookButton || !isComingSoonOnly) {
      alertTriggered = true;
      console.log(`\n🚨 [${timeStr}] SUCCESS! TICKETS ARE NOW OPEN! 🚨`);
      console.log(`Opening browser to: ${TARGET_URL}\n`);

      // Sound initial alarm beep
      exec('powershell -c "[console]::beep(1200, 1000)"');

      // Open URL in default Windows browser (Chrome / Edge)
      exec(`start "" "${TARGET_URL}"`);

      // Keep sounding alarm tones every second so you hear it even if in another room
      let beepCount = 0;
      const timer = setInterval(() => {
        exec('powershell -c "[console]::beep(1000, 400)"');
        beepCount++;
        if (beepCount >= 20) clearInterval(timer);
      }, 700);

    } else {
      console.log(`[${timeStr}] Monitoring... Tickets not yet released.`);
    }

  } catch (err) {
    console.log(`[${timeStr}] Network/Fetch error: ${err.message}`);
  }
}

// Start checking
checkStatus();
setInterval(checkStatus, CHECK_INTERVAL_MS);
