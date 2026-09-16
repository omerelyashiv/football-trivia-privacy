import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { FamilyMember } from '../types';

interface Props {
  visible: boolean;
  members: FamilyMember[];
  selected: string[];
  onToggle: (memberId: string) => void;
  onClose: () => void;
}

export default function MultiAssignModal({ visible, members, selected, onToggle, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>מי מבצע? (אפשר לבחור כמה)</Text>
          {members.length === 0 && <Text style={styles.empty}>הוסיפו בני משפחה קודם</Text>}
          {members.map((m) => {
            const isSelected = selected.includes(m.id);
            return (
              <TouchableOpacity key={m.id} style={styles.row} onPress={() => onToggle(m.id)}>
                <View style={[styles.checkbox, isSelected && { backgroundColor: m.color, borderColor: m.color }]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text style={styles.rowText}>{m.name}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>סיום</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 36 },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: 12, color: '#222' },
  empty: { textAlign: 'right', color: '#888', fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 10, gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontWeight: '900', fontSize: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowText: { fontSize: 15, color: '#222' },
  doneButton: { backgroundColor: '#123B27', paddingVertical: 12, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  doneButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
