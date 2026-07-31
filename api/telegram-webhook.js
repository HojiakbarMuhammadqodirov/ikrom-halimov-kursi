import { readLinkToken } from './_lib/token.js';
import { upsertLink, removeLink, getLink } from './_lib/db.js';
import { sendMessage } from './_lib/telegram.js';
import { WELCOME, ALREADY_LINKED, BAD_TOKEN, NEED_LINK, STOPPED } from './_lib/messages.js';

// Telegram calls this. The URL is public, so the only thing keeping strangers
// out is the secret header set when the webhook was registered — see
// scripts/set-webhook.md.
//
// Always answer 200: a non-2xx makes Telegram retry the same update for hours.
// Failures are logged and swallowed instead.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || req.headers['x-telegram-bot-api-secret-token'] !== expected) {
    return res.status(401).json({ error: 'bad_secret' });
  }

  try {
    const msg = req.body?.message;
    const chatId = msg?.chat?.id;
    const text = (msg?.text || '').trim();
    if (!chatId || !text) return res.status(200).json({ ok: true });

    if (text === '/stop') {
      await removeLink(chatId);
      await sendMessage(chatId, STOPPED);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/start')) {
      const payload = text.slice('/start'.length).trim();
      if (!payload) {
        await sendMessage(chatId, NEED_LINK);
        return res.status(200).json({ ok: true });
      }

      const studentId = readLinkToken(payload);
      if (!studentId) {
        await sendMessage(chatId, BAD_TOKEN);
        return res.status(200).json({ ok: true });
      }

      const existing = await getLink(studentId);
      if (existing && String(existing.chat_id) === String(chatId)) {
        await sendMessage(chatId, ALREADY_LINKED);
        return res.status(200).json({ ok: true });
      }

      const parentName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ');
      await upsertLink(studentId, chatId, parentName);
      await sendMessage(chatId, WELCOME);
      return res.status(200).json({ ok: true });
    }

    // One-way bot: anything else gets a single nudge, no conversation.
    await sendMessage(chatId, NEED_LINK);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(200).json({ ok: true });
  }
}
