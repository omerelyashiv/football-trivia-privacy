import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FamilyMember } from '../types';
import { generateId } from '../id';
import { nextColor } from '../colors';

interface Props {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

export default function MembersBar({ members, onChange }: Props) {
  const [name, setName] = useState('');

  function addMember() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const member: FamilyMember = {
      id: generateId(),
      name: trimmed,
      color: nextColor(members.length),
    };
    onChange([...members, member]);
    setName('');
  }

  function removeMember(id: string) {
    const member = members.find((m) => m.id === id);
    Alert.alert(
      'הסרת בן משפחה',
      `להסיר את ${member?.name ?? ''}? כל השיוכים שלו יתפנו.`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הסר',
          style: 'destructive',
          onPress: () => onChange(members.filter((m) => m.id !== id)),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍👩‍👧‍👦 בני משפחה</Text>
      <View style={styles.chipsRow}>
        {members.map((m) => (
          <View key={m.id} style={[styles.chip, { backgroundColor: m.color }]}>
            <Text style={styles.chipText}>{m.name}</Text>
            <TouchableOpacity style={styles.chipDelete} onPress={() => removeMember(m.id)}>
              <Text style={styles.chipDeleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="הוסף בן משפחה..."
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          onSubmitEditing={addMember}
          returnKeyType="done"
          textAlign="right"
        />
        <TouchableOpacity style={styles.addButton} onPress={addMember}>
          <Text style={styles.addButtonText}>הוסף</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'right', marginBottom: 8 },
  chipsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  chipDelete: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDeleteText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
