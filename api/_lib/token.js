import crypto from 'node:crypto';

// Self-contained link tokens: the student id and an expiry, signed with a
// server secret. Nothing is stored — the webhook verifies the signature and
// trusts the payload, so linking needs no token table and no cleanup job.
//
// Telegram's /start payload allows only [A-Za-z0-9_-] and 64 characters, hence
// base64url everywhere, '-' as the separator, and a tag truncated to 16 bytes
// (still a 128-bit forgery margin, which is plenty for a course of 100 people).

const TAG_BYTES = 16;
// base64url of TAG_BYTES with the padding stripped — a constant, which is what
// makes the token parseable at all (see readLinkToken).
const TAG_CHARS = Math.ceil((TAG_BYTES * 4) / 3);
const TTL_MS = 24 * 60 * 60 * 1000;

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str) {
  return Buffer.from(String(str).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function secret() {
  const s = process.env.LINK_TOKEN_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!s) throw new Error('LINK_TOKEN_SECRET (or TELEGRAM_WEBHOOK_SECRET) is not set');
  return s;
}

function sign(body) {
  return b64url(crypto.createHmac('sha256', secret()).update(body).digest().subarray(0, TAG_BYTES));
}

export function createLinkToken(studentId, now = Date.now()) {
  const exp = (now + TTL_MS).toString(36);
  const body = `${b64url(studentId)}-${exp}`;
  return `${body}-${sign(body)}`;
}

// Returns the student id, or null for anything malformed, tampered or expired.
//
// Do NOT parse this with split('-'): base64url spells '+' as '-', so both the
// id and the tag contain dashes about a quarter of the time, and splitting
// silently rejected ~28% of otherwise valid links. The tag is instead read as
// the fixed-width suffix it is, which leaves the expiry (base36, dash-free) as
// the last dash-separated field and lets the id keep any dashes of its own.
export function readLinkToken(token, now = Date.now()) {
  const str = String(token || '');
  if (str.length < TAG_CHARS + 4 || str[str.length - TAG_CHARS - 1] !== '-') return null;

  const tag = str.slice(-TAG_CHARS);
  const body = str.slice(0, -TAG_CHARS - 1);
  const expAt = body.lastIndexOf('-');
  if (expAt <= 0) return null;

  const idPart = body.slice(0, expAt);
  const expPart = body.slice(expAt + 1);
  const expected = sign(body);
  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (tag.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(tag), Buffer.from(expected))) return null;

  const exp = parseInt(expPart, 36);
  if (!Number.isFinite(exp) || exp < now) return null;

  const studentId = fromB64url(idPart).toString('utf8');
  return studentId || null;
}
