import type { SiteStore } from './siteStore';
import type { PlaceReader } from './placeReader';
import type { Copywriter, CopywriterConfig, CopywriterProgressCallback } from './copywriter';
import type { GeneratedSiteData, PlaceDetails, SiteCopy } from './types';
import { GenerationLockedError } from './errors';

// 1. InMemorySiteStore Implementation
class InMemorySiteStore implements SiteStore {
  private cache = new Map<string, { data: string; createdAt: number; version: number }>();
  private locks = new Map<string, number>();

  async read(placeId: string, dataVersion: number): Promise<GeneratedSiteData | null> {
    const cached = this.cache.get(placeId);
    if (!cached) return null;

    const notExpired = Date.now() - cached.createdAt < 30 * 24 * 60 * 60 * 1000;
    if (notExpired && cached.version === dataVersion) {
      return JSON.parse(cached.data) as GeneratedSiteData;
    }
    return null;
  }

  async write(placeId: string, data: GeneratedSiteData, dataVersion: number): Promise<void> {
    this.cache.set(placeId, {
      data: JSON.stringify(data),
      createdAt: Date.now(),
      version: dataVersion,
    });
  }

  async acquireLock(placeId: string): Promise<void> {
    const expiresAt = this.locks.get(placeId);
    if (expiresAt && Date.now() < expiresAt) {
      throw new GenerationLockedError(placeId);
    }
    this.locks.set(placeId, Date.now() + 10_000);
  }
  
  // Helper to release lock manually for testing
  releaseLock(placeId: string) {
    this.locks.delete(placeId);
  }
}

// 2. InMemoryPlaceReader Implementation
class InMemoryPlaceReader implements PlaceReader {
  private mockDetails: PlaceDetails;

  constructor(mockDetails: PlaceDetails) {
    this.mockDetails = mockDetails;
  }

  async resolvePlaceId(mapsUrl: string): Promise<string> {
    if (mapsUrl.includes('invalid')) {
      throw new Error('Invalid URL');
    }
    return this.mockDetails.placeId;
  }

  async fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (placeId !== this.mockDetails.placeId) {
      throw new Error('Place not found');
    }
    return this.mockDetails;
  }
}

// 3. InMemoryCopywriter Implementation
class InMemoryCopywriter implements Copywriter {
  private mockCopy: SiteCopy;

  constructor(mockCopy: SiteCopy) {
    this.mockCopy = mockCopy;
  }

  async writeCopy(
    details: PlaceDetails,
    config: CopywriterConfig,
    onProgress: CopywriterProgressCallback
  ): Promise<SiteCopy> {
    if (!details) {
      throw new Error('Details required');
    }
    onProgress('Mock writing copy...');
    return this.mockCopy;
  }
}

async function runTests() {
  console.log('--- Running SiteStore Seam Tests ---');
  
  const store = new InMemorySiteStore();
  const mockPlaceId = 'test-place-123';
  const mockData: GeneratedSiteData = {
    placeId: mockPlaceId,
    name: 'Test Business',
    types: ['cafe'],
    address: '123 Test St',
    rating: 4.5,
    reviewCount: 10,
    hours: ['Monday: 9am-5pm'],
    website: 'http://test.com',
    photos: [],
    originalReviews: [],
    copy: {}
  };

  // Test 1: Cache starts empty
  console.log('Test 1: Read empty cache...');
  const initial = await store.read(mockPlaceId, 1);
  if (initial !== null) throw new Error('Expected initial read to be null');
  console.log('✓ Cache is empty initially');

  // Test 2: Write then Read cache
  console.log('Test 2: Write and read back cache...');
  await store.write(mockPlaceId, mockData, 1);
  const cached = await store.read(mockPlaceId, 1);
  if (!cached || cached.name !== 'Test Business') {
    throw new Error('Cache read back failed or name mismatch');
  }
  console.log('✓ Cache read/write matches exactly');

  // Test 3: Version mismatch invalidates cache
  console.log('Test 3: Cache read with version mismatch...');
  const oldVersion = await store.read(mockPlaceId, 2);
  if (oldVersion !== null) {
    throw new Error('Expected cache read with version mismatch to return null');
  }
  console.log('✓ Cache version mismatch correctly invalidates cache');

  // Test 4: Acquire Lock
  console.log('Test 4: Acquire lock...');
  await store.acquireLock(mockPlaceId);
  console.log('✓ First lock acquisition succeeded');

  // Test 5: Re-acquiring lock fails
  console.log('Test 5: Re-acquire lock should fail...');
  try {
    await store.acquireLock(mockPlaceId);
    throw new Error('Expected GenerationLockedError to be thrown');
  } catch (err: any) {
    if (err.name !== 'GenerationLockedError') {
      throw err;
    }
    console.log('✓ Re-acquire lock correctly blocked with GenerationLockedError');
  }

  // Test 6: Release lock and acquire
  console.log('Test 6: Release lock and acquire again...');
  store.releaseLock(mockPlaceId);
  await store.acquireLock(mockPlaceId);
  console.log('✓ Lock re-acquisition succeeded after manual release');

  console.log('\n--- Running PlaceReader Seam Tests ---');

  // Test 7: PlaceReader resolution and details fetching
  console.log('Test 7: PlaceReader resolution...');
  const mockDetails: PlaceDetails = {
    placeId: 'test-place-456',
    name: 'Places Business',
    types: ['restaurant'],
    address: '456 Places Ave',
    rating: 4.8,
    reviewCount: 200,
    hours: ['Monday: 10am-10pm'],
    website: 'http://places.com',
    photos: [],
    originalReviews: []
  };

  const placeReader = new InMemoryPlaceReader(mockDetails);
  const resolvedId = await placeReader.resolvePlaceId('https://maps.app.goo.gl/test');
  if (resolvedId !== 'test-place-456') {
    throw new Error('Expected resolved Place ID to be test-place-456');
  }

  const detailsResult = await placeReader.fetchPlaceDetails('test-place-456');
  if (detailsResult.name !== 'Places Business') {
    throw new Error('Expected name to match Places Business');
  }
  console.log('✓ PlaceReader resolves and fetches correctly');

  console.log('\n--- Running Copywriter Seam Tests ---');

  // Test 8: Copywriter interface and workflow
  console.log('Test 8: Copywriter generation...');
  const mockCopy: SiteCopy = {
    hero_headline: 'Mock Headline',
    subheadline: 'Mock Subheadline',
    value_props: ['Prop 1: Desc 1', 'Prop 2: Desc 2', 'Prop 3: Desc 3'],
    services: ['Service A', 'Service B'],
    how_it_works: ['Step 1', 'Step 2', 'Step 3'],
    faqs: [{ q: 'Q1', a: 'A1' }, { q: 'Q2', a: 'A2' }, { q: 'Q3', a: 'A3' }, { q: 'Q4', a: 'A4' }],
    testimonials: ['T1', 'T2'],
    specialties: ['Spec A', 'Spec B'],
    pull_quote: 'Quote'
  };

  const copywriter = new InMemoryCopywriter(mockCopy);
  const copyResult = await copywriter.writeCopy(mockDetails, {}, () => {});
  if (copyResult.hero_headline !== 'Mock Headline') {
    throw new Error('Expected hero_headline to match Mock Headline');
  }
  console.log('✓ Copywriter generates copy correctly');

  console.log('\n--- All Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('\n❌ Tests Failed:', err);
  process.exit(1);
});
