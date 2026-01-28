import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-comment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border border-gray-200/60">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Leave a Comment</h3>
      </div>

      <form [formGroup]="commentForm" (ngSubmit)="submitComment()" class="space-y-3">
        <!-- Comment Text -->
        <div>
          <label for="comment-content" class="sr-only">Your comment</label>
          <textarea
            id="comment-content"
            formControlName="content"
            placeholder="Share your thoughts..."
            rows="4"
            class="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-none transition-all placeholder:text-gray-400"
          ></textarea>
        </div>

        <!-- Optional Fields Toggle -->
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          (click)="showOptionalFields.set(!showOptionalFields())"
        >
          <svg
            class="w-3.5 h-3.5 transition-transform duration-200"
            [class.rotate-90]="showOptionalFields()"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {{ showOptionalFields() ? 'Hide' : 'Add' }} name & email (optional)
        </button>

        @if (showOptionalFields()) {
          <div class="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label for="comment-author" class="sr-only">Name (optional)</label>
              <input
                id="comment-author"
                type="text"
                formControlName="author"
                placeholder="Your name (optional)"
                class="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label for="comment-email" class="sr-only">Email (optional)</label>
              <input
                id="comment-email"
                type="email"
                formControlName="email"
                placeholder="your@email.com (optional)"
                class="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all placeholder:text-gray-400"
              />
              @if (commentForm.get('email')?.errors?.['email'] && commentForm.get('email')?.touched) {
                <p class="text-rose-500 text-xs mt-1">Please enter a valid email</p>
              }
            </div>
          </div>
        }

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="!commentForm.get('content')?.valid || submitting()"
          class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          @if (submitting()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </span>
          } @else {
            Post Comment
          }
        </button>

        <!-- Status Messages -->
        @if (submitError()) {
          <div class="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <svg class="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-rose-600 text-xs">{{ submitError() }}</p>
          </div>
        }
        @if (submitSuccess()) {
          <div class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-emerald-600 text-xs">Comment submitted for review!</p>
          </div>
        }
      </form>
    </div>
  `,
  styles: `
    @keyframes slide-in-from-top {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-in {
      animation: slide-in-from-top 0.2s ease-out;
    }
  `,
})
export class CommentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly commentService = inject(CommentService);

  readonly postId = input.required<string>();
  readonly commentAdded = output<void>();

  protected readonly showOptionalFields = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitSuccess = signal(false);

  protected readonly commentForm = this.fb.nonNullable.group({
    author: [''],
    email: ['', [Validators.email]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected async submitComment(): Promise<void> {
    const contentControl = this.commentForm.get('content');
    if (!contentControl?.valid) return;

    this.submitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      const { author, email, content } = this.commentForm.getRawValue();
      await this.commentService.addComment({
        postId: this.postId(),
        author: author || 'Anonymous',
        email: email || '',
        content,
      });
      this.commentForm.reset();
      this.submitSuccess.set(true);
      this.commentAdded.emit();

      setTimeout(() => this.submitSuccess.set(false), 5000);
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to submit comment');
    } finally {
      this.submitting.set(false);
    }
  }
}
