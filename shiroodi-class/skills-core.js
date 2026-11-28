/* skills-core.js — درخت مهارت‌ها و غول‌های مرحله (هستهٔ مشترک) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__skillsCore) return;
g.__skillsCore = true;
const uid = C.uid, clamp = C.clamp, clone = C.clone, fa = C.fa;
const todayISO = C.todayISO, iranISO = C.iranISO, isoToDate = C.isoToDate, dateToISO = C.dateToISO;
const jOf = C.jOf, jToISO = C.jToISO, stuById = C.stuById;
const T = () => new Date().toISOString();

const DOMAINS = {
  acad:   { l: 'دانش و درس',        i: '📚', c: '#1d4ed8', d: 'تکلیف، آزمون و چالش‌های درسی' },
  social: { l: 'همکاری و اجتماع',   i: '🤝', c: '#0d9488', d: 'کمک به دیگران، نظرسنجی و کار گروهی' },
  disc:   { l: 'انضباط و مسئولیت',  i: '🎯', c: '#7c3aed', d: 'زنجیره‌ها، مسئولیت‌ها و رفتار' },
  crea:   { l: 'خودشناسی و خلاقیت', i: '🧠', c: '#d97706', d: 'آینه، هدف‌گذاری و ایده‌ها' }
};
const KIND_DOMAIN = { hw:'acad', quiz:'acad', quest:'acad', buddy:'social', vote:'social', gift:'social', mystery:'social', boss:'social', streak:'disc', acc:'disc', manual:'disc', insco:'disc', mirror:'crea', goal:'crea', box:'crea' };
const NODES = {
  acad: [
    { id:'a1', t:'جوانهٔ دانش',      i:'🌱', need:40,  rw:{ spin:1 } },
    { id:'a2', t:'کاوشگر درس',      i:'🔍', need:120, rw:{ points:3 } },
    { id:'a3', t:'یادگیرندهٔ ماهر',  i:'📚', need:280, rw:{ freeze:1 } },
    { id:'a4', t:'استاد درس',        i:'🎓', need:550, rw:{ voucher:1, points:4 } },
    { id:'a5', t:'افسانهٔ دانش',     i:'👑', need:950, rw:{ points:10, spin:2 } }
  ],
  social: [
    { id:'s1', t:'دستِ دوست',        i:'🤲', need:30,  rw:{ spin:1 } },
    { id:'s2', t:'هم‌یار مهربان',    i:'💞', need:90,  rw:{ points:3 } },
    { id:'s3', t:'پل ارتباط',        i:'🌉', need:200, rw:{ freeze:1 } },
    { id:'s4', t:'قلب گروه',         i:'❤️', need:400, rw:{ points:6, spin:1 } },
    { id:'s5', t:'قهرمان همبستگی',   i:'🕊️', need:700, rw:{ points:10, voucher:1 } }
  ],
  disc: [
    { id:'d1', t:'قدم اول',          i:'👣', need:30,  rw:{ spin:1 } },
    { id:'d2', t:'منظمِ کوچک',       i:'⏰', need:90,  rw:{ points:3 } },
    { id:'d3', t:'نگهبان کلاس',      i:'🛡️', need:200, rw:{ freeze:1 } },
    { id:'d4', t:'مسئولیت‌پذیر',     i:'🎖️', need:400, rw:{ points:6 } },
    { id:'d5', t:'ستون کلاس',        i:'🏛️', need:700, rw:{ points:10, spin:2 } }
  ],
  crea: [
    { id:'c1', t:'آینهٔ روشن',       i:'🪞', need:30,  rw:{ spin:1 } },
    { id:'c2', t:'هدف‌گذار',         i:'🎯', need:90,  rw:{ points:3 } },
    { id:'c3', t:'ایده‌پرداز',       i:'💡', need:200, rw:{ freeze:1 } },
    { id:'c4', t:'خلاقِ کلاس',       i:'🎨', need:400, rw:{ points:6, spin:1 } },
    { id:'c5', t:'ذهن درخشان',       i:'✨', need:700, rw:{ voucher:1, points:8 } }
  ]
};
const BOSS_METRICS = {
  hw_done: { l:'تکلیف کامل‌شده', i:'📚', hint:'هر تکلیف کامل = ۱ ضربه به غول', calc(st,f,t){ let n=0; const hw=st.homework; if(!hw) return 0; for(const a of (hw.assignments||[])){ if(a.status==='draft'||!(a.dueAt>=f&&a.dueAt<=t)) continue; const sub=(hw.subs&&hw.subs[a.id])||{}; for(const k in sub){ if(sub[k]&&sub[k].status==='done') n++; } } return n; } },
  attendance: { l:'حضور سبز کلاس', i:'🗓️', hint:'هر حضور هر دانش‌آموز = ۱ ضربه', calc(st,f,t){ let n=0; for(const d in (st.attendance||{})){ if(d<f||d>t) continue; for(const sid in st.attendance[d]){ const v=st.attendance[d][sid]; if(v==='present'||v==='late') n++; } } return n; } },
  help: { l:'کمکِ ثبت‌شده', i:'🤝', hint:'هر کمک تأییدشده = ۱ ضربه', calc(st,f,t){ return ((st.growth&&st.growth.helps)||[]).filter(h=>h.date>=f&&h.date<=t&&h.status!=='rejected').length; } },
  quiz: { l:'شرکت در آزمون', i:'🧠', hint:'هر پاسخ آزمون = ۱ ضربه', calc(st,f,t){ let n=0; for(const q of (st.quizzes||[])){ const d=iranISO(new Date(q.startAt)); if(d<f||d>t) continue; n+=Object.keys(q.submissions||{}).length; } return n; } },
  checkin: { l:'احوال‌پرسی روزانه', i:'🪞', hint:'هر آینهٔ روزانه = ۱ ضربه', calc(st,f,t){ return ((st.growth&&st.growth.checkins)||[]).filter(c=>c.date>=f&&c.date<=t).length; } },
  clean: { l:'روزِ بدون تخلف', i:'🛡️', hint:'هر روز بدون تخلفِ کل کلاس = ۱ ضربه', calc(st,f,t){ const bad=new Set((st.discipline||[]).filter(d=>(Number(d.points)||0)<0&&d.date>=f&&d.date<=t).map(d=>d.date)); let n=0, d=isoToDate(f); const e=isoToDate(t); while(d<=e){ const iso=dateToISO(d); if(C.wdIdx(iso)<=4&&!bad.has(iso)) n++; d.setDate(d.getDate()+1); } return n; } }
};

function xpOf(st, sid){ const sk=st.skills; if(!sk.xp[sid]) sk.xp[sid]={acad:0,social:0,disc:0,crea:0}; return sk.xp[sid]; }
function domTotal(x){ return (x.acad||0)+(x.social||0)+(x.disc||0)+(x.crea||0); }
function nodeState(st, sid, dom, n){
  const x = xpOf(st,sid)[dom]||0;
  if ((st.skills.claimed[sid]||[]).indexOf(n.id) > -1) return { k:'done', pct:100 };
  if (x >= n.need) return { k:'ready', pct:100 };
  return { k:'locked', pct: clamp(Math.round(x/n.need*100),0,99) };
}
function bossProgress(st, b){ const m = BOSS_METRICS[b.metric]; return m ? m.calc(st, b.from, b.to) : 0; }
function progressBosses(st){
  const sk = st.skills; if (!sk) return false;
  const today = todayISO(); let ch = false;
  for (const b of (sk.bosses||[])) {
    if (b.status !== 'active') continue;
    const p = bossProgress(st, b);
    if (p >= b.target) {
      b.status = 'defeated'; b.defeatedAt = T(); ch = true;
      for (const s of (st.students||[])) C.grGrant(st, s.id, { points:(b.reward||{}).points||0, xp:(b.reward||{}).xp||0, spin:(b.reward||{}).spin||0, freeze:(b.reward||{}).freeze||0, reason:'🐉 شکست غول: '+b.title, ref:'boss:'+b.id+':'+s.id, kind:'boss' });
    } else if (today > b.to) { b.status = 'escaped'; ch = true; }
  }
  return ch;
}
function seedBoss(st){
  const j = jOf(todayISO());
  const from = jToISO(j.jy, j.jm, 1);
  const to = jToISO(j.jy, j.jm, C.Jalali.monthLen(j.jy, j.jm));
  const n = (st.students||[]).length || 20;
  st.skills.bosses.push({ id: uid(), title:'غولِ تنبلیِ ماه', icon:'🐉', flavor:'این غول با هر تکلیفِ نیمه‌کاره قوی‌تر می‌شود؛ تنها راه شکستش، تکلیف‌های کاملِ همهٔ کلاس است!', metric:'hw_done', target: n*4, from, to, reward:{ points:4, xp:40, spin:1 }, status:'active', createdAt:T() });
}
function ensure(st){
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  let ch = false;
  if (!st.skills || typeof st.skills !== 'object') { st.skills = { xp:{}, claimed:{}, bosses:[], seeded:false }; ch = true; }
  const sk = st.skills;
  if (!sk.xp || typeof sk.xp !== 'object') { sk.xp = {}; ch = true; }
  if (!sk.claimed || typeof sk.claimed !== 'object') { sk.claimed = {}; ch = true; }
  if (!Array.isArray(sk.bosses)) { sk.bosses = []; ch = true; }
  if (!sk.seeded) { seedBoss(st); sk.seeded = true; ch = true; }
  if (progressBosses(st)) ch = true;
  return ch;
}

const bad = m => { const e = new Error(m); e.status = 400; return e; };
const forb = m => { const e = new Error(m); e.status = 403; return e; };
const str = (v,n) => String(v==null?'':v).trim().slice(0,n);
const num = v => Number(String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) || 0;

function apply(st, cmd, session){
  ensure(st);
  const sk = st.skills, sid = session.sid;
  const teacher = () => { if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است.'); };
  let result = null;
  switch (cmd.type) {
    case 'sk.node.claim': {
      const dom = NODES[cmd.domain] ? cmd.domain : null;
      const n = dom ? (NODES[dom]||[]).find(x => x.id === cmd.nodeId) : null;
      if (!n) throw bad('گره یافت نشد');
      const stt = nodeState(st, sid, dom, n);
      if (stt.k === 'done') throw bad('این گره را قبلاً گرفته‌ای');
      if (stt.k === 'locked') throw bad('هنوز XP کافی نداری؛ '+fa(n.need)+' XP لازم است');
      sk.claimed[sid] = sk.claimed[sid] || [];
      sk.claimed[sid].push(n.id);
      C.grGrant(st, sid, { points:(n.rw||{}).points||0, xp:(n.rw||{}).xp||0, spin:(n.rw||{}).spin||0, freeze:(n.rw||{}).freeze||0, voucher:(n.rw||{}).voucher||0, reason:'🌳 گرهٔ مهارت: '+n.t, ref:'skn:'+n.id+':'+sid, kind:'skill' });
      result = { node: n.id }; break;
    }
    case 'sk.grant': {
      teacher();
      if (!stuById(st, cmd.sid)) throw bad('دانش‌آموز یافت نشد');
      if (!NODES[cmd.domain]) throw bad('شاخه نامعتبر');
      const amt = clamp(Math.round(num(cmd.xp)||0), 1, 500);
      xpOf(st, cmd.sid)[cmd.domain] = (xpOf(st, cmd.sid)[cmd.domain]||0) + amt;
      result = { amt }; break;
    }
    case 'sk.boss.create': {
      teacher();
      const title = str(cmd.title, 90); if (!title) throw bad('نام غول را بنویس');
      if (!BOSS_METRICS[cmd.metric]) throw bad('سنجه نامعتبر');
      const target = clamp(Math.round(num(cmd.target)||10), 5, 5000);
      const from = C.parseDateAny(cmd.from) || todayISO();
      const to = C.parseDateAny(cmd.to) || from;
      if (to < from) throw bad('پایان نباید قبل از شروع باشد');
      const id = str(cmd.id,24) || uid();
      sk.bosses.push({ id, title, icon: str(cmd.icon,6)||'🐉', flavor: str(cmd.flavor,220), metric: cmd.metric, target, from, to, reward:{ points: clamp(Math.round(num(cmd.rp)||0),0,30), xp: clamp(Math.round(num(cmd.rx)||0),0,300), spin: clamp(Math.round(num(cmd.rs)||0),0,5), freeze: clamp(Math.round(num(cmd.rf)||0),0,5) }, status:'active', createdAt:T() });
      result = { id }; break;
    }
    case 'sk.boss.delete': { teacher(); sk.bosses = sk.bosses.filter(b => b.id !== cmd.id); break; }
    default: throw bad('عملیات ناشناخته: ' + cmd.type);
  }
  return { state: st, result };
}

/* XP شاخه‌ها از هر پاداشِ رشد به‌صورت خودکار تغذیه می‌شود */
if (typeof C.grGrant === 'function') {
  const baseGrant = C.grGrant;
  C.grGrant = function (st, sid, o) {
    const r = baseGrant(st, sid, o);
    try {
      if (r !== false && st.skills && o) {
        const dom = KIND_DOMAIN[o.kind];
        const amt = Math.round(o.xp || 0);
        if (dom && amt > 0) { const x = xpOf(st, sid); x[dom] = (x[dom]||0) + amt; }
      }
    } catch (e) {}
    return r;
  };
}

const baseApply = C.applyCommand, baseSeed = C.buildSeed, baseNorm = C.normalize, baseView = C.viewFor;
C.applyCommand = function (st, cmd, session) {
  if (!cmd || typeof cmd.type !== 'string') return baseApply(st, cmd, session);
  if (!session) { const e = new Error('نشست نامعتبر است'); e.status = 401; throw e; }
  if (cmd.type === 'data.reset' || cmd.type === 'data.replace') {
    const out = baseApply(st, cmd, session);
    if (cmd.type === 'data.reset') { delete st.skills; ensure(st); } else ensure(st);
    return out;
  }
  if (cmd.type.indexOf('sk.') !== 0) { const out = baseApply(st, cmd, session); try { progressBosses(out.state); } catch (e) {} return out; }
  const cid = String(cmd.cid||'').slice(0,40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.indexOf(cid) > -1) return { state: st, result: { duplicate: true } };
  const out = apply(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); ensure(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensure(st); return st; };
C.viewFor = function (st, session) {
  const v = baseView(st, session); if (!v) return v;
  ensure(st);
  const sk = st.skills;
  const bosses = (sk.bosses||[]).map(b => { const p = bossProgress(st, b); return Object.assign({}, clone(b), { p, remain: Math.max(0, b.target - p) }); });
  if (session.role === 'teacher') {
    v.skills = { domains: DOMAINS, nodes: NODES, bosses,
      metrics: Object.keys(BOSS_METRICS).map(k => ({ k, l: BOSS_METRICS[k].l, i: BOSS_METRICS[k].i })),
      rows: (st.students||[]).map(s => { const x = xpOf(st, s.id); return { id:s.id, name:s.name, avatar:s.avatar, acad:x.acad||0, social:x.social||0, disc:x.disc||0, crea:x.crea||0, total:domTotal(x), nodes:(sk.claimed[s.id]||[]).length }; }).sort((a,b)=>b.total-a.total) };
  } else {
    const sid = session.sid;
    v.skills = { domains: DOMAINS, nodes: NODES, bosses, xp: clone(xpOf(st, sid)), claimed: clone(sk.claimed[sid]||[]) };
  }
  return v;
};
C.SK_DOMAINS = DOMAINS; C.SK_NODES = NODES; C.SK_BOSS_METRICS = BOSS_METRICS;
C.skEnsure = ensure; C.skXp = xpOf; C.skTotal = domTotal; C.skNodeState = nodeState; C.skBossProgress = bossProgress;
})(typeof globalThis !== 'undefined' ? globalThis : this);
