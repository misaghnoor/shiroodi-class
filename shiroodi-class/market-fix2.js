/* market-fix2.js — فروش مطمئن (کشوی مستقل) + تب‌های بیمه/پیش‌بینی همیشه پر */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ecPortfolio || typeof navItems !== 'function') return;

const MF = { sell: { id: '', qty: 1 }, ins: { assetId: '', qty: 1, days: 5, ratio: 75 } };
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, iranISO = C.iranISO, clamp = C.clamp;
const errMsg = e => (e && (e.message || e.error)) ? String(e.message || e.error) : 'خطای ناشناخته؛ دوباره تلاش کن';
const pfOf = () => (S().econ && S().econ.portfolio) || C.ecPortfolio(S(), SESS.sid);
const assetOf = id => ((S().econ && S().econ.assets) || []).find(x => x.id === id);
const freeOf = id => { try { return C.ecFreeQty(S(), SESS.sid, id); } catch (e) { return 0; } };
const INS = C.EC_INS_STATUS || { active: { l: 'فعال', i: '🛡️', c: '#16a34a' }, settled: { l: 'تصفیه‌شده', i: '💰', c: '#1d4ed8' }, expired: { l: 'بدون خسارت', i: '🍀', c: '#65a30d' }, canceled: { l: 'فسخ', i: '↩️', c: '#7b7261' } };

/* ================= کشوی فروش ================= */
function sellDrawerHTML(id) {
  const a = assetOf(id); if (!a) return '<p class="small muted">سهم یافت نشد.</p>';
  const pf = pfOf(), my = pf.items.find(x => x.id === id);
  if (!my || !my.qty) return empty('📭', 'از این سهم نداری', 'اول از تب بورس سهم بخر، بعد هر وقت خواستی همین‌جا می‌فروشی.', '<button type="button" class="btn" data-act="drawerClose">بستن</button>');
  MF.sell.qty = clamp(MF.sell.qty, 1, my.qty);
  const p = C.ecPrice(a), fee = (S().econ.settings || {}).tradeFee || 0, q = MF.sell.qty;
  const val = Math.round(q * p * (1 - fee / 100));
  const avg = my.qty ? my.cost / my.qty : p;
  const pnl = Math.round((p - avg) * q);
  const insQ = my.qty - freeOf(id);
  return `<div>
    <div class="row mb" style="gap:10px"><span class="gr-ico" style="--kc:${a.color}">${a.icon}</span>
      <div style="flex:1"><b>${esc(a.name)}</b><div class="small muted">داری: ${fa(my.qty)} سهم${insQ ? ' • 🛡️ ' + fa(insQ) + ' زیر بیمه (تا پایان بیمه قابل فروش نیست)' : ''}</div></div>
      <div style="text-align:left"><b style="font-family:var(--display);font-size:1.4rem">${faNum(p)}</b><div class="small muted">قیمت الآن</div></div></div>
    <div class="field"><label class="lbl">چند سهم بفروشم؟</label>
      <div class="row" style="gap:8px"><span class="mk-step"><button type="button" data-act="mfSellQty" data-d="-1">−</button><b id="mfSellQty">${fa(q)}</b><button type="button" data-act="mfSellQty" data-d="1">+</button></span>
      <button type="button" class="btn sm ghost" data-act="mfSellAll">همه (${fa(my.qty)})</button></div></div>
    <div class="gr-note">میانگین خرید تو: ${faNum(avg)} • قیمت الآن: ${faNum(p)} → سود/زیان هر سهم: <b style="color:${p - avg >= 0 ? '#16a34a' : '#e11d48'}">${p - avg >= 0 ? '+' : ''}${faNum(p - avg)}</b></div>
    <div class="row mt" style="gap:6px"><span class="chip">ارزش فروش: <b>${fa(val)} 🪙</b></span><span class="chip">کارمزد ${fa(fee)}٪</span><span class="chip" style="color:${pnl >= 0 ? '#16a34a' : '#e11d48'}">سود/زیان کل: ${pnl >= 0 ? '+' : ''}${fa(pnl)}</span></div>
    <button type="button" class="btn danger mt" style="width:100%" data-act="mfSellGo" data-id="${id}">📉 تأیید فروش ${fa(q)} سهم</button>
    <p class="small muted mt">💡 درس بورس: تا نفروخته‌ای، سود فقط یک عدد روی کاغذ است.</p></div>`;
}
function openSell(id) { MF.sell.id = id; MF.sell.qty = 1; openDrawer('📉 فروش سهم', sellDrawerHTML(id)); }
ACT.mpSell = el => openSell(el.dataset.id);
ACT.mkSell = el => openSell(el.dataset.id);
ACT.mfSellQty = el => { const pf = pfOf(); const my = pf.items.find(x => x.id === MF.sell.id); MF.sell.qty = clamp(MF.sell.qty + Number(en(el.dataset.d)), 1, my ? my.qty : 1); const d = document.getElementById('drawerBody'); if (d) d.innerHTML = sellDrawerHTML(MF.sell.id); Sound.play('tap'); };
ACT.mfSellAll = () => { const pf = pfOf(); const my = pf.items.find(x => x.id === MF.sell.id); if (my) MF.sell.qty = my.qty; const d = document.getElementById('drawerBody'); if (d) d.innerHTML = sellDrawerHTML(MF.sell.id); };
ACT.mfSellGo = el => {
  const id = el.dataset.id, q = MF.sell.qty, a = assetOf(id);
  send('econ.trade', { assetId: id, side: 'sell', qty: q }, null, { sound: null })
    .then(r => { if (r) { Sound.play('win'); toast('💰 فروش ثبت شد • ' + fa(r.proceeds || 0) + ' سکه برگشت', 'ok'); closeDrawer(); renderView(); } })
    .catch(e => { toast('⚠️ فروش نشد: ' + errMsg(e), 'err', null, 8000); });
};

/* ================= تب بیمه (نسخهٔ دفاعی، همیشه پر) ================= */
function insQuoteHTML(a, fq) {
  if (!a || fq <= 0) return '';
  if (typeof C.ecQuote !== 'function') return '<p class="small muted mt">ماژول قیمت‌گذاری در دسترس نیست؛ فایل market-core.js را بررسی کن.</p>';
  const q = C.ecQuote(S(), { sid: SESS.sid, assetId: a.id, qty: MF.ins.qty, days: MF.ins.days, ratio: MF.ins.ratio });
  if (!q) return '';
  return `<div class="mk-quote mt">
    <div class="qr"><span>ارزش تحت پوشش</span><b>${fa(q.value || 0)} 🪙</b></div>
    <div class="qr"><span>نوسان روزانهٔ سهم (ریسک)</span><b>${faNum((q.vol || 0) * 100, 1)}٪</b></div>
    <div class="qr"><span>خسارت انتظاررفته</span><b>${fa(q.expLoss || 0)} 🪙</b></div>
    <div class="qr"><span>سقف خسارت این بیمه‌نامه</span><b>${fa(q.cap || 0)} 🪙</b></div>
    <div class="qr"><span style="font-weight:800">حق بیمهٔ تو</span><b style="font-size:1.25rem;color:#0ea5e9">${fa(q.premium || 0)} 🪙</b></div>
    ${q.ok ? '' : `<div class="qr"><span style="color:#e11d48;font-weight:800">⚠️ ${esc(q.reason || '')}</span></div>`}
  </div>
  ${q.ok ? `<button type="button" class="btn mt" style="width:100%;background:linear-gradient(135deg,#0369a1,#0ea5e9)" data-act="mfInsGo">🛡️ خرید بیمه با ${fa(q.premium)} سکه</button>` : ''}`;
}
function polRow(p) {
  const a = assetOf(p.assetId), stt = INS[p.status] || INS.active;
  const cur = a ? C.ecPrice(a) : p.strike;
  const drop = Math.max(0, (p.strike || 0) - cur);
  return `<div class="mk-pol" style="--sc:${stt.c}">
    <div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${stt.c};width:38px;height:38px">${a ? a.icon : '🛡️'}</span>
      <div style="flex:1"><b class="small">${a ? esc(a.name) : esc(p.symbol || '')}</b><div class="small muted">${fa(p.qty)} سهم • پوشش ${fa(p.ratio)}٪ • ${fa(p.days)} روز • تا ${jShort(p.endAt)}</div></div>
      <span class="gr-pill" style="--pc:${stt.c}">${stt.i} ${stt.l}</span></div>
    <div class="row mt" style="gap:6px"><span class="chip">پایه ${faNum(p.strike)}</span><span class="chip">الآن ${faNum(cur)}</span><span class="chip">حق بیمه ${fa(p.premium)}</span><span class="chip">سقف ${fa(p.cap || 0)}</span></div>
    <div class="gr-note mt">${p.status === 'active' ? (drop > 0 ? 'اگر امروز تصفیه شود: <b>' + fa(Math.min(Math.round(drop * p.qty * p.ratio / 100), p.cap || 0)) + ' سکه خسارت</b> می‌گیری.' : 'قیمت بالا یا ثابت است؛ بیمه فقط محافظ است، نه سود.') : p.status === 'settled' ? 'خسارت پرداخت‌شده: <b>' + fa(p.payout || 0) + ' سکه</b>' : p.status === 'expired' ? '🍀 بدون خسارت تمام شد.' : 'فسخ شد • برگشتی: ' + fa(p.refund || 0)}</div>
    ${p.status === 'active' ? `<button type="button" class="btn ghost sm mt" data-act="mfInsCancel" data-id="${p.id}">↩️ فسخ (۴۰٪ برگشت)</button>` : ''}</div>`;
}
function safeInsTab() {
  const st = S();
  if (!st.econ) return '<div class="mk-box">' + empty('📈', 'بورس آماده نیست', '') + '</div>';
  try { C.ecEnsure(st); } catch (e) {}
  if (isT()) {
    const f = (st.econ.fund || {});
    const pols = (st.econ.policies || []).slice().reverse().slice(0, 20);
    return `<div class="grid g2 mk-grid2 mb" style="align-items:start">
      <div class="mk-fund"><b style="font-size:.85rem">🏦 صندوق بیمهٔ کلاس</b><br><b style="font-size:2.2rem">${fa(f.balance || 0)} 🪙</b>
        <div class="row mt" style="gap:6px;font-size:.8rem"><span>دریافتی: <b>${fa(f.premiums || 0)}</b></span><span>پرداختی: <b>${fa(f.payouts || 0)}</b></span></div>
        <button type="button" class="btn sm mt" style="background:rgba(255,255,255,.25)" data-act="mfInsSettle">⚙️ تصفیهٔ دستی بیمه‌ها</button></div>
      <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد بیمه</b>
        <div class="srow"><span>🛡️ فعال</span><span class="switch"><input type="checkbox" ${((st.econ.settings || {}).ins || {}).enabled !== false ? 'checked' : ''} data-chg="mkInsSet" data-k="enabled"><i></i></span></div>
        <p class="small muted mt">حق بیمه = خسارت انتظاررفته × (۱ + حاشیهٔ امنیت) + کارمزد؛ نوسان هر سهم از کندل‌های واقعی‌اش خوانده می‌شود.</p></div></div>
      <div class="mk-box"><b class="small mb" style="display:block">📜 همهٔ بیمه‌نامه‌ها (${fa((st.econ.policies || []).length)})</b>
        ${pols.length ? '<div class="grid g2 mk-grid2" style="gap:12px">' + pols.map(polRow).join('') + '</div>' : empty('🛡️', 'بیمه‌نامه‌ای نیست', 'دانش‌آموزان از همین تب بیمه می‌خرند.')}</div>`;
  }
  /* دانش‌آموز */
  const pf = pfOf();
  const insurable = pf.items.filter(x => freeOf(x.id) > 0);
  if (!MF.ins.assetId || !insurable.some(x => x.id === MF.ins.assetId)) MF.ins.assetId = insurable[0] ? insurable[0].id : '';
  const a = assetOf(MF.ins.assetId);
  const fq = a ? freeOf(a.id) : 0;
  MF.ins.qty = clamp(MF.ins.qty, 1, Math.max(1, fq));
  const mine = (st.econ.policies || []).slice().reverse();
  const form = insurable.length ? `<div class="field"><label class="lbl">کدام سهم را بیمه کنم؟</label><select class="select" data-chg="mfInsAsset">${insurable.map(x => `<option value="${x.id}" ${x.id === MF.ins.assetId ? 'selected' : ''}>${x.icon} ${esc(x.name)} — ${fa(freeOf(x.id))} سهم آزاد</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">تعداد سهم</label><span class="mk-step"><button type="button" data-act="mfInsQty" data-d="-1">−</button><b id="mfInsQty">${fa(MF.ins.qty)}</b><button type="button" data-act="mfInsQty" data-d="1">+</button></span> <span class="small muted">از ${fa(fq)} آزاد</span></div>
    <div class="field"><label class="lbl">مدت پوشش (روز مدرسه)</label><div class="seg">${[3, 5, 7, 10].map(d => `<button type="button" class="${MF.ins.days === d ? 'on' : ''}" data-act="mfInsDays" data-v="${d}">${fa(d)}</button>`).join('')}</div></div>
    <div class="field"><label class="lbl">درصد پوشش ضرر</label><div class="seg">${[50, 75, 100].map(r => `<button type="button" class="${MF.ins.ratio === r ? 'on' : ''}" data-act="mfInsRatio" data-v="${r}">${fa(r)}٪</button>`).join('')}</div></div>
    ${insQuoteHTML(a, fq)}`
    : (pf.items.length ? '<p class="small muted">همهٔ سهم‌هایت زیر پوشش بیمه‌اند یا سهم آزاد نداری؛ اول یک بیمه را فسخ کن یا سهم بیشتری بخر.</p>'
      : `<p class="small muted mb">هنوز سهمی نداری که بیمه کنی.</p><button type="button" class="btn" data-act="mfGoMarket">📈 برو به بورس و سهم بخر</button>`);
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🛡️ بیمه‌نامهٔ جدید</b>${form}
      <p class="small muted mt">🛡️ بیمه یعنی: اگر قیمت سهمم افت کرد، ضررم جبران شود. اگر بالا برود، حق بیمه سوخت می‌شود — دقیقاً مثل بیمهٔ واقعی.</p></div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 بیمه‌نامه‌های من (${fa(mine.length)})</b>
      ${mine.length ? '<div class="grid" style="gap:12px">' + mine.slice(0, 8).map(polRow).join('') + '</div>' : empty('🛡️', 'بیمه‌نامه‌ای نداری', 'با یک بیمهٔ کوچک روی سهمی که داری شروع کن.')}</div></div>`;
}

/* ================= تب پیش‌بینی (نسخهٔ دفاعی) ================= */
function safePredictTab() {
  const st = S();
  try { if (C.mktEnsure) C.mktEnsure(st); } catch (e) {}
  if (!C.mktEnsure || !st.mktExt) return '<div class="mk-box">' + empty('🔮', 'ماژول پیش‌بینی نصب نیست', 'فایل market-ext-core.js باید در ریشه و در index.html باشد.') + '</div>';
  const week = C.mktActiveWeek ? C.mktActiveWeek() : todayISO();
  const preds = (st.mktExt.predictions || []).slice().reverse();
  const mine = isT() ? preds : preds.filter(p => p.sid === SESS.sid);
  const doneThisWeek = !isT() && preds.some(p => p.sid === SESS.sid && p.week === week);
  const form = (!isT() && !doneThisWeek) ? `<form data-form="mfPred">
    <div class="field"><label class="lbl">کدام سهم؟</label><select class="select" name="assetId">${((st.econ.assets || []).filter(x => !x.paused)).map(x => `<option value="${x.id}">${x.icon} ${esc(x.name)} — الآن ${faNum(C.ecPrice(x))}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl">قیمت پیش‌بینی‌شده برای پایان هفته</label><input class="input" data-fa inputmode="numeric" name="target" required placeholder="مثلاً ۱۱۵"></div>
    <div class="field"><label class="lbl">دلیل تحلیلت</label><textarea class="input" name="reason" rows="2" placeholder="مثلاً: چون تکالیف ریاضی این هفته خوب انجام شد…"></textarea></div>
    <button class="btn" type="submit" style="width:100%">🔮 ثبت پیش‌بینی</button></form>`
    : (!isT() ? '<div class="gr-note">✅ برای این هفته پیش‌بینی‌ات را ثبت کرده‌ای؛ هفتهٔ بعد دوباره بیا.</div>' : '');
  return `<div class="grid g2 mk-grid2" style="align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🔮 پیش‌بینی قیمت پایان هفته</b>
      <p class="small muted mb">هر هفته یک بار می‌توانی قیمت یک سهم را حدس بزنی. سه نفرِ نزدیک‌تر به قیمت واقعی، پاداش می‌گیرند (${fa((st.mktExt.settings || {}).predictReward || 5)} سکه به نفر اول).</p>
      ${isT() ? `<button type="button" class="btn warn mb" data-act="mfSettle">🏁 تسویهٔ پیش‌بینی‌های هفتهٔ قبل</button>` : ''}
      ${form}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 پیش‌بینی‌ها (${fa(mine.length)})</b>
      <div class="mk-scroll">${mine.slice(0, 15).map(p => { const a = assetOf(p.assetId); const diff = a ? Math.abs(C.ecPrice(a) - p.target) : 0;
        return `<div class="mk-row">${isT ? '' : ''}${avHTML(stuById(st, p.sid), 'sm')}<div style="flex:1"><b class="small">${esc((stuById(st, p.sid) || {}).name || '')} → ${a ? a.icon + ' ' + esc(a.symbol) : ''}</b><div class="small muted">پایه ${faNum(p.current)} • هدف ${fa(p.target)} • فاصله تا الآن ${faNum(diff, 1)}</div>${p.reason ? `<div class="small muted">💭 ${esc(p.reason)}</div>` : ''}</div><span class="chip">${jShort(p.week)}</span></div>`; }).join('') || '<p class="small muted">هنوز پیش‌بینی ثبت نشده.</p>'}</div>
      <p class="small muted mt">💡 پیش‌بینی خوب = نگاه به کندل‌ها، روند و اتفاق‌های کلاس؛ نه شانس.</p></div></div>`;
}

/* ================= اکشن‌های بیمه/پیش‌بینی ================= */
ACT.mfGoMarket = () => { const b = document.querySelector('#view .tabs [data-act="mkTab"][data-tab="market"]'); if (b) ACT.mkTab(b); };
ACT.mfInsQty = el => { const fq = freeOf(MF.ins.assetId); MF.ins.qty = clamp(MF.ins.qty + Number(en(el.dataset.d)), 1, Math.max(1, fq)); redrawIns(); };
ACT.mfInsDays = el => { MF.ins.days = Number(en(el.dataset.v)); redrawIns(); Sound.play('tap'); };
ACT.mfInsRatio = el => { MF.ins.ratio = Number(en(el.dataset.v)); redrawIns(); Sound.play('tap'); };
CHG.mfInsAsset = el => { MF.ins.assetId = el.value; MF.ins.qty = 1; redrawIns(); };
ACT.mfInsGo = () => {
  send('econ.insure', { id: uid(), assetId: MF.ins.assetId, qty: MF.ins.qty, days: MF.ins.days, ratio: MF.ins.ratio }, null, { sound: null })
    .then(r => { if (r) { Sound.play('win'); toast('🛡️ بیمه‌نامه فعال شد • ' + fa(r.premium) + ' سکه حق بیمه', 'ok', null, 7000); redrawIns(); } })
    .catch(e => toast('⚠️ بیمه نشد: ' + errMsg(e), 'err', null, 8000));
};
ACT.mfInsCancel = el => confirmDlg({ title: '↩️ فسخ بیمه‌نامه', body: '۴۰٪ حق بیمه برمی‌گردد و پوشش از بین می‌رود.', okText: 'فسخ کن', onOk: () => {
  send('econ.insCancel', { id: el.dataset.id }, null, { sound: null })
    .then(r => { if (r) { toast('↩️ فسخ شد • ' + fa(r.refund) + ' سکه برگشت', 'ok'); redrawIns(); } })
    .catch(e => toast('⚠️ ' + errMsg(e), 'err'));
} });
ACT.mfInsSettle = () => send('econ.insSettle', {}, null, { sound: null }).then(r => { if (r) { toast('⚙️ ' + fa(r.settled) + ' بیمه‌نامه بررسی/تصفیه شد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + errMsg(e), 'err'));
ACT.mfSettle = () => confirmDlg({ title: '🏁 تسویهٔ پیش‌بینی‌ها', body: 'نفرات برتر هفتهٔ قبل پاداش می‌گیرند.', okText: 'تسویه کن', onOk: () => {
  send('mkt.settlePredictions', {}, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast(r.rewards && r.rewards.length ? '🏆 ' + fa(r.rewards.length) + ' پیش‌بینی پاداش گرفت' : 'موردی برای تسویه نبود', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + errMsg(e), 'err'));
} });
FORM.mfPred = form => {
  const fd = new FormData(form);
  const target = Math.round(num(fd.get('target')) || 0);
  if (target < 1) return toast('قیمت معتبر بنویس', 'err');
  send('mkt.predict', { assetId: fd.get('assetId'), target, reason: String(fd.get('reason') || '') }, null, { sound: null })
    .then(r => { if (r) { Sound.play('win'); toast('🔮 پیش‌بینی ثبت شد • هدف تو ' + fa(target), 'ok', null, 7000); renderView(); } })
    .catch(e => toast('⚠️ ' + errMsg(e), 'err', null, 8000));
};
function redrawIns() { const b = document.getElementById('mkBody'); if (b) b.innerHTML = safeInsTab(); }

/* ================= جایگزینی امن بدنهٔ تب‌ها ================= */
const baseRV = renderView;
renderView = function () {
  baseRV();
  setTimeout(() => {
    try {
      if (!S() || !S().econ || !SESS || UI.section !== 'econ') return;
      const body = document.getElementById('mkBody'); if (!body) return;
      if (window.MKT_TAB === 'mktPred') { body.innerHTML = safePredictTab(); return; }
      const on = document.querySelector('#view .tabs [data-act="mkTab"].on');
      if (!window.MKT_TAB && on && on.dataset.tab === 'ins') body.innerHTML = safeInsTab();
    } catch (e) { console.error('mf render', e); }
  }, 240);
};
})();
