const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const PORT = 3000;

// Embedded HTML UI
const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toxic Movie - Bengaluru Theater & 3-Seat Booking Monitor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(22, 30, 49, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.35);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.4);
      --warning: #f59e0b;
      --danger: #ef4444;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }

    body {
      background: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.12) 0px, transparent 50%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }

    .container { width: 100%; max-width: 960px; }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--card-border);
    }

    .title-area h1 {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 30%, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .title-area p { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }

    .countdown-badge {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.6rem 1.2rem;
      border-radius: 12px;
      text-align: right;
    }

    .countdown-title { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .countdown-time { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 600; color: #a5b4fc; }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .tip-box {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 12px;
      padding: 0.8rem 1rem;
      margin-bottom: 1.2rem;
      font-size: 0.88rem;
      color: #c7d2fe;
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 140px 140px;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .input-group { display: flex; flex-direction: column; gap: 0.4rem; }

    label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }

    input, select {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }

    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

    .btn-row { display: flex; gap: 0.8rem; align-items: flex-end; }

    button {
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 14px var(--success-glow);
    }
    .btn-success:hover { transform: translateY(-1px); filter: brightness(1.1); }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.12); }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .metric-title { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-value { font-size: 1.5rem; font-weight: 700; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      width: fit-content;
    }

    .status-idle { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }
    .status-active { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-success { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); animation: pulse 1.5s infinite; }

    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .status-active .dot { animation: blink 1s infinite alternate; }

    @keyframes blink { from { opacity: 0.3; } to { opacity: 1; } }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 var(--success-glow); } 70% { box-shadow: 0 0 0 12px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }

    .alert-banner {
      display: none;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.4));
      border: 2px solid #10b981;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
      box-shadow: 0 0 30px var(--success-glow);
    }
    .alert-banner.active { display: block; animation: pulse 1s infinite; }
    .alert-banner h2 { font-size: 1.8rem; color: #ecfdf5; margin-bottom: 0.4rem; }
    .alert-banner p { color: #a7f3d0; margin-bottom: 1rem; }

    /* Theater Cards Section */
    .theater-section { margin-bottom: 1.5rem; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between; }

    .theater-list { display: flex; flex-direction: column; gap: 0.8rem; }
    
    .theater-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }
    .theater-card:hover { border-color: rgba(99, 102, 241, 0.4); background: rgba(22, 30, 49, 0.8); }

    .theater-info h4 { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.3rem; }
    .theater-meta { font-size: 0.82rem; color: var(--text-muted); display: flex; gap: 0.8rem; }

    .showtime-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.4rem; }
    .chip { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }

    .log-container {
      background: #070a12;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
      height: 220px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
    }
    .log-line { margin-bottom: 0.3rem; display: flex; gap: 0.6rem; }
    .log-time { color: #64748b; }
    .log-info { color: #94a3b8; }
    .log-success { color: #34d399; font-weight: 600; }
    .log-warn { color: #fbbf24; }
    .log-err { color: #f87171; }

    .log-container::-webkit-scrollbar { width: 6px; }
    .log-container::-webkit-scrollbar-track { background: transparent; }
    .log-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-area">
        <h1>🎟️ Toxic Movie - Bengaluru Theater & 3-Seat Booking</h1>
        <p>Real-Time Theater Counter, Seat Availability & Auto-Booking Launcher</p>
      </div>
      <div class="countdown-badge">
        <div class="countdown-title">Target: 10:00 AM IST</div>
        <div class="countdown-time" id="countdown">--:--:--</div>
      </div>
    </header>

    <div class="alert-banner" id="successBanner">
      <h2>🎉 TICKETS & THEATERS RELEASED! 🎉</h2>
      <p id="successMsg">BookMyShow has opened ticket sales for Toxic in Bengaluru!</p>
      <button class="btn-success" onclick="bookSeatsNow()" style="font-size: 1.1rem; padding: 0.8rem 2rem;">
        ⚡ Book 3 Seats Immediately
      </button>
    </div>

    <div class="card">
      <div class="tip-box">
        <span>💡</span>
        <div>Select your seat quantity (<strong>3 Seats</strong> pre-set) and paste your BookMyShow Movie URL or specific Theater URL below to monitor live theater count and seat opening.</div>
      </div>

      <div class="controls-grid">
        <div class="input-group">
          <label for="urlInput">BookMyShow Movie or Theater Page URL</label>
          <input type="text" id="urlInput" value="" placeholder="Paste your BookMyShow movie URL here..." />
        </div>
        <div class="input-group">
          <label for="seatQtySelect">Seat Quantity</label>
          <select id="seatQtySelect">
            <option value="1">1 Seat</option>
            <option value="2">2 Seats</option>
            <option value="3" selected>3 Seats (Preset)</option>
            <option value="4">4 Seats</option>
            <option value="5">5 Seats</option>
          </select>
        </div>
        <div class="input-group">
          <label for="intervalSelect">Check Rate</label>
          <select id="intervalSelect">
            <option value="3000" selected>Every 3s</option>
            <option value="4000">Every 4s</option>
            <option value="5000">Every 5s</option>
          </select>
        </div>
      </div>

      <div class="btn-row">
        <button id="startBtn" class="btn-primary" onclick="startMonitoring()">
          ▶ Start Live Monitoring
        </button>
        <button id="stopBtn" class="btn-danger" onclick="stopMonitoring()" disabled>
          ⏹ Stop
        </button>
        <button class="btn-secondary" onclick="testAlarm()">
          🔔 Test Siren Sound
        </button>
        <button class="btn-success" onclick="bookSeatsNow()" style="margin-left: auto;">
          ⚡ Quick 3-Seat Booking Link
        </button>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-title">Live Status</span>
        <div id="statusBadge" class="status-badge status-idle">
          <span class="dot"></span>
          <span id="statusText">READY</span>
        </div>
      </div>
      <div class="metric-card">
        <span class="metric-title">Total Theaters Found</span>
        <span class="metric-value" id="theaterCount" style="color: #60a5fa;">0</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">Selected Seat Count</span>
        <span class="metric-value" id="selectedSeatsVal" style="color: #34d399;">3 Seats</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">Total Checks</span>
        <span class="metric-value" id="checkCount">0</span>
      </div>
    </div>

    <!-- Live Theaters List -->
    <div class="card theater-section">
      <div class="section-title">
        <span>🏛️ Bengaluru Theaters List</span>
        <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);" id="lastCheckTime">Not checked yet</span>
      </div>
      <div class="theater-list" id="theaterList">
        <div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 1.5rem;">
          Start monitoring to display live theaters, available showtimes, and seat categories.
        </div>
      </div>
    </div>

    <div class="card" style="padding: 1.2rem;">
      <div class="log-header">
        <label>Activity Stream Log</label>
        <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="clearLogs()">Clear Log</button>
      </div>
      <div class="log-container" id="logContainer">
        <div class="log-line">
          <span class="log-time">[System]</span>
          <span class="log-info">Monitor configured for 3 Seats. Paste BookMyShow URL and click "Start Live Monitoring".</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    let timer = null;
    let checkCount = 0;
    let isRunning = false;
    let audioCtx = null;
    let alarmInterval = null;

    document.getElementById('seatQtySelect').addEventListener('change', (e) => {
      document.getElementById('selectedSeatsVal').innerText = e.target.value + ' Seats';
    });

    function updateCountdown() {
      const now = new Date();
      const target = new Date();
      target.setHours(10, 0, 0, 0);

      let diff = target - now;
      if (diff < 0) {
        document.getElementById('countdown').innerText = '10:00 AM Passed';
        return;
      }

      const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

      document.getElementById('countdown').innerText = \`\${hrs}:\${mins}:\${secs}\`;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    function log(msg, type = 'info') {
      const logContainer = document.getElementById('logContainer');
      const timeStr = new Date().toLocaleTimeString('en-IN');
      const line = document.createElement('div');
      line.className = 'log-line';

      let typeClass = 'log-info';
      if (type === 'success') typeClass = 'log-success';
      if (type === 'warn') typeClass = 'log-warn';
      if (type === 'error') typeClass = 'log-err';

      line.innerHTML = \`<span class="log-time">[\${timeStr}]</span> <span class="\${typeClass}">\${msg}</span>\`;
      logContainer.appendChild(line);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    function clearLogs() {
      document.getElementById('logContainer').innerHTML = '';
      log('Logs cleared.', 'info');
    }

    function playAudioAlarm() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = i % 2 === 0 ? 'sine' : 'square';
            osc.frequency.setValueAtTime(i % 2 === 0 ? 900 : 1300, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
          }, i * 300);
        }
      } catch (e) {
        console.error('Audio siren error:', e);
      }
    }

    function testAlarm() {
      log('Testing audio siren tone...', 'warn');
      playAudioAlarm();
    }

    function bookSeatsNow(targetUrl) {
      const url = targetUrl || document.getElementById('urlInput').value.trim();
      const seats = document.getElementById('seatQtySelect').value;

      if (!url) {
        alert('Please paste a BookMyShow URL first!');
        return;
      }

      // Append 3 seats parameter to BMS booking URL
      let finalUrl = url;
      if (finalUrl.includes('?')) {
        finalUrl += \`&qty=\${seats}\`;
      } else {
        finalUrl += \`?qty=\${seats}\`;
      }

      log(\`Opening \${seats} Seats booking link: \${finalUrl}\`, 'success');
      window.open(finalUrl, '_blank');
    }

    function updateTheaterList(theaters) {
      const listContainer = document.getElementById('theaterList');
      document.getElementById('theaterCount').innerText = theaters.length;

      if (theaters.length === 0) {
        listContainer.innerHTML = \`<div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 1.5rem;">No active theaters listed yet. Monitoring continuously...</div>\`;
        return;
      }

      const seats = document.getElementById('seatQtySelect').value;

      listContainer.innerHTML = theaters.map(t => \`
        <div class="theater-card">
          <div class="theater-info">
            <h4>🏛️ \${t.name}</h4>
            <div class="theater-meta">
              <span>📍 \${t.location || 'Bengaluru'}</span>
              <span>⚡ Status: <strong style="color: #34d399;">Available</strong></span>
            </div>
            \${t.showtimes && t.showtimes.length > 0 ? \`
              <div class="showtime-chips">
                \${t.showtimes.map(st => \`<span class="chip">\${st}</span>\`).join('')}
              </div>
            \` : ''}
          </div>
          <button class="btn-success" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="bookSeatsNow('\${t.url || ''}')">
            ⚡ Book \${seats} Seats
          </button>
        </div>
      \`).join('');
    }

    async function runCheck() {
      if (!isRunning) return;

      const targetUrl = document.getElementById('urlInput').value.trim();
      if (!targetUrl) {
        log('Please paste a BookMyShow URL in the box above.', 'error');
        stopMonitoring();
        return;
      }

      checkCount++;
      document.getElementById('checkCount').innerText = checkCount;
      document.getElementById('lastCheckTime').innerText = new Date().toLocaleTimeString('en-IN');

      try {
        const response = await fetch(\`/api/check?url=\${encodeURIComponent(targetUrl)}\`);
        const data = await response.json();

        if (data.theaters) {
          updateTheaterList(data.theaters);
        }

        if (data.isAvailable) {
          stopMonitoring();
          document.getElementById('statusBadge').className = 'status-badge status-success';
          document.getElementById('statusText').innerText = '🎉 TICKETS OPEN!';
          document.getElementById('successBanner').classList.add('active');

          const qty = document.getElementById('seatQtySelect').value;
          document.getElementById('successMsg').innerText = \`BookMyShow opened ticket sales! Ready to book \${qty} seats across \${data.theaterCount || 1} theaters.\`;

          log(\`🚨 TICKETS ARE OPEN across \${data.theaterCount || 1} theaters! Opening \${qty} seats booking...\`, 'success');
          
          playAudioAlarm();
          alarmInterval = setInterval(playAudioAlarm, 2200);

          bookSeatsNow();
        } else {
          log(\`Check #\${checkCount}: Waiting... (\${data.statusText || 'Tickets not released yet'})\`, 'info');
        }
      } catch (err) {
        log(\`Connection error checking BMS: \${err.message}\`, 'error');
      }
    }

    function startMonitoring() {
      const targetUrl = document.getElementById('urlInput').value.trim();
      if (!targetUrl) {
        alert('Please paste the BookMyShow URL from your browser tab first!');
        return;
      }

      if (isRunning) return;
      
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      isRunning = true;
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = false;
      document.getElementById('statusBadge').className = 'status-badge status-active';
      document.getElementById('statusText').innerText = 'MONITORING';
      document.getElementById('successBanner').classList.remove('active');

      const intervalMs = parseInt(document.getElementById('intervalSelect').value, 10) || 3000;
      log(\`Started live monitoring every \${intervalMs / 1000}s for 3 Seats...\`, 'warn');

      runCheck();
      timer = setInterval(runCheck, intervalMs);
    }

    function stopMonitoring() {
      isRunning = false;
      if (timer) clearInterval(timer);
      if (alarmInterval) clearInterval(alarmInterval);

      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;
      
      if (document.getElementById('statusText').innerText !== '🎉 TICKETS OPEN!') {
        document.getElementById('statusBadge').className = 'status-badge status-idle';
        document.getElementById('statusText').innerText = 'STOPPED';
        log('Monitoring paused.', 'warn');
      }
    }
  </script>
</body>
</html>
`;

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_PAGE);
    return;
  }

  if (parsedUrl.pathname === '/api/check') {
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }

    try {
      const cmd = `curl.exe -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" "${targetUrl}"`;

      const { stdout } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024 });
      const html = (stdout || '').toLowerCase();

      // Extract Theater Names & Showtimes if available in BMS HTML
      const theaters = [];
      const venueMatches = html.match(/class="[^"]*venue-name[^"]*"[^>]*>([^<]+)</gi) || [];
      const showtimeMatches = html.match(/\b(0[1-9]|1[0-2]):[0-5][0-9]\s*(am|pm)\b/gi) || [];

      venueMatches.forEach((vMatch, idx) => {
        const cleanName = vMatch.replace(/<[^>]+>/g, '').trim();
        if (cleanName) {
          theaters.push({
            name: cleanName,
            location: 'Bengaluru',
            showtimes: showtimeMatches.slice(idx * 3, (idx + 1) * 3),
            url: targetUrl
          });
        }
      });

      const hasBookButton = html.includes('book tickets') || 
                            html.includes('/buytickets/') || 
                            html.includes('book-button') ||
                            html.includes('data-phase="booking"');

      const isComingSoon = html.includes('coming soon') || html.includes('interested');
      const isAvailable = hasBookButton && !isComingSoon;

      if (isAvailable) {
        exec('powershell -c "[console]::beep(1200, 800)"');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isAvailable,
        statusText: isAvailable ? 'Tickets Released!' : 'Tickets not yet open',
        theaters,
        theaterCount: theaters.length,
        timestamp: new Date().toLocaleTimeString('en-IN')
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ isAvailable: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(` 🎟️  BookMyShow Monitor Dashboard Running!`);
  console.log(` 🌐  Local Access URL: http://localhost:${PORT}`);
  console.log('====================================================\n');
});
