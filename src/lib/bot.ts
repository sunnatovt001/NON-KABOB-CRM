import { Bot, Context, session, SessionFlavor, InlineKeyboard, Keyboard } from 'grammy';
import { prisma } from './prisma';

// ─── Sessiya ma'lumotlari interfeysi ──────────────────────────────────────────
interface SessionData {
  step: 'START' | 'ASK_NAME' | 'ASK_PHONE' | 'SHOPPING' | 'ASK_LOCATION' | 'CONFIRM';
  phone?: string;
  firstName?: string;
  lastName?: string;
  cart: Record<string, number>; // menuItemId -> quantity
  address?: string;
}

// Bot Context turi
export type MyContext = Context & SessionFlavor<SessionData>;

// Bot obyektini faqat token mavjud bo'lganda yaratamiz (Next.js build vaqtida xatolik bermasligi uchun)
const token = process.env.TELEGRAM_BOT_TOKEN;
export const bot = token ? new Bot<MyContext>(token) : null;

// Initial sessiya holati
function initialSession(): SessionData {
  return {
    step: 'START',
    cart: {},
  };
}

if (bot) {
  // Sessiya middleware-ni ulash
  bot.use(
    session({
      initial: initialSession,
    })
  );

  // ─── 1. START BUYRUG'I & RO'YXATDAN O'TISH ──────────────────────────────────
  bot.command('start', async (ctx) => {
    ctx.session = initialSession();
    ctx.session.step = 'ASK_NAME';
    await ctx.reply(
      "🇺🇿 Assalomu alaykum! NON-KABOB milliy fast-food botiga xush kelibsiz!\n\n" +
      "\"Sifat biz uchun Foydadan muhim!\"\n\n" +
      "Buyurtma berish uchun ismingizni kiriting:"
    );
  });

  // Ismni qabul qilish va telefon raqam so'rash
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'ASK_NAME') {
      ctx.session.firstName = ctx.message.text;
      ctx.session.step = 'ASK_PHONE';
      
      const phoneKeyboard = new Keyboard()
        .requestContact("📱 Telefon raqamni yuborish")
        .oneTime()
        .resized();

      await ctx.reply(
        `Rahmat, ${ctx.session.firstName}! Endi pastdagi tugmani bosish orqali telefon raqamingizni ulashing:`,
        { reply_markup: phoneKeyboard }
      );
      return;
    }
    await next();
  });

  // Kontakni qabul qilish va ro'yxatdan o'tkazish
  bot.on('message:contact', async (ctx) => {
    if (ctx.session.step === 'ASK_PHONE') {
      const contact = ctx.message.contact;
      let rawPhone = contact.phone_number;
      if (!rawPhone.startsWith('+')) {
        rawPhone = '+' + rawPhone;
      }
      ctx.session.phone = rawPhone;
      ctx.session.lastName = contact.last_name || undefined;

      try {
        // Bazada bunday telefonli mijoz bor-yo'qligini tekshirish
        let customer = await prisma.customer.findUnique({
          where: { phone: rawPhone },
        });

        if (!customer) {
          // Yangi mijoz yaratish
          customer = await prisma.customer.create({
            data: {
              firstName: ctx.session.firstName || contact.first_name,
              lastName: contact.last_name || null,
              phone: rawPhone,
              cashback: 0,
              totalSpent: 0,
            },
          });
          await ctx.reply("🎉 Muvaffaqiyatli ro'yxatdan o'tdingiz va 5% keshbek balansiga ega bo'ldingiz!");
        } else {
          await ctx.reply(`Qaytganingizdan xursandmiz, ${customer.firstName}! Sizning keshbek balansingiz: ${new Intl.NumberFormat('uz-UZ').format(customer.cashback)} so'm.`);
        }

        ctx.session.step = 'SHOPPING';
        await sendMenu(ctx);
      } catch (err) {
        console.error('Customer registration error:', err);
        await ctx.reply("Tizimda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring /start");
      }
    }
  });

  // ─── 2. MENYU VA SAVATCHANI BOSHQARISH ──────────────────────────────────────
  
  async function sendMenu(ctx: MyContext) {
    try {
      const items = await prisma.menuItem.findMany({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      });

      if (items.length === 0) {
        await ctx.reply("Hozircha menyu bo'sh.");
        return;
      }

      let text = "🍽️ **NON-KABOB Menyusi:**\n\n";
      const keyboard = new InlineKeyboard();

      items.forEach((item) => {
        const qty = ctx.session.cart[item.id] || 0;
        const qtyText = qty > 0 ? ` [${qty} ta]` : '';
        text += `${item.nameUz} - ${new Intl.NumberFormat('uz-UZ').format(item.price)} so'm${qtyText}\n`;
        
        keyboard
          .text(`➕ ${item.nameUz}`, `add:${item.id}`)
          .text(`➖`, `remove:${item.id}`)
          .row();
      });

      keyboard.row().text("🛒 Savatchani ko'rish", "view_cart");

      await ctx.reply(text, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("Menyuni yuklashda xatolik yuz berdi.");
    }
  }

  // Callback query-larni qayta ishlash
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('add:')) {
      const id = data.split(':')[1];
      ctx.session.cart[id] = (ctx.session.cart[id] || 0) + 1;
      await ctx.answerCallbackQuery({ text: "Savatchaga qo'shildi!" });
      await updateMenuMessage(ctx);
    } else if (data.startsWith('remove:')) {
      const id = data.split(':')[1];
      if (ctx.session.cart[id] && ctx.session.cart[id] > 0) {
        ctx.session.cart[id]--;
        if (ctx.session.cart[id] === 0) {
          delete ctx.session.cart[id];
        }
        await ctx.answerCallbackQuery({ text: "Savatchadan olib tashlandi" });
        await updateMenuMessage(ctx);
      } else {
        await ctx.answerCallbackQuery({ text: "Savatchada ushbu taom yo'q!" });
      }
    } else if (data === 'view_cart') {
      await sendCart(ctx);
    } else if (data === 'checkout') {
      await requestLocation(ctx);
    } else if (data === 'cancel_order') {
      ctx.session.cart = {};
      ctx.session.step = 'SHOPPING';
      await ctx.reply("❌ Buyurtmangiz bekor qilindi.", {
        reply_markup: { remove_keyboard: true }
      });
      await sendMenu(ctx);
    } else if (data === 'confirm_order') {
      await createOrderInDb(ctx);
    }
  });

  async function updateMenuMessage(ctx: MyContext) {
    try {
      const items = await prisma.menuItem.findMany({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      });

      let text = "🍽️ **NON-KABOB Menyusi:**\n\n";
      const keyboard = new InlineKeyboard();

      items.forEach((item) => {
        const qty = ctx.session.cart[item.id] || 0;
        const qtyText = qty > 0 ? ` [${qty} ta]` : '';
        text += `${item.nameUz} - ${new Intl.NumberFormat('uz-UZ').format(item.price)} so'm${qtyText}\n`;
        
        keyboard
          .text(`➕ ${item.nameUz}`, `add:${item.id}`)
          .text(`➖`, `remove:${item.id}`)
          .row();
      });

      keyboard.row().text("🛒 Savatchani ko'rish", "view_cart");

      // Xabarni tahrirlash
      await ctx.editMessageText(text, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      // Ba'zida tarkib o'zgarmasa xato berishi mumkin, uni e'tiborsiz qoldiramiz
      console.log('Update menu text failed/no change');
    }
  }

  async function sendCart(ctx: MyContext) {
    const cartKeys = Object.keys(ctx.session.cart);
    if (cartKeys.length === 0) {
      await ctx.reply("Savatchangiz bo'sh. Iltimos, menyudan taom tanlang.");
      return;
    }

    try {
      const items = await prisma.menuItem.findMany({
        where: { id: { in: cartKeys } },
      });

      let text = "🛒 **Savatchangiz tarkibi:**\n\n";
      let total = 0;

      items.forEach((item) => {
        const qty = ctx.session.cart[item.id];
        const cost = item.price * qty;
        total += cost;
        text += `• ${item.nameUz} x ${qty} = ${new Intl.NumberFormat('uz-UZ').format(cost)} so'm\n`;
      });

      text += `\n**Jami summa: ${new Intl.NumberFormat('uz-UZ').format(total)} so'm**`;

      const keyboard = new InlineKeyboard()
        .text("🛍️ Xaridni davom ettirish", "view_menu")
        .row()
        .text("✅ Buyurtma berish", "checkout");

      await ctx.reply(text, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("Savatchani ochishda xatolik yuz berdi.");
    }
  }

  bot.callbackQuery('view_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendMenu(ctx);
  });

  // ─── 3. LOKATSIYA VA MANZIL ───────────────────────────────────────────────
  
  async function requestLocation(ctx: MyContext) {
    ctx.session.step = 'ASK_LOCATION';
    
    const locationKeyboard = new Keyboard()
      .requestLocation("📍 Lokatsiyani yuborish")
      .row()
      .text("❌ Bekor qilish")
      .resized()
      .oneTime();

    await ctx.reply(
      "📍 Yetkazib berish manzilini aniqlash uchun pastdagi tugma orqali lokatsiyangizni yuboring yoki yozma ravishda manzilni kiriting:",
      { reply_markup: locationKeyboard }
    );
  }

  // Lokatsiya yoki matnli manzilni qabul qilish
  bot.on('message:location', async (ctx) => {
    if (ctx.session.step === 'ASK_LOCATION') {
      const loc = ctx.message.location;
      ctx.session.address = `Lokatsiya: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
      await showOrderConfirmation(ctx);
    }
  });

  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.step === 'ASK_LOCATION') {
      if (ctx.message.text === "❌ Bekor qilish") {
        ctx.session.cart = {};
        ctx.session.step = 'SHOPPING';
        await ctx.reply("❌ Buyurtma bekor qilindi.", {
          reply_markup: { remove_keyboard: true }
        });
        await sendMenu(ctx);
        return;
      }
      ctx.session.address = ctx.message.text;
      await showOrderConfirmation(ctx);
      return;
    }
    await next();
  });

  // ─── 4. BUYURTMANI TASDIQLASH VA BAZAGA YOZISH ────────────────────────────
  
  async function showOrderConfirmation(ctx: MyContext) {
    ctx.session.step = 'CONFIRM';
    const cartKeys = Object.keys(ctx.session.cart);

    try {
      const items = await prisma.menuItem.findMany({
        where: { id: { in: cartKeys } },
      });

      let text = "📝 **Buyurtmani tasdiqlang:**\n\n";
      let total = 0;

      items.forEach((item) => {
        const qty = ctx.session.cart[item.id];
        const cost = item.price * qty;
        total += cost;
        text += `• ${item.nameUz} x ${qty} = ${new Intl.NumberFormat('uz-UZ').format(cost)} so'm\n`;
      });

      text += `\n📍 **Manzil:** ${ctx.session.address}`;
      text += `\n💰 **Jami:** ${new Intl.NumberFormat('uz-UZ').format(total)} so'm`;
      text += `\n🎁 **Keshbek (5%):** ${new Intl.NumberFormat('uz-UZ').format(Math.floor(total * 0.05))} so'm`;

      const keyboard = new InlineKeyboard()
        .text("🚀 Buyurtmani tasdiqlash", "confirm_order")
        .row()
        .text("❌ Bekor qilish", "cancel_order");

      await ctx.reply(text, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("Tasdiqlash oynasini tayyorlashda xatolik yuz berdi.");
    }
  }

  async function createOrderInDb(ctx: MyContext) {
    if (!ctx.session.phone) {
      await ctx.reply("Xatolik: Telefon raqami aniqlanmadi. Iltimos, /start buyrug'ini bosing.");
      return;
    }

    const cartKeys = Object.keys(ctx.session.cart);
    if (cartKeys.length === 0) {
      await ctx.reply("Savatchangiz bo'sh.");
      return;
    }

    try {
      // Mijozni topish
      const customer = await prisma.customer.findUnique({
        where: { phone: ctx.session.phone },
      });

      if (!customer) {
        await ctx.reply("Mijoz topilmadi. Qayta ro'yxatdan o'ting /start");
        return;
      }

      // Taomlarni olish
      const items = await prisma.menuItem.findMany({
        where: { id: { in: cartKeys } },
      });

      let totalAmount = 0;
      const orderItemsData = items.map((item) => {
        const qty = ctx.session.cart[item.id];
        totalAmount += item.price * qty;
        return {
          menuItemId: item.id,
          quantity: qty,
          price: item.price,
        };
      });

      const cashbackEarned = Math.floor(totalAmount * 0.05);

      // Buyurtmani qaysidir ochiq filialga yo'naltirish (masalan birinchisi)
      const openBranches = await prisma.branch.findMany({
        where: { isOpen: true },
      });
      const branch = openBranches[0] || await prisma.branch.findFirst();

      if (!branch) {
        await ctx.reply("Hozirda barcha filiallar yopiq. Kechirasiz!");
        return;
      }

      // Buyurtma raqamini yaratish (oxirgi buyurtma raqamidan +1)
      const lastOrder = await prisma.order.findFirst({
        orderBy: { orderNumber: 'desc' },
      });
      const orderNumber = (lastOrder?.orderNumber ?? 999) + 1;

      // Tranzaksiya orqali buyurtma yaratish va mijoz keshbekini yangilash
      await prisma.$transaction([
        prisma.order.create({
          data: {
            orderNumber,
            status: 'NEW',
            totalAmount,
            cashbackEarned,
            address: ctx.session.address,
            branchId: branch.id,
            customerId: customer.id,
            items: {
              create: orderItemsData,
            },
          },
        }),
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalSpent: { increment: totalAmount },
            cashback: { increment: cashbackEarned },
            orderCount: { increment: 1 },
          },
        }),
      ]);

      await ctx.reply(
        `🎉 Rahmat! Buyurtmangiz qabul qilindi.\n` +
        `🔢 Buyurtma raqami: #${orderNumber}\n` +
        `🍔 Filial: ${branch.name}\n\n` +
        `Tez orada menejerimiz siz bilan bog'lanadi!`,
        {
          reply_markup: { remove_keyboard: true }
        }
      );

      // Sessiyani tozalash
      ctx.session.cart = {};
      ctx.session.step = 'SHOPPING';
      await sendMenu(ctx);
    } catch (err) {
      console.error('Order creation error:', err);
      await ctx.reply("Buyurtma berishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  }
}
