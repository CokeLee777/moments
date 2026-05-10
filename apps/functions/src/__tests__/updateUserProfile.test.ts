import { runUpdateUserProfile } from '../updateUserProfile.js';
import * as firestoreModule from '../lib/firestore.js';
import type { TopicCategory } from '@moments/shared';

jest.mock('../lib/firestore.js', () => ({ upsertUserProfile: jest.fn().mockResolvedValue(undefined) }));

const mockUpsert = firestoreModule.upsertUserProfile as jest.Mock;

describe('runUpdateUserProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  const validInput = {
    uid: 'uid1',
    topics: ['ai', 'it'] as TopicCategory[],
  };

  it('유효한 입력으로 프로필을 저장한다', async () => {
    await runUpdateUserProfile(validInput);
    expect(mockUpsert).toHaveBeenCalledWith('uid1', {
      topics: ['ai', 'it'],
      updatedAt: expect.any(String),
    });
  });

  it('topics가 3개 이상이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, topics: ['ai', 'it', 'fashion'] as unknown as TopicCategory[] })
    ).rejects.toThrow('topics must be 1-2 items');
  });

  it('유효하지 않은 topic이면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, topics: ['invalid'] as unknown as TopicCategory[] })
    ).rejects.toThrow('Invalid topic category');
  });

  it('topics에 중복이 있으면 에러를 던진다', async () => {
    await expect(
      runUpdateUserProfile({ ...validInput, topics: ['ai', 'ai'] as unknown as TopicCategory[] })
    ).rejects.toThrow('topics must not contain duplicates');
  });
});
