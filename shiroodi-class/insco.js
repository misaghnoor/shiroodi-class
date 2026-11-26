/* insco.js — رابط کاربری فدراسیون بیمهٔ کلاس */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ICO_PERILS || typeof navItems !== 'function') return;
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, iranISO = C.iranISO;
const PER = C.ICO_PERILS;
const IC = { tab: '' };
const ico = () => S().insCo || {};
const co = () => ico().co;
const stt = c => ({ pending_co: ['🏢 در انتظار مدیر شرکت', '#f59e0b'], pending_central: ['🏛️ در انتظار بیمهٔ مرکزی', '#7c3aed'], paid: ['💰 پرداخت شد', '#16a34a'], rejected: ['✖️ رد شد', '#e11d48'] })[c] || ['—', '#7b7261'];
const CSS = `.ic-fund{background:linear-gradient(135deg,#065f46,#0d9488 55%,#34d399);color:#fff;border-radius:20px;padding:18px;position:relative;overflow:hidden;box-shadow:0 18px 40px -18px rgba(6,95,70,.7)}
.ic-fund::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.12) 0 2px,transparent 2px 14px)}
.ic-fund>*{position:relative;z-index:2}.ic-fund b{font-family:var(--display);font-weight:400}
.ic-co{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow);overflow:hidden}
.ic-co::before{content:'';position:absolute;top:0;bottom:0;right:0;width:5px;background:var(--cc,#0d9488)}
.ic-step{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--overlay)}
.ic-step button{border:none;background:var(--surface2);width:34px;height:36px;font-size:1rem;font-weight:800;color:var(--ink)}
.ic-step b{min-width:48px;text-align:center;font-family:var(--display);font-size:1.05rem;font-weight:400}
.ic-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.ic-row:last-child{border:none}
@media (max-width:760px){.ic-row .n{min-width:100%;order:-1}}`;
if (!document.getElementById('icStyles')) { const s = document.createElement('style'); s.id = 'icStyles'; s.textContent = CSS; document.head.appendChild(s); }

/* ---------- کارت‌ها ---------- */
function claimRow(c, mode) {
  const st = S(), s = stuById(st, c.sid), sp = stt(c.status);
  return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1;min-width:150px"><b class="small">${esc(s ? s.name : '')}</b> — ${esc(c.label)}
    <div class="small muted">${jShort(iranISO(new Date(c.at)))}${c.note ? ' • 💬 ' + esc(c.note) : ''}${c.payout ? ' • زیان ' + fa(c.loss) + ' − فرانشیز ' + fa(c.ded || 0) + ' → پرداخت ' + fa(c.payout) : ''}</div></div>
    <span class="gr-pill" style="--pc:${sp[1]}">${sp[0]}</span>
    ${mode === 'co' && c.status === 'pending_co' ? `<button type="button" class="btn ok sm" data-act="icOk" data-id="${c.id}">✅ تأیید</button><button type="button" class="btn warn sm" data-act="icNo" data-id="${c.id}">✖️ رد</button>` : ''}
    ${mode === 'central' && c.status === 'pending_central' ? `<button type="button" class="btn ok sm" data-act="icCOk" data-id="${c.id}">✅ پرداخت مرکزی</button><button type="button" class="btn warn sm" data-act="icCNo" data-id="${c.id}">✖️ وتو</button>` : ''}</div>`;
}
function coCard(c, extra) {
  const st = S(), g2 = (st.groups || []).find(x => x.id === c.gid) || {};
  const lr = c.premiumsIn ? Math.round(c.claimsPaid / c.premiumsIn * 100) : 0;
  return `<div class="ic-co" style="--cc:${c.color || '#0d9488'}">
    <div class="spread"><div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${c.color || '#0d9488'}">🏢</span>
      <div><b class="small">${esc(c.name)}</b><div class="small muted">مدیر: ${esc(c.leaderName || ((stuById(st, g2.leader) || {}).name || '—'))} • ${fa((c.enrolled || []).length)} عضو از ${fa((c.members || []).length)}</div></div></div>
      <span class="gr-pill" style="--pc:${c.debt > 0 ? '#e11d48' : c.fund < 5 ? '#f59e0b' : '#16a34a'}">${c.debt > 0 ? '⚠️ بدهکار' : c.fund < 5 ? '🟡 ذخیرهٔ کم' : '🟢 سالم'}</span></div>
    <div class="row mt" style="gap:6px;flex-wrap:wrap"><span class="chip">🏦 fund ${fa(c.fund)}</span><span class="chip">📥 حق بیمه/هفته ${fa(c.premium)}</span><span class="chip">🧾 فرانشیز ${fa(c.deductible)}</span><span class="chip">🛡️ پوشش ${fa(c.coverage)}٪</span><span class="chip">🏛️ اتکایی ${fa(c.cession)}٪</span><span class="chip">📊 نسبت خسارت ${fa(lr)}٪</span>${c.debt ? `<span class="chip" style="color:#e11d48">بدهی ${fa(c.debt)}</span>` : ''}</div>
    ${extra || ''}</div>`;
}
/* ---------- نمای معلم ---------- */
function tView() {
  const ic = ico(), st = S();
  const queue = (ic.claims || []).filter(c => c.status === 'pending_central');
  const tab = IC.tab || 'companies';
  const tabs = [['companies', '🏢 شرکت‌ها', (ic.cos || []).length], ['claims', '🏛️ صف مرکزی', queue.length], ['pool', '🤝 صندوق کلاسی'], ['settings', '⚙️ قواعد مرکزی']];
  let body = '';
  if (tab === 'companies') body = `<div class="grid g2" style="gap:12px;align-items:start">${(ic.cos || []).map(c => coCard(c, `<div class="row mt"><button type="button" class="btn soft sm" data-act="icInspect" data-id="${c.id}">🔍 بررسی نرخ‌ها</button></div>`)).join('') || empty('🏢', 'شرکتی نیست', '')}</div>`;
  else if (tab === 'claims') body = `<div class="mk-box"><div class="spread mb"><b>🏛️ خسارت‌های در انتظار بیمهٔ مرکزی (${fa(queue.length)})</b><span class="chip">سهم اتکایی از صندوق مرکزی پرداخت می‌شود</span></div>
    ${queue.length ? queue.map(c => claimRow(c, 'central')).join('') : empty('🕊️', 'موردی در صف مرکزی نیست', '')}
    <div class="divider"></div><b class="small mb" style="display:block">📜 همهٔ خسارت‌ها</b>
    <div class="mk-scroll">${(ic.claims || []).slice().reverse().slice(0, 30).map(c => claimRow(c, '')).join('') || '<p class="small muted">خسارتی ثبت نشده.</p>'}</div></div>`;
  else if (tab === 'pool') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="ic-fund"><b style="font-size:.85rem">🤝 صندوق همبستگی کلاس</b><br><b style="font-size:2.2rem">${fa(ic.poolFund || 0)} 🪙</b>
      <div class="row mt" style="gap:6px;font-size:.8rem"><span>کمک‌های داده‌شده: <b>${fa((ic.classPool && ic.classPool.given) || 0)}</b></span></div>
      <p class="small mt" style="opacity:.9">منبع: ۵٪ از حق بیمهٔ همهٔ شرکت‌ها. مصرف: کمک اضطراری به دانش‌آموزی که شرکتش نتوانسته حمایت کند.</p>
      <button type="button" class="btn sm mt" style="background:rgba(255,255,255,.25)" data-act="icPoolGive">🤝 کمک اضطراری به یک دانش‌آموز</button></div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 تاریخچهٔ صندوق</b>
      <div class="mk-scroll">${((ic.classPool && ic.classPool.events) || []).slice().reverse().map(e => `<div class="ic-row">${avHTML(stuById(st, e.sid), 'sm')}<div class="n" style="flex:1">${esc((stuById(st, e.sid) || {}).name || '')}<div class="small muted">${esc(e.note || '')}</div></div><span class="chip" style="color:#16a34a">+${fa(e.amount)}</span></div>`).join('') || '<p class="small muted">هنوز کمکی داده نشده.</p>'}</div></div></div>`;
  else body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🏛️ بیمهٔ مرکزی (نقش تو)</b>
      <div class="ic-fund mb"><b style="font-size:.85rem">صندوق مرکزی</b><br><b style="font-size:2rem">${fa(ic.centralFund || 0)} 🪙</b>
        <div class="row mt" style="gap:6px;font-size:.8rem"><span>دریافتی اتکایی: <b>${fa((ic.central && ic.central.received) || 0)}</b></span><span>پرداختی: <b>${fa((ic.central && ic.central.paid) || 0)}</b></span></div></div>
      <button type="button" class="btn soft sm" data-act="icCollect">🔄 جمع‌آوری دستی حق بیمه‌ها</button>
      <p class="small muted mt">هر شرکت درصدی از ریسکش را به مرکزی می‌سپارد (cession) و بابتش حق اتکایی می‌دهد؛ خسارت‌های بزرگ سهم مرکزی دارند.</p></div>
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد مرکزی (محدودیت شرکت‌ها)</b>
      ${[['cessionFee', 'حق اتکایی (٪ از حق بیمه‌ها)'], ['classLevy', 'عوارض صندوق کلاسی (٪)'], ['claimCap', 'سقف هر خسارت (سکه)'], ['noClaimBonus', 'تخفیف بدون خسارت (٪)'], ['premMax', 'سقف حق بیمهٔ هفتگی'], ['dedMax', 'سقف فرانشیز'], ['covMax', 'سقف پوشش (٪)'], ['cessionMax', 'سقف سپردن به مرکزی (٪)']].map(([k, l]) => `<div class="srow"><span class="s-lbl">${l}</span><span class="ic-step"><button type="button" data-act="icSet" data-k="${k}" data-d="-1">−</button><b id="icS_${k}">${fa((ic.settings || {})[k] || 0)}</b><button type="button" data-act="icSet" data-k="${k}" data-d="1">+</button></span></div>`).join('')}</div></div>`;
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏛️ فدراسیون بیمهٔ کلاس</h1>
    <p>هر گروه یک شرکت بیمه است؛ سرگروه مدیر آن است و تو بیمهٔ مرکزی و ناظر. فرانشیز، پوشش و اتکایی یعنی درس واقعی بیمه.</p>
    <div class="gr-quick"><span class="q">🏢 <b>${fa((ic.cos || []).length)}</b> شرکت</span><span class="q">🏛️ <b>${fa(ic.centralFund || 0)}</b> مرکزی</span><span class="q">🤝 <b>${fa(ic.poolFund || 0)}</b> صندوق</span><span class="q">⏳ <b>${fa(queue.length)}</b> در صف تو</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
/* ---------- نمای سرگروه / عضو ---------- */
function myView() {
  const v = ico(), c = co(), st = S();
  if (!c) return `<div class="gr"><div class="gr-hero"><h1>🏛️ بیمهٔ کلاس</h1></div><div class="card">${empty('🏢', 'گروهی نداری', 'برای عضویت در بیمهٔ گروهی باید عضو یک گروه باشی.')}</div></div>`;
  const tab = IC.tab || 'myco';
  const tabs = v.isLeader ? [['myco', '🏢 شرکت من'], ['queue', '📥 صف بررسی', (v.queue || []).length], ['members', '👥 اعضا']]
    : [['myco', '🏢 شرکت گروه من'], ['coverage', '🛡️ پوشش من'], ['claim', '📝 ثبت خسارت', (v.eligible || []).length], ['history', '📜 پرونده‌های من']];
  let body = '';
  if (tab === 'myco') {
    body = coCard(c, v.isLeader ? `<div class="divider"></div><b class="small mb" style="display:block">⚙️ نرخ‌های شرکت (تصمیم مدیر)</b>
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <span class="small bold">حق بیمه/هفته</span><span class="ic-step"><button type="button" data-act="icCo" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCo" data-k="premium" data-d="1">+</button></span>
        <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCo" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCo" data-k="deductible" data-d="1">+</button></span>
        <span class="small bold">پوشش٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCo" data-k="coverage" data-d="5">+</button></span>
        <span class="small bold">سپردن به مرکزی٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="cession" data-d="-5">−</button><b>${fa(c.cession)}</b><button type="button" data-act="icCo" data-k="cession" data-d="5">+</button></span></div>
      <p class="small muted mt">💡 فرانشیز بیشتر → حق بیمه منصفانه‌تر ولی عضو در خسارت کوچک سهم دارد. سپردن بیشتر به مرکزی → امنیت بیشتر ولی حق اتکایی بیشتر. این‌ها همان تصمیم‌های یک مدیر بیمهٔ واقعی‌اند.</p>` : '');
    if (!v.isLeader && !v.enrolled) body += `<div class="card mt"><div class="spread"><div><b class="small">عضو شرکت بیمهٔ گروهت شو</b><div class="small muted">هفته‌ای ${fa(c.premium)} سکه حق بیمه؛ در برابر تکلیف جاافتاده به دلیل بیماری، دیرکرد با عذر و جاماندن از آزمون پوشش می‌گیری.</div></div>
      <button type="button" class="btn" data-act="icEnroll">🛡️ عضو می‌شوم</button></div></div>`;
    if (!v.isLeader && v.enrolled) body += `<div class="card mt"><div class="spread"><div><b class="small">عضویت فعال</b><div class="small muted">اگر خارج شوی تا پایان هفته پوشش نداری.</div></div><button type="button" class="btn ghost sm" data-act="icLeave">↩️ خروج از بیمه</button></div></div>`;
  } else if (tab === 'queue') body = `<div class="mk-box"><b class="small mb" style="display:block">📥 خسارت‌های اعضا در انتظار بررسی تو (${fa((v.queue || []).length)})</b>
    ${(v.queue || []).length ? (v.queue || []).map(x => claimRow(x, 'co')).join('') : empty('🕊️', 'موردی نیست', '')}
    <p class="small muted mt">⚖️ بررسی کن: آیا رویداد واقعاً موجه بوده؟ تأیید تو یعنی پرداخت از fund شرکت (+ سهم مرکزی).</p></div>`;
  else if (tab === 'members') body = `<div class="mk-box"><b class="small mb" style="display:block">👥 اعضای شرکت</b>
    ${(c.members || []).map(m => { const s = stuById(st, m), en = (c.enrolled || []).includes(m); return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1">${esc(s ? s.name : '')}${(st.groups || []).find(g2 => g2.id === c.gid)?.leader === m ? ' <span class="chip">🏅 مدیر</span>' : ''}</div>${en ? '<span class="gr-pill" style="--pc:#16a34a">🛡️ عضو بیمه</span>' : '<span class="gr-pill" style="--pc:#7b7261">عضو نیست</span>'}${(c.arrears || {})[m] ? `<span class="chip" style="color:#e11d48">${fa(c.arrears[m])} هفته عقب</span>` : ''}</div>`; }).join('')}</div>`;
  else if (tab === 'coverage') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🛡️ بیمه‌نامهٔ من</b>
      ${v.policy ? `<div class="ic-row"><span class="gr-ico" style="--kc:#0d9488">🎫</span><div class="n" style="flex:1">${esc(c.name)}<div class="small muted">از ${jShort(v.policy.since || todayISO())}</div></div><span class="gr-pill" style="--pc:#16a34a">فعال</span></div>
      <div class="row mt" style="gap:6px"><span class="chip">فرانشیز من: ${fa(c.deductible)} 🪙</span><span class="chip">پوشش: ${fa(c.coverage)}٪</span><span class="chip">سقف خسارت: ${fa((ico().settings || {}).claimCap || 12)}</span></div>
      <div class="gr-note mt">🧾 فرانشیز یعنی در هر خسارت، اول ${fa(c.deductible)} سکه را خودت می‌دهی و بقیه را بیمه — این باعث می‌شود مراقب باشی و حق بیمه هم ارزان‌تر بماند.</div>` : '<p class="small muted">عضو نیستی؛ از تب «شرکت گروه من» عضو شو.</p>'}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📚 ریسک‌های تحت پوشش</b>
      ${Object.entries(PER).map(([k, p]) => `<div class="ic-row"><span class="gr-ico" style="--kc:#0ea5e9;width:36px;height:36px">${p.i}</span><div class="n" style="flex:1">${p.l}<div class="small muted">ارزش زیان: حدود ${fa(p.loss(S()))} سکه</div></div></div>`).join('')}
      <p class="small muted mt">⚫ تخلف ارادی، تنبلی و دروغ تحت پوشش نیست — بیمه فقط برای اتفاق‌های غیرارادی است.</p></div></div>`;
  else if (tab === 'claim') body = `<div class="mk-box"><b class="small mb" style="display:block">📝 ثبت درخواست خسارت</b>
    ${(v.eligible || []).length ? (v.eligible || []).map(e => `<div class="ic-row"><span class="gr-ico" style="--kc:#f59e0b;width:36px;height:36px">${(PER[e.peril] || {}).i || '⚠️'}</span><div class="n" style="flex:1">${esc(e.label)}</div><button type="button" class="btn sm" data-act="icClaim" data-ref="${esc(e.ref)}">📝 ثبت خسارت</button></div>`).join('') : empty('🍀', 'رویداد واجد شرایطی نداری', 'یعنی اتفاق بدِ غیرارادی برایت نیفتاده — بهترین خبر برای یک بیمه‌گذار!')}
    <p class="small muted mt">💡 فقط رویدادهای موجه (غیبت مجاز، دیرکرد با عذر) قابل ثبت‌اند؛ هر رویداد یک بار.</p></div>`;
  else body = `<div class="mk-box"><b class="small mb" style="display:block">📜 پرونده‌های من (${fa((v.claims || []).length)})</b>
    ${(v.claims || []).length ? (v.claims || []).slice().reverse().map(x => claimRow(x, '')).join('') : empty('📭', 'پرونده‌ای نداری', '')}</div>`;
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏢 ${esc(c.name)}</h1>
    <p>${v.isLeader ? 'تو مدیر این شرکت بیمه‌ای: نرخ، فرانشیز و پوشش را طوری تنظیم کن که شرکت هم سالم بماند هم اعضا راضی.' : 'شرکت بیمهٔ گروه تو؛ با عضویت، ریسک‌های غیرارادی‌ات پوشش می‌گیرد.'}</p>
    <div class="gr-quick"><span class="q">🏦 <b>${fa(c.fund)}</b> fund</span><span class="q">👥 <b>${fa((c.enrolled || []).length)}</b> عضو</span><span class="q">📥 <b>${fa(c.premium)}</b>/هفته</span><span class="q">🧾 <b>${fa(c.deductible)}</b> فرانشیز</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
/* ---------- یکپارچه‌سازی ---------- */
const baseNav = navItems, baseRV = renderView;
navItems = function () { const items = baseNav(); const at = items.findIndex(x => x[0] === 'econ'); const e = ['insco', '🏛️', 'بیمهٔ کلاس']; if (at > -1) items.splice(at + 1, 0, e); else items.push(e); return items; };
renderView = function () {
  if (UI.section !== 'insco') return baseRV();
  try { document.getElementById('view').innerHTML = `<div class="ve">${isT() ? tView() : myView()}</div>`; }
  catch (e) { console.error('insco view', e); document.getElementById('view').innerHTML = `<div class="card">${empty('🛠️', 'خطا در نمایش بیمه', '', '<button type="button" class="btn" data-act="reload">بارگذاری مجدد</button>')}</div>`; }
};
/* ---------- اکشن‌ها ---------- */
ACT.icTab = el => { IC.tab = el.dataset.tab; renderView(); Sound.play('tap'); };
ACT.icEnroll = () => send('ico.enroll', { coId: co().id }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast('🛡️ عضو شرکت بیمهٔ گروهت شدی', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icLeave = () => confirmDlg({ title: '↩️ خروج از بیمه', body: 'تا عضویت دوباره پوشش نداری و حق بیمهٔ پرداخت‌شده برنمی‌گردد.', okText: 'خارج شو', onOk: () => send('ico.leave', { coId: co().id }, null, { msg: 'از بیمه خارج شدی' }).then(renderView) });
ACT.icCo = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = co(); const v = clamp((c[k] || 0) + d, 0, 100); send('ico.coSettings', { coId: c.id, [k]: v }, st => { const x = st.insCo.cos.find(y => y.id === c.id); if (x) x[k] = v; }, { sound: null }).then(renderView); };
ACT.icClaim = el => promptDlg({ title: '📝 ثبت خسارت', placeholder: 'توضیح کوتاه (چه اتفاقی افتاد؟)', onOk: note => send('ico.claim', { coId: co().id, ref: el.dataset.ref, note }, null, { sound: null }).then(r => { if (r) { Sound.play('ok'); toast('📝 پرونده ثبت شد؛ مدیر شرکت بررسی می‌کند', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icOk = el => send('ico.claimReview', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r !== undefined) { Sound.play('gavel'); toast('✅ تأیید شد؛ پرداخت انجام/به مرکزی رفت', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icNo = el => promptDlg({ title: '✖️ رد پرونده', placeholder: 'دلیل رد', onOk: note => send('ico.claimReview', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'پرونده رد شد', sound: 'err' }).then(renderView) });
ACT.icCOk = el => send('ico.claimCentral', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r !== undefined) { Sound.play('win'); toast('🏛️ مرکزی سهمش را پرداخت کرد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icCNo = el => promptDlg({ title: '✖️ وتوی مرکزی', placeholder: 'دلیل وتو', onOk: note => send('ico.claimCentral', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'وتو شد', sound: 'err' }).then(renderView) });
ACT.icInspect = el => { const c = (ico().cos || []).find(x => x.id === el.dataset.id); if (!c) return; openDrawer('🔍 ' + c.name, `<div class="row" style="gap:10px;flex-wrap:wrap">
  <span class="small bold">حق بیمه</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="1">+</button></span>
  <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="1">+</button></span>
  <span class="small bold">پوشش</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="5">+</button></span>
  <span class="small bold">اتکایی</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="cession" data-d="-5">−</button><b>${fa(c.cession)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="cession" data-d="5">+</button></span></div>
  <p class="small muted mt">👨‍🏫 به‌عنوان ناظر می‌توانی نرخ‌های نامعقول را اصلاح کنی.</p>`); };
ACT.icCoT = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = (ico().cos || []).find(x => x.id === el.dataset.id); const v = clamp((c[k] || 0) + d, 0, 100); send('ico.coSettings', { coId: c.id, [k]: v }, st => { const x = st.insCo.cos.find(y => y.id === c.id); if (x) x[k] = v; }, { sound: null }).then(() => { closeDrawer(); renderView(); }); };
ACT.icCollect = () => send('ico.collect', {}, null, { sound: null }).then(r => { if (r) { Sound.play('coin' in Sound ? 'coin' : 'win'); toast('🔄 حق بیمه‌های هفته جمع‌آوری شد', 'ok'); renderView(); } });
ACT.icPoolGive = () => promptDlg({ title: '🤝 کمک اضطراری صندوق کلاسی', placeholder: 'نام دانش‌آموز', onOk: name => { const s = (S().students || []).find(x => norm(x.name).includes(norm(name))); if (!s) return toast('دانش‌آموز پیدا نشد', 'err'); promptDlg({ title: 'مبلغ و دلیل', placeholder: 'مثلاً ۵ — کمک هزینهٔ کتاب', value: '۳', onOk: v2 => { const parts = String(v2).split('-'); send('ico.poolGive', { sid: s.id, amount: num(parts[0]) || 3, note: parts[1] || '' }, null, { sound: null }).then(r => { if (r) { Sound.play('win'); toast('🤝 ' + fa(r.amount) + ' سکه کمک شد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')); } }); } });
ACT.icSet = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = ico().settings || {}; const v = clamp((s[k] || 0) + d, 0, 100); send('ico.centralSettings', { patch: { [k]: v } }, st => { st.insCo.settings[k] = v; }, { sound: null }).then(() => { const b = document.getElementById('icS_' + k); if (b) b.textContent = fa(v); }); };
if (S() && SESS) render(true);
})();
