import type { Timestamp } from 'firebase/firestore';

export interface Like {
  id: string;
  postId: string;
  visitorId: string;
  createdAt: Timestamp;
}
