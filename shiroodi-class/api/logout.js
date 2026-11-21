/* api/logout.js */
import { getSession, deleteSession } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const a = req.headers.authorization || '';
  const token = a.startsWith('Bearer ') ? a.slice(7) : null;
  try { const s = await getSession(token); if (s) await deleteSession(token); }
  catch (e) { console.error('logout', e); }
  return res.status(200).json({ ok: true });
}