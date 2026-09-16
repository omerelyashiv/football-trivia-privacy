import { DayOfWeek } from './types';

const WEEKDAY_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const WEEKDAY_LABELS = ['יום א', 'יום ב', 'יום ג', 'יום ד', 'יום ה', 'יום ו', 'שבת'];
const MONTH_NAMES_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysToKey(key: string, days: number): string {
  const d = dateKeyToDate(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function weekdayOfKey(key: string): DayOfWeek {
  return dateKeyToDate(key).getDay() as DayOfWeek;
}

export function weekdayShortLabel(day: DayOfWeek): string {
  return WEEKDAY_SHORT[day];
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES_HE[month]} ${year}`;
}

export function formatDayHeading(key: string): string {
  const date = dateKeyToDate(key);
  const today = todayKey();
  const tomorrow = addDaysToKey(today, 1);
  const yesterday = addDaysToKey(today, -1);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const dayMonth = `${date.getDate()}/${date.getMonth() + 1}`;
  if (key === today) return `היום · ${weekday} ${dayMonth}`;
  if (key === tomorrow) return `מחר · ${weekday} ${dayMonth}`;
  if (key === yesterday) return `אתמול · ${weekday} ${dayMonth}`;
  return `${weekday} ${dayMonth}`;
}

// Sunday-start weeks of dates for a month calendar grid; null pads days outside the month.
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
