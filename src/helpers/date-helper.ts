export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (years > 0) {
    return rtf.format(-years, 'year');
  } else if (months > 0) {
    return rtf.format(-months, 'month');
  } else if (weeks > 0) {
    return rtf.format(-weeks, 'week');
  } else if (days > 0) {
    return rtf.format(-days, 'day');
  } else if (hours > 0) {
    return rtf.format(-hours, 'hour');
  } else if (minutes > 0) {
    return rtf.format(-minutes, 'minute');
  } else {
    return 'just now';
  }
}

export function getEntityExpirationInfo(updatedAt: number, ttlDays: number): string {
  if (ttlDays === -1) {
    return `Updated ${getRelativeTime(updatedAt)}`;
  }

  const expirationTime = updatedAt + ttlDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = expirationTime - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (daysLeft > 0) {
    return `Expires in ${daysLeft}d`;
  }

  const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
  if (hoursLeft > 0) {
    return `Expires in ${hoursLeft}h`;
  }

  const minutesLeft = Math.floor(diff / (1000 * 60));
  return `Expires in ${minutesLeft}m`;
}
