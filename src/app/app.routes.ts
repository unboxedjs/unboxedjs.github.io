import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/blog/blog-list/blog-list').then(
        (m) => m.BlogListComponent
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./features/blog/blog-detail/blog-detail').then(
        (m) => m.BlogDetailComponent
      ),
  },
];
