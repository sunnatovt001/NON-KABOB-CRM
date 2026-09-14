import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = ['NEW', 'PREPARING', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED'];

// ─── GET: Buyurtmalar ro'yxati ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const branchId = searchParams.get('branchId');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') where.status = status;
    if (branchId) where.branchId = branchId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true } },
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          items: {
            include: {
              menuItem: { select: { id: true, nameUz: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

// ─── POST: Yangi buyurtma ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, customerId, items, notes, address } = body;

    if (!branchId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Filial va kamida 1 ta taom tanlash shart' }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItems: { menuItemId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) {
        return NextResponse.json({ error: `Taom topilmadi: ${item.menuItemId}` }, { status: 404 });
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, price: menuItem.price });
    }

    const cashbackEarned = Math.floor(totalAmount * 0.05);

    // Generate order number
    const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: 'desc' } });
    const orderNumber = (lastOrder?.orderNumber ?? 999) + 1;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        branchId,
        customerId: customerId || null,
        totalAmount,
        cashbackEarned,
        notes,
        address,
        status: 'NEW',
        items: { create: orderItems },
      },
      include: {
        branch: true,
        customer: true,
        items: { include: { menuItem: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Buyurtma yaratishda xatolik' }, { status: 500 });
  }
}

// ─── PATCH: Buyurtma statusini o'zgartirish ───────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID va status shart' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        branch: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true } },
        items: { include: { menuItem: { select: { nameUz: true } } } },
      },
    });

    // Yakunlangan bo'lsa mijoz statistikasini yangilash
    if (status === 'COMPLETED' && order.customerId) {
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpent: { increment: order.totalAmount },
          cashback: { increment: order.cashbackEarned },
          orderCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Orders PATCH error:', error);
    return NextResponse.json({ error: 'Status yangilashda xatolik' }, { status: 500 });
  }
}
