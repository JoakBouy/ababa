import type { SectorId } from './types';

export const SECTORS: Record<SectorId, { label: string; short: string; color: string }> = {
  health: { label: 'Health & midwifery', short: 'Health', color: '#F08AA6' },
  education: { label: 'Education & training', short: 'Education', color: '#E9C46A' },
  food: { label: 'Food & farming', short: 'Farming', color: '#A3C46C' },
  water: { label: 'Water & sanitation', short: 'Water', color: '#62B6DA' },
  relief: { label: 'Emergency relief', short: 'Relief', color: '#EE7350' },
  protection: { label: 'Peace, protection & community', short: 'Community', color: '#B3A3EA' },
};

export const SECTOR_ORDER: SectorId[] = ['health', 'education', 'food', 'water', 'relief', 'protection'];
