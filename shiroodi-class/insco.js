/* insco.js v3 — دفتر شفاف، سهم شرکت در مرکزی، بیمهٔ موردی، قفل پرداخت تکراری */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || !C.ICO_PERILS || typeof navItems !== 'function') return;
const fa = C.fa, faNum = C.faNum, jShort = C.jShort, iranISO = C.iranISO;
const PER = C.ICO_PERILS;
const IC = { tab: '', led: 'all' };
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
.ic-split{display:flex;gap:4px;flex-wrap:wrap;font-size:.68rem;font-weight:800}
.ic-split span{border-radius:99px;padding:2px 8px}
@media (max-width:760px){.ic-row .n{min-width:100%;order:-1}}`;
if (!document.getElementById('icStyles3')) { const s = document.createElement('style'); s.id = 'icStyles3'; s.textContent = CSS; document.head.appendChild(s); }
const splitChips = l => `<span class="ic-split"><span style="background:#d1fae5;color:#065f46">شرکت ${fa(l.net || 0)}</span><span style="background:#ede9fe;color:#5b21b6">مرکزی ${fa(l.central || 0)}</span><span style="background:#fef3c7;color:#92400e">صندوق ${fa(l.levy || 0)}</span></span>`;

function claimRow(c, mode) {
  const st = S(), s = stuById(st, c.sid), sp = stt(c.status);
  return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1;min-width:150px"><b class="small">${esc(s ? s.name : '')}</b> — ${esc(c.label)}
    <div class="small muted">${jShort(iranISO(new Date(c.at)))}${c.payout ? ' • زیان ' + fa(c.loss) + ' − فرانشیز ' + fa(c.ded || 0) + ' → <b style="color:#16a34a">+' + fa(c.payout) + '</b> (شرکت ' + fa(c.coShare || 0) + ' / مرکزی ' + fa(c.ceShare || 0) + ')' : ''}</div></div>
    <span class="gr-pill" style="--pc:${sp[1]}">${sp[0]}</span>
    ${mode === 'co' && c.status === 'pending_co' ? `<button type="button" class="btn ok sm" data-act="icOk" data-id="${c.id}">✅</button><button type="button" class="btn warn sm" data-act="icNo" data-id="${c.id}">✖️</button>` : ''}
    ${mode === 'central' && c.status === 'pending_central' ? `<button type="button" class="btn ok sm" data-act="icCOk" data-id="${c.id}">✅ پرداخت</button><button type="button" class="btn warn sm" data-act="icCNo" data-id="${c.id}">✖️</button>` : ''}</div>`;
}
function ledgerRows(list) {
  const st = S();
  const icon = { premium: '📥', micro: '🎯', claim: '🛡️', bailout: '🏦', drop: '⚠️' };
  return list.map(l => `<div class="ic-row"><span style="font-size:1.1rem">${icon[l.kind] || '•'}</span>
    <div class="n" style="flex:1;min-width:140px"><b class="small">${esc((stuById(st, l.sid) || {}).name || (l.kind === 'bailout' ? 'مرکزی' : '—'))}</b> ${esc(l.note || '')}
      <div class="small muted">${jShort(iranISO(new Date(l.at)))} • هفته ${jShort(l.week || '')}</div></div>
    ${l.gross ? splitChips(l) : ''}<b style="color:${l.amount >= 0 ? '#16a34a' : '#e11d48'}">${l.amount >= 0 ? '+' : ''}${fa(l.amount)} 🪙</b></div>`).join('');
}
function flowCard() {
  const v = ico();
  return `<div class="mk-box mt"><div class="spread mb"><b>🪙 گردش شفاف سکهٔ من</b><span class="chip acc">موجودی: ${fa(v.balance || 0)} 🪙</span></div>
    ${(v.myLedger || []).length ? ledgerRows(v.myLedger || []) : '<p class="small muted">هنوز تراکنشی نداری.</p>'}
    <p class="small muted mt">💡 هر پرداخت سه‌شقه می‌شود: صندوق شرکت + بیمهٔ مرکزی + صندوق همبستگی کلاس. این همان سکهٔ فروشگاه و بورس است.</p></div>`;
}
function weeksTable(c) {
  const ws = Object.keys(c.weeks || {}).sort().reverse().slice(0, 8);
  if (!ws.length) return '<p class="small muted">هنوز پرداختی ثبت نشده.</p>';
  return `<div class="tw"><table class="tbl"><thead><tr><th>هفته</th><th>کل دریافتی</th><th>شرکت</th><th>مرکزی</th><th>صندوق کلاس</th><th>اعضا</th></tr></thead><tbody>
    ${ws.map(w => { const b = c.weeks[w]; return `<tr><td>${jShort(w)}</td><td><b>${fa(b.gross)}</b></td><td style="color:#065f46">${fa(b.net)}</td><td style="color:#5b21b6">${fa(b.central)}</td><td style="color:#92400e">${fa(b.levy)}</td><td>${fa(Object.keys(b.members || {}).length)} نفر</td></tr>`; }).join('')}</tbody></table></div>`;
}
function coCard(c, extra) {
  const st = S(), g2 = (st.groups || []).find(x => x.id === c.gid) || {};
  const lr = c.premiumsIn ? Math.round(c.claimsPaid / c.premiumsIn * 100) : 0;
  return `<div class="ic-co" style="--cc:${c.color || '#0d9488'}">
    <div class="spread"><div class="row" style="gap:9px"><span class="gr-ico" style="--kc:${c.color || '#0d9488'}">🏢</span>
      <div><b class="small">${esc(c.name)}</b><div class="small muted">مدیر: ${esc(c.leaderName || ((stuById(st, g2.leader) || {}).name || '—'))} • ${fa((c.enrolled || []).length)} عضو</div></div></div>
      <span class="gr-pill" style="--pc:${c.debt > 0 ? '#e11d48' : c.fund < 5 ? '#f59e0b' : '#16a34a'}">${c.debt > 0 ? '⚠️ بدهکار' : c.fund < 5 ? '🟡 ذخیرهٔ کم' : '🟢 سالم'}</span></div>
    <div class="row mt" style="gap:6px;flex-wrap:wrap"><span class="chip">🏦 صندوق ${fa(c.fund)}</span><span class="chip">📥 ${fa(c.premium)}/هفته</span><span class="chip">🧾 فرانشیز ${fa(c.deductible)}</span><span class="chip">🛡️ ${fa(c.coverage)}٪</span><span class="chip">🏛️ اتکایی ${fa(c.cession)}٪</span><span class="chip">📊 خسارت ${fa(lr)}٪</span>${c.centralIn != null ? `<span class="chip" style="color:#5b21b6">سهم در مرکزی: +${fa(c.centralIn)} / −${fa(c.centralOut)}</span>` : ''}</div>
    ${extra || ''}</div>`;
}
function tView() {
  const ic = ico(), st = S();
  const queue = (ic.claims || []).filter(c => c.status === 'pending_central');
  const tab = IC.tab || 'companies';
  const tabs = [['companies', '🏢 شرکت‌ها'], ['central', '🏛️ مرکزی'], ['ledger', '📒 دفتر شفاف'], ['pool', '🤝 صندوق کلاس'], ['settings', '⚙️ قواعد']];
  let body = '';
  if (tab === 'companies') body = `<div class="grid g2" style="gap:12px;align-items:start">${(ic.cos || []).map(c => coCard(c, `<div class="row mt"><button type="button" class="btn soft sm" data-act="icInspect" data-id="${c.id}">🔍 نرخ‌ها</button><button type="button" class="btn warn sm" data-act="icBail" data-id="${c.id}">🏦 تزریق</button><button type="button" class="btn ghost sm" data-act="icWeeks" data-id="${c.id}">📅 گزارش هفته‌ها</button></div>`)).join('')}</div>`;
  else if (tab === 'central') body = `<div class="ic-fund mb"><div class="spread"><div><b style="font-size:.85rem">🏛️ صندوق بیمهٔ مرکزی</b><br><b style="font-size:2.2rem">${fa(ic.centralFund || 0)} 🪙</b></div>
    <div style="text-align:left;font-size:.8rem;line-height:2"><span>دریافتی: <b>${fa((ic.central || {}).received || 0)}</b></span><br><span>پرداختی: <b>${fa((ic.central || {}).paid || 0)}</b></span></div></div>
    <p class="small mt" style="opacity:.9">هر حق بیمه همان لحظه ${fa((ic.settings || {}).cessionFee || 20)}٪ به مرکزی می‌آید (گرد کردن تجمعی). جدول زیر سهم هر شرکت را نشان می‌دهد.</p></div>
    <div class="mk-box"><b class="small mb" style="display:block">🏢 سهم هر شرکت در مرکزی</b>
    <div class="tw"><table class="tbl"><thead><tr><th>شرکت</th><th>واریز به مرکزی</th><th>دریافت از مرکزی</th><th>خالص</th><th>صندوق شرکت</th><th></th></tr></thead><tbody>
    ${(ic.cos || []).map(c => `<tr><td><b class="small">${esc(c.name)}</b></td><td style="color:#5b21b6">+${fa(c.centralIn || 0)}</td><td style="color:#e11d48">−${fa(c.centralOut || 0)}</td><td><b>${fa((c.centralIn || 0) - (c.centralOut || 0))}</b></td><td>${fa(c.fund)}</td><td><button type="button" class="btn warn sm" data-act="icBail" data-id="${c.id}">🏦</button></td></tr>`).join('')}</tbody></table></div>
    <div class="divider"></div><b class="small mb" style="display:block">⏳ در انتظار مرکزی (${fa(queue.length)})</b>${queue.length ? queue.map(c => claimRow(c, 'central')).join('') : '<p class="small muted">موردی نیست.</p>'}</div>`;
  else if (tab === 'ledger') {
    const kinds = [['all', 'همه'], ['premium', '📥 حق بیمه'], ['micro', '🎯 موردی'], ['claim', '🛡️ خسارت'], ['bailout', '🏦 تزریق']];
    const list = (ic.ledger || []).slice().reverse().filter(l => IC.led === 'all' || l.kind === IC.led).slice(0, 60);
    body = `<div class="mk-box"><div class="row mb" style="gap:6px;flex-wrap:wrap">${kinds.map(([k, l]) => `<button type="button" class="btn sm ${IC.led === k ? '' : 'ghost'}" data-act="icLed" data-k="${k}">${l}</button>`).join('')}</div>${list.length ? ledgerRows(list) : empty('📒', 'رکوردی نیست', '')}</div>`;
  }
  else if (tab === 'pool') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="ic-fund"><b style="font-size:.85rem">🤝 صندوق همبستگی</b><br><b style="font-size:2.2rem">${fa(ic.poolFund || 0)} 🪙</b>
      <button type="button" class="btn sm mt" style="background:rgba(255,255,255,.25)" data-act="icPoolGive">🤝 کمک اضطراری</button></div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 تاریخچه</b>${((ic.classPool || {}).events || []).slice().reverse().map(e => `<div class="ic-row">${avHTML(stuById(st, e.sid), 'sm')}<div class="n" style="flex:1">${esc((stuById(st, e.sid) || {}).name || '')}<div class="small muted">${esc(e.note || '')}</div></div><span class="chip" style="color:#16a34a">+${fa(e.amount)}</span></div>`).join('') || '<p class="small muted">کمکی داده نشده.</p>'}</div></div>`;
  else body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><button type="button" class="btn soft sm" data-act="icCollect">🔄 جمع‌آوری حق بیمه‌های هفته</button>
      <p class="small muted mt">پرداخت تکراری یک هفته غیرممکن است: قفل دولایه روی بیمه‌نامه + رسید سکه.</p></div>
    <div class="mk-box"><b class="small mb" style="display:block">⚙️ قواعد</b>
      ${[['cessionFee', 'حق اتکایی (٪)'], ['classLevy', 'عوارض صندوق (٪)'], ['claimCap', 'سقف خسارت'], ['noClaimBonus', 'تخفیف بدون خسارت (٪)'], ['microMax', 'سقف بیمهٔ موردی'], ['premMax', 'سقف حق بیمه'], ['dedMax', 'سقف فرانشیز'], ['covMax', 'سقف پوشش (٪)']].map(([k, l]) => `<div class="srow"><span class="s-lbl">${l}</span><span class="ic-step"><button type="button" data-act="icSet" data-k="${k}" data-d="-1">−</button><b id="icS_${k}">${fa((ic.settings || {})[k] || 0)}</b><button type="button" data-act="icSet" data-k="${k}" data-d="1">+</button></span></div>`).join('')}</div></div>`;
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏛️ فدراسیون بیمهٔ کلاس</h1>
    <p>هر پرداخت همان لحظه سه‌شقه و شفاف ثبت می‌شود؛ سهم هر شرکت در مرکزی جداگانه دیده می‌شود.</p>
    <div class="gr-quick"><span class="q">🏢 <b>${fa((ic.cos || []).length)}</b> شرکت</span><span class="q">🏛️ <b>${fa(ic.centralFund || 0)}</b> مرکزی</span><span class="q">🤝 <b>${fa(ic.poolFund || 0)}</b> صندوق</span><span class="q">⏳ <b>${fa(queue.length)}</b> در صف</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
function myView() {
  const v = ico(), c = co(), st = S();
  if (!c) return `<div class="gr"><div class="gr-hero"><h1>🏛️ بیمهٔ کلاس</h1></div><div class="card">${empty('🏢', 'گروهی نداری', '')}</div></div>`;
  const tab = IC.tab || 'myco';
  const tabs = v.isLeader ? [['myco', '🏢 شرکت من'], ['queue', '📥 صف', (v.queue || []).length], ['members', '👥 اعضا'], ['report', '📅 گزارش'], ['flow', '🪙 گردش']]
    : [['myco', '🏢 شرکت'], ['micro', '🎯 بیمهٔ موردی', (v.microOptions || []).length], ['coverage', '🛡️ پوشش'], ['claim', '📝 خسارت', (v.eligible || []).length], ['history', '📜 پرونده‌ها'], ['flow', '🪙 گردش']];
  let body = '';
  if (tab === 'myco') {
    let extra = '';
    if (v.isLeader) extra = `<div class="divider"></div><div class="spread mb"><b class="small">⚙️ نرخ‌ها</b>${v.suggested ? `<button type="button" class="btn ai sm" data-act="icSug">🧮 پیشنهادی: ${fa(v.suggested)}</button>` : ''}</div>
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <span class="small bold">حق بیمه</span><span class="ic-step"><button type="button" data-act="icCo" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCo" data-k="premium" data-d="1">+</button></span>
        <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCo" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCo" data-k="deductible" data-d="1">+</button></span>
        <span class="small bold">پوشش٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCo" data-k="coverage" data-d="5">+</button></span>
        <span class="small bold">اتکایی٪</span><span class="ic-step"><button type="button" data-act="icCo" data-k="cession" data-d="-5">−</button><b>${fa(c.cession)}</b><button type="button" data-act="icCo" data-k="cession" data-d="5">+</button></span></div>`;
    body = coCard(c, extra);
    if (!v.enrolled) body += `<div class="card mt"><div class="spread"><div><b class="small">🛡️ عضویت + پرداخت اول</b><div class="small muted">${fa(c.premium)} سکه الآن کم می‌شود؛ رسید در «گردش».</div></div>
      <button type="button" class="btn" data-act="icEnroll">🛡️ عضو می‌شوم (−${fa(c.premium)} 🪙)</button></div></div>`;
    else body += `<div class="card mt"><div class="spread"><div><b class="small">${v.paidThisWeek ? '✅ حق بیمهٔ این هفته پرداخت شده' : '⏳ پرداخت نشده'}</b><div class="small muted">موجودی: ${fa(v.balance || 0)} 🪙</div></div>
      <div class="row">${!v.paidThisWeek ? `<button type="button" class="btn warn" data-act="icPay">💸 پرداخت (−${fa(c.premium)} 🪙)</button>` : '<span class="chip" style="color:#16a34a">🔒 قفل هفته فعال</span>'}<button type="button" class="btn ghost sm" data-act="icLeave">↩️ خروج</button></div></div></div>`;
    body += flowCard();
  } else if (tab === 'micro') body = `<div class="grid g2" style="gap:12px;align-items:start">
    <div class="mk-box"><b class="small mb" style="display:block">🎯 یک فعالیت مشخص را بیمه کن</b>
      <p class="small muted mb">حق بیمه از ارزش فعالیت و سابقهٔ غیبت موجهٔ تو محاسبه می‌شود. اگر غیبت موجه خوردی، خسارت می‌گیری.</p>
      ${(v.microOptions || []).length ? (v.microOptions || []).map(o => `<div class="ic-row"><span class="gr-ico" style="--kc:#7c3aed;width:36px;height:36px">${o.kind === 'hw' ? '📚' : '🧠'}</span>
        <div class="n" style="flex:1">${esc(o.title)}<div class="small muted">مهلت ${jShort(o.due)}</div></div>
        <button type="button" class="btn sm" data-act="icMicro" data-id="${o.targetId}" data-kind="${o.kind}" data-p="${o.premium}">🎯 بیمه (−${fa(o.premium)} 🪙)</button></div>`).join('') : empty('🍀', 'فعالیت قابل بیمه‌ای نیست', 'یا همه انجام شده یا قبلاً بیمه کرده‌ای.')}</div>
    <div class="mk-box"><b class="small mb" style="display:block">📜 بیمه‌های موردی من</b>
      ${(v.myMicros || []).length ? (v.myMicros || []).map(m => `<div class="ic-row"><span class="gr-ico" style="--kc:${m.status === 'paid' ? '#16a34a' : m.status === 'active' ? '#7c3aed' : '#7b7261'};width:36px;height:36px">🎯</span>
        <div class="n" style="flex:1">${esc(m.title)}<div class="small muted">حق بیمه ${fa(m.premium)} • پوشش ${fa(m.coverage)}٪ • فرانشیز ${fa(m.ded)}</div></div>
        <span class="gr-pill" style="--pc:${m.status === 'paid' ? '#16a34a' : m.status === 'active' ? '#7c3aed' : '#7b7261'}">${m.status === 'paid' ? '💰 پرداخت شد' : m.status === 'active' ? '🛡️ فعال' : '🍀 منقضی'}</span></div>`).join('') : empty('🎯', 'بیمهٔ موردی نداری', '')}</div></div>`;
  else if (tab === 'queue') body = `<div class="mk-box"><b class="small mb" style="display:block">📥 در انتظار تو (${fa((v.queue || []).length)})</b>${(v.queue || []).length ? (v.queue || []).map(x => claimRow(x, 'co')).join('') : empty('🕊️', 'موردی نیست', '')}</div>`;
  else if (tab === 'members') body = `<div class="mk-box">${(c.members || []).map(m => { const s = stuById(st, m), en = (c.enrolled || []).includes(m); return `<div class="ic-row">${avHTML(s, 'sm')}<div class="n" style="flex:1">${esc(s ? s.name : '')}</div>${en ? '<span class="gr-pill" style="--pc:#16a34a">🛡️ عضو</span>' : '<span class="gr-pill" style="--pc:#7b7261">عضو نیست</span>'}</div>`; }).join('')}</div>`;
  else if (tab === 'report') body = `<div class="mk-box"><b class="small mb" style="display:block">📅 گزارش هفته‌های شرکت</b>${weeksTable(c)}</div>`;
  else if (tab === 'coverage') body = `<div class="mk-box"><b class="small mb" style="display:block">🛡️ پوشش من</b>
    <div class="row" style="gap:6px"><span class="chip">فرانشیز ${fa(c.deductible)}</span><span class="chip">پوشش ${fa(c.coverage)}٪</span><span class="chip">سقف ${fa((ico().settings || {}).claimCap || 12)}</span></div>
    <div class="gr-note mt">🧾 اول فرانشیز را خودت می‌دهی؛ بقیه را بیمه. خسارت = سکهٔ واقعی + ۱ فریز استریک + ۱۰ تجربه.</div></div>`;
  else if (tab === 'claim') body = `<div class="mk-box"><b class="small mb" style="display:block">📝 ثبت خسارت</b>
    ${(v.eligible || []).length ? (v.eligible || []).map(e => `<div class="ic-row"><span class="gr-ico" style="--kc:#f59e0b;width:36px;height:36px">${(PER[e.peril] || {}).i || '⚠️'}</span><div class="n" style="flex:1">${esc(e.label)}</div><button type="button" class="btn sm" data-act="icClaim" data-ref="${esc(e.ref)}">📝 ثبت</button></div>`).join('') : empty('🍀', 'رویداد واجد شرایطی نداری', '')}</div>`;
  else if (tab === 'history') body = `<div class="mk-box">${(v.claims || []).length ? (v.claims || []).slice().reverse().map(x => claimRow(x, '')).join('') : empty('📭', 'پرونده‌ای نداری', '')}</div>`;
  else body = flowCard();
  return `<div class="gr"><div class="gr-hero"><div class="spread"><div><h1>🏢 ${esc(c.name)}</h1>
    <div class="gr-quick"><span class="q">🏦 <b>${fa(c.fund)}</b> صندوق</span><span class="q">👥 <b>${fa((c.enrolled || []).length)}</b> عضو</span><span class="q">🪙 <b>${fa(v.balance || 0)}</b> موجودی من</span></div></div></div></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-act="icTab" data-tab="${k}">${l}${n ? ` (${fa(n)})` : ''}</button>`).join('')}</div>
    <div id="icBody">${body}</div></div>`;
}
const baseNav = navItems, baseRV = renderView;
navItems = function () { const items = baseNav(); const at = items.findIndex(x => x[0] === 'econ'); const e = ['insco', '🏛️', 'بیمهٔ کلاس']; if (at > -1) items.splice(at + 1, 0, e); else items.push(e); return items; };
renderView = function () {
  if (UI.section !== 'insco') return baseRV();
  try { document.getElementById('view').innerHTML = `<div class="ve">${isT() ? tView() : myView()}</div>`; }
  catch (e) { console.error('insco', e); }
};
ACT.icTab = el => { IC.tab = el.dataset.tab; renderView(); snd('tap'); };
ACT.icLed = el => { IC.led = el.dataset.k; renderView(); };
ACT.icEnroll = () => send('ico.enroll', { coId: co().id }, null, { sound: null }).then(r => { if (r) { snd('win'); toast(r.already ? '✅ قبلاً عضو بودی' : '🛡️ عضو شدی • −' + fa(r.premium) + ' سکه (شرکت ' + fa(r.net) + ' / مرکزی ' + fa(r.central) + ' / صندوق ' + fa(r.levy) + ')', 'ok', null, 8000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icPay = () => send('ico.payNow', { coId: co().id }, null, { sound: null }).then(r => { if (r) { if (r.already) toast('✅ این هفته قبلاً پرداخت شده — سکه‌ای کم نشد', 'info'); else { snd('win'); toast('💸 پرداخت شد • −' + fa(r.premium) + ' سکه • موجودی ' + fa(r.balance), 'ok', null, 7000); } renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icMicro = el => confirmDlg({ title: '🎯 بیمهٔ موردی', body: 'حق بیمه ' + fa(el.dataset.p) + ' سکه الآن کم می‌شود؛ اگر غیبت موجه بخوری خسارت می‌گیری.', okText: 'بیمه کن', onOk: () => send('ico.micro', { coId: co().id, targetId: el.dataset.id, kind: el.dataset.kind }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🎯 «' + r.title + '» بیمه شد • −' + fa(r.premium) + ' سکه', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icLeave = () => confirmDlg({ title: '↩️ خروج', body: 'تا عضویت دوباره پوشش نداری.', okText: 'خارج شو', onOk: () => send('ico.leave', { coId: co().id }, null, { msg: 'خارج شدی' }).then(renderView) });
ACT.icCo = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = co(); send('ico.coSettings', { coId: c.id, [k]: (c[k] || 0) + d }, null, { sound: null }).then(renderView); };
ACT.icSug = () => send('ico.coSettings', { coId: co().id, premium: ico().suggested }, null, { msg: '🧮 اعمال شد' }).then(renderView);
ACT.icClaim = el => promptDlg({ title: '📝 ثبت خسارت', placeholder: 'چه اتفاقی افتاد؟', onOk: note => send('ico.claim', { coId: co().id, ref: el.dataset.ref, note }, null, { sound: null }).then(r => { if (r) { snd('ok'); toast('📝 ثبت شد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icOk = el => send('ico.claimReview', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r) { snd('gavel'); toast(r.status === 'paid' ? '💰 +' + fa(r.payout) + ' سکه به عضو' : '🏛️ به صف مرکزی رفت', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icNo = el => promptDlg({ title: '✖️ رد', placeholder: 'دلیل', onOk: note => send('ico.claimReview', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'رد شد', sound: 'err' }).then(renderView) });
ACT.icCOk = el => send('ico.claimCentral', { id: el.dataset.id, verdict: 'approved' }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('💰 +' + fa(r.payout) + ' سکه پرداخت شد', 'ok', null, 7000); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err'));
ACT.icCNo = el => promptDlg({ title: '✖️ وتو', placeholder: 'دلیل', onOk: note => send('ico.claimCentral', { id: el.dataset.id, verdict: 'rejected', note }, null, { msg: 'وتو شد', sound: 'err' }).then(renderView) });
ACT.icInspect = el => { const c = (ico().cos || []).find(x => x.id === el.dataset.id); if (!c) return; openDrawer('🔍 ' + c.name, `<div class="row" style="gap:10px;flex-wrap:wrap">
  <span class="small bold">حق بیمه</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="-1">−</button><b>${fa(c.premium)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="premium" data-d="1">+</button></span>
  <span class="small bold">فرانشیز</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="-1">−</button><b>${fa(c.deductible)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="deductible" data-d="1">+</button></span>
  <span class="small bold">پوشش</span><span class="ic-step"><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="-5">−</button><b>${fa(c.coverage)}</b><button type="button" data-act="icCoT" data-id="${c.id}" data-k="coverage" data-d="5">+</button></span></div>`); };
ACT.icCoT = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const c = (ico().cos || []).find(x => x.id === el.dataset.id); send('ico.coSettings', { coId: c.id, [k]: (c[k] || 0) + d }, null, { sound: null }).then(() => { closeDrawer(); renderView(); }); };
ACT.icWeeks = el => { const c = (ico().cos || []).find(x => x.id === el.dataset.id); if (c) openDrawer('📅 ' + c.name, weeksTable(c)); };
ACT.icBail = el => promptDlg({ title: '🏦 تزریق از مرکزی', placeholder: 'مبلغ', value: '۵', onOk: v => send('ico.bailout', { coId: el.dataset.id, amount: num(v) || 5 }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🏦 ' + fa(r.amount) + ' سکه تزریق شد', 'ok'); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')) });
ACT.icCollect = () => send('ico.collect', {}, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🔄 جمع شد (تکراری‌ها خودکار رد می‌شوند)', 'ok'); renderView(); } });
ACT.icPoolGive = () => openDrawer('🤝 کمک اضطراری', `<form data-form="icPool">
  <div class="field"><label class="lbl">دانش‌آموز</label><select class="select" name="sid">${(S().students || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
  <div class="field"><label class="lbl">مبلغ</label><input class="input" data-fa inputmode="numeric" name="amount" value="۳"></div>
  <div class="field"><label class="lbl">دلیل</label><input class="input" name="note"></div>
  <button class="btn" type="submit" style="width:100%">🤝 پرداخت</button></form>`);
FORM.icPool = form => { const fd = new FormData(form); send('ico.poolGive', { sid: fd.get('sid'), amount: num(fd.get('amount')) || 3, note: String(fd.get('note') || '') }, null, { sound: null }).then(r => { if (r) { snd('win'); toast('🤝 +' + fa(r.amount) + ' سکه', 'ok'); closeDrawer(); renderView(); } }).catch(e => toast('⚠️ ' + (e.message || ''), 'err')); };
ACT.icSet = el => { const k = el.dataset.k, d = Number(en(el.dataset.d)); const s = ico().settings || {}; const v = Math.max(0, Math.min(100, (s[k] || 0) + d)); send('ico.centralSettings', { patch: { [k]: v } }, null, { sound: null }).then(() => { const b = document.getElementById('icS_' + k); if (b) b.textContent = fa(v); }); };
if (S() && SESS) render(true);
})();
