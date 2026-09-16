import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import { Chore, FamilyMember, PointsBalance } from '../types';
import { generateId } from '../id';
import { toDateKey, todayKey, weekdayOfKey, formatDayHeading } from '../calendar';
import MonthCalendar from './MonthCalendar';
import MultiAssignModal from './MultiAssignModal';

interface Props {
  chores: Chore[];
  members: FamilyMember[];
  pointsBalance: PointsBalance;
  onChoresChange: (chores: Chore[]) => void;
  onPointsBalanceChange: (pointsBalance: PointsBalance) => void;
}

const DEFAULT_POINTS = 5;

function choresForDate(chores: Chore[], dateKey: string): Chore[] {
  return chores.filter((c) => {
    if (c.date === dateKey) return true;
    if (!c.repeatWeekly) return false;
    if (c.date > dateKey) return false;
    return weekdayOfKey(c.date) === weekdayOfKey(dateKey);
  });
}

export default function ChoresTable({ chores, members, pointsBalance, onChoresChange, onPointsBalanceChange }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey());

  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState(String(DEFAULT_POINTS));
  const [newChoreAssignees, setNewChoreAssignees] = useState<string[]>([]);
  const [newChoreRepeat, setNewChoreRepeat] = useState(false);
  const [newAssigneesModalOpen, setNewAssigneesModalOpen] = useState(false);
  const [editAssigneesFor, setEditAssigneesFor] = useState<string | null>(null);

  function goPrevMonth() {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function goNextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function toggleNewAssignee(memberId: string) {
    setNewChoreAssignees((cur) => (cur.includes(memberId) ? cur.filter((id) => id !== memberId) : [...cur, memberId]));
  }

  function addChore() {
    const trimmed = newChoreName.trim();
    if (!trimmed) return;
    const points = Math.max(0, parseInt(newChorePoints, 10) || 0);
    const chore: Chore = {
      id: generateId(),
      name: trimmed,
      points,
      date: selectedDateKey,
      assignedTo: newChoreAssignees,
      repeatWeekly: newChoreRepeat,
      doneDates: [],
    };
    onChoresChange([...chores, chore]);
    setNewChoreName('');
    setNewChorePoints(String(DEFAULT_POINTS));
    setNewChoreAssignees([]);
    setNewChoreRepeat(false);
  }

  function removeChore(id: string) {
    const chore = chores.find((c) => c.id === id);
    const message = chore?.repeatWeekly
      ? `להסיר את "${chore?.name ?? ''}"? זו מטלה חוזרת - כל המופעים העתידיים שלה יימחקו.`
      : `להסיר את "${chore?.name ?? ''}"?`;
    Alert.alert('הסרת מטלה', message, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'הסר', style: 'destructive', onPress: () => onChoresChange(chores.filter((c) => c.id !== id)) },
    ]);
  }

  function toggleDone(chore: Chore, dateKey: string) {
    const isDone = chore.doneDates.includes(dateKey);
    const nextDoneDates = isDone ? chore.doneDates.filter((d) => d !== dateKey) : [...chore.doneDates, dateKey];
    onChoresChange(chores.map((c) => (c.id === chore.id ? { ...c, doneDates: nextDoneDates } : c)));

    if (chore.points > 0 && chore.assignedTo.length > 0) {
      const delta = isDone ? -chore.points : chore.points;
      const nextBalance = { ...pointsBalance };
      for (const memberId of chore.assignedTo) {
        nextBalance[memberId] = (nextBalance[memberId] ?? 0) + delta;
      }
      onPointsBalanceChange(nextBalance);
    }
  }

  function setChoreAssignees(choreId: string, assignedTo: string[]) {
    onChoresChange(chores.map((c) => (c.id === choreId ? { ...c, assignedTo } : c)));
  }

  const dayChores = choresForDate(chores, selectedDateKey);
  const markedDateKeys = new Set<string>();
  for (let d = 1; d <= 31; d++) {
    const candidate = new Date(viewYear, viewMonth, d);
    if (candidate.getMonth() !== viewMonth) continue;
    const key = toDateKey(candidate);
    if (choresForDate(chores, key).length > 0) markedDateKeys.add(key);
  }

  const editTarget = chores.find((c) => c.id === editAssigneesFor);

  return (
    <View style={styles.container}>
      <MonthCalendar
        year={viewYear}
        month={viewMonth}
        selectedDateKey={selectedDateKey}
        markedDateKeys={markedDateKeys}
        onSelectDate={setSelectedDateKey}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
      />

      <Text style={styles.dayHeading}>{formatDayHeading(selectedDateKey)}</Text>

      <View style={styles.choresList}>
        {dayChores.map((chore) => {
          const isDone = chore.doneDates.includes(selectedDateKey);
          const assignees = members.filter((m) => chore.assignedTo.includes(m.id));
          return (
            <View key={chore.id} style={styles.choreRow}>
              <TouchableOpacity style={styles.checkbox} onPress={() => toggleDone(chore, selectedDateKey)}>
                <Text style={styles.checkboxMark}>{isDone ? '✓' : ''}</Text>
              </TouchableOpacity>
              <View style={styles.choreInfo}>
                <View style={styles.choreNameRow}>
                  {chore.repeatWeekly && <Text style={styles.repeatIcon}>🔁</Text>}
                  <Text style={[styles.choreName, isDone && styles.choreNameDone]} numberOfLines={2}>
                    {chore.name}
                  </Text>
                  {chore.points > 0 && (
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsBadgeText}>⭐ {chore.points}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.assigneesRow} onPress={() => setEditAssigneesFor(chore.id)}>
                  {assignees.length > 0 ? (
                    assignees.map((m) => (
                      <View key={m.id} style={[styles.assigneeChip, { backgroundColor: m.color }]}>
                        <Text style={styles.assigneeChipText}>{m.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.assignHint}>שייך למישהו</Text>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => removeChore(chore.id)}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {dayChores.length === 0 && <Text style={styles.empty}>אין מטלות ליום הזה</Text>}
      </View>

      <View style={styles.addChoreBox}>
        <TextInput
          style={styles.input}
          placeholder="הוסף מטלה ליום שנבחר..."
          placeholderTextColor="#999"
          value={newChoreName}
          onChangeText={setNewChoreName}
          onSubmitEditing={addChore}
          returnKeyType="done"
          textAlign="right"
        />

        <Text style={styles.label}>נקודות למטלה:</Text>
        <TextInput
          style={styles.pointsInput}
          placeholder="לדוגמה: 5"
          placeholderTextColor="#999"
          value={newChorePoints}
          onChangeText={setNewChorePoints}
          keyboardType="number-pad"
          textAlign="center"
        />

        <Text style={styles.label}>מי מבצע:</Text>
        <TouchableOpacity style={styles.assigneesPicker} onPress={() => setNewAssigneesModalOpen(true)}>
          {newChoreAssignees.length > 0 ? (
            <View style={styles.assigneesRow}>
              {members
                .filter((m) => newChoreAssignees.includes(m.id))
                .map((m) => (
                  <View key={m.id} style={[styles.assigneeChip, { backgroundColor: m.color }]}>
                    <Text style={styles.assigneeChipText}>{m.name}</Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.assignHint}>לחצו לבחירת מבצעים</Text>
          )}
        </TouchableOpacity>

        <View style={styles.repeatRow}>
          <Switch value={newChoreRepeat} onValueChange={setNewChoreRepeat} />
          <Text style={styles.label}>🔁 חוזר כל שבוע ביום הזה</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addChore}>
          <Text style={styles.addButtonText}>הוסף מטלה</Text>
        </TouchableOpacity>
      </View>

      <MultiAssignModal
        visible={newAssigneesModalOpen}
        members={members}
        selected={newChoreAssignees}
        onToggle={toggleNewAssignee}
        onClose={() => setNewAssigneesModalOpen(false)}
      />

      <MultiAssignModal
        visible={editAssigneesFor !== null}
        members={members}
        selected={editTarget?.assignedTo ?? []}
        onToggle={(memberId) => {
          if (!editTarget) return;
          const cur = editTarget.assignedTo;
          const next = cur.includes(memberId) ? cur.filter((id) => id !== memberId) : [...cur, memberId];
          setChoreAssignees(editTarget.id, next);
        }}
        onClose={() => setEditAssigneesFor(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 4 },
  dayHeading: { fontSize: 14, fontWeight: '700', color: '#123B27', textAlign: 'right', paddingHorizontal: 16, marginTop: 14, marginBottom: 6 },
  choresList: { paddingHorizontal: 16 },
  choreRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#123B27',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxMark: { color: '#123B27', fontWeight: '900', fontSize: 13 },
  choreInfo: { flex: 1 },
  choreNameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  repeatIcon: { fontSize: 12 },
  choreName: { fontSize: 14, fontWeight: '600', color: '#222', textAlign: 'right' },
  choreNameDone: { textDecorationLine: 'line-through', color: '#999' },
  pointsBadge: { backgroundColor: '#FFF3D6', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  pointsBadgeText: { fontSize: 10, color: '#B8860B', fontWeight: '700' },
  assigneesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  assigneeChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  assigneeChipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  assignHint: { fontSize: 12, color: '#4D9DE0', marginTop: 6 },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  deleteButtonText: { fontSize: 11, color: '#999', fontWeight: '700' },
  empty: { textAlign: 'right', color: '#999', fontSize: 13, paddingVertical: 8 },
  addChoreBox: { paddingHorizontal: 16, marginTop: 16, gap: 6, paddingTop: 14, borderTopWidth: 6, borderTopColor: '#F7F5F2' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  pointsInput: {
    alignSelf: 'flex-end',
    width: 90,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  label: { fontSize: 12, color: '#666', textAlign: 'right', fontWeight: '600', marginTop: 4 },
  assigneesPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  repeatRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 8 },
  addButton: { backgroundColor: '#123B27', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
