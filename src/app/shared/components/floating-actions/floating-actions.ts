import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  OnInit,
  PLATFORM_ID,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LikeService } from '../../../core/services/like.service';
import { BlogService } from '../../../core/services/blog.service';
import { BookmarkService } from '../../../core/services/bookmark.service';

@Component({
  selector: 'app-floating-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Desktop: Fixed left sidebar with 3D effect -->
    <div class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50">
      <div
        class="flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-r-2xl shadow-[4px_4px_20px_rgba(0,0,0,0.15)] py-4 px-2 border-y border-r border-gray-100"
        style="transform: perspective(800px) rotateY(-3deg); transform-origin: left center;"
      >
        <!-- Views -->
        <div class="group relative flex flex-col items-center py-2 px-1">
          <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 transition-all duration-300 group-hover:scale-110 group-hover:from-violet-50 group-hover:to-violet-100 group-hover:text-violet-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-600 mt-1">{{ formatCount(views()) }}</span>
          <span class="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Views</span>
        </div>

        <!-- Like -->
        <button
          type="button"
          class="group relative flex flex-col items-center py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 rounded-xl"
          [attr.aria-pressed]="liked()"
          [attr.aria-label]="liked() ? 'Unlike this post' : 'Like this post'"
          [disabled]="likeLoading()"
          (click)="toggleLike()"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
            [class]="liked()
              ? 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-500'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 group-hover:from-rose-50 group-hover:to-pink-50 group-hover:text-rose-400'"
          >
            <svg
              class="w-5 h-5 transition-transform"
              [class.scale-110]="liked()"
              [attr.fill]="liked() ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="text-xs font-medium mt-1" [class]="liked() ? 'text-rose-500' : 'text-gray-600'">{{ formatCount(likes()) }}</span>
          <span class="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{{ liked() ? 'Liked!' : 'Like' }}</span>
        </button>

        <!-- Share -->
        <div class="group relative flex flex-col items-center py-2 px-1">
          <button
            type="button"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-50 group-hover:to-cyan-50 group-hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            [attr.aria-expanded]="showShareMenu()"
            aria-haspopup="true"
            (click)="toggleShareMenu()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <span class="text-xs font-medium text-gray-600 mt-1">{{ formatCount(shares()) }}</span>
          <span class="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Share</span>

          @if (showShareMenu()) {
            <div class="absolute left-full top-0 ml-3 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-36 z-10" role="menu">
              <button
                type="button"
                class="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                role="menuitem"
                (click)="shareTwitter()"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span class="text-sm">Twitter</span>
              </button>
              <button
                type="button"
                class="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                role="menuitem"
                (click)="shareLinkedIn()"
              >
                <svg class="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span class="text-sm">LinkedIn</span>
              </button>
              <button
                type="button"
                class="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                role="menuitem"
                (click)="copyLink()"
              >
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">{{ copied() ? 'Copied!' : 'Copy link' }}</span>
              </button>
            </div>
          }
        </div>

        <div class="w-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto my-1"></div>

        <!-- Bookmark -->
        <button
          type="button"
          class="group relative flex flex-col items-center py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-xl"
          [attr.aria-pressed]="bookmarked()"
          [attr.aria-label]="bookmarked() ? 'Remove bookmark' : 'Bookmark this post'"
          (click)="toggleBookmark()"
        >
          <div
            class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
            [class]="bookmarked()
              ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-500'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 group-hover:from-amber-50 group-hover:to-yellow-50 group-hover:text-amber-400'"
          >
            <svg
              class="w-5 h-5 transition-transform"
              [class.scale-110]="bookmarked()"
              [attr.fill]="bookmarked() ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span class="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{{ bookmarked() ? 'Saved!' : 'Save' }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile: Fixed bottom bar -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb">
      <div class="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        <!-- Views -->
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span class="text-[10px] font-medium text-gray-500">{{ formatCount(views()) }}</span>
        </div>

        <!-- Like -->
        <button
          type="button"
          class="flex flex-col items-center gap-0.5 focus:outline-none"
          [attr.aria-pressed]="liked()"
          [attr.aria-label]="liked() ? 'Unlike' : 'Like'"
          (click)="toggleLike()"
        >
          <div
            class="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95"
            [class]="liked() ? 'bg-rose-100 text-rose-500' : 'bg-gray-50 text-gray-500'"
          >
            <svg
              class="w-4 h-4"
              [attr.fill]="liked() ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-medium" [class]="liked() ? 'text-rose-500' : 'text-gray-500'">{{ formatCount(likes()) }}</span>
        </button>

        <!-- Share -->
        <div class="relative">
          <button
            type="button"
            class="flex flex-col items-center gap-0.5 focus:outline-none"
            [attr.aria-expanded]="showShareMenu()"
            (click)="toggleShareMenu()"
          >
            <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:scale-95 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span class="text-[10px] font-medium text-gray-500">{{ formatCount(shares()) }}</span>
          </button>

          @if (showShareMenu()) {
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-40 z-10" role="menu">
              <button
                type="button"
                class="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3"
                role="menuitem"
                (click)="shareTwitter()"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter</span>
              </button>
              <button
                type="button"
                class="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3"
                role="menuitem"
                (click)="shareLinkedIn()"
              >
                <svg class="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </button>
              <button
                type="button"
                class="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3"
                role="menuitem"
                (click)="copyLink()"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{{ copied() ? 'Copied!' : 'Copy link' }}</span>
              </button>
            </div>
          }
        </div>

        <!-- Bookmark -->
        <button
          type="button"
          class="flex flex-col items-center gap-0.5 focus:outline-none"
          [attr.aria-pressed]="bookmarked()"
          [attr.aria-label]="bookmarked() ? 'Remove bookmark' : 'Bookmark'"
          (click)="toggleBookmark()"
        >
          <div
            class="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95"
            [class]="bookmarked() ? 'bg-amber-100 text-amber-500' : 'bg-gray-50 text-gray-500'"
          >
            <svg
              class="w-4 h-4"
              [attr.fill]="bookmarked() ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span class="text-[10px] font-medium" [class]="bookmarked() ? 'text-amber-500' : 'text-gray-500'">Save</span>
        </button>
      </div>
    </div>
  `,
  styles: `
    .safe-area-pb {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class FloatingActionsComponent implements OnInit {
  private readonly likeService = inject(LikeService);
  private readonly blogService = inject(BlogService);
  private readonly bookmarkService = inject(BookmarkService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly postId = input.required<string>();
  readonly title = input.required<string>();
  readonly views = input.required<number>();
  readonly likes = input.required<number>();
  readonly shares = input.required<number>();

  readonly likeToggled = output<boolean>();
  readonly shared = output<void>();

  protected readonly liked = signal(false);
  protected readonly likeLoading = signal(false);
  protected readonly bookmarked = computed(() => this.bookmarkService.isBookmarked(this.postId()));
  protected readonly showShareMenu = signal(false);
  protected readonly copied = signal(false);

  async ngOnInit(): Promise<void> {
    const hasLiked = await this.likeService.hasLiked(this.postId());
    this.liked.set(hasLiked);
  }

  protected formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  }

  protected async toggleLike(): Promise<void> {
    this.likeLoading.set(true);
    try {
      const nowLiked = await this.likeService.toggleLike(this.postId());
      this.liked.set(nowLiked);
      this.likeToggled.emit(nowLiked);
    } finally {
      this.likeLoading.set(false);
    }
  }

  protected toggleBookmark(): void {
    this.bookmarkService.toggleBookmark(this.postId());
  }

  protected toggleShareMenu(): void {
    this.showShareMenu.update((v) => !v);
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-floating-actions')) {
      this.showShareMenu.set(false);
    }
  }

  protected async shareTwitter(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.title());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
    await this.trackShare();
  }

  protected async shareLinkedIn(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
    await this.trackShare();
  }

  protected async copyLink(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    await navigator.clipboard.writeText(window.location.href);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
    await this.trackShare();
  }

  private async trackShare(): Promise<void> {
    await this.blogService.incrementShares(this.postId());
    this.shared.emit();
    this.showShareMenu.set(false);
  }
}
