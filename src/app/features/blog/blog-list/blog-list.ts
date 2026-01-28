import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { BlogService } from '../../../core/services/blog.service';
import { RemoteConfigService } from '../../../core/services/remote-config.service';
import { AdSettingsService } from '../../../core/services/ad-settings.service';
import { BookmarkService } from '../../../core/services/bookmark.service';
import { PostCardComponent } from '../../../shared/components/post-card/post-card';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { PromoCardComponent } from '../../../shared/components/promo-card/promo-card';
import type { Post } from '../../../core/models/post.model';

const PAGE_SIZE = 6;

interface ArchiveGroup {
  year: number;
  months: { month: number; name: string; count: number }[];
}

@Component({
  selector: 'app-blog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PostCardComponent, SearchBarComponent, NgOptimizedImage, PaginationComponent, PromoCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Content -->
          <main class="flex-1 min-w-0 order-2 lg:order-1">
            <!-- Active Filters -->
            @if (activeTag() || activeYear() || searchQuery()) {
              <div class="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white rounded-lg shadow-sm">
                <span class="text-gray-600 text-sm">Filtering by:</span>
                @if (searchQuery()) {
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    Search: "{{ searchQuery() }}"
                    <button type="button" class="ml-1 hover:text-gray-600" (click)="clearSearch()" aria-label="Clear search">&times;</button>
                  </span>
                }
                @if (activeTag()) {
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    #{{ activeTag() }}
                    <button type="button" class="ml-1 hover:text-blue-600" (click)="clearTag()" aria-label="Clear tag">&times;</button>
                  </span>
                }
                @if (activeYear()) {
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {{ activeYear() }}@if (activeMonth()) {/{{ monthNames[activeMonth()! - 1] }}}
                    <button type="button" class="ml-1 hover:text-purple-600" (click)="clearDate()" aria-label="Clear date">&times;</button>
                  </span>
                }
                <button type="button" class="text-sm text-gray-500 hover:text-gray-700 underline ml-2" (click)="clearAllFilters()">
                  Clear all
                </button>
              </div>
            }

            <!-- Loading State -->
            @if (blogService.loading()) {
              <div class="flex justify-center py-16">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }

            <!-- Error State -->
            @if (blogService.error()) {
              <div class="bg-red-50 text-red-600 p-6 rounded-xl text-center">
                <p>{{ blogService.error() }}</p>
                <button type="button" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" (click)="loadPosts()">
                  Try Again
                </button>
              </div>
            }

            <!-- Posts List -->
            @if (!blogService.loading() && !blogService.error()) {
              @if (filteredPosts().length === 0) {
                <div class="text-center py-16 bg-white rounded-xl shadow-sm">
                  <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 class="mt-4 text-xl font-semibold text-gray-900">No posts found</h2>
                  <p class="mt-2 text-gray-500">
                    @if (searchQuery() || activeTag() || activeYear()) {
                      Try adjusting your filters.
                    } @else {
                      Check back later for new content!
                    }
                  </p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  @for (post of paginatedPosts(); track post.id) {
                    <app-post-card [post]="post" />
                  }
                </div>

                <!-- Pagination -->
                <app-pagination
                  [currentPage]="currentPage()"
                  [totalItems]="filteredPosts().length"
                  [pageSize]="pageSize"
                  (pageChange)="onPageChange($event)"
                />
              }
            }
          </main>

          <!-- Sidebar -->
          <aside class="w-full lg:w-80 flex-shrink-0 space-y-6 order-1 lg:order-2">
            <!-- Logo & Brand -->
            <div class="bg-white rounded-xl shadow-sm p-6 text-center">
              <a href="/" class="block">
                <img
                  ngSrc="/logo_full.svg"
                  alt="UnboxedJS"
                  width="200"
                  height="100"
                  class="mx-auto"
                  priority
                />
              </a>
              <p class="text-sm text-gray-500 mt-3">
                Exploring JavaScript, TypeScript, Angular, and modern web development
              </p>
              <!-- Social Links -->
              <div class="flex items-center justify-center gap-2 mt-4">
                <a [href]="config().socialTwitter" target="_blank" rel="noopener noreferrer" class="p-2 hover:opacity-75 transition-opacity">
                  <img src="/icons/twitter.png" class="w-6 h-6" alt="Twitter" />
                </a>
                <a [href]="config().socialYoutube" target="_blank" rel="noopener noreferrer" class="p-2 hover:opacity-75 transition-opacity">
                  <img src="/icons/youtube.png" class="w-6 h-6" alt="YouTube" />
                </a>
                <a [href]="config().socialFacebook" target="_blank" rel="noopener noreferrer" class="p-2 hover:opacity-75 transition-opacity">
                  <img src="/icons/facebook.png" class="w-6 h-6" alt="Facebook" />
                </a>
                <a [href]="config().socialInstagram" target="_blank" rel="noopener noreferrer" class="p-2 hover:opacity-75 transition-opacity">
                  <img src="/icons/instagram.png" class="w-6 h-6" alt="Instagram" />
                </a>
                <a [href]="config().socialLinkedin" target="_blank" rel="noopener noreferrer" class="p-2 hover:opacity-75 transition-opacity">
                  <img src="/icons/linkedin.png" class="w-6 h-6" alt="LinkedIn" />
                </a>
              </div>
            </div>

            <!-- Ad Space -->
            <div>
              @if (adSettingsService.getListPageAd(); as promo) {
                <app-promo-card [promo]="promo" />
              } @else if (!adSettingsService.loading()) {
                <div class="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center">
                  <img ngSrc="/logo_full.svg" alt="UnboxedJS" width="160" height="80" />
                </div>
              }
            </div>

            <!-- Search -->
            <div class="bg-white rounded-xl shadow-sm p-4">
              <h3 class="font-semibold text-gray-900 mb-3">Search</h3>
              <app-search-bar (searchChange)="onSearchChange($event)" />
            </div>

            <!-- Tags -->
            @if (allTags().length > 0) {
              <div class="bg-white rounded-xl shadow-sm p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  @for (tag of allTags(); track tag.name) {
                    <button
                      type="button"
                      class="px-2 py-1 text-xs rounded-full transition-colors"
                      [class]="activeTag() === tag.name ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
                      (click)="filterByTag(tag.name)"
                    >
                      #{{ tag.name }}
                      <span class="ml-1 opacity-75">({{ tag.count }})</span>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Archive Timeline -->
            @if (archive().length > 0) {
              <div class="bg-white rounded-xl shadow-sm p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Archive</h3>
                <div class="space-y-2">
                  @for (yearGroup of archive(); track yearGroup.year) {
                    <div>
                      <button
                        type="button"
                        class="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 hover:text-blue-600 py-1"
                        [class.text-blue-600]="activeYear() === yearGroup.year"
                        (click)="toggleYear(yearGroup.year)"
                      >
                        <span>{{ yearGroup.year }}</span>
                        <svg
                          class="w-4 h-4 transition-transform"
                          [class.rotate-180]="expandedYears().has(yearGroup.year)"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      @if (expandedYears().has(yearGroup.year)) {
                        <ul class="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                          @for (month of yearGroup.months; track month.month) {
                            <li>
                              <button
                                type="button"
                                class="text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                [class.text-blue-600]="activeYear() === yearGroup.year && activeMonth() === month.month"
                                [class.font-medium]="activeYear() === yearGroup.year && activeMonth() === month.month"
                                (click)="filterByDate(yearGroup.year, month.month)"
                              >
                                {{ month.name }} ({{ month.count }})
                              </button>
                            </li>
                          }
                        </ul>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Recent / Saved Posts Tabs -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <!-- Tab Headers -->
              <div class="flex border-b border-gray-100">
                <button
                  type="button"
                  class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
                  [class]="postsTab() === 'recent'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
                  (click)="postsTab.set('recent')"
                >
                  Recent
                  @if (postsTab() === 'recent') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  }
                </button>
                <button
                  type="button"
                  class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
                  [class]="postsTab() === 'saved'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
                  (click)="postsTab.set('saved')"
                >
                  Saved
                  @if (validBookmarkCount() > 0) {
                    <span
                      class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full"
                      [class]="postsTab() === 'saved' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'"
                    >
                      {{ validBookmarkCount() }}
                    </span>
                  }
                  @if (postsTab() === 'saved') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
                  }
                </button>
              </div>

              <!-- Tab Content -->
              <div class="p-4">
                @if (postsTab() === 'recent') {
                  @if (recentPosts().length > 0) {
                    <ul class="space-y-3">
                      @for (post of recentPosts(); track post.id) {
                        <li class="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                          <a
                            [href]="'/' + post.slug"
                            class="block text-sm text-gray-700 hover:text-indigo-600 transition-colors line-clamp-2"
                          >
                            {{ post.title }}
                          </a>
                          <span class="text-xs text-gray-400">{{ formatDate(post) }}</span>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="text-sm text-gray-400 text-center py-4">No posts yet</p>
                  }
                } @else {
                  @if (savedPosts().length > 0) {
                    <ul class="space-y-3">
                      @for (post of savedPosts(); track post.id) {
                        <li class="group border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                          <div class="flex items-start gap-2">
                            <a
                              [href]="'/' + post.slug"
                              class="flex-1 block text-sm text-gray-700 hover:text-indigo-600 transition-colors line-clamp-2"
                            >
                              {{ post.title }}
                            </a>
                            <button
                              type="button"
                              class="flex-shrink-0 p-1 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="Remove from saved"
                              (click)="removeBookmark(post.id)"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <span class="text-xs text-gray-400">{{ formatDate(post) }}</span>
                        </li>
                      }
                    </ul>
                  } @else {
                    <div class="text-center py-6">
                      <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <p class="text-sm text-gray-500 mb-1">No saved posts</p>
                      <p class="text-xs text-gray-400">Click the bookmark icon on any post to save it here</p>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Buy Me a Coffee -->
            <div class="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-sm p-4 text-center">
              <a [href]="config().socialBuymeacoffee" target="_blank" rel="noopener noreferrer" class="block">
                <img src="/icons/coffee.png" class="w-8 h-8 mx-auto mb-2" alt="Buy Me a Coffee" />
                <p class="text-sm font-medium text-white">Support this blog</p>
                <p class="text-xs text-white/80">Buy me a coffee</p>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
})
export class BlogListComponent implements OnInit {
  protected readonly blogService = inject(BlogService);
  protected readonly remoteConfigService = inject(RemoteConfigService);
  protected readonly adSettingsService = inject(AdSettingsService);
  protected readonly bookmarkService = inject(BookmarkService);

  protected readonly searchQuery = signal('');
  protected readonly activeTag = signal<string | null>(null);
  protected readonly activeYear = signal<number | null>(null);
  protected readonly activeMonth = signal<number | null>(null);
  protected readonly expandedYears = signal<Set<number>>(new Set());
  protected readonly postsTab = signal<'recent' | 'saved'>('recent');

  protected readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  protected readonly config = this.remoteConfigService.config;

  protected readonly allTags = computed(() => {
    const tagCounts = new Map<string, number>();
    this.blogService.posts().forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly archive = computed((): ArchiveGroup[] => {
    const posts = this.blogService.posts();
    const groups = new Map<number, Map<number, number>>();

    posts.forEach((post) => {
      const date = post.createdAt?.toDate?.();
      if (!date) return;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (!groups.has(year)) {
        groups.set(year, new Map());
      }
      const yearMap = groups.get(year)!;
      yearMap.set(month, (yearMap.get(month) ?? 0) + 1);
    });

    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Array.from(months.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([month, count]) => ({
            month,
            name: this.monthNames[month - 1],
            count,
          })),
      }));
  });

  protected readonly recentPosts = computed(() => {
    return this.blogService.posts().slice(0, 5);
  });

  protected readonly savedPosts = computed(() => {
    const bookmarkIds = this.bookmarkService.bookmarks();
    const allPosts = this.blogService.posts();
    return bookmarkIds
      .map((id) => allPosts.find((p) => p.id === id))
      .filter((p): p is Post => p !== undefined)
      .slice(0, 5);
  });

  protected readonly validBookmarkCount = computed(() => {
    const bookmarkIds = this.bookmarkService.bookmarks();
    const allPosts = this.blogService.posts();
    return bookmarkIds.filter((id) => allPosts.some((p) => p.id === id)).length;
  });

  protected readonly filteredPosts = computed(() => {
    let posts = this.blogService.posts();

    const query = this.searchQuery();
    if (query) {
      const lowerQuery = query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
      );
    }

    const tag = this.activeTag();
    if (tag) {
      posts = posts.filter((p) => p.tags.includes(tag));
    }

    const year = this.activeYear();
    const month = this.activeMonth();
    if (year) {
      posts = posts.filter((p) => {
        const date = p.createdAt?.toDate?.();
        if (!date) return false;
        if (date.getFullYear() !== year) return false;
        if (month && date.getMonth() + 1 !== month) return false;
        return true;
      });
    }

    return posts;
  });

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly paginatedPosts = computed(() => {
    const posts = this.filteredPosts();
    const start = (this.currentPage() - 1) * this.pageSize;
    return posts.slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadPosts();
    this.adSettingsService.loadSettings();

    // Expand current year by default
    const currentYear = new Date().getFullYear();
    this.expandedYears.update((set) => new Set([...set, currentYear]));
  }

  protected async loadPosts(): Promise<void> {
    await this.blogService.loadPosts(true);
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected filterByTag(tag: string): void {
    this.activeTag.set(this.activeTag() === tag ? null : tag);
    this.currentPage.set(1);
  }

  protected filterByDate(year: number, month: number): void {
    if (this.activeYear() === year && this.activeMonth() === month) {
      this.activeYear.set(null);
      this.activeMonth.set(null);
    } else {
      this.activeYear.set(year);
      this.activeMonth.set(month);
    }
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggleYear(year: number): void {
    this.expandedYears.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  protected clearTag(): void {
    this.activeTag.set(null);
    this.currentPage.set(1);
  }

  protected clearDate(): void {
    this.activeYear.set(null);
    this.activeMonth.set(null);
    this.currentPage.set(1);
  }

  protected clearAllFilters(): void {
    this.searchQuery.set('');
    this.activeTag.set(null);
    this.activeYear.set(null);
    this.activeMonth.set(null);
    this.currentPage.set(1);
  }

  protected formatDate(post: Post): string {
    const date = post.createdAt?.toDate?.();
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  protected removeBookmark(postId: string): void {
    this.bookmarkService.removeBookmark(postId);
  }
}
