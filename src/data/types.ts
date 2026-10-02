/**
 * Data model for the PRDA Impact Map.
 *
 * The journey the UI follows is:
 *   South Sudan → Place → Person → Story → Impact
 *
 * Content lives in src/data/content/*.json. See docs/ADDING-STORIES.md.
 */

export type SectorId = 'health' | 'education' | 'food' | 'water' | 'relief' | 'protection';

export interface Source {
  title: string;
  publisher: string;
  url: string;
  date?: string;
}

export interface Fact {
  text: string;
  sourceId: string;
}

export interface Programme {
  id: string;
  name: string;
  summary: string;
  sectors: SectorId[];
  years: { start: number | null; end: number | null };
  /** active = running; completed = ended; unconfirmed = dates/status not yet confirmed by PRDA */
  status: 'active' | 'completed' | 'unconfirmed';
  partners: string[];
  /** Place ids. Empty = programme known but not yet placed on the map. */
  locationIds: string[];
  facts: Fact[];
  sourceIds: string[];
}

export interface PlaceNote {
  kind: 'verify' | 'info';
  text: string;
}

export interface Place {
  id: string;
  name: string;
  /** Must match a county name in src/data/geo/counties.json (geoBoundaries ADM2). */
  county: string;
  state: string;
  /** [lat, lng] */
  coords: [number, number];
  /** town = marker at the town; county = marker at county centre (exact site unknown) */
  coordsPrecision: 'town' | 'county';
  labelSide: 'left' | 'right' | 'top' | 'bottom';
  summary: string;
  programmeIds: string[];
  notes: PlaceNote[];
  sourceIds: string[];
}

export type EvidenceType = 'record' | 'survey' | 'testimony' | 'observation' | 'external';

export interface ImpactItem {
  label: string;
  /** Leave null until evidence exists. Never estimate. */
  value: string | number | null;
  unit: string | null;
  evidence: { type: EvidenceType; note: string; sourceId: string | null };
}

export type Media =
  | { kind: 'image'; src: string; alt: string; credit?: string }
  | { kind: 'youtube'; id: string; caption?: string }
  | { kind: 'vimeo'; id: string; caption?: string }
  | { kind: 'file'; src: string; poster?: string; caption?: string };

export interface Story {
  id: string;
  /**
   * demo = empty template, never a real person
   * test = fictional test persona with illustrated portrait, for trying out the map
   * draft = real but not yet approved; published = real and consented
   */
  status: 'demo' | 'test' | 'draft' | 'published';
  name: string;
  role: string;
  locationId: string;
  programmeIds: string[];
  sectors: SectorId[];
  headline: string;
  portrait: { src: string; alt: string; credit?: string } | null;
  video: Exclude<Media, { kind: 'image' }> | null;
  quote: string | null;
  chapters: { before: string; supported: string; changed: string };
  support: { label: string; detail: string }[];
  impact: ImpactItem[];
  consent: { obtained: boolean; date: string | null; scope: string | null };
  recordedBy: string | null;
  recordedOn: string | null;
  relatedStoryIds: string[];
}
