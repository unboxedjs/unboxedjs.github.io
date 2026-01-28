import { Injectable, signal } from '@angular/core';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { FirebaseService } from './firebase.service';

export interface RemoteConfig {
  // Social links
  socialTwitter: string;
  socialYoutube: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialBuymeacoffee: string;
  contactEmail: string;
  upworkUrl: string;

  // Stats
  statsProjects: number;
  statsUdemyCourses: number;
  statsYearsExperience: number;

  // Udemy
  udemyAngularnestUrl: string;
  udemyJasmineUrl: string;
  udemyRating: number;
  udemyReviews: number;
  udemyStudents: number;

  // YouTube
  youtubeSubscribers: number;
  youtubeViews: string;
  youtubeWatchHours: number;
}

const defaultConfig: RemoteConfig = {
  socialTwitter: 'https://twitter.com/unboxedjs',
  socialYoutube: 'https://www.youtube.com/channel/UCob_lLtu_hj80nHduNzzQiw',
  socialFacebook: 'https://www.facebook.com/unboxedjsofficial',
  socialInstagram: 'https://www.instagram.com/unboxedjs/',
  socialLinkedin: 'https://www.linkedin.com/in/unboxedjs/',
  socialBuymeacoffee: 'https://www.buymeacoffee.com/unboxedjs',
  contactEmail: 'suren@unboxedjs.com',
  upworkUrl: 'https://www.upwork.com/freelancers/~01969204f1b1dd4476',
  statsProjects: 18,
  statsUdemyCourses: 2,
  statsYearsExperience: 10,
  udemyAngularnestUrl: 'https://www.udemy.com/course/angularnest/?referralCode=80CA9F9919C75A5A3973',
  udemyJasmineUrl: 'https://www.udemy.com/course/angular-unit-testing-with-jasmine-karma/',
  udemyRating: 3.5,
  udemyReviews: 122,
  udemyStudents: 659,
  youtubeSubscribers: 240,
  youtubeViews: '10.9k',
  youtubeWatchHours: 280,
};

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  readonly config = signal<RemoteConfig>(defaultConfig);
  readonly loading = signal(false);

  async initialize(): Promise<void> {
    this.loading.set(true);
    try {
      const app = FirebaseService.getApp();
      if (!app) return;

      const remoteConfig = getRemoteConfig(app);
      remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour

      await fetchAndActivate(remoteConfig);

      this.config.set({
        socialTwitter: getValue(remoteConfig, 'social_twitter').asString() || defaultConfig.socialTwitter,
        socialYoutube: getValue(remoteConfig, 'social_youtube').asString() || defaultConfig.socialYoutube,
        socialFacebook: getValue(remoteConfig, 'social_facebook').asString() || defaultConfig.socialFacebook,
        socialInstagram: getValue(remoteConfig, 'social_instagram').asString() || defaultConfig.socialInstagram,
        socialLinkedin: getValue(remoteConfig, 'social_linkedin').asString() || defaultConfig.socialLinkedin,
        socialBuymeacoffee: getValue(remoteConfig, 'social_buymeacoffee').asString() || defaultConfig.socialBuymeacoffee,
        contactEmail: getValue(remoteConfig, 'contact_email').asString() || defaultConfig.contactEmail,
        upworkUrl: getValue(remoteConfig, 'upwork_url').asString() || defaultConfig.upworkUrl,
        statsProjects: getValue(remoteConfig, 'stats_projects').asNumber() || defaultConfig.statsProjects,
        statsUdemyCourses: getValue(remoteConfig, 'stats_udemy_courses').asNumber() || defaultConfig.statsUdemyCourses,
        statsYearsExperience: getValue(remoteConfig, 'stats_years_experience').asNumber() || defaultConfig.statsYearsExperience,
        udemyAngularnestUrl: getValue(remoteConfig, 'udemy_angularnest_url').asString() || defaultConfig.udemyAngularnestUrl,
        udemyJasmineUrl: getValue(remoteConfig, 'udemy_jasmine_url').asString() || defaultConfig.udemyJasmineUrl,
        udemyRating: getValue(remoteConfig, 'udemy_rating').asNumber() || defaultConfig.udemyRating,
        udemyReviews: getValue(remoteConfig, 'udemy_reviews').asNumber() || defaultConfig.udemyReviews,
        udemyStudents: getValue(remoteConfig, 'udemy_students').asNumber() || defaultConfig.udemyStudents,
        youtubeSubscribers: getValue(remoteConfig, 'youtube_subscribers').asNumber() || defaultConfig.youtubeSubscribers,
        youtubeViews: getValue(remoteConfig, 'youtube_views').asString() || defaultConfig.youtubeViews,
        youtubeWatchHours: getValue(remoteConfig, 'youtube_watch_hours').asNumber() || defaultConfig.youtubeWatchHours,
      });
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
