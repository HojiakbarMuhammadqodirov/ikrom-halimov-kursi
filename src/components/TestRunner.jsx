import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Section, SubjectChip, Pill, EmptyState } from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import { IntegralGlyph } from './SubjectArt.jsx';

const TEST_MINUTES = 20;

function fmtClock(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TestRunner({ state, setState, test, student, onDone }) {
  const questions = useMemo(
    () => test.questionIds.map((id) => state.questions.find((q) => q.id === id)).filter(Boolean),
    [test, state.questions]
  );

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('quiz'); // 'quiz' | 'review' | 'done'
  const [timeLeft, setTimeLeft] = useState(TEST_MINUTES * 60);
  const submittedRef = useRef(false);

  // Countdown — ticks only while taking the test.
  useEffect(() => {
    if (phase === 'done') return undefined;
    const id = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-submit when time runs out.
  useEffect(() => {
    if (timeLeft === 0 && phase !== 'done') submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function pick(qid, optIdx) {
    if (phase === 'done') return;
    setAnswers((a) => ({ ...a, [qid]: optIdx }));
  }

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
    const total = questions.length;
    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
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
    setPhase('done');
  }

  if (questions.length === 0) {
    return (
      <Section title="Test bo'sh">
        <EmptyState art={IntegralGlyph} title="Bu testda savollar yo'q" hint="Administrator bilan bog'laning." />
      </Section>
    );
  }

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

  /* ---------------- RESULTS ---------------- */
  if (phase === 'done') {
    const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const topicBreakdown = {};
    state.topics.forEach((t) => { topicBreakdown[t] = { correct: 0, total: 0 }; });
    questions.forEach((q) => {
      if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
      topicBreakdown[q.topic].total += 1;
      if (answers[q.id] === q.answer) topicBreakdown[q.topic].correct += 1;
    });
    const scoreColor = score >= 70 ? 'var(--ok)' : score >= 50 ? 'var(--warn)' : 'var(--bad)';

    return (
      <div className="stack-lg">
        <div className="card">
          <div className="card-title">
            <h2>Test yakunlandi</h2>
            <SubjectChip subject={test.subject} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap' }}>
            <div className="big-score" style={{ color: scoreColor }}>{score}%</div>
            <div>
              <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>To&lsquo;g&lsquo;ri javoblar</div>
              <div className="num-display" style={{ fontSize: 26 }}>
                {correctCount} <span style={{ color: 'var(--ink-faint)' }}>/ {questions.length}</span>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 13, maxWidth: '26ch', lineHeight: 1.5 }}>
              {score >= 70 ? 'Ajoyib natija — kurs darajasida.' : score >= 50 ? 'Yaxshi, lekin kamchiliklar bor.' : 'Mavzularni qayta ko‘rib chiqing.'}
            </div>
          </div>
        </div>

        <Section title="Mavzular bo&lsquo;yicha natija">
          {state.topics.map((t) => {
            const s = topicBreakdown[t];
            if (!s || s.total === 0) return null;
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

        <Section title="Javoblar tahlili">
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            return (
              <div className="test-q" key={q.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="tiny" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{i + 1}-savol · {q.topic}</span>
                  {userAns === q.answer
                    ? <Pill kind="up">To&lsquo;g&lsquo;ri</Pill>
                    : <Pill kind="down">{userAns === undefined ? 'Javob berilmagan' : 'Xato'}</Pill>}
                </div>
                <h4>{q.text}</h4>
                {q.options.map((opt, idx) => {
                  const cls = idx === q.answer ? 'correct' : idx === userAns && idx !== q.answer ? 'wrong' : '';
                  const mark = idx === q.answer ? '✓' : idx === userAns ? '✗' : String.fromCharCode(65 + idx);
                  return (
                    <div key={idx} className={`test-option ${cls}`} style={{ cursor: 'default' }}>
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
            <span className="arrow-orb" aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- REVIEW BEFORE SUBMIT ---------------- */
  if (phase === 'review') {
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    return (
      <div className="stack-lg">
        <div className="test-topbar">
          <SubjectChip subject={test.subject} />
          <div className={`test-timer ${timeLeft <= 120 ? 'low' : ''}`}>
            <span className="dot" aria-hidden="true" />
            {fmtClock(timeLeft)}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <h2>Yuborishdan oldin tekshiring</h2>
            <span className="meta">{answeredCount}/{questions.length} javob berildi</span>
          </div>
          {unanswered.length > 0 ? (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {unanswered.length} ta savol javobsiz qoldi. Yuborsangiz ular xato deb hisoblanadi.
            </div>
          ) : (
            <div className="success-banner" style={{ marginBottom: 16 }}>
              Barcha savollarga javob berdingiz.
            </div>
          )}
          <div className="qnav">
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={`qnav-dot ${answers[q.id] !== undefined ? 'answered' : ''}`}
                onClick={() => { setStep(i); setPhase('quiz'); }}
                title={`${i + 1}-savol`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="row-flex">
          <button className="btn" onClick={() => setPhase('quiz')}>&larr; Savollarga qaytish</button>
          <button className="btn btn-primary" onClick={submit}>
            Testni yuborish
            <span className="arrow-orb" aria-hidden="true">&#10003;</span>
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- QUIZ ---------------- */
  const q = questions[step];
  const picked = answers[q.id];
  const progress = ((step + 1) / questions.length) * 100;
  const isLast = step === questions.length - 1;

  return (
    <div className="stack-lg">
      <div className="test-topbar">
        <div className="subject-strip" style={{ margin: 0, flex: 1, minWidth: 0 }}>
          <div className="left">
            <SubjectChip subject={test.subject} />
            <span>{q.topic}</span>
          </div>
        </div>
        <div className={`test-timer ${timeLeft <= 120 ? 'low' : ''}`} aria-label="Qolgan vaqt">
          <span className="dot" aria-hidden="true" />
          {fmtClock(timeLeft)}
        </div>
      </div>

      <div>
        <div className="test-progress">
          <div className="test-progress-fill" style={{ width: progress + '%' }} />
        </div>
        <div className="row-flex" style={{ marginTop: 10 }}>
          <span className="tiny">Savol {step + 1} / {questions.length}</span>
          <span className="tiny mono">{answeredCount} javob berildi</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h2 style={{ fontSize: 22 }}>{q.text}</h2>
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

      <div className="qnav">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            className={`qnav-dot ${answers[qq.id] !== undefined ? 'answered' : ''} ${i === step ? 'current' : ''}`}
            onClick={() => setStep(i)}
            title={`${i + 1}-savol`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="row-flex">
        <button className="btn" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>&larr; Oldingi</button>
        {isLast ? (
          <button className="btn btn-primary" onClick={() => setPhase('review')}>
            Tekshirish
            <span className="arrow-orb" aria-hidden="true">&rarr;</span>
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            Keyingi
            <span className="arrow-orb" aria-hidden="true">&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
}
