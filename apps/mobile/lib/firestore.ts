import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const snap = await getDoc(doc(db, 'trendSummaries', `${topicId}_${dateStr}`));
  if (snap.exists()) return snap.data() as TrendSummary;

  const prev = new Date(dateStr);
  prev.setDate(prev.getDate() - 1);
  const prevSnap = await getDoc(
    doc(db, 'trendSummaries', `${topicId}_${prev.toISOString().slice(0, 10)}`),
  );
  return prevSnap.exists() ? (prevSnap.data() as TrendSummary) : null;
}
