import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { Chore, FamilyMember, Assignments, DoneMap, PointsBalance, DAYS, DayOfWeek } from '../types';
import { generateId } from '../id';
import AssignPickerModal from './AssignPickerModal';

interface Props {
  chores: Chore[];
  members: FamilyMember[];
  assignments: Assignments;
  done: DoneMap;
  pointsBalance: PointsBalance;
  onChoresChange: (chores: Chore[]) => void;
  onAssignmentsChange: (assignments: Assignments) => void;
  onDoneChange: (done: DoneMap) => void;
  onPointsBalanceChange: (pointsBalance: PointsBalance) => void;
}

const NAME_COL_WIDTH = 116;
const DAY_COL_WIDTH = 86;
const DEFAULT_POINTS = 5;
const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const SHORT_DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'א', 1: 'ב', 2: 'ג', 3: 'ד', 4: 'ה', 5: 'ו', 6: 'ש',
};

export default function ChoresTable({
  chores,
  members,
  assignments,
  done,
  pointsBalance,
  onChoresChange,
  onAssignmentsChange,
  onDoneChange,
  onPointsBalanceChange,
}: Props) {
  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState(String(DEFAULT_POINTS));
  const [newChoreDays, setNewChoreDays] = useState<Set<DayOfWeek>>(new Set(ALL_DAYS));
  const [picker, setPicker] = useState<{ choreId: string; day: DayOfWeek } | null>(null);

  function toggleNewChoreDay(day: DayOfWeek) {
    const next = new Set(newChoreDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setNewChoreDays(next);
  }

  function addChore() {
    const trimmed = newChoreName.trim();
    if (!trimmed || newChoreDays.size === 0) return;
    const points = Math.max(0, parseInt(newChorePoints, 10) || 0);
    const days = ALL_DAYS.filter((d) => newChoreDays.has(d));
    onChoresChange([...chores, { id: generateId(), name: trimmed, points, days }]);
    setNewChoreName('');
    setNewChorePoints(String(DEFAULT_POINTS));
    setNewChoreDays(new Set(ALL_DAYS));
  }

  function removeChore(id: string) {
    const chore = chores.find((c) => c.id === id);
    Alert.alert('הסרת מטלה', `להסיר את "${chore?.name ?? ''}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'הסר',
        style: 'destructive',
        onPress: () => onChoresChange(chores.filter((c) => c.id !== id)),
      },
    ]);
  }

  function memberFor(choreId: string, day: DayOfWeek): FamilyMember | undefined {
    const memberId = assignments[choreId]?.[day];
    return members.find((m) => m.id === memberId);
  }

  function assign(choreId: string, day: DayOfWeek, memberId: string | undefined) {
    const next: Assignments = { ...assignments, [choreId]: { ...assignments[choreId] } };
    if (memberId) next[choreId][day] = memberId;
    else delete next[choreId][day];
    onAssignmentsChange(next);
  }

  function toggleDone(chore: Chore, day: DayOfWeek) {
    const current = done[chore.id]?.[day] ?? false;
    const willBeDone = !current;
    const next: DoneMap = { ...done, [chore.id]: { ...done[chore.id], [day]: willBeDone } };
    onDoneChange(next);

    const memberId = assignments[chore.id]?.[day];
    if (memberId && chore.points > 0) {
      const delta = willBeDone ? chore.points : -chore.points;
      const currentBalance = pointsBalance[memberId] ?? 0;
      onPointsBalanceChange({ ...pointsBalance, [memberId]: currentBalance + delta });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.cell, styles.nameCol, styles.headerCell]}>
              <Text style={styles.headerText}>מטלה</Text>
            </View>
            {DAYS.map((d) => (
              <View key={d.key} style={[styles.cell, styles.dayCol, styles.headerCell]}>
                <Text style={styles.headerText}>{d.label}</Text>
              </View>
            ))}
          </View>

          {chores.map((chore) => (
            <View key={chore.id} style={styles.row}>
              <View style={[styles.cell, styles.nameCol]}>
                <View style={styles.nameHeaderRow}>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => removeChore(chore.id)}>
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.choreName} numberOfLines={2}>
                    {chore.name}
                  </Text>
                </View>
                {chore.points > 0 && (
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>⭐ {chore.points}</Text>
                  </View>
                )}
              </View>
              {DAYS.map((d) => {
                const applies = chore.days.includes(d.key);
                if (!applies) {
                  return <View key={d.key} style={[styles.cell, styles.dayCol]} />;
                }
                const member = memberFor(chore.id, d.key);
                const isDone = done[chore.id]?.[d.key] ?? false;
                return (
                  <View key={d.key} style={[styles.cell, styles.dayCol]}>
                    {member ? (
                      <View style={[styles.assignBox, { backgroundColor: member.color }, isDone && styles.assignBoxDone]}>
                        <TouchableOpacity style={styles.doneCheckbox} onPress={() => toggleDone(chore, d.key)}>
                          <Text style={styles.doneCheckboxMark}>{isDone ? '✓' : ''}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.assignedNameArea}
                          onPress={() => setPicker({ choreId: chore.id, day: d.key })}
                        >
                          <Text style={styles.assignedText} numberOfLines={1}>
                            {member.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.assignBox, styles.assignBoxEmpty]}
                        onPress={() => setPicker({ choreId: chore.id, day: d.key })}
                      >
                        <Text style={styles.emptyText}>הקצה</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.addChoreBox}>
        <TextInput
          style={styles.input}
          placeholder="הוסף מטלה חדשה..."
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
        <Text style={styles.label}>באילו ימים:</Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayChip, newChoreDays.has(d) && styles.dayChipSelected]}
              onPress={() => toggleNewChoreDay(d)}
            >
              <Text style={[styles.dayChipText, newChoreDays.has(d) && styles.dayChipTextSelected]}>
                {SHORT_DAY_LABELS[d]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addChore}>
          <Text style={styles.addButtonText}>הוסף מטלה</Text>
        </TouchableOpacity>
      </View>
      {chores.length > 0 && (
        <Text style={styles.hint}>לחיצה על "הקצה" = שיוך בן משפחה · לחיצה על העיגול = סימון בוצע · ✕ = הסרה</Text>
      )}

      <AssignPickerModal
        visible={picker !== null}
        members={members}
        onClose={() => setPicker(null)}
        onSelect={(memberId) => {
          if (picker) assign(picker.choreId, picker.day, memberId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 4 },
  headerRow: { flexDirection: 'row-reverse' },
  row: { flexDirection: 'row-reverse', borderTopWidth: 1, borderTopColor: '#eee' },
  cell: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  nameCol: { width: NAME_COL_WIDTH, alignItems: 'flex-end', paddingRight: 6 },
  dayCol: { width: DAY_COL_WIDTH },
  headerCell: { paddingVertical: 10 },
  headerText: { fontWeight: '700', fontSize: 12, color: '#444' },
  nameHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  choreName: { fontSize: 13, fontWeight: '600', color: '#222', textAlign: 'right', flexShrink: 1 },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { fontSize: 11, color: '#999', fontWeight: '700' },
  pointsBadge: {
    backgroundColor: '#FFF3D6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 3,
  },
  pointsBadgeText: { fontSize: 10, color: '#B8860B', fontWeight: '700' },
  assignBox: {
    width: '100%',
    minHeight: 44,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  assignBoxEmpty: { backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#e3e3e3', borderStyle: 'dashed', justifyContent: 'center' },
  assignBoxDone: { opacity: 0.5 },
  doneCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheckboxMark: { color: '#fff', fontWeight: '900', fontSize: 11 },
  assignedNameArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  assignedText: { color: '#fff', fontWeight: '600', fontSize: 11 },
  emptyText: { color: '#aaa', fontSize: 11, fontWeight: '600' },
  addChoreBox: { paddingHorizontal: 16, marginTop: 14, gap: 6 },
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
  daysRow: { flexDirection: 'row-reverse', gap: 6 },
  dayChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: { backgroundColor: '#FF6B35' },
  dayChipText: { fontSize: 13, color: '#666', fontWeight: '600' },
  dayChipTextSelected: { color: '#fff' },
  addButton: { backgroundColor: '#123B27', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 8, paddingHorizontal: 16 },
});
