import type { SectorId } from './types';

/** Colours drawn from the Ababa command-centre palette (status green, secondary blue, error red, amber). */
export const SECTORS: Record<SectorId, { label: string; short: string; color: string }> = {
  health: { label: 'Health & midwifery', short: 'Health', color: '#C2416B' },
  education: { label: 'Education & training', short: 'Education', color: '#D97706' },
  food: { label: 'Food & farming', short: 'Farming', color: '#00875A' },
  water: { label: 'Water & sanitation', short: 'Water', color: '#006399' },
  relief: { label: 'Emergency relief', short: 'Relief', color: '#BA1A1A' },
  protection: { label: 'Peace, protection & community', short: 'Community', color: '#6B4FA8' },
};

export const SECTOR_ORDER: SectorId[] = ['health', 'education', 'food', 'water', 'relief', 'protection'];
