import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import MembersBar from './src/components/MembersBar';
import ChoresTable from './src/components/ChoresTable';
import RemindersList from './src/components/RemindersList';
import HomeworkPlanner from './src/components/HomeworkPlanner';
import RewardsSection from './src/components/RewardsSection';
import TabBar, { TabKey } from './src/components/TabBar';
import { loadData, saveData, DEFAULT_DATA } from './src/storage';
import { AppData } from './src/types';

const TAB_TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  chores: { title: '🏠 מטלות הבית', subtitle: 'מי עושה מה, לפי ימים' },
  homework: { title: '📚 שיעורי בית', subtitle: 'כמו יומן - מקצוע, משימה ותאריך' },
  reminders: { title: '⏰ תזכורות', subtitle: 'כל מה שלא רוצים לשכוח' },
  rewards: { title: '🎁 מצב פרסים', subtitle: 'נקודות ופרסים למימוש' },
};

export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('chores');
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

  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#123B27', textAlign: 'right' },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'right', marginTop: 2, marginBottom: 4 },
});
