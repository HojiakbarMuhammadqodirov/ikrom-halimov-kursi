# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Ikrom Halimov kursi** — a course-management SPA for a Physics & Mathematics tutoring course. Three roles (admin / teacher / student), each with its own panel. It is a **self-contained frontend demo**: there is no backend and none is wanted. All data lives in `localStorage`.

- **All UI text is Uzbek (Latin).** Never introduce English or Russian strings into the interface. Code, comments, and commit messages stay in English.
- Apostrophes in Uzbek words (`o'quvchi`, `to'lov`, `bo'lim`) are typed as `'` in JSX strings — escape them (`'o\'quvchi'`) or use double quotes.

## Stack

React 18 · Vite 5 · Recharts 2 · plain CSS (one stylesheet). No TypeScript, no router, no state library, no test runner, no linter.

## Commands

```bash
npm install
npm run dev       # Vite dev server on :5173, opens the browser
npm run build     # production build → dist/
npm run preview   # serve the built output
```

There are **no tests and no lint step**. Verification = `npm run build` must succeed, then check the affected screens in `npm run dev` for all relevant roles.

Deploys to Vercel as a static site (`vercel.json` — Vite framework preset, SPA rewrite to `/index.html`).

## Architecture

### One state object, one localStorage key

`src/data/seed.js` exports `initialState` — the entire app's data shape:

```
users, students, teacher, admin, questions, tests, testResults,
attendance, payments, materials, settings, topics, subjects
```

`src/data/storage.js` loads/saves that object under the key **`ikrom-kursi-v3`**. On load it shallow-merges over `initialState` (with `settings` merged one level deeper) so newly-added fields never crash stale saved data. **If you add a top-level array or a `settings` key, that merge already covers it; if you change the shape of an existing array's items, bump the key to `v3`** — there is no migration layer.

`App.jsx` holds the whole state in one `useState` and persists it on every change:

```js
useEffect(() => { saveState(state); }, [state]);
```

So every mutation is just a `setState` with a fresh object. Always use the updater form and spread:

```js
setState((s) => ({ ...s, tests: [...s.tests, test] }));
```

Never mutate `state` in place — nothing else will re-render, and the persist effect won't fire.

### Routing: none

There is no router. Navigation is local component state:

- `App.jsx` picks the panel by `user.role`.
- Each panel holds `const [page, setPage] = useState(null)`; `null` is the dashboard of nav cards, and each sub-page is an early `return` guarded by `if (page === 'x')`, wrapped in `<Page title backLabel onBack={() => setPage(null)} />`.
- Detail views are a second piece of state checked *before* `page` (`viewStudentId` / `selectedStudentId` in the teacher & admin panels, `runningTestId` in the student panel).

Add a new screen by adding a `NavCard` on the dashboard plus one more `if (page === '…')` block. Keep the `<Header … state={state} />` line on every branch — the notification bell needs `state`.

### Auth

`src/lib/auth.js`. Login matches username (case-insensitive) + **plaintext password** against `state.users` and writes the user id to `localStorage` key `ikrom-kursi-session`. This is a demo — plaintext passwords are shown in the admin table and on the login screen on purpose. Do not add hashing, token auth, or a "security fix" unless asked.

Note `auth.js` calls `loadState()`/`saveState()` directly, bypassing React state. `updateUserPassword` is therefore always paired with a matching `setState` in the caller (see `AdminPanel.jsx` `resetPassword`).

### Users vs students — the main data gotcha

A student exists in **two arrays**: `state.users` (for login) and `state.students` (for the roster), as the *same* object shape. Any add / remove / password change must touch both:

```js
setState((s) => ({
  ...s,
  students: s.students.filter((x) => x.id !== id),
  users:    s.users.filter((u) => u.id !== id),
}));
```

Adding a student also needs a `payments` row (see `AddStudentForm`). The teacher and admin are in `users` plus their own singleton fields (`state.teacher`, `state.admin`).

### Parent contact and the test gate

Students carry `parentName` / `parentRelation` / `parentPhone` / `parentAddedAt`. All the rules live in `src/lib/parent.js` — never re-implement them inline:

- `hasParentContact(student)` — name present + `isValidUzPhone(parentPhone)`.
- `canTakeTests(student)` — the gate. A student with no parent contact cannot open a test; `StudentPanel` shows `.parent-gate` instead of the test grid and guards `runningTestId` as well.
- `isParentLockedForStudent(student)` — true once `parentAddedAt` is set. **The student fills the contact in exactly once**; after that only the teacher (`StudentsTab` modal) or admin can change it, so a bad result can't be hidden by swapping the number.
- Phones are stored normalized as `+998 90 123 45 67` via `normalizePhone`.

`REQUIRE_TELEGRAM_FOR_TESTS` in `parent.js` is the switch that also demands a linked Telegram parent before tests open. It is **off**: turning it on locks out every student whose parent has not pressed Start, which they cannot do alone.

## Telegram notifications (the only backend)

Setup and operational notes live in `docs/telegram-setup.md`. Read it before touching `api/`.

Four Vercel serverless functions under `api/`, plus `api/_lib/` helpers (the `_` prefix keeps them off the routing table):

- `link-token.js` — mints the `t.me/<bot>?start=<token>` deep link. Tokens are **HMAC-signed and self-expiring**, never stored (`_lib/token.js`), so linking needs no token table.
- `telegram-webhook.js` — handles `/start <token>` and `/stop`. Guarded by the `X-Telegram-Bot-Api-Secret-Token` header. **Always returns 200**, even on failure, or Telegram retries the same update for hours.
- `link-status.js` — the page polls this; returns a boolean, never the `chat_id`.
- `notify.js` — sends one templated message.

Rules that matter:

- **Message text is built server-side** in `_lib/messages.js` from a fixed set of kinds. The browser sends only `{studentId, studentName, kind, payload}`. Never let the client supply the text — `/api/notify` has no session and is callable by anyone reading the frontend source.
- The service-role key is read only in `api/_lib/db.js`. Never name a secret `VITE_*` — Vite inlines those into the bundle.
- `src/lib/notify.js` is fire-and-forget: every call resolves to a reason string instead of throwing, so a missing backend never blocks a test submission or an attendance save. It detects "no backend" by checking the response content-type, because the SPA rewrite returns `index.html` with a 200 under plain `vite dev`.
- The `vercel.json` rewrite excludes `/api/` (`"/((?!api/).*)"`). Restoring the old catch-all silently breaks every endpoint.
- Notifications for attendance and payments are **teacher-triggered** (`NotifyBar`), never automatic — a mis-click on the register stays correctable. Test results are the one automatic send.

### Files

```
src/
  main.jsx                  React entry
  App.jsx                   session + theme + state owner, role → panel
  styles.css                the entire design system (~1600 lines, sectioned by banner comments)
  data/
    seed.js                 SUBJECTS, deterministic demo data (mulberry32 PRNG), initialState
    storage.js              load/save/reset against ikrom-kursi-v2
  lib/
    auth.js                 login / logout / currentUser / updateUserPassword
    tests.js                test availability + grading (shared by teacher, student, runner)
    parent.js               parent-contact validation, phone formatting, the test gate
  components/
    Login.jsx               split editorial login, demo-account quick-fill
    AdminPanel.jsx          overview · students · teachers · settings
    TeacherPanel.jsx        attendance · testbank · results · payments · students
    StudentPanel.jsx        home · tests · materials · payment
    StudentDetail.jsx       per-student profile; the only Recharts consumer
    TestBuilder.jsx         teacher creates a test (params phase → questions phase)
    TestRunner.jsx          student takes a test (quiz → review → done)
    TestResultsView.jsx     per-test attempts table for the teacher
    ParentContact.jsx       parent-contact form + summary (student page & teacher modal)
    SubjectArt.jsx          decorative inline SVG (AtomOrbit, RulerCompass, …)
    shared.jsx              Header, Page, NavCard, Section, Stat, Pill, Select, Modal,
                            SubjectChip, ProgressBar, Sparkline, HeaderTimer,
                            NotificationBell, getNotifications, formatters
```

`shared.jsx` is the component library — **look there before writing a new primitive**, and put genuinely reusable ones there rather than in a panel.

### Test open/closed and grading

All of it lives in `src/lib/tests.js`; never re-implement it inline.

- `isTestOpen(test)` — `manualOpen` (teacher's explicit override) wins over `availability` (`immediate` | `scheduled` | `closed`); `scheduled` compares `openAt` to now.
- `testStatus(test)` → `{ key, label, tone }` for badges.
- Question types: `single` (4 options), `truefalse`, `multi`. `single`/`truefalse` store one index in `q.answer`; `multi` stores a sorted index array in `q.answers`. `questionType(q)` defaults to `single` for the seed questions, which have no `type` field.
- `gradeQuestion` / `scoreTest` / `isAnswered` / `formatAnswer` / `correctIndices` handle both shapes. Use them.

Questions live in a **flat `state.questions` array**; a test references them by `test.questionIds`. Resolve them with the `map(...).filter(Boolean)` pattern used in `TestRunner` and `TestResultsView` so a dangling id can't crash the screen.

`TestRunner` has a 20-minute timer (`TEST_MINUTES`) that auto-submits at zero, guarded by `submittedRef` so a timeout and a manual submit can't double-record a result.

## Design system

Defined entirely by CSS custom properties at the top of `styles.css`, with a `[data-theme="dark"]` block overriding the same names. `App.jsx` sets `data-theme` on `<html>` and stores it under `ikrom-kursi-theme`.

**Rules — these were deliberate choices, don't drift from them:**

- Neutral canvas `#fafafa` / ink `#17181c`, **one brand accent: emerald `#0f9d76`**. Indigo `--matem` exists *only* to separate the two subjects on charts and chips.
- Plus Jakarta Sans for everything; JetBrains Mono (`.mono`) for numbers, codes, logins. **No serif headings** — the old Fraunces/terracotta editorial theme was removed.
- 1px hairline borders (`--line`), radii 8–16px, ultra-diffuse low-opacity shadows. No heavy shadows, no gradients, no dark mid-page sections.
- Both mobile (students) and desktop (teacher/admin) are first-class. Breakpoints in use: 480 / 640 / 768 / 900 / 1024px.
- Use the tokens (`var(--ink-soft)`, `var(--ok)`, `var(--r-card)`, `var(--ease)`) — never hardcode a hex in a component.
- Motion respects `prefers-reduced-motion` (block at `styles.css:156`); keep new animations inside it.

Inline `style={{}}` is used for one-off layout nudges, which matches the existing code. Anything reusable belongs in `styles.css` under the right banner section.

## Conventions

- `.jsx` for components, `.js` for logic; always include the extension in imports (`'./shared.jsx'`).
- Default export = the screen/panel; named local sub-components (`function StudentsTab(…)`) below it in the same file. Panels are large single files on purpose.
- `useMemo` for derived lists and aggregates over `state` — the whole tree re-renders on every state change.
- Money via `formatMoney` (so'm), dates via `formatDate` / `formatDateTime` (`uz-UZ` locale) from `shared.jsx`.
- Dates are stored as **ISO strings**, never `Date` objects — they must survive the JSON round-trip through localStorage (`settings.nextTestDate` is a full ISO string; attendance and payment dates are `YYYY-MM-DD` slices).
- Ids are prefixed and generated with `Date.now()`: `s-`, `p-`, `t-`, `r-`, `q-`, `u-`.
- Comments explain *why* (see `storage.js`, `tests.js`) — match that density, not line-by-line narration.

## Don't

- Don't add a backend beyond the four Telegram endpoints in `api/` — the app is still localStorage-first and must keep working with the backend absent.
- Don't add TypeScript, a router, Redux/Zustand, Tailwind, or a UI kit.
- Don't reintroduce serif headings, the cream/terracotta palette, or a second accent colour.
- Don't translate the UI out of Uzbek.
- Don't touch `dist/` — it is generated by `npm run build` and gitignored.
- Note `README.md`'s "Dizayn" section still describes the **old** cream/terracotta theme; `styles.css` is the source of truth.

## Demo accounts

| Role | Login | Password |
|------|-------|----------|
| Admin | `admincourse` | `admincourse2026` |
| Teacher | `IkromjonHalimov` | `HalimovTeacher123` |
| Student | `ali.akbarov` | `ali.akbarov2026` |

Seeded students follow `username + '2026'`. Seeded students have **no parent contact**, so logging in as one lands on the parent-contact gate — that is intentional, not a bug. To reset everything: DevTools → Application → Local Storage → delete `ikrom-kursi-v3` (and `ikrom-kursi-session` / `ikrom-kursi-theme`).
