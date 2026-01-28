import type { Timestamp } from 'firebase/firestore';

export type PostSource = 'crm' | 'github';

export interface PostPromotion {
  type: 'youtube' | 'udemy' | 'amazon' | 'website';
  url: string;
  title?: string;
  image?: string;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  tags: string[];
  category: string;
  author: string;
  likes: number;
  shares: number;
  views: number;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  source: PostSource;
  externalUrl?: string;
  promoSlot1?: PostPromotion;
  promoSlot2?: PostPromotion;
}

export interface CreatePostDto {
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  tags: string[];
  category: string;
  author: string;
  published: boolean;
  promoSlot1?: PostPromotion;
  promoSlot2?: PostPromotion;
}
