import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="bg-gray-900 text-white sticky top-0 z-50">
      <nav class="max-w-6xl mx-auto px-4 py-4">
        <a routerLink="/" class="text-2xl font-bold hover:text-blue-400 transition-colors">
          UnboxedJS
        </a>
      </nav>
    </header>
  `,
})
export class HeaderComponent {}
