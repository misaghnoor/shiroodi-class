import { getState, setState, getSession } from '../lib/db.js';

function getAuth(req) {
  const a = req.headers.authorization;
  return a?.startsWith('Bearer ') ? a.slice(7) : null;
}

function computeStudentStats(state, sid) {
  const levels = state.levels || [];
  let sum = 0, cnt = 0;
  for (const a of state.assessments || []) {
    for (const sub of (a.subjects || [])) {
      const g = state.grades?.[a.id]?.[sub]?.[sid];
      if (g != null) {
        const idx = levels.findIndex(l => l.key === g);
        sum += (idx < 0 ? 0 : levels.length - idx);
        cnt++;
      }
    }
  }
  const avg = cnt ? sum / cnt : 0;
  let total = 0, present = 0;
  for (const d in state.attendance || {}) {
    const v = state.attendance[d][sid];
    if (!v) continue;
    total++;
    if (v === 'present') present++;
  }
  const attRate = total ? Math.round(present / total * 100) : 0;
  const pts = (state.discipline || []).filter(r => r.sid === sid).reduce((a, b) => a + b.points, 0);
  return { avg, cnt, total, attRate, pts };
}

function filterForStudent(state, sid) {
  const student = state.students.find(s => s.id === sid);
  if (!student) return null;

  const group = state.groups.find(g => g.members.includes(sid));
  let groupInfo = null;
  if (group) {
    let sum = 0, cnt = 0, pts = 0, attSum = 0, attCnt = 0;
    for (const mid of group.members) {
      const st = computeStudentStats(state, mid);
      if (st.cnt) { sum += st.avg; cnt++; }
      if (st.total) { attSum += st.attRate; attCnt++; }
      pts += st.pts;
    }
    const ranks = state.groups.map(g => {
      let s = 0, c = 0;
      for (const mid of g.members) {
        const st = computeStudentStats(state, mid);
        if (st.cnt) { s += st.avg; c++; }
      }
      return { id: g.id, avg: c ? s / c : 0 };
    }).sort((a, b) => b.avg - a.avg);
    groupInfo = {
      id: group.id, name: group.name, color: group.color,
      aggregate: { memberCount: group.members.length, avgScore: cnt ? sum / cnt : 0, attRate: attCnt ? Math.round(attSum / attCnt) : 0, pts },
      rank: ranks.findIndex(r => r.id === group.id) + 1,
      totalGroups: state.groups.length
    };
  }

  const grades = {};
  for (const aid in state.grades || {}) {
    for (const sub in state.grades[aid]) {
      if (state.grades[aid][sub][sid] !== undefined) {
        if (!grades[aid]) grades[aid] = {};
        if (!grades[aid][sub]) grades[aid][sub] = {};
        grades[aid][sub][sid] = state.grades[aid][sub][sid];
      }
    }
  }

  const attendance = {};
  for (const date in state.attendance || {}) {
    if (state.attendance[date][sid]) attendance[date] = { [sid]: state.attendance[date][sid] };
  }

  const discipline = (state.discipline || []).filter(d => d.sid === sid);

  const quizzes = (state.quizzes || []).map(q => {
    const isActive = q.status === 'active';
    return {
      id: q.id, title: q.title, description: q.description,
      durationMin: q.durationMin, status: q.status, resultsVisible: q.resultsVisible,
      questions: (q.questions || []).map(qq => {
        if (isActive && qq.type === 'mcq') {
          const { correctOptionId, ...rest } = qq;
          return rest;
        }
        return qq;
      }),
      submissions: q.submissions?.[sid] ? { [sid]: q.submissions[sid] } : {}
    };
  });

  const allStats = state.students.map(s => ({ id: s.id, ...computeStudentStats(state, s.id) }));
  const withGrades = allStats.filter(s => s.cnt);
  const classOverallAvg = withGrades.length ? withGrades.reduce((a, b) => a + b.avg, 0) / withGrades.length : 0;
  const sorted = [...allStats].sort((a, b) => b.avg - a.avg);
  const myRank = sorted.findIndex(s => s.id === sid && s.avg > 0) + 1;

  const subjectAvgs = {};
  for (const sub of state.subjects || []) {
    let s = 0, c = 0;
    for (const a of state.assessments || []) {
      if (!(a.subjects || []).includes(sub)) continue;
      for (const st of state.students) {
        const g = state.grades?.[a.id]?.[sub]?.[st.id];
        if (g != null) {
          const idx = state.levels.findIndex(l => l.key === g);
          s += (idx < 0 ? 0 : state.levels.length - idx);
          c++;
        }
      }
    }
    if (c) subjectAvgs[sub] = s / c;
  }

  return {
    meta: state.meta, levels: state.levels, subjects: state.subjects,
    assessments: state.assessments,
    student: { id: student.id, name: student.name, code: student.code },
    grades, attendance, discipline, quizzes,
    polls: state.polls || [], news: state.news || [],
    group: groupInfo,
    aggregates: { classOverallAvg, subjectAvgs, myRank: myRank || 0, totalStudents: state.students.length },
    studentVisibility: state.studentVisibility
  };
}

export default async function handler(req, res) {
  const token = getAuth(req);
  const session = await getSession(token);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  try {
    if (req.method === 'GET') {
      const state = await getState();
      if (!state) return res.status(500).json({ error: 'state_not_initialized' });
      const filtered = session.role === 'teacher' ? state : filterForStudent(state, session.sid);
      if (!filtered) return res.status(404).json({ error: 'student_not_found' });
      return res.json({ state: filtered, role: session.role });
    }
    if (req.method === 'POST') {
      if (session.role !== 'teacher') return res.status(403).json({ error: 'forbidden' });
      const { state } = req.body || {};
      if (!state || !state.students) return res.status(400).json({ error: 'invalid_state' });
      await setState(state);
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error', message: e.message });
  }
}