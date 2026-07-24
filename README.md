# Ikrom Halimov kursi

O'quv platformasi — fizika va matematika yo'nalishi. Admin, o'qituvchi va o'quvchilar uchun alohida panelli React + Vite ilovasi.

## Tez boshlash

```bash
npm install
npm run dev
```

Brauzer `http://localhost:5173` da ochiladi.

## Demo hisoblar

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admincourse` | `admincourse2026` |
| O'qituvchi | `IkromjonHalimov` | `HalimovTeacher123` |
| O'quvchi | `ali.akbarov` | `ali.akbarov2026` |
| O'quvchi | `madina.r` | `madina.r2026` |
| O'quvchi | `jasur.s` | `jasur.s2026` |
| O'quvchi | `nigora.t` | `nigora.t2026` |
| O'quvchi | `bobur.k` | `bobur.k2026` |
| O'quvchi | `dilfuza.m` | `dilfuza.m2026` |

Boshqa o'quvchilarni admin panelidan qo'shish mumkin.

## Fanlar

- **Fizika** — Mexanika, Elektrodinamika, Optika, Termodinamika
- **Matematika** — Algebra, Geometriya, Trigonometriya, Hosila va integral

## Imkoniyatlar

### Admin
- Umumiy statistika: o'quvchilar soni, o'qituvchilar, jami testlar, fanlar bo'yicha o'rtacha ball, oylik tushum
- Fanlar bo'yicha alohida ko'rsatkichlar
- O'quvchilar va o'qituvchilarni qo'shish / o'chirish, fan biriktirish
- Har bir o'quvchining batafsil profili (ikki fanning dinamikasi, mavzular, noto'g'ri javoblar)
- Parolni qayta tikish
- Kurs sozlamalari (oylik to'lov, keyingi test sanasi)

### O'qituvchi
- **Davomat** — bugungi holatni belgilash, kech qolish daqiqalari, 20 kunlik davomat foizi
- **Natijalar** — har bir o'quvchi uchun so'nggi 10 natija, fan filtri, sparkline grafik, o'zgarish strelkasi
- **To'lov** — har bir o'quvchining oylik to'lovi, tasdiqlash modal oynasi orqali
- **Fanlar** — kurs bo'ylab har bir fan uchun mavzu natijalari va top-5 reyting
- O'quvchini bosish → batafsil sahifa: ikki chiziqli ball dinamikasi, mavzular bo'yicha natija, noto'g'ri javoblar

### O'quvchi
- Keyingi testgacha taymer (7 kundan kam bo'lsa qizil)
- Fanlar bo'yicha alohida testlar — 20 tadan savol
- Test yakunida ball (Fraunces raqami), mavzular bo'yicha natija, har bir savolning to'g'ri/noto'g'ri javobi
- O'quv materiallari ro'yxati
- To'lov ma'lumotlari va tarix

## Dizayn

- **Palitra**: Iliq krem (`#f5f1ea`) + to'q siyoh (`#14171c`) + bitta aksent — terrakot (`#b3461e`)
- **Shriftlar**: Fraunces (serif sarlavhalar), Plus Jakarta Sans (matn), JetBrains Mono (sonlar)
- **Komponentlar**: Double-Bezel (ichma-ich) kartalar, sticky fluid-island header, asimetrik bento
- **Bezak**: Fan mavzusiga mos inline SVG — AtomOrbit, IntegralGlyph, RulerCompass, WaveInterference, Pythagorean, Blackboard
- **Animatsiya**: Yumshoq spring-fizika (cubic-bezier(0.32, 0.72, 0, 1)), `prefers-reduced-motion` qo'llab-quvvatlanadi

## Ma'lumotlar saqlanishi

Barcha ma'lumotlar brauzerning `localStorage` da saqlanadi (`ikrom-kursi-v2` kaliti). Bu demo uchun qulay — server kerak emas, ma'lumotlar sahifa yangilanganda ham saqlanib qoladi. Tozalash uchun brauzer DevTools → Application → Local Storage → `ikrom-kursi-v2` ni o'chirib tashlang.

## Texnologiyalar

- React 18
- Vite 5
- Recharts (grafiklar uchun)
- localStorage (ma'lumotlar uchun)

## Loyiha tuzilmasi

```
src/
├── main.jsx                 # React kirish nuqtasi
├── App.jsx                  # Auth + router
├── styles.css               # Barcha stillar
├── data/
│   ├── seed.js              # Boshlang'ich demo ma'lumotlar
│   └── storage.js           # localStorage helper
├── lib/
│   └── auth.js              # Login/logout
└── components/
    ├── Login.jsx            # Editorial split login
    ├── AdminPanel.jsx       # Admin: bento + barcha fanlar
    ├── TeacherPanel.jsx     # O'qituvchi: davomat, natijalar, to'lov, fanlar
    ├── StudentPanel.jsx     # O'quvchi: bosh sahifa, testlar, materiallar
    ├── StudentDetail.jsx    # O'quvchi profili (ikki fanning dinamikasi)
    ├── TestRunner.jsx       # Test o'tkazish
    ├── SubjectArt.jsx       # Fan bezaklari (inline SVG)
    └── shared.jsx           # Qayta foydalaniladigan UI
```
