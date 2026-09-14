'use client';

import { useState } from 'react';
import { Clock, MapPin, User, ChevronRight, Package } from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusConfig } from '@/lib/utils';

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

interface OrderKanbanProps {
  orders: Order[];
  onStatusChange: (id: string, status: string) => Promise<void>;
}

const COLUMNS = [
  { status: 'NEW', label: 'Yangi Buyurtmalar', color: 'border-blue-500/30', headerBg: 'bg-blue-500/10' },
  { status: 'PREPARING', label: 'Tayyorlanmoqda', color: 'border-yellow-500/30', headerBg: 'bg-yellow-500/10' },
  { status: 'ON_THE_WAY', label: "Yo'lda", color: 'border-purple-500/30', headerBg: 'bg-purple-500/10' },
  { status: 'COMPLETED', label: 'Yakunlandi', color: 'border-green-500/30', headerBg: 'bg-green-500/10' },
];

const NEXT_STATUS: Record<string, string | null> = {
  NEW: 'PREPARING',
  PREPARING: 'ON_THE_WAY',
  ON_THE_WAY: 'COMPLETED',
  COMPLETED: null,
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  NEW: "Tayyorlashni boshlash",
  PREPARING: "Yo'lga uzatish",
  ON_THE_WAY: "Yetkazildi",
};

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const nextStatus = NEXT_STATUS[order.status];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      await onStatusChange(order.id, nextStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] hover:border-[#2E2E2E] rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#F5A623] font-bold text-sm">#{order.orderNumber}</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </div>
        </div>
        <span className="text-[#6B7280] text-xs">{formatDateTime(order.createdAt)}</span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Package size={11} className="text-[#4D4D4D]" />
              <span className="text-[#9CA3AF] truncate max-w-[140px]">{item.menuItem.nameUz}</span>
            </div>
            <span className="text-[#6B7280] flex-shrink-0">x{item.quantity}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-[#4D4D4D] text-xs">+{order.items.length - 3} ta boshqa</p>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-3 border-t border-[#1A1A1A] pt-3">
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <MapPin size={11} />
          <span className="truncate">{order.branch.name}</span>
        </div>
        {order.customer && (
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <User size={11} />
            <span className="truncate">
              {order.customer.firstName} {order.customer.lastName ?? ''} · {order.customer.phone}
            </span>
          </div>
        )}
      </div>

      {/* Total & Action */}
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-sm">{formatCurrency(order.totalAmount)}</span>
        {nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 border border-[#F5A623]/20 hover:border-[#F5A623]/40 text-[#F5A623] rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-3 h-3 border border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronRight size={12} />
            )}
            {NEXT_STATUS_LABEL[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderKanban({ orders, onStatusChange }: OrderKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status} className={`flex flex-col border ${col.color} rounded-2xl overflow-hidden`}>
            {/* Column Header */}
            <div className={`${col.headerBg} px-4 py-3 border-b ${col.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">{col.label}</h3>
                <span className="bg-[#111111] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {colOrders.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[70vh] bg-[#0D0D0D]">
              {colOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-[#2E2E2E]">
                  <Package size={28} className="mb-2" />
                  <p className="text-xs">Buyurtma yo&apos;q</p>
                </div>
              ) : (
                colOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
