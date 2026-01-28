import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload';
import type { Post, CreatePostDto, PostPromotion } from '../../../core/models/post.model';

const CATEGORIES = [
  'JavaScript',
  'TypeScript',
  'Angular',
  'React',
  'Vue',
  'Node.js',
  'Web Development',
  'DevOps',
  'Tutorial',
  'Opinion',
];

@Component({
  selector: 'app-blog-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ImageUploadComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <a
              routerLink="/admin/dashboard"
              class="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </a>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ isEditing() ? 'Edit Post' : 'Create New Post' }}
            </h1>
          </div>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        } @else {
          <form
            [formGroup]="postForm"
            (ngSubmit)="savePost()"
            class="space-y-8"
          >
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                formControlName="title"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                [class]="postForm.controls.title.invalid && postForm.controls.title.touched ? 'border-red-500' : 'border-gray-300'"
                placeholder="Enter post title..."
              />
              @if (postForm.controls.title.invalid && postForm.controls.title.touched) {
                <p class="text-red-500 text-sm mt-1">Title is required (min 3 characters)</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="2"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                [class]="postForm.controls.description.invalid && postForm.controls.description.touched ? 'border-red-500' : 'border-gray-300'"
                placeholder="Brief description for preview..."
              ></textarea>
              @if (postForm.controls.description.invalid && postForm.controls.description.touched) {
                <p class="text-red-500 text-sm mt-1">Description is required (min 10 characters)</p>
              }
            </div>

            <!-- Cover Image -->
            <app-image-upload
              label="Cover Image"
              inputId="cover-image"
              [currentImage]="coverImage()"
              (imageChange)="onCoverImageChange($event)"
              (imageRemove)="onCoverImageRemove()"
            />

            <!-- Content -->
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                Content * (HTML supported)
              </label>
              <textarea
                id="content"
                formControlName="content"
                rows="20"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                [class]="postForm.controls.content.invalid && postForm.controls.content.touched ? 'border-red-500' : 'border-gray-300'"
                placeholder="Write your post content here..."
              ></textarea>
              @if (postForm.controls.content.invalid && postForm.controls.content.touched) {
                <p class="text-red-500 text-sm mt-1">Content is required</p>
              }
            </div>

            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                formControlName="categorySelect"
                (change)="onCategoryChange()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category...</option>
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
                <option value="__other__">Other (custom)...</option>
              </select>
              @if (showCustomCategory()) {
                <input
                  id="customCategory"
                  type="text"
                  formControlName="customCategory"
                  class="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class]="postForm.controls.customCategory.invalid && postForm.controls.customCategory.touched ? 'border-red-500' : 'border-gray-300'"
                  placeholder="Enter custom category..."
                />
              }
              @if (categoryInvalid()) {
                <p class="text-red-500 text-sm mt-1">Please select or enter a category</p>
              }
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                formControlName="tags"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="javascript, angular, tutorial"
              />
            </div>

            <!-- Author -->
            <div>
              <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                id="author"
                type="text"
                formControlName="author"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class]="postForm.controls.author.invalid && postForm.controls.author.touched ? 'border-red-500' : 'border-gray-300'"
                placeholder="Author name..."
              />
              @if (postForm.controls.author.invalid && postForm.controls.author.touched) {
                <p class="text-red-500 text-sm mt-1">Author is required</p>
              }
            </div>

            <!-- Sidebar Promotions -->
            <div class="border-t pt-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Sidebar Promotions (Optional)</h3>
              <p class="text-sm text-gray-500 mb-6">Add YouTube videos, Udemy courses, or Amazon products to display in the sidebar.</p>

              <!-- Promo Slot 1 -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 class="font-medium text-gray-700 mb-3">Promo Slot 1</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label for="promo1Type" class="block text-sm text-gray-600 mb-1">Type</label>
                    <select
                      id="promo1Type"
                      formControlName="promo1Type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="youtube">YouTube Video</option>
                      <option value="udemy">Udemy Course</option>
                      <option value="amazon">Amazon Product</option>
                      <option value="website">Website Link</option>
                    </select>
                  </div>
                  <div class="md:col-span-3">
                    <label for="promo1Url" class="block text-sm text-gray-600 mb-1">URL (or YouTube embed code)</label>
                    <input
                      id="promo1Url"
                      type="text"
                      formControlName="promo1Url"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://... or paste YouTube iframe"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label for="promo1Title" class="block text-sm text-gray-600 mb-1">Title</label>
                    <input
                      id="promo1Title"
                      type="text"
                      formControlName="promo1Title"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product/Course name..."
                    />
                  </div>
                  <div>
                    <label for="promo1Image" class="block text-sm text-gray-600 mb-1">Image URL (for Amazon/Udemy/Website)</label>
                    <input
                      id="promo1Image"
                      type="url"
                      formControlName="promo1Image"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://...image.jpg"
                    />
                  </div>
                </div>
                <div class="mt-3">
                  <label for="promo1Description" class="block text-sm text-gray-600 mb-1">Description (optional)</label>
                  <input
                    id="promo1Description"
                    type="text"
                    formControlName="promo1Description"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Short description..."
                  />
                </div>
              </div>

              <!-- Promo Slot 2 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-700 mb-3">Promo Slot 2</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label for="promo2Type" class="block text-sm text-gray-600 mb-1">Type</label>
                    <select
                      id="promo2Type"
                      formControlName="promo2Type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="youtube">YouTube Video</option>
                      <option value="udemy">Udemy Course</option>
                      <option value="amazon">Amazon Product</option>
                      <option value="website">Website Link</option>
                    </select>
                  </div>
                  <div class="md:col-span-3">
                    <label for="promo2Url" class="block text-sm text-gray-600 mb-1">URL (or YouTube embed code)</label>
                    <input
                      id="promo2Url"
                      type="text"
                      formControlName="promo2Url"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://... or paste YouTube iframe"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label for="promo2Title" class="block text-sm text-gray-600 mb-1">Title</label>
                    <input
                      id="promo2Title"
                      type="text"
                      formControlName="promo2Title"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product/Course name..."
                    />
                  </div>
                  <div>
                    <label for="promo2Image" class="block text-sm text-gray-600 mb-1">Image URL (for Amazon/Udemy/Website)</label>
                    <input
                      id="promo2Image"
                      type="url"
                      formControlName="promo2Image"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://...image.jpg"
                    />
                  </div>
                </div>
                <div class="mt-3">
                  <label for="promo2Description" class="block text-sm text-gray-600 mb-1">Description (optional)</label>
                  <input
                    id="promo2Description"
                    type="text"
                    formControlName="promo2Description"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Short description..."
                  />
                </div>
              </div>
            </div>

            <!-- Publish Toggle -->
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                formControlName="published"
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="published" class="text-sm font-medium text-gray-700">
                Publish immediately
              </label>
            </div>

            <!-- Error Message -->
            @if (submitError()) {
              <div class="bg-red-50 text-red-600 p-4 rounded-lg" role="alert">
                {{ submitError() }}
              </div>
            }

            <!-- Actions -->
            <div class="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                [disabled]="postForm.invalid || saving() || categoryInvalid()"
                class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {{ saving() ? 'Saving...' : (isEditing() ? 'Update Post' : 'Create Post') }}
              </button>
              <a
                routerLink="/admin/dashboard"
                class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class BlogEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);

  protected readonly categories = CATEGORIES;
  protected readonly isEditing = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly coverImage = signal<string | null>(null);
  protected readonly showCustomCategory = signal(false);

  private postId: string | null = null;

  protected readonly postForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    content: ['', [Validators.required]],
    categorySelect: [''],
    customCategory: [''],
    tags: [''],
    author: ['Surendhar Kasi Vijayaraghavan', Validators.required],
    published: [false],
    promo1Type: [''],
    promo1Url: [''],
    promo1Title: [''],
    promo1Image: [''],
    promo1Description: [''],
    promo2Type: [''],
    promo2Url: [''],
    promo2Title: [''],
    promo2Image: [''],
    promo2Description: [''],
  });

  protected categoryInvalid(): boolean {
    const select = this.postForm.controls.categorySelect;
    const custom = this.postForm.controls.customCategory;
    const selectValue = select.value;
    const customValue = custom.value;

    if (!select.touched && !custom.touched) return false;
    if (selectValue && selectValue !== '__other__') return false;
    if (selectValue === '__other__' && customValue.trim()) return false;
    return true;
  }

  async ngOnInit(): Promise<void> {
    this.postId = this.route.snapshot.paramMap.get('id');

    if (this.postId) {
      this.isEditing.set(true);
      await this.loadPost(this.postId);
    }
  }

  private async loadPost(id: string): Promise<void> {
    this.loading.set(true);

    try {
      const post = await this.blogService.getPostById(id);
      if (post) {
        const isCustomCategory = !CATEGORIES.includes(post.category);
        this.postForm.patchValue({
          title: post.title,
          description: post.description,
          content: post.content,
          categorySelect: isCustomCategory ? '__other__' : post.category,
          customCategory: isCustomCategory ? post.category : '',
          tags: post.tags.join(', '),
          author: post.author,
          published: post.published,
          promo1Type: post.promoSlot1?.type ?? '',
          promo1Url: post.promoSlot1?.url ?? '',
          promo1Title: post.promoSlot1?.title ?? '',
          promo1Image: post.promoSlot1?.image ?? '',
          promo1Description: post.promoSlot1?.description ?? '',
          promo2Type: post.promoSlot2?.type ?? '',
          promo2Url: post.promoSlot2?.url ?? '',
          promo2Title: post.promoSlot2?.title ?? '',
          promo2Image: post.promoSlot2?.image ?? '',
          promo2Description: post.promoSlot2?.description ?? '',
        });
        this.showCustomCategory.set(isCustomCategory);
        this.coverImage.set(post.coverImage);
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected onCategoryChange(): void {
    const value = this.postForm.controls.categorySelect.value;
    this.showCustomCategory.set(value === '__other__');
    if (value !== '__other__') {
      this.postForm.controls.customCategory.setValue('');
    }
  }

  protected onCoverImageChange(base64: string): void {
    this.coverImage.set(base64);
  }

  protected onCoverImageRemove(): void {
    this.coverImage.set(null);
  }

  private getCategory(): string {
    const selectValue = this.postForm.controls.categorySelect.value;
    if (selectValue === '__other__') {
      return this.postForm.controls.customCategory.value.trim();
    }
    return selectValue;
  }

  protected async savePost(): Promise<void> {
    const category = this.getCategory();
    if (this.postForm.invalid || !category) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.submitError.set(null);

    try {
      const formValue = this.postForm.getRawValue();
      const tags = formValue.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      // Helper to build promo object without undefined values
      const buildPromo = (type: string, url: string, title: string, image: string, description: string): PostPromotion | undefined => {
        if (!type || !url) return undefined;
        const promo: PostPromotion = {
          type: type as PostPromotion['type'],
          url,
        };
        if (title) promo.title = title;
        if (image) promo.image = image;
        if (description) promo.description = description;
        return promo;
      };

      const promoSlot1 = buildPromo(formValue.promo1Type, formValue.promo1Url, formValue.promo1Title, formValue.promo1Image, formValue.promo1Description);
      const promoSlot2 = buildPromo(formValue.promo2Type, formValue.promo2Url, formValue.promo2Title, formValue.promo2Image, formValue.promo2Description);

      const postData: CreatePostDto = {
        title: formValue.title,
        slug: '', // Will be generated by service
        description: formValue.description,
        content: formValue.content,
        coverImage: this.coverImage() ?? '',
        images: [],
        tags,
        category,
        author: formValue.author,
        published: formValue.published,
        promoSlot1,
        promoSlot2,
      };

      if (this.isEditing() && this.postId) {
        await this.blogService.updatePost(this.postId, postData);
      } else {
        await this.blogService.createPost(postData);
      }

      await this.router.navigate(['/admin/dashboard']);
    } catch (e) {
      console.error('Save post error:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.submitError.set(
        `Failed to save post: ${errorMessage}. Check Firebase security rules allow writes.`
      );
      this.saving.set(false);
    }
  }
}
