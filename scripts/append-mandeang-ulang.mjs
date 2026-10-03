import { readFileSync, writeFileSync } from 'node:fs';

const locations = JSON.parse(readFileSync('./src/data/content/locations.json', 'utf8'));
const programmes = JSON.parse(readFileSync('./src/data/content/programmes.json', 'utf8'));
const personas = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));
const stories = JSON.parse(readFileSync('./src/data/content/stories.json', 'utf8'));

// 1. Update ulang in locations.json
const ulang = locations.find(l => l.id === 'ulang');
if (ulang && !ulang.programmeIds.includes('phsi')) {
  ulang.programmeIds.push('phsi');
}

// 2. Add mandeang to locations.json
if (!locations.some(l => l.id === 'mandeang')) {
  locations.push({
    id: "mandeang",
    name: "Mandeang",
    county: "Luakpiny/Nasir",
    state: "Upper Nile",
    coords: [8.58, 33.22],
    coordsPrecision: "town",
    labelSide: "top",
    summary: "Primary healthcare, maternal delivery services, and community midwifery serving Mandeang payam and river settlements along the Sobat in Luakpiny/Nasir County.",
    programmeIds: ["phsi", "emergency-relief"],
    subCounties: ["Mandeang Centre", "Kuetreng", "Thocding"],
    notes: [],
    sourceIds: ["prda-about", "prda-mission", "prda-field-records"]
  });
}

// Update nasir subCounties to include Mandeang
const nasir = locations.find(l => l.id === 'nasir');
if (nasir && !nasir.subCounties.includes('Mandeang')) {
  nasir.subCounties.unshift('Mandeang');
}

// 3. Update programmes.json
const phsi = programmes.find(p => p.id === 'phsi');
if (phsi) {
  if (!phsi.locationIds.includes('ulang')) phsi.locationIds.push('ulang');
  if (!phsi.locationIds.includes('mandeang')) phsi.locationIds.push('mandeang');
}

const er = programmes.find(p => p.id === 'emergency-relief');
if (er && !er.locationIds.includes('mandeang')) {
  er.locationIds.push('mandeang');
}

// 4. Add the 2 new personas
const newPersonas = [
  // Veronica Nyakuoth - Midwife - Ulang
  {
    id: "ulang-veronica-nyakuoth",
    status: "test",
    name: "Veronica Nyakuoth",
    role: "Midwife, Ulang Primary Health Care Centre",
    locationId: "ulang",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering skilled maternal and newborn care along the Sobat River corridor in Ulang.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Veronica Nyakuoth, midwife in Ulang", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Every mother arriving on the riverbanks deserves compassionate, skilled care when giving birth.",
    chapters: {
      before: "During seasonal rains, high waters cut off overland access to Ulang hospital, leaving mothers in outer villages with only unassisted home deliveries.",
      supported: "Veronica established a 24-hour maternal health post at Ulang PHCC, equipped with sterile delivery packs, maternal rehydration, and infant warming.",
      changed: "Mothers now travel early by canoe to stay near the clinic before delivery, and complication rates have dropped drastically across the county."
    },
    support: [
      { label: "Sobat River Maternity Station", detail: "24/7 skilled labor and delivery attendance" },
      { label: "Clean Delivery Kits", detail: "Sterile cord clamps, antiseptic, and warm blankets" }
    ],
    impact: [
      { label: "Deliveries attended in Ulang", value: 165, unit: "births", evidence: { type: "record", note: "Ulang PHCC maternity book", sourceId: null } },
      { label: "Antenatal checkups conducted", value: 290, unit: "visits", evidence: { type: "record", note: "Antenatal card index", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["ulang-wicjual"]
  },

  // Nyakor - Mandeang - Midwife
  {
    id: "mandeang-nyakor",
    status: "test",
    name: "Nyakor",
    role: "Midwife, Mandeang Primary Health Care Unit",
    locationId: "mandeang",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing skilled delivery and antenatal care in Mandeang payam, Nasir County.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Nyakor, midwife in Mandeang", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Serving mothers here in Mandeang means bringing life and safety to one of our most remote communities.",
    chapters: {
      before: "Mandeang payam had no resident certified midwife for years, forcing families to undertake arduous boat journeys to Nasir town during obstructed labor.",
      supported: "Deployed with PRDA's PHSI support, Nyakor opened the maternity room at Mandeang PHCU, providing prenatal testing, malaria treatment, and safe deliveries.",
      changed: "Mothers throughout Mandeang and neighbouring river hamlets now deliver locally with skilled medical hands by their side."
    },
    support: [
      { label: "Mandeang Maternity Facility", detail: "Skilled obstetric care and sterile supplies" },
      { label: "Antenatal Outreach", detail: "Weekly clinic sessions for expectant mothers" }
    ],
    impact: [
      { label: "Safe deliveries attended in Mandeang", value: 130, unit: "births", evidence: { type: "record", note: "Mandeang PHCU delivery log", sourceId: null } },
      { label: "Pregnant women screened for malaria", value: 245, unit: "mothers", evidence: { type: "record", note: "Antenatal clinic records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["nasir-changkuoth", "nasir-nyasunday"]
  }
];

newPersonas.forEach(entry => {
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

console.log(`Added Veronica Nyakuoth (Ulang) & Nyakor (Mandeang)! Total personas: ${personas.length}, total places: ${locations.length}`);
