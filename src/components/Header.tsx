'use client';

import { Bell, RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Header({ title, subtitle, onRefresh, isLoading }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString('uz-UZ', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#222222] px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h2 className="text-white text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-[#9CA3AF] text-sm mt-0.5">{subtitle}</p>}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Time */}
          <div className="flex items-center gap-2 text-[#6B7280] text-sm">
            <Clock size={14} />
            <span>{currentTime}</span>
          </div>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#F5A623]/30 rounded-lg text-[#9CA3AF] hover:text-white text-sm transition-all duration-200"
            >
              <RefreshCw
                size={14}
                className={isLoading ? 'animate-spin text-[#F5A623]' : ''}
              />
              <span>Yangilash</span>
            </button>
          )}

          {/* Notifications */}
          <button className="relative w-9 h-9 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-white transition-all duration-200 group">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full animate-pulse" />
          </button>

          {/* Brand badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-lg">
            <div className="w-1.5 h-1.5 bg-[#F5A623] rounded-full animate-pulse" />
            <span className="text-[#F5A623] text-xs font-semibold">24/7 FAOL</span>
          </div>
        </div>
      </div>
    </header>
  );
}
