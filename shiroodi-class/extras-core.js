/* extras-core.js — فروشگاه امتیاز، نشان‌های خودکار (هستهٔ مشترک مرورگر + سرور) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__extrasCore) return;
g.__extrasCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, norm = C.norm, num = C.num, fa = C.fa, mean = C.mean;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, jShort = C.jShort, jLabel = C.jLabel;
const stuById = C.stuById, groupOf = C.groupOf, stats = C.stats, LMAX = C.LMAX;

/* ---------------- constants ---------------- */
const SHOP_CATS = {
  privilege: { l: 'امتیاز ویژه', i: '👑', c: '#d97706' },
  learning:  { l: 'یادگیری',     i: '📚', c: '#1d4ed8' },
  fun:       { l: 'سرگرمی',      i: '🎉', c: '#e11d48' },
  role:      { l: 'مسئولیت',     i: '🏛️', c: '#7c3aed' },
  gift:      { l: 'جایزه',       i: '🎁', c: '#0d9488' }
};
const ORDER = {
  pending:  { l: 'در انتظار تأیید', i: '⏳', c: '#f59e0b' },
  approved: { l: 'تأیید شد',        i: '✅', c: '#16a34a' },
  rejected: { l: 'رد شد',           i: '✖️', c: '#e11d48' },
  canceled: { l: 'لغو شد',          i: '↩️', c: '#7b7261' }
};
const TIERS = {
  gold:   { l: 'طلا',   c: '#d97706', c2: '#fbbf24', ring: '#b45309' },
  silver: { l: 'نقره',  c: '#64748b', c2: '#cbd5e1', ring: '#475569' },
  bronze: { l: 'برنز',  c: '#b45309', c2: '#f59e0b', ring: '#92400e' }
};
const SHOP_ICONS = ['🪑','🚩','🎴','🎮','🧩','📚','🎨','⚽','🏅','🎁','👑','🍭','🎬','🖍️','🧸','🎯','🥇','🎵','📖','🤝','🌟','🧠','🎪','🍫'];
const BADGE_ICONS = ['🌟','📈','🏆','🤝','📖','🛡️','🧠','🗳️','📚','🏅','🔥','🎨','⚖️','🏃','💎','🎯','🕊️','🧭'];

/* ---------------- helpers ---------------- */
const iso = d => { const x = new Date(); x.setDate(x.getDate() + d); return iranISO(x); };
const ts = (d, h) => { const x = isoToDate(iso(d)); return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), (h || 12) - 3, 30)).toISOString(); };
const posPts = st => (st.discipline || []).filter(d => (Number(d.points) || 0) > 0);
const leaderPts = st => (st.leaderLogs || []).reduce((a, l) => a + (Number(l.points) || 0), 0);
const myApproved = (st, sid) => ((st.shop && st.shop.purchases) || []).filter(p => p.sid === sid && p.status === 'approved');
const myPending = (st, sid) => ((st.shop && st.shop.purchases) || []).filter(p => p.sid === sid && p.status === 'pending');
const hwListOf = (st, sid) => ((st.homework && st.homework.assignments) || []).filter(a => a.status !== 'draft' && C.hwTargets && C.hwTargets(st, a, sid));
const hwDoneOf = (st, sid, kind) => hwListOf(st, sid).filter(a => {
  if (kind && a.kind !== kind) return false;
  const s = st.homework.subs[a.id] && st.homework.subs[a.id][sid];
  return s && s.status === 'done';
}).length;
const quizSubs = (st, sid) => (st.quizzes || []).map(q => q.submissions && q.submissions[sid]).filter(Boolean);
const attStreak = (st, sid) => {
  const days = Object.keys(st.attendance || {}).sort().reverse();
  let n = 0;
  for (const d of days) { const v = st.attendance[d][sid]; if (v === 'present') n++; else break; }
  return n;
};
const attPerfectDays = (st, sid) => Object.keys(st.attendance || {}).filter(d => st.attendance[d][sid] === 'present').length;
const votesOf = (st, sid) => (st.polls || []).filter(p => p.votes && p.votes[sid] !== undefined).length;
const reportsOk = (st, sid) => (st.reports || []).filter(r => r.by === sid && ['to_judge', 'pending_final', 'approved'].includes(r.status)).length;
const verdictsOk = (st, sid) => (st.reports || []).filter(r => r.verdict && r.verdict.by === sid && r.status === 'approved').length;
const artGrades = (st, sid) => C.subjectSeries(st, sid, 'هنر').filter(x => x.score >= LMAX(st) - 1).length;

/* ---------------- badge definitions ---------------- */
const BADGES = [
  { key: 'att_week',   name: 'حضور بی‌نقص',   icon: '🗓️', tier: 'silver', cat: 'حضور',   desc: 'پنج روز پیاپی حاضر، بدون غیبت و تأخیر.',
    ev: (st, sid) => { const v = attStreak(st, sid); return { earned: v >= 5, cur: Math.min(v, 5), target: 5, hint: `${fa(v)} روز پیاپی` }; } },
  { key: 'att_month',  name: 'ماه طلایی حضور', icon: '🌟', tier: 'gold',   cat: 'حضور',   desc: 'بیست روز حضور کامل در کلاس.',
    ev: (st, sid) => { const v = attPerfectDays(st, sid); return { earned: v >= 20, cur: Math.min(v, 20), target: 20, hint: `${fa(v)} روز کامل` }; } },
  { key: 'top3',       name: 'ستارهٔ کلاس',    icon: '🏆', tier: 'gold',   cat: 'درسی',   desc: 'میانگین درسی در جمع سه نفر برتر کلاس.',
    ev: (st, sid) => { const wg = (st.students || []).map(s => ({ id: s.id, ...stats(st, s.id) })).filter(s => s.cnt).sort((a, b) => b.avg - a.avg);
      const r = wg.findIndex(s => s.id === sid) + 1; const me = wg.find(s => s.id === sid);
      return { earned: !!me && r > 0 && r <= 3, cur: me ? (r <= 3 ? 1 : 0) : 0, target: 1, hint: r ? `رتبهٔ ${fa(r)} از ${fa(wg.length)}` : 'بدون نمره' }; } },
  { key: 'rising',     name: 'ستارهٔ صعودی',   icon: '📈', tier: 'silver', cat: 'درسی',   desc: 'روند نمرات در نیمهٔ اخیر ارزشیابی‌ها صعودی باشد.',
    ev: (st, sid) => { const a = C.aiStudent(st, sid); const m = a ? a.momentum : 0;
      return { earned: m >= 0.35, cur: clamp(m / 0.35, 0, 1), target: 1, hint: `روند ${m >= 0 ? '+' : ''}${C.faNum(m)}` }; } },
  { key: 'excellent5', name: 'پنج خیلی خوب',   icon: '💎', tier: 'gold',   cat: 'درسی',   desc: 'پنج نمرهٔ «خیلی خوب» در ارزشیابی‌ها.',
    ev: (st, sid) => { let n = 0; for (const a of st.assessments || []) for (const sub of a.subjects || []) { const gr = st.grades?.[a.id]?.[sub]?.[sid]; if (gr === 'excellent' || (st.meta.gradingMode === 'numeric' && Number(gr) >= (st.meta.numericThresholds?.excellent || 17))) n++; }
      return { earned: n >= 5, cur: Math.min(n, 5), target: 5, hint: `${fa(n)} خیلی خوب` }; } },
  { key: 'helper',     name: 'یار مهربان',     icon: '🤝', tier: 'silver', cat: 'مدیریت', desc: 'ده امتیاز مدیریتی از کمک به هم‌کلاسی‌ها و بررسی تکالیف.',
    ev: (st, sid) => { const v = C.leaderPts(st, sid); return { earned: v >= 10, cur: Math.min(v, 10), target: 10, hint: `${fa(v)} امتیاز مدیریتی` }; } },
  { key: 'hw10',       name: 'تکلیف‌دان منظم', icon: '📚', tier: 'silver', cat: 'تکلیف', desc: 'ده تکلیف کامل با تأیید نهایی معلم.',
    ev: (st, sid) => { const n = hwListOf(st, sid).filter(a => { const s = st.homework.subs[a.id]?.[sid]; return s && s.status === 'done' && s.teacherReview && s.teacherReview.verdict === 'approved'; }).length;
      return { earned: n >= 10, cur: Math.min(n, 10), target: 10, hint: `${fa(n)} تکلیف تأییدشده` }; } },
  { key: 'reader',     name: 'کرم کتاب',       icon: '📖', tier: 'bronze', cat: 'تکلیف', desc: 'سه تکلیف خواندنی کامل انجام شود.',
    ev: (st, sid) => { const n = hwDoneOf(st, sid, 'reading'); return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} تکلیف خواندنی` }; } },
  { key: 'quizmaster', name: 'استاد آزمون',    icon: '🧠', tier: 'gold',   cat: 'آزمون', desc: 'میانگین نمرهٔ آزمون‌ها بالای ۸۵٪ (حداقل دو آزمون).',
    ev: (st, sid) => { const subs = quizSubs(st, sid); const avg = subs.length ? mean(subs.map(s => s.score)) : 0;
      return { earned: subs.length >= 2 && avg >= 85, cur: subs.length >= 2 ? clamp(avg / 85, 0, 1) : 0, target: 1, hint: subs.length ? `میانگین ${fa(Math.round(avg))}٪ در ${fa(subs.length)} آزمون` : 'بدون آزمون' }; } },
  { key: 'voter',      name: 'رأی‌دهندهٔ فعال', icon: '🗳️', tier: 'bronze', cat: 'مشارکت', desc: 'شرکت در سه نظرسنجی یا انتخابات کلاس.',
    ev: (st, sid) => { const n = votesOf(st, sid); return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} رأی ثبت‌شده` }; } },
  { key: 'discipline', name: 'قهرمان انضباط',  icon: '🛡️', tier: 'gold',   cat: 'انضباط', desc: 'امتیاز انضباطی مثبت ۱۰ یا بیشتر.',
    ev: (st, sid) => { const v = stats(st, sid).pts; return { earned: v >= 10, cur: clamp(v / 10, 0, 1), target: 1, hint: `امتیاز ${v > 0 ? '+' : ''}${fa(v)}` }; } },
  { key: 'reporter',   name: 'دیده‌بان دقیق',   icon: '🔭', tier: 'silver', cat: 'مدیریت', desc: 'سه گزارش تأییدشده به عنوان نماینده یا شهردار.',
    ev: (st, sid) => { const n = reportsOk(st, sid); return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} گزارش تأییدشده` }; } },
  { key: 'judge',      name: 'قاضی عادل',      icon: '⚖️', tier: 'gold',   cat: 'مدیریت', desc: 'سه رأی صادرشده که معلم تأیید کرده باشد.',
    ev: (st, sid) => { const n = verdictsOk(st, sid); return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} رأی تأییدشده` }; } },
  { key: 'artist',     name: 'هنرمند کلاس',    icon: '🎨', tier: 'bronze', cat: 'درسی',   desc: 'سه نمرهٔ عالی در درس هنر.',
    ev: (st, sid) => { const n = artGrades(st, sid); return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} نمرهٔ عالی هنر` }; } },
  { key: 'shopper',    name: 'خریدار باهوش',   icon: '🛒', tier: 'bronze', cat: 'فروشگاه', desc: 'سه خرید تأییدشده از فروشگاه امتیاز.',
    ev: (st, sid) => { const n = myApproved(st, sid).length; return { earned: n >= 3, cur: Math.min(n, 3), target: 3, hint: `${fa(n)} خرید تأییدشده` }; } },
  { key: 'balanced',   name: 'کلاس‌یار همه‌فن‌حریف', icon: '🎯', tier: 'gold', cat: 'مشارکت', desc: 'حضور بالای ۹۰٪، میانگین بالای ۳ و امتیاز انضباطی مثبت.',
    ev: (st, sid) => { const s = stats(st, sid); const ok = s.attRate >= 90 && s.avg >= 3 && s.pts > 0;
      const score = (s.attRate >= 90 ? 1 : 0) + (s.avg >= 3 ? 1 : 0) + (s.pts > 0 ? 1 : 0);
      return { earned: ok, cur: score, target: 3, hint: `${fa(score)} شرط از ۳` }; } }
];
const BADGE_MAP = {}; BADGES.forEach(b => BADGE_MAP[b.key] = b);

function evaluateBadges(st, sid) {
  const out = [];
  for (const b of BADGES) {
    let r; try { r = b.ev(st, sid); } catch (e) { r = { earned: false, cur: 0, target: 1, hint: '' }; }
    out.push({ key: b.key, earned: !!r.earned, cur: Number(r.cur) || 0, target: Number(r.target) || 1, hint: r.hint || '' });
  }
  return out;
}
function badgeProgress(st, sid) {
  const map = {};
  evaluateBadges(st, sid).forEach(r => map[r.key] = r);
  return map;
}
function syncBadges(st, force) {
  const added = [];
  if (!st.badges) return added;
  if (!force && st.badges.settings.autoAward === false) return added;
  st.badges.awarded = st.badges.awarded || [];
  for (const s of st.students || []) {
    const evals = evaluateBadges(st, s.id);
    for (const r of evals) {
      if (!r.earned) continue;
      if (st.badges.awarded.some(a => a.sid === s.id && a.key === r.key)) continue;
      const rec = { id: uid(), sid: s.id, key: r.key, at: new Date().toISOString(), by: 'auto', note: '' };
      st.badges.awarded.push(rec);
      added.push({ sid: s.id, key: r.key, name: BADGE_MAP[r.key] ? BADGE_MAP[r.key].name : r.key });
    }
  }
  return added;
}

/* ---------------- wallet ---------------- */
function wallet(st, sid) {
  const earned = posPts(st).filter(d => d.sid === sid).reduce((a, d) => a + (Number(d.points) || 0), 0)
    + (st.leaderLogs || []).filter(l => l.leader === sid).reduce((a, l) => a + (Number(l.points) || 0), 0);
  const spent = myApproved(st, sid).reduce((a, p) => a + (Number(p.cost) || 0), 0);
  const reserved = myPending(st, sid).reduce((a, p) => a + (Number(p.cost) || 0), 0);
  return { earned, spent, reserved, balance: Math.max(0, earned - spent - reserved), net: earned - spent };
}

/* ---------------- seed ---------------- */
function shopSeed(st) {
  const S = st.students || [];
  const R = (id, name, icon, cat, cost, stock, per, order, desc) => ({ id, name, icon, cat, cost, stock, per, order, desc, active: true, startAt: '', endAt: '', createdAt: iso(-14) });
  const rewards = [
    R('rw1', 'انتخاب جای نشستن (یک هفته)', '🪑', 'privilege', 12, 2, 1, 1, 'یک هفتهٔ کامل، جای نشستن خودت را از میان نیمکت‌های آزاد انتخاب کن.'),
    R('rw2', 'سرصف شدن برای یک روز', '🚩', 'role', 8, 3, 2, 2, 'یک روز کامل سرصف کلاس باش و مسئول نظم صف.'),
    R('rw3', 'کارت یک شب معافیت تکلیف', '🎴', 'learning', 20, 4, 1, 3, 'یک شب از یکی از تکلیف‌ها معاف می‌شوی؛ فقط یک بار در ماه.'),
    R('rw4', 'ده دقیقه بازی کلاسی', '🎮', 'fun', 25, 1, 1, 4, 'با تأیید معلم، ده دقیقه بازی گروهی برای کل کلاس.'),
    R('rw5', 'انتخاب هم‌گروهی برای یک هفته', '🧩', 'privilege', 15, 2, 1, 5, 'یک هفته کنار دوستی که می‌خواهی بنشین.'),
    R('rw6', 'کتاب دلخواه از کتابخانهٔ کلاس', '📚', 'gift', 10, 5, 2, 6, 'یک کتاب از کتابخانهٔ کلاس برای یک هفته امانت بگیر.'),
    R('rw7', 'نقاشی روی تختهٔ آزاد', '🎨', 'fun', 6, 6, 3, 7, 'زنگ تفریح، روی تختهٔ آزاد کلاس نقاشی کن.'),
    R('rw8', 'دستیار معلم در یک زنگ', '🏅', 'role', 14, 2, 1, 8, 'یک زنگ کامل دستیار معلم باش: توزیع برگه‌ها، ثبت نمرات شفاهی.'),
    R('rw9', 'مدال افتخار روی میز', '🥇', 'gift', 9, 8, 2, 9, 'یک مدال کوچک افتخار برای روی میزت تا پایان هفته.'),
    R('rw10', 'انتخاب بازی زنگ ورزش', '⚽', 'fun', 11, 2, 1, 10, 'بازی زنگ ورزش این هفته را تو انتخاب کن.')
  ];
  const purchases = [];
  const disc = [];
  const mk = (id, sid, rid, status, day, hour, note, reviewNote) => {
    const rw = rewards.find(r => r.id === rid); if (!rw || !stuById(st, sid)) return;
    const at = ts(day, hour);
    const p = { id, sid, rewardId: rid, name: rw.name, icon: rw.icon, cost: rw.cost, at, status, note: note || '', review: null };
    if (status !== 'pending') p.review = { verdict: status, note: reviewNote || '', at: ts(day + 1, 10), by: 'teacher' };
    if (status === 'approved') {
      rw.stock = rw.stock > 0 ? rw.stock - 1 : rw.stock;
      disc.push({ id: uid(), sid, date: iso(day + 1), points: -rw.cost, reason: 'خرید از فروشگاه: ' + rw.name, by: 'shop', oid: id });
    }
    purchases.push(p);
  };
  if (S[22]) mk('po1', S[22].id, 'rw7', 'approved', -6, 13, 'برای زنگ تفریح سه‌شنبه', 'آفرین بر نظم این هفته!');
  if (S[18]) mk('po2', S[18].id, 'rw2', 'approved', -4, 12, '', 'مسئولیت سرصف به تو سپرده شد.');
  if (S[14]) mk('po3', S[14].id, 'rw9', 'pending', -1, 15, 'برای میزم می‌خواهم 🥇', '');
  if (S[7]) mk('po4', S[7].id, 'rw6', 'pending', 0, 9, 'کتاب «شگفتی‌های علوم»', '');
  if (S[3]) mk('po5', S[3].id, 'rw3', 'rejected', -8, 14, '', 'این هفته تکلیف ریاضی مهم است؛ هفتهٔ بعد دوباره درخواست بده.');
  if (disc.length) st.discipline = (st.discipline || []).concat(disc);
  return { rewards, purchases, settings: { enabled: true, requireApproval: true }, savedViews: [], seq: purchases.length };
}
function badgesSeed(st) {
  const b = { awarded: [], settings: { autoAward: true }, manual: [] };
  st.badges = b;
  syncBadges(st, true);
  b.awarded.forEach((a, i) => { a.at = ts(-((i % 12) + 1), 9 + (i % 6)); });
  return b;
}
function ensureExtras(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  let ch = false;
  if (!st.shop || !Array.isArray(st.shop.rewards) || !Array.isArray(st.shop.purchases)) { st.shop = shopSeed(st); ch = true; }
  else {
    st.shop.settings = Object.assign({ enabled: true, requireApproval: true }, st.shop.settings || {});
    if (!Array.isArray(st.shop.savedViews)) { st.shop.savedViews = []; ch = true; }
    st.shop.rewards.forEach((r, i) => { if (typeof r.order !== 'number') { r.order = i + 1; ch = true; } });
  }
  if (!st.badges || !Array.isArray(st.badges.awarded)) { st.badges = badgesSeed(st); ch = true; }
  else { st.badges.settings = Object.assign({ autoAward: true }, st.badges.settings || {}); }
  return ch;
}

/* ---------------- view ---------------- */
function extrasView(st, session) {
  ensureExtras(st);
  if (session.role === 'teacher') return { shop: clone(st.shop), badges: clone(st.badges) };
  const sid = session.sid;
  return {
    shop: {
      rewards: clone((st.shop.rewards || []).filter(r => r.active !== false)),
      purchases: clone((st.shop.purchases || []).filter(p => p.sid === sid)),
      settings: clone(st.shop.settings), savedViews: [], seq: 0
    },
    badges: {
      awarded: clone((st.badges.awarded || []).filter(a => a.sid === sid)),
      settings: { autoAward: st.badges.settings.autoAward !== false },
      progress: badgeProgress(st, sid)
    }
  };
}

/* ---------------- commands ---------------- */
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const T = () => new Date().toISOString();

function rewardActive(st, r) {
  if (r.active === false) return false;
  const d = todayISO();
  if (r.startAt && d < r.startAt) return false;
  if (r.endAt && d > r.endAt) return false;
  return true;
}
function readReward(st, src, existing) {
  const name = str(src.name, 90); if (!name) throw bad('نام جایزه الزامی است');
  const cost = clamp(Math.round(num(src.cost) || 0), 1, 200);
  const stock = src.stock == null || src.stock === '' ? -1 : Math.round(num(src.stock));
  const per = src.per == null || src.per === '' ? 0 : clamp(Math.round(num(src.per)), 0, 20);
  const startAt = src.startAt ? C.parseDateAny(src.startAt) : '';
  const endAt = src.endAt ? C.parseDateAny(src.endAt) : '';
  if (startAt && endAt && endAt < startAt) throw bad('پایان نباید پیش از شروع باشد');
  return {
    name, icon: str(src.icon, 6) || '🎁', cat: SHOP_CATS[src.cat] ? src.cat : 'gift',
    desc: str(src.desc, 400), cost, stock: stock < 0 ? -1 : clamp(stock, 0, 999), per,
    active: src.active !== false, startAt: startAt || '', endAt: endAt || ''
  };
}
function applyExtras(st, cmd, session) {
  ensureExtras(st);
  const shop = st.shop, badges = st.badges, sid = session.sid, D = todayISO();
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  const findR = id => { const r = shop.rewards.find(x => x.id === id); if (!r) throw bad('جایزه یافت نشد'); return r; };
  const findP = id => { const p = shop.purchases.find(x => x.id === id); if (!p) throw bad('درخواست یافت نشد'); return p; };
  let result = null;

  switch (cmd.type) {
    case 'shop.reward.create': {
      teacher();
      const data = readReward(st, cmd.data || {});
      const id = str(cmd.id, 24) || uid();
      const order = shop.rewards.reduce((m, r) => Math.max(m, r.order || 0), 0) + 1;
      shop.rewards.push(Object.assign({ id, order, createdAt: D }, data));
      result = { id }; break;
    }
    case 'shop.reward.update': {
      teacher(); const r = findR(cmd.id);
      Object.assign(r, readReward(st, cmd.data || {}, r)); break;
    }
    case 'shop.reward.delete': {
      teacher();
      const has = shop.purchases.some(p => p.rewardId === cmd.id && p.status === 'pending');
      if (has) throw bad('این جایزه درخواست در انتظار دارد؛ اول آن‌ها را تعیین تکلیف کن');
      shop.rewards = shop.rewards.filter(r => r.id !== cmd.id);
      break;
    }
    case 'shop.reward.bulkDelete': {
      teacher();
      const ids = (cmd.ids || []).slice(0, 60);
      const blocked = ids.filter(id => shop.purchases.some(p => p.rewardId === id && p.status === 'pending'));
      if (blocked.length) throw bad(`${fa(blocked.length)} جایزه درخواست در انتظار دارد`);
      shop.rewards = shop.rewards.filter(r => !ids.includes(r.id));
      break;
    }
    case 'shop.reward.toggle': {
      teacher(); const r = findR(cmd.id); r.active = r.active === false ? true : false; break;
    }
    case 'shop.reward.bulkToggle': {
      teacher(); (cmd.ids || []).slice(0, 60).forEach(id => { const r = shop.rewards.find(x => x.id === id); if (r) r.active = !!cmd.active; }); break;
    }
    case 'shop.reward.reorder': {
      teacher();
      const arr = shop.rewards.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      const from = Math.round(num(cmd.from)), to = Math.round(num(cmd.to));
      if (!(from >= 0 && from < arr.length && to >= 0 && to < arr.length)) throw bad('جابه‌جایی نامعتبر');
      const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
      arr.forEach((r, i) => { r.order = i + 1; });
      break;
    }
    case 'shop.buy': {
      if (session.role !== 'student') throw forb('خرید مخصوص دانش‌آموز است.');
      if (shop.settings.enabled === false) throw bad('فروشگاه موقتاً بسته است');
      const r = findR(cmd.rewardId);
      if (!rewardActive(st, r)) throw bad('این جایزه الآن در دسترس نیست');
      if (r.stock === 0) throw bad('موجودی این جایزه تمام شده است');
      const w = wallet(st, sid);
      if (w.balance < r.cost) throw bad(`امتیاز کافی نداری؛ ${fa(r.cost - w.balance)} امتیاز دیگر لازم است`);
      if (r.per > 0) {
        const mine = shop.purchases.filter(p => p.sid === sid && p.rewardId === r.id && (p.status === 'approved' || p.status === 'pending')).length;
        if (mine >= r.per) throw bad(`سقف خرید این جایزه برای هر نفر ${fa(r.per)} بار است`);
      }
      const id = str(cmd.id, 24) || uid();
      shop.purchases.push({ id, sid, rewardId: r.id, name: r.name, icon: r.icon, cost: r.cost, at: T(), status: shop.settings.requireApproval === false ? 'approved' : 'pending', note: str(cmd.note, 300), review: null });
      if (shop.settings.requireApproval === false) {
        if (r.stock > 0) r.stock--;
        st.discipline.push({ id: uid(), sid, date: D, points: -r.cost, reason: 'خرید از فروشگاه: ' + r.name, by: 'shop', oid: id });
        const p = shop.purchases.find(x => x.id === id);
        p.review = { verdict: 'approved', note: 'تأیید خودکار', at: T(), by: 'auto' };
      }
      shop.seq = (shop.seq || 0) + 1;
      result = { id, balance: wallet(st, sid).balance }; break;
    }
    case 'shop.cancel': {
      const p = findP(cmd.id);
      if (session.role === 'student' && p.sid !== sid) throw forb('این درخواست مال تو نیست');
      if (p.status !== 'pending') throw bad('فقط درخواست در انتظار قابل لغو است');
      p.status = 'canceled'; p.review = { verdict: 'canceled', note: str(cmd.note, 200) || (session.role === 'student' ? 'لغو توسط دانش‌آموز' : 'لغو توسط معلم'), at: T(), by: session.role };
      break;
    }
    case 'shop.review':
    case 'shop.bulkReview': {
      teacher();
      const verdict = cmd.verdict === 'rejected' ? 'rejected' : 'approved';
      const ids = cmd.type === 'shop.bulkReview' ? (cmd.ids || []).slice(0, 200) : [cmd.id];
      let n = 0, cost = 0;
      for (const id of ids) {
        const p = shop.purchases.find(x => x.id === id); if (!p || p.status !== 'pending') continue;
        const r = shop.rewards.find(x => x.id === p.rewardId);
        if (verdict === 'approved') {
          if (r && r.stock === 0) throw bad(`موجودی «${p.name}» تمام شده است`);
          if (r && r.stock > 0) r.stock--;
          st.discipline.push({ id: uid(), sid: p.sid, date: D, points: -p.cost, reason: 'خرید از فروشگاه: ' + p.name, by: 'shop', oid: p.id });
          cost += p.cost;
        }
        p.status = verdict;
        p.review = { verdict, note: str(cmd.note, 300), at: T(), by: 'teacher' };
        n++;
      }
      if (!n) throw bad('درخواستی برای بررسی یافت نشد');
      result = { reviewed: n, cost }; break;
    }
    case 'shop.refund': {
      teacher();
      const p = findP(cmd.id);
      if (p.status !== 'approved') throw bad('فقط خرید تأییدشده قابل بازگردانی است');
      const r = shop.rewards.find(x => x.id === p.rewardId);
      if (r && r.stock >= 0) r.stock++;
      st.discipline.push({ id: uid(), sid: p.sid, date: D, points: p.cost, reason: 'بازگردانی خرید: ' + p.name, by: 'shop', oid: p.id });
      p.status = 'canceled'; p.review = { verdict: 'canceled', note: str(cmd.note, 200) || 'بازگردانی توسط معلم', at: T(), by: 'teacher' };
      result = { refunded: p.cost }; break;
    }
    case 'shop.bonus': {
      teacher();
      const s = stuById(st, cmd.sid); if (!s) throw bad('دانش‌آموز یافت نشد');
      const pts = clamp(Math.round(num(cmd.points) || 0), 1, 50);
      const reason = str(cmd.reason, 140) || 'پاداش ویژهٔ معلم';
      st.discipline.push({ id: uid(), sid: s.id, date: D, points: pts, reason: '🎁 ' + reason, by: 'bonus' });
      result = { points: pts }; break;
    }
    case 'shop.settings': {
      teacher();
      const p = cmd.patch || {};
      if (p.enabled != null) shop.settings.enabled = !!p.enabled;
      if (p.requireApproval != null) shop.settings.requireApproval = !!p.requireApproval;
      break;
    }
    case 'shop.viewSave': {
      teacher();
      const name = str(cmd.name, 50); if (!name) throw bad('نام نما الزامی است');
      shop.savedViews.push({ id: uid(), name, q: str(cmd.q, 50), cat: str(cmd.cat, 20), status: str(cmd.status, 20), sort: str(cmd.sort, 20) });
      if (shop.savedViews.length > 16) shop.savedViews.shift();
      break;
    }
    case 'shop.viewDelete': teacher(); shop.savedViews = shop.savedViews.filter(v => v.id !== cmd.id); break;
    case 'shop.import': {
      teacher();
      const rows = Array.isArray(cmd.rows) ? cmd.rows.slice(0, 1500) : [];
      const map = cmd.map || {};
      const get = (r, k) => { const i = map[k]; return i == null || i === '' ? '' : String(r[i] == null ? '' : r[i]).trim(); };
      let n = 0; const err = [];
      rows.forEach((r, i) => {
        try {
          const data = readReward(st, { name: get(r, 'name'), icon: get(r, 'icon'), cat: get(r, 'cat'), cost: get(r, 'cost'), stock: get(r, 'stock'), per: get(r, 'per'), desc: get(r, 'desc'), active: true });
          const id = uid();
          shop.rewards.push(Object.assign({ id, order: shop.rewards.length + 1, createdAt: D }, data));
          n++;
        } catch (e) { err.push({ row: i + 2, msg: e.message }); }
      });
      if (!n) throw bad(err[0] ? err[0].msg : 'هیچ ردیف معتبری یافت نشد');
      result = { applied: n, skipped: err.length, errors: err.slice(0, 10) }; break;
    }
    case 'badge.sync': {
      teacher();
      const added = syncBadges(st, !!cmd.force);
      result = { added: added.length, items: added.slice(0, 40) }; break;
    }
    case 'badge.award': {
      teacher();
      const s = stuById(st, cmd.sid); if (!s) throw bad('دانش‌آموز یافت نشد');
      const b = BADGE_MAP[cmd.key]; if (!b) throw bad('نشان نامعتبر');
      if (badges.awarded.some(a => a.sid === s.id && a.key === b.key)) throw bad('این نشان قبلاً به او داده شده');
      badges.awarded.push({ id: uid(), sid: s.id, key: b.key, at: T(), by: 'manual', note: str(cmd.note, 200) });
      result = { key: b.key }; break;
    }
    case 'badge.revoke': {
      teacher();
      badges.awarded = badges.awarded.filter(a => !(a.sid === cmd.sid && a.key === cmd.key));
      break;
    }
    case 'badge.settings': {
      teacher();
      if (cmd.patch && cmd.patch.autoAward != null) badges.settings.autoAward = !!cmd.patch.autoAward;
      break;
    }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}

/* ---------------- patch core ---------------- */
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; e.code = 'unauthorized'; throw e; }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { st.shop = shopSeed(st); st.badges = badgesSeed(st); }
    else ensureExtras(st);
    return out;
  }
  if (cmd.type.indexOf('shop.') !== 0 && cmd.type.indexOf('badge.') !== 0) return baseApply(st, cmd, session);
  const cid = String(cmd.cid || '').slice(0, 40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const out = applyExtras(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); st.shop = shopSeed(st); st.badges = badgesSeed(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensureExtras(st); return st; };
C.viewFor = function (st, session) {
  const v = baseView(st, session);
  if (v) { const x = extrasView(st, session); v.shop = x.shop; v.badges = x.badges; }
  return v;
};

C.SHOP_CATS = SHOP_CATS; C.ORDER = ORDER; C.TIERS = TIERS;
C.SHOP_ICONS = SHOP_ICONS; C.BADGE_ICONS = BADGE_ICONS; C.BADGES = BADGES; C.BADGE_MAP = BADGE_MAP;
C.wallet = wallet; C.badgeProgress = badgeProgress; C.evaluateBadges = evaluateBadges;
C.syncBadges = syncBadges; C.ensureExtras = ensureExtras; C.rewardActive = rewardActive;
})(typeof globalThis !== 'undefined' ? globalThis : this);
