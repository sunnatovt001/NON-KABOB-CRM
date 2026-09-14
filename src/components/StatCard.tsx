'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // foiz o'zgarishi
  trendLabel?: string;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'red';
  isLoading?: boolean;
}

const colorMap = {
  yellow: {
    icon: 'text-[#F5A623]',
    iconBg: 'bg-[#F5A623]/10',
    border: 'border-[#F5A623]/10',
    glow: 'shadow-[#F5A623]/5',
  },
  green: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    border: 'border-emerald-400/10',
    glow: 'shadow-emerald-400/5',
  },
  blue: {
    icon: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
    border: 'border-blue-400/10',
    glow: 'shadow-blue-400/5',
  },
  purple: {
    icon: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    border: 'border-purple-400/10',
    glow: 'shadow-purple-400/5',
  },
  red: {
    icon: 'text-red-400',
    iconBg: 'bg-red-400/10',
    border: 'border-red-400/10',
    glow: 'shadow-red-400/5',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'yellow',
  isLoading = false,
}: StatCardProps) {
  const colors = colorMap[color];

  const TrendIcon =
    trend === undefined ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend === undefined
      ? 'text-[#6B7280]'
      : trend > 0
      ? 'text-emerald-400'
      : trend < 0
      ? 'text-red-400'
      : 'text-[#6B7280]';

  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl" />
          <div className="w-16 h-5 bg-[#1A1A1A] rounded" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-24 h-4 bg-[#1A1A1A] rounded" />
          <div className="w-32 h-7 bg-[#1A1A1A] rounded" />
          <div className="w-20 h-3 bg-[#1A1A1A] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group bg-[#111111] border rounded-2xl p-6 transition-all duration-300',
        'hover:bg-[#151515] hover:shadow-xl hover:-translate-y-0.5',
        colors.border,
        `shadow-lg ${colors.glow}`
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} size={20} />
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-white text-2xl font-bold mt-1 tracking-tight">{value}</p>
        {subtitle && <p className="text-[#6B7280] text-xs mt-1">{subtitle}</p>}
        {trendLabel && (
          <p className="text-[#4D4D4D] text-xs mt-2 border-t border-[#1A1A1A] pt-2">
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
}
