import type { PlaceReader } from './placeReader';
import type { PlaceDetails } from './types';
import { PlaceNotFoundError } from './errors';

export class GooglePlaceReader implements PlaceReader {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async resolvePlaceId(mapsUrl: string): Promise<string> {
    const finalUrl = await this.unrollUrl(mapsUrl);
    const placeId = await this.resolvePlaceIdFromUrl(finalUrl);
    if (!placeId) {
      throw new PlaceNotFoundError(mapsUrl);
    }
    return placeId;
  }

  async fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const url =
      `https://places.googleapis.com/v1/places/${placeId}` +
      `?fields=id,displayName,formattedAddress,types,rating,userRatingCount,` +
      `currentOpeningHours,websiteUri,photos,reviews,nationalPhoneNumber` +
      `&key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch place details: ${res.status}`);
    const details = await res.json();
    return this.mapToPlaceDetails(placeId, details);
  }

  private async unrollUrl(url: string): Promise<string> {
    let currentUrl = url;
    for (let i = 0; i < 5; i++) {
      if (currentUrl.includes('google.com/maps') || currentUrl.includes('google.co.in/maps') || currentUrl.includes('maps.google.com')) {
        break;
      }
      try {
        const res = await fetch(currentUrl, { redirect: 'manual' });
        const location = res.headers.get('location');
        if (!location) break;
        currentUrl = location;
      } catch {
        break;
      }
    }
    return currentUrl;
  }

  private async resolvePlaceIdFromUrl(url: string): Promise<string | null> {
    const placeIdMatch = url.match(/place_id:([^&?]+)/);
    if (placeIdMatch) return placeIdMatch[1];
    const cidMatch = url.match(/cid=([0-9]+)/);
    if (cidMatch) return `cid_${cidMatch[1]}`;
    const ftidMatch = url.match(/ftid=([^&?]+)/);
    if (ftidMatch) return `ftid_${ftidMatch[1]}`;
    
    // Extract query parameter if it's a search URL or has search query parameters
    try {
      const urlObj = new URL(url);
      const q = urlObj.searchParams.get('q');
      if (q) {
        return this.findPlaceIdByText(q);
      }
    } catch {
      // ignore
    }

    // Fall back to Places Text Search on base path
    return this.findPlaceIdByText(url.split('?')[0]);
  }

  private async findPlaceIdByText(query: string): Promise<string | null> {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: query }),
    });
    const data = await res.json();
    return data.places?.[0]?.id ?? null;
  }

  private mapToPlaceDetails(placeId: string, details: any): PlaceDetails {
    return {
      placeId,
      name: details.displayName?.text ?? '',
      types: details.types ?? [],
      address: details.formattedAddress ?? '',
      rating: details.rating ?? 0,
      reviewCount: details.userRatingCount ?? 0,
      hours: details.currentOpeningHours?.weekdayDescriptions || [],
      website: details.websiteUri ?? '',
      phone: details.nationalPhoneNumber,
      photos:
        details.photos
          ?.slice(0, 8)
          .map(
            (p: any) =>
              `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=800&maxWidthPx=800&key=${this.apiKey}`,
          ) ?? [],
      originalReviews:
        details.reviews
          ?.filter((r: any) => r.originalText?.text || r.text?.text)
          .slice(0, 5)
          .map((r: any) => ({
            author: r.authorAttribution?.displayName ?? 'Anonymous',
            authorPhoto: r.authorAttribution?.photoUri ?? '',
            rating: r.rating ?? 0,
            text: r.originalText?.text || r.text?.text || '',
            time: r.publishTime ?? '',
          })) ?? [],
    };
  }
}
