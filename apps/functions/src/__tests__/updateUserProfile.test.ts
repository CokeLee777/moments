import { runUpdateUserProfile } from '../updateUserProfile.js';
import * as firestoreModule from '../lib/firestore.js';
import type { TopicCategory } from '@moments/shared';

jest.mock('../lib/firestore.js', () => ({ upsertUserProfile: jest.fn().mockResolvedValue(undefined) }));

const mockUpsert = firestoreModule.upsertUserProfile as jest.Mock;

describe('runUpdateUserProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  const validInput = {
    uid: 'uid1',
    fcmToken: 'token123',
    topics: ['ai', 'it'] as TopicCategory[],
    notificationHours: [8, 21],
  };

  it('유효한 입력으로 프로필을 저장한다', async () => {
    await runUpdateUserProfile(validInput);
    expect(mockUpsert).toHaveBeenCalledWith('uid1', {
      fcmToken: 'token123',
      topics: ['ai', 'it'],
      notificationHours: [8, 21],
      updatedAt: expect.any(String),
    });
  });

  it('topics가 3개 이상이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, topics: ['ai', 'it', 'fashion'] as any })
    ).rejects.toThrow('topics must be 1-2 items');
  });

  it('유효하지 않은 topic이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, topics: ['invalid'] as any })
    ).rejects.toThrow('Invalid topic category');
  });

  it('notificationHours가 24 이상이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, notificationHours: [8, 24] })
    ).rejects.toThrow('notificationHours must be integers 0-23');
  });

  it('notificationHours에 중복이 있으면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, notificationHours: [8, 8] })
    ).rejects.toThrow('notificationHours must not contain duplicates');
  });

  it('fcmToken이 빈 문자열이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, fcmToken: '' })
    ).rejects.toThrow('fcmToken is required');
  });
});
