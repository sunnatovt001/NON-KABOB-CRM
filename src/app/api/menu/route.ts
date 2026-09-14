import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: Menyu taomlar ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

// ─── POST: Yangi taom ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameUz, price, category, description } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nom va narx shart' }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: name,
        nameUz: nameUz ?? name,
        price: parseInt(price),
        category: category ?? 'main',
        description,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json({ error: 'Taom yaratishda xatolik' }, { status: 500 });
  }
}

// ─── PATCH: Taom ma'lumotlarini yangilash ─────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, nameUz, price, category, description, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID shart' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (nameUz !== undefined) updateData.nameUz = nameUz;
    if (price !== undefined) updateData.price = parseInt(price);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Menu PATCH error:', error);
    return NextResponse.json({ error: 'Taom yangilashda xatolik' }, { status: 500 });
  }
}
