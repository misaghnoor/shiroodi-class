/* market-trades.js — دفتر معاملات بورس: چه کسی، چه سهمی، چند، به چه قیمتی */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ecPrice || typeof navItems !== 'function') return;

const TR = { side: 'all', q: '', limit: 25 };
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, iranISO = C.iranISO;

const CSS = `.mtr-btn{border:1.5px solid var(--line);background:var(--overlay);border-radius:12px;padding:7px 13px;font-size:.78rem;font-weight:800;color:var(--muted);transition:all .16s}
.mtr-btn:hover{transform:translateY(-1px);border-color:var(--acc)}
.mtr-btn.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc) 60%,#000))}
#mcTrades .tbl td,#mcTrades .tbl th{white-space:nowrap}
@media (max-width:700px){#mcTrades .tw{overflow-x:auto}}`;
if (!document.getElementById('mtrStyles')) { const s = document.createElement('style'); s.id = 'mtrStyles'; s.textContent = CSS; document.head.appendChild(s); }

function rows() {
  const st = S();
  let list = ((st.econ && st.econ.trades) || []).slice().reverse();
  if (TR.side !== 'all') list = list.filter(t => t.side === TR.side);
  const q = norm(TR.q);
  if (q) list = list.filter(t => norm((stuById(st, t.sid) || {}).name || '').includes(q) || norm(t.symbol || '').includes(q));
  return list;
}
function tradesHTML() {
  const st = S(), list = rows();
  const all = (st.econ && st.econ.trades) || [];
  const buys = all.filter(t => t.side === 'buy'), sells = all.filter(t => t.side === 'sell');
  const buyV = buys.reduce((a, t) => a + (t.value || 0), 0), sellV = sells.reduce((a, t) => a + (t.value || 0), 0);
  const shown = list.slice(0, TR.limit);
  const body = shown.map(t => {
    const a = (st.econ.assets || []).find(x => x.id === t.assetId);
    const cur = a ? C.ecPrice(a) : t.price;
    const diff = t.price ? (cur - t.price) / t.price * 100 : 0;
    const s = stuById(st, t.sid);
    return `<tr>
      <td>${isT() ? `<div class="row" style="gap:7px;flex-wrap:nowrap">${avHTML(s, 'sm')}<b class="small">${esc(s ? s.name : '—')}</b></div>` : '<b class="small">من</b>'}</td>
      <td>${t.side === 'buy' ? '<span class="chip" style="color:#16a34a">📈 خرید</span>' : '<span class="chip" style="color:#e11d48">📉 فروش</span>'}</td>
      <td><b class="small">${a ? a.icon : ''} ${esc(t.symbol || '')}</b></td>
      <td>${fa(t.qty)}</td>
      <td><b>${faNum(t.price)}</b></td>
      <td>${fa(t.value || 0)} 🪙</td>
      <td>${faNum(cur)}</td>
      <td style="color:${diff >= 0 ? '#16a34a' : '#e11d48'};font-weight:800">${diff >= 0 ? '▲' : '▼'} ${faNum(Math.abs(diff), 1)}٪</td>
      <td class="small muted">${jShort(iranISO(new Date(t.at)))}</td></tr>`;
  }).join('');
  return `<div class="mk-box" id="mcTrades">
    <div class="spread mb"><b>📒 دفتر معاملات ${isT() ? 'کلاس' : 'من'}</b>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <span class="chip" style="color:#16a34a">📈 ${fa(buys.length)} خرید • ${fa(buyV)} 🪙</span>
        <span class="chip" style="color:#e11d48">📉 ${fa(sells.length)} فروش • ${fa(sellV)} 🪙</span>
        ${isT() ? '<button type="button" class="btn sm ghost" data-act="mkCsv" data-kind="trades">📤 CSV</button>' : ''}
      </div></div>
    <div class="row mb" style="gap:6px;flex-wrap:wrap">
      <button type="button" class="mtr-btn ${TR.side === 'all' ? 'on' : ''}" data-act="mcTrSide" data-v="all">همه (${fa(all.length)})</button>
      <button type="button" class="mtr-btn ${TR.side === 'buy' ? 'on' : ''}" data-act="mcTrSide" data-v="buy">📈 خریدها</button>
      <button type="button" class="mtr-btn ${TR.side === 'sell' ? 'on' : ''}" data-act="mcTrSide" data-v="sell">📉 فروش‌ها</button>
      <input class="input" style="max-width:200px" placeholder="🔍 نام یا نماد…" value="${esc(TR.q)}" data-inp="mcTrQ">
    </div>
    ${shown.length ? `<div class="tw"><table class="tbl"><thead><tr>
      <th>${isT() ? 'دانش‌آموز' : 'من'}</th><th>نوع</th><th>سهم</th><th>تعداد</th><th>قیمت معامله</th><th>ارزش</th><th>قیمت الآن</th><th>تغییر از معامله</th><th>تاریخ</th>
    </tr></thead><tbody>${body}</tbody></table></div>
    ${list.length > TR.limit ? `<button type="button" class="btn sm soft mt" data-act="mcTrMore">نمایش ${fa(Math.min(25, list.length - TR.limit))} مورد دیگر</button>` : ''}`
      : empty('📒', 'معامله‌ای با این فیلتر نیست', 'هنوز خرید و فروشی ثبت نشده.')}
    <p class="small muted mt">💡 «تغییر از معامله» یعنی قیمت سهم از لحظهٔ معامله تا الآن چقدر جابه‌جا شده — درس اصلی بورس: زمان‌بندی مهم است.</p></div>`;
}
function injectTrades() {
  try {
    if (!S() || !S().econ || UI.section !== 'econ') return;
    if (window.MKT_TAB) return;
    const onBtn = document.querySelector('#view .tabs [data-act="mkTab"].on');
    if (!onBtn || onBtn.dataset.tab !== 'market') return;
    if (document.getElementById('mcTrades')) return;
    const anchor = document.getElementById('mcAnalysis') || document.querySelector('#mkBody .grid.mk-grid2');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', tradesHTML());
  } catch (e) { console.error('mcTrades inject', e); }
}
function redrawTrades() {
  const el = document.getElementById('mcTrades');
  if (el) el.outerHTML = tradesHTML();
}
const baseRV = renderView;
renderView = function () { baseRV(); setTimeout(injectTrades, 120); };

ACT.mcTrSide = el => { TR.side = el.dataset.v; redrawTrades(); Sound.play('tap'); };
ACT.mcTrMore = () => { TR.limit += 25; redrawTrades(); };
INP.mcTrQ = el => { TR.q = el.value; redrawTrades(); const i = document.querySelector('[data-inp="mcTrQ"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } };
})();
