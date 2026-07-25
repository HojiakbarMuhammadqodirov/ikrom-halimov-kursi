import React, { useMemo, useState } from 'react';
import { Section, SubjectChip, Pill, formatDate, formatDateTime, initials } from './shared.jsx';
import { questionType, gradeQuestion, formatAnswer, correctIndices, cadenceLabel, testStatus } from '../lib/tests.js';

export default function TestResultsView({ state, test }) {
  const [openId, setOpenId] = useState(null);

  const questions = useMemo(
    () => (test.questionIds || []).map((id) => state.questions.find((q) => q.id === id)).filter(Boolean),
    [test, state.questions]
  );

  // Latest attempt per student for this test (a student may retake).
  const attempts = useMemo(() => {
    const rows = state.testResults
      .filter((r) => r.testId === test.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return rows.map((r) => ({ ...r, student: state.students.find((s) => s.id === r.studentId) }));
  }, [state.testResults, state.students, test.id]);

  const status = testStatus(test);
  const avg = attempts.length === 0 ? 0 : Math.round(attempts.reduce((s, r) => s + r.score, 0) / attempts.length);

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-title">
          <h2>{test.title}</h2>
          <Pill kind={status.tone === 'ok' ? 'up' : status.tone === 'warn' ? 'due' : 'overdue'}>{status.label}</Pill>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <SubjectChip subject={test.subject} />
          <Pill kind="accent">{test.code}</Pill>
          <span className="tiny">{cadenceLabel(test.cadence)}</span>
          <span className="tiny">· {questions.length} ta savol</span>
          <span className="tiny">· {attempts.length} ta topshirish</span>
          {attempts.length > 0 && <span className="tiny">· o'rtacha {avg}%</span>}
        </div>
      </div>

      <Section title="Kim ishlagan">
        {attempts.length === 0 ? (
          <div className="muted" style={{ padding: '8px 0' }}>Hali hech kim bu testni topshirmagan.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Sana</th>
                  <th className="num">Ball</th>
                  <th className="num">To'g'ri</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((r) => {
                  const isOpen = openId === r.id;
                  const scoreTone = r.score >= 70 ? 'up' : r.score >= 50 ? 'due' : 'down';
                  return (
                    <React.Fragment key={r.id}>
                      <tr>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="stud-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(r.student?.fullName || '?')}</div>
                            {r.student?.fullName || 'Nomaʼlum o\'quvchi'}
                          </div>
                        </td>
                        <td>{formatDateTime(r.date)}</td>
                        <td className="num"><Pill kind={scoreTone}>{r.score}%</Pill></td>
                        <td className="num">{r.correctCount}/{r.total}</td>
                        <td className="text-right">
                          <button className="btn btn-sm" onClick={() => setOpenId(isOpen ? null : r.id)}>
                            {isOpen ? 'Yopish' : 'Savollar'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} style={{ background: 'var(--bg-2)' }}>
                            <div className="attempt-detail">
                              {questions.map((q, i) => {
                                const ans = r.answers ? r.answers[q.id] : undefined;
                                const ok = gradeQuestion(q, ans);
                                const correct = correctIndices(q);
                                return (
                                  <div className="attempt-q" key={q.id}>
                                    <div className="attempt-q-head">
                                      <span className="tiny">{i + 1}-savol</span>
                                      {ok ? <Pill kind="up">To'g'ri</Pill> : <Pill kind="down">Xato</Pill>}
                                    </div>
                                    <div className="attempt-q-text">{q.text}</div>
                                    <div className="attempt-ans">
                                      <span className="k">Javobi:</span>
                                      <span className={ok ? 'text-success' : 'text-danger'}>{formatAnswer(q, ans)}</span>
                                    </div>
                                    {!ok && (
                                      <div className="attempt-ans">
                                        <span className="k">To'g'ri:</span>
                                        <span className="text-success">{correct.map((idx) => q.options[idx]).join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
