import type { Place, Programme, SectorId, Source, Story } from './types';
import { SECTOR_ORDER } from './sectors';
import placesJson from './content/locations.json';
import programmesJson from './content/programmes.json';
import storiesJson from './content/stories.json';
import sourcesJson from './content/sources.json';

/**
 * Set to false once PRDA's real stories are in, to hide demo profiles.
 */
export const SHOW_DEMO_STORIES = true;

export const places = placesJson as Place[];
export const programmes = programmesJson as Programme[];
export const sources = sourcesJson as Record<string, Source>;
export const stories = (storiesJson as Story[]).filter((s) => SHOW_DEMO_STORIES || s.status !== 'demo');

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
