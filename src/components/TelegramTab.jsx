import React, { useCallback, useEffect, useState } from 'react';
import { Section, Modal, Pill, EmptyState, formatDateTime } from './shared.jsx';
import { AtomOrbit } from './SubjectArt.jsx';
import {
  getTeacherSession, clearTeacherSession, teacherLogin,
  fetchAllLinks, fetchLinkStatus, requestLinkUrl, unlinkStudent,
} from '../lib/notify.js';

/* ============================================================
   Teacher-only Telegram management.

   Linking moved here from the student panel: nothing in a
   student's browser can prove who they are (the roster is
   seeded into the bundle and each browser holds its own
   localStorage), so the only real credential is a password
   that lives in Vercel and never reaches the frontend.

   Modal state lives up here rather than in the row, matching
   PaymentsTab — a modal rendered inside <tbody> would be a
   <div> in a table.
   ============================================================ */
export default function TelegramTab({ state }) {
  const [authed, setAuthed] = useState(() => Boolean(getTeacherSession()));
  const [links, setLinks] = useState(null); // Map studentId -> { parentName, linkedAt }
  const [status, setStatus] = useState('idle'); // idle | loading | ready | unavailable | error
  const [errorInfo, setErrorInfo] = useState(null);

  const [linkFor, setLinkFor] = useState(null);   // student we just minted a link for
  const [linkUrl, setLinkUrl] = useState('');
  const [justLinked, setJustLinked] = useState(false);
  const [unlinkFor, setUnlinkFor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null); // { id, message }
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const r = await fetchAllLinks();
    if (r.reason === 'no_backend' || r.reason === 'offline') { setStatus('unavailable'); return; }
    if (r.reason === 'auth_required') { setAuthed(false); setStatus('idle'); return; }
    if (!r.ok) { setErrorInfo(r); setStatus('error'); return; }
    setLinks(new Map((r.links || []).map((l) => [l.studentId, l])));
    setStatus('ready');
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  // Poll while the parent is presumably pressing Start, so the row flips on its
  // own. React clears the interval when the modal closes or the tab unmounts.
  useEffect(() => {
    if (!linkFor || justLinked) return undefined;
    const timer = setInterval(async () => {
      const r = await fetchLinkStatus(linkFor.id);
      if (r.linked) { setJustLinked(true); load(); }
    }, 4000);
    return () => clearInterval(timer);
  }, [linkFor, justLinked, load]);

  function logout() {
    clearTeacherSession();
    setAuthed(false);
    setLinks(null);
    setStatus('idle');
  }

  // Any call can come back 401 if the session expired or the password was
  // rotated in Vercel; that must land on the password form, not on a generic
  // "something went wrong".
  function handleExpired() {
    setAuthed(false);
    setStatus('idle');
    setLinkFor(null);
    setUnlinkFor(null);
  }

  async function makeLink(student) {
    setBusyId(student.id);
    setRowError(null);
    const r = await requestLinkUrl(student.id);
    setBusyId(null);

    if (r.reason === 'auth_required') { handleExpired(); return; }
    if (!r.ok || !r.url) {
      setRowError({
        id: student.id,
        message: r.error === 'bot_username_not_set'
          ? "Vercel'da VITE_TELEGRAM_BOT_USERNAME kiritilmagan."
          : "Havola yasab bo'lmadi. Qayta urinib ko'ring.",
      });
      return;
    }
    setLinkUrl(r.url);
    setJustLinked(false);
    setCopied(false);
    setLinkFor(student);
  }

  async function doUnlink() {
    const student = unlinkFor;
    setBusyId(student.id);
    const r = await unlinkStudent(student.id);
    setBusyId(null);
    setUnlinkFor(null);
    if (r.reason === 'auth_required') { handleExpired(); return; }
    if (r.ok) load();
  }

  function copy() {
    navigator.clipboard?.writeText(linkUrl).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
      () => {},
    );
  }

  if (!authed) return <PasswordGate onDone={() => setAuthed(true)} />;

  if (status === 'unavailable') {
    return (
      <Section title="">
        <div className="tg-link">
          <div className="tg-link-icon" aria-hidden="true">⚙️</div>
          <div>
            <b>Telegram serveri hozircha sozlanmagan.</b>
            <p>
              Bu bo'lim Vercel'dagi o'zgaruvchilar kiritilib, sayt qayta deploy qilinganidan
              keyin ishlaydi. Batafsil: <code className="mono">docs/telegram-setup.md</code>
            </p>
          </div>
        </div>
      </Section>
    );
  }

  if (status === 'error') {
    return (
      <Section title="">
        <div className="tg-link">
          <div className="tg-link-icon" aria-hidden="true">⚠️</div>
          <div>
            <b>Serverda xatolik.</b>
            <p>
              {errorInfo?.stage === 'env'
                ? `Vercel'da bu o'zgaruvchilar kiritilmagan: ${(errorInfo.missing || []).join(', ')}`
                : `Bazaga ulanib bo'lmadi${errorInfo?.code ? ` (kod: ${errorInfo.code})` : ''}. supabase/schema.sql ishga tushirilganini tekshiring.`}
            </p>
            <button className="btn btn-sm" onClick={load}>Qayta urinish</button>
          </div>
        </div>
      </Section>
    );
  }

  const linkedCount = state.students.filter((s) => links?.has(s.id)).length;

  return (
    <>
      <Section
        title="Ota-onalar Telegram ulanishi"
        action={<button className="btn btn-sm" onClick={logout}>Chiqish</button>}
      >
        <p className="muted tg-admin-lede">
          Har bir o'quvchi uchun havola yasang va uni ota-onasiga bering. Ota-ona havolani
          bosib "Start" bosgach, xabarlar o'sha yerga kela boshlaydi. Havola 24 soat amal
          qiladi va faqat o'sha o'quvchi uchun ishlaydi.
          {status === 'ready' && (
            <> <b>{state.students.length} ta o'quvchidan {linkedCount} tasining ota-onasi ulangan.</b></>
          )}
        </p>

        {/* 'idle' is the tick between authenticating and the load effect firing. */}
        {status !== 'ready' && <p className="muted">Yuklanmoqda…</p>}

        {status === 'ready' && state.students.length === 0 && (
          <EmptyState art={AtomOrbit} title="O'quvchi yo'q" hint="Avval o'quvchi qo'shing." />
        )}

        {status === 'ready' && state.students.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Holat</th>
                  <th>Ulangan ota-ona</th>
                  <th>Sana</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {state.students.map((s) => {
                  const link = links.get(s.id);
                  return (
                    <tr key={s.id}>
                      <td>{s.fullName}</td>
                      <td>
                        {link ? <Pill kind="paid">Ulangan</Pill> : <Pill kind="flat">Ulanmagan</Pill>}
                      </td>
                      <td>{link?.parentName || <span className="muted">—</span>}</td>
                      <td>{link?.linkedAt ? formatDateTime(link.linkedAt) : <span className="muted">—</span>}</td>
                      <td>
                        <div className="td-actions">
                          <button
                            className="btn btn-sm"
                            onClick={() => makeLink(s)}
                            disabled={busyId === s.id}
                          >
                            {link ? 'Yangi havola' : 'Havola olish'}
                          </button>
                          {link && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setUnlinkFor(s)}
                              disabled={busyId === s.id}
                            >
                              Uzish
                            </button>
                          )}
                        </div>
                        {rowError?.id === s.id && <div className="cell-error">{rowError.message}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal
        open={Boolean(linkFor)}
        onClose={() => setLinkFor(null)}
        title={linkFor ? `${linkFor.fullName} — ota-ona havolasi` : ''}
        actions={<button className="btn" onClick={() => setLinkFor(null)}>Yopish</button>}
      >
        {justLinked ? (
          <div className="tg-link is-linked">
            <div className="tg-link-icon" aria-hidden="true">✅</div>
            <div>
              <b>Ulanish muvaffaqiyatli.</b>
              <p>Endi bu o'quvchining xabarlari ota-onasiga yuboriladi.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.7, marginTop: 0 }}>
              Bu havolani <b>{linkFor?.fullName}</b>ning ota-onasiga bering. U havolani bosib,
              Telegramda "Start" tugmasini bossin.
            </p>
            <div className="tg-link-url">
              <code className="mono">{linkUrl}</code>
              <button type="button" className="btn btn-sm" onClick={copy}>
                {copied ? 'Nusxalandi ✓' : 'Nusxalash'}
              </button>
            </div>
            <div className="tg-link-actions">
              <a
                className="btn btn-primary btn-sm"
                href={`https://t.me/share/url?url=${encodeURIComponent(linkUrl)}&text=${encodeURIComponent('Kurs xabarnomalariga ulanish havolasi')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram orqali yuborish
              </a>
              <span className="tg-link-wait">Ota-ona "Start" bosishini kutmoqdamiz…</span>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(unlinkFor)}
        onClose={() => setUnlinkFor(null)}
        title="Ulanishni uzish"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setUnlinkFor(null)}>Bekor qilish</button>
            <button className="btn btn-danger" onClick={doUnlink} disabled={busyId === unlinkFor?.id}>
              Ha, uzilsin
            </button>
          </>
        }
      >
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          <b>{unlinkFor?.fullName}</b>ning ota-onasi
          {' '}({links?.get(unlinkFor?.id)?.parentName || "noma'lum"}) endi xabar olmaydi.
          Qayta ulash uchun unga yangi havola berishingiz kerak bo'ladi.
        </p>
      </Modal>
    </>
  );
}

/* ---------------- password gate ---------------- */

function PasswordGate({ onDone }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    const r = await teacherLogin(password);
    setBusy(false);

    if (r.ok && r.token) { setPassword(''); onDone(); return; }

    if (r.reason === 'no_backend' || r.reason === 'offline') {
      setError("Server javob bermayapti. Sayt Vercel'ga deploy qilinganini tekshiring.");
    } else if (r.error === 'password_not_set') {
      setError("Vercel'da TEACHER_PANEL_PASSWORD o'zgaruvchisi kiritilmagan. docs/telegram-setup.md ga qarang.");
    } else if (r.error === 'password_too_short') {
      setError("Vercel'dagi TEACHER_PANEL_PASSWORD juda qisqa — kamida 12 ta belgi bo'lishi kerak.");
    } else if (r.error === 'too_many_tries') {
      setError("Juda ko'p urinish bo'ldi. 10 daqiqadan keyin qayta urinib ko'ring.");
    } else {
      setError("Parol noto'g'ri.");
    }
  }

  return (
    <Section title="">
      <form className="tg-gate" onSubmit={submit}>
        <div className="tg-gate-icon" aria-hidden="true">🔒</div>
        <h2>Telegram boshqaruvi</h2>
        <p className="muted">
          Bu bo'lim ota-onalarni botga ulash va ularga xabar yuborish uchun. Ochish uchun
          Vercel'da o'rnatilgan maxsus parolni kiriting — bu saytga kirish parolingiz emas.
        </p>
        <div className="field">
          <div className="field-inner">
            <label>Telegram bo'limi paroli</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••••••"
            />
          </div>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy || !password}>
          {busy ? 'Tekshirilmoqda…' : 'Kirish'}
        </button>
        <p className="tg-gate-foot muted">Parol 30 kun eslab qolinadi.</p>
      </form>
    </Section>
  );
}
