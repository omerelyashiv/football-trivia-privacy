import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { FamilyMember } from '../types';

interface Props {
  visible: boolean;
  members: FamilyMember[];
  onSelect: (memberId: string | undefined) => void;
  onClose: () => void;
}

export default function AssignPickerModal({ visible, members, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>מי אחראי?</Text>
          {members.length === 0 && (
            <Text style={styles.empty}>הוסיפו בני משפחה קודם כדי להקצות מטלות</Text>
          )}
          {members.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.row}
              onPress={() => {
                onSelect(m.id);
                onClose();
              }}
            >
              <View style={[styles.dot, { backgroundColor: m.color }]} />
              <Text style={styles.rowText}>{m.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.row, styles.clearRow]}
            onPress={() => {
              onSelect(undefined);
              onClose();
            }}
          >
            <Text style={styles.clearText}>נקה שיוך</Text>
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
  row: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  rowText: { fontSize: 15, color: '#222' },
  clearRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 4 },
  clearText: { fontSize: 14, color: '#c33', textAlign: 'right' },
});
