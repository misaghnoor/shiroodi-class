/* terms.js — نوبت اول و نمرهٔ دوم: میانگین بازه‌ای همهٔ دروس + انضباط، با بازهٔ دلخواه معلم */
(function () {
'use strict';
if (window.__TERMS1__) return; window.__TERMS1__ = true;

var C = window.ClassCore || {};
function Sx(){ try { return (typeof S === 'function' && S()) ? S() : null; } catch (e) { return null; } }
function SE(){ try { return (typeof SESS !== 'undefined' && SESS) ? SESS : null; } catch (e) { return null; } }
function UX(){ try { return (typeof UI !== 'undefined' && UI) ? UI : {}; } catch (e) { return {}; } }
function teacher(){ try { if (typeof isT === 'function') return isT(); } catch (e) {} var s = SE(); return !!(s && s.role === 'teacher'); }
function fa(n){ return C.fa ? C.fa(n) : String(n == null ? '' : n).replace(/\d/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'[+d]; }); }
function fn(v, d){ if (v == null || !isFinite(v)) return '—'; return C.faNum ? C.faNum(v, d == null ? 1 : d) : fa(Number(v).toFixed(d == null ? 1 : d)); }
function esc(s){ return C.esc ? C.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }
function num(v){ if (C.num) return C.num(v); return Number(String(v == null ? '' : v).replace(/[۰-۹]/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })) || 0; }
function en(v){ if (C.en) return C.en(v); return String(v == null ? '' : v).replace(/[۰-۹]/g, function(d){ return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }); }
function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
function avg(a){ if (!a || !a.length) return 0; var t = 0; for (var i = 0; i < a.length; i++) t += Number(a[i]) || 0; return t / a.length; }
function nz(s){ return C.norm ? C.norm(s) : String(s == null ? '' : s).trim().toLowerCase(); }
function uid(){ return C.uid ? C.uid() : 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function jOf(i){ return C.jOf(i); }
function jISO(y, m, d){ return C.jToISO(y, m, d); }
function jL(i){ return C.jLabel ? C.jLabel(i) : i; }
function jS(i){ return C.jShort ? C.jShort(i) : i; }
function td(){ return C.todayISO(); }
function mlen(y, m){ return (C.Jalali && C.Jalali.monthLen) ? C.Jalali.monthLen(y, m) : (m <= 6 ? 31 : m <= 11 ? 30 : 29); }
function MN(){ return C.JMONTHS || ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']; }
function sc(s, g){ try { return C.scoreOf(s, g); } catch (e) { return null; } }
function mx(s){ try { return C.LMAX(s) || 4; } catch (e) { return 4; } }
function li(s, v){ try { return cl(Math.round(C.levelIdxOfScore(s, v)), 0, (s.levels || []).length - 1); } catch (e) { return 0; } }
function stu(s, id){ try { return C.stuById(s, id); } catch (e) { return null; } }
function grp(s, id){ try { return C.groupOf(s, id); } catch (e) { return null; } }
function CP(){ return C.CPAL || ['#0d9488','#1d4ed8','#d97706','#e11d48','#65a30d','#7c3aed','#0ea5e9','#f59e0b']; }
function snd(k){ try { if (typeof Sound !== 'undefined' && Sound && Sound.play) Sound.play(k); } catch (e) {} }
function say(m, k, a, ms){ try { if (typeof toast === 'function') toast(m, k || 'ok', a || null, ms || 5200); } catch (e) {} }
function drw(t, h, w){ try { if (typeof openDrawer === 'function') openDrawer(t, h, w); } catch (e) {} }
function ask(o){ try { if (typeof promptDlg === 'function') promptDlg(o); } catch (e) {} }
function cf(o){ try { if (typeof confirmDlg === 'function') confirmDlg(o); } catch (e) {} }
function dl(n, c, t){ try { if (typeof download === 'function') download(n, c, t); } catch (e) {} }
function csvOf(rows){ try { return C.serializeCSV(Sx(), rows); } catch (e) { return rows.map(function(r){ return r.join(','); }).join('\n'); } }
function pr(h){ try { if (typeof printSheet === 'function') printSheet(h); } catch (e) {} }
function pv(t, h){ try { if (typeof previewSheet === 'function') previewSheet(t, h); } catch (e) {} }
function av(s, c){ try { if (typeof avHTML === 'function') return avHTML(s, c); } catch (e) {} return '<span class="av ' + (c || '') + '">' + esc((s && s.name || '؟').slice(0, 2)) + '</span>'; }
function sHead(t, b){ try { if (typeof sheetHead === 'function') return sheetHead(t, b); } catch (e) {} return '<div class="sh"><h1>' + esc(t) + '</h1></div>'; }
function sFoot(){ try { if (typeof sheetFoot === 'function') return sheetFoot(); } catch (e) {} return ''; }

/* ---------------- state ---------------- */
var KEY = 'sh_terms_v1';
var T = { from: '', to: '', m2: 'year', from2: '', to2: '', calc: 'avg', w: { oral: 1, written: 1.5, performance: 1.25, homework: .75 },
  disc: false, discK: .12, absent: true, cmp: true, disp: 'level', group: 'all', q: '', sort: 'name', view: 'matrix',
  heat: 't1', pal: 'tile', font: 100, order: [], saved: [], sel: {} };
try { var sv = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in sv) if (k in T) T[k] = sv[k]; } catch (e) {}
var PT = 0;
function keep(){ clearTimeout(PT); PT = setTimeout(function(){ try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} }, 260); }

function yb(){
  var s = Sx(), raw = en((s && s.meta && s.meta.year) || ''), m = String(raw).match(/(\d{4})\D+(\d{4})/), a, b;
  if (m) { a = +m[1]; b = +m[2]; } else { var j = jOf(td()); a = j.jm >= 7 ? j.jy : j.jy - 1; b = a + 1; }
  return { a: a, b: b, start: jISO(a, 7, 1), end: jISO(b, 6, mlen(b, 6)) };
}
function ensureRanges(){
  var y = yb();
  if (!T.from) T.from = y.start;
  if (!T.to) T.to = jISO(y.a, 10, Math.min(30, mlen(y.a, 10)));
  if (!T.from2) T.from2 = jISO(y.a, 11, 1);
  if (!T.to2) T.to2 = y.end;
  if (T.to < T.from) T.to = T.from;
}
function R(){
  var y = yb();
  var r2 = T.m2 === 'year' ? { from: y.start, to: y.end } : T.m2 === 'h2' ? { from: jISO(y.a, 11, 1), to: y.end } : { from: T.from2, to: T.to2 };
  return { r1: { from: T.from, to: T.to }, r2: r2, y: y };
}
function getD(k){ return k === 'from' ? T.from : k === 'to' ? T.to : k === 'from2' ? T.from2 : T.to2; }
function setD(k, v){ if (k === 'from') T.from = v; else if (k === 'to') T.to = v; else if (k === 'from2') T.from2 = v; else T.to2 = v; }

/* ---------------- model ---------------- */
function subjects(){
  var s = Sx(), all = (s && s.subjects) || [], out = [];
  (T.order || []).forEach(function(n){ if (all.indexOf(n) > -1 && out.indexOf(n) < 0) out.push(n); });
  all.forEach(function(n){ if (out.indexOf(n) < 0) out.push(n); });
  T.order = out.slice();
  return out;
}
function items(s, sid, sub, r){
  var out = [], as = s.assessments || [];
  for (var i = 0; i < as.length; i++) {
    var a = as[i];
    if (!a.subjects || a.subjects.indexOf(sub) < 0) continue;
    if (!a.date || a.date < r.from || a.date > r.to) continue;
    var col = ((s.grades || {})[a.id] || {})[sub]; if (!col) continue;
    var v = sc(s, col[sid]); if (v == null) continue;
    out.push({ id: a.id, title: a.title, date: a.date, type: a.type, g: col[sid], sc: v });
  }
  out.sort(function(x, y){ return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });
  return out;
}
function valueOf(list){
  if (!list.length) return null;
  if (T.calc === 'last') return list[list.length - 1].sc;
  if (T.calc === 'best') return Math.max.apply(null, list.map(function(x){ return x.sc; }));
  if (T.calc === 'weighted') { var sw = 0, ss = 0; list.forEach(function(x){ var w = T.w[x.type] == null ? 1 : Number(T.w[x.type]); sw += w; ss += x.sc * w; }); return sw ? ss / sw : avg(list.map(function(x){ return x.sc; })); }
  return avg(list.map(function(x){ return x.sc; }));
}
function discOf(s, sid, r){
  var pos = 0, neg = 0, n = 0, ev = [];
  (s.discipline || []).forEach(function(d){
    if (d.sid !== sid || !d.date || d.date < r.from || d.date > r.to) return;
    var p = Number(d.points) || 0; n++; ev.push(d);
    if (p > 0) pos += p; else neg += -p;
  });
  ev.sort(function(a, b){ return a.date < b.date ? 1 : -1; });
  return { pos: pos, neg: neg, net: pos - neg, n: n, ev: ev };
}
function attOf(s, sid, r){
  var p = 0, t = 0, ab = 0, ex = 0, lt = 0;
  var at = s.attendance || {};
  Object.keys(at).forEach(function(d){
    if (d < r.from || d > r.to) return;
    var v = at[d][sid]; if (!v) return;
    t++; if (v === 'present') p++; else if (v === 'late') { p++; lt++; } else if (v === 'absent') ab++; else ex++;
  });
  return { rate: t ? Math.round(p / t * 100) : null, total: t, absent: ab, late: lt, excused: ex };
}
function absentMarks(s, sid, r){
  var n = 0, seen = {};
  (s.assessments || []).forEach(function(a){
    if (!a.date || a.date < r.from || a.date > r.to || seen[a.date]) return;
    if (((s.attendance || {})[a.date] || {})[sid] === 'absent') { seen[a.date] = 1; n++; }
  });
  return n;
}
var MODEL = null;
function build(){
  var s = Sx(); if (!s) return null;
  ensureRanges();
  var rr = R(), subs = subjects(), M = mx(s), rows = [], q = nz(T.q), qn = en(T.q);
  var pool = (s.students || []).filter(function(x){
    if (T.group !== 'all') { var g = grp(s, x.id); if (T.group === 'none' ? !!g : (!g || g.id !== T.group)) return false; }
    if (q && nz(x.name).indexOf(q) < 0 && String(x.code || '').indexOf(qn) < 0) return false;
    return true;
  });
  pool.forEach(function(x){
    var cells = [], v1 = [], v2 = [];
    subs.forEach(function(sub){
      var l1 = items(s, x.id, sub, rr.r1), l2 = items(s, x.id, sub, rr.r2);
      var a = valueOf(l1), b = valueOf(l2);
      if (a != null) v1.push(a); if (b != null) v2.push(b);
      cells.push({ sub: sub, a: a, b: b, n1: l1.length, n2: l2.length, d: (a != null && b != null) ? b - a : null, l1: l1, l2: l2 });
    });
    var A = v1.length ? avg(v1) : null, B = v2.length ? avg(v2) : null;
    var d1 = discOf(s, x.id, rr.r1), d2 = discOf(s, x.id, rr.r2);
    var adj = function(v, d){ return v == null ? null : cl(v + d.net * T.discK, 0, M); };
    rows.push({ s: x, g: grp(s, x.id), cells: cells, a: A, b: B, d: (A != null && B != null) ? B - A : null,
      aa: T.disc ? adj(A, d1) : A, bb: T.disc ? adj(B, d2) : B,
      d1: d1, d2: d2, at1: attOf(s, x.id, rr.r1), at2: attOf(s, x.id, rr.r2), ab: absentMarks(s, x.id, rr.r1),
      n1: v1.length, n2: v2.length });
  });
  var sorters = {
    name: function(a, b){ return a.s.name.localeCompare(b.s.name, 'fa'); },
    up: function(a, b){ return (b.d == null ? -99 : b.d) - (a.d == null ? -99 : a.d); },
    down: function(a, b){ return (a.d == null ? 99 : a.d) - (b.d == null ? 99 : b.d); },
    t1: function(a, b){ return (b.a || 0) - (a.a || 0); },
    t2: function(a, b){ return (b.b || 0) - (a.b || 0); },
    disc: function(a, b){ return b.d1.net - a.d1.net; },
    risk: function(a, b){ return (a.a == null ? 9 : a.a) - (b.a == null ? 9 : b.a); }
  };
  rows.sort(sorters[T.sort] || sorters.name);
  var subStats = subs.map(function(sub, i){
    var A = [], B = [], n1 = 0, n2 = 0;
    rows.forEach(function(r){ var c = r.cells[i]; if (c.a != null) A.push(c.a); if (c.b != null) B.push(c.b); n1 += c.n1; n2 += c.n2; });
    var a = A.length ? avg(A) : null, b = B.length ? avg(B) : null;
    return { sub: sub, a: a, b: b, n1: n1, n2: n2, d: (a != null && b != null) ? b - a : null, color: CP()[i % 8] };
  });
  var ga = [], gb = [], gd = 0, gn = 0, cover = 0, as1 = 0, as2 = 0;
  rows.forEach(function(r){ if (r.a != null) { ga.push(r.a); cover++; } if (r.b != null) gb.push(r.b); gd += r.d1.net; gn += r.d1.n; });
  (s.assessments || []).forEach(function(a){ if (!a.date) return; if (a.date >= rr.r1.from && a.date <= rr.r1.to) as1++; if (a.date >= rr.r2.from && a.date <= rr.r2.to) as2++; });
  MODEL = { s: s, r1: rr.r1, r2: rr.r2, y: rr.y, subs: subs, rows: rows, subStats: subStats, M: M,
    ca: ga.length ? avg(ga) : null, cb: gb.length ? avg(gb) : null, gd: gd, gn: gn, cover: cover, as1: as1, as2: as2,
    total: (s.students || []).length };
  MODEL.cd = (MODEL.ca != null && MODEL.cb != null) ? MODEL.cb - MODEL.ca : null;
  return MODEL;
}
function lvl(v){ var m = MODEL; if (v == null || !m || !m.s.levels || !m.s.levels.length) return null; return m.s.levels[li(m.s, v)]; }
function cellTxt(v){
  if (v == null) return '—';
  if (T.disp === 'score' || (MODEL.s.meta.gradingMode === 'numeric')) return fn(v / MODEL.M * (MODEL.s.meta.numericMax || 20), 1);
  var l = lvl(v); return l ? l.icon + ' ' + l.label : fn(v, 1);
}
function cellShort(v){ if (v == null) return '—'; var l = lvl(v); return (l ? l.icon : '') + ' ' + fn(v, 1); }
function heat(v){
  if (v == null) return 'var(--tm-void)';
  var p = cl(v / MODEL.M, 0, 1), stops = [[225,29,72],[217,119,6],[245,158,11],[101,163,13],[13,148,136]];
  var i = cl(Math.floor(p * 4), 0, 3), f = p * 4 - i, a = stops[i], b = stops[i + 1];
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' + Math.round(a[1] + (b[1] - a[1]) * f) + ',' + Math.round(a[2] + (b[2] - a[2]) * f) + ')';
}
function dTxt(d){ return d == null ? '—' : (d >= 0 ? '+' : '−') + fn(Math.abs(d), 2); }
function dCol(d){ return d == null ? 'var(--tm-mut)' : d > .04 ? 'var(--tm-ok)' : d < -.04 ? 'var(--tm-bad)' : 'var(--tm-warn)'; }

/* ---------------- css ---------------- */
var CSS = ''
+ '.tm{--tm-a:#0b3b3c;--tm-b:#0d9488;--tm-c:#1d4ed8;--tm-gold:#d97706;--tm-ok:#16a34a;--tm-warn:#d97706;--tm-bad:#e11d48;--tm-info:#0ea5e9;--tm-violet:#7c3aed;'
+ '--tm-bg:#f6efe1;--tm-paper:#fdf6e8;--tm-surf:#fffdf8;--tm-surf2:#f3ece0;--tm-line:#e2d6c2;--tm-ink:#1b2a2a;--tm-mut:#7d7264;--tm-void:#efe7d9;--tm-fs:1;'
+ '--tm-h1:#0d9488;--tm-h2:#1d4ed8;--tm-h3:#d97706;--tm-h4:#e11d48;--tm-h5:#65a30d;--tm-h6:#7c3aed;--tm-h7:#0ea5e9;--tm-h8:#f59e0b;color:var(--tm-ink)}'
+ '.tm[data-pal="ledger"]{--tm-a:#3b2a17;--tm-b:#b45309;--tm-c:#7c2d12;--tm-bg:#f4ece0;--tm-paper:#fbf3e6;--tm-surf:#fffbf3;--tm-surf2:#f1e6d5;--tm-line:#e0cdb2;--tm-ink:#2e2114;--tm-mut:#8a7659;--tm-h1:#b45309;--tm-h2:#0f766e;--tm-h3:#a16207;--tm-h4:#9f1239;--tm-h5:#4d7c0f;--tm-h6:#6d28d9;--tm-h7:#0369a1;--tm-h8:#c2410c}'
+ '.tm[data-pal="night"]{--tm-a:#0a1030;--tm-b:#22d3ee;--tm-c:#a855f7;--tm-bg:#eef1fb;--tm-paper:#f7f8ff;--tm-surf:#ffffff;--tm-surf2:#eef0fa;--tm-line:#d8dcf0;--tm-ink:#141a35;--tm-mut:#6b7397;--tm-h1:#0891b2;--tm-h2:#4f46e5;--tm-h3:#db2777;--tm-h4:#e11d48;--tm-h5:#65a30d;--tm-h6:#7c3aed;--tm-h7:#0ea5e9;--tm-h8:#f59e0b}'
+ '.tm[data-pal="paper"]{--tm-a:#26302c;--tm-b:#0f766e;--tm-c:#475569;--tm-bg:#f2f1ec;--tm-paper:#faf9f5;--tm-surf:#ffffff;--tm-surf2:#f0efe9;--tm-line:#dedcd2;--tm-ink:#22282a;--tm-mut:#77786f}'
+ '[data-theme=dark] .tm{--tm-bg:#0d1a1c;--tm-paper:#102225;--tm-surf:#14282b;--tm-surf2:#0e1f22;--tm-line:#26424a;--tm-ink:#e8f5f2;--tm-mut:#93aeae;--tm-void:#1a3034}'
+ '.tm-hero{position:relative;overflow:hidden;border-radius:24px;padding:22px 24px;margin-bottom:14px;border:1px solid var(--tm-line);'
+ 'background:radial-gradient(120% 150% at 92% -20%,color-mix(in srgb,var(--tm-gold) 30%,transparent),transparent 58%),radial-gradient(90% 130% at 4% 120%,color-mix(in srgb,var(--tm-c) 26%,transparent),transparent 60%),linear-gradient(135deg,color-mix(in srgb,var(--tm-b) 16%,var(--tm-paper)),color-mix(in srgb,var(--tm-gold) 10%,var(--tm-paper)));box-shadow:0 20px 46px -28px rgba(11,59,60,.6)}'
+ '.tm-hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:linear-gradient(transparent 96%,color-mix(in srgb,var(--tm-b) 26%,transparent) 96%),linear-gradient(90deg,transparent 96%,color-mix(in srgb,var(--tm-gold) 20%,transparent) 96%);background-size:24px 24px}'
+ '.tm-hero>*{position:relative;z-index:2}.tm-hero h1{font-size:1.6rem;margin-bottom:4px}.tm-hero p{font-size:.85rem;color:var(--tm-mut);max-width:62ch;line-height:1.9}'
+ '.tm-window{display:inline-flex;align-items:center;gap:8px;background:var(--tm-surf);border:1px dashed color-mix(in srgb,var(--tm-b) 50%,var(--tm-line));border-radius:99px;padding:6px 14px;font-size:.78rem;font-weight:800;margin-top:10px}'
+ '.tm-ctl{position:sticky;top:64px;z-index:30;background:color-mix(in srgb,var(--tm-surf) 94%,transparent);backdrop-filter:blur(10px);border:1px solid var(--tm-line);border-radius:20px;padding:14px;margin-bottom:14px;box-shadow:0 16px 34px -26px rgba(11,59,60,.55)}'
+ '.tm-crow{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}'
+ '.tm-f{display:flex;flex-direction:column;gap:5px;min-width:0}'
+ '.tm-f>label{font-size:.68rem;font-weight:800;color:var(--tm-mut);letter-spacing:.01em}'
+ '.tm-dsel{display:flex;gap:4px}.tm-dsel select{padding:7px 6px;font-size:.76rem;border-radius:10px}'
+ '.tm select,.tm input[type=text]{background:var(--tm-surf2);border:1.5px solid var(--tm-line);color:var(--tm-ink);border-radius:11px;padding:8px 10px;font-size:.79rem;font-family:inherit;font-weight:700;outline:none;transition:border-color .15s,box-shadow .15s}'
+ '.tm select:focus,.tm input[type=text]:focus{border-color:var(--tm-b);box-shadow:0 0 0 3px color-mix(in srgb,var(--tm-b) 20%,transparent)}'
+ '.tm-seg{display:inline-flex;background:var(--tm-surf2);border:1.5px solid var(--tm-line);border-radius:12px;overflow:hidden;flex-wrap:wrap}'
+ '.tm-seg button{border:none;background:transparent;color:var(--tm-mut);padding:8px 11px;font-size:.75rem;font-weight:800;cursor:pointer;font-family:inherit;transition:.15s}'
+ '.tm-seg button:hover{background:color-mix(in srgb,var(--tm-b) 12%,transparent);color:var(--tm-ink)}'
+ '.tm-seg button.on{background:linear-gradient(135deg,var(--tm-b),color-mix(in srgb,var(--tm-c) 60%,var(--tm-b)));color:#fff}'
+ '.tm-btn{border:1.5px solid var(--tm-line);background:var(--tm-surf2);color:var(--tm-ink);border-radius:12px;padding:8px 13px;font-size:.77rem;font-weight:800;cursor:pointer;font-family:inherit;transition:transform .14s,box-shadow .14s,background .14s}'
+ '.tm-btn:hover{transform:translateY(-2px);box-shadow:0 8px 18px -10px rgba(11,59,60,.6)}'
+ '.tm-btn.pri{background:linear-gradient(135deg,var(--tm-b),var(--tm-c));color:#fff;border-color:transparent}'
+ '.tm-btn.gold{background:linear-gradient(135deg,var(--tm-gold),#f59e0b);color:#fff;border-color:transparent}'
+ '.tm-btn.dan{color:var(--tm-bad);border-color:color-mix(in srgb,var(--tm-bad) 40%,var(--tm-line))}'
+ '.tm-sw{position:relative;width:42px;height:23px;flex:none;cursor:pointer;display:inline-block}'
+ '.tm-sw input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}'
+ '.tm-sw i{position:absolute;inset:0;border-radius:99px;background:var(--tm-surf2);border:1.5px solid var(--tm-line);transition:.2s}'
+ '.tm-sw i::after{content:"";position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:var(--tm-mut);transition:.2s}'
+ '.tm-sw input:checked+i{background:linear-gradient(135deg,var(--tm-b),var(--tm-c));border-color:transparent}'
+ '.tm-sw input:checked+i::after{right:21px;background:#fff}'
+ '.tm-tog{display:flex;align-items:center;gap:8px;font-size:.76rem;font-weight:800;background:var(--tm-surf2);border:1.5px solid var(--tm-line);border-radius:12px;padding:6px 10px}'
+ '.tm-rng{width:118px;accent-color:var(--tm-b);height:4px}'
+ '.tm-val{min-width:44px;text-align:center;font-size:.72rem;font-weight:800;color:var(--tm-b);background:color-mix(in srgb,var(--tm-b) 12%,transparent);border-radius:8px;padding:3px 6px}'
+ '.tm-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed var(--tm-line)}'
+ '.tm-chip{display:inline-flex;align-items:center;gap:6px;background:var(--tm-surf2);border:1.5px solid var(--tm-line);border-radius:99px;padding:5px 11px;font-size:.72rem;font-weight:800;cursor:grab}'
+ '.tm-chip.drag{opacity:.4}.tm-chip.over{border-color:var(--tm-b);box-shadow:0 0 0 3px color-mix(in srgb,var(--tm-b) 18%,transparent)}'
+ '.tm-chip b{width:9px;height:9px;border-radius:3px;display:inline-block}'
+ '.tm-saved{display:inline-flex;align-items:center;gap:6px;background:color-mix(in srgb,var(--tm-gold) 12%,var(--tm-surf2));border:1.5px solid color-mix(in srgb,var(--tm-gold) 34%,var(--tm-line));border-radius:99px;padding:4px 6px 4px 11px;font-size:.72rem;font-weight:800}'
+ '.tm-saved button{border:none;background:transparent;cursor:pointer;font-size:.8rem;color:var(--tm-mut);padding:2px 4px}'
+ '.tm-grid{display:grid;gap:12px}.tm-g6{grid-template-columns:repeat(6,1fr)}.tm-g2{grid-template-columns:1fr 1fr}.tm-g32{grid-template-columns:1.35fr 1fr}'
+ '.tm-card{background:var(--tm-surf);border:1px solid var(--tm-line);border-radius:18px;padding:15px;box-shadow:0 12px 28px -24px rgba(11,59,60,.7);min-width:0;animation:tmUp .45s both}'
+ '@keyframes tmUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
+ '.tm-card h3{font-size:.92rem;margin-bottom:10px;display:flex;align-items:center;gap:7px}'
+ '.tm-stat{display:flex;align-items:center;gap:11px}'
+ '.tm-stat .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:1.2rem;color:#fff;flex:none;box-shadow:0 8px 18px -10px currentColor}'
+ '.tm-stat b{display:block;font-size:1.35rem;line-height:1.25}.tm-stat span{font-size:.68rem;color:var(--tm-mut);font-weight:700}'
+ '.tm-bar{margin-bottom:11px}.tm-bl{display:flex;justify-content:space-between;font-size:.76rem;font-weight:800;margin-bottom:4px;gap:8px}'
+ '.tm-track{height:11px;border-radius:99px;background:var(--tm-surf2);overflow:hidden;border:1px solid var(--tm-line);position:relative}'
+ '.tm-track i{display:block;height:100%;border-radius:99px;transition:width .6s cubic-bezier(.2,.8,.2,1)}'
+ '.tm-track.hatch i{background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.55) 0 3px,transparent 3px 7px)}'
+ '.tm-legend{display:flex;gap:12px;font-size:.7rem;font-weight:800;color:var(--tm-mut);flex-wrap:wrap;margin-top:6px}'
+ '.tm-legend span{display:inline-flex;align-items:center;gap:5px}.tm-legend b{width:16px;height:9px;border-radius:3px;display:inline-block}'
+ '.tm-scroll{overflow:auto;scrollbar-width:thin;scrollbar-color:var(--tm-b) var(--tm-surf2)}'
+ '.tm-scroll::-webkit-scrollbar{height:12px;width:12px}'
+ '.tm-scroll::-webkit-scrollbar-track{background:var(--tm-surf2);border-radius:99px;border:1px solid var(--tm-line)}'
+ '.tm-scroll::-webkit-scrollbar-thumb{background:linear-gradient(90deg,var(--tm-b),var(--tm-c));border-radius:99px;border:3px solid var(--tm-surf2)}'
+ '.tm-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(90deg,var(--tm-gold),var(--tm-b))}'
+ '.tm-tbl{border-collapse:separate;border-spacing:0;width:100%;min-width:940px;font-size:calc(.78rem * var(--tm-fs))}'
+ '.tm-tbl th,.tm-tbl td{padding:7px 8px;border-bottom:1px solid var(--tm-line);text-align:center;white-space:nowrap}'
+ '.tm-tbl thead th{background:var(--tm-surf2);font-size:.72rem;font-weight:800;color:var(--tm-mut);position:sticky;top:0;z-index:3}'
+ '.tm-tbl thead tr:nth-child(2) th{top:31px}'
+ '.tm-tbl th.tm-stick,.tm-tbl td.tm-stick{position:sticky;right:0;z-index:4;background:var(--tm-surf);text-align:right;border-left:2px solid var(--tm-line)}'
+ '.tm-tbl thead th.tm-stick{z-index:6;background:var(--tm-surf2)}'
+ '.tm-tbl tbody tr:hover td{background:color-mix(in srgb,var(--tm-b) 7%,var(--tm-surf))}'
+ '.tm-tbl tbody tr:hover td.tm-stick{background:color-mix(in srgb,var(--tm-b) 11%,var(--tm-surf))}'
+ '.tm-tbl tfoot td{background:var(--tm-surf2);font-weight:800;border-top:2px solid var(--tm-line)}'
+ '.tm-sep{border-right:1px dashed var(--tm-line)}'
+ '.tm-lv{font-weight:800}.tm-mut{color:var(--tm-mut)}'
+ '.tm-pill{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:2px 8px;font-size:.68rem;font-weight:800;background:color-mix(in srgb,var(--pc,var(--tm-b)) 13%,transparent);color:var(--pc,var(--tm-b));border:1px solid color-mix(in srgb,var(--pc,var(--tm-b)) 32%,transparent)}'
+ '.tm-name{display:flex;align-items:center;gap:8px}.tm-name button{border:none;background:none;color:var(--tm-ink);font-weight:800;font-size:.8rem;cursor:pointer;font-family:inherit;text-align:right}'
+ '.tm-name button:hover{color:var(--tm-b);text-decoration:underline}'
+ '.tm-heat{display:grid;gap:4px;min-width:640px}'
+ '.tm-hc{border-radius:9px;padding:9px 4px;text-align:center;font-size:.7rem;font-weight:800;color:#fff;cursor:pointer;border:1px solid rgba(255,255,255,.22);transition:transform .14s}'
+ '.tm-hc:hover{transform:scale(1.07)}'
+ '.tm-hh{font-size:.66rem;font-weight:800;color:var(--tm-mut);text-align:center;padding:4px 2px}'
+ '.tm-cards{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}'
+ '.tm-mov{display:flex;align-items:center;gap:8px;font-size:.75rem;padding:5px 0}'
+ '.tm-mov .n{width:96px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+ '.tm-mov .t{flex:1;height:12px;background:var(--tm-surf2);border-radius:99px;position:relative;border:1px solid var(--tm-line);overflow:hidden}'
+ '.tm-mov .t::before{content:"";position:absolute;right:50%;top:0;bottom:0;width:1px;background:var(--tm-mut);opacity:.5}'
+ '.tm-mov .t i{position:absolute;top:1px;bottom:1px;border-radius:99px;transition:width .5s}'
+ '.tm-empty{text-align:center;padding:28px 16px}.tm-empty .e{font-size:2.2rem;display:block;margin-bottom:8px}'
+ '.tm-note{border-radius:14px;padding:11px 14px;font-size:.78rem;font-weight:700;line-height:1.9;background:color-mix(in srgb,var(--tm-info) 10%,var(--tm-surf));border:1px dashed color-mix(in srgb,var(--tm-info) 42%,var(--tm-line));color:var(--tm-ink)}'
+ '.tm-tip{font-size:.7rem;color:var(--tm-mut);line-height:1.9;margin-top:8px}'
+'.tm-dl:last-child{border:none}'
+ '@media (max-width:1200px){.tm-g6{grid-template-columns:repeat(3,1fr)}}'
+ '@media (max-width:980px){.tm-g2,.tm-g32{grid-template-columns:1fr}.tm-ctl{position:static}}'
+ '@media (max-width:640px){.tm-g6{grid-template-columns:repeat(2,1fr)}.tm-hero{padding:16px}.tm-hero h1{font-size:1.25rem}.tm-crow{gap:8px}.tm-rng{width:92px}}';
var stl = document.createElement('style'); stl.id = 'tmCss'; stl.textContent = CSS; document.head.appendChild(stl);

/* ---------------- controls ---------------- */
function dsel(key){
  var iso = getD(key), j = jOf(iso), y = yb(), ys = [y.a - 1, y.a, y.b, y.b + 1], mn = MN();
  var days = ''; for (var d = 1; d <= mlen(j.jy, j.jm); d++) days += '<option value="' + d + '"' + (j.jd === d ? ' selected' : '') + '>' + fa(d) + '</option>';
  var ms = ''; for (var m = 1; m <= 12; m++) ms += '<option value="' + m + '"' + (j.jm === m ? ' selected' : '') + '>' + mn[m - 1] + '</option>';
  var yrs = ys.map(function(v){ return '<option value="' + v + '"' + (j.jy === v ? ' selected' : '') + '>' + fa(v) + '</option>'; }).join('');
  return '<div class="tm-dsel" data-dsel="' + key + '">'
    + '<select data-chg="tmDate" data-key="' + key + '" data-p="d" aria-label="روز">' + days + '</select>'
    + '<select data-chg="tmDate" data-key="' + key + '" data-p="m" aria-label="ماه">' + ms + '</select>'
    + '<select data-chg="tmDate" data-key="' + key + '" data-p="y" aria-label="سال">' + yrs + '</select></div>';
}
function ctlHTML(){
  var s = Sx(), m = MODEL, presets = [['m10','مهر تا دی'],['m11','مهر تا بهمن'],['h2','نیمسال دوم'],['year','کل سال'],['last30','۳۰ روز اخیر'],['thismonth','ماه جاری']];
  var w = ['oral','written','performance','homework'], wl = { oral:'شفاهی', written:'کتبی', performance:'عملکردی', homework:'تکلیف' };
  var groups = '<option value="all">همهٔ گروه‌ها</option><option value="none"' + (T.group === 'none' ? ' selected' : '') + '>بدون گروه</option>'
    + (s.groups || []).map(function(g){ return '<option value="' + g.id + '"' + (T.group === g.id ? ' selected' : '') + '>' + esc(g.name) + '</option>'; }).join('');
  var sound = true; try { sound = typeof Sound !== 'undefined' ? !!Sound.on : true; } catch (e) {}
  return '<div class="tm-ctl"><div class="tm-crow">'
  + '<div class="tm-f"><label>🗓️ نوبت اول — از</label>' + dsel('from') + '</div>'
  + '<div class="tm-f"><label>🗓️ نوبت اول — تا</label>' + dsel('to') + '</div>'
  + '<div class="tm-f"><label>بازهٔ آماده</label><div class="tm-seg">' + presets.map(function(p){ return '<button type="button" data-act="tmPreset" data-v="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></div>'
  + '<div class="tm-f"><label>📘 نمرهٔ دوم</label><select data-chg="tmM2">'
    + '<option value="year"' + (T.m2 === 'year' ? ' selected' : '') + '>کل سال تحصیلی</option>'
    + '<option value="h2"' + (T.m2 === 'h2' ? ' selected' : '') + '>نیمسال دوم</option>'
    + '<option value="manual"' + (T.m2 === 'manual' ? ' selected' : '') + '>بازهٔ دستی</option></select></div>'
  + (T.m2 === 'manual' ? '<div class="tm-f"><label>دوم — از</label>' + dsel('from2') + '</div><div class="tm-f"><label>دوم — تا</label>' + dsel('to2') + '</div>' : '')
  + '<div class="tm-f"><label>🧮 شیوهٔ محاسبه</label><select data-chg="tmCalc">'
    + [['avg','میانگین ساده'],['weighted','میانگین وزنی'],['last','آخرین نمره'],['best','بهترین نمره']].map(function(o){ return '<option value="' + o[0] + '"' + (T.calc === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'
  + '<div class="tm-f"><label>نمایش نمره</label><div class="tm-seg"><button type="button" class="' + (T.disp === 'level' ? 'on' : '') + '" data-act="tmDisp" data-v="level">🌟 توصیفی</button><button type="button" class="' + (T.disp === 'score' ? 'on' : '') + '" data-act="tmDisp" data-v="score">🔢 عددی</button></div></div>'
  + '<div class="tm-f"><label>گروه</label><select data-chg="tmGroup">' + groups + '</select></div>'
  + '<div class="tm-f"><label>مرتب‌سازی</label><select data-chg="tmSort">'
    + [['name','نام'],['up','بیشترین رشد'],['down','بیشترین افت'],['t1','میانگین نوبت اول'],['t2','میانگین نمرهٔ دوم'],['disc','انضباط بازه'],['risk','نیازمند توجه']].map(function(o){ return '<option value="' + o[0] + '"' + (T.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'
  + '<div class="tm-f"><label>جستجو</label><input type="text" style="width:150px" placeholder="نام یا کد…" value="' + esc(T.q) + '" data-inp="tmQ"></div>'
  + '</div><div class="tm-crow" style="margin-top:10px">'
  + '<div class="tm-f"><label>نما</label><div class="tm-seg">' + [['matrix','📋 جدول کامل'],['summary','🧾 خلاصه'],['heat','🔥 ماتریس'],['cards','🗂️ کارت‌ها']].map(function(o){ return '<button type="button" class="' + (T.view === o[0] ? 'on' : '') + '" data-act="tmView" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>'
  + (T.view === 'heat' ? '<div class="tm-f"><label>سنجهٔ ماتریس</label><select data-chg="tmHeat"><option value="t1"' + (T.heat === 't1' ? ' selected' : '') + '>نوبت اول</option><option value="t2"' + (T.heat === 't2' ? ' selected' : '') + '>نمرهٔ دوم</option><option value="d"' + (T.heat === 'd' ? ' selected' : '') + '>رشد</option></select></div>' : '')
  + '<label class="tm-tog"><span class="tm-sw"><input type="checkbox" ' + (T.disc ? 'checked' : '') + ' data-chg="tmBool" data-k="disc"><i></i></span>⭐ احتساب انضباط</label>'
  + '<div class="tm-f"><label>ضریب انضباط</label><div style="display:flex;gap:6px;align-items:center"><input class="tm-rng" type="range" min="0" max="0.4" step="0.02" value="' + T.discK + '" data-inp="tmK"><span class="tm-val" id="tmKVal">' + fa(T.discK.toFixed(2)) + '</span></div></div>'
  + '<label class="tm-tog"><span class="tm-sw"><input type="checkbox" ' + (T.cmp ? 'checked' : '') + ' data-chg="tmBool" data-k="cmp"><i></i></span>📊 مقایسه با کلاس</label>'
  + '<label class="tm-tog"><span class="tm-sw"><input type="checkbox" ' + (T.absent ? 'checked' : '') + ' data-chg="tmBool" data-k="absent"><i></i></span>🚩 نشان غیبت</label>'
  + '<div class="tm-f"><label>اندازهٔ متن جدول</label><div style="display:flex;gap:6px;align-items:center"><input class="tm-rng" type="range" min="80" max="140" step="5" value="' + T.font + '" data-inp="tmFont"><span class="tm-val" id="tmFontVal">' + fa(T.font) + '٪</span></div></div>'
  + '<div class="tm-f"><label>پوستهٔ رنگی</label><select data-chg="tmPal">' + [['tile','کاشی ایرانی'],['ledger','دفتر کلاس'],['night','شبانه'],['paper','کاغذی']].map(function(o){ return '<option value="' + o[0] + '"' + (T.pal === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'
  + '<label class="tm-tog"><span class="tm-sw"><input type="checkbox" ' + (sound ? 'checked' : '') + ' data-chg="tmSound"><i></i></span>' + (sound ? '🔊 صدا' : '🔇 بی‌صدا') + '</label>'
  + '</div>'
  + (T.calc === 'weighted' ? '<div class="tm-crow" style="margin-top:10px">' + w.map(function(k){ return '<div class="tm-f"><label>وزن ' + wl[k] + '</label><div style="display:flex;gap:6px;align-items:center"><input class="tm-rng" type="range" min="0" max="3" step="0.25" value="' + (T.w[k] == null ? 1 : T.w[k]) + '" data-inp="tmW" data-k="' + k + '"><span class="tm-val" id="tmW_' + k + '">' + fa(Number(T.w[k] == null ? 1 : T.w[k]).toFixed(2)) + '</span></div></div>'; }).join('') + '</div>' : '')
  + '<div class="tm-crow" style="margin-top:10px">'
  + '<button type="button" class="tm-btn gold" data-act="tmSmart">🪄 بازهٔ هوشمند</button>'
  + '<button type="button" class="tm-btn" data-act="tmSave">💾 ذخیرهٔ بازه</button>'
  + '<button type="button" class="tm-btn pri" data-act="tmCSV">📤 CSV</button>'
  + '<button type="button" class="tm-btn pri" data-act="tmPrintClass">🖨️ کارنامهٔ کلاس A4</button>'
  + '<button type="button" class="tm-btn" data-act="tmReset">♻️ بازنشانی</button>'
  + '</div>'
  + '<div class="tm-chips"><span style="font-size:.7rem;font-weight:800;color:var(--tm-mut)">ترتیب درس‌ها (بکش و رها کن):</span>'
  + subjects().map(function(n, i){ return '<span class="tm-chip" draggable="true" data-tmdrag="' + i + '" data-tmdrop="' + i + '"><b style="background:' + CP()[i % 8] + '"></b>' + esc(n) + '</span>'; }).join('')
  + '</div>'
  + (T.saved.length ? '<div class="tm-chips"><span style="font-size:.7rem;font-weight:800;color:var(--tm-mut)">بازه‌های ذخیره‌شده:</span>' + T.saved.map(function(v, i){ return '<span class="tm-saved"><button type="button" data-act="tmApply" data-i="' + i + '" title="اعمال">📂 ' + esc(v.name) + '</button><button type="button" data-act="tmDelSaved" data-i="' + i + '" title="حذف">✕</button></span>'; }).join('') + '</div>' : '')
  + '</div>';
}

/* ---------------- charts ---------------- */
function gauge(){
  var m = MODEL, cx = 96, cy = 92, r1 = 68, r2 = 50, M = m.M;
  var p1 = m.ca == null ? 0 : cl(m.ca / M, 0, 1), p2 = m.cb == null ? 0 : cl(m.cb / M, 0, 1);
  var L1 = Math.PI * r1, L2 = Math.PI * r2, ang = Math.PI * (1 - p1);
  var nx = cx + (r1 - 6) * Math.cos(ang), ny = cy - (r1 - 6) * Math.sin(ang);
  var l1 = lvl(m.ca), l2 = lvl(m.cb);
  return '<div style="text-align:center"><svg viewBox="0 0 192 116" style="width:100%;max-width:230px;height:auto">'
  + '<path d="M' + (cx - r1) + ' ' + cy + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + (cx + r1) + ' ' + cy + '" fill="none" stroke="var(--tm-surf2)" stroke-width="13" stroke-linecap="round"/>'
  + '<path d="M' + (cx - r1) + ' ' + cy + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + (cx + r1) + ' ' + cy + '" fill="none" stroke="var(--tm-h1)" stroke-width="13" stroke-linecap="round" stroke-dasharray="' + (L1 * p1).toFixed(1) + ' 999"><title>نوبت اول: ' + fn(m.ca, 2) + '</title></path>'
  + '<path d="M' + (cx - r2) + ' ' + cy + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + (cx + r2) + ' ' + cy + '" fill="none" stroke="var(--tm-surf2)" stroke-width="9" stroke-linecap="round"/>'
  + '<path d="M' + (cx - r2) + ' ' + cy + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + (cx + r2) + ' ' + cy + '" fill="none" stroke="var(--tm-h3)" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (L2 * p2).toFixed(1) + ' 999"><title>نمرهٔ دوم: ' + fn(m.cb, 2) + '</title></path>'
  + '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="var(--tm-ink)" stroke-width="3" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--tm-ink)"/>'
  + '<text x="' + (cx - r1) + '" y="' + (cy + 16) + '" font-size="9" fill="var(--tm-mut)">۰</text><text x="' + (cx + r1 - 6) + '" y="' + (cy + 16) + '" font-size="9" fill="var(--tm-mut)">' + fa(M) + '</text></svg>'
  + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:4px">'
  + '<span class="tm-pill" style="--pc:var(--tm-h1)">نوبت اول ' + (l1 ? l1.icon + ' ' + esc(l1.label) : '—') + '</span>'
  + '<span class="tm-pill" style="--pc:var(--tm-h3)">نمرهٔ دوم ' + (l2 ? l2.icon + ' ' + esc(l2.label) : '—') + '</span></div></div>';
}
function subBars(){
  var m = MODEL, out = '';
  m.subStats.forEach(function(x, i){
    var a = x.a == null ? 0 : x.a / m.M * 100, b = x.b == null ? 0 : x.b / m.M * 100, c = CP()[i % 8];
    out += '<div class="tm-bar"><div class="tm-bl"><span>' + esc(x.sub) + '</span><span style="color:' + dCol(x.d) + '">' + dTxt(x.d) + '</span></div>'
      + '<div class="tm-track" title="نوبت اول: ' + fn(x.a, 2) + ' از ' + fa(m.M) + ' • ' + fa(x.n1) + ' نمره"><i style="width:' + a.toFixed(1) + '%;background:linear-gradient(90deg,' + c + ',color-mix(in srgb,' + c + ' 55%,#fff))"></i></div>'
      + '<div class="tm-track hatch" style="margin-top:3px" title="نمرهٔ دوم (کل سال): ' + fn(x.b, 2) + ' • ' + fa(x.n2) + ' نمره"><i style="width:' + b.toFixed(1) + '%;background:var(--tm-h3)"></i></div>'
      + '<div style="display:flex;justify-content:space-between;font-size:.66rem;color:var(--tm-mut);margin-top:3px"><span>اول: ' + cellTxt(x.a) + ' (' + fa(x.n1) + ')</span><span>دوم: ' + cellTxt(x.b) + ' (' + fa(x.n2) + ')</span></div></div>';
  });
  return out + '<div class="tm-legend"><span><b style="background:var(--tm-h1)"></b>نوبت اول (بازهٔ انتخابی)</span><span><b style="background:var(--tm-h3);background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.6) 0 3px,transparent 3px 7px)"></b>نمرهٔ دوم (کل سال)</span></div>';
}
function timeline(){
  var m = MODEL, s = m.s, y = m.y, subs = m.subs, lanes = Math.min(subs.length, 8);
  var t0 = C.isoToDate(y.start).getTime(), t1 = C.isoToDate(y.end).getTime(), span = Math.max(1, (t1 - t0) / 864e5);
  var W = 1000, pad = 44, H = 40 + lanes * 17 + 30;
  var X = function(iso){ return pad + (W - pad - 12) * cl((C.isoToDate(iso).getTime() - t0) / 864e5 / span, 0, 1); };
  var x1 = X(m.r1.from), x2 = X(m.r1.to);
  var g = '<rect x="' + x1.toFixed(1) + '" y="16" width="' + Math.max(2, x2 - x1).toFixed(1) + '" height="' + (H - 40) + '" fill="var(--tm-h1)" opacity=".1" rx="7"/>'
    + '<rect x="' + x1.toFixed(1) + '" y="16" width="' + Math.max(2, x2 - x1).toFixed(1) + '" height="' + (H - 40) + '" fill="none" stroke="var(--tm-h1)" stroke-dasharray="5 4" rx="7"/>'
    + '<text x="' + ((x1 + x2) / 2).toFixed(1) + '" y="12" font-size="10" font-weight="800" fill="var(--tm-h1)" text-anchor="middle">نوبت اول</text>';
  var order = [7,8,9,10,11,12,1,2,3,4,5,6];
  order.forEach(function(mo){
    var yy = mo >= 7 ? y.a : y.b, iso = jISO(yy, mo, 1), x = X(iso);
    g += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="16" y2="' + (H - 24) + '" stroke="var(--tm-line)"/>'
      + '<text x="' + (x + 3).toFixed(1) + '" y="' + (H - 10) + '" font-size="9" fill="var(--tm-mut)">' + MN()[mo - 1].slice(0, 5) + '</text>';
  });
  subs.forEach(function(sub, i){
    if (i >= lanes) return;
    var yy = 28 + i * 17, c = CP()[i % 8];
    g += '<text x="' + (pad - 6) + '" y="' + (yy + 4) + '" font-size="9" font-weight="700" fill="var(--tm-mut)" text-anchor="end">' + esc(sub.slice(0, 6)) + '</text>';
    (s.assessments || []).forEach(function(a){
      if (!a.date || !a.subjects || a.subjects.indexOf(sub) < 0) return;
      if (a.date < y.start || a.date > y.end) return;
      var inR = a.date >= m.r1.from && a.date <= m.r1.to, x = X(a.date);
      g += '<rect x="' + (x - 4).toFixed(1) + '" y="' + (yy - 5) + '" width="8" height="10" rx="2.5" fill="' + c + '" opacity="' + (inR ? 1 : .3) + '" style="cursor:pointer" data-act="tmAsmt" data-id="' + a.id + '"><title>' + esc(a.title) + ' — ' + jS(a.date) + (inR ? ' • در نوبت اول' : ' • بیرون بازه') + '</title></rect>';
    });
  });
  var byM = {};
  (s.discipline || []).forEach(function(d){
    if (!d.date || d.date < y.start || d.date > y.end) return;
    var j = jOf(d.date), k = j.jm; byM[k] = (byM[k] || 0) + (Number(d.points) || 0);
  });
  order.forEach(function(mo){
    var v = byM[mo] || 0; if (!v) return;
    var yy = mo >= 7 ? y.a : y.b, x = X(jISO(yy, mo, 15)), h = cl(Math.abs(v) * 1.1, 2, 16);
    g += '<rect x="' + (x - 5).toFixed(1) + '" y="' + (v > 0 ? 18 - h : 18) + '" width="10" height="' + h + '" rx="2" fill="' + (v > 0 ? 'var(--tm-ok)' : 'var(--tm-bad)') + '" opacity=".75"><title>' + MN()[mo - 1] + ': ' + (v > 0 ? '+' : '') + fa(v) + ' امتیاز انضباطی</title></rect>';
  });
  return '<div class="tm-scroll"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;min-width:660px;height:auto;display:block">' + g + '</svg></div>'
    + '<p class="tm-tip">هر مستطیل یک ارزشیابی است؛ پررنگ‌ها داخل بازهٔ نوبت اول‌اند. روی هرکدام بزن تا نمرات همان ارزشیابی باز شود. میله‌های سبز/قرمز بالای خط، جمع امتیاز انضباطی هر ماه است.</p>';
}
function movers(){
  var m = MODEL, list = m.rows.filter(function(r){ return r.d != null; });
  if (!list.length) return '<div class="tm-empty"><span class="e">🌱</span><b>داده‌ای برای مقایسه نیست</b><p class="tm-tip">در بازهٔ انتخابی نمره‌ای ثبت نشده است.</p></div>';
  var up = list.slice().sort(function(a, b){ return b.d - a.d; }).slice(0, 5);
  var dn = list.slice().sort(function(a, b){ return a.d - b.d; }).slice(0, 5).reverse();
  var max = Math.max.apply(null, list.map(function(r){ return Math.abs(r.d); })) || 1;
  function row(r){
    var w = Math.abs(r.d) / max * 48, pos = r.d >= 0;
    return '<div class="tm-mov"><span class="n">' + esc(r.s.name) + '</span><span class="t"><i style="' + (pos ? 'right:50%' : 'left:50%') + ';width:' + w.toFixed(1) + '%;background:' + (pos ? 'var(--tm-ok)' : 'var(--tm-bad)') + '"></i></span><b style="width:52px;text-align:left;color:' + dCol(r.d) + '">' + dTxt(r.d) + '</b></div>';
  }
  return '<div style="font-size:.72rem;font-weight:800;color:var(--tm-ok);margin-bottom:4px">📈 بیشترین رشد</div>' + up.map(row).join('')
    + '<div style="font-size:.72rem;font-weight:800;color:var(--tm-bad);margin:10px 0 4px">📉 بیشترین افت</div>' + dn.map(row).join('');
}

/* ---------------- views ---------------- */
function nameCell(r){
  return '<div class="tm-name"><input type="checkbox" data-chg="tmSel" data-id="' + r.s.id + '"' + (T.sel[r.s.id] ? ' checked' : '') + '>' + av(r.s, 'sm')
    + '<button type="button" data-act="tmStu" data-id="' + r.s.id + '">' + esc(r.s.name) + '</button>'
    + (T.absent && r.ab ? '<span class="tm-pill" style="--pc:var(--tm-bad)" title="' + fa(r.ab) + ' روز غیبت در روز ارزشیابی">غ' + fa(r.ab) + '</span>' : '') + '</div>';
}
function bulkBar(){
  var ids = Object.keys(T.sel).filter(function(k){ return T.sel[k]; });
  if (!ids.length) return '';
  return '<div class="tm-card" style="margin-bottom:10px;border-color:var(--tm-b)"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    + '<b style="font-size:.8rem">' + fa(ids.length) + ' دانش‌آموز انتخاب شده</b>'
    + '<button type="button" class="tm-btn pri" data-act="tmBulkCSV">📤 CSV انتخاب‌شده‌ها</button>'
    + '<button type="button" class="tm-btn gold" data-act="tmBulkPrint">🖨️ کارنامهٔ انتخاب‌شده‌ها</button>'
    + '<button type="button" class="tm-btn" data-act="tmSelNone">✕ لغو انتخاب</button></div></div>';
}
function matrixView(){
  var m = MODEL;
  var h1 = m.subs.map(function(s, i){ return '<th colspan="2" class="' + (i ? 'tm-sep' : '') + '" style="color:' + CP()[i % 8] + '">' + esc(s) + '</th>'; }).join('');
  var h2 = m.subs.map(function(s, i){ return '<th class="' + (i ? 'tm-sep' : '') + '">اول</th><th>دوم</th>'; }).join('');
  var body = m.rows.map(function(r){
    var cs = r.cells.map(function(c, i){
      return '<td class="' + (i ? 'tm-sep' : '') + '"><span class="tm-lv" style="color:' + (c.a == null ? 'var(--tm-mut)' : heat(c.a)) + '" title="' + (lvl(c.a) ? esc(lvl(c.a).label) + ' • ' + fa(c.n1) + ' نمره' : 'بدون نمره') + '">' + cellShort(c.a) + '</span></td>'
        + '<td><span class="tm-lv" style="color:' + (c.b == null ? 'var(--tm-mut)' : heat(c.b)) + '" title="' + (lvl(c.b) ? esc(lvl(c.b).label) + ' • ' + fa(c.n2) + ' نمره' : 'بدون نمره') + '">' + cellShort(c.b) + '</span></td>';
    }).join('');
    return '<tr><td class="tm-stick">' + nameCell(r) + '</td>' + cs
      + '<td class="tm-sep"><b>' + cellTxt(r.aa) + '</b></td><td><b>' + cellTxt(r.bb) + '</b></td><td style="color:' + dCol(r.d) + ';font-weight:800">' + dTxt(r.d) + '</td>'
      + '<td class="tm-sep" style="color:' + (r.d1.net >= 0 ? 'var(--tm-ok)' : 'var(--tm-bad)') + '">' + (r.d1.net > 0 ? '+' : '') + fa(r.d1.net) + '</td><td>' + (r.d2.net > 0 ? '+' : '') + fa(r.d2.net) + '</td>'
      + '<td class="tm-sep">' + (r.at1.rate == null ? '—' : fa(r.at1.rate) + '٪') + '</td><td>' + (r.at2.rate == null ? '—' : fa(r.at2.rate) + '٪') + '</td></tr>';
  }).join('');
  var foot = m.subStats.map(function(x, i){ return '<td class="' + (i ? 'tm-sep' : '') + '">' + fn(x.a, 1) + '</td><td>' + fn(x.b, 1) + '</td>'; }).join('');
  return '<div class="tm-scroll" style="max-height:70vh"><table class="tm-tbl"><thead>'
    + '<tr><th rowspan="2" class="tm-stick">دانش‌آموز</th>' + h1 + '<th colspan="3" class="tm-sep">معدل کل</th><th colspan="2" class="tm-sep">انضباط</th><th colspan="2" class="tm-sep">حضور</th></tr>'
    + '<tr>' + h2 + '<th class="tm-sep">اول</th><th>دوم</th><th>رشد</th><th class="tm-sep">بازه</th><th>کل</th><th class="tm-sep">بازه</th><th>کل</th></tr></thead>'
    + '<tbody>' + body + '</tbody><tfoot><tr><td class="tm-stick">میانگین کلاس</td>' + foot
    + '<td class="tm-sep">' + fn(m.ca, 2) + '</td><td>' + fn(m.cb, 2) + '</td><td style="color:' + dCol(m.cd) + '">' + dTxt(m.cd) + '</td>'
    + '<td class="tm-sep">' + fa(m.gd) + '</td><td>—</td><td class="tm-sep">—</td><td>—</td></tr></tfoot></table></div>';
}
function summaryView(){
  var m = MODEL;
  var body = m.rows.map(function(r){
    return '<tr><td class="tm-stick">' + nameCell(r) + '</td>'
      + '<td>' + (r.g ? '<span class="tm-pill" style="--pc:' + r.g.color + '">' + esc(r.g.name) + '</span>' : '—') + '</td>'
      + '<td><b>' + cellTxt(r.aa) + '</b><div style="font-size:.64rem;color:var(--tm-mut)">' + fa(r.n1) + ' درس</div></td>'
      + '<td><b>' + cellTxt(r.bb) + '</b><div style="font-size:.64rem;color:var(--tm-mut)">' + fa(r.n2) + ' درس</div></td>'
      + '<td style="color:' + dCol(r.d) + ';font-weight:800">' + dTxt(r.d) + '</td>'
      + '<td><span class="tm-pill" style="--pc:var(--tm-ok)">+' + fa(r.d1.pos) + '</span> <span class="tm-pill" style="--pc:var(--tm-bad)">−' + fa(r.d1.neg) + '</span></td>'
      + '<td style="color:' + (r.d2.net >= 0 ? 'var(--tm-ok)' : 'var(--tm-bad)') + ';font-weight:800">' + (r.d2.net > 0 ? '+' : '') + fa(r.d2.net) + '</td>'
      + '<td>' + (r.at1.rate == null ? '—' : fa(r.at1.rate) + '٪') + '</td>'
      + '<td><button type="button" class="tm-btn" data-act="tmStu" data-id="' + r.s.id + '">👁 ریز</button> <button type="button" class="tm-btn" data-act="tmPrintStu" data-id="' + r.s.id + '">🖨️</button></td></tr>';
  }).join('');
  return '<div class="tm-scroll" style="max-height:70vh"><table class="tm-tbl" style="min-width:820px"><thead><tr>'
    + '<th class="tm-stick">دانش‌آموز</th><th>گروه</th><th>معدل نوبت اول</th><th>نمرهٔ دوم (کل سال)</th><th>رشد</th><th>انضباط بازه</th><th>انضباط کل</th><th>حضور بازه</th><th>عملیات</th>'
    + '</tr></thead><tbody>' + body + '</tbody></table></div>';
}
function heatView(){
  var m = MODEL, n = m.subs.length;
  var head = '<div></div>' + m.subs.map(function(s){ return '<div class="tm-hh">' + esc(s) + '</div>'; }).join('') + '<div class="tm-hh">معدل</div>';
  var body = m.rows.map(function(r){
    var cells = r.cells.map(function(c){
      var v = T.heat === 't1' ? c.a : T.heat === 't2' ? c.b : null;
      if (T.heat === 'd') {
        var d = c.d, bg = d == null ? 'var(--tm-void)' : d >= 0 ? 'color-mix(in srgb,var(--tm-ok) ' + cl(Math.abs(d) / m.M * 260, 18, 100) + '%,var(--tm-surf2))' : 'color-mix(in srgb,var(--tm-bad) ' + cl(Math.abs(d) / m.M * 260, 18, 100) + '%,var(--tm-surf2))';
        return '<div class="tm-hc" style="background:' + bg + ';color:var(--tm-ink)" data-act="tmStu" data-id="' + r.s.id + '" title="' + esc(c.sub) + ' • رشد ' + dTxt(d) + '">' + dTxt(d) + '</div>';
      }
      return '<div class="tm-hc" style="background:' + heat(v) + '" data-act="tmStu" data-id="' + r.s.id + '" title="' + esc(c.sub) + ' • ' + (lvl(v) ? esc(lvl(v).label) : 'بدون نمره') + '">' + (v == null ? '—' : fn(v, 1)) + '</div>';
    }).join('');
    var tot = T.heat === 't1' ? r.aa : T.heat === 't2' ? r.bb : r.d;
    return '<div class="tm-hh" style="text-align:right;display:flex;align-items:center;gap:6px">' + av(r.s, 'sm') + '<span style="font-size:.72rem;color:var(--tm-ink)">' + esc(r.s.name) + '</span></div>' + cells
      + '<div class="tm-hc" style="background:' + (T.heat === 'd' ? 'var(--tm-surf2)' : heat(tot)) + ';color:' + (T.heat === 'd' ? dCol(tot) : '#fff') + '">' + (T.heat === 'd' ? dTxt(tot) : tot == null ? '—' : fn(tot, 1)) + '</div>';
  }).join('');
  return '<div class="tm-scroll"><div class="tm-heat" style="grid-template-columns:150px repeat(' + n + ',minmax(58px,1fr)) 66px">' + head + body + '</div></div>'
    + '<div class="tm-legend" style="margin-top:10px"><span><b style="background:#e11d48"></b>نیاز به تلاش</span><span><b style="background:#d97706"></b>قابل قبول</span><span><b style="background:#f59e0b"></b>خوب</span><span><b style="background:#65a30d"></b>خیلی خوب</span><span><b style="background:#0d9488"></b>درخشان</span></div>';
}
function cardsView(){
  var m = MODEL;
  return '<div class="tm-cards">' + m.rows.map(function(r, k){
    var bars = r.cells.filter(function(c){ return c.a != null || c.b != null; }).map(function(c, i){
      var a = c.a == null ? 0 : c.a / m.M * 100, b = c.b == null ? 0 : c.b / m.M * 100, col = CP()[m.subs.indexOf(c.sub) % 8];
      return '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:.68rem;font-weight:700"><span>' + esc(c.sub) + '</span><span style="color:' + dCol(c.d) + '">' + dTxt(c.d) + '</span></div>'
        + '<div class="tm-track" style="height:8px"><i style="width:' + a.toFixed(1) + '%;background:' + col + '"></i></div>'
        + '<div class="tm-track hatch" style="height:6px;margin-top:2px"><i style="width:' + b.toFixed(1) + '%;background:var(--tm-h3)"></i></div></div>';
    }).join('');
    return '<div class="tm-card" style="animation-delay:' + (k % 12) * 30 + 'ms"><div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">' + av(r.s)
      + '<div style="flex:1;min-width:0"><b style="font-size:.86rem">' + esc(r.s.name) + '</b><div style="font-size:.66rem;color:var(--tm-mut)">' + (r.g ? esc(r.g.name) + ' • ' : '') + fa(r.n1) + ' درس در بازه</div></div>'
      + '<button type="button" class="tm-btn" data-act="tmStu" data-id="' + r.s.id + '">👁</button></div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><span class="tm-pill" style="--pc:var(--tm-h1)">اول ' + cellTxt(r.aa) + '</span><span class="tm-pill" style="--pc:var(--tm-h3)">دوم ' + cellTxt(r.bb) + '</span><span class="tm-pill" style="--pc:' + dCol(r.d) + '">رشد ' + dTxt(r.d) + '</span><span class="tm-pill" style="--pc:' + (r.d1.net >= 0 ? 'var(--tm-ok)' : 'var(--tm-bad)') + '">⭐ ' + fa(r.d1.net) + '</span></div>'
      + (bars || '<p class="tm-tip">در این بازه نمره‌ای ثبت نشده است.</p>') + '</div>';
  }).join('') + '</div>';
}
function results(){
  var m = MODEL;
  if (!m.rows.length) return '<div class="tm-card"><div class="tm-empty"><span class="e">🔍</span><b>دانش‌آموزی با این فیلتر نیست</b><p class="tm-tip">عبارت جستجو یا گروه را تغییر بده.</p></div></div>';
  if (!m.as1) return '<div class="tm-card"><div class="tm-empty"><span class="e">🗓️</span><b>در بازهٔ نوبت اول هیچ ارزشیابی‌ای نیست</b>'
    + '<p class="tm-tip">بازهٔ ' + jL(m.r1.from) + ' تا ' + jL(m.r1.to) + ' خالی است. با «🪄 بازهٔ هوشمند» بازه‌ای که واقعاً نمره دارد را انتخاب کن.</p>'
    + '<button type="button" class="tm-btn gold" data-act="tmSmart" style="margin-top:10px">🪄 بازهٔ هوشمند</button></div></div>' + bulkBar() + (T.view === 'cards' ? cardsView() : T.view === 'heat' ? heatView() : T.view === 'summary' ? summaryView() : matrixView());
  return bulkBar() + (T.view === 'cards' ? cardsView() : T.view === 'heat' ? heatView() : T.view === 'summary' ? summaryView() : matrixView());
}

/* ---------------- render ---------------- */
function paint(){
  var m = build(); if (!m) return;
  var root = document.querySelector('.tm'); if (root) { root.dataset.pal = T.pal; root.style.setProperty('--tm-fs', (T.font / 100).toFixed(2)); }
  var kv = document.getElementById('tmKVal'); if (kv) kv.textContent = fa(Number(T.discK).toFixed(2));
  var fv = document.getElementById('tmFontVal'); if (fv) fv.textContent = fa(T.font) + '٪';
  ['oral','written','performance','homework'].forEach(function(k){ var e = document.getElementById('tmW_' + k); if (e) e.textContent = fa(Number(T.w[k]).toFixed(2)); });
  var l1 = lvl(m.ca), l2 = lvl(m.cb);
  var stats = [
    ['📝', 'var(--tm-h2)', fa(m.as1), 'ارزشیابی در نوبت اول • ' + fa(m.as2) + ' در کل سال'],
    ['🌟', 'var(--tm-h1)', l1 ? l1.icon + ' ' + l1.label : '—', 'میانگین کلاس • نوبت اول (' + fn(m.ca, 2) + ')'],
    ['📘', 'var(--tm-h3)', l2 ? l2.icon + ' ' + l2.label : '—', 'نمرهٔ دوم • کل سال (' + fn(m.cb, 2) + ')'],
    [m.cd != null && m.cd >= 0 ? '📈' : '📉', m.cd != null && m.cd >= 0 ? 'var(--tm-ok)' : 'var(--tm-bad)', dTxt(m.cd), 'رشد کلاس از نوبت اول تا پایان سال'],
    ['⭐', m.gd >= 0 ? 'var(--tm-ok)' : 'var(--tm-bad)', (m.gd > 0 ? '+' : '') + fa(m.gd), fa(m.gn) + ' رویداد انضباطی در بازه'],
    ['🎯', 'var(--tm-h6)', fa(m.total ? Math.round(m.cover / m.total * 100) : 0) + '٪', fa(m.cover) + ' از ' + fa(m.total) + ' نفر نمره دارند']
  ];
  var sum = document.getElementById('tmSummary');
  if (sum) sum.innerHTML = '<div class="tm-grid tm-g6" style="margin-bottom:12px">' + stats.map(function(s, i){
    return '<div class="tm-card" style="animation-delay:' + i * 40 + 'ms"><div class="tm-stat"><span class="ic" style="background:linear-gradient(135deg,' + s[1] + ',color-mix(in srgb,' + s[1] + ' 55%,#000))">' + s[0] + '</span><div><b>' + esc(s[2]) + '</b><span>' + esc(s[3]) + '</span></div></div></div>';
  }).join('') + '</div>';
  var ch = document.getElementById('tmCharts');
  if (ch) ch.innerHTML = '<div class="tm-grid tm-g32" style="margin-bottom:12px">'
    + '<div class="tm-card"><h3>📚 میانگین هر درس در دو بازه</h3>' + subBars() + '</div>'
    + '<div class="tm-card"><h3>🎯 سنجهٔ کلاس</h3>' + gauge()
    + '<div class="tm-dl"><span>بازهٔ نوبت اول</span><b>' + jS(m.r1.from) + ' → ' + jS(m.r1.to) + '</b></div>'
    + '<div class="tm-dl"><span>بازهٔ نمرهٔ دوم</span><b>' + jS(m.r2.from) + ' → ' + jS(m.r2.to) + '</b></div>'
    + '<div class="tm-dl"><span>روزهای بازه</span><b>' + fa(Math.round((C.isoToDate(m.r1.to) - C.isoToDate(m.r1.from)) / 864e5) + 1) + ' روز</b></div>'
    + '<div class="tm-dl"><span>میانگین خام (بدون انضباط)</span><b>' + fn(m.ca, 2) + ' / ' + fn(m.cb, 2) + '</b></div>'
    + (T.disc ? '<div class="tm-note" style="margin-top:8px">⭐ انضباط با ضریب ' + fa(Number(T.discK).toFixed(2)) + ' در معدل اثر داده شده است؛ ستون‌های «معدل» مقدار تعدیل‌شده را نشان می‌دهند.</div>' : '')
    + '</div></div>'
    + '<div class="tm-card" style="margin-bottom:12px"><h3>🗓️ نقشهٔ زمانی ارزشیابی‌ها و انضباط در سال تحصیلی</h3>' + timeline() + '</div>'
    + '<div class="tm-grid tm-g2" style="margin-bottom:12px"><div class="tm-card"><h3>🔀 چه کسانی رشد یا افت کردند؟</h3>' + movers() + '</div>'
    + '<div class="tm-card"><h3>🧭 راهنمای خواندن این گزارش</h3><div class="tm-note">ستون «اول» فقط ارزشیابی‌های داخل بازهٔ انتخابی تو را می‌شمارد؛ ستون «دوم» همهٔ نمرات از ' + jS(m.y.start) + ' تا ' + jS(m.y.end) + ' است. پس «رشد» یعنی عملکرد نیمهٔ بعد سال نسبت به بازهٔ اول چقدر تغییر کرده است.</div>'
    + '<p class="tm-tip">🧮 با «میانگین وزنی» می‌توانی به کتبی وزن بیشتری بدهی. 🚩 نشان «غ» یعنی دانش‌آموز در روز ارزشیابی غایب بوده. 🔥 در نمای ماتریس، رنگ هر خانه سطح نمره است. با کشیدن چیپ درس‌ها ترتیب ستون‌ها را عوض کن.</p></div></div>';
  var rs = document.getElementById('tmResults');
  if (rs) rs.innerHTML = '<div class="tm-card"><h3>' + (T.view === 'heat' ? '🔥 ماتریس حرارتی' : T.view === 'cards' ? '🗂️ کارت‌های دانش‌آموزان' : T.view === 'summary' ? '🧾 خلاصهٔ نوبت‌ها' : '📋 جدول کامل نوبت اول و نمرهٔ دوم') + ' <span class="tm-pill">' + fa(m.rows.length) + ' نفر</span></h3>' + results() + '</div>';
}
function renderTerms(){
  var v = document.getElementById('view'); if (!v) return;
  var m = build(); if (!m) { v.innerHTML = '<div class="tm"><div class="tm-card">داده‌ای بارگذاری نشده است.</div></div>'; return; }
  v.innerHTML = '<div class="tm" data-pal="' + T.pal + '">'
    + '<div class="tm-hero"><h1>🧮 نوبت اول و نمرهٔ دوم</h1>'
    + '<p>یک بازهٔ زمانی انتخاب کن تا میانگین همهٔ دروس و امتیاز انضباطی در آن بازه، «نوبت اول» شود؛ ستون کنارش میانگین کل سال تحصیلی است تا رشد هر دانش‌آموز دیده شود.</p>'
    + '<span class="tm-window">🗓️ نوبت اول: ' + jL(m.r1.from) + ' تا ' + jL(m.r1.to) + '</span> '
    + '<span class="tm-window" style="border-color:color-mix(in srgb,var(--tm-gold) 55%,var(--tm-line))">📘 نمرهٔ دوم: ' + jS(m.r2.from) + ' تا ' + jS(m.r2.to) + '</span></div>'
    + ctlHTML() + '<div id="tmSummary"></div><div id="tmCharts"></div><div id="tmResults"></div></div>';
  paint();
}

/* ---------------- drawers ---------------- */
function stuDrawer(id){
  var m = MODEL || build(), r = null;
  m.rows.forEach(function(x){ if (x.s.id === id) r = x; });
  if (!r) { var s = m.s, o = stu(s, id); if (!o) return; r = { s: o, g: grp(s, id), cells: m.subs.map(function(sub){ var l1 = items(s, id, sub, m.r1), l2 = items(s, id, sub, m.r2); var a = valueOf(l1), b = valueOf(l2); return { sub: sub, a: a, b: b, n1: l1.length, n2: l2.length, d: (a != null && b != null) ? b - a : null, l1: l1, l2: l2 }; }), d1: discOf(s, id, m.r1), d2: discOf(s, id, m.r2), at1: attOf(s, id, m.r1), at2: attOf(s, id, m.r2) };
    var v1 = r.cells.map(function(c){ return c.a; }).filter(function(x){ return x != null; }), v2 = r.cells.map(function(c){ return c.b; }).filter(function(x){ return x != null; });
    r.a = v1.length ? avg(v1) : null; r.b = v2.length ? avg(v2) : null; r.aa = r.a; r.bb = r.b; r.d = (r.a != null && r.b != null) ? r.b - r.a : null; }
  var rows = r.cells.map(function(c, i){
    return '<tr><td style="text-align:right"><b style="color:' + CP()[i % 8] + '">' + esc(c.sub) + '</b></td>'
      + '<td>' + cellTxt(c.a) + '<div style="font-size:.62rem;color:var(--tm-mut)">' + fa(c.n1) + ' نمره</div></td>'
      + '<td>' + cellTxt(c.b) + '<div style="font-size:.62rem;color:var(--tm-mut)">' + fa(c.n2) + ' نمره</div></td>'
      + '<td style="color:' + dCol(c.d) + ';font-weight:800">' + dTxt(c.d) + '</td></tr>';
  }).join('');
  var as1 = {}; (m.s.assessments || []).forEach(function(a){ if (a.date >= m.r1.from && a.date <= m.r1.to) as1[a.id] = a; });
  var lst = Object.keys(as1).map(function(k){ return as1[k]; }).sort(function(a, b){ return a.date < b.date ? 1 : -1; }).map(function(a){
    var gs = (a.subjects || []).map(function(sub){ var g = ((m.s.grades || {})[a.id] || {})[sub]; var v = g ? g[id] : null; return '<span class="tm-pill" style="--pc:' + (sc(m.s, v) == null ? 'var(--tm-mut)' : heat(sc(m.s, v))) + '">' + esc(sub) + ': ' + (v == null ? '—' : cellTxt(sc(m.s, v))) + '</span>'; }).join(' ');
    return '<div style="padding:8px 0;border-bottom:1px dashed var(--tm-line)"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:.8rem">' + esc(a.title) + '</b><span style="font-size:.68rem;color:var(--tm-mut)">' + jS(a.date) + '</span></div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' + gs + '</div></div>';
  }).join('');
  var ev = r.d1.ev.map(function(d){
    return '<div class="tm-dl"><span>' + (d.points > 0 ? '🟢' : '🔴') + ' ' + esc(d.reason) + '</span><span style="display:flex;gap:8px"><span style="font-size:.68rem;color:var(--tm-mut)">' + jS(d.date) + '</span><b style="color:' + (d.points > 0 ? 'var(--tm-ok)' : 'var(--tm-bad)') + '">' + (d.points > 0 ? '+' : '') + fa(d.points) + '</b></span></div>';
  }).join('');
  drw('🧮 ' + r.s.name, '<div class="tm" data-pal="' + T.pal + '">'
    + '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">' + av(r.s, 'lg') + '<div><b style="font-size:1.05rem">' + esc(r.s.name) + '</b>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px"><span class="tm-pill" style="--pc:var(--tm-h1)">نوبت اول ' + cellTxt(r.aa) + '</span><span class="tm-pill" style="--pc:var(--tm-h3)">نمرهٔ دوم ' + cellTxt(r.bb) + '</span><span class="tm-pill" style="--pc:' + dCol(r.d) + '">رشد ' + dTxt(r.d) + '</span></div></div></div>'
    + '<div class="tm-card" style="margin-bottom:12px"><h3>📚 ریز دروس در دو بازه</h3><div class="tm-scroll"><table class="tm-tbl" style="min-width:420px"><thead><tr><th style="text-align:right">درس</th><th>نوبت اول</th><th>نمرهٔ دوم</th><th>رشد</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>'
    + '<div class="tm-card" style="margin-bottom:12px"><h3>⭐ انضباط</h3><div class="tm-dl"><span>در بازهٔ نوبت اول</span><b><span style="color:var(--tm-ok)">+' + fa(r.d1.pos) + '</span> / <span style="color:var(--tm-bad)">−' + fa(r.d1.neg) + '</span> = ' + fa(r.d1.net) + '</b></div>'
    + '<div class="tm-dl"><span>در کل سال</span><b>' + fa(r.d2.net) + '</b></div><div class="tm-dl"><span>حضور بازه / کل</span><b>' + (r.at1.rate == null ? '—' : fa(r.at1.rate) + '٪') + ' / ' + (r.at2.rate == null ? '—' : fa(r.at2.rate) + '٪') + '</b></div>'
    + (ev ? '<div style="margin-top:8px">' + ev + '</div>' : '<p class="tm-tip">رویداد انضباطی در این بازه ثبت نشده است.</p>') + '</div>'
    + '<div class="tm-card"><h3>📝 ارزشیابی‌های داخل بازه (' + fa(Object.keys(as1).length) + ')</h3>' + (lst || '<p class="tm-tip">ارزشیابی‌ای در این بازه نیست.</p>') + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="tm-btn pri" data-act="tmPrintStu" data-id="' + id + '">🖨️ کارنامهٔ A4</button></div></div>', true);
  snd('pop');
}
function asmtDrawer(id){
  var m = MODEL || build(), s = m.s, a = null;
  (s.assessments || []).forEach(function(x){ if (x.id === id) a = x; });
  if (!a) return;
  var inR = a.date >= m.r1.from && a.date <= m.r1.to;
  var rows = (s.students || []).map(function(x){
    var cs = (a.subjects || []).map(function(sub){ var g = ((s.grades || {})[a.id] || {})[sub]; var v = g ? g[x.id] : null; var n = sc(s, v); return '<td style="color:' + (n == null ? 'var(--tm-mut)' : heat(n)) + ';font-weight:800">' + (n == null ? '—' : cellTxt(n)) + '</td>'; }).join('');
    var ab = ((s.attendance || {})[a.date] || {})[x.id];
    return '<tr><td class="tm-stick"><div class="tm-name">' + av(x, 'sm') + '<span style="font-size:.78rem;font-weight:700">' + esc(x.name) + '</span>' + (ab === 'absent' ? '<span class="tm-pill" style="--pc:var(--tm-bad)">غایب</span>' : '') + '</div></td>' + cs + '</tr>';
  }).join('');
  drw('📝 ' + a.title, '<div class="tm" data-pal="' + T.pal + '">'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><span class="tm-pill">' + jL(a.date) + '</span><span class="tm-pill" style="--pc:' + (inR ? 'var(--tm-ok)' : 'var(--tm-mut)') + '">' + (inR ? '✅ داخل نوبت اول' : 'خارج از بازهٔ نوبت اول') + '</span><span class="tm-pill" style="--pc:var(--tm-h6)">' + fa((a.subjects || []).length) + ' درس</span></div>'
    + '<div class="tm-scroll"><table class="tm-tbl" style="min-width:520px"><thead><tr><th class="tm-stick">دانش‌آموز</th>' + (a.subjects || []).map(function(x){ return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>', true);
  snd('tap');
}

/* ---------------- sheets & csv ---------------- */
function lvlCell(v){
  if (v == null) return '—';
  var l = lvl(v), i = l ? MODEL.s.levels.indexOf(l) + 1 : 0;
  var t = MODEL.s.meta.gradingMode === 'numeric' ? fn(v / MODEL.M * (MODEL.s.meta.numericMax || 20), 1) : (l ? l.label : '—');
  return '<span class="l' + i + '">' + esc(t) + '</span>';
}
function sheetClass(rows){
  var m = MODEL, list = rows || m.rows;
  var subRows = m.subStats.map(function(x){ return '<tr><td class="r"><b>' + esc(x.sub) + '</b></td><td>' + lvlCell(x.a) + '</td><td>' + fa(x.n1) + '</td><td>' + lvlCell(x.b) + '</td><td>' + fa(x.n2) + '</td><td>' + dTxt(x.d) + '</td></tr>'; }).join('');
  var stuRows = list.map(function(r, i){
    return '<tr><td>' + fa(i + 1) + '</td><td class="r">' + esc(r.s.name) + '</td><td>' + (r.g ? esc(r.g.name) : '—') + '</td><td>' + lvlCell(r.aa) + '</td><td>' + lvlCell(r.bb) + '</td><td>' + dTxt(r.d) + '</td><td>' + fa(r.d1.net) + '</td><td>' + fa(r.d2.net) + '</td><td>' + (r.at1.rate == null ? '—' : fa(r.at1.rate) + '٪') + '</td></tr>';
  }).join('');
  return '<div class="sheet">' + sHead('گزارش نوبت اول و نمرهٔ دوم', 'بازهٔ نوبت اول: ' + jS(m.r1.from) + ' تا ' + jS(m.r1.to))
    + '<table><tr><th style="width:22%">بازهٔ نوبت اول</th><td>' + jL(m.r1.from) + ' تا ' + jL(m.r1.to) + '</td><th style="width:16%">نمرهٔ دوم</th><td>' + jS(m.r2.from) + ' تا ' + jS(m.r2.to) + '</td></tr>'
    + '<tr><th>شیوهٔ محاسبه</th><td>' + ({ avg:'میانگین ساده', weighted:'میانگین وزنی', last:'آخرین نمره', best:'بهترین نمره' })[T.calc] + '</td><th>احتساب انضباط</th><td>' + (T.disc ? 'بله، ضریب ' + fa(Number(T.discK).toFixed(2)) : 'خیر') + '</td></tr></table>'
    + '<span class="sec">📚 میانگین کلاس در هر درس</span><table><thead><tr><th style="width:26%">درس</th><th>نوبت اول</th><th>تعداد</th><th>نمرهٔ دوم</th><th>تعداد</th><th>رشد</th></tr></thead><tbody>' + subRows
    + '<tr><td class="r"><b>میانگین کل</b></td><td><b>' + lvlCell(m.ca) + '</b></td><td>' + fa(m.as1) + '</td><td><b>' + lvlCell(m.cb) + '</b></td><td>' + fa(m.as2) + '</td><td><b>' + dTxt(m.cd) + '</b></td></tr></tbody></table>'
    + '<span class="sec">👦 معدل و انضباط دانش‌آموزان (' + fa(list.length) + ' نفر)</span>'
    + '<table style="font-size:10px"><thead><tr><th style="width:5%">#</th><th style="width:24%">نام</th><th style="width:12%">گروه</th><th>نوبت اول</th><th>نمرهٔ دوم</th><th>رشد</th><th>انضباط بازه</th><th>انضباط کل</th><th>حضور</th></tr></thead><tbody>' + stuRows + '</tbody></table>'
    + sFoot() + '</div>';
}
function sheetStu(id){
  var m = MODEL, r = null; m.rows.forEach(function(x){ if (x.s.id === id) r = x; });
  if (!r) return '';
  var rows = r.cells.map(function(c){ return '<tr><td class="r"><b>' + esc(c.sub) + '</b></td><td>' + lvlCell(c.a) + '</td><td>' + fa(c.n1) + '</td><td>' + lvlCell(c.b) + '</td><td>' + fa(c.n2) + '</td><td>' + dTxt(c.d) + '</td></tr>'; }).join('');
  var ev = r.d1.ev.slice(0, 14).map(function(d){ return '<tr><td>' + jS(d.date) + '</td><td class="r">' + esc(d.reason) + '</td><td>' + (d.points > 0 ? '+' : '') + fa(d.points) + '</td></tr>'; }).join('');
  return '<div class="sheet">' + sHead('کارنامهٔ نوبت اول و نمرهٔ دوم', r.s.name)
    + '<table><tr><th style="width:16%">نام</th><td style="width:30%"><b>' + esc(r.s.name) + '</b></td><th style="width:12%">گروه</th><td>' + (r.g ? esc(r.g.name) : '—') + '</td><th style="width:12%">بازهٔ اول</th><td>' + jS(m.r1.from) + ' → ' + jS(m.r1.to) + '</td></tr></table>'
    + '<span class="sec">📚 دروس</span><table><thead><tr><th style="width:26%">درس</th><th>نوبت اول</th><th>تعداد</th><th>نمرهٔ دوم (کل سال)</th><th>تعداد</th><th>رشد</th></tr></thead><tbody>' + rows
    + '<tr><td class="r"><b>معدل</b></td><td><b>' + lvlCell(r.aa) + '</b></td><td>' + fa(r.n1 || 0) + '</td><td><b>' + lvlCell(r.bb) + '</b></td><td>' + fa(r.n2 || 0) + '</td><td><b>' + dTxt(r.d) + '</b></td></tr></tbody></table>'
    + '<span class="sec">⭐ انضباط و حضور</span><table><tr><th>انضباط بازه</th><th>انضباط کل سال</th><th>حضور بازه</th><th>حضور کل</th><th>غیبت</th></tr>'
    + '<tr><td>' + fa(r.d1.net) + ' (' + fa(r.d1.n) + ' رویداد)</td><td>' + fa(r.d2.net) + '</td><td>' + (r.at1.rate == null ? '—' : fa(r.at1.rate) + '٪') + '</td><td>' + (r.at2.rate == null ? '—' : fa(r.at2.rate) + '٪') + '</td><td>' + fa(r.at1.absent) + '</td></tr></table>'
    + (ev ? '<span class="sec">📜 رویدادهای انضباطی بازه</span><table style="font-size:10px"><thead><tr><th style="width:18%">تاریخ</th><th>دلیل</th><th style="width:14%">امتیاز</th></tr></thead><tbody>' + ev + '</tbody></table>' : '')
    + sFoot() + '</div>';
}
function csvRows(rows){
  var m = MODEL, head = ['نام', 'کد', 'گروه'];
  m.subs.forEach(function(s){ head.push(s + ' — نوبت اول'); head.push(s + ' — نمره دوم'); });
  head.push('معدل نوبت اول', 'معدل نمره دوم', 'رشد', 'انضباط بازه', 'انضباط کل', 'حضور بازه', 'حضور کل', 'تعداد نمره بازه');
  var out = [head];
  (rows || m.rows).forEach(function(r){
    var line = [r.s.name, r.s.code, r.g ? r.g.name : ''];
    r.cells.forEach(function(c){ line.push(c.a == null ? '' : fn(c.a, 2)); line.push(c.b == null ? '' : fn(c.b, 2)); });
    line.push(r.aa == null ? '' : fn(r.aa, 2), r.bb == null ? '' : fn(r.bb, 2), r.d == null ? '' : fn(r.d, 2), r.d1.net, r.d2.net,
      r.at1.rate == null ? '' : fa(r.at1.rate), r.at2.rate == null ? '' : fa(r.at2.rate), r.n1 || 0);
    out.push(line);
  });
  return out;
}
function selectedRows(){
  var m = MODEL, ids = Object.keys(T.sel).filter(function(k){ return T.sel[k]; });
  return ids.length ? m.rows.filter(function(r){ return T.sel[r.s.id]; }) : m.rows;
}

/* ---------------- install ---------------- */
var installed = false;
function install(){
  if (installed) return true;
  var ok = false;
  try { ok = typeof navItems === 'function' && typeof renderView === 'function' && typeof ACT !== 'undefined' && typeof CHG !== 'undefined' && typeof INP !== 'undefined'; } catch (e) {}
  if (!ok) return false;
  var baseNav = navItems, baseRV = renderView;
  navItems = function(){
    var it = baseNav.apply(this, arguments);
    try { if (teacher() && !it.some(function(x){ return x[0] === 'terms'; })) { var i = -1; it.forEach(function(x, k){ if (x[0] === 'grades') i = k; }); it.splice(i > -1 ? i + 1 : it.length, 0, ['terms', '🧮', 'نوبت اول و دوم']); } } catch (e) {}
    return it;
  };
  renderView = function(){
    if (UX().section === 'terms' && teacher()) { try { renderTerms(); } catch (e) { console.error('terms', e); document.getElementById('view').innerHTML = '<div class="tm"><div class="tm-card">خطا در نمایش گزارش نوبت‌ها.</div></div>'; } return; }
    var r = baseRV.apply(this, arguments);
    setTimeout(decorate, 60);
    return r;
  };
  ACT.tmPreset = function(el){
    var y = yb(), v = el.dataset.v, t = td(), j = jOf(t);
    if (v === 'm10') { T.from = y.start; T.to = jISO(y.a, 10, mlen(y.a, 10)); }
    else if (v === 'm11') { T.from = y.start; T.to = jISO(y.a, 11, mlen(y.a, 11)); }
    else if (v === 'h2') { T.from = jISO(y.a, 11, 1); T.to = y.end; }
    else if (v === 'year') { T.from = y.start; T.to = y.end; }
    else if (v === 'last30') { var d = C.isoToDate(t); d.setDate(d.getDate() - 29); T.from = C.dateToISO(d); T.to = t; }
    else { T.from = jISO(j.jy, j.jm, 1); T.to = jISO(j.jy, j.jm, mlen(j.jy, j.jm)); }
    keep(); snd('tap'); renderTerms(); say('بازهٔ نوبت اول به‌روز شد', 'ok');
  };
  ACT.tmSmart = function(){
    var s = Sx(), ds = (s.assessments || []).map(function(a){ return a.date; }).filter(Boolean).sort();
    if (!ds.length) return say('ارزشیابی‌ای ثبت نشده است', 'err');
    T.from = ds[0]; T.to = ds[ds.length - 1]; keep(); snd('win'); renderTerms();
    say('🪄 بازه از ' + jS(T.from) + ' تا ' + jS(T.to) + ' تنظیم شد', 'ok');
  };
  ACT.tmDisp = function(el){ T.disp = el.dataset.v; keep(); snd('tap'); renderTerms(); };
  ACT.tmView = function(el){ T.view = el.dataset.v; keep(); snd('tap'); renderTerms(); };
  ACT.tmStu = function(el){ stuDrawer(el.dataset.id); };
  ACT.tmAsmt = function(el){ asmtDrawer(el.dataset.id); };
  ACT.tmSelNone = function(){ T.sel = {}; keep(); paint(); };
  ACT.tmSave = function(){
    ask({ title: '💾 ذخیرهٔ بازه', placeholder: 'نام بازه (مثلاً نوبت اول ۱۴۰۵)', onOk: function(name){
      T.saved.push({ id: uid(), name: name, from: T.from, to: T.to, m2: T.m2, from2: T.from2, to2: T.to2, calc: T.calc });
      keep(); renderTerms(); say('💾 بازه ذخیره شد', 'ok');
    } });
  };
  ACT.tmApply = function(el){
    var v = T.saved[+el.dataset.i]; if (!v) return;
    T.from = v.from; T.to = v.to; T.m2 = v.m2 || 'year'; T.from2 = v.from2 || T.from2; T.to2 = v.to2 || T.to2; T.calc = v.calc || T.calc;
    keep(); snd('pop'); renderTerms(); say('📂 بازهٔ «' + v.name + '» اعمال شد', 'ok');
  };
  ACT.tmDelSaved = function(el){
    var i = +el.dataset.i, v = T.saved[i]; if (!v) return;
    T.saved.splice(i, 1); keep(); renderTerms();
    say('بازهٔ «' + v.name + '» حذف شد', 'ok', { label: 'واگرد', cb: function(){ T.saved.splice(i, 0, v); keep(); renderTerms(); say('بازه برگشت', 'ok'); } }, 8000);
  };
  ACT.tmReset = function(){
    T.from = ''; T.to = ''; T.m2 = 'year'; T.calc = 'avg'; T.disc = false; T.discK = .12; T.q = ''; T.group = 'all'; T.sort = 'name'; T.view = 'matrix'; T.disp = 'level'; T.font = 100; T.sel = {};
    T.w = { oral: 1, written: 1.5, performance: 1.25, homework: .75 };
    ensureRanges(); keep(); snd('pop'); renderTerms(); say('♻️ تنظیمات گزارش بازنشانی شد', 'ok');
  };
  ACT.tmCSV = function(){ var m = MODEL || build(); dl('نوبت-اول-و-دوم-' + jS(m.r1.from).replace(/\//g, '-') + '.csv', csvOf(csvRows(m.rows))); say('📤 فایل CSV دانلود شد', 'ok'); };
  ACT.tmBulkCSV = function(){ dl('نوبت-انتخاب-شده.csv', csvOf(csvRows(selectedRows()))); say('📤 CSV انتخاب‌شده‌ها دانلود شد', 'ok'); };
  ACT.tmPrintClass = function(){ pv('🖨️ گزارش کلاس A4', sheetClass(selectedRows())); };
  ACT.tmBulkPrint = function(){ var list = selectedRows(); pv('🖨️ کارنامهٔ ' + fa(list.length) + ' نفر', list.map(function(r){ return sheetStu(r.s.id); }).join('')); };
  ACT.tmPrintStu = function(el){ pv('🖨️ کارنامهٔ A4', sheetStu(el.dataset.id)); };
  CHG.tmDate = function(el){
    var key = el.dataset.key, p = el.dataset.p, v = num(el.value), j = jOf(getD(key));
    if (p === 'd') j.jd = v; else if (p === 'm') j.jm = v; else j.jy = v;
    j.jd = Math.min(j.jd, mlen(j.jy, j.jm));
    setD(key, jISO(j.jy, j.jm, j.jd));
    if (p !== 'd') { var w = el.closest('.tm-dsel'), ds = w && w.querySelector('[data-p="d"]'); if (ds) { var n = mlen(j.jy, j.jm), o = ''; for (var d = 1; d <= n; d++) o += '<option value="' + d + '"' + (j.jd === d ? ' selected' : '') + '>' + fa(d) + '</option>'; ds.innerHTML = o; } }
    if (T.to < T.from && key === 'from') { T.to = T.from; var w2 = document.querySelector('[data-dsel="to"]'); if (w2) w2.outerHTML = dsel('to'); }
    keep(); paint(); var win = document.querySelectorAll('.tm-window'); if (win[0]) { var m = MODEL; win[0].textContent = '🗓️ نوبت اول: ' + jL(m.r1.from) + ' تا ' + jL(m.r1.to); }
    if (win[1]) win[1].textContent = '📘 نمرهٔ دوم: ' + jS(MODEL.r2.from) + ' تا ' + jS(MODEL.r2.to);
  };
  CHG.tmM2 = function(el){ T.m2 = el.value; keep(); snd('tap'); renderTerms(); };
  CHG.tmCalc = function(el){ T.calc = el.value; keep(); snd('tap'); renderTerms(); };
  CHG.tmGroup = function(el){ T.group = el.value; keep(); paint(); };
  CHG.tmSort = function(el){ T.sort = el.value; keep(); paint(); };
  CHG.tmHeat = function(el){ T.heat = el.value; keep(); paint(); };
  CHG.tmPal = function(el){ T.pal = el.value; keep(); snd('pop'); paint(); };
  CHG.tmBool = function(el){ T[el.dataset.k] = el.checked; keep(); snd('tap'); paint(); };
  CHG.tmSound = function(el){ try { if (typeof Sound !== 'undefined') { Sound.on = el.checked; localStorage.setItem('sh_sound', JSON.stringify(Sound.on)); if (typeof applyAppearance === 'function') applyAppearance(); if (Sound.on) Sound.play('pop'); } } catch (e) {} renderTerms(); };
  CHG.tmSel = function(el){ T.sel[el.dataset.id] = el.checked; keep(); paint(); };
  INP.tmQ = function(el){ T.q = el.value; keep(); paint(); };
  INP.tmK = function(el){ T.discK = Number(el.value); keep(); paint(); };
  INP.tmFont = function(el){ T.font = num(el.value); keep(); paint(); };
  INP.tmW = function(el){ T.w[el.dataset.k] = Number(el.value); keep(); paint(); };
  document.addEventListener('dragstart', function(e){ var c = e.target.closest && e.target.closest('[data-tmdrag]'); if (!c) return; c.classList.add('drag'); e.dataTransfer.setData('text/plain', 'tm:' + c.dataset.tmdrag); e.dataTransfer.effectAllowed = 'move'; });
  document.addEventListener('dragend', function(){ Array.prototype.forEach.call(document.querySelectorAll('.tm-chip'), function(c){ c.classList.remove('drag', 'over'); }); });
  document.addEventListener('dragover', function(e){ var c = e.target.closest && e.target.closest('[data-tmdrop]'); if (!c) return; e.preventDefault(); c.classList.add('over'); });
  document.addEventListener('dragleave', function(e){ var c = e.target.closest && e.target.closest('[data-tmdrop]'); if (c) c.classList.remove('over'); });
  document.addEventListener('drop', function(e){
    var c = e.target.closest && e.target.closest('[data-tmdrop]'); if (!c) return;
    var raw = e.dataTransfer.getData('text/plain'); if (raw.indexOf('tm:') !== 0) return;
    e.preventDefault();
    var from = +raw.slice(3), to = +c.dataset.tmdrop, ord = subjects();
    if (from === to || isNaN(from) || isNaN(to)) return;
    var x = ord.splice(from, 1)[0]; ord.splice(to, 0, x); T.order = ord; keep(); snd('pop'); renderTerms();
  });
  installed = true;
  try { if (typeof render === 'function' && Sx() && SE()) render(true); } catch (e) {}
  return true;
}
function decorate(){
  try {
    if (!teacher() || UX().section !== 'grades') return;
    var head = document.querySelector('#view .page-head .row');
    if (!head || head.querySelector('[data-act="tmGo"]')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn sm ai'; b.dataset.act = 'tmGo';
    b.textContent = '🧮 نوبت اول و دوم';
    b.addEventListener('click', function(){ try { if (typeof setSection === 'function') setSection('terms'); else { UX().section = 'terms'; renderTerms(); } } catch (e) {} });
    head.appendChild(b);
  } catch (e) {}
}
if (!install()) {
  var tries = 0, iv = setInterval(function(){ if (install() || ++tries > 160) clearInterval(iv); }, 250);
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
}
})();
