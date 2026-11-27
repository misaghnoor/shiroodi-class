/* growth-core.js v2 — استریک، چالش، جعبه شانس، هم‌یار، آینه و پاسخگویی (هستهٔ مشترک) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__growthCore) return;
g.__growthCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, norm = C.norm, num = C.num, fa = C.fa, faNum = C.faNum, mean = C.mean;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const jOf = C.jOf, jShort = C.jShort, jLabel = C.jLabel, wdIdx = C.wdIdx;
const stuById = C.stuById, groupOf = C.groupOf, stats = C.stats, LMAX = C.LMAX, levelFor = C.levelFor;
const subjectAvgFor = C.subjectAvgFor, subjectSeries = C.subjectSeries;

/* ---------------- constants ---------------- */
const STREAKS = {
  att:    { l: 'حضور',   i: '🗓️', c: '#16a34a', d: 'روزهای پیاپی حضور در کلاس' },
  hw:     { l: 'تکلیف',  i: '📚', c: '#1d4ed8', d: 'تکلیف‌های پیاپی کامل' },
  clean:  { l: 'انضباط', i: '🛡️', c: '#7c3aed', d: 'روزهای پیاپی بدون تخلف' },
  mirror: { l: 'آینه',   i: '🪞', c: '#0ea5e9', d: 'روزهای پیاپی احوال‌پرسی' }
};
const QK = {
  hw_done:    { l: 'تکلیف کامل',        i: '📚', c: '#1d4ed8' },
  hw_read:    { l: 'تکلیف خواندنی',     i: '📖', c: '#0ea5e9' },
  att:        { l: 'حضور امروز',        i: '🗓️', c: '#16a34a' },
  checkin:    { l: 'احوال‌پرسی',        i: '🪞', c: '#7c3aed' },
  help:       { l: 'کمک به هم‌یار',     i: '🤝', c: '#0d9488' },
  vote:       { l: 'شرکت در نظرسنجی',   i: '🗳️', c: '#d97706' },
  quiz:       { l: 'شرکت در آزمون',     i: '🧠', c: '#e11d48' },
  clean:      { l: 'روز بی‌تخلف',       i: '🛡️', c: '#65a30d' },
  good_grade: { l: 'نمرهٔ درخشان',      i: '🌟', c: '#f59e0b' },
  goal_set:   { l: 'هدف‌گذاری هفته',    i: '🎯', c: '#8b5cf6' },
  manual:     { l: 'تأیید معلم',        i: '✅', c: '#7b7261' }
};
const RARITY = {
  common: { l: 'معمولی',   c: '#64748b', g: '#cbd5e1' },
  rare:   { l: 'کمیاب',    c: '#1d4ed8', g: '#93c5fd' },
  epic:   { l: 'حماسی',    c: '#7c3aed', g: '#c4b5fd' },
  legend: { l: 'افسانه‌ای', c: '#d97706', g: '#fcd34d' }
};
const PRIZES = [
  { w: 26, r: 'common', t: 'xp',      n: 10, l: '۱۰ تجربه',              i: '⚡' },
  { w: 22, r: 'common', t: 'points',  n: 1,  l: '۱ امتیاز',              i: '🪙' },
  { w: 14, r: 'common', t: 'xp',      n: 20, l: '۲۰ تجربه',              i: '⚡' },
  { w: 12, r: 'rare',   t: 'points',  n: 3,  l: '۳ امتیاز',              i: '💰' },
  { w: 8,  r: 'rare',   t: 'freeze',  n: 1,  l: 'یک استریک فریز',        i: '🧊' },
  { w: 7,  r: 'rare',   t: 'spin',    n: 1,  l: 'یک چرخش دیگر',          i: '🎰' },
  { w: 5,  r: 'epic',   t: 'points',  n: 6,  l: '۶ امتیاز',              i: '💎' },
  { w: 3,  r: 'epic',   t: 'xp',      n: 60, l: '۶۰ تجربه',              i: '🌠' },
  { w: 2,  r: 'legend', t: 'points',  n: 12, l: '۱۲ امتیاز',             i: '👑' },
  { w: 1,  r: 'legend', t: 'voucher', n: 1,  l: 'کارت معافیت یک تکلیف',  i: '🎴' }
];
const RANKS = ['نوآموز', 'کاوشگر', 'پویا', 'ماهر', 'چیره‌دست', 'استاد', 'قهرمان', 'افسانه'];
const MOODS = [
  { n: 1, e: '😢', l: 'خیلی سخت', c: '#e11d48' },
  { n: 2, e: '😕', l: 'کمی سخت',  c: '#f97316' },
  { n: 3, e: '😐', l: 'معمولی',   c: '#f59e0b' },
  { n: 4, e: '🙂', l: 'خوب',      c: '#65a30d' },
  { n: 5, e: '😄', l: 'عالی',     c: '#16a34a' }
];
const AUTO_POOL = [
  { key: 'hw1',  kind: 'hw_done',    n: 1, points: 2, xp: 15, title: 'یک تکلیف را کامل ثبت کن' },
  { key: 'att',  kind: 'att',        n: 1, points: 1, xp: 10, title: 'امروز در کلاس حاضر باش' },
  { key: 'mir',  kind: 'checkin',    n: 1, points: 1, xp: 8,  title: 'احوال‌پرسی امروزت را ثبت کن' },
  { key: 'help', kind: 'help',       n: 1, points: 3, xp: 20, title: 'به یک هم‌کلاسی کمک کن' },
  { key: 'read', kind: 'hw_read',    n: 1, points: 2, xp: 15, title: 'یک تکلیف خواندنی انجام بده' },
  { key: 'vote', kind: 'vote',       n: 1, points: 1, xp: 10, title: 'در یک نظرسنجی شرکت کن' },
  { key: 'quiz', kind: 'quiz',       n: 1, points: 3, xp: 25, title: 'در یک آزمون شرکت کن' },
  { key: 'cln',  kind: 'clean',      n: 1, points: 2, xp: 12, title: 'امروز هیچ تخلفی ثبت نشود' },
  { key: 'grd',  kind: 'good_grade', n: 1, points: 3, xp: 20, title: 'یک نمرهٔ خوب یا خیلی خوب بگیر' },
  { key: 'gol',  kind: 'goal_set',   n: 1, points: 1, xp: 10, title: 'هدف این هفته‌ات را بنویس' }
];

/* ---------------- helpers ---------------- */
const D = () => todayISO();
const T = () => new Date().toISOString();
const dayOf = at => iranISO(new Date(at));
function weekKey(iso) { const d = isoToDate(iso || D()); d.setDate(d.getDate() - wdIdx(iso || D())); return dateToISO(d); }
function shift(iso, n) { const d = isoToDate(iso); d.setDate(d.getDate() + n); return dateToISO(d); }
function lastDays(n, end) { const out = []; let d = end || D(); for (let i = 0; i < n; i++) { out.unshift(d); d = shift(d, -1); } return out; }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const G = st => st.growth;
const freezeUsed = (st, sid) => new Set((((G(st).freezes || {})[sid] || {}).used) || []);
const freezeCount = (st, sid) => (((G(st).freezes || {})[sid] || {}).count) || 0;
const spins = (st, sid) => (G(st).spins || {})[sid] || 0;
const vouchers = (st, sid) => (G(st).vouchers || {})[sid] || 0;

function hasRef(st, ref) {
  if (!ref) return false;
  if ((G(st).ledger || []).some(e => e.ref === ref)) return true;
  if ((st.discipline || []).some(d => d.gref === ref)) return true;
  if ((st.leaderLogs || []).some(l => l.gref === ref)) return true;
  return false;
}
/* grant: xp → ledger | points → discipline | mgmt → leaderLogs (management score) */
function grant(st, sid, o) {
  const ref = o.ref || null;
  if (ref && hasRef(st, ref)) return false;
  if (!stuById(st, sid)) return false;
  const gr = G(st);
  if (o.xp) gr.ledger.push({ id: uid(), sid, at: T(), kind: o.kind || 'xp', xp: Math.round(o.xp), reason: o.reason || '', ref });
  if (o.points) st.discipline.push({ id: uid(), sid, date: D(), points: Math.round(o.points), reason: o.reason || '', by: 'growth', gref: ref });
  if (o.mgmt) {
    const g = groupOf(st, sid);
    st.leaderLogs.push({
      id: uid(), gid: g ? g.id : '', leader: sid, member: sid, date: D(),
      homework: 'done', help: false, note: o.reason || '', points: Math.round(o.mgmt),
      gkind: o.kind || 'growth', gref: ref
    });
  }
  if (o.spin) gr.spins[sid] = spins(st, sid) + Math.round(o.spin);
  if (o.freeze) { const f = gr.freezes[sid] || { count: 0, used: [] }; f.count += Math.round(o.freeze); gr.freezes[sid] = f; }
  if (o.voucher) gr.vouchers[sid] = vouchers(st, sid) + Math.round(o.voucher);
  return true;
}
function act(st, sid, kind, ref) {
  if (!sid) return;
  if (ref && (G(st).acts || []).some(a => a.ref === ref)) return;
  G(st).acts.push({ id: uid(), sid, kind, date: D(), at: T(), ref: ref || null });
  if (G(st).acts.length > 4000) G(st).acts = G(st).acts.slice(-3000);
}

/* ---------------- xp / level ---------------- */
function xpTotal(st, sid) { return (G(st).ledger || []).filter(e => e.sid === sid).reduce((a, e) => a + (e.xp || 0), 0); }
function levelInfo(xp) {
  let level = 1, rem = Math.max(0, Math.round(xp || 0)), need = 100;
  while (rem >= need && level < 80) { rem -= need; level++; need = Math.round(100 * Math.pow(1.1, level - 1)); }
  return { level, into: rem, need, pct: Math.round(rem / need * 100), xp: Math.round(xp || 0) };
}
const rankName = l => RANKS[Math.min(RANKS.length - 1, Math.floor((l - 1) / 5))];

/* ---------------- streaks ---------------- */
function attSeq(st, sid) {
  const days = Object.keys(st.attendance || {}).sort(), fz = freezeUsed(st, sid);
  const val = d => { const v = st.attendance[d][sid]; if (v === 'present' || v === 'late') return 1; if (!v || v === 'excused') return 0; return fz.has(d) ? 0 : -1; };
  let cur = 0;
  for (let i = days.length - 1; i >= 0; i--) { const r = val(days[i]); if (r < 0) break; cur += r; }
  let best = 0, run = 0;
  for (const d of days) { const r = val(d); if (r < 0) { best = Math.max(best, run); run = 0; } else { run += r; best = Math.max(best, run); } }
  return { cur, best: Math.max(best, cur) };
}
function hwList(st, sid) {
  const hw = st.homework; if (!hw || !Array.isArray(hw.assignments)) return [];
  return hw.assignments.filter(a => a.status !== 'draft' && (!C.hwTargets || C.hwTargets(st, a, sid)))
    .slice().sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
}
function hwSeq(st, sid) {
  const list = hwList(st, sid), fz = freezeUsed(st, sid), today = D();
  const sub = a => (st.homework.subs[a.id] || {})[sid];
  const val = a => { const s = sub(a); if (s && s.status === 'done') return 1; if (s) return fz.has(a.dueAt) ? 0 : -1; if (a.dueAt > today) return 0; return fz.has(a.dueAt) ? 0 : -1; };
  let cur = 0;
  for (let i = list.length - 1; i >= 0; i--) { const r = val(list[i]); if (r < 0) break; cur += r; }
  let best = 0, run = 0;
  for (const a of list) { const r = val(a); if (r < 0) { best = Math.max(best, run); run = 0; } else { run += r; best = Math.max(best, run); } }
  return { cur, best: Math.max(best, cur) };
}
function cleanSeq(st, sid) {
  const days = Object.keys(st.attendance || {}).sort(), fz = freezeUsed(st, sid);
  const neg = new Set((st.discipline || []).filter(d => d.sid === sid && (Number(d.points) || 0) < 0).map(d => d.date));
  const val = d => { const v = st.attendance[d][sid]; if (!v || v === 'absent') return 0; if (!neg.has(d)) return 1; return fz.has(d) ? 0 : -1; };
  let cur = 0;
  for (let i = days.length - 1; i >= 0; i--) { const r = val(days[i]); if (r < 0) break; cur += r; }
  let best = 0, run = 0;
  for (const d of days) { const r = val(d); if (r < 0) { best = Math.max(best, run); run = 0; } else { run += r; best = Math.max(best, run); } }
  return { cur, best: Math.max(best, cur) };
}
function mirrorSeq(st, sid) {
  const set = new Set((G(st).checkins || []).filter(c => c.sid === sid).map(c => c.date)), fz = freezeUsed(st, sid);
  let cur = 0, d = isoToDate(D());
  if (!set.has(D())) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 500; i++) { const iso = dateToISO(d); if (set.has(iso)) cur++; else if (!fz.has(iso)) break; d.setDate(d.getDate() - 1); }
  const dates = [...set].sort(); let best = 0, run = 0, prev = null;
  for (const iso of dates) { if (prev && shift(prev, 1) === iso) run++; else run = 1; best = Math.max(best, run); prev = iso; }
  return { cur, best: Math.max(best, cur) };
}
function streaks(st, sid) {
  if (!st.growth) return { att: { cur: 0, best: 0 }, hw: { cur: 0, best: 0 }, clean: { cur: 0, best: 0 }, mirror: { cur: 0, best: 0 } };
  return { att: attSeq(st, sid), hw: hwSeq(st, sid), clean: cleanSeq(st, sid), mirror: mirrorSeq(st, sid) };
}
function syncStreaks(st) {
  const gr = G(st), ms = gr.settings.streakMilestones || [3, 5, 7, 10, 14, 21, 30];
  const added = [];
  for (const s of st.students || []) {
    const sk = streaks(st, s.id);
    for (const kind in STREAKS) {
      for (const n of ms) {
        if (sk[kind].cur < n) continue;
        const ref = 'ms:' + s.id + ':' + kind + ':' + n;
        if (gr.milestones.some(m => m.ref === ref)) continue;
        gr.milestones.push({ id: uid(), sid: s.id, kind, n, at: T(), ref });
        grant(st, s.id, { points: gr.settings.streakReward, xp: 5 * n, spin: n >= 5 ? 1 : 0, reason: `🔥 ${fa(n)} روز ${STREAKS[kind].l} پیاپی`, ref: 'msr:' + s.id + ':' + kind + ':' + n, kind: 'streak' });
        added.push({ sid: s.id, kind, n });
      }
    }
  }
  return added;
}

/* ---------------- quests ---------------- */
/* 🔧 نسخهٔ تاریخ‌محور + گارد: هرگز عضو undefined نمی‌خواند */
function autoQuests(date) {
  const d = (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : D();
  const N = AUTO_POOL.length;
  const h = hash(d), out = [];
  const idx = [(h % N), ((h >> 4) % N), ((h >> 8) % N)];
  const seen = new Set();
  for (let i = 0; i < idx.length; i++) {
    let k = idx[i], guard = 0;
    while (seen.has(k) && guard++ < N) k = (k + 1) % N;
    if (seen.has(k)) continue;
    seen.add(k);
    if (AUTO_POOL[k]) out.push(AUTO_POOL[k]);
  }
  return out.map(p => ({
    id: 'auto:' + d + ':' + p.key, auto: true, kind: p.kind, title: p.title, n: p.n,
    points: p.points, xp: p.xp, icon: (QK[p.kind] || QK.manual).i, scope: 'all', targetId: '', from: d, to: d,
    daily: true, active: true, createdAt: d
  }));
}
function questsFor(st, sid, date) {
  const gr = G(st), d = date || D(), out = [];
  if (gr.settings.questsAuto !== false) out.push(...autoQuests(d));
  for (const q of gr.quests || []) {
    if (q.active === false) continue;
    if (q.from && d < q.from) continue;
    if (q.to && d > q.to) continue;
    if (q.scope === 'group' && q.targetId) { const g = (st.groups || []).find(x => x.id === q.targetId); if (!g || !(g.members || []).includes(sid)) continue; }
    if (q.scope === 'student' && q.targetId && q.targetId !== sid) continue;
    out.push(q);
  }
  return out;
}
function inRange(iso, q) { if (!iso) return false; if (q.from && iso < q.from) return false; if (q.to && iso > q.to) return false; return true; }
function progress(st, q, sid, date) {
  const gr = G(st), d = date || D();
  const rng = q.daily ? { from: d, to: d } : { from: q.from || d, to: q.to || d };
  switch (q.kind) {
    case 'hw_done': case 'hw_read': {
      let n = 0;
      for (const a of hwList(st, sid)) {
        if (q.kind === 'hw_read' && a.kind !== 'reading') continue;
        const s = (st.homework.subs[a.id] || {})[sid];
        if (s && s.status === 'done' && inRange(dayOf(s.at), rng)) n++;
      }
      return n;
    }
    case 'att': { const v = (st.attendance || {})[d] && st.attendance[d][sid]; return (v === 'present' || v === 'late') ? 1 : 0; }
    case 'checkin': return (gr.checkins || []).filter(c => c.sid === sid && inRange(c.date, rng)).length;
    case 'help': return (gr.helps || []).filter(h => h.by === sid && h.status !== 'rejected' && inRange(h.date, rng)).length;
    case 'vote': case 'quiz': return (gr.acts || []).filter(a => a.sid === sid && a.kind === q.kind && inRange(a.date, rng)).length;
    case 'clean': { const v = (st.attendance || {})[d] && st.attendance[d][sid]; if (!v || v === 'absent') return 0; return (st.discipline || []).some(x => x.sid === sid && x.date === d && (Number(x.points) || 0) < 0) ? 0 : 1; }
    case 'good_grade': {
      let n = 0;
      for (const a of st.assessments || []) { if (!inRange(a.date, rng)) continue; for (const sub of a.subjects || []) { const gv = st.grades?.[a.id]?.[sub]?.[sid]; if (gv == null) continue; const l = levelFor(st, gv); if (l && (l.key === 'good' || l.key === 'excellent')) n++; } }
      return n;
    }
    case 'goal_set': return (gr.goals || []).filter(x => x.sid === sid && x.week === weekKey(d)).length ? 1 : 0;
    case 'manual': return (gr.marks || []).filter(m => m.qid === q.id && m.sid === sid && inRange(m.date, rng)).length;
    default: return 0;
  }
}
function claimOf(st, qid, sid, date) { return (G(st).claims || []).find(c => c.qid === qid && c.sid === sid && c.date === (date || D())) || null; }

/* ---------------- buddies ---------------- */
const buddyOf = (st, sid) => (G(st).buddies || []).filter(b => b.active !== false && (b.mentor === sid || b.mentee === sid));
function buddyEffect(st, b) {
  const s = subjectSeries(st, b.mentee, b.subject);
  if (s.length < 2) return null;
  const start = dayOf(b.createdAt);
  const before = s.filter(x => x.date < start).map(x => x.score);
  const after = s.filter(x => x.date >= start).map(x => x.score);
  if (!before.length || !after.length) return null;
  return { before: mean(before), after: mean(after), delta: mean(after) - mean(before), n: after.length };
}

/* ---------------- class analytics ---------------- */
function classStats(st) {
  const gr = G(st), days = lastDays(14);
  const per = (st.students || []).map(s => {
    const sk = streaks(st, s.id), xp = xpTotal(st, s.id);
    return { id: s.id, name: s.name, avatar: s.avatar, streaks: sk, xp, level: levelInfo(xp).level, spins: spins(st, s.id), freeze: freezeCount(st, s.id), voucher: vouchers(st, s.id) };
  });
  const moods = days.map(d => { const v = (gr.checkins || []).filter(c => c.date === d).map(c => c.mood); return v.length ? mean(v) : null; });
  const flags = [];
  for (const s of st.students || []) {
    const cs = (gr.checkins || []).filter(c => c.sid === s.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    if (cs.length === 3 && cs.every(c => c.mood <= 2)) flags.push({ sid: s.id, name: s.name, kind: 'mood', text: 'سه روز پیاپی حال پایین' });
    const sk = streaks(st, s.id);
    if (sk.att.cur === 0 && sk.att.best >= 5) flags.push({ sid: s.id, name: s.name, kind: 'streak', text: 'زنجیرهٔ حضور شکست' });
  }
  const claims = gr.claims || [];
  const approved = claims.filter(c => c.status === 'approved');
  const boxes = gr.boxes || [];
  const rarityCount = {}; boxes.forEach(b => { rarityCount[b.prize.r] = (rarityCount[b.prize.r] || 0) + 1; });
  const topXp = per.slice().sort((a, b) => b.xp - a.xp).slice(0, 8);
  const topStreak = per.slice().sort((a, b) => (b.streaks.att.cur + b.streaks.hw.cur) - (a.streaks.att.cur + a.streaks.hw.cur)).slice(0, 8);
  const helps = (gr.helps || []).filter(h => h.status === 'approved');
  const acc = (st.leaderLogs || []).filter(l => l.gkind === 'acc');
  return { per, days, moods, flags, claims, approved, boxes, rarityCount, topXp, topStreak, helps, acc, checkins: gr.checkins || [], goals: gr.goals || [], quests: gr.quests || [] };
}
function accLog(st, sid) {
  return (st.leaderLogs || []).filter(l => l.gkind === 'acc' && (!sid || l.leader === sid))
    .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* ---------------- settings / ensure ---------------- */
function settingsDefault() {
  return {
    enabled: true, questsAuto: true, questAutoApprove: true,
    boxEnabled: true, boxRareBoost: 100,
    buddyEnabled: true, buddyDailyCap: 3, buddyNeedConfirm: true, buddyNeedTeacher: true, buddyFalse: 1,
    checkinEnabled: true, freezeCost: 6, streakReward: 2, streakMilestones: [3, 5, 7, 10, 14, 21, 30],
    xp: { hw: 15, quiz: 25, vote: 8, checkin: 8, help: 20 },
    acc: { enabled: true, judgeReturn: 2, reportReject: 1, verdictApproved: 2, reportApproved: 1 }
  };
}
function ensure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  if (st.growth && st.growth.settings && Array.isArray(st.growth.ledger)) {
    const d = settingsDefault(); let ch = false;
    for (const k in d) if (st.growth.settings[k] === undefined) { st.growth.settings[k] = d[k]; ch = true; }
    for (const k in d.acc) if (st.growth.settings.acc[k] === undefined) { st.growth.settings.acc[k] = d.acc[k]; ch = true; }
    for (const k in d.xp) if (st.growth.settings.xp[k] === undefined) { st.growth.settings.xp[k] = d.xp[k]; ch = true; }
    ['quests', 'claims', 'boxes', 'buddies', 'helps', 'checkins', 'goals', 'ledger', 'milestones', 'acts', 'marks'].forEach(k => { if (!Array.isArray(st.growth[k])) { st.growth[k] = []; ch = true; } });
    ['spins', 'freezes', 'vouchers'].forEach(k => { if (!st.growth[k] || typeof st.growth[k] !== 'object') { st.growth[k] = {}; ch = true; } });
    return ch;
  }
  const today = D();
  st.growth = {
    settings: settingsDefault(),
    quests: [
      { id: uid(), title: 'این هفته سه تکلیف را کامل کن', kind: 'hw_done', n: 3, points: 5, xp: 40, icon: '📚', scope: 'all', targetId: '', from: weekKey(today), to: shift(weekKey(today), 4), daily: false, active: true, createdAt: today },
      { id: uid(), title: 'این هفته به دو هم‌کلاسی کمک کن', kind: 'help', n: 2, points: 6, xp: 45, icon: '🤝', scope: 'all', targetId: '', from: weekKey(today), to: shift(weekKey(today), 4), daily: false, active: true, createdAt: today },
      { id: uid(), title: 'پنج روز احوال‌پرسی‌ات را ثبت کن', kind: 'checkin', n: 5, points: 4, xp: 35, icon: '🪞', scope: 'all', targetId: '', from: weekKey(today), to: shift(weekKey(today), 6), daily: false, active: true, createdAt: today }
    ],
    claims: [], boxes: [], spins: {}, freezes: {}, vouchers: {},
    buddies: [], helps: [], checkins: [], goals: [], ledger: [], milestones: [], acts: [], marks: [], seq: 0
  };
  syncStreaks(st);
  return true;
}

/* ---------------- view ---------------- */
function view(st, session) {
  ensure(st);
  const gr = G(st);
  if (session.role === 'teacher') return clone(gr);
  const sid = session.sid, pub = clone(gr.settings);
  delete pub.acc;
  return {
    settings: pub,
    quests: (gr.quests || []).filter(q => q.active !== false && (q.scope === 'all' || (q.scope === 'student' && q.targetId === sid) || (q.scope === 'group' && ((st.groups || []).find(x => x.id === q.targetId) || { members: [] }).members.includes(sid)))),
    claims: (gr.claims || []).filter(c => c.sid === sid),
    boxes: (gr.boxes || []).filter(b => b.sid === sid).slice(-30),
    spins: { [sid]: spins(st, sid) },
    freezes: { [sid]: gr.freezes[sid] || { count: 0, used: [] } },
    vouchers: { [sid]: vouchers(st, sid) },
    buddies: (gr.buddies || []).filter(b => b.mentor === sid || b.mentee === sid),
    helps: (gr.helps || []).filter(h => h.by === sid || h.sid === sid),
    checkins: (gr.checkins || []).filter(c => c.sid === sid),
    goals: (gr.goals || []).filter(x => x.sid === sid),
    ledger: (gr.ledger || []).filter(e => e.sid === sid).slice(-120),
    milestones: (gr.milestones || []).filter(m => m.sid === sid),
    acts: (gr.acts || []).filter(a => a.sid === sid),
    marks: (gr.marks || []).filter(m => m.sid === sid),
    seq: 0
  };
}

/* ---------------- commands ---------------- */
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

function pickPrize(st) {
  const boost = clamp(num(G(st).settings.boxRareBoost) || 100, 20, 250) / 100;
  const weights = PRIZES.map(p => p.r === 'common' ? p.w : p.w * boost);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) { r -= weights[i]; if (r <= 0) return PRIZES[i]; }
  return PRIZES[0];
}
function readQuest(st, src, ex) {
  const title = str(src.title, 120); if (!title) throw bad('عنوان چالش الزامی است');
  const kind = QK[src.kind] ? src.kind : 'manual';
  const from = C.parseDateAny(src.from) || D(), to = C.parseDateAny(src.to) || shift(from, 6);
  if (to < from) throw bad('پایان نباید پیش از شروع باشد');
  const scope = ['all', 'group', 'student'].includes(src.scope) ? src.scope : 'all';
  if (scope === 'group' && !(st.groups || []).some(x => x.id === src.targetId)) throw bad('گروه را انتخاب کن');
  if (scope === 'student' && !stuById(st, src.targetId)) throw bad('دانش‌آموز را انتخاب کن');
  return {
    title, kind, n: clamp(Math.round(num(src.n) || 1), 1, 50),
    points: clamp(Math.round(num(src.points) || 0), 0, 30), xp: clamp(Math.round(num(src.xp) || 0), 0, 300),
    icon: str(src.icon, 6) || QK[kind].i, scope, targetId: scope === 'all' ? '' : str(src.targetId, 24),
    from, to, daily: !!src.daily, active: src.active !== false
  };
}

function apply(st, cmd, session) {
  ensure(st);
  const gr = G(st), sid = session.sid, T0 = D(), t = cmd.type;
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  const student = () => { if (session.role !== 'student') throw forb('این عملیات مخصوص دانش‌آموز است.'); };
  let result = null;

  switch (t) {
    /* ---- settings ---- */
    case 'gr.settings': {
      teacher();
      const p = cmd.patch || {};
      ['enabled', 'questsAuto', 'questAutoApprove', 'boxEnabled', 'buddyEnabled', 'buddyNeedConfirm', 'buddyNeedTeacher', 'checkinEnabled'].forEach(k => { if (p[k] != null) gr.settings[k] = !!p[k]; });
      if (p.boxRareBoost != null) gr.settings.boxRareBoost = clamp(Math.round(num(p.boxRareBoost) || 100), 20, 250);
      if (p.buddyDailyCap != null) gr.settings.buddyDailyCap = clamp(Math.round(num(p.buddyDailyCap) || 3), 1, 10);
      if (p.buddyFalse != null) gr.settings.buddyFalse = clamp(Math.round(num(p.buddyFalse) || 0), 0, 10);
      if (p.freezeCost != null) gr.settings.freezeCost = clamp(Math.round(num(p.freezeCost) || 6), 1, 50);
      if (p.streakReward != null) gr.settings.streakReward = clamp(Math.round(num(p.streakReward) || 2), 0, 20);
      if (p.acc && typeof p.acc === 'object') ['enabled', 'judgeReturn', 'reportReject', 'verdictApproved', 'reportApproved'].forEach(k => {
        if (p.acc[k] == null) return;
        gr.settings.acc[k] = k === 'enabled' ? !!p.acc[k] : clamp(Math.round(num(p.acc[k]) || 0), 0, 20);
      });
      if (p.xp && typeof p.xp === 'object') ['hw', 'quiz', 'vote', 'checkin', 'help'].forEach(k => { if (p.xp[k] != null) gr.settings.xp[k] = clamp(Math.round(num(p.xp[k]) || 0), 0, 200); });
      break;
    }
    /* ---- quests ---- */
    case 'gr.quest.create': {
      teacher();
      const data = readQuest(st, cmd.data || {});
      const id = str(cmd.id, 24) || uid();
      gr.quests.push(Object.assign({ id, createdAt: T0 }, data));
      result = { id }; break;
    }
    case 'gr.quest.update': { teacher(); const q = gr.quests.find(x => x.id === cmd.id); if (!q) throw bad('چالش یافت نشد'); Object.assign(q, readQuest(st, cmd.data || {}, q)); break; }
    case 'gr.quest.toggle': { teacher(); const q = gr.quests.find(x => x.id === cmd.id); if (q) q.active = q.active === false; break; }
    case 'gr.quest.delete': { teacher(); gr.quests = gr.quests.filter(x => x.id !== cmd.id); gr.claims = gr.claims.filter(c => c.qid !== cmd.id); break; }
    case 'gr.quest.mark': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      gr.marks.push({ id: uid(), qid: str(cmd.qid, 40), sid: cmd.sid, date: C.parseDateAny(cmd.date) || T0, at: T() });
      break;
    }
    case 'gr.quest.claim': {
      student();
      if (gr.settings.enabled === false) throw bad('بخش رشد موقتاً بسته است');
      const date = C.parseDateAny(cmd.date) || T0;
      const q = questsFor(st, sid, date).find(x => x.id === cmd.qid);
      if (!q) throw bad('این چالش برای شما فعال نیست');
      if (claimOf(st, q.id, sid, date)) throw bad('پاداش این چالش را قبلاً گرفته‌ای');
      const p = progress(st, q, sid, date);
      if (p < q.n) throw bad(`هنوز کامل نشده؛ ${fa(q.n - p)} مورد دیگر مانده`);
      const auto = gr.settings.questAutoApprove !== false;
      const id = str(cmd.id, 24) || uid();
      gr.claims.push({ id, qid: q.id, sid, date, title: q.title, icon: q.icon, points: q.points, xp: q.xp, at: T(), status: auto ? 'approved' : 'pending', review: auto ? { verdict: 'approved', by: 'auto', at: T() } : null });
      if (auto) {
        grant(st, sid, { points: q.points, xp: q.xp, spin: 1, reason: '🎯 چالش: ' + q.title, ref: 'q:' + q.id + ':' + sid + ':' + date, kind: 'quest' });
        result = { approved: true, points: q.points, xp: q.xp };
      } else result = { approved: false };
      break;
    }
    case 'gr.quest.review':
    case 'gr.quest.bulkReview': {
      teacher();
      const ids = t === 'gr.quest.bulkReview' ? (cmd.ids || []).slice(0, 200) : [cmd.id];
      const verdict = cmd.verdict === 'rejected' ? 'rejected' : 'approved';
      let n = 0, pts = 0;
      for (const id of ids) {
        const c = gr.claims.find(x => x.id === id); if (!c || c.status !== 'pending') continue;
        c.status = verdict; c.review = { verdict, by: 'teacher', note: str(cmd.note, 200), at: T() };
        if (verdict === 'approved') { grant(st, c.sid, { points: c.points, xp: c.xp, spin: 1, reason: '🎯 چالش: ' + c.title, ref: 'q:' + c.qid + ':' + c.sid + ':' + c.date, kind: 'quest' }); pts += c.points; }
        n++;
      }
      if (!n) throw bad('درخواستی برای بررسی یافت نشد');
      result = { reviewed: n, points: pts }; break;
    }
    /* ---- streak freeze ---- */
    case 'gr.freeze.buy': {
      student();
      const cost = gr.settings.freezeCost;
      const w = C.wallet ? C.wallet(st, sid) : { balance: 0 };
      if (w.balance < cost) throw bad(`امتیاز کافی نداری؛ ${fa(cost - w.balance)} امتیاز دیگر لازم است`);
      const f = gr.freezes[sid] || { count: 0, used: [] };
      f.count++; gr.freezes[sid] = f;
      st.discipline.push({ id: uid(), sid, date: T0, points: -cost, reason: '🧊 خرید استریک فریز', by: 'growth', gref: 'fz:' + sid + ':' + Date.now() });
      result = { count: f.count }; break;
    }
    case 'gr.freeze.use': {
      student();
      const date = C.parseDateAny(cmd.date); if (!date) throw bad('تاریخ نامعتبر');
      if (date > T0) throw bad('روز آینده را نمی‌توان فریز کرد');
      const f = gr.freezes[sid] || { count: 0, used: [] };
      if (f.count <= 0) throw bad('استریک فریز نداری');
      if (f.used.includes(date)) throw bad('این روز قبلاً فریز شده');
      f.count--; f.used.push(date); f.used = f.used.slice(-60); gr.freezes[sid] = f;
      syncStreaks(st);
      result = { count: f.count }; break;
    }
    case 'gr.freeze.grant': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      const f = gr.freezes[cmd.sid] || { count: 0, used: [] };
      f.count += clamp(Math.round(num(cmd.n) || 1), 1, 10); gr.freezes[cmd.sid] = f;
      break;
    }
    /* ---- box ---- */
    case 'gr.box.open': {
      student();
      if (gr.settings.boxEnabled === false) throw bad('جعبهٔ شانس موقتاً بسته است');
      if (spins(st, sid) <= 0) throw bad('چرخش نداری؛ با تکلیف، چالش یا آزمون به‌دست بیاور');
      const prize = pickPrize(st);
      gr.spins[sid] = spins(st, sid) - 1;
      const id = uid();
      gr.boxes.push({ id, sid, at: T(), source: str(cmd.source, 30) || 'spin', prize: { t: prize.t, n: prize.n, l: prize.l, i: prize.i, r: prize.r } });
      if (prize.t === 'spin') gr.spins[sid] = spins(st, sid) + prize.n;
      else grant(st, sid, { xp: prize.t === 'xp' ? prize.n : 0, points: prize.t === 'points' ? prize.n : 0, freeze: prize.t === 'freeze' ? prize.n : 0, voucher: prize.t === 'voucher' ? prize.n : 0, reason: '🎰 جعبهٔ شانس: ' + prize.l, ref: 'box:' + id, kind: 'box' });
      result = { prize: { t: prize.t, n: prize.n, l: prize.l, i: prize.i, r: prize.r }, spins: spins(st, sid) }; break;
    }
    case 'gr.box.grant': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      gr.spins[cmd.sid] = spins(st, cmd.sid) + clamp(Math.round(num(cmd.n) || 1), 1, 20);
      break;
    }
    case 'gr.box.mystery': {
      teacher();
      const pool = (st.students || []).filter(s => !cmd.sid || s.id === cmd.sid);
      if (!pool.length) throw bad('دانش‌آموزی نیست');
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const pts = clamp(Math.round(num(cmd.points) || 5), 1, 30);
      grant(st, pick.id, { points: pts, xp: pts * 3, reason: '🎁 پاداش شانس امروز', ref: 'mys:' + T0 + ':' + pick.id + ':' + Date.now(), kind: 'mystery' });
      result = { sid: pick.id, name: pick.name, points: pts }; break;
    }
    case 'gr.box.classGift': {
      teacher();
      const pts = clamp(Math.round(num(cmd.points) || 2), 1, 20);
      let n = 0;
      for (const s of st.students || []) { grant(st, s.id, { points: pts, xp: pts * 2, reason: '🎉 هدیهٔ کلاسی معلم', ref: 'gift:' + T0 + ':' + s.id + ':' + Date.now(), kind: 'gift' }); n++; }
      result = { n, points: pts }; break;
    }
    case 'gr.voucher.use': {
      teacher();
      if (vouchers(st, cmd.sid) <= 0) throw bad('کارت معافیت ندارد');
      gr.vouchers[cmd.sid] = vouchers(st, cmd.sid) - 1;
      st.discipline.push({ id: uid(), sid: cmd.sid, date: T0, points: 0, reason: '🎴 استفاده از کارت معافیت: ' + str(cmd.note, 80), by: 'growth', gref: 'vc:' + cmd.sid + ':' + Date.now() });
      break;
    }
    /* ---- buddies ---- */
    case 'gr.buddy.create': {
      teacher();
      const m = stuById(st, cmd.mentor), n2 = stuById(st, cmd.mentee);
      if (!m || !n2 || m.id === n2.id) throw bad('دو دانش‌آموز متفاوت انتخاب کن');
      const subject = (st.subjects || []).includes(cmd.subject) ? cmd.subject : (st.subjects || [])[0];
      if ((gr.buddies || []).some(b => b.active !== false && ((b.mentor === m.id && b.mentee === n2.id) || (b.mentor === n2.id && b.mentee === m.id)))) throw bad('این دو نفر هم‌یار هم هستند');
      const id = str(cmd.id, 24) || uid();
      gr.buddies.push({ id, mentor: m.id, mentee: n2.id, subject, active: true, createdAt: T(), note: str(cmd.note, 200) });
      result = { id }; break;
    }
    case 'gr.buddy.auto': {
      teacher();
      const subject = (st.subjects || []).includes(cmd.subject) ? cmd.subject : (st.subjects || [])[0];
      const busy = new Set(); (gr.buddies || []).filter(b => b.active !== false).forEach(b => { busy.add(b.mentor); busy.add(b.mentee); });
      const rank = (st.students || []).filter(s => !busy.has(s.id))
        .map(s => ({ id: s.id, v: subjectAvgFor(st, s.id, subject) }))
        .filter(x => x.v != null).sort((a, b) => b.v - a.v);
      let n = 0;
      while (rank.length >= 2) {
        const a = rank.shift(), b = rank.pop();
        gr.buddies.push({ id: uid(), mentor: a.id, mentee: b.id, subject, active: true, createdAt: T(), note: 'جفت‌سازی هوشمند' });
        n++;
      }
      if (!n) throw bad('دانش‌آموز آزادِ دارای نمره برای جفت‌سازی نیست');
      result = { pairs: n, subject }; break;
    }
    case 'gr.buddy.toggle': { teacher(); const b = gr.buddies.find(x => x.id === cmd.id); if (b) b.active = b.active === false; break; }
    case 'gr.buddy.delete': { teacher(); gr.buddies = gr.buddies.filter(x => x.id !== cmd.id); gr.helps = gr.helps.filter(h => h.bid !== cmd.id); break; }
    case 'gr.buddy.log': {
      student();
      if (gr.settings.buddyEnabled === false) throw bad('بخش هم‌یار بسته است');
      const b = gr.buddies.find(x => x.id === cmd.bid && x.active !== false);
      if (!b || b.mentor !== sid) throw forb('شما هم‌یارِ راهنمای این جفت نیستید');
      const cap = gr.settings.buddyDailyCap;
      if ((gr.helps || []).filter(h => h.by === sid && h.date === T0 && h.status !== 'rejected').length >= cap) throw bad(`سقف امروز ${fa(cap)} ثبت است`);
      const topic = str(cmd.topic, 120), note = str(cmd.note, 400);
      if (!topic) throw bad('موضوع کمک را بنویس');
      const id = str(cmd.id, 24) || uid();
      gr.helps.push({ id, bid: b.id, by: sid, sid: b.mentee, subject: b.subject, date: T0, minutes: clamp(Math.round(num(cmd.minutes) || 10), 1, 180), topic, note, at: T(), confirmed: false, status: 'pending', review: null });
      result = { id }; break;
    }
    case 'gr.buddy.confirm': {
      student();
      const h = gr.helps.find(x => x.id === cmd.id);
      if (!h || h.sid !== sid) throw forb('این ثبت مربوط به شما نیست');
      if (h.confirmed) throw bad('قبلاً تأیید کرده‌ای');
      h.confirmed = true; h.confirmedAt = T();
      if (!gr.settings.buddyNeedTeacher) {
        h.status = 'approved'; h.review = { verdict: 'approved', by: 'buddy', at: T() };
        grant(st, h.by, { mgmt: 2, xp: gr.settings.xp.help, spin: 1, reason: '🤝 کمک به ' + (stuById(st, h.sid) || {}).name + ' — ' + h.topic, ref: 'help:' + h.id, kind: 'buddy' });
      }
      break;
    }
    case 'gr.buddy.review':
    case 'gr.buddy.bulkReview': {
      teacher();
      const ids = t === 'gr.buddy.bulkReview' ? (cmd.ids || []).slice(0, 200) : [cmd.id];
      const verdict = cmd.verdict === 'rejected' ? 'rejected' : 'approved';
      let n = 0;
      for (const id of ids) {
        const h = gr.helps.find(x => x.id === id); if (!h || h.status !== 'pending') continue;
        h.status = verdict; h.review = { verdict, by: 'teacher', note: str(cmd.note, 200), at: T() };
        if (verdict === 'approved') grant(st, h.by, { mgmt: 2, xp: gr.settings.xp.help, spin: 1, reason: '🤝 کمک به ' + (stuById(st, h.sid) || {}).name + ' — ' + h.topic, ref: 'help:' + h.id, kind: 'buddy' });
        else if (gr.settings.buddyFalse > 0) grant(st, h.by, { mgmt: -gr.settings.buddyFalse, reason: '✖️ ثبت کمک نامعتبر: ' + h.topic, ref: 'helpno:' + h.id, kind: 'acc' });
        n++;
      }
      if (!n) throw bad('موردی برای بررسی یافت نشد');
      result = { reviewed: n }; break;
    }
    /* ---- mirror ---- */
    case 'gr.checkin.save': {
      student();
      if (gr.settings.checkinEnabled === false) throw bad('بخش آینه بسته است');
      const mood = clamp(Math.round(num(cmd.mood) || 3), 1, 5);
      const energy = clamp(Math.round(num(cmd.energy) || 3), 1, 5);
      const ex = gr.checkins.find(c => c.sid === sid && c.date === T0);
      const data = { mood, energy, learned: str(cmd.learned, 300), hard: str(cmd.hard, 300), grateful: str(cmd.grateful, 200), at: T() };
      if (ex) Object.assign(ex, data);
      else { gr.checkins.push(Object.assign({ id: uid(), sid, date: T0 }, data)); grant(st, sid, { points: 1, xp: gr.settings.xp.checkin, reason: '🪞 احوال‌پرسی امروز', ref: 'ci:' + sid + ':' + T0, kind: 'mirror' }); }
      syncStreaks(st);
      result = { first: !ex }; break;
    }
    case 'gr.goal.save': {
      student();
      const text = str(cmd.text, 200); if (!text) throw bad('هدف را بنویس');
      const wk = weekKey(T0), ex = gr.goals.find(x => x.sid === sid && x.week === wk);
      const data = { text, metric: str(cmd.metric, 60), target: clamp(Math.round(num(cmd.target) || 1), 1, 100) };
      if (ex) Object.assign(ex, data);
      else gr.goals.push(Object.assign({ id: uid(), sid, week: wk, createdAt: T(), review: null }, data));
      result = { week: wk }; break;
    }
    case 'gr.goal.review': {
      const gl = gr.goals.find(x => x.id === cmd.id);
      if (!gl) throw bad('هدف یافت نشد');
      if (session.role === 'student' && gl.sid !== sid) throw forb('هدف شما نیست');
      const status = ['done', 'partial', 'missed'].includes(cmd.status) ? cmd.status : 'done';
      gl.review = { status, note: str(cmd.note, 300), at: T(), by: session.role };
      if (session.role === 'student' && status === 'done') grant(st, sid, { points: 3, xp: 30, reason: '🎯 هدف هفته محقق شد: ' + gl.text, ref: 'goal:' + gl.id, kind: 'goal' });
      break;
    }
    case 'gr.goal.comment': { teacher(); const gl = gr.goals.find(x => x.id === cmd.id); if (!gl) throw bad('هدف یافت نشد'); gl.teacherNote = str(cmd.note, 300); break; }
    case 'gr.sync': { teacher(); const added = syncStreaks(st); result = { added: added.length }; break; }
    case 'gr.bonus': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      const xp = clamp(Math.round(num(cmd.xp) || 0), 0, 500), mgmt = clamp(Math.round(num(cmd.mgmt) || 0), -20, 20);
      grant(st, cmd.sid, { xp, mgmt, reason: str(cmd.reason, 140) || 'اعطای دستی معلم', ref: 'man:' + cmd.sid + ':' + Date.now(), kind: mgmt < 0 ? 'acc' : 'manual' });
      break;
    }
    default: throw bad('عملیات ناشناخته: ' + t);
  }
  if (t.indexOf('gr.') === 0) syncStreaks(st);
  return { state: st, result };
}

/* ---------------- hooks on base commands ---------------- */
function afterBase(st, cmd, out) {
  ensure(st);
  const gr = G(st), acc = gr.settings.acc, sid = cmd.__sid || null;
  const t = cmd.type;
  const findR = id => (st.reports || []).find(x => x.id === id);

  if (t === 'case.return' && acc.enabled) {
    const r = findR(cmd.id);
    if (r) {
      const j = st.roles && st.roles.judge;
      if (j && acc.judgeReturn > 0) grant(st, j, { mgmt: -acc.judgeReturn, reason: `↩️ برگشت رأی به قاضی — پروندهٔ «${r.title}»`, ref: 'acc:ret:' + r.id + ':' + (r.returns || 1), kind: 'acc' });
    }
  }
  if (t === 'case.reject' && acc.enabled) {
    const r = findR(cmd.id);
    if (r && acc.reportReject > 0) grant(st, r.by, { mgmt: -acc.reportReject, reason: `✖️ رد گزارش — «${r.title}»`, ref: 'acc:rej:' + r.id, kind: 'acc' });
  }
  if (t === 'case.final') {
    const r = findR(cmd.id);
    if (r) {
      if (acc.enabled && acc.verdictApproved > 0 && r.verdict && r.verdict.by) grant(st, r.verdict.by, { mgmt: acc.verdictApproved, xp: 20, reason: `⚖️ رأی تأییدشده — «${r.title}»`, ref: 'acc:ok:' + r.id, kind: 'acc' });
      if (acc.enabled && acc.reportApproved > 0) grant(st, r.by, { mgmt: acc.reportApproved, xp: 10, reason: `📨 گزارش تأییدشده — «${r.title}»`, ref: 'acc:rep:' + r.id, kind: 'acc' });
    }
  }
  if (t === 'hw.review' && cmd.verdict !== 'redo') {
    grant(st, cmd.sid, { xp: gr.settings.xp.hw, spin: 1, reason: '📚 تکلیف تأییدشده', ref: 'hwx:' + cmd.aid + ':' + cmd.sid, kind: 'hw' });
  }
  if (t === 'hw.bulkReview' && cmd.verdict !== 'redo') {
    (cmd.sids || []).forEach(s => grant(st, s, { xp: gr.settings.xp.hw, spin: 1, reason: '📚 تکلیف تأییدشده', ref: 'hwx:' + cmd.aid + ':' + s, kind: 'hw' }));
  }
  /* 🔧 گارد: فقط وقتی دانش‌آموزِ واقعی فرمان را زده (sid معتبر) */
  if (t === 'quiz.submit' && sid) {
    act(st, sid, 'quiz', 'qz:' + cmd.quizId + ':' + sid);
    grant(st, sid, { xp: gr.settings.xp.quiz, spin: 1, reason: '🧠 شرکت در آزمون', ref: 'qzx:' + cmd.quizId + ':' + sid, kind: 'quiz' });
  }
  if (t === 'poll.vote' && sid) {
    act(st, sid, 'vote', 'vt:' + cmd.pollId + ':' + sid);
    grant(st, sid, { xp: gr.settings.xp.vote, reason: '🗳️ شرکت در نظرسنجی', ref: 'vtx:' + cmd.pollId + ':' + sid, kind: 'vote' });
  }
  syncStreaks(st);
}

/* ---------------- patch core ---------------- */
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;

C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; e.code = 'unauthorized'; throw e; }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { delete st.growth; ensure(st); } else ensure(st);
    return out;
  }
  if (cmd.type.indexOf('gr.') === 0) {
    const cid = String(cmd.cid || '').slice(0, 40);
    st._applied = Array.isArray(st._applied) ? st._applied : [];
    if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
    const out = apply(st, cmd, session);
    if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
    return out;
  }
  const out = baseApply(st, cmd, session);
  if (!(out && out.result && out.result.duplicate)) {
    try { afterBase(st, Object.assign({ __sid: session.sid }, cmd), out); } catch (e) { /* hooks never break base */ }
  }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); ensure(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensure(st); return st; };
C.viewFor = function (st, session) { const v = baseView(st, session); if (v) v.growth = view(st, session); return v; };

/* ---------------- exports ---------------- */
Object.assign(C, {
  GR_STREAKS: STREAKS, GR_QK: QK, GR_PRIZES: PRIZES, GR_RARITY: RARITY, GR_RANKS: RANKS, GR_MOODS: MOODS,
  grEnsure: ensure, grSettingsDefault: settingsDefault, grWeekKey: weekKey, grShift: shift, grLastDays: lastDays,
  grXp: xpTotal, grLevel: levelInfo, grRank: rankName, grStreaks: streaks, grSyncStreaks: syncStreaks,
  grQuestsFor: questsFor, grProgress: progress, grClaimOf: claimOf, grAutoQuests: autoQuests,
  grSpins: spins, grFreezeCount: freezeCount, grFreezeUsed: freezeUsed, grVouchers: vouchers,
  grBuddyOf: buddyOf, grBuddyEffect: buddyEffect, grClass: classStats, grAccLog: accLog, grGrant: grant
});
})(typeof globalThis !== 'undefined' ? globalThis : this);
