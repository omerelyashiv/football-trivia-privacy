export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 0, label: 'ראשון' },
  { key: 1, label: 'שני' },
  { key: 2, label: 'שלישי' },
  { key: 3, label: 'רביעי' },
  { key: 4, label: 'חמישי' },
  { key: 5, label: 'שישי' },
  { key: 6, label: 'שבת' },
];

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

export interface Chore {
  id: string;
  name: string;
  points: number;
  date: string; // ISO date (YYYY-MM-DD) - the anchor/first occurrence
  assignedTo: string[]; // FamilyMember ids, can be more than one
  repeatWeekly: boolean; // if true, this chore also occurs every week on the same weekday from `date` onward
  doneDates: string[]; // ISO dates (YYYY-MM-DD) on which this chore (or a weekly occurrence of it) was marked done
}

export interface Reminder {
  id: string;
  text: string;
  dueAt?: string; // ISO datetime string, undefined = no specific date
  assignedTo?: string; // FamilyMember id
  done: boolean;
  notificationId?: string;
}

export const HOMEWORK_REMINDER_OFFSETS = [7, 3, 1] as const;
export type HomeworkReminderOffset = (typeof HOMEWORK_REMINDER_OFFSETS)[number];

export interface Homework {
  id: string;
  subject: string; // מקצוע
  task: string; // שם המטלה
  pages?: string; // אילו עמודים/פרטים
  dueAt: string; // ISO date - when it needs to be submitted/finished
  assignedTo?: string; // FamilyMember id
  reminderOffsets: HomeworkReminderOffset[]; // days-before-due reminders that were requested
  notificationIds: string[];
  points: number;
  done: boolean;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
}

// pointsBalance[memberId] = accumulated points
export type PointsBalance = Record<string, number>;

export interface AppData {
  members: FamilyMember[];
  chores: Chore[];
  reminders: Reminder[];
  homework: Homework[];
  rewards: Reward[];
  pointsBalance: PointsBalance;
}
