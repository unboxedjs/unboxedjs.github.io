import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-share-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        [attr.aria-expanded]="showMenu()"
        aria-haspopup="true"
        (click)="toggleMenu()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>{{ count() }}</span>
      </button>

      @if (showMenu()) {
        <div
          class="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 min-w-40"
          role="menu"
        >
          <button
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
            role="menuitem"
            (click)="shareTwitter()"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </button>
          <button
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
            role="menuitem"
            (click)="shareLinkedIn()"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>
          <button
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
            role="menuitem"
            (click)="copyLink()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ copied() ? 'Copied!' : 'Copy link' }}
          </button>
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ShareButtonComponent {
  private readonly blogService = inject(BlogService);

  readonly postId = input.required<string>();
  readonly title = input.required<string>();
  readonly count = input.required<number>();
  readonly shared = output<void>();

  protected readonly showMenu = signal(false);
  protected readonly copied = signal(false);

  protected toggleMenu(): void {
    this.showMenu.update((v) => !v);
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-share-button')) {
      this.showMenu.set(false);
    }
  }

  protected async shareTwitter(): Promise<void> {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.title());
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=550,height=420'
    );
    await this.trackShare();
  }

  protected async shareLinkedIn(): Promise<void> {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'width=550,height=420'
    );
    await this.trackShare();
  }

  protected async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
    await this.trackShare();
  }

  private async trackShare(): Promise<void> {
    await this.blogService.incrementShares(this.postId());
    this.shared.emit();
    this.showMenu.set(false);
  }
}
