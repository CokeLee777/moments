import type { TopicCategory } from './topic';

export interface UserProfile {
  fcmToken: string;
  topics: TopicCategory[];       // 최대 2개
  notificationHours: number[];   // 0~23 정수, 최대 2개
  updatedAt: string;             // ISO 8601
}
