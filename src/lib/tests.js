// Test availability + grading helpers. Shared by TeacherPanel, StudentPanel and
// TestRunner so open/closed logic and scoring stay consistent everywhere.

export const CADENCES = [
  { id: 'daily', label: 'Kunlik' },
  { id: 'weekly', label: 'Haftalik' },
  { id: 'monthly', label: 'Oylik' },
];

export const QUESTION_TYPES = [
  { id: 'single', label: '4 ta variant' },
  { id: 'truefalse', label: "To'g'ri / Noto'g'ri" },
  { id: 'multi', label: 'Ko\'p tanlovli' },
];

export function cadenceLabel(id) {
  return (CADENCES.find((c) => c.id === id) || {}).label || '—';
}

export function questionType(q) {
  return (q && q.type) || 'single';
}

// Is the test currently visible/takeable by students?
export function isTestOpen(test) {
  if (!test) return false;
  if (test.manualOpen === true) return true;   // teacher opened it early
  if (test.manualOpen === false) return false;  // teacher force-closed it
  const mode = test.availability || 'immediate';
  if (mode === 'immediate') return true;
  if (mode === 'closed') return false;
  if (mode === 'scheduled') {
    if (!test.openAt) return false;
    return new Date(test.openAt).getTime() <= Date.now();
  }
  return true;
}

// A short status descriptor for badges: { key, label, tone }.
export function testStatus(test) {
  if (isTestOpen(test)) {
    return { key: 'open', label: 'Ochiq', tone: 'ok' };
  }
  const mode = test.availability || 'immediate';
  if (mode === 'scheduled' && test.openAt && test.manualOpen !== false) {
    return { key: 'scheduled', label: 'Rejalashtirilgan', tone: 'warn' };
  }
  return { key: 'closed', label: 'Yopiq', tone: 'bad' };
}

// Has the student provided any answer for this question?
export function isAnswered(q, ans) {
  if (questionType(q) === 'multi') return Array.isArray(ans) && ans.length > 0;
  return ans !== undefined && ans !== null;
}

// Grade a single question against the student's answer.
export function gradeQuestion(q, ans) {
  if (questionType(q) === 'multi') {
    const correct = [...(q.answers || [])].sort((a, b) => a - b);
    const given = Array.isArray(ans) ? [...ans].sort((a, b) => a - b) : [];
    return correct.length > 0 && correct.length === given.length && correct.every((v, i) => v === given[i]);
  }
  return ans === q.answer;
}

// Score a whole set of questions. Returns { correctCount, total, score, wrongQuestionIds }.
export function scoreTest(questions, answers) {
  const total = questions.length;
  let correctCount = 0;
  const wrongQuestionIds = [];
  questions.forEach((q) => {
    if (gradeQuestion(q, answers[q.id])) correctCount += 1;
    else wrongQuestionIds.push(q.id);
  });
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return { correctCount, total, score, wrongQuestionIds };
}

// Human-readable rendering of a student's answer for review screens.
export function formatAnswer(q, ans) {
  if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0)) return '—';
  if (questionType(q) === 'multi') {
    return [...ans].sort((a, b) => a - b).map((i) => q.options[i]).filter(Boolean).join(', ');
  }
  return q.options[ans];
}

// The set of correct option indices for any question type.
export function correctIndices(q) {
  if (questionType(q) === 'multi') return q.answers || [];
  return q.answer === undefined || q.answer === null ? [] : [q.answer];
}
