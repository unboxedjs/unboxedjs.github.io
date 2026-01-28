import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BlogService } from './blog.service';
import type { Like } from '../models/like.model';

const COLLECTION = 'likes';
const VISITOR_ID_KEY = 'blog_visitor_id';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly firebase = inject(FirebaseService);
  private readonly blogService = inject(BlogService);

  private getVisitorId(): string {
    if (typeof localStorage === 'undefined') {
      return 'anonymous';
    }

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  async hasLiked(postId: string): Promise<boolean> {
    const visitorId = this.getVisitorId();
    const { where } = this.firebase.queryHelpers;
    const likes = await this.firebase.getDocuments<Like>(COLLECTION, [
      where('postId', '==', postId),
      where('visitorId', '==', visitorId),
    ]);
    return likes.length > 0;
  }

  async toggleLike(postId: string): Promise<boolean> {
    const visitorId = this.getVisitorId();
    const { where } = this.firebase.queryHelpers;

    const existing = await this.firebase.getDocuments<Like>(COLLECTION, [
      where('postId', '==', postId),
      where('visitorId', '==', visitorId),
    ]);

    if (existing.length > 0) {
      // Unlike
      await this.firebase.deleteDocument(COLLECTION, existing[0].id);
      await this.blogService.decrementLikes(postId);
      return false;
    } else {
      // Like
      await this.firebase.addDocument(COLLECTION, {
        postId,
        visitorId,
      });
      await this.blogService.incrementLikes(postId);
      return true;
    }
  }
}
