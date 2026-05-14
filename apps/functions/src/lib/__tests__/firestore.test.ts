import {
  saveTrendSummary,
  getLatestTrendSummary,
  upsertUserProfile,
} from '../firestore.js';

const mockSet = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
const mockWhereResult = { get: mockGet, orderBy: mockOrderBy };
const mockWhere = jest.fn().mockReturnValue(mockWhereResult);
const mockDocRef = { set: mockSet, id: 'mock-auto-id' };
const mockDoc = jest.fn().mockReturnValue(mockDocRef);
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc, where: mockWhere });

jest.mock('../admin.js', () => ({
  db: {
    collection: (...args: unknown[]) => mockCollection(...args),
  },
}));

const mockTrendSummary = {
  id: 'mock-auto-id',
  topicId: 'ai' as const,
  title: '오늘의 AI 트렌드',
  summary: '요약 내용',
  articles: [{ title: '기사', url: 'https://example.com', source: 'example.com' }],
  sourceUrls: ['https://example.com'],
  createdAt: '2026-04-27T08:00:00.000Z',
};

describe('saveTrendSummary', () => {
  it('trendSummaries 컬렉션에 auto-generated ID로 저장한다', async () => {
    const { id: _id, ...docWithoutId } = mockTrendSummary;
    await saveTrendSummary(docWithoutId);
    expect(mockCollection).toHaveBeenCalledWith('trendSummaries');
    expect(mockDoc).toHaveBeenCalledWith();
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ topicId: 'ai', id: 'mock-auto-id' }));
  });
});

describe('getLatestTrendSummary', () => {
  it('topicId로 쿼리해 가장 최신 문서를 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ empty: false, docs: [{ data: () => mockTrendSummary }] });
    const result = await getLatestTrendSummary('ai');
    expect(result).toEqual(mockTrendSummary);
    expect(mockWhere).toHaveBeenCalledWith('topicId', '==', 'ai');
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it('결과가 없으면 null을 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ empty: true, docs: [] });
    const result = await getLatestTrendSummary('ai');
    expect(result).toBeNull();
  });
});

describe('upsertUserProfile', () => {
  it('users/{uid} 문서를 set한다', async () => {
    const profile = { topics: ['ai' as const], updatedAt: '' };
    await upsertUserProfile('uid1', profile as any);
    expect(mockDoc).toHaveBeenCalledWith('uid1');
    expect(mockSet).toHaveBeenCalledWith(profile);
  });
});
