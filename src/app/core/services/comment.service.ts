import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import type { Comment, CreateCommentDto } from '../models/comment.model';

const COLLECTION = 'comments';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly firebase = inject(FirebaseService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async getCommentsForPost(postId: string): Promise<Comment[]> {
    const { where, orderBy } = this.firebase.queryHelpers;
    return this.firebase.getDocuments<Comment>(COLLECTION, [
      where('postId', '==', postId),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getAllCommentsForPost(postId: string): Promise<Comment[]> {
    const { where, orderBy } = this.firebase.queryHelpers;
    return this.firebase.getDocuments<Comment>(COLLECTION, [
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getPendingComments(): Promise<Comment[]> {
    const { where, orderBy } = this.firebase.queryHelpers;
    return this.firebase.getDocuments<Comment>(COLLECTION, [
      where('approved', '==', false),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async addComment(data: CreateCommentDto): Promise<string> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const id = await this.firebase.addDocument(COLLECTION, {
        ...data,
        likes: 0,
        approved: false, // Require moderation
      });
      return id;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add comment';
      this.error.set(message);
      throw e;
    } finally {
      this.loading.set(false);
    }
  }

  async approveComment(id: string): Promise<void> {
    await this.firebase.updateDocument(COLLECTION, id, { approved: true });
  }

  async deleteComment(id: string): Promise<void> {
    await this.firebase.deleteDocument(COLLECTION, id);
  }

  async likeComment(id: string): Promise<void> {
    const comment = await this.firebase.getDocument<Comment>(COLLECTION, id);
    if (comment) {
      await this.firebase.updateDocument(COLLECTION, id, {
        likes: comment.likes + 1,
      });
    }
  }
}
