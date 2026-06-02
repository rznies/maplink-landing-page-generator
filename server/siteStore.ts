import type { GeneratedSiteData } from './types';

export interface SiteStore {
  /**
   * Retrieve a cached generated site from the store.
   * Should return null if the cached entry does not exist, is expired (e.g. older than 30 days),
   * or if the data version does not match dataVersion.
   */
  read(placeId: string, dataVersion: number): Promise<GeneratedSiteData | null>;

  /**
   * Write a generated site to the store cache.
   */
  write(placeId: string, data: GeneratedSiteData, dataVersion: number): Promise<void>;

  /**
   * Acquire a generation lock for a place.
   * Should throw GenerationLockedError if the lock is currently held.
   */
  acquireLock(placeId: string): Promise<void>;
}
