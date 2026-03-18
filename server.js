const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '.data', 'lcsw.json');

// ── Ensure .data directory and file exist ──────────────────────
if (!fs.existsSync(path.join(__dirname, '.data'))) {
  fs.mkdirSync(path.join(__dirname, '.data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    sessions: [],
    clients: [],
    supervision: [],
    referrals: [],
    inv_dates: {},
    seeded: false
  }, null, 2));
}

// ── Helpers ────────────────────────────────────────────────────
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { sessions: [], clients: [], supervision: [], referrals: [], inv_dates: {}, seeded: false };
  }
}

function writeDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── API: GET all data ──────────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json(readDB());
});

// ── API: PUT (full replace) for any collection ─────────────────
// Body: { sessions: [...] }  or  { clients: [...] }  etc.
app.put('/api/data', (req, res) => {
  const db = readDB();
  const allowed = ['sessions', 'clients', 'supervision', 'referrals', 'inv_dates', 'seeded'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) db[key] = req.body[key];
  });
  writeDB(db);
  res.json({ ok: true });
});

// ── Catch-all: serve the app ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LCSW Tracker running on port ${PORT}`);
});
