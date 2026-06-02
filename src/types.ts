/**
 * Shared client-side types.
 *
 * Single source of truth for the shapes that flow between the server response,
 * App.tsx state, archetype renderers, and UI components.
 */

export type StatusMessage = {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

export type Review = {
  author: string;
  authorPhoto: string;
  rating: number;
  text: string;
  time: string;
};

export type GeneratedSiteData = {
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
  copy: {
    hero_headline: string;
    subheadline: string;
    value_props: string[];
    services?: string[];
    how_it_works?: string[];
    faqs: { q: string; a: string }[];
    testimonials: string[];
    specialties?: string[];
    pull_quote?: string;
  };
};

export type Archetype = 'structural' | 'minimalist' | 'brutalist';

