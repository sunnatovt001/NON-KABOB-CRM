'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit3,
  Check,
  X,
  UtensilsCrossed,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import Header from '@/components/Header';
import { formatCurrency } from '@/lib/utils';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isOpen: boolean;
  workHours: string;
  _count: { orders: number };
  orders: { id: string; status: string }[];
}

interface MenuItem {
  id: string;
  name: string;
  nameUz: string;
  price: number;
  category: string;
  isAvailable: boolean;
  _count: { orderItems: number };
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'branches' | 'menu'>('branches');

  // Menu editing
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // New menu item modal
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [brRes, mnRes] = await Promise.all([
        fetch('/api/branches', { cache: 'no-store' }),
        fetch('/api/menu', { cache: 'no-store' }),
      ]);
      setBranches(await brRes.json());
      setMenuItems(await mnRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggleBranch = async (id: string, isOpen: boolean) => {
    await fetch('/api/branches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isOpen: !isOpen }),
    });
    fetchAll();
  };

  const toggleMenuItem = async (id: string, isAvailable: boolean) => {
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isAvailable: !isAvailable }),
    });
    fetchAll();
  };

  const savePrice = async (id: string) => {
    const price = parseInt(editPrice.replace(/\D/g, ''));
    if (isNaN(price) || price <= 0) return;
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, price }),
    });
    setEditingItem(null);
    fetchAll();
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          nameUz: newItem.name,
          price: newItem.price,
          category: 'main',
        }),
      });
      setShowAddItem(false);
      setNewItem({ name: '', price: '' });
      fetchAll();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Header
        title="Filiallar & Menyu"
        subtitle="Filiallar holati va menyu narxlarini boshqarish"
        onRefresh={fetchAll}
        isLoading={isLoading}
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#111111] border border-[#222222] rounded-xl p-1 w-fit">
          {[
            { key: 'branches', label: 'Filiallar', icon: Store },
            { key: 'menu', label: 'Menyu', icon: UtensilsCrossed },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'branches' | 'menu')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-[#F5A623] text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── BRANCHES TAB ── */}
        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#111111] border border-[#222222] rounded-2xl h-44 animate-pulse" />
                ))
              : branches.map((branch) => {
                  const activeOrders = branch.orders.length;
                  return (
                    <div
                      key={branch.id}
                      className={`bg-[#111111] border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                        branch.isOpen
                          ? 'border-green-500/15 hover:border-green-500/25'
                          : 'border-red-500/15 hover:border-red-500/25'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                              branch.isOpen ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}
                          >
                            <Store
                              size={20}
                              className={branch.isOpen ? 'text-green-400' : 'text-red-400'}
                            />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-base">{branch.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  branch.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  branch.isOpen ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {branch.isOpen ? 'Ochiq' : 'Yopiq'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleBranch(branch.id, branch.isOpen)}
                          className={`transition-colors ${
                            branch.isOpen ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'
                          }`}
                          title={branch.isOpen ? 'Yopish' : 'Ochish'}
                        >
                          {branch.isOpen ? (
                            <ToggleRight size={28} />
                          ) : (
                            <ToggleLeft size={28} />
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-[#9CA3AF] text-sm">
                          <MapPin size={13} className="text-[#4D4D4D] mt-0.5 flex-shrink-0" />
                          <span>{branch.address}</span>
                        </div>
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                            <Phone size={13} className="text-[#4D4D4D] flex-shrink-0" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                          <Clock size={13} className="text-[#4D4D4D] flex-shrink-0" />
                          <span>{branch.workHours}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1A1A1A]">
                        <div className="text-center">
                          <p className="text-[#F5A623] text-lg font-bold">{activeOrders}</p>
                          <p className="text-[#6B7280] text-xs">Faol buyurtma</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white text-lg font-bold">{branch._count.orders}</p>
                          <p className="text-[#6B7280] text-xs">Jami buyurtma</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            {/* Add button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#FFD166] text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#F5A623]/20"
              >
                <Plus size={16} />
                Yangi Taom
              </button>
            </div>

            {/* Menu table */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1A1A1A] bg-[#0D0D0D]">
                <div className="col-span-5 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Taom nomi</div>
                <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Kategoriya</div>
                <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Narx</div>
                <div className="col-span-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Buyurtmalar</div>
                <div className="col-span-1 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Holat</div>
              </div>

              {isLoading ? (
                <div className="divide-y divide-[#1A1A1A]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse">
                      <div className="col-span-5 h-4 bg-[#1A1A1A] rounded" />
                      <div className="col-span-7 h-4 bg-[#1A1A1A] rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-[#1A1A1A]">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#141414] transition-colors group ${
                        !item.isAvailable ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Name */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed size={15} className="text-[#F5A623]" />
                        </div>
                        <span className="text-white text-sm font-medium">{item.nameUz}</span>
                      </div>

                      {/* Category */}
                      <div className="col-span-2 flex items-center">
                        <span className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-[#9CA3AF] text-xs capitalize">
                          {item.category}
                        </span>
                      </div>

                      {/* Price (editable) */}
                      <div className="col-span-2 flex items-center gap-2">
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 bg-[#0D0D0D] border border-[#F5A623]/40 rounded-lg text-white text-xs outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') savePrice(item.id);
                                if (e.key === 'Escape') setEditingItem(null);
                              }}
                            />
                            <button onClick={() => savePrice(item.id)} className="text-green-400 hover:text-green-300">
                              <Check size={13} />
                            </button>
                            <button onClick={() => setEditingItem(null)} className="text-red-400 hover:text-red-300">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/price">
                            <span className="text-white text-sm font-semibold">
                              {formatCurrency(item.price)}
                            </span>
                            <button
                              onClick={() => { setEditingItem(item.id); setEditPrice(String(item.price)); }}
                              className="opacity-0 group-hover/price:opacity-100 transition-opacity text-[#F5A623] hover:text-[#FFD166]"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Order count */}
                      <div className="col-span-2 flex items-center gap-1.5 text-[#6B7280] text-sm">
                        <DollarSign size={12} className="text-[#4D4D4D]" />
                        {item._count.orderItems} ta
                      </div>

                      {/* Toggle */}
                      <div className="col-span-1 flex items-center">
                        <button
                          onClick={() => toggleMenuItem(item.id, item.isAvailable)}
                          className={`transition-colors ${
                            item.isAvailable
                              ? 'text-green-400 hover:text-red-400'
                              : 'text-red-400 hover:text-green-400'
                          }`}
                          title={item.isAvailable ? "O'chirish" : 'Yoqish'}
                        >
                          {item.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Menu Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Yangi Taom Qo&apos;shish</h3>
              <button
                onClick={() => setShowAddItem(false)}
                className="w-8 h-8 bg-[#1A1A1A] hover:bg-[#222222] rounded-lg flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#9CA3AF] text-xs font-medium block mb-2">Taom nomi *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Masalan: Palov"
                  className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#222222] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#3D3D3D] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs font-medium block mb-2">Narx (so&apos;m) *</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="35000"
                  className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#222222] focus:border-[#F5A623]/40 rounded-xl text-white text-sm placeholder-[#3D3D3D] outline-none transition-all"
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={isSubmitting || !newItem.name || !newItem.price}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5A623] hover:bg-[#FFD166] disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-all"
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
