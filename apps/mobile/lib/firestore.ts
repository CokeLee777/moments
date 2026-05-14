import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import type { TrendSummary, UserProfile } from '@moments/shared';
import { db } from './firebase';

export type { UserProfile };

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  await setDoc(doc(db, 'users', uid), { uid, ...data }, { merge: true });
}

export async function getTrendSummary(
  topicId: string,
  dateStr: string,
): Promise<TrendSummary | null> {
  const startOfDay = `${dateStr}T00:00:00.000+09:00`;
  const endOfDay = `${dateStr}T23:59:59.999+09:00`;
  const q = query(
    collection(db, 'trendSummaries'),
    where('topicId', '==', topicId),
    where('createdAt', '>=', startOfDay),
    where('createdAt', '<=', endOfDay),
    orderBy('createdAt', 'desc'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].data() as TrendSummary;

  const prev = new Date(dateStr);
  prev.setDate(prev.getDate() - 1);
  const prevDateStr = prev.toISOString().slice(0, 10);
  const prevStart = `${prevDateStr}T00:00:00.000+09:00`;
  const prevEnd = `${prevDateStr}T23:59:59.999+09:00`;
  const prevQ = query(
    collection(db, 'trendSummaries'),
    where('topicId', '==', topicId),
    where('createdAt', '>=', prevStart),
    where('createdAt', '<=', prevEnd),
    orderBy('createdAt', 'desc'),
    limit(1),
  );
  const prevSnap = await getDocs(prevQ);
  return prevSnap.empty ? null : (prevSnap.docs[0].data() as TrendSummary);
}

export async function getRecentTrendSummaries(
  topics: string[],
  count: number = 50,
): Promise<TrendSummary[]> {
  if (topics.length === 0) return [];
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00');
  const q = query(
    collection(db, 'trendSummaries'),
    where('topicId', 'in', topics),
    where('createdAt', '>=', cutoff),
    orderBy('createdAt', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as TrendSummary);
}
