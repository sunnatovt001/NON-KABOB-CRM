'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopItemsChartProps {
  data: TopItem[];
  isLoading?: boolean;
}

const COLORS = ['#F5A623', '#FFD166', '#D4891A', '#B87333', '#8B5E1A'];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TopItem }[];
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-3 shadow-xl max-w-[200px]">
        <p className="text-white text-xs font-semibold mb-2 leading-snug">{item.name}</p>
        <p className="text-[#F5A623] text-sm font-bold">{item.quantity} ta</p>
        <p className="text-[#9CA3AF] text-xs">{formatCurrency(item.revenue)}</p>
      </div>
    );
  }
  return null;
};

function shortenName(name: string): string {
  const words = name.split(' ');
  if (words.length <= 2) return name;
  return words.slice(0, 2).join(' ') + '…';
}

export default function TopItemsChart({ data, isLoading }: TopItemsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 animate-pulse">
        <div className="w-44 h-5 bg-[#1A1A1A] rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-3 bg-[#1A1A1A] rounded" />
              <div className="flex-1 h-6 bg-[#1A1A1A] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxQty = Math.max(...data.map((d) => d.quantity), 1);

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-white font-semibold text-base">Eng Ko&apos;p Sotilgan</h3>
        <p className="text-[#6B7280] text-xs mt-0.5">So&apos;nggi 30 kun</p>
      </div>

      {/* Custom horizontal bars */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const pct = (item.quantity / maxQty) * 100;
          return (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white text-xs font-medium leading-snug">
                  {shortenName(item.name)}
                </span>
                <span className="text-[#9CA3AF] text-xs">{item.quantity} ta</span>
              </div>
              <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: COLORS[index] ?? '#F5A623',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts bar chart for visual reference */}
      <div className="mt-6 h-1 border-t border-[#1A1A1A]" />
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tickFormatter={shortenName}
              tick={{ fill: '#4D4D4D', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A1A1A' }} />
            <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
