import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';

const AUTH_STORAGE_KEY = 'blog_admin_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(this.checkStoredAuth());

  readonly isAdmin = computed(() => this.authenticated());

  private checkStoredAuth(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored === 'true';
  }

  login(password: string): boolean {
    if (password === environment.check) {
      this.authenticated.set(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.authenticated.set(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
