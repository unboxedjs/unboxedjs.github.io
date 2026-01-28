import type { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-login/admin-login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'post/new',
    loadComponent: () =>
      import('../blog/blog-editor/blog-editor').then(
        (m) => m.BlogEditorComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'post/:id/edit',
    loadComponent: () =>
      import('../blog/blog-editor/blog-editor').then(
        (m) => m.BlogEditorComponent
      ),
    canActivate: [adminGuard],
  },
];
