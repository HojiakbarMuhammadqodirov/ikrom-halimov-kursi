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
  if (!url || !key) {
    const err = new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
    err.stage = 'env';
    err.missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean);
    throw err;
  }
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
    const err = new Error(`Supabase ${res.status}: ${body.slice(0, 300)}`);
    err.stage = 'supabase';
    err.status = res.status;
    // PostgREST answers with {code, message, ...}; the code alone identifies
    // the usual setup mistakes (42P01 missing table, 42501 permission).
    try { err.code = JSON.parse(body)?.code; } catch { /* non-JSON body */ }
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getLink(studentId) {
  const rows = await rest(`parent_links?student_id=eq.${encodeURIComponent(studentId)}&select=*`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

// Every link, for the teacher's Telegram page. chat_id is excluded from the
// projection on purpose — it is the one value that would let a leaked frontend
// message a parent directly, and no screen has a use for it.
export async function listLinks() {
  const rows = await rest('parent_links?select=student_id,parent_name,linked_at&order=linked_at.desc');
  return Array.isArray(rows) ? rows : [];
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

// The teacher's side of the same thing: /stop is how a parent unsubscribes,
// this is how the teacher fixes a link that went to the wrong person.
export async function removeLinkByStudent(studentId) {
  await rest(`parent_links?student_id=eq.${encodeURIComponent(studentId)}`, { method: 'DELETE' });
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
