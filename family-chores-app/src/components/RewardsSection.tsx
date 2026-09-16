import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Reward, FamilyMember, PointsBalance } from '../types';
import { generateId } from '../id';

interface Props {
  rewards: Reward[];
  members: FamilyMember[];
  pointsBalance: PointsBalance;
  onRewardsChange: (rewards: Reward[]) => void;
  onPointsBalanceChange: (pointsBalance: PointsBalance) => void;
}

export default function RewardsSection({
  rewards,
  members,
  pointsBalance,
  onRewardsChange,
  onPointsBalanceChange,
}: Props) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('50');

  function addReward() {
    const trimmed = name.trim();
    const parsedCost = Math.max(0, parseInt(cost, 10) || 0);
    if (!trimmed) return;
    onRewardsChange([...rewards, { id: generateId(), name: trimmed, cost: parsedCost }]);
    setName('');
    setCost('50');
  }

  function removeReward(id: string) {
    const reward = rewards.find((r) => r.id === id);
    Alert.alert('הסרת פרס', `להסיר את "${reward?.name ?? ''}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'הסר', style: 'destructive', onPress: () => onRewardsChange(rewards.filter((r) => r.id !== id)) },
    ]);
  }

  function redeem(reward: Reward, member: FamilyMember) {
    const balance = pointsBalance[member.id] ?? 0;
    if (balance < reward.cost) {
      Alert.alert('אין מספיק נקודות', `יש לך ${balance} נקודות, ו"${reward.name}" עולה ${reward.cost}.`);
      return;
    }
    Alert.alert('מימוש פרס', `לממש את "${reward.name}" תמורת ${reward.cost} נקודות?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מממש',
        onPress: () => onPointsBalanceChange({ ...pointsBalance, [member.id]: balance - reward.cost }),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎁 מצב פרסים</Text>

      {members.length > 0 && (
        <View style={styles.balancesRow}>
          {members.map((m) => (
            <View key={m.id} style={[styles.balanceChip, { backgroundColor: m.color }]}>
              <Text style={styles.balanceChipText}>
                {m.name} · ⭐ {pointsBalance[m.id] ?? 0}
              </Text>
            </View>
          ))}
        </View>
      )}

      {rewards.map((r) => (
        <View key={r.id} style={styles.rewardRow}>
          <TouchableOpacity onLongPress={() => removeReward(r.id)}>
            <Text style={styles.rewardName}>{r.name}</Text>
            <Text style={styles.rewardCost}>⭐ {r.cost} נקודות</Text>
          </TouchableOpacity>
          {members.length > 0 && (
            <View style={styles.redeemRow}>
              <Text style={styles.redeemLabel}>מי מממש:</Text>
              <View style={styles.redeemChips}>
                {members.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.memberButton, { backgroundColor: m.color }]}
                    onPress={() => redeem(r, m)}
                  >
                    <Text style={styles.memberButtonText}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
      {rewards.length === 0 && <Text style={styles.empty}>עדיין לא הוגדרו פרסים</Text>}

      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="שם הפרס (לדוגמה: סרט קולנוע)..."
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          textAlign="right"
        />
        <View style={styles.costRow}>
          <TextInput
            style={styles.costInput}
            placeholder="עלות בנקודות"
            placeholderTextColor="#999"
            value={cost}
            onChangeText={setCost}
            keyboardType="number-pad"
            textAlign="center"
          />
          <TouchableOpacity style={styles.addButton} onPress={addReward}>
            <Text style={styles.addButtonText}>הוסף פרס</Text>
          </TouchableOpacity>
        </View>
      </View>
      {rewards.length > 0 && <Text style={styles.hint}>לחיצה על שם = מממש בעצמו · לחיצה ארוכה על פרס = הסרה</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'right', marginBottom: 10 },
  balancesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  balanceChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  balanceChipText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  rewardRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  rewardName: { fontSize: 14, fontWeight: '600', color: '#222', textAlign: 'right' },
  rewardCost: { fontSize: 12, color: '#B8860B', textAlign: 'right', marginTop: 2 },
  redeemRow: { flexDirection: 'row-reverse', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  redeemLabel: { fontSize: 11, color: '#999' },
  redeemChips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, flex: 1 },
  memberButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  memberButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'right', color: '#999', fontSize: 13, paddingVertical: 8 },
  addBox: { marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  costRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 10, alignItems: 'center' },
  costInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: { backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  hint: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 8 },
});
