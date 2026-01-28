import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const BOOKMARKS_KEY = 'bookmarks';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly bookmarks = signal<string[]>([]);

  constructor() {
    this.loadBookmarks();
  }

  private loadBookmarks(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        this.bookmarks.set(JSON.parse(stored));
      }
    } catch {
      this.bookmarks.set([]);
    }
  }

  private saveBookmarks(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(this.bookmarks()));
    } catch {
      // Storage quota exceeded or not available
    }
  }

  isBookmarked(postId: string): boolean {
    return this.bookmarks().includes(postId);
  }

  toggleBookmark(postId: string): boolean {
    const current = this.bookmarks();
    const isCurrentlyBookmarked = current.includes(postId);

    if (isCurrentlyBookmarked) {
      this.bookmarks.set(current.filter((id) => id !== postId));
    } else {
      this.bookmarks.set([postId, ...current]);
    }

    this.saveBookmarks();
    return !isCurrentlyBookmarked;
  }

  addBookmark(postId: string): void {
    if (!this.isBookmarked(postId)) {
      this.bookmarks.update((list) => [postId, ...list]);
      this.saveBookmarks();
    }
  }

  removeBookmark(postId: string): void {
    this.bookmarks.update((list) => list.filter((id) => id !== postId));
    this.saveBookmarks();
  }

  getBookmarkCount(): number {
    return this.bookmarks().length;
  }
}
