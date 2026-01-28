import type { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  likes: number;
  approved: boolean;
  createdAt: Timestamp;
}

export interface CreateCommentDto {
  postId: string;
  author: string;
  email: string;
  content: string;
}
