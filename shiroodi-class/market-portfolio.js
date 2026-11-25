/* market-portfolio.js — سبد سهام من: نمایش واضح دارایی + فروش/بیمه/نمودار مستقیم */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ecPortfolio || typeof navItems !== 'function') return;

const fa = C.fa, faNum = C.faNum;

const CSS = `
.mp-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.mp-row:last-child{border-bottom:none}
.mp-row .n{flex:1;min-width:140px;font-weight:700;font-size:.86rem}
.mp-own{background:color-mix(in srgb,#d97706 12%,var(--surface));border:1px solid color-mix(in srgb,#d97706 30%,var(--line));color:#b45309;border-radius:99px;padding:2px 8px;font-size:.68rem;font-weight:800;margin-inline-start:4px}
[data-theme=dark] .mp-own{color:#fcd34d}
@media (max-width:700px){.mp-row .n{min-width:100%;order:-1}}
`;
if (!document.getElementById('mpStyles')) { const s = document.createElement('style'); s.id = 'mpStyles'; s.textContent = CSS; document.head.appendChild(s); }

const pfOf = () => (S().econ && S().econ.portfolio) || C.ecPortfolio(S(), SESS.sid);
const assetOf = id => (S().econ.assets || []).find(x => x.id === id);

function rowHTML(x) {
  const insQ = C.ecActivePolicies(S(), SESS.sid).filter(p => p.assetId === x.id && p.status === 'active').reduce((s, p) => s + p.qty, 0);
  return `<div class="mp-row">
    <span class="gr-ico" style="--kc:${x.color};width:40px;height:40px;font-size:1.15rem">${x.icon}</span>
    <div class="n">${esc(x.name)}<div class="small muted">میانگین خرید ${faNum(x.qty ? x.cost / x.qty : 0)} • قیمت الآن ${faNum(x.price)}</div></div>
    <span class="chip">🎒 ${fa(x.qty)} سهم</span>
    ${insQ ? `<span class="chip" style="color:#0ea5e9">🛡️ ${fa(insQ)} بیمه</span>` : ''}
    <span class="chip">ارزش ${fa(x.value)} 🪙</span>
    <span class="chip" style="color:${x.pnl >= 0 ? '#16a34a' : '#e11d48'}">${x.pnl >= 0 ? '▲ +' : '▼ '}${fa(x.pnl)}</span>
    <div class="row" style="gap:4px;flex-wrap:nowrap">
      <button type="button" class="btn sm danger" data-act="mpSell" data-id="${x.id}">📉 فروش</button>
      <button type="button" class="btn sm soft" data-act="mpIns" data-id="${x.id}">🛡️ بیمه</button>
      <button type="button" class="ib sm" data-act="mpChart" data-id="${x.id}" title="نمودار این سهم">📈</button>
    </div></div>`;
}
function portfolioHTML() {
  const pf = pfOf();
  const head = `<div class="spread mb"><b>💼 سبد سهام من</b>
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip" style="color:#d97706">🪙 نقد ${fa(pf.cash)}</span><span class="chip">📈 ارزش سهام ${fa(pf.value)}</span><span class="chip" style="color:${pf.pnl >= 0 ? '#16a34a' : '#e11d48'}">سود/زیان ${pf.pnl >= 0 ? '+' : ''}${fa(pf.pnl)}</span><span class="chip acc">💼 کل ${fa(pf.total)}</span></div></div>`;
  if (!pf.items.length) return `<div class="mk-box" id="mpPort">${head}<p class="small muted">هنوز سهمی نداری. از ردیف بالای صفحه یک سهم انتخاب کن و «📈 خرید» بزن؛ هر سهمی که بخری همین‌جا لیست می‌شود.</p></div>`;
  return `<div class="mk-box" id="mpPort">${head}${pf.items.map(rowHTML).join('')}<p class="small muted mt">🎒 تعداد سهم تو • 🛡️ تعداد زیر پوشش بیمه (تا پایان بیمه قابل فروش نیست).</p></div>`;
}
function ownedCardHTML() {
  const pf = pfOf();
  if (!pf.items.length) return `<div class="mk-box mb" id="mpOwned"><b class="small">📦 سهم‌های من</b><p class="small muted mt">سهمی نداری که بیمه کنی؛ اول از تب «بورس» سهم بخر.</p></div>`;
  return `<div class="mk-box mb" id="mpOwned"><b class="small mb" style="display:block">📦 سهم‌های من (برای بیمه)</b>${pf.items.map(x => {
    const free = C.ecFreeQty(S(), SESS.sid, x.id);
    return `<div class="mp-row"><span class="gr-ico" style="--kc:${x.color};width:36px;height:36px;font-size:1rem">${x.icon}</span>
      <div class="n">${esc(x.name)}<div class="small muted">${fa(x.qty)} سهم • ${fa(x.qty - free)} زیر بیمه • ${fa(free)} آزاد</div></div>
      ${free > 0 ? `<button type="button" class="btn sm" data-act="mpIns" data-id="${x.id}">🛡️ بیمه کن</button>` : '<span class="chip">همه زیر پوشش</span>'}</div>`;
  }).join('')}</div>`;
}
function badgeChips() {
  const pf = pfOf();
  document.querySelectorAll('#mkBody .mk-chip[data-id]').forEach(ch => {
    if (ch.dataset.mpB) return;
    ch.dataset.mpB = '1';
    const it = pf.items.find(x => x.id === ch.dataset.id);
    if (it && it.qty) ch.insertAdjacentHTML('beforeend', `<span class="mp-own">🎒${fa(it.qty)}</span>`);
  });
}
function inject() {
  try {
    if (!S() || !S().econ || !SESS || isT() || UI.section !== 'econ') return;
    if (window.MKT_TAB) return;
    const on = document.querySelector('#view .tabs [data-act="mkTab"].on');
    const tab = on ? on.dataset.tab : 'market';
    badgeChips();
    if (tab === 'market') {
      if (document.getElementById('mpPort')) return;
      const grid = document.querySelector('#mkBody .grid.mk-grid2'); if (!grid) return;
      grid.insertAdjacentHTML('afterend', portfolioHTML());
    } else if (tab === 'ins') {
      if (document.getElementById('mpOwned')) return;
      const body = document.getElementById('mkBody'); if (!body) return;
      body.insertAdjacentHTML('afterbegin', ownedCardHTML());
    }
  } catch (e) { console.error('mp inject', e); }
}
const baseRV = renderView;
renderView = function () { baseRV(); setTimeout(inject, 150); };

/* ---------- فروش مستقیم از سبد ---------- */
ACT.mpSell = el => {
  const id = el.dataset.id, a = assetOf(id); if (!a) return;
  const pf = pfOf(), my = pf.items.find(x => x.id === id);
  if (!my || !my.qty) return toast('از این سهم نداری', 'err');
  promptDlg({ title: '📉 فروش ' + a.name, placeholder: 'تعداد (از ۱ تا ' + fa(my.qty) + ')', value: fa(my.qty), onOk: v => {
    const q = clamp(Math.round(num(v) || 0), 1, my.qty);
    const p = C.ecPrice(a);
    const val = Math.round(q * p * (1 - ((S().econ.settings.tradeFee || 0) / 100)));
    const avg = my.qty ? my.cost / my.qty : p;
    const pnl = Math.round((p - avg) * q);
    confirmDlg({ title: '📉 تأیید فروش', body: fa(q) + ' سهم «' + a.name + '» به تقریب ' + fa(val) + ' سکه. سود/زیان تقریبی: ' + (pnl >= 0 ? '+' : '') + fa(pnl) + ' سکه.', okText: 'بفروش', onOk: () => {
      send('econ.trade', { assetId: id, side: 'sell', qty: q }, null, { sound: null }).then(r => { if (r) { Sound.play(pnl >= 0 ? 'win' : 'pop'); toast('💰 فروش انجام شد • ' + fa(r.proceeds || val) + ' سکه برگشت', 'ok'); renderView(); } });
    } });
  } });
};
/* ---------- رفتن به بیمه با همان سهم ---------- */
ACT.mpIns = el => {
  const id = el.dataset.id;
  const free = C.ecFreeQty(S(), SESS.sid, id);
  if (!free) return toast('همهٔ این سهم زیر پوشش بیمه است یا سهمی نداری', 'err');
  ACT.mkTab({ dataset: { tab: 'ins' } });
  setTimeout(() => {
    const sel = document.querySelector('#mkBody select[data-chg="mkInsAsset"]');
    if (sel && [...sel.options].some(o => o.value === id)) { sel.value = id; if (CHG.mkInsAsset) CHG.mkInsAsset(sel); }
  }, 160);
};
ACT.mpChart = el => ACT.mkPick({ dataset: { id: el.dataset.id } });
})();
