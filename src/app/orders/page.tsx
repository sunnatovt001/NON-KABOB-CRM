'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Filter, Search, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import OrderKanban from '@/components/OrderKanban';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: { nameUz: string };
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  notes?: string;
  branch: { name: string };
  customer?: { firstName: string; lastName?: string; phone: string } | null;
  items: OrderItem[];
}

type FilterStatus = 'ALL' | 'NEW' | 'PREPARING' | 'ON_THE_WAY' | 'COMPLETED';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/orders', window.location.origin);
      if (filter !== 'ALL') {
        url.searchParams.set('status', filter);
      }
      url.searchParams.set('limit', '100');
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error('API xatoligi');
      const json = await res.json();
      setOrders(json.orders ?? []);
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await fetchOrders();
    }
  };

  const statusCounts = {
    NEW: orders.filter((o) => o.status === 'NEW').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    ON_THE_WAY: orders.filter((o) => o.status === 'ON_THE_WAY').length,
    COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
  };

  // Show ALL 4 columns even when filter is set for kanban
  const displayOrders = orders;

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Header
        title="Buyurtmalar"
        subtitle="Kanban board – real vaqt monitoring"
        onRefresh={fetchOrders}
        isLoading={isLoading}
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: 'ALL', label: 'Barchasi', count: orders.length },
              { value: 'NEW', label: 'Yangi', count: statusCounts.NEW },
              { value: 'PREPARING', label: 'Tayyorlanmoqda', count: statusCounts.PREPARING },
              { value: 'ON_THE_WAY', label: "Yo'lda", count: statusCounts.ON_THE_WAY },
              { value: 'COMPLETED', label: 'Yakunlandi', count: statusCounts.COMPLETED },
            ].map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setFilter(value as FilterStatus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                  filter === value
                    ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30'
                    : 'bg-[#111111] text-[#9CA3AF] border border-[#222222] hover:border-[#2E2E2E] hover:text-white'
                }`}
              >
                {label}
                <span
                  className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                    filter === value ? 'bg-[#F5A623]/20 text-[#F5A623]' : 'bg-[#1A1A1A] text-[#6B7280]'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-[#F5A623] text-xs">
                <RefreshCw size={12} className="animate-spin" />
                <span>Yangilanmoqda...</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#222222] rounded-lg text-[#6B7280] text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Har 30 sek yangilanadi
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading && orders.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#222222] rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <OrderKanban orders={displayOrders} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
}
