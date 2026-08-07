# Telegram xabarnomasini ishga tushirish

Kod tayyor, lekin **sozlanmaguncha ishlamaydi**. Quyidagi 5 qadamni bir marta bajarasiz.

Sozlanmagan holatda sayt normal ishlaydi — o'quvchi "Telegram ulanishi hozircha
ishlamayapti" degan xabarni ko'radi, xolos. Hech narsa buzilmaydi.

---

## 1. Tokenni yangilang

Eski token chatga yozilgan, ya'ni u endi maxfiy emas.

1. Telegramda `@BotFather` ni oching
2. `/revoke` → `Halimov_kursi_bot` ni tanlang
3. Yangi token beradi — uni **hech kimga yubormang**, faqat 3-qadamda ishlatasiz

## 2. Supabase bazasini yarating

1. [supabase.com](https://supabase.com) → bepul akkaunt → yangi loyiha
2. Loyiha ichida **SQL Editor** ni oching
3. `supabase/schema.sql` faylining butun mazmunini nusxalab, ishga tushiring
4. **Settings → API** bo'limidan ikkita qiymatni oling:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` kaliti → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ `service_role` kaliti bazaga to'liq huquq beradi va RLS ni chetlab o'tadi.
> U faqat Vercel'da turishi kerak. Uni hech qachon `VITE_` prefiksi bilan
> nomlamang — Vite `VITE_` bilan boshlanadigan hamma narsani brauzerga chiqaradi.

## 3. Vercel'ga o'zgaruvchilarni kiriting

Vercel → loyiha → **Settings → Environment Variables**. Oltitasi kerak:

| Nomi | Qiymati |
|---|---|
| `TELEGRAM_BOT_TOKEN` | 1-qadamdagi yangi token |
| `TELEGRAM_WEBHOOK_SECRET` | O'zingiz o'ylab topgan uzun tasodifiy satr |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role kaliti |
| `VITE_TELEGRAM_BOT_USERNAME` | `Halimov_kursi_bot` |
| `TEACHER_PANEL_PASSWORD` | Ustoz Telegram bo'limini ochadigan parol |

`TELEGRAM_WEBHOOK_SECRET` va `TEACHER_PANEL_PASSWORD` uchun satr generatsiya qilish:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> `TEACHER_PANEL_PASSWORD` — bu **saytga kirish paroli emas**. Ustoz uni faqat
> "Telegram xabarnomasi" bo'limini ochish uchun bir marta kiritadi, keyin 30 kun
> so'ralmaydi. Kamida 12 ta belgi bo'lishi shart, aks holda server bo'limni
> umuman ochmaydi. Bu parol brauzerga hech qachon yuborilmaydi — butun himoya
> shunga asoslangan, shuning uchun uni Telegramda yoki chatda yozmang.

Kiritgandan keyin **qayta deploy qiling** — o'zgaruvchilar faqat yangi
deploy'da kuchga kiradi.

## 4. Webhook'ni ro'yxatdan o'tkazing

Deploy tugagandan keyin, `<TOKEN>`, `<SECRET>` va `<DOMEN>` ni o'zingiznikiga
almashtirib, terminalda bir marta ishga tushiring:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<DOMEN>/api/telegram-webhook",
    "secret_token": "<SECRET>",
    "allowed_updates": ["message"]
  }'
```

Tekshirish:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

`"url"` to'g'ri ko'rinsa va `"last_error_message"` bo'lmasa — tayyor.

## 5. Sinab ko'ring

1. **Ustoz** sifatida kiring → **Telegram xabarnomasi** bo'limi
2. `TEACHER_PANEL_PASSWORD` ni kiriting
3. Istalgan o'quvchi qatoridan **Havola olish** ni bosing
4. Havolani o'z Telegramingizda oching → **Start** bosing
5. "✅ Ulanish muvaffaqiyatli" xabari kelishi kerak
6. Jadvaldagi holat 4 soniya ichida "Ulangan" ga o'zgaradi
7. O'sha o'quvchi sifatida kirib test topshiring → natija Telegramga kelishi kerak

---

## Lokal ishlab chiqish

`npm run dev` — bu oddiy Vite, `/api/*` yo'q. Telegram qismi "ishlamayapti"
holatida ko'rinadi, bu normal.

Backend'ni lokal sinash uchun:

```bash
npm i -g vercel
vercel env pull .env       # Vercel'dagi o'zgaruvchilarni .env ga tushiradi
vercel dev
```

Webhook lokal manzilga kelmaydi (Telegram'ga ochiq domen kerak), shuning uchun
ulanish oqimini faqat deploy qilingan saytda sinash mumkin.

---

## Xabarlar qachon ketadi

| Hodisa | Kim ishga tushiradi |
|---|---|
| Test natijasi | O'quvchi testni topshirganda — avtomatik |
| Darsga kelmadi / kechikdi | Ustoz **Davomat** sahifasidagi tugmani bosganda |
| To'lov eslatmasi | Ustoz **To'lovlar** sahifasidagi tugmani bosganda |

Davomat va to'lov xabarlari ustoz sessiyasini talab qiladi. Agar tugmani
bosganda "🔒 Avval Telegram xabarnomasi bo'limiga kirib parolni kiriting"
chiqsa — 30 kunlik sessiya tugagan, parolni qayta kiriting.

Xabar matni serverda, `api/_lib/messages.js` da yoziladi. Matnni o'zgartirish
uchun o'sha faylni tahrirlang — brauzer faqat raqamlarni yuboradi.

Har bir o'quvchiga kuniga **20 ta** xabar chegarasi bor (`api/_lib/db.js`).

---

## Kim nimaga ruxsatli

| Manzil | Kim chaqira oladi |
|---|---|
| `/api/teacher-session` | Hamma — lekin faqat to'g'ri parol sessiya beradi |
| `/api/link-token` | Faqat ustoz sessiyasi bilan |
| `/api/link-status` | Faqat ustoz sessiyasi bilan |
| `/api/unlink` | Faqat ustoz sessiyasi bilan |
| `/api/notify` (davomat, to'lov) | Faqat ustoz sessiyasi bilan |
| `/api/notify` (test natijasi) | Ochiq — pastdagi izohga qarang |
| `/api/telegram-webhook` | Faqat Telegram (maxfiy sarlavha orqali) |

## Bilib turishingiz kerak bo'lgan zaifliklar

1. **Test natijasi xabari ochiq qolgan.** U o'quvchi brauzeridan avtomatik
   ketadi, brauzerda esa maxfiy kalit saqlab bo'lmaydi (sayt kodi ochiq).
   Shuning uchun texnik bilimi bor odam ulangan ota-onaga soxta ball yubora
   oladi. Zarari chegaralangan: matn serverdagi tayyor shablonlardan yig'iladi,
   kunlik 20 ta limit bor, va soxta ball kelsa ota-ona farzandidan so'raydi.
   Muhimi — **hech kim bola ma'lumotini o'qiy olmaydi**: ulanish faqat ustoz
   orqali. To'liq yechim: natijalarni serverga ko'chirish (3-bosqich).

2. **Parollar ochiq matnda.** Bir o'quvchi boshqasining paroli bilan kirib,
   uning nomidan test topshirishi mumkin. Bu Telegram muammosi emas, saytning
   demo auth tizimi shunday. Xabarnoma jiddiy ishlatila boshlansa, keyingi
   tuzatiladigan narsa shu.

## Ulanishni bekor qilish

Ota-ona botga `/stop` yozsa, bog'lanish o'chadi va xabarlar to'xtaydi.
