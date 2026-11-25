/* market-core.js — اهداف همکاری، بورس دانش و بیمهٔ سهام (هستهٔ مشترک) */
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
function schoolDaysAdd(from, n) { const ds = schoolDays(from, shift(from, n * 2 + 4)); return ds[Math.min(n, ds.length) - 1] || shift(from, n); }

/* ---------------- آمار توزیع نرمال (برای قیمت‌گذاری بیمه) ---------------- */
function erf(x) { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y; }
const npdf = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
const ncdf = x => 0.5 * (1 + erf(x / Math.SQRT2));
function expDown(m, s) { if (s <= 0) return m < 0 ? -m : 0; const k = m / s; return s * npdf(k) - m * ncdf(-k); }

/* ---------------- کیف پول یکپارچه ---------------- */
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
  hw_rate: { l: 'نرخ انجام تکلیف', i: '📚', unit: '٪', calc(st, f, t, ms) {
    const ids = idsOf(st, ms); let done = 0, tot = 0; const hw = st.homework; if (!hw) return 0;
    for (const a of hw.assignments || []) { if (a.status === 'draft' || !(a.dueAt >= f && a.dueAt <= t)) continue;
      for (const sid of ids) { if (!C.hwTargets(st, a, sid)) continue; tot++; const s = (hw.subs[a.id] || {})[sid]; if (s && s.status === 'done') done++; } }
    return tot ? Math.round(done / tot * 100) : 0; } },
  att_rate: { l: 'نرخ حضور', i: '🗓️', unit: '٪', calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms)); let p = 0, tot = 0;
    for (const d in st.attendance || {}) { if (d < f || d > t) continue; for (const sid in st.attendance[d]) { if (!ids.has(sid)) continue; tot++; const v = st.attendance[d][sid]; if (v === 'present' || v === 'late') p++; } }
    return tot ? Math.round(p / tot * 100) : 0; } },
  clean_days: { l: 'روزهای بدون تخلف', i: '🛡️', unit: 'روز', calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms)); const bad = new Set((st.discipline || []).filter(d => d.points < 0 && ids.has(d.sid) && d.date >= f && d.date <= t).map(d => d.date));
    return schoolDays(f, t).filter(d => !bad.has(d)).length; } },
  quiz_rate: { l: 'مشارکت در آزمون', i: '🧠', unit: '٪', calc(st, f, t, ms) {
    const ids = idsOf(st, ms); let p = 0, tot = 0;
    for (const q of st.quizzes || []) { const d = iranISO(new Date(q.startAt)); if (d < f || d > t) continue; for (const sid of ids) { tot++; if (q.submissions && q.submissions[sid]) p++; } }
    return tot ? Math.round(p / tot * 100) : 0; } },
  help_count: { l: 'کمک‌های ثبت‌شده', i: '🤝', unit: 'مورد', calc(st, f, t, ms) {
    const ids = new Set(idsOf(st, ms));
    return (st.growth && st.growth.helps || []).filter(h => h.date >= f && h.date <= t && ids.has(h.by) && h.status !== 'rejected').length; } },
  checkin_rate: { l: 'نرخ احوال‌پرسی', i: '🪞', unit: '٪', calc(st, f, t, ms) {
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
  return { marketEnabled: true, missionsEnabled: true, tradeFee: 2, maxTradeQty: 15, dailyTrades: 5, startPrice: 100, leaderboard: true, edu: true,
    ins: { enabled: true, loading: 30, cap: 35, fee: 1, maxDays: 10, maxPolicies: 3 } };
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
function assetVol(a) {
  const s = (a.series || []).slice(-30).map(x => x.c);
  if (s.length < 5) return { vol: 0.035, drift: 0 };
  const rs = []; for (let i = 1; i < s.length; i++) rs.push((s[i] - s[i - 1]) / s[i - 1]);
  const m = mean(rs); const sd = Math.sqrt(mean(rs.map(x => (x - m) * (x - m)))) || 0.02;
  return { vol: clamp(sd, 0.008, 0.15), drift: clamp(m, -0.05, 0.05) };
}
function holdingsOf(st, sid) { return (st.econ.holdings || {})[sid] || {}; }
function portfolio(st, sid) {
  const h = holdingsOf(st, sid); let value = 0, cost = 0; const items = [];
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
  return (st.students || []).map(s => ({ id: s.id, name: s.name, avatar: s.avatar, ...portfolio(st, s.id) })).sort((a, b) => b.total - a.total);
}

/* ---------------- بیمهٔ سهام ---------------- */
const INS_STATUS = { active: { l: 'فعال', i: '🛡️', c: '#16a34a' }, settled: { l: 'تصفیه‌شده', i: '💰', c: '#1d4ed8' }, expired: { l: 'بدون خسارت', i: '🍀', c: '#65a30d' }, canceled: { l: 'فسخ‌شده', i: '↩️', c: '#7b7261' } };
const activePolicies = (st, sid) => (st.econ.policies || []).filter(p => p.status === 'active' && (!sid || p.sid === sid));
function freeQty(st, sid, assetId) {
  const h = holdingsOf(st, sid)[assetId];
  const owned = h ? h.qty : 0;
  const insured = activePolicies(st, sid).filter(p => p.assetId === assetId).reduce((a, p) => a + p.qty, 0);
  return Math.max(0, owned - insured);
}
function exposure(st) { return activePolicies(st).reduce((a, p) => a + (p.cap || 0), 0); }
function lastCloseOnOrBefore(a, iso) {
  const s = a.series || []; for (let i = s.length - 1; i >= 0; i--) if (s[i].d <= iso) return s[i].c;
  return s.length ? s[0].c : 100;
}
function ecQuote(st, o) {
  const ec = st.econ, ins = (ec.settings.ins || {});
  const a = (ec.assets || []).find(x => x.id === o.assetId);
  if (!a) return { ok: false, reason: 'سهام یافت نشد' };
  if (a.paused) return { ok: false, reason: 'این سهم موقتاً متوقف است' };
  if (ins.enabled === false) return { ok: false, reason: 'بیمه موقتاً بسته است' };
  const qty = Math.round(Number(o.qty) || 0), days = Math.round(Number(o.days) || 0), ratio = Math.round(Number(o.ratio) || 0);
  if (qty < 1) return { ok: false, reason: 'تعداد سهم را مشخص کن' };
  if (qty > freeQty(st, o.sid, a.id)) return { ok: false, reason: `فقط ${fa(freeQty(st, o.sid, a.id))} سهم بیمه‌نشده داری` };
  if (days < 2 || days > (ins.maxDays || 10)) return { ok: false, reason: 'روزهای پوشش مجاز نیست' };
  if (![50, 75, 100].includes(ratio)) return { ok: false, reason: 'درصد پوشش مجاز نیست' };
  if (activePolicies(st, o.sid).length >= (ins.maxPolicies || 3)) return { ok: false, reason: `سقف ${fa(ins.maxPolicies || 3)} بیمه‌نامهٔ فعال داری` };
  const { vol, drift } = assetVol(a);
  const strike = price(a), value = qty * strike, rp = ratio / 100;
  const m = drift * days, s = vol * Math.sqrt(days);
  const expFactor = rp * expDown(m, s);
  const expLoss = Math.round(value * expFactor);
  const loading = (ins.loading == null ? 30 : ins.loading) / 100;
  const fee = ins.fee == null ? 1 : ins.fee;
  const cap = Math.round(value * rp * ((ins.cap == null ? 35 : ins.cap) / 100));
  let premium = Math.ceil(value * expFactor * (1 + loading)) + fee;
  premium = clamp(premium, 1, Math.max(1, Math.round(value * 0.5)));
  const fund = ec.fund || { balance: 0 };
  const solvOk = (fund.balance + premium) * 4 >= exposure(st) + cap;
  return { ok: solvOk, reason: solvOk ? '' : 'صندوق بیمه توان پوشش این قرارداد را ندارد', premium, value, vol, drift, expLoss, cap, strike, days, ratio, loading: Math.round(loading * 100), fee, fund: fund.balance, exposure: exposure(st) };
}
function settleExpired(st) {
  const ec = st.econ, today = todayISO(); let n = 0;
  for (const p of ec.policies || []) {
    if (p.status !== 'active' || today <= p.endAt) continue;
    const a = (ec.assets || []).find(x => x.id === p.assetId); if (!a) { p.status = 'expired'; p.payout = 0; continue; }
    const endPrice = lastCloseOnOrBefore(a, p.endAt);
    const drop = Math.max(0, p.strike - endPrice);
    const payout = Math.min(Math.round(drop * p.qty * p.ratio / 100), p.cap || 0);
    p.endPrice = endPrice; p.settledAt = T();
    if (payout > 0) {
      st.discipline.push({ id: uid(), sid: p.sid, date: today, points: payout, reason: `🛡️ خسارت بیمهٔ ${a.name}: افت ${faNum(drop)} × ${fa(p.qty)} سهم`, by: 'insurance', gref: 'ins:' + p.id });
      ec.fund.balance = Math.max(0, (ec.fund.balance || 0) - payout); ec.fund.payouts = (ec.fund.payouts || 0) + payout;
      p.status = 'settled'; p.payout = payout;
    } else { p.status = 'expired'; p.payout = 0; }
    n++;
  }
  return n;
}
function seedPositions(st) {
  const ec = st.econ, today = todayISO();
  const A = id => (ec.assets || []).find(x => x.id === id);
  const raz = (ec.assets || [])[0], olum = (ec.assets || [])[1];
  if (!raz || !olum) return;
  const mk = (sid, a, qty, tag) => {
    const p = price(a), cost = Math.round(qty * p * 1.02);
    st.discipline.push({ id: uid(), sid, date: shift(today, -6), points: -cost, reason: `📈 خرید ${fa(qty)} سهم ${a.name} (اولیه)`, by: 'market', gref: 'seed:' + tag });
    ec.holdings[sid] = ec.holdings[sid] || {};
    ec.holdings[sid][a.id] = { qty, cost };
    ec.trades.push({ id: uid(), sid, assetId: a.id, symbol: a.symbol, side: 'buy', qty, price: p, value: cost, at: new Date(Date.now() - 6 * 864e5).toISOString() });
    return cost;
  };
  const s1 = 'to0yoj67fy', s2 = 'cexwn0t7fy';
  if (stuById(st, s1)) mk(s1, raz, 5, 'a');
  if (stuById(st, s2)) mk(s2, olum, 4, 'b');
  /* یک بیمه‌نامهٔ فعال نمونه */
  if (stuById(st, s1)) {
    const q = ecQuote(st, { sid: s1, assetId: raz.id, qty: 3, days: 5, ratio: 75 });
    if (q.ok) {
      st.discipline.push({ id: uid(), sid: s1, date: today, points: -q.premium, reason: `🛡️ حق بیمهٔ ${raz.name} (۳ سهم، ۵ روز، ۷۵٪)`, by: 'insurance', gref: 'seed:ins1' });
      ec.fund.balance = (ec.fund.balance || 0) + q.premium; ec.fund.premiums = (ec.fund.premiums || 0) + q.premium;
      ec.policies.push({ id: uid(), sid: s1, assetId: raz.id, symbol: raz.symbol, qty: 3, days: 5, ratio: 75, strike: q.strike, premium: q.premium, cap: q.cap, startAt: today, endAt: schoolDaysAdd(today, 5), status: 'active', createdAt: T() });
    }
  }
  /* یک بیمه‌نامهٔ تاریخی برای نمایش تصفیه */
  if (stuById(st, s2)) {
    const start = shift(today, -9), end = shift(today, -2);
    const strike = lastCloseOnOrBefore(olum, start);
    const cap = Math.round(strike * 2 * 0.75 * 0.35), premium = Math.max(2, Math.round(cap * 0.35));
    st.discipline.push({ id: uid(), sid: s2, date: start, points: -premium, reason: `🛡️ حق بیمهٔ ${olum.name} (تاریخی)`, by: 'insurance', gref: 'seed:ins2' });
    ec.fund.balance = (ec.fund.balance || 0) + premium; ec.fund.premiums = (ec.fund.premiums || 0) + premium;
    ec.policies.push({ id: uid(), sid: s2, assetId: olum.id, symbol: olum.symbol, qty: 2, days: 5, ratio: 75, strike, premium, cap, startAt: start, endAt: end, status: 'active', createdAt: new Date(Date.now() - 9 * 864e5).toISOString() });
  }
}

/* ---------------- ماموریت‌ها ---------------- */
function autoSettle(st) {
  const ec = st.econ, today = todayISO();
  for (const m of ec.missions || []) { if (m.status !== 'active' || today <= m.to) continue; settleMission(st, m); }
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
    missions: [], trades: [], holdings: {}, policies: [], fund: { balance: 0, premiums: 0, payouts: 0 }, seq: 0, seeded: false
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
  ec.settings.ins = Object.assign(settingsDefault().ins, ec.settings.ins || {});
  ['missions', 'trades', 'assets', 'policies'].forEach(k => { if (!Array.isArray(ec[k])) { ec[k] = []; ch = true; } });
  if (!ec.holdings || typeof ec.holdings !== 'object') { ec.holdings = {}; ch = true; }
  if (!ec.fund || typeof ec.fund !== 'object') { ec.fund = { balance: 0, premiums: 0, payouts: 0 }; ch = true; }
  if (!ec.marketStart) { ec.marketStart = shift(todayISO(), -45); ch = true; }
  rollMarket(st);
  if (!ec.seeded) { seedPositions(st); ec.seeded = true; ch = true; }
  settleExpired(st); autoSettle(st);
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
    v.exposure = exposure(st);
    return v;
  }
  return {
    settings: { marketEnabled: ec.settings.marketEnabled, missionsEnabled: ec.settings.missionsEnabled, tradeFee: ec.settings.tradeFee, maxTradeQty: ec.settings.maxTradeQty, dailyTrades: ec.settings.dailyTrades, leaderboard: ec.settings.leaderboard, edu: ec.settings.edu, ins: clone(ec.settings.ins || {}) },
    assets: clone(ec.assets), missions: clone(ec.missions),
    holdings: clone(holdingsOf(st, sid)),
    trades: clone((ec.trades || []).filter(t => t.sid === sid).slice(-60)),
    policies: clone((ec.policies || []).filter(p => p.sid === sid)),
    fund: { balance: (ec.fund || {}).balance || 0 },
    portfolio: portfolio(st, sid), wallet: walletU(st, sid).balance,
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
        h.qty += qty; h.cost += cost; result = { cost, price: p, qty: h.qty };
      } else {
        if (h.qty < qty) throw bad(`فقط ${fa(h.qty)} سهم داری`);
        const insQ = activePolicies(st, sid).filter(x => x.assetId === a.id).reduce((s2, x) => s2 + x.qty, 0);
        if (h.qty - qty < insQ) throw bad(`${fa(insQ)} سهم زیر پوشش بیمه است؛ نمی‌توانی بفروشی`);
        const proceeds = Math.round(qty * p * (1 - fee));
        st.discipline.push({ id: uid(), sid, date: today, points: proceeds, reason: `💰 فروش ${fa(qty)} سهم ${a.name}`, by: 'market', gref: 'tr:' + (ec.seq = (ec.seq || 0) + 1) });
        h.cost = Math.max(0, Math.round(h.cost * (h.qty - qty) / h.qty)); h.qty -= qty;
        result = { proceeds, price: p, qty: h.qty };
      }
      ec.holdings[sid][a.id] = h;
      if (h.qty === 0) delete ec.holdings[sid][a.id];
      ec.trades.push({ id: uid(), sid, assetId: a.id, symbol: a.symbol, side: cmd.side === 'buy' ? 'buy' : 'sell', qty, price: p, value: result.cost || result.proceeds, at: T() });
      if (ec.trades.length > 3000) ec.trades = ec.trades.slice(-2000);
      break;
    }
    /* ---------- بیمه ---------- */
    case 'econ.insure': {
      if (session.role !== 'student') throw forb('خرید بیمه مخصوص دانش‌آموز است.');
      const q = ecQuote(st, { sid, assetId: cmd.assetId, qty: cmd.qty, days: cmd.days, ratio: cmd.ratio });
      if (!q.ok) throw bad(q.reason || 'شرایط بیمه برقرار نیست');
      const w = walletU(st, sid);
      if (w.balance < q.premium) throw bad(`سکه کافی نداری؛ حق بیمه ${fa(q.premium)} ، موجودی ${fa(w.balance)}`);
      const a = ec.assets.find(x => x.id === cmd.assetId);
      st.discipline.push({ id: uid(), sid, date: today, points: -q.premium, reason: `🛡️ حق بیمهٔ ${a.name}: ${fa(q.qty)} سهم، ${fa(q.days)} روز، پوشش ${fa(q.ratio)}٪`, by: 'insurance', gref: 'insp:' + (ec.seq = (ec.seq || 0) + 1) });
      ec.fund.balance = (ec.fund.balance || 0) + q.premium; ec.fund.premiums = (ec.fund.premiums || 0) + q.premium;
      const id = str(cmd.id, 24) || uid();
      ec.policies.push({ id, sid, assetId: a.id, symbol: a.symbol, qty: q.qty || cmd.qty, days: q.days || cmd.days, ratio: q.ratio || cmd.ratio, strike: q.strike, premium: q.premium, cap: q.cap, startAt: today, endAt: schoolDaysAdd(today, q.days || cmd.days), status: 'active', createdAt: T() });
      result = { id, premium: q.premium, cap: q.cap, strike: q.strike }; break;
    }
    case 'econ.insCancel': {
      const p = (ec.policies || []).find(x => x.id === cmd.id); if (!p) throw bad('بیمه‌نامه یافت نشد');
      if (session.role !== 'teacher' && p.sid !== sid) throw forb('این بیمه‌نامه مال تو نیست');
      if (p.status !== 'active') throw bad('فقط بیمه‌نامهٔ فعال قابل فسخ است');
      const refund = Math.floor(p.premium * 0.4);
      p.status = 'canceled'; p.refund = refund; p.canceledAt = T();
      if (refund > 0) {
        st.discipline.push({ id: uid(), sid: p.sid, date: today, points: refund, reason: '↩️ ارزش فسخ بیمه‌نامه', by: 'insurance', gref: 'insref:' + p.id });
        ec.fund.balance = Math.max(0, (ec.fund.balance || 0) - refund); ec.fund.premiums = Math.max(0, (ec.fund.premiums || 0) - refund);
      }
      result = { refund }; break;
    }
    case 'econ.insSettle': { teacher(); rollMarket(st); const n = settleExpired(st); result = { settled: n }; break; }
    case 'econ.insSettings': {
      teacher(); const p = cmd.patch || {}, ins = ec.settings.ins;
      if (p.enabled != null) ins.enabled = !!p.enabled;
      if (p.loading != null) ins.loading = clamp(Math.round(Number(p.loading) || 0), 0, 100);
      if (p.cap != null) ins.cap = clamp(Math.round(Number(p.cap) || 35), 10, 80);
      if (p.fee != null) ins.fee = clamp(Math.round(Number(p.fee) || 0), 0, 10);
      if (p.maxDays != null) ins.maxDays = clamp(Math.round(Number(p.maxDays) || 10), 2, 20);
      if (p.maxPolicies != null) ins.maxPolicies = clamp(Math.round(Number(p.maxPolicies) || 3), 1, 10);
      break;
    }
    /* ---------- ماموریت‌ها ---------- */
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
    case 'econ.roll': { teacher(); rollMarket(st); settleExpired(st); result = { ok: true }; break; }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}

/* ---------------- patch core ---------------- */
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; e.code = 'unauthorized'; throw e; }
  if (cmd.type === 'shop.buy' || cmd.type === 'gr.freeze.buy' || cmd.type === 'econ.insure') {
    let cost = 0;
    if (cmd.type === 'gr.freeze.buy') cost = ((st.growth && st.growth.settings && st.growth.settings.freezeCost) || 6);
    else if (cmd.type === 'shop.buy') cost = (((st.shop && st.shop.rewards || []).find(x => x.id === cmd.rewardId) || {}).cost || 0);
    else { const q = ecQuote(st, { sid: session.sid, assetId: cmd.assetId, qty: cmd.qty, days: cmd.days, ratio: cmd.ratio }); cost = q.ok ? q.premium : 0; if (!q.ok) { const e = new Error(q.reason); e.status = 400; e.code = 'bad_request'; throw e; } }
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

C.EC_METRICS = METRICS; C.EC_ASSETS_SEED = ASSETS_SEED; C.EC_INS_STATUS = INS_STATUS;
C.ecEnsure = ensure; C.ecWallet = walletU; C.ecPrice = price; C.ecChange = change;
C.ecPortfolio = portfolio; C.ecBoard = board; C.ecMissionValue = missionValue; C.ecRoll = rollMarket; C.ecSettle = settleMission;
C.ecVol = assetVol; C.ecQuote = ecQuote; C.ecFreeQty = freeQty; C.ecSettleIns = settleExpired;
C.ecExposure = exposure; C.ecActivePolicies = activePolicies; C.ecLastClose = lastCloseOnOrBefore; C.ecSchoolAdd = schoolDaysAdd;
})(typeof globalThis !== 'undefined' ? globalThis : this);
