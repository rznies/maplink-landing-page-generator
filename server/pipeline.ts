import { GenerationLockedError } from './errors';
import type { GeneratedSiteData } from './types';
import type { SiteStore } from './siteStore';
import type { PlaceReader } from './placeReader';
import type { Copywriter } from './copywriter';

// Re-export the types and errors callers need so they can import from one place
export type { GeneratedSiteData } from './types';
export { PlaceNotFoundError, GenerationLockedError } from './errors';

// ─── Public interface ─────────────────────────────────────────────────────────

/** Called by the pipeline as each step begins. Strings are plain English. */
export type ProgressCallback = (message: string) => void;

export interface PipelineConfig {
  /** Google Places client for resolving and fetching place details. */
  placeReader: PlaceReader;
  /** Copywriter for scraping, analyzing, and writing AI copy. */
  copywriter: Copywriter;
  /** Firecrawl API key. Optional — website scraping is skipped when absent. */
  firecrawlApiKey?: string;
  /** Store instance for caching and locking. */
  store: SiteStore;
  /**
   * Bump this integer in the calling code to invalidate cached
   * results and force re-generation with an updated prompt.
   */
  dataVersion: number;
}

// ─── Module-scoped coalescer ──────────────────────────────────────────────────
// One slot per in-flight place generation. Concurrent requests for the same
// placeId await the same Promise instead of kicking off a duplicate pipeline.

const pendingRequests = new Map<string, Promise<GeneratedSiteData>>();

// ─── Core execution (private) ─────────────────────────────────────────────────

async function execute(
  placeId: string,
  config: PipelineConfig,
  onProgress: ProgressCallback,
): Promise<GeneratedSiteData> {
  // 1. Storage cache — return immediately if fresh and version-matched
  const cached = await config.store.read(placeId, config.dataVersion);
  if (cached) return cached;

  // 2. Distributed lock — guards multi-process races on cache miss
  await config.store.acquireLock(placeId);

  // 3. Fetch place details from Google Places API
  onProgress('Reading verified reviews...');
  const details = await config.placeReader.fetchPlaceDetails(placeId);

  // 4. Generate AI marketing copy (includes web scraping and reviews analysis)
  const copy = await config.copywriter.writeCopy(
    details,
    { firecrawlApiKey: config.firecrawlApiKey },
    onProgress,
  );

  // 5. Assemble + persist
  const result: GeneratedSiteData = {
    ...details,
    copy,
  };
  await config.store.write(placeId, result, config.dataVersion);

  return result;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Generate (or retrieve from cache) a complete landing-page dataset for a
 * Google Maps business URL.
 *
 * Concurrent calls for the same URL coalesce onto a single in-flight Promise.
 *
 * @param mapsUrl   Any Google Maps URL — short link, full URL, ftid, or cid.
 * @param config    API keys and the SiteStore instance.
 * @param onProgress  Optional callback invoked with a plain-English status string
 *                    as each pipeline step begins. Default is a no-op.
 *
 * @throws PlaceNotFoundError      When no place ID can be resolved from the URL.
 * @throws GenerationLockedError   When the store lock is held by another process.
 * @throws Error                   For other unrecoverable failures (network, config).
 */
export async function generateSite(
  mapsUrl: string,
  config: PipelineConfig,
  onProgress: ProgressCallback = () => {},
): Promise<GeneratedSiteData> {
  onProgress('Unfolding link...');
  const placeId = await config.placeReader.resolvePlaceId(mapsUrl);

  // Coalesce: if an identical generation is already in flight, wait for it
  if (pendingRequests.has(placeId)) {
    onProgress('Waiting for another site generation for this place...');
    return pendingRequests.get(placeId)!;
  }

  // Start the generation promise synchronously so any subsequent call that
  // arrives before `execute` resolves will hit the coalescer above.
  const generation = execute(placeId, config, onProgress);
  pendingRequests.set(placeId, generation);

  try {
    return await generation;
  } finally {
    pendingRequests.delete(placeId);
  }
}
