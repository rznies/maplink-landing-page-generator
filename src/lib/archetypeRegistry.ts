import type { ComponentType } from 'react';
import type { GeneratedSiteData, Archetype } from '../types';
import { BrutalistSite } from '../archetypes/BrutalistSite';
import { MinimalistSite } from '../archetypes/MinimalistSite';
import { StructuralSite } from '../archetypes/StructuralSite';

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
      'construction_company', 'night_club', 'bar', 'electrician',
      'plumber', 'roofing_contractor', 'hvac_contractor', 'stadium'
    ]
  },
  {
    id: 'minimalist',
    label: 'Editorial Luxury',
    component: MinimalistSite,
    triggerTypes: [
      'restaurant', 'cafe', 'bakery', 'spa', 'beauty_salon',
      'real_estate_agency', 'art_gallery', 'clothing_store', 'food', 'store'
    ]
  },
  {
    id: 'structural',
    label: 'Soft Structuralism',
    component: StructuralSite,
    triggerTypes: [] // fallback default
  }
];

export function resolveArchetype(types: string[]): Archetype {
  for (const config of ARCHETYPES_REGISTRY) {
    if (config.triggerTypes.length > 0 && types.some(t => config.triggerTypes.includes(t))) {
      return config.id;
    }
  }
  return 'structural';
}
