import crypto from 'crypto';
import { getState, setState, createSession, getDefaultState } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { code } = req.body || {};
  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'code_required' });

  let state = await getState();
  if (!state) { state = getDefaultState(); await setState(state); }

  const teacherCode = process.env.TEACHER_CODE || '991404';
  let role, sid, name;

  if (code === teacherCode) {
    role = 'teacher';
  } else {
    const student = (state.students || []).find(s => s.code === code);
    if (!student) return res.status(401).json({ error: 'invalid_code' });
    role = 'student';
    sid = student.id;
    name = student.name;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await createSession(token, { role, sid, name }, expiresAt);

  return res.json({ token, role, sid, name });
}