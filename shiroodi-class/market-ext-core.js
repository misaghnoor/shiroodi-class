/* market-ext-core.js — گسترش بورس: شاخص کل، پیش‌بینی، دفترچه، چالش، بیمه گروهی */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || !C.ecEnsure || g.__mktExtCore) return;
g.__mktExtCore = true;

const uid = C.uid, clamp = C.clamp, clone = C.clone, mean = C.mean, fa = C.fa, faNum = C.faNum;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const jShort = C.jShort, stuById = C.stuById, groupOf = C.groupOf;
const T = () => new Date().toISOString();

/* ---------------- شاخص کل بورس کلاس ---------------- */
function klasIndex(st) {
  const ec = st.econ; if (!ec || !ec.assets) return [];
  const days = new Set();
  (ec.assets || []).forEach(a => (a.series || []).forEach(s => days.add(s.d)));
  const arr = [...days].sort();
  const out = [];
  for (const d of arr) {
    let total = 0, weight = 0;
    for (const a of ec.assets || []) {
      const s = (a.series || []).find(x => x.d === d);
      if (!s) continue;
      const w = (a.series || []).filter(x => x.d <= d).reduce((acc, x) => acc + (x.v || 0), 0) + 1;
      total += s.c * w; weight += w;
    }
    if (weight) out.push({ d, v: Math.round(total / weight * 10) / 10 });
  }
  return out;
}
function klasIndexChange(st) {
  const ix = klasIndex(st);
  if (ix.length < 2) return 0;
  return (ix[ix.length - 1].v - ix[ix.length - 2].v) / ix[ix.length - 2].v * 100;
}

/* ---------------- پیش‌بینی هفتگی ---------------- */
function weekKey(iso) { const d = isoToDate(iso); d.setDate(d.getDate() - C.wdIdx(iso)); return dateToISO(d); }
function predictEnsure(st) {
  const ex = st.mktExt || (st.mktExt = {});
  if (!Array.isArray(ex.predictions)) ex.predictions = [];
  if (!Array.isArray(ex.challenges)) ex.challenges = [];
  if (!Array.isArray(ex.journal)) ex.journal = [];
  if (!ex.settings) ex.settings = { predictReward: 5, groupInsDiscount: 20, journalRequired: true };
}
function activeWeek() { return weekKey(todayISO()); }

/* ---------------- دفترچه معاملاتی ---------------- */
function journalFor(st, sid) {
  predictEnsure(st);
  return (st.mktExt.journal || []).filter(j => !sid || j.sid === sid);
}

/* ---------------- چالش ماه ---------------- */
function monthlyRank(st) {
  const month = todayISO().slice(0, 7);
  return (st.students || []).map(s => {
    const trades = (st.econ.trades || []).filter(t => t.sid === s.id && t.at.slice(0, 7) === month);
    const pf = C.ecPortfolio(st, s.id);
    const costBasis = trades.filter(t => t.side === 'buy').reduce((a, t) => a + (t.value || 0), 0);
    const pct = costBasis > 0 ? Math.round((pf.pnl / costBasis) * 100) : 0;
    return { id: s.id, name: s.name, avatar: s.avatar, trades: trades.length, pnl: pf.pnl, pct, value: pf.value };
  }).sort((a, b) => b.pct - a.pct);
}

/* ---------------- بیمه گروهی ---------------- */
function groupDiscount(st, groupId) {
  predictEnsure(st);
  const g = (st.groups || []).find(x => x.id === groupId);
  if (!g) return 0;
  const members = g.members || [];
  const activePol = (st.econ.policies || []).filter(p => p.status === 'active' && members.includes(p.sid));
  if (activePol.length >= Math.max(2, Math.floor(members.length * 0.6))) return st.mktExt.settings.groupInsDiscount || 20;
  return 0;
}

/* ---------------- commands ---------------- */
const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

function apply(st, cmd, session) {
  if (!st.econ) C.ecEnsure(st);
  predictEnsure(st);
  const ex = st.mktExt, sid = session.sid;
  let result = null;

  switch (cmd.type) {
    case 'mkt.predict': {
      if (session.role !== 'student') throw bad('پیش‌بینی مخصوص دانش‌آموز است');
      const a = (st.econ.assets || []).find(x => x.id === cmd.assetId);
      if (!a) throw bad('سهام یافت نشد');
      const price = C.ecPrice(a);
      const target = clamp(Math.round(Number(cmd.target) || 0), 1, 1000);
      const week = activeWeek();
      const existing = ex.predictions.find(p => p.sid === sid && p.assetId === a.id && p.week === week);
      if (existing) throw bad('برای این هفته قبلاً پیش‌بینی کرده‌ای؛ هفتهٔ بعد دوباره بیا');
      ex.predictions.push({ id: uid(), sid, assetId: a.id, symbol: a.symbol, week, at: T(), current: price, target, reason: str(cmd.reason, 200) });
      result = { current: price, target }; break;
    }
    case 'mkt.journal': {
      if (session.role !== 'student') throw bad('دفترچه مخصوص دانش‌آموز است');
      const tradeId = str(cmd.tradeId, 40);
      const reason = str(cmd.reason, 300);
      if (!reason) throw bad('دلیل معامله را بنویس');
      const tr = (st.econ.trades || []).find(t => t.id === tradeId);
      if (!tr || tr.sid !== sid) throw bad('معامله یافت نشد');
      if (ex.journal.some(j => j.tradeId === tradeId)) throw bad('برای این معامله قبلاً نوشته‌ای');
      ex.journal.push({ id: uid(), sid, tradeId, at: T(), reason, mood: str(cmd.mood, 20) || 'neutral' });
      result = { ok: true }; break;
    }
    case 'mkt.settings': {
      if (session.role !== 'teacher') throw bad('مخصوص معلم');
      const p = cmd.patch || {};
      if (p.predictReward != null) ex.settings.predictReward = clamp(Math.round(Number(p.predictReward) || 0), 0, 30);
      if (p.groupInsDiscount != null) ex.settings.groupInsDiscount = clamp(Math.round(Number(p.groupInsDiscount) || 0), 0, 50);
      if (p.journalRequired != null) ex.settings.journalRequired = !!p.journalRequired;
      break;
    }
    case 'mkt.settlePredictions': {
      if (session.role !== 'teacher') throw bad('مخصوص معلم');
      const lastWeek = weekKey(C.grShift ? C.grShift(todayISO(), -7) : todayISO());
      const weekPreds = ex.predictions.filter(p => p.week === lastWeek);
      const rewards = [];
      for (const a of st.econ.assets || []) {
        const ap = weekPreds.filter(p => p.assetId === a.id);
        if (!ap.length) continue;
        const final = C.ecPrice(a);
        const ranked = ap.map(p => ({ p, diff: Math.abs(p.target - final) })).sort((a, b) => a.diff - b.diff);
        const top3 = ranked.slice(0, 3);
        top3.forEach((r, i) => {
          const pts = Math.max(1, (ex.settings.predictReward || 5) - i);
          C.grGrant(st, r.p.sid, { points: pts, xp: pts * 4, reason: `🔮 پیش‌بینی ${['🥇', '🥈', '🥉'][i]} برای ${a.symbol}`, ref: 'pred:' + r.p.id, kind: 'predict' });
          rewards.push({ sid: r.p.sid, name: (stuById(st, r.p.sid) || {}).name, symbol: a.symbol, diff: r.diff, rank: i + 1, points: pts });
        });
      }
      result = { settled: weekPreds.length, rewards }; break;
    }
    case 'mkt.groupInsure': {
      if (session.role !== 'student') throw bad('مخصوص دانش‌آموز');
      const g = (st.groups || []).find(x => x.id === cmd.groupId);
      if (!g || !(g.members || []).includes(sid)) throw bad('عضو این گروه نیستی');
      const disc = groupDiscount(st, g.id);
      if (disc <= 0) throw bad(`حداقل ${Math.max(2, Math.floor((g.members || []).length * 0.6))} نفر از گروه باید فعال باشند تا تخفیف فعال شود`);
      result = { groupId: g.id, discount: disc }; break;
    }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}

/* ---------------- patch core ---------------- */
const baseApply = C.applyCommand;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (cmd.type.indexOf('mkt.') === 0) {
    const cid = String(cmd.cid || '').slice(0, 40);
    st._applied = Array.isArray(st._applied) ? st._applied : [];
    if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
    const out = apply(st, cmd, session);
    if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
    return out;
  }
  return baseApply(st, cmd, session);
};

const baseNorm = C.normalize, baseView = C.viewFor;
C.normalize = function (raw) { const st = baseNorm(raw); predictEnsure(st); return st; };
C.viewFor = function (st, session) {
  const v = baseView(st, session);
  if (!v || !st.econ) return v;
  predictEnsure(st);
  if (session.role === 'teacher') {
    v.mktExt = { index: klasIndex(st), indexChange: klasIndexChange(st), predictions: clone(st.mktExt.predictions), journal: clone(st.mktExt.journal), challenges: monthlyRank(st), settings: clone(st.mktExt.settings) };
  } else {
    const sid = session.sid;
    v.mktExt = {
      index: klasIndex(st), indexChange: klasIndexChange(st),
      predictions: clone((st.mktExt.predictions || []).filter(p => p.sid === sid)),
      journal: clone((st.mktExt.journal || []).filter(j => j.sid === sid)),
      myRank: monthlyRank(st).find(r => r.id === sid) || null,
      myGroups: (st.groups || []).filter(g => (g.members || []).includes(sid)).map(g => ({ id: g.id, name: g.name, discount: groupDiscount(st, g.id) })),
      settings: { journalRequired: st.mktExt.settings.journalRequired, predictReward: st.mktExt.settings.predictReward }
    };
  }
  return v;
};

C.mktIndex = klasIndex; C.mktIndexChange = klasIndexChange;
C.mktWeekKey = weekKey; C.mktActiveWeek = activeWeek;
C.mktMonthlyRank = monthlyRank; C.mktGroupDiscount = groupDiscount;
C.mktJournalFor = journalFor; C.mktEnsure = predictEnsure;
})(typeof globalThis !== 'undefined' ? globalThis : this);
