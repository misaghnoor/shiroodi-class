/* market-pro.js — رابط کاربری فاز ۱ و ۳ بورس */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.MP2_SCAMS || typeof navItems !== 'function') return;
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, todayISO = C.todayISO, isoToDate = C.isoToDate;
const MP2 = { si: 0, last: null };
const P2 = () => S().mktPro || { settings: {}, orders: [], alerts: [], bonds: [], quiz: {}, scams: C.MP2_SCAMS, since: {} };
const assets = () => (S().econ && S().econ.assets) || [];
const snd = k => { try { Sound.play(k); } catch (e) {} };
const CSS = `.mp2-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:15px;box-shadow:var(--shadow);min-width:0}
.mp2-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));margin-top:14px}
.mp2-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed var(--line);font-size:.8rem;flex-wrap:wrap}
.mp2-row:last-child{border:none}
.mp2-st{border-radius:99px;padding:2px 9px;font-size:.68rem;font-weight:800}
.mp2-open{background:#fef3c7;color:#92400e}.mp2-filled{background:#d1fae5;color:#065f46}.mp2-failed{background:#fee2e2;color:#991b1b}.mp2-canceled{background:#e5e7eb;color:#374151}.mp2-matured{background:#d1fae5;color:#065f46}
.mp2-opt{display:block;width:100%;text-align:right;border:1.5px solid var(--line);background:var(--surface2);border-radius:12px;padding:10px 12px;font-size:.8rem;font-weight:700;cursor:pointer;margin-top:7px;font-family:inherit;color:var(--ink);transition:.15s}
.mp2-opt:hover{border-color:var(--acc);transform:translateY(-1px)}
.mp2-opt.ok{border-color:#16a34a;background:#ecfdf5}.mp2-opt.no{border-color:#e11d48;background:#fef2f2}
.mp2-why{border-radius:12px;padding:10px 12px;font-size:.78rem;line-height:1.9;margin-top:9px;background:color-mix(in srgb,#0ea5e9 8%,var(--surface));border:1px dashed color-mix(in srgb,#0ea5e9 40%,var(--line))}
.mp2-bar{height:8px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);overflow:hidden}.mp2-bar i{display:block;height:100%;background:linear-gradient(90deg,#0d9488,#6ee7b7)}
@media (max-width:700px){.mp2-grid{grid-template-columns:1fr}}`;
if (!document.getElementById('mp2Css')) { const s = document.createElement('style'); s.id = 'mp2Css'; s.textContent = CSS; document.head.appendChild(s); }
function assetOpts(sel) { return assets().filter(a => !a.paused).map(a => '<option value="' + a.id + '"' + (a.id === sel ? ' selected' : '') + '>' + a.icon + ' ' + esc(a.symbol) + ' — ' + faNum(C.ecPrice(a)) + '</option>').join(''); }
function ordersCard() {
  const p = P2(), mine = p.orders || [];
  const kl = { limit: '🎯 محدود', stop: '🛑 حد ضرر', tp: '💰 حد سود' };
  return '<div class="mp2-card"><div class="spread mb"><b>📋 سفارش‌های شرطی من</b><span class="chip">' + fa(mine.filter(o => o.status === 'open').length) + ' باز</span></div>' +
    (!isT() ? '<form data-form="mp2Order" class="row" style="gap:6px;flex-wrap:wrap"><select class="select" name="assetId" style="flex:1;min-width:110px">' + assetOpts('') + '</select>' +
    '<select class="select" name="side"><option value="buy">📈 خرید</option><option value="sell">📉 فروش</option></select>' +
    '<select class="select" name="kind"><option value="limit">🎯 محدود</option><option value="stop">🛑 حد ضرر</option><option value="tp">💰 حد سود</option></select>' +
    '<input class="input" data-fa inputmode="numeric" name="price" placeholder="قیمت" style="width:76px" required>' +
    '<input class="input" data-fa inputmode="numeric" name="qty" placeholder="تعداد" style="width:66px" value="۱" required>' +
    '<button class="btn sm" type="submit">ثبت</button></form><p class="small muted mt">سفارش در صف می‌ماند و وقتی قیمت به عدد تو رسید، خودکار اجرا می‌شود.</p>' : '') +
    (mine.length ? mine.slice(0, 12).map(o => '<div class="mp2-row"><b>' + (o.side === 'buy' ? '📈' : '📉') + ' ' + esc(o.symbol) + '</b><span class="chip">' + (kl[o.kind] || o.kind) + '</span><span>🎚 ' + fa(o.price) + ' × ' + fa(o.qty) + '</span><span class="mp2-st mp2-' + o.status + '">' + (o.status === 'open' ? '⏳ باز' : o.status === 'filled' ? '✅ اجرا شد' : o.status === 'failed' ? '⚠️ ' + esc(o.note || 'ناموفق') : '✖️ لغو') + '</span>' + (o.status === 'open' ? '<button type="button" class="ib sm" data-act="mp2OrderCancel" data-id="' + o.id + '">🗑</button>' : '') + '</div>').join('') : '<p class="small muted">سفارش شرطی نداری.</p>') + '</div>';
}
function alertsCard() {
  const p = P2(), mine = p.alerts || [];
  return '<div class="mp2-card"><div class="spread mb"><b>🔔 زنگ هشدار قیمت</b><span class="chip">' + fa(mine.filter(a => !a.triggered).length) + ' فعال</span></div>' +
    (!isT() ? '<form data-form="mp2Alert" class="row" style="gap:6px;flex-wrap:wrap"><select class="select" name="assetId" style="flex:1;min-width:110px">' + assetOpts('') + '</select>' +
    '<select class="select" name="dir"><option value="above">⬆️ رسید به بالای</option><option value="below">⬇️ افت به زیر</option></select>' +
    '<input class="input" data-fa inputmode="numeric" name="price" placeholder="قیمت" style="width:76px" required><button class="btn sm" type="submit">🔔</button></form>' : '') +
    (mine.length ? mine.slice(0, 10).map(a => '<div class="mp2-row"><b>' + esc(a.symbol) + '</b><span>' + (a.dir === 'above' ? '⬆️ بالای' : '⬇️ زیر') + ' ' + fa(a.price) + '</span><span class="mp2-st ' + (a.triggered ? 'mp2-filled' : 'mp2-open') + '">' + (a.triggered ? '🔔 خورد!' : '⏳ منتظر') + '</span><button type="button" class="ib sm" data-act="mp2AlertDel" data-id="' + a.id + '">🗑</button></div>').join('') : '<p class="small muted">هشباری نداری؛ یکی بگذار تا به‌جای خیره‌شدن به نمودار، زندگی کنی.</p>') + '</div>';
}
function bondsCard() {
  const p = P2(), s = p.settings || {}, mine = p.bonds || [], today = todayISO();
  return '<div class="mp2-card"><div class="spread mb"><b>🏦 اوراق درآمد ثابت</b><span class="chip">ریسک کم • سود ثابت</span></div>' +
    '<div class="gr-note mb">قیمت: <b>' + fa(s.bondFace || 50) + ' 🪙</b> • کوپن: <b>' + fa(s.bondCoupon || 1) + ' 🪙/هفته</b> • سررسید: <b>' + fa(s.bondWeeks || 4) + ' هفته</b> (بازگشت اصل)</div>' +
    (!isT() ? '<button type="button" class="btn soft" style="width:100%" data-act="mp2BondBuy">🏦 خرید یک ورقه</button>' : '') +
    (mine.length ? '<div class="mt">' + mine.slice(0, 6).map(b => {
      const left = Math.max(0, Math.round((isoToDate(b.maturesAt) - isoToDate(today)) / 864e5));
      const pct = Math.round((b.pw || []).length / b.weeks * 100);
      return '<div class="mp2-row" style="display:block"><div class="spread"><b>🏦 ورقهٔ ' + fa(b.face) + ' سکه‌ای</b><span class="mp2-st ' + (b.status === 'active' ? 'mp2-open' : 'mp2-matured') + '">' + (b.status === 'active' ? left + ' روز تا سررسید' : '✅ سررسید شد') + '</span></div><div class="mp2-bar mt"><i style="width:' + pct + '%"></i></div><div class="small muted mt">کوپن گرفته: ' + fa((b.pw || []).length) + ' از ' + fa(b.weeks) + '</div></div>';
    }).join('') + '</div>' : '<p class="small muted mt">اوراقی نداری.</p>') +
    '<p class="small muted mt">💡 اوراق یعنی «پول صبور»: سودش کم است ولی هیچ‌وقت سورپرایزت نمی‌کند. کنار سهام پرریسک، لنگرِ سبد توست.</p></div>';
}
function divCard() {
  const p = P2(), s = p.settings || {}, pf = isT() ? null : C.ecPortfolio(S(), SESS.sid);
  const since = p.since || {};
  let rows = '';
  if (!isT() && pf) rows = pf.items.map(x => {
    const sn = since[x.id]; const d = sn ? Math.round((isoToDate(todayISO()) - isoToDate(sn)) / 864e5) : 0;
    const pct = clamp(Math.round(d / (s.loyalDays || 10) * 100), 0, 100);
    return '<div class="mp2-row" style="display:block"><div class="spread"><b>' + x.icon + ' ' + esc(x.symbol) + ' × ' + fa(x.qty) + '</b><span class="small muted">' + fa(d) + ' روز نگهداری</span></div><div class="mp2-bar mt"><i style="width:' + pct + '%"></i></div><div class="small muted mt">' + (d >= (s.loyalDays || 10) ? '🧘 واجد پاداش صبر!' : fa((s.loyalDays || 10) - d) + ' روز تا پاداش صبر') + ' • سود هفتگی تقریبی: ' + fa(Math.round(x.qty * x.price * (s.divYield || 1) / 100)) + ' 🪙</div></div>';
  }).join('');
  return '<div class="mp2-card"><div class="spread mb"><b>💵 سود سهام و پاداش صبر</b><span class="chip">' + (p.divWeek ? 'هفتهٔ ' + jShort(p.divWeek) + ' پرداخت شد' : 'در انتظار اولین هفته') + '</span></div>' +
    '<div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip">سود هفتگی: ' + fa(s.divYield || 1) + '٪</span><span class="chip" style="color:#16a34a">هفتهٔ سبز: +' + fa(s.divBonus || 1) + '٪</span><span class="chip" style="color:#7c3aed">پاداش صبر: ' + fa(s.loyalCoin || 1) + ' 🪙 پس از ' + fa(s.loyalDays || 10) + ' روز</span></div>' +
    (rows ? '<div class="mt">' + rows + '</div>' : '<p class="small muted mt">سهمی نداری؛ سود سهام به دارندگان سهم می‌رسد.</p>') +
    '<p class="small muted mt">💡 سود سهام یعنی حتی وقتی قیمت تکان نمی‌خورد، مالکیت برایت کار می‌کند — تفاوت «سرمایه‌گذار» با «دلال».</p></div>';
}
function scamCard() {
  const p = P2(), q = p.quiz || {}, list = p.scams || C.MP2_SCAMS;
  if (isT()) {
    const rows = (S().students || []).map(s => { const qq = (p.quiz || {})[s.id] || {}; return { n: s.name, sc: qq.score || 0, av: s }; }).sort((a, b) => b.sc - a.sc);
    return '<div class="mp2-card"><b class="mb" style="display:block">🚦 سواد ضدکلاهبرداری کلاس</b>' + rows.slice(0, 10).map(r => '<div class="mp2-row"><span style="flex:1">' + esc(r.n) + '</span><span class="chip" style="color:#0d9488">' + fa(r.sc) + ' از ' + fa(list.length) + ' درست</span></div>').join('') + '</div>';
  }
  MP2.si = clamp(MP2.si, 0, list.length - 1);
  const sc = list[MP2.si], answered = q.a ? q.a[sc.id] : null;
  const opts = sc.opts.map((o, i) => {
    let cls = 'mp2-opt';
    if (MP2.last && MP2.last.id === sc.id) cls += i === MP2.last.pick ? (o.ok ? ' ok' : ' no') : '';
    else if (answered != null && i === answered) cls += o.ok ? ' ok' : '';
    return '<button type="button" class="' + cls + '" data-act="mp2ScamPick" data-s="' + sc.id + '" data-i="' + i + '">' + fa(i + 1) + '. ' + esc(o.t) + '</button>';
  }).join('');
  const why = MP2.last && MP2.last.id === sc.id ? '<div class="mp2-why">' + (MP2.last.ok ? '✅ ' : '❌ ') + esc(MP2.last.why) + '</div>' : '';
  return '<div class="mp2-card"><div class="spread mb"><b>🚦 رادار کلاهبرداری</b><span class="chip">امتیاز: ' + fa(q.score || 0) + ' از ' + fa(list.length) + ' • زنجیره: ' + fa(q.streak || 0) + '</span></div>' +
    '<div class="gr-note mb"><b>' + esc(sc.t) + ':</b> ' + esc(sc.story) + '</div>' + opts + why +
    '<div class="row mt"><button type="button" class="btn sm ghost" data-act="mp2ScamPrev">→ قبلی</button><button type="button" class="btn sm ghost" data-act="mp2ScamNext">بعدی ←</button></div>' +
    '<p class="small muted mt">هر تشخیص درست = ۲ سکه + ۱۰ تجربه. این مهارت، سپرِ تو در بازار واقعیِ بزرگسالی است.</p></div>';
}
function settingsCard() {
  const s = P2().settings || {};
  const step = (k, l) => '<div class="mp2-row"><span style="flex:1">' + l + '</span><span class="mk-step"><button type="button" data-act="mp2Set" data-k="' + k + '" data-d="-1">−</button><b>' + fa(s[k]) + '</b><button type="button" data-act="mp2Set" data-k="' + k + '" data-d="1">+</button></span></div>';
  return '<div class="mp2-card"><b class="mb" style="display:block">⚙️ قواعد فاز ۱ و ۳</b>' +
    step('divYield', '💵 سود سهام هفتگی (٪)') + step('divBonus', '📈 پاداش هفتهٔ سبز (٪)') + step('loyalDays', '🧘 روز لازم برای پاداش صبر') + step('loyalCoin', '🧘 سکهٔ پاداش صبر') +
    step('bondFace', '🏦 قیمت اوراق') + step('bondWeeks', '🏦 هفته‌های سررسید') + step('bondCoupon', '🏦 کوپن هفتگی') + '</div>';
}
function inject() {
  try {
    if (!S() || !S().econ || !SESS || UI.section !== 'econ') return;
    if (window.MKT_TAB) return;
    const on = document.querySelector('#view .tabs [data-act="mkTab"].on');
    if (!on || on.dataset.tab !== 'market') return;
    const host = document.getElementById('mkBody'); if (!host) return;
    const old = document.getElementById('mp2'); if (old) old.remove();
    const w = document.createElement('div'); w.id = 'mp2';
    w.innerHTML = '<div class="mp2-grid">' + ordersCard() + alertsCard() + bondsCard() + divCard() + scamCard() + (isT() ? settingsCard() : '') + '</div>';
    host.appendChild(w);
    const seen = JSON.parse(localStorage.getItem('mp2seen') || '[]');
    (P2().alerts || []).forEach(a => {
      if (a.triggered && !isT() && a.sid === SESS.sid && seen.indexOf(a.id) < 0) {
        seen.push(a.id);
        try { toast('🔔 هشدارت خورد: ' + a.symbol + ' ' + (a.dir === 'above' ? 'بالای' : 'زیر') + ' ' + fa(a.price), 'ok', null, 8000); } catch (e) {}
      }
    });
    localStorage.setItem('mp2seen', JSON.stringify(seen.slice(-60)));
  } catch (e) { console.error('mp2 inject', e); }
}
const baseRV = renderView;
renderView = function () { baseRV(); setTimeout(inject, 240); };
FORM.mp2Order = form => {
  const fd = new FormData(form);
  send('mk2.order', { assetId: fd.get('assetId'), side: fd.get('side'), kind: fd.get('kind'), price: num(fd.get('price')), qty: num(fd.get('qty')) }, null, { sound: null })
    .then(r => { if (r) { snd('pop'); toast('📋 سفارش شرطی در صف قرار گرفت', 'ok'); renderView(); } })
    .catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
};
FORM.mp2Alert = form => {
  const fd = new FormData(form);
  send('mk2.alert', { assetId: fd.get('assetId'), dir: fd.get('dir'), price: num(fd.get('price')) }, null, { sound: null })
    .then(r => { if (r) { snd('pop'); toast('🔔 هشدار ثبت شد', 'ok'); renderView(); } })
    .catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
};
ACT.mp2OrderCancel = el => send('mk2.orderCancel', { id: el.dataset.id }, null, { msg: 'سفارش لغو شد', sound: 'err' }).then(renderView);
ACT.mp2AlertDel = el => send('mk2.alertDel', { id: el.dataset.id }, null, { sound: null }).then(renderView);
ACT.mp2BondBuy = el => {
  const s = P2().settings || {};
  confirmDlg({ title: '🏦 خرید اوراق', body: fa(s.bondFace) + ' سکه الآن کم می‌شود؛ هر هفته ' + fa(s.bondCoupon) + ' سکه کوپن می‌گیری و در سررسید اصل پول برمی‌گردد. زودتر نمی‌توانی خارج شوی — این یعنی تمرینِ تعهد.', okText: 'می‌خرم', onOk: () => send('mk2.bond', { id: uid() }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🏦 اوراق خریدی؛ کوپن اول هفتهٔ بعد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
};
ACT.mp2ScamPick = el => {
  send('mk2.scam', { scamId: el.dataset.s, pick: el.dataset.i }, null, { sound: null }).then(r => {
    if (r) { MP2.last = { id: el.dataset.s, pick: Number(el.dataset.i), ok: r.ok, why: r.why }; snd(r.ok ? 'win' : 'err'); if (r.ok) toast('✅ درست! +۲ سکه +۱۰ تجربه', 'ok'); inject(); }
  }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
};
ACT.mp2ScamNext = () => { MP2.si = (MP2.si + 1) % (P2().scams || C.MP2_SCAMS).length; MP2.last = null; inject(); snd('tap'); };
ACT.mp2ScamPrev = () => { const n = (P2().scams || C.MP2_SCAMS).length; MP2.si = (MP2.si - 1 + n) % n; MP2.last = null; inject(); snd('tap'); };
ACT.mp2Set = el => {
  const k = el.dataset.k, d = Number(en(el.dataset.d));
  const s = P2().settings; s[k] = (s[k] || 0) + d;
  send('mk2.settings', { patch: { [k]: s[k] } }, st => { st.mktPro.settings[k] = s[k]; }, { sound: null }).then(inject);
};
if (S() && SESS) render(true);
})();
