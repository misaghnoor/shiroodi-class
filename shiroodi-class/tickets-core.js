/* tickets-core.js — تیکت و پیام‌های خصوصی/گروهی (هستهٔ مشترک مرورگر + سرور) */
(function (g) {
'use strict';
const C = g.ClassCore;
if (!C || g.__ticketsCore) return;
g.__ticketsCore = true;

const uid = C.uid, clone = C.clone, str0 = String;
const stuById = C.stuById;

const TK_PRI = {
  low:    { l: 'کم‌اهمیت', i: '🟢', c: '#65a30d', w: 1 },
  normal: { l: 'عادی',     i: '🔵', c: '#1d4ed8', w: 2 },
  high:   { l: 'مهم',      i: '🟠', c: '#d97706', w: 3 },
  urgent: { l: 'فوری',     i: '🔴', c: '#e11d48', w: 4 }
};
const TK_STATUS = {
  open:     { l: 'باز',           i: '📬', c: '#1d4ed8' },
  answered: { l: 'پاسخ‌داده‌شده', i: '💬', c: '#0d9488' },
  closed:   { l: 'بسته',          i: '🔒', c: '#7b7261' }
};
const TK_CH = {
  private: { l: 'خصوصی با معلم', i: '🔐', c: '#7c3aed' },
  group:   { l: 'گفت‌وگوی گروه', i: '👥', c: '#0ea5e9' }
};

const T = () => new Date().toISOString();
function parts(st, t) {
  if (t.channel === 'group') {
    const g = (st.groups || []).find(x => x.id === t.target);
    return ['teacher'].concat(g ? (g.members || []) : []);
  }
  return ['teacher', t.target];
}
function lastAt(t) {
  let at = t.createdAt, by = t.from;
  for (const r of t.replies || []) if (r.at > at) { at = r.at; by = r.by; }
  return { at, by };
}
function visible(st, key) { return (st.tickets.items || []).filter(t => parts(st, t).includes(key)); }
function unread(st, key) {
  return visible(st, key).filter(t => { const l = lastAt(t); return l.by !== key && l.at > ((t.reads || {})[key] || ''); }).length;
}
function settingsDefault() { return { studentToTeacher: true, studentToGroup: true }; }

function seed(st) {
  const S0 = st.students || [], g0 = (st.groups || [])[0];
  const now = Date.now(), at = h => new Date(now - h * 3600000).toISOString();
  const items = [];
  if (S0[6]) items.push({ id: uid(), channel: 'private', target: S0[6].id, from: 'teacher', priority: 'high', subject: 'تکلیف ریاضی جا مانده', body: 'سلام قهرمان! تمرین‌های صفحهٔ ۳۴ را ندیده‌ام. تا فردا فرصت داری کاملشان کنی؛ هر جا سخت بود همین‌جا بگو تا با هم حل کنیم.', status: 'answered', createdAt: at(30), reads: { teacher: at(30) }, replies: [ { id: uid(), by: S0[6].id, body: 'سلام آقای معلم! ببخشید، دفترم را جا گذاشته بودم. امشب کامل می‌کنم و عکس می‌فرستم.', at: at(26) }, { id: uid(), by: 'teacher', body: 'عالی، منتظرم 🌟 سؤال داشتی همین‌جا بپرس.', at: at(24) } ] });
  if (S0[0]) items.push({ id: uid(), channel: 'private', target: S0[0].id, from: S0[0].id, priority: 'normal', subject: 'سؤال دربارهٔ آزمون ریاضی', body: 'استاد، در سؤال ۳ آزمون آخر نفهمیدم چرا مخرج مشترک ۱۲ می‌شود. می‌شود یک بار دیگر توضیح بدهید؟', status: 'answered', createdAt: at(50), reads: {}, replies: [ { id: uid(), by: 'teacher', body: 'حتماً! فردا زنگ اول پای تخته با هم حل می‌کنیم. نکته: کوچک‌ترین مضرب مشترک ۴ و ۶ می‌شود ۱۲.', at: at(48) } ] });
  if (g0 && g0.members && g0.members[1]) items.push({ id: uid(), channel: 'group', target: g0.id, from: g0.members[1], priority: 'low', subject: 'برنامهٔ مرور گروه برای امتحان علوم', body: 'بچه‌ها پیشنهاد می‌کنم پنج‌شنبه ساعت ۱۷ آنلاین مرور کنیم؛ هر کس خلاصهٔ یک درس را بنویسد.', status: 'open', createdAt: at(8), reads: {}, replies: g0.members[2] ? [ { id: uid(), by: g0.members[2], body: 'من خلاصهٔ درس ۲ را می‌نویسم ✍️', at: at(6) } ] : [] });
  if (S0[12]) items.push({ id: uid(), channel: 'private', target: S0[12].id, from: S0[12].id, priority: 'urgent', subject: 'درخواست گفت‌وگوی خصوصی', body: 'استاد می‌شود امروز بعد از کلاس پنج دقیقه وقت بگذارید؟ موضوعی هست که می‌خواهم حضوری بگویم.', status: 'open', createdAt: at(3), reads: {}, replies: [] });
  return { items, settings: settingsDefault(), seq: items.length };
}
function ensure(st) {
  if (!st || !Array.isArray(st.students) || !st.students.length) return false;
  if (!st.tickets || !Array.isArray(st.tickets.items)) { st.tickets = seed(st); return true; }
  let ch = false;
  st.tickets.settings = Object.assign(settingsDefault(), st.tickets.settings || {});
  (st.tickets.items || []).forEach(t => { if (!t.reads || typeof t.reads !== 'object') { t.reads = {}; ch = true; } if (!Array.isArray(t.replies)) { t.replies = []; ch = true; } });
  return ch;
}
function view(st, session) {
  ensure(st);
  const key = session.role === 'teacher' ? 'teacher' : session.sid;
  return {
    items: clone(visible(st, key)),
    settings: session.role === 'teacher' ? clone(st.tickets.settings) : { studentToTeacher: st.tickets.settings.studentToTeacher !== false, studentToGroup: st.tickets.settings.studentToGroup !== false },
    me: key
  };
}

const bad = m => { const e = new Error(m); e.status = 400; e.code = 'bad_request'; return e; };
const forb = m => { const e = new Error(m); e.status = 403; e.code = 'forbidden'; return e; };
const str = (v, n) => str0(v == null ? '' : v).trim().slice(0, n);

function apply(st, cmd, session) {
  ensure(st);
  const tk = st.tickets, me = session.role === 'teacher' ? 'teacher' : session.sid, t0 = cmd.type;
  const findT = id => { const t = tk.items.find(x => x.id === id); if (!t) throw bad('تیکت یافت نشد'); return t; };
  const mustPart = t => { if (!parts(st, t).includes(me)) throw forb('شما عضو این گفت‌وگو نیستید'); };
  let result = null;

  switch (t0) {
    case 'tk.create': {
      let channel = cmd.channel === 'group' ? 'group' : 'private';
      let target, from = me;
      if (session.role === 'teacher') {
        if (channel === 'private') { if (!stuById(st, cmd.target)) throw bad('دانش‌آموز را انتخاب کن'); target = cmd.target; }
        else { const g = (st.groups || []).find(x => x.id === cmd.target); if (!g) throw bad('گروه را انتخاب کن'); target = g.id; }
      } else {
        if (channel === 'private') {
          if (tk.settings.studentToTeacher === false) throw bad('ارسال پیام به معلم موقتاً بسته است');
          target = session.sid;
        } else {
          if (tk.settings.studentToGroup === false) throw bad('گفت‌وگوی گروهی موقتاً بسته است');
          const g = (st.groups || []).find(x => x.id === cmd.target && (x.members || []).includes(session.sid));
          if (!g) throw forb('فقط می‌توانی به گروه خودت پیام بگذاری');
          target = g.id;
        }
      }
      const subject = str(cmd.subject, 90), body = str(cmd.body, 2000);
      if (!subject || !body) throw bad('موضوع و متن پیام الزامی است');
      const pri = TK_PRI[cmd.priority] ? cmd.priority : 'normal';
      const id = str(cmd.id, 24) || uid();
      tk.items.push({ id, channel, target, from, priority: pri, subject, body, status: 'open', createdAt: T(), reads: { [me]: T() }, replies: [] });
      tk.seq = (tk.seq || 0) + 1;
      result = { id }; break;
    }
    case 'tk.reply': {
      const t = findT(cmd.id); mustPart(t);
      if (t.status === 'closed') throw bad('این تیکت بسته است؛ اول بازکش کن');
      const body = str(cmd.body, 2000); if (!body) throw bad('متن پاسخ خالی است');
      t.replies.push({ id: uid(), by: me, body, at: T() });
      t.reads = t.reads || {}; t.reads[me] = T();
      if (t.status === 'open') t.status = 'answered';
      break;
    }
    case 'tk.read': { const t = findT(cmd.id); mustPart(t); t.reads = t.reads || {}; t.reads[me] = T(); break; }
    case 'tk.readAll': { visible(st, me).forEach(t => { t.reads = t.reads || {}; t.reads[me] = T(); }); break; }
    case 'tk.status': {
      const t = findT(cmd.id); mustPart(t);
      const s = TK_STATUS[cmd.status] ? cmd.status : null; if (!s) throw bad('وضعیت نامعتبر');
      if (session.role !== 'teacher' && t.from !== me && t.channel !== 'private') throw forb('فقط معلم یا نویسنده می‌تواند وضعیت را عوض کند');
      t.status = s; break;
    }
    case 'tk.priority': {
      const t = findT(cmd.id); mustPart(t);
      if (session.role !== 'teacher' && t.from !== me) throw forb('فقط معلم یا نویسنده می‌تواند درجه را عوض کند');
      if (!TK_PRI[cmd.priority]) throw bad('درجه نامعتبر');
      t.priority = cmd.priority; break;
    }
    case 'tk.delete': {
      if (session.role !== 'teacher') throw forb('حذف تیکت فقط برای معلم است');
      tk.items = tk.items.filter(x => x.id !== cmd.id); break;
    }
    case 'tk.settings': {
      if (session.role !== 'teacher') throw forb('این عملیات مخصوص معلم است');
      const p = cmd.patch || {};
      if (p.studentToTeacher != null) tk.settings.studentToTeacher = !!p.studentToTeacher;
      if (p.studentToGroup != null) tk.settings.studentToGroup = !!p.studentToGroup;
      break;
    }
    default: throw bad('عملیات ناشناخته: ' + t0);
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
    if (cmd.type === 'data.reset') { delete st.tickets; ensure(st); } else ensure(st);
    return out;
  }
  if (cmd.type.indexOf('tk.') !== 0) return baseApply(st, cmd, session);
  const cid = str0(cmd.cid || '').slice(0, 40);
  st._applied = Array.isArray(st._applied) ? st._applied : [];
  if (cid && st._applied.includes(cid)) return { state: st, result: { duplicate: true } };
  const out = apply(st, cmd, session);
  if (cid) { st._applied.push(cid); if (st._applied.length > 60) st._applied = st._applied.slice(-60); }
  return out;
};
C.buildSeed = function () { const st = baseSeed(); ensure(st); return st; };
C.normalize = function (raw) { const st = baseNorm(raw); ensure(st); return st; };
C.viewFor = function (st, session) { const v = baseView(st, session); if (v) v.tickets = view(st, session); return v; };

C.TK_PRI = TK_PRI; C.TK_STATUS = TK_STATUS; C.TK_CH = TK_CH;
C.tkEnsure = ensure; C.tkParts = parts; C.tkLast = lastAt; C.tkVisible = visible; C.tkUnread = unread;
})(typeof globalThis !== 'undefined' ? globalThis : this);
