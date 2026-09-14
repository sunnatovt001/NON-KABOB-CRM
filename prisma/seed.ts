import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Yordamchi funksiyalar ───────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomInt(8, 23), randomInt(0, 59), 0, 0);
  return d;
}

// ─── Ma'lumotlar ─────────────────────────────────────────────────────────────

const branchesData = [
  {
    name: 'Chorsu filiali',
    address: "Zarqaynar ko'chasi, Chorsu metro yaqinida, Toshkent",
    phone: '+998 71 200-01-01',
    workHours: '24/7',
    isOpen: true,
  },
  {
    name: 'Oqtepa filiali',
    address: "Chilonzor tumani, Oqtepa maydoni, 12-uy, Toshkent",
    phone: '+998 71 200-02-02',
    workHours: '24/7',
    isOpen: true,
  },
  {
    name: 'Yunusobod filiali',
    address: "Yunusobod tumani, Megaplanet savdo markazi yaqinida, Toshkent",
    phone: '+998 71 200-03-03',
    workHours: '24/7',
    isOpen: true,
  },
  {
    name: 'Maksim Gorkiy filiali',
    address: "Buyuk Ipak Yo'li metro bekati, Mirzo Ulugbek tumani, Toshkent",
    phone: '+998 71 200-04-04',
    workHours: '24/7',
    isOpen: false,
  },
];

const menuItemsData = [
  {
    name: "Qo'y go'shtli non kabob",
    nameUz: "Qo'y go'shtli non kabob",
    price: 45000,
    category: 'main',
    description: "Yangi pishirilgan non ichida mazali qo'y go'shti kabob",
    isAvailable: true,
  },
  {
    name: "Mol go'shtli non kabob",
    nameUz: "Mol go'shtli non kabob",
    price: 45000,
    category: 'main',
    description: "Yangi pishirilgan non ichida mol go'shti kabob",
    isAvailable: true,
  },
  {
    name: "Ot go'shtli non kabob",
    nameUz: "Ot go'shtli non kabob",
    price: 45000,
    category: 'main',
    description: "Yangi pishirilgan non ichida ot go'shti kabob",
    isAvailable: true,
  },
  {
    name: "Tovuq go'shtli non kabob",
    nameUz: "Tovuq go'shtli non kabob",
    price: 35000,
    category: 'main',
    description: "Yangi pishirilgan non ichida tovuq go'shti kabob",
    isAvailable: true,
  },
  {
    name: 'Milliy burger',
    nameUz: 'Milliy burger',
    price: 35000,
    category: 'burger',
    description: "O'zbek uslubidagi milliy burger",
    isAvailable: true,
  },
];

const customersData = [
  { firstName: 'Jasur',    lastName: 'Toshmatov',   phone: '+998901001001' },
  { firstName: 'Malika',   lastName: 'Yusupova',    phone: '+998901001002' },
  { firstName: 'Bobur',    lastName: "Xo'jayev",    phone: '+998901001003' },
  { firstName: 'Nilufar',  lastName: 'Rahimova',    phone: '+998901001004' },
  { firstName: 'Sherzod',  lastName: 'Mirzayev',    phone: '+998901001005' },
  { firstName: 'Zulfiya',  lastName: 'Karimova',    phone: '+998901001006' },
  { firstName: 'Ulugbek',  lastName: 'Nazarov',     phone: '+998901001007' },
  { firstName: 'Madina',   lastName: "Qo'chqorova", phone: '+998901001008' },
  { firstName: 'Firdavs',  lastName: 'Ergashev',    phone: '+998901001009' },
  { firstName: 'Dilnoza',  lastName: 'Ibragimova',  phone: '+998901001010' },
  { firstName: 'Sardor',   lastName: 'Holmatov',    phone: '+998901001011' },
  { firstName: 'Feruza',   lastName: 'Tursunova',   phone: '+998901001012' },
  { firstName: 'Jahongir', lastName: "Yo'ldoshev",  phone: '+998901001013' },
  { firstName: 'Kamola',   lastName: 'Sotvoldiyeva',phone: '+998901001014' },
  { firstName: 'Nodir',    lastName: 'Xasanov',     phone: '+998901001015' },
  { firstName: 'Barno',    lastName: 'Aminova',     phone: '+998901001016' },
  { firstName: 'Otabek',   lastName: 'Rashidov',    phone: '+998901001017' },
  { firstName: 'Sabohat',  lastName: 'Yunusova',    phone: '+998901001018' },
  { firstName: 'Behruz',   lastName: 'Abdullayev',  phone: '+998901001019' },
  { firstName: 'Mohira',   lastName: 'Qosimova',    phone: '+998901001020' },
];

// SQLite-da enum yo'q, shuning uchun string ishlatiladi
const completedStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED'];
const allStatuses = ['NEW', 'PREPARING', 'ON_THE_WAY', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED'];

// ─── Asosiy Seed funksiyasi ───────────────────────────────────────────────────

async function main() {
  console.log('🌱 NON-KABOB CRM – Seed boshlandi...\n');

  // ── Eski ma'lumotlarni tozalash ──
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Eski ma'lumotlar tozalandi.");

  // ── Filiallar ──
  const branches = await Promise.all(
    branchesData.map((b) => prisma.branch.create({ data: b }))
  );
  console.log(`✅ ${branches.length} ta filial yaratildi.`);

  // ── Menyu ──
  const menuItems = await Promise.all(
    menuItemsData.map((m) => prisma.menuItem.create({ data: m }))
  );
  console.log(`✅ ${menuItems.length} ta menyu taomi yaratildi.`);

  // ── Mijozlar ──
  const customers = await Promise.all(
    customersData.map((c) => prisma.customer.create({ data: c }))
  );
  console.log(`✅ ${customers.length} ta mijoz yaratildi.`);

  // ── Admin foydalanuvchilar ──
  await prisma.user.create({
    data: { email: 'admin@nonkabob.uz', name: 'Davron Adminov', role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { email: 'manager@nonkabob.uz', name: 'Botir Menejer', role: 'MANAGER' },
  });
  console.log('✅ 2 ta admin foydalanuvchi yaratildi.');

  // ── Buyurtmalar (so'nggi 30 kun) ──
  let orderCounter = 1000;
  let totalOrdersCreated = 0;

  for (let daysBack = 30; daysBack >= 0; daysBack--) {
    const ordersPerDay = randomInt(5, 20);

    for (let i = 0; i < ordersPerDay; i++) {
      const branch = randomItem(branches);
      const customer = Math.random() > 0.3 ? randomItem(customers) : null;
      const status = daysBack === 0
        ? randomItem(allStatuses)
        : randomItem(completedStatuses);

      // 1–4 ta taom
      const itemCount = randomInt(1, 4);
      const orderItemsList: { menuItemId: string; quantity: number; price: number }[] = [];
      let totalAmount = 0;

      for (let j = 0; j < itemCount; j++) {
        const menuItem = randomItem(menuItems);
        const quantity = randomInt(1, 3);
        totalAmount += menuItem.price * quantity;
        orderItemsList.push({
          menuItemId: menuItem.id,
          quantity,
          price: menuItem.price,
        });
      }

      const cashbackEarned = Math.floor(totalAmount * 0.05);
      const orderDate = daysAgo(daysBack);

      await prisma.order.create({
        data: {
          orderNumber: orderCounter++,
          status,
          totalAmount,
          cashbackEarned,
          branchId: branch.id,
          customerId: customer?.id ?? null,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: { create: orderItemsList },
        },
      });

      // Mijoz statistikasini yangilash
      if (customer && status === 'COMPLETED') {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalSpent: { increment: totalAmount },
            cashback: { increment: cashbackEarned },
            orderCount: { increment: 1 },
          },
        });
      }

      totalOrdersCreated++;
    }
  }

  console.log(`✅ ${totalOrdersCreated} ta buyurtma yaratildi (so'nggi 30 kun).`);

  // ── Yakuniy statistika ──
  const stats = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true },
    _count: true,
  });

  console.log('\n📊 Seed natijalari:');
  console.log(`   Jami buyurtmalar: ${totalOrdersCreated}`);
  console.log(`   Yakunlangan buyurtmalar: ${stats._count}`);
  console.log(
    `   Jami daromad: ${((stats._sum.totalAmount ?? 0) / 1_000_000).toFixed(2)} mln so'm`
  );
  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed xatoligi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
