import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getUsersWithNotificationHour, getLatestTrendSummary, clearFcmToken } from './lib/firestore.js';
import { sendTrendNotification } from './lib/fcm.js';
import type { TopicCategory } from '@moments/shared';

function getKstHour(): number {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).getUTCHours();
}

interface DispatchDeps {
  getUsers: typeof getUsersWithNotificationHour;
  getSummary: typeof getLatestTrendSummary;
  sendNotification: typeof sendTrendNotification;
  clearToken: typeof clearFcmToken;
  currentHour: number;
}

export async function runDispatchNotifications(deps: DispatchDeps): Promise<void> {
  const users = await deps.getUsers(deps.currentHour);
  for (const user of users) {
    for (const topicId of user.topics as TopicCategory[]) {
      const summary = await deps.getSummary(topicId);
      if (!summary) continue;
      const result = await deps.sendNotification(user.fcmToken!, summary);
      if (result.tokenExpired) await deps.clearToken(user.uid);
    }
  }
}

export const dispatchNotifications = onSchedule(
  { schedule: '0 * * * *', timeZone: 'Asia/Seoul' },
  async () => {
    await runDispatchNotifications({
      getUsers: getUsersWithNotificationHour,
      getSummary: getLatestTrendSummary,
      sendNotification: sendTrendNotification,
      clearToken: clearFcmToken,
      currentHour: getKstHour(),
    });
  }
);
