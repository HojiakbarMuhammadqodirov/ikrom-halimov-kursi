import { createLinkToken } from './_lib/token.js';

// Mints the one-time deep link the student hands to their parent. Nothing is
// stored — the token carries the student id and its own 24h expiry, signed.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

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
