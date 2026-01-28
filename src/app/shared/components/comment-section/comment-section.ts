import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommentService } from '../../../core/services/comment.service';
import type { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="comments-heading" class="relative">
      <!-- Section Header -->
      <div class="flex items-center gap-3 mb-8">
        <div class="flex items-center gap-2">
          <div class="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
          <h3 id="comments-heading" class="text-xl font-bold text-gray-900">
            Discussion
          </h3>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-sm font-medium text-gray-600">{{ comments().length }}</span>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12 gap-2">
          <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      } @else if (comments().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-10">
          <p class="text-gray-400 italic">"Be the first to start the conversation"</p>
        </div>
      } @else {
        <!-- Comments List - Chat style -->
        <div class="space-y-3">
          @for (comment of comments(); track comment.id; let i = $index) {
            <article
              class="group"
              [class.animate-fade-in]="true"
              [style.animation-delay]="i * 40 + 'ms'"
            >
              <!-- Comment bubble -->
              <div class="bg-gray-50 hover:bg-gray-100/80 transition-colors px-4 py-3 rounded-2xl rounded-tl-sm">
                <p class="text-gray-700 text-sm leading-relaxed">{{ comment.content }}</p>
              </div>

              <!-- Meta row -->
              <div class="flex items-center justify-between mt-1.5 px-2">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-medium text-gray-500">{{ comment.author }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(comment) }}</span>
                </div>
                <button
                  type="button"
                  class="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                  (click)="likeComment(comment.id)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ comment.likes || 0 }}</span>
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
      opacity: 0;
    }
  `,
})
export class CommentSectionComponent implements OnInit {
  private readonly commentService = inject(CommentService);

  readonly postId = input.required<string>();

  protected readonly comments = signal<Comment[]>([]);
  protected readonly loading = signal(false);

  private readonly accentColors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
  ];

  async ngOnInit(): Promise<void> {
    await this.loadComments();
  }

  async loadComments(): Promise<void> {
    this.loading.set(true);
    try {
      const comments = await this.commentService.getCommentsForPost(this.postId());
      this.comments.set(comments);
    } finally {
      this.loading.set(false);
    }
  }

  protected getAccentColor(index: number): string {
    const colors = ['indigo', 'violet', 'pink', 'rose', 'orange', 'yellow', 'green', 'cyan'];
    return colors[index % colors.length] + '-500';
  }

  protected getAccentHex(index: number): string {
    return this.accentColors[index % this.accentColors.length];
  }

  protected async likeComment(commentId: string): Promise<void> {
    await this.commentService.likeComment(commentId);
    await this.loadComments();
  }

  protected formatDate(comment: Comment): string {
    const date = comment.createdAt?.toDate?.();
    if (!date) return '';

    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}
