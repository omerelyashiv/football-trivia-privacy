import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getMonthGrid, formatMonthYear, toDateKey, todayKey, weekdayShortLabel } from '../calendar';
import { DayOfWeek } from '../types';

interface Props {
  year: number;
  month: number; // 0-11
  selectedDateKey: string;
  markedDateKeys: Set<string>;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAY_ORDER: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export default function MonthCalendar({
  year,
  month,
  selectedDateKey,
  markedDateKeys,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const weeks = getMonthGrid(year, month);
  const today = todayKey();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navButton} onPress={onNextMonth}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthYear(year, month)}</Text>
        <TouchableOpacity style={styles.navButton} onPress={onPrevMonth}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_ORDER.map((d) => (
          <Text key={d} style={styles.weekdayLabel}>
            {weekdayShortLabel(d)}
          </Text>
        ))}
      </View>

      {weeks.map((week, i) => (
        <View key={i} style={styles.weekRow}>
          {week.map((date, j) => {
            if (!date) return <View key={j} style={styles.dayCell} />;
            const key = toDateKey(date);
            const isSelected = key === selectedDateKey;
            const isToday = key === today;
            const hasChores = markedDateKeys.has(key);
            return (
              <TouchableOpacity key={j} style={styles.dayCell} onPress={() => onSelectDate(key)}>
                <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isToday && !isSelected && styles.dayTextToday]}>
                    {date.getDate()}
                  </Text>
                </View>
                {hasChores && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingTop: 8 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 8 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: '#123B27', minWidth: 120, textAlign: 'center' },
  navButton: { paddingHorizontal: 10, paddingVertical: 4 },
  navButtonText: { fontSize: 22, color: '#FF6B35', fontWeight: '700' },
  weekdayRow: { flexDirection: 'row-reverse', marginBottom: 4 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#999', fontWeight: '600' },
  weekRow: { flexDirection: 'row-reverse' },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayCircleSelected: { backgroundColor: '#FF6B35' },
  dayText: { fontSize: 13, color: '#333' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: '#FF6B35', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#7768AE', marginTop: 2 },
  dotSelected: { backgroundColor: '#FF6B35' },
});
