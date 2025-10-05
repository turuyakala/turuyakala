/**
 * Calculates time remaining until a given date
 */
export function getTimeUntilDeparture(departureDate: Date): {
  totalHours: number;
  days: number;
  hours: number;
  minutes: number;
  isUrgent: boolean;
} {
  const now = new Date();
  const diff = departureDate.getTime() - now.getTime();

  if (diff < 0) {
    return {
      totalHours: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      isUrgent: true,
    };
  }

  const totalHours = diff / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    totalHours,
    days,
    hours,
    minutes,
    isUrgent: totalHours <= 6,
  };
}

/**
 * Formats time until departure as human-readable string
 */
export function formatTimeUntilDeparture(departureDate: Date): string {
  const { days, hours, minutes, totalHours } = getTimeUntilDeparture(departureDate);

  if (totalHours <= 0) {
    return 'Kalkış geçti';
  }

  if (totalHours < 1) {
    return `${minutes} dakika kaldı`;
  }

  if (totalHours < 24) {
    return `${hours} saat ${minutes} dakika kaldı`;
  }

  if (days === 1) {
    return `1 gün ${hours} saat kaldı`;
  }

  return `${days} gün ${hours} saat kaldı`;
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date as short format
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

