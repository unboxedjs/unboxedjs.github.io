import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-tag-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
      #{{ tag() }}
    </span>
  `,
})
export class TagChipComponent {
  readonly tag = input.required<string>();
}
