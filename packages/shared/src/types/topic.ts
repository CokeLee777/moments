export type TopicCategory =
  | 'it'
  | 'ai'
  | 'fashion'
  | 'automotive';

export interface Topic {
  id: string;
  category: TopicCategory;
  label: string;
}