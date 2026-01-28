import { Injectable, signal } from '@angular/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private static appInstance: FirebaseApp | null = null;

  private app: FirebaseApp;
  private db: Firestore;
  private analytics: Analytics | null = null;
  readonly initialized = signal(false);

  constructor() {
    this.app = initializeApp(environment.firebase);
    FirebaseService.appInstance = this.app;
    this.db = getFirestore(this.app);
    this.initialized.set(true);

    // Defer analytics - not critical for initial render
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.analytics = getAnalytics(this.app);
      }, 0);
    }
  }

  static getApp(): FirebaseApp | null {
    return FirebaseService.appInstance;
  }

  getCollection(collectionName: string) {
    return collection(this.db, collectionName);
  }

  getDocRef(collectionName: string, docId: string) {
    return doc(this.db, collectionName, docId);
  }

  async getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const collectionRef = this.getCollection(collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as T
    );
  }

  async getDocument<T>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    const docRef = this.getDocRef(collectionName, docId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async addDocument<T extends Record<string, unknown>>(
    collectionName: string,
    data: T
  ): Promise<string> {
    const collectionRef = this.getCollection(collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async updateDocument<T extends Record<string, unknown>>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = this.getDocRef(collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<void> {
    const docRef = this.getDocRef(collectionName, docId);
    await deleteDoc(docRef);
  }

  // Re-export query helpers for use in other services
  readonly queryHelpers = {
    where,
    orderBy,
    limit,
    Timestamp,
  };
}
