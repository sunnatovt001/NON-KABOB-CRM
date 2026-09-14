'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, UserPlus, Phone, ShoppingBag, Gift, X, Check } from 'lucide-react';
import Header from '@/components/Header';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RecentOrder {
  id: string;
  totalAmount: number;
  createdAt: string;
  branch: { name: string };
}

interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  cashback: number;
  totalSpent: number;
  orderCount: number;
  notes?: string;
  createdAt: string;
  orders: RecentOrder[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/customers${params}`, { cache: 'no-store' });
      const json = await res.json();
      setCustomers(json.customers ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const handleAddCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.phone) {
      setAddError('Ism va telefon raqam shart');
      return;
    }
    setIsSubmitting(true);
    setAddError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      const json = await res.json();
      if (!res.ok) {
        setAddError(json.error ?? 'Xatolik yuz berdi');
      } else {
        setShowAddModal(false);
        setNewCustomer({ firstName: '', lastName: '', phone: '' });
        fetchCustomers();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Header
        title="Mijozlar Bazasi"
        subtitle={`Jami ${total} ta mijoz ro'yxatda`}
        onRefresh={fetchCustomers}
        isLoading={isLoading}
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="text"
              placeholder="Ism, familiya yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#111111] border border-[#222222] hover:border-[#2E2E2E] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#4D4D4D] outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#FFD166] text-black font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#F5A623]/20"
          >
            <UserPlus size={16} />
            Yangi Mijoz
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1A1A1A] bg-[#0D0D0D]">
            <div className="col-span-3 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Mijoz</div>
            <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Telefon</div>
            <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Jami xarid</div>
            <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Keshbek (5%)</div>
            <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Buyurtmalar</div>
            <div className="col-span-1 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">A&apos;zo</div>
          </div>

          {/* Table body */}
          {isLoading ? (
            <div className="space-y-px">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse border-b border-[#1A1A1A]">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A1A1A]" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-3.5 bg-[#1A1A1A] rounded" />
                      <div className="w-16 h-3 bg-[#1A1A1A] rounded" />
                    </div>
                  </div>
                  <div className="col-span-9 h-4 bg-[#1A1A1A] rounded" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#2E2E2E]">
              <UserPlus size={40} className="mb-3" />
              <p className="text-sm">Mijoz topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {customers.map((c) => {
                const initials = `${c.firstName.charAt(0)}${c.lastName?.charAt(0) ?? ''}`;
                const avatarColor = `hsl(${(c.id.charCodeAt(0) * 37) % 360}, 60%, 45%)`;
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#141414] transition-colors group"
                  >
                    {/* Name */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initials.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium group-hover:text-[#F5A623] transition-colors">
                          {c.firstName} {c.lastName}
                        </p>
                        {c.orders[0] && (
                          <p className="text-[#4D4D4D] text-xs">
                            So&apos;nggi: {c.orders[0].branch.name.replace(' filiali', '')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-span-2 flex items-center gap-1.5 text-[#9CA3AF] text-sm">
                      <Phone size={12} className="text-[#4D4D4D]" />
                      {c.phone}
                    </div>

                    {/* Total Spent */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-white text-sm font-semibold">
                        {formatCurrency(c.totalSpent)}
                      </span>
                    </div>

                    {/* Cashback */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <Gift size={13} className="text-[#F5A623]" />
                      <span className="text-[#F5A623] text-sm font-semibold">
                        {formatCurrency(c.cashback)}
                      </span>
                    </div>

                    {/* Order Count */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-[#6B7280]" />
                      <span className="text-[#9CA3AF] text-sm">{c.orderCount} ta</span>
                    </div>

                    {/* Join Date */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-[#4D4D4D] text-xs">{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Yangi Mijoz Qo&apos;shish</h3>
              <button
                onClick={() => { setShowAddModal(false); setAddError(''); }}
                className="w-8 h-8 bg-[#1A1A1A] hover:bg-[#222222] rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#9CA3AF] text-xs font-medium block mb-2">Ism *</label>
                <input
                  type="text"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                  placeholder="Jasur"
                  className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#222222] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#3D3D3D] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs font-medium block mb-2">Familiya</label>
                <input
                  type="text"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                  placeholder="Toshmatov"
                  className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#222222] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#3D3D3D] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs font-medium block mb-2">Telefon *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#222222] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#3D3D3D] outline-none transition-all"
                />
              </div>

              {addError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {addError}
                </div>
              )}

              <button
                onClick={handleAddCustomer}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5A623] hover:bg-[#FFD166] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
