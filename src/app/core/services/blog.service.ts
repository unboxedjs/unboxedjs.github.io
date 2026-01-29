import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import type { Post, CreatePostDto } from '../models/post.model';

const COLLECTION = 'posts';

interface GhBlog {
  slug: string;
  name: string;
  description: string;
  language: string | null;
  topics: string[];
  updated: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly firebase = inject(FirebaseService);
  private readonly http = inject(HttpClient);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadPosts(publishedOnly = true): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Load both in parallel
      const [crmPosts, ghBlogs] = await Promise.all([
        this.loadCrmPosts(publishedOnly),
        this.loadGhBlogs(),
      ]);

      const ghPosts = ghBlogs.map((blog) => this.ghBlogToPost(blog));

      // Merge and sort by date
      const allPosts = [...crmPosts, ...ghPosts].sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() ?? 0;
        const dateB = b.createdAt?.toMillis?.() ?? 0;
        return dateB - dateA;
      });

      this.posts.set(allPosts);
    } catch (e) {
      console.error('Load posts error:', e);
      this.error.set(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCrmPosts(publishedOnly: boolean): Promise<Post[]> {
    try {
      const { where, orderBy } = this.firebase.queryHelpers;
      const constraints = publishedOnly
        ? [where('published', '==', true), orderBy('createdAt', 'desc')]
        : [orderBy('createdAt', 'desc')];

      const posts = await this.firebase.getDocuments<Post>(COLLECTION, constraints);
      return posts.map((post) => ({ ...post, source: 'crm' as const }));
    } catch (e) {
      console.error('Load CRM posts error:', e);
      // If query fails (e.g., missing index), try without orderBy
      try {
        const posts = await this.firebase.getDocuments<Post>(COLLECTION, []);
        const filtered = publishedOnly ? posts.filter(p => p.published) : posts;
        return filtered
          .map((post) => ({ ...post, source: 'crm' as const }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      } catch {
        return [];
      }
    }
  }

  private async loadGhBlogs(): Promise<GhBlog[]> {
    try {
      const blogs = await firstValueFrom(this.http.get<GhBlog[]>('/gh-blogs.json'));
      return blogs ?? [];
    } catch {
      // Silently fail for GitHub blogs - CRM posts will still show
      return [];
    }
  }

  private ghBlogToPost(blog: GhBlog): Post {
    const updatedDate = new Date(blog.updated);
    return {
      id: `gh-${blog.slug}`,
      title: blog.name,
      slug: blog.slug,
      description: blog.description,
      content: '',
      coverImage: blog.image,
      images: [],
      tags: blog.topics.length > 0 ? blog.topics : (blog.language ? [blog.language.toLowerCase()] : []),
      category: blog.language ?? 'Project',
      author: 'UnboxedJS',
      likes: 0,
      shares: 0,
      views: 0,
      published: true,
      createdAt: Timestamp.fromDate(updatedDate),
      updatedAt: Timestamp.fromDate(updatedDate),
      source: 'github',
      externalUrl: `/${blog.slug}/`,
    };
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { where } = this.firebase.queryHelpers;
    const posts = await this.firebase.getDocuments<Post>(COLLECTION, [
      where('slug', '==', slug),
    ]);
    return posts[0] ?? null;
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.firebase.getDocument<Post>(COLLECTION, id);
  }

  async createPost(data: CreatePostDto): Promise<string> {
    const slug = this.generateSlug(data.title);
    return this.firebase.addDocument(COLLECTION, {
      ...data,
      slug,
      likes: 0,
      shares: 0,
      views: 0,
      source: 'crm',
    });
  }

  async updatePost(id: string, data: Partial<CreatePostDto>): Promise<void> {
    const updateData: Partial<CreatePostDto & { slug: string }> = { ...data };
    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }
    await this.firebase.updateDocument(COLLECTION, id, updateData);
  }

  async deletePost(id: string): Promise<void> {
    await this.firebase.deleteDocument(COLLECTION, id);
  }

  async incrementViews(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (post) {
      await this.firebase.updateDocument(COLLECTION, id, {
        views: post.views + 1,
      });
    }
  }

  async incrementLikes(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (post) {
      await this.firebase.updateDocument(COLLECTION, id, {
        likes: post.likes + 1,
      });
    }
  }

  async decrementLikes(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (post && post.likes > 0) {
      await this.firebase.updateDocument(COLLECTION, id, {
        likes: post.likes - 1,
      });
    }
  }

  async incrementShares(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (post) {
      await this.firebase.updateDocument(COLLECTION, id, {
        shares: post.shares + 1,
      });
    }
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const { where, orderBy } = this.firebase.queryHelpers;
    return this.firebase.getDocuments<Post>(COLLECTION, [
      where('tags', 'array-contains', tag),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    ]);
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    const { where, orderBy } = this.firebase.queryHelpers;
    return this.firebase.getDocuments<Post>(COLLECTION, [
      where('category', '==', category),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    ]);
  }

  searchPosts(query: string): Post[] {
    const lowerQuery = query.toLowerCase();
    return this.posts().filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.description.toLowerCase().includes(lowerQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
