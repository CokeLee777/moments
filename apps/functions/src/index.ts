import { onRequest } from 'firebase-functions/v2/https';
import type { TrendSummary } from '@moments/shared';

export const healthCheck = onRequest((_req, res) => {
  const response: Pick<TrendSummary, 'id' | 'title'> = {
    id: 'health',
    title: 'Moments Functions is running',
  };
  res.json(response);
});
