import { webhookCallback } from 'grammy';
import { bot } from '@/lib/bot';

// Vercel/Next.js dynamic config
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!bot) {
    return new Response('Telegram Bot Token not configured', { status: 500 });
  }

  try {
    // grammy webhookcallback funksiyasi Next.js standarti bo'yicha so'rovlarni boshqaradi
    const handler = webhookCallback(bot, 'std/http');
    return await handler(req);
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
