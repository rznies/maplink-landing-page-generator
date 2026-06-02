export type Archetype = 'brutalist' | 'minimalist' | 'structural' | 'trust' | 'playful';

export const ARCHETYPE_TRIGGERS: { id: Archetype; triggerTypes: string[] }[] = [
  {
    id: 'brutalist',
    triggerTypes: [
      'gym', 'gymnasium', 'mechanic', 'car_repair', 'hardware_store',
      'construction_company', 'night_club', 'bar', 'stadium'
    ]
  },
  {
    id: 'minimalist',
    triggerTypes: [
      'restaurant', 'cafe', 'spa', 'beauty_salon',
      'real_estate_agency', 'art_gallery', 'clothing_store'
    ]
  },
  {
    id: 'trust',
    triggerTypes: [
      'dentist', 'doctor', 'physiotherapist', 'lawyer', 'accounting',
      'school', 'university', 'bank', 'medical_clinic'
    ]
  },
  {
    id: 'playful',
    triggerTypes: [
      'amusement_park', 'bowling_alley', 'toy_store', 'pet_store',
      'florist', 'ice_cream_shop', 'party_planner'
    ]
  }
];

export function resolveArchetype(types: string[]): Archetype {
  for (const config of ARCHETYPE_TRIGGERS) {
    if (types.some(t => config.triggerTypes.includes(t))) {
      return config.id;
    }
  }
  return 'structural';
}
