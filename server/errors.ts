/** Thrown when a Place ID cannot be resolved from the given Maps URL. */
export class PlaceNotFoundError extends Error {
  constructor(url: string) {
    super(`Could not determine Place ID from URL: ${url}`);
    this.name = 'PlaceNotFoundError';
  }
}

/** Thrown when a Firestore generation lock is held by another process. */
export class GenerationLockedError extends Error {
  constructor(placeId: string) {
    super(`Generation already in progress for place: ${placeId}`);
    this.name = 'GenerationLockedError';
  }
}
