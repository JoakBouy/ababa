import type { Place, Programme, SectorId, Source, Story } from './types';
import { SECTOR_ORDER } from './sectors';
import placesJson from './content/locations.json';
import programmesJson from './content/programmes.json';
import storiesJson from './content/stories.json';
import testPersonasJson from './content/test-personas.json';
import sourcesJson from './content/sources.json';

import { loadAdminPlaces, loadAdminProgrammes, loadAdminStories } from './DataManager';

/**
 * Which people appear on the map:
 *   'test' — fictional test personas with illustrated portraits (for trying the map out)
 *   'demo' — empty story templates showing where real content goes
 *   'live' — only PRDA's real stories from stories.json (demo templates hidden)
 */
export const CONTENT_MODE: 'test' | 'demo' | 'live' = 'test';

export const places: Place[] = [];
export const programmes: Programme[] = [];
export const sources = sourcesJson as Record<string, Source>;
export const stories: Story[] = [];

/** True when a story is not a real, consented person. */
export const isPlaceholder = (s: Story) => s.status === 'demo' || s.status === 'test';
export let anyPlaceholders = false;
export const placeholderLabel = CONTENT_MODE === 'test' ? 'Test personas' : 'Demo stories';

export const programmeById = new Map<string, Programme>();
export const placeById = new Map<string, Place>();
export const storyById = new Map<string, Story>();
export const placeByCounty = new Map<string, Place>();
export const unplacedProgrammes: Programme[] = [];

export function reloadData() {
  places.length = 0;
  programmes.length = 0;
  stories.length = 0;
  unplacedProgrammes.length = 0;

  const loadedPlaces = loadAdminPlaces();
  const loadedProgrammes = loadAdminProgrammes();
  const loadedStories = loadAdminStories();

  places.push(...loadedPlaces);
  programmes.push(...loadedProgrammes);
  stories.push(...loadedStories);

  programmeById.clear();
  placeById.clear();
  storyById.clear();
  placeByCounty.clear();

  programmes.forEach((p) => programmeById.set(p.id, p));
  places.forEach((p) => {
    placeById.set(p.id, p);
    placeByCounty.set(p.county, p);
  });
  stories.forEach((s) => storyById.set(s.id, s));

  unplacedProgrammes.push(...programmes.filter((p) => p.locationIds.length === 0));
  anyPlaceholders = stories.some(isPlaceholder);
}

// Initial load
reloadData();

if (typeof window !== 'undefined') {
  window.addEventListener('prda_data_changed', reloadData);
}

export const getPlace = (id?: string) => (id ? placeById.get(id) : undefined);
export const getStory = (id?: string) => (id ? storyById.get(id) : undefined);
export const getProgramme = (id: string) => programmeById.get(id);

export function programmesForPlace(place: Place): Programme[] {
  return place.programmeIds.map((id) => programmeById.get(id)).filter(Boolean) as Programme[];
}

export function storiesForPlace(placeId: string): Story[] {
  return stories.filter((s) => s.locationId === placeId);
}

export function sectorsForPlace(place: Place): SectorId[] {
  const set = new Set<SectorId>();
  programmesForPlace(place).forEach((p) => p.sectors.forEach((s) => set.add(s)));
  storiesForPlace(place.id).forEach((s) => s.sectors.forEach((x) => set.add(x)));
  return SECTOR_ORDER.filter((s) => set.has(s));
}

export function yearsLabel(p: Programme): string | null {
  const { start, end } = p.years;
  if (start && end) return `${start}–${end}`;
  if (start && p.status === 'active') return `Since ${start}`;
  if (start) return `From ${start}`;
  if (p.status === 'completed') return 'Completed';
  return null;
}
