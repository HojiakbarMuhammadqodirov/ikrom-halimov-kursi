// Frontend side of the parent notifications. Every call is fire-and-forget:
// the app is a localStorage demo and the backend is optional, so a missing or
// broken /api must never block a student from finishing a test or a teacher
// from saving attendance. Failures resolve to a reason string instead.

async function post(path, body) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // Running `npm run dev` (plain Vite) has no /api, so the SPA rewrite hands
    // back index.html with a 200. Guard on the content type, not just res.ok.
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) return { ok: false, reason: 'no_backend' };
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

export async function requestLinkUrl(studentId) {
  return post('/api/link-token', { studentId });
}

export async function fetchLinkStatus(studentId) {
  try {
    const res = await fetch(`/api/link-status?studentId=${encodeURIComponent(studentId)}`);
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) return { ok: false, reason: 'no_backend' };
    return { ok: res.ok, ...(await res.json()) };
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

// kind: 'test_result' | 'attendance' | 'payment'. The server builds the text —
// only these numbers travel.
export function notifyParent(student, kind, payload) {
  if (!student) return Promise.resolve({ ok: false, reason: 'no_student' });
  return post('/api/notify', {
    studentId: student.id,
    studentName: student.fullName,
    kind,
    payload,
  });
}

export const notifyTestResult = (student, test, result) =>
  notifyParent(student, 'test_result', {
    testTitle: test?.title,
    subject: test?.subject,
    score: result?.score,
    correct: result?.correctCount,
    total: result?.total,
  });

export const notifyAttendance = (student, record) =>
  notifyParent(student, 'attendance', {
    date: record?.date,
    status: record?.status,
    lateMinutes: record?.lateMinutes,
  });

export const notifyPayment = (student, payment, daysLeft) =>
  notifyParent(student, 'payment', {
    amount: payment?.monthlyFee,
    dueDate: payment?.nextDue,
    daysLeft,
  });
