import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import MembersBar from './src/components/MembersBar';
import ChoresTable from './src/components/ChoresTable';
import RemindersList from './src/components/RemindersList';
import RewardsSection from './src/components/RewardsSection';
import { loadData, saveData, DEFAULT_DATA } from './src/storage';
import { AppData } from './src/types';

export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoaded(true);
      loadedOnce.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loadedOnce.current) return;
    saveData(data);
  }, [data]);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏠 מטלות הבית</Text>
          <Text style={styles.subtitle}>מי עושה מה, לפי ימים</Text>
        </View>

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

        <View style={styles.divider} />

        <RewardsSection
          rewards={data.rewards}
          members={data.members}
          pointsBalance={data.pointsBalance}
          onRewardsChange={(rewards) => setData((d) => ({ ...d, rewards }))}
          onPointsBalanceChange={(pointsBalance) => setData((d) => ({ ...d, pointsBalance }))}
        />

        <View style={styles.divider} />

        <RemindersList
          reminders={data.reminders}
          members={data.members}
          onChange={(reminders) => setData((d) => ({ ...d, reminders }))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 60 },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#123B27', textAlign: 'right' },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'right', marginTop: 2, marginBottom: 4 },
  divider: { height: 6, backgroundColor: '#F7F5F2', marginTop: 16 },
});
