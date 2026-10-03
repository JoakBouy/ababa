import { readFileSync, writeFileSync } from 'node:fs';

const locations = JSON.parse(readFileSync('./src/data/content/locations.json', 'utf8'));
const programmes = JSON.parse(readFileSync('./src/data/content/programmes.json', 'utf8'));
const personas = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));
const stories = JSON.parse(readFileSync('./src/data/content/stories.json', 'utf8'));

// 1. Update leer in locations.json
const leer = locations.find(l => l.id === 'leer');
if (leer) {
  const newProgs = ['peacebuilding', 'emergency-relief', 'act-ssd241'];
  for (const np of newProgs) {
    if (!leer.programmeIds.includes(np)) leer.programmeIds.push(np);
  }
  const newSources = ['act-ssd241', 'prda-about', 'prda-field-records'];
  for (const ns of newSources) {
    if (!leer.sourceIds.includes(ns)) leer.sourceIds.push(ns);
  }
  leer.summary = "Home of PRDA's historic community midwifery school, alongside active emergency flood relief, WASH borehole rehabilitation, and grassroots peacebuilding.";
}

// 2. Update programmes.json
const addLocToProg = (progId, locId) => {
  const p = programmes.find(x => x.id === progId);
  if (p && !p.locationIds.includes(locId)) {
    p.locationIds.push(locId);
  }
};

addLocToProg('peacebuilding', 'leer');
addLocToProg('emergency-relief', 'leer');
addLocToProg('act-ssd241', 'leer');

// 3. Add the 3 new Leer personas
const leerTrio = [
  // 1. Leer - Peacebuilding (Gatkuoth)
  {
    id: "leer-peace-gatkuoth",
    status: "test",
    name: "Gatkuoth",
    role: "Peacebuilding & Inter-Payam Reconciliation Lead, Leer",
    locationId: "leer",
    programmeIds: ["peacebuilding"],
    sectors: ["protection"],
    headline: "Facilitating grassroots peace dialogues and restorative justice across Leer County.",
    portrait: { src: "media/people/akobo-peace.jpg", alt: "Gatkuoth, peacebuilding lead in Leer", credit: "Photo: PRDA Peacebuilding" },
    video: null,
    quote: "Healing the wounds of conflict in Leer begins when neighbours sit together under the shade of the dialogue tree.",
    chapters: {
      before: "Protracted conflict and clan divisions in southern Unity State left deep mistrust, cutting off trade between payams and keeping cattle camp youth armed and anxious.",
      supported: "Through PRDA's Peace Building and Conflict Transformation initiative, Gatkuoth facilitated community-led peace pacts, trauma-informed mediation sessions, and joint youth peace forums.",
      changed: "Cattle grazing corridors and fishing waters are now shared peacefully between payams, and inter-clan disputes are resolved through mediation rather than violence."
    },
    support: [
      { label: "Community Dialogue Councils", detail: "Monthly reconciliation forums across Leer payams" },
      { label: "Youth Peace Ambassadors", detail: "Trained 35 cattle camp youth in conflict mediation" }
    ],
    impact: [
      { label: "Inter-payam peace agreements", value: 4, unit: "accords", evidence: { type: "record", note: "Peace committee minutes", sourceId: null } },
      { label: "Community leaders engaged", value: 120, unit: "elders & chiefs", evidence: { type: "observation", note: "Forum attendance registry", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["leer-midwife", "leer-wash-nyanuer", "leer-relief-deng"]
  },

  // 2. Leer - WASH (Nyanuer)
  {
    id: "leer-wash-nyanuer",
    status: "test",
    name: "Nyanuer",
    role: "WASH Supervisor & Water Committee Lead, Leer",
    locationId: "leer",
    programmeIds: ["act-ssd241"],
    sectors: ["water"],
    headline: "Restoring community water boreholes and training hygiene promoters across flood-prone Leer.",
    portrait: { src: "media/people/nyabol-water.jpg", alt: "Nyanuer at a borehole in Leer", credit: "Photo: PRDA WASH" },
    video: null,
    quote: "When clean water flows right in our village, our daughters attend school and our children stay healthy.",
    chapters: {
      before: "Severe flooding submerged community boreholes across Leer, contaminating water tables and leading to recurring surges of acute watery diarrhea among young children.",
      supported: "Through the ACT Alliance flood response, Nyanuer led the rehabilitation of elevated hand pumps, decontaminated deep wells, and trained women-led water management committees.",
      changed: "Clean, reliable drinking water is protected against floodwaters, and women caretakers manage spare parts and monthly upkeep independently."
    },
    support: [
      { label: "Flood-Proof Borehole Rehab", detail: "Elevated aprons and hand pump repair across Leer" },
      { label: "Water Management Committees", detail: "Trained local women in mechanical maintenance and hygiene" }
    ],
    impact: [
      { label: "Boreholes restored and flood-proofed", value: 9, unit: "boreholes", evidence: { type: "record", note: "WASH technical inspection register", sourceId: null } },
      { label: "Households accessing clean water", value: 780, unit: "households", evidence: { type: "survey", note: "Community water audit", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["leer-midwife", "leer-peace-gatkuoth", "leer-relief-deng"]
  },

  // 3. Leer - Relief (Deng)
  {
    id: "leer-relief-deng",
    status: "test",
    name: "Deng",
    role: "Emergency Relief & Flood Response Coordinator, Leer",
    locationId: "leer",
    programmeIds: ["emergency-relief", "act-ssd241"],
    sectors: ["relief"],
    headline: "Coordinating rapid emergency shelter and non-food relief for flood-displaced families in Leer.",
    portrait: { src: "media/people/deng-father.jpg", alt: "Deng, relief coordinator in Leer", credit: "Photo: PRDA Emergency Response" },
    video: null,
    quote: "When floodwaters rise in the night, getting dry shelter and food kits into families' hands gives them dignity and survival.",
    chapters: {
      before: "Seasonal dike breaches left hundreds of families homeless overnight, stranded on small mounds of high ground with no blankets, cooking pots, or waterproof shelter.",
      supported: "Deng mobilizes rapid response teams under PRDA and ACT Alliance appeal SSD241, distributing emergency tarpaulins, mosquito nets, hygiene packs, and cash-for-work dike repair assistance.",
      changed: "Displaced families receive emergency shelter and household essentials within 48 hours of flood displacement, and reinforced dikes protect homesteads."
    },
    support: [
      { label: "Emergency Shelter Kits", detail: "Plastic sheeting, ropes, blankets, and mosquito nets" },
      { label: "Community Dike Reinforcement", detail: "Cash-for-work dike building to hold back seasonal floods" }
    ],
    impact: [
      { label: "Families reached with emergency relief", value: 650, unit: "families", evidence: { type: "record", note: "Relief distribution register", sourceId: null } },
      { label: "Kilometers of flood dikes reinforced", value: 4.5, unit: "km", evidence: { type: "observation", note: "Field engineering assessment", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["leer-midwife", "leer-peace-gatkuoth", "leer-wash-nyanuer"]
  }
];

leerTrio.forEach(entry => {
  if (!personas.some(p => p.id === entry.id)) {
    personas.push(entry);
  }
  if (!stories.some(s => s.id === entry.id)) {
    stories.push({
      ...entry,
      status: 'draft',
      recordedBy: 'PRDA Field Team',
      recordedOn: '2024-10-01'
    });
  }
});

writeFileSync('./src/data/content/locations.json', JSON.stringify(locations, null, 2) + '\n');
writeFileSync('./src/data/content/programmes.json', JSON.stringify(programmes, null, 2) + '\n');
writeFileSync('./src/data/content/test-personas.json', JSON.stringify(personas, null, 2) + '\n');
writeFileSync('./src/data/content/stories.json', JSON.stringify(stories, null, 2) + '\n');

console.log(`Successfully added Leer trio! Total personas: ${personas.length}, total stories: ${stories.length}`);
