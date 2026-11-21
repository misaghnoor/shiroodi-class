/* api/state.js — دریافت دادهٔ مشترک با کنترل نسخه (همگام‌سازی) */
import '../core.js';
import { getSession } from '../lib/db.js';
import { ensureStore } from '../lib/store.js';

const C = globalThis.ClassCore;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const a = req.headers.authorization || '';
  const token = a.startsWith('Bearer ') ? a.slice(7) : null;
  try {
    const session = await getSession(token);
    if (!session) return res.status(401).json({ error: 'unauthorized', message: 'نشست نامعتبر است؛ دوباره وارد شوید.' });
    const row = await ensureStore();
    const clientRev = Number(req.query?.rev);
    if (Number.isFinite(clientRev) && clientRev === Number(row.revision))
      return res.status(200).json({ revision: Number(row.revision), changed: false });
    const state = C.viewFor(row.data, session);
    if (!state) return res.status(404).json({ error: 'student_not_found', message: 'دانش‌آموز یافت نشد.' });
    return res.status(200).json({ revision: Number(row.revision), changed: true, state, role: session.role });
  } catch (e) {
    console.error('state', e);
    return res.status(500).json({ error: 'server_error', message: 'خطای سرور؛ دوباره تلاش کنید.' });
  }
}