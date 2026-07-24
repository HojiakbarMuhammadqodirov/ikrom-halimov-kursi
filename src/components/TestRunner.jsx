import React, { useMemo, useState } from 'react';
import { Section, SubjectChip, Pill, EmptyState } from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import { Blackboard, IntegralGlyph } from './SubjectArt.jsx';

export default function TestRunner({ state, setState, test, student, onDone }) {
  const questions = useMemo(
    () => test.questionIds.map((id) => state.questions.find((q) => q.id === id)).filter(Boolean),
    [test, state.questions]
  );

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  function pick(qid, optIdx) {
    if (finished) return;
    setAnswers((a) => ({ ...a, [qid]: optIdx }));
  }

  function submit() {
    const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);
    const wrongQuestionIds = questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.id);

    const result = {
      id: 'r-' + student.id + '-' + Date.now(),
      studentId: student.id,
      testId: test.id,
      subject: test.subject,
      date: new Date().toISOString(),
      score,
      correctCount,
      total,
      answers,
      wrongQuestionIds,
    };

    setState((s) => ({ ...s, testResults: [...s.testResults, result] }));
    setFinished(true);
  }

  if (questions.length === 0) {
    return (
      <Section title="Test bo'sh">
        <EmptyState
          art={IntegralGlyph}
          title="Bu testda savollar yo'q"
          hint="Administrator bilan bog'laning."
        />
      </Section>
    );
  }

  if (finished) {
    const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const topicBreakdown = {};
    state.topics.forEach((t) => { topicBreakdown[t] = { subject: findSubjectForTopic(state, t), correct: 0, total: 0 }; });
    questions.forEach((q) => {
      topicBreakdown[q.topic].total += 1;
      if (answers[q.id] === q.answer) topicBreakdown[q.topic].correct += 1;
    });
    const scoreColor = score >= 70 ? 'var(--ok)' : score >= 50 ? 'var(--warn)' : 'var(--bad)';

    return (
      <div className="stack-lg">
        <div className="shell">
          <div className="card">
            <div className="card-title">
              <h2>Test yakunlandi</h2>
              <SubjectChip subject={test.subject} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap' }}>
              <div style={{
                fontFamily: 'Fraunces, serif', fontSize: 'clamp(56px, 8vw, 96px)',
                lineHeight: 1, letterSpacing: '-0.04em', fontVariationSettings: '"opsz" 144',
                color: scoreColor,
              }}>{score}%</div>
              <div>
                <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>To&lsquo;g&lsquo;ri javoblar</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, letterSpacing: '-0.02em' }}>
                  {correctCount} <span style={{ color: 'var(--ink-faint)' }}>/ {questions.length}</span>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 13, maxWidth: '24ch', lineHeight: 1.5 }}>
                {score >= 70 ? 'Ajoyib natija, kurs darajasida.' : score >= 50 ? 'Yaxshi, lekin kamchiliklar bor.' : 'Mavzularni qayta ko&lsquo;rib chiqing.'}
              </div>
            </div>
          </div>
        </div>

        <Section title="Mavzular bo&lsquo;yicha natija">
          {state.topics.map((t) => {
            const s = topicBreakdown[t];
            if (s.total === 0) return null;
            const pct = Math.round((s.correct / s.total) * 100);
            const variant = pct >= 70 ? 'ok' : pct >= 40 ? 'warn' : 'bad';
            return (
              <div className="topic-row" key={t}>
                <div className="topic-name">{t}</div>
                <div className="progress-row">
                  <div className="progress-bar">
                    <div className="progress-fill" data-variant={variant} style={{ width: pct + '%' }} />
                  </div>
                </div>
                <div className="topic-pct">{s.correct}/{s.total}</div>
              </div>
            );
          })}
        </Section>

        <Section title="Javoblar">
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            return (
              <div className="test-q" key={q.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{i + 1}-savol · {q.topic}</span>
                </div>
                <h4>{q.text}</h4>
                {q.options.map((opt, idx) => {
                  const cls = idx === q.answer ? 'correct'
                    : idx === userAns && idx !== q.answer ? 'wrong' : '';
                  const mark = idx === q.answer ? '✓' : (idx === userAns ? '✗' : '○');
                  return (
                    <div key={idx} className={`test-option ${cls}`}>
                      <span className="opt-letter">{mark}</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg" onClick={onDone}>
            Yakunlash
            <span className="arrow-orb" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  const picked = answers[q.id];
  const progress = ((step + 1) / questions.length) * 100;
  const allAnswered = questions.every((qq) => answers[qq.id] !== undefined);

  return (
    <div className="stack-lg">
      {/* Subject strip header */}
      <div className="subject-strip">
        <div className="left">
          <SubjectChip subject={test.subject} />
          <span>{q.topic}</span>
        </div>
        <div className="glyph-deco"><Blackboard size={64} accent={SUBJECTS[test.subject]?.accent} /></div>
      </div>

      {/* Progress */}
      <div>
        <div className="test-progress">
          <div className="test-progress-fill" style={{ width: progress + '%' }} />
        </div>
        <div className="row-flex" style={{ marginTop: 10, fontSize: 12 }}>
          <span className="muted" style={{ letterSpacing: '0.04em' }}>Savol {step + 1} / {questions.length}</span>
          <span className="muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question card */}
      <div className="shell">
        <div className="card">
          <div className="card-title">
            <h2 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>{q.text}</h2>
            <span className="meta">{q.topic}</span>
          </div>
          {q.options.map((opt, idx) => (
            <div
              key={idx}
              className={`test-option ${picked === idx ? 'selected' : ''}`}
              onClick={() => pick(q.id, idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(q.id, idx); } }}
            >
              <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="row-flex">
        <button className="btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← Oldingi</button>
        {step < questions.length - 1 ? (
          <button className="btn btn-primary" disabled={picked === undefined} onClick={() => setStep((s) => s + 1)}>
            Keyingi
            <span className="arrow-orb" aria-hidden="true">→</span>
          </button>
        ) : (
          <button className="btn btn-primary" disabled={!allAnswered} onClick={submit}>
            Yakunlash
            <span className="arrow-orb" aria-hidden="true">✓</span>
          </button>
        )}
      </div>

      {!allAnswered && step === questions.length - 1 && (
        <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Barcha savollarga javob bering.</div>
      )}
    </div>
  );
}

function findSubjectForTopic(state, topic) {
  const q = state.questions.find((x) => x.topic === topic);
  return q ? q.subject : 'fizika';
}
