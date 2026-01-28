import type { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./blog-list/blog-list').then((m) => m.BlogListComponent),
  },
  {
    path: 'post/:slug',
    loadComponent: () =>
      import('./blog-detail/blog-detail').then((m) => m.BlogDetailComponent),
  },
  {
    path: 'tag/:tag',
    loadComponent: () =>
      import('./blog-list/blog-list').then((m) => m.BlogListComponent),
  },
  {
    path: 'category/:category',
    loadComponent: () =>
      import('./blog-list/blog-list').then((m) => m.BlogListComponent),
  },
];
