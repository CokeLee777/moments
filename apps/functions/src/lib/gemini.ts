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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const topicLabel = TOPIC_LABELS[topicId] ?? topicId;
  const articleText = articles
    .map((a, i) => `${i + 1}. ${a.title}\n${a.description}`)
    .join('\n\n');

  const prompt =
    `다음은 오늘의 "${topicLabel}" 관련 뉴스 기사들입니다. ` +
    `정치·선거·정부 정책 관련 내용은 무시하고, ` +
    `대중에게 인기 있거나 화제가 되는 기술·제품·트렌드 중심으로 오늘의 트렌드를 한국어로 2~3문장 이내로 요약해주세요. ` +
    `요약문만 출력하세요. 기사 번호, 선별 과정, 제목, 구분선은 출력하지 마세요.\n\n${articleText}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
