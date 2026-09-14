import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// SQLite doesn't support enums – using string literals
const ORDER_STATUS = {
  NEW: 'NEW',
  PREPARING: 'PREPARING',
  ON_THE_WAY: 'ON_THE_WAY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(0, 0, 0, 0);

    // ── Kunlik sotuvlar ──
    const todaySales = await prisma.order.aggregate({
      where: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: true,
    });

    // ── Haftalik sotuvlar ──
    const weeklySales = await prisma.order.aggregate({
      where: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: weekAgo } },
      _sum: { totalAmount: true },
      _count: true,
    });

    // ── Oylik sotuvlar ──
    const monthlySales = await prisma.order.aggregate({
      where: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: monthAgo } },
      _sum: { totalAmount: true },
      _count: true,
    });

    // ── Faol buyurtmalar ──
    const activeOrders = await prisma.order.count({
      where: {
        status: { in: [ORDER_STATUS.NEW, ORDER_STATUS.PREPARING, ORDER_STATUS.ON_THE_WAY] },
      },
    });

    // ── Jami mijozlar ──
    const totalCustomers = await prisma.customer.count();

    // ── Eng ko'p sotilgan taomlar ──
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: monthAgo } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topItemsWithNames = await Promise.all(
      topItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { nameUz: true, price: true },
        });
        return {
          name: menuItem?.nameUz ?? "Noma'lum",
          quantity: item._sum.quantity ?? 0,
          revenue: (item._sum.quantity ?? 0) * (menuItem?.price ?? 0),
        };
      })
    );

    // ── Filiallar bo'yicha daromad ──
    const branchRevenue = await prisma.order.groupBy({
      by: ['branchId'],
      where: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: monthAgo } },
      _sum: { totalAmount: true },
      _count: true,
    });

    const branchRevenueWithNames = await Promise.all(
      branchRevenue.map(async (item) => {
        const branch = await prisma.branch.findUnique({
          where: { id: item.branchId },
          select: { name: true, isOpen: true },
        });
        return {
          name: branch?.name ?? "Noma'lum",
          isOpen: branch?.isOpen ?? false,
          revenue: item._sum.totalAmount ?? 0,
          orders: item._count,
        };
      })
    );

    // ── So'nggi 7 kunlik daromad grafigi ──
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayData = await prisma.order.aggregate({
        where: { status: ORDER_STATUS.COMPLETED, createdAt: { gte: dayStart, lte: dayEnd } },
        _sum: { totalAmount: true },
        _count: true,
      });

      dailyRevenue.push({
        date: dayStart.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
        revenue: dayData._sum.totalAmount ?? 0,
        orders: dayData._count,
      });
    }

    // ── Buyurtmalar status bo'yicha ──
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      today: { sales: todaySales._sum.totalAmount ?? 0, orders: todaySales._count },
      weekly: { sales: weeklySales._sum.totalAmount ?? 0, orders: weeklySales._count },
      monthly: { sales: monthlySales._sum.totalAmount ?? 0, orders: monthlySales._count },
      activeOrders,
      totalCustomers,
      topItems: topItemsWithNames,
      branchRevenue: branchRevenueWithNames,
      dailyRevenue,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count })),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: "Ma'lumot olishda xatolik" }, { status: 500 });
  }
}
