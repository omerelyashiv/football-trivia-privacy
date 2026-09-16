import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TabKey = 'chores' | 'homework' | 'reminders' | 'rewards';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'chores', label: 'מטלות', icon: '🏠' },
  { key: 'homework', label: 'שיעורי בית', icon: '📚' },
  { key: 'reminders', label: 'תזכורות', icon: '⏰' },
  { key: 'rewards', label: 'פרסים', icon: '🎁' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export default function TabBar({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 20, opacity: 0.45 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: '#999', fontWeight: '600' },
  labelActive: { color: '#FF6B35' },
});
