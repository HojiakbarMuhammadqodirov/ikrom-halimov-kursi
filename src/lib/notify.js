// Frontend side of the parent notifications. Every call is fire-and-forget:
// the app is a localStorage demo and the backend is optional, so a missing or
// broken /api must never block a student from finishing a test or a teacher
// from saving attendance. Failures resolve to a reason string instead.
//
// Most endpoints now require the teacher session below. The one exception is
// notifyTestResult, which fires from the student's browser — see api/notify.js
// for why that one cannot be authenticated and what bounds the damage.

const SESSION_KEY = 'ikrom-kursi-tg-session';

/* ---------------- teacher session ---------------- */

// The token is opaque and self-expiring; the server re-checks its signature on
// every request, so nothing here is trusted for anything but "should I still
// show the password form".
export function getTeacherSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.token || !s?.expiresAt || new Date(s.expiresAt) <= new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearTeacherSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* private mode */ }
}

export async function teacherLogin(password) {
  const r = await post('/api/teacher-session', { password });
  if (r.ok && r.token) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token: r.token, expiresAt: r.expiresAt }));
    } catch { /* private mode: the session just won't survive a reload */ }
  }
  return r;
}

/* ---------------- transport ---------------- */

function authHeaders() {
  const s = getTeacherSession();
  return s ? { 'X-Teacher-Session': s.token } : {};
}

// A 401 means the session expired or the password was rotated in Vercel. Drop
// it so the caller falls back to the password form instead of retrying forever.
function handleAuth(res, data) {
  if (res.status === 401) {
    clearTeacherSession();
    return { ok: false, reason: 'auth_required', ...data };
  }
  return { ok: res.ok, ...data };
}

async function post(path, body, { auth = false } = {}) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
      body: JSON.stringify(body),
    });
    // Running `npm run dev` (plain Vite) has no /api, so the SPA rewrite hands
    // back index.html with a 200. Guard on the content type, not just res.ok.
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) return { ok: false, reason: 'no_backend' };
    return handleAuth(res, await res.json());
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

async function get(path) {
  try {
    const res = await fetch(path, { headers: authHeaders() });
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) return { ok: false, reason: 'no_backend' };
    return handleAuth(res, await res.json());
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

/* ---------------- teacher-only calls ---------------- */

export const requestLinkUrl = (studentId) => post('/api/link-token', { studentId }, { auth: true });

export const unlinkStudent = (studentId) => post('/api/unlink', { studentId }, { auth: true });

export const fetchAllLinks = () => get('/api/link-status');

export const fetchLinkStatus = (studentId) =>
  get(`/api/link-status?studentId=${encodeURIComponent(studentId)}`);

/* ---------------- notifications ---------------- */

// kind: 'test_result' | 'attendance' | 'payment'. The server builds the text —
// only these numbers travel.
function notifyParent(student, kind, payload, auth) {
  if (!student) return Promise.resolve({ ok: false, reason: 'no_student' });
  return post('/api/notify', {
    studentId: student.id,
    studentName: student.fullName,
    kind,
    payload,
  }, { auth });
}

// No auth: fires from the student's browser on submit.
export const notifyTestResult = (student, test, result) =>
  notifyParent(student, 'test_result', {
    testTitle: test?.title,
    subject: test?.subject,
    score: result?.score,
    correct: result?.correctCount,
    total: result?.total,
  }, false);

export const notifyAttendance = (student, record) =>
  notifyParent(student, 'attendance', {
    date: record?.date,
    status: record?.status,
    lateMinutes: record?.lateMinutes,
  }, true);

export const notifyPayment = (student, payment, daysLeft) =>
  notifyParent(student, 'payment', {
    amount: payment?.monthlyFee,
    dueDate: payment?.nextDue,
    daysLeft,
  }, true);
