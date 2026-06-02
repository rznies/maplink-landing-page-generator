import type { PlaceDetails, SiteCopy } from './types';

export interface CopywriterConfig {
  /** Optional Firecrawl API key. Scraping is skipped if absent. */
  firecrawlApiKey?: string;
}

export type CopywriterProgressCallback = (message: string) => void;

export interface Copywriter {
  /**
   * Orchestrates website scraping, review extraction, and copy writing.
   */
  writeCopy(
    details: PlaceDetails,
    config: CopywriterConfig,
    onProgress: CopywriterProgressCallback
  ): Promise<SiteCopy>;
}
