import placesJson from './content/locations.json';
import programmesJson from './content/programmes.json';
import testPersonasJson from './content/test-personas.json';
import type { Place, Programme, Story } from './types';

const defaultPlaces = placesJson as Place[];
const defaultProgrammes = programmesJson as Programme[];
const defaultStories = testPersonasJson as Story[];


const STORAGE_KEYS = {
  STORIES: 'prda_admin_stories_v1',
  PLACES: 'prda_admin_places_v1',
  PROGRAMMES: 'prda_admin_programmes_v1',
};

export function loadAdminStories(): Story[] {
  if (typeof window === 'undefined') return defaultStories;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin stories:', e);
  }
  return defaultStories;
}

export function saveAdminStories(stories: Story[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    window.dispatchEvent(new CustomEvent('prda_data_changed'));
  } catch (e) {
    console.error('Failed to save admin stories:', e);
  }
}

export function loadAdminPlaces(): Place[] {
  if (typeof window === 'undefined') return defaultPlaces;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLACES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin places:', e);
  }
  return defaultPlaces;
}

export function saveAdminPlaces(places: Place[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
    window.dispatchEvent(new CustomEvent('prda_data_changed'));
  } catch (e) {
    console.error('Failed to save admin places:', e);
  }
}

export function loadAdminProgrammes(): Programme[] {
  if (typeof window === 'undefined') return defaultProgrammes;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAMMES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin programmes:', e);
  }
  return defaultProgrammes;
}

export function saveAdminProgrammes(progs: Programme[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(progs));
    window.dispatchEvent(new CustomEvent('prda_data_changed'));
  } catch (e) {
    console.error('Failed to save admin programmes:', e);
  }
}

export function hasCustomAdminChanges(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem(STORAGE_KEYS.STORIES) ||
    localStorage.getItem(STORAGE_KEYS.PLACES) ||
    localStorage.getItem(STORAGE_KEYS.PROGRAMMES)
  );
}

export function resetAdminDataToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.STORIES);
  localStorage.removeItem(STORAGE_KEYS.PLACES);
  localStorage.removeItem(STORAGE_KEYS.PROGRAMMES);
  window.dispatchEvent(new CustomEvent('prda_data_changed'));
}

export function downloadJsonFile(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
