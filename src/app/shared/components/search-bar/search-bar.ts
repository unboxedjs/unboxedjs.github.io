import {
  Component,
  ChangeDetectionStrategy,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form
      class="relative"
      (submit)="onSubmit($event)"
      role="search"
    >
      <label for="search-input" class="sr-only">Search posts</label>
      <input
        id="search-input"
        type="search"
        name="search"
        [ngModel]="query()"
        (ngModelChange)="onQueryChange($event)"
        placeholder="Search posts..."
        class="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      @if (query()) {
        <button
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
          (click)="clearSearch()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      }
    </form>
  `,
})
export class SearchBarComponent {
  readonly searchChange = output<string>();
  readonly searchSubmit = output<string>();

  protected readonly query = signal('');

  protected onQueryChange(value: string): void {
    this.query.set(value);
    this.searchChange.emit(value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.searchSubmit.emit(this.query());
  }

  protected clearSearch(): void {
    this.query.set('');
    this.searchChange.emit('');
  }
}
