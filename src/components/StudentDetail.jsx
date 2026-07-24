import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import {
  Section, ProgressBar, SubjectChip, Sparkline, EmptyState, Pill,
  formatDate, formatMoney, daysUntil, initials,
} from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import { IntegralGlyph, Blackboard } from './SubjectArt.jsx';

export default function StudentDetail({ state, setState, student, readOnly = false }) {
  const studentResults = useMemo(
    () => state.testResults
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [state, student.id]
  );

  const payment = state.payments.find((p) => p.studentId === student.id);
  const attendance = state.attendance.filter((a) => a.studentId === student.id).slice(-20);

  // Per-subject per-topic performance
  const topicStats = useMemo(() => {
    const stats = {};
    state.topics.forEach((t) => {
      stats[t] = { subject: findSubjectForTopic(state, t), correct: 0, total: 0 };
    });
    state.questions.forEach((q) => { stats[q.topic].total += 1; });
    studentResults.forEach((r) => {
      Object.keys(r.answers || {}).forEach((qid) => {
        const q = state.questions.find((x) => x.id === qid);
        if (!q) return;
        if (r.answers[qid] === q.answer) stats[q.topic].correct += 1;
      });
    });
    return stats;
  }, [state, studentResults]);

  const wrongAnswers = useMemo(() => {
    const last = studentResults[studentResults.length - 1];
    if (!last) return [];
    return last.wrongQuestionIds
      .map((qid) => state.questions.find((q) => q.id === qid))
      .filter(Boolean)
      .map((q) => ({ question: q, studentAnswer: last.answers[q.id] }));
  }, [studentResults, state.questions]);

  const attendanceRate = attendance.length === 0 ? 0
    : Math.round((attendance.filter((a) => a.status === 'present' || a.status === 'late').length / attendance.length) * 100);
  const avgScore = studentResults.length === 0 ? 0
    : Math.round(studentResults.reduce((s, r) => s + r.score, 0) / studentResults.length);

  // Build the chart series with one row per (chronological) test date.
  const chartData = useMemo(() => {
    const byDate = {};
    studentResults.forEach((r) => {
      const k = formatDate(r.date);
      if (!byDate[k]) byDate[k] = { name: k };
      byDate[k][r.subject] = r.score;
    });
    return Object.values(byDate);
  }, [studentResults]);

  return (
    <div className="bento" style={{ marginTop: 24 }}>
      {/* Identity card */}
      <div className="shell span-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg">{initials(student.fullName)}</div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.02em' }}>{student.fullName}</h2>
              <div className="muted mono" style={{ fontSize: 12 }}>@{student.username}</div>
              {student.phone && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{student.phone}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
            {(student.subjects || ['fizika', 'matematika']).map((sid) => (
              <SubjectChip key={sid} subject={sid} />
            ))}
          </div>
        </div>
      </div>

      {/* Stat card 1 — avg score */}
      <div className="shell span-4">
        <div className="card">
          <div className="stat-label">O&lsquo;rtacha ball</div>
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-foot">
            <span className="muted">{studentResults.length} ta test asosida</span>
          </div>
        </div>
      </div>

      {/* Stat card 2 — attendance */}
      <div className="shell span-4">
        <div className="card">
          <div className="stat-label">Davomat</div>
          <div className="stat-value">{attendanceRate}%</div>
          <div className="progress-row" style={{ marginTop: 8 }}>
            <ProgressBar value={attendanceRate} variant={attendanceRate >= 80 ? 'ok' : attendanceRate >= 60 ? 'warn' : 'bad'} showPct={false} />
          </div>
        </div>
      </div>

      {/* Chart — per-subject lines */}
      <div className="shell span-12">
        <div className="card">
          <div className="card-title">
            <h2>Ball dinamikasi</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(SUBJECTS).map(([sid, s]) => (
                <SubjectChip key={sid} subject={sid} />
              ))}
            </div>
          </div>
          <div style={{ height: 280 }}>
            {chartData.length === 0 ? (
              <EmptyState
                art={IntegralGlyph}
                title="Hali test natijalari yo'q"
                hint="Birinchi test natijalari shu yerda ko'rinadi."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 4" stroke="rgba(20, 23, 28, 0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} stroke="var(--ink-faint)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} stroke="var(--ink-faint)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 14,
                      fontSize: 12,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      boxShadow: 'var(--shadow-soft)',
                    }}
                    formatter={(v, name) => [`${v}%`, SUBJECTS[name]?.label || name]}
                  />
                  <Legend
                    formatter={(value) => SUBJECTS[value]?.label || value}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 6 }}
                  />
                  <Line type="monotone" dataKey="fizika"     stroke="var(--fizika)" strokeWidth={2.4} dot={{ r: 3.5, fill: 'var(--fizika)' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="matematika" stroke="var(--matem)"  strokeWidth={2.4} dot={{ r: 3.5, fill: 'var(--matem)' }}  activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Per-subject topic bars */}
      <div className="shell span-12">
        <div className="card">
          <div className="card-title">
            <h2>Mavzular bo&lsquo;yicha natija</h2>
            <span className="meta">barcha testlar bo&lsquo;yicha</span>
          </div>
          {Object.entries(SUBJECTS).map(([sid, s]) => {
            const topics = state.topics.filter((t) => findSubjectForTopic(state, t) === sid);
            return (
              <div key={sid} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <SubjectChip subject={sid} />
                  <span className="muted" style={{ fontSize: 12 }}>{topics.length} ta mavzu</span>
                </div>
                {topics.map((topic) => {
                  const st = topicStats[topic];
                  const totalAttempts = st.total * studentResults.length;
                  const pct = totalAttempts === 0 ? 0 : Math.round((st.correct / totalAttempts) * 100);
                  const variant = pct >= 70 ? 'ok' : pct >= 40 ? 'warn' : 'bad';
                  return (
                    <div className="topic-row" key={topic}>
                      <div className="topic-name">{topic}</div>
                      <ProgressBar value={pct} variant={variant} showPct={false} />
                      <div className="topic-pct">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wrong answers — grouped by subject */}
      <div className="shell span-12">
        <div className="card">
          <div className="card-title">
            <h2>Noto&lsquo;g&lsquo;ri javoblar</h2>
            <span className="meta">so&lsquo;nggi test</span>
          </div>
          {wrongAnswers.length === 0 ? (
            <div className="success-banner" style={{ marginBottom: 0 }}>
              So&lsquo;nggi testda barcha javoblar to&lsquo;g&lsquo;ri.
            </div>
          ) : (
            <div>
              {Object.entries(SUBJECTS).map(([sid, s]) => {
                const items = wrongAnswers.filter((w) => w.question.subject === sid);
                if (items.length === 0) return null;
                return (
                  <div key={sid} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <SubjectChip subject={sid} />
                      <span className="muted" style={{ fontSize: 12 }}>{items.length} ta xato</span>
                    </div>
                    {items.map(({ question, studentAnswer }) => (
                      <div className="test-q" key={question.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{question.topic}</span>
                        </div>
                        <h4>{question.text}</h4>
                        <div className="test-option wrong" style={{ marginTop: 8 }}>
                          <span className="opt-letter">✗</span>
                          <span>Sizning javobingiz: {question.options[studentAnswer]}</span>
                        </div>
                        <div className="test-option correct">
                          <span className="opt-letter">✓</span>
                          <span>To&lsquo;g&lsquo;ri javob: {question.options[question.answer]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment */}
      {payment && (
        <div className="shell span-12">
          <div className="card">
            <div className="card-title">
              <h2>To&lsquo;lov ma&apos;lumotlari</h2>
              <Pill kind={payment.status}>{payment.status === 'paid' ? "To'langan" : payment.status === 'due_soon' ? 'Yaqin orada' : "Muddati o'tgan"}</Pill>
            </div>
            <div className="kv-list">
              <span className="k">Oylik summa</span>
              <span className="v">{formatMoney(payment.monthlyFee)}</span>
              <span className="k">So&lsquo;nggi to&lsquo;lov</span>
              <span className="v">{formatDate(payment.lastPaid)}</span>
              <span className="k">Keyingi to&lsquo;lov</span>
              <span className="v">{formatDate(payment.nextDue)} ({daysUntil(payment.nextDue)} kun)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Find which subject a topic belongs to by walking the question bank.
function findSubjectForTopic(state, topic) {
  const q = state.questions.find((x) => x.topic === topic);
  return q ? q.subject : 'fizika';
}
