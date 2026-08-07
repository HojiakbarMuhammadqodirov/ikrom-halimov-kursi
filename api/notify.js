import { getLink, consumeQuota } from './_lib/db.js';
import { sendMessage } from './_lib/telegram.js';
import { buildMessage } from './_lib/messages.js';
import { requireTeacher } from './_lib/session.js';

const KINDS = new Set(['test_result', 'attendance', 'payment']);

// Attendance and payment messages are sent by the teacher pressing a button, so
// they can and do require the teacher session.
const TEACHER_KINDS = new Set(['attendance', 'payment']);

// Sends one templated message to a student's linked parent.
//
// KNOWN LIMITATION, deliberately accepted: 'test_result' stays unauthenticated.
// It fires automatically from the student's browser the moment a test is
// submitted, and that browser holds nothing an attacker could not read out of
// the bundle — so any credential put here would be a fake one. A forger can
// therefore send a plausible score for a student whose parent is linked. The
// damage is bounded: the text is built from fixed server-side templates (see
// _lib/messages.js), there is a daily cap per student, and a parent who gets an
// invented score will ask their child about it. What a forger cannot do is
// receive anything — linking is teacher-only (see link-token.js).
//
// Closing this last gap means moving results server-side — stage 3.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { studentId, studentName, kind, payload } = req.body || {};
  if (!studentId || !KINDS.has(kind)) return res.status(400).json({ error: 'bad_request' });
  if (TEACHER_KINDS.has(kind) && !requireTeacher(req, res)) return;

  try {
    const link = await getLink(String(studentId));
    // Not an error: most students simply have no parent linked yet, and the
    // caller should not treat that as a failure worth showing.
    if (!link) return res.status(200).json({ sent: false, reason: 'not_linked' });

    const text = buildMessage(kind, payload || {}, String(studentName || "O'quvchi").slice(0, 80));
    if (!text) return res.status(400).json({ error: 'bad_payload' });

    if (!(await consumeQuota(link))) {
      return res.status(429).json({ sent: false, reason: 'daily_limit' });
    }

    await sendMessage(link.chat_id, text);
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('notify error', err);
    return res.status(500).json({ sent: false, error: 'server_error' });
  }
}
