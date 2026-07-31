// Public-facing course facts for the landing page.
//
// Everything the marketing page claims lives here and nowhere else, so a wrong
// number is one edit away from fixed. Deliberately separate from seed.js: that
// file is demo *app* data, this is real *business* data.

export const CONTACT = {
  telegramUser: 'Math_Physic_teach',
  telegramUrl: 'https://t.me/Math_Physic_teach',
  phoneLabel: '+998 99 941 92 78',
  phoneHref: 'tel:+998999419278',
  channels: [
    { label: 'Math with Halimov', handle: '@Math_with_Halimov', url: 'https://t.me/Math_with_Halimov', subject: 'matematika' },
    { label: 'FizTop', handle: '@FizTop', url: 'https://t.me/FizTop', subject: 'fizika' },
  ],
};

export const COURSE = {
  name: 'Ikromjon Halimov kursi',
  pricePerLesson: 50000,
  hasTrialLesson: true,
  hasDiscounts: false,
  groupSize: 20,
  venue: '69-maktab',
  landmark: 'Pushkin metro bekati yaqinida',
  // Lessons are offline; only tests, attendance and payment tracking are online.
  format: 'offline',
};

export const TEACHER = {
  name: 'Ikromjon Halimov',
  // Only what is actually known. His university is deliberately absent rather
  // than invented — add it here when confirmed and the bio picks it up.
  currentRole: 'Matematika o‘qituvchisi',
  school: 'Muhammad al-Xorazmiy nomidagi ixtisoslashtirilgan maktab',
  yearsTeaching: 20,
  studentsTaught: 200,
};

// Verified against the score reports in src/certificates/. The cropped images
// in src/assets/certs/ are the only versions that ship — the originals contain
// a home address, personal email, phone, date of birth and passport photo.
export const CREDENTIALS = [
  {
    id: 'milliy',
    value: 90.08,
    decimals: 2,
    grade: 'A+',
    title: 'Milliy sertifikat',
    subtitle: 'Fizika (o‘zbek tilida)',
    note: 'Umumiy ballga nisbatan 100 %',
    valid: '05.05.2029 gacha amal qiladi',
    subject: 'fizika',
  },
  {
    id: 'gre',
    value: 890,
    decimals: 0,
    grade: '79-foiz',
    title: 'GRE Physics',
    subtitle: 'Xalqaro fizika imtihoni',
    note: 'Klassik mexanika 93 % · Elektromagnetizm 92 %',
    valid: 'May 2025',
    subject: 'fizika',
  },
  {
    id: 'sat',
    value: 740,
    decimals: 0,
    grade: '95-foiz',
    title: 'SAT Math',
    subtitle: 'Matematika bo‘limi',
    note: 'Ball oralig‘i 710–770',
    valid: 'May 2026',
    subject: 'matematika',
  },
];

// NOT from an official record — these are the course owner's own figures,
// given as approximations. They are rendered without a "tasdiqlangan" badge so
// they read as claims, unlike CREDENTIALS above. Correct them here before any
// serious public launch.
export const STUDENT_RESULTS = [
  { value: 15, label: 'o‘quvchi A / A+ daraja oldi', sub: 'Milliy sertifikat' },
  { value: 30, label: 'o‘quvchi B / B+ daraja oldi', sub: 'Milliy sertifikat' },
  { value: 5, label: 'o‘quvchi Inha universitetiga kirdi', sub: 'Oliy ta‘lim' },
];

export const METHOD = [
  {
    n: '01',
    title: 'Mavzuni noldan tushuntirish',
    body: 'Har bir mavzu asosidan boshlanadi. Formulani yodlash emas — nima uchun shunday ekanini tushunish.',
  },
  {
    n: '02',
    title: 'Doskada birga yechish',
    body: 'Guruh masalani ustoz bilan birga yechadi. Xato qayerda ketganini o‘sha yerda ko‘rasiz, uyda emas.',
  },
  {
    n: '03',
    title: 'Haftalik test',
    body: 'Har hafta platformada test. 20 daqiqa, avtomatik baholash, har bir savol bo‘yicha tahlil.',
  },
  {
    n: '04',
    title: 'Natijani kuzatib borish',
    body: 'Davomat, test ballari va to‘lovlar shaxsiy kabinetda. O‘quvchi ham, ota-ona ham ko‘ra oladi.',
  },
];

export const PLATFORM = [
  { id: 'tests', title: 'Onlayn testlar', body: 'Vaqti belgilangan testlar, avtomatik baholash va har bir savol bo‘yicha tahlil.' },
  { id: 'progress', title: 'Ball dinamikasi', body: 'Har bir testdan keyingi natija grafikda — o‘sish ham, tushish ham ko‘rinadi.' },
  { id: 'attendance', title: 'Davomat', body: 'Qaysi darsda bo‘lgani va qaysisini qoldirgani kunma-kun yoziladi.' },
  { id: 'payments', title: 'To‘lov nazorati', body: 'Qaysi oy to‘langan, qancha qarz qolgan — hammasi bir joyda.' },
  { id: 'materials', title: 'Materiallar', body: 'Dars konspektlari va qo‘shimcha masalalar kabinetdan yuklab olinadi.' },
];

export const FAQ = [
  {
    q: 'Darslar qayerda bo‘lib o‘tadi?',
    a: '69-maktabda, Pushkin metro bekati yaqinida. Darslar faqat oflayn — doskada, jonli. Testlar, davomat va to‘lov nazorati esa onlayn platformada yuritiladi.',
  },
  {
    q: 'Sinov darsi bormi?',
    a: 'Ha. Birinchi darsga kelib ko‘rasiz — guruh qanday ishlashini, ustoz qanday tushuntirishini ko‘rib, keyin qaror qilasiz.',
  },
  {
    q: 'Bir guruhda nechta o‘quvchi bo‘ladi?',
    a: 'Hozirda taxminan 20 ta o‘quvchi. Guruh doskada birga ishlaydigan hajmda saqlanadi.',
  },
  {
    q: 'Narxi qancha va chegirma bormi?',
    a: 'Bir dars 50 000 so‘m. Chegirmalar yo‘q — narx hamma uchun bir xil.',
  },
  {
    q: 'Dars jadvali qanday?',
    a: 'Jadval guruhga qarab belgilanadi. Aniq kun va vaqtni Telegram orqali yozib bilib olasiz.',
  },
  {
    q: 'Ota-ona farzandining natijasini ko‘ra oladimi?',
    a: 'Ha. Davomat, har bir testdagi ball va to‘lov holati shaxsiy kabinetda ochiq turadi — alohida so‘rashning hojati yo‘q.',
  },
];
