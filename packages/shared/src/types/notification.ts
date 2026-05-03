export interface NotificationPayload {
  title: string;
  body: string;
  data: {
    trendId: string;
    topicId: string;
  };
}

export interface UserNotification {
  id: string;
  topicId: string;
  trendId: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}