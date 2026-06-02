/**
 * Server-side type definitions for the generation pipeline.
 *
 * These mirror the shapes in src/App.tsx. They exist separately so
 * server modules never import from the React tree.
 */

export type Review = {
  author: string;
  authorPhoto: string;
  rating: number;
  text: string;
  time: string;
};

export type SiteCopy = {
  hero_headline?: string;
  subheadline?: string;
  value_props?: string[];
  services?: string[];
  how_it_works?: string[];
  faqs?: { q: string; a: string }[];
  testimonials?: string[];
  specialties?: string[];
  pull_quote?: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  types: string[];
  address: string;
  rating: number;
  reviewCount: number;
  hours: string[];
  website: string;
  phone?: string;
  photos: string[];
  originalReviews: Review[];
};

export type GeneratedSiteData = PlaceDetails & {
  copy: SiteCopy;
};
