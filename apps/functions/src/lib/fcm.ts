import type { TrendSummary } from '@moments/shared';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushReceipt {
  status: 'ok' | 'error';
  details?: { error?: string };
}

export async function sendTrendNotification(
  expoPushToken: string,
  summary: TrendSummary
): Promise<{ success: boolean; tokenExpired: boolean }> {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: expoPushToken,
        title: summary.title,
        body: summary.summary.slice(0, 150),
        data: { trendId: summary.id, topicId: summary.topicId },
      }),
    });
    const json = (await res.json()) as { data: ExpoPushReceipt[] };
    const receipt = json.data[0];
    if (!receipt) return { success: false, tokenExpired: false };
    const tokenExpired =
      receipt.status === 'error' && receipt.details?.error === 'DeviceNotRegistered';
    return { success: receipt.status === 'ok', tokenExpired };
  } catch {
    return { success: false, tokenExpired: false };
  }
}
