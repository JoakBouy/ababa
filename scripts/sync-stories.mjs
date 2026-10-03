import { readFileSync, writeFileSync } from 'node:fs';

const stories = JSON.parse(readFileSync('./src/data/content/stories.json', 'utf8'));
const personas = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));

// Take the 26 new personas (from index 7 onwards) and add them with status: 'draft'
const newStories = personas.slice(7).map(p => ({
  ...p,
  status: 'draft',
  recordedBy: 'PRDA Field Team',
  recordedOn: '2024-10-01'
}));

const existingIds = new Set(stories.map(s => s.id));
const merged = [...stories];
for (const s of newStories) {
  if (!existingIds.has(s.id)) {
    merged.push(s);
  }
}

writeFileSync('./src/data/content/stories.json', JSON.stringify(merged, null, 2) + '\n');
console.log(`Successfully synced ${merged.length} stories to stories.json`);
