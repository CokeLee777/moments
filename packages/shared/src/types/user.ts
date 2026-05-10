import type { TopicCategory } from './topic.js';

export interface UserProfile {
  topics: TopicCategory[];
  updatedAt?: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
}
