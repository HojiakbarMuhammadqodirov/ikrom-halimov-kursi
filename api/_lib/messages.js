import { esc } from './telegram.js';

// Message text is built HERE, on the server, from a fixed set of templates —
// the browser only sends a kind and a few numbers. /api/notify is callable by
// anyone who can read the frontend source, so letting the client supply the
// text would let a stranger send a parent anything at all. This way the worst
// a forger can do is send a plausible-looking result for a real student.

const SUBJECTS = { fizika: 'Fizika', matematika: 'Matematika' };

function subjectName(id) {
  return SUBJECTS[id] || 'Fan';
}

function scoreBand(score) {
  if (score >= 85) return { note: 'Ajoyib natija.', mark: '🟢' };
  if (score >= 60) return { note: "Natija o'rtachadan yuqori.", mark: '🟡' };
  if (score >= 40) return { note: 'Mavzuni takrorlash tavsiya etiladi.', mark: '🟠' };
  return { note: "Iltimos, ustoz bilan bog'laning.", mark: '🔴' };
}

function uzDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(iso || '').slice(0, 10);
  }
}

function money(sum) {
  const n = Number(sum);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}

const NUM = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const CLAMP = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Returns the message text, or null when the kind/payload is not recognised —
// the caller must then refuse the request rather than send something empty.
export function buildMessage(kind, p = {}, studentName = "O'quvchi") {
  const name = esc(studentName);

  if (kind === 'test_result') {
    const score = CLAMP(Math.round(NUM(p.score)), 0, 100);
    const total = CLAMP(Math.round(NUM(p.total)), 0, 500);
    const correct = CLAMP(Math.round(NUM(p.correct)), 0, total);
    const band = scoreBand(score);
    return [
      `${band.mark} <b>Test natijasi</b>`,
      '',
      `Farzandingiz <b>${name}</b> ${esc(subjectName(p.subject))} fanidan`,
      `<b>${esc(p.testTitle || 'test')}</b> topshirdi.`,
      '',
      `Ball: <b>${score}%</b>  (${correct}/${total} ta to'g'ri)`,
      band.note,
    ].join('\n');
  }

  if (kind === 'attendance') {
    const when = uzDate(p.date);
    if (p.status === 'absent') {
      return [
        '🔴 <b>Darsga kelmadi</b>',
        '',
        `Farzandingiz <b>${name}</b> ${esc(when)} kungi darsda qatnashmadi.`,
      ].join('\n');
    }
    if (p.status === 'late') {
      const mins = CLAMP(Math.round(NUM(p.lateMinutes)), 0, 300);
      return [
        '🟠 <b>Darsga kechikdi</b>',
        '',
        `Farzandingiz <b>${name}</b> ${esc(when)} kungi darsga`,
        `<b>${mins} daqiqa</b> kechikib keldi.`,
      ].join('\n');
    }
    return null;
  }

  if (kind === 'payment') {
    const days = Math.round(NUM(p.daysLeft));
    const line = days < 0
      ? `To'lov muddati <b>${Math.abs(days)} kun</b> oldin o'tgan.`
      : `To'lovga <b>${days} kun</b> qoldi.`;
    return [
      "💳 <b>To'lov eslatmasi</b>",
      '',
      `<b>${name}</b> uchun oylik to'lov: <b>${esc(money(p.amount))}</b>`,
      `Muddat: ${esc(uzDate(p.dueDate))}`,
      line,
    ].join('\n');
  }

  return null;
}

// No student name here on purpose: the server never learns it. The roster lives
// in the browser's localStorage, and the link token is capped at 64 characters
// by Telegram, so there is nowhere to carry it. The first real notification
// names the student anyway.
export const WELCOME = [
  '✅ <b>Ulanish muvaffaqiyatli</b>',
  '',
  'Siz farzandingizning natijalariga ulandingiz.',
  '',
  'Endi shu botga quyidagilar keladi:',
  '• test natijalari',
  '• darsga kelmagan yoki kechikkan kunlar',
  "• oylik to'lov eslatmalari",
  '',
  "Ulanishni bekor qilish uchun /stop yuboring.",
].join('\n');

export const ALREADY_LINKED = "Siz allaqachon ulangansiz. Xabarlar shu yerga kelaveradi.";
export const BAD_TOKEN = "Havola eskirgan yoki noto'g'ri. Farzandingizdan yangi havola so'rang.";
export const NEED_LINK = "Ulanish uchun farzandingiz saytdan bergan havolani bosing.";
export const STOPPED = "Ulanish bekor qilindi. Endi bu botdan xabar kelmaydi.";
