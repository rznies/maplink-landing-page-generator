import type { ComponentType } from 'react';
import type { GeneratedSiteData } from '../types';
import { BrutalistSite } from '../archetypes/BrutalistSite';
import { MinimalistSite } from '../archetypes/MinimalistSite';
import { StructuralSite } from '../archetypes/StructuralSite';
import { TrustSite } from '../archetypes/TrustSite';
import { PlayfulSite } from '../archetypes/PlayfulSite';
import { Archetype, resolveArchetype } from './archetypeRules';

export interface ArchetypeConfig {
  id: Archetype;
  label: string;
  component: ComponentType<{
    data: GeneratedSiteData;
    onBack: () => void;
    currentOverride: string;
    onSwitch: (v: string) => void;
  }>;
  triggerTypes: string[];
}

export const ARCHETYPES_REGISTRY: ArchetypeConfig[] = [
  {
    id: 'brutalist',
    label: 'Swiss Industrial',
    component: BrutalistSite,
    triggerTypes: [
      'gym', 'gymnasium', 'mechanic', 'car_repair', 'hardware_store',
      'construction_company', 'night_club', 'bar', 'stadium'
    ]
  },
  {
    id: 'minimalist',
    label: 'Editorial Luxury',
    component: MinimalistSite,
    triggerTypes: [
      'restaurant', 'cafe', 'spa', 'beauty_salon',
      'real_estate_agency', 'art_gallery', 'clothing_store'
    ]
  },
  {
    id: 'trust',
    label: 'Trust-First Heritage',
    component: TrustSite,
    triggerTypes: [
      'dentist', 'doctor', 'physiotherapist', 'lawyer', 'accounting',
      'school', 'university', 'bank', 'medical_clinic'
    ]
  },
  {
    id: 'playful',
    label: 'Vibrant & Playful',
    component: PlayfulSite,
    triggerTypes: [
      'amusement_park', 'bowling_alley', 'toy_store', 'pet_store',
      'florist', 'ice_cream_shop', 'party_planner'
    ]
  },
  {
    id: 'structural',
    label: 'Soft Structuralism',
    component: StructuralSite,
    triggerTypes: [] // fallback default
  }
];

export { resolveArchetype };
