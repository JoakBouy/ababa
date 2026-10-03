import { readFileSync, writeFileSync } from 'node:fs';

const existing = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));

const batch2 = [
  // 1. Bor - Nyachan
  {
    id: "bor-nyachan",
    status: "test",
    name: "Nyachan",
    role: "Midwife, Bor State Hospital Maternity Wing",
    locationId: "bor",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering skilled obstetric care and managing high-volume labor wards in Bor.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyachan, midwife in Bor", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Every mother who enters our delivery room deserves safe hands and compassionate care.",
    chapters: {
      before: "Flood displacements around Bor South overwhelmed local clinics, leaving hundreds of expectant mothers arriving in advanced labor without prior antenatal screening.",
      supported: "Deployed from PRDA's PHSI training network, Nyachan organized the hospital labor triage, ensuring sterile delivery packs and round-the-clock midwifery shifts.",
      changed: "Deliveries at the facility have tripled in safety, with zero preventable maternal deaths recorded on her shift over the past year."
    },
    support: [
      { label: "Hospital Labor Management", detail: "24/7 delivery room coverage and sterile supplies" },
      { label: "Emergency Obstetric Triage", detail: "Rapid assessment of pre-eclampsia and obstructed labor" }
    ],
    impact: [
      { label: "Deliveries attended in Bor", value: 230, unit: "births", evidence: { type: "record", note: "Hospital maternity ward log", sourceId: null } },
      { label: "High-risk cases managed", value: 45, unit: "mothers", evidence: { type: "record", note: "Emergency referral log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["bor-nyajima", "bor-nyandeng"]
  },

  // 2. Bor - Nyajima
  {
    id: "bor-nyajima",
    status: "test",
    name: "Nyajima",
    role: "Registered Nurse, Bor Health Facility",
    locationId: "bor",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing pediatric stabilization and post-delivery maternal recovery in Bor.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Nyajima, nurse in Bor", credit: "Photo: PRDA Health" },
    video: null,
    quote: "When a mother and child both walk home healthy and strong, our mission is fulfilled.",
    chapters: {
      before: "Neonatal infections and post-partum complications were prevalent among families sheltered in temporary flood camps around Bor.",
      supported: "Nyajima established post-delivery infection control routines, infant immunization tables, and maternal vital sign monitoring.",
      changed: "Infection rates among newborns delivered at the clinic dropped to near zero, and new mothers receive essential home care education."
    },
    support: [
      { label: "Neonatal Infection Prevention", detail: "Sterile cord care and immediate newborn warming" },
      { label: "Postnatal Ward Nursing", detail: "Routine maternal blood pressure and recovery monitoring" }
    ],
    impact: [
      { label: "Newborns stabilized and cared for", value: 210, unit: "infants", evidence: { type: "record", note: "Pediatric nursing book", sourceId: null } },
      { label: "Mothers educated on newborn hygiene", value: 320, unit: "mothers", evidence: { type: "observation", note: "Health session register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["bor-nyachan", "bor-nyandeng"]
  },

  // 3. Bor - Nyandeng
  {
    id: "bor-nyandeng",
    status: "test",
    name: "Nyandeng",
    role: "Community Midwife & Postnatal Specialist, Bor",
    locationId: "bor",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Conducting home visits and antenatal checkups for displaced families in Bor.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Nyandeng, midwife in Bor", credit: "Photo: PRDA Health" },
    video: null,
    quote: "We walk to the furthest shelters so no mother is left to face pregnancy alone.",
    chapters: {
      before: "Mothers living on the outskirts of Bor often missed clinic visits due to lack of transport and floodwaters blocking access roads.",
      supported: "Nyandeng leads a mobile postnatal patrol team, checking on newborn weight, promoting exclusive breastfeeding, and screening for maternal depression.",
      changed: "Over 90% of newly delivered mothers in her target communities receive home follow-up within 48 hours of birth."
    },
    support: [
      { label: "Mobile Community Follow-up", detail: "Postnatal home visits across Bor South" },
      { label: "Maternal Nutrition Counseling", detail: "Guidance on iron supplementation and infant feeding" }
    ],
    impact: [
      { label: "Home checkups completed", value: 185, unit: "visits", evidence: { type: "record", note: "Community health book", sourceId: null } },
      { label: "Early neonatal danger signs detected", value: 24, unit: "cases", evidence: { type: "record", note: "Referral intake", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["bor-nyachan", "bor-nyajima"]
  },

  // 4. Akobo - Junub
  {
    id: "akobo-junub",
    status: "test",
    name: "Junub",
    role: "Midwife, Akobo Primary Health Care Centre",
    locationId: "akobo",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering life-saving maternal and neonatal healthcare in remote Akobo County.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Junub, midwife in Akobo", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Here near the border, every safe delivery gives hope to our entire community.",
    chapters: {
      before: "Remote geography and seasonal mud roads meant women in Akobo had to travel days on foot or by canoe to reach emergency obstetric care.",
      supported: "Junub brought certified midwifery expertise to the Akobo facility, providing clean delivery suites, fetal Doppler checks, and emergency neonatal care.",
      changed: "Local families trust the health centre completely, and facility-based deliveries have risen steadily year-on-year."
    },
    support: [
      { label: "Certified Midwifery Facility", detail: "Equipped labor and delivery ward in Akobo" },
      { label: "Emergency Newborn Support", detail: "Bag-and-mask resuscitation and thermal care" }
    ],
    impact: [
      { label: "Deliveries attended safely", value: 155, unit: "births", evidence: { type: "record", note: "Akobo PHCC delivery log", sourceId: null } },
      { label: "Mothers screened during antenatal visits", value: 310, unit: "mothers", evidence: { type: "record", note: "Antenatal registry", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["akobo-nyabuay", "akobo-sarah", "akobo-health-worker"]
  },

  // 5. Akobo - Nyabuay
  {
    id: "akobo-nyabuay",
    status: "test",
    name: "Nyabuay",
    role: "Community Health Nurse & Nutrition Officer, Akobo",
    locationId: "akobo",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Combating severe acute malnutrition and childhood illnesses across Akobo.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Nyabuay, nurse in Akobo", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Healing an undernourished child restores strength to the entire household.",
    chapters: {
      before: "Drought and conflict disrupted local harvests, leaving high rates of severe wasting among children under five in Akobo.",
      supported: "Nyabuay established an outpatient therapeutic feeding programme, screening children with MUAC tapes and administering ready-to-use therapeutic food.",
      changed: "Childhood recovery rates have surpassed 92%, and mothers learn simple, nutrient-dense cooking using local greens and grains."
    },
    support: [
      { label: "Therapeutic Feeding Program", detail: "Outpatient management of severe malnutrition" },
      { label: "Childhood Illness Treatment", detail: "Diagnosis and care for malaria and pneumonia" }
    ],
    impact: [
      { label: "Malnourished children treated to recovery", value: 275, unit: "children", evidence: { type: "record", note: "Nutrition stabilization log", sourceId: null } },
      { label: "Mothers trained in child nutrition", value: 410, unit: "mothers", evidence: { type: "observation", note: "Nutrition education sessions", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["akobo-junub", "akobo-sarah", "akobo-health-worker"]
  },

  // 6. Akobo - Sarah
  {
    id: "akobo-sarah",
    status: "test",
    name: "Sarah",
    role: "Certified Midwife, Akobo Outreach Team",
    locationId: "akobo",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Connecting isolated cattle camps and river communities with maternal healthcare.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Sarah, midwife in Akobo", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Even in the furthest cattle camps, every pregnancy deserves skilled medical oversight.",
    chapters: {
      before: "Semi-nomadic pastoralist families moving between pastures often delivered with traditional, unsterilized tools far from any dispensary.",
      supported: "Sarah organized mobile motorcycle and canoe patrols, bringing clean birth kits, tetanus vaccines, and antenatal cards directly to cattle camps.",
      changed: "Tetanus infections among newborns have plummeted, and camp elders actively notify Sarah when a woman enters labor."
    },
    support: [
      { label: "Cattle Camp Maternal Outreach", detail: "Regular mobile health visits to pastoralist communities" },
      { label: "Tetanus Toxoid Vaccination", detail: "Immunizing pregnant mothers in remote grazing areas" }
    ],
    impact: [
      { label: "Pastoralist mothers vaccinated", value: 195, unit: "mothers", evidence: { type: "record", note: "Outreach immunization log", sourceId: null } },
      { label: "Clean delivery kits provided", value: 160, unit: "kits", evidence: { type: "record", note: "Distribution record", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["akobo-junub", "akobo-nyabuay", "akobo-health-worker"]
  },

  // 7. Abiemnhom - Mary Zacharia
  {
    id: "abiemnhom-mary-zacharia",
    status: "test",
    name: "Mary Zacharia",
    role: "Midwife, Abiemnhom Primary Health Care Centre",
    locationId: "abiemnhom",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering essential maternal and neonatal services in Abiemnhom County.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Mary Zacharia, midwife in Abiemnhom", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Our mothers in Abiemnhom have suffered through conflict; bringing life safely into this world is our contribution to peace.",
    chapters: {
      before: "Abiemnhom's proximity to border conflict corridors left health centres repeatedly cut off from essential medical supplies and staff.",
      supported: "Mary established a dependable maternity station at Abiemnhom PHCC with sterile instruments, oxytocin, and safe delivery beds.",
      changed: "Local and returning mothers now deliver in a clean, professional medical setting with zero cost barriers."
    },
    support: [
      { label: "PHCC Maternity Unit", detail: "Comprehensive labor and delivery care" },
      { label: "Sterile Birth Protocol", detail: "Supplies for infection-free deliveries" }
    ],
    impact: [
      { label: "Deliveries attended at Abiemnhom PHCC", value: 140, unit: "births", evidence: { type: "record", note: "Facility delivery log", sourceId: null } },
      { label: "Antenatal screenings conducted", value: 260, unit: "visits", evidence: { type: "record", note: "Antenatal cards", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["abiemnhom-rumia"]
  },

  // 8. Abiemnhom - Rumia (Nuba Mountains)
  {
    id: "abiemnhom-rumia",
    status: "test",
    name: "Rumia",
    role: "Community Midwife & Health Worker (Nuba Mountains), Abiemnhom",
    locationId: "abiemnhom",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Serving displaced and cross-border families with dedicated community midwifery.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Rumia, community midwife in Abiemnhom", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Having journeyed from the Nuba Mountains, I know what displacement feels like. Healing mothers is my calling.",
    chapters: {
      before: "Many refugee and returnee families from across the northern border settled in Abiemnhom with trauma and hesitation to seek formal clinical services.",
      supported: "Rumia conducts community maternal dialogues, bridging language and cultural divides to bring expectant mothers into clinical antenatal care.",
      changed: "Mothers from diverse communities now access maternal healthcare early, building lasting bonds across community lines."
    },
    support: [
      { label: "Cross-Border Maternal Care", detail: "Inclusive healthcare for returnee and displaced mothers" },
      { label: "Community Birth Preparedness", detail: "Assisting families to plan transportation and delivery needs" }
    ],
    impact: [
      { label: "Displaced mothers assisted in labor", value: 115, unit: "mothers", evidence: { type: "record", note: "Displacement health log", sourceId: null } },
      { label: "Families reached with health counseling", value: 240, unit: "families", evidence: { type: "observation", note: "Community register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["abiemnhom-mary-zacharia"]
  },

  // 9. Pariang - Elizabeth Kuku
  {
    id: "pariang-elizabeth-kuku",
    status: "test",
    name: "Elizabeth Kuku",
    role: "Midwife & Maternity Supervisor, Pariang",
    locationId: "pariang",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Managing maternal health services across refugee settlement and host community clinics in Pariang.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Elizabeth Kuku, midwife in Pariang", credit: "Photo: PRDA Health" },
    video: null,
    quote: "A refugee mother and a host mother share the same pain and joy in childbirth. We treat all with equal dignity.",
    chapters: {
      before: "Pariang hosts large populations of displaced people and refugees from the Nuba Mountains, placing heavy demands on strained delivery beds.",
      supported: "Elizabeth standardized obstetric care protocols, managed supply chains of sterile kits, and coordinated round-the-clock midwifery rosters.",
      changed: "Maternal mortality across supported clinics in Pariang has fallen sharply, with over 95% of deliveries now attended by certified midwives."
    },
    support: [
      { label: "Refugee & Host Health Coordination", detail: "Unified maternity service standards in Ruweng" },
      { label: "Emergency Obstetric Kits", detail: "Sterile delivery tools and hemorrhage management" }
    ],
    impact: [
      { label: "Deliveries supervised across facilities", value: 280, unit: "births", evidence: { type: "record", note: "County health facility register", sourceId: null } },
      { label: "Midwives and attendants mentored", value: 16, unit: "practitioners", evidence: { type: "testimony", note: "Clinical supervisory report", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pariang-raus", "pariang-rumia-kafi"]
  },

  // 10. Pariang - Raus
  {
    id: "pariang-raus",
    status: "test",
    name: "Raus",
    role: "Clinical Nurse, Pariang Health Facility",
    locationId: "pariang",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Treating acute pediatric conditions and managing inpatient care in Pariang.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Raus, nurse in Pariang", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Our children have endured displacement; giving them healthy bodies is giving them a future.",
    chapters: {
      before: "Respiratory infections and waterborne diarrheal diseases regularly overwhelmed the pediatric ward in Pariang during rainy seasons.",
      supported: "Raus implemented systematic triage protocols, standardized rehydration therapy, and administered essential antibiotic treatments.",
      changed: "Pediatric hospital stay durations have shortened, and recovery rates for acute pediatric illnesses now exceed 96%."
    },
    support: [
      { label: "Pediatric Ward Inpatient Care", detail: "Continuous nursing and diagnostic monitoring" },
      { label: "Oral Rehydration & Antibiotics", detail: "Timely administration of life-saving medical treatments" }
    ],
    impact: [
      { label: "Children treated on ward", value: 430, unit: "patients", evidence: { type: "record", note: "Inpatient admission log", sourceId: null } },
      { label: "Mothers trained on oral rehydration", value: 310, unit: "mothers", evidence: { type: "observation", note: "Ward discharge sessions", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pariang-elizabeth-kuku", "pariang-rumia-kafi"]
  },

  // 11. Pariang - Rumia Kafi (Nuba Mountains)
  {
    id: "pariang-rumia-kafi",
    status: "test",
    name: "Rumia Kafi",
    role: "Midwife & Maternal Care Specialist (Nuba Mountains), Pariang",
    locationId: "pariang",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing culturally sensitive maternal healthcare to Nuba refugee families and host communities.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Rumia Kafi, midwife in Pariang", credit: "Photo: PRDA Health" },
    video: null,
    quote: "No matter how difficult the journey has been, our clinic is a sanctuary of life and healing.",
    chapters: {
      before: "Expectant mothers fleeing aerial bombardments and hunger in the Nuba Mountains arrived in Pariang severely anemic and physically depleted.",
      supported: "Rumia provides intensive antenatal nutrition support, iron-folate therapy, and dedicated one-on-one midwifery during labor.",
      changed: "Hundreds of vulnerable mothers have given birth to healthy newborns, finding safety and renewal in Pariang."
    },
    support: [
      { label: "Refugee Maternity Support", detail: "Compassionate obstetric care tailored to displaced mothers" },
      { label: "Maternal Anemia Treatment", detail: "Nutritional supplements and prenatal health checks" }
    ],
    impact: [
      { label: "Deliveries attended for displaced mothers", value: 165, unit: "births", evidence: { type: "record", note: "Maternity facility log", sourceId: null } },
      { label: "Mothers treated for maternal anemia", value: 220, unit: "mothers", evidence: { type: "record", note: "Antenatal clinic records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pariang-elizabeth-kuku", "pariang-raus"]
  },

  // 12. Juba - Diana
  {
    id: "juba-diana",
    status: "test",
    name: "Diana",
    role: "Senior Midwife & Clinical Skills Educator, PHSI Juba",
    locationId: "juba",
    programmeIds: ["phsi"],
    sectors: ["health", "education"],
    headline: "Instructing midwifery students in advanced clinical simulations and emergency obstetrics.",
    portrait: { src: "media/people/phsi-training.jpg", alt: "Diana, educator at PHSI Juba", credit: "Photo: PRDA PHSI" },
    video: null,
    quote: "Precision and compassion in the classroom translate into lives saved in rural clinics.",
    chapters: {
      before: "A shortage of practical simulation equipment and instructors in Juba made it difficult for midwifery students to practice emergency procedures before ward placements.",
      supported: "Diana developed structured mannequin simulation drills covering shoulder dystocia, neonatal resuscitation, and eclampsia management.",
      changed: "Graduates report feeling thoroughly prepared and confident when facing complex obstetric emergencies in rural state clinics."
    },
    support: [
      { label: "Clinical Simulation Lab", detail: "Hands-on emergency obstetric procedure training" },
      { label: "Curriculum Standards", detail: "Aligning midwifery instruction with national health guidelines" }
    ],
    impact: [
      { label: "Midwifery students trained", value: 65, unit: "students", evidence: { type: "record", note: "PHSI student registry", sourceId: null } },
      { label: "Simulation modules conducted", value: 36, unit: "practicums", evidence: { type: "record", note: "Faculty log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-maria", "juba-mary-keji", "juba-sunday", "juba-nyakuoth"]
  },

  // 13. Juba - Maria
  {
    id: "juba-maria",
    status: "test",
    name: "Maria",
    role: "Registered Nurse & Ward In-Charge, Juba",
    locationId: "juba",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Supervising clinical inpatient recovery and hospital nursing standards in Juba.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Maria, nurse in Juba", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Continuous vigilance at the patient's bedside makes all the difference in recovery.",
    chapters: {
      before: "High patient turnover in urban clinics often led to rushed post-operative monitoring and delayed recognition of surgical complications.",
      supported: "Maria instituted strict hourly vital signs monitoring protocols, wound infection audits, and patient-centred nursing care.",
      changed: "Post-operative complications and hospital readmissions have dropped by over 40% across her ward."
    },
    support: [
      { label: "Inpatient Ward Supervision", detail: "Overseeing 30-bed surgical and maternal recovery ward" },
      { label: "Clinical Care Audits", detail: "Maintaining high patient safety and hygiene standards" }
    ],
    impact: [
      { label: "Inpatient patients managed", value: 380, unit: "patients", evidence: { type: "record", note: "Ward discharge book", sourceId: null } },
      { label: "Junior nurses mentored", value: 12, unit: "nurses", evidence: { type: "testimony", note: "Clinical mentorship review", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-diana", "juba-mary-keji"]
  },

  // 14. Juba - Mary keji
  {
    id: "juba-mary-keji",
    status: "test",
    name: "Mary Keji",
    role: "Maternal & Newborn Health Specialist, Juba",
    locationId: "juba",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Coordinating clinical placements and maternal health delivery across Juba.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Mary Keji, health specialist in Juba", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Strong maternal health systems are built on well-trained, respected midwives.",
    chapters: {
      before: "Coordination between training institutes and hospital maternity wards in Central Equatoria was fragmented, leaving clinical students without mentorship.",
      supported: "Mary Keji oversees student clinical rotations, ensuring every trainee attends a minimum of 50 supervised deliveries before certification.",
      changed: "A steady pipeline of certified, highly competent midwives enters the workforce each year, ready for immediate field deployment."
    },
    support: [
      { label: "Clinical Rotation Oversight", detail: "Coordinating hospital practicals for PHSI students" },
      { label: "Quality Maternal Assurance", detail: "Reviewing delivery standards across partner health centres" }
    ],
    impact: [
      { label: "Student delivery practicums supervised", value: 120, unit: "practicums", evidence: { type: "record", note: "Academic rotation book", sourceId: null } },
      { label: "Facility deliveries attended", value: 190, unit: "births", evidence: { type: "record", note: "Hospital log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-diana", "juba-maria"]
  },

  // 15. Wau - Alok
  {
    id: "wau-alok",
    status: "test",
    name: "Alok",
    role: "Midwife & Clinical Outreach Lead, Wau",
    locationId: "wau",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Promoting institutional deliveries and safe motherhood across Western Bahr el Ghazal.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Alok, midwife in Wau", credit: "Photo: PRDA Health" },
    video: null,
    quote: "When women feel respected and heard in the maternity ward, they encourage their sisters to deliver safely.",
    chapters: {
      before: "Rural mothers around Wau frequently opted for risky home deliveries because of fear of unfamiliar medical environments and language barriers.",
      supported: "Alok introduced respectful maternity care standards, free clean delivery packs, and antenatal health talks in local languages.",
      changed: "More than 80% of pregnant women in her target payams now choose facility delivery, with dramatic reductions in newborn infections."
    },
    support: [
      { label: "Respectful Maternity Ward", detail: "Culturally sensitive care and birth companion support" },
      { label: "Clean Delivery Kits", detail: "Supplying expectant mothers with sterile delivery essentials" }
    ],
    impact: [
      { label: "Facility deliveries managed in Wau", value: 170, unit: "births", evidence: { type: "record", note: "Wau maternity ward log", sourceId: null } },
      { label: "Mothers reached with antenatal education", value: 340, unit: "mothers", evidence: { type: "observation", note: "Outreach attendance sheets", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 16. Abyei - Teresa
  {
    id: "abyei-teresa",
    status: "test",
    name: "Teresa",
    role: "Midwife & Emergency Maternal Lead, Abyei / Agok",
    locationId: "abyei",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering frontline obstetric care in conflict-affected border communities in Abyei.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Teresa, midwife in Abyei", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Even when insecurity shakes our border communities, the arrival of new life brings unshakeable hope.",
    chapters: {
      before: "Recurring cross-border skirmishes and displacement in the Abyei corridor left pregnant women cut off from reliable surgical and delivery facilities.",
      supported: "Teresa established an emergency obstetric triage tent in Agok/Abyei with solar-powered lights, sterile surgical packs, and maternal rehydration.",
      changed: "Mothers displaced by fighting find a safe, welcoming clinic where skilled midwives stand ready at any hour."
    },
    support: [
      { label: "Emergency Border Delivery Post", detail: "Rapid maternal care during displacement" },
      { label: "Sterile Instrument Supplies", detail: "Life-saving tools for complicated deliveries" }
    ],
    impact: [
      { label: "Deliveries attended in Abyei corridor", value: 150, unit: "births", evidence: { type: "record", note: "Emergency clinic log", sourceId: null } },
      { label: "Displaced mothers screened in pregnancy", value: 290, unit: "mothers", evidence: { type: "record", note: "Intake register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["koch-teresa"]
  },

  // 17. Koch - Teresa
  {
    id: "koch-teresa",
    status: "test",
    name: "Teresa",
    role: "Community Midwife, Koch County Health Care Centre",
    locationId: "koch",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering skilled care in flood-affected and remote villages across Koch County.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Teresa, midwife in Koch", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Water surrounding our village cannot stop us from protecting our mothers.",
    chapters: {
      before: "Severely damaged infrastructure in Koch County left most pregnant women without access to trained midwives during labor.",
      supported: "Teresa rehabilitated the local health centre's delivery room, equipped it with clean linens and birth kits, and conducts weekly mobile visits.",
      changed: "Mothers who previously gave birth without assistance now deliver safely with Teresa, knowing their newborns are protected."
    },
    support: [
      { label: "Rehabilitated Delivery Room", detail: "Dry, sterile birth room in Koch PHCC" },
      { label: "Weekly Mobile Clinic", detail: "Reaching isolated homesteads across Koch" }
    ],
    impact: [
      { label: "Deliveries conducted in Koch", value: 135, unit: "births", evidence: { type: "record", note: "Koch PHCC delivery register", sourceId: null } },
      { label: "Mothers enrolled in antenatal care", value: 220, unit: "mothers", evidence: { type: "record", note: "Antenatal attendance book", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["abyei-teresa"]
  },

  // 18. Ayod - Nyawal
  {
    id: "ayod-nyawal",
    status: "test",
    name: "Nyawal",
    role: "Midwife & Maternal Outreach Specialist, Ayod County",
    locationId: "ayod",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Navigating vast wetlands to bring safe delivery care to mothers across Ayod.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyawal, midwife in Ayod", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Every village in Ayod deserves access to trained hands when new life enters the world.",
    chapters: {
      before: "Deep floods created islands across Ayod County, preventing women from walking to health facilities and leaving them vulnerable to birth trauma.",
      supported: "Nyawal established a community canoe-based referral system, training village birth attendants to alert her when labor starts.",
      changed: "Mothers in the most remote payams are now safely transported or attended to by Nyawal, eliminating delays in maternal care."
    },
    support: [
      { label: "Canoe Maternal Referral System", detail: "Waterborne transport for mothers in labor" },
      { label: "Village Attendant Mentorship", detail: "Training local women in safe birth practices" }
    ],
    impact: [
      { label: "Safe deliveries attended in Ayod", value: 145, unit: "births", evidence: { type: "record", note: "Ayod health register", sourceId: null } },
      { label: "Remote payams reached by canoe", value: 14, unit: "villages", evidence: { type: "record", note: "Outreach travel log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 19. Mayendit - Elizabeth
  {
    id: "mayendit-elizabeth",
    status: "test",
    name: "Elizabeth",
    role: "Midwife & Safe Delivery Specialist, Mayendit",
    locationId: "mayendit",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Restoring maternal health services in flood-hit communities of Mayendit County.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Elizabeth, midwife in Mayendit", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Seeing healthy mothers and crying babies brings light back to our community in Mayendit.",
    chapters: {
      before: "Floods submerged farmland and homes in Mayendit, forcing mothers to give birth in damp, unsanitary conditions with high infant infection rates.",
      supported: "Elizabeth set up an elevated, dry maternity shelter equipped with solar power, clean birth kits, and newborn warmth packs.",
      changed: "Expectant mothers have a safe haven for labor and delivery, and infant sepsis has been virtually eradicated in the catchment area."
    },
    support: [
      { label: "Elevated Maternity Shelter", detail: "Flood-proof delivery facility in Mayendit" },
      { label: "Newborn Care Packs", detail: "Sterile cord care, warm blankets, and caps" }
    ],
    impact: [
      { label: "Deliveries conducted in safe shelter", value: 160, unit: "births", evidence: { type: "record", note: "Mayendit maternity log", sourceId: null } },
      { label: "Postnatal checkups performed", value: 215, unit: "visits", evidence: { type: "record", note: "Postnatal card index", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 20. Leer - Nyachudier
  {
    id: "leer-nyachudier",
    status: "test",
    name: "Nyachudier",
    role: "Midwife, Leer Midwifery School Graduate",
    locationId: "leer",
    programmeIds: ["leer-midwifery", "phsi"],
    sectors: ["health", "education"],
    headline: "Carrying forward the proud heritage of PRDA's Leer Midwifery Training School.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyachudier, midwife in Leer", credit: "Photo: PRDA Midwifery" },
    video: null,
    quote: "The Leer Midwifery School taught us that our hands hold the future of South Sudan.",
    chapters: {
      before: "Leer was once the historic centre of PRDA's midwifery training before conflicts disrupted classrooms and displaced students across regions.",
      supported: "Having graduated from the accredited midwifery programme, Nyachudier returned to Leer to serve in the community clinic, attending births and mentoring apprentices.",
      changed: "The tradition of skilled midwifery in Leer is alive and strong, with hundreds of women receiving life-saving care every month."
    },
    support: [
      { label: "Leer Midwifery Diploma", detail: "Accredited two-year community midwifery graduate" },
      { label: "Community Clinic Practice", detail: "Full obstetric and neonatal care in Leer" }
    ],
    impact: [
      { label: "Births attended since graduation", value: 225, unit: "births", evidence: { type: "record", note: "Leer clinic delivery log", sourceId: null } },
      { label: "Midwifery apprentices mentored", value: 8, unit: "apprentices", evidence: { type: "testimony", note: "Training records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["leer-midwife", "leer-mother"]
  }
];

const combined = [...existing, ...batch2];
writeFileSync('./src/data/content/test-personas.json', JSON.stringify(combined, null, 2) + '\n');
console.log(`Successfully updated test-personas.json with ${combined.length} total personas!`);
