import { readFileSync, writeFileSync } from 'node:fs';

const locations = JSON.parse(readFileSync('./src/data/content/locations.json', 'utf8'));
const programmes = JSON.parse(readFileSync('./src/data/content/programmes.json', 'utf8'));

const subCountiesMap = {
  leer: ["Leer Town", "Adok Port", "Pillieny", "Thonyor", "Bow", "Yang"],
  juba: ["Juba Town", "Thongpiny", "Munuki", "Kator", "Rejaf", "Gondokoro", "Northern Bari"],
  pochalla: ["Pochalla Town", "Adongo", "Akobo River", "Burator", "Otalo"],
  uror: ["Pieri", "Yuai", "Pulchuol", "Motot", "Pathai", "Palouny"],
  akobo: ["Akobo Centre", "Bilkey", "Gakdong", "Alali", "Nyandit", "Diror"],
  bor: ["Bor Town", "Kolnyang", "Makuach", "Baidit", "Anyidi"],
  maiwut: ["Maiwut Town", "Pagak", "Uleng", "Jotome", "Turuk"],
  pibor: ["Pibor Town", "Verteth", "Gumuruk", "Likuangole", "Boma Plateau", "Maruwa"],
  fangak: ["Old Fangak", "New Fangak", "Phom", "Manajang", "Pangwir", "Barboi"],
  nasir: ["Nasir Town", "Kigille", "Koat", "Roeding", "Mading", "Jikmir", "Dinkar"],
  ulang: ["Ulang Centre", "Kurmuot", "Yomding", "Burebiey", "Doma"],
  kodok: ["Kodok Town", "Lul", "Deleb", "Thurgo", "Padit"],
  malakal: ["Malakal Town", "Malakal PoC", "Ogod", "Lelo"],
  renk: ["Renk Town", "Geiger", "Jalhak", "Wunthou (Juda)"],
  "twic-east": ["Panyagor", "Lith", "Ajuong", "Kongor", "Nyuak"],
  duk: ["Duk Padiet", "Duk Poktap", "Panyang", "Ageer", "Payuel"],
  yei: ["Yei Town", "Otogo", "Mugwo", "Tore"],
  nimule: ["Nimule Border", "Magwi Town", "Pajok", "Obbo", "Lobone"],
  kakuma: ["Kakuma Refugee Hub", "Kalobeyei", "Lokichogio Corridor"],
  rubkona: ["Rubkona Town", "Bentiu IDP Site", "Nhialdiu", "Dhorbor", "Wunrok"],
  rumbek: ["Rumbek Town", "Mayom", "Jiir", "Matangai"],
  chuil: ["Chuil Payam", "Waat", "Lankien", "Pading", "Thol"],
  abiemnhom: ["Abiemnhom Centre", "Bang Bang", "Thurazoka", "Riak"],
  pariang: ["Pariang Town", "Yida", "Ajuong Thok", "Jamjang", "Nyeil"],
  wau: ["Wau Town", "Besselia", "Bagari", "Kpaile"],
  abyei: ["Agok", "Turalei", "Wunrok", "Mayen-Abun", "Aweng"],
  koch: ["Koch Town", "Mirmir", "Guit", "Bieh", "Boaw"],
  ayod: ["Ayod Town", "Khoradar", "Mogok", "Pagil", "Wau"],
  mayendit: ["Mayendit Centre", "Dablual", "Mirnyal", "Thaker", "Rubkuai"],
  canal: ["Canal Town", "Khorfulus", "Atar", "Diel", "Kamal"],
  pieri: ["Pieri Centre", "Mading", "Palouny", "Panyok"]
};

// 1. Assign subCounties to all existing locations
locations.forEach(loc => {
  if (subCountiesMap[loc.id]) {
    loc.subCounties = subCountiesMap[loc.id];
  }
});

// 2. Add Canal and Pieri if not yet added
const locIds = new Set(locations.map(l => l.id));

if (!locIds.has('canal')) {
  locations.push({
    id: "canal",
    name: "Canal (Khorfulus)",
    county: "Canal/Pigi",
    state: "Jonglei",
    coords: [9.061, 31.466],
    coordsPrecision: "town",
    labelSide: "right",
    summary: "Emergency flood response, WASH borehole rehabilitation, conflict transformation, and community health outreach along the Jonglei Canal and Zaraf corridor.",
    programmeIds: ["emergency-relief", "act-ssd241", "peacebuilding", "phsi"],
    subCounties: ["Canal Town", "Khorfulus", "Atar", "Diel", "Kamal"],
    notes: [],
    sourceIds: ["prda-about", "act-ssd241", "prda-field-records"]
  });
}

if (!locIds.has('pieri')) {
  locations.push({
    id: "pieri",
    name: "Pieri",
    county: "Uror",
    state: "Jonglei",
    coords: [7.75, 32.02],
    coordsPrecision: "town",
    labelSide: "top",
    summary: "Emergency humanitarian relief, community-based protection, and WASH interventions in Pieri payam, Uror County.",
    programmeIds: ["emergency-relief", "uror-agri-wash"],
    subCounties: ["Pieri Centre", "Mading", "Palouny", "Panyok"],
    notes: [],
    sourceIds: ["prda-about", "prda-field-records"]
  });
}

// 3. Update programmes to include canal and pieri
const updateProg = (id, newLids) => {
  const p = programmes.find(x => x.id === id);
  if (!p) return;
  for (const lid of newLids) {
    if (!p.locationIds.includes(lid)) {
      p.locationIds.push(lid);
    }
  }
};

updateProg('emergency-relief', ['canal', 'pieri']);
updateProg('act-ssd241', ['canal']);
updateProg('peacebuilding', ['canal']);
updateProg('phsi', ['canal']);
updateProg('uror-agri-wash', ['pieri']);

writeFileSync('./src/data/content/locations.json', JSON.stringify(locations, null, 2) + '\n');
writeFileSync('./src/data/content/programmes.json', JSON.stringify(programmes, null, 2) + '\n');
console.log(`Updated locations.json (${locations.length} places) and programmes.json!`);
