import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <a routerLink="/" class="text-3xl font-bold text-gray-900">
            UnboxedJS
          </a>
          <h1 class="mt-6 text-2xl font-bold text-gray-900">Admin Login</h1>
          <p class="mt-2 text-gray-600">
            Enter your password to access the dashboard
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8">
          <form
            [formGroup]="loginForm"
            (ngSubmit)="login()"
            class="space-y-6"
          >
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password..."
                autocomplete="current-password"
              />
            </div>

            @if (error()) {
              <div class="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loginForm.invalid || loading()"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ loading() ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <a
              routerLink="/"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Blog
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  protected login(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { password } = this.loginForm.getRawValue();
    const success = this.authService.login(password);

    if (success) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error.set('Invalid password. Please try again.');
      this.loading.set(false);
    }
  }
}
