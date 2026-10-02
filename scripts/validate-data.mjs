#!/usr/bin/env node
/**
 * Checks the impact-map content for broken links between records and for
 * stories that are not ready to publish. Runs automatically before `npm run build`.
 *
 *   npm run validate
 */
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));
const places = read('content/locations.json');
const programmes = read('content/programmes.json');
const stories = read('content/stories.json');
const sources = read('content/sources.json');
const counties = read('geo/counties.json');

const SECTORS = ['health', 'education', 'food', 'water', 'relief', 'protection'];
const errors = [];
const warnings = [];

const dupes = (list, label) => {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.id)) errors.push(`Duplicate ${label} id "${item.id}"`);
    seen.add(item.id);
  }
};
dupes(places, 'place');
dupes(programmes, 'programme');
dupes(stories, 'story');

const placeIds = new Set(places.map((p) => p.id));
const progById = new Map(programmes.map((p) => [p.id, p]));
const storyIds = new Set(stories.map((s) => s.id));
const countyByName = new Map(counties.features.map((f) => [f.properties.name, f]));

const checkSources = (ids, where) =>
  ids.forEach((id) => { if (!sources[id]) errors.push(`${where}: unknown source "${id}"`); });

// Point-in-polygon (ray casting) for coordinate sanity checks
const inRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const inGeometry = (pt, g) => {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.some((poly) => inRing(pt, poly[0]) && !poly.slice(1).some((h) => inRing(pt, h)));
};

for (const place of places) {
  const where = `Place "${place.id}"`;
  const county = countyByName.get(place.county);
  if (!county) errors.push(`${where}: county "${place.county}" not found in geo/counties.json`);
  else if (!inGeometry([place.coords[1], place.coords[0]], county.geometry))
    warnings.push(`${where}: coords ${place.coords} fall outside ${place.county} county`);
  for (const pid of place.programmeIds) {
    const prog = progById.get(pid);
    if (!prog) errors.push(`${where}: unknown programme "${pid}"`);
    else if (!prog.locationIds.includes(place.id))
      errors.push(`${where}: lists programme "${pid}" but the programme does not list this place`);
  }
  checkSources(place.sourceIds, where);
}

for (const prog of programmes) {
  const where = `Programme "${prog.id}"`;
  prog.sectors.forEach((s) => { if (!SECTORS.includes(s)) errors.push(`${where}: unknown sector "${s}"`); });
  for (const lid of prog.locationIds) {
    if (!placeIds.has(lid)) errors.push(`${where}: unknown place "${lid}"`);
    else if (!places.find((p) => p.id === lid).programmeIds.includes(prog.id))
      errors.push(`${where}: lists place "${lid}" but that place does not list this programme`);
  }
  checkSources(prog.sourceIds, where);
  prog.facts.forEach((f) => checkSources([f.sourceId], `${where} fact`));
  if (prog.sourceIds.length === 0) errors.push(`${where}: needs at least one source`);
}

for (const story of stories) {
  const where = `Story "${story.id}"`;
  if (!placeIds.has(story.locationId)) errors.push(`${where}: unknown place "${story.locationId}"`);
  story.programmeIds.forEach((id) => { if (!progById.has(id)) errors.push(`${where}: unknown programme "${id}"`); });
  story.sectors.forEach((s) => { if (!SECTORS.includes(s)) errors.push(`${where}: unknown sector "${s}"`); });
  story.relatedStoryIds.forEach((id) => { if (!storyIds.has(id)) errors.push(`${where}: unknown related story "${id}"`); });
  story.impact.forEach((i) => { if (i.evidence.sourceId) checkSources([i.evidence.sourceId], `${where} impact`); });

  if (story.status === 'published') {
    if (!story.consent.obtained) errors.push(`${where}: published without recorded consent`);
    if (!story.consent.date) errors.push(`${where}: published without a consent date`);
    if (story.portrait && !story.portrait.alt) errors.push(`${where}: portrait needs alt text`);
    if (!story.recordedBy || !story.recordedOn) warnings.push(`${where}: add recordedBy and recordedOn`);
    story.impact.forEach((i) => {
      if (i.value !== null && !i.evidence.note && !i.evidence.sourceId)
        errors.push(`${where}: impact "${i.label}" has a value but no evidence`);
    });
  }
}

const demo = stories.filter((s) => s.status === 'demo').length;
if (demo) warnings.push(`${demo} demo stories are still in stories.json (set SHOW_DEMO_STORIES=false in src/data/index.ts to hide them)`);

warnings.forEach((w) => console.warn(`  warn  ${w}`));
errors.forEach((e) => console.error(`  error ${e}`));
console.log(`\nChecked ${places.length} places, ${programmes.length} programmes, ${stories.length} stories: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
