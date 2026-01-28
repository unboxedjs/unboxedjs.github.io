import type { PostPromotion } from './post.model';

export interface AdSettings {
  id: string;
  listPageAd?: PostPromotion;
  detailPageAd1?: PostPromotion;
  detailPageAd2?: PostPromotion;
}
