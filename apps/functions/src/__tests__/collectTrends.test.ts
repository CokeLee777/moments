import { runCollectTrends } from '../collectTrends.js';

describe('runCollectTrends', () => {
  it('4개 주제 각각에 대해 뉴스 수집 → 요약 → 저장을 수행한다', async () => {
    const mockArticles = [
      { title: '기사', link: '', description: '설명', originallink: 'https://example.com' },
    ];
    const fetchNews = jest.fn().mockResolvedValue(mockArticles);
    const summarize = jest.fn().mockResolvedValue('오늘의 요약');
    const save = jest.fn().mockResolvedValue(undefined);

    await runCollectTrends({ fetchNews, summarize, save, clientId: 'id', clientSecret: 'secret', apiKey: 'key' });

    expect(fetchNews).toHaveBeenCalledTimes(4);
    expect(summarize).toHaveBeenCalledTimes(4);
    expect(save).toHaveBeenCalledTimes(4);

    const savedTopics = (save.mock.calls as Array<[{ topicId: string }]>).map((call) => call[0].topicId);
    expect(savedTopics).toEqual(expect.arrayContaining(['it', 'ai', 'fashion', 'automotive']));
  });

  it('save된 문서에 articles와 sourceUrls가 포함된다', async () => {
    const mockArticles = [
      { title: '기사', link: 'https://n.naver.com/1', description: '설명', originallink: 'https://tech.com/1' },
    ];
    const fetchNews = jest.fn().mockResolvedValue(mockArticles);
    const summarize = jest.fn().mockResolvedValue('요약');
    const save = jest.fn().mockResolvedValue(undefined);

    await runCollectTrends({ fetchNews, summarize, save, clientId: 'id', clientSecret: 'secret', apiKey: 'key' });

    const savedDoc = save.mock.calls[0][0];
    expect(savedDoc.articles).toHaveLength(1);
    expect(savedDoc.articles[0].url).toBe('https://tech.com/1');
    expect(savedDoc.sourceUrls).toContain('https://tech.com/1');
  });
});
