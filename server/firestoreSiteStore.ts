import type { Firestore } from 'firebase/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SiteStore } from './siteStore';
import type { GeneratedSiteData } from './types';
import { GenerationLockedError } from './errors';

export class FirestoreSiteStore implements SiteStore {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async read(placeId: string, dataVersion: number): Promise<GeneratedSiteData | null> {
    const ref = doc(this.db, 'sites', placeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const stored = snap.data();
    const notExpired = Date.now() - stored.createdAt < 30 * 24 * 60 * 60 * 1000;
    if (notExpired && stored.version === dataVersion) {
      return JSON.parse(stored.siteData) as GeneratedSiteData;
    }
    return null;
  }

  async write(placeId: string, data: GeneratedSiteData, dataVersion: number): Promise<void> {
    const ref = doc(this.db, 'sites', placeId);
    await setDoc(ref, {
      placeId,
      siteData: JSON.stringify(data),
      createdAt: Date.now(),
      version: dataVersion,
    });
  }

  async acquireLock(placeId: string): Promise<void> {
    const lockRef = doc(this.db, 'locks', placeId);
    const lockSnap = await getDoc(lockRef);
    if (lockSnap.exists() && Date.now() < lockSnap.data().expiresAt) {
      throw new GenerationLockedError(placeId);
    }
    await setDoc(lockRef, { expiresAt: Date.now() + 10_000 });
  }
}
