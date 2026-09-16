import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MembersBar from './src/components/MembersBar';
import ChoresTable from './src/components/ChoresTable';
import RemindersList from './src/components/RemindersList';
import HomeworkPlanner from './src/components/HomeworkPlanner';
import RewardsSection from './src/components/RewardsSection';
import TabBar, { TabKey } from './src/components/TabBar';
import FamilyCodeScreen from './src/components/FamilyCodeScreen';
import { DEFAULT_DATA } from './src/storage';
import { AppData } from './src/types';
import { getStoredFamilyCode, storeFamilyCode, clearStoredFamilyCode, normalizeFamilyCode } from './src/family';
import { fetchOrCreateFamilyData, pushFamilyData, subscribeFamilyData } from './src/remoteSync';

const TAB_TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  chores: { title: '🏠 מטלות הבית', subtitle: 'מי עושה מה, לפי ימים' },
  homework: { title: '📚 שיעורי בית', subtitle: 'כמו יומן - מקצוע, משימה ותאריך' },
  reminders: { title: '⏰ תזכורות', subtitle: 'כל מה שלא רוצים לשכוח' },
  rewards: { title: '🎁 מצב פרסים', subtitle: 'נקודות ופרסים למימוש' },
};

export default function App() {
  const [familyCode, setFamilyCodeState] = useState<string | null>(null);
  const [checkingFamilyCode, setCheckingFamilyCode] = useState(true);
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('chores');
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    getStoredFamilyCode().then((code) => {
      setFamilyCodeState(code);
      setCheckingFamilyCode(false);
    });
  }, []);

  useEffect(() => {
    if (!familyCode) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const initial = await fetchOrCreateFamilyData(familyCode);
        if (cancelled) return;
        applyingRemoteRef.current = true;
        setData(initial);
        setLoaded(true);
        unsubscribe = subscribeFamilyData(familyCode, (remoteData) => {
          applyingRemoteRef.current = true;
          setData(remoteData);
        });
      } catch {
        if (cancelled) return;
        Alert.alert('שגיאת התחברות', 'לא הצלחנו להתחבר לשרת המשפחה. בדקו חיבור אינטרנט ונסו שוב.');
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [familyCode]);

  useEffect(() => {
    if (!loaded || !familyCode) return;
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    pushFamilyData(familyCode, data).catch(() => {
      Alert.alert('שגיאת שמירה', 'לא הצלחנו לשמור את העדכון לשרת. בדקו חיבור אינטרנט.');
    });
  }, [data, loaded, familyCode]);

  function switchFamily() {
    Alert.alert('החלפת משפחה', 'לצאת מהמשפחה הנוכחית ולהזין קוד אחר?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'החלף',
        style: 'destructive',
        onPress: async () => {
          await clearStoredFamilyCode();
          setLoaded(false);
          setData(DEFAULT_DATA);
          setFamilyCodeState(null);
        },
      },
    ]);
  }

  if (checkingFamilyCode) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" />
      </SafeAreaView>
    );
  }

  if (!familyCode) {
    return (
      <FamilyCodeScreen
        onSubmit={async (code) => {
          const normalized = normalizeFamilyCode(code);
          await storeFamilyCode(normalized);
          setFamilyCodeState(normalized);
        }}
      />
    );
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" />
        <Text style={styles.loadingText}>מתחבר למשפחה {familyCode}...</Text>
      </SafeAreaView>
    );
  }

  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={switchFamily}>
          <Text style={styles.familyCode}>👨‍👩‍👧‍👦 {familyCode}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'chores' && (
          <>
            <MembersBar
              members={data.members}
              onChange={(members) => setData((d) => ({ ...d, members }))}
            />
            <ChoresTable
              chores={data.chores}
              members={data.members}
              assignments={data.assignments}
              done={data.done}
              pointsBalance={data.pointsBalance}
              onChoresChange={(chores) => setData((d) => ({ ...d, chores }))}
              onAssignmentsChange={(assignments) => setData((d) => ({ ...d, assignments }))}
              onDoneChange={(done) => setData((d) => ({ ...d, done }))}
              onPointsBalanceChange={(pointsBalance) => setData((d) => ({ ...d, pointsBalance }))}
            />
          </>
        )}

        {activeTab === 'homework' && (
          <HomeworkPlanner
            homework={data.homework}
            members={data.members}
            pointsBalance={data.pointsBalance}
            onChange={(homework) => setData((d) => ({ ...d, homework }))}
            onPointsBalanceChange={(pointsBalance) => setData((d) => ({ ...d, pointsBalance }))}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersList
            reminders={data.reminders}
            members={data.members}
            onChange={(reminders) => setData((d) => ({ ...d, reminders }))}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsSection
            rewards={data.rewards}
            members={data.members}
            pointsBalance={data.pointsBalance}
            onRewardsChange={(rewards) => setData((d) => ({ ...d, rewards }))}
            onPointsBalanceChange={(pointsBalance) => setData((d) => ({ ...d, pointsBalance }))}
          />
        )}
      </ScrollView>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 10 },
  loadingText: { color: '#777', fontSize: 13 },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  familyCode: { fontSize: 12, color: '#4D9DE0', textAlign: 'right', fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#123B27', textAlign: 'right' },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'right', marginTop: 2, marginBottom: 4 },
});
