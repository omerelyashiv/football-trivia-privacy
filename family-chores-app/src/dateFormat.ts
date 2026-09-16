const WEEKDAY_LABELS = ['יום א', 'יום ב', 'יום ג', 'יום ד', 'יום ה', 'יום ו', 'שבת'];

export function formatDueAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const dayMonth = `${date.getDate()}/${date.getMonth() + 1}`;

  if (isToday) return `היום · ${time}`;
  if (isTomorrow) return `מחר · ${time}`;
  return `${WEEKDAY_LABELS[date.getDay()]} ${dayMonth} · ${time}`;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function addDaysAt(daysFromNow: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Formats a date-only ISO string (no time-of-day info implied) for display.
export function formatDueDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const dayMonth = `${date.getDate()}/${date.getMonth() + 1}`;

  if (isToday) return 'היום';
  if (isTomorrow) return 'מחר';
  return `${WEEKDAY_LABELS[date.getDay()]} ${dayMonth}`;
}

// Builds a Date for the next occurrence of a given day/month (rolls to next
// year if that day/month has already passed this year), at a fixed hour.
export function buildDateFromDayMonth(day: number, month: number, hour: number, minute: number): Date {
  const now = new Date();
  let year = now.getFullYear();
  let candidate = new Date(year, month - 1, day, hour, minute, 0, 0);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (new Date(year, month - 1, day) < todayMidnight) {
    year += 1;
    candidate = new Date(year, month - 1, day, hour, minute, 0, 0);
  }
  return candidate;
}
