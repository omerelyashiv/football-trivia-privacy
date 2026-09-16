import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { generateFamilyCode } from '../family';

interface Props {
  onSubmit: (code: string) => void;
}

export default function FamilyCodeScreen({ onSubmit }: Props) {
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  function createNew() {
    const code = generateFamilyCode();
    setCreatedCode(code);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
        <Text style={styles.title}>ברוכים הבאים</Text>
        <Text style={styles.subtitle}>
          כל בני המשפחה שמזינים את אותו קוד רואים ומעדכנים את אותה טבלה, בזמן אמת
        </Text>

        {createdCode ? (
          <View style={styles.createdBox}>
            <Text style={styles.createdLabel}>קוד המשפחה שלכם:</Text>
            <Text style={styles.createdCode}>{createdCode}</Text>
            <Text style={styles.createdHint}>שתפו את הקוד עם שאר המשפחה כדי שיצטרפו</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onSubmit(createdCode)}>
              <Text style={styles.primaryButtonText}>המשך</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreatedCode(null)}>
              <Text style={styles.linkText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.joinBox}>
              <Text style={styles.label}>יש לכם כבר קוד משפחה?</Text>
              <TextInput
                style={styles.input}
                placeholder="הזינו קוד (לדוגמה: AB12CD)"
                placeholderTextColor="#999"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                textAlign="center"
              />
              <TouchableOpacity
                style={[styles.primaryButton, !joinCode.trim() && styles.primaryButtonDisabled]}
                disabled={!joinCode.trim()}
                onPress={() => onSubmit(joinCode)}
              >
                <Text style={styles.primaryButtonText}>הצטרפות</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.orText}>או</Text>

            <TouchableOpacity style={styles.secondaryButton} onPress={createNew}>
              <Text style={styles.secondaryButtonText}>צרו קוד משפחה חדש</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#123B27', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  joinBox: { width: '100%', gap: 10, alignItems: 'stretch' },
  label: { fontSize: 13, color: '#666', textAlign: 'center', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 2,
  },
  primaryButton: { backgroundColor: '#FF6B35', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  orText: { color: '#999', marginVertical: 18, fontSize: 13 },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#123B27',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#123B27', fontWeight: '700', fontSize: 15 },
  createdBox: { width: '100%', alignItems: 'center', gap: 10 },
  createdLabel: { fontSize: 14, color: '#666' },
  createdCode: { fontSize: 36, fontWeight: '900', color: '#123B27', letterSpacing: 4, marginVertical: 6 },
  createdHint: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 10 },
  linkText: { color: '#4D9DE0', fontSize: 13, marginTop: 12 },
});
