import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { CommentService } from '../../../core/services/comment.service';
import { AdSettingsService } from '../../../core/services/ad-settings.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import type { Post } from '../../../core/models/post.model';
import type { Comment } from '../../../core/models/comment.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, PaginationComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage your blog posts and comments</p>
          </div>
          <a
            routerLink="/admin/post/new"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-gray-900">{{ totalPosts() }}</div>
            <div class="text-gray-600">Total Posts</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-green-600">{{ publishedPosts() }}</div>
            <div class="text-gray-600">Published</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-yellow-600">{{ draftPosts() }}</div>
            <div class="text-gray-600">Drafts</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-orange-600">{{ pendingComments().length }}</div>
            <div class="text-gray-600">Pending Comments</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4 border-b mb-6">
          <button
            type="button"
            class="px-4 py-2 font-medium border-b-2 transition-colors"
            [class]="activeTab() === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            (click)="activeTab.set('posts')"
          >
            Posts
          </button>
          <button
            type="button"
            class="px-4 py-2 font-medium border-b-2 transition-colors"
            [class]="activeTab() === 'ghpages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            (click)="activeTab.set('ghpages')"
          >
            GH Pages ({{ ghPages().length }})
          </button>
          <button
            type="button"
            class="px-4 py-2 font-medium border-b-2 transition-colors"
            [class]="activeTab() === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            (click)="activeTab.set('comments')"
          >
            Pending Comments ({{ pendingComments().length }})
          </button>
          <button
            type="button"
            class="px-4 py-2 font-medium border-b-2 transition-colors"
            [class]="activeTab() === 'ads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            (click)="activeTab.set('ads')"
          >
            Ad Settings
          </button>
        </div>

        <!-- Posts Tab -->
        @if (activeTab() === 'posts') {
          @if (blogService.loading()) {
            <div class="flex justify-center py-16">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          } @else if (crmPosts().length === 0) {
            <div class="text-center py-16 bg-white rounded-xl">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="mt-4 text-xl font-semibold text-gray-900">No posts yet</h2>
              <p class="mt-2 text-gray-500">Create your first blog post to get started.</p>
              <a
                routerLink="/admin/post/new"
                class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </a>
            </div>
          } @else {
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Likes</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (post of paginatedPosts(); track post.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">{{ post.title }}</div>
                        <div class="text-sm text-gray-500">{{ post.category }}</div>
                      </td>
                      <td class="px-6 py-4">
                        @if (post.published) {
                          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Published
                          </span>
                        } @else {
                          <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Draft
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 text-gray-600">{{ post.views }}</td>
                      <td class="px-6 py-4 text-gray-600">{{ post.likes }}</td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            (click)="togglePublished(post)"
                            class="p-2 text-gray-400 hover:text-blue-600"
                            [title]="post.published ? 'Hide from blog' : 'Show on blog'"
                          >
                            @if (post.published) {
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            } @else {
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            }
                          </button>
                          <a
                            [routerLink]="['/admin/post', post.id, 'edit']"
                            class="p-2 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            class="p-2 text-gray-400 hover:text-red-600"
                            title="Delete"
                            (click)="deletePost(post)"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <app-pagination
              [currentPage]="currentPage()"
              [totalItems]="crmPosts().length"
              [pageSize]="pageSize"
              (pageChange)="onPageChange($event)"
            />
          }
        }

        <!-- GH Pages Tab -->
        @if (activeTab() === 'ghpages') {
          @if (ghPages().length === 0) {
            <div class="text-center py-16 bg-white rounded-xl">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 class="mt-4 text-xl font-semibold text-gray-900">No GitHub Pages</h2>
              <p class="mt-2 text-gray-500">GitHub pages projects will appear here.</p>
            </div>
          } @else {
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Project</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Updated</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (page of ghPages(); track page.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">{{ page.title }}</div>
                        <div class="text-sm text-gray-500">{{ page.description }}</div>
                      </td>
                      <td class="px-6 py-4 text-gray-600">{{ page.category }}</td>
                      <td class="px-6 py-4 text-gray-600">{{ formatDate(page) }}</td>
                      <td class="px-6 py-4 text-right">
                        <a
                          [href]="page.externalUrl"
                          target="_blank"
                          class="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View &rarr;
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- Comments Tab -->
        @if (activeTab() === 'comments') {
          @if (loadingComments()) {
            <div class="flex justify-center py-16">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          } @else if (pendingComments().length === 0) {
            <div class="text-center py-16 bg-white rounded-xl">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 class="mt-4 text-xl font-semibold text-gray-900">No pending comments</h2>
              <p class="mt-2 text-gray-500">All comments have been reviewed.</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (comment of pendingComments(); track comment.id) {
                <div class="bg-white rounded-xl p-6 shadow-sm">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-medium text-gray-900">{{ comment.author }}</div>
                      <div class="text-sm text-gray-500">{{ comment.email }}</div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        (click)="approveComment(comment.id)"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        (click)="deleteComment(comment.id)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p class="mt-4 text-gray-700">{{ comment.content }}</p>
                </div>
              }
            </div>
          }
        }

        <!-- Ad Settings Tab -->
        @if (activeTab() === 'ads') {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Default Ad Settings</h2>
            <p class="text-gray-600 mb-8">Configure default promotional content for the sidebar. These will be used on the list page and as fallback on detail pages.</p>

            @if (adSettingsService.loading()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            } @else {
              <form [formGroup]="adSettingsForm" (ngSubmit)="saveAdSettings()" class="space-y-8">
                <!-- List Page Ads -->
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">List Page Ad</h3>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Type</label>
                        <select formControlName="listAdType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">None</option>
                          <option value="youtube">YouTube Video</option>
                          <option value="udemy">Udemy Course</option>
                          <option value="amazon">Amazon Product</option>
                          <option value="website">Website Link</option>
                        </select>
                      </div>
                      <div class="md:col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">URL (or YouTube embed code)</label>
                        <input type="text" formControlName="listAdUrl" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://... or paste YouTube iframe" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Title</label>
                        <input type="text" formControlName="listAdTitle" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product/Course name..." />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Image URL (for Amazon/Udemy/Website)</label>
                        <input type="url" formControlName="listAdImage" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://...image.jpg" />
                      </div>
                    </div>
                    <div class="mt-3">
                      <label class="block text-sm text-gray-600 mb-1">Description (optional)</label>
                      <input type="text" formControlName="listAdDescription" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description..." />
                    </div>
                  </div>
                </div>

                <!-- Detail Page Default Ads -->
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Detail Page Default Ads</h3>
                  <p class="text-sm text-gray-500 mb-4">These are shown when a post doesn't have its own promotional content configured.</p>

                  <!-- Detail Page Ad 1 -->
                  <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 class="font-medium text-gray-700 mb-3">Default Ad Slot 1</h4>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Type</label>
                        <select formControlName="detailAd1Type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">None</option>
                          <option value="youtube">YouTube Video</option>
                          <option value="udemy">Udemy Course</option>
                          <option value="amazon">Amazon Product</option>
                          <option value="website">Website Link</option>
                        </select>
                      </div>
                      <div class="md:col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">URL (or YouTube embed code)</label>
                        <input type="text" formControlName="detailAd1Url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://... or paste YouTube iframe" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Title</label>
                        <input type="text" formControlName="detailAd1Title" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product/Course name..." />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Image URL</label>
                        <input type="url" formControlName="detailAd1Image" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://...image.jpg" />
                      </div>
                    </div>
                    <div class="mt-3">
                      <label class="block text-sm text-gray-600 mb-1">Description (optional)</label>
                      <input type="text" formControlName="detailAd1Description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description..." />
                    </div>
                  </div>

                  <!-- Detail Page Ad 2 -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-3">Default Ad Slot 2</h4>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Type</label>
                        <select formControlName="detailAd2Type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">None</option>
                          <option value="youtube">YouTube Video</option>
                          <option value="udemy">Udemy Course</option>
                          <option value="amazon">Amazon Product</option>
                          <option value="website">Website Link</option>
                        </select>
                      </div>
                      <div class="md:col-span-3">
                        <label class="block text-sm text-gray-600 mb-1">URL (or YouTube embed code)</label>
                        <input type="text" formControlName="detailAd2Url" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://... or paste YouTube iframe" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Title</label>
                        <input type="text" formControlName="detailAd2Title" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product/Course name..." />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Image URL</label>
                        <input type="url" formControlName="detailAd2Image" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://...image.jpg" />
                      </div>
                    </div>
                    <div class="mt-3">
                      <label class="block text-sm text-gray-600 mb-1">Description (optional)</label>
                      <input type="text" formControlName="detailAd2Description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description..." />
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex items-center gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    [disabled]="savingAdSettings()"
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {{ savingAdSettings() ? 'Saving...' : 'Save Ad Settings' }}
                  </button>
                  @if (adSettingsSaved()) {
                    <span class="text-green-600 font-medium">Settings saved!</span>
                  }
                </div>
              </form>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  protected readonly blogService = inject(BlogService);
  private readonly commentService = inject(CommentService);
  protected readonly adSettingsService = inject(AdSettingsService);
  private readonly fb = inject(FormBuilder);

  protected readonly activeTab = signal<'posts' | 'ghpages' | 'comments' | 'ads'>('posts');
  protected readonly pendingComments = signal<Comment[]>([]);
  protected readonly loadingComments = signal(false);
  protected readonly savingAdSettings = signal(false);
  protected readonly adSettingsSaved = signal(false);

  protected readonly adSettingsForm = this.fb.nonNullable.group({
    listAdType: [''],
    listAdUrl: [''],
    listAdTitle: [''],
    listAdImage: [''],
    listAdDescription: [''],
    detailAd1Type: [''],
    detailAd1Url: [''],
    detailAd1Title: [''],
    detailAd1Image: [''],
    detailAd1Description: [''],
    detailAd2Type: [''],
    detailAd2Url: [''],
    detailAd2Title: [''],
    detailAd2Image: [''],
    detailAd2Description: [''],
  });

  protected readonly totalPosts = signal(0);
  protected readonly publishedPosts = signal(0);
  protected readonly draftPosts = signal(0);
  protected readonly crmPosts = signal<Post[]>([]);
  protected readonly ghPages = signal<Post[]>([]);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly paginatedPosts = computed(() => {
    const posts = this.crmPosts();
    const start = (this.currentPage() - 1) * this.pageSize;
    return posts.slice(start, start + this.pageSize);
  });

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadPosts(), this.loadPendingComments(), this.loadAdSettings()]);
  }

  private async loadAdSettings(): Promise<void> {
    const settings = await this.adSettingsService.loadSettings();
    if (settings) {
      this.adSettingsForm.patchValue({
        listAdType: settings.listPageAd?.type ?? '',
        listAdUrl: settings.listPageAd?.url ?? '',
        listAdTitle: settings.listPageAd?.title ?? '',
        listAdImage: settings.listPageAd?.image ?? '',
        listAdDescription: settings.listPageAd?.description ?? '',
        detailAd1Type: settings.detailPageAd1?.type ?? '',
        detailAd1Url: settings.detailPageAd1?.url ?? '',
        detailAd1Title: settings.detailPageAd1?.title ?? '',
        detailAd1Image: settings.detailPageAd1?.image ?? '',
        detailAd1Description: settings.detailPageAd1?.description ?? '',
        detailAd2Type: settings.detailPageAd2?.type ?? '',
        detailAd2Url: settings.detailPageAd2?.url ?? '',
        detailAd2Title: settings.detailPageAd2?.title ?? '',
        detailAd2Image: settings.detailPageAd2?.image ?? '',
        detailAd2Description: settings.detailPageAd2?.description ?? '',
      });
    }
  }

  protected async saveAdSettings(): Promise<void> {
    this.savingAdSettings.set(true);
    this.adSettingsSaved.set(false);

    try {
      const form = this.adSettingsForm.getRawValue();

      type PromoType = 'youtube' | 'udemy' | 'amazon' | 'website';

      // Helper to build promo object without undefined values
      const buildPromo = (type: string, url: string, title: string, image: string, description: string) => {
        if (!type || !url) return null;
        const promo: Record<string, string> = { type, url };
        if (title) promo['title'] = title;
        if (image) promo['image'] = image;
        if (description) promo['description'] = description;
        return promo as { type: PromoType; url: string; title?: string; image?: string; description?: string };
      };

      const listPageAd = buildPromo(form.listAdType, form.listAdUrl, form.listAdTitle, form.listAdImage, form.listAdDescription);
      const detailPageAd1 = buildPromo(form.detailAd1Type, form.detailAd1Url, form.detailAd1Title, form.detailAd1Image, form.detailAd1Description);
      const detailPageAd2 = buildPromo(form.detailAd2Type, form.detailAd2Url, form.detailAd2Title, form.detailAd2Image, form.detailAd2Description);

      // Build settings object without null values
      const settings: Record<string, unknown> = {};
      if (listPageAd) settings['listPageAd'] = listPageAd;
      if (detailPageAd1) settings['detailPageAd1'] = detailPageAd1;
      if (detailPageAd2) settings['detailPageAd2'] = detailPageAd2;

      await this.adSettingsService.saveSettings(settings);

      this.adSettingsSaved.set(true);
      setTimeout(() => this.adSettingsSaved.set(false), 3000);
    } finally {
      this.savingAdSettings.set(false);
    }
  }

  private async loadPosts(): Promise<void> {
    await this.blogService.loadPosts(false); // Include drafts
    const allPosts = this.blogService.posts();

    // Split CRM posts and GitHub pages
    const crmPosts = allPosts.filter((p) => p.source !== 'github');
    const ghPages = allPosts.filter((p) => p.source === 'github');

    this.crmPosts.set(crmPosts);
    this.ghPages.set(ghPages);
    this.totalPosts.set(crmPosts.length);
    this.publishedPosts.set(crmPosts.filter((p) => p.published).length);
    this.draftPosts.set(crmPosts.filter((p) => !p.published).length);
  }

  private async loadPendingComments(): Promise<void> {
    this.loadingComments.set(true);
    try {
      const comments = await this.commentService.getPendingComments();
      this.pendingComments.set(comments);
    } finally {
      this.loadingComments.set(false);
    }
  }

  protected async deletePost(post: Post): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    await this.blogService.deletePost(post.id);
    await this.loadPosts();
  }

  protected async togglePublished(post: Post): Promise<void> {
    await this.blogService.updatePost(post.id, { published: !post.published });
    await this.loadPosts();
  }

  protected async approveComment(id: string): Promise<void> {
    await this.commentService.approveComment(id);
    await this.loadPendingComments();
  }

  protected async deleteComment(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    await this.commentService.deleteComment(id);
    await this.loadPendingComments();
  }

  protected formatDate(post: Post): string {
    const date = post.createdAt?.toDate?.();
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}
