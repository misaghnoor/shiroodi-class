/* api/login.js — GET: اطلاعات عمومی صفحهٔ ورود | POST: ورود با کد */
import crypto from 'node:crypto';
import { createSession, purgeSessions } from '../lib/db.js';
import { ensureStore } from '../lib/store.js';

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const h = hits.get(ip) || { n: 0, t: now };
  if (now - h.t > 60000) { h.n = 0; h.t = now; }
  h.n++; hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.n > 30;
}
const FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩';
const normCode = v => String(v ?? '').trim().replace(/[۰-۹٠-٩]/g, c => {
  const i = FA.indexOf(c); return i > -1 ? String(i) : String(AR.indexOf(c));
});
function safeEq(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const { data } = await ensureStore();
      return res.status(200).json({
        ok: true,
        public: {
          school: data.meta.school, className: data.meta.className, year: data.meta.year, teacher: data.meta.teacher,
          students: data.students.length, assessments: data.assessments.length,
          attendanceDays: Object.keys(data.attendance || {}).length,
          discipline: data.discipline.length, groups: data.groups.length
        }
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local';
    if (limited(ip)) return res.status(429).json({ error: 'rate_limited', message: 'تلاش بیش از حد؛ یک دقیقه دیگر تلاش کنید.' });

    const code = normCode(req.body?.code);
    if (!code) return res.status(400).json({ error: 'code_required', message: 'کد ورود الزامی است.' });

    const { data } = await ensureStore();
    const teacherCode = normCode(data.meta.teacherCode || process.env.TEACHER_CODE || '991404');
    let role, sid = null, name;
    if (safeEq(code, teacherCode)) { role = 'teacher'; name = data.meta.teacher || 'معلم'; }
    else {
      const student = data.students.find(s => String(s.code) === code);
      if (!student) return res.status(401).json({ error: 'invalid_code', message: 'کد وارد شده معتبر نیست.' });
      role = 'student'; sid = student.id; name = student.name;
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 12 * 3600 * 1000);
    await createSession(token, { role, sid, name }, expiresAt);
    purgeSessions().catch(() => {});
    return res.status(200).json({ token, role, sid, name, exp: expiresAt.getTime() });
  } catch (e) {
    console.error('login', e);
    return res.status(500).json({ error: 'server_error', message: 'خطای سرور؛ تنظیمات Supabase را بررسی کنید.' });
  }
}