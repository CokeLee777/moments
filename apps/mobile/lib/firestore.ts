import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { TrendSummary } from '@moments/shared';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  topics: string[];
  notificationTimes: number[];
  fcmToken?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid'>>,
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
