import { runDispatchNotifications } from '../dispatchNotifications.js';

const mockSummary = {
  id: 'ai_2026-04-27',
  topicId: 'ai',
  title: '오늘의 AI 트렌드',
  summary: '요약입니다.',
  articles: [],
  sourceUrls: [],
  createdAt: '2026-04-27T08:00:00.000Z',
};

describe('runDispatchNotifications', () => {
  it('현재 알림 시간인 사용자에게 FCM을 발송하고 알림을 저장한다', async () => {
    const getUsers = jest.fn().mockResolvedValue([
      { uid: 'uid1', fcmToken: 'token1', topics: ['ai'], notificationHours: [8], updatedAt: '' },
    ]);
    const getSummary = jest.fn().mockResolvedValue(mockSummary);
    const sendNotification = jest.fn().mockResolvedValue({ success: true, tokenExpired: false });
    const saveNotification = jest.fn().mockResolvedValue(undefined);
    const clearToken = jest.fn();

    await runDispatchNotifications({ getUsers, getSummary, sendNotification, saveNotification, clearToken, currentHour: 8 });

    expect(getUsers).toHaveBeenCalledWith(8);
    expect(getSummary).toHaveBeenCalledWith('ai');
    expect(sendNotification).toHaveBeenCalledWith('token1', mockSummary);
    expect(saveNotification).toHaveBeenCalledWith('uid1', expect.objectContaining({ topicId: 'ai', isRead: false }));
    expect(clearToken).not.toHaveBeenCalled();
  });

  it('토큰 만료 시 fcmToken을 삭제한다', async () => {
    const getUsers = jest.fn().mockResolvedValue([
      { uid: 'uid1', fcmToken: 'expired-token', topics: ['ai'], notificationHours: [8], updatedAt: '' },
    ]);
    const getSummary = jest.fn().mockResolvedValue(mockSummary);
    const sendNotification = jest.fn().mockResolvedValue({ success: false, tokenExpired: true });
    const saveNotification = jest.fn().mockResolvedValue(undefined);
    const clearToken = jest.fn().mockResolvedValue(undefined);

    await runDispatchNotifications({ getUsers, getSummary, sendNotification, saveNotification, clearToken, currentHour: 8 });

    expect(clearToken).toHaveBeenCalledWith('uid1');
    expect(saveNotification).not.toHaveBeenCalled();
  });

  it('요약이 없는 주제는 건너뛴다', async () => {
    const getUsers = jest.fn().mockResolvedValue([
      { uid: 'uid1', fcmToken: 'token1', topics: ['ai'], notificationHours: [8], updatedAt: '' },
    ]);
    const getSummary = jest.fn().mockResolvedValue(null);
    const sendNotification = jest.fn();
    const saveNotification = jest.fn();
    const clearToken = jest.fn();

    await runDispatchNotifications({ getUsers, getSummary, sendNotification, saveNotification, clearToken, currentHour: 8 });

    expect(sendNotification).not.toHaveBeenCalled();
    expect(saveNotification).not.toHaveBeenCalled();
  });
});
