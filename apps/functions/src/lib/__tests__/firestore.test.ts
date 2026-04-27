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
const mockDoc = jest.fn().mockReturnValue({ set: mockSet, update: mockUpdate, get: mockGet });
const mockWhere = jest.fn();
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc, where: mockWhere });

jest.mock('../admin.js', () => ({
  db: {
    collection: (...args: unknown[]) => mockCollection(...args),
  },
}));

const mockTrendSummary = {
  id: '',
  topicId: 'ai' as const,
  title: '오늘의 AI 트렌드',
  summary: '요약 내용',
  articles: [{ title: '기사', url: 'https://example.com', source: 'example.com' }],
  sourceUrls: ['https://example.com'],
  createdAt: '2026-04-27T08:00:00.000Z',
};

describe('saveTrendSummary', () => {
  it('trendSummaries/{topicId}_{date} 문서에 저장한다', async () => {
    await saveTrendSummary(mockTrendSummary);
    expect(mockCollection).toHaveBeenCalledWith('trendSummaries');
    expect(mockDoc).toHaveBeenCalledWith(expect.stringMatching(/^ai_\d{4}-\d{2}-\d{2}$/));
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ topicId: 'ai' }));
  });
});

describe('getLatestTrendSummary', () => {
  it('오늘 문서가 있으면 반환한다', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTrendSummary });
    const result = await getLatestTrendSummary('ai');
    expect(result).toEqual(mockTrendSummary);
  });

  it('오늘 문서가 없으면 어제 문서를 시도한다', async () => {
    mockGet
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, data: () => ({ ...mockTrendSummary, id: 'ai_yesterday' }) });
    const result = await getLatestTrendSummary('ai');
    expect(result?.id).toBe('ai_yesterday');
  });

  it('오늘·어제 모두 없으면 null 반환', async () => {
    mockGet.mockResolvedValue({ exists: false });
    const result = await getLatestTrendSummary('ai');
    expect(result).toBeNull();
  });
});

describe('getUsersWithNotificationHour', () => {
  it('해당 알림 시간을 가진 FCM 토큰 있는 사용자를 반환한다', async () => {
    const mockSnapshot = {
      docs: [
        { id: 'uid1', data: () => ({ fcmToken: 'token1', topics: ['ai'], notificationHours: [8], updatedAt: '' }) },
        { id: 'uid2', data: () => ({ fcmToken: '', topics: ['it'], notificationHours: [8], updatedAt: '' }) },
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
    const profile = { fcmToken: 'tok', topics: ['ai' as const], notificationHours: [8], updatedAt: '' };
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
