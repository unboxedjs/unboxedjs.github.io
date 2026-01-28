import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
        <!-- Previous -->
        <button
          type="button"
          class="px-4 py-2 rounded-lg border transition-colors flex items-center gap-1"
          [class]="currentPage() === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        <!-- Page Numbers -->
        @for (page of visiblePages(); track page) {
          @if (page === '...') {
            <span class="px-3 py-2 text-gray-500">...</span>
          } @else {
            <button
              type="button"
              class="w-10 h-10 rounded-lg border transition-colors font-medium"
              [class]="page === currentPage() ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
              (click)="goToPage(+page)"
            >
              {{ page }}
            </button>
          }
        }

        <!-- Next -->
        <button
          type="button"
          class="px-4 py-2 rounded-lg border transition-colors flex items-center gap-1"
          [class]="currentPage() === totalPages() ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
        >
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      <!-- Page Info -->
      <p class="text-center text-sm text-gray-500 mt-4">
        Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} items)
      </p>
    }
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSize = input(10);

  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pageSize())
  );

  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  });

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
