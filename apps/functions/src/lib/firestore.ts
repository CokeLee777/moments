import { db } from './admin.js';
import type { TrendSummary, UserProfile, TopicCategory } from '@moments/shared';

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

export async function upsertUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await db.collection('users').doc(uid).set(profile);
}
