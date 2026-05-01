import type { TopicCategory } from './topic.js';

export interface UserProfile {
  fcmToken?: string;
  topics: TopicCategory[];
  notificationTimes: number[];   // 0~23 정수, 최대 2개
  updatedAt?: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
}
