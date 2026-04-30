import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { appendNotification } from '../app/(tabs)/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<void> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  const { status } =
    existing !== 'granted'
      ? await Notifications.requestPermissionsAsync()
      : { status: existing };

  if (status !== 'granted') return;

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  const user = auth.currentUser;
  if (user) {
    await updateDoc(doc(db, 'users', user.uid), { fcmToken: token });
  }
}

export function setupNotificationListeners() {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data as Record<string, string>;
    appendNotification({
      id: notification.request.identifier,
      title: notification.request.content.title ?? '',
      body: notification.request.content.body ?? '',
      topicId: data.topicId ?? 'ai',
      receivedAt: notification.date,
    });
  });

  return () => sub.remove();
}
