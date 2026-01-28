import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { LikeService } from '../../../core/services/like.service';

@Component({
  selector: 'app-like-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
      [class]="liked() ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      [attr.aria-pressed]="liked()"
      [attr.aria-label]="liked() ? 'Unlike this post' : 'Like this post'"
      [disabled]="loading()"
      (click)="toggleLike()"
    >
      <svg
        class="w-5 h-5 transition-transform"
        [class.scale-110]="liked()"
        [attr.fill]="liked() ? 'currentColor' : 'none'"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{{ count() }}</span>
    </button>
  `,
})
export class LikeButtonComponent implements OnInit {
  private readonly likeService = inject(LikeService);

  readonly postId = input.required<string>();
  readonly count = input.required<number>();
  readonly likeToggled = output<boolean>();

  protected readonly liked = signal(false);
  protected readonly loading = signal(false);

  async ngOnInit(): Promise<void> {
    const hasLiked = await this.likeService.hasLiked(this.postId());
    this.liked.set(hasLiked);
  }

  protected async toggleLike(): Promise<void> {
    this.loading.set(true);
    try {
      const nowLiked = await this.likeService.toggleLike(this.postId());
      this.liked.set(nowLiked);
      this.likeToggled.emit(nowLiked);
    } finally {
      this.loading.set(false);
    }
  }
}
