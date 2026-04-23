export interface TrendSummary {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  sourceUrls: string[];
  createdAt: string; // ISO 8601
}