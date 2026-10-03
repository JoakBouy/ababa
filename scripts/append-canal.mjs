import { readFileSync, writeFileSync } from 'node:fs';

const personas = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));
const stories = JSON.parse(readFileSync('./src/data/content/stories.json', 'utf8'));

const canalPersona = {
  id: "canal-gatwech",
  status: "test",
  name: "Gatwech",
  role: "Emergency Relief & Community WASH Lead, Canal/Pigi",
  locationId: "canal",
  programmeIds: ["emergency-relief", "peacebuilding"],
  sectors: ["relief", "water", "protection"],
  headline: "Coordinating emergency flood assistance and canal-side community dialogues in Canal/Pigi.",
  portrait: { src: "media/people/nasir-cva.jpg", alt: "Gatwech in Canal", credit: "Photo: PRDA Emergency Response" },
  video: null,
  quote: "When floodwaters rise along the canal, rapid assistance and unity between our communities save lives.",
  chapters: {
    before: "Seasonal overflowing of the White Nile and Jonglei Canal submerged farmland and cut off access to potable water across Canal/Pigi, triggering clan displacement and resource tensions.",
    supported: "Through PRDA's emergency response and peacebuilding teams, Gatwech distributed clean water purification kits, rehabilitated hand pumps on higher ground, and facilitated water-sharing councils.",
    changed: "Displaced families have access to safe drinking water and emergency shelter supplies, while community peace monitors prevent resource clashes during high water."
  },
  support: [
    { label: "Canal-Side WASH Response", detail: "Borehole repair and water purification supplies" },
    { label: "Emergency CVA & Shelter", detail: "Cash vouchers and plastic sheeting for flood-hit families" }
  ],
  impact: [
    { label: "Households assisted with safe water", value: 520, unit: "households", evidence: { type: "record", note: "WASH distribution register", sourceId: null } },
    { label: "Inter-clan mediation sessions", value: 8, unit: "sessions", evidence: { type: "testimony", note: "Local elders council report", sourceId: null } }
  ],
  consent: { obtained: false, date: null, scope: null },
  recordedBy: "Test data",
  recordedOn: null,
  relatedStoryIds: []
};

if (!personas.some(p => p.id === 'canal-gatwech')) {
  personas.push(canalPersona);
}

if (!stories.some(s => s.id === 'canal-gatwech')) {
  stories.push({
    ...canalPersona,
    status: 'draft',
    recordedBy: 'PRDA Field Team',
    recordedOn: '2024-10-01'
  });
}

writeFileSync('./src/data/content/test-personas.json', JSON.stringify(personas, null, 2) + '\n');
writeFileSync('./src/data/content/stories.json', JSON.stringify(stories, null, 2) + '\n');
console.log(`Added canal-gatwech! Total personas: ${personas.length}, total stories: ${stories.length}`);
