/* insco.js v2 — بیمهٔ کلاس با گردش سکه زنده */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ICO_PERILS || typeof navItems !== 'function') return;
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, iranISO = C.iranISO;
const PER = C.ICO_PERILS;
const IC = { tab: '' };
const ico = () => S().insCo || {};
const co = () => ico().co;
const snd = k => { try { Sound.play(k); } catch (e) {} };
const stt = c => ({ pending_co: ['🏢 در انتظار مدیر', '#f59e0b'], pending_central: ['🏛️ در انتظار مرکزی', '#7c3aed'], paid: ['💰 پرداخت شد', '#16a34a'], rejected: ['✖️ رد شد', '#e11d48'] })[c] || ['—', '#7b7261'];
const CSS = `.ic-fund{background:linear-gradient(135deg,#065f46,#0d9488 55%,#34d399);color:#fff;border-radius:20px;padding:18px;position:relative;overflow:hidden}
.ic-fund::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.12) 0 2px,transparent 2px 14px)}
.ic-fund>*{position:relative;z-index:2}.ic-fund b{font-family:var(--display);font-weight:400}
.ic-co{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);overflow:hidden}
.ic-co::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--cc,#0d9488)}
.ic-step{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.ic-step button{border:none;background:var(--surface2);width:34px;height:36px;font-size:1rem;font-weight:800;color:var(--ink)}
.ic-step b{min-width:48px;text-align:center;font-family:var(--display);font-size:1.05rem;font-weight:400}
.ic-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.ic-row:last-child{border:none}
.ic-flow{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px dashed var(--line);font-size:.8rem}
.ic-flow:last-child{border:none}
@media (max-width:760px){.ic-row .n{min-width:100%;order:-1}}`;
if (!document.getElementById('icStyles')) { const s = document.createElement('style'); s.id = 'icStyles'; s.textContent = CSS; document.head.appendChild(s); }

function claimRow(c, mode) {
  const st = S(), s = stuById(st, c.sid), sp = stt(c.status);
  return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1;min-width:150px"><b class="small">${esc(s ? s.name : '')}</b> — ${esc(c.label)}
    <div class="small muted">${jShort(iranISO(new Date(c.at)))}${c.payout ? ' • زیان ' + fa(c.loss) + ' − فرانشیز ' + fa(c.ded || 0) + ' → <b style="color:#16a34a">+' + fa(c.payout) + ' سکه</b>' : ''}</div></div>
    <span class="gr-pill" style="--pc:${sp[1]}">${sp[0]}</span>
    ${mode === 'co' && c.status === 'pending_co' ? `<button type="button" class="btn ok sm" data-act="icOk" data-id="${c.id}">✅ تأیید</button><button type="button" class="btn warn sm" data-act="icNo" data-id="${c.id}">✖️</button>` : ''}
    ${mode === 'central' && c.status === 'pending_central' ? `<button type="button" class="btn ok sm" data-act="icCOk" data-id="${c.id}">✅ پرداخت</button><button type="button" class="btn warn sm" data-act="icCNo" data-id="${c.id}">✖️</button>` : ''}</div>`;
}
function flowCard() {
  const v = ico();
  return `<div class="mk-box mt"><div class="spread mb"><b>🪙 گردش سکهٔ بیمهٔ من</b><span class="chip acc">موجودی الآن: ${fa(v.balance || 0)} 🪙</span></div>
    ${(v.myFlow || []).length ? (v.myFlow || []).map(f => `<div class="ic-flow"><span>${f.points > 0 ? '📥' : '📤'}</span><div style="flex:1">${esc(f.reason)}<div class="small muted">${jShort(f.date)}</div></div><b style="color:${f.points > 0 ? '#16a34a' : '#e11d48'}">${f.points > 0 ? '+' : ''}${fa(f.points)} 🪙</b></div>`).join('') : '<p class="small muted">هنوز تراکنش بیمه‌ای نداری؛ با عضویت، اولین کسر سکه همین‌جا ثبت می‌شود.</p>'}
    <p class="small muted mt">💡 این سکه‌ها همان سکهٔ فروشگاه و بورس‌اند — بیمه، کیف پول واحد کلاس را تغذیه و مصرف می‌کند.</p></div>`;
}
function coCard(c, extra) {
  const st = S(), g2 = (st.groups || []).find(x => x.id === c.gid) || {};
  const lr = c.premiumsIn ? Math.round(c.claimsPaid / c.premiumsIn * 100) : 0;
  return `<div class="ic-co" style="--cc:${c.color || '#0d9488'}">
    <div class="spread"><div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${c.color || '#0d9488'}">🏢</span>
      <div><b class="small">${esc(c.name)}</b><div class="small muted">مدیر: ${esc(c.leaderName || ((stuById(st, g2.leader) || {}).name || '—'))} • ${fa((c.enrolled || []).length)} عضو از ${fa((c.members || []).length)}</div></div></div>
      <span class="gr-pill" style="--pc:${c.debt > 0 ? '#e11d48' : c.fund < 5 ? '#f59e0b' : '#16a34a'}">${c.debt > 0 ? '⚠️ بدهکار' : c.fund < 5 ? '🟡 ذخیرهٔ کم' : '🟢 سالم'}</span></div>
    <div class="row mt" style="gap:6px;flex-wrap:wrap"><span class="chip">🏦 صندوق ${fa(c.fund)}</span><span class="chip">📥 حق بیمه ${fa(c.premium)}/هفته</span><span class="chip">🧾 فرانشیز ${fa(c.deductible)}</span><span class="chip">🛡️ پوشش ${fa(c.coverage)}٪</span><span class="chip">🏛️ اتکایی ${fa(c.cession)}٪</span><span class="chip">📊 نسبت خسارت ${fa(lr)}٪</span>${c.debt ? `<span class="chip" style="color:#e11d48">بدهی ${fa(c.debt)}</span>` : ''}</div>
    ${extra || ''}</div>`;
}
function tView() {
  const ic = ico(), st = S();
  const queue = (ic.claims || []).filter(c => c.status === 'pending_central');
  const tab = IC.tab || 'companies';
  const tabs = [['companies', '🏢 شرکت‌ها', (ic.cos || []).length], ['claims', '🏛️ صف مرکزی', queue.length], ['pool', '🤝 صندوق کلاسی'], ['settings', '⚙️ قواعد']];
  let body = '';
  if (tab === 'companies') body = `<div class="grid g2" style="gap:12px;align-items:start">${(ic.cos || []).map(c => coCard(c, `<div class="row mt"><button type="button" class="btn soft sm" data-act="icInspect" data-id="${c.id}">🔍 نرخ‌ها</button><button type="button" class="btn warn sm" data-act="icBail" data-id="${c.id}">🏦 تزریق سرمایه</button></div>`)).join('') || empty('🏢', 'شرکتی نیست', '')}</div>`;
  else if (tab === 'claims') body = `<div class="mk-box"><div class="spread mb"><b>🏛️ در انتظار مرکزی (${fa(queue.length)})</b></div>
    ${queue.length ? queue.map(c => claimRow(c, 'central')).join('') : empty('🕊️', 'موردی نیست', '')}
    <div class="divider"></div><b class="small mb" style="display:block">📜 همهٔ خسارت‌ها</b>
    <div class="mk-scroll">${(ic.claims || []).slice().reverse().slice(0, 30).map(c => claimRow(c, '')).join('') || '<p class="small muted">خسارتی ثبت نشده.</p>'}</div></div>`;
  else if (tab === 'pool') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="ic-fund"><b style="font-size:.85rem">🤝 صندوق همبستگی کلاس</b><br><b style="font-size:2.2rem">${fa(ic.poolFund || 0)} 🪙</b>
      <p class="small mt" style="opacity:.9">منبع: ۵٪ حق بیمهٔ شرکت‌ها • کمک اضطراری به دانش‌آموز</p>
      <button type="button" class="btn sm mt" style="background:rgba(255,255,255,.25)" data-act="icPoolGive">🤝 کمک اضطراری</button></div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 تاریخچه</b>
      <div class="mk-scroll">${((ic.classPool && ic.classPool.events) || []).slice().reverse().map(e => `<div class="ic-row">${avHTML(stuById(st, e.sid), 'sm')}<div class="n" style="flex:1">${esc((stuById(st, e.sid) || {}).name || '')}<div class="small muted">${esc(e.note || '')}</div></div><span class="chip" style="color:#16a34a">+${fa(e.amount)}</span></div>`).join('') || '<p class="small muted">کمکی داده نشده.</p>'}</div></div></div>`;
  else body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><div class="ic-fund mb"><b style="font-size:.85rem">🏛️ صندوق مرکزی</b><br><b style="font-size:2rem">${fa(ic.centralFund || 0)} 🪙</b>
      <div class="row mt" style="gap:6px;font-size:.8rem"><span>دریافتی: <b>${fa((ic.central && ic.central.received) || 0)}</b></span><span>پرداختی: <b>${fa((ic.central && ic.central.paid) || 0)}</b></span></div></div>
      <button type="button" class="btn soft sm" data-act="icCollect">🔄 جمع‌آوری حق بیمه‌های هفته</button></div>
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد مرکزی</b>
      ${[['cessionFee', 'حق اتکایی (٪)'], ['classLevy', 'عوارض صندوق کلاسی (٪)'], ['claimCap', 'سقف خسارت (سکه)'], ['noClaimBonus', 'تخفیف بدون خسارت (٪)'], ['premMax', 'سقف حق بیمه'], ['dedMax', 'سقف فرانشیز'], ['covMax', 'سقف پوشش (٪)'], ['cessionMax', 'سقف اتکایی (٪)']].map(([k, l]) => `<div class="srow"><span class="s-lbl">${l}</span><span class="ic-step"><button type="button" data-act="icSet" data-k="${k}" data-d="-1">−</button><b id="icS_${k}">${fa((ic.settings || {})[k] || 0)}</b><button type="button" data-act="icSet" data-k="${k}" data-d="1">+</button></span></div>`).join('')}</div></div>`;
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏛️ فدراسیون بیمهٔ کلاس</h1>
    <p>هر گروه یک شرکت بیمه؛ سرگروه مدیر، تو بیمهٔ مرکزی. هر پرداخت و خسارت، سکهٔ واقعی کلاس را جابه‌جا می‌کند.</p>
    <div class="gr-quick"><span class="q">🏢 <b>${fa((ic.cos || []).length)}</b> شرکت</span><span class="q">🏛️ <b>${fa(ic.centralFund || 0)}</b> مرکزی</span><span class="q">🤝 <b>${fa(ic.poolFund || 0)}</b> صندوق</span><span class="q">⏳ <b>${fa(queue.length)}</b> در صف</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
function myView() {
  const v = ico(), c = co(), st = S();
  if (!c) return `<div class="gr"><div class="gr-hero"><h1>🏛️ بیمهٔ کلاس</h1></div><div class="card">${empty('🏢', 'گروهی نداری', 'برای بیمهٔ گروهی باید عضو یک گروه باشی.')}</div></div>`;
  const tab = IC.tab || 'myco';
  const tabs = v.isLeader ? [['myco', '🏢 شرکت من'], ['queue', '📥 صف بررسی', (v.queue || []).length], ['members', '👥 اعضا'], ['flow', '🪙 گردش سکه']]
    : [['myco', '🏢 شرکت گروه'], ['coverage', '🛡️ پوشش من'], ['claim', '📝 ثبت خسارت', (v.eligible || []).length], ['history', '📜 پرونده‌ها'], ['flow', '🪙 گردش سکه']];
  let body = '';
  if (tab === 'myco') {
    let extra = '';
    if (v.isLeader) {
      extra = `<div class="divider"></div><div class="spread mb"><b class="small">⚙️ نرخ‌های شرکت</b>${v.suggested ? `<button type="button" class="btn ai sm" data-act="icSug">🧮 نرخ پیشنهادی بر اساس ریسک: ${fa(v.suggested)}</button>` : ''}</div>
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <span class="small bold">حق بیمه</span><span class="ic-step"><button type="button" data-act="icCo" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCo" data-k="premium" data-d="1">+</button></span>
        <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCo" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCo" data-k="deductible" data-d="1">+</button></span>
        <span class="small bold">پوشش٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCo" data-k="coverage" data-d="5">+</button></span>
        <span class="small bold">اتکایی٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="cession" data-d="-5">−</button><b>${fa(c.cession)}</b><button type="button" data-act="icCo" data-k="cession" data-d="5">+</button></span></div>
      <p class="small muted mt">💡 نرخ پیشنهادی از ریسک واقعی اعضا (غیبت موجه، دیرکرد، جاماندن آزمون) محاسبه می‌شود.</p>`;
    }
    body = coCard(c, extra);
    if (!v.enrolled) body += `<div class="card mt"><div class="spread"><div><b class="small">🛡️ عضویت + پرداخت اولین حق بیمه</b><div class="small muted">${fa(c.premium)} سکه همین الان از کیف پولت کم می‌شود و رسیدش در «گردش سکه» می‌آید.</div></div>
      <button type="button" class="btn" data-act="icEnroll">🛡️ عضو می‌شوم (−${fa(c.premium)} 🪙)</button></div></div>`;
    else body += `<div class="card mt"><div class="spread"><div><b class="small">${v.paidThisWeek ? '✅ حق بیمهٔ این هفته پرداخت شده' : '⏳ حق بیمهٔ این هفته پرداخت نشده'}</b><div class="small muted">موجودی تو: ${fa(v.balance || 0)} 🪙</div></div>
      <div class="row">${!v.paidThisWeek ? `<button type="button" class="btn warn" data-act="icPay">💸 پرداخت الآن (−${fa(c.premium)} 🪙)</button>` : ''}<button type="button" class="btn ghost sm" data-act="icLeave">↩️ خروج</button></div></div></div>`;
    body += flowCard();
  } else if (tab === 'queue') body = `<div class="mk-box"><b class="small mb" style="display:block">📥 در انتظار بررسی تو (${fa((v.queue || []).length)})</b>
    ${(v.queue || []).length ? (v.queue || []).map(x => claimRow(x, 'co')).join('') : empty('🕊️', 'موردی نیست', '')}
    <p class="small muted mt">⚖️ تأیید تو = پرداخت از صندوق شرکت (+سهم مرکزی) + ۱ امتیاز مدیریتی برای خودت + فریز استریک برای عضو.</p></div>`;
  else if (tab === 'members') body = `<div class="mk-box"><b class="small mb" style="display:block">👥 اعضا</b>
    ${(c.members || []).map(m => { const s = stuById(st, m), en = (c.enrolled || []).includes(m); return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1">${esc(s ? s.name : '')}</div>${en ? '<span class="gr-pill" style="--pc:#16a34a">🛡️ عضو</span>' : '<span class="gr-pill" style="--pc:#7b7261">عضو نیست</span>'}${(c.arrears || {})[m] ? `<span class="chip" style="color:#e11d48">${fa(c.arrears[m])} هفته عقب</span>` : ''}</div>`; }).join('')}</div>`;
  else if (tab === 'coverage') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🛡️ بیمه‌نامهٔ من</b>
      ${v.policy ? `<div class="row" style="gap:6px"><span class="chip">فرانشیز ${fa(c.deductible)} 🪙</span><span class="chip">پوشش ${fa(c.coverage)}٪</span><span class="chip">سقف ${fa((ico().settings || {}).claimCap || 12)}</span></div>
      <div class="gr-note mt">🧾 در هر خسارت، اول ${fa(c.deductible)} سکه را خودت می‌دهی؛ بقیه را بیمه. خسارت پرداخت‌شده = سکهٔ واقعی + ۱ فریز استریک + ۱۰ تجربه.</div>` : '<p class="small muted">عضو نیستی.</p>'}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📚 ریسک‌های تحت پوشش</b>
      ${Object.entries(PER).map(([k, p]) => `<div class="ic-row"><span class="gr-ico" style="--kc:#0ea5e9;width:36px;height:36px">${p.i}</span><div class="n" style="flex:1">${p.l}</div></div>`).join('')}
      <p class="small muted mt">⚫ تخلف ارادی و تنبلی تحت پوشش نیست.</p></div></div>`;
  else if (tab === 'claim') body = `<div class="mk-box"><b class="small mb" style="display:block">📝 ثبت خسارت</b>
    ${(v.eligible || []).length ? (v.eligible || []).map(e => `<div class="ic-row"><span class="gr-ico" style="--kc:#f59e0b;width:36px;height:36px">${(PER[e.peril] || {}).i || '⚠️'}</span><div class="n" style="flex:1">${esc(e.label)}</div><button type="button" class="btn sm" data-act="icClaim" data-ref="${esc(e.ref)}">📝 ثبت</button></div>`).join('') : empty('🍀', 'رویداد واجد شرایطی نداری', 'بهترین خبر برای یک بیمه‌گذار!')}</div>`;
  else if (tab === 'history') body = `<div class="mk-box"><b class="small mb" style="display:block">📜 پرونده‌ها (${fa((v.claims || []).length)})</b>
    ${(v.claims || []).length ? (v.claims || []).slice().reverse().map(x => claimRow(x, '')).join('') : empty('📭', 'پرونده‌ای نداری', '')}</div>`;
  else body = flowCard();
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏢 ${esc(c.name)}</h1>
    <p>${v.isLeader ? 'تو مدیر این شرکتی؛ نرخ‌ها را طوری بچین که شرکت سالم بماند و اعضا راضی.' : 'با عضویت، ریسک‌های غیرارادی‌ات پوشش می‌گیرد.'}</p>
    <div class="gr-quick"><span class="q">🏦 <b>${fa(c.fund)}</b> صندوق</span><span class="q">👥 <b>${fa((c.enrolled || []).length)}</b> عضو</span><span class="q">🪙 <b>${fa(v.balance || 0)}</b> موجودی من</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
const baseNav = navItems, baseRV = renderView;
navItems = function () { const items = baseNav(); const at = items.findIndex(x => x[0] === 'econ'); const e = ['insco', '🏛️', 'بیمهٔ کلاس']; if (at > -1) items.splice(at + 1, 0, e); else items.push(e); return items; };
renderView = function () {
  if (UI.section !== 'insco') return baseRV();
  try { document.getElementById('view').innerHTML = `<div class="ve">${isT() ? tView() : myView()}</div>`; }
  catch (e) { console.error('insco', e); document.getElementById('view').innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش بیمه', '', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`; }
};
ACT.icTab = el => { IC.tab = el.dataset.tab; renderView(); snd('tap'); };
ACT.icEnroll = () => send('ico.enroll', { coId: co().id }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🛡️ عضو شدی • −' + fa(r.premium) + ' سکه • موجودی: ' + fa(r.balance), 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icPay = () => send('ico.payNow', { coId: co().id }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('💸 حق بیمه پرداخت شد • −' + fa(r.premium) + ' سکه • موجودی: ' + fa(r.balance), 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icLeave = () => confirmDlg({ title: '↩️ خروج از بیمه', body: 'تا عضویت دوباره پوشش نداری.', okText: 'خارج شو', onOk: () => send('ico.leave', { coId: co().id }, null, { msg: 'خارج شدی' }).then(renderView) });
ACT.icCo = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = co(); send('ico.coSettings', { coId: c.id, [k]: (c[k] || 0) + d }, null, { sound: null }).then(renderView); };
ACT.icSug = () => send('ico.coSettings', { coId: co().id, premium: ico().suggested }, null, { msg: '🧮 نرخ پیشنهادی اعمال شد' }).then(renderView);
ACT.icClaim = el => promptDlg({ title: '📝 ثبت خسارت', placeholder: 'چه اتفاقی افتاد؟', onOk: note => send('ico.claim', { coId: co().id, ref: el.dataset.ref, note }, null, { sound: null }).then(r => { if (r) { snd('ok'); toast('📝 ثبت شد؛ مدیر بررسی می‌کند', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icOk = el => send('ico.claimReview', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r) { snd('gavel'); toast(r.status === 'paid' ? '💰 خسارت پرداخت شد: +' + fa(r.payout) + ' سکه به عضو' : '🏛️ به صف مرکزی رفت (سهم اتکایی)', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icNo = el => promptDlg({ title: '✖️ رد پرونده', placeholder: 'دلیل', onOk: note => send('ico.claimReview', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'رد شد', sound: 'err' }).then(renderView) });
ACT.icCOk = el => send('ico.claimCentral', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('💰 پرداخت شد: +' + fa(r.payout) + ' سکه به دانش‌آموز', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icCNo = el => promptDlg({ title: '✖️ وتوی مرکزی', placeholder: 'دلیل', onOk: note => send('ico.claimCentral', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'وتو شد', sound: 'err' }).then(renderView) });
ACT.icInspect = el => { const c = (ico().cos || []).find(x => x.id === el.dataset.id); if (!c) return; openDrawer('🔍 ' + c.name, `<div class="row" style="gap:10px;flex-wrap:wrap">
  <span class="small bold">حق بیمه</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="1">+</button></span>
  <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="1">+</button></span>
  <span class="small bold">پوشش</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="5">+</button></span></div>`); };
ACT.icCoT = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = (ico().cos || []).find(x => x.id === el.dataset.id); send('ico.coSettings', { coId: c.id, [k]: (c[k] || 0) + d }, null, { sound: null }).then(() => { closeDrawer(); renderView(); }); };
ACT.icBail = el => promptDlg({ title: '🏦 تزریق سرمایه از مرکزی', placeholder: 'مبلغ (سکه)', value: '۵', onOk: v => send('ico.bailout', { coId: el.dataset.id, amount: num(v) || 5 }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🏦 ' + fa(r.amount) + ' سکه تزریق شد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icCollect = () => send('ico.collect', {}, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🔄 حق بیمه‌های هفته جمع شد', 'ok'); renderView(); } });
ACT.icPoolGive = () => openDrawer('🤝 کمک اضطراری صندوق کلاسی', `<form data-form="icPool">
  <div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid">${(S().students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
  <div class="field"><label class="lbl">مبلغ (سکه)</label><input class="input" data-fa inputmode="numeric" name="amount" value="۳"></div>
  <div class="field"><label class="lbl">دلیل</label><input class="input" name="note" placeholder="مثلاً کمک هزینهٔ کتاب"></div>
  <button class="btn" type="submit" style="width:100%">🤝 پرداخت از صندوق</button></form>`);
FORM.icPool = form => { const fd = new FormData(form); send('ico.poolGive', { sid: fd.get('sid'), amount: num(fd.get('amount')) || 3, note: String(fd.get('note') || '') }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🤝 +' + fa(r.amount) + ' سکه به دانش‌آموز • موجودی: ' + fa(r.balance), 'ok', null, 7000); closeDrawer(); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')); };
ACT.icSet = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = ico().settings || {}; const v = Math.max(0, Math.min(100, (s[k] || 0) + d)); send('ico.centralSettings', { patch: { [k]: v } }, null, { sound: null }).then(() => { const b = document.getElementById('icS_' + k); if (b) b.textContent = fa(v); }); };
if (S() && SESS) render(true);
})();
