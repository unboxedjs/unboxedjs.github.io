import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import type { PostPromotion } from '../../../core/models/post.model';

@Component({
  selector: 'app-promo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (promo(); as p) {
      <div class="mb-6">
        <p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{{ p.type === 'youtube' ? 'Watch' : 'Sponsored' }}</p>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          @switch (p.type) {
            @case ('youtube') {
              <div class="aspect-video">
                <iframe
                  [src]="youtubeEmbedUrl()"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                  [title]="p.title || 'YouTube video'"
                ></iframe>
              </div>
              @if (p.title) {
                <div class="p-3">
                  <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ p.title }}</p>
                </div>
              }
            }
            @case ('udemy') {
              <a [href]="trackedUrl()" target="_blank" rel="noopener noreferrer" class="block group">
                @if (p.image) {
                  <div class="overflow-hidden">
                    <img [src]="p.image" [alt]="p.title || ''" class="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                }
                <div class="p-3 flex items-center gap-2">
                  <img src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg" alt="Udemy" class="h-4" />
                  <span class="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">{{ p.title }}</span>
                </div>
              </a>
            }
            @case ('amazon') {
              <a [href]="trackedUrl()" target="_blank" rel="noopener noreferrer" class="block group">
                @if (p.image) {
                  <div class="overflow-hidden">
                    <img [src]="p.image" [alt]="p.title || ''" class="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                }
                <div class="p-3 flex items-center gap-2">
                  <svg class="h-4 w-auto flex-shrink-0" viewBox="0 0 100 30" fill="#FF9900">
                    <path d="M62.5 20.5c-4.4 3.3-10.8 5-16.3 5-7.7 0-14.6-2.8-19.9-7.6-.4-.4 0-.9.5-.6 5.7 3.3 12.7 5.3 19.9 5.3 4.9 0 10.2-1 15.1-3.1.7-.3 1.4.5.7 1z"/>
                    <path d="M64.4 18.3c-.6-.7-3.8-.4-5.2-.2-.4.1-.5-.3-.1-.6 2.6-1.8 6.8-1.3 7.3-.7.5.6-.1 5-2.5 7.1-.4.3-.7.1-.6-.3.5-1.4 1.7-4.6 1.1-5.3z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{{ p.title }}</span>
                </div>
              </a>
            }
            @case ('website') {
              <a [href]="trackedUrl()" target="_blank" rel="noopener noreferrer" class="block group">
                @if (p.image) {
                  <div class="overflow-hidden">
                    <img [src]="p.image" [alt]="p.title || ''" class="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                }
                <div class="p-3">
                  <span class="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{{ p.title }}</span>
                </div>
              </a>
            }
          }
        </div>
      </div>
    }
  `,
})
export class PromoCardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly promo = input.required<PostPromotion | undefined>();

  private youtubeCache = new Map<string, SafeResourceUrl>();

  protected readonly youtubeEmbedUrl = computed(() => {
    const p = this.promo();
    if (!p || p.type !== 'youtube') return null;

    const url = p.url;
    if (this.youtubeCache.has(url)) {
      return this.youtubeCache.get(url)!;
    }

    let videoId = '';

    // Handle full embed iframe code
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch) {
        const embedUrl = srcMatch[1];
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.youtubeCache.set(url, safeUrl);
        return safeUrl;
      }
    }

    // Handle regular URLs
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1).split('?')[0];
      } else if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.includes('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0] ?? '';
        } else {
          videoId = urlObj.searchParams.get('v') ?? '';
        }
      }
    } catch {
      videoId = url;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.youtubeCache.set(url, safeUrl);
    return safeUrl;
  });

  protected readonly trackedUrl = computed(() => {
    const p = this.promo();
    if (!p) return '';

    const url = p.url;

    try {
      const urlObj = new URL(url);

      // Add UTM parameters
      urlObj.searchParams.set('utm_source', 'unboxedjs');
      urlObj.searchParams.set('utm_medium', 'blog');
      urlObj.searchParams.set('utm_campaign', 'sidebar_promo');

      return urlObj.toString();
    } catch {
      // If URL parsing fails, return as-is
      return url;
    }
  });
}
