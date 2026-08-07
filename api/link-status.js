import { getLink, listLinks } from './_lib/db.js';
import { requireTeacher } from './_lib/session.js';

// Who is linked. Two modes, both teacher-only:
//   GET /api/link-status              → every link, for the Telegram page
//   GET /api/link-status?studentId=x  → one, polled while a parent is pressing
//                                       Start so the row can flip to "ulandi"
//
// TEACHER-ONLY. Open, this answered "is s-1's parent linked, and what is that
// parent called" to anybody who asked, for a guessable id. The chat_id is never
// in the response either way — see listLinks().
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  if (!requireTeacher(req, res)) return;

  const studentId = String(req.query?.studentId || '').trim();

  try {
    if (!studentId) {
      const rows = await listLinks();
      return res.status(200).json({
        links: rows.map((r) => ({
          studentId: r.student_id,
          parentName: r.parent_name || null,
          linkedAt: r.linked_at || null,
        })),
      });
    }

    const link = await getLink(studentId);
    return res.status(200).json({
      linked: Boolean(link),
      parentName: link?.parent_name || null,
      linkedAt: link?.linked_at || null,
    });
  } catch (err) {
    console.error('link-status error', err);
    // Setup diagnostics. Deliberately narrow: which env names are absent, the
    // upstream HTTP status and the PostgREST error code — never a key, a value
    // or a raw message. The schema is public in supabase/schema.sql anyway.
    return res.status(500).json({
      error: 'server_error',
      stage: err.stage || 'unknown',
      missing: err.missing,
      status: err.status,
      code: err.code,
    });
  }
}
