/* market-core.js — اهداف همکاری، نبرد گروه‌ها و بورس دانش (هستهٔ مشترک) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__marketCore) return;
g.__marketCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, mean = C.mean, fa = C.fa, faNum = C.faNum;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const jShort = C.jShort, jLabel = C.jLabel, wdIdx = C.wdIdx;
const stuById = C.stuById, groupOf = C.groupOf, scoreOf = C.scoreOf, LMAX = C.LMAX;
const T = () => new Date().toISOString();
const r1 = v => Math.round(v * 10) / 10;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const h01 = s => hash(s) / 4294967296;
function shift(iso, n) { const d = isoToDate(iso); d.setDate(d.getDate() + n); return dateToISO(d); }
function schoolDays(from, to) { const out = []; let d = isoToDate(from); const e = isoToDate(to); while (d <= e) { const iso = dateToISO(d); if (wdIdx(iso) <= 4) out.push(iso); d.setDate(d.getDate() + 1); } return out; }

/* ---------------- کیف پول یکپارچه (رفع باگ کسر نشدن سکه‌ها) ---------------- */
function walletU(st, sid) {
  let earned = 0, neg = 0;
  for (const d of st.discipline || []) {
    if (d.sid !== sid || d.by === 'shop') continue;
    const p = Number(d.points) || 0;
    if (p > 0) earned += p; else neg += -p;
  }
  let lead = 0;
  for (const l of st.leaderLogs || []) if (l.leader === sid) lead += Number(l.points) || 0;
  let shopA = 0, shopP = 0;
  for (const p of (st.shop && st.shop.purchases) || []) {
    if (p.sid !== sid) continue;
    if (p.status === 'approved') shopA += Number(p.cost) || 0;
    else if (p.status === 'pending') shopP += Number(p.cost) || 0;
  }
  const coins = earned + lead - neg - shopA - shopP;
  return { earned: earned + lead, spent: neg + shopA, reserved: shopP, balance: Math.max(0, coins), net: coins };
}
C.wallet = walletU;

/* ---------------- سنجه‌های اهداف همکاری ---------------- */
const idsOf = (st, ms) => ms || (st.students || []).map(s => s.id);
const METRICS = {
  hw_rate: { l: 'نرخ انجام تکلیف', i: '📚', unit: '٪', max: 100, calc(st, f, t, ms) {
    const ids = idsOf(st, ms); let done = 0, tot = 0; const hw = st.homework; if (!hw) return 0;
    for (const a of hw.assignments || []) { if (a.status === 'draft' || !(a.dueAt >= f && a.dueAt <= t)) continue;
      for (const sid of ids) { if (!C.hwTargets(st, a, sid)) continue; tot++; const s = (hw.subs[a.id] || {})[sid]; if (s && s.status === 'done') done++; } }
    return tot ? Math.round(done / tot * 100) : 0; } },
  att_rate: { l: 'نرخ حضور', i: '🗓️', unit: '٪', max: 100, calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms)); let p = 0, tot = 0;
    for (const d in st.attendance || {}) { if (d < f || d > t) continue; for (const sid in st.attendance[d]) { if (!ids.has(sid)) continue; tot++; const v = st.attendance[d][sid]; if (v === 'present' || v === 'late') p++; } }
    return tot ? Math.round(p / tot * 100) : 0; } },
  clean_days: { l: 'روزهای بدون تخلف', i: '🛡️', unit: 'روز', max: 30, calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms)); const bad = new Set((st.discipline || []).filter(d => d.points < 0 && ids.has(d.sid) && d.date >= f && d.date <= t).map(d => d.date));
    return schoolDays(f, t).filter(d => !bad.has(d)).length; } },
  quiz_rate: { l: 'مشارکت در آزمون', i: '🧠', unit: '٪', max: 100, calc(st, f, t, ms) {
    const ids = idsOf(st, ms); let p = 0, tot = 0;
    for (const q of st.quizzes || []) { const d = iranISO(new Date(q.startAt)); if (d < f || d > t) continue; for (const sid of ids) { tot++; if (q.submissions && q.submissions[sid]) p++; } }
    return tot ? Math.round(p / tot * 100) : 0; } },
  help_count: { l: 'کمک‌های ثبت‌شده', i: '🤝', unit: 'مورد', max: 40, calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms));
    return (st.growth && st.growth.helps || []).filter(h => h.date >= f && h.date <= t && ids.has(h.by) && h.status !== 'rejected').length; } },
  checkin_rate: { l: 'نرخ احوال‌پرسی', i: '🪞', unit: '٪', max: 100, calc(st, f, t, ms) {
    const ids = idsOf(st, ms); const days = schoolDays(f, t).length || 1;
    const n = (st.growth && st.growth.checkins || []).filter(c => c.date >= f && c.date <= t && ids.includes(c.sid)).length;
    return Math.min(100, Math.round(n / (ids.length * days) * 100)); } }
};
function missionValue(st, m, gid) {
  const M = METRICS[m.metric]; if (!M) return 0;
  const ms = gid ? (((st.groups || []).find(x => x.id === gid) || {}).members || []) : null;
  return M.calc(st, m.from, m.to, ms);
}

/* ---------------- بورس دانش ---------------- */
const ASSETS_SEED = [
  { symbol: 'RIAZ', name: 'سهام ریاضی', icon: '📐', subject: 'ریاضی', color: '#1d4ed8' },
  { symbol: 'OLUM', name: 'سهام علوم', icon: '🔬', subject: 'علوم تجربی', color: '#0d9488' },
  { symbol: 'FARS', name: 'سهام فارسی', icon: '📖', subject: 'فارسی', color: '#e11d48' },
  { symbol: 'HEDY', name: 'سهام هدیه‌ها', icon: '🕌', subject: 'هدیه‌های آسمانی', color: '#7c3aed' },
  { symbol: 'IJTM', name: 'سهام اجتماعی', icon: '🌍', subject: 'مطالعات اجتماعی', color: '#f59e0b' },
  { symbol: 'HAMK', name: 'سهام همکاری', icon: '🤝', subject: '@help', color: '#16a34a' }
];
function settingsDefault() {
  return { marketEnabled: true, missionsEnabled: true, tradeFee: 2, maxTradeQty: 15, dailyTrades: 5, startPrice: 100, leaderboard: true, edu: true };
}
function assetMetricDay(st, a, iso) {
  if (a.subject === '@help') {
    const n = ((st.growth && st.growth.helps || []).filter(h => h.date === iso).length + (st.growth && st.growth.checkins || []).filter(c => c.date === iso).length);
    return clamp(n / ((st.students || []).length || 1) * 2 - 0.4, -1, 1);
  }
  let sum = 0, c = 0;
  for (const as of st.assessments || []) {
    if (as.date !== iso || !(as.subjects || []).includes(a.subject)) continue;
    for (const s of st.students || []) { const sc = scoreOf(st, st.grades?.[as.id]?.[a.subject]?.[s.id]); if (sc != null) { sum += sc; c++; } }
  }
  if (c) return clamp((sum / c / LMAX(st) - 0.62) * 2.5, -1, 1);
  const hw = st.homework; let d = 0, t2 = 0;
  if (hw) for (const as of hw.assignments || []) {
    if (as.dueAt !== iso || as.subject !== a.subject) continue;
    for (const s of st.students || []) { if (!C.hwTargets(st, as, s.id)) continue; t2++; const sb = (hw.subs[as.id] || {})[s.id]; if (sb && sb.status === 'done') d++; }
  }
  if (t2) return clamp((d / t2 - 0.7) * 2, -1, 1);
  return 0;
}
function rollMarket(st) {
  const ec = st.econ, today = todayISO(), base = ec.settings.startPrice || 100;
  const days = schoolDays(ec.marketStart || shift(today, -45), today).slice(-90);
  for (const a of ec.assets) {
    if (a.paused) continue;
    a.series = a.series || [];
    const have = new Set(a.series.map(x => x.d));
    let prev = a.series.length ? a.series[a.series.length - 1].c : base;
    for (const d of days) {
      if (have.has(d)) { prev = (a.series.find(x => x.d === d) || {}).c || prev; continue; }
      const m = assetMetricDay(st, a, d);
      const n1 = h01(a.id + d + 'a'), n2 = h01(a.id + d + 'b'), n3 = h01(a.id + d + 'c');
      const noise = (n1 - 0.5) * 0.05;
      const rev = (base - prev) / base * 0.015;
      const drift = clamp(m * 0.045 + noise + rev, -0.12, 0.12);
      const o = prev, c2 = clamp(o * (1 + drift), 15, 500);
      const hi = Math.max(o, c2) * (1 + 0.006 + n2 * 0.02), lo = Math.min(o, c2) * (1 - 0.006 - n3 * 0.02);
      const v = Math.round(6 + n1 * 30) + (ec.trades || []).filter(t => t.assetId === a.id && iranISO(new Date(t.at)) === d).length;
      const subj = a.subject === '@help' ? 'همکاری' : a.subject;
      const reason = m > 0.15 ? `📈 روز قوی «${subj}» در کلاس` : m < -0.15 ? `📉 روز ضعیف‌تر «${subj}»` : '➖ روز معمولی کلاس';
      a.series.push({ d, o: r1(o), h: r1(hi), l: r1(lo), c: r1(c2), v, m: r1(m), reason });
      prev = c2;
    }
  }
}
const price = a => (a.series && a.series.length ? a.series[a.series.length - 1].c : 100);
const change = a => { const s = a.series || []; if (s.length < 2) return 0; return (s[s.length - 1].c - s[s.length - 2].c) / s[s.length - 2].c * 100; };
function holdingsOf(st, sid) { return (st.econ.holdings || {})[sid] || {}; }
function portfolio(st, sid) {
  const h = holdingsOf(st, sid); let value = 0, cost = 0;
  const items = [];
  for (const aid in h) {
    const a = (st.econ.assets || []).find(x => x.id === aid); if (!a) continue;
    const q = h[aid].qty || 0, p = price(a);
    value += q * p; cost += h[aid].cost || 0;
    items.push({ id: aid, symbol: a.symbol, name: a.name, icon: a.icon, color: a.color, qty: q, price: p, value: Math.round(q * p), cost: h[aid].cost || 0, pnl: Math.round(q * p - (h[aid].cost || 0)) });
  }
  const cash = walletU(st, sid).balance;
  return { cash, value: Math.round(value), cost: Math.round(cost), pnl: Math.round(value - cost), total: Math.round(cash + value), items };
}
function board(st) {
  return (st.students || []).map(s => ({ id: s.id, name: s.name, avatar: s.avatar, ...portfolio(st, s.id) }))
    .sort((a, b) => b.total - a.total);
}
function autoSettle(st) {
  const ec = st.econ, today = todayISO();
  for (const m of ec.missions || []) {
    if (m.status !== 'active' || today <= m.to) continue;
    settleMission(st, m);
  }
}
function settleMission(st, m) {
  const reward = m.reward || {};
  if (m.scope === 'battle') {
    const ranks = (st.groups || []).map(g => ({ gid: g.id, name: g.name, color: g.color, value: missionValue(st, m, g.id) })).sort((a, b) => b.value - a.value);
    m.result = { ranks, ok: true, settledAt: T() };
    const win = ranks[0];
    if (win) for (const sid of ((st.groups || []).find(g => g.id === win.gid) || {}).members || [])
      C.grGrant(st, sid, { points: reward.points || 0, xp: reward.xp || 0, spin: reward.spin || 0, reason: '🏆 برندهٔ نبرد: ' + m.title, ref: 'mis:' + m.id + ':' + sid, kind: 'mission' });
  } else {
    const value = missionValue(st, m);
    const ok = value >= (m.target || 0);
    m.result = { value, ok, settledAt: T() };
    if (ok) {
      const ms = m.scope === 'group' ? (((st.groups || []).find(g => g.id === m.groupId) || {}).members || []) : (st.students || []).map(s => s.id);
      for (const sid of ms) C.grGrant(st, sid, { points: reward.points || 0, xp: reward.xp || 0, spin: reward.spin || 0, reason: '🏆 ماموریت مشترک: ' + m.title, ref: 'mis:' + m.id + ':' + sid, kind: 'mission' });
    }
  }
  m.status = 'settled';
}

/* ---------------- ensure / seed ---------------- */
function seed(st) {
  const today = todayISO();
  const ec = {
    settings: settingsDefault(),
    marketStart: schoolDays(shift(today, -45), today)[0] || today,
    assets: ASSETS_SEED.map(a => Object.assign({ id: uid(), series: [], paused: false, createdAt: T() }, a)),
    missions: [], trades: [], holdings: {}, seq: 0
  };
  const wk = C.grWeekKey ? C.grWeekKey(today) : today;
  ec.missions.push({ id: uid(), title: 'ماموریت کلاس: تکالیف این هفته بالای ۸۵٪', desc: 'اگر نرخ انجام تکلیف کل کلاس در این هفته به ۸۵٪ برسد، به همه پاداش می‌رسد.', scope: 'class', groupId: '', metric: 'hw_rate', target: 85, from: wk, to: shift(wk, 4), reward: { points: 3, xp: 25, spin: 1 }, status: 'active', createdAt: T() });
  ec.missions.push({ id: uid(), title: 'نبرد گروه‌ها: حضور این هفته', desc: 'گروهی که بیشترین نرخ حضور را داشته باشد برنده است.', scope: 'battle', groupId: '', metric: 'att_rate', target: 0, from: wk, to: shift(wk, 4), reward: { points: 5, xp: 40, spin: 2 }, status: 'active', createdAt: T() });
  return ec;
}
function ensure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  if (C.hwEnsure) C.hwEnsure(st);
  if (C.grEnsure) C.grEnsure(st);
  let ch = false;
  if (!st.econ || !Array.isArray(st.econ.assets)) { st.econ = seed(st); ch = true; }
  const ec = st.econ;
  ec.settings = Object.assign(settingsDefault(), ec.settings || {});
  ['missions', 'trades', 'assets'].forEach(k => { if (!Array.isArray(ec[k])) { ec[k] = []; ch = true; } });
  if (!ec.holdings || typeof ec.holdings !== 'object') { ec.holdings = {}; ch = true; }
  if (!ec.marketStart) { ec.marketStart = shift(todayISO(), -45); ch = true; }
  rollMarket(st); autoSettle(st);
  return ch;
}

/* ---------------- view ---------------- */
function view(st, session) {
  ensure(st);
  const ec = st.econ, sid = session.sid;
  if (session.role === 'teacher') {
    const v = clone(ec);
    v.board = board(st).map(b => ({ id: b.id, name: b.name, cash: b.cash, value: b.value, total: b.total, pnl: b.pnl }));
    v.wallets = {}; (st.students || []).forEach(s => v.wallets[s.id] = walletU(st, s.id).balance);
    return v;
  }
  return {
    settings: { marketEnabled: ec.settings.marketEnabled, missionsEnabled: ec.settings.missionsEnabled, tradeFee: ec.settings.tradeFee, maxTradeQty: ec.settings.maxTradeQty, dailyTrades: ec.settings.dailyTrades, leaderboard: ec.settings.leaderboard, edu: ec.settings.edu },
    assets: clone(ec.assets),
    missions: clone(ec.missions),
    holdings: clone(holdingsOf(st, sid)),
    trades: clone((ec.trades || []).filter(t => t.sid === sid).slice(-60)),
    portfolio: portfolio(st, sid),
    wallet: walletU(st, sid).balance,
    board: ec.settings.leaderboard === false ? [] : board(st).map(b => ({ id: b.id, name: b.name, avatar: b.avatar, total: b.total, pnl: b.pnl })),
    me: sid
  };
}

/* ---------------- commands ---------------- */
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

function apply(st, cmd, session) {
  ensure(st);
  const ec = st.econ, sid = session.sid, today = todayISO();
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  let result = null;

  switch (cmd.type) {
    case 'econ.trade': {
      if (session.role !== 'student') throw forb('معامله مخصوص دانش‌آموز است.');
      if (ec.settings.marketEnabled === false) throw bad('بورس موقتاً بسته است');
      const a = ec.assets.find(x => x.id === cmd.assetId); if (!a || a.paused) throw bad('سهام یافت نشد');
      const qty = clamp(Math.round(Number(cmd.qty) || 0), 1, ec.settings.maxTradeQty || 15);
      const todayTrades = (ec.trades || []).filter(t => t.sid === sid && iranISO(new Date(t.at)) === today).length;
      if (todayTrades >= (ec.settings.dailyTrades || 5)) throw bad(`سقف امروز ${fa(ec.settings.dailyTrades || 5)} معامله است`);
      const p = price(a), fee = (ec.settings.tradeFee || 0) / 100;
      ec.holdings[sid] = ec.holdings[sid] || {};
      const h = ec.holdings[sid][a.id] || { qty: 0, cost: 0 };
      const w = walletU(st, sid);
      if (cmd.side === 'buy') {
        const cost = Math.round(qty * p * (1 + fee));
        if (w.balance < cost) throw bad(`سکه کافی نداری؛ لازم ${fa(cost)} ، موجودی ${fa(w.balance)}`);
        st.discipline.push({ id: uid(), sid, date: today, points: -cost, reason: `📈 خرید ${fa(qty)} سهم ${a.name}`, by: 'market', gref: 'tr:' + (ec.seq = (ec.seq || 0) + 1) });
        h.qty += qty; h.cost += cost;
        result = { cost, price: p, qty: h.qty };
      } else {
        if (h.qty < qty) throw bad(`فقط ${fa(h.qty)} سهم داری`);
        const proceeds = Math.round(qty * p * (1 - fee));
        st.discipline.push({ id: uid(), sid, date: today, points: proceeds, reason: `💰 فروش ${fa(qty)} سهم ${a.name}`, by: 'market', gref: 'tr:' + (ec.seq = (ec.seq || 0) + 1) });
        h.cost = Math.max(0, Math.round(h.cost * (h.qty - qty) / h.qty)); h.qty -= qty;
        result = { proceeds, price: p, qty: h.qty, pnl: Math.round(proceeds - 0) };
      }
      ec.holdings[sid][a.id] = h;
      if (h.qty === 0) delete ec.holdings[sid][a.id];
      ec.trades.push({ id: uid(), sid, assetId: a.id, symbol: a.symbol, side: cmd.side === 'buy' ? 'buy' : 'sell', qty, price: p, value: result.cost || result.proceeds, at: T() });
      if (ec.trades.length > 3000) ec.trades = ec.trades.slice(-2000);
      break;
    }
    case 'econ.mission.create': {
      teacher();
      const title = str(cmd.title, 120); if (!title) throw bad('عنوان ماموریت الزامی است');
      if (!METRICS[cmd.metric]) throw bad('سنجه نامعتبر');
      const scope = ['class', 'group', 'battle'].includes(cmd.scope) ? cmd.scope : 'class';
      if (scope === 'group' && !(st.groups || []).some(g => g.id === cmd.groupId)) throw bad('گروه را انتخاب کن');
      const from = C.parseDateAny(cmd.from) || today, to = C.parseDateAny(cmd.to) || shift(today, 6);
      if (to < from) throw bad('پایان نباید قبل از شروع باشد');
      const id = str(cmd.id, 24) || uid();
      ec.missions.push({ id, title, desc: str(cmd.desc, 300), scope, groupId: scope === 'group' ? cmd.groupId : '', metric: cmd.metric, target: clamp(Math.round(Number(cmd.target) || 0), 0, 1000), from, to, reward: { points: clamp(Math.round(Number(cmd.reward && cmd.reward.points) || 0), 0, 30), xp: clamp(Math.round(Number(cmd.reward && cmd.reward.xp) || 0), 0, 300), spin: clamp(Math.round(Number(cmd.reward && cmd.reward.spin) || 0), 0, 5) }, status: 'active', createdAt: T() });
      result = { id }; break;
    }
    case 'econ.mission.delete': { teacher(); ec.missions = ec.missions.filter(m => m.id !== cmd.id); break; }
    case 'econ.mission.settle': { teacher(); const m = ec.missions.find(x => x.id === cmd.id); if (!m || m.status !== 'active') throw bad('ماموریت فعال نیست'); settleMission(st, m); result = m.result; break; }
    case 'econ.asset.add': {
      teacher();
      const name = str(cmd.name, 60); if (!name) throw bad('نام سهام الزامی است');
      const subject = (st.subjects || []).includes(cmd.subject) ? cmd.subject : '@help';
      ec.assets.push({ id: str(cmd.id, 24) || uid(), symbol: str(cmd.symbol, 8) || name.slice(0, 4), name, icon: str(cmd.icon, 6) || '📊', subject, color: cmd.color || C.CPAL[ec.assets.length % 8], series: [], paused: false, createdAt: T() });
      rollMarket(st); break;
    }
    case 'econ.asset.pause': { teacher(); const a = ec.assets.find(x => x.id === cmd.id); if (a) a.paused = !a.paused; break; }
    case 'econ.settings': {
      teacher(); const p = cmd.patch || {};
      ['marketEnabled', 'missionsEnabled', 'leaderboard', 'edu'].forEach(k => { if (p[k] != null) ec.settings[k] = !!p[k]; });
      if (p.tradeFee != null) ec.settings.tradeFee = clamp(Math.round(Number(p.tradeFee) || 0), 0, 20);
      if (p.maxTradeQty != null) ec.settings.maxTradeQty = clamp(Math.round(Number(p.maxTradeQty) || 15), 1, 50);
      if (p.dailyTrades != null) ec.settings.dailyTrades = clamp(Math.round(Number(p.dailyTrades) || 5), 1, 20);
      break;
    }
    case 'econ.roll': { teacher(); rollMarket(st); result = { ok: true }; break; }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}

/* ---------------- patch core ---------------- */
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; e.code = 'unauthorized'; throw e; }
  /* کنترل موجودی سمت سرور برای خرید فروشگاه و فریز (با فرمول یکپارچه) */
  if (cmd.type === 'shop.buy' || cmd.type === 'gr.freeze.buy') {
    const cost = cmd.type === 'gr.freeze.buy' ? ((st.growth && st.growth.settings && st.growth.settings.freezeCost) || 6)
      : (((st.shop && st.shop.rewards || []).find(x => x.id === cmd.rewardId) || {}).cost || 0);
    const w = walletU(st, session.sid || '');
    if (w.balance < cost) { const e = new Error(`سکه کافی نیست؛ موجودی ${fa(w.balance)} ، لازم ${fa(cost)}`); e.status = 400; e.code = 'insufficient'; throw e; }
  }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { delete st.econ; ensure(st); } else ensure(st);
    return out;
  }
  if (cmd.type.indexOf('econ.') !== 0) return baseApply(st, cmd, session);
  const cid = String(cmd.cid || '').slice(0, 40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const out = apply(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); ensure(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensure(st); return st; };
C.viewFor = function (st, session) { const v = baseView(st, session); if (v) v.econ = view(st, session); return v; };

C.EC_METRICS = METRICS; C.EC_ASSETS_SEED = ASSETS_SEED;
C.ecEnsure = ensure; C.ecWallet = walletU; C.ecPrice = price; C.ecChange = change;
C.ecPortfolio = portfolio; C.ecBoard = board; C.ecMissionValue = missionValue; C.ecRoll = rollMarket; C.ecSettle = settleMission;
})(typeof globalThis !== 'undefined' ? globalThis : this);
