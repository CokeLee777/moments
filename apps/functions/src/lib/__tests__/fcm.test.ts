import { sendTrendNotification } from '../fcm.js';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSummary = {
  id: 'ai_2026-04-27',
  topicId: 'ai',
  title: '오늘의 AI 트렌드',
  summary: '오늘의 요약입니다.',
  articles: [],
  sourceUrls: [],
  createdAt: '2026-04-27T08:00:00.000Z',
};

function mockExpoPushResponse(status: 'ok' | 'error', errorCode?: string) {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({
      data: [{ status, ...(errorCode ? { details: { error: errorCode } } : {}) }],
    }),
  });
}

describe('sendTrendNotification', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Expo API를 호출하고 성공을 반환한다', async () => {
    mockExpoPushResponse('ok');
    const result = await sendTrendNotification('ExponentPushToken[xxx]', mockSummary as any);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://exp.host/--/api/v2/push/send',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"to":"ExponentPushToken[xxx]"'),
      })
    );
    expect(result).toEqual({ success: true, tokenExpired: false });
  });

  it('DeviceNotRegistered 에러면 tokenExpired: true 반환', async () => {
    mockExpoPushResponse('error', 'DeviceNotRegistered');
    const result = await sendTrendNotification('expired-token', mockSummary as any);
    expect(result).toEqual({ success: false, tokenExpired: true });
  });

  it('기타 에러면 tokenExpired: false 반환', async () => {
    mockExpoPushResponse('error', 'MessageRateExceeded');
    const result = await sendTrendNotification('bad-token', mockSummary as any);
    expect(result).toEqual({ success: false, tokenExpired: false });
  });
});
