import { messaging } from './admin.js';
import type { TrendSummary } from '@moments/shared';

const EXPIRED_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

export async function sendTrendNotification(
  fcmToken: string,
  summary: TrendSummary
): Promise<{ success: boolean; tokenExpired: boolean }> {
  try {
    await messaging.send({
      token: fcmToken,
      notification: {
        title: summary.title,
        body: summary.summary.slice(0, 150),
      },
      data: {
        trendId: summary.id,
        topicId: summary.topicId,
      },
    });
    return { success: true, tokenExpired: false };
  } catch (error: unknown) {
    const code = (error as { code?: string }).code ?? '';
    return { success: false, tokenExpired: EXPIRED_TOKEN_CODES.has(code) };
  }
}
