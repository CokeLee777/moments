import { fetchNaverNews, toArticle } from '../naverNews.js';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('fetchNaverNews', () => {
  beforeEach(() => jest.clearAllMocks());

  it('올바른 헤더로 Naver API를 호출하고 HTML을 제거한 기사를 반환한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            title: '<b>AI</b> 트렌드 &amp; 미래',
            link: 'https://n.news.naver.com/1',
            description: '<b>설명</b> 내용',
            originallink: 'https://techsite.com/article/1',
          },
        ],
      }),
    });

    const articles = await fetchNaverNews('AI', 'my-id', 'my-secret', 1);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('query=AI'),
      expect.objectContaining({
        headers: {
          'X-Naver-Client-Id': 'my-id',
          'X-Naver-Client-Secret': 'my-secret',
        },
      })
    );
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('AI 트렌드 & 미래');
    expect(articles[0].description).toBe('설명 내용');
  });

  it('API 응답이 ok가 아니면 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(fetchNaverNews('AI', 'bad', 'bad')).rejects.toThrow('Naver News API error: 401');
  });
});

describe('toArticle', () => {
  it('NaverArticle을 Article로 변환한다', () => {
    const article = toArticle({
      title: '제목',
      link: 'https://n.news.naver.com/1',
      description: '설명',
      originallink: 'https://techsite.com/article/1',
    });
    expect(article).toEqual({
      title: '제목',
      url: 'https://techsite.com/article/1',
      source: 'techsite.com',
    });
  });

  it('originallink가 없으면 link를 사용한다', () => {
    const article = toArticle({
      title: '제목',
      link: 'https://n.news.naver.com/1',
      description: '설명',
      originallink: '',
    });
    expect(article.url).toBe('https://n.news.naver.com/1');
  });
});
