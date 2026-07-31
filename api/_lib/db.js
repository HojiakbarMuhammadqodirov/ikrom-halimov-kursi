// Thin wrapper over Supabase's PostgREST endpoint. Deliberately plain fetch
// rather than @supabase/supabase-js: the whole surface is three queries, and
// the project has no runtime dependencies worth adding one for.
//
// The service-role key bypasses RLS. It must only ever be read here, inside a
// serverless function — never imported into anything under src/.

const MAX_PER_DAY = 20;

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  return { url: url.replace(/\/+$/, ''), key };
}

async function rest(path, init = {}) {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getLink(studentId) {
  const rows = await rest(`parent_links?student_id=eq.${encodeURIComponent(studentId)}&select=*`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function upsertLink(studentId, chatId, parentName) {
  await rest('parent_links', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      student_id: studentId,
      chat_id: chatId,
      parent_name: parentName || null,
      linked_at: new Date().toISOString(),
    }),
  });
}

export async function removeLink(chatId) {
  await rest(`parent_links?chat_id=eq.${encodeURIComponent(chatId)}`, { method: 'DELETE' });
}

// Counts one send against the student's daily cap. Returns false when the cap
// is already spent, in which case the caller must not send.
export async function consumeQuota(link) {
  const today = new Date().toISOString().slice(0, 10);
  const fresh = link.sent_date !== today;
  const used = fresh ? 0 : (link.sent_count || 0);
  if (used >= MAX_PER_DAY) return false;

  await rest(`parent_links?student_id=eq.${encodeURIComponent(link.student_id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sent_date: today, sent_count: used + 1 }),
  });
  return true;
}
