/* exam-relax.js v3 — آزمون آرام: خودتشخیص، ذخیرهٔ زنده، بازگردانی، ناوبری سؤال، تنفس، سپر آفلاین */
(function () {
'use strict';
if (window.__EXR3__) return; window.__EXR3__ = true;

const C = window.ClassCore || {};
const fa = C.fa || (n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = v => Number(String(v == null ? '' : v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))) || 0;
const txt = el => ((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
const V = () => document.getElementById('view');
const SID = () => (window.SESS && SESS.sid) || 'guest';
const PKEY = 'sh_exr3_prefs';

/* ---------------- prefs ---------------- */
const P = Object.assign({ sound: true, focus: false, fs: 0, nav: true, clock: true, breath: 10 },
  (() => { try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) { return {}; } })());
const saveP = () => { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} };

/* ---------------- state ---------------- */
const X = { ctx: null, qid: '', blocks: [], marks: {}, sig: '', restored: '', busy: false, saveT: 0, tickIv: 0, breathIv: 0, mo: null, startedAt: 0, lastSave: 0, offline: !navigator.onLine, ac: null };

/* ---------------- palette + css ---------------- */
const CSS = `
.exr{--e1:#047857;--e2:#0d9488;--e3:#10b981;--e4:#6ee7b7;--am:#f59e0b;--bl:#2563eb;--ro:#e11d48;--vi:#7c3aed;--pap:#fdf6e8;--ink:#0b2e26}
[data-theme=dark] .exr{--pap:#0d1f1c;--ink:#e6fffa}
.exr-bar{position:sticky;top:0;z-index:44;margin:0 0 14px;border-radius:18px;overflow:hidden;
background:linear-gradient(118deg,var(--e1) 0%,var(--e2) 46%,#0891b2 100%);color:#fff;
box-shadow:0 18px 40px -20px rgba(4,120,87,.85),inset 0 1px 0 rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.18)}
.exr-bar::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.5;
background:radial-gradient(70% 120% at 88% -20%,rgba(110,231,183,.55),transparent 60%),radial-gradient(50% 90% at 4% 120%,rgba(37,99,235,.4),transparent 62%)}
.exr-bar>*{position:relative;z-index:2}
.exr-top{display:flex;align-items:center;gap:12px;padding:12px 16px;flex-wrap:wrap}
.exr-heart{width:38px;height:38px;border-radius:12px;flex:none;display:grid;place-items:center;font-size:1.2rem;
background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);animation:exrPulse 4.2s ease-in-out infinite}
@keyframes exrPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(110,231,183,.5)}50%{transform:scale(1.1);box-shadow:0 0 0 10px rgba(110,231,183,0)}}
.exr-msg{flex:1;min-width:180px;line-height:1.6}
.exr-msg b{display:block;font-size:.92rem;font-weight:800}
.exr-msg small{display:block;font-size:.73rem;opacity:.92;font-weight:600}
.exr-stat{display:flex;gap:7px;flex-wrap:wrap}
.exr-pill{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);
border-radius:99px;padding:5px 11px;font-size:.74rem;font-weight:800;white-space:nowrap}
.exr-pill b{font-size:.9rem}
.exr-save{background:#a7f3d0;color:#064e3b;border-color:#a7f3d0;opacity:.35;transition:opacity .25s,transform .25s}
.exr-save.on{opacity:1;transform:scale(1.06)}
.exr-tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:0 16px 12px}
.exr-t{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.13);color:#fff;border-radius:11px;
padding:6px 11px;font-size:.75rem;font-weight:800;cursor:pointer;transition:transform .14s,background .14s}
.exr-t:hover{transform:translateY(-2px);background:rgba(255,255,255,.26)}
.exr-t.on{background:#fff;color:var(--e1);border-color:#fff}
.exr-step{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.3);border-radius:11px;overflow:hidden;background:rgba(255,255,255,.13)}
.exr-step button{border:none;background:transparent;color:#fff;width:30px;height:30px;font-size:1rem;font-weight:900;cursor:pointer}
.exr-step button:hover{background:rgba(255,255,255,.22)}
.exr-step b{min-width:34px;text-align:center;font-size:.76rem}
.exr-prog{height:5px;background:rgba(0,0,0,.22)}
.exr-prog i{display:block;height:100%;background:linear-gradient(90deg,#fbbf24,#a7f3d0,#6ee7b7);transition:width .45s cubic-bezier(.2,.8,.2,1)}
.exr-nav{display:flex;gap:6px;overflow-x:auto;padding:10px 16px;background:rgba(0,0,0,.16);scrollbar-width:thin;scrollbar-color:#a7f3d0 rgba(0,0,0,.2)}
.exr-nav::-webkit-scrollbar{height:8px}
.exr-nav::-webkit-scrollbar-track{background:rgba(0,0,0,.2);border-radius:99px}
.exr-nav::-webkit-scrollbar-thumb{background:linear-gradient(90deg,#6ee7b7,#a7f3d0);border-radius:99px}
.exr-nav::-webkit-scrollbar-thumb:hover{background:#fff}
.exr-chip{flex:none;width:34px;height:34px;border-radius:10px;border:1.5px solid rgba(255,255,255,.32);background:rgba(255,255,255,.1);
color:#fff;font-weight:800;font-size:.8rem;cursor:pointer;position:relative;transition:transform .14s}
.exr-chip:hover{transform:translateY(-3px)}
.exr-chip.done{background:#a7f3d0;color:#064e3b;border-color:#a7f3d0}
.exr-chip.mark::after{content:'';position:absolute;top:-3px;left:-3px;width:9px;height:9px;border-radius:50%;background:var(--am);border:2px solid #fff}
.exr-note{margin:0 0 12px;border-radius:14px;padding:11px 14px;font-size:.82rem;font-weight:700;line-height:1.8;
background:color-mix(in srgb,var(--e3) 12%,var(--surface,#fff));border:1.5px solid color-mix(in srgb,var(--e2) 42%,transparent);color:var(--e1)}
[data-theme=dark] .exr-note{color:var(--e4)}
.exr-note.warn{background:color-mix(in srgb,var(--am) 14%,var(--surface,#fff));border-color:color-mix(in srgb,var(--am) 48%,transparent);color:#92400e}
[data-theme=dark] .exr-note.warn{color:#fcd34d}
.exr-note .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.exr-mini{border:1px solid currentColor;background:transparent;color:inherit;border-radius:9px;padding:4px 10px;font-size:.72rem;font-weight:800;cursor:pointer}
.exr-mini:hover{background:color-mix(in srgb,currentColor 14%,transparent)}
.exr-flag{border:1px dashed color-mix(in srgb,var(--am) 60%,transparent);background:color-mix(in srgb,var(--am) 10%,transparent);
color:#b45309;border-radius:9px;padding:3px 9px;font-size:.7rem;font-weight:800;cursor:pointer;margin-bottom:7px}
.exr-flag.on{background:var(--am);color:#fff;border-style:solid}
[data-theme=dark] .exr-flag{color:#fcd34d}
.exr-strip{margin-top:10px;border-radius:12px;padding:8px 12px;font-size:.77rem;font-weight:700;line-height:1.8;
background:color-mix(in srgb,var(--e3) 10%,var(--surface,#fff));border:1px dashed color-mix(in srgb,var(--e2) 45%,transparent);color:var(--e1)}
[data-theme=dark] .exr-strip{color:var(--e4)}
.exr-badge{display:inline-flex;margin:8px 8px 0 0;background:var(--e2);color:#fff;border-radius:99px;padding:4px 12px;font-size:.71rem;font-weight:800}
body.exr-focus #sidebar,body.exr-focus #topbar{opacity:.32;filter:saturate(.5);transition:opacity .3s}
body.exr-focus #sidebar:hover,body.exr-focus #topbar:hover{opacity:1;filter:none}
.exr-hl{animation:exrHl 1.1s ease-out}
@keyframes exrHl{0%{box-shadow:0 0 0 3px var(--e3)}100%{box-shadow:0 0 0 0 transparent}}
.exr-breath{position:fixed;inset:0;z-index:180;display:grid;place-items:center;background:rgba(4,47,40,.82);backdrop-filter:blur(9px)}
.exr-breath .box{text-align:center;color:#fff;padding:24px}
.exr-orb{width:150px;height:150px;margin:0 auto 20px;border-radius:50%;
background:radial-gradient(circle at 34% 30%,#a7f3d0,#10b981 58%,#047857);
box-shadow:0 0 60px rgba(16,185,129,.6);display:grid;place-items:center;font-size:1.5rem;font-weight:800;
transition:transform 4s cubic-bezier(.4,0,.4,1)}
.exr-breath h3{font-size:1.5rem;margin-bottom:6px}
.exr-breath p{opacity:.85;font-size:.86rem;margin-bottom:18px}
.exr-conf{position:fixed;z-index:190;width:9px;height:14px;border-radius:2px;pointer-events:none}
@media (max-width:700px){.exr-top{padding:11px 12px}.exr-tools{padding:0 12px 11px}.exr-nav{padding:9px 12px}.exr-msg small{display:none}}
`;
const styleEl = document.createElement('style'); styleEl.id = 'exr3css'; styleEl.textContent = CSS; document.head.appendChild(styleEl);

/* ---------------- audio ---------------- */
function beep(kind) {
  if (!P.sound) return;
  try {
    if (!X.ac) X.ac = new (window.AudioContext || window.webkitAudioContext)();
    if (X.ac.state === 'suspended') X.ac.resume();
    const map = { ok: [660, 0.07], mark: [880, 0.05], win: [523, 0.16], in: [392, 0.2], out: [294, 0.2] };
    const [f, d] = map[kind] || map.ok;
    const o = X.ac.createOscillator(), g = X.ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, X.ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, X.ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, X.ac.currentTime + d);
    o.connect(g); g.connect(X.ac.destination); o.start(); o.stop(X.ac.currentTime + d + 0.02);
    if (kind === 'win') setTimeout(() => beep('mark'), 130);
  } catch (e) {}
}
document.addEventListener('pointerdown', () => { try { if (X.ac && X.ac.state === 'suspended') X.ac.resume(); } catch (e) {} }, { passive: true });

/* ---------------- detection ---------------- */
const OPT_SEL = '.opt,.option,.choice,.answer,[data-opt],[data-choice],[data-idx],[data-choice-id],[data-act*="answer"],[data-act*="choice"],[data-act*="pick"],[data-act*="opt"],[data-act*="ans"]';
function optBtns(el) {
  let b = Array.prototype.slice.call(el.querySelectorAll('button' + OPT_SEL.split(',').map(s => ',button' + s).join('')));
  b = b.filter((x, i, a) => a.indexOf(x) === i);
  if (b.length >= 2) return b;
  const all = Array.prototype.slice.call(el.querySelectorAll('button')).filter(x => txt(x).length > 0 && txt(x).length < 70);
  return all.length >= 2 && all.length <= 6 ? all : [];
}
const isSel = b => /(^|\s)(on|selected|active|chosen|picked|sel)(\s|$)/.test(b.className || '') ||
  b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-pressed') === 'true' || b.dataset.selected === '1';

function blocksOf(root) {
  let bs = Array.prototype.slice.call(root.querySelectorAll('[data-q],[data-qid],[data-question],.qcard,.question,.quiz-q,.qbox,.qitem'));
  if (bs.length > 1) return bs;
  const radios = Array.prototype.slice.call(root.querySelectorAll('input[type=radio][name]'));
  if (radios.length) {
    const names = Array.from(new Set(radios.map(r => r.name)));
    const out = names.map(n => {
      const els = radios.filter(r => r.name === n);
      let p = els[0].parentElement;
      while (p && p !== root && !els.every(e => p.contains(e))) p = p.parentElement;
      return p && p !== root ? p : els[0].closest('div');
    }).filter(Boolean);
    if (out.length) return out;
  }
  const cands = Array.prototype.slice.call(root.querySelectorAll('div,li,fieldset,section')).filter(el => {
    if (el.closest('.exr')) return false;
    const b = optBtns(el);
    if (b.length < 2) return false;
    return /سؤال|سوال|؟|\?/.test(txt(el)) || el.querySelector('[data-idx],[data-opt],[data-choice]');
  });
  return cands.filter(el => !cands.some(o => o !== el && el.contains(o)));
}
function context() {
  const v = V(); if (!v || !window.SESS) return null;
  const sec = String((window.UI && UI.section) || '');
  const head = txt(v.querySelector('h1,h2,h3'));
  const secHit = /quiz|exam|آزمون/i.test(sec);
  const headHit = /آزمون/.test(head);
  const inputs = v.querySelectorAll('input[type=radio],input[type=checkbox],textarea[name]').length;
  const submit = Array.prototype.slice.call(v.querySelectorAll('button')).some(b => /ثبت نهایی|ارسال پاسخ|پایان آزمون|ثبت آزمون|اتمام آزمون/.test(txt(b)));
  const opts = blocksOf(v).length;
  if ((secHit || headHit) && (inputs > 0 || submit || opts > 1)) return 'run';
  if (submit && (inputs > 0 || opts > 1)) return 'run';
  if (secHit || headHit) return 'lobby';
  return null;
}
function qidOf(v) {
  const U = window.UI || {};
  const cands = [U.quizId, U.qid, U.examId, U.exam, U.activeQuiz, U.quiz && U.quiz.id];
  const dq = v.querySelector('[data-quiz-id],[data-qid],[data-exam-id]');
  if (dq) cands.push(dq.dataset.quizId || dq.dataset.qid || dq.dataset.examId);
  const btn = v.querySelector('button[data-act*="quiz"][data-id],button[data-act*="exam"][data-id],button[data-act*="submit"][data-id]');
  if (btn) cands.push(btn.dataset.id);
  for (const c of cands) if (c) return String(c);
  const t = txt(v).slice(0, 220);
  let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 'auto' + (h >>> 0).toString(36);
}

/* ---------------- storage ---------------- */
const key = () => 'sh_exr3_' + X.qid + '_' + SID();
function write(snap) { try { localStorage.setItem(key(), JSON.stringify(snap)); X.lastSave = Date.now(); } catch (e) {} }
function read() { try { return JSON.parse(localStorage.getItem(key()) || 'null'); } catch (e) { return null; } }
function drop() { try { localStorage.removeItem(key()); } catch (e) {} }

function snapshot() {
  const v = V(); if (!v) return null;
  const fields = {};
  v.querySelectorAll('input[name],textarea[name],select[name]').forEach(el => {
    if (el.closest('.exr')) return;
    if (el.type === 'checkbox') { (fields[el.name] = fields[el.name] || []); if (el.checked) fields[el.name].push(el.value); }
    else if (el.type === 'radio') { if (el.checked) fields[el.name] = el.value; }
    else fields[el.name] = el.value;
  });
  const opts = [];
  X.blocks.forEach((b, qi) => { const bs = optBtns(b); const i = bs.findIndex(isSel); if (i > -1) opts.push([qi, i]); });
  return { fields, opts, marks: X.marks, at: Date.now() };
}
function answeredCount() {
  const v = V(); if (!v) return 0;
  let n = 0;
  X.blocks.forEach(b => {
    if (b.querySelector('input:checked')) { n++; return; }
    const ta = b.querySelector('textarea,input[type=text]');
    if (ta && ta.value.trim()) { n++; return; }
    if (optBtns(b).some(isSel)) n++;
  });
  return n;
}
function pulseSave() {
  const s = document.getElementById('exrSave'); if (!s) return;
  s.classList.add('on'); s.textContent = '✓ ذخیره شد';
  setTimeout(() => s.classList.remove('on'), 1100);
}
function doSave() {
  if (X.busy || X.ctx !== 'run') return;
  clearTimeout(X.saveT);
  X.saveT = setTimeout(() => { const s = snapshot(); if (s) { write(s); pulseSave(); paint(); } }, 220);
}
function restore(snap) {
  const v = V(); if (!v || !snap) return;
  X.busy = true;
  try {
    Object.keys(snap.fields || {}).forEach(k => {
      v.querySelectorAll('[name="' + CSS.escape(k) + '"]').forEach(el => {
        const val = snap.fields[k];
        if (el.type === 'checkbox') el.checked = Array.isArray(val) && val.indexOf(el.value) > -1;
        else if (el.type === 'radio') el.checked = val === el.value;
        else if (!el.value) el.value = val == null ? '' : val;
      });
    });
    (snap.opts || []).forEach(pair => {
      const b = X.blocks[pair[0]]; if (!b) return;
      const t = optBtns(b)[pair[1]]; if (t && !isSel(t)) t.click();
    });
    X.marks = snap.marks || {};
  } catch (e) {}
  setTimeout(() => { X.busy = false; }, 260);
}

/* ---------------- build UI ---------------- */
function barHTML() {
  return '<div class="exr-bar exr" id="exrBar">' +
    '<div class="exr-top"><span class="exr-heart">💚</span>' +
    '<div class="exr-msg" id="exrMsg"><b>پاسخ‌هایت لحظه‌ای ذخیره می‌شود</b><small>بدون عجله؛ اگر صفحه بسته شد، از همین‌جا ادامه می‌دهی.</small></div>' +
    '<div class="exr-stat"><span class="exr-pill" id="exrCount">📝 <b>۰</b>/۰</span>' +
    '<span class="exr-pill" id="exrClock">⏱ <b>۰۰:۰۰</b></span>' +
    '<span class="exr-pill exr-save" id="exrSave">✓ ذخیره شد</span></div></div>' +
    '<div class="exr-tools">' +
    '<button type="button" class="exr-t' + (P.sound ? ' on' : '') + '" data-exr="sound">' + (P.sound ? '🔊 صدا' : '🔇 بی‌صدا') + '</button>' +
    '<button type="button" class="exr-t' + (P.focus ? ' on' : '') + '" data-exr="focus">🎯 تمرکز</button>' +
    '<button type="button" class="exr-t' + (P.nav ? ' on' : '') + '" data-exr="nav">🧭 ناوبری</button>' +
    '<button type="button" class="exr-t' + (P.clock ? ' on' : '') + '" data-exr="clock">⏱ زمان</button>' +
    '<span class="exr-step"><button type="button" data-exr="fs-" title="کوچک‌تر">−</button><b>متن ' + fa(100 + P.fs * 12) + '٪</b><button type="button" data-exr="fs+" title="بزرگ‌تر">+</button></span>' +
    '<button type="button" class="exr-t" data-exr="breath">🌬️ نفس عمیق</button>' +
    '<button type="button" class="exr-t" data-exr="reset">♻️ پاک‌کردن پیش‌نویس</button>' +
    '</div><div class="exr-prog"><i id="exrProg" style="width:0%"></i></div>' +
    '<div class="exr-nav" id="exrNav" style="display:' + (P.nav ? 'flex' : 'none') + '"></div></div>';
}
function build() {
  const v = V(); if (!v) return;
  X.blocks = blocksOf(v);
  X.qid = qidOf(v);
  if (!X.startedAt) X.startedAt = Date.now();
  if (!document.getElementById('exrBar')) v.insertAdjacentHTML('afterbegin', barHTML());
  document.body.classList.toggle('exr-focus', !!P.focus);
  applyFont();
  const snap = read();
  if (snap && X.restored !== X.qid) {
    X.restored = X.qid;
    restore(snap);
    const n = (snap.opts || []).length + Object.keys(snap.fields || {}).filter(k => { const x = snap.fields[k]; return Array.isArray(x) ? x.length : String(x || '').trim(); }).length;
    if (n) {
      v.querySelector('#exrBar').insertAdjacentHTML('afterend',
        '<div class="exr exr-note" id="exrBack"><div class="row"><span>💚</span><span style="flex:1;min-width:180px">' +
        fa(n) + ' پاسخ قبلی‌ات بازگردانی شد — از همان‌جا ادامه بده.</span>' +
        '<button type="button" class="exr-mini" data-exr="dismiss">باشه</button></div></div>');
      beep('ok');
    }
  }
  if (X.offline) showOffline(true);
  injectFlags();
  paint();
  bindInputs();
  startBreath();
}
function teardown() {
  stopBreath();
  document.body.classList.remove('exr-focus');
  const b = document.getElementById('exrBar'); if (b) b.remove();
  const n = document.getElementById('exrBack'); if (n) n.remove();
  const o = document.getElementById('exrOff'); if (o) o.remove();
  document.querySelectorAll('.exr-flag').forEach(e => e.remove());
  X.restored = ''; X.startedAt = 0; X.marks = {};
}
function bindInputs() {
  const v = V(); if (!v) return;
  v.querySelectorAll('input,textarea,select').forEach(el => {
    if (el.dataset.exrB || el.closest('.exr')) return;
    el.dataset.exrB = '1';
    el.addEventListener('input', doSave);
    el.addEventListener('change', doSave);
  });
}
function injectFlags() {
  X.blocks.forEach((b, i) => {
    if (b.querySelector('.exr-flag')) return;
    const f = document.createElement('button');
    f.type = 'button'; f.className = 'exr exr-flag' + (X.marks[i] ? ' on' : '');
    f.dataset.exr = 'mark'; f.dataset.i = String(i);
    f.textContent = X.marks[i] ? '🚩 نشان‌دار — بازبینی' : '🏳️ نشان برای بازبینی';
    b.insertBefore(f, b.firstChild);
  });
}
function applyFont() {
  const scale = 1 + P.fs * 0.12;
  X.blocks.forEach(b => {
    const t = b.querySelector('p,.qtext,.qtitle,b,strong') || b;
    if (!t.dataset.exrBase) t.dataset.exrBase = String(parseFloat(getComputedStyle(t).fontSize) || 15);
    t.style.fontSize = (parseFloat(t.dataset.exrBase) * scale).toFixed(1) + 'px';
  });
}
function paint() {
  const total = X.blocks.length, done = answeredCount();
  const cEl = document.getElementById('exrCount');
  if (cEl) cEl.innerHTML = '📝 <b>' + fa(done) + '</b>/' + fa(total || 0);
  const pr = document.getElementById('exrProg');
  if (pr) pr.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  const nav = document.getElementById('exrNav');
  if (nav) {
    nav.style.display = P.nav && total ? 'flex' : 'none';
    if (P.nav && total) {
      nav.innerHTML = X.blocks.map((b, i) => {
        const answered = !!b.querySelector('input:checked') || optBtns(b).some(isSel) || (() => { const t = b.querySelector('textarea,input[type=text]'); return t && t.value.trim(); })();
        return '<button type="button" class="exr-chip' + (answered ? ' done' : '') + (X.marks[i] ? ' mark' : '') + '" data-exr="go" data-i="' + i + '" title="سؤال ' + fa(i + 1) + '">' + fa(i + 1) + '</button>';
      }).join('');
    }
  }
  const ck = document.getElementById('exrClock');
  if (ck) {
    ck.style.display = P.clock ? '' : 'none';
    if (P.clock && X.startedAt) {
      const s = Math.floor((Date.now() - X.startedAt) / 1000);
      ck.innerHTML = '⏱ <b>' + fa(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + fa(String(s % 60).padStart(2, '0')) + '</b>';
    }
  }
}
function showOffline(on) {
  const v = V(); if (!v) return;
  const ex = document.getElementById('exrOff');
  if (!on) { if (ex) ex.remove(); return; }
  if (ex) return;
  const bar = document.getElementById('exrBar');
  const html = '<div class="exr exr-note warn" id="exrOff"><div class="row"><span>📴</span><span style="flex:1;min-width:180px">اتصال قطع است — نگران نباش؛ پاسخ‌ها روی همین دستگاه امن می‌مانند و به‌محض بازگشت اینترنت ثبت می‌شوند.</span></div></div>';
  if (bar) bar.insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('afterbegin', html);
}

/* ---------------- breathing ---------------- */
function startBreath() {
  stopBreath();
  if (!P.breath) return;
  X.breathIv = setInterval(() => {
    const m = document.getElementById('exrMsg'); if (!m) return;
    const list = [
      ['🌬️ یک نفس عمیق؛ دم… بازدم…', 'شانه‌ها را شل کن. هیچ‌کس قرار نیست قضاوتت کند.'],
      ['💧 یک جرعه آب بخور', 'آب، تمرکز مغز را برمی‌گرداند.'],
      ['👀 بیست ثانیه به دورترین نقطه نگاه کن', 'چشم خسته، ذهن خسته می‌سازد.'],
      ['🧘 سه سؤال آسان را اول بزن', 'اعتمادبه‌نفس، سوختِ ادامهٔ راه است.']
    ];
    const x = list[Math.floor(Math.random() * list.length)];
    m.innerHTML = '<b>' + x[0] + '</b><small>' + x[1] + '</small>';
    beep('in');
    setTimeout(() => { if (m) m.innerHTML = '<b>پاسخ‌هایت لحظه‌ای ذخیره می‌شود</b><small>بدون عجله؛ اگر صفحه بسته شد، از همین‌جا ادامه می‌دهی.</small>'; }, 9000);
  }, P.breath * 60000);
}
function stopBreath() { if (X.breathIv) { clearInterval(X.breathIv); X.breathIv = 0; } }
function breathOverlay() {
  if (document.getElementById('exrBreath')) return;
  const el = document.createElement('div');
  el.className = 'exr exr-breath'; el.id = 'exrBreath';
  el.innerHTML = '<div class="box"><div class="exr-orb" id="exrOrb">۴</div><h3 id="exrPh">دم بگیر</h3><p id="exrSub">۴ ثانیه از بینی… آرام</p><button type="button" class="exr-t" data-exr="breathClose">بازگشت به آزمون</button></div>';
  document.body.appendChild(el);
  const orb = el.querySelector('#exrOrb'), ph = el.querySelector('#exrPh'), sub = el.querySelector('#exrSub');
  const phases = [['دم بگیر', '۴ ثانیه از بینی… آرام', 4, 1.55, 4], ['نگه دار', '۷ ثانیه حبس کن… راحت باش', 7, 1.55, 7], ['بازدم', '۸ ثانیه از دهان… رها کن', 8, 1, 8]];
  let cycle = 0, i = 0;
  function step() {
    if (!document.getElementById('exrBreath')) return;
    if (i >= phases.length) { i = 0; cycle++; if (cycle >= 3) { closeBreath(); beep('win'); return; } }
    const [t, s, d, sc, cd] = phases[i];
    ph.textContent = t; sub.textContent = s;
    orb.style.transitionDuration = d + 's'; orb.style.transform = 'scale(' + sc + ')';
    beep(i === 2 ? 'out' : 'in');
    let left = cd; orb.textContent = fa(left);
    const iv = setInterval(() => { left--; if (left <= 0) { clearInterval(iv); return; } if (orb) orb.textContent = fa(left); }, 1000);
    i++;
    setTimeout(step, d * 1000);
  }
  step();
}
function closeBreath() { const e = document.getElementById('exrBreath'); if (e) e.remove(); }

/* ---------------- confetti ---------------- */
function confetti() {
  const cols = ['#10b981', '#6ee7b7', '#fbbf24', '#2563eb', '#7c3aed', '#e11d48'];
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('div'); d.className = 'exr-conf';
    d.style.background = cols[i % cols.length];
    d.style.left = (innerWidth / 2) + 'px'; d.style.top = (innerHeight / 3) + 'px';
    document.body.appendChild(d);
    const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 190;
    d.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
      { transform: 'translate(calc(-50% + ' + (Math.cos(a) * r) + 'px), calc(-50% + ' + (Math.sin(a) * r + 160) + 'px)) rotate(' + (400 + Math.random() * 500) + 'deg)', opacity: 0 }],
      { duration: 1000 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => d.remove();
  }
}

/* ---------------- dashboard calming ---------------- */
const STRESS = /فقط یک بار|یک بار فرصت|محدودیت ورود|قفل|دیر شد|فرصت از دست|زمان تمام/;
function calmDash() {
  const v = V(); if (!v || !window.SESS) return;
  const cards = Array.prototype.slice.call(v.querySelectorAll('.card,.ins,.banner,[class*="quiz"],[class*="exam"]'));
  cards.forEach(card => {
    if (card.closest('.exr') || card.dataset.exrCalm) return;
    const t = txt(card);
    if (!/آزمون/.test(t)) return;
    const btns = Array.prototype.slice.call(card.querySelectorAll('button')).filter(b => /quiz|exam|qz/i.test(b.dataset.act || '') || /شروع|ورود|ادامه|شرکت/.test(txt(b)));
    if (!btns.length) return;
    card.dataset.exrCalm = '1';
    btns.forEach(b => { b.removeAttribute('disabled'); b.title = 'ورود آزاد — پاسخ‌ها خودکار ذخیره می‌شوند'; });
    card.querySelectorAll('span,small,b,p,div').forEach(el => {
      if (el.children.length) return;
      const s = el.textContent || '';
      if (!STRESS.test(s)) return;
      el.textContent = s.replace(/فقط یک بار[^.،؛]*/g, 'هر بار از همان‌جا ادامه می‌دهی')
        .replace(/یک بار فرصت[^.،؛]*/g, 'فرصت نامحدود')
        .replace(/محدودیت ورود[^.،؛]*/g, 'ورود آزاد')
        .replace(/قفل/g, 'باز');
      el.style.color = '#047857'; el.style.fontWeight = '800';
    });
    if (!card.querySelector('.exr-strip')) {
      const s = document.createElement('div'); s.className = 'exr exr-strip';
      s.textContent = '💚 ورود آزاد است؛ هر پاسخ همان لحظه روی دستگاه ذخیره می‌شود. قطع اینترنت چیزی را از بین نمی‌برد.';
      card.appendChild(s);
    }
    const id = btns[0].dataset.id || btns[0].dataset.qid || '';
    if (id) {
      try {
        const raw = localStorage.getItem('sh_exr3_' + id + '_' + SID());
        if (raw && !card.querySelector('.exr-badge')) {
          const b = document.createElement('span'); b.className = 'exr exr-badge';
          b.textContent = '💚 پیش‌نویس داری — از همان‌جا ادامه می‌دهی';
          card.appendChild(b);
        }
      } catch (e) {}
    }
  });
  Array.prototype.slice.call(v.querySelectorAll('*')).forEach(el => {
    if (el.children.length) return;
    const s = txt(el);
    if (/^\d{1,2}:[۰-۹\d]{2}$/.test(s) || /^[۰-۹\d]{1,2}:[۰-۹\d]{2}$/.test(s)) { el.style.color = '#0d9488'; el.style.fontWeight = '800'; }
  });
}

/* ---------------- controls ---------------- */
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-exr]');
  if (!b) return;
  const a = b.dataset.exr;
  if (a === 'sound') { P.sound = !P.sound; saveP(); b.classList.toggle('on', P.sound); b.textContent = P.sound ? '🔊 صدا' : '🔇 بی‌صدا'; if (P.sound) beep('ok'); }
  else if (a === 'focus') { P.focus = !P.focus; saveP(); b.classList.toggle('on', P.focus); document.body.classList.toggle('exr-focus', P.focus); beep('mark'); }
  else if (a === 'nav') { P.nav = !P.nav; saveP(); b.classList.toggle('on', P.nav); paint(); beep('mark'); }
  else if (a === 'clock') { P.clock = !P.clock; saveP(); b.classList.toggle('on', P.clock); paint(); }
  else if (a === 'fs+' || a === 'fs-') {
    P.fs = clamp(P.fs + (a === 'fs+' ? 1 : -1), -1, 4); saveP(); applyFont();
    const lbl = b.parentElement.querySelector('b'); if (lbl) lbl.textContent = 'متن ' + fa(100 + P.fs * 12) + '٪';
  }
  else if (a === 'breath') breathOverlay();
  else if (a === 'breathClose') closeBreath();
  else if (a === 'dismiss') { const n = document.getElementById('exrBack'); if (n) n.remove(); }
  else if (a === 'go') {
    const t = X.blocks[num(b.dataset.i)]; if (!t) return;
    t.scrollIntoView({ behavior: 'smooth', block: 'center' });
    t.classList.add('exr-hl'); setTimeout(() => t.classList.remove('exr-hl'), 1200); beep('mark');
  }
  else if (a === 'mark') {
    const i = num(b.dataset.i); X.marks[i] = !X.marks[i];
    b.classList.toggle('on', X.marks[i]);
    b.textContent = X.marks[i] ? '🚩 نشان‌دار — بازبینی' : '🏳️ نشان برای بازبینی';
    doSave(); paint(); beep('mark');
  }
  else if (a === 'reset') {
    const backup = read(); drop(); X.marks = {}; X.restored = X.qid;
    document.querySelectorAll('.exr-flag.on').forEach(f => { f.classList.remove('on'); f.textContent = '🏳️ نشان برای بازبینی'; });
    paint();
    const v = V(); const bar = document.getElementById('exrBar');
    if (v && bar && !document.getElementById('exrUndo')) {
      bar.insertAdjacentHTML('afterend', '<div class="exr exr-note warn" id="exrUndo"><div class="row"><span>♻️</span><span style="flex:1;min-width:160px">پیش‌نویس پاک شد.</span><button type="button" class="exr-mini" data-exr="undo">↩️ واگرد</button></div></div>');
      const u = document.getElementById('exrUndo');
      u.querySelector('[data-exr="undo"]').addEventListener('click', () => { if (backup) { write(backup); restore(backup); } u.remove(); paint(); beep('ok'); }, { once: true });
      setTimeout(() => { const z = document.getElementById('exrUndo'); if (z) z.remove(); }, 9000);
    }
  }
}, true);

/* option clicks → save */
document.addEventListener('click', e => {
  if (X.ctx !== 'run' || X.busy) return;
  const v = V(); if (!v || !v.contains(e.target)) return;
  if (e.target.closest && e.target.closest('.exr')) return;
  if (e.target.closest && e.target.closest('button')) setTimeout(doSave, 60);
}, true);

/* ---------------- network ---------------- */
window.addEventListener('offline', () => { X.offline = true; if (X.ctx === 'run') showOffline(true); });
window.addEventListener('online', () => { X.offline = false; showOffline(false); if (X.ctx === 'run') { const s = snapshot(); if (s) write(s); } });

/* ---------------- send wrapper ---------------- */
if (typeof window.send === 'function') {
  const baseSend = window.send;
  window.send = function (type, cmd, patch, opts) {
    const isSubmit = typeof type === 'string' && /quiz\.submit|exam\.submit/.test(type);
    return baseSend.apply(this, arguments).then(r => {
      if (isSubmit && r) { drop(); stopBreath(); confetti(); beep('win'); }
      return r;
    }).catch(err => {
      if (isSubmit) {
        const s = snapshot(); if (s) write(s);
        showOffline(true);
        try { window.toast && toast('📴 ثبت نشد، ولی پاسخ‌هایت امن ذخیره شد. اینترنت که برگشت دوباره بزن.', 'warn', null, 9000); } catch (e) {}
      }
      throw err;
    });
  };
}

/* ---------------- lifecycle ---------------- */
function tick() {
  try {
    const c = context();
    const v = V();
    const sig = c + '|' + (v ? (v.querySelector('h1,h2,h3') || {}).textContent || '' : '') + '|' + (v ? v.querySelectorAll('input[type=radio],textarea[name]').length : 0);
    if (c === 'run') {
      if (X.ctx !== 'run' || sig !== X.sig) { X.ctx = 'run'; X.sig = sig; build(); }
      else { X.blocks = blocksOf(v); injectFlags(); bindInputs(); paint(); }
    } else {
      if (X.ctx === 'run') teardown();
      X.ctx = c; X.sig = sig;
      calmDash();
    }
  } catch (e) { /* never break host */ }
}
if (typeof window.renderView === 'function') {
  const baseRV = window.renderView;
  window.renderView = function () { const r = baseRV.apply(this, arguments); setTimeout(tick, 140); return r; };
}
X.tickIv = setInterval(tick, 1000);
if (typeof MutationObserver !== 'undefined') {
  let q = false;
  X.mo = new MutationObserver(() => { if (q) return; q = true; requestAnimationFrame(() => { q = false; tick(); }); });
  const attach = () => { const m = document.getElementById('main') || document.body; if (m) X.mo.observe(m, { childList: true, subtree: true }); };
  if (document.body) attach(); else document.addEventListener('DOMContentLoaded', attach);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBreath(); });
tick();
})();
