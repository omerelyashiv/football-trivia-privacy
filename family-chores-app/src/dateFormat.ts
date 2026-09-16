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
