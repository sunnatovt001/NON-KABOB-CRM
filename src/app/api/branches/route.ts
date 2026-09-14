import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: Filiallar ro'yxati ──────────────────────────────────────────────────
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: {
            status: { in: ['NEW', 'PREPARING', 'ON_THE_WAY'] },
          },
          select: { id: true, status: true },
        },
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Branches GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

// ─── POST: Yangi filial ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, workHours } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Nom va manzil shart' }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: { name, address, phone, workHours: workHours ?? '24/7' },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('Branches POST error:', error);
    return NextResponse.json({ error: 'Filial yaratishda xatolik' }, { status: 500 });
  }
}

// ─── PATCH: Filial ma'lumotlarini yangilash ───────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, address, phone, isOpen, workHours } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID shart' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (workHours !== undefined) updateData.workHours = workHours;

    const branch = await prisma.branch.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error('Branches PATCH error:', error);
    return NextResponse.json({ error: 'Filial yangilashda xatolik' }, { status: 500 });
  }
}
