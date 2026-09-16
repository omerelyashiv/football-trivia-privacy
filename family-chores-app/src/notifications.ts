import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminderNotification(
  title: string,
  body: string,
  date: Date
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  if (date.getTime() <= Date.now()) return undefined;
  const granted = await ensureNotificationPermission();
  if (!granted) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export async function cancelReminderNotification(notificationId?: string): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
