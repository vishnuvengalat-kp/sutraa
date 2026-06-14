/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   SUTRA – Smart Utility for Tactical Reference           ║
 * ║          & Assistance  |  Kerala Police                  ║
 * ║   Backend Server  –  Node.js (no npm needed)             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * HOW TO RUN:
 *   1. Open this folder in your computer
 *   2. Double-click  start_sutra.bat  (Windows)
 *      OR open Terminal and type:  node server.js
 *   3. Open your browser and go to:  http://localhost:3000
 *   4. Share this address with other computers on same WiFi:
 *      http://YOUR-COMPUTER-IP:3000
 */

const http   = require('http');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const url    = require('url');

// ── CONFIGURATION ─────────────────────────────────────────
const PORT       = 3000;
const API_KEY    = process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE';
const MODEL      = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;
// ──────────────────────────────────────────────────────────

// MIME types for serving static files
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

// ── Helper: read request body ──
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end',  ()    => { resolve(data); });
    req.on('error', reject);
  });
}

// ── Helper: call Anthropic API ──
function callClaude(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages:   messages,
    });

    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed);
        } catch(e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HTTP Server ──
const server = http.createServer(async (req, res) => {
  const parsed  = url.parse(req.url, true);
  const reqPath = parsed.pathname;

  // CORS headers (so the browser page can talk to this server)
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API Route: /analyse ──────────────────────────────────
  if (reqPath === '/analyse' && req.method === 'POST') {
    try {
      const bodyText = await readBody(req);
      const { statement } = JSON.parse(bodyText);

      if (!statement || statement.trim().length < 20) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Statement too short. Please provide more details.' }));
        return;
      }

      const systemPrompt = `You are a senior legal expert in Indian criminal law advising Kerala Police officers.
Analyse First Information Statements and respond ONLY with valid JSON — no markdown, no preamble, no explanation.
You know all current Indian laws including BNS 2023, BNSS 2023, BSA 2023 (replacing IPC, CrPC, Evidence Act),
POCSO, SC/ST Act, Domestic Violence Act, IT Act, NDPS, Motor Vehicles Act, Arms Act, Excise Act, and all Kerala state laws.`;

      const userPrompt = `Analyse this First Information Statement and respond ONLY with this exact JSON structure:

First Information Statement:
"${statement.trim()}"

{
  "summary": "2-3 sentence plain English summary of the alleged offence and key facts",
  "offence_type": "e.g. Violent Crime / Property Crime / Cyber Crime / Drug Offence / etc.",
  "cognizable": true,
  "bailable": false,
  "sections": [
    {
      "code": "BNS Section 115(2)",
      "name": "Voluntarily causing grievous hurt",
      "law": "Bharatiya Nyaya Sanhita 2023",
      "old_ref": "IPC Section 325",
      "priority": "primary",
      "punishment": "Up to 7 years imprisonment and fine",
      "description": "Specific reason this section applies to this case"
    }
  ],
  "checklist": [
    {
      "phase": "Immediate Action (within 1 hour)",
      "items": [
        { "task": "Specific duty to perform", "urgent": true }
      ]
    },
    {
      "phase": "Investigation Steps (within 24 hours)",
      "items": [
        { "task": "Specific investigation step", "urgent": false }
      ]
    },
    {
      "phase": "Documentation & Court Procedures",
      "items": [
        { "task": "Documentation task", "urgent": false }
      ]
    }
  ],
  "important_notes": ["Any special note 1", "Any special note 2"]
}

Rules:
- 4 to 8 sections, mixing primary/secondary/minor priorities
- Include BNS 2023 section numbers (new law). Note old IPC equivalent in old_ref field
- Include relevant special acts if applicable (POCSO if minor victim, DV Act for domestic, SC/ST Act if applicable, etc.)
- 12 to 18 checklist items total, specific to this exact type of case
- cognizable and bailable should reflect the most serious primary offence
- punishment field: brief, plain English
- important_notes: 1-3 special warnings or reminders for this case type (e.g. "Victim is a minor — POCSO provisions mandatory")
- All text in plain simple English suitable for a police trainee`;

      const claudeResponse = await callClaude(
        [{ role: 'user', content: userPrompt }],
        systemPrompt
      );

      const rawText = (claudeResponse.content || [])
        .map(b => b.text || '')
        .join('');

      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const result  = JSON.parse(cleaned);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));

    } catch(err) {
      console.error('Analysis error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Analysis failed: ' + err.message }));
    }
    return;
  }

  // ── Static File Server ────────────────────────────────────
  // Serve sutra.html at root
  let filePath = (reqPath === '/' || reqPath === '/index.html')
    ? path.join(__dirname, 'sutra.html')
    : path.join(__dirname, reqPath);

  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found: ' + reqPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   SUTRA Server – Kerala Police                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║   Local access:    http://localhost:${PORT}          ║`);
  console.log('║   Network access:  http://[YOUR-IP]:' + PORT + '          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('║  ⚠️  WARNING: API key not set!                    ║');
    console.log('║     Set it in server.js or run:                  ║');
    console.log('║     ANTHROPIC_API_KEY=sk-... node server.js      ║');
  } else {
    console.log('║   ✅ API key loaded. Server ready.               ║');
  }
  console.log('╚══════════════════════════════════════════════════╝\n');
});
