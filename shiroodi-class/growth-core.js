/* growth-core.js — استریک، چالش، جعبهٔ شانس، هم‌یار، تأمل + کسر امتیاز مدیریتی */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__growthCore) return;
g.__growthCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, num = C.num, fa = C.fa, norm = C.norm;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const stuById = C.stuById, groupOf = C.groupOf;

const MOODS = [
  { v: 1, e: '😢', l: 'ناراحت', c: '#e11d48' },
  { v: 2, e: '😕', l: 'بی‌حوصله', c: '#f97316' },
  { v: 3, e: '😐', l: 'معمولی', c: '#f59e0b' },
  { v: 4, e: '🙂', l: 'خوب', c: '#84cc16' },
  { v: 5, e: '😄', l: 'عالی', c: '#16a34a' }
];
const CT = {
  hw: { l: 'تکلیف کامل', i: '📚', u: 'تکلیف' },
  help: { l: 'کمک به هم‌کلاسی', i: '🤝', u: 'بار' },
  reflect: { l: 'ثبت حال امروز', i: '🪞', u: 'بار' },
  attend: { l: 'حضور امروز', i: '🗓️', u: 'روز' },
  quiz: { l: 'شرکت در آزمون', i: '🧠', u: 'آزمون' },
  vote: { l: 'رأی در نظرسنجی', i: '🗳️', u: 'رأی' }
};
const RAR = [
  { k: 'common', l: 'معمولی', c: '#7b7261', w: 55, min: 1, max: 2 },
  { k: 'uncommon', l: 'خوب', c: '#16a34a', w: 25, min: 3, max: 4 },
  { k: 'rare', l: 'کمیاب', c: '#1d4ed8', w: 13, min: 5, max: 7 },
  { k: 'epic', l: 'حماسی', c: '#7c3aed', w: 5, min: 8, max: 12 },
  { k: 'legend', l: 'افسانه‌ای', c: '#d97706', w: 2, min: 5, max: 5, freeze: 1 }
];
const SETTINGS = {
  streaks: true, challenges: true, boxes: true, buddies: true, reflection: true, penalties: true,
  judgeReturnPenalty: 2, reportRejectPenalty: 1,
  boxDailyMax: 3, freezeCost: 5, reflectPoints: 1, goalPoints: 2, buddyPoints: 2, buddyDailyMax: 3, kudosPoints: 1
};

/* ---------- helpers ---------- */
const addDays = (iso, n) => { const d = isoToDate(iso); d.setDate(d.getDate() + n); return dateToISO(d); };
const weekStart = iso => addDays(iso, -C.wdIdx(iso));
const G = st => st.growth;
const hwSubs = st => (st.homework && st.homework.subs) || {};
const hwList = st => (st.homework && st.homework.assignments) || [];
const subOf = (st, aid, sid) => hwSubs(st)[aid] && hwSubs(st)[aid][sid];
const approvedHw = (st, sid) => hwList(st).filter(a => { const s = subOf(st, a.id, sid); return s && s.teacherReview && s.teacherReview.verdict === 'approved'; });
const T = () => new Date().toISOString();
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

function managementPts(st, sid) {
  return ((st.growth && st.growth.management) || []).filter(m => m.sid === sid).reduce((a, m) => a + (Number(m.points) || 0), 0);
}
const baseLeaderPts = C.leaderPts;
C.leaderPts = (st, sid) => baseLeaderPts(st, sid) + managementPts(st, sid);
const baseStats = C.stats;
C.stats = (st, sid) => { const s = baseStats(st, sid); s.lpts = C.leaderPts(st, sid); return s; };

function walletBalance(st, sid) {
  const earned = (st.discipline || []).filter(d => d.sid === sid && (Number(d.points) || 0) > 0).reduce((a, d) => a + d.points, 0) + baseLeaderPts(st, sid);
  const spent = ((st.shop && st.shop.purchases) || []).filter(p => p.sid === sid && p.status === 'approved').reduce((a, p) => a + (Number(p.cost) || 0), 0);
  const reserved = ((st.shop && st.shop.purchases) || []).filter(p => p.sid === sid && p.status === 'pending').reduce((a, p) => a + (Number(p.cost) || 0), 0);
  return Math.max(0, earned - spent - reserved);
}
function pushPts(st, sid, pts, reason, by, ref) {
  st.discipline.push({ id: uid(), sid, date: todayISO(), points: pts, reason, by, grid: ref });
}
function pushMgmt(st, sid, pts, reason, by, ref) {
  const gr = G(st); gr.management.push({ id: uid(), sid, points: pts, reason, by, ref, at: T() });
}

/* ---------- streaks ---------- */
function streakOf(set, floor, freezes) {
  let cur = 0, used = 0, d = todayISO();
  if (!set.has(d)) d = addDays(d, -1);
  for (let i = 0; i < 400; i++) {
    if (set.has(d)) cur++;
    else if (freezes - used > 0 && floor && d >= floor) used++;
    else break;
    d = addDays(d, -1);
    if (floor && d < floor) break;
  }
  return { cur, used, left: freezes - used };
}
function attStreak(st, sid, freezes) {
  const dates = Object.keys(st.attendance || {}).sort().reverse();
  let cur = 0, used = 0;
  for (const d of dates) {
    const v = st.attendance[d][sid];
    if (v === 'present') cur++;
    else if (freezes - used > 0) used++;
    else break;
  }
  return { cur, used, left: freezes - used };
}
function streaks(st, sid) {
  const gr = G(st), freezes = (gr.freezes && gr.freezes[sid]) || 0;
  const hwDates = new Set();
  for (const a of hwList(st)) { const s = subOf(st, a.id, sid); if (s) hwDates.add(iranISO(new Date(s.at))); }
  const rfDates = new Set((gr.reflections || []).filter(r => r.sid === sid).map(r => r.date));
  const minOf = set => set.size ? [...set].sort()[0] : null;
  return {
    att: attStreak(st, sid, freezes),
    hw: streakOf(hwDates, minOf(hwDates), freezes),
    rf: streakOf(rfDates, minOf(rfDates), freezes),
    freezes
  };
}

/* ---------- challenges ---------- */
function progressOf(st, sid, type, date) {
  const gr = G(st);
  if (type === 'hw') { let n = 0; for (const a of hwList(st)) { const s = subOf(st, a.id, sid); if (s && s.status === 'done' && iranISO(new Date(s.at)) === date) n++; } return n; }
  if (type === 'help') return (st.leaderLogs || []).filter(l => l.leader === sid && l.help && l.date === date).length;
  if (type === 'reflect') return (gr.reflections || []).some(r => r.sid === sid && r.date === date) ? 1 : 0;
  if (type === 'attend') return (st.attendance || {})[date] && st.attendance[date][sid] === 'present' ? 1 : 0;
  if (type === 'quiz') return (st.quizzes || []).filter(q => { const s = q.submissions && q.submissions[sid]; return s && iranISO(new Date(s.at)) === date; }).length;
  if (type === 'vote') return (st.polls || []).filter(p => p.votes && p.votes[sid] !== undefined && p.createdAt === date).length;
  return 0;
}
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function dailyFor(st, sid, date) {
  const act = (G(st).challenges || []).filter(c => c.active !== false && c.scope !== 'weekly');
  if (!act.length) return [];
  const h = hash(date + sid), out = [], pool = act.slice();
  for (let i = 0; i < 3 && pool.length; i++) out.push(pool.splice((h + i * 7) % pool.length, 1)[0]);
  return out;
}
function weeklyProgress(st, c) {
  const ws = weekStart(todayISO());
  if (c.type === 'hw') { let n = 0; for (const a of hwList(st)) for (const sid in hwSubs(st)[a.id] || {}) { const s = hwSubs(st)[a.id][sid]; if (s.status === 'done' && iranISO(new Date(s.at)) >= ws) n++; } return n; }
  if (c.type === 'attend') { const ds = Object.keys(st.attendance || {}).filter(d => d >= ws); if (!ds.length) return 0; let p = 0, t = 0; ds.forEach(d => { for (const sid in st.attendance[d]) { t++; if (st.attendance[d][sid] === 'present') p++; } }); return t ? Math.round(p / t * 100) : 0; }
  if (c.type === 'reflect') return (G(st).reflections || []).filter(r => r.date >= ws).length;
  return 0;
}
function challengeView(st, sid) {
  const gr = G(st), date = todayISO();
  const daily = dailyFor(st, sid, date).map(c => {
    const cur = progressOf(st, sid, c.type, date);
    const claimed = (gr.claims || []).some(x => x.sid === sid && x.cid === c.id && x.date === date);
    return { c, cur, claimed, claimable: !claimed && cur >= c.target };
  });
  const weekly = (gr.challenges || []).filter(c => c.scope === 'weekly' && c.active !== false).map(c => {
    const target = c.perStudent ? c.target * (st.students || []).length : c.target;
    const cur = weeklyProgress(st, c);
    const claimed = (gr.claims || []).some(x => x.sid === sid && x.cid === c.id && x.week === weekStart(date));
    return { c, cur, target, claimed, claimable: !claimed && cur >= target };
  });
  return { daily, weekly };
}

/* ---------- boxes ---------- */
function roll() {
  const total = RAR.reduce((a, r) => a + r.w, 0);
  let x = Math.random() * total;
  for (const r of RAR) { x -= r.w; if (x <= 0) return r; }
  return RAR[0];
}
function boxInfo(st, sid) {
  const gr = G(st), date = todayISO();
  const openedToday = (gr.boxes || []).filter(b => b.sid === sid && iranISO(new Date(b.at)) === date).length;
  const eligible = approvedHw(st, sid).length - (gr.boxes || []).filter(b => b.sid === sid).length;
  return { available: Math.max(0, Math.min(eligible, gr.settings.boxDailyMax - openedToday)), openedToday, eligible: Math.max(0, eligible) };
}

/* ---------- buddies ---------- */
const pairOf = (st, sid) => (G(st).buddies || []).find(p => p.active !== false && (p.a === sid || p.b === sid));
const buddyToday = (st, helper) => (G(st).management || []).filter(m => m.sid === helper && m.by === 'buddy' && iranISO(new Date(m.at)) === todayISO()).length;

/* ---------- reflections / mood ---------- */
function moodHeat(st, days) {
  const ds = []; for (let i = days - 1; i >= 0; i--) ds.push(addDays(todayISO(), -i));
  const rows = (st.students || []).map(s => {
    const cells = ds.map(d => { const r = (G(st).reflections || []).find(x => x.sid === s.id && x.date === d); return r ? r.mood : 0; });
    const last3 = cells.slice(-3);
    const alert = last3.length === 3 && last3.every(v => v > 0 && v <= 2);
    return { id: s.id, name: s.name, cells, alert };
  });
  return { days: ds, rows, alerts: rows.filter(r => r.alert) };
}

/* ---------- ensure / seed ---------- */
function grEnsure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  if (st.growth && Array.isArray(st.growth.challenges)) {
    const s = Object.assign({}, SETTINGS, st.growth.settings || {});
    const ch = JSON.stringify(s) !== JSON.stringify(st.growth.settings);
    st.growth.settings = s;
    ['management', 'claims', 'boxes', 'buddies', 'reflections', 'goals', 'kudos'].forEach(k => { if (!Array.isArray(st.growth[k])) { st.growth[k] = []; } });
    if (!st.growth.freezes) st.growth.freezes = {};
    return ch;
  }
  st.growth = {
    settings: Object.assign({}, SETTINGS),
    challenges: [
      { id: 'gc1', title: 'یک تکلیف کامل ثبت کن', type: 'hw', target: 1, points: 3, scope: 'daily', active: true },
      { id: 'gc2', title: 'به یک هم‌کلاسی کمک کن', type: 'help', target: 1, points: 4, scope: 'daily', active: true },
      { id: 'gc3', title: 'حال امروزت را ثبت کن', type: 'reflect', target: 1, points: 2, scope: 'daily', active: true },
      { id: 'gc4', title: 'امروز حاضر باش', type: 'attend', target: 1, points: 2, scope: 'daily', active: true },
      { id: 'gc5', title: 'در یک نظرسنجی رأی بده', type: 'vote', target: 1, points: 2, scope: 'daily', active: true },
      { id: 'gc6', title: 'قهرمان هفته: ۵ تکلیف کامل در کلاس', type: 'hw', target: 5, points: 6, scope: 'weekly', perStudent: true, active: true },
      { id: 'gc7', title: 'هفتهٔ حضور: میانگین حضور کلاس ۹۵٪', type: 'attend', target: 95, points: 5, scope: 'weekly', perStudent: false, active: true }
    ],
    claims: [], boxes: [], buddies: [], reflections: [], goals: [], kudos: [], management: [], freezes: {}
  };
  return true;
}

/* ---------- view ---------- */
function grView(st, session) {
  grEnsure(st);
  const gr = st.growth;
  if (session.role === 'teacher') return { growth: clone(gr), management: clone(gr.management) };
  const sid = session.sid;
  const mine = arr => (arr || []).filter(x => x.sid === sid);
  const heat = moodHeat(st, 14);
  const classMood = heat.days.map((d, i) => {
    const vals = heat.rows.map(r => r.cells[i]).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  return {
    growth: {
      settings: clone(gr.settings),
      challenges: clone((gr.challenges || []).filter(c => c.active !== false)),
      claims: mine(gr.claims), boxes: mine(gr.boxes),
      buddies: clone((gr.buddies || []).filter(p => p.a === sid || p.b === sid)),
      reflections: mine(gr.reflections), goals: mine(gr.goals),
      kudos: (gr.kudos || []).filter(k => k.from === sid || k.to === sid),
      management: mine(gr.management),
      freezes: { [sid]: (gr.freezes || {})[sid] || 0 },
      classMood
    },
    computed: { streaks: streaks(st, sid), challenges: challengeView(st, sid), box: boxInfo(st, sid) }
  };
}

/* ---------- commands ---------- */
function applyGr(st, cmd, session) {
  grEnsure(st);
  const gr = st.growth, sid = session.sid, D = todayISO();
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  let result = null;
  switch (cmd.type) {
    case 'gr.challenge.create': {
      teacher();
      const title = str(cmd.title, 90); if (!title) throw bad('عنوان چالش الزامی است');
      const type = CT[cmd.ct] ? cmd.ct : 'hw';
      const id = str(cmd.id, 24) || uid();
      gr.challenges.push({ id, title, type, target: clamp(Math.round(num(cmd.target) || 1), 1, 200), points: clamp(Math.round(num(cmd.points) || 2), 1, 30), scope: cmd.scope === 'weekly' ? 'weekly' : 'daily', perStudent: !!cmd.perStudent, active: true });
      result = { id }; break;
    }
    case 'gr.challenge.update': {
      teacher(); const c = gr.challenges.find(x => x.id === cmd.id); if (!c) throw bad('چالش یافت نشد');
      if (cmd.title != null) c.title = str(cmd.title, 90) || c.title;
      if (cmd.target != null) c.target = clamp(Math.round(num(cmd.target) || 1), 1, 200);
      if (cmd.points != null) c.points = clamp(Math.round(num(cmd.points) || 1), 1, 30);
      if (cmd.active != null) c.active = !!cmd.active;
      break;
    }
    case 'gr.challenge.delete': teacher(); gr.challenges = gr.challenges.filter(c => c.id !== cmd.id); break;
    case 'gr.claim': {
      if (session.role !== 'student') throw forb('برداشت جایزه مخصوص دانش‌آموز است.');
      if (!gr.settings.challenges) throw bad('چالش‌ها خاموش است');
      const c = gr.challenges.find(x => x.id === cmd.cid2); if (!c || c.active === false) throw bad('چالش یافت نشد');
      if (c.scope === 'weekly') {
        const wk = weekStart(D);
        if (gr.claims.some(x => x.sid === sid && x.cid === c.id && x.week === wk)) throw bad('جایزهٔ این چالش را این هفته گرفته‌ای');
        const target = c.perStudent ? c.target * (st.students || []).length : c.target;
        if (weeklyProgress(st, c) < target) throw bad('هنوز به هدف نرسیده‌اید');
        gr.claims.push({ id: uid(), sid, cid: c.id, week: wk, at: T() });
      } else {
        if (gr.claims.some(x => x.sid === sid && x.cid === c.id && x.date === D)) throw bad('جایزهٔ امروز را گرفته‌ای');
        if (progressOf(st, sid, c.type, D) < c.target) throw bad('هنوز به هدف نرسیده‌ای');
        gr.claims.push({ id: uid(), sid, cid: c.id, date: D, at: T() });
      }
      pushPts(st, sid, c.points, '🎯 چالش: ' + c.title, 'challenge', c.id);
      result = { points: c.points }; break;
    }
    case 'gr.box.open': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      if (!gr.settings.boxes) throw bad('جعبهٔ شانس خاموش است');
      const info = boxInfo(st, sid);
      if (info.available <= 0) throw bad('جعبهٔ آماده نداری؛ اول یک تکلیف را به تأیید برسان');
      const r = roll();
      const pts = r.min + Math.floor(Math.random() * (r.max - r.min + 1));
      const id = uid();
      gr.boxes.push({ id, sid, rarity: r.k, points: pts, freeze: r.freeze || 0, at: T() });
      if (pts) pushPts(st, sid, pts, '🎁 جعبهٔ شانس (' + r.l + ')', 'box', id);
      if (r.freeze) gr.freezes[sid] = (gr.freezes[sid] || 0) + r.freeze;
      result = { rarity: r.k, label: r.l, color: r.c, points: pts, freeze: r.freeze || 0 }; break;
    }
    case 'gr.freeze.buy': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      const cost = gr.settings.freezeCost;
      if (walletBalance(st, sid) < cost) throw bad('سکهٔ کافی نداری (' + fa(cost) + ' لازم است)');
      pushPts(st, sid, -cost, '🧊 خرید فریز استریک', 'freeze', uid());
      gr.freezes[sid] = (gr.freezes[sid] || 0) + 1;
      result = { freezes: gr.freezes[sid] }; break;
    }
    case 'gr.reflect': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      if (!gr.settings.reflection) throw bad('تأمل خاموش است');
      const mood = clamp(Math.round(num(cmd.mood) || 3), 1, 5);
      const ex = gr.reflections.find(r => r.sid === sid && r.date === D);
      const data = { mood, note: str(cmd.note, 300), gratitude: str(cmd.gratitude, 200) };
      if (ex) Object.assign(ex, data);
      else { gr.reflections.push(Object.assign({ id: uid(), sid, date: D, at: T() }, data)); pushPts(st, sid, gr.settings.reflectPoints, '🪞 ثبت حال امروز', 'reflect', uid()); }
      result = { first: !ex }; break;
    }
    case 'gr.goal.set': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      const text = str(cmd.text, 200); if (!text) throw bad('هدف را بنویس');
      const wk = weekStart(D);
      const ex = gr.goals.find(g2 => g2.sid === sid && g2.week === wk);
      if (ex) ex.text = text; else gr.goals.push({ id: uid(), sid, week: wk, text, achieved: false, at: T() });
      break;
    }
    case 'gr.goal.review': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      const wk = weekStart(D);
      const g2 = gr.goals.find(x
