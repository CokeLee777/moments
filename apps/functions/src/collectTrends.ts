import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { fetchNaverNews, toArticle } from './lib/naverNews.js';
import { summarizeArticles } from './lib/gemini.js';
import { saveTrendSummary } from './lib/firestore.js';
import type { TrendSummary, TopicCategory } from '@moments/shared';

const naverClientId = defineSecret('NAVER_CLIENT_ID');
const naverClientSecret = defineSecret('NAVER_CLIENT_SECRET');
const geminiApiKey = defineSecret('GEMINI_API_KEY');

const TOPIC_QUERIES: Record<TopicCategory, string> = {
  it: 'IT 기술 트렌드',
  ai: '인공지능 AI',
  fashion: '패션 트렌드',
  automotive: '자동차',
};

const TOPIC_TITLES: Record<TopicCategory, string> = {
  it: '오늘의 IT 트렌드',
  ai: '오늘의 AI 트렌드',
  fashion: '오늘의 패션 트렌드',
  automotive: '오늘의 자동차 트렌드',
};

interface CollectDeps {
  fetchNews: typeof fetchNaverNews;
  summarize: typeof summarizeArticles;
  save: (doc: TrendSummary) => Promise<void>;
  clientId: string;
  clientSecret: string;
  apiKey: string;
}

export async function runCollectTrends(deps: CollectDeps): Promise<void> {
  const topics: TopicCategory[] = ['it', 'ai', 'fashion', 'automotive'];
  for (const topicId of topics) {
    const naverArticles = await deps.fetchNews(TOPIC_QUERIES[topicId], deps.clientId, deps.clientSecret);
    const articles = naverArticles.map(toArticle);
    const summary = await deps.summarize(topicId, naverArticles, deps.apiKey);
    await deps.save({
      id: '',
      topicId,
      title: TOPIC_TITLES[topicId],
      summary,
      articles,
      sourceUrls: articles.map((a) => a.url),
      createdAt: new Date().toISOString(),
    });
  }
}

export const collectTrends = onSchedule(
  {
    schedule: '0 8,18 * * *',
    timeZone: 'Asia/Seoul',
    secrets: [naverClientId, naverClientSecret, geminiApiKey],
  },
  async () => {
    await runCollectTrends({
      fetchNews: fetchNaverNews,
      summarize: summarizeArticles,
      save: saveTrendSummary,
      clientId: naverClientId.value(),
      clientSecret: naverClientSecret.value(),
      apiKey: geminiApiKey.value(),
    });
  }
);
