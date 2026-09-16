import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Homework,
  FamilyMember,
  PointsBalance,
  HomeworkReminderOffset,
  HOMEWORK_REMINDER_OFFSETS,
} from '../types';
import { generateId } from '../id';
import { formatDueDate, isOverdue, buildDateFromDayMonth } from '../dateFormat';
import { scheduleReminderNotification, cancelReminderNotification } from '../notifications';
import AssignPickerModal from './AssignPickerModal';

interface Props {
  homework: Homework[];
  members: FamilyMember[];
  pointsBalance: PointsBalance;
  onChange: (homework: Homework[]) => void;
  onPointsBalanceChange: (pointsBalance: PointsBalance) => void;
}

const OFFSET_LABELS: Record<HomeworkReminderOffset, string> = {
  7: 'שבוע לפני',
  3: '3 ימים לפני',
  1: 'ערב לפני',
};

const DUE_PRESETS = [
  { label: 'מחר', days: 1 },
  { label: 'בעוד 3 ימים', days: 3 },
  { label: 'בעוד שבוע', days: 7 },
  { label: 'בעוד שבועיים', days: 14 },
];

const DEFAULT_POINTS = 10;
const DATE_COL_WIDTH = 62;
const SUBJECT_COL_WIDTH = 84;
const TASK_COL_WIDTH = 140;
const POINTS_COL_WIDTH = 46;
const DONE_COL_WIDTH = 36;
const DELETE_COL_WIDTH = 32;

function todayPlus(days: number): { day: string; month: string } {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return { day: String(d.getDate()), month: String(d.getMonth() + 1) };
}

export default function HomeworkPlanner({ homework, members, pointsBalance, onChange, onPointsBalanceChange }: Props) {
  const initial = todayPlus(1);
  const [subject, setSubject] = useState('');
  const [task, setTask] = useState('');
  const [pages, setPages] = useState('');
  const [points, setPoints] = useState(String(DEFAULT_POINTS));
  const [dueDay, setDueDay] = useState(initial.day);
  const [dueMonth, setDueMonth] = useState(initial.month);
  const [offsets, setOffsets] = useState<Set<HomeworkReminderOffset>>(new Set([7, 3, 1]));
  const [assignFor, setAssignFor] = useState<string | null>(null);

  function toggleOffset(o: HomeworkReminderOffset) {
    const next = new Set(offsets);
    if (next.has(o)) next.delete(o);
    else next.add(o);
    setOffsets(next);
  }

  function applyPreset(days: number) {
    const { day, month } = todayPlus(days);
    setDueDay(day);
    setDueMonth(month);
  }

  async function addHomework() {
    const subjectTrimmed = subject.trim();
    const taskTrimmed = task.trim();
    const day = parseInt(dueDay, 10);
    const month = parseInt(dueMonth, 10);
    if (!subjectTrimmed || !taskTrimmed) return;
    if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
      Alert.alert('תאריך לא תקין', 'בדקו את היום והחודש שהוזנו');
      return;
    }

    const dueDate = buildDateFromDayMonth(day, month, 8, 0);
    const selectedOffsets = Array.from(offsets).sort((a, b) => b - a);
    const notificationIds: string[] = [];
    for (const offset of selectedOffsets) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(dueDate.getDate() - offset);
      reminderDate.setHours(offset === 1 ? 19 : 17, 0, 0, 0);
      const title = `שיעורי בית: ${subjectTrimmed}`;
      const body = pages.trim() ? `${taskTrimmed} · עמ' ${pages.trim()}` : taskTrimmed;
      const id = await scheduleReminderNotification(title, body, reminderDate);
      if (id) notificationIds.push(id);
    }

    const item: Homework = {
      id: generateId(),
      subject: subjectTrimmed,
      task: taskTrimmed,
      pages: pages.trim() || undefined,
      dueAt: dueDate.toISOString(),
      reminderOffsets: selectedOffsets,
      notificationIds,
      points: Math.max(0, parseInt(points, 10) || 0),
      done: false,
    };
    onChange([...homework, item]);
    setSubject('');
    setTask('');
    setPages('');
    setPoints(String(DEFAULT_POINTS));
    const next = todayPlus(1);
    setDueDay(next.day);
    setDueMonth(next.month);
  }

  async function toggleDone(item: Homework) {
    const willBeDone = !item.done;
    if (willBeDone) {
      await Promise.all(item.notificationIds.map((n) => cancelReminderNotification(n)));
    }
    onChange(
      homework.map((h) =>
        h.id === item.id ? { ...h, done: willBeDone, notificationIds: willBeDone ? [] : h.notificationIds } : h
      )
    );

    if (item.assignedTo && item.points > 0) {
      const delta = willBeDone ? item.points : -item.points;
      const currentBalance = pointsBalance[item.assignedTo] ?? 0;
      onPointsBalanceChange({ ...pointsBalance, [item.assignedTo]: currentBalance + delta });
    }
  }

  function removeHomework(id: string) {
    const item = homework.find((h) => h.id === id);
    Alert.alert('מחיקת שיעורי בית', `למחוק את "${item?.task ?? ''}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          await Promise.all((item?.notificationIds ?? []).map((n) => cancelReminderNotification(n)));
          onChange(homework.filter((h) => h.id !== id));
        },
      },
    ]);
  }

  function assignMember(id: string, memberId: string | undefined) {
    onChange(homework.map((h) => (h.id === id ? { ...h, assignedTo: memberId } : h)));
  }

  const sorted = [...homework].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  const assignTarget = homework.find((h) => h.id === assignFor);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 שיעורי בית</Text>

      {homework.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={[styles.cell, styles.dateCol, styles.headerCell]}>
                <Text style={styles.headerText}>תאריך</Text>
              </View>
              <View style={[styles.cell, styles.subjectCol, styles.headerCell]}>
                <Text style={styles.headerText}>מקצוע</Text>
              </View>
              <View style={[styles.cell, styles.taskCol, styles.headerCell]}>
                <Text style={styles.headerText}>מה לעשות</Text>
              </View>
              <View style={[styles.cell, styles.pointsCol, styles.headerCell]}>
                <Text style={styles.headerText}>⭐</Text>
              </View>
              <View style={[styles.cell, styles.doneCol, styles.headerCell]}>
                <Text style={styles.headerText}>✓</Text>
              </View>
              <View style={[styles.cell, styles.deleteCol, styles.headerCell]} />
            </View>

            {sorted.map((h) => {
              const member = members.find((m) => m.id === h.assignedTo);
              const overdue = !h.done && isOverdue(h.dueAt);
              return (
                <View key={h.id} style={styles.row}>
                  <View style={[styles.cell, styles.dateCol]}>
                    <Text style={[styles.dateText, overdue && styles.overdueText]}>{formatDueDate(h.dueAt)}</Text>
                  </View>
                  <View style={[styles.cell, styles.subjectCol]}>
                    <Text style={[styles.subjectText, h.done && styles.doneText]} numberOfLines={2}>
                      {h.subject}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.cell, styles.taskCol]} onPress={() => setAssignFor(h.id)}>
                    <Text style={[styles.taskText, h.done && styles.doneText]} numberOfLines={2}>
                      {h.task}
                      {h.pages ? ` · עמ' ${h.pages}` : ''}
                    </Text>
                    {member ? (
                      <View style={[styles.memberChip, { backgroundColor: member.color }]}>
                        <Text style={styles.memberChipText}>{member.name}</Text>
                      </View>
                    ) : (
                      <Text style={styles.assignHint}>שייך לילד/ה</Text>
                    )}
                  </TouchableOpacity>
                  <View style={[styles.cell, styles.pointsCol]}>
                    <Text style={styles.pointsText}>{h.points}</Text>
                  </View>
                  <View style={[styles.cell, styles.doneCol]}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleDone(h)}>
                      <Text style={styles.checkboxMark}>{h.done ? '✓' : ''}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.cell, styles.deleteCol]}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => removeHomework(h.id)}>
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      {homework.length === 0 && <Text style={styles.empty}>אין שיעורי בית רשומים</Text>}

      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="מקצוע (לדוגמה: מתמטיקה)"
          placeholderTextColor="#999"
          value={subject}
          onChangeText={setSubject}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="מה צריך לעשות (לדוגמה: תרגילים לחזרה)"
          placeholderTextColor="#999"
          value={task}
          onChangeText={setTask}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="עמודים / פרטים נוספים (רשות)"
          placeholderTextColor="#999"
          value={pages}
          onChangeText={setPages}
          textAlign="right"
        />

        <Text style={styles.label}>להגיש עד:</Text>
        <View style={styles.presetsRow}>
          {DUE_PRESETS.map((p) => (
            <TouchableOpacity key={p.label} style={styles.presetChip} onPress={() => applyPreset(p.days)}>
              <Text style={styles.presetChipText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            placeholder="יום"
            placeholderTextColor="#999"
            value={dueDay}
            onChangeText={setDueDay}
            keyboardType="number-pad"
            textAlign="center"
          />
          <Text style={styles.dateSeparator}>/</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="חודש"
            placeholderTextColor="#999"
            value={dueMonth}
            onChangeText={setDueMonth}
            keyboardType="number-pad"
            textAlign="center"
          />
          <Text style={styles.label}>נקודות:</Text>
          <TextInput
            style={styles.pointsInput}
            placeholder="נק'"
            placeholderTextColor="#999"
            value={points}
            onChangeText={setPoints}
            keyboardType="number-pad"
            textAlign="center"
          />
        </View>

        <Text style={styles.label}>תזכורות:</Text>
        <View style={styles.presetsRow}>
          {HOMEWORK_REMINDER_OFFSETS.map((o) => (
            <TouchableOpacity
              key={o}
              style={[styles.offsetChip, offsets.has(o) && styles.offsetChipSelected]}
              onPress={() => toggleOffset(o)}
            >
              <Text style={[styles.offsetChipText, offsets.has(o) && styles.offsetChipTextSelected]}>
                {OFFSET_LABELS[o]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addHomework}>
          <Text style={styles.addButtonText}>הוסף שיעורי בית</Text>
        </TouchableOpacity>
      </View>
      {homework.length > 0 && (
        <Text style={styles.hint}>לחיצה על "מה לעשות" = שיוך לילד/ה · ✕ = מחיקה</Text>
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
  title: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'right', marginBottom: 10 },
  headerRow: { flexDirection: 'row-reverse' },
  row: { flexDirection: 'row-reverse', borderTopWidth: 1, borderTopColor: '#eee' },
  cell: { padding: 6, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f2f2f2' },
  headerCell: { paddingVertical: 8, backgroundColor: '#FAF8F5' },
  headerText: { fontWeight: '700', fontSize: 11, color: '#444' },
  dateCol: { width: DATE_COL_WIDTH },
  subjectCol: { width: SUBJECT_COL_WIDTH, alignItems: 'flex-end', paddingRight: 8 },
  taskCol: { width: TASK_COL_WIDTH, alignItems: 'flex-end', paddingRight: 8 },
  pointsCol: { width: POINTS_COL_WIDTH },
  doneCol: { width: DONE_COL_WIDTH },
  deleteCol: { width: DELETE_COL_WIDTH },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { fontSize: 11, color: '#999', fontWeight: '700' },
  dateText: { fontSize: 11, color: '#555', textAlign: 'center' },
  overdueText: { color: '#c33', fontWeight: '700' },
  subjectText: { fontSize: 12, fontWeight: '700', color: '#7768AE', textAlign: 'right' },
  taskText: { fontSize: 12, color: '#222', textAlign: 'right' },
  doneText: { textDecorationLine: 'line-through', color: '#999' },
  pointsText: { fontSize: 12, fontWeight: '700', color: '#B8860B' },
  memberChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  memberChipText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  assignHint: { fontSize: 10, color: '#4D9DE0', textAlign: 'right', marginTop: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#123B27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: { color: '#123B27', fontWeight: '900', fontSize: 12 },
  empty: { textAlign: 'right', color: '#999', fontSize: 13, paddingVertical: 8 },
  addBox: { marginTop: 14, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  label: { fontSize: 12, color: '#666', textAlign: 'right', marginTop: 6, fontWeight: '600' },
  presetsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  presetChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f2f2f2' },
  presetChipText: { fontSize: 12, color: '#555' },
  dateRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  dateInput: {
    width: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  dateSeparator: { fontSize: 16, color: '#999' },
  pointsInput: {
    width: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  offsetChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f2f2f2' },
  offsetChipSelected: { backgroundColor: '#7768AE' },
  offsetChipText: { fontSize: 12, color: '#555' },
  offsetChipTextSelected: { color: '#fff', fontWeight: '600' },
  addButton: { backgroundColor: '#FF6B35', paddingVertical: 10, borderRadius: 10, marginTop: 6, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 8 },
});
