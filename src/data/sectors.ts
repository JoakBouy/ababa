import type { SectorId } from './types';

/** Warm, earthy sector colours that sit on the Ababa layout. */
export const SECTORS: Record<SectorId, { label: string; short: string; color: string }> = {
  health: { label: 'Health & midwifery', short: 'Health', color: '#C2456A' },
  education: { label: 'Education & training', short: 'Education', color: '#C2851A' },
  food: { label: 'Food & farming', short: 'Farming', color: '#5E8A2F' },
  water: { label: 'Water & sanitation', short: 'Water', color: '#2E7DA3' },
  relief: { label: 'Emergency relief', short: 'Relief', color: '#C0392B' },
  protection: { label: 'Peace, protection & community', short: 'Community', color: '#7A5AA0' },
};

export const SECTOR_ORDER: SectorId[] = ['health', 'education', 'food', 'water', 'relief', 'protection'];
