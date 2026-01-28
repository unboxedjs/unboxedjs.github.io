import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import type { AdSettings } from '../models/ad-settings.model';
import type { PostPromotion } from '../models/post.model';

const COLLECTION = 'settings';
const DOC_ID = 'adSettings';

@Injectable({ providedIn: 'root' })
export class AdSettingsService {
  private readonly firebase = inject(FirebaseService);

  readonly settings = signal<AdSettings | null>(null);
  readonly loading = signal(false);

  async loadSettings(): Promise<AdSettings | null> {
    this.loading.set(true);
    try {
      const settings = await this.firebase.getDocument<AdSettings>(COLLECTION, DOC_ID);
      this.settings.set(settings);
      return settings;
    } catch {
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async saveSettings(settings: Partial<AdSettings>): Promise<void> {
    const existing = await this.firebase.getDocument<AdSettings>(COLLECTION, DOC_ID);

    if (existing) {
      await this.firebase.updateDocument(COLLECTION, DOC_ID, settings);
    } else {
      // Create with specific ID by using setDoc approach
      const docRef = this.firebase.getDocRef(COLLECTION, DOC_ID);
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { ...settings, id: DOC_ID });
    }

    await this.loadSettings();
  }

  getListPageAd(): PostPromotion | undefined {
    return this.settings()?.listPageAd;
  }

  getDetailPageAd1(): PostPromotion | undefined {
    return this.settings()?.detailPageAd1;
  }

  getDetailPageAd2(): PostPromotion | undefined {
    return this.settings()?.detailPageAd2;
  }
}
