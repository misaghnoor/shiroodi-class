/* market-pro-core.js — سود سهام، پاداش صبر، هشدار، سفارش شرطی، اوراق، رادار کلاهبرداری */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || !C.ecPrice || g.__mktProCore) return;
g.__mktProCore = true;
const uid = C.uid, clamp = C.clamp, clone = C.clone, fa = C.fa;
const todayISO = C.todayISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const T = () => new Date().toISOString();
function weekKey(iso) { const d = isoToDate(iso); const wd = (d.getUTCDay() + 6) % 7; d.setDate(d.getDate() - wd); return dateToISO(d); }
function shiftD(iso, n) { const d = isoToDate(iso); d.setDate(d.getDate() + n); return dateToISO(d); }
const daysBetween = (a, b) => Math.round((isoToDate(b) - isoToDate(a)) / 864e5);
const wallet = (st, sid) => (C.ecWallet ? C.ecWallet(st, sid) : { balance: 0 });
const used = (st, ref) => (st.discipline || []).some(d => d.gref === ref);
function move(st, sid, amt, reason, ref) { if (used(st, ref)) return false; st.discipline.push({ id: uid(), sid, date: todayISO(), points: amt, reason, by: 'mktpro', gref: ref }); return true; }
const DEF = () => ({ divYield: 1, divBonus: 1, loyalDays: 10, loyalCoin: 1, bondFace: 50, bondWeeks: 4, bondCoupon: 1 });
const SCAMS = [
  { id: 'pump', t: 'پامپ و دامپ', story: 'پیامی در گروه کلاس می‌چرخد: «همین الان سهام همکاری بخرید! فردا قیمتش دو برابر می‌شود، خودم کلی خریدم!»', opts: [
    { t: 'همین الان می‌خرم تا جا نمانم', ok: false, why: 'در بورس دانش، ارزش هر سهم از کار واقعی کلاس ساخته می‌شود، نه از هیجان پیام‌ها. کسی که چنین پیامی می‌فرستد شاید بخواهد سهم خودش را به تو بفروشد.' },
    { t: 'صبر می‌کنم و می‌پرسم چرا باید ارزش بالا برود؛ منبع ارزش، عملکرد کلاس است', ok: true, why: 'آفرین! پامپ‌اند‌دامپ یعنی باد کردنٔ قیمت با شایعه و خالی کردن آن روی سر خریدارانِ هیجانی. سپر تو: نگاه به کندل‌ها و دلیل واقعی ارزش.' },
    { t: 'پیام را برای دوستانم هم می‌فرستم', ok: false, why: 'پخش شایعه یعنی کمک به کلاهبردار. زنجیرهٔ پامپ با forwards بزرگ می‌شود.' }] },
  { id: 'signal', t: 'سیگنال‌فروشی', story: 'کسی می‌گوید: «۵ سکه بده تا بگویم فردا کدام سهم بالا می‌رود؛ اطلاعاتم صددرصد است!»', opts: [
    { t: 'پرداخت می‌کنم؛ اطلاعات صددرصد ارزش دارد', ok: false, why: 'هیچ‌کس فردا را صددرصد نمی‌داند. اگر می‌دانست، چرا سیگنال می‌فروشد و خودش همه را نمی‌خرد؟' },
    { t: 'نمی‌پردازم؛ تحلیل خودم را از نمودار و عملکرد کلاس می‌سازم', ok: true, why: 'درست! «فروشندهٔ certeza» کلاهبرداری کلاسیک است. تحلیل شخصیِ رایگان، از سیگنال خریدنی امن‌تر است.' },
    { t: 'اول خودم امتحان می‌کنم، اگر درست گفت پول می‌دهم', ok: false, why: 'شانس ۵۰-۵۰ را «اثبات مهارت» حساب نکن؛ کلاهبردارها روی همین خطا سوار می‌شوند.' }] },
  { id: 'fakenews', t: 'خبر جعلی', story: 'شایعه: «معلم گفته هفتهٔ بعد به همه ۲۰ سکه سود سهام ریاضی می‌دهد!» قیمت RIAZ دارد بالا می‌رود.', opts: [
    { t: 'سریع می‌خرم تا قبل از خبر سود ببرم', ok: false, why: 'خرید روی خبری که منبعش معلوم نیست، دقیقاً دامِ خبر جعلی است.' },
    { t: 'از خودِ معلم/کانال رسمی کلاس می‌پرسم؛ فقط منبع رسمی معتبر است', ok: true, why: 'بله! در بازار واقعی هم SEC می‌گوید: خبر بدون منبع رسمی = سیگنال نویز. بررسی منبع، اولین حرکت حرفه‌ای است.' },
    { t: 'می‌فروشم چون یعنی بازار اشباع شده', ok: false, why: 'تصمیم بر پایهٔ شایعه، حتی در جهت مخالف، هنوز تصمیم بر پایهٔ شایعه است.' }] },
  { id: 'phish', t: 'فیشینگ', story: 'پیام خصوصی: «سلام، پشتیبانی سامانهٔ کلاسم. کد ورودت را بفرست تا سکه‌هایت را دوبرابر کنیم.»', opts: [
    { t: 'کد را می‌فرستم؛ پشتیبانی که قابل اعتماد است', ok: false, why: 'پشتیبانی واقعی هرگز کد نمی‌خواهد. کد = کلید گاوصندوق تو.' },
    { t: 'کد را به هیچ‌کس نمی‌دهم و پیام را به معلم گزارش می‌کنم', ok: true, why: 'عالی! فیشینگ یعنی شکارِ رمز با لباسِ اعتماد. گزارش دادن، بقیهٔ کلاس را هم نجات می‌دهد.' },
    { t: 'نیمی از کد را می‌فرستم', ok: false, why: 'نیمی از کلید هم کلید است؛ اطلاعات حساس «کم‌کم» لو نمی‌رود، هرگز لو نمی‌رود.' }] },
  { id: 'panic', t: 'حراج ترس', story: 'قیمت ۳٪ افتاده. یکی فریاد می‌زند: «بفروشید همه‌چیز را! بازار دارد فرو می‌پاشد!»', opts: [
    { t: 'همه را می‌فروشم تا ضرر نکنم', ok: false, why: 'فروش هیجانی در کف، همان چیزی است که سود را به خریدارِ آرام منتقل می‌کند.' },
    { t: 'نفس عمیق؛ چک می‌کنم افت از عملکرد کلاس است یا فقط نویز روزانه', ok: true, why: 'درست! ۳٪ داخل نوسان طبیعی است. اول دلیل، بعد تصمیم. ترس، بدترین مشاور مالی است.' },
    { t: 'دو برابر می‌خرم چون حتماً برمی‌گردد', ok: false, why: '«حتماً» در بازار وجود ندارد؛ خرید پله‌ای با دلیل بهتر از شیرجهٔ کامل است.' }] },
  { id: 'guarantee', t: 'ضمانت سود', story: 'پیشنهاد: «این اوراق خاص سودش تضمینی سه برابر است! ریسک صفر!»', opts: [
    { t: 'ریسک صفر و سود سه برابر؟ عالی است، می‌خرم', ok: false, why: 'سود بالا + تضمین = دو نشانهٔ قرمز کنار هم. در مالی، ریسک و بازده دوقلو هستند؛ هر جا «تضمین» دیدی، فرار کن.' },
    { t: 'می‌پرسم سودش از کجا می‌آید؛ اگر جواب قانع‌کننده نبود، نمی‌خرم', ok: true, why: 'قانون طلایی: اگر نتوانی منبع سود را توضیح بدهی، تو محصولِ آن معامله‌ای.' },
    { t: 'کم می‌خرم که اگر کلاهبرداری بود زیاد نبازم', ok: false, why: 'کم خریدن از طرح کلاهبرداری، طرح را مشروع نمی‌کند؛ صفر، عدد درست است.' }] },
  { id: 'lend', t: 'اجارهٔ حساب', story: 'دوستت می‌گوید: «کدت را یک روز بده، من معامله می‌کنم؛ سودش نصف-نصف!»', opts: [
    { t: 'می‌دهم؛ دوستم که قابل اعتماد است', ok: false, why: 'هر کاری با کد تو، مسئولیت تو است: تخلف، بدهی، حذف بیمه… حساب مالی مثل مسواک است: شخصی!' },
    { t: 'نمی‌دهم؛ پیشنهاد می‌دهم با هم تحلیل کنیم ولی معامله با حساب هر کس خودش', ok: true, why: 'مرز سالم: دانش را شریک شو، کلید را نه. این مرز، دوستی را هم حفظ می‌کند.' },
    { t: 'در عوض کد او را می‌گیرم تا عادلانه باشد', ok: false, why: 'دو حساب اجاره‌ای = دو برابر ریسک و هر دو تخلف.' }] },
  { id: 'free', t: 'پنیر مجانی', story: 'لینکی در چت: «کلیک کن و ۱۰۰ سکهٔ رایگان بورس کلاس بگیر! فقط ۳۰ ثانیه!»', opts: [
    { t: 'کلیک می‌کنم؛ چه ضرری دارد؟', ok: false, why: 'پنیر مجانی فقط در تلهٔ موش رایگان است. لینک‌های جایزه‌ای، درِ ورود بدافزار و سرقت حساب‌اند.' },
    { t: 'کلیک نمی‌کنم؛ سکه فقط از راه‌های داخل سامانه می‌آید', ok: true, why: 'درست! اقتصاد کلاس بسته است: هر سکه‌ای که از بیرون «مجانی» بیاید، یا دروغ است یا دزدی.' },
    { t: 'اول لینک را برای بچه‌ها می‌فرستم تا آنها امتحان کنند', ok: false, why: 'تله را به دوستانت تعارف نکن؛ این یعنی تبدیل شدن به بازوی کلاهبردار.' }] }
];
function pro(st) {
  if (!st.mktPro) st.mktPro = { settings: DEF(), orders: [], alerts: [], bonds: [], since: {}, quiz: {}, divWeek: '' };
  const p = st.mktPro;
  p.settings = Object.assign(DEF(), p.settings || {});
  ['orders', 'alerts', 'bonds'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
  if (!p.since) p.since = {}; if (!p.quiz) p.quiz = {};
  return p;
}
function weekChg(a) { const s = a.series || []; if (s.length < 2) return 0; const i = Math.max(0, s.length - 6); return (s[s.length - 1].c - s[i].c) / s[i].c * 100; }
function engine(st) {
  if (!st.econ || !C.ecPrice) return false;
  const p = pro(st), ec = st.econ, today = todayISO(), W = weekKey(today); let ch = false;
  const fee = (ec.settings && ec.settings.tradeFee) || 0;
  for (const sid in ec.holdings || {}) {
    p.since[sid] = p.since[sid] || {};
    for (const aid in ec.holdings[sid]) {
      const q = (ec.holdings[sid][aid] || {}).qty || 0;
      if (q > 0) { if (!p.since[sid][aid]) { p.since[sid][aid] = today; ch = true; } } else delete p.since[sid][aid];
    }
  }
  for (const o of p.orders) {
    if (o.status !== 'open') continue;
    const a = (ec.assets || []).find(x => x.id === o.assetId);
    if (!a) { o.status = 'failed'; o.note = 'سهام یافت نشد'; continue; }
    const pr = C.ecPrice(a);
    const hit = o.side === 'buy' ? pr <= o.price : (o.kind === 'stop' ? pr <= o.price : pr >= o.price);
    if (!hit) continue;
    ch = true;
    if (o.side === 'buy') {
      const cost = Math.round(o.qty * o.price * (1 + fee / 100));
      if (wallet(st, o.sid).balance < cost) { o.status = 'failed'; o.note = 'سکه کافی هنگام فعال‌شدن نبود'; continue; }
      move(st, o.sid, -cost, '📋 سفارش شرطی: خرید ' + fa(o.qty) + ' ' + a.symbol + ' @ ' + fa(o.price), 'ordf:' + o.id);
      ec.holdings[o.sid] = ec.holdings[o.sid] || {};
      const cur = ec.holdings[o.sid][a.id] || { qty: 0, cost: 0 }; cur.qty += o.qty; cur.cost += cost; ec.holdings[o.sid][a.id] = cur;
      ec.trades.push({ id: uid(), sid: o.sid, assetId: a.id, symbol: a.symbol, side: 'buy', qty: o.qty, price: o.price, value: cost, at: T() });
    } else {
      const h = (ec.holdings[o.sid] || {})[a.id]; const owned = h ? h.qty : 0;
      const ins = (C.ecActivePolicies ? C.ecActivePolicies(st, o.sid) : []).filter(x => x.assetId === a.id && x.status === 'active').reduce((s2, x) => s2 + x.qty, 0);
      if (owned < o.qty) { o.status = 'failed'; o.note = 'سهم کافی نیست'; continue; }
      if (owned - o.qty < ins) { o.status = 'failed'; o.note = 'سهم زیر پوشش بیمه است'; continue; }
      const val = Math.round(o.qty * o.price * (1 - fee / 100));
      move(st, o.sid, val, '📋 سفارش شرطی: فروش ' + fa(o.qty) + ' ' + a.symbol + ' @ ' + fa(o.price), 'ordf:' + o.id);
      h.cost = Math.max(0, Math.round(h.cost * (h.qty - o.qty) / h.qty)); h.qty -= o.qty;
      if (h.qty === 0) delete ec.holdings[o.sid][a.id];
      ec.trades.push({ id: uid(), sid: o.sid, assetId: a.id, symbol: a.symbol, side: 'sell', qty: o.qty, price: o.price, value: val, at: T() });
    }
    o.status = 'filled'; o.fillAt = T();
  }
  for (const al of p.alerts) {
    if (al.triggered) continue;
    const a = (ec.assets || []).find(x => x.id === al.assetId); if (!a) continue;
    const pr = C.ecPrice(a);
    if ((al.dir === 'above' && pr >= al.price) || (al.dir === 'below' && pr <= al.price)) { al.triggered = true; al.at = T(); ch = true; }
  }
  for (const b of p.bonds) {
    if (b.status !== 'active') continue;
    b.pw = b.pw || [];
    if (!b.pw.includes(W) && daysBetween(b.boughtAt, today) >= 7) { b.pw.push(W); move(st, b.sid, b.coupon, '🏦 کوپن هفتگی اوراق', 'cpn:' + b.id + ':' + W); ch = true; }
    if (today >= b.maturesAt) { b.status = 'matured'; move(st, b.sid, b.face, '🏦 سررسید اوراق: بازگشت اصل سرمایه', 'mat:' + b.id); ch = true; }
  }
  if (p.divWeek !== W) {
    p.divWeek = W; ch = true;
    for (const sid in ec.holdings || {}) for (const aid in ec.holdings[sid]) {
      const q = (ec.holdings[sid][aid] || {}).qty || 0; if (!q) continue;
      const a = (ec.assets || []).find(x => x.id === aid); if (!a) continue;
      const pr = C.ecPrice(a);
      let dv = Math.round(q * pr * p.settings.divYield / 100);
      if (weekChg(a) > 0) dv += Math.round(q * pr * p.settings.divBonus / 100);
      if (dv >= 1) move(st, sid, dv, '💵 سود هفتگی سهام ' + a.symbol, 'div:' + W + ':' + sid + ':' + aid);
      const since = (p.since[sid] || {})[aid];
      if (since && daysBetween(since, today) >= p.settings.loyalDays) move(st, sid, p.settings.loyalCoin, '🧘 پاداش صبر نگهداری ' + a.symbol, 'loy:' + W + ':' + sid + ':' + aid);
    }
  }
  return ch;
}
const bad = m => { const e = new Error(m); e.status = 400; return e; };
const forb = m => { const e = new Error(m); e.status = 403; return e; };
function apply(st, cmd, session) {
  if (!st.econ) C.ecEnsure(st);
  const p = pro(st), ec = st.econ, sid = session.sid;
  const teacher = () => { if (session.role !== 'teacher') throw forb('مخصوص معلم'); };
  let result = null;
  switch (cmd.type) {
    case 'mk2.order': {
      if (session.role !== 'student') throw forb('معامله مخصوص دانش‌آموز است');
      const a = (ec.assets || []).find(x => x.id === cmd.assetId); if (!a || a.paused) throw bad('سهام یافت نشد');
      const qty = clamp(Math.round(Number(cmd.qty) || 0), 1, ec.settings.maxTradeQty || 15);
      const price = clamp(Math.round(Number(cmd.price) || 0), 1, 2000);
      const side = cmd.side === 'buy' ? 'buy' : 'sell';
      const kind = side === 'buy' ? 'limit' : (['limit', 'stop', 'tp'].includes(cmd.kind) ? cmd.kind : 'limit');
      if (p.orders.filter(o => o.sid === sid && o.status === 'open').length >= 10) throw bad('سقف ۱۰ سفارش باز داری');
      const id = cmd.id || uid();
      p.orders.push({ id, sid, assetId: a.id, symbol: a.symbol, side, kind, price, qty, status: 'open', createdAt: T() });
      result = { id }; break;
    }
    case 'mk2.orderCancel': {
      const o = p.orders.find(x => x.id === cmd.id); if (!o) throw bad('سفارش یافت نشد');
      if (session.role !== 'teacher' && o.sid !== sid) throw forb('سفارش تو نیست');
      if (o.status !== 'open') throw bad('فقط سفارش باز قابل لغو است');
      o.status = 'canceled'; break;
    }
    case 'mk2.alert': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز');
      const a = (ec.assets || []).find(x => x.id === cmd.assetId); if (!a) throw bad('سهام یافت نشد');
      const price = clamp(Math.round(Number(cmd.price) || 0), 1, 2000);
      if (p.alerts.filter(x => x.sid === sid && !x.triggered).length >= 10) throw bad('سقف ۱۰ هشدار فعال');
      p.alerts.push({ id: cmd.id || uid(), sid, assetId: a.id, symbol: a.symbol, dir: cmd.dir === 'below' ? 'below' : 'above', price, triggered: false, createdAt: T() });
      result = { ok: true }; break;
    }
    case 'mk2.alertDel': { p.alerts = p.alerts.filter(x => !(x.id === cmd.id && (session.role === 'teacher' || x.sid === sid))); break; }
    case 'mk2.bond': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز');
      const s = p.settings;
      if (p.bonds.filter(b => b.sid === sid && b.status === 'active').length >= 3) throw bad('سقف ۳ اوراق فعال');
      if (wallet(st, sid).balance < s.bondFace) throw bad('سکه کافی نداری؛ قیمت اوراق ' + fa(s.bondFace));
      const id = cmd.id || uid(), today = todayISO();
      move(st, sid, -s.bondFace, '🏦 خرید اوراق درآمد ثابت (' + fa(s.bondWeeks) + ' هفته‌ای)', 'bondbuy:' + id);
      p.bonds.push({ id, sid, face: s.bondFace, coupon: s.bondCoupon, weeks: s.bondWeeks, boughtAt: today, maturesAt: shiftD(today, s.bondWeeks * 7), pw: [], status: 'active' });
      result = { id }; break;
    }
    case 'mk2.scam': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز');
      const sc = SCAMS.find(x => x.id === cmd.scamId); if (!sc) throw bad('سناریو یافت نشد');
      const pick = clamp(Math.round(Number(cmd.pick) || 0), 0, sc.opts.length - 1);
      const q = p.quiz[sid] || (p.quiz[sid] = { a: {}, score: 0, streak: 0 });
      const ok = !!sc.opts[pick].ok;
      const done = q.a[cmd.scamId] != null && sc.opts[q.a[cmd.scamId]].ok;
      q.a[cmd.scamId] = pick;
      if (ok) { q.score = (q.score || 0) + 1; q.streak = (q.streak || 0) + 1; } else q.streak = 0;
      if (ok && !done) {
        move(st, sid, 2, '🚦 رادار کلاهبرداری: تشخیص درست «' + sc.t + '»', 'scam:' + cmd.scamId + ':' + sid);
        if (C.grGrant) C.grGrant(st, sid, { xp: 10, reason: '🚦 سواد مالی: ' + sc.t, ref: 'scamx:' + cmd.scamId + ':' + sid, kind: 'mktpro' });
      }
      result = { ok, why: sc.opts[pick].why, done }; break;
    }
    case 'mk2.settings': {
      teacher(); const q2 = cmd.patch || {};
      ['divYield', 'divBonus', 'loyalCoin', 'bondCoupon'].forEach(k => { if (q2[k] != null) p.settings[k] = clamp(Math.round(Number(q2[k]) || 0), 0, 10); });
      ['loyalDays'].forEach(k => { if (q2[k] != null) p.settings[k] = clamp(Math.round(Number(q2[k]) || 0), 1, 60); });
      ['bondFace'].forEach(k => { if (q2[k] != null) p.settings[k] = clamp(Math.round(Number(q2[k]) || 0), 5, 500); });
      ['bondWeeks'].forEach(k => { if (q2[k] != null) p.settings[k] = clamp(Math.round(Number(q2[k]) || 0), 1, 12); });
      break;
    }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}
const baseApply = C.applyCommand, baseView = C.viewFor, baseSeed = C.buildSeed, baseNorm = C.normalize;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (cmd.type.indexOf('mk2.') === 0) {
    if (!session) { const e = new Error('نشست نامعتبر'); e.status = 401; throw e; }
    const cid = String(cmd.cid || '').slice(0, 40);
    st._applied = Array.isArray(st._applied) ? st._applied : [];
    if (cid && st._applied.indexOf(cid) > -1) return { state: st, result: { duplicate: true } };
    const out = apply(st, cmd, session);
    if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
    try { engine(out.state); } catch (e) {}
    return out;
  }
  const out = baseApply(st, cmd, session);
  try { engine(out.state); } catch (e) {}
  return out;
};
C.viewFor = function (st, session) {
  try { engine(st); } catch (e) {}
  const v = baseView(st, session); if (!v) return v;
  const p = pro(st);
  if (session.role === 'teacher') {
    v.mktPro = { settings: clone(p.settings), orders: clone(p.orders.slice(-60).reverse()), alerts: clone(p.alerts.slice(-40).reverse()), bonds: clone(p.bonds.slice(-40).reverse()), quiz: clone(p.quiz), divWeek: p.divWeek, scams: clone(SCAMS) };
  } else {
    v.mktPro = { settings: clone(p.settings), orders: clone(p.orders.filter(o => o.sid === session.sid).reverse()), alerts: clone(p.alerts.filter(a => a.sid === session.sid).reverse()), bonds: clone(p.bonds.filter(b => b.sid === session.sid).reverse()), quiz: clone(p.quiz[session.sid] || { a: {}, score: 0, streak: 0 }), since: clone(p.since[session.sid] || {}), divWeek: p.divWeek, scams: clone(SCAMS) };
  }
  return v;
};
C.buildSeed = function () { const st = baseSeed(); pro(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); pro(st); return st; };
C.MP2_SCAMS = SCAMS; C.mp2Ensure = pro; C.mp2Engine = engine; C.mp2WeekChg = weekChg;
})(typeof globalThis !== 'undefined' ? globalThis : this);
