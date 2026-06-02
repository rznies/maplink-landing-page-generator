import type { PlaceDetails } from './types';

export interface PlaceReader {
  /**
   * Resolve any Google Maps URL (short link, full link, etc.) to a stable Place ID.
   * Throws PlaceNotFoundError if no ID can be determined.
   */
  resolvePlaceId(mapsUrl: string): Promise<string>;

  /**
   * Fetch details for a stable Place ID and map them into the domain PlaceDetails model.
   */
  fetchPlaceDetails(placeId: string): Promise<PlaceDetails>;
}
