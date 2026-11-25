/* market-charts.js — نمودار پیشرفته، تحلیل تکنیکال، چیدمان تمام‌عرض + خرید/فروش بدون باگ */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ecPrice || typeof navItems !== 'function') return;

const CH = { mode: 'candle' };
const clamp = C.clamp, mean = C.mean, fa = C.fa, faNum = C.faNum, jShort = C.jShort;
const std = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
const closes = s => (s || []).map(x => x.c);

const CSS = `
#mcTools{gap:6px;flex-wrap:wrap}
.mc-btn{border:1.5px solid var(--line);background:var(--overlay);border-radius:12px;padding:7px 13px;font-size:.78rem;font-weight:800;color:var(--muted);transition:all .16s}
.mc-btn:hover{transform:translateY(-1px);border-color:var(--acc)}
.mc-btn.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc) 60%,#000))}
#mkBody .grid.mc-single{grid-template-columns:1fr !important}
#mkBody .grid.mc-single .mk-box{width:100%}
#mcAnalysis{margin-top:14px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.mc-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--shadow);min-width:0}
.mc-h{font-size:.78rem;font-weight:800;color:var(--muted);margin-bottom:8px}
.mc-sig{font-size:1rem;font-weight:800;line-height:1.6;display:block}
.mc-stat{display:flex;justify-content:space-between;font-size:.8rem;padding:4px 0;border-bottom:1px dashed var(--line)}
.mc-stat:last-child{border:none}
.mc-stat b{font-family:var(--display);font-weight:400}
@media (max-width:700px){#mcAnalysis{grid-template-columns:1fr}}
`;
const stl = document.createElement('style'); stl.id = 'mcStyles';
if (!document.getElementById('mcStyles')) document.head.appendChild(stl);
stl.textContent = CSS;

/* ---------- محاسبات تکنیکال ---------- */
function sma(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < n - 1) { out.push(null); continue; }
    let t = 0; for (let j = i - n + 1; j <= i; j++) t += arr[j];
    out.push(t / n);
  }
  return out;
}
function rsi(arr, n) {
  n = n || 14;
  if (arr.length < n + 1) return arr.map(() => null);
  const out = [null]; let g = 0, l = 0;
  for (let i = 1; i < arr.length; i++) {
    const d = arr[i] - arr[i - 1], up = Math.max(d, 0), dn = Math.max(-d, 0);
    if (i <= n) { g += up; l += dn; if (i === n) { g /= n; l /= n; out.push(l === 0 ? 100 : 100 - 100 / (1 + g / l)); } else out.push(null); }
    else { g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; out.push(l === 0 ? 100 : 100 - 100 / (1 + g / l)); }
  }
  return out;
}
function analyze(a) {
  const s = (a.series || []).slice(-60), cl = closes(s);
  if (!cl.length) return { last: 0, sma5: null, sma10: null, rsi: null, sup: 0, res: 0, slope: 0, chg7: 0, vol30: 0, max30: 0, min30: 0, avg30: 0, totalVol: 0 };
  const s5 = sma(cl, 5), s10 = sma(cl, 10), rr = rsi(cl, 14);
  const last = cl[cl.length - 1], win = s.slice(-20);
  const sup = win.length ? Math.min.apply(null, win.map(x => x.l)) : last;
  const res = win.length ? Math.max.apply(null, win.map(x => x.h)) : last;
  let slope = 0; const n = Math.min(10, cl.length);
  if (n >= 3) {
    const ys = cl.slice(-n), xs = ys.map((_, i) => i), mx = mean(xs), my = mean(ys);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
    slope = den ? (num / den) / my : 0;
  }
  const chg7 = cl.length > 7 ? (last - cl[cl.length - 8]) / cl[cl.length - 8] * 100 : 0;
  const c30 = cl.slice(-30);
  return { last, sma5: s5[s5.length - 1], sma10: s10[s10.length - 1], rsi: rr[rr.length - 1], sup, res, slope, chg7,
    vol30: c30.length > 1 ? std(c30) / mean(c30) * 100 : 0,
    max30: Math.max.apply(null, c30), min30: Math.min.apply(null, c30), avg30: mean(c30),
    totalVol: (a.series || []).reduce((t, x) => t + (x.v || 0), 0) };
}
function signalOf(an) {
  if (an.rsi == null) return { l: 'داده کافی نیست — صبر کن', c: '#7b7261', i: '⏳', k: 'watch' };
  if (an.rsi <= 30) return { l: 'اشباع فروش — منطقهٔ فرصت', c: '#16a34a', i: '🟢', k: 'buy' };
  if (an.rsi >= 70) return { l: 'اشباع خرید — احتیاط کن', c: '#e11d48', i: '🔴', k: 'sell' };
  if (an.sma5 != null && an.sma10 != null && an.sma5 > an.sma10 && an.slope > 0) return { l: 'روند صعودی — حرکت مثبت', c: '#16a34a', i: '📈', k: 'buy' };
  if (an.sma5 != null && an.sma10 != null && an.sma5 < an.sma10 && an.slope < 0) return { l: 'روند نزولی — مراقب باش', c: '#e11d48', i: '📉', k: 'sell' };
  return { l: 'خنثی — مشاهده و صبر', c: '#f59e0b', i: '⏸️', k: 'hold' };
}
function tipOf(an, sig) {
  if (sig.k === 'buy') return 'وقتی RSI زیر ۳۰ است یعنی فروش هیجانی زیاد شده؛ سرمایه‌گذار صبور اینجا به‌جای ترس، <b>دلیل</b> را بررسی می‌کند. اشباع فروش تضمین صعود نیست، فقط ریسک/پاداش را بهتر می‌کند.';
  if (sig.k === 'sell') return 'RSI بالای ۷۰ یعنی خرید هیجانی. در بازار واقعی خیلی‌ها اینجا <b>سودشان را سیو می‌کنند</b>. درس: طمع، دشمن سود است.';
  if (sig.k === 'hold') return 'بازار همیشه جهت ندارد. بیشتر روزهای یک سرمایه‌گذار حرفه‌ای، روزِ <b>نداشتن معامله</b> است. صبر هم مهارت است.';
  return 'هرچه کندل بیشتری ساخته شود تحلیل دقیق‌تر است؛ فعلاً روی مفاهیم تمرکز کن.';
}

/* ---------- سناریوی ریسک (متن ساده و گرد) ---------- */
function riskLine(a, qty) {
  const p = C.ecPrice(a), vol = C.ecVol(a).vol, value = qty * p;
  const good = Math.round(value * (1 + vol * 1.5));
  const mid = Math.round(value * (1 + vol * 0.2));
  const bad = Math.round(value * (1 - vol * 2));
  return '🧮 سناریوها: 📈 ' + fa(good) + ' / ➖ ' + fa(mid) + ' / 📉 ' + fa(bad) + ' سکه • نوسان روزانه ' + faNum(vol * 100, 1) + '٪';
}
function readQty() {
  const el = document.getElementById('mkQty');
  const max = (S().econ.settings || {}).maxTradeQty || 15;
  return el ? clamp(Number(en(el.textContent)) || 1, 1, max) : 1;
}

/* ---------- نمودارها ---------- */
function pathFrom(arr, X, Y, col, name) {
  let d = '', st = false;
  arr.forEach((v, i) => { if (v == null) return; d += (st ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); st = true; });
  return d ? '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-dasharray="5 4"><title>' + name + '</title></path>' : '';
}
function lineChartAdv(series, showSMA) {
  const s = (series || []).slice(-40);
  if (s.length < 2) return '<p class="small muted">دادهٔ کافی نیست.</p>';
  const cl = closes(s), s5 = sma(cl, 5), s10 = sma(cl, 10);
  let mn = Math.min.apply(null, cl), mx = Math.max.apply(null, cl);
  if (showSMA) s5.concat(s10).forEach(v => { if (v != null) { mn = Math.min(mn, v); mx = Math.max(mx, v); } });
  const pad = (mx - mn) * 0.12 || 5; mn -= pad; mx += pad;
  const w = 900, h = 300, p = 44, pb = 42;
  const X = i => p + (w - 2 * p) * (i / (s.length - 1));
  const Y = v => h - pb - (h - p - pb) * ((v - mn) / (mx - mn));
  let grid = '';
  [0, .25, .5, .75, 1].forEach(k => { const v = mn + (mx - mn) * k; grid += '<line x1="' + p + '" x2="' + (w - p) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--line)" stroke-dasharray="4 5"/><text x="' + (p - 6) + '" y="' + (Y(v) + 4) + '" font-size="10" fill="var(--muted)" text-anchor="end">' + faNum(v, 0) + '</text>'; });
  const pts = cl.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  const area = 'M' + X(0).toFixed(1) + ',' + Y(cl[0]).toFixed(1) + ' ' + cl.map((v, i) => 'L' + X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ') + ' L' + X(cl.length - 1).toFixed(1) + ',' + (h - pb) + ' L' + X(0).toFixed(1) + ',' + (h - pb) + ' Z';
  const dots = cl.map((v, i) => '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="2.6" fill="var(--acc)"><title>' + jShort(s[i].d) + ': ' + faNum(v) + '</title></circle>').join('');
  const smaPaths = showSMA ? pathFrom(s5, X, Y, '#f59e0b', 'SMA5') + pathFrom(s10, X, Y, '#7c3aed', 'SMA10') : '';
  const labs = [0, Math.floor(s.length / 2), s.length - 1].map(i => '<text x="' + X(i) + '" y="' + (h - 6) + '" font-size="10" fill="var(--muted)" text-anchor="middle">' + jShort(s[i].d) + '</text>').join('');
  return '<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;min-width:320px;height:auto"><defs><linearGradient id="mcLn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0ea5e9" stop-opacity=".35"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0"/></linearGradient></defs>' + grid + '<path d="' + area + '" fill="url(#mcLn)"/><polyline points="' + pts + '" fill="none" stroke="var(--acc)" stroke-width="2.4" stroke-linejoin="round"/>' + smaPaths + dots + labs + '<text x="' + (w - p) + '" y="' + (Y(cl[cl.length - 1]) - 8) + '" font-size="11" font-weight="800" fill="var(--acc)" text-anchor="end">' + faNum(cl[cl.length - 1]) + '</text></svg></div>';
}
function candleAdv(series) {
  const s = (series || []).slice(-40);
  if (!s.length) return '<p class="small muted">کندلی نیست.</p>';
  const cl = closes(s), s10 = sma(cl, 10);
  const w = 900, h = 330, p = 44, pb = 66;
  let mn = Infinity, mx = -Infinity;
  s.forEach(x => { mn = Math.min(mn, x.l); mx = Math.max(mx, x.h); });
  const pad = (mx - mn) * 0.12 || 5; mn -= pad; mx += pad;
  const X = i => p + (w - 2 * p) * (s.length === 1 ? 0.5 : i / (s.length - 1));
  const Y = v => h - pb - (h - p - pb) * ((v - mn) / (mx - mn));
  let grid = '';
  [0, .25, .5, .75, 1].forEach(k => { const v = mn + (mx - mn) * k; grid += '<line x1="' + p + '" x2="' + (w - p) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--line)" stroke-dasharray="4 5"/><text x="' + (p - 6) + '" y="' + (Y(v) + 4) + '" font-size="10" fill="var(--muted)" text-anchor="end">' + faNum(v, 0) + '</text>'; });
  const bw = Math.max(4, Math.min(18, (w - 2 * p) / s.length * 0.62));
  const maxV = Math.max.apply(null, [1].concat(s.map(x => x.v || 1)));
  const vols = s.map((x, i) => { const vh = (x.v || 0) / maxV * (pb - 26); return '<rect x="' + (X(i) - bw / 2) + '" y="' + (h - 20 - vh) + '" width="' + bw + '" height="' + Math.max(1.5, vh) + '" fill="' + (x.c >= x.o ? '#16a34a44' : '#e11d4844') + '"/>'; }).join('');
  const candles = s.map((x, i) => { const up = x.c >= x.o, col = up ? '#16a34a' : '#e11d48', cx = X(i); return '<g><line x1="' + cx + '" x2="' + cx + '" y1="' + Y(x.h) + '" y2="' + Y(x.l) + '" stroke="' + col + '" stroke-width="1.6"/><rect x="' + (cx - bw / 2) + '" y="' + Y(Math.max(x.o, x.c)) + '" width="' + bw + '" height="' + Math.max(2, Math.abs(Y(x.o) - Y(x.c))) + '" fill="' + col + '" rx="1.5"><title>' + jShort(x.d) + ' O' + faNum(x.o) + ' H' + faNum(x.h) + ' L' + faNum(x.l) + ' C' + faNum(x.c) + ' V' + fa(x.v) + '</title></rect></g>'; }).join('');
  const smaPath = pathFrom(s10, X, Y, '#7c3aed', 'SMA10');
  const last = s[s.length - 1];
  const labs = [0, Math.floor(s.length / 2), s.length - 1].map(i => '<text x="' + X(i) + '" y="' + (h - 4) + '" font-size="10" fill="var(--muted)" text-anchor="middle">' + jShort(s[i].d) + '</text>').join('');
  return '<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;min-width:320px;height:auto">' + grid + vols + candles + smaPath + '<line x1="' + p + '" x2="' + (w - p) + '" y1="' + Y(last.c) + '" y2="' + Y(last.c) + '" stroke="var(--acc)" stroke-dasharray="6 4"/><text x="' + (w - p) + '" y="' + (Y(last.c) - 5) + '" font-size="10.5" font-weight="800" fill="var(--acc)" text-anchor="end">' + faNum(last.c) + '</text>' + labs + '</svg></div>';
}
function rsiGauge(v) {
  const val = v == null ? 50 : clamp(v, 0, 100), t = val / 100, a = Math.PI * (1 - t);
  const x = 60 + 44 * Math.cos(a), y = 60 - 44 * Math.sin(a);
  const col = val < 30 ? '#16a34a' : val > 70 ? '#e11d48' : '#f59e0b';
  return '<svg viewBox="0 0 120 70" style="width:150px;height:86px"><path d="M16 60 A44 44 0 0 1 104 60" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/><path d="M16 60 A44 44 0 0 1 104 60" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (Math.PI * 44 * t).toFixed(1) + ' 999"/><line x1="60" y1="60" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--ink)"/><text x="10" y="69" font-size="8" fill="var(--muted)">0</text><text x="102" y="69" font-size="8" fill="var(--muted)">100</text></svg>';
}
function analysisHTML(a) {
  const an = analyze(a), sig = signalOf(an);
  const posPct = an.res > an.sup ? clamp((an.last - an.sup) / (an.res - an.sup) * 100, 0, 100) : 50;
  return '<div class="mc-card" style="border-color:' + sig.c + '"><div class="mc-h">' + sig.i + ' سیگنال ترکیبی</div><span class="mc-sig" style="color:' + sig.c + '">' + sig.l + '</span><p class="small muted mt">ترکیب RSI + میانگین متحرک + روند. ابزار آموزشی است، نه دستور خرید.</p></div>' +
    '<div class="mc-card"><div class="mc-h">📉 RSI چهارده‌روزه</div><div style="text-align:center">' + rsiGauge(an.rsi) + '</div><b style="display:block;text-align:center;font-family:var(--display);font-size:1.3rem">' + (an.rsi == null ? '—' : faNum(an.rsi, 0)) + '</b><p class="small muted" style="text-align:center">' + (an.rsi == null ? 'داده کم' : an.rsi < 30 ? 'اشباع فروش' : an.rsi > 70 ? 'اشباع خرید' : 'متعادل') + '</p></div>' +
    '<div class="mc-card"><div class="mc-h">🧱 حمایت و مقاومت</div><div class="row mt" style="gap:6px"><span class="chip" style="color:#16a34a">حمایت ' + faNum(an.sup) + '</span><span class="chip" style="color:#e11d48">مقاومت ' + faNum(an.res) + '</span></div><div class="mk-bar mt" style="--mc:#0ea5e9"><i style="width:' + posPct.toFixed(0) + '%"></i></div><p class="small muted mt">جایگاه قیمت در کانال ۲۰ روزه.</p></div>' +
    '<div class="mc-card"><div class="mc-h">🧭 روند ده‌روز</div><b style="display:block;font-size:1.35rem;font-family:var(--display);color:' + (an.slope > 0.001 ? '#16a34a' : an.slope < -0.001 ? '#e11d48' : '#f59e0b') + '">' + (an.slope > 0.001 ? '▲ صعودی' : an.slope < -0.001 ? '▼ نزولی' : '→ خنثی') + '</b><p class="small muted mt">شیب روزانه ' + faNum(an.slope * 100, 2) + '٪ • تغییر ۷ روز ' + faNum(an.chg7, 1) + '٪</p></div>' +
    '<div class="mc-card"><div class="mc-h">📊 آمار سی‌روز</div><div class="mc-stat"><span>بیشینه</span><b>' + faNum(an.max30) + '</b></div><div class="mc-stat"><span>کمینه</span><b>' + faNum(an.min30) + '</b></div><div class="mc-stat"><span>میانگین</span><b>' + faNum(an.avg30) + '</b></div><div class="mc-stat"><span>نوسان</span><b>' + faNum(an.vol30, 1) + '٪</b></div><div class="mc-stat"><span>حجم کل</span><b>' + fa(an.totalVol) + '</b></div></div>' +
    '<div class="mc-card"><div class="mc-h">🎓 نکتهٔ آموزشی</div><p class="small" style="line-height:2">' + tipOf(an, sig) + '</p></div>';
}

/* ---------- تزریق و چیدمان ---------- */
function currentAsset() {
  const chip = document.querySelector('#mkBody .mk-chip.on');
  const id = chip ? chip.dataset.id : null;
  const list = (S().econ.assets || []);
  return list.find(x => x.id === id) || list[0];
}
function redraw(host, a) {
  const wrap = host.querySelector('#mcChart'); if (!wrap) return;
  wrap.innerHTML = CH.mode === 'line' ? lineChartAdv(a.series, true)
    : CH.mode === 'both' ? lineChartAdv(a.series, true) + candleAdv(a.series)
    : candleAdv(a.series);
}
function inject() {
  try {
    if (!S() || !S().econ || UI.section !== 'econ') return;
    if (window.MKT_TAB) return;
    const onBtn = document.querySelector('#view .tabs [data-act="mkTab"].on');
    if (!onBtn || onBtn.dataset.tab !== 'market') return;
    const body = document.getElementById('mkBody'); if (!body) return;

    /* فروش همیشه فعال */
    body.querySelectorAll('[data-act="mkSell"]').forEach(b => { b.removeAttribute('disabled'); b.title = 'هر زمان خواستی بفروش'; });

    const grid = body.querySelector('.grid.mk-grid2'); if (!grid) return;
    const host = grid.querySelector('.mk-box'); if (!host || host.querySelector('#mcTools')) return;
    const a = currentAsset(); if (!a) return;
    const chartWrap = host.querySelector('div[dir="ltr"]'); if (!chartWrap) return;
    chartWrap.id = 'mcChart';
    const tools = document.createElement('div');
    tools.id = 'mcTools'; tools.className = 'row mb';
    tools.innerHTML = '<button type="button" class="mc-btn ' + (CH.mode === 'candle' ? 'on' : '') + '" data-act="mcMode" data-v="candle">🕯 کندل</button>' +
      '<button type="button" class="mc-btn ' + (CH.mode === 'line' ? 'on' : '') + '" data-act="mcMode" data-v="line">📈 خط شکسته</button>' +
      '<button type="button" class="mc-btn ' + (CH.mode === 'both' ? 'on' : '') + '" data-act="mcMode" data-v="both">📊 هر دو</button>' +
      '<span class="chip" style="color:#f59e0b">🟠 SMA5</span><span class="chip" style="color:#7c3aed">🟣 SMA10</span>';
    host.insertBefore(tools, chartWrap);
    redraw(host, a);

    if (isT()) {
      const second = grid.children[1];
      if (second && second.querySelector('[data-act="mkRoll"]') && !second.querySelector('input,select,textarea')) {
        const heroHas = !!document.querySelector('.gr-hero [data-act="mkRoll"]');
        if (!heroHas) { const b = second.querySelector('[data-act="mkRoll"]'); if (b) tools.appendChild(b); }
        second.remove();
        grid.classList.add('mc-single');
      }
    }
    let an = document.getElementById('mcAnalysis');
    if (!an) { an = document.createElement('div'); an.id = 'mcAnalysis'; an.className = 'mc-grid'; }
    an.innerHTML = analysisHTML(a);
    grid.insertAdjacentElement('afterend', an);
  } catch (e) { console.error('mc inject', e); }
}

const baseRV = renderView;
renderView = function () {
  if (UI.section === 'econ' && !window.__mcLastExt) window.MKT_TAB = null;
  baseRV();
  setTimeout(inject, 90);
};
if (ACT.mkTab) { const b = ACT.mkTab; ACT.mkTab = function (el) { window.__mcLastExt = null; window.MKT_TAB = null; b(el); }; }
if (ACT.mktTab) { const b2 = ACT.mktTab; ACT.mktTab = function (el) { window.__mcLastExt = el.dataset.tab; b2(el); }; }

ACT.mcMode = el => {
  CH.mode = el.dataset.v;
  document.querySelectorAll('#mcTools .mc-btn').forEach(b => b.classList.toggle('on', b === el));
  const host = document.querySelector('#mkBody .grid .mk-box');
  const a = currentAsset();
  if (host && a) redraw(host, a);
  Sound.play('tap');
};

/* ---------- خرید: پیام تمیز، بدون HTML خام و بدون اعشار ---------- */
ACT.mkBuy = el => {
  const id = el.dataset.id, a = (S().econ.assets || []).find(x => x.id === id);
  if (!a) return;
  const qty = readQty();
  const p = C.ecPrice(a);
  const cost = Math.round(qty * p * (1 + ((S().econ.settings.tradeFee || 0) / 100)));
  const body = fa(qty) + ' سهم «' + a.name + '» به قیمت تقریبی ' + fa(cost) + ' سکه. ' + riskLine(a, qty) + ' اگر قیمت پایین بیاید ضرر می‌کنی؛ می‌توانی بیمه‌اش هم بکنی.';
  confirmDlg({ title: '📈 خرید سهم ' + a.icon + ' ' + a.name, body: body, okText: 'خرید کن', onOk: () => {
    send('econ.trade', { assetId: id, side: 'buy', qty: qty }, null, { sound: null }).then(r => {
      if (r) {
        Sound.play('pop');
        toast('📈 ' + fa(qty) + ' سهم ' + a.symbol + ' خریدی • ' + fa(r.cost || cost) + ' سکه', 'ok');
        renderView();
        const req = S().mktExt && S().mktExt.settings && S().mktExt.settings.journalRequired;
        if (req) setTimeout(() => promptDlg({ title: '📝 چرا این سهم را خریدی؟', placeholder: 'دلیل تحلیلت را بنویس…', onOk: reason => {
          const t = (S().econ.trades || []).slice(-1)[0];
          if (t) send('mkt.journal', { tradeId: t.id, reason: reason, mood: 'confident' }, null, { msg: '📝 دفترچه ثبت شد' });
        } }), 700);
      }
    });
  } });
};

/* ---------- فروش: همیشه در دسترس ---------- */
ACT.mkSell = el => {
  const id = el.dataset.id, a = (S().econ.assets || []).find(x => x.id === id);
  if (!a) return;
  const pf = C.ecPortfolio(S(), SESS.sid);
  const my = pf.items.find(x => x.id === id);
  if (!my || !my.qty) return toast('از این سهم نداری؛ اول یکی بخر 📈', 'err');
  const qty = Math.min(readQty(), my.qty);
  const p = C.ecPrice(a);
  const val = Math.round(qty * p * (1 - ((S().econ.settings.tradeFee || 0) / 100)));
  const avg = my.qty ? my.cost / my.qty : p;
  const pnl = Math.round((p - avg) * qty);
  confirmDlg({
    title: '📉 فروش سهم ' + a.icon + ' ' + a.name,
    body: fa(qty) + ' سهم از ' + fa(my.qty) + ' سهم تو، به تقریب ' + fa(val) + ' سکه. سود/زیان تقریبی این مقدار: ' + (pnl >= 0 ? '+' : '') + fa(pnl) + ' سکه. سهم زیر پوشش بیمه قابل فروش نیست.',
    okText: 'بفروش',
    onOk: () => {
      send('econ.trade', { assetId: id, side: 'sell', qty: qty }, null, { sound: null }).then(r => {
        if (r) { Sound.play(pnl >= 0 ? 'win' : 'pop'); toast('💰 فروش انجام شد • ' + fa(r.proceeds || val) + ' سکه برگشت', 'ok'); renderView(); }
      });
    }
  });
};
})();
