import { removeLinkByStudent } from './_lib/db.js';
import { requireTeacher } from './_lib/session.js';

// Teacher removes a parent link — the fix for a link that reached the wrong
// person, and the only way back if a student loses the parent's phone.
//
// The parent is not told. They can unsubscribe themselves with /stop; this is
// the same outcome reached from the other end, and a "you were disconnected"
// message to someone who may already be the wrong recipient helps nobody.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!requireTeacher(req, res)) return;

  const studentId = String(req.body?.studentId || '').trim();
  if (!studentId || studentId.length > 40) return res.status(400).json({ error: 'bad_student_id' });

  try {
    await removeLinkByStudent(studentId);
    return res.status(200).json({ removed: true });
  } catch (err) {
    console.error('unlink error', err);
    return res.status(500).json({ error: 'server_error', stage: err.stage || 'unknown' });
  }
}
