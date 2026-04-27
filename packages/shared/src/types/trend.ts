export interface Article {
  title: string;
  url: string;
  source: string;
}

export interface TrendSummary {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  articles: Article[];
  sourceUrls: string[];  // 하위 호환 유지
  createdAt: string;     // ISO 8601
}