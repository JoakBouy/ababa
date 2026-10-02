import type { Place, Programme, SectorId, Source, Story } from './types';
import { SECTOR_ORDER } from './sectors';
import placesJson from './content/locations.json';
import programmesJson from './content/programmes.json';
import storiesJson from './content/stories.json';
import testPersonasJson from './content/test-personas.json';
import sourcesJson from './content/sources.json';

/**
 * Which people appear on the map:
 *   'test' — fictional test personas with illustrated portraits (for trying the map out)
 *   'demo' — empty story templates showing where real content goes
 *   'live' — only PRDA's real stories from stories.json (demo templates hidden)
 */
export const CONTENT_MODE: 'test' | 'demo' | 'live' = 'test';

export const places = placesJson as Place[];
export const programmes = programmesJson as Programme[];
export const sources = sourcesJson as Record<string, Source>;
export const stories: Story[] =
  CONTENT_MODE === 'test'
    ? (testPersonasJson as Story[])
    : (storiesJson as Story[]).filter((s) => CONTENT_MODE === 'demo' || s.status !== 'demo');

/** True when a story is not a real, consented person. */
export const isPlaceholder = (s: Story) => s.status === 'demo' || s.status === 'test';
export const anyPlaceholders = stories.some(isPlaceholder);
export const placeholderLabel = CONTENT_MODE === 'test' ? 'Test personas' : 'Demo stories';

const programmeById = new Map(programmes.map((p) => [p.id, p]));
const placeById = new Map(places.map((p) => [p.id, p]));
const storyById = new Map(stories.map((s) => [s.id, s]));

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

export const unplacedProgrammes = programmes.filter((p) => p.locationIds.length === 0);

export const placeByCounty = new Map(places.map((p) => [p.county, p]));

export function yearsLabel(p: Programme): string | null {
  const { start, end } = p.years;
  if (start && end) return `${start}–${end}`;
  if (start && p.status === 'active') return `Since ${start}`;
  if (start) return `From ${start}`;
  if (p.status === 'completed') return 'Completed';
  return null;
}
