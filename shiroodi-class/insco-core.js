/* insco-core.js v2 — بیمهٔ کلاس با اتصال واقعی به سکه، رشد و پاسخگویی */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__inscoCore) return;
g.__inscoCore = true;
const uid = C.uid, clamp = C.clamp, clone = C.clone, fa = C.fa;
const todayISO = C.todayISO, iranISO = C.iranISO, jShort = C.jShort, stuById = C.stuById, groupOf = C.groupOf;
const T = () => new Date().toISOString();
const wk = () => (C.grWeekKey ? C.grWeekKey(todayISO()) : todayISO());
const wallet = (st, sid) => (C.wallet ? C.wallet(st, sid) : { balance: 0 });
const bad = m => { const e = new Error(m); e.status = 400; return e; };
const forb = m => { const e = new Error(m); e.status = 403; return e; };
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const num = v => Number(String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) || 0;
const used = (st, ref) => (st.discipline || []).some(d => d.gref === ref);
function move(st, sid, amt, reason, ref) {
  if (used(st, ref)) return false;
  st.discipline.push({ id: uid(), sid, date: todayISO(), points: amt, reason, by: 'insco', gref: ref });
  return true;
}
function grant(st, sid, o) { try { if (typeof C.grGrant === 'function') C.grGrant(st, sid, o); } catch (e) {} }

const PERILS = {
  sick_hw: { l: 'تکلیف جاافتاده به دلیل بیماری/غیبت موجه', i: '🤒', loss: st => (st.growth && st.growth.settings && st.growth.settings.freezeCost) || 6 },
  late_exc: { l: 'دیرکرد تکلیف با عذر موجه', i: '⏰', loss: (st, hw) => { const lp = (st.homework && st.homework.settings && st.homework.settings.latePenalty) || 30; return Math.max(1, Math.round((hw ? hw.points : 3) * lp / 100)); } },
  quiz_miss: { l: 'جاماندن از آزمون به دلیل غیبت موجه', i: '🧠', loss: () => 3 }
};
const settingsDefault = () => ({ enabled: true, premMin: 1, premMax: 6, dedMin: 0, dedMax: 5, covMax: 90, cessionMax: 60, cessionFee: 20, classLevy: 5, claimCap: 12, noClaimBonus: 20 });

function ensure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  let ch = false;
  if (!st.insCo || !Array.isArray(st.insCo.cos)) {
    st.insCo = { settings: settingsDefault(), central: { fund: 20, received: 0, paid: 0 }, classPool: { fund: 10, given: 0, events: [] }, cos: [], policies: [], claims: [], ledger: [], seq: 0 };
    ch = true;
  }
  const ic = st.insCo;
  ic.settings = Object.assign(settingsDefault(), ic.settings || {});
  if (!ic.central) ic.central = { fund: 0, received: 0, paid: 0 };
  if (!ic.classPool) ic.classPool = { fund: 0, given: 0, events: [] };
  ['cos', 'policies', 'claims', 'ledger'].forEach(k => { if (!Array.isArray(ic[k])) { ic[k] = []; ch = true; } });
  for (const g2 of st.groups || []) {
    let co = ic.cos.find(c => c.gid === g2.id);
    if (!co) {
      co = { id: uid(), gid: g2.id, name: 'بیمهٔ ' + g2.name, color: g2.color, fund: 10, premium: 2, deductible: 1, coverage: 70, cession: 30, members: [], enrolled: [], arrears: {}, debt: 0, premiumsIn: 0, claimsPaid: 0, lastWeek: '', createdAt: T() };
      ic.cos.push(co); ch = true;
    }
    co.name = 'بیمهٔ ' + g2.name; co.color = g2.color;
    co.members = (g2.members || []).slice();
    co.enrolled = (co.enrolled || []).filter(x => co.members.includes(x));
  }
  return ch;
}
const coOf = (st, gid) => (st.insCo.cos || []).find(c => c.gid === gid);
const myCo = (st, sid) => { const g2 = groupOf(st, sid); return g2 ? coOf(st, g2.id) : null; };
const isLeader = (st, sid, co) => { const g2 = (st.groups || []).find(x => x.id === co.gid); return !!g2 && g2.leader === sid; };
const policyOf = (st, sid, co) => (st.insCo.policies || []).find(p => p.sid === sid && p.coId === co.id && p.status === 'active');
const hasClaim = (st, ref) => (st.insCo.claims || []).some(c => c.ref === ref);

function eligible(st, sid) {
  const out = [];
  for (const d in st.attendance || {}) {
    if ((st.attendance[d] || {})[sid] !== 'excused') continue;
    if (!hasClaim(st, 'att:' + d)) out.push({ peril: 'sick_hw', ref: 'att:' + d, label: '🤒 غیبت موجه ' + jShort(d) });
    for (const q of st.quizzes || []) {
      if (iranISO(new Date(q.startAt)) === d && !(q.submissions || {})[sid] && !hasClaim(st, 'qz:' + q.id)) out.push({ peril: 'quiz_miss', ref: 'qz:' + q.id, label: '🧠 جاماندن از آزمون ' + jShort(d) });
    }
  }
  const hw = st.homework;
  if (hw) for (const a of hw.assignments || []) {
    const s = (hw.subs[a.id] || {})[sid];
    if (s && s.late && !hasClaim(st, 'hw:' + a.id)) out.push({ peril: 'late_exc', ref: 'hw:' + a.id, label: '⏰ دیرکرد «' + String(a.title).slice(0, 18) + '»' });
  }
  return out;
}
function premiumFor(st, co, sid) {
  const had = (st.insCo.claims || []).some(c => c.sid === sid && c.coId === co.id && c.status === 'paid' && (Date.now() - new Date(c.at || T()).getTime()) < 7 * 864e5);
  let p = co.premium;
  if (!had && st.insCo.settings.noClaimBonus) p = Math.max(1, Math.round(p * (1 - st.insCo.settings.noClaimBonus / 100)));
  return p;
}
function doPay(st, co, sid, W) {
  const prem = premiumFor(st, co, sid);
  const w = wallet(st, sid);
  if (w.balance < prem) throw bad('سکه کافی نداری؛ حق بیمه ' + fa(prem) + ' و موجودی ' + fa(w.balance));
  const ref = 'icop:' + co.id + ':' + W + ':' + sid;
  if (!move(st, sid, -prem, '🏛️ حق بیمهٔ هفتگی ' + co.name, ref)) throw bad('حق بیمهٔ این هفته قبلاً پرداخت شده');
  co.fund += prem; co.premiumsIn += prem; co.arrears[sid] = 0;
  const pol = policyOf(st, sid, co); if (pol) pol.lastPaidWeek = W;
  st.insCo.ledger.push({ id: uid(), at: T(), kind: 'premium', coId: co.id, sid, amount: prem, note: 'حق بیمهٔ هفته' });
  grant(st, sid, { xp: 5, reason: '🏛️ پرداخت به‌موقع حق بیمه', ref: 'icoxp:' + co.id + ':' + W + ':' + sid, kind: 'insco' });
  return { premium: prem, balance: wallet(st, sid).balance };
}
/* جمع‌آوری هفتگی — فقط وقتی هفته عوض شود (یک write در هفته) */
function collect(st) {
  if (!st.insCo) return false;
  const ic = st.insCo, W = wk(); let changed = false;
  for (const co of ic.cos || []) {
    if (co.lastWeek === W) continue;
    co.lastWeek = W; changed = true;
    for (const sid of (co.enrolled || []).slice()) {
      const pol = policyOf(st, sid, co);
      if (!pol || pol.lastPaidWeek === W) continue;
      const prem = premiumFor(st, co, sid);
      if (wallet(st, sid).balance >= prem) {
        try { doPay(st, co, sid, W); } catch (e) {}
      } else {
        co.arrears[sid] = (co.arrears[sid] || 0) + 1;
        if (co.arrears[sid] >= 3) {
          co.enrolled = co.enrolled.filter(x => x !== sid); pol.status = 'closed';
          ic.ledger.push({ id: uid(), at: T(), kind: 'drop', coId: co.id, sid, amount: 0, note: 'حذف پس از ۳ هفته عدم پرداخت' });
        }
      }
    }
    const fee = Math.round(co.premiumsIn ? 0 : 0);
    const weekIn = (ic.ledger || []).filter(l => l.kind === 'premium' && l.coId === co.id && l.note === 'حق بیمهٔ هفته').length;
    const collected = (co.enrolled || []).length ? co.premium : 0;
    const feeAmt = Math.round(collected * (ic.settings.cessionFee || 0) / 100);
    if (feeAmt > 0 && co.fund >= feeAmt) { co.fund -= feeAmt; ic.central.fund += feeAmt; ic.central.received += feeAmt; ic.ledger.push({ id: uid(), at: T(), kind: 'cession', coId: co.id, amount: feeAmt, note: 'حق اتکایی به مرکزی' }); }
    const levy = Math.round(collected * (ic.settings.classLevy || 0) / 100);
    if (levy > 0 && co.fund >= levy) { co.fund -= levy; ic.classPool.fund += levy; ic.ledger.push({ id: uid(), at: T(), kind: 'levy', coId: co.id, amount: levy, note: 'سهم صندوق کلاسی' }); }
    if (co.debt > 0) { const pay = Math.min(co.debt, co.fund); co.fund -= pay; co.debt -= pay; }
  }
  return changed;
}
function computeLoss(st, cl) {
  const co = (st.insCo.cos || []).find(x => x.id === cl.coId);
  let loss = 0;
  if (cl.peril === 'sick_hw') loss = PERILS.sick_hw.loss(st);
  else if (cl.peril === 'late_exc') { const hw = st.homework; const a = hw && (hw.assignments || []).find(x => 'hw:' + x.id === cl.ref); loss = PERILS.late_exc.loss(st, a); }
  else loss = PERILS.quiz_miss.loss(st);
  cl.loss = loss; cl.ded = co ? co.deductible : 0;
  cl.payout = Math.min(Math.round(Math.max(0, loss - cl.ded) * (co ? co.coverage : 70) / 100), st.insCo.settings.claimCap || 12);
}
function payClaim(st, cl) {
  const ic = st.insCo, co = (ic.cos || []).find(x => x.id === cl.coId); if (!co) return;
  const pay = cl.payout || 0;
  if (pay > 0) {
    let ce = Math.min(Math.round(pay * (co.cession || 0) / 100), ic.central.fund);
    ic.central.fund -= ce; ic.central.paid += ce;
    let coS = pay - ce;
    if (co.fund >= coS) co.fund -= coS;
    else {
      let short = coS - co.fund; co.fund = 0; coS = 0;
      const fromC = Math.min(short, ic.central.fund); ic.central.fund -= fromC; ic.central.paid += fromC; ce += fromC; short -= fromC;
      if (short > 0) { const fromP = Math.min(short, ic.classPool.fund); ic.classPool.fund -= fromP; ic.classPool.given += fromP; ce += fromP; short -= fromP; }
      if (short > 0) co.debt = (co.debt || 0) + short;
      const g2 = (st.groups || []).find(x => x.id === co.gid);
      if (g2 && g2.leader) grant(st, g2.leader, { mgmt: -2, reason: '🏛️ ناترازی شرکت ' + co.name, ref: 'icod:' + cl.id, kind: 'acc' });
    }
    co.claimsPaid += pay;
    move(st, cl.sid, pay, '🛡️ خسارت بیمه: ' + cl.label, 'icoc:' + cl.id);
    grant(st, cl.sid, { freeze: 1, xp: 10, reason: '🛡️ حمایت بیمهٔ کلاس', ref: 'icob:' + cl.id, kind: 'insco' });
    const g3 = (st.groups || []).find(x => x.id === co.gid);
    if (g3 && g3.leader) grant(st, g3.leader, { mgmt: 1, reason: '🏛️ رسیدگی درست به خسارت', ref: 'icol:' + cl.id, kind: 'acc' });
    ic.ledger.push({ id: uid(), at: T(), kind: 'claim', coId: co.id, sid: cl.sid, amount: -pay, note: 'خسارت (شرکت ' + fa(coS) + ' / مرکزی+صندوق ' + fa(ce) + ')' });
    cl.coShare = coS; cl.ceShare = ce;
  }
  cl.status = 'paid'; cl.paidAt = T();
}
function apply(st, cmd, session) {
  ensure(st);
  const ic = st.insCo, sid = session.sid, W = wk();
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم (بیمهٔ مرکزی) است.'); };
  const co = cmd.coId ? (ic.cos || []).find(x => x.id === cmd.coId) : myCo(st, sid);
  let result = null;
  switch (cmd.type) {
    case 'ico.enroll': {
      if (!co) throw bad('شرکت بیمه یافت نشد');
      if (!(co.members || []).includes(sid)) throw bad('عضو این گروه نیستی');
      if ((co.enrolled || []).includes(sid)) throw bad('قبلاً عضو شده‌ای');
      co.enrolled.push(sid);
      ic.policies.push({ id: uid(), sid, coId: co.id, since: todayISO(), status: 'active', lastPaidWeek: '' });
      result = doPay(st, co, sid, W); break;
    }
    case 'ico.payNow': {
      if (!co) throw bad('شرکت یافت نشد');
      if (!(co.enrolled || []).includes(sid)) throw bad('اول عضو بیمه شو');
      result = doPay(st, co, sid, W); break;
    }
    case 'ico.leave': {
      if (!co) throw bad('شرکت یافت نشد');
      co.enrolled = (co.enrolled || []).filter(x => x !== sid);
      (ic.policies || []).forEach(p => { if (p.sid === sid && p.coId === co.id) p.status = 'closed'; });
      break;
    }
    case 'ico.coSettings': {
      if (!co) throw bad('شرکت یافت نشد');
      if (session.role !== 'teacher' && !isLeader(st, sid, co)) throw forb('فقط سرگروه (مدیر شرکت) یا معلم نرخ‌ها را عوض می‌کند');
      const s = ic.settings;
      if (cmd.premium != null) co.premium = clamp(Math.round(num(cmd.premium) || 1), s.premMin, s.premMax);
      if (cmd.deductible != null) co.deductible = clamp(Math.round(num(cmd.deductible) || 0), s.dedMin, s.dedMax);
      if (cmd.coverage != null) co.coverage = clamp(Math.round(num(cmd.coverage) || 50), 30, s.covMax);
      if (cmd.cession != null) co.cession = clamp(Math.round(num(cmd.cession) || 0), 0, s.cessionMax);
      break;
    }
    case 'ico.claim': {
      if (!co) throw bad('شرکت یافت نشد');
      if (!(co.enrolled || []).includes(sid)) throw bad('عضو بیمه نیستی؛ اول عضو شو');
      const ev = eligible(st, sid).find(e => e.ref === cmd.ref);
      if (!ev) throw bad('رویداد واجد شرایط نیست یا قبلاً ثبت شده');
      ic.claims.push({ id: str(cmd.id, 24) || uid(), sid, coId: co.id, peril: ev.peril, ref: ev.ref, label: ev.label, loss: 0, payout: 0, status: 'pending_co', note: str(cmd.note, 200), at: T() });
      result = { ok: true }; break;
    }
    case 'ico.claimReview': {
      const cl = (ic.claims || []).find(x => x.id === cmd.id); if (!cl) throw bad('خسارت یافت نشد');
      const c2 = (ic.cos || []).find(x => x.id === cl.coId); if (!c2) throw bad('شرکت یافت نشد');
      if (session.role !== 'teacher' && !isLeader(st, sid, c2)) throw forb('فقط مدیر شرکت یا معلم بررسی می‌کند');
      if (cl.status !== 'pending_co') throw bad('این پرونده در انتظار بررسی مدیر نیست');
      if (cmd.verdict === 'rejected') { cl.status = 'rejected'; cl.reviewNote = str(cmd.note, 200); break; }
      computeLoss(st, cl);
      if (c2.cession > 0) cl.status = 'pending_central'; else payClaim(st, cl);
      result = { payout: cl.payout, status: cl.status }; break;
    }
    case 'ico.claimCentral': {
      teacher();
      const cl = (ic.claims || []).find(x => x.id === cmd.id); if (!cl) throw bad('خسارت یافت نشد');
      if (cl.status !== 'pending_central') throw bad('این پرونده در انتظار مرکزی نیست');
      if (cmd.verdict === 'rejected') { cl.status = 'rejected'; cl.reviewNote = str(cmd.note, 200); break; }
      payClaim(st, cl); result = { payout: cl.payout }; break;
    }
    case 'ico.centralSettings': {
      teacher(); const p = cmd.patch || {}, s = ic.settings;
      if (p.enabled != null) s.enabled = !!p.enabled;
      ['premMin', 'premMax', 'dedMin', 'dedMax', 'covMax', 'cessionMax', 'cessionFee', 'classLevy', 'claimCap', 'noClaimBonus'].forEach(k => { if (p[k] != null) s[k] = clamp(Math.round(num(p[k]) || 0), 0, 100); });
      break;
    }
    case 'ico.poolGive': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      const amt = clamp(Math.round(num(cmd.amount) || 0), 1, ic.classPool.fund || 0);
      if (!amt) throw bad('صندوق کلاسی موجودی ندارد');
      ic.classPool.fund -= amt; ic.classPool.given += amt;
      move(st, cmd.sid, amt, '🤝 کمک اضطراری صندوق کلاسی: ' + str(cmd.note, 80), 'icog:' + cmd.sid + ':' + Date.now());
      ic.classPool.events.push({ id: uid(), sid: cmd.sid, amount: amt, note: str(cmd.note, 80), at: T() });
      result = { amount: amt, balance: wallet(st, cmd.sid).balance }; break;
    }
    case 'ico.bailout': {
      teacher();
      const c3 = (ic.cos || []).find(x => x.id === cmd.coId); if (!c3) throw bad('شرکت یافت نشد');
      const amt = clamp(Math.round(num(cmd.amount) || 0), 1, ic.central.fund || 0);
      if (!amt) throw bad('صندوق مرکزی موجودی ندارد');
      ic.central.fund -= amt; c3.fund += amt;
      if (c3.debt > 0) { const p2 = Math.min(c3.debt, amt); c3.debt -= p2; }
      ic.ledger.push({ id: uid(), at: T(), kind: 'bailout', coId: c3.id, amount: amt, note: 'تزریق سرمایهٔ مرکزی' });
      result = { amount: amt }; break;
    }
    case 'ico.collect': { teacher(); (ic.cos || []).forEach(c => { c.lastWeek = ''; }); collect(st); result = { ok: true }; break; }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}
const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; throw e; }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { delete st.insCo; ensure(st); } else ensure(st);
    return out;
  }
  if (cmd.type.indexOf('ico.') !== 0) return baseApply(st, cmd, session);
  const cid = String(cmd.cid || '').slice(0, 40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const out = apply(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); ensure(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensure(st); return st; };
C.viewFor = function (st, session) {
  const v = baseView(st, session); if (!v) return v;
  ensure(st);
  const ic = st.insCo, W = wk();
  if (session.role === 'teacher') {
    const out = clone(ic);
    out.cos = out.cos.map(c => {
      const g2 = (st.groups || []).find(x => x.id === c.gid) || {};
      const ld = stuById(st, g2.leader);
      return Object.assign({}, c, { leaderName: ld ? ld.name : '—', lossRatio: c.premiumsIn ? Math.round(c.claimsPaid / c.premiumsIn * 100) : 0 });
    });
    v.insCo = out; return v;
  }
  const sid = session.sid, co = myCo(st, sid);
  const pol = co ? policyOf(st, sid, co) : null;
  let suggested = 0;
  if (co && isLeader(st, sid, co)) {
    const risk = (co.enrolled || []).reduce((a, m) => a + eligible(st, m).length, 0) / Math.max(1, (co.enrolled || []).length);
    suggested = clamp(Math.ceil(1 + risk * 2), ic.settings.premMin, ic.settings.premMax);
  }
  v.insCo = {
    settings: clone(ic.settings), centralFund: ic.central.fund, poolFund: ic.classPool.fund,
    co: co ? clone(co) : null, isLeader: co ? isLeader(st, sid, co) : false,
    policy: pol ? clone(pol) : null, enrolled: co ? (co.enrolled || []).includes(sid) : false,
    paidThisWeek: !!(pol && pol.lastPaidWeek === W), week: W,
    balance: wallet(st, sid).balance, suggested,
    eligible: eligible(st, sid),
    myFlow: clone((st.discipline || []).filter(d => d.by === 'insco' && d.sid === sid).slice(-15).reverse()),
    claims: clone((ic.claims || []).filter(c => c.sid === sid || (co && isLeader(st, sid, co) && c.coId === co.id))),
    queue: co && isLeader(st, sid, co) ? clone((ic.claims || []).filter(c => c.coId === co.id && c.status === 'pending_co')) : []
  };
  return v;
};
C.ICO_PERILS = PERILS; C.icoEnsure = ensure; C.icoCollect = collect; C.icoMyCo = myCo; C.icoIsLeader = isLeader; C.icoEligible = eligible;
})(typeof globalThis !== 'undefined' ? globalThis : this);
