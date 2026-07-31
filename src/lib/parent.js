// Parent-contact rules. Everything about "is this student's parent on file and
// what does that unlock" lives here so the Telegram stage only has to extend
// this file — the panels never decide the rule themselves.

export const PARENT_RELATIONS = ['Onasi', 'Otasi', 'Vasiysi'];

// Deliberately OFF. Turning this on blocks tests until the *parent* has pressed
// Start in the bot — which the student cannot do alone, so flipping it on a live
// course locks out everyone whose parent has not linked yet. Announce it first,
// let the links accumulate, then switch. This is the only line to change.
export const REQUIRE_TELEGRAM_FOR_TESTS = false;

export function hasParentContact(student) {
  if (!student) return false;
  return Boolean(student.parentName && student.parentName.trim())
    && isValidUzPhone(student.parentPhone);
}

// Mirrors the server's parent_links table. The browser only ever caches the
// boolean; /api/notify re-checks against the database before sending.
export function isTelegramLinked(student) {
  return Boolean(student && student.parentTgLinked);
}

// The one thing the gate blocks today. Kept separate from hasParentContact so
// the two can diverge (e.g. materials stay open, tests do not).
export function canTakeTests(student) {
  if (!hasParentContact(student)) return false;
  if (REQUIRE_TELEGRAM_FOR_TESTS) return isTelegramLinked(student);
  return true;
}

// A student may fill the contact in exactly once — after that only a teacher or
// admin can change it, so a bad mark can't be hidden by swapping in a friend's
// number. `parentAddedAt` is the lock: set on first save, never cleared here.
export function isParentLockedForStudent(student) {
  return Boolean(student && student.parentAddedAt);
}

// Digits only, then require the Uzbek 9-digit subscriber number. Accepts the
// forms people actually type: 901234567, 90 123 45 67, +998901234567, 998...
export function phoneDigits(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('998')) return d.slice(3);
  if (d.length === 10 && d.startsWith('0')) return d.slice(1);
  return d;
}

export function isValidUzPhone(raw) {
  return phoneDigits(raw).length === 9;
}

// Canonical storage/display form: +998 90 123 45 67
export function normalizePhone(raw) {
  const d = phoneDigits(raw);
  if (d.length !== 9) return String(raw || '').trim();
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

// tel: href — no spaces, full international form.
export function phoneHref(raw) {
  const d = phoneDigits(raw);
  return d.length === 9 ? `tel:+998${d}` : `tel:${String(raw || '').replace(/\s/g, '')}`;
}

export function studentsMissingParent(students) {
  return (students || []).filter((s) => !hasParentContact(s));
}
