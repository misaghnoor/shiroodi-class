import { getState, setState, getSession } from '../lib/db.js';

function getAuth(req) {
  const a = req.headers.authorization;
  return a?.startsWith('Bearer ') ? a.slice(7) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const token = getAuth(req);
  const session = await getSession(token);
  if (!session) return res.status(401).json({ error: 'unauthorized' });
  if (session.role !== 'student') return res.status(403).json({ error: 'forbidden' });

  const { action, payload } = req.body || {};
  const sid = session.sid;

  try {
    const state = await getState();
    if (!state) return res.status(500).json({ error: 'state_not_initialized' });

    if (action === 'vote_poll') {
      const { pollId, votes } = payload;
      const poll = state.polls?.find(p => p.id === pollId);
      if (!poll || poll.status !== 'active') return res.status(400).json({ error: 'poll_not_active' });
      if (!poll.votes) poll.votes = {};
      poll.votes[sid] = Array.isArray(votes) ? votes : [];
      await setState(state);
      return res.json({ ok: true });
    }

    if (action === 'start_quiz') {
      const { quizId } = payload;
      const quiz = state.quizzes?.find(q => q.id === quizId);
      if (!quiz || quiz.status !== 'active') return res.status(400).json({ error: 'quiz_not_active' });
      if (!quiz.submissions) quiz.submissions = {};
      if (!quiz.submissions[sid]) {
        quiz.submissions[sid] = { startedAt: new Date().toISOString(), answers: {}, submittedAt: null, autoScore: null, manualScores: {} };
        await setState(state);
      }
      return res.json({ ok: true, startedAt: quiz.submissions[sid].startedAt });
    }

    if (action === 'submit_quiz') {
      const { quizId, answers } = payload;
      const quiz = state.quizzes?.find(q => q.id === quizId);
      if (!quiz || quiz.status !== 'active') return res.status(400).json({ error: 'quiz_not_active' });
      if (!quiz.submissions) quiz.submissions = {};
      if (quiz.submissions[sid]?.submittedAt) return res.status(400).json({ error: 'already_submitted' });
      const sub = quiz.submissions[sid] || { startedAt: new Date().toISOString() };
      sub.answers = answers || {};
      sub.submittedAt = new Date().toISOString();
      let autoScore = 0;
      for (const qq of quiz.questions || []) {
        if (qq.type === 'mcq' && sub.answers[qq.id] === qq.correctOptionId) autoScore += qq.points;
      }
      sub.autoScore = autoScore;
      if (!sub.manualScores) sub.manualScores = {};
      quiz.submissions[sid] = sub;
      await setState(state);
      return res.json({ ok: true, autoScore });
    }

    return res.status(400).json({ error: 'unknown_action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error', message: e.message });
  }
}