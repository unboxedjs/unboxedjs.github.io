import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RemoteConfigService } from '../../../core/services/remote-config.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="bg-gradient-to-b from-gray-900 to-gray-950 mt-auto">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Main Content -->
        <div class="flex flex-col items-center text-center space-y-8">
          <!-- Brand -->
          <a routerLink="/" class="group flex items-center gap-5">
            <img src="/logo.svg" alt="UnboxedJS" class="h-14 transition-transform group-hover:scale-105" />
            <span class="hidden sm:block h-10 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent"></span>
            <span class="hidden sm:block text-xl tracking-wide text-gray-400 group-hover:text-gray-300 transition-colors">
              Simplify<span class="text-blue-500">.</span> Solve<span class="text-blue-500">.</span> Ship<span class="text-blue-500">.</span>
            </span>
          </a>

          <!-- Mobile Tagline -->
          <p class="sm:hidden text-lg tracking-wide text-gray-400">
            Simplify<span class="text-blue-500">.</span> Solve<span class="text-blue-500">.</span> Ship<span class="text-blue-500">.</span>
          </p>

          <!-- Social Links -->
          <div class="flex items-center gap-4">
            <a [href]="config().socialTwitter" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all hover:scale-110">
              <img src="/icons/twitter.png" class="w-5 h-5" alt="Twitter" />
            </a>
            <a [href]="config().socialYoutube" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all hover:scale-110">
              <img src="/icons/youtube.png" class="w-5 h-5" alt="YouTube" />
            </a>
            <a [href]="config().socialFacebook" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all hover:scale-110">
              <img src="/icons/facebook.png" class="w-5 h-5" alt="Facebook" />
            </a>
            <a [href]="config().socialInstagram" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all hover:scale-110">
              <img src="/icons/instagram.png" class="w-5 h-5" alt="Instagram" />
            </a>
            <a [href]="config().socialLinkedin" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all hover:scale-110">
              <img src="/icons/linkedin.png" class="w-5 h-5" alt="LinkedIn" />
            </a>
            <a [href]="config().socialBuymeacoffee" target="_blank" rel="noopener noreferrer"
               class="p-2 rounded-full bg-gray-800/50 hover:bg-yellow-600/80 transition-all hover:scale-110">
              <img src="/icons/coffee.png" class="w-5 h-5" alt="Buy Me a Coffee" />
            </a>
          </div>
        </div>

        <!-- Divider & Copyright -->
        <div class="mt-10 pt-6 border-t border-gray-800/60">
          <p class="text-center text-sm text-gray-500">
            &copy; {{ currentYear }} UnboxedJS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly remoteConfigService = inject(RemoteConfigService);

  protected readonly config = this.remoteConfigService.config;
  protected readonly currentYear = new Date().getFullYear();
}
