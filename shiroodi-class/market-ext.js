/* market-ext.js — رابط کاربری ویژگی‌های پیشرفته بورس */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.mktIndex || typeof navItems !== 'function') return;

const CSS = `
.mkt-idx{background:linear-gradient(135deg,#0369a1,#0ea5e9 55%,#38bdf8);color:#fff;border-radius:20px;padding:18px;position:relative;overflow:hidden;box-shadow:0 18px 40px -18px rgba(3,105,161,.7)}
.mkt-idx::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.12) 0 2px,transparent 2px 14px)}
.mkt-idx>*{position:relative;z-index:2}
.mkt-idx b{font-family:var(--display);font-weight:400}
.mkt-pred{background:var(--surface);border:1.5px solid color-mix(in srgb,#7c3aed 30%,var(--line));border-radius:18px;padding:16px;box-shadow:var(--shadow)}
.mkt-jrnl{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:13px;box-shadow:var(--shadow);position:relative}
.mkt-jrnl::before{content:'';position:absolute;top:0;bottom:0;right:0;width:4px;background:var(--jc,#1d4ed8);border-radius:16px 0 0 16px}
.mkt-scenario{display:grid;gap:10px;grid-template-columns:repeat(3,1fr);margin-top:12px}
.mkt-sc{border-radius:14px;padding:12px;text-align:center;border:1.5px solid var(--line)}
.mkt-sc.good{background:color-mix(in srgb,#16a34a 8%,var(--surface));border-color:color-mix(in srgb,#16a34a 30%,var(--line))}
.mkt-sc.mid{background:color-mix(in srgb,#f59e0b 8%,var(--surface));border-color:color-mix(in srgb,#f59e0b 30%,var(--line))}
.mkt-sc.bad{background:color-mix(in srgb,#e11d48 8%,var(--surface));border-color:color-mix(in srgb,#e11d48 30%,var(--line))}
.mkt-sc b{font-family:var(--display);font-size:1.3rem;font-weight:400;display:block;margin:4px 0}
.mkt-trophy{background:linear-gradient(135deg,#d97706,#fbbf24);color:#fff;border-radius:20px;padding:18px;text-align:center;box-shadow:0 18px 40px -18px rgba(217,119,6,.7)}
.mkt-trophy b{font-family:var(--display);font-weight:400}
@media (max-width:700px){.mkt-scenario{grid-template-columns:1fr}}
`;
const stl = document.createElement('style'); stl.id = 'mktExtStyles';
if (!document.getElementById('mktExtStyles')) document.head.appendChild(stl);
stl.textContent = CSS;

/* ---------- شاخص کل ---------- */
function indexChart() {
  const st = S(), ix = (st.mktExt && st.mktExt.index) || C.mktIndex(st);
  if (!ix.length) return '<p class="small muted">هنوز داده‌ای برای شاخص نیست.</p>';
  const s = ix.slice(-30);
  const w = 660, h = 230, p = 40, pb = 40;
  let mn = Infinity, mx = -Infinity;
  s.forEach(x => { mn = Math.min(mn, x.v); mx = Math.max(mx, x.v); });
  const pad = (mx - mn) * 0.15 || 5; mn -= pad; mx += pad;
  const X = i => p + (w - 2 * p) * (s.length === 1 ? .5 : i / (s.length - 1));
  const Y = v => h - pb - (h - p - pb) * ((v - mn) / (mx - mn));
  let grid = '';
  [0, .25, .5, .75, 1].forEach(k => { const v = mn + (mx - mn) * k; grid += `<line x1="${p}" x2="${w - p}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="4 5"/><text x="${p - 6}" y="${Y(v) + 4}" font-size="10" fill="var(--muted)" text-anchor="end">${faNum(v, 0)}</text>`; });
  const path = s.map((x, i) => (i === 0 ? 'M' : 'L') + X(i) + ',' + Y(x.v)).join(' ');
  const area = path + ` L ${X(s.length - 1)},${h - pb} L ${X(0)},${h - pb} Z`;
  const last = s[s.length - 1];
  return `<div dir="ltr" style="overflow-x:auto"><svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:320px;height:auto">
    <defs><linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0ea5e9" stop-opacity=".4"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#idxGrad)"/><path d="${path}" fill="none" stroke="#0ea5e9" stroke-width="2.5"/>
    <circle cx="${X(s.length - 1)}" cy="${Y(last.v)}" r="5" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
    <text x="${w - p}" y="${Y(last.v) - 8}" font-size="11" font-weight="800" fill="#0ea5e9" text-anchor="end">${faNum(last.v)}</text></svg></div>`;
}

/* ---------- ماشین‌حساب ریسک ---------- */
function riskCard(assetId, qty) {
  const st = S(), a = (st.econ.assets || []).find(x => x.id === assetId);
  if (!a) return '';
  const p = C.ecPrice(a), vol = C.ecVol(a).vol;
  const value = qty * p;
  const scenarios = [
    { k: 'good', l: '📈 خوش‌بینانه', pct: '+' + faNum(vol * 100 * 1.5, 0) + '٪', val: Math.round(value * (1 + vol * 1.5)) },
    { k: 'mid', l: '➖ معمولی', pct: '±' + faNum(vol * 100 * 0.5, 0) + '٪', val: Math.round(value * (1 + vol * 0.2)) },
    { k: 'bad', l: '📉 بدبینانه', pct: '−' + faNum(vol * 100 * 2, 0) + '٪', val: Math.round(value * (1 - vol * 2)) }
  ];
  return `<div class="mkt-scenario">${scenarios.map(s => `<div class="mkt-sc ${s.k}"><small class="bold">${s.l}</small><b>${fa(s.val)}</b><span class="small muted">${s.pct} • ${fa(s.val - value) >= 0 ? '+' : ''}${fa(s.val - value)} 🪙</span></div>`).join('')}</div>
  <p class="small muted mt">💡 نوسان روزانهٔ این سهم: ${faNum(vol * 100, 1)}٪ • هر چه نوسان بیشتر، ریسک و فرصت بیشتر.</p>`;
}

/* ---------- تب‌های جدید در بورس ---------- */
function idxTab() {
  const st = S(), ix = C.mktIndex(st), ch = C.mktIndexChange(st);
  const last = ix.length ? ix[ix.length - 1].v : 0;
  return `<div class="mkt-idx mb"><div class="spread"><div><span style="font-size:.85rem;opacity:.9">📊 شاخص کل بورس کلاس</span>
    <br><b style="font-size:2.4rem">${faNum(last, 1)}</b></div>
    <div style="text-align:left"><b style="font-size:1.4rem" class="${ch >= 0 ? '' : ''}">${ch >= 0 ? '▲' : '▼'} ${faNum(Math.abs(ch), 2)}٪</b>
    <div style="font-size:.75rem;opacity:.85">نسبت به روز قبل</div></div></div></div>
  <div class="mk-box">${indexChart()}
  <p class="small muted mt">📊 این نمودار میانگین وزنی همهٔ سهام کلاس را نشان می‌دهد. وقتی کلاس در درس‌ها خوب کار می‌کند، شاخص بالا می‌رود — یعنی بورس کلاسِ شما واقعاً بازتاب تلاشِ شماست.</p></div>
  <div class="mk-box mt"><b class="small mb" style="display:block">🏆 سرمایه‌گذاران برتر ماه (بر اساس درصد سود)</b>
    ${(() => { const rank = C.mktMonthlyRank(st); return rank.slice(0, 8).map((r, i) => `<div class="mk-rank"><span style="width:22px">${['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅'][i]}</span>${avHTML(r, 'sm')}<b class="small" style="flex:1">${esc(r.name)}</b><span class="chip">${fa(r.trades)} معامله</span><span class="chip ${r.pnl >= 0 ? 'mk-up' : 'mk-down'}">${r.pnl >= 0 ? '+' : ''}${fa(r.pnl)} 🪙</span><b class="small" style="color:${r.pct >= 0 ? '#16a34a' : '#e11d48'}">${r.pct >= 0 ? '+' : ''}${fa(r.pct)}٪</b></div>`).join(''); })()}</div>`;
}

function predictTab() {
  const st = S(), my = isT() ? (st.mktExt.predictions || []) : (st.mktExt.predictions || []);
  const active = C.mktActiveWeek();
  const nextWeekAssets = (st.econ.assets || []).filter(a => !a.paused);
  const myPredThisWeek = my.filter(p => p.week === active && (!isT() || true));
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mkt-pred"><b class="small mb" style="display:block">🔮 پیش‌بینی قیمت هفتهٔ بعد</b>
      <p class="small muted mb">هر هفته می‌توانی قیمت یک سهم را برای پایان هفته پیش‌بینی کنی. ۳ نفر نزدیک‌ترین به قیمت واقعی، ${fa((st.mktExt.settings || {}).predictReward || 5)} سکه می‌گیرند.</p>
      ${isT() ? `<button type="button" class="btn warn mb" data-act="mktSettle">🏁 تسویهٔ پیش‌بینی‌های هفتهٔ قبل</button>` : ''}
      ${!isT() ? `<form data-form="mktPredict"><div class="field"><label class="lbl">کدام سهم؟</label><select class="select" name="assetId">${nextWeekAssets.map(a => `<option value="${a.id}">${a.icon} ${esc(a.name)} — الآن ${faNum(C.ecPrice(a))}</option>`).join('')}</select></div>
        <div class="field"><label class="lbl">قیمت پیش‌بینی‌شده برای پایان هفته</label><input class="input" data-fa inputmode="numeric" name="target" required placeholder="مثلاً ۱۱۵"></div>
        <div class="field"><label class="lbl">چرا این عدد؟</label><textarea class="input" name="reason" rows="2" placeholder="دلیل تحلیلت را بنویس…"></textarea></div>
        <button class="btn" type="submit" style="width:100%">🔮 ثبت پیش‌بینی</button></form>` : ''}
      ${!isT() && myPredThisWeek.filter(p => p.sid === SESS.sid).length ? `<div class="ins info mt">✅ برای این هفته پیش‌بینی کرده‌ای. هفتهٔ بعد بیا!</div>` : ''}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 پیش‌بینی‌های ثبت‌شده (${fa(my.length)})</b>
      <div class="mk-scroll">${my.slice().reverse().slice(0, 15).map(p => { const a = (st.econ.assets || []).find(x => x.id === p.assetId); const diff = Math.abs(C.ecPrice(a) - p.target); return `<div class="mk-row">${avHTML(stuById(st, p.sid), 'sm')}<div style="flex:1"><b class="small">${esc((stuById(st, p.sid) || {}).name)}</b> → ${a ? a.icon + ' ' + esc(a.symbol) : ''}<div class="small muted">پایه ${faNum(p.current)} • پیش‌بینی ${fa(p.target)} • اختلاف ${faNum(diff, 1)}</div>${p.reason ? `<div class="small muted">💭 ${esc(p.reason)}</div>` : ''}</div><span class="chip">هفته ${jShort(p.week)}</span></div>`; }).join('') || '<p class="small muted">هنوز پیش‌بینی ثبت نشده.</p>'}</div></div></div>`;
}

function journalTab() {
  const st = S(), j = isT() ? (st.mktExt.journal || []) : (st.mktExt.journal || []).filter(x => x.sid === SESS.sid);
  const trades = isT() ? (st.econ.trades || []) : (st.econ.trades || []).filter(t => t.sid === SESS.sid);
  const unlogged = trades.filter(t => !j.some(x => x.tradeId === t.id));
  const req = (st.mktExt.settings || {}).journalRequired;
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">📝 دفترچه دلیل معامله</b>
      <p class="small muted mb">${req ? '⚠️ برای هر معامله باید دلیل بنویسی (قانون کلاس).' : 'نوشتن دلیل معامله اختیاری است ولی توصیه می‌شود.'}</p>
      <p class="small muted">نوشتن دلیل = آموزش واقعی سواد مالی. بعد از یک ماه می‌توانی ببینی کدام دلیل‌ها درست بودند و کدام‌ها اشتباه.</p>
      ${!isT() && unlogged.length ? `<div class="ins warn mt">📭 ${fa(unlogged.length)} معاملهٔ ثبت‌نشده داری.</div>` : ''}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 نوشته‌های من (${fa(j.length)})</b>
      <div class="mk-scroll">${j.slice().reverse().slice(0, 20).map(x => { const t = (st.econ.trades || []).find(tr => tr.id === x.tradeId); const a = t ? (st.econ.assets || []).find(a2 => a2.id === t.assetId) : null; return `<div class="mkt-jrnl" style="--jc:${t && t.side === 'buy' ? '#16a34a' : '#e11d48'}"><div class="row"><span class="chip">${t && t.side === 'buy' ? '📈 خرید' : '📉 فروش'}</span>${a ? `<b class="small">${a.icon} ${esc(a.symbol)}</b>` : ''}<span class="chip">${fa(t ? t.qty : 0)} سهم</span><span class="small muted">${jShort(iranISO(new Date(x.at)))}</span></div><div class="small mt">💭 ${esc(x.reason)}</div></div>`; }).join('') || empty('📝', 'هنوز چیزی ننوشته‌ای', '')}</div></div></div>`;
}

/* ---------- ادغام با بازار موجود ---------- */
const baseRV = renderView;
renderView = function () {
  if (UI.section !== 'econ') return baseRV();
  baseRV();
  /* اضافه کردن تب‌های جدید پس از render اصلی */
  setTimeout(() => {
    const tabs = document.querySelector('#view .tabs');
    if (!tabs) return;
    const st = S(); if (!st || !st.econ) return;
    C.mktEnsure(st);
    const myUnlogged = !isT() ? (st.econ.trades || []).filter(t => t.sid === SESS.sid).filter(t => !(st.mktExt.journal || []).some(j => j.tradeId === t.id)).length : 0;
    const extra = isT()
      ? [['mktIdx', '📊 شاخص'], ['mktPred', '🔮 پیش‌بینی', (st.mktExt.predictions || []).length], ['mktJrnl', '📝 دفترچه', (st.mktExt.journal || []).length]]
      : [['mktIdx', '📊 شاخص'], ['mktPred', '🔮 پیش‌بینی'], ['mktJrnl', '📝 دفترچه', myUnlogged]];
    extra.forEach(([k, l, n]) => {
      if (tabs.querySelector(`[data-tab="${k}"]`)) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn-tab'; b.dataset.act = 'mktTab'; b.dataset.tab = k;
      b.innerHTML = `${l}${n ? ` (${fa(n)})` : ''}`;
      tabs.appendChild(b);
    });
    if (window.MKT_TAB) {
      const body = document.getElementById('mkBody');
      if (body) body.innerHTML = window.MKT_TAB === 'mktIdx' ? idxTab() : window.MKT_TAB === 'mktPred' ? predictTab() : journalTab();
    }
  }, 50);
};

window.MKT_TAB = null;
ACT.mktTab = el => {
  window.MKT_TAB = el.dataset.tab;
  document.querySelectorAll('#view .tabs [data-act="mktTab"]').forEach(b => b.classList.toggle('on', b === el));
  document.querySelectorAll('#view .tabs [data-act="mkTab"]').forEach(b => b.classList.remove('on'));
  const body = document.getElementById('mkBody');
  if (!body) return;
  body.innerHTML = window.MKT_TAB === 'mktIdx' ? idxTab() : window.MKT_TAB === 'mktPred' ? predictTab() : journalTab();
  Sound.play('tap');
};

/* ---------- فرم پیش‌بینی ---------- */
FORM.mktPredict = form => {
  const fd = new FormData(form);
  const target = Number(en(fd.get('target')));
  if (!target || target < 1) return toast('قیمت معتبر وارد کن', 'err');
  send('mkt.predict', { assetId: fd.get('assetId'), target, reason: fd.get('reason') || '' }, null, { sound: null })
    .then(r => { if (r) { Sound.play('win'); toast(`🔮 پیش‌بینی ثبت شد — قیمت الآن ${faNum(r.current)} • هدف تو ${fa(r.target)}`, 'ok', null, 7000); renderView(); } });
};

ACT.mktSettle = () => {
  confirmDlg({ title: '🏁 تسویهٔ پیش‌بینی‌ها', body: '۳ نفر برتر هفتهٔ قبل مشخص و پاداش می‌گیرند.', okText: 'تسویه کن', onOk: () => {
    send('mkt.settlePredictions', {}, null, { sound: null }).then(r => {
      if (r) { Sound.play('win'); const n = (r.rewards || []).length; toast(n ? `🏆 ${fa(n)} پیش‌بینی برنده پاداش شد` : 'پیش‌بینی‌ای برای تسویه نبود', 'ok', null, 7000); renderView(); }
    });
  } });
};

/* ---------- ادغام با خرید بورس (پنجرهٔ تأیید + ریسک) ---------- */
const origBuy = ACT.mkBuy;
ACT.mkBuy = el => {
  const id = el.dataset.id, a = (S().econ.assets || []).find(x => x.id === id);
  if (!a) return;
  const qty = (typeof M !== 'undefined' && M.qty) || 1;
  const risk = riskCard(id, qty);
  confirmDlg({
    title: '📈 خرید سهم ' + a.icon + ' ' + a.name,
    body: `${fa(qty)} سهم به قیمت تقریبی ${fa(Math.round(qty * C.ecPrice(a)))} 🪙<div class="mt"><b class="small">🧮 سناریوهای احتمالی:</b>${risk}</div>`,
    okText: 'خرید کن',
    onOk: () => {
      send('econ.trade', { assetId: id, side: 'buy', qty }, null, { sound: null }).then(r => {
        if (r) {
          Sound.play('pop');
          toast(`📈 ${fa(qty)} سهم خریدی`, 'ok');
          const req = S().mktExt && S().mktExt.settings && S().mktExt.settings.journalRequired;
          if (req) setTimeout(() => promptDlg({ title: '📝 چرا این سهم را خریدی؟', placeholder: 'دلیل تحلیلت را بنویس…', onOk: reason => {
            const t = (S().econ.trades || []).slice(-1)[0];
            if (t) send('mkt.journal', { tradeId: t.id, reason, mood: 'confident' }, null, { msg: '📝 دفترچه ثبت شد' });
          } }), 800);
        }
      });
    }
  });
};

if (S() && SESS) { /* ready */ }
})();
