import { getLink, consumeQuota } from './_lib/db.js';
import { sendMessage } from './_lib/telegram.js';
import { buildMessage } from './_lib/messages.js';

const KINDS = new Set(['test_result', 'attendance', 'payment']);

// Sends one templated message to a student's linked parent.
//
// KNOWN LIMITATION: this endpoint is called from the browser and there is no
// server-side session to authenticate it, because the roster and results live
// in localStorage. Anyone who reads the frontend source can call it. Two things
// keep the damage bounded: the message text is built server-side from fixed
// templates (see _lib/messages.js), and every student has a daily send cap.
// Closing the hole properly means moving results server-side — stage 3.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { studentId, studentName, kind, payload } = req.body || {};
  if (!studentId || !KINDS.has(kind)) return res.status(400).json({ error: 'bad_request' });

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
