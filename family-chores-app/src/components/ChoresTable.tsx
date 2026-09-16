import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { Chore, FamilyMember, Assignments, DoneMap, DAYS, DayOfWeek } from '../types';
import { generateId } from '../id';
import AssignPickerModal from './AssignPickerModal';

interface Props {
  chores: Chore[];
  members: FamilyMember[];
  assignments: Assignments;
  done: DoneMap;
  onChoresChange: (chores: Chore[]) => void;
  onAssignmentsChange: (assignments: Assignments) => void;
  onDoneChange: (done: DoneMap) => void;
}

const NAME_COL_WIDTH = 110;
const DAY_COL_WIDTH = 86;

export default function ChoresTable({
  chores,
  members,
  assignments,
  done,
  onChoresChange,
  onAssignmentsChange,
  onDoneChange,
}: Props) {
  const [newChoreName, setNewChoreName] = useState('');
  const [picker, setPicker] = useState<{ choreId: string; day: DayOfWeek } | null>(null);

  function addChore() {
    const trimmed = newChoreName.trim();
    if (!trimmed) return;
    onChoresChange([...chores, { id: generateId(), name: trimmed }]);
    setNewChoreName('');
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

  function toggleDone(choreId: string, day: DayOfWeek) {
    const current = done[choreId]?.[day] ?? false;
    const next: DoneMap = { ...done, [choreId]: { ...done[choreId], [day]: !current } };
    onDoneChange(next);
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
              <TouchableOpacity
                style={[styles.cell, styles.nameCol]}
                onLongPress={() => removeChore(chore.id)}
              >
                <Text style={styles.choreName} numberOfLines={2}>
                  {chore.name}
                </Text>
              </TouchableOpacity>
              {DAYS.map((d) => {
                const member = memberFor(chore.id, d.key);
                const isDone = done[chore.id]?.[d.key] ?? false;
                return (
                  <View key={d.key} style={[styles.cell, styles.dayCol]}>
                    <TouchableOpacity
                      style={[
                        styles.assignBox,
                        member ? { backgroundColor: member.color } : styles.assignBoxEmpty,
                        isDone && styles.assignBoxDone,
                      ]}
                      onPress={() => setPicker({ choreId: chore.id, day: d.key })}
                      onLongPress={() => member && toggleDone(chore.id, d.key)}
                    >
                      <Text
                        style={member ? styles.assignedText : styles.emptyText}
                        numberOfLines={1}
                      >
                        {member ? member.name : '—'}
                      </Text>
                      {isDone && <Text style={styles.doneCheck}>✓</Text>}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.addChoreRow}>
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
        <TouchableOpacity style={styles.addButton} onPress={addChore}>
          <Text style={styles.addButtonText}>הוסף</Text>
        </TouchableOpacity>
      </View>
      {chores.length > 0 && (
        <Text style={styles.hint}>לחיצה = שיוך בן משפחה · לחיצה ארוכה על תא משויך = סימון בוצע · לחיצה ארוכה על שם מטלה = הסרה</Text>
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
  nameCol: { width: NAME_COL_WIDTH, alignItems: 'flex-end', paddingRight: 10 },
  dayCol: { width: DAY_COL_WIDTH },
  headerCell: { paddingVertical: 10 },
  headerText: { fontWeight: '700', fontSize: 12, color: '#444' },
  choreName: { fontSize: 13, fontWeight: '600', color: '#222', textAlign: 'right' },
  assignBox: {
    width: '100%',
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  assignBoxEmpty: { backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#e3e3e3', borderStyle: 'dashed' },
  assignBoxDone: { opacity: 0.5 },
  assignedText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  emptyText: { color: '#bbb', fontSize: 14 },
  doneCheck: { position: 'absolute', top: 2, left: 4, color: '#fff', fontWeight: '900', fontSize: 12 },
  addChoreRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center', paddingHorizontal: 16, marginTop: 14 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: { backgroundColor: '#123B27', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  hint: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 8, paddingHorizontal: 16 },
});
