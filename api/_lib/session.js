import crypto from 'node:crypto';

// Teacher authorisation for the endpoints that must not be open to the world:
// minting a parent link, reading who is linked, unlinking, and the two
// teacher-triggered notification kinds.
//
// WHY A SEPARATE PASSWORD AT ALL. Every other credential in this app ships
// inside the JavaScript bundle — the roster is seeded in src/data/seed.js and
// the demo passwords are printed on the login screen on purpose. The teacher's
// browser and a student's browser also hold completely independent copies of
// localStorage, so there is no shared client-side secret to derive one from. A
// value the browser never contains is therefore the only thing an attacker who
// reads the frontend cannot obtain, which means an env var.
//
// There is no user table and no session store. A correct password returns an
// HMAC-signed bearer token carrying only its own expiry — the same
// self-verifying trick as the parent link tokens. Nothing to store, nothing to
// expire by hand.
//
// Everything here FAILS CLOSED: an unset or too-short password rejects every
// request rather than waving them through.

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — this runs on the teacher's own laptop
const TAG_BYTES = 16;
const MIN_PASSWORD = 12;

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signingSecret() {
  const s = process.env.TEACHER_SESSION_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!s) throw new Error('TEACHER_SESSION_SECRET (or TELEGRAM_WEBHOOK_SECRET) is not set');
  return s;
}

function sign(body) {
  return b64url(crypto.createHmac('sha256', signingSecret()).update(body).digest().subarray(0, TAG_BYTES));
}

// Reports how the password env var is configured, so /api/teacher-session can
// tell "you typed the wrong password" apart from "you never set one" — the
// difference between a security event and an unfinished setup.
export function passwordState() {
  const p = process.env.TEACHER_PANEL_PASSWORD;
  if (!p) return 'missing';
  if (p.length < MIN_PASSWORD) return 'too_short';
  return 'ok';
}

export function checkPassword(candidate) {
  if (passwordState() !== 'ok') return false;
  // Hash both sides first: timingSafeEqual throws on a length mismatch, and the
  // submitted value is attacker-controlled, so its raw length must not matter.
  const a = crypto.createHash('sha256').update(String(candidate ?? '')).digest();
  const b = crypto.createHash('sha256').update(process.env.TEACHER_PANEL_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

// '.' as the separator here, unlike the parent link tokens: this value never
// travels through a Telegram /start payload, so it is not restricted to
// [A-Za-z0-9_-] and can use a character base64url will never produce. See
// token.js for what happens when the separator collides with the alphabet.
export function createSession(now = Date.now()) {
  const exp = now + TTL_MS;
  const body = exp.toString(36);
  return { token: `${body}.${sign(body)}`, expiresAt: new Date(exp).toISOString() };
}

export function verifySession(token, now = Date.now()) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return false;

  const [body, tag] = parts;
  const expected = sign(body);
  if (tag.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(tag), Buffer.from(expected))) return false;

  const exp = parseInt(body, 36);
  return Number.isFinite(exp) && exp > now;
}

// Guard for a handler: returns true when the caller proved teacher access, and
// otherwise answers 401 itself. Callers must `return` immediately on false.
export function requireTeacher(req, res) {
  const header = req.headers['x-teacher-session'];
  if (!verifySession(Array.isArray(header) ? header[0] : header)) {
    res.status(401).json({ error: 'auth_required' });
    return false;
  }
  return true;
}
