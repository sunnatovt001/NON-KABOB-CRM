import { bot } from '../src/lib/bot';
import dotenv from 'dotenv';
import path from 'path';

// .env faylni yuklash
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function startPolling() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN topilmadi. Iltimos, .env faylini tekshiring.');
    process.exit(1);
  }

  if (!bot) {
    console.error('❌ Bot obyektini initsializatsiya qilishda xatolik.');
    process.exit(1);
  }

  console.log('🤖 NON-KABOB Telegram Bot long polling rejimida ishga tushmoqda...');
  
  bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot muvaffaqiyatli ishga tushdi! @${botInfo.username}`);
    },
  });
}

startPolling().catch((err) => {
  console.error('Bot running error:', err);
});
