export interface NotificationPayload {
  title: string;
  body: string;
  data: {
    trendId: string;
    topicId: string;
  };
}