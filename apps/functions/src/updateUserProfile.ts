import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { upsertUserProfile } from './lib/firestore.js';
import type { TopicCategory } from '@moments/shared';

const VALID_TOPICS = new Set<TopicCategory>(['it', 'ai', 'fashion', 'automotive']);

interface UpdateInput {
  uid: string;
  topics: TopicCategory[];
}

export async function runUpdateUserProfile(input: UpdateInput): Promise<void> {
  const { uid, topics } = input;

  if (!Array.isArray(topics) || topics.length < 1 || topics.length > 2)
    throw new Error('topics must be 1-2 items');
  if (topics.some((t) => !VALID_TOPICS.has(t)))
    throw new Error('Invalid topic category');
  if (new Set(topics).size !== topics.length)
    throw new Error('topics must not contain duplicates');

  await upsertUserProfile(uid, {
    topics,
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
