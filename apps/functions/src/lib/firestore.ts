import { db } from './admin.js';
import type { TrendSummary, UserProfile, TopicCategory } from '@moments/shared';

function getKstDateString(offsetDays = 0): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export async function saveTrendSummary(doc: TrendSummary): Promise<void> {
  const date = getKstDateString();
  const id = `${doc.topicId}_${date}`;
  await db.collection('trendSummaries').doc(id).set({ ...doc, id });
}

export async function getLatestTrendSummary(topicId: TopicCategory): Promise<TrendSummary | null> {
  for (const offsetDays of [0, -1]) {
    const date = getKstDateString(offsetDays);
    const snap = await db.collection('trendSummaries').doc(`${topicId}_${date}`).get();
    if (snap.exists) return snap.data() as TrendSummary;
  }
  return null;
}

export async function getUsersWithNotificationHour(
  hour: number
): Promise<Array<{ uid: string } & UserProfile>> {
  const snap = await db
    .collection('users')
    .where('notificationHours', 'array-contains', hour)
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
