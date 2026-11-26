/* exam-relax.js v4 — آزمون آرام: خودتشخیص، ذخیرهٔ زنده، بازگردانی، ناوبری، تنفس، سپر آفلاین */
(function () {
'use strict';
if (window.__EXR4__) return;
window.__EXR4__ = true;

var C = window.ClassCore || {};
function fa(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; }); }
function num(v) { return Number(String(v == null ? '' : v).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })) || 0; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function txt(el) { return ((el && el.textContent) || '').replace(/\s+/g, ' ').trim(); }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function sess() { try { return (typeof SESS !== 'undefined' && SESS) ? SESS : null; } catch (e) { return null; } }
function ui() { try { return (typeof UI !== 'undefined' && UI) ? UI : {}; } catch (e) { return {}; } }
function say(m, k) { try { if (typeof toast === 'function') toast(m, k || 'info', null, 8000); } catch (e) {} }
function V() { return document.getElementById('view'); }
function SID() { var s = sess(); return s ? (s.sid || 'teacher') : 'guest'; }
function escq(s) { return String(s).replace(/["\\]/g, '\\$&'); }

var PKEY = 'sh_exr4_prefs';
var P = { sound: true, focus: false, nav: true, clock: true, fs: 0, breath: 10 };
try { var pp = JSON.parse(localStorage.getItem(PKEY) || '{}'); for (var k in pp) P[k] = pp[k]; } catch (e) {}
function saveP() { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} }

var X = { mode: null, sig: '', qid: '', blocks: [], marks: {}, busy: false, saveT: 0, breathIv: 0, breathTimers: [], startedAt: 0, restored: '', ac: null, navSig: '', tickIv: 0, mo: null };

var STYLE_TEXT = ''
+ '.exr{--e1:#047857;--e2:#0d9488;--e3:#10b981;--e4:#6ee7b7;--am:#f59e0b}'
+ '.exr-bar{position:sticky;top:0;z-index:44;margin:0 0 14px;border-radius:18px;overflow:hidden;background:linear-gradient(118deg,#047857 0%,#0d9488 46%,#0891b2 100%);color:#fff;box-shadow:0 18px 40px -20px rgba(4,120,87,.85),inset 0 1px 0 rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.18)}'
+ '.exr-bar::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background:radial-gradient(70% 120% at 88% -20%,rgba(110,231,183,.55),transparent 60%),radial-gradient(50% 90% at 4% 120%,rgba(37,99,235,.4),transparent 62%)}'
+ '.exr-bar>*{position:relative;z-index:2}'
+ '.exr-top{display:flex;align-items:center;gap:12px;padding:12px 16px;flex-wrap:wrap}'
+ '.exr-heart{width:38px;height:38px;border-radius:12px;flex:none;display:grid;place-items:center;font-size:1.2rem;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);animation:exrPulse 4.2s ease-in-out infinite}'
+ '@keyframes exrPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(110,231,183,.5)}50%{transform:scale(1.1);box-shadow:0 0 0 10px rgba(110,231,183,0)}}'
+ '.exr-msg{flex:1;min-width:180px;line-height:1.6}.exr-msg b{display:block;font-size:.92rem;font-weight:800}.exr-msg small{display:block;font-size:.73rem;opacity:.92;font-weight:600}'
+ '.exr-stat{display:flex;gap:7px;flex-wrap:wrap}'
+ '.exr-pill{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:5px 11px;font-size:.74rem;font-weight:800;white-space:nowrap}.exr-pill b{font-size:.9rem}'
+ '.exr-save{background:#a7f3d0;color:#064e3b;border-color:#a7f3d0;opacity:.35;transition:opacity .25s,transform .25s}.exr-save.on{opacity:1;transform:scale(1.06)}'
+ '.exr-tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:0 16px 12px}'
+ '.exr-t{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.13);color:#fff;border-radius:11px;padding:6px 11px;font-size:.75rem;font-weight:800;cursor:pointer;transition:transform .14s,background .14s}'
+ '.exr-t:hover{transform:translateY(-2px);background:rgba(255,255,255,.26)}.exr-t.on{background:#fff;color:#047857;border-color:#fff}'
+ '.exr-step{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.3);border-radius:11px;overflow:hidden;background:rgba(255,255,255,.13)}'
+ '.exr-step button{border:none;background:transparent;color:#fff;width:30px;height:30px;font-size:1rem;font-weight:900;cursor:pointer}.exr-step button:hover{background:rgba(255,255,255,.22)}.exr-step b{min-width:52px;text-align:center;font-size:.72rem}'
+ '.exr-prog{height:5px;background:rgba(0,0,0,.22)}.exr-prog i{display:block;height:100%;background:linear-gradient(90deg,#fbbf24,#a7f3d0,#6ee7b7);transition:width .45s cubic-bezier(.2,.8,.2,1)}'
+ '.exr-nav{display:flex;gap:6px;overflow-x:auto;padding:10px 16px;background:rgba(0,0,0,.16);scrollbar-width:thin;scrollbar-color:#a7f3d0 rgba(0,0,0,.2)}'
+ '.exr-nav::-webkit-scrollbar{height:8px}.exr-nav::-webkit-scrollbar-track{background:rgba(0,0,0,.2);border-radius:99px}.exr-nav::-webkit-scrollbar-thumb{background:linear-gradient(90deg,#6ee7b7,#a7f3d0);border-radius:99px}.exr-nav::-webkit-scrollbar-thumb:hover{background:#fff}'
+ '.exr-chip{flex:none;width:34px;height:34px;border-radius:10px;border:1.5px solid rgba(255,255,255,.32);background:rgba(255,255,255,.1);color:#fff;font-weight:800;font-size:.8rem;cursor:pointer;position:relative;transition:transform .14s}'
+ '.exr-chip:hover{transform:translateY(-3px)}.exr-chip.done{background:#a7f3d0;color:#064e3b;border-color:#a7f3d0}'
+ '.exr-chip.mark::after{content:"";position:absolute;top:-3px;left:-3px;width:9px;height:9px;border-radius:50%;background:#f59e0b;border:2px solid #fff}'
+ '.exr-note{margin:0 0 12px;border-radius:14px;padding:11px 14px;font-size:.82rem;font-weight:700;line-height:1.8;background:color-mix(in srgb,#10b981 12%,var(--surface,#fff));border:1.5px solid color-mix(in srgb,#0d9488 42%,transparent);color:#047857}'
+ '[data-theme=dark] .exr-note{color:#6ee7b7}'
+ '.exr-note.warn{background:color-mix(in srgb,#f59e0b 14%,var(--surface,#fff));border-color:color-mix(in srgb,#f59e0b 48%,transparent);color:#92400e}[data-theme=dark] .exr-note.warn{color:#fcd34d}'
+ '.exr-note .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}'
+ '.exr-mini{border:1px solid currentColor;background:transparent;color:inherit;border-radius:9px;padding:4px 10px;font-size:.72rem;font-weight:800;cursor:pointer}.exr-mini:hover{background:color-mix(in srgb,currentColor 14%,transparent)}'
+ '.exr-flag{border:1px dashed color-mix(in srgb,#f59e0b 60%,transparent);background:color-mix(in srgb,#f59e0b 10%,transparent);color:#b45309;border-radius:9px;padding:3px 9px;font-size:.7rem;font-weight:800;cursor:pointer;margin-bottom:7px}'
+ '.exr-flag.on{background:#f59e0b;color:#fff;border-style:solid}[data-theme=dark] .exr-flag{color:#fcd34d}'
+ '.exr-strip{margin-top:10px;border-radius:12px;padding:8px 12px;font-size:.77rem;font-weight:700;line-height:1.8;background:color-mix(in srgb,#10b981 10%,var(--surface,#fff));border:1px dashed color-mix(in srgb,#0d9488 45%,transparent);color:#047857}[data-theme=dark] .exr-strip{color:#6ee7b7}'
+ '.exr-badge{display:inline-flex;margin:8px 8px 0 0;background:#0d9488;color:#fff;border-radius:99px;padding:4px 12px;font-size:.71rem;font-weight:800}'
+ 'body.exr-focus #sidebar,body.exr-focus #topbar{opacity:.32;filter:saturate(.5);transition:opacity .3s}body.exr-focus #sidebar:hover,body.exr-focus #topbar:hover{opacity:1;filter:none}'
+ '.exr-hl{animation:exrHl 1.1s ease-out}@keyframes exrHl{0%{box-shadow:0 0 0 3px #10b981}100%{box-shadow:0 0 0 0 transparent}}'
+ '.exr-breath{position:fixed;inset:0;z-index:180;display:grid;place-items:center;background:rgba(4,47,40,.82);backdrop-filter:blur(9px)}'
+ '.exr-breath .box{text-align:center;color:#fff;padding:24px}'
+ '.exr-orb{width:150px;height:150px;margin:0 auto 20px;border-radius:50%;background:radial-gradient(circle at 34% 30%,#a7f3d0,#10b981 58%,#047857);box-shadow:0 0 60px rgba(16,185,129,.6);display:grid;place-items:center;font-size:1.5rem;font-weight:800;transition:transform 4s cubic-bezier(.4,0,.4,1)}'
+ '.exr-breath h3{font-size:1.5rem;margin-bottom:6px}.exr-breath p{opacity:.85;font-size:.86rem;margin-bottom:18px}'
+ '.exr-conf{position:fixed;z-index:190;width:9px;height:14px;border-radius:2px;pointer-events:none}'
+ '@media (max-width:700px){.exr-top{padding:11px 12px}.exr-tools{padding:0 12px 11px}.exr-nav{padding:9px 12px}.exr-msg small{display:none}}';
var st = document.createElement('style'); st.id = 'exr4css'; st.textContent = STYLE_TEXT; document.head.appendChild(st);

/* ---------- صدا ---------- */
function beep(kind) {
  if (!P.sound) return;
  try {
    if (!X.ac) X.ac = new (window.AudioContext || window.webkitAudioContext)();
    if (X.ac.state === 'suspended') X.ac.resume();
    var map = { ok: [660, .07], mark: [880, .05], win: [523, .16], in: [392, .2], out: [294, .2] };
    var m = map[kind] || map.ok, o = X.ac.createOscillator(), g = X.ac.createGain();
    o.type = 'sine'; o.frequency.value = m[0];
    g.gain.setValueAtTime(.0001, X.ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.09, X.ac.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.0001, X.ac.currentTime + m[1]);
    o.connect(g); g.connect(X.ac.destination); o.start(); o.stop(X.ac.currentTime + m[1] + .02);
    if (kind === 'win') setTimeout(function () { beep('mark'); }, 130);
  } catch (e) {}
}
document.addEventListener('pointerdown', function () { try { if (X.ac && X.ac.state === 'suspended') X.ac.resume(); } catch (e) {} }, { passive: true });

/* ---------- تشخیص ---------- */
function isOptBtn(b) {
  if (!b || (b.closest && b.closest('.exr'))) return false;
  var cls = ' ' + (b.className || '') + ' ', act = (b.dataset && b.dataset.act) || '';
  return /\b(opt|option|choice|answer|ans)\b/.test(cls) || /answer|choice|opt|pick|ans/i.test(act) || b.hasAttribute('data-opt') || b.hasAttribute('data-idx') || b.hasAttribute('data-choice');
}
function optButtons(el) {
  var radios = [].slice.call(el.querySelectorAll('input[type=radio]'));
  var opts = [].slice.call(el.querySelectorAll('button')).filter(isOptBtn);
  var all = opts.concat(radios);
  if (all.length >= 2) return all;
  var plain = [].slice.call(el.querySelectorAll('button')).filter(function (b) {
    if (b.closest('.exr')) return false;
    var t = txt(b); return t.length > 0 && t.length < 60;
  });
  return (plain.length >= 2 && plain.length <= 6) ? plain : [];
}
function isSel(b) {
  if (b.type === 'radio') return b.checked;
  return /(^|\s)(on|selected|active|chosen|picked|sel)(\s|$)/.test(b.className || '') || b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-pressed') === 'true' || (b.dataset && b.dataset.selected === '1');
}
function findSubmit(root) {
  var bs = [].slice.call(root.querySelectorAll('button'));
  for (var i = 0; i < bs.length; i++) {
    var b = bs[i];
    if (b.closest('.exr')) continue;
    var act = (b.dataset && b.dataset.act) || '';
    if (/quiz\.submit|quiz\.finish|exam\.submit/i.test(act) || /ثبت نهایی|ثبت آزمون|ارسال پاسخ|پایان آزمون|اتمام آزمون|ثبت پاسخ/.test(txt(b))) return b;
  }
  return null;
}
function findBlocks(root) {
  var out = [].slice.call(root.querySelectorAll('[data-qid],[data-q],[data-question],.qcard,.question,.quiz-q,.qbox,.qitem,.q-card')).filter(function (el) { return !el.closest('.exr'); });
  if (!out.length) {
    var radios = [].slice.call(root.querySelectorAll('input[type=radio][name]')), names = [];
    radios.forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); });
    names.forEach(function (n) {
      var els = radios.filter(function (r) { return r.name === n; }), p = els[0].parentElement;
      while (p && p !== root && !els.every(function (e) { return p.contains(e); })) p = p.parentElement;
      if (p && p !== root) out.push(p);
    });
  }
  if (!out.length) {
    var btns = [].slice.call(root.querySelectorAll('button')).filter(isOptBtn), conts = [];
    btns.forEach(function (b) {
      var p = b.parentElement;
      while (p && p !== root && btns.filter(function (x) { return p.contains(x); }).length < 2) p = p.parentElement;
      if (p && p !== root && conts.indexOf(p) < 0) conts.push(p);
    });
    out = conts;
  }
  [].slice.call(root.querySelectorAll('textarea[name]')).forEach(function (t) {
    if (t.closest('.exr')) return;
    var p = t.closest('.card,.field,.qcard,div') || t.parentElement;
    if (p && p !== root && !out.some(function (o) { return o.contains(t); })) out.push(p);
  });
  out = out.filter(function (el, i, a) { return a.indexOf(el) === i; });
  out = out.filter(function (el) { return !out.some(function (o) { return o !== el && el.contains(o); }); });
  return out.slice(0, 80);
}
function qidOf(v, submit) {
  var u = ui(), cands = [u.quizId, u.qid, u.examId, u.activeQuiz];
  var dq = v.querySelector('[data-quiz-id],[data-qid],[data-exam-id]');
  if (dq) cands.push(dq.dataset.quizId || dq.dataset.qid || dq.dataset.examId);
  if (submit && submit.dataset.id) cands.push(submit.dataset.id);
  for (var i = 0; i < cands.length; i++) if (cands[i]) return String(cands[i]);
  return 'auto' + hash(txt(v.querySelector('h1,h2,h3')) + '|' + String(u.section || ''));
}
function blockKey(b) { return hash(txt(b).slice(0, 90)); }

/* ---------- ذخیره ---------- */
function dkey() { return 'sh_exr4_' + X.qid + '_' + SID(); }
function read() { try { return JSON.parse(localStorage.getItem(dkey()) || 'null'); } catch (e) { return null; } }
function write(s) { try { localStorage.setItem(dkey(), JSON.stringify(s)); } catch (e) {} }
function drop() { try { localStorage.removeItem(dkey()); } catch (e) {} }
function listDrafts() {
  var out = [], pre = 'sh_exr4_', suf = '_' + SID();
  try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(pre) === 0 && k.slice(-suf.length) === suf) out.push(k.slice(pre.length, -suf.length)); } } catch (e) {}
  return out;
}
function snapshot() {
  var v = V(); if (!v) return null;
  var fields = {};
  [].slice.call(v.querySelectorAll('input[name],textarea[name],select[name]')).forEach(function (el) {
    if (el.closest('.exr')) return;
    if (el.type === 'checkbox') { fields[el.name] = fields[el.name] || []; if (el.checked) fields[el.name].push(el.value); }
    else if (el.type === 'radio') { if (el.checked) fields[el.name] = el.value; }
    else fields[el.name] = el.value;
  });
  var opts = {};
  X.blocks.forEach(function (b) { var bs = optButtons(b); for (var i = 0; i < bs.length; i++) if (isSel(bs[i])) { opts[blockKey(b)] = i; break; } });
  return { fields: fields, opts: opts, marks: X.marks, at: Date.now() };
}
function restore(snap) {
  var v = V(); if (!v || !snap) return;
  X.busy = true;
  try {
    Object.keys(snap.fields || {}).forEach(function (k) {
      [].slice.call(v.querySelectorAll('[name="' + escq(k) + '"]')).forEach(function (el) {
        var val = snap.fields[k];
        if (el.type === 'checkbox') el.checked = Array.isArray(val) && val.indexOf(el.value) > -1;
        else if (el.type === 'radio') el.checked = val === el.value;
        else if (!el.value) el.value = val == null ? '' : val;
      });
    });
    X.blocks.forEach(function (b) {
      var idx = (snap.opts || {})[blockKey(b)];
      if (idx == null) return;
      var t = optButtons(b)[idx];
      if (t && !isSel(t)) { if (t.type === 'radio') { t.checked = true; t.dispatchEvent(new Event('change', { bubbles: true })); } else t.click(); }
    });
    X.marks = snap.marks || {};
  } catch (e) {}
  setTimeout(function () { X.busy = false; }, 300);
}
function answered() {
  var n = 0;
  X.blocks.forEach(function (b) {
    if (b.querySelector('input:checked')) { n++; return; }
    var ta = b.querySelector('textarea,input[type=text]');
    if (ta && ta.value.trim()) { n++; return; }
    if (optButtons(b).some(isSel)) n++;
  });
  return n;
}
function pulseSave() { var s = document.getElementById('exrSave'); if (!s) return; s.classList.add('on'); setTimeout(function () { s.classList.remove('on'); }, 1100); }
function doSave() {
  if (X.busy || X.mode !== 'run') return;
  clearTimeout(X.saveT);
  X.saveT = setTimeout(function () { var s = snapshot(); if (s) { write(s); pulseSave(); paint(); } }, 220);
}

/* ---------- رابط ---------- */
function barHTML() {
  return '<div class="exr-bar exr" id="exrBar">'
  + '<div class="exr-top"><span class="exr-heart">💚</span>'
  + '<div class="exr-msg" id="exrMsg"><b>پاسخ‌هایت لحظه‌ای ذخیره می‌شود</b><small>بدون عجله؛ اگر صفحه بسته شد، از همین‌جا ادامه می‌دهی.</small></div>'
  + '<div class="exr-stat"><span class="exr-pill" id="exrCount">📝 <b>۰</b>/۰</span><span class="exr-pill" id="exrClock">⏱ <b>۰۰:۰۰</b></span><span class="exr-pill exr-save" id="exrSave">✓ ذخیره شد</span></div></div>'
  + '<div class="exr-tools">'
  + '<button type="button" class="exr-t' + (P.sound ? ' on' : '') + '" data-exr="sound">' + (P.sound ? '🔊 صدا' : '🔇 بی‌صدا') + '</button>'
  + '<button type="button" class="exr-t' + (P.focus ? ' on' : '') + '" data-exr="focus">🎯 تمرکز</button>'
  + '<button type="button" class="exr-t' + (P.nav ? ' on' : '') + '" data-exr="nav">🧭 ناوبری</button>'
  + '<button type="button" class="exr-t' + (P.clock ? ' on' : '') + '" data-exr="clock">⏱ زمان</button>'
  + '<span class="exr-step"><button type="button" data-exr="fs-">−</button><b id="exrFs">متن ' + fa(100 + P.fs * 12) + '٪</b><button type="button" data-exr="fs+">+</button></span>'
  + '<button type="button" class="exr-t" data-exr="breath">🌬️ نفس عمیق</button>'
  + '<button type="button" class="exr-t" data-exr="reset">♻️ پاک‌کردن پیش‌نویس</button>'
  + '</div><div class="exr-prog"><i id="exrProg" style="width:0%"></i></div>'
  + '<div class="exr-nav" id="exrNav"></div></div>';
}
function build() {
  var v = V(); if (!v) return;
  if (!X.startedAt) X.startedAt = Date.now();
  if (!document.getElementById('exrBar')) v.insertAdjacentHTML('afterbegin', barHTML());
  document.body.classList.toggle('exr-focus', !!P.focus);
  applyFont();
  var snap = read();
  if (snap && X.restored !== X.qid) {
    X.restored = X.qid;
    restore(snap);
    var n = Object.keys(snap.opts || {}).length + Object.keys(snap.fields || {}).filter(function (k) { var x = snap.fields[k]; return Array.isArray(x) ? x.length : String(x || '').trim(); }).length;
    if (n && !document.getElementById('exrBack')) {
      document.getElementById('exrBar').insertAdjacentHTML('afterend', '<div class="exr exr-note" id="exrBack"><div class="row"><span>💚</span><span style="flex:1;min-width:180px">' + fa(n) + ' پاسخ قبلی‌ات بازگردانی شد — از همان‌جا ادامه بده.</span><button type="button" class="exr-mini" data-exr="dismiss">باشه</button></div></div>');
      beep('ok');
    }
  }
  if (!navigator.onLine) showOffline(true);
  injectFlags(); bindInputs(); paint(); startBreath();
}
function teardown() {
  stopBreath();
  document.body.classList.remove('exr-focus');
  ['exrBar', 'exrBack', 'exrOff', 'exrUndo', 'exrLobby'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); });
  [].slice.call(document.querySelectorAll('.exr-flag')).forEach(function (e) { e.remove(); });
  X.restored = ''; X.startedAt = 0; X.marks = {}; X.navSig = '';
}
function bindInputs() {
  var v = V(); if (!v) return;
  [].slice.call(v.querySelectorAll('input,textarea,select')).forEach(function (el) {
    if (el.dataset.exrB || el.closest('.exr')) return;
    el.dataset.exrB = '1';
    el.addEventListener('input', doSave);
    el.addEventListener('change', doSave);
  });
}
function injectFlags() {
  X.blocks.forEach(function (b, i) {
    if (b.querySelector('.exr-flag')) return;
    var key = blockKey(b);
    var f = document.createElement('button');
    f.type = 'button'; f.className = 'exr exr-flag' + (X.marks[key] ? ' on' : '');
    f.dataset.exr = 'mark'; f.dataset.key = key;
    f.textContent = X.marks[key] ? '🚩 نشان‌دار — بازبینی' : '🏳️ نشان برای بازبینی';
    b.insertBefore(f, b.firstChild);
  });
}
function applyFont() {
  var scale = 1 + P.fs * .12;
  X.blocks.forEach(function (b) {
    var t = b.querySelector('p,.qtext,.qtitle,b,strong') || b;
    if (!t.dataset.exrBase) t.dataset.exrBase = String(parseFloat(getComputedStyle(t).fontSize) || 15);
    t.style.fontSize = (parseFloat(t.dataset.exrBase) * scale).toFixed(1) + 'px';
  });
}
function paint() {
  var total = X.blocks.length, done = answered();
  var cEl = document.getElementById('exrCount');
  if (cEl) cEl.innerHTML = '📝 <b>' + fa(done) + '</b>/' + fa(total || 0);
  var pr = document.getElementById('exrProg');
  if (pr) pr.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  var ck = document.getElementById('exrClock');
  if (ck) {
    ck.style.display = P.clock ? '' : 'none';
    if (P.clock && X.startedAt) {
      var s = Math.floor((Date.now() - X.startedAt) / 1000);
      ck.innerHTML = '⏱ <b>' + fa(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + fa(String(s % 60).padStart(2, '0')) + '</b>';
    }
  }
  var nav = document.getElementById('exrNav');
  if (nav) {
    nav.style.display = (P.nav && total) ? 'flex' : 'none';
    if (P.nav && total) {
      var sig = total + '|' + done + '|' + X.blocks.map(function (b) { return (b.querySelector('input:checked') || optButtons(b).some(isSel) ? '1' : '0') + (X.marks[blockKey(b)] ? 'm' : ''); }).join('');
      if (sig !== X.navSig) {
        X.navSig = sig;
        nav.innerHTML = X.blocks.map(function (b, i) {
          var ok = !!b.querySelector('input:checked') || optButtons(b).some(isSel) || (function () { var t = b.querySelector('textarea,input[type=text]'); return t && t.value.trim(); })();
          return '<button type="button" class="exr-chip' + (ok ? ' done' : '') + (X.marks[blockKey(b)] ? ' mark' : '') + '" data-exr="go" data-i="' + i + '">' + fa(i + 1) + '</button>';
        }).join('');
      }
    }
  }
}
function showOffline(on) {
  var ex = document.getElementById('exrOff');
  if (!on) { if (ex) ex.remove(); return; }
  if (ex) return;
  var bar = document.getElementById('exrBar'), v = V(); if (!v) return;
  var html = '<div class="exr exr-note warn" id="exrOff"><div class="row"><span>📴</span><span style="flex:1;min-width:180px">اتصال قطع است — نگران نباش؛ پاسخ‌ها روی همین دستگاه امن می‌مانند و به‌محض بازگشت اینترنت ثبت می‌شوند.</span></div></div>';
  if (bar) bar.insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('afterbegin', html);
}

/* ---------- تنفس ---------- */
function startBreath() {
  stopBreath();
  if (!P.breath) return;
  X.breathIv = setInterval(function () {
    var m = document.getElementById('exrMsg'); if (!m) return;
    var list = [['🌬️ یک نفس عمیق؛ دم… بازدم…', 'شانه‌ها را شل کن. هیچ‌کس قرار نیست قضاوتت کند.'], ['💧 یک جرعه آب بخور', 'آب، تمرکز مغز را برمی‌گرداند.'], ['👀 بیست ثانیه به دورترین نقطه نگاه کن', 'چشم خسته، ذهن خسته می‌سازد.'], ['🧘 سؤال‌های آسان را اول بزن', 'اعتمادبه‌نفس، سوختِ ادامهٔ راه است.']];
    var x = list[Math.floor(Math.random() * list.length)];
    m.innerHTML = '<b>' + x[0] + '</b><small>' + x[1] + '</small>';
    beep('in');
    setTimeout(function () { if (m) m.innerHTML = '<b>پاسخ‌هایت لحظه‌ای ذخیره می‌شود</b><small>بدون عجله؛ اگر صفحه بسته شد، از همین‌جا ادامه می‌دهی.</small>'; }, 9000);
  }, P.breath * 60000);
}
function stopBreath() { if (X.breathIv) { clearInterval(X.breathIv); X.breathIv = 0; } }
function closeBreath() { X.breathTimers.forEach(clearTimeout); X.breathTimers = []; var e = document.getElementById('exrBreath'); if (e) e.remove(); }
function breathOverlay() {
  if (document.getElementById('exrBreath')) return;
  var el = document.createElement('div');
  el.className = 'exr exr-breath'; el.id = 'exrBreath';
  el.innerHTML = '<div class="box"><div class="exr-orb" id="exrOrb">۴</div><h3 id="exrPh">دم بگیر</h3><p id="exrSub">۴ ثانیه از بینی… آرام</p><button type="button" class="exr-t" data-exr="breathClose">بازگشت به آزمون</button></div>';
  document.body.appendChild(el);
  var orb = el.querySelector('#exrOrb'), ph = el.querySelector('#exrPh'), sub = el.querySelector('#exrSub');
  var phases = [['دم بگیر', '۴ ثانیه از بینی… آرام', 4, 1.55], ['نگه دار', '۷ ثانیه حبس کن… راحت باش', 7, 1.55], ['بازدم', '۸ ثانیه از دهان… رها کن', 8, 1]];
  var cycle = 0, i = 0;
  function step() {
    if (!document.getElementById('exrBreath')) return;
    if (i >= phases.length) { i = 0; cycle++; if (cycle >= 3) { closeBreath(); beep('win'); return; } }
    var p = phases[i];
    ph.textContent = p[0]; sub.textContent = p[1];
    orb.style.transitionDuration = p[2] + 's'; orb.style.transform = 'scale(' + p[3] + ')';
    beep(i === 2 ? 'out' : 'in');
    var left = p[2]; orb.textContent = fa(left);
    var iv = setInterval(function () { left--; if (left <= 0 || !document.getElementById('exrBreath')) { clearInterval(iv); return; } orb.textContent = fa(left); }, 1000);
    X.breathTimers.push(iv);
    i++;
    X.breathTimers.push(setTimeout(step, p[2] * 1000));
  }
  step();
}
function confetti() {
  var cols = ['#10b981', '#6ee7b7', '#fbbf24', '#2563eb', '#7c3aed', '#e11d48'];
  for (var i = 0; i < 30; i++) {
    var d = document.createElement('div'); d.className = 'exr-conf';
    d.style.background = cols[i % cols.length];
    d.style.left = (innerWidth / 2) + 'px'; d.style.top = (innerHeight / 3) + 'px';
    document.body.appendChild(d);
    var a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 190;
    d.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + (Math.cos(a) * r) + 'px), calc(-50% + ' + (Math.sin(a) * r + 160) + 'px)) rotate(' + (400 + Math.random() * 500) + 'deg)', opacity: 0 }], { duration: 1000 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(d);
  }
}

/* ---------- داشبورد و لابی ---------- */
var STRESS = /فقط یک بار|یک بار فرصت|محدودیت ورود|قفل|دیر شد|فرصت از دست|زمان تمام/;
function calmDash(v) {
  var drafts = listDrafts();
  [].slice.call(v.querySelectorAll('.card,.ins,.banner,[class*="quiz"],[class*="exam"]')).forEach(function (card) {
    if (card.closest('.exr') || card.dataset.exrCalm) return;
    if (!/آزمون/.test(txt(card))) return;
    var btns = [].slice.call(card.querySelectorAll('button')).filter(function (b) { return /quiz|exam|qz/i.test((b.dataset && b.dataset.act) || '') || /شروع|ورود|ادامه|شرکت/.test(txt(b)); });
    if (!btns.length) return;
    card.dataset.exrCalm = '1';
    btns.forEach(function (b) { b.removeAttribute('disabled'); b.title = 'ورود آزاد — پاسخ‌ها خودکار ذخیره می‌شوند'; });
    [].slice.call(card.querySelectorAll('span,small,b,p,div')).forEach(function (el) {
      if (el.children.length) return;
      var s = el.textContent || '';
      if (!STRESS.test(s)) return;
      el.textContent = s.replace(/فقط یک بار[^.،؛]*/g, 'هر بار از همان‌جا ادامه می‌دهی').replace(/یک بار فرصت[^.،؛]*/g, 'فرصت نامحدود').replace(/محدودیت ورود[^.،؛]*/g, 'ورود آزاد').replace(/قفل/g, 'باز');
      el.style.color = '#047857'; el.style.fontWeight = '800';
    });
    if (!card.querySelector('.exr-strip')) {
      var s2 = document.createElement('div'); s2.className = 'exr exr-strip';
      s2.textContent = '💚 ورود آزاد است؛ هر پاسخ همان لحظه روی دستگاه ذخیره می‌شود. قطع اینترنت چیزی را از بین نمی‌برد.';
      card.appendChild(s2);
    }
    var id = (btns[0].dataset && (btns[0].dataset.id || btns[0].dataset.qid)) || '';
    var has = (id && drafts.indexOf(id) > -1) || (!id && drafts.length === 1);
    if (has && !card.querySelector('.exr-badge')) {
      var b2 = document.createElement('span'); b2.className = 'exr exr-badge';
      b2.textContent = '💚 پیش‌نویس داری — از همان‌جا ادامه می‌دهی';
      card.appendChild(b2);
    }
  });
}
function lobby(v) {
  calmDash(v);
  if (!v.querySelector('#exrLobby')) {
    var d = document.createElement('div'); d.id = 'exrLobby'; d.className = 'exr exr-note';
    d.innerHTML = '<div class="row"><span>💚</span><span style="flex:1;min-width:180px"><b>حالت آزمونِ آرام فعال است.</b> ورود آزاد است و هر پاسخ همان لحظه ذخیره می‌شود؛ قطع اینترنت چیزی را از بین نمی‌برد.</span></div>';
    v.insertBefore(d, v.firstChild);
  }
}

/* ---------- کنترل‌ها ---------- */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-exr]');
  if (!b) return;
  var a = b.dataset.exr;
  if (a === 'sound') { P.sound = !P.sound; saveP(); b.classList.toggle('on', P.sound); b.textContent = P.sound ? '🔊 صدا' : '🔇 بی‌صدا'; if (P.sound) beep('ok'); }
  else if (a === 'focus') { P.focus = !P.focus; saveP(); b.classList.toggle('on', P.focus); document.body.classList.toggle('exr-focus', P.focus); beep('mark'); }
  else if (a === 'nav') { P.nav = !P.nav; saveP(); b.classList.toggle('on', P.nav); X.navSig = ''; paint(); beep('mark'); }
  else if (a === 'clock') { P.clock = !P.clock; saveP(); b.classList.toggle('on', P.clock); paint(); }
  else if (a === 'fs+' || a === 'fs-') { P.fs = clamp(P.fs + (a === 'fs+' ? 1 : -1), -1, 4); saveP(); applyFont(); var l = document.getElementById('exrFs'); if (l) l.textContent = 'متن ' + fa(100 + P.fs * 12) + '٪'; }
  else if (a === 'breath') breathOverlay();
  else if (a === 'breathClose') closeBreath();
  else if (a === 'dismiss') { var n = document.getElementById('exrBack'); if (n) n.remove(); }
  else if (a === 'go') { var t = X.blocks[num(b.dataset.i)]; if (!t) return; t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('exr-hl'); setTimeout(function () { t.classList.remove('exr-hl'); }, 1200); beep('mark'); }
  else if (a === 'mark') {
    var key = b.dataset.key; X.marks[key] = !X.marks[key];
    b.classList.toggle('on', X.marks[key]);
    b.textContent = X.marks[key] ? '🚩 نشان‌دار — بازبینی' : '🏳️ نشان برای بازبینی';
    X.navSig = ''; doSave(); paint(); beep('mark');
  }
  else if (a === 'reset') {
    var backup = read(); drop(); X.marks = {}; X.navSig = '';
    [].slice.call(document.querySelectorAll('.exr-flag.on')).forEach(function (f) { f.classList.remove('on'); f.textContent = '🏳️ نشان برای بازبینی'; });
    paint();
    var bar = document.getElementById('exrBar');
    if (bar && !document.getElementById('exrUndo')) {
      bar.insertAdjacentHTML('afterend', '<div class="exr exr-note warn" id="exrUndo"><div class="row"><span>♻️</span><span style="flex:1;min-width:160px">پیش‌نویس پاک شد.</span><button type="button" class="exr-mini" data-exr="undo">↩️ واگرد</button></div></div>');
      var u = document.getElementById('exrUndo');
      u.querySelector('[data-exr="undo"]').addEventListener('click', function () { if (backup) { write(backup); restore(backup); } u.remove(); X.navSig = ''; paint(); beep('ok'); }, { once: true });
      setTimeout(function () { var z = document.getElementById('exrUndo'); if (z) z.remove(); }, 9000);
    }
  }
}, true);
document.addEventListener('click', function (e) {
  if (X.mode !== 'run' || X.busy) return;
  var v = V(); if (!v || !v.contains(e.target)) return;
  if (e.target.closest && (e.target.closest('.exr') || e.target.closest('button'))) setTimeout(doSave, 80);
}, true);
window.addEventListener('offline', function () { if (X.mode === 'run') showOffline(true); });
window.addEventListener('online', function () { showOffline(false); if (X.mode === 'run') { var s = snapshot(); if (s) write(s); } });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBreath(); });

/* ---------- ثبت نهایی ---------- */
try {
  if (typeof send === 'function') {
    var baseSend = send;
    send = function (type, cmd, patch, opts) {
      var isSubmit = typeof type === 'string' && /quiz\.submit|quiz\.finish|exam\.submit/.test(type);
      var p;
      try { p = baseSend.apply(this, arguments); } catch (err) { if (isSubmit) { var s0 = snapshot(); if (s0) write(s0); showOffline(true); } throw err; }
      return Promise.resolve(p).then(function (r) {
        if (isSubmit) {
          if (r) { drop(); stopBreath(); confetti(); beep('win'); }
          else { var s1 = snapshot(); if (s1) write(s1); showOffline(true); say('📴 ثبت نشد، ولی پاسخ‌هایت امن ذخیره شد. اینترنت که برگشت دوباره بزن.', 'warn'); }
        }
        return r;
      }, function (err) {
        if (isSubmit) { var s2 = snapshot(); if (s2) write(s2); showOffline(true); say('📴 ثبت نشد، ولی پاسخ‌هایت امن ذخیره شد. اینترنت که برگشت دوباره بزن.', 'warn'); }
        throw err;
      });
    };
  }
} catch (e) {}

/* ---------- چرخهٔ حیات ---------- */
function tick() {
  try {
    var v = V(), s = sess();
    if (!v || !s) { if (X.mode === 'run') teardown(); X.mode = null; return; }
    var u = ui(), sec = String(u.section || '');
    var head = txt(v.querySelector('h1,h2,h3'));
    var secHit = /quiz|exam|آزمون/i.test(sec), headHit = /آزمون/.test(head);
    var teacher = s.role === 'teacher';
    var submit = findSubmit(v);
    var radios = v.querySelectorAll('input[type=radio][name]').length;
    var essay = v.querySelectorAll('textarea[name]').length;
    var optCount = [].slice.call(v.querySelectorAll('button')).filter(isOptBtn).length;
    var cheapSig = sec + '|' + head + '|' + radios + '|' + essay + '|' + optCount + '|' + (submit ? 1 : 0);
    var interactive = radios > 0 || essay > 0 || optCount >= 2;
    var mode = (!teacher && (secHit || headHit || submit) && interactive) ? 'run' : ((secHit || headHit) ? 'lobby' : null);
    if (mode === 'run') {
      if (X.mode !== 'run' || cheapSig !== X.sig) {
        X.mode = 'run'; X.sig = cheapSig;
        X.blocks = findBlocks(v); X.qid = qidOf(v, submit); X.navSig = '';
        build();
      } else { injectFlags(); bindInputs(); paint(); }
    } else {
      if (X.mode === 'run') teardown();
      X.mode = mode; X.sig = cheapSig;
      if (mode === 'lobby') lobby(v); else calmDash(v);
    }
  } catch (e) {}
}
try {
  if (typeof renderView === 'function') {
    var baseRV = renderView;
    renderView = function () { var r = baseRV.apply(this, arguments); setTimeout(tick, 140); return r; };
  }
} catch (e) {}
X.tickIv = setInterval(tick, 900);
if (typeof MutationObserver !== 'undefined') {
  var q = false;
  X.mo = new MutationObserver(function () { if (q) return; q = true; requestAnimationFrame(function () { q = false; tick(); }); });
  var attach = function () { var m = document.getElementById('main') || document.body; if (m) X.mo.observe(m, { childList: true, subtree: true }); };
  if (document.body) attach(); else document.addEventListener('DOMContentLoaded', attach);
}
tick();
})();
