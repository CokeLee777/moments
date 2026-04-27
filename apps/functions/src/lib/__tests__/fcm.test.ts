import { sendTrendNotification } from '../fcm.js';
import { messaging } from '../admin.js';

jest.mock('../admin.js', () => ({
  messaging: { send: jest.fn() },
}));

const mockSend = messaging.send as jest.Mock;

const mockSummary = {
  id: 'ai_2026-04-27',
  topicId: 'ai',
  title: '오늘의 AI 트렌드',
  summary: '오늘의 요약입니다.',
  articles: [],
  sourceUrls: [],
  createdAt: '2026-04-27T08:00:00.000Z',
};

describe('sendTrendNotification', () => {
  beforeEach(() => jest.clearAllMocks());

  it('FCM을 호출하고 성공을 반환한다', async () => {
    mockSend.mockResolvedValueOnce('message-id');
    const result = await sendTrendNotification('valid-token', mockSummary as any);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'valid-token',
        notification: { title: '오늘의 AI 트렌드', body: expect.any(String) },
        data: { trendId: 'ai_2026-04-27', topicId: 'ai' },
      })
    );
    expect(result).toEqual({ success: true, tokenExpired: false });
  });

  it('토큰 만료 에러면 tokenExpired: true 반환', async () => {
    mockSend.mockRejectedValueOnce({ code: 'messaging/registration-token-not-registered' });
    const result = await sendTrendNotification('expired-token', mockSummary as any);
    expect(result).toEqual({ success: false, tokenExpired: true });
  });

  it('기타 에러면 tokenExpired: false 반환', async () => {
    mockSend.mockRejectedValueOnce({ code: 'messaging/internal-error' });
    const result = await sendTrendNotification('bad-token', mockSummary as any);
    expect(result).toEqual({ success: false, tokenExpired: false });
  });
});
