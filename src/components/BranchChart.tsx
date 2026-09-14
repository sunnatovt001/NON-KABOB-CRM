'use client';

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatShortNumber, formatCurrency } from '@/lib/utils';
import { Store, TrendingUp } from 'lucide-react';

interface BranchRevenue {
  name: string;
  isOpen: boolean;
  revenue: number;
  orders: number;
}

interface BranchChartProps {
  data: BranchRevenue[];
  isLoading?: boolean;
}

const COLORS = ['#F5A623', '#FFD166', '#B87333', '#D4891A'];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BranchRevenue }[];
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-3 shadow-xl">
        <p className="text-white text-xs font-semibold mb-1">{item.name}</p>
        <p className="text-[#F5A623] text-sm font-bold">{formatShortNumber(item.revenue)} so&apos;m</p>
        <p className="text-[#9CA3AF] text-xs">{item.orders} ta buyurtma</p>
      </div>
    );
  }
  return null;
};

function shortBranchName(name: string): string {
  return name.replace(' filiali', '');
}

export default function BranchChart({ data, isLoading }: BranchChartProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 animate-pulse">
        <div className="w-40 h-5 bg-[#1A1A1A] rounded mb-6" />
        <div className="h-48 bg-[#1A1A1A] rounded-xl" />
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-base">Filiallar Daromadi</h3>
          <p className="text-[#6B7280] text-xs mt-0.5">So&apos;nggi 30 kun</p>
        </div>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs">
          <TrendingUp size={12} className="text-[#F5A623]" />
          <span>Jami: {formatShortNumber(total)} so&apos;m</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Pie Chart */}
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                dataKey="revenue"
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((branch, index) => {
            const pct = total > 0 ? Math.round((branch.revenue / total) * 100) : 0;
            return (
              <div key={branch.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Store size={11} className="text-[#6B7280] flex-shrink-0" />
                    <span className="text-[#9CA3AF] text-xs truncate">
                      {shortBranchName(branch.name)}
                    </span>
                    {!branch.isOpen && (
                      <span className="text-[0.6rem] text-red-400 bg-red-400/10 px-1 py-0.5 rounded flex-shrink-0">
                        Yopiq
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-white text-xs font-semibold">{pct}%</span>
                  <p className="text-[#4D4D4D] text-xs">{branch.orders} ta</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
