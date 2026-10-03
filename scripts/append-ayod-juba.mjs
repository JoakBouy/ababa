import { readFileSync, writeFileSync } from 'node:fs';

const locations = JSON.parse(readFileSync('./src/data/content/locations.json', 'utf8'));
const programmes = JSON.parse(readFileSync('./src/data/content/programmes.json', 'utf8'));
const personas = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));
const stories = JSON.parse(readFileSync('./src/data/content/stories.json', 'utf8'));

// 1. Update locations.json: ayod and juba
const ayod = locations.find(l => l.id === 'ayod');
if (ayod && !ayod.programmeIds.includes('peacebuilding')) {
  ayod.programmeIds.push('peacebuilding');
  ayod.summary = "Maternal health and midwifery outreach caring for flood-isolated communities, alongside grassroots peacebuilding dialogues across Ayod County.";
}

const juba = locations.find(l => l.id === 'juba');
if (juba) {
  if (!juba.programmeIds.includes('peacebuilding')) juba.programmeIds.push('peacebuilding');
  if (!juba.programmeIds.includes('medical-camps')) juba.programmeIds.push('medical-camps');
  juba.summary = "PRDA head office, the Presbyterian Health Science Institute (PHSI), mobile medical camps, and national faith-based peacebuilding coordination.";
}

// 2. Update programmes.json: peacebuilding and add medical-camps
const pb = programmes.find(p => p.id === 'peacebuilding');
if (pb) {
  if (!pb.locationIds.includes('ayod')) pb.locationIds.push('ayod');
  if (!pb.locationIds.includes('juba')) pb.locationIds.push('juba');
}

if (!programmes.some(p => p.id === 'medical-camps')) {
  programmes.push({
    id: "medical-camps",
    name: "Community Medical Camps & Health Outreach",
    summary: "Mobile multi-disciplinary medical camps delivering free doctor consultations, maternal checkups, pediatric treatments, and essential medicines to peri-urban settlements and displaced communities.",
    sectors: ["health"],
    years: {
      start: 2021,
      end: null
    },
    status: "active",
    partners: [
      "Presbyterian Church of South Sudan",
      "Ministry of Health"
    ],
    locationIds: ["juba"],
    facts: [],
    sourceIds: ["prda-about", "prda-field-records"]
  });
}

// 3. Add 3 new personas
const newEntries = [
  // 1. Ayod - Chuol (Peacebuilding)
  {
    id: "ayod-chuol",
    status: "test",
    name: "Chuol",
    role: "Peacebuilding & Inter-Clan Reconciliation Lead, Ayod",
    locationId: "ayod",
    programmeIds: ["peacebuilding"],
    sectors: ["protection"],
    headline: "Mediating cattle migration pacts and healing clan trauma across Ayod County.",
    portrait: { src: "media/people/akobo-peace.jpg", alt: "Chuol, peacebuilding lead in Ayod", credit: "Photo: PRDA Peacebuilding" },
    video: null,
    quote: "True peace takes root when youth trade weapons for dialogue and shared trade.",
    chapters: {
      before: "Cattle raids and historical boundary disputes in the Ayod wetlands repeatedly forced youth into cycles of retaliatory violence that disrupted village life.",
      supported: "Under PRDA's Peace Building and Conflict Transformation initiative, Chuol established joint youth and elder peace councils and negotiated agreed dry-season grazing corridors.",
      changed: "Cattle migrations across payams now proceed peacefully under joint monitoring committees, and inter-clan markets have reopened without fear."
    },
    support: [
      { label: "Wetland Dialogue Councils", detail: "Facilitating inter-payam mediation forums in Ayod" },
      { label: "Youth Peace Monitor Training", detail: "Equipping 40 cattle camp youth in conflict de-escalation" }
    ],
    impact: [
      { label: "Grazing agreements brokered", value: 3, unit: "pacts", evidence: { type: "record", note: "County peace forum minutes", sourceId: null } },
      { label: "Youth monitors active", value: 40, unit: "monitors", evidence: { type: "observation", note: "Peace committee roster", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["ayod-nyawal"]
  },

  // 2. Juba - Rev. James (Peacebuilding)
  {
    id: "juba-james",
    status: "test",
    name: "Rev. James",
    role: "Faith-Based Peacebuilding & National Dialogue Coordinator, Juba",
    locationId: "juba",
    programmeIds: ["peacebuilding"],
    sectors: ["protection"],
    headline: "Convening church leaders, traditional chiefs, and youth for national reconciliation.",
    portrait: { src: "media/people/nasir-cva.jpg", alt: "Rev. James, peacebuilding coordinator in Juba", credit: "Photo: PRDA Peacebuilding" },
    video: null,
    quote: "When the church and traditional leaders speak with one voice for peace, communities find the courage to forgive and unite.",
    chapters: {
      before: "National and regional political fissures in South Sudan frequently fractured community cohesion along ethnic and denominational lines.",
      supported: "Rev. James coordinates high-level faith forums and grassroots trauma-healing workshops from PRDA's Juba headquarters, bringing divided leaders to one table.",
      changed: "Faith leaders across the Upper Nile and Equatoria corridors now maintain a unified reconciliation council that acts rapidly to mediate local escalations."
    },
    support: [
      { label: "National Faith Peace Forums", detail: "Bi-annual ecumenical leadership dialogues in Juba" },
      { label: "Trauma Healing Modules", detail: "Training community and church counselors nationwide" }
    ],
    impact: [
      { label: "Faith leaders engaged in dialogue", value: 85, unit: "leaders", evidence: { type: "record", note: "PCOSS peace conference register", sourceId: null } },
      { label: "Trauma healing facilitators trained", value: 60, unit: "facilitators", evidence: { type: "record", note: "Workshop certification log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-taban", "juba-sunday"]
  },

  // 3. Juba - Dr. Taban (Medical Camps)
  {
    id: "juba-taban",
    status: "test",
    name: "Dr. Taban",
    role: "Mobile Medical Camps Lead & Clinical Officer, Juba",
    locationId: "juba",
    programmeIds: ["medical-camps", "phsi"],
    sectors: ["health"],
    headline: "Organizing free community medical camps and mobile clinical checkups across Juba.",
    portrait: { src: "media/people/gatluak-officer.jpg", alt: "Dr. Taban, medical camps lead in Juba", credit: "Photo: PRDA Health Outreach" },
    video: null,
    quote: "A medical camp brings high-standard clinical care right to families who cannot afford hospital transport or prescription fees.",
    chapters: {
      before: "Families in peri-urban settlements and displacement sites around Juba (such as Gondokoro and Northern Bari) faced severe economic hurdles to access basic diagnostic care.",
      supported: "Dr. Taban mobilizes volunteer doctors, PHSI nurses, and pharmacy kits to set up free weekend medical camps offering general consultations, malaria tests, and hypertension care.",
      changed: "Thousands of vulnerable residents receive immediate diagnosis, free essential medicines, and urgent surgical referrals without financial barrier."
    },
    support: [
      { label: "Free Mobile Medical Camps", detail: "Full diagnostic checkups and treatment stations" },
      { label: "Essential Medication Dispensing", detail: "Antibiotics, antimalarials, and chronic disease medication" }
    ],
    impact: [
      { label: "Patients treated in medical camps", value: 1250, unit: "patients", evidence: { type: "record", note: "Medical camp attendance book", sourceId: null } },
      { label: "Children screened and dewormed", value: 680, unit: "children", evidence: { type: "record", note: "Pediatric screening log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-james", "juba-sunday", "juba-diana"]
  }
];

newEntries.forEach(entry => {
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

console.log(`Successfully updated! Total personas: ${personas.length}, total programmes: ${programmes.length}`);
