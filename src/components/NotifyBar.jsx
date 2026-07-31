import React, { useState } from 'react';

/* ============================================================
   "Send to parents" bar. Nothing is ever sent automatically —
   the teacher reviews the list first and presses the button,
   so a mis-click on the register can still be corrected.
   ============================================================ */
export default function NotifyBar({ title, hint, recipients, send }) {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);

  const count = recipients.length;

  async function run() {
    setBusy(true);
    setReport(null);
    let sent = 0;
    let notLinked = 0;
    let failed = 0;

    // Sequential on purpose: Telegram rate-limits bursts, and a course-sized
    // list is short enough that the wait is not worth parallelising.
    for (const item of recipients) {
      try {
        const r = await send(item);
        if (r?.sent) sent += 1;
        else if (r?.reason === 'not_linked') notLinked += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }

    setBusy(false);
    setReport({ sent, notLinked, failed });
  }

  return (
    <div className="notify-bar">
      <div className="notify-bar-text">
        <b>{title}</b>
        <span>{count === 0 ? 'Yuboriladigan xabar yo‘q.' : hint}</span>
        {report && (
          <span className="notify-bar-report">
            {report.sent > 0 && <>✅ {report.sent} ta yuborildi. </>}
            {report.notLinked > 0 && <>⚪ {report.notLinked} ta ota-ona Telegramga ulanmagan. </>}
            {report.failed > 0 && <>⚠️ {report.failed} ta yuborilmadi. </>}
          </span>
        )}
      </div>
      <button
        className="btn btn-primary"
        onClick={run}
        disabled={busy || count === 0}
      >
        {busy ? 'Yuborilmoqda…' : `Ota-onalarga yuborish (${count})`}
      </button>
    </div>
  );
}
