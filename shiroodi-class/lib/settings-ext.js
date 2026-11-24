/* settings-ext.js — بلوک‌های تنظیمات بیشتر (الحاقی، بدون دست‌زدن به فایل‌های دیگر) */
(function () {
'use strict';
const C = globalThis.ClassCore;
if (!C || typeof V === 'undefined' || typeof V.settings !== 'function') return;

const base = V.settings;

const hwS = () => (S().homework || {}).settings || { leaderApproval: true, allowLate: true, latePenalty: 30, remind: true, proof: false };
const shS = () => (S().shop || {}).settings || { enabled: true, requireApproval: true };
const bdS = () => (S().badges || {}).settings || { autoAward: true };
const grS = () => (S().growth || {}).settings || C.grSettingsDefault();

const row = (label, sub, control) => `<div class="srow"><div><span class="sl">${label}</span>${sub ? `<span class="ss">${sub}</span>` : ''}</div>${control}</div>`;
const sw = (on, act, k) => `<span class="switch"><input type="checkbox" ${on ? 'checked' : ''} data-chg="${act}" data-k="${k}"><i></i></span>`;
const card = (icon, title, inner) => `<div class="card"><h3 class="mb">${icon} ${title}</h3>${inner}</div>`;

function blocksHTML() {
  const hw = hwS(), sh = shS(), bd = bdS(), gr = grS(), acc = gr.acc || {};
  return `
  ${card('📚', 'قواعد تکالیف', `
    ${row('⏰ ثبت پس از مهلت مجاز باشد', 'دیرکرد پذیرفته می‌شود ولی کسر امتیاز دارد', sw(hw.allowLate !== false, 'seHw', 'allowLate'))}
    ${row('➖ کسر امتیاز دیرکرد', 'درصد کسر از امتیاز تکلیف دیر', `<div class="gr-step"><button type="button" data-act="hwPenStep" data-d="-1">−</button><b id="seHw_latePenalty">${fa(hw.latePenalty == null ? 30 : hw.latePenalty)}٪</b><button type="button" data-act="hwPenStep" data-d="1">+</button></div>`)}
    ${row('🔔 یادآور مهلت امروز', 'برجسته‌شدن تکلیف‌های امروز در پنل دانش‌آموز', sw(hw.remind !== false, 'seHw', 'remind'))}
    ${row('📷 عکس دفتر به‌صورت پیش‌فرض', 'تکلیف‌های جدید از ابتدا عکس می‌خواهند', sw(!!hw.proof, 'seHw', 'proof'))}
    ${row('🏅 بررسی توسط سرگروه', 'سرگروه پیش از معلم تکلیف اعضا را می‌بیند', sw(hw.leaderApproval !== false, 'seHw', 'leaderApproval'))}
    <div class="row mt"><button type="button" class="btn sm soft" data-act="nav" data-sec="homework">رفتن به بخش تکالیف ←</button></div>`)}

  ${card('🛒', 'قواعد فروشگاه امتیاز', `
    ${row('🛒 فروشگاه باز باشد', 'دانش‌آموزان بتوانند خرید کنند', sw(sh.enabled !== false, 'seShop', 'enabled'))}
    ${row('✅ هر خرید نیاز به تأیید معلم', 'اگر خاموش شود، خریدها خودکار قطعی می‌شوند', sw(sh.requireApproval !== false, 'seShop', 'requireApproval'))}
    <p class="small muted mt">🪙 کیف پول = امتیاز مثبت انضباطی + امتیاز مدیریتی − خریدهای تأییدشده − درخواست‌های در انتظار.</p>
    <div class="row mt"><button type="button" class="btn sm soft" data-act="nav" data-sec="shop">رفتن به فروشگاه ←</button></div>`)}

  ${card('🏅', 'نشان‌های خودکار', `
    ${row('🤖 اعطای خودکار نشان‌ها', 'با هر تغییر داده، استحقاق‌ها بازبینی می‌شوند', sw(bd.autoAward !== false, 'seBadge', 'autoAward'))}
    <div class="row mt"><button type="button" class="btn sm ai" data-act="seBadgeSync">🤖 ارزیابی و اعطای همین حالا</button>
    <button type="button" class="btn sm soft" data-act="nav" data-sec="badges">دیدن نشان‌ها ←</button></div>`)}

  ${card('🌱', 'رشد و انگیزه', `
    ${row('🌱 بخش رشد فعال باشد', 'کل ماژول زنجیره/چالش/جعبه/هم‌یار/آینه', sw(gr.enabled !== false, 'seGr', 'enabled'))}
    ${row('🔄 چالش خودکار روزانه', 'هر روز سه چالش تازه برای همه', sw(gr.questsAuto !== false, 'seGr', 'questsAuto'))}
    ${row('✅ پاداش چالش خودکار', 'بدون نیاز به تأیید معلم', sw(gr.questAutoApprove !== false, 'seGr', 'questAutoApprove'))}
    ${row('🪞 آینه و احوال‌پرسی', 'ثبت حال روزانهٔ دانش‌آموزان', sw(gr.checkinEnabled !== false, 'seGr', 'checkinEnabled'))}
    ${row('🎰 جعبهٔ شانس', 'چرخش و جایزهٔ شانسی', sw(gr.boxEnabled !== false, 'seGr', 'boxEnabled'))}
    ${row('🤝 هم‌یار', 'جفت‌سازی و ثبت کمک', sw(gr.buddyEnabled !== false, 'seGr', 'buddyEnabled'))}
    ${row('🧊 قیمت استریک فریز', 'امتیاز خرید هر فریز', `<div class="gr-step"><button type="button" data-act="grStep" data-k="freezeCost" data-d="-1">−</button><b id="grS_freezeCost">${fa(gr.freezeCost == null ? 6 : gr.freezeCost)}</b><button type="button" data-act="grStep" data-k="freezeCost" data-d="1">+</button></div>`)}
    ${row('🔥 پاداش هر رکورد زنجیره', 'امتیاز پاداش در ۳/۵/۷/۱۰/… روز', `<div class="gr-step"><button type="button" data-act="grStep" data-k="streakReward" data-d="-1">−</button><b id="grS_streakReward">${fa(gr.streakReward == null ? 2 : gr.streakReward)}</b><button type="button" data-act="grStep" data-k="streakReward" data-d="1">+</button></div>`)}
    ${row('✨ شانس جایزه‌های کمیاب', 'هرچه بیشتر، کمیاب‌ها بیشتر', `<input type="range" min="20" max="250" step="10" value="${gr.boxRareBoost == null ? 100 : gr.boxRareBoost}" data-inp="grLuck" style="max-width:170px"><span class="ss" id="grLuckVal">${fa(gr.boxRareBoost == null ? 100 : gr.boxRareBoost)}٪</span>`)}
    <div class="row mt"><button type="button" class="btn sm soft" data-act="nav" data-sec="growth">رفتن به بخش رشد ←</button></div>`)}

  ${card('⚖️', 'پاسخگویی مسئولان کلاس', `
    ${row('فعال بودن پاسخگویی', 'کسر و پاداش خودکار امتیاز مدیریتی', sw(acc.enabled !== false, 'seGrAcc', 'enabled'))}
    ${row('↩️ برگشت رأی به قاضی', 'کسر امتیاز مدیریتی قاضی', `<div class="gr-step"><button type="button" data-act="grAccStep" data-k="judgeReturn" data-d="-1">−</button><b id="grAcc_judgeReturn">${fa(acc.judgeReturn == null ? 2 : acc.judgeReturn)}</b><button type="button" data-act="grAccStep" data-k="judgeReturn" data-d="1">+</button></div>`)}
    ${row('✖️ رد گزارش نماینده/شهردار', 'کسر امتیاز گزارش‌دهنده', `<div class="gr-step"><button type="button" data-act="grAccStep" data-k="reportReject" data-d="-1">−</button><b id="grAcc_reportReject">${fa(acc.reportReject == null ? 1 : acc.reportReject)}</b><button type="button" data-act="grAccStep" data-k="reportReject" data-d="1">+</button></div>`)}
    ${row('✅ پاداش رأی تأییدشده', 'به قاضی', `<div class="gr-step"><button type="button" data-act="grAccStep" data-k="verdictApproved" data-d="-1">−</button><b id="grAcc_verdictApproved">${fa(acc.verdictApproved == null ? 2 : acc.verdictApproved)}</b><button type="button" data-act="grAccStep" data-k="verdictApproved" data-d="1">+</button></div>`)}
    ${row('📨 پاداش گزارش تأییدشده', 'به نماینده/شهردار', `<div class="gr-step"><button type="button" data-act="grAccStep" data-k="reportApproved" data-d="-1">−</button><b id="grAcc_reportApproved">${fa(acc.reportApproved == null ? 1 : acc.reportApproved)}</b><button type="button" data-act="grAccStep" data-k="reportApproved" data-d="1">+</button></div>`)}
    <p class="small muted mt">امتیاز مدیریتی در کیف پول فروشگاه، سرگروهی و نشان «یار مهربان» اثر واقعی دارد.</p>`)}

  ${card('🧰', 'ابزارهای سریع معلم', `
    <div class="row">
      <button type="button" class="btn sm warn" data-act="leaderAuto">🤖 سرگروه هوشمند</button>
      <button type="button" class="btn sm soft" data-act="grpBalance">⚖️ توازن گروه‌ها</button>
      <button type="button" class="btn sm soft" data-act="rotate">🔄 چرخش مسئولیت‌ها</button>
      <button type="button" class="btn sm ghost" data-act="regenCodes">🔑 کدهای جدید</button>
    </div>
    <div class="row mt">
      <button type="button" class="btn sm soft" data-act="nav" data-sec="data">🩺 ممیزی هوشمند داده</button>
      <button type="button" class="btn sm soft" data-act="nav" data-sec="roles">🏛️ مسئولیت‌ها و دادگاه</button>
    </div>`)}

  ${card('🖨️', 'چاپ و خروجی سریع', `
    <div class="row">
      <button type="button" class="btn sm" data-act="repClassPrint">📋 گزارش کلاس A4</button>
      <button type="button" class="btn sm" data-act="repAttPrint">📅 حضور ماهانه A4</button>
      <button type="button" class="btn sm warn" data-act="codesPrint">🔑 کدهای محرمانه</button>
    </div>
    <div class="row mt">
      <button type="button" class="btn sm soft" data-act="csvExport" data-kind="grades">📝 CSV نمرات</button>
      <button type="button" class="btn sm soft" data-act="csvExport" data-kind="attendance">📅 CSV حضور</button>
      <button type="button" class="btn sm soft" data-act="csvExport" data-kind="analysis">🧠 CSV تحلیل</button>
      <button type="button" class="btn sm ghost" data-act="exportJSON">💾 پشتیبان JSON</button>
    </div>`)}

  ${card('🕘', 'نشست و این دستگاه', `
    ${row('نقش فعلی', '', `<span class="chip acc">${isT() ? '👨‍🏫 معلم' : '👦 دانش‌آموز'}</span>`)}
    ${row('نام', '', `<span class="chip">${esc(SESS && SESS.name ? SESS.name : '—')}</span>`)}
    ${row('انقضای نشست', '', `<span class="chip">${SESS && SESS.exp ? dtLabel(new Date(SESS.exp).toISOString()) : '—'}</span>`)}
    ${row('اتصال سرور', '', `<span class="chip ${Net.online ? 'acc' : ''}">${Net.mode === 'server' ? (Net.online ? '🟢 آنلاین' : '🔴 قطع') : '🟡 نمایشی همگام'}</span>`)}
    <div class="row mt">
      <button type="button" class="btn sm ghost" data-act="seLocalClear">🧹 پاک‌کردن حافظهٔ محلی این دستگاه</button>
      <button type="button" class="btn sm danger" data-act="logout">🚪 خروج</button>
    </div>
    <p class="small muted mt">حافظهٔ محلی فقط شامل تنظیمات ظاهری، نماهای ذخیره‌شده و اعلان‌های دیده‌شدهٔ همین دستگاه است؛ دادهٔ کلاس روی سرور می‌ماند.</p>`)}

  ${card('🧭', 'راهنما و میان‌برها', `
    <div class="plan"><b>۱</b><span><b>Ctrl + K</b> — جستجوی سریع دانش‌آموز</span></div>
    <div class="plan"><b>۲</b><span><b>Ctrl + Z</b> — واگرد آخرین تغییر (معلم)</span></div>
    <div class="plan"><b>۳</b><span><b>Esc</b> — بستن کشو / پنجره / منوی بازشو</span></div>
    <div class="plan"><b>۴</b><span><b>PrintScreen</b> — فعال‌شدن محافظ حریم صفحه</span></div>
    <div class="plan"><b>۵</b><span>همگام‌سازی: هر ۲۰ ثانیه بی‌سر و صدا + فوراً هنگام بازگشت به تب</span></div>
    <div class="divider"></div>
    <div class="row">${[['📚', 'تکالیف'], ['🛒', 'فروشگاه'], ['🏅', 'نشان‌ها'], ['🌱', 'رشد'], ['⚖️', 'دادگاه'], ['🧠', 'تحلیل'], ['🖨️', 'چاپ A4'], ['🔄', 'CSV']].map(([i, l]) => `<span class="chip">${i} ${l}</span>`).join('')}</div>
    <p class="small muted mt">نسخهٔ سامانه: ۱۴ • طراحی و توسعه: کالج مدیا</p>`)}
  `;
}

V.settings = function () {
  if (!isT()) return base();
  if (C.hwEnsure) C.hwEnsure(S());
  if (C.ensureExtras) C.ensureExtras(S());
  if (C.grEnsure) C.grEnsure(S());
  return base() + `<div class="grid g2 mt" style="align-items:start">${blocksHTML()}</div>`;
};

/* ---------- handlers ---------- */
CHG.seHw = el => { const k = el.dataset.k, v = el.checked; send('hw.settings', { patch: { [k]: v } }, st => { st.homework.settings[k] = v; }, { msg: 'قاعدهٔ تکالیف ذخیره شد' }); };
CHG.seShop = el => { const k = el.dataset.k, v = el.checked; send('shop.settings', { patch: { [k]: v } }, st => { st.shop.settings[k] = v; }, { msg: 'قاعدهٔ فروشگاه ذخیره شد' }); };
CHG.seBadge = el => { const k = el.dataset.k, v = el.checked; send('badge.settings', { patch: { [k]: v } }, st => { st.badges.settings[k] = v; }, { msg: 'قاعدهٔ نشان‌ها ذخیره شد' }); };
CHG.seGr = el => { const k = el.dataset.k, v = el.checked; send('gr.settings', { patch: { [k]: v } }, st => { st.growth.settings[k] = v; }, { msg: 'قاعدهٔ رشد ذخیره شد' }); };
CHG.seGrAcc = el => { const k = el.dataset.k, v = el.checked; send('gr.settings', { patch: { acc: { [k]: v } } }, st => { st.growth.settings.acc[k] = v; }, { msg: 'قاعدهٔ پاسخگویی ذخیره شد' }); };

let penT = null;
ACT.hwPenStep = el => {
  const s = hwS(), d = Number(en(el.dataset.d)) || 1;
  s.latePenalty = clamp((s.latePenalty == null ? 30 : s.latePenalty) + d * 5, 0, 90);
  const b = document.getElementById('seHw_latePenalty'); if (b) b.textContent = fa(s.latePenalty) + '٪';
  clearTimeout(penT);
  penT = setTimeout(() => send('hw.settings', { patch: { latePenalty: s.latePenalty } }, st => { st.homework.settings.latePenalty = s.latePenalty; }, { sound: null }), 500);
};

ACT.seBadgeSync = () => send('badge.sync', { force: true }, null, { sound: null }).then(r => {
  if (!r) return;
  if (r.added) { Sound.play('win'); toast(`🏅 ${fa(r.added)} نشان تازه اعطا شد`, 'ok', null, 7000); }
  else toast('همهٔ نشان‌های استحقاقی قبلاً داده شده‌اند ✅', 'info');
});

ACT.seLocalClear = () => confirmDlg({
  title: '🧹 پاک‌کردن حافظهٔ محلی', body: 'تنظیمات ظاهری، نماها و اعلان‌های دیده‌شدهٔ همین دستگاه پاک می‌شود و صفحه دوباره باز می‌شود. دادهٔ کلاس دست‌نخورده می‌ماند.', okText: 'پاک کن و بازکن',
  onOk: () => {
    try {
      const kill = ['sh_theme', 'sh_sound', 'sh_views', 'sh_lock'];
      kill.forEach(k => localStorage.removeItem(k));
      Object.keys(localStorage).filter(k => k.indexOf('sh12_seen') === 0 || k.indexOf('sh12_attempt') === 0).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    location.reload();
  }
});
})();
