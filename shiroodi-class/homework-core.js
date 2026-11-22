/* homework-core.js — هستهٔ مشترک ماژول تکالیف (مرورگر + سرور) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__hwCore) return;
g.__hwCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, norm = C.norm, en = C.en, num = C.num, mean = C.mean, fa = C.fa;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, jShort = C.jShort, jLabel = C.jLabel;
const stuById = C.stuById, groupOf = C.groupOf, leaderGids = C.leaderGids;

const HK = {
  written:  { l: 'نوشتاری', i: '✍️', c: '#1d4ed8' },
  practice: { l: 'تمرینی',  i: '🧮', c: '#f97316' },
  reading:  { l: 'خواندنی', i: '📖', c: '#0ea5e9' },
  memorize: { l: 'حفظی',    i: '🧠', c: '#7c3aed' },
  project:  { l: 'پروژه',   i: '🛠️', c: '#0d9488' },
  art:      { l: 'هنری',    i: '🎨', c: '#e11d48' }
};
const HS = {
  done:    { l: 'انجام دادم', i: '✅', c: '#16a34a', short: 'د' },
  partial: { l: 'ناقص',       i: '🌗', c: '#f59e0b', short: 'ن' },
  cant:    { l: 'نتوانستم',   i: '❌', c: '#e11d48', short: 'خ' }
};
const HR = {
  none:       { l: 'ثبت نشده',        i: '⏳', c: '#7b7261' },
  waiting:    { l: 'در انتظار بررسی', i: '📥', c: '#1d4ed8' },
  leader_ok:  { l: 'تأیید سرگروه',    i: '🏅', c: '#65a30d' },
  leader_fix: { l: 'اصلاح خواسته',    i: '↩️', c: '#f59e0b' },
  approved:   { l: 'تأیید نهایی',     i: '🎖️', c: '#16a34a' },
  redo:       { l: 'بازنویسی',        i: '🔁', c: '#e11d48' }
};
const HP = {
  overdue:  { l: 'عقب‌افتاده', i: '🔥', c: '#e11d48' },
  today:    { l: 'مهلت امروز', i: '⏰', c: '#f59e0b' },
  upcoming: { l: 'پیش رو',     i: '🗓️', c: '#1d4ed8' },
  closed:   { l: 'بسته',       i: '🔒', c: '#7b7261' }
};
const NOTES = [
  'همهٔ تمرین‌ها را نوشتم.', 'نوشتم ولی سؤال آخر را نفهمیدم.',
  'با کمک مادرم کامل کردم.', 'دفترم را آوردم، سرگروه دید.',
  'نصفش را نوشتم، بقیه سخت بود.', 'وقت نکردم کامل کنم.',
  'کتابم را جا گذاشتم.', 'خواندم و برای مادرم توضیح دادم.',
  'عکسش را فرستادم.', 'دو بار تمرین کردم تا یاد گرفتم.'
];

function settingsDefault() { return { leaderApproval: true, allowLate: true, latePenalty: 30, remind: true, proof: false }; }
function lcg(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function dueTs(a) {
  const d = isoToDate(a.dueAt);
  const p = String(a.dueTime || '23:59').split(':');
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), (Number(p[0]) || 0) - 3, (Number(p[1]) || 0) - 30);
}
function phase(a, now) {
  now = now || Date.now();
  if (a.status === 'closed') return 'closed';
  if (now > dueTs(a)) return 'overdue';
  if (iranISO(new Date(now)) === a.dueAt) return 'today';
  return 'upcoming';
}
function audience(st, a) {
  if (!a || a.target === 'all' || !a.target) return st.students || [];
  const g = (st.groups || []).find(x => x.id === a.target);
  return ((g && g.members) || []).map(id => stuById(st, id)).filter(Boolean);
}
function targets(st, a, sid) { return audience(st, a).some(s => s.id === sid); }
function subOf(st, aid, sid) { return (st.homework && st.homework.subs && st.homework.subs[aid] && st.homework.subs[aid][sid]) || null; }
function reviewKey(sub) {
  if (!sub) return 'none';
  if (sub.teacherReview) return sub.teacherReview.verdict === 'approved' ? 'approved' : 'redo';
  if (sub.leaderCheck) return sub.leaderCheck.verdict === 'approved' ? 'leader_ok' : 'leader_fix';
  return 'waiting';
}
function isLate(a, at) { return new Date(at).getTime() > dueTs(a); }
function ordered(st) {
  return ((st.homework && st.homework.assignments) || []).slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0) || String(b.dueAt).localeCompare(String(a.dueAt)));
}
function award(st, a, sid, points, reason) {
  const sub = subOf(st, a.id, sid); if (!sub) return;
  const prev = Number(sub.points) || 0, delta = Math.round(points) - prev;
  if (delta) st.discipline.push({ id: uid(), sid, date: todayISO(), points: delta, reason, by: 'homework', hwid: a.id });
  sub.points = Math.round(points);
}

/* ---------- seed ---------- */
function buildSeed(st) {
  const S = st.students || [], G = st.groups || [];
  const Iran = G.find(x => x.name === 'ایران') || G[2] || G[0];
  const A = (id, title, subject, kind, assignedAt, dueAt, dueTime, points, extra) => Object.assign({
    id, title, subject, kind, description: '', assignedAt, dueAt, dueTime, points,
    target: 'all', requireProof: false, allowLate: true, status: 'published', order: 0, createdAt: assignedAt
  }, extra || {});
  const list = [
    A('hw1', 'تمرین کسرهای مساوی — صفحهٔ ۳۴', 'ریاضی', 'practice', '2026-11-17', '2026-11-19', '20:00', 3, { description: 'تمرین‌های ۱ تا ۶ صفحهٔ ۳۴ نوشته شود و راه‌حل تمرین ۵ شفاهی توضیح داده شود.', order: 1 }),
    A('hw2', 'روخوانی درس ۶ فارسی + معنی واژه‌ها', 'فارسی', 'reading', '2026-11-18', '2026-11-21', '21:00', 2, { description: 'درس با صدای بلند خوانده شود؛ واژه‌های نو در دفتر واژه نوشته شود.', order: 2 }),
    A('hw3', 'املا از درس ۵ — ۱۰ سطر', 'املا', 'written', '2026-11-19', '2026-11-22', '20:00', 3, { description: 'واژه‌های دشوار درس سه بار صحیح نوشته شود.', order: 3 }),
    A('hw4', 'آزمایش خانگی: تغییرات فیزیکی و شیمیایی', 'علوم تجربی', 'project', '2026-11-20', '2026-11-24', '18:00', 5, { description: 'یک تغییر فیزیکی و یک تغییر شیمیایی در خانه پیدا کن، عکس بگیر و در دو خط توضیح بده.', requireProof: true, order: 4 }),
    A('hw5', 'حفظ پیام درس ۵ هدیه‌ها', 'هدیه‌های آسمانی', 'memorize', '2026-11-21', '2026-11-23', '19:00', 2, { description: 'پیام درس حفظ و با یک مثال از زندگی روزمره بیان شود.', order: 5 }),
    A('hw6', 'نقشهٔ ایران: همسایه‌ها را رنگ کن', 'مطالعات اجتماعی', 'project', '2026-11-21', '2026-11-25', '18:00', 4, { description: 'روی نقشهٔ چاپی، هفت همسایهٔ ایران را رنگ کن و نامشان را بنویس.', target: Iran ? Iran.id : 'all', requireProof: true, order: 6 }),
    A('hw7', 'روخوانی سورهٔ حمد + ترجمه', 'قرآن', 'reading', '2026-11-22', '2026-11-26', '20:00', 2, { description: 'هر روز پنج سطر همراه فایل صوتی خوانده شود.', order: 7 }),
    A('hw8', 'کاردستی با کاغذ رنگی', 'هنر', 'art', '2026-11-15', '2026-11-18', '17:00', 3, { status: 'closed', description: 'یک شکل هندسی با کاغذ رنگی بساز و به کلاس بیاور.', order: 8 })
  ];
  const subs = {}, rnd = lcg(14050830), now = Date.now();
  const disc = [], logs = [];
  for (const a of list) {
    subs[a.id] = {};
    const aud = audience(st, a), ph = phase(a, now);
    const base = (ph === 'overdue' || ph === 'closed') ? .8 : ph === 'today' ? .55 : .26;
    aud.forEach((s, i) => {
      const r = rnd();
      if (r > base + .14) return;
      const status = r < base * .8 ? 'done' : r < base ? 'partial' : 'cant';
      const dayBack = ph === 'upcoming' ? 0 : Math.floor(rnd() * 2);
      const d = isoToDate(a.dueAt); d.setDate(d.getDate() - dayBack);
      const at = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 14 + Math.floor(rnd() * 5), Math.floor(rnd() * 59) - 30)).toISOString();
      const late = isLate(a, at);
      const sub = { status, at, note: NOTES[Math.floor(rnd() * NOTES.length)], proof: null, points: 0, late, leaderCheck: null, teacherReview: null };
      const g = groupOf(st, s.id);
      const leader = g && g.leader && g.leader !== s.id ? g.leader : null;
      const rr = rnd();
      if (status === 'done' && leader && rr < .55) {
        sub.leaderCheck = { by: leader, verdict: rr < .48 ? 'approved' : 'fix', note: rr < .48 ? 'دفترش را دیدم، کامل بود.' : 'دو تمرین ناقص بود، گفتم کامل کند.', at };
        logs.push({ id: uid(), gid: g.id, leader, member: s.id, date: C.iranISO(new Date(at)), homework: rr < .48 ? 'done' : 'partial', help: false, note: 'بررسی تکلیف: ' + a.title, points: 1, hwid: a.id });
      }
      if (status !== 'cant' && (ph === 'overdue' || ph === 'closed') && rr < .62) {
        const pts = Math.max(0, Math.round(a.points * (late ? .7 : 1) * (status === 'partial' ? .5 : 1)));
        sub.teacherReview = { verdict: 'approved', note: '', at, points: pts };
        sub.points = pts;
        if (pts) disc.push({ id: uid(), sid: s.id, date: C.iranISO(new Date(at)), points: pts, reason: 'تکلیف: ' + a.title, by: 'homework', hwid: a.id });
      } else if (status === 'cant' && ph === 'overdue' && rr < .3) {
        sub.teacherReview = { verdict: 'redo', note: 'فردا با کمک سرگروه کامل کن.', at, points: 0 };
      }
      subs[a.id][s.id] = sub;
    });
  }
  if (disc.length) st.discipline = (st.discipline || []).concat(disc);
  if (logs.length) st.leaderLogs = (st.leaderLogs || []).concat(logs);
  return { assignments: list, subs, settings: settingsDefault(), savedViews: [], seq: list.length };
}

function hwEnsure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  if (st.homework && Array.isArray(st.homework.assignments) && st.homework.subs) {
    let ch = false;
    const s = Object.assign(settingsDefault(), st.homework.settings || {});
    if (JSON.stringify(s) !== JSON.stringify(st.homework.settings)) { st.homework.settings = s; ch = true; }
    if (!Array.isArray(st.homework.savedViews)) { st.homework.savedViews = []; ch = true; }
    if (typeof st.homework.seq !== 'number') { st.homework.seq = st.homework.assignments.length; ch = true; }
    st.homework.assignments.forEach((a, i) => { if (typeof a.order !== 'number') { a.order = i + 1; ch = true; } });
    return ch;
  }
  st.homework = buildSeed(st);
  return true;
}

/* ---------- view (privacy) ---------- */
function hwView(st, session) {
  const hw = st.homework; if (!hw) return null;
  if (session.role === 'teacher') return clone(hw);
  const sid = session.sid, lead = leaderGids(st, sid);
  const out = { assignments: [], subs: {}, settings: clone(hw.settings || settingsDefault()), savedViews: [], seq: hw.seq || 0, lead };
  for (const a of ordered(st)) {
    if (a.status === 'draft' || !targets(st, a, sid)) continue;
    out.assignments.push(clone(a));
    const mine = hw.subs[a.id] && hw.subs[a.id][sid];
    if (mine) (out.subs[a.id] = out.subs[a.id] || {})[sid] = clone(mine);
    const g = groupOf(st, sid);
    if (g && lead.includes(g.id)) {
      for (const m of g.members || []) {
        if (m === sid) continue;
        const s = hw.subs[a.id] && hw.subs[a.id][m];
        if (s) (out.subs[a.id] = out.subs[a.id] || {})[m] = clone(s);
      }
    }
  }
  return out;
}

/* ---------- stats ---------- */
function hwStats(st, sid, now) {
  now = now || Date.now();
  const hw = st.homework || { assignments: [], subs: {} };
  let total = 0, done = 0, partial = 0, cant = 0, pending = 0, overdue = 0, approved = 0, redo = 0, pts = 0, late = 0, today = 0;
  for (const a of hw.assignments || []) {
    if (a.status === 'draft' || !targets(st, a, sid)) continue;
    total++;
    const sub = hw.subs[a.id] && hw.subs[a.id][sid];
    const ph = phase(a, now);
    if (ph === 'today') today++;
    if (!sub) { pending++; if (ph === 'overdue') overdue++; continue; }
    if (sub.status === 'done') done++; else if (sub.status === 'partial') partial++; else cant++;
    if (sub.late) late++;
    pts += Number(sub.points) || 0;
    const rk = reviewKey(sub);
    if (rk === 'approved') approved++;
    if (rk === 'redo') { redo++; if (ph !== 'closed') pending++; }
    if (rk === 'redo' && ph === 'overdue') overdue++;
  }
  const submitted = done + partial + cant;
  return {
    total, done, partial, cant, pending, overdue, approved, redo, pts, late, today, submitted,
    rate: total ? Math.round((done + partial * .5) / total * 100) : 0,
    doneRate: total ? Math.round(done / total * 100) : 0
  };
}
function hwAssignmentStats(st, a, now) {
  const aud = audience(st, a);
  let done = 0, partial = 0, cant = 0, waiting = 0, approved = 0, redo = 0, leaderOk = 0, pts = 0;
  for (const s of aud) {
    const sub = subOf(st, a.id, s.id);
    if (!sub) continue;
    if (sub.status === 'done') done++; else if (sub.status === 'partial') partial++; else cant++;
    const rk = reviewKey(sub);
    if (rk === 'waiting') waiting++;
    else if (rk === 'approved') approved++;
    else if (rk === 'redo') redo++;
    else if (rk === 'leader_ok') { leaderOk++; waiting++; }
    else if (rk === 'leader_fix') waiting++;
    pts += Number(sub.points) || 0;
  }
  const total = aud.length;
  return { total, done, partial, cant, missing: total - done - partial - cant, waiting, approved, redo, leaderOk, pts, rate: total ? Math.round((done + partial * .5) / total * 100) : 0, phase: phase(a, now) };
}
function hwClass(st, now) {
  now = now || Date.now();
  const hw = st.homework || { assignments: [], subs: {} };
  const list = ordered(st).filter(a => a.status !== 'draft');
  const perSubject = {};
  for (const a of list) {
    const s = hwAssignmentStats(st, a, now);
    const k = a.subject;
    perSubject[k] = perSubject[k] || { sub: k, rate: 0, n: 0, done: 0, total: 0, pts: 0 };
    perSubject[k].n++; perSubject[k].done += s.done; perSubject[k].total += s.total; perSubject[k].pts += s.pts;
  }
  const subjects = Object.values(perSubject).map(x => { x.rate = x.total ? Math.round(x.done / x.total * 100) : 0; return x; }).sort((a, b) => b.rate - a.rate);
  const perStudent = (st.students || []).map(s => Object.assign({ id: s.id, name: s.name, avatar: s.avatar }, hwStats(st, s.id, now)));
  const withHw = perStudent.filter(s => s.total);
  const atRisk = withHw.filter(s => s.rate < 60 || s.overdue >= 2).sort((a, b) => a.rate - b.rate);
  const top = withHw.slice().sort((a, b) => b.rate - a.rate || b.pts - a.pts).slice(0, 6);
  let waiting = 0, approved = 0, pts = 0, done = 0, slots = 0, overdue = 0;
  const inbox = [];
  for (const a of list) {
    const s = hwAssignmentStats(st, a, now);
    waiting += s.waiting; approved += s.approved; pts += s.pts; done += s.done; slots += s.total;
    for (const stu of audience(st, a)) {
      const sub = subOf(st, a.id, stu.id);
      if (!sub) { if (s.phase === 'overdue') overdue++; continue; }
      const rk = reviewKey(sub);
      if (rk === 'waiting' || rk === 'leader_ok' || rk === 'leader_fix') inbox.push({ a, stu, sub, rk });
    }
  }
  inbox.sort((x, y) => String(x.sub.at).localeCompare(String(y.sub.at)));
  const byDay = {};
  for (const a of list) for (const sid in (hw.subs[a.id] || {})) {
    const sub = hw.subs[a.id][sid];
    const d = C.iranISO(new Date(sub.at));
    byDay[d] = byDay[d] || { done: 0, all: 0 };
    byDay[d].all++; if (sub.status === 'done') byDay[d].done++;
  }
  const days = Object.keys(byDay).sort().slice(-14);
  return {
    list, subjects, perStudent, atRisk, top, inbox, waiting, approved, pts, overdue,
    rate: slots ? Math.round(done / slots * 100) : 0, done, slots,
    trend: days.map(d => byDay[d].all ? byDay[d].done / byDay[d].all * 100 : 0),
    trendLabels: days.map(d => { const j = C.jOf(d); return fa(j.jd) + ' ' + C.JMONTHS[j.jm - 1].slice(0, 4); }),
    activeCount: list.filter(a => a.status !== 'closed').length
  };
}

/* ---------- commands ---------- */
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const PROOF_MAX = 130000;

function cleanProof(v) {
  if (v == null || v === '') return null;
  const s = String(v);
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(s)) throw bad('فایل تصویر نامعتبر است');
  if (s.length > PROOF_MAX) throw bad('حجم عکس زیاد است؛ عکس کوچک‌تری بفرست');
  return s;
}
function readAssignment(st, src, existing) {
  const title = str(src.title, 120);
  if (!title) throw bad('عنوان تکلیف الزامی است');
  const subject = str(src.subject, 40);
  if (!(st.subjects || []).includes(subject)) throw bad('درس را از فهرست انتخاب کنید');
  const dueAt = C.parseDateAny(src.dueAt);
  if (!dueAt) throw bad('تاریخ تحویل نامعتبر است');
  const assignedAt = C.parseDateAny(src.assignedAt) || todayISO();
  const tm = /^([01]?\d|2[0-3]):([0-5]\d)$/.test(String(src.dueTime || '')) ? String(src.dueTime) : '20:00';
  const target = src.target && src.target !== 'all' ? String(src.target) : 'all';
  if (target !== 'all' && !(st.groups || []).some(g => g.id === target)) throw bad('گروه نامعتبر است');
  return {
    title, subject, kind: HK[src.kind] ? src.kind : 'written',
    description: str(src.description, 600), assignedAt, dueAt, dueTime: tm,
    points: clamp(Math.round(num(src.points) || 0), 0, 20),
    target, requireProof: !!src.requireProof, allowLate: src.allowLate !== false,
    status: ['published', 'draft', 'closed'].includes(src.status) ? src.status : (existing ? existing.status : 'published')
  };
}
function applyHw(st, cmd, session) {
  hwEnsure(st);
  const hw = st.homework, T = cmd.type, D = todayISO(), sid = session.sid;
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  const findA = id => { const a = hw.assignments.find(x => x.id === id); if (!a) throw bad('تکلیف یافت نشد'); return a; };
  let result = null;

  switch (T) {
    case 'hw.create': {
      teacher();
      const data = readAssignment(st, cmd.data || {});
      const id = str(cmd.id, 24) || uid();
      const order = (hw.assignments.reduce((m, a) => Math.max(m, a.order || 0), 0) || 0) + 1;
      hw.assignments.push(Object.assign({ id, order, createdAt: D }, data));
      hw.subs[id] = {}; hw.seq = (hw.seq || 0) + 1;
      result = { id }; break;
    }
    case 'hw.update': {
      teacher();
      const a = findA(cmd.id);
      Object.assign(a, readAssignment(st, cmd.data || {}, a));
      break;
    }
    case 'hw.delete': {
      teacher();
      hw.assignments = hw.assignments.filter(a => a.id !== cmd.id);
      delete hw.subs[cmd.id];
      st.discipline = (st.discipline || []).filter(d => d.hw !== cmd.id && d.hwid !== cmd.id);
      st.leaderLogs = (st.leaderLogs || []).filter(l => l.hwid !== cmd.id);
      break;
    }
    case 'hw.bulkDelete': {
      teacher();
      const ids = (cmd.ids || []).slice(0, 60);
      hw.assignments = hw.assignments.filter(a => !ids.includes(a.id));
      ids.forEach(id => { delete hw.subs[id]; });
      st.discipline = (st.discipline || []).filter(d => !ids.includes(d.hwid));
      st.leaderLogs = (st.leaderLogs || []).filter(l => !ids.includes(l.hwid));
      break;
    }
    case 'hw.status': {
      teacher();
      const a = findA(cmd.id);
      a.status = ['published', 'draft', 'closed'].includes(cmd.status) ? cmd.status : (a.status === 'closed' ? 'published' : 'closed');
      break;
    }
    case 'hw.reorder': {
      teacher();
      const arr = ordered(st);
      const from = Math.round(num(cmd.from)), to = Math.round(num(cmd.to));
      if (!(from >= 0 && from < arr.length && to >= 0 && to < arr.length)) throw bad('جابه‌جایی نامعتبر');
      const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
      arr.forEach((a, i) => { a.order = i + 1; });
      break;
    }
    case 'hw.submit': {
      if (session.role !== 'student') throw forb('ثبت تکلیف مخصوص دانش‌آموز است.');
      const a = findA(cmd.aid);
      if (a.status !== 'published') throw bad('این تکلیف باز نیست');
      if (!targets(st, a, sid)) throw bad('این تکلیف برای شما نیست');
      const status = HS[cmd.status] ? cmd.status : null;
      if (!status) throw bad('وضعیت را انتخاب کنید');
      hw.subs[a.id] = hw.subs[a.id] || {};
      const prev = hw.subs[a.id][sid];
      if (prev && prev.teacherReview && prev.teacherReview.verdict === 'approved') throw bad('این تکلیف تأیید نهایی شده و قابل تغییر نیست');
      const late = isLate(a, new Date().toISOString());
      if (late && !a.allowLate) throw bad('مهلت این تکلیف تمام شده است');
      const proof = cleanProof(cmd.proof);
      if (a.requireProof && status === 'done' && !proof && !(prev && prev.proof)) throw bad('این تکلیف عکس می‌خواهد؛ عکس دفترت را بفرست');
      hw.subs[a.id][sid] = {
        status, at: new Date().toISOString(), note: str(cmd.note, 400),
        proof: proof || (prev ? prev.proof : null) || null,
        points: prev ? prev.points || 0 : 0, late,
        leaderCheck: null, teacherReview: null
      };
      result = { late }; break;
    }
    case 'hw.withdraw': {
      if (session.role !== 'student') throw forb('مخصوص دانش‌آموز است.');
      const a = findA(cmd.aid);
      const sub = subOf(st, a.id, sid);
      if (!sub) throw bad('ثبتی یافت نشد');
      if (sub.teacherReview) throw bad('این تکلیف بررسی شده و قابل حذف نیست');
      if (sub.points) award(st, a, sid, 0, 'حذف تکلیف: ' + a.title);
      delete hw.subs[a.id][sid];
      break;
    }
    case 'hw.leaderCheck': {
      if (session.role !== 'student') throw forb('بررسی مخصوص سرگروه است.');
      const a = findA(cmd.aid);
      const g = (st.groups || []).find(x => x.leader === sid && (x.members || []).includes(cmd.sid));
      if (!g) throw forb('شما سرگروه این دانش‌آموز نیستید.');
      if (cmd.sid === sid) throw bad('تکلیف خودت را نمی‌توانی تأیید کنی');
      if (!targets(st, a, cmd.sid)) throw bad('این تکلیف برای گروه شما نیست');
      const sub = subOf(st, a.id, cmd.sid);
      if (!sub) throw bad('این دانش‌آموز هنوز تکلیف را ثبت نکرده است');
      if (sub.teacherReview) throw bad('معلم قبلاً بررسی کرده است');
      const verdict = cmd.verdict === 'approved' ? 'approved' : 'fix';
      const already = (st.leaderLogs || []).some(l => l.hwid === a.id && l.leader === sid && l.member === cmd.sid);
      sub.leaderCheck = { by: sid, verdict, note: str(cmd.note, 300), at: new Date().toISOString() };
      if (!already) {
        st.leaderLogs = st.leaderLogs || [];
        st.leaderLogs.push({ id: uid(), gid: g.id, leader: sid, member: cmd.sid, date: D, homework: verdict === 'approved' ? 'done' : 'partial', help: false, note: 'بررسی تکلیف: ' + a.title, points: 1, hwid: a.id });
      }
      result = { earned: already ? 0 : 1 }; break;
    }
    case 'hw.review':
    case 'hw.bulkReview': {
      teacher();
      const a = findA(cmd.aid);
      const verdict = cmd.verdict === 'redo' ? 'redo' : 'approved';
      const sids = T === 'hw.bulkReview' ? (cmd.sids || []).slice(0, 300) : [cmd.sid];
      let n = 0, given = 0;
      for (const s of sids) {
        const sub = subOf(st, a.id, s); if (!sub) continue;
        if (!stuById(st, s)) continue;
        let pts = 0;
        if (verdict === 'approved') {
          const raw = cmd.points == null ? a.points : Math.round(num(cmd.points) || 0);
          const factor = (sub.status === 'partial' ? .5 : sub.status === 'cant' ? 0 : 1) * (sub.late ? (1 - clamp(hw.settings.latePenalty, 0, 90) / 100) : 1);
          pts = clamp(Math.round(raw * factor), 0, 20);
        }
        sub.teacherReview = { verdict, note: str(cmd.note, 300), at: new Date().toISOString(), points: pts };
        award(st, a, s, pts, 'تکلیف: ' + a.title);
        given += pts; n++;
      }
      if (!n) throw bad('ثبتی برای بررسی یافت نشد');
      result = { reviewed: n, points: given }; break;
    }
    case 'hw.clearProof': {
      teacher();
      const sub = subOf(st, cmd.aid, cmd.sid);
      if (sub) sub.proof = null;
      break;
    }
    case 'hw.settings': {
      teacher();
      const p = cmd.patch || {};
      if (p.leaderApproval != null) hw.settings.leaderApproval = !!p.leaderApproval;
      if (p.allowLate != null) hw.settings.allowLate = !!p.allowLate;
      if (p.remind != null) hw.settings.remind = !!p.remind;
      if (p.proof != null) hw.settings.proof = !!p.proof;
      if (p.latePenalty != null) hw.settings.latePenalty = clamp(Math.round(num(p.latePenalty) || 0), 0, 90);
      break;
    }
    case 'hw.viewSave': {
      teacher();
      const name = str(cmd.name, 50); if (!name) throw bad('نام نما الزامی است');
      hw.savedViews.push({ id: uid(), name, q: str(cmd.q, 50), subject: str(cmd.subject, 40), phase: str(cmd.phase, 20), group: str(cmd.group, 24), sort: str(cmd.sort, 20) });
      if (hw.savedViews.length > 16) hw.savedViews.shift();
      break;
    }
    case 'hw.viewDelete': teacher(); hw.savedViews = hw.savedViews.filter(v => v.id !== cmd.id); break;
    case 'hw.import': {
      teacher();
      const rows = Array.isArray(cmd.rows) ? cmd.rows.slice(0, 2000) : [];
      const map = cmd.map || {};
      const get = (r, k) => { const i = map[k]; return i == null || i === '' ? '' : String(r[i] == null ? '' : r[i]).trim(); };
      let n = 0; const err = [];
      if (cmd.kind === 'assignments') {
        rows.forEach((r, i) => {
          try {
            const data = readAssignment(st, {
              title: get(r, 'title'), subject: get(r, 'subject'), kind: get(r, 'kind'),
              dueAt: get(r, 'dueAt'), dueTime: get(r, 'dueTime'), points: get(r, 'points'),
              description: get(r, 'description'), target: 'all', status: 'published'
            });
            const id = uid();
            hw.assignments.push(Object.assign({ id, order: hw.assignments.length + 1, createdAt: D }, data));
            hw.subs[id] = {}; n++;
          } catch (e) { err.push({ row: i + 2, msg: e.message }); }
        });
      } else {
        rows.forEach((r, i) => {
          const title = norm(get(r, 'title'));
          const a = hw.assignments.find(x => norm(x.title) === title);
          if (!a) { err.push({ row: i + 2, msg: 'تکلیف «' + get(r, 'title') + '» یافت نشد' }); return; }
          const code = en(get(r, 'code')), nm = norm(get(r, 'name'));
          const stu = (st.students || []).find(x => x.code === code) || (st.students || []).find(x => norm(x.name) === nm);
          if (!stu) { err.push({ row: i + 2, msg: 'دانش‌آموز یافت نشد' }); return; }
          const raw = norm(get(r, 'status'));
          const status = HS[raw] ? raw : (raw === 'انجام دادم' || raw === 'د' || raw === 'done' ? 'done' : (raw === 'ناقص' || raw === 'ن' ? 'partial' : (raw === 'نتوانستم' || raw === 'خ' ? 'cant' : null)));
          if (!status) { err.push({ row: i + 2, msg: 'وضعیت نامعتبر' }); return; }
          hw.subs[a.id] = hw.subs[a.id] || {};
          const prev = hw.subs[a.id][stu.id];
          hw.subs[a.id][stu.id] = { status, at: new Date().toISOString(), note: str(get(r, 'note'), 400), proof: prev ? prev.proof : null, points: prev ? prev.points || 0 : 0, late: false, leaderCheck: null, teacherReview: prev ? prev.teacherReview : null };
          n++;
        });
      }
      if (!n) throw bad(err[0] ? err[0].msg : 'هیچ ردیف معتبری یافت نشد');
      result = { applied: n, skipped: err.length, errors: err.slice(0, 12) }; break;
    }
    default: throw bad('عملیات تکلیف ناشناخته: ' + T);
  }
  return { state: st, result };
}

/* ---------- patch core ---------- */
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;

C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; e.code = 'unauthorized'; throw e; }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { st.homework = buildSeed(st); }
    else hwEnsure(st);
    return out;
  }
  if (cmd.type.indexOf('hw.') !== 0) return baseApply(st, cmd, session);
  const cid = String(cmd.cid || '').slice(0, 40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const out = applyHw(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); st.homework = buildSeed(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); hwEnsure(st); return st; };
C.viewFor = function (st, session) {
  const v = baseView(st, session);
  if (v) v.homework = hwView(st, session);
  return v;
};

C.HK = HK; C.HS = HS; C.HR = HR; C.HP = HP; C.HNOTES = NOTES;
C.hwEnsure = hwEnsure; C.hwView = hwView; C.hwDueTs = dueTs; C.hwPhase = phase;
C.hwAudience = audience; C.hwTargets = targets; C.hwSubOf = subOf; C.hwReviewKey = reviewKey;
C.hwIsLate = isLate; C.hwOrdered = ordered; C.hwStats = hwStats; C.hwAStats = hwAssignmentStats;
C.hwClass = hwClass; C.hwSettingsDefault = settingsDefault;
})(typeof globalThis !== 'undefined' ? globalThis : this);
