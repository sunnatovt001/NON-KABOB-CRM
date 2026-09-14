'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatShortNumber } from '@/lib/utils';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: DailyRevenue[];
  isLoading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-3 shadow-xl">
        <p className="text-[#9CA3AF] text-xs mb-2">{label}</p>
        <p className="text-white text-sm font-bold">
          {formatShortNumber(payload[0].value)} so&apos;m
        </p>
        {payload[1] && (
          <p className="text-[#F5A623] text-xs mt-1">{payload[1].value} ta buyurtma</p>
        )}
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data, isLoading }: SalesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 animate-pulse">
        <div className="w-40 h-5 bg-[#1A1A1A] rounded mb-6" />
        <div className="h-52 bg-[#1A1A1A] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-base">Sotuvlar Dinamikasi</h3>
          <p className="text-[#6B7280] text-xs mt-0.5">So&apos;nggi 7 kun</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
            <span className="text-[#9CA3AF] text-xs">Daromad</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5A623" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F5A623" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatShortNumber(v)}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2E2E2E', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#F5A623"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#F5A623', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
