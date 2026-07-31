export function botToken() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return t;
}

export async function sendMessage(chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!data || !data.ok) {
    throw new Error(`Telegram sendMessage failed: ${data ? JSON.stringify(data).slice(0, 300) : res.status}`);
  }
  return data.result;
}

// Telegram renders a small HTML subset; anything else in user-supplied text
// (a student's name, a test title) has to be escaped or the whole message is
// rejected with a 400.
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
