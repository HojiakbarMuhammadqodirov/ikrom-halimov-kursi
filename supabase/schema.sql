-- Run once in Supabase → SQL Editor.
--
-- One row per student whose parent has pressed Start in the bot. This is the
-- only server-side state the notification feature has: everything else still
-- lives in the browser's localStorage.
--
-- Link tokens are NOT stored — they are HMAC-signed and self-expiring, so the
-- webhook can verify one without a lookup (see api/_lib/token.js).

create table if not exists parent_links (
  student_id   text primary key,
  chat_id      bigint      not null,
  parent_name  text,
  linked_at    timestamptz not null default now(),

  -- Cheap abuse cap. /api/notify is callable by anyone who can read the
  -- frontend source, so a single student can't be used to spam a parent.
  sent_date    date,
  sent_count   integer     not null default 0
);

create index if not exists parent_links_chat_id_idx on parent_links (chat_id);

-- No policies are defined on purpose: RLS on with zero policies means the anon
-- and authenticated keys can read nothing. Only the service-role key (used by
-- the serverless functions, never shipped to the browser) bypasses RLS.
alter table parent_links enable row level security;
