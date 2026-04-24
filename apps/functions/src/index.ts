import { onRequest } from 'firebase-functions/v2/https';
import type { TrendSummary } from '@moments/shared';

export const healthCheck = onRequest((_req, res) => {
  const response: Pick<TrendSummary, 'id' | 'title'> & { version: string } = {
    id: 'health',
    title: 'Moments Functions is running',
    version: '0.0.1',
  };
  res.json(response);
});
