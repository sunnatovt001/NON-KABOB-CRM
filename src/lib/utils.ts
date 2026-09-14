// ─── Utility funksiyalar ──────────────────────────────────────────────────────

/**
 * So'mni formatlash: 45000 → "45 000 so'm"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

/**
 * Sonni qisqartirish: 1500000 → "1.5 mln"
 */
export function formatShortNumber(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' mln';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' ming';
  }
  return amount.toString();
}

/**
 * Sana formatlash
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Sana va vaqt formatlash
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('uz-UZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Buyurtma holati uchun rang va matn
 */
export function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    NEW: {
      label: 'Yangi',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      dot: 'bg-blue-400',
    },
    PREPARING: {
      label: 'Tayyorlanmoqda',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      dot: 'bg-yellow-400',
    },
    ON_THE_WAY: {
      label: "Yo'lda",
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      dot: 'bg-purple-400',
    },
    COMPLETED: {
      label: 'Yakunlandi',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      dot: 'bg-green-400',
    },
    CANCELLED: {
      label: 'Bekor qilindi',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      dot: 'bg-red-400',
    },
  };
  return configs[status] ?? configs['NEW'];
}

/**
 * clsx analog – className birlashtirish
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
