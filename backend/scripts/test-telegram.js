const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const env = {};

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
    continue;
  }

  const index = trimmed.indexOf('=');
  const key = trimmed.slice(0, index).trim();
  const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = value;
}

const token = env.TELEGRAM_BOT_TOKEN;
const chatId = env.TELEGRAM_ADMIN_CHAT;

if (!token || !chatId) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT in backend/.env');
  process.exit(1);
}

const telegram = async (method, body) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
};

(async () => {
  const me = await telegram('getMe');
  console.log('getMe:', me.ok ? `ok (@${me.result.username})` : `failed (${me.description})`);

  const message = await telegram('sendMessage', {
    chat_id: chatId,
    text: 'Tech Nova test notification',
  });
  console.log('sendMessage:', message.ok ? 'ok' : `failed (${message.description})`);
})().catch((error) => {
  console.error('Telegram test failed:', error.message);
  process.exit(1);
});
