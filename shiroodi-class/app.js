/* app.js v16 — هستهٔ رابط سامانه؛ ورود فقط سرورمحور، بدون هیچ کد در سورس */
'use strict';
var C = window.ClassCore;
var STATE = null, SESS = null, REV = 0, LAST_SNAP = null;
var UI = { section: 'dash', stuQ: '', jdate: {}, attMonth: '', gradeAid: '', pollDraft: null };
var Net = { mode: 'server', online: navigator.onLine, lastSync: 0, busy: 0 };
var ACT = {}, CHG = {}, INP = {}, FORM = {}, V = {};
var SYNC_MS = 20000, syncIv = 0, clockIv = 0;

/* ---------------- helpers ---------------- */
function fa(n) { return String(n == null ? '' : n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; }); }
function en(s) { return String(s == null ? '' : s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
function num(v) { var x = parseFloat(en(v)); return isFinite(x) ? x : 0; }
function norm(s) { return String(s == null ? '' : s).replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).toLowerCase().trim(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function mean(a) { return a && a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function faNum(v, d) { var x = Number(v) || 0; return fa(d == null ? String(Math.round(x * 10) / 10) : x.toFixed(d)).replace('.', '٫'); }
function tint(hex, a) { var h = String(hex).replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function S() { return STATE; }
function isT() { return !!SESS && SESS.role === 'teacher'; }
function stuById(st, id) { return ((st && st.students) || []).find(function (s) { return s.id === id; }) || null; }

/* ---------------- jalali ---------------- */
var JMONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
function g2j(gy, gm, gd) {
  var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var gy2 = gm > 2 ? gy + 1 : gy;
  var days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  var jy = -1595 + 33 * Math.floor(days / 12053); days %= 12053;
  jy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  var jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  var jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy: jy, jm: jm, jd: jd };
}
function j2g(jy, jm, jd) {
  var jy2 = jy + 1595;
  var days = -355668 + (365 * jy2) + (Math.floor(jy2 / 33) * 8) + Math.floor(((jy2 % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  var gy = 400 * Math.floor(days / 146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  var gd = days + 1;
  var sal = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var gm = 0; for (gm = 1; gm <= 12 && gd > sal[gm]; gm++) gd -= sal[gm];
  return { gy: gy, gm: gm, gd: gd };
}
var Jalali = {
  monthLen: function (jy, jm) { if (jm <= 6) return 31; if (jm <= 11) return 30; var r = ((jy + 1595) % 33); return [1, 5, 9, 13, 17, 22, 26, 30].indexOf(r) > -1 ? 30 : 29; },
  toJalali: g2j, toGregorian: j2g
};
function iranISO(d) { var j = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate()); return j.jy + '-'String(j.jm).padStart(2, '0') + '-' + String(j.jd).padStart(2, '0'); }
function todayISO() { return iranISO(new Date()); }
function isoToDate(iso) { var p = String(iso).split('-').map(Number); var g = j2g(p[0], p[1], p[2]); return new Date(g.gy, g.gm - 1, g.gd); }
function dateToISO(d) { return iranISO(d); }
function jOf(iso) { var p = String(iso || todayISO()).split('-').map(Number); return { jy: p[0], jm: p[1], jd: p[2] }; }
function jShort(iso) { if (!iso) return '—'; var j = jOf(iso); return fa(j.jy) + '/' + fa(String(j.jm).padStart(2, '0')) + '/' + fa(String(j.jd).padStart(2, '0')); }
function jLabel(iso) { var j = jOf(iso); return fa(j.jd) + ' ' + JMONTHS[j.jm - 1] + ' ' + fa(j.jy); }
function dtLabel(iso) { var d = new Date(iso); return jLabel(iranISO(d)) + ' • ' + fa(String(d.getHours()).padStart(2, '0')) + ':' + fa(String(d.getMinutes()).padStart(2, '0')); }
function wdIdx(iso) { return (isoToDate(iso).getDay() + 1) % 7; }
function jDateSelects(pre) {
  if (!UI.jdate[pre]) UI.jdate[pre] = todayISO();
  var j = jOf(UI.jdate[pre]);
  var days = ''; for (var d = 1; d <= Jalali.monthLen(j.jy, j.jm); d++) days += '<option value="' + fa(d) + '"' + (j.jd === d ? ' selected' : '') + '>' + fa(d) + '</option>';
  var ms = ''; JMONTHS.forEach(function (m, i) { ms += '<option value="' + fa(i + 1) + '"' + (j.jm === i + 1 ? ' selected' : '') + '>' + m + '</option>'; });
  var ys = ''; [1404, 1405, 1406, 1407].forEach(function (y) { ys += '<option value="' + fa(y) + '"' + (j.jy === y ? ' selected' : '') + '>' + fa(y) + '</option>'; });
  return '<div class="row" style="gap:6px"><select class="select" data-chg="jdate" data-p="d" data-pre="' + pre + '" style="flex:1">' + days + '</select><select class="select" data-chg="jdate" data-p="m" data-pre="' + pre + '" style="flex:2">' + ms + '</select><select class="select" data-chg="jdate" data-p="y" data-pre="' + pre + '" style="flex:1.4">' + ys + '</select></div>';
}
CHG.jdate = function (el) {
  var pre = el.dataset.pre, j = jOf(UI.jdate[pre] || todayISO());
  var v = num(el.value);
  if (el.dataset.p === 'y') j.jy = v; else if (el.dataset.p === 'm') { j.jm = v; j.jd = Math.min(j.jd, Jalali.monthLen(j.jy, j.jm)); } else j.jd = v;
  UI.jdate[pre] = j.jy + '-' + String(j.jm).padStart(2, '0') + '-' + String(j.jd).padStart(2, '0');
};

/* ---------------- sound ---------------- */
var Sound = {
  on: localStorage.getItem('sh_sound') !== '0', ac: null,
  play: function (k) {
    if (!this.on) return;
    try {
      if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ac.state === 'suspended') this.ac.resume();
      var m = { tap: [700, .04], ok: [660, .08], pop: [880, .05], win: [523, .18], err: [220, .16], gavel: [392, .12] }[k] || [660, .06];
      var o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = 'sine'; o.frequency.value = m[0];
      g.gain.setValueAtTime(.0001, this.ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.08, this.ac.currentTime + .015);
      g.gain.exponentialRampToValueAtTime(.0001, this.ac.currentTime + m[1]);
      o.connect(g); g.connect(this.ac.destination); o.start(); o.stop(this.ac.currentTime + m[1] + .02);
      if (k === 'win') setTimeout(function () { Sound.play('pop'); }, 140);
    } catch (e) {}
  }
};
document.addEventListener('pointerdown', function () { try { if (Sound.ac && Sound.ac.state === 'suspended') Sound.ac.resume(); } catch (e) {} }, { passive: true });

/* ---------------- toast / drawer / modal ---------------- */
function toast(msg, kind, action, ms) {
  var box = document.getElementById('toasts'); if (!box) return;
  var t = document.createElement('div');
  t.className = 'toast ' + (kind || 'info');
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (action ? '<button type="button" class="tact">' + esc(action.label) + '</button>' : '');
  if (action) t.querySelector('.tact').onclick = function () { action.cb(); t.remove(); };
  box.appendChild(t);
  setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, ms || 4500);
}
function openDrawer(title, html, wide) {
  var w = document.getElementById('drawerWrap');
  document.getElementById('drawerTitle').textContent = title;
  document.getElementById('drawerBody').innerHTML = html;
  document.getElementById('drawer').classList.toggle('wide', !!wide);
  w.classList.remove('hidden');
}
function closeDrawer() { document.getElementById('drawerWrap').classList.add('hidden'); }
var _modalOk = null, _modalNo = null;
function openModal(html) { document.getElementById('modalBox').innerHTML = html; document.getElementById('modalWrap').classList.remove('hidden'); }
function closeModal() { document.getElementById('modalWrap').classList.add('hidden'); _modalOk = _modalNo = null; }
function confirmDlg(o) {
  _modalOk = o.onOk; _modalNo = o.onCancel || null;
  openModal('<h3>' + esc(o.title) + '</h3><p class="small" style="line-height:2;margin:10px 0 16px">' + esc(o.body) + '</p><div class="row" style="justify-content:flex-end;gap:8px"><button type="button" class="btn ghost" data-act="modalClose">انصراف</button><button type="button" class="btn ' + (o.danger ? 'danger' : '') + '" data-act="modalOk">' + esc(o.okText || 'تأیید') + '</button></div>');
}
function promptDlg(o) {
  _modalOk = function () { var v = document.getElementById('promptIn').value; closeModal(); if (o.onOk) o.onOk(v); };
  openModal('<h3>' + esc(o.title) + '</h3><div class="field" style="margin:12px 0"><input class="input" id="promptIn" data-fa placeholder="' + esc(o.placeholder || '') + '" value="' + esc(o.value || '') + '"></div><div class="row" style="justify-content:flex-end;gap:8px"><button type="button" class="btn ghost" data-act="modalClose">انصراف</button><button type="button" class="btn" data-act="modalOk">تأیید</button></div>');
  setTimeout(function () { var i = document.getElementById('promptIn'); if (i) i.focus(); }, 60);
}
ACT.modalOk = function () { var f = _modalOk; closeModal(); if (f) f(); };
ACT.modalClose = closeModal;
ACT.drawerClose = closeDrawer;

/* ---------------- charts / sheets / csv ---------------- */
function empty(icon, title, sub, actions) { return '<div class="empty"><span class="ei">' + icon + '</span><b>' + esc(title) + '</b>' + (sub ? '<p class="small muted">' + esc(sub) + '</p>' : '') + (actions || '') + '</div>'; }
function lineChart(vals, labels, o) {
  o = o || {}; var w = 640, h = 200, p = 34;
  var mx = Math.max.apply(null, [1].concat(vals)), mn = 0;
  var X = function (i) { return p + (w - 2 * p) * (vals.length === 1 ? .5 : i / (vals.length - 1)); };
  var Y = function (v) { return h - 26 - (h - 52) * ((v - mn) / (mx - mn || 1)); };
  var pts = vals.map(function (v, i) { return X(i) + ',' + Y(v); }).join(' ');
  var col = o.color || 'var(--acc)';
  return '<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;min-width:280px;height:auto">' +
    [0, .5, 1].map(function (k) { var v = mn + (mx - mn) * k; return '<line x1="' + p + '" x2="' + (w - p) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--line)" stroke-dasharray="4 5"/><text x="' + (p - 5) + '" y="' + (Y(v) + 4) + '" font-size="9" fill="var(--muted)" text-anchor="end">' + faNum(v, 0) + '</text>'; }).join('') +
    '<polyline points="' + pts + '" fill="none" stroke="' + col + '" stroke-width="2.4"/>' +
    vals.map(function (v, i) { return '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="3" fill="' + col + '"><title>' + esc(labels[i] || '') + ': ' + faNum(v) + '</title></circle>'; }).join('') +
    labels.map(function (l, i) { return i % Math.ceil(labels.length / 8 || 1) === 0 ? '<text x="' + X(i) + '" y="' + (h - 6) + '" font-size="9" fill="var(--muted)" text-anchor="middle">' + esc(l) + '</text>' : ''; }).join('') + '</svg></div>';
}
function donut(items, o) {
  o = o || {}; var total = items.reduce(function (a, x) { return a + x.value; }, 0) || 1, r = 52, cx = 70, cy = 70, a0 = -Math.PI / 2;
  var paths = items.map(function (it) {
    var a1 = a0 + (it.value / total) * Math.PI * 2;
    var large = (a1 - a0) > Math.PI ? 1 : 0;
    var d = 'M' + (cx + r * Math.cos(a0)) + ',' + (cy + r * Math.sin(a0)) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + (cx + r * Math.cos(a1)) + ',' + (cy + r * Math.sin(a1));
    a0 = a1;
    return '<path d="' + d + '" fill="none" stroke="' + it.color + '" stroke-width="16"><title>' + esc(it.label) + ': ' + fa(it.value) + '</title></path>';
  }).join('');
  return '<div style="text-align:center"><svg viewBox="0 0 140 140" style="width:150px;height:150px">' + paths + '<text x="70" y="66" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ink)">' + esc(o.center || fa(total)) + '</text><text x="70" y="84" text-anchor="middle" font-size="9" fill="var(--muted)">' + esc(o.sub || '') + '</text></svg></div>';
}
function radarChart(labels, vals, max) {
  var n = labels.length || 1, cx = 130, cy = 120, R = 88;
  var pt = function (i, k) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return (cx + R * k * Math.cos(a)) + ',' + (cy + R * k * Math.sin(a)); };
  var rings = [.25, .5, .75, 1].map(function (k) { return '<polygon points="' + labels.map(function (_, i) { return pt(i, k); }).join(' ') + '" fill="none" stroke="var(--line)"/>'; }).join('');
  var axes = labels.map(function (l, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(a)) + '" y2="' + (cy + R * Math.sin(a)) + '" stroke="var(--line)"/><text x="' + (cx + (R + 16) * Math.cos(a)) + '" y="' + (cy + (R + 16) * Math.sin(a) + 3) + '" font-size="9" fill="var(--muted)" text-anchor="middle">' + esc(l) + '</text>'; }).join('');
  var poly = '<polygon points="' + vals.map(function (v, i) { return pt(i, clamp(v / (max || 4), 0, 1)); }).join(' ') + '" fill="' + tint('#0d9488', .25) + '" stroke="#0d9488" stroke-width="2"/>';
  return '<div style="text-align:center"><svg viewBox="0 0 260 240" style="width:100%;max-width:300px;height:auto">' + rings + axes + poly + '</svg></div>';
}
function avHTML(s, size) {
  var nm = (s && s.name) || '؟';
  var ini = nm.trim().split(/\s+/).map(function (x) { return x[0]; }).slice(0, 2).join('');
  var col = (s && s.color) || '#0d9488';
  return '<span class="av ' + (size || '') + '" style="background:' + tint(col, .18) + ';color:' + col + '">' + (s && s.avatar ? esc(s.avatar) : esc(ini)) + '</span>';
}
function sheetHead(title, sub) { return '<div class="sh-head"><b>دبستان شهید شیرودی عباس‌آباد</b><span>' + esc(title) + '</span><small>' + esc(sub || '') + ' • ' + jLabel(todayISO()) + '</small></div>'; }
function sheetFoot() { return '<div class="sh-foot">معلم و روانشناس: محمدباقر کالجی • طراحی: کالج مدیا</div>'; }
function previewSheet(title, html) {
  document.getElementById('printArea').innerHTML = html;
  openModal('<h3>' + esc(title) + '</h3><div class="sheet-prev">' + html + '</div><div class="row mt" style="justify-content:flex-end;gap:8px"><button type="button" class="btn ghost" data-act="modalClose">بستن</button><button type="button" class="btn" data-act="sheetPrint">🖨️ چاپ</button></div>');
}
ACT.sheetPrint = function () { window.print(); };
function download(name, text) {
  var b = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
}
function serializeCSV(st, rows) { return rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n'); }

/* ---------------- network ---------------- */
function api(path, method, body) {
  var ctrl = new AbortController();
  var to = setTimeout(function () { ctrl.abort(); }, 15000);
  var h = { 'Content-Type': 'application/json' };
  if (SESS && SESS.token) h.Authorization = 'Bearer ' + SESS.token;
  return fetch(path, { method: method || 'GET', headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal, cache: 'no-store' })
    .then(function (r) { clearTimeout(to); return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || j.message || ('خطای ' + r.status)); e.status = r.status; throw e; } return j; }); })
    .catch(function (e) { clearTimeout(to); if (e.name === 'AbortError') { var t = new Error('پاسخ سرور دیر رسید'); t.status = 408; throw t; } throw e; });
}
function setSync(ok, txt) {
  Net.online = ok;
  var el = document.getElementById('syncTxt'), dot = document.querySelector('#sync .dot'), off = document.getElementById('offline');
  if (el) el.textContent = txt || (ok ? 'متصل' : 'قطع');
  if (dot) dot.style.background = ok ? '#10b981' : '#e11d48';
  if (off) off.classList.toggle('hidden', ok || !SESS);
}
function loadState(silent) {
  if (!SESS) return Promise.resolve();
  return api('/api/state').then(function (r) {
    var v = r.view || r.state || r.data;
    if (v) { STATE = v; REV = r.revision || REV; }
    Net.lastSync = Date.now(); setSync(true);
    if (!silent) render(true); else render(true);
  }).catch(function (e) { setSync(false); if (!silent) toast('⚠️ ' + e.message, 'err'); });
}
function send(type, args, patch, opts) {
  opts = opts || {};
  if (!SESS) { toast('ابتدا وارد شو', 'err'); return Promise.resolve(null); }
  if (!Net.online && navigator.onLine === false) { toast('📴 آفلاین — تغییر ثبت نشد', 'err'); return Promise.resolve(null); }
  var snap = clone(STATE);
  if (patch && STATE) { try { patch(STATE); render(true); } catch (e) {} }
  Net.busy++; setSync(true, 'در حال ثبت…');
  var cmd = Object.assign({ type: type, cid: uid() }, args || {});
  function attempt(n) {
    return api('/api/mutate', 'POST', { cmd: cmd }).then(function (r) {
      var v = r.view || r.state || r.data;
      if (v) STATE = v;
      REV = r.revision || REV;
      LAST_SNAP = snap;
      Net.busy--; Net.lastSync = Date.now(); setSync(true);
      if (opts.msg) toast(opts.msg, 'ok');
      if (opts.sound !== null) Sound.play(opts.sound || 'ok');
      render(true);
      return r.result == null ? {} : r.result;
    }).catch(function (e) {
      if (e.status === 409 && n < 3) return attempt(n + 1);
      Net.busy--; STATE = snap; setSync(navigator.onLine);
      render(true);
      if (!opts.silent) toast('⚠️ ' + (e.message || 'ثبت نشد'), 'err', null, 7000);
      return null;
    });
  }
  return attempt(0);
}

/* ---------------- render engine ---------------- */
function navItems() {
  if (isT()) return [['dash', '🏠', 'داشبورد'], ['students', '👥', 'دانش‌آموزان'], ['grades', '📝', 'ارزشیابی'], ['attendance', '🗓️', 'حضور و غیاب'], ['analysis', '🧠', 'تحلیل هوشمند'], ['groups', '🧩', 'گروه‌ها'], ['roles', '🏛️', 'مسئولیت‌ها'], ['polls', '🗳️', 'نظرسنجی'], ['quizzes', '🧠', 'آزمون‌ها'], ['news', '📰', 'اخبار'], ['data', '🗄️', 'داده‌ها'], ['settings', '⚙️', 'تنظیمات']];
  return [['report', '🎓', 'کارنامه من'], ['myCourt', '⚖️', 'دادگاه من'], ['polls', '🗳️', 'نظرسنجی'], ['quizzes', '🧠', 'آزمون‌ها'], ['notifs', '🔔', 'اعلان‌ها']];
}
function setSection(k) { UI.section = k; document.body.classList.remove('side-open'); render(); }
ACT.nav = function (el) { setSection(el.dataset.sec); };
ACT.reload = function () { location.reload(); };
function renderSidebar() {
  var sb = document.getElementById('sidebar'); if (!sb || !SESS) return;
  sb.innerHTML = navItems().map(function (it) {
    return '<button type="button" class="nav' + (UI.section === it[0] ? ' on' : '') + '" data-sec="' + it[0] + '" data-act="nav" data-sec2="' + it[0] + '"><span class="ni">' + it[1] + '</span><span>' + esc(it[2]) + '</span></button>';
  }).join('');
  sb.querySelectorAll('.nav').forEach(function (b) { b.dataset.sec = b.getAttribute('data-sec2'); });
  var xn = document.getElementById('xnav');
  if (!xn) { xn = document.createElement('nav'); xn.id = 'xnav'; document.getElementById('app').appendChild(xn); }
  var items = isT() ? [['dash', '🏠', 'خانه'], ['grades', '📝', 'ارزشیابی'], ['attendance', '🗓️', 'حضور'], ['notifs', '🔔', 'اعلان']] : [['report', '🎓', 'کارنامه'], ['quizzes', '🧠', 'آزمون'], ['notifs', '🔔', 'اعلان']];
  xn.innerHTML = items.map(function (it) { return '<button type="button" data-xnav="' + it[0] + '" class="' + (UI.section === it[0] ? 'on' : '') + '"><span class="i">' + it[1] + '</span>' + it[2] + '</button>'; }).join('') + '<button type="button" data-xnav="more"><span class="i">☰</span>بیشتر</button>';
  xn.querySelectorAll('[data-xnav]').forEach(function (b) { b.onclick = function () { var k = b.dataset.xnav; if (k === 'more') document.body.classList.add('side-open'); else if (k === 'notifs' && ACT.xNotifs) ACT.xNotifs(); else setSection(k); }; });
}
function renderView() {
  var v = document.getElementById('view'); if (!v) return;
  var f = V[UI.section];
  v.innerHTML = '<div class="ve">' + (f ? f() : empty('🧭', 'بخش یافت نشد', '', '<button type="button" class="btn" data-act="nav" data-sec="' + (isT() ? 'dash' : 'report') + '">بازگشت</button>')) + '</div>';
}
function render(keep) {
  if (!SESS) return;
  var sc = keep ? document.getElementById('main').scrollTop : 0;
  renderSidebar(); renderView();
  var u = document.getElementById('userName'), r = document.getElementById('userRole'), a = document.getElementById('userAv');
  if (u) u.textContent = SESS.name || (isT() ? 'معلم' : 'دانش‌آموز');
  if (r) r.textContent = isT() ? '👨‍🏫 معلم' : '👦 دانش‌آموز';
  if (a) a.textContent = isT() ? '👨‍🏫' : '👦';
  var dc = document.getElementById('dateChip'); if (dc) dc.textContent = jLabel(todayISO());
  if (keep) document.getElementById('main').scrollTop = sc;
}

/* ---------------- base views ---------------- */
function avgOf(st, sid) {
  if (C && C.subjectAvgFor && st.subjects) { var a = st.subjects.map(function (s) { return C.subjectAvgFor(st, sid, s); }).filter(function (x) { return x != null; }); return a.length ? mean(a) : null; }
  return null;
}
V.dash = function () {
  var st = S(); if (!st) return '';
  var n = (st.students || []).length;
  var att = st.attendance || {}, days = Object.keys(att).sort().slice(-14);
  var pres = 0, tot = 0; days.forEach(function (d) { Object.keys(att[d]).forEach(function (s) { tot++; if (att[d][s] === 'present' || att[d][s] === 'late') pres++; }); });
  var hw = st.homework || { assignments: [], subs: {} };
  var done = 0, due = 0; (hw.assignments || []).forEach(function (a) { if (a.status === 'draft') return; due += (st.students || []).length; var sb = hw.subs[a.id] || {}; Object.keys(sb).forEach(function (s) { if (sb[s].status === 'done') done++; }); });
  var top = (st.students || []).map(function (s) { return { s: s, a: avgOf(st, s.id) }; }).filter(function (x) { return x.a != null; }).sort(function (a, b) { return b.a - a.a; }).slice(0, 5);
  return '<div class="grid g4 stagger mb">' +
    [['👥', fa(n), 'دانش‌آموز', '#0d9488'], ['🗓️', fa(tot ? Math.round(pres / tot * 100) : 0) + '٪', 'حضور ۱۴ روز', '#1d4ed8'], ['📚', fa(due ? Math.round(done / due * 100) : 0) + '٪', 'انجام تکالیف', '#7c3aed'], ['🪙', fa((st.discipline || []).filter(function (d) { return d.points > 0; }).reduce(function (a, d) { return a + d.points; }, 0)), 'امتیاز مثبت کل', '#d97706']].map(function (x, i) { return '<div class="card stat" style="--i:' + i + '"><span class="si" style="background:' + tint(x[3], .16) + ';color:' + x[3] + '">' + x[0] + '</span><div><b>' + x[1] + '</b><span>' + x[2] + '</span></div></div>'; }).join('') + '</div>' +
    '<div class="grid g2"><div class="card"><h3 class="mb">📈 روند حضور</h3>' + lineChart(days.map(function (d) { var t = 0, p = 0; Object.keys(att[d]).forEach(function (s) { t++; if (att[d][s] === 'present' || att[d][s] === 'late') p++; }); return t ? p / t * 100 : 0; }), days.map(function (d) { return fa(jOf(d).jd); }), {}) + '</div>' +
    '<div class="card"><h3 class="mb">🏆 برترین‌ها</h3>' + (top.length ? top.map(function (x, i) { return '<div class="row" style="padding:7px 0">' + ['🥇', '', '🥉', '🏅', ''][i] + avHTML(x.s, 'sm') + '<b class="small" style="flex:1">' + esc(x.s.name) + '</b><span class="chip">' + faNum(x.a) + '</span></div>'; }).join('') : empty('🌱', 'داده‌ای نیست', '')) + '</div></div>';
};
V.report = function () {
  var st = S(), me = stuById(st, SESS.sid); if (!me) return empty('🎓', 'کارنامه‌ای نیست', '');
  var subs = (st.subjects || []).map(function (s) { return { s: s, v: C && C.subjectAvgFor ? C.subjectAvgFor(st, me.id, s) : null }; });
  return '<div class="card mb"><div class="spread">' + avHTML(me) + '<div style="flex:1"><h2>' + esc(me.name) + '</h2><p class="small muted">کد ' + fa(me.code || '—') + ' • ' + esc((st.meta || {}).grade || '') + '</p></div><button type="button" class="btn soft sm" data-act="repStuPrint" data-id="' + me.id + '">🖨️ کارنامه A4</button></div></div>' +
    '<div class="grid g2"><div class="card"><h3 class="mb">🕸️ نیم‌رخ درس‌ها</h3>' + radarChart(subs.map(function (x) { return x.s; }), subs.map(function (x) { return x.v || 0; }), 4) + '</div>' +
    '<div class="card"><h3 class="mb">📊 میانگین هر درس</h3>' + subs.map(function (x) { return '<div class="row" style="padding:6px 0"><b class="small" style="flex:1">' + esc(x.s) + '</b><span class="chip">' + (x.v == null ? '—' : faNum(x.v)) + '</span></div>'; }).join('') + '</div></div>';
};
V.students = function () {
  var st = S();
  return '<div class="card mb"><div class="spread"><h3>👥 دانش‌آموزان (' + fa((st.students || []).length) + ')</h3><button type="button" class="btn sm" data-act="stuNew">➕ افزودن</button></div></div>' +
    '<div class="grid g3 stagger">' + (st.students || []).map(function (s, i) {
      return '<div class="card" style="--i:' + i + '"><div class="row">' + avHTML(s) + '<div style="flex:1"><b class="small">' + esc(s.name) + '</b><div class="small muted">کد ' + fa(s.code || '—') + '</div></div></div><div class="row mt"><button type="button" class="btn sm soft" data-act="stuEdit" data-id="' + s.id + '">✏️</button><button type="button" class="btn sm ghost" data-act="repStuPrint" data-id="' + s.id + '">🖨️</button><button type="button" class="btn sm danger" data-act="stuDel" data-id="' + s.id + '">🗑</button></div></div>';
    }).join('') + '</div>';
};
V.grades = function () {
  var st = S(), as = st.assessments || [];
  if (!UI.gradeAid && as.length) UI.gradeAid = as[as.length - 1].id;
  var a = as.find(function (x) { return x.id === UI.gradeAid; });
  var lv = [['excellent', 'خیلی خوب', '#16a34a'], ['good', 'خوب', '#65a30d'], ['acceptable', 'قابل قبول', '#f59e0b'], ['needs', 'نیازمند تلاش', '#e11d48']];
  return '<div class="card mb"><div class="spread"><h3>📝 ارزشیابی</h3><div class="row"><select class="select" data-chg="gradeAid" style="max-width:220px">' + as.map(function (x) { return '<option value="' + x.id + '"' + (x.id === UI.gradeAid ? ' selected' : '') + '>' + esc(x.title) + ' • ' + jShort(x.date) + '</option>'; }).join('') + '</select><button type="button" class="btn sm" data-act="asmtNew">➕ ارزشیابی</button></div></div></div>' +
    (a ? '<div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th>' + (a.subjects || []).map(function (s) { return '<th>' + esc(s) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (st.students || []).map(function (s) { return '<tr><td><b class="small">' + esc(s.name) + '</b></td>' + (a.subjects || []).map(function (sub) {
        var gv = ((st.grades || {})[a.id] || {})[sub] || {}; var v = gv[s.id];
        var L = lv.find(function (x) { return x[0] === v; });
        return '<td><button type="button" class="chip" style="color:' + (L ? L[2] : 'var(--muted)') + '" data-act="gradeSet" data-aid="' + a.id + '" data-sub="' + esc(sub) + '" data-sid="' + s.id + '">' + (L ? L[1] : '—') + '</button></td>';
      }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' : empty('📝', 'ارزشیابی‌ای نیست', 'اولین ارزشیابی را بساز.'));
};
CHG.gradeAid = function (el) { UI.gradeAid = el.value; renderView(); };
V.attendance = function () {
  var st = S();
  if (!UI.attMonth) { var j = jOf(todayISO()); UI.attMonth = j.jy + '-' + String(j.jm).padStart(2, '0'); }
  var p = UI.attMonth.split('-').map(Number), len = Jalali.monthLen(p[0], p[1]);
  var days = []; for (var d = 1; d <= len; d++) { var iso = p[0] + '-' + String(p[1]).padStart(2, '0') + '-' + String(d).padStart(2, '0'); if (wdIdx(iso) <= 4) days.push(iso); }
  var sym = { present: ['ح', '#16a34a'], absent: ['غ', '#e11d48'], late: ['د', '#f59e0b'], excused: ['م', '#0ea5e9'] };
  return '<div class="card mb"><div class="spread"><h3>🗓️ حضور و غیاب ' + JMONTHS[p[1] - 1] + ' ' + fa(p[0]) + '</h3><div class="row">' + Object.keys(sym).map(function (k) { return '<span class="chip" style="color:' + sym[k][1] + '">' + sym[k][0] + '</span>'; }).join('') + '</div></div><p class="small muted">روی هر خانه بزن تا وضعیت عوض شود.</p></div>' +
    '<div class="tw"><table class="tbl"><thead><tr><th>دانش‌آموز</th>' + days.map(function (d) { return '<th>' + fa(jOf(d).jd) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    (st.students || []).map(function (s) { return '<tr><td><b class="small">' + esc(s.name) + '</b></td>' + days.map(function (d) { var v = ((st.attendance || {})[d] || {})[s.id]; var sy = sym[v]; return '<td><button type="button" class="chip" style="color:' + (sy ? sy[1] : 'var(--muted)') + '" data-act="attCycle" data-d="' + d + '" data-sid="' + s.id + '">' + (sy ? sy[0] : '·') + '</button></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
};
V.analysis = function () {
  var st = S();
  if (!UI.stuQ && (st.students || []).length) UI.stuQ = st.students[0].id;
  var s = stuById(st, UI.stuQ);
  var subs = (st.subjects || []).map(function (x) { return { s: x, v: s && C.subjectAvgFor ? C.subjectAvgFor(st, s.id, x) : null }; });
  var risk = subs.filter(function (x) { return x.v != null && x.v < 2; });
  return '<div class="card mb"><div class="spread"><h3>🧠 تحلیل هوشمند</h3><select class="select" data-chg="anaStu" style="max-width:220px">' + (st.students || []).map(function (x) { return '<option value="' + x.id + '"' + (x.id === UI.stuQ ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div></div>' +
    (s ? '<div class="grid g2"><div class="card"><h3 class="mb">🕸️ نیم‌رخ ' + esc(s.name) + '</h3>' + radarChart(subs.map(function (x) { return x.s; }), subs.map(function (x) { return x.v || 0; }), 4) + '</div>' +
      '<div class="card"><h3 class="mb">🚩 شاخص ریسک</h3>' + (risk.length ? risk.map(function (x) { return '<div class="row" style="padding:6px 0"><span class="chip" style="color:#e11d48">' + esc(x.s) + '</span><b class="small">' + faNum(x.v) + '</b><span class="small muted">نیازمند حمایت</span></div>'; }).join('') : empty('🌿', 'ریسکی دیده نمی‌شود', 'همهٔ درس‌ها در وضعیت پایدارند.')) +
      '<div class="divider"></div><h3 class="mb">📊 میانگین‌ها</h3>' + subs.map(function (x) { return '<div class="row" style="padding:5px 0"><b class="small" style="flex:1">' + esc(x.s) + '</b><span class="chip">' + (x.v == null ? '—' : faNum(x.v)) + '</span></div>'; }).join('') + '</div></div>' : empty('👥', 'دانش‌آموزی نیست', ''));
};
CHG.anaStu = function (el) { UI.stuQ = el.value; renderView(); };
V.groups = function () {
  var st = S();
  return '<div class="grid g2 stagger">' + (st.groups || []).map(function (g, i) {
    return '<div class="card" style="--i:' + i + ';border-top:4px solid ' + (g.color || '#0d9488') + '"><div class="spread"><b>' + esc(g.name) + '</b><span class="chip">' + fa((g.members || []).length) + ' نفر</span></div>' +
      '<div class="small muted mt">🏅 سرگروه: ' + esc((stuById(st, g.leader) || {}).name || '—') + '</div>' +
      (g.members || []).map(function (m) { var s = stuById(st, m); return s ? '<div class="row" style="padding:5px 0">' + avHTML(s, 'sm') + '<span class="small" style="flex:1">' + esc(s.name) + '</span>' + (m === g.leader ? '<span class="chip">🏅</span>' : '') + '</div>' : ''; }).join('') +
      '<div class="row mt"><button type="button" class="btn sm soft" data-act="leaderAuto">🤖 سرگروه هوشمند</button></div></div>';
  }).join('') + '</div>';
};
V.leaderPanel = V.groups;
V.roles = function () {
  var st = S(), r = st.roles || {};
  var names = { mayor: '🏙️ شهردار', rep: '📢 نماینده', judge: '⚖️ قاضی' };
  return '<div class="grid g3 mb">' + Object.keys(names).map(function (k) { var s = stuById(st, r[k]); return '<div class="card"><b>' + names[k] + '</b><div class="row mt">' + (s ? avHTML(s, 'sm') + '<span class="small" style="flex:1">' + esc(s.name) + '</span>' : '<span class="small muted">تعیین نشده</span>') + '<button type="button" class="btn sm soft" data-act="roleSet" data-k="' + k + '">تغییر</button></div></div>'; }).join('') + '</div>' +
    '<div class="card"><h3 class="mb">⚖️ پرونده‌های دادگاه</h3>' + ((st.reports || []).length ? (st.reports || []).slice().reverse().map(function (c) { return '<div class="row" style="padding:8px 0;border-bottom:1px dashed var(--line)"><b class="small" style="flex:1">' + esc(c.title) + '</b><span class="chip">' + esc(c.status || 'open') + '</span>' + (c.status === 'verdict' ? '<button type="button" class="btn sm warn" data-act="caseReturn" data-id="' + c.id + '">↩️ برگشت</button><button type="button" class="btn sm ok" data-act="caseFinal" data-id="' + c.id + '">✅ تأیید</button>' : '') + (c.status === 'open' ? '<button type="button" class="btn sm danger" data-act="caseReject" data-id="' + c.id + '">✖️ رد</button>' : '') + '</div>'; }).join('') : empty('🕊️', 'پرونده‌ای نیست', '')) + '</div>';
};
V.myCourt = function () {
  var st = S(), mine = (st.reports || []).filter(function (c) { return c.by === SESS.sid; });
  return '<div class="card"><h3 class="mb">⚖️ پرونده‌های من</h3>' + (mine.length ? mine.map(function (c) { return '<div class="row" style="padding:8px 0"><b class="small" style="flex:1">' + esc(c.title) + '</b><span class="chip">' + esc(c.status || 'open') + '</span></div>'; }).join('') : empty('🕊️', 'پرونده‌ای نداری', '')) + '</div>';
};
V.polls = function () {
  var st = S();
  return (isT() ? '<div class="card mb"><div class="spread"><h3>🗳️ نظرسنجی‌ها</h3><button type="button" class="btn sm" data-act="pollNew">➕ جدید</button></div></div>' : '') +
    '<div class="grid g2">' + ((st.polls || []).length ? (st.polls || []).slice().reverse().map(function (p) {
      var votes = p.votes || {}; var my = votes[SESS.sid];
      var counts = (p.options || []).map(function (_, i) { return Object.keys(votes).filter(function (s) { return votes[s] === i; }).length; });
      var tot = counts.reduce(function (a, b) { return a + b; }, 0) || 1;
      return '<div class="card"><b class="small">' + esc(p.title) + '</b>' + (p.options || []).map(function (o, i) {
        return '<button type="button" class="row" style="width:100%;padding:7px 0;background:none;border:none;cursor:pointer" data-act="pollVote" data-id="' + p.id + '" data-i="' + i + '"><span class="small" style="flex:1;text-align:right">' + esc(o) + (my === i ? ' ✅' : '') + '</span><span class="chip">' + fa(counts[i]) + '</span><span style="width:70px;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><i style="display:block;height:100%;width:' + Math.round(counts[i] / tot * 100) + '%;background:var(--acc)"></i></span></button>';
      }).join('') + '</div>';
    }).join('') : empty('🗳️', 'نظرسنجی‌ای نیست', '')) + '</div>';
};
V.quizzes = function () {
  var st = S();
  if (isT()) return '<div class="card mb"><div class="spread"><h3>🧠 آزمون‌ها</h3><button type="button" class="btn sm" data-act="quizNew">➕ آزمون</button></div></div>' +
    '<div class="grid g2">' + ((st.quizzes || []).length ? (st.quizzes || []).map(function (q) { return '<div class="card"><b class="small">' + esc(q.title) + '</b><div class="small muted mt">' + fa((q.questions || []).length) + ' سؤال • شروع ' + jShort(iranISO(new Date(q.startAt))) + '</div><div class="small muted">📥 ' + fa(Object.keys(q.submissions || {}).length) + ' شرکت‌کننده</div></div>'; }).join('') : empty('🧠', ' آزمونی نیست', '')) + '</div>';
  var q = (st.quizzes || []).find(function (x) { return !((x.submissions || {})[SESS.sid]); }) || (st.quizzes || [])[0];
  if (!q) return empty('🧠', 'آزمونی نیست', '');
  var done = (q.submissions || {})[SESS.sid];
  return '<div class="card mb"><h3>🧠 ' + esc(q.title) + '</h3>' + (done ? '<p class="small" style="color:#059669">✅ پاسخ‌هایت ثبت شده است.</p>' : '') + '</div>' +
    (q.questions || []).map(function (qq, i) {
      return '<div class="card mb" data-qid="' + qq.id + '"><b class="small">' + fa(i + 1) + '. ' + esc(qq.text) + '</b>' + (qq.options || []).map(function (o, k) {
        return '<label class="row" style="padding:6px 0;cursor:pointer"><input type="radio" name="q_' + qq.id + '" value="' + k + '"' + (done ? ' disabled' : '') + '><span class="small">' + esc(o) + '</span></label>';
      }).join('') + '</div>';
    }).join('') + (done ? '' : '<button type="button" class="btn lg" style="width:100%" data-act="quizSubmit" data-id="' + q.id + '">📨 ثبت نهایی پاسخ‌ها</button>');
};
V.news = function () {
  var st = S();
  return (isT() ? '<div class="card mb"><div class="spread"><h3>📰 اخبار کلاس</h3><button type="button" class="btn sm" data-act="newsNew">➕ خبر</button></div></div>' : '') +
    '<div class="grid g2">' + ((st.news || []).length ? (st.news || []).slice().reverse().map(function (n) { return '<div class="card"><b class="small">' + esc(n.title) + '</b><p class="small muted mt" style="line-height:2">' + esc(n.body) + '</p><div class="small muted">' + jShort(n.date) + '</div></div>'; }).join('') : empty('📰', 'خبری نیست', '')) + '</div>';
};
V.notifs = function () {
  var st = S(), list = [];
  (st.discipline || []).slice(-12).reverse().forEach(function (d) { if (d.sid === SESS.sid || isT()) list.push([d.points > 0 ? '🪙' : '⚠️', d.reason, d.date]); });
  ((st.tickets || {}).items || []).slice(-6).reverse().forEach(function (t) { list.push(['🎫', t.subject, iranISO(new Date(t.createdAt))]); });
  return '<div class="card"><h3 class="mb">🔔 اعلان‌ها</h3>' + (list.length ? list.map(function (x) { return '<div class="row" style="padding:8px 0;border-bottom:1px dashed var(--line)"><span>' + x[0] + '</span><span class="small" style="flex:1">' + esc(x[1]) + '</span><span class="small muted">' + jShort(x[2]) + '</span></div>'; }).join('') : empty('🔔', 'اعلانی نیست', '')) + '</div>';
};
ACT.xNotifs = function () { setSection('notifs'); };
V.data = function () {
  var st = S();
  return '<div class="grid g2"><div class="card"><h3 class="mb">🩺 ممیزی داده</h3>' +
    [['دانش‌آموز', (st.students || []).length], ['ارزشیابی', (st.assessments || []).length], ['روز حضور', Object.keys(st.attendance || {}).length], ['تکلیف', ((st.homework || {}).assignments || []).length], ['تراکنش سکه', (st.discipline || []).length]].map(function (x) { return '<div class="row" style="padding:6px 0"><span class="small" style="flex:1">' + x[0] + '</span><b>' + fa(x[1]) + '</b></div>'; }).join('') + '</div>' +
    '<div class="card"><h3 class="mb">💾 پشتیبان و خروجی</h3><div class="row" style="flex-wrap:wrap;gap:8px">' +
    '<button type="button" class="btn sm" data-act="exportJSON">💾 پشتیبان JSON</button>' +
    '<button type="button" class="btn sm soft" data-act="csvExport" data-kind="grades">📝 CSV نمرات</button>' +
    '<button type="button" class="btn sm soft" data-act="csvExport" data-kind="attendance">🗓️ CSV حضور</button>' +
    '<button type="button" class="btn sm soft" data-act="codesPrint">🔑 کدهای دانش‌آموزان</button>' +
    '<button type="button" class="btn sm warn" data-act="regenCodes">🔄 کدهای جدید</button>' +
    '<button type="button" class="btn sm danger" data-act="dataReset">🗑️ بازنشانی</button></div>' +
    '<p class="small muted mt">🔒 کد معلم هرگز در خروجی‌ها چاپ نمی‌شود.</p></div></div>';
};
V.settings = function () {
  var st = S(), m = st.meta || {};
  return '<div class="grid g2" style="align-items:start">' +
    '<div class="card"><h3 class="mb">🏫 مشخصات کلاس</h3><div class="field"><label class="lbl">نام مدرسه</label><input class="input" id="setSchool" value="' + esc(m.school || '') + '"></div><div class="field"><label class="lbl">نام معلم</label><input class="input" id="setTeacher" value="' + esc(m.teacher || '') + '"></div><div class="grid g2"><div class="field"><label class="lbl">پایه</label><input class="input" id="setGrade" value="' + esc(m.grade || '') + '"></div><div class="field"><label class="lbl">سال تحصیلی</label><input class="input" id="setYear" value="' + esc(m.year || '') + '"></div></div><button type="button" class="btn sm" data-act="metaSave">💾 ذخیره</button></div>' +
    '<div class="card"><h3 class="mb">📚 درس‌ها</h3><div class="field"><textarea class="input" id="setSubjects" rows="3">' + esc((st.subjects || []).join('، ')) + '</textarea></div><button type="button" class="btn sm" data-act="subjSave">💾 ذخیره</button></div>' +
    '<div class="card"><h3 class="mb">🎨 نمایش</h3><div class="srow"><span class="sl">🌙 پوستهٔ تیره</span><span class="switch"><input type="checkbox" ' + (document.documentElement.dataset.theme === 'dark' ? 'checked' : '') + ' data-chg="setTheme"><i></i></span></div><div class="srow"><span class="sl">🔊 صدا</span><span class="switch"><input type="checkbox" ' + (Sound.on ? 'checked' : '') + ' data-chg="setSound"><i></i></span></div></div>' +
    '<div class="card"><h3 class="mb">🔐 امنیت</h3><p class="small muted mb">کد معلم فقط روی سرور نگهداری می‌شود و در هیچ فایل یا خروجی‌ای نیست.</p><button type="button" class="btn sm warn" data-act="codeChange">🔑 تغییر کد معلم</button></div>' +
    '<div class="card"><h3 class="mb">🔄 همگام‌سازی</h3><div class="srow"><span class="sl">هر ' + fa(SYNC_MS / 1000) + ' ثانیه</span><button type="button" class="btn sm soft" data-act="syncNow">🔄 همین حالا</button></div></div>' +
    '<div class="card"><h3 class="mb">ℹ️ درباره</h3><p class="small muted" style="line-height:2">سامانهٔ مدیریت کلاس • نسخهٔ ۱۶<br>معلم و روانشناس: محمدباقر کالجی<br>طراحی و توسعه: کالج مدیا</p></div>' +
    '<div class="card"><h3 class="mb">🖨️ چاپ سریع</h3><div class="row" style="flex-wrap:wrap;gap:8px"><button type="button" class="btn sm" data-act="repClassPrint">📋 گزارش کلاس</button><button type="button" class="btn sm" data-act="repAttPrint">🗓️ حضور ماهانه</button></div></div></div>';
};

/* ---------------- base actions ---------------- */
function replaceState(draft, msg) { return send('data.replace', { state: draft, data: draft, store: draft }, null, { msg: msg || 'ذخیره شد' }); }
ACT.metaSave = function () { var d = clone(S()); d.meta = Object.assign({}, d.meta, { school: document.getElementById('setSchool').value, teacher: document.getElementById('setTeacher').value, grade: document.getElementById('setGrade').value, year: document.getElementById('setYear').value }); replaceState(d, 'مشخصات ذخیره شد'); };
ACT.subjSave = function () { var d = clone(S()); d.subjects = document.getElementById('setSubjects').value.split(/[،,]/).map(function (x) { return x.trim(); }).filter(Boolean); replaceState(d, 'درس‌ها ذخیره شد'); };
CHG.setTheme = function (el) { document.documentElement.dataset.theme = el.checked ? 'dark' : 'light'; localStorage.setItem('sh_theme', document.documentElement.dataset.theme); };
CHG.setSound = function (el) { Sound.on = el.checked; localStorage.setItem('sh_sound', el.checked ? '1' : '0'); };
ACT.syncNow = function () { loadState(false).then(function () { toast('🔄 همگام شد', 'ok'); }); };
ACT.codeChange = function () {
  promptDlg({ title: '🔑 کد جدید معلم (۶ رقم)', placeholder: 'مثلاً ۴۸۲۹۱۵', onOk: function (v) {
    var code = en(v).replace(/\D/g, ''); if (code.length < 6) return toast('کد باید ۶ رقم باشد', 'err');
    var d = clone(S()); d.meta = Object.assign({}, d.meta, { teacherCode: code }); if (d.auth) d.auth.teacherCode = code;
    replaceState(d, '🔐 کد معلم عوض شد — از این پس فقط کد جدید کار می‌کند');
  } });
};
ACT.stuNew = function () { openDrawer('➕ دانش‌آموز', '<form data-form="stuNew"><div class="field"><label class="lbl">نام</label><input class="input" name="name" required></div><button class="btn" style="width:100%">💾 افزودن</button></form>'); };
FORM.stuNew = function (f) { var d = clone(S()); var code = String(Math.floor(100000 + Math.random() * 900000)); d.students.push({ id: uid(), name: f.name.value.trim(), code: code, avatar: '👦', color: '#0d9488' }); replaceState(d, 'دانش‌آموز افزوده شد • کد ' + fa(code)); closeDrawer(); };
ACT.stuEdit = function (el) { var s = stuById(S(), el.dataset.id); openDrawer('✏️ ' + s.name, '<form data-form="stuEdit"><input type="hidden" name="id" value="' + s.id + '"><div class="field"><label class="lbl">نام</label><input class="input" name="name" value="' + esc(s.name) + '"></div><button class="btn" style="width:100%">💾 ذخیره</button></form>'); };
FORM.stuEdit = function (f) { var d = clone(S()); var s = d.students.find(function (x) { return x.id === f.id.value; }); if (s) s.name = f.name.value.trim(); replaceState(d, 'ذخیره شد'); closeDrawer(); };
ACT.stuDel = function (el) { var id = el.dataset.id; confirmDlg({ title: 'حذف دانش‌آموز', body: 'همهٔ نمرات و حضورش هم حذف می‌شود.', danger: true, okText: 'حذف', onOk: function () { var d = clone(S()); d.students = d.students.filter(function (x) { return x.id !== id; }); replaceState(d, 'حذف شد'); } }); };
ACT.asmtNew = function () { UI.jdate.asmt = todayISO(); openDrawer('➕ ارزشیابی', '<form data-form="asmtNew"><div class="field"><label class="lbl">عنوان</label><input class="input" name="title" required></div><div class="field"><label class="lbl">تاریخ</label>' + jDateSelects('asmt') + '</div><div class="field"><label class="lbl">درس‌ها (با کاما)</label><input class="input" name="subs" value="' + esc((S().subjects || []).join('، ')) + '"></div><button class="btn" style="width:100%">💾 ساخت</button></form>'); };
FORM.asmtNew = function (f) { var d = clone(S()); d.assessments = d.assessments || []; var id = uid(); d.assessments.push({ id: id, title: f.title.value.trim(), date: UI.jdate.asmt, subjects: f.subs.value.split(/[،,]/).map(function (x) { return x.trim(); }).filter(Boolean) }); UI.gradeAid = id; replaceState(d, 'ارزشیابی ساخته شد'); closeDrawer(); };
ACT.gradeSet = function (el) {
  var aid = el.dataset.aid, sub = el.dataset.sub, sid = el.dataset.sid;
  openDrawer('📝 نمره', '<div class="grid" style="gap:8px">' + [['excellent', 'خیلی خوب'], ['good', 'خوب'], ['acceptable', 'قابل قبول'], ['needs', 'نیازمند تلاش']].map(function (x) { return '<button type="button" class="btn soft" data-act="gradePick" data-aid="' + aid + '" data-sub="' + esc(sub) + '" data-sid="' + sid + '" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>');
};
ACT.gradePick = function (el) { var d = clone(S()); d.grades = d.grades || {}; d.grades[el.dataset.aid] = d.grades[el.dataset.aid] || {}; d.grades[el.dataset.aid][el.dataset.sub] = d.grades[el.dataset.aid][el.dataset.sub] || {}; d.grades[el.dataset.aid][el.dataset.sub][el.dataset.sid] = el.dataset.v; replaceState(d, 'نمره ثبت شد'); closeDrawer(); };
ACT.attCycle = function (el) { var order = ['', 'present', 'late', 'absent', 'excused']; var d = clone(S()); d.attendance = d.attendance || {}; d.attendance[el.dataset.d] = d.attendance[el.dataset.d] || {}; var cur = d.attendance[el.dataset.d][el.dataset.sid] || ''; var nx = order[(order.indexOf(cur) + 1) % order.length]; if (nx) d.attendance[el.dataset.d][el.dataset.sid] = nx; else delete d.attendance[el.dataset.d][el.dataset.sid]; replaceState(d, null); };
ACT.leaderAuto = function () { var d = clone(S()); (d.groups || []).forEach(function (g) { var best = null, bv = -1; (g.members || []).forEach(function (m) { var a = avgOf(d, m); if (a != null && a > bv) { bv = a; best = m; } }); if (best) g.leader = best; }); replaceState(d, '🤖 سرگروه‌ها انتخاب شدند'); };
ACT.rotate = function () { var d = clone(S()); (d.groups || []).forEach(function (g) { var ms = g.members || []; if (ms.length) { var i = ms.indexOf(g.leader); g.leader = ms[(i + 1) % ms.length]; } }); replaceState(d, '🔄 مسئولیت‌ها چرخید'); };
ACT.grpBalance = function () { var d = clone(S()); var gs = d.groups || []; if (!gs.length) return; var ranked = (d.students || []).map(function (s) { return { id: s.id, a: avgOf(d, s.id) || 0 }; }).sort(function (a, b) { return b.a - a.a; }); gs.forEach(function (g) { g.members = []; }); ranked.forEach(function (x, i) { gs[i % gs.length].members.push(x.id); }); replaceState(d, '⚖️ گروه‌ها متوازن شدند'); };
ACT.regenCodes = function () { confirmDlg({ title: '🔄 کدهای جدید', body: 'برای همهٔ دانش‌آموزان کد ۶ رقمی تازه ساخته می‌شود.', okText: 'بساز', onOk: function () { var d = clone(S()); var used = {}; d.students.forEach(function (s) { var c; do { c = String(Math.floor(100000 + Math.random() * 900000)); } while (used[c]); used[c] = 1; s.code = c; }); replaceState(d, '🔑 کدها عوض شد'); } }); };
ACT.roleSet = function (el) { var k = el.dataset.k; openDrawer('تغییر مسئول', '<div class="grid" style="gap:8px">' + (S().students || []).map(function (s) { return '<button type="button" class="btn soft" data-act="rolePick" data-k="' + k + '" data-id="' + s.id + '">' + esc(s.name) + '</button>'; }).join('') + '</div>'); };
ACT.rolePick = function (el) { var d = clone(S()); d.roles = d.roles || {}; d.roles[el.dataset.k] = el.dataset.id; replaceState(d, 'مسئول تعیین شد'); closeDrawer(); };
ACT.caseReturn = function (el) { send('case.return', { id: el.dataset.id }, null, { msg: '↩️ به قاضی برگشت' }); };
ACT.caseReject = function (el) { send('case.reject', { id: el.dataset.id }, null, { msg: '✖️ رد شد' }); };
ACT.caseFinal = function (el) { send('case.final', { id: el.dataset.id }, null, { msg: '✅ تأیید نهایی' }); };
ACT.pollNew = function () { openDrawer('➕ نظرسنجی', '<form data-form="pollNew"><div class="field"><label class="lbl">سؤال</label><input class="input" name="title" required></div><div class="field"><label class="lbl">گزینه‌ها (هر خط یک گزینه)</label><textarea class="input" name="opts" rows="4" required></textarea></div><button class="btn" style="width:100%">💾 انتشار</button></form>'); };
FORM.pollNew = function (f) { send('choice', { title: f.title.value.trim(), options: f.opts.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) }, null, { msg: '🗳️ منتشر شد' }); closeDrawer(); };
ACT.pollVote = function (el) { send('poll.vote', { pollId: el.dataset.id, choice: num(el.dataset.i) }, null, { msg: '🗳️ رأی ثبت شد' }); };
ACT.quizNew = function () { UI.jdate.qz = todayISO(); openDrawer('➕ آزمون', '<form data-form="quizNew"><div class="field"><label class="lbl">عنوان</label><input class="input" name="title" required></div><div class="field"><label class="lbl">تاریخ شروع</label>' + jDateSelects('qz') + '</div><div class="field"><label class="lbl">سؤال‌ها (هر خط: متن | گزینه۱ | گزینه۲ | گزینه۳ | گزینه۴ | شمارهٔ پاسخ)</label><textarea class="input" name="qs" rows="6" required></textarea></div><button class="btn" style="width:100%">💾 ساخت</button></form>', true); };
FORM.quizNew = function (f) {
  var d = clone(S()); d.quizzes = d.quizzes || [];
  var qs = f.qs.value.split('\n').map(function (l) { var p = l.split('|').map(function (x) { return x.trim(); }); if (p.length < 3) return null; return { id: uid(), text: p[0], options: p.slice(1, -1), answer: num(p[p.length - 1]) - 1 }; }).filter(Boolean);
  d.quizzes.push({ id: uid(), title: f.title.value.trim(), startAt: isoToDate(UI.jdate.qz).toISOString(), questions: qs, submissions: {} });
  replaceState(d, '🧠 آزمون ساخته شد'); closeDrawer();
};
ACT.quizSubmit = function (el) {
  var id = el.dataset.id, ans = {};
  document.querySelectorAll('#view input[type=radio]:checked').forEach(function (r) { ans[r.name.replace('q_', '')] = num(r.value); });
  send('quiz.submit', { quizId: id, answers: ans }, null, { msg: '📨 پاسخ‌ها ثبت شد', sound: 'win' });
};
ACT.newsNew = function () { openDrawer('➕ خبر', '<form data-form="newsNew"><div class="field"><label class="lbl">عنوان</label><input class="input" name="title" required></div><div class="field"><label class="lbl">متن</label><textarea class="input" name="body" rows="4" required></textarea></div><button class="btn" style="width:100%">💾 انتشار</button></form>'); };
FORM.newsNew = function (f) { var d = clone(S()); d.news = d.news || []; d.news.push({ id: uid(), title: f.title.value.trim(), body: f.body.value.trim(), date: todayISO() }); replaceState(d, '📰 منتشر شد'); closeDrawer(); };
ACT.exportJSON = function () { download('پشتیبان-' + jShort(todayISO()).replace(/\//g, '-') + '.json', JSON.stringify(S(), null, 1)); toast('💾 دانلود شد', 'ok'); };
ACT.csvExport = function (el) {
  var st = S(), k = el.dataset.kind, rows;
  if (k === 'grades') { rows = [['دانش‌آموز'].concat(st.subjects || [])]; (st.students || []).forEach(function (s) { rows.push([s.name].concat((st.subjects || []).map(function (x) { var v = C.subjectAvgFor ? C.subjectAvgFor(st, s.id, x) : null; return v == null ? '' : faNum(v); }))); }); }
  else if (k === 'attendance') { rows = [['تاریخ', 'دانش‌آموز', 'وضعیت']]; Object.keys(st.attendance || {}).sort().forEach(function (d) { Object.keys(st.attendance[d]).forEach(function (s) { rows.push([d, (stuById(st, s) || {}).name || '', st.attendance[d][s]]); }); }); }
  else { rows = [['دانش‌آموز', 'میانگین']]; (st.students || []).forEach(function (s) { rows.push([s.name, faNum(avgOf(st, s.id) || 0)]); }); }
  download(k + '-' + jShort(todayISO()).replace(/\//g, '-') + '.csv', serializeCSV(st, rows)); toast('📤 دانلود شد', 'ok');
};
ACT.codesPrint = function () { var st = S(); previewSheet('🔑 کدهای دانش‌آموزان', '<div class="sheet">' + sheetHead('کدهای ورود دانش‌آموزان', 'محرمانه') + '<table><thead><tr><th>#</th><th>نام</th><th>کد</th></tr></thead><tbody>' + (st.students || []).map(function (s, i) { return '<tr><td>' + fa(i + 1) + '</td><td>' + esc(s.name) + '</td><td>' + fa(s.code) + '</td></tr>'; }).join('') + '</tbody></table>' + sheetFoot() + '</div>'); };
ACT.repClassPrint = function () { var st = S(); previewSheet('📋 گزارش کلاس', '<div class="sheet">' + sheetHead('گزارش کلی کلاس', fa((st.students || []).length) + ' دانش‌آموز') + '<table><thead><tr><th>#</th><th>نام</th><th>میانگین</th></tr></thead><tbody>' + (st.students || []).map(function (s, i) { return '<tr><td>' + fa(i + 1) + '</td><td>' + esc(s.name) + '</td><td>' + faNum(avgOf(st, s.id) || 0) + '</td></tr>'; }).join('') + '</tbody></table>' + sheetFoot() + '</div>'); };
ACT.repAttPrint = function () { var st = S(); var days = Object.keys(st.attendance || {}).sort().slice(-20); previewSheet('🗓️ حضور', '<div class="sheet">' + sheetHead('حضور و غیاب', '۲۰ روز اخیر') + '<table><thead><tr><th>نام</th>' + days.map(function (d) { return '<th>' + fa(jOf(d).jd) + '</th>'; }).join('') + '</tr></thead><tbody>' + (st.students || []).map(function (s) { return '<tr><td>' + esc(s.name) + '</td>' + days.map(function (d) { var v = (st.attendance[d] || {})[s.id]; return '<td>' + ({ present: 'ح', absent: 'غ', late: 'د', excused: 'م' }[v] || '·') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' + sheetFoot() + '</div>'); };
ACT.repStuPrint = function (el) { var st = S(), s = stuById(st, el.dataset.id); if (!s) return; previewSheet('🎓 کارنامه', '<div class="sheet">' + sheetHead('کارنامهٔ ' + s.name, '') + '<table><thead><tr><th>درس</th><th>میانگین</th></tr></thead><tbody>' + (st.subjects || []).map(function (x) { var v = C.subjectAvgFor ? C.subjectAvgFor(st, s.id, x) : null; return '<tr><td>' + esc(x) + '</td><td>' + (v == null ? '—' : faNum(v)) + '</td></tr>'; }).join('') + '</tbody></table>' + sheetFoot() + '</div>'); };
ACT.dataReset = function () { confirmDlg({ title: '🗑️ بازنشانی', body: 'همهٔ داده‌ها به حالت اولیه برمی‌گردد. مطمئنی؟', danger: true, okText: 'بازنشانی', onOk: function () { send('data.reset', {}, null, { msg: 'بازنشانی شد' }); } }); };

/* ---------------- topbar / login / boot ---------------- */
ACT.menu = function () { document.body.classList.toggle('side-open'); };
ACT.theme = function () { var d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('sh_theme', d); document.getElementById('themeBtn').textContent = d === 'dark' ? '☀️' : '🌙'; };
ACT.sound = function () { Sound.on = !Sound.on; localStorage.setItem('sh_sound', Sound.on ? '1' : '0'); document.getElementById('soundBtn').textContent = Sound.on ? '🔊' : '🔇'; };
ACT.search = function () { if (!isT()) return; openDrawer('🔍 جستجو', '<input class="input" id="searchIn" placeholder="نام دانش‌آموز…"><div id="searchRes" class="mt"></div>'); setTimeout(function () { var i = document.getElementById('searchIn'); i.focus(); i.oninput = function () { var q = norm(i.value); document.getElementById('searchRes').innerHTML = (S().students || []).filter(function (s) { return norm(s.name).includes(q); }).map(function (s) { return '<div class="row" style="padding:7px 0">' + avHTML(s, 'sm') + '<b class="small" style="flex:1">' + esc(s.name) + '</b><button type="button" class="btn sm soft" data-act="repStuPrint" data-id="' + s.id + '">🖨️</button></div>'; }).join(''); }; }, 60); };
ACT.logout = function () { api('/api/logout', 'POST', {}).catch(function () {}); sessionStorage.removeItem('sh12_sess'); SESS = null; STATE = null; clearInterval(syncIv); document.getElementById('app').classList.add('hidden'); document.getElementById('login').classList.remove('hidden'); };
ACT.loginTab = function (el) { document.querySelectorAll('.ltabs button').forEach(function (b) { b.classList.toggle('on', b === el); }); document.getElementById('codeLbl').textContent = el.dataset.role === 'teacher' ? 'کد مدیریت ۶ رقمی را وارد کنید' : 'کد اختصاصی ۶ رقمی خود را وارد کنید'; };
ACT.togglePass = function () { var i = document.getElementById('codeInput'); i.type = i.type === 'password' ? 'text' : 'password'; };
FORM.login = function (f) {
  var role = (document.querySelector('.ltabs button.on') || {}).dataset ? document.querySelector('.ltabs button.on').dataset.role : 'student';
  var code = en(document.getElementById('codeInput').value).replace(/\D/g, '');
  var err = document.getElementById('loginErr');
  if (code.length < 4) { err.textContent = 'کد را کامل وارد کن'; return; }
  if (!navigator.onLine) { err.textContent = '🔒 ورود فقط با اتصال سرور ممکن است'; return; }
  var btn = document.getElementById('loginBtn'); btn.disabled = true; btn.textContent = '⏳ در حال بررسی…';
  api('/api/login', 'POST', { role: role, code: code }).then(function (r) {
    var s = r.session || r.sess || {};
    SESS = { token: r.token || s.token, role: s.role || role, sid: s.sid || '', name: s.name || '', exp: s.exp || 0 };
    sessionStorage.setItem('sh12_sess', JSON.stringify(SESS));
    var v = r.view || r.state || r.data; if (v) STATE = v;
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    UI.section = isT() ? 'dash' : 'report';
    render(); loadState(true);
    clearInterval(syncIv); syncIv = setInterval(function () { if (!document.hidden) loadState(true); }, SYNC_MS);
    toast('👋 خوش آمدی ' + (SESS.name || ''), 'ok');
  }).catch(function (e) {
    err.textContent = e.status === 401 ? 'کد اشتباه است' : (e.message || 'خطای سرور');
  }).then(function () { btn.disabled = false; btn.textContent = '🔓 ورود به سامانه'; });
};
function boot() {
  document.documentElement.dataset.theme = localStorage.getItem('sh_theme') || 'light';
  document.getElementById('themeBtn').textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
  document.getElementById('soundBtn').textContent = Sound.on ? '🔊' : '🔇';
  api('/api/login').then(function (r) {
    var p = r.public || {};
    if (p.school) { document.getElementById('brandSchool').textContent = p.school; document.getElementById('topSchool').textContent = p.school; }
    if (p.students) document.getElementById('brandStats').innerHTML = '<span class="chip">👥 ' + fa(p.students) + ' دانش‌آموز</span>';
  }).catch(function () {});
  document.getElementById('boot').classList.add('hidden');
  var saved = null; try { saved = JSON.parse(sessionStorage.getItem('sh12_sess') || 'null'); } catch (e) {}
  if (saved && saved.token && (!saved.exp || saved.exp > Date.now())) {
    SESS = saved;
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    UI.section = isT() ? 'dash' : 'report';
    loadState(false);
    clearInterval(syncIv); syncIv = setInterval(function () { if (!document.hidden) loadState(true); }, SYNC_MS);
  } else {
    document.getElementById('login').classList.remove('hidden');
  }
  clearInterval(clockIv); clockIv = setInterval(function () { var d = new Date(); var el = document.getElementById('clock'); if (el) el.textContent = fa(String(d.getHours()).padStart(2, '0')) + ':' + fa(String(d.getMinutes()).padStart(2, '0')); }, 1000);
}
window.addEventListener('online', function () { setSync(true); if (SESS) loadState(true); });
window.addEventListener('offline', function () { setSync(false); });
document.addEventListener('visibilitychange', function () { if (!document.hidden && SESS) loadState(true); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeDrawer(); closeModal(); document.body.classList.remove('side-open'); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ACT.search(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && isT() && LAST_SNAP) { e.preventDefault(); var d = LAST_SNAP; LAST_SNAP = null; replaceState(d, '↩️ واگرد شد'); }
});
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('[data-act]') : null;
  if (b && ACT[b.dataset.act]) { e.preventDefault(); ACT[b.dataset.act](b, e); }
}, false);
document.addEventListener('change', function (e) { var el = e.target.closest ? e.target.closest('[data-chg]') : null; if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el, e); });
document.addEventListener('input', function (e) { var el = e.target.closest ? e.target.closest('[data-inp]') : null; if (el && INP[el.dataset.inp]) INP[el.dataset.inp](el, e); });
document.addEventListener('submit', function (e) { var f = e.target.closest ? e.target.closest('[data-form]') : null; if (f && FORM[f.dataset.form]) { e.preventDefault(); FORM[f.dataset.form](f, e); } });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
