import React, { useState } from 'react';
import { Section, SubjectChip, Pill, Select } from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import { CADENCES, QUESTION_TYPES, questionType } from '../lib/tests.js';

const EMPTY_PARAMS = {
  title: '',
  subject: 'fizika',
  code: '',
  questionCount: 10,
  cadence: 'weekly',
  availability: 'immediate',
  openAt: '',
};

// Local datetime-local value -> ISO string.
function toISO(local) {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d) ? null : d.toISOString();
}

export default function TestBuilder({ state, setState, user, onDone }) {
  const [phase, setPhase] = useState('params'); // 'params' | 'questions'
  const [params, setParams] = useState(EMPTY_PARAMS);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // null = adding new
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) { setParams((p) => ({ ...p, [key]: value })); }

  function submitParams(e) {
    e.preventDefault();
    setError('');
    const code = params.code.trim();
    if (!params.title.trim()) return setError('Test nomini kiriting.');
    if (!code) return setError('Test unique raqamini kiriting.');
    if ((state.tests || []).some((t) => (t.code || '').toLowerCase() === code.toLowerCase()))
      return setError('Bu unique raqam allaqachon band. Boshqasini tanlang.');
    if (!Number(params.questionCount) || Number(params.questionCount) < 1)
      return setError("Savollar sonini to'g'ri kiriting.");
    if (params.availability === 'scheduled' && !toISO(params.openAt))
      return setError('Ochilish vaqtini tanlang.');
    setPhase('questions');
  }

  function saveQuestion(draft, position) {
    setQuestions((prev) => {
      const next = prev.slice();
      if (editingIndex !== null) next.splice(editingIndex, 1);
      const pos = Math.max(0, Math.min(next.length, position - 1));
      next.splice(pos, 0, draft);
      return next;
    });
    setShowForm(false);
    setEditingIndex(null);
  }

  function removeQuestion(i) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function saveTest() {
    setError('');
    if (questions.length === 0) return setError('Kamida bitta savol qo\'shing.');
    const testId = 't-' + Date.now();
    const built = questions.map((q, i) => ({
      id: `${testId}-q-${i + 1}`,
      testId,
      subject: params.subject,
      topic: params.title.trim(),
      type: q.type,
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()),
      answer: q.type === 'multi' ? undefined : q.answer,
      answers: q.type === 'multi' ? q.answers.slice().sort((a, b) => a - b) : undefined,
      order: i + 1,
    }));
    const test = {
      id: testId,
      code: params.code.trim(),
      title: params.title.trim(),
      subject: params.subject,
      cadence: params.cadence,
      questionCount: Number(params.questionCount),
      description: `${built.length} ta savol · ${SUBJECTS[params.subject]?.label}`,
      availability: params.availability,
      openAt: params.availability === 'scheduled' ? toISO(params.openAt) : null,
      manualOpen: null,
      createdBy: user?.id || null,
      createdAt: new Date().toISOString(),
      questionIds: built.map((q) => q.id),
    };
    setState((s) => ({ ...s, tests: [...s.tests, test], questions: [...s.questions, ...built] }));
    onDone();
  }

  /* ---------------- PARAMS ---------------- */
  if (phase === 'params') {
    return (
      <Section title="Test parametrlari">
        <form onSubmit={submitParams}>
          {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-grid">
            <div className="field">
              <div className="field-inner">
                <label>Test nomi</label>
                <input value={params.title} onChange={(e) => set('title', e.target.value)} placeholder="Masalan: Mexanika nazorat ishi" autoFocus />
              </div>
            </div>
            <div className="field">
              <div className="field-inner">
                <label>Fan</label>
                <Select
                  ariaLabel="Fan"
                  value={params.subject}
                  onChange={(v) => set('subject', v)}
                  options={Object.entries(SUBJECTS).map(([sid, s]) => ({ value: sid, label: s.label }))}
                />
              </div>
            </div>
            <div className="field">
              <div className="field-inner">
                <label>Unique raqam (kod)</label>
                <input value={params.code} onChange={(e) => set('code', e.target.value)} placeholder="Masalan: F-014" />
              </div>
            </div>
            <div className="field">
              <div className="field-inner">
                <label>Savollar soni</label>
                <input type="number" min="1" max="100" value={params.questionCount} onChange={(e) => set('questionCount', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <div className="field-inner">
                <label>Test turi</label>
                <Select
                  ariaLabel="Test turi"
                  value={params.cadence}
                  onChange={(v) => set('cadence', v)}
                  options={CADENCES.map((c) => ({ value: c.id, label: c.label }))}
                />
              </div>
            </div>
          </div>

          <div className="builder-block">
            <div className="stat-label" style={{ marginBottom: 10 }}>Ochilish vaqti</div>
            <div className="avail-options">
              <label className={`avail-opt ${params.availability === 'immediate' ? 'active' : ''}`}>
                <input type="radio" name="avail" checked={params.availability === 'immediate'} onChange={() => set('availability', 'immediate')} />
                <div>
                  <div className="avail-title">Hammaga darhol ochiq</div>
                  <div className="avail-desc">Saqlangan zahoti barcha o'quvchilarda paydo bo'ladi.</div>
                </div>
              </label>
              <label className={`avail-opt ${params.availability === 'scheduled' ? 'active' : ''}`}>
                <input type="radio" name="avail" checked={params.availability === 'scheduled'} onChange={() => set('availability', 'scheduled')} />
                <div>
                  <div className="avail-title">Belgilangan vaqtda ochilsin</div>
                  <div className="avail-desc">Tanlangan sana va vaqtda avtomatik ochiladi. Undan oldin ham qo'lda ochishingiz mumkin.</div>
                </div>
              </label>
              <label className={`avail-opt ${params.availability === 'closed' ? 'active' : ''}`}>
                <input type="radio" name="avail" checked={params.availability === 'closed'} onChange={() => set('availability', 'closed')} />
                <div>
                  <div className="avail-title">Yopiq turadi (keyinroq ochaman)</div>
                  <div className="avail-desc">Hammaga yopiq. Testlar ro'yxatidan xohlagan vaqtingizda ochasiz.</div>
                </div>
              </label>
            </div>
            {params.availability === 'scheduled' && (
              <div className="field" style={{ maxWidth: 280, marginTop: 12 }}>
                <div className="field-inner">
                  <label>Ochilish sanasi va vaqti</label>
                  <input type="datetime-local" value={params.openAt} onChange={(e) => set('openAt', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="row-flex" style={{ marginTop: 22 }}>
            <button type="button" className="btn btn-ghost" onClick={onDone}>Bekor qilish</button>
            <button type="submit" className="btn btn-primary">
              Savollarga o'tish
              <span className="arrow-orb" aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </form>
      </Section>
    );
  }

  /* ---------------- QUESTIONS ---------------- */
  const target = Number(params.questionCount);
  return (
    <div className="stack-lg">
      <Section
        title={params.title}
        action={<span className="meta">{questions.length} / {target} savol</span>}
      >
        <div className="row-flex" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <SubjectChip subject={params.subject} />
            <Pill kind="accent">{params.code}</Pill>
            <span className="tiny">{CADENCES.find((c) => c.id === params.cadence)?.label}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('params')}>&larr; Parametrlar</button>
        </div>

        {questions.length === 0 ? (
          <div className="muted" style={{ padding: '8px 0 16px' }}>Hali savol qo'shilmagan. Quyidan birinchi savolni qo'shing.</div>
        ) : (
          <div className="qbuild-list">
            {questions.map((q, i) => (
              <div className="qbuild-item" key={i}>
                <div className="qbuild-num">{i + 1}</div>
                <div className="qbuild-body">
                  <div className="qbuild-text">{q.text}</div>
                  <div className="qbuild-meta">
                    <span className="tiny">{QUESTION_TYPES.find((t) => t.id === q.type)?.label}</span>
                    <span className="tiny">· {q.options.length} variant</span>
                    <span className="tiny">· {q.type === 'multi' ? `${q.answers.length} ta to'g'ri` : "1 ta to'g'ri"}</span>
                  </div>
                </div>
                <div className="td-actions">
                  <button className="btn btn-sm" onClick={() => { setEditingIndex(i); setShowForm(true); }}>Tahrirlash</button>
                  <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(i)}>O'chirish</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showForm && (
          <button className="btn" style={{ marginTop: 14 }} onClick={() => { setEditingIndex(null); setShowForm(true); }}>
            + Savol qo'shish
          </button>
        )}
      </Section>

      {showForm && (
        <QuestionForm
          key={editingIndex === null ? 'new' : `edit-${editingIndex}`}
          initial={editingIndex !== null ? questions[editingIndex] : null}
          defaultPosition={editingIndex !== null ? editingIndex + 1 : questions.length + 1}
          maxPosition={editingIndex !== null ? questions.length : questions.length + 1}
          onSave={saveQuestion}
          onCancel={() => { setShowForm(false); setEditingIndex(null); }}
        />
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="row-flex">
        <button className="btn btn-ghost" onClick={onDone}>Bekor qilish</button>
        <button className="btn btn-primary btn-lg" onClick={saveTest} disabled={questions.length === 0}>
          Testni saqlash
          <span className="arrow-orb" aria-hidden="true">&#10003;</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   QUESTION FORM — type-aware option editor
   ============================================================ */
function QuestionForm({ initial, defaultPosition, maxPosition, onSave, onCancel }) {
  const [position, setPosition] = useState(defaultPosition);
  const [type, setType] = useState(initial ? questionType(initial) : 'single');
  const [text, setText] = useState(initial ? initial.text : '');
  const [options, setOptions] = useState(() => {
    if (initial) return initial.options.slice();
    return ['', '', '', ''];
  });
  const [single, setSingle] = useState(initial && questionType(initial) !== 'multi' ? (initial.answer ?? 0) : 0);
  const [multi, setMulti] = useState(() => new Set(initial && questionType(initial) === 'multi' ? initial.answers : []));
  const [err, setErr] = useState('');

  function changeType(t) {
    setErr('');
    setType(t);
    if (t === 'truefalse') { setOptions(["To'g'ri", "Noto'g'ri"]); setSingle((s) => (s === 1 ? 1 : 0)); }
    else if (t === 'single') { setOptions((o) => { const n = o.slice(0, 4); while (n.length < 4) n.push(''); return n; }); }
    else if (t === 'multi') { setOptions((o) => { const n = o.filter((x, i) => !(o.length <= 2 && i >= o.length)); while (n.length < 4) n.push(''); return n.slice(0, 6); }); }
  }

  function setOption(i, val) { setOptions((o) => o.map((x, idx) => (idx === i ? val : x))); }
  function addOption() { setOptions((o) => (o.length >= 6 ? o : [...o, ''])); }
  function removeOption(i) {
    setOptions((o) => (o.length <= 2 ? o : o.filter((_, idx) => idx !== i)));
    setMulti((m) => { const n = new Set(); m.forEach((idx) => { if (idx < i) n.add(idx); else if (idx > i) n.add(idx - 1); }); return n; });
    setSingle((s) => (s > i ? s - 1 : s === i ? 0 : s));
  }
  function toggleMulti(i) { setMulti((m) => { const n = new Set(m); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  function save() {
    setErr('');
    if (!text.trim()) return setErr('Savol matnini kiriting.');
    const filled = options.map((o) => o.trim());
    if (type === 'truefalse') {
      return onSave({ type, text, options: ["To'g'ri", "Noto'g'ri"], answer: single, answers: [] }, Number(position));
    }
    if (type === 'single') {
      if (filled.some((o) => !o)) return setErr("Barcha 4 ta variantni to'ldiring.");
      return onSave({ type, text, options: filled, answer: single, answers: [] }, Number(position));
    }
    // multi
    const nonEmpty = filled.filter(Boolean);
    if (nonEmpty.length < 2) return setErr('Kamida 2 ta variant kiriting.');
    if ([...multi].some((i) => !filled[i])) return setErr("To'g'ri deb belgilangan variant bo'sh bo'lmasin.");
    if (multi.size < 1) return setErr("Kamida bitta to'g'ri javobni belgilang.");
    // compact options (drop empty) and remap correct indices
    const kept = [];
    const map = {};
    filled.forEach((o, i) => { if (o) { map[i] = kept.length; kept.push(o); } });
    const answers = [...multi].filter((i) => map[i] !== undefined).map((i) => map[i]);
    return onSave({ type, text, options: kept, answer: undefined, answers }, Number(position));
  }

  return (
    <Section title={initial ? 'Savolni tahrirlash' : 'Yangi savol'}>
      {err && <div className="error-banner" style={{ marginBottom: 14 }}>{err}</div>}

      <div className="form-grid">
        <div className="field" style={{ maxWidth: 160 }}>
          <div className="field-inner">
            <label>Savol raqami</label>
            <input type="number" min="1" max={maxPosition} value={position}
              onChange={(e) => setPosition(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <div className="field-inner">
            <label>Savol turi</label>
            <Select
              ariaLabel="Savol turi"
              value={type}
              onChange={(v) => changeType(v)}
              options={QUESTION_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            />
          </div>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <div className="field-inner">
          <label>Savol matni</label>
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Savolni yozing..." />
        </div>
      </div>

      <div className="stat-label" style={{ marginBottom: 10 }}>
        {type === 'multi' ? "Variantlar — to'g'rilarini belgilang" : "Variantlar — to'g'ri javobni belgilang"}
      </div>

      <div className="opt-editor">
        {options.map((opt, i) => (
          <div className="opt-edit-row" key={i}>
            {type === 'multi' ? (
              <input type="checkbox" className="opt-check" checked={multi.has(i)} onChange={() => toggleMulti(i)} aria-label="To'g'ri javob" />
            ) : (
              <input type="radio" className="opt-check" name="correct" checked={single === i} onChange={() => setSingle(i)} aria-label="To'g'ri javob" />
            )}
            <span className="opt-edit-letter">{String.fromCharCode(65 + i)}</span>
            {type === 'truefalse' ? (
              <span className="opt-edit-fixed">{opt}</span>
            ) : (
              <input className="input-inline" style={{ flex: 1 }} value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Variant ${String.fromCharCode(65 + i)}`} />
            )}
            {type === 'multi' && options.length > 2 && (
              <button className="btn btn-sm btn-ghost" onClick={() => removeOption(i)} aria-label="Variantni o'chirish">&times;</button>
            )}
          </div>
        ))}
      </div>

      {type === 'multi' && options.length < 6 && (
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={addOption}>+ Variant</button>
      )}

      <div className="row-flex" style={{ marginTop: 18 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Bekor qilish</button>
        <button className="btn btn-primary" onClick={save}>{initial ? 'Saqlash' : "Qo'shish"}</button>
      </div>
    </Section>
  );
}
