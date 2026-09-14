'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import SalesChart from '@/components/SalesChart';
import TopItemsChart from '@/components/TopItemsChart';
import BranchChart from '@/components/BranchChart';
import { formatCurrency, formatShortNumber, getStatusConfig } from '@/lib/utils';

interface DashboardData {
  today: { sales: number; orders: number };
  weekly: { sales: number; orders: number };
  monthly: { sales: number; orders: number };
  activeOrders: number;
  totalCustomers: number;
  topItems: { name: string; quantity: number; revenue: number }[];
  branchRevenue: { name: string; isOpen: boolean; revenue: number; orders: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) throw new Error('API xatoligi');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Har 2 daqiqada yangilash
    const interval = setInterval(fetchData, 120_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const weeklyTrend =
    data && data.weekly.sales > 0
      ? Math.round(
          ((data.today.sales - data.weekly.sales / 7) / (data.weekly.sales / 7)) * 100
        )
      : 0;

  const statusItems = [
    { status: 'NEW', label: 'Yangi', icon: Clock },
    { status: 'PREPARING', label: 'Tayyorlanmoqda', icon: Zap },
    { status: 'ON_THE_WAY', label: "Yo'lda", icon: ShoppingBag },
    { status: 'COMPLETED', label: 'Yakunlandi', icon: CheckCircle },
  ];

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="NON-KABOB boshqaruv paneli – real vaqt tahlili"
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      <div className="flex-1 p-8 space-y-8">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F5A623] via-[#E09520] to-[#D4891A] p-6">
          <div className="relative z-10">
            <p className="text-black/60 text-sm font-semibold uppercase tracking-wider">
              NON-KABOB · nonkabob.uz
            </p>
            <h2 className="text-black text-2xl font-black mt-1 leading-tight">
              O&apos;zbekistondagi birinchi milliy fast food
            </h2>
            <p className="text-black/70 text-sm mt-1 font-medium">
              &ldquo;Sifat biz uchun Foydadan muhim!&rdquo; · Asoschilar: Davron &amp; Botir
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 h-28 bg-black/10 rounded-full" />
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-16 h-16 bg-black/10 rounded-full" />
          <div className="absolute -right-4 top-0 w-40 h-40 bg-white/5 rounded-full" />
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-slide-up">
          <StatCard
            title="Bugungi Daromad"
            value={isLoading ? '...' : formatShortNumber(data?.today.sales ?? 0) + " so'm"}
            subtitle={`${data?.today.orders ?? 0} ta buyurtma`}
            icon={DollarSign}
            trend={weeklyTrend}
            trendLabel="Haftalik o'rtachaga nisbatan"
            color="yellow"
            isLoading={isLoading}
          />
          <StatCard
            title="Haftalik Daromad"
            value={isLoading ? '...' : formatShortNumber(data?.weekly.sales ?? 0) + " so'm"}
            subtitle={`${data?.weekly.orders ?? 0} ta buyurtma`}
            icon={TrendingUp}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            title="Faol Buyurtmalar"
            value={isLoading ? '...' : String(data?.activeOrders ?? 0)}
            subtitle="Hozir jarayonda"
            icon={Zap}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Jami Mijozlar"
            value={isLoading ? '...' : String(data?.totalCustomers ?? 0)}
            subtitle="Ro'yxatdagi mijozlar"
            icon={Users}
            color="purple"
            isLoading={isLoading}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-up">
          <div className="xl:col-span-2">
            <SalesChart data={data?.dailyRevenue ?? []} isLoading={isLoading} />
          </div>
          <div>
            <BranchChart data={data?.branchRevenue ?? []} isLoading={isLoading} />
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-up">
          {/* Top Items */}
          <div className="xl:col-span-2">
            <TopItemsChart data={data?.topItems ?? []} isLoading={isLoading} />
          </div>

          {/* Order Status Summary */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-white font-semibold text-base">Buyurtmalar Holati</h3>
              <p className="text-[#6B7280] text-xs mt-0.5">Umumiy taqsimlash</p>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg" />
                    <div className="flex-1 h-4 bg-[#1A1A1A] rounded" />
                    <div className="w-8 h-4 bg-[#1A1A1A] rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {statusItems.map(({ status, label, icon: Icon }) => {
                  const found = data?.ordersByStatus.find((s) => s.status === status);
                  const count = found?.count ?? 0;
                  const total = data?.ordersByStatus.reduce((s, x) => s + x.count, 0) ?? 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const cfg = getStatusConfig(status);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                        <Icon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#9CA3AF] text-xs">{label}</span>
                          <span className="text-white text-xs font-semibold">{count}</span>
                        </div>
                        <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.dot}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monthly summary */}
            {!isLoading && data && (
              <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[#6B7280] text-xs">Oylik daromad</p>
                    <p className="text-white text-base font-bold mt-0.5">
                      {formatShortNumber(data.monthly.sales)} so&apos;m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-xs">Buyurtmalar</p>
                    <p className="text-[#F5A623] text-base font-bold mt-0.5">
                      {data.monthly.orders} ta
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
