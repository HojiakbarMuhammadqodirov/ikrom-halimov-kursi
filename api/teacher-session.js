import { checkPassword, createSession, passwordState } from './_lib/session.js';

// Exchanges the teacher password for a 30-day signed session. This is the only
// endpoint that accepts the password, and the only one that is deliberately
// open — everything else behind it demands the token this returns.

// Best-effort brute-force brake. Serverless instances are short-lived and there
// may be several at once, so this is a speed bump rather than a real limit; the
// actual defence is that the password is a long random string set in Vercel
// (see docs/telegram-setup.md). Kept in memory on purpose — a shared counter
// would mean another table for something worth far less than it costs.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 10;
const tries = new Map();

function tooManyTries(ip) {
  const now = Date.now();
  const rec = tries.get(ip);
  if (!rec || rec.resetAt < now) {
    tries.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  // Cheap cleanup so a long-lived instance can't grow the map without bound.
  if (tries.size > 500) {
    for (const [k, v] of tries) if (v.resetAt < now) tries.delete(k);
  }
  return rec.count > MAX_TRIES;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const state = passwordState();
  if (state !== 'ok') {
    // Not a secret: it says the server is unconfigured, not what the password
    // is. Without it the teacher sees "wrong password" for a variable they
    // never set, which is the worst possible setup experience.
    return res.status(503).json({ error: state === 'missing' ? 'password_not_set' : 'password_too_short' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooManyTries(ip)) return res.status(429).json({ error: 'too_many_tries' });

  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ error: 'bad_password' });
  }

  try {
    return res.status(200).json(createSession());
  } catch (err) {
    console.error('teacher-session error', err);
    return res.status(500).json({ error: 'server_error', stage: 'env' });
  }
}
