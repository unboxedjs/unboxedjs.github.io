import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import type { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group">
      <a [href]="postUrl()" class="block">
        <!-- Cover Image -->
        @if (post().coverImage) {
          <div class="relative h-52 overflow-hidden">
            <img
              [src]="post().coverImage"
              [alt]="post().title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <span class="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              {{ post().category }}
            </span>
          </div>
        } @else {
          <div class="h-4 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        }

        <div class="p-6">
          <!-- Meta -->
          <div class="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <time class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formattedDate() }}
            </time>
            @if (!post().coverImage) {
              <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{{ post().category }}</span>
            }
          </div>

          <!-- Title -->
          <h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
            {{ post().title }}
          </h2>

          <!-- Description -->
          <p class="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {{ post().description }}
          </p>

          <!-- Tags -->
          @if (post().tags.length > 0) {
            <div class="flex flex-wrap gap-2 mb-4">
              @for (tag of post().tags.slice(0, 3); track tag) {
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors">
                  #{{ tag }}
                </span>
              }
            </div>
          }

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <span class="text-sm text-gray-500">{{ post().author }}</span>
            <span class="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Read more
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </article>
  `,
})
export class PostCardComponent {
  readonly post = input.required<Post>();

  protected readonly postUrl = computed(() =>
    this.post().externalUrl ?? `/${this.post().slug}`
  );

  protected readonly formattedDate = computed(() => {
    const date = this.post().createdAt?.toDate?.();
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  });
}
