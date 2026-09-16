import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Reminder, FamilyMember } from '../types';
import { generateId } from '../id';
import { formatDueAt, isOverdue, addDaysAt } from '../dateFormat';
import { scheduleReminderNotification, cancelReminderNotification } from '../notifications';
import AssignPickerModal from './AssignPickerModal';

interface Props {
  reminders: Reminder[];
  members: FamilyMember[];
  onChange: (reminders: Reminder[]) => void;
}

type QuickOption = { label: string; get: () => Date | undefined };

const QUICK_OPTIONS: QuickOption[] = [
  { label: 'היום בערב', get: () => addDaysAt(0, 18, 0) },
  { label: 'מחר בבוקר', get: () => addDaysAt(1, 8, 0) },
  { label: 'בעוד 3 ימים', get: () => addDaysAt(3, 8, 0) },
  { label: 'בעוד שבוע', get: () => addDaysAt(7, 8, 0) },
  { label: 'ללא תאריך', get: () => undefined },
];

export default function RemindersList({ reminders, members, onChange }: Props) {
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState(1); // default: מחר בבוקר
  const [assignFor, setAssignFor] = useState<string | null>(null);

  async function addReminder() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const dueDate = QUICK_OPTIONS[selectedOption].get();
    const id = generateId();
    let notificationId: string | undefined;
    if (dueDate) {
      notificationId = await scheduleReminderNotification('תזכורת', trimmed, dueDate);
    }
    const reminder: Reminder = {
      id,
      text: trimmed,
      dueAt: dueDate?.toISOString(),
      done: false,
      notificationId,
    };
    onChange([...reminders, reminder]);
    setText('');
  }

  async function toggleDone(id: string) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    if (!reminder.done) {
      await cancelReminderNotification(reminder.notificationId);
    }
    onChange(
      reminders.map((r) => (r.id === id ? { ...r, done: !r.done, notificationId: r.done ? r.notificationId : undefined } : r))
    );
  }

  function removeReminder(id: string) {
    const reminder = reminders.find((r) => r.id === id);
    Alert.alert('מחיקת תזכורת', `למחוק את "${reminder?.text ?? ''}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          await cancelReminderNotification(reminder?.notificationId);
          onChange(reminders.filter((r) => r.id !== id));
        },
      },
    ]);
  }

  function assignMember(id: string, memberId: string | undefined) {
    onChange(reminders.map((r) => (r.id === id ? { ...r, assignedTo: memberId } : r)));
  }

  const sorted = [...reminders].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  const assignTarget = reminders.find((r) => r.id === assignFor);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תזכורות (שיעורי בית וכו')</Text>

      {sorted.map((r) => {
        const member = members.find((m) => m.id === r.assignedTo);
        const overdue = !r.done && r.dueAt && isOverdue(r.dueAt);
        return (
          <View key={r.id} style={styles.row}>
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleDone(r.id)}>
              <Text style={styles.checkboxMark}>{r.done ? '✓' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowBody} onLongPress={() => removeReminder(r.id)}>
              <Text style={[styles.rowText, r.done && styles.rowTextDone]} numberOfLines={2}>
                {r.text}
              </Text>
              <View style={styles.metaRow}>
                {r.dueAt && (
                  <Text style={[styles.metaText, overdue && styles.overdueText]}>
                    {overdue ? 'עבר הזמן · ' : ''}
                    {formatDueAt(r.dueAt)}
                  </Text>
                )}
                <TouchableOpacity onPress={() => setAssignFor(r.id)}>
                  {member ? (
                    <View style={[styles.memberChip, { backgroundColor: member.color }]}>
                      <Text style={styles.memberChipText}>{member.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.assignHint}>שייך למישהו</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {reminders.length === 0 && <Text style={styles.empty}>אין תזכורות עדיין</Text>}

      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="לדוגמה: שיעורי בית במתמטיקה..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          textAlign="right"
        />
        <View style={styles.optionsRow}>
          {QUICK_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionChip, selectedOption === i && styles.optionChipSelected]}
              onPress={() => setSelectedOption(i)}
            >
              <Text style={[styles.optionText, selectedOption === i && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addReminder}>
          <Text style={styles.addButtonText}>הוסף תזכורת</Text>
        </TouchableOpacity>
      </View>
      {reminders.length > 0 && (
        <Text style={styles.hint}>לחיצה ארוכה על תזכורת = מחיקה</Text>
      )}

      <AssignPickerModal
        visible={assignFor !== null}
        members={members}
        onClose={() => setAssignFor(null)}
        onSelect={(memberId) => {
          if (assignTarget) assignMember(assignTarget.id, memberId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'right', marginBottom: 10 },
  row: { flexDirection: 'row-reverse', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 10 },
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
  rowBody: { flex: 1 },
  rowText: { fontSize: 14, color: '#222', textAlign: 'right', fontWeight: '600' },
  rowTextDone: { textDecorationLine: 'line-through', color: '#999' },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 4 },
  metaText: { fontSize: 12, color: '#777' },
  overdueText: { color: '#c33', fontWeight: '700' },
  memberChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  memberChipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  assignHint: { fontSize: 12, color: '#4D9DE0' },
  empty: { textAlign: 'right', color: '#999', fontSize: 13, paddingVertical: 8 },
  addBox: { marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  optionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f2f2f2' },
  optionChipSelected: { backgroundColor: '#123B27' },
  optionText: { fontSize: 12, color: '#555' },
  optionTextSelected: { color: '#fff', fontWeight: '600' },
  addButton: { backgroundColor: '#123B27', paddingVertical: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 8 },
});
