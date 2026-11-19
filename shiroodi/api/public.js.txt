import { getState } from '../lib/db.js';

export default async function handler(req, res) {
  const state = await getState();
  if (!state) return res.json({ news: [] });
  res.json({
    news: (state.news || []).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)),
    school: state.meta?.school,
    className: state.meta?.className
  });
}