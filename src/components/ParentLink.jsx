import React, { useCallback, useEffect, useRef, useState } from 'react';
import { requestLinkUrl, fetchLinkStatus } from '../lib/notify.js';

/* ============================================================
   Telegram linking. A bot cannot message someone who has never
   pressed Start, so the parent has to open a deep link once —
   there is no way to reach them from a phone number alone.
   ============================================================ */
export default function ParentLink({ student, onLinked }) {
  const [state, setState] = useState('idle'); // idle | loading | ready | linked | unavailable
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // Check once on mount: the parent may have linked from another device.
  useEffect(() => {
    let alive = true;
    fetchLinkStatus(student.id).then((r) => {
      if (!alive) return;
      if (r.reason === 'no_backend' || r.reason === 'offline') setState('unavailable');
      else if (r.linked) { setState('linked'); onLinked?.(r); }
    });
    return () => { alive = false; stopPolling(); };
  }, [student.id, onLinked, stopPolling]);

  async function start() {
    setState('loading');
    const r = await requestLinkUrl(student.id);
    if (!r.ok || !r.url) { setState('unavailable'); return; }
    setUrl(r.url);
    setState('ready');

    // Poll while the parent is presumably pressing Start. Stops on success and
    // on unmount; nothing keeps running once the page is closed.
    stopPolling();
    pollRef.current = setInterval(async () => {
      const s = await fetchLinkStatus(student.id);
      if (s.linked) { stopPolling(); setState('linked'); onLinked?.(s); }
    }, 4000);
  }

  function copy() {
    navigator.clipboard?.writeText(url).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
      () => {},
    );
  }

  if (state === 'linked') {
    return (
      <div className="tg-link is-linked">
        <div className="tg-link-icon" aria-hidden="true">✅</div>
        <div>
          <b>Ota-onangiz Telegramga ulangan.</b>
          <p>Test natijalari, davomat va to'lov eslatmalari o'sha yerga yuboriladi.</p>
        </div>
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div className="tg-link">
        <div className="tg-link-icon" aria-hidden="true">⚙️</div>
        <div>
          <b>Telegram ulanishi hozircha ishlamayapti.</b>
          <p>
            Bu funksiya server sozlanganidan keyin ishlaydi. Ota-ona ma'lumotlaringiz
            saqlangan — ustozingiz ularni ko'rib turadi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-link">
      <div className="tg-link-icon" aria-hidden="true">📨</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <b>Ota-onangizni Telegramga ulang</b>
        <p>
          Telegram boti faqat "Start" bosgan odamga yoza oladi. Quyidagi havolani
          ota-onangizga yuboring — u bosib, "Start" tugmasini bossin. Havola 24 soat amal qiladi.
        </p>

        {state !== 'ready' ? (
          <button className="btn btn-primary" onClick={start} disabled={state === 'loading'}>
            {state === 'loading' ? 'Tayyorlanmoqda…' : 'Havola olish'}
          </button>
        ) : (
          <>
            <div className="tg-link-url">
              <code className="mono">{url}</code>
              <button type="button" className="btn btn-sm" onClick={copy}>
                {copied ? 'Nusxalandi ✓' : 'Nusxalash'}
              </button>
            </div>
            <div className="tg-link-actions">
              <a
                className="btn btn-primary btn-sm"
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Kurs natijalarim uchun ulanish havolasi')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram orqali yuborish
              </a>
              <span className="tg-link-wait">Ota-onangiz "Start" bosishini kutmoqdamiz…</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
