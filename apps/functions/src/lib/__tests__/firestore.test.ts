import {
  saveTrendSummary,
  getLatestTrendSummary,
  getUsersWithNotificationHour,
  upsertUserProfile,
  clearFcmToken,
} from '../firestore.js';

const mockSet = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
const mockWhereResult = { get: mockGet, orderBy: mockOrderBy };
const mockWhere = jest.fn().mockReturnValue(mockWhereResult);
const mockDocRef = { set: mockSet, update: mockUpdate, get: mockGet, id: 'mock-auto-id' };
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

describe('getUsersWithNotificationHour', () => {
  it('해당 알림 시간을 가진 FCM 토큰 있는 사용자를 반환한다', async () => {
    const mockSnapshot = {
      docs: [
        { id: 'uid1', data: () => ({ fcmToken: 'token1', topics: ['ai'], notificationTimes: [8], updatedAt: '' }) },
        { id: 'uid2', data: () => ({ fcmToken: '', topics: ['it'], notificationTimes: [8], updatedAt: '' }) },
      ],
    };
    mockWhere.mockReturnValue({ get: jest.fn().mockResolvedValue(mockSnapshot) });

    const users = await getUsersWithNotificationHour(8);
    expect(users).toHaveLength(1);
    expect(users[0].uid).toBe('uid1');
  });
});

describe('upsertUserProfile', () => {
  it('users/{uid} 문서를 set한다', async () => {
    const profile = { fcmToken: 'tok', topics: ['ai' as const], notificationTimes: [8], updatedAt: '' };
    await upsertUserProfile('uid1', profile);
    expect(mockDoc).toHaveBeenCalledWith('uid1');
    expect(mockSet).toHaveBeenCalledWith(profile);
  });
});

describe('clearFcmToken', () => {
  it('fcmToken을 빈 문자열로 업데이트한다', async () => {
    await clearFcmToken('uid1');
    expect(mockUpdate).toHaveBeenCalledWith({ fcmToken: '' });
  });
});
