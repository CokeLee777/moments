import type { Article } from '@moments/shared';

export interface NaverArticle {
  title: string;
  link: string;
  description: string;
  originallink: string;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function fetchNaverNews(
  query: string,
  clientId: string,
  clientSecret: string,
  display = 5
): Promise<NaverArticle[]> {
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });
  if (!res.ok) throw new Error(`Naver News API error: ${res.status}`);
  const data = (await res.json()) as { items: NaverArticle[] };
  return data.items.map((item) => ({
    title: stripHtml(item.title),
    link: item.link,
    description: stripHtml(item.description),
    originallink: item.originallink,
  }));
}

export function toArticle(item: NaverArticle): Article {
  const url = item.originallink || item.link;
  return {
    title: item.title,
    url,
    source: extractDomain(url),
  };
}
