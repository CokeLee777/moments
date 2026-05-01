import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { upsertUserProfile } from './lib/firestore.js';
import type { TopicCategory } from '@moments/shared';

const VALID_TOPICS = new Set<TopicCategory>(['it', 'ai', 'fashion', 'automotive']);

interface UpdateInput {
  uid: string;
  fcmToken: string;
  topics: TopicCategory[];
  notificationTimes: number[];
}

export async function runUpdateUserProfile(input: UpdateInput): Promise<void> {
  const { uid, fcmToken, topics, notificationTimes } = input;

  if (!fcmToken) throw new Error('fcmToken is required');
  if (!Array.isArray(topics) || topics.length < 1 || topics.length > 2)
    throw new Error('topics must be 1-2 items');
  if (topics.some((t) => !VALID_TOPICS.has(t)))
    throw new Error('Invalid topic category');
  if (new Set(topics).size !== topics.length)
    throw new Error('topics must not contain duplicates');
  if (!Array.isArray(notificationTimes) || notificationTimes.length < 1 || notificationTimes.length > 2)
    throw new Error('notificationTimes must be 1-2 items');
  if (notificationTimes.some((h) => !Number.isInteger(h) || h < 0 || h > 23))
    throw new Error('notificationTimes must be integers 0-23');
  if (new Set(notificationTimes).size !== notificationTimes.length)
    throw new Error('notificationTimes must not contain duplicates');

  await upsertUserProfile(uid, {
    fcmToken,
    topics,
    notificationTimes,
    updatedAt: new Date().toISOString(),
  });
}

export const updateUserProfile = onCall({ region: 'asia-northeast3' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required');
  try {
    await runUpdateUserProfile({ uid: request.auth.uid, ...request.data });
    return { success: true };
  } catch (e: unknown) {
    throw new HttpsError('invalid-argument', (e as Error).message);
  }
});
