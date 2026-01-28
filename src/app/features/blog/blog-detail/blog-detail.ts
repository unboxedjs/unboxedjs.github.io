import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BlogService } from '../../../core/services/blog.service';
import { AdSettingsService } from '../../../core/services/ad-settings.service';
import { FloatingActionsComponent } from '../../../shared/components/floating-actions/floating-actions';
import { CommentSectionComponent } from '../../../shared/components/comment-section/comment-section';
import { CommentFormComponent } from '../../../shared/components/comment-form/comment-form';
import { PromoCardComponent } from '../../../shared/components/promo-card/promo-card';
import type { Post, PostPromotion } from '../../../core/models/post.model';

interface GhBlog {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  updated: string;
}

@Component({
  selector: 'app-blog-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FloatingActionsComponent,
    CommentSectionComponent,
    CommentFormComponent,
    PromoCardComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      @if (loading()) {
        <!-- Loading State -->
        <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div class="absolute inset-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-gray-500 animate-pulse">Loading article...</p>
        </div>
      } @else if (error()) {
        <!-- Error State -->
        <div class="max-w-2xl mx-auto px-4 py-20 text-center">
          <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-3">Article Not Found</h1>
          <p class="text-gray-500 mb-8 max-w-md mx-auto">The article you're looking for doesn't exist or may have been removed.</p>
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </a>
        </div>
      } @else if (post()) {
        <!-- Floating Social Actions -->
        <app-floating-actions
          [postId]="post()!.id"
          [title]="post()!.title"
          [views]="post()!.views"
          [likes]="post()!.likes"
          [shares]="post()!.shares"
          (likeToggled)="onLikeToggled($event)"
          (shared)="onShared()"
        />

        <!-- Main Content Area -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <!-- Back Navigation -->
          <nav class="mb-6 lg:mb-8">
            <a
              routerLink="/"
              class="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium group"
            >
              <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </a>
          </nav>

          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <!-- Main Article -->
            <article class="flex-1 min-w-0 lg:pl-8">
              <!-- Article Header -->
              <header class="mb-8">
                <!-- Category & Meta -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <span class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                    {{ post()!.category }}
                  </span>
                  <span class="text-sm text-gray-400">{{ formattedDate() }}</span>
                  <span class="hidden sm:inline text-gray-300">|</span>
                  <span class="hidden sm:inline text-sm text-gray-400">{{ readingTime() }} min read</span>
                </div>

                <!-- Title -->
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
                  {{ post()!.title }}
                </h1>

                <!-- Author -->
                <p class="text-sm text-gray-400">by {{ post()!.author }}</p>
              </header>

              <!-- Featured Image -->
              @if (post()!.coverImage) {
                <figure class="mb-10">
                  <img
                    [src]="post()!.coverImage"
                    [alt]="post()!.title"
                    class="w-full h-auto object-contain"
                  />
                </figure>
              }

              <!-- Article Content -->
              <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-10 mb-10">
                <div
                  class="prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                    prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:rounded-2xl prose-pre:shadow-xl
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:not-italic
                    prose-li:text-gray-700"
                  [innerHTML]="post()!.content"
                ></div>
              </div>

              <!-- Mobile: Ad 1 -->
              <div class="lg:hidden mb-8">
                @if (promo1(); as promo) {
                  <app-promo-card [promo]="promo" />
                }
              </div>

              <!-- Comments Section -->
              <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-10 mb-8">
                <app-comment-section #commentSection [postId]="post()!.id" />
              </div>

              <!-- Mobile: Comment Form -->
              <div class="lg:hidden mb-8">
                <app-comment-form
                  [postId]="post()!.id"
                  (commentAdded)="onCommentAdded()"
                />
              </div>

              <!-- Mobile: Ad 2 -->
              <div class="lg:hidden mb-8">
                @if (promo2(); as promo) {
                  <app-promo-card [promo]="promo" />
                }
              </div>

              <!-- Tags / Topics -->
              @if (post()!.tags.length > 0) {
                <div class="mb-10 lg:mb-0">
                  <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Topics</h4>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of post()!.tags; track tag) {
                      <a
                        [routerLink]="'/'"
                        [queryParams]="{tag: tag}"
                        class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200 shadow-sm"
                      >
                        #{{ tag }}
                      </a>
                    }
                  </div>
                </div>
              }

              <!-- Bottom padding for mobile floating bar -->
              <div class="lg:hidden h-20"></div>
            </article>

            <!-- Sidebar -->
            <aside class="w-full lg:w-80 flex-shrink-0 space-y-6">
              <div class="hidden lg:block sticky top-6">
                <!-- Promo Slot 1 -->
                @if (promo1(); as promo) {
                  <app-promo-card [promo]="promo" />
                }

                <!-- Comment Form - Between Ads -->
                <div class="my-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <span class="text-xs text-gray-400 uppercase tracking-widest">Join Discussion</span>
                    <div class="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent"></div>
                  </div>
                  <app-comment-form
                    [postId]="post()!.id"
                    (commentAdded)="onCommentAdded()"
                  />
                </div>

                <!-- Visual Separator Before Ad 2 -->
                @if (promo2()) {
                  <div class="relative py-4">
                    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <div class="relative flex justify-center">
                      <div class="bg-slate-50 px-3 py-1">
                        <div class="flex items-center gap-1.5">
                          <div class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                          <div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          <div class="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Promo Slot 2 -->
                @if (promo2(); as promo) {
                  <app-promo-card [promo]="promo" />
                }
              </div>
            </aside>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class BlogDetailComponent implements OnInit {
  @ViewChild('commentSection') commentSection?: CommentSectionComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly adSettingsService = inject(AdSettingsService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly post = signal<Post | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly promo1 = computed<PostPromotion | undefined>(() => {
    const p = this.post();
    return p?.promoSlot1 ?? this.adSettingsService.getDetailPageAd1();
  });

  protected readonly promo2 = computed<PostPromotion | undefined>(() => {
    const p = this.post();
    return p?.promoSlot2 ?? this.adSettingsService.getDetailPageAd2();
  });

  protected readonly formattedDate = computed(() => {
    const p = this.post();
    if (!p?.createdAt?.toDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(p.createdAt.toDate());
  });

  protected readonly readingTime = computed(() => {
    const p = this.post();
    if (!p?.content) return 0;
    const text = p.content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  });

  async ngOnInit(): Promise<void> {
    this.adSettingsService.loadSettings();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    try {
      const ghBlog = await this.findGhBlog(id);
      if (ghBlog) {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = `/${ghBlog.name}/`;
        }
        return;
      }

      let post = await this.blogService.getPostBySlug(id);
      if (!post) {
        post = await this.blogService.getPostById(id);
      }

      if (!post) {
        this.error.set(true);
      } else {
        this.post.set({ ...post, source: 'crm' });
        await this.blogService.incrementViews(post.id);
      }
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private async findGhBlog(id: string): Promise<GhBlog | null> {
    try {
      const blogs = await firstValueFrom(this.http.get<GhBlog[]>('/gh-blogs.json'));
      return blogs?.find((b) => b.name === id) ?? null;
    } catch {
      return null;
    }
  }

  protected onLikeToggled(liked: boolean): void {
    const p = this.post();
    if (p) {
      this.post.set({
        ...p,
        likes: liked ? p.likes + 1 : p.likes - 1,
      });
    }
  }

  protected onShared(): void {
    const p = this.post();
    if (p) {
      this.post.set({
        ...p,
        shares: p.shares + 1,
      });
    }
  }

  protected onCommentAdded(): void {
    this.commentSection?.loadComments();
  }
}
