/* api/mutate.js — تنها مسیر تغییر داده؛ معلم و دانش‌آموز با بررسی نقش */
import '../core.js';
import { getSession } from '../lib/db.js';
import { mutateStore } from '../lib/store.js';

const C = globalThis.ClassCore;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const a = req.headers.authorization || '';
  const token = a.startsWith('Bearer ') ? a.slice(7) : null;
  try {
    const session = await getSession(token);
    if (!session) return res.status(401).json({ error: 'unauthorized', message: 'نشست نامعتبر است؛ دوباره وارد شوید.' });
    const cmd = req.body?.cmd;
    if (!cmd || typeof cmd.type !== 'string') return res.status(400).json({ error: 'bad_command', message: 'فرمان نامعتبر.' });
    const out = await mutateStore(cmd, session);
    const state = C.viewFor(out.state, session);
    if (!state) return res.status(404).json({ error: 'student_not_found', message: 'دانش‌آموز یافت نشد.' });
    return res.status(200).json({ revision: out.revision, state, role: session.role, result: out.result });
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error('mutate', e);
    return res.status(status).json({ error: e.code || 'server_error', message: status >= 500 ? 'خطای سرور؛ دوباره تلاش کنید.' : e.message });
  }
}