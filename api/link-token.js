import { createLinkToken } from './_lib/token.js';
import { requireTeacher } from './_lib/session.js';

// Mints the deep link the teacher hands to a parent. Nothing is stored — the
// token carries the student id and its own 24h expiry, signed.
//
// TEACHER-ONLY. This used to be open, which meant anyone who could reach the
// site could mint a link for any student id, press Start themselves and start
// receiving that child's results — student ids are seeded as s-1, s-2, s-3, so
// guessing them was not even work. There is no way to verify a *student* here
// (their browser holds nothing an attacker cannot read out of the bundle), so
// the mint moved behind the one credential that is genuinely server-side.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!requireTeacher(req, res)) return;

  const studentId = String(req.body?.studentId || '').trim();
  if (!studentId || studentId.length > 40) {
    return res.status(400).json({ error: 'bad_student_id' });
  }

  const username = process.env.TELEGRAM_BOT_USERNAME || process.env.VITE_TELEGRAM_BOT_USERNAME;
  if (!username) return res.status(500).json({ error: 'bot_username_not_set' });

  try {
    const token = createLinkToken(studentId);
    return res.status(200).json({
      token,
      url: `https://t.me/${username}?start=${token}`,
      expiresInHours: 24,
    });
  } catch (err) {
    console.error('link-token error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
