import { getLink } from './_lib/db.js';

// The page polls this after showing the deep link, so it can flip to
// "ulandi ✅" as soon as the parent presses Start.
//
// Returns a boolean and the parent's Telegram display name only — never the
// chat_id. The browser has no use for it and it is the one value that would
// let a leaked frontend message a parent directly.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const studentId = String(req.query?.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'bad_student_id' });

  try {
    const link = await getLink(studentId);
    return res.status(200).json({
      linked: Boolean(link),
      parentName: link?.parent_name || null,
      linkedAt: link?.linked_at || null,
    });
  } catch (err) {
    console.error('link-status error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
