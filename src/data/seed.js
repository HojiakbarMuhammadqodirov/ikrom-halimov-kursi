// Seed data for Ikrom Halimov kursi — Fizika & Matematika.
// Two subjects, two tests, 40 questions. All seed values are deterministic
// (mulberry32 PRNG, fixed seed) so the dashboard looks the same on every
// fresh load.

// -------- SUBJECTS --------

export const SUBJECTS = {
  fizika: {
    id: 'fizika',
    label: 'Fizika',
    glyph: 'π',
    accent: '#0f9d76',       // emerald (brand accent)
    subtopics: ['Mexanika', 'Elektrodinamika', 'Optika', 'Termodinamika'],
  },
  matematika: {
    id: 'matematika',
    label: 'Matematika',
    glyph: '∫',
    accent: '#4d5bce',       // muted indigo (chart/line distinction only)
    subtopics: ['Algebra', 'Geometriya', 'Trigonometriya', 'Hosila va integral'],
  },
};

export const TOPICS = [...SUBJECTS.fizika.subtopics, ...SUBJECTS.matematika.subtopics];

// Stable PRNG so seed values are reproducible across reloads.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260718);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

// -------- USERS --------

const admin = {
  id: 'u-admin',
  role: 'admin',
  username: 'admincourse',
  password: 'admincourse2026',
  fullName: 'Kurs administratori',
};

const teacher = {
  id: 'u-teacher-1',
  role: 'teacher',
  username: 'IkromjonHalimov',
  password: 'HalimovTeacher123',
  fullName: 'Ikromjon Halimov',
  subject: 'Fizika & Matematika',
};

const students = [
  { id: 's-1', username: 'ali.akbarov',  fullName: 'Ali Akbarov',     phone: '+998 90 123 45 67', subjects: ['fizika', 'matematika'] },
  { id: 's-2', username: 'madina.r',     fullName: 'Madina Rahimova', phone: '+998 91 234 56 78', subjects: ['fizika', 'matematika'] },
  { id: 's-3', username: 'jasur.s',      fullName: 'Jasur Saidov',    phone: '+998 93 345 67 89', subjects: ['fizika', 'matematika'] },
  { id: 's-4', username: 'nigora.t',     fullName: 'Nigora Toshmatova', phone: '+998 94 456 78 90', subjects: ['matematika'] },
  { id: 's-5', username: 'bobur.k',      fullName: 'Bobur Karimov',   phone: '+998 95 567 89 01', subjects: ['fizika', 'matematika'] },
  { id: 's-6', username: 'dilfuza.m',    fullName: 'Dilfuza Mahmudova', phone: '+998 97 678 90 12', subjects: ['fizika'] },
  // Parent contact starts empty on purpose — the "ota-onani kiriting" flow and
  // the test gate are the first thing you hit when logging in as a student.
].map((s) => ({
  ...s,
  role: 'student',
  password: s.username + '2026',
  parentName: '',
  parentPhone: '',
  parentRelation: '',
  parentAddedAt: null,   // set on the student's one-time save; locks the form
  parentTgLinked: false, // cached mirror of the server's parent_links row
}));

const users = [admin, teacher, ...students];

// -------- COURSE SETTINGS --------

const settings = {
  monthlyFee: 500000, // so'm
  // Stored as an ISO string (not a Date object) so it survives JSON round-trips
  // and the admin Settings page can safely call .slice() on it on a fresh load.
  nextTestDate: addDays(new Date(), 9).toISOString(), // 9 days from "now"
  courseName: 'Ikrom Halimov kursi — Fizika & Matematika',
};

// -------- TEST BANK --------

const questions = [
  // ===== FIZIKA — 20 ta =====

  // Mexanika (5)
  { id: 'q-f-1',  subject: 'fizika', topic: 'Mexanika', text: 'Tezlanish birligi qaysi?', options: ['m/s', 'm/s²', 'kg·m', 'N·s'], answer: 1 },
  { id: 'q-f-2',  subject: 'fizika', topic: 'Mexanika', text: 'Nyutonning 2-qonuni formulasi?', options: ['F = ma', 'F = mv', 'p = mv', 'E = mc²'], answer: 0 },
  { id: 'q-f-3',  subject: 'fizika', topic: 'Mexanika', text: 'Erkin tushish tezlanishi g ≈ ?', options: ['9.8 m/s²', '6.5 m/s²', '12 m/s²', '3.2 m/s²'], answer: 0 },
  { id: 'q-f-4',  subject: 'fizika', topic: 'Mexanika', text: 'Massasi 4 kg, tezlanishi 3 m/s² bo‘lsa, kuch?', options: ['7 N', '12 N', '1.33 N', '0.75 N'], answer: 1 },
  { id: 'q-f-5',  subject: 'fizika', topic: 'Mexanika', text: 'Ishqalanish kuchi yo‘nalishi qanday?', options: ['Harakat yo‘nalishi bo‘yicha', 'Harakatga qarama-qarshi', 'Vertikal pastga', 'Tanga perpendikulyar'], answer: 1 },

  // Elektrodinamika (5)
  { id: 'q-f-6',  subject: 'fizika', topic: 'Elektrodinamika', text: 'Om qonuni formulasi?', options: ['U = I·R', 'U = I/R', 'I = U·R', 'P = I·U²'], answer: 0 },
  { id: 'q-f-7',  subject: 'fizika', topic: 'Elektrodinamika', text: 'Kuchlanish 12 V, qarshilik 4 Ω. Tok kuchi?', options: ['48 A', '3 A', '8 A', '0.33 A'], answer: 1 },
  { id: 'q-f-8',  subject: 'fizika', topic: 'Elektrodinamika', text: 'Magnit oqimi birligi?', options: ['Tesla', 'Veber', 'Genri', 'Farad'], answer: 1 },
  { id: 'q-f-9',  subject: 'fizika', topic: 'Elektrodinamika', text: 'Sig‘im birligi?', options: ['Om', 'Farad', 'Volt', 'Amper'], answer: 1 },
  { id: 'q-f-10', subject: 'fizika', topic: 'Elektrodinamika', text: 'Parallel ulashda nimasi bir xil?', options: ['Tok', 'Kuchlanish', 'Qarshilik', 'Quvvat'], answer: 1 },

  // Optika (5)
  { id: 'q-f-11', subject: 'fizika', topic: 'Optika', text: 'Yorug‘lik tezligi vakuumda?', options: ['3·10⁶ m/s', '3·10⁸ m/s', '3·10⁵ km/s', '340 m/s'], answer: 1 },
  { id: 'q-f-12', subject: 'fizika', topic: 'Optika', text: 'Sindirish ko‘rsatkichi n = ?', options: ['c/v', 'v·c', 'c+v', 'c−v'], answer: 0 },
  { id: 'q-f-13', subject: 'fizika', topic: 'Optika', text: 'Linza fokus masofasi 20 cm. Linzaning optik kuchi?', options: ['5 dptr', '0.05 dptr', '20 dptr', '0.5 dptr'], answer: 0 },
  { id: 'q-f-14', subject: 'fizika', topic: 'Optika', text: 'Yassi ko‘zgu tasvir qanday?', options: ['haqiqiy, kichraygan', 'mavhum, kattalashgan', 'mavhum, o‘lchami teng', 'haqiqiy, kattalashgan'], answer: 2 },
  { id: 'q-f-15', subject: 'fizika', topic: 'Optika', text: 'Yorug‘lik to‘lqinining chastotasi 5·10¹⁴ Hz. To‘lqin uzunligi?', options: ['600 nm', '1.5 µm', '60 nm', '6 mm'], answer: 0 },

  // Termodinamika (5)
  { id: 'q-f-16', subject: 'fizika', topic: 'Termodinamika', text: 'Ideal gaz bosimi 2 marta, hajmi 2 marta ortsa, temperatura?', options: ['4 marta ortadi', '2 marta ortadi', 'O‘zgarmaydi', '2 marta kamayadi'], answer: 0 },
  { id: 'q-f-17', subject: 'fizika', topic: 'Termodinamika', text: 'Ichki energiya nimaning yig‘indisi?', options: ['Faqat kinetik', 'Faqat potensial', 'Barcha molekulalar K+P energiyalari', 'Faqat issiqlik'], answer: 2 },
  { id: 'q-f-18', subject: 'fizika', topic: 'Termodinamika', text: 'Birinchi termodinamika qonuni?', options: ['Q = ΔU + A', 'PV = nRT', 'F = ma', 'E = mc²'], answer: 0 },
  { id: 'q-f-19', subject: 'fizika', topic: 'Termodinamika', text: 'Absolyut nol qaysi temperaturaga teng?', options: ['0 °C', '−273.15 °C', '−100 °C', '273.15 K'], answer: 1 },
  { id: 'q-f-20', subject: 'fizika', topic: 'Termodinamika', text: 'Issiqlik miqdori formulasi?', options: ['Q = cmΔT', 'Q = IRt', 'Q = mc²', 'Q = pV'], answer: 0 },

  // ===== MATEMATIKA — 20 ta =====

  // Algebra (5)
  { id: 'q-m-1',  subject: 'matematika', topic: 'Algebra', text: 'x + 12 = 30 da x nechiga teng?', options: ['12', '18', '20', '42'], answer: 1 },
  { id: 'q-m-2',  subject: 'matematika', topic: 'Algebra', text: '2x − 4 = 10 dan x = ?', options: ['5', '6', '7', '3'], answer: 2 },
  { id: 'q-m-3',  subject: 'matematika', topic: 'Algebra', text: 'log₁₀ 1000 = ?', options: ['2', '3', '4', '10'], answer: 1 },
  { id: 'q-m-4',  subject: 'matematika', topic: 'Algebra', text: 'x² − 9 = 0 ildizlari?', options: ['±2', '±3', '±4', 'faqat 3'], answer: 1 },
  { id: 'q-m-5',  subject: 'matematika', topic: 'Algebra', text: 'a² + 2ab + b² = ?', options: ['(a−b)²', '(a+b)²', 'a²+b²', '(a+b)(a−2b)'], answer: 1 },

  // Geometriya (5)
  { id: 'q-m-6',  subject: 'matematika', topic: 'Geometriya', text: '90° burchak qanday burchak?', options: ['o‘tkir', 'to‘g‘ri', 'yoyiq', 'egri'], answer: 1 },
  { id: 'q-m-7',  subject: 'matematika', topic: 'Geometriya', text: 'Doira yuzasi formulasi?', options: ['πr', '2πr', 'πr²', 'πd'], answer: 2 },
  { id: 'q-m-8',  subject: 'matematika', topic: 'Geometriya', text: 'To‘g‘ri burchakli uchburchakda a=3, b=4. gipotenuza c = ?', options: ['5', '6', '7', '25'], answer: 0 },
  { id: 'q-m-9',  subject: 'matematika', topic: 'Geometriya', text: 'Kvadratning diagonali a = 4√2. Tomoni?', options: ['4', '2√2', '8', '4√2'], answer: 0 },
  { id: 'q-m-10', subject: 'matematika', topic: 'Geometriya', text: 'Uchburchak ichki burchaklari yig‘indisi?', options: ['90°', '180°', '270°', '360°'], answer: 1 },

  // Trigonometriya (5)
  { id: 'q-m-11', subject: 'matematika', topic: 'Trigonometriya', text: 'sin 30° = ?', options: ['0', '1/2', '√3/2', '1'], answer: 1 },
  { id: 'q-m-12', subject: 'matematika', topic: 'Trigonometriya', text: 'cos 60° = ?', options: ['1/2', '√3/2', '1', '0'], answer: 0 },
  { id: 'q-m-13', subject: 'matematika', topic: 'Trigonometriya', text: 'tg 45° = ?', options: ['0', '1', '√3', 'aniqlanmagan'], answer: 1 },
  { id: 'q-m-14', subject: 'matematika', topic: 'Trigonometriya', text: 'sin²x + cos²x = ?', options: ['0', '1', '2', 'sin x'], answer: 1 },
  { id: 'q-m-15', subject: 'matematika', topic: 'Trigonometriya', text: 'sin 90° qiymati?', options: ['0', '1/2', '1', '−1'], answer: 2 },

  // Hosila va integral (5)
  { id: 'q-m-16', subject: 'matematika', topic: 'Hosila va integral', text: 'f(x) = x³, f ′(x) = ?', options: ['3x²', 'x²', '3x', 'x³/3'], answer: 0 },
  { id: 'q-m-17', subject: 'matematika', topic: 'Hosila va integral', text: '∫ 2x dx = ?', options: ['x² + C', '2 + C', '2x² + C', 'x + C'], answer: 0 },
  { id: 'q-m-18', subject: 'matematika', topic: 'Hosila va integral', text: '(eˣ)′ = ?', options: ['eˣ', 'xeˣ⁻¹', 'ln x', '1/x'], answer: 0 },
  { id: 'q-m-19', subject: 'matematika', topic: 'Hosila va integral', text: 'f(x) = sin x. f ′(x) = ?', options: ['−cos x', 'cos x', '−sin x', 'sin x'], answer: 1 },
  { id: 'q-m-20', subject: 'matematika', topic: 'Hosila va integral', text: '∫₀¹ 2x dx = ?', options: ['0', '1', '2', '4'], answer: 1 },
];

// Index questions by subject for easy test wiring.
const questionsBySubject = (sid) => questions.filter((q) => q.subject === sid);

const tests = [
  {
    id: 't-fizika',
    code: 'F-001',
    title: 'Fizika: Umumiy test #1',
    subject: 'fizika',
    cadence: 'monthly',
    questionCount: 20,
    description: 'Mexanika, elektrodinamika, optika, termodinamika — 20 ta savol',
    availability: 'immediate',
    openAt: null,
    manualOpen: null,
    createdBy: 'u-teacher-1',
    createdAt: new Date().toISOString(),
    questionIds: questionsBySubject('fizika').map((q) => q.id),
  },
  {
    id: 't-matematika',
    code: 'M-001',
    title: 'Matematika: Umumiy test #1',
    subject: 'matematika',
    cadence: 'monthly',
    questionCount: 20,
    description: 'Algebra, geometriya, trigonometriya, hosila va integral — 20 ta savol',
    availability: 'immediate',
    openAt: null,
    manualOpen: null,
    createdBy: 'u-teacher-1',
    createdAt: new Date().toISOString(),
    questionIds: questionsBySubject('matematika').map((q) => q.id),
  },
];

// -------- HISTORICAL RESULTS (10 per student per test) --------

function buildHistoricalResults() {
  const results = [];
  const now = new Date();
  students.forEach((s, sIdx) => {
    // Each student has a different "ability" per subject.
    const baseFiz = 55 + sIdx * 3;       // 55..70
    const baseMat = 60 + sIdx * 2.5;     // 60..72.5
    tests.forEach((t) => {
      const isFiz = t.subject === 'fizika';
      const base = isFiz ? baseFiz : baseMat;
      for (let i = 9; i >= 0; i--) {
        const date = addDays(now, -i * 14 - between(0, 3));
        const noise = between(-10, 10);
        const trend = (9 - i) * between(0, 2); // small upward drift
        const score = Math.max(22, Math.min(100, Math.round(base + noise + trend)));
        const testQuestions = t.questionIds.map((id) => questions.find((q) => q.id === id));
        const correctCount = Math.round((score / 100) * testQuestions.length);
        const wrongQuestionIds = shuffleArray(testQuestions.map((q) => q.id)).slice(0, testQuestions.length - correctCount);

        const answers = {};
        testQuestions.forEach((q) => {
          if (wrongQuestionIds.includes(q.id)) {
            const wrongOptions = q.options.map((_, idx) => idx).filter((idx) => idx !== q.answer);
            answers[q.id] = wrongOptions[between(0, wrongOptions.length - 1)];
          } else {
            answers[q.id] = q.answer;
          }
        });

        results.push({
          id: `r-${s.id}-${t.id}-${9 - i}`,
          studentId: s.id,
          testId: t.id,
          subject: t.subject,
          date: date.toISOString(),
          score,
          correctCount,
          total: testQuestions.length,
          answers,
          wrongQuestionIds,
        });
      }
    });
  });
  return results;
}

const testResults = buildHistoricalResults();

// -------- ATTENDANCE (20 days per student) --------

function buildAttendance() {
  const records = [];
  const today = new Date();
  students.forEach((s) => {
    for (let d = 19; d >= 0; d--) {
      const date = addDays(today, -d);
      const r = rand();
      let status, lateMinutes;
      if (r < 0.78) { status = 'present'; lateMinutes = 0; }
      else if (r < 0.94) { status = 'late'; lateMinutes = between(3, 25); }
      else { status = 'absent'; lateMinutes = 0; }
      records.push({
        id: `a-${s.id}-${d}`,
        studentId: s.id,
        date: date.toISOString().slice(0, 10),
        status,
        lateMinutes,
      });
    }
  });
  return records;
}

const attendance = buildAttendance();

// -------- PAYMENTS --------

function buildPayments() {
  const today = new Date();
  return students.map((s) => {
    const lastPaid = addDays(today, -between(2, 28));
    const nextDue = addDays(lastPaid, 30);
    let status;
    const daysToDue = Math.round((nextDue - today) / 86400000);
    if (daysToDue < 0) status = 'overdue';
    else if (daysToDue <= 7) status = 'due_soon';
    else status = 'paid';
    return {
      id: `p-${s.id}`,
      studentId: s.id,
      monthlyFee: settings.monthlyFee,
      lastPaid: lastPaid.toISOString().slice(0, 10),
      nextDue: nextDue.toISOString().slice(0, 10),
      status,
      history: [
        { date: lastPaid.toISOString().slice(0, 10), amount: settings.monthlyFee },
        { date: addDays(lastPaid, -30).toISOString().slice(0, 10), amount: settings.monthlyFee },
        { date: addDays(lastPaid, -60).toISOString().slice(0, 10), amount: settings.monthlyFee },
      ],
    };
  });
}

const payments = buildPayments();

// -------- STUDY MATERIALS --------

const materials = [
  { id: 'm-1', subject: 'fizika',     topic: 'Mexanika',          title: 'Mexanika formulalari (PDF)',  type: 'pdf' },
  { id: 'm-2', subject: 'fizika',     topic: 'Optika',            title: 'Optika masalalar to‘plami',  type: 'pdf' },
  { id: 'm-3', subject: 'fizika',     topic: 'Termodinamika',     title: 'Termodinamika asoslari',      type: 'pdf' },
  { id: 'm-4', subject: 'matematika', topic: 'Algebra',           title: 'Algebra formulalari (PDF)',   type: 'pdf' },
  { id: 'm-5', subject: 'matematika', topic: 'Hosila va integral', title: 'Hosila va integral — misollar', type: 'pdf' },
  { id: 'm-6', subject: 'matematika', topic: 'Trigonometriya',    title: 'Trigonometrik jadval',         type: 'pdf' },
];

// -------- HELPERS --------

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// -------- EXPORT --------

export const initialState = {
  users,
  students,
  teacher,
  admin,
  questions,
  tests,
  testResults,
  attendance,
  payments,
  materials,
  settings,
  topics: TOPICS,
  subjects: SUBJECTS,
  // Sign-up applications submitted from the public landing page. Starts empty —
  // the shallow merge in storage.js backfills it onto older saved state.
  applications: [],
};
