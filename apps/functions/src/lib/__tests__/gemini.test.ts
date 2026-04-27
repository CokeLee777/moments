import { summarizeArticles } from '../gemini.js';

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

describe('summarizeArticles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Gemini를 호출해 요약문을 반환한다', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => '오늘의 AI 트렌드 요약입니다.' },
    });

    const articles = [
      { title: 'AI 기사 1', link: '', description: 'AI 설명 1', originallink: '' },
      { title: 'AI 기사 2', link: '', description: 'AI 설명 2', originallink: '' },
    ];

    const summary = await summarizeArticles('ai', articles, 'fake-key');

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.stringContaining('인공지능')
    );
    expect(summary).toBe('오늘의 AI 트렌드 요약입니다.');
  });

  it('Gemini 호출 실패 시 에러를 전파한다', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API quota exceeded'));
    const articles = [{ title: '기사', link: '', description: '설명', originallink: '' }];
    await expect(summarizeArticles('ai', articles, 'bad-key')).rejects.toThrow('API quota exceeded');
  });
});
