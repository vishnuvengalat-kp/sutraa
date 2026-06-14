/**
 * SUTRA – Smart Utility for Tactical Reference & Assistance
 * Kerala Police | Single File Version
 *
 * This ONE file runs the entire SUTRA application.
 * No other files needed.
 *
 * SETUP:
 *   1. Set your API key in Render.com environment variables:
 *      Key:   ANTHROPIC_API_KEY
 *      Value: your key starting with sk-ant-...
 *   2. Set start command to:  node server.js
 */

const http  = require('http');
const https = require('https');
const url   = require('url');

const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

// ─── The entire SUTRA web app as HTML ───────────────────────
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>SUTRA – Kerala Police</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
:root {
  --navy:#0B1E3D; --navy-mid:#112848; --gold:#C9A84C; --gold-light:#E8C86A;
  --gold-dim:#8A6F32; --khaki:#D4C49A; --red:#E84545; --green:#3DBE7A;
  --white:#F4F0E8; --grey:#8A96A8; --card:#0E2444; --border:rgba(201,168,76,0.25);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--navy);color:var(--white);font-family:'Inter',sans-serif;min-height:100vh;}

/* HEADER */
header{background:linear-gradient(135deg,#060F1E,var(--navy-mid));border-bottom:2px solid var(--gold);
  padding:14px 20px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:100;
  box-shadow:0 4px 24px rgba(0,0,0,0.5);}
.logo{width:48px;height:48px;flex-shrink:0;}
.header-text h1{font-family:'Rajdhani',sans-serif;font-size:1.7rem;font-weight:700;color:var(--gold);letter-spacing:0.12em;line-height:1;}
.header-text p{font-size:0.62rem;color:var(--khaki);letter-spacing:0.18em;text-transform:uppercase;margin-top:3px;}
.header-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
.badge{background:rgba(201,168,76,0.12);border:1px solid var(--gold-dim);color:var(--gold-light);
  font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:600;letter-spacing:0.1em;
  padding:4px 10px;border-radius:4px;text-transform:uppercase;}
.btn-print{background:transparent;border:1.5px solid var(--gold-dim);color:var(--gold);
  font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:600;letter-spacing:0.08em;
  padding:6px 14px;border-radius:6px;cursor:pointer;display:none;align-items:center;gap:6px;transition:all 0.2s;}
.btn-print.show{display:flex;}

/* LAYOUT */
main{max-width:860px;margin:0 auto;padding:24px 16px 60px;}
.thread-step{display:flex;gap:16px;align-items:flex-start;}
.spine{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:32px;}
.node{width:32px;height:32px;border-radius:50%;background:var(--navy-mid);border:2px solid var(--gold);
  display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;
  font-weight:700;font-size:0.85rem;color:var(--gold);flex-shrink:0;transition:all 0.3s;}
.node.on{background:var(--gold);color:var(--navy);box-shadow:0 0 16px rgba(201,168,76,0.5);}
.line{width:2px;flex:1;min-height:24px;background:linear-gradient(to bottom,var(--gold-dim),transparent);margin:4px 0;}
.content{flex:1;padding-bottom:28px;}
.step-title{font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:700;
  color:var(--gold-light);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px;display:block;}

/* CARD */
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:10px;}
.clabel{font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:600;letter-spacing:0.2em;
  text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px;}

/* INPUT */
textarea{width:100%;min-height:180px;background:rgba(255,255,255,0.04);border:1.5px solid var(--border);
  border-radius:8px;color:var(--white);font-family:'Inter',sans-serif;font-size:0.95rem;
  line-height:1.7;padding:14px;resize:vertical;outline:none;transition:border-color 0.2s;}
textarea:focus{border-color:var(--gold);}
textarea::placeholder{color:var(--grey);font-style:italic;}
.hint{font-size:0.75rem;color:var(--grey);margin-top:8px;line-height:1.5;}

/* BUTTONS */
.btn-go{margin-top:16px;width:100%;padding:16px;
  background:linear-gradient(135deg,var(--gold),var(--gold-dim));border:none;border-radius:10px;
  color:var(--navy);font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:700;
  letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;
  display:flex;align-items:center;justify-content:center;gap:10px;
  box-shadow:0 4px 20px rgba(201,168,76,0.25);}
.btn-go:disabled{background:linear-gradient(135deg,#4A3F24,#2E2515);color:#7A6D4A;cursor:not-allowed;box-shadow:none;}
.btn-new{width:100%;padding:12px;margin-top:12px;background:transparent;border:1.5px solid var(--border);
  border-radius:8px;color:var(--gold);font-family:'Rajdhani',sans-serif;font-size:1rem;
  font-weight:600;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;}

/* LOADING */
.loading{display:none;text-align:center;padding:32px 20px;}
.spinner{width:44px;height:44px;border:3px solid rgba(201,168,76,0.2);border-top-color:var(--gold);
  border-radius:50%;animation:spin 0.9s linear infinite;margin:0 auto 14px;}
@keyframes spin{to{transform:rotate(360deg);}}
.ltxt{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:600;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;}
.lsub{font-size:0.78rem;color:var(--grey);margin-top:6px;}

/* RESULT PANELS */
.panel{display:none;}
.summary-box{background:rgba(201,168,76,0.07);border:1px solid var(--border);border-radius:8px;
  padding:14px 16px;font-size:0.88rem;color:var(--khaki);line-height:1.7;margin-bottom:12px;}

/* META PILLS */
.meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
.pill{font-family:'Rajdhani',sans-serif;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;
  text-transform:uppercase;padding:4px 12px;border-radius:20px;border:1px solid;}
.p-cog{background:rgba(232,69,69,0.12);border-color:rgba(232,69,69,0.35);color:#E87575;}
.p-ncog{background:rgba(138,150,168,0.1);border-color:rgba(138,150,168,0.3);color:var(--grey);}
.p-bail{background:rgba(61,190,122,0.1);border-color:rgba(61,190,122,0.3);color:var(--green);}
.p-nbail{background:rgba(232,69,69,0.1);border-color:rgba(232,69,69,0.3);color:var(--red);}
.p-type{background:rgba(201,168,76,0.1);border-color:var(--border);color:var(--gold);}

/* NOTES */
.notes{display:flex;flex-direction:column;gap:6px;margin-top:10px;}
.note{background:rgba(232,69,69,0.07);border:1px solid rgba(232,69,69,0.2);border-left:3px solid var(--red);
  border-radius:6px;padding:8px 12px;font-size:0.82rem;color:#E87575;line-height:1.5;}

/* SECTIONS */
.sec-grid{display:flex;flex-direction:column;gap:10px;margin-top:4px;}
.sec{background:rgba(255,255,255,0.03);border:1px solid rgba(201,168,76,0.2);border-left:3px solid var(--gold);border-radius:8px;padding:12px 14px;}
.sec.primary{border-left-color:var(--red);}
.sec.minor{border-left-color:var(--grey);}
.ptag{display:inline-block;font-size:0.6rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;
  padding:2px 7px;border-radius:3px;margin-bottom:8px;}
.tp{background:rgba(232,69,69,0.15);color:var(--red);border:1px solid rgba(232,69,69,0.3);}
.ts{background:rgba(201,168,76,0.12);color:var(--gold);border:1px solid var(--border);}
.tm{background:rgba(138,150,168,0.1);color:var(--grey);border:1px solid rgba(138,150,168,0.2);}
.sec-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:4px;flex-wrap:wrap;}
.scode{font-family:'JetBrains Mono',monospace;font-size:0.8rem;font-weight:500;color:var(--gold);
  background:rgba(201,168,76,0.1);padding:2px 8px;border-radius:4px;white-space:nowrap;}
.sec.primary .scode{color:var(--red);background:rgba(232,69,69,0.1);}
.sname{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:600;color:var(--white);}
.slaw{font-size:0.7rem;color:var(--gold-dim);margin-bottom:4px;font-style:italic;}
.sold{font-size:0.7rem;color:var(--grey);margin-bottom:6px;}
.spun{font-size:0.75rem;color:var(--red);margin-bottom:6px;font-weight:500;}
.sdesc{font-size:0.82rem;color:var(--khaki);line-height:1.6;}

/* CHECKLIST */
.checklist{display:flex;flex-direction:column;gap:8px;margin-top:4px;}
.phase{margin-bottom:4px;}
.plabel{font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:600;letter-spacing:0.15em;
  text-transform:uppercase;color:var(--gold-dim);padding:10px 0 6px;
  border-bottom:1px solid rgba(201,168,76,0.1);margin-bottom:8px;}
.chk{display:flex;align-items:flex-start;gap:12px;padding:10px 12px;
  background:rgba(255,255,255,0.025);border-radius:7px;cursor:pointer;transition:background 0.15s;}
.chk:hover{background:rgba(201,168,76,0.06);}
.chk.done{opacity:0.55;}
.chk.done .ctxt{text-decoration:line-through;}
.cbox{width:22px;height:22px;border:2px solid var(--gold-dim);border-radius:5px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;margin-top:1px;transition:all 0.15s;}
.chk.done .cbox{background:var(--green);border-color:var(--green);}
.ctick{display:none;color:white;font-size:0.75rem;font-weight:700;}
.chk.done .ctick{display:block;}
.ctxt{font-size:0.88rem;color:var(--white);line-height:1.55;flex:1;}
.curg{font-size:0.6rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--red);
  background:rgba(232,69,69,0.1);border:1px solid rgba(232,69,69,0.25);
  padding:2px 6px;border-radius:3px;white-space:nowrap;margin-top:3px;display:inline-block;}

/* PROGRESS */
.prog-row{display:flex;justify-content:space-between;align-items:center;margin-top:10px;}
.prog-bar{height:4px;background:rgba(255,255,255,0.07);border-radius:2px;margin-top:8px;overflow:hidden;}
.prog-fill{height:100%;background:linear-gradient(to right,var(--gold-dim),var(--green));border-radius:2px;transition:width 0.3s;}
.prog-txt{font-size:0.75rem;color:var(--grey);}
.prog-num{font-family:'JetBrains Mono',monospace;font-size:0.78rem;color:var(--gold);}

/* DISCLAIMER / ERROR */
.disc{background:rgba(232,69,69,0.06);border:1px solid rgba(232,69,69,0.2);border-radius:8px;
  padding:12px 14px;font-size:0.75rem;color:#E87575;line-height:1.6;margin-top:10px;display:flex;gap:8px;}
.err{background:rgba(232,69,69,0.08);border:1px solid rgba(232,69,69,0.3);border-radius:8px;
  padding:14px;color:#E87575;font-size:0.85rem;line-height:1.6;display:none;margin-top:12px;gap:8px;}

/* PRINT */
.print-hdr{display:none;}
.print-ftr{display:none;}
.pbox{display:none;}

@media print{
  @page{size:A4;margin:18mm 16mm 18mm 20mm;}
  body{background:white!important;color:#111!important;font-size:10pt;}
  header,.btn-go,.btn-new,.btn-print,textarea,.hint,.loading,.cbox,.ctick,.disc,
  .spine,.prog-bar,.prog-row,#step1,.err{display:none!important;}
  main{padding:0!important;max-width:100%!important;}
  .print-hdr{display:block!important;text-align:center;border-bottom:2.5pt solid #8B6914;padding-bottom:10pt;margin-bottom:14pt;}
  .print-hdr h1{font-size:18pt;font-weight:900;color:#8B6914;letter-spacing:0.1em;}
  .print-hdr h2{font-size:8pt;color:#555;letter-spacing:0.15em;text-transform:uppercase;}
  .print-hdr .pm{font-size:8pt;color:#444;margin-top:6pt;}
  .print-hdr .pd{height:1pt;background:#ddd;margin:6pt 0;}
  .card{background:white!important;border:1pt solid #ccc!important;border-radius:4pt!important;padding:10pt!important;margin-top:8pt!important;page-break-inside:avoid;}
  .clabel{color:#8B6914!important;font-size:7pt!important;}
  .thread-step{display:block!important;}
  .content{padding-bottom:0!important;}
  .step-title{color:#222!important;font-size:11pt!important;margin-bottom:4pt;}
  .summary-box{background:#FAFAF5!important;border:1pt solid #ddd!important;color:#222!important;font-size:9.5pt!important;padding:8pt!important;}
  .pill{border:1pt solid #999!important;color:#333!important;background:#f5f5f5!important;font-size:7pt!important;}
  .sec{border:1pt solid #ccc!important;background:white!important;padding:8pt!important;margin-bottom:6pt;page-break-inside:avoid;}
  .sec.primary{border-left:3pt solid #CC3333!important;}
  .sec.secondary{border-left:3pt solid #8B6914!important;}
  .sec.minor{border-left:3pt solid #999!important;}
  .scode{background:#f0f0f0!important;color:#333!important;font-size:8pt!important;}
  .sname{color:#111!important;font-size:10pt!important;}
  .slaw{color:#666!important;} .sold{color:#888!important;} .spun{color:#AA2222!important;}
  .sdesc{color:#333!important;font-size:9pt!important;}
  .ptag{border:1pt solid #999!important;color:#333!important;background:#f0f0f0!important;font-size:7pt!important;}
  .plabel{color:#8B6914!important;border-bottom:0.5pt solid #ddd!important;font-size:8pt!important;}
  .chk{background:white!important;border:none!important;padding:4pt 0!important;border-bottom:0.5pt solid #eee!important;display:flex!important;gap:8pt!important;}
  .ctxt{color:#222!important;font-size:9pt!important;}
  .curg{color:#CC3333!important;background:#FFF0F0!important;border:0.5pt solid #FFAAAA!important;font-size:7pt!important;}
  .pbox{display:inline-block!important;width:10pt;height:10pt;border:1pt solid #666;border-radius:2pt;flex-shrink:0;margin-top:1pt;}
  .note{background:#FFF8F8!important;border-color:#FFCCCC!important;color:#AA2222!important;font-size:9pt!important;}
  .panel{display:block!important;}
  .print-ftr{display:block!important;margin-top:16pt;border-top:1pt solid #ccc;padding-top:8pt;font-size:7pt;color:#888;text-align:center;}
}
</style>
</head>
<body>

<div class="print-hdr">
  <h1>SUTRA</h1>
  <h2>Smart Utility for Tactical Reference &amp; Assistance &nbsp;|&nbsp; Kerala Police</h2>
  <div class="pd"></div>
  <div class="pm">Case Analysis Report &nbsp;|&nbsp; Generated: <span id="pdate"></span> &nbsp;|&nbsp; <strong>CONFIDENTIAL – FOR OFFICIAL USE ONLY</strong></div>
  <div class="pd"></div>
  <div class="pm" style="font-style:italic" id="pstmt"></div>
</div>

<header>
  <svg class="logo" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#C9A84C" stroke-width="2"/>
    <circle cx="24" cy="24" r="17" stroke="#C9A84C" stroke-width="1" stroke-dasharray="2 3"/>
    <polygon points="24,8 27,19 38,19 29,26 32,37 24,30 16,37 19,26 10,19 21,19" fill="#C9A84C" opacity="0.9"/>
    <circle cx="24" cy="24" r="3" fill="#0B1E3D" stroke="#C9A84C" stroke-width="1.5"/>
  </svg>
  <div class="header-text">
    <h1>SUTRA</h1>
    <p>Smart Utility for Tactical Reference &amp; Assistance</p>
  </div>
  <div class="header-right">
    <button class="btn-print" id="printBtn" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Print Report
    </button>
    <div class="badge">Kerala Police</div>
  </div>
</header>

<main>

  <!-- STEP 1: INPUT -->
  <div class="thread-step" id="step1">
    <div class="spine">
      <div class="node on" id="n1">1</div>
      <div class="line"></div>
    </div>
    <div class="content">
      <span class="step-title">Enter First Information Statement</span>
      <div class="card">
        <div class="clabel">Complaint / FIS Details</div>
        <textarea id="firInput" placeholder="Describe the incident in your own words...

Example: On 12/06/2026 at around 9 PM, complainant states that accused Raju entered her house without permission, threatened her with a knife demanding money, and slapped her causing injury. Neighbours witnessed the incident."></textarea>
        <div class="hint">📝 Include: what happened, when, where, who was involved, weapons used, injuries, witnesses.</div>
        <div class="err" id="errBox"><span>⚠️</span><span id="errMsg"></span></div>
        <button class="btn-go" id="goBtn" onclick="analyse()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Analyse &amp; Suggest Sections
        </button>
      </div>
    </div>
  </div>

  <!-- STEP 2: ANALYSIS -->
  <div class="thread-step">
    <div class="spine">
      <div class="node" id="n2">2</div>
      <div class="line"></div>
    </div>
    <div class="content">
      <span class="step-title">AI Legal Analysis</span>
      <div class="card loading" id="loading">
        <div class="spinner"></div>
        <div class="ltxt">Analysing Statement…</div>
        <div class="lsub">Matching sections from BNS 2023, BNSS 2023 and all Indian laws</div>
      </div>
      <div class="card panel" id="summaryPanel">
        <div class="clabel">Case Summary &amp; Classification</div>
        <div class="meta" id="metaPills"></div>
        <div class="summary-box" id="summaryTxt"></div>
        <div class="notes" id="notesList"></div>
        <div class="disc"><span>⚠️</span><span>AI-generated reference only. Always verify with your supervising officer before registering FIR.</span></div>
      </div>
    </div>
  </div>

  <!-- STEP 3: SECTIONS -->
  <div class="thread-step">
    <div class="spine">
      <div class="node" id="n3">3</div>
      <div class="line"></div>
    </div>
    <div class="content">
      <span class="step-title">Applicable Legal Sections</span>
      <div class="card panel" id="secPanel">
        <div class="clabel">Suggested Charges &amp; Provisions</div>
        <div class="sec-grid" id="secGrid"></div>
      </div>
    </div>
  </div>

  <!-- STEP 4: CHECKLIST -->
  <div class="thread-step">
    <div class="spine">
      <div class="node" id="n4">4</div>
      <div class="line" style="background:transparent"></div>
    </div>
    <div class="content">
      <span class="step-title">Duty Checklist</span>
      <div class="card panel" id="chkPanel">
        <div class="clabel">Procedures &amp; Officer Duties</div>
        <div class="prog-row">
          <span class="prog-txt">Tap items to mark complete</span>
          <span class="prog-num" id="progNum">0 / 0</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" id="progFill" style="width:0%"></div></div>
        <div class="checklist" id="chkList" style="margin-top:16px"></div>
        <button class="btn-new" onclick="reset()">＋ New Case Analysis</button>
      </div>
    </div>
  </div>

</main>

<div class="print-ftr">
  SUTRA – Smart Utility for Tactical Reference &amp; Assistance &nbsp;|&nbsp; Kerala Police &nbsp;|&nbsp;
  AI-generated reference. Verify all provisions before official use. &nbsp;|&nbsp; <span id="pfdate"></span>
</div>

<script>
let items=[], done=new Set(), lastStmt='';

async function analyse(){
  const stmt = document.getElementById('firInput').value.trim();
  if(stmt.length < 30){ showErr('Please write more details about the incident.'); return; }
  hideErr();
  lastStmt = stmt;
  setLoad(true);
  try{
    const r = await fetch('/analyse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({statement:stmt})});
    const d = await r.json();
    if(!r.ok || d.error) throw new Error(d.error || 'Server error');
    setLoad(false);
    render(d);
  }catch(e){
    setLoad(false);
    showErr(e.message || 'Could not connect. Please try again.');
  }
}

function render(d){
  ['n2','n3','n4'].forEach(id=>document.getElementById(id).classList.add('on'));

  // Pills
  const mp = document.getElementById('metaPills'); mp.innerHTML='';
  if(d.offence_type) addPill(mp,d.offence_type,'p-type');
  addPill(mp, d.cognizable?'Cognizable':'Non-Cognizable', d.cognizable?'p-cog':'p-ncog');
  addPill(mp, d.bailable?'Bailable':'Non-Bailable', d.bailable?'p-bail':'p-nbail');

  document.getElementById('summaryTxt').textContent = d.summary||'';

  const nl=document.getElementById('notesList'); nl.innerHTML='';
  (d.important_notes||[]).forEach(n=>{ const x=document.createElement('div'); x.className='note'; x.textContent='⚠ '+n; nl.appendChild(x); });

  show('summaryPanel');

  // Sections
  const sg=document.getElementById('secGrid'); sg.innerHTML='';
  (d.sections||[]).forEach(s=>{
    const div=document.createElement('div');
    div.className='sec '+(s.priority||'secondary');
    const tc=s.priority==='primary'?'tp':s.priority==='minor'?'tm':'ts';
    const tl=s.priority==='primary'?'● Primary Charge':s.priority==='minor'?'○ Minor / Procedural':'◐ Secondary Charge';
    div.innerHTML=\`<span class="ptag \${tc}">\${e(tl)}</span>
      <div class="sec-head"><span class="scode">\${e(s.code)}</span><span class="sname">\${e(s.name)}</span></div>
      <div class="slaw">\${e(s.law||'')}</div>
      \${s.old_ref?'<div class="sold">Old ref: '+e(s.old_ref)+'</div>':''}
      \${s.punishment?'<div class="spun">⚖ Punishment: '+e(s.punishment)+'</div>':''}
      <div class="sdesc">\${e(s.description)}</div>\`;
    sg.appendChild(div);
  });
  show('secPanel');

  // Checklist
  items=[]; done=new Set();
  const cl=document.getElementById('chkList'); cl.innerHTML='';
  (d.checklist||[]).forEach(ph=>{
    const pd=document.createElement('div'); pd.className='phase';
    pd.innerHTML=\`<div class="plabel">\${e(ph.phase)}</div>\`;
    (ph.items||[]).forEach(it=>{
      const idx=items.length; items.push(it.task);
      const row=document.createElement('div');
      row.className='chk'; row.id='c'+idx; row.onclick=()=>tick(idx);
      row.innerHTML=\`<div class="cbox"><span class="ctick">✓</span></div>
        <div class="pbox"></div>
        <div style="flex:1"><div class="ctxt">\${e(it.task)}</div>
        \${it.urgent?'<span class="curg">⚡ Urgent</span>':''}</div>\`;
      pd.appendChild(row);
    });
    cl.appendChild(pd);
  });
  prog();
  show('chkPanel');

  document.getElementById('printBtn').classList.add('show');
  document.getElementById('goBtn').disabled=true;
  document.getElementById('firInput').disabled=true;

  const now=new Date();
  const ds=now.toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})+' at '+now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('pdate').textContent=ds;
  document.getElementById('pfdate').textContent=ds;
  document.getElementById('pstmt').textContent='Statement: "'+lastStmt.substring(0,180)+(lastStmt.length>180?'…':'')+'"';

  setTimeout(()=>document.getElementById('summaryPanel').scrollIntoView({behavior:'smooth',block:'start'}),100);
}

function tick(i){
  const el=document.getElementById('c'+i);
  if(done.has(i)){done.delete(i);el.classList.remove('done');}
  else{done.add(i);el.classList.add('done');}
  prog();
}
function prog(){
  const t=items.length,d=done.size;
  document.getElementById('progNum').textContent=d+' / '+t;
  document.getElementById('progFill').style.width=t>0?(d/t*100)+'%':'0%';
}
function setLoad(on){
  document.getElementById('loading').style.display=on?'block':'none';
  document.getElementById('goBtn').disabled=on;
  if(on) document.getElementById('n2').classList.add('on');
}
function show(id){ document.getElementById(id).style.display='block'; }
function showErr(m){ const b=document.getElementById('errBox'); document.getElementById('errMsg').textContent=m; b.style.display='flex'; }
function hideErr(){ document.getElementById('errBox').style.display='none'; }
function addPill(p,t,c){ const s=document.createElement('span'); s.className='pill '+c; s.textContent=t; p.appendChild(s); }
function e(s){ return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function reset(){
  ['n2','n3','n4'].forEach(id=>document.getElementById(id).classList.remove('on'));
  ['loading','summaryPanel','secPanel','chkPanel'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('firInput').value='';
  document.getElementById('firInput').disabled=false;
  document.getElementById('goBtn').disabled=false;
  document.getElementById('printBtn').classList.remove('show');
  hideErr(); items=[]; done=new Set();
  window.scrollTo({top:0,behavior:'smooth'});
}
</script>
</body>
</html>`;

// ─── Helper: read POST body ──────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end',  () => resolve(d));
    req.on('error', reject);
  });
}

// ─── Helper: call Anthropic ──────────────────────────────────
function callClaude(statement) {
  return new Promise((resolve, reject) => {
    const prompt = `Analyse this First Information Statement and respond ONLY with valid JSON — no markdown, no extra text.

First Information Statement:
"${statement}"

Respond with exactly this structure:
{
  "summary": "2-3 sentence plain English summary of the offence and key facts",
  "offence_type": "e.g. Violent Crime / Property Crime / Cyber Crime / Drug Offence",
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
      "description": "Why this section applies to this specific case"
    }
  ],
  "checklist": [
    {
      "phase": "Immediate Action (within 1 hour)",
      "items": [{ "task": "Specific duty", "urgent": true }]
    },
    {
      "phase": "Investigation Steps (within 24 hours)",
      "items": [{ "task": "Investigation step", "urgent": false }]
    },
    {
      "phase": "Documentation & Court Procedures",
      "items": [{ "task": "Documentation task", "urgent": false }]
    }
  ],
  "important_notes": ["Special warning 1", "Special warning 2"]
}

Rules:
- 4 to 8 sections mixing primary / secondary / minor priorities
- Use BNS 2023 numbers. Note old IPC in old_ref field
- Add POCSO if victim is minor, DV Act for domestic violence, SC/ST Act if applicable
- 12 to 18 checklist items total, specific to this case type
- cognizable and bailable based on the most serious charge
- important_notes: 1-3 special warnings for this case type
- Plain simple English for a police trainee`;

    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: 'You are a senior legal expert in Indian criminal law advising Kerala Police officers. Respond ONLY with valid JSON.',
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed);
        } catch(err) { reject(err); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Main HTTP Server ────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const path = url.parse(req.url).pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Serve the app ──
  if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  // ── Analyse endpoint ──
  if (req.method === 'POST' && path === '/analyse') {
    if (!API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API key not set. Please add ANTHROPIC_API_KEY in Render environment variables.' }));
      return;
    }
    try {
      const body = await readBody(req);
      const { statement } = JSON.parse(body);
      if (!statement || statement.trim().length < 20) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Please provide more details.' }));
        return;
      }
      const result = await callClaude(statement.trim());
      const text = (result.content || []).map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   SUTRA – Kerala Police  |  Server Running       ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║   Open:  http://localhost:' + PORT + '                    ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(API_KEY
    ? '║   ✅  API key loaded. Ready.                     ║'
    : '║   ⚠️   No API key! Set ANTHROPIC_API_KEY         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
