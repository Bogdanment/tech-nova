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

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in backend/.env');
  process.exit(1);
}

(async () => {
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await response.json();

  if (!data.ok) {
    console.error(`getUpdates failed: ${data.description}`);
    process.exit(1);
  }

  const chats = new Map();
  for (const update of data.result) {
    const chat = update.message?.chat || update.channel_post?.chat || update.my_chat_member?.chat;
    if (chat) {
      chats.set(chat.id, chat);
    }
  }

  if (chats.size === 0) {
    console.log('No chats found. Send /start to the bot, then run this script again.');
    return;
  }

  for (const chat of chats.values()) {
    const name = [chat.title, chat.username ? `@${chat.username}` : '', chat.first_name, chat.last_name]
      .filter(Boolean)
      .join(' ');
    console.log(`chat_id=${chat.id} type=${chat.type} name=${name || '(no name)'}`);
  }
})().catch((error) => {
  console.error(`getUpdates failed: ${error.message}`);
  process.exit(1);
});
