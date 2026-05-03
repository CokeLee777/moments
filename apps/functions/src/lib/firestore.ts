import { db } from './admin.js';
import type { TrendSummary, UserProfile, TopicCategory, UserNotification } from '@moments/shared';

export async function saveTrendSummary(doc: Omit<TrendSummary, 'id'>): Promise<void> {
  const ref = db.collection('trendSummaries').doc();
  await ref.set({ ...doc, id: ref.id });
}

export async function getLatestTrendSummary(topicId: TopicCategory): Promise<TrendSummary | null> {
  const snap = await db
    .collection('trendSummaries')
    .where('topicId', '==', topicId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as TrendSummary;
}

export async function getUsersWithNotificationHour(
  hour: number
): Promise<Array<{ uid: string } & UserProfile>> {
  const snap = await db
    .collection('users')
    .where('notificationTimes', 'array-contains', hour)
    .get();
  return snap.docs
    .filter((doc) => (doc.data() as UserProfile).fcmToken)
    .map((doc) => ({ uid: doc.id, ...(doc.data() as UserProfile) }));
}

export async function upsertUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await db.collection('users').doc(uid).set(profile);
}

export async function clearFcmToken(uid: string): Promise<void> {
  await db.collection('users').doc(uid).update({ fcmToken: '' });
}

export async function saveUserNotification(
  uid: string,
  notification: Omit<UserNotification, 'id'>
): Promise<void> {
  const ref = db.collection('notifications').doc(uid).collection('items').doc();
  await ref.set({ ...notification, id: ref.id });
}
