import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NaverArticle } from './naverNews.js';

const TOPIC_LABELS: Record<string, string> = {
  it: 'IT/기술',
  ai: '인공지능',
  fashion: '패션',
  automotive: '자동차',
};

export async function summarizeArticles(
  topicId: string,
  articles: NaverArticle[],
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const topicLabel = TOPIC_LABELS[topicId] ?? topicId;
  const articleText = articles
    .map((a, i) => `${i + 1}. ${a.title}\n${a.description}`)
    .join('\n\n');

  const prompt =
    `다음은 오늘의 "${topicLabel}" 관련 뉴스 기사들입니다. ` +
    `이 기사들을 바탕으로 오늘의 트렌드를 한국어로 2~3문장 이내로 요약해주세요. ` +
    `독자가 빠르게 파악할 수 있도록 핵심 내용 위주로 작성하세요.\n\n${articleText}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
