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
}

// assignments[choreId][day] = memberId | undefined
export type Assignments = Record<string, Partial<Record<DayOfWeek, string>>>;

// done[choreId][day] = true | undefined
export type DoneMap = Record<string, Partial<Record<DayOfWeek, boolean>>>;

export interface AppData {
  members: FamilyMember[];
  chores: Chore[];
  assignments: Assignments;
  done: DoneMap;
}
