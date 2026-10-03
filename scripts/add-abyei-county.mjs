import { readFileSync, writeFileSync } from 'node:fs';

// 1. Update counties.json with official Abyei Area Feature
const counties = JSON.parse(readFileSync('./src/data/geo/counties.json', 'utf8'));

const abyeiCoords = [
  [27.833, 9.35],
  [28.2, 9.35],
  [28.7, 9.36],
  [29.0, 9.38],
  [29.0, 9.85],
  [29.0, 10.375],
  [28.6, 10.375],
  [28.2, 10.375],
  [27.833, 10.375],
  [27.833, 9.85],
  [27.833, 9.35]
];

if (!counties.features.some(f => f.properties.name === 'Abyei')) {
  counties.features.push({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [abyeiCoords]
    },
    properties: {
      name: "Abyei",
      label: [9.60, 28.43],
      area: 0.42
    }
  });
  writeFileSync('./src/data/geo/counties.json', JSON.stringify(counties, null, 2) + '\n');
  console.log("Added Abyei feature to counties.json!");
}

// 2. Also add to outline.json so it renders with the national boundary
const outline = JSON.parse(readFileSync('./src/data/geo/outline.json', 'utf8'));
if (outline.geometries && !outline.geometries.some(g => g.properties?.name === 'Abyei')) {
  outline.geometries.push({
    type: "Polygon",
    coordinates: [abyeiCoords],
    properties: { name: "Abyei" }
  });
  writeFileSync('./src/data/geo/outline.json', JSON.stringify(outline, null, 2) + '\n');
  console.log("Added Abyei to outline.json!");
}

// 3. Update locations.json: abyei
const locations = JSON.parse(readFileSync('./src/data/content/locations.json', 'utf8'));
const abyeiLoc = locations.find(l => l.id === 'abyei');
if (abyeiLoc) {
  abyeiLoc.county = "Abyei";
  abyeiLoc.name = "Abyei";
  abyeiLoc.state = "Abyei Special Administrative Area";
  abyeiLoc.coords = [9.60, 28.43];
  abyeiLoc.coordsPrecision = "town";
  abyeiLoc.labelSide = "top";
  abyeiLoc.summary = "Maternal healthcare, community midwifery, and emergency response in the Abyei Special Administrative Area.";
  abyeiLoc.subCounties = [
    "Abyei Town",
    "Agok",
    "Alal",
    "Mijak",
    "Rumamer",
    "Dillok"
  ];
  if (!abyeiLoc.programmeIds.includes('phsi')) abyeiLoc.programmeIds.push('phsi');
  if (!abyeiLoc.programmeIds.includes('emergency-relief')) abyeiLoc.programmeIds.push('emergency-relief');
  if (!abyeiLoc.programmeIds.includes('peacebuilding')) abyeiLoc.programmeIds.push('peacebuilding');
  writeFileSync('./src/data/content/locations.json', JSON.stringify(locations, null, 2) + '\n');
  console.log("Updated abyei in locations.json!");
}

// 4. Update programmes.json to link abyei to peacebuilding and emergency-relief as well
const programmes = JSON.parse(readFileSync('./src/data/content/programmes.json', 'utf8'));
const pb = programmes.find(p => p.id === 'peacebuilding');
if (pb && !pb.locationIds.includes('abyei')) pb.locationIds.push('abyei');
const er = programmes.find(p => p.id === 'emergency-relief');
if (er && !er.locationIds.includes('abyei')) er.locationIds.push('abyei');
writeFileSync('./src/data/content/programmes.json', JSON.stringify(programmes, null, 2) + '\n');
console.log("Updated programmes.json for abyei!");
