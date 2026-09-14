import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: Mijozlar ro'yxati ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { totalSpent: 'desc' },
        skip,
        take: limit,
        include: {
          orders: {
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              branch: { select: { name: true } },
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ customers, total, page, limit });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

// ─── POST: Yangi mijoz ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, notes } = body;

    if (!firstName || !phone) {
      return NextResponse.json({ error: 'Ism va telefon shart' }, { status: 400 });
    }

    // Telefon raqami mavjudligini tekshirish
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: 'Bu telefon raqam allaqachon ro\'yxatda bor' },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: { firstName, lastName, phone, notes },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json({ error: 'Mijoz yaratishda xatolik' }, { status: 500 });
  }
}

// ─── PATCH: Mijoz ma'lumotlarini yangilash ────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, phone, notes, cashback } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID shart' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    if (cashback !== undefined) updateData.cashback = cashback;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customers PATCH error:', error);
    return NextResponse.json({ error: 'Mijoz yangilashda xatolik' }, { status: 500 });
  }
}
