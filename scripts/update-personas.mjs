import { readFileSync, writeFileSync } from 'node:fs';

const existing = JSON.parse(readFileSync('./src/data/content/test-personas.json', 'utf8'));

const newPersonas = [
  // 1. Ulang - Wicjual
  {
    id: "ulang-wicjual",
    status: "test",
    name: "Wicjual",
    role: "Peacebuilding & Conflict Transformation Officer, Ulang",
    locationId: "ulang",
    programmeIds: ["peacebuilding"],
    sectors: ["protection"],
    headline: "Mediating clan dialogues and building lasting peace along the Sobat River corridor in Ulang.",
    portrait: { src: "media/people/akobo-peace.jpg", alt: "Wicjual, peacebuilding officer in Ulang", credit: "Photo: PRDA Peacebuilding" },
    video: null,
    quote: "Peace is not the absence of conflict; it is the presence of understanding and shared hope between our communities.",
    chapters: {
      before: "Seasonal cattle migrations and historical clan grievances regularly led to retaliatory attacks and market closures in Ulang County, disrupting trade and leaving families vulnerable.",
      supported: "Through PRDA's Peace Building and Conflict Transformation programme, Wicjual trained village peace monitors, organized traditional elder councils, and created joint water-sharing agreements between neighboring payams.",
      changed: "Cattle corridors are now agreed upon before migration begins, cross-clan markets have reopened along the Sobat River, and disputes are brought to community peace committees rather than settled by arms."
    },
    support: [
      { label: "Peace Committee Facilitation", detail: "Formed 6 inter-payam dialogue councils across Ulang" },
      { label: "Early Warning Mediation", detail: "Trained 30 community youth and elder monitors" }
    ],
    impact: [
      { label: "Peace agreements brokered", value: 4, unit: "accords", evidence: { type: "record", note: "PRDA peace committee register", sourceId: null } },
      { label: "Community members reached", value: 1800, unit: "people", evidence: { type: "observation", note: "Forum attendance records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["nasir-changkuoth"]
  },

  // 2. Nasir - Changkuoth
  {
    id: "nasir-changkuoth",
    status: "test",
    name: "Changkuoth",
    role: "Peacebuilding & Conflict Transformation Facilitator, Nasir",
    locationId: "nasir",
    programmeIds: ["peacebuilding"],
    sectors: ["protection"],
    headline: "Uniting divided border communities through grassroots peace dialogues in Nasir County.",
    portrait: { src: "media/people/nasir-cva.jpg", alt: "Changkuoth in Nasir", credit: "Photo: PRDA Social Cohesion" },
    video: null,
    quote: "When elders, women, and youth sit under the peace tree together, weapons are laid down.",
    chapters: {
      before: "Escalating border tensions and displacement had eroded trust between clans in Nasir, stranding families on opposite banks of the river without safe transit or shared trade.",
      supported: "Changkuoth facilitated trauma-healing workshops and cross-border reconciliation dialogues with local chiefs, supported by PRDA's conflict transformation team.",
      changed: "Joint community markets have resumed, and local leaders have established a rapid communication network that diffuses tensions before violence erupts."
    },
    support: [
      { label: "Grassroots Dialogue Forums", detail: "Monthly community peace sessions in Luakpiny/Nasir" },
      { label: "Trauma-Informed Mediation", detail: "Trained 45 church and community leaders" }
    ],
    impact: [
      { label: "Cross-community forums held", value: 12, unit: "forums", evidence: { type: "record", note: "Programme field log", sourceId: null } },
      { label: "Disputes resolved peacefully", value: 28, unit: "cases", evidence: { type: "testimony", note: "Local chiefs committee records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["ulang-wicjual", "nasir-nyasunday"]
  },

  // 3. Nasir - Nyasunday
  {
    id: "nasir-nyasunday",
    status: "test",
    name: "Nyasunday",
    role: "GBV & Women's Protection Coordinator, Nasir",
    locationId: "nasir",
    programmeIds: ["gbv-protection"],
    sectors: ["protection"],
    headline: "Providing safe spaces, psychosocial counseling, and dignity for women and girls in Nasir.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Nyasunday, GBV coordinator in Nasir", credit: "Photo: PRDA Protection" },
    video: null,
    quote: "Every woman and girl deserves safety, dignity, and the freedom to speak without fear.",
    chapters: {
      before: "Women walking for firewood and water faced daily security risks, while survivors of violence had nowhere to turn for confidential medical or emotional support.",
      supported: "Under PRDA's GBV and Protection project, Nyasunday established a women-friendly safe space, organized dignity kit distributions, and set up a confidential referral network with local health posts.",
      changed: "Survivors now receive immediate compassionate care, legal guidance, and livelihood skills training that restores their self-reliance."
    },
    support: [
      { label: "Women and Girls Safe Space", detail: "Established community support centre in Nasir" },
      { label: "Dignity Kits & Counseling", detail: "Essential hygiene and psychosocial assistance" }
    ],
    impact: [
      { label: "Women and girls supported", value: 340, unit: "clients", evidence: { type: "record", note: "Confidential protection intake register", sourceId: null } },
      { label: "Dignity kits distributed", value: 500, unit: "kits", evidence: { type: "record", note: "Distribution log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["nasir-changkuoth"]
  },

  // 4. Pochalla - Okoth
  {
    id: "pochalla-okoth",
    status: "test",
    name: "Okoth",
    role: "Education Officer & Teacher Trainer, Pochalla",
    locationId: "pochalla",
    programmeIds: ["pochalla-integrated"],
    sectors: ["education"],
    headline: "Rehabilitating classrooms and supporting village teachers across Pochalla County.",
    portrait: { src: "media/people/ayod-school.jpg", alt: "Okoth supporting community education in Pochalla", credit: "Photo: PRDA Education" },
    video: null,
    quote: "A child who learns to read and write holds the key to lasting peace in our county.",
    chapters: {
      before: "Many primary schools in Pochalla lacked desks, books, and trained teachers, forcing classes under trees that had to cancel whenever the rainy season arrived.",
      supported: "Through the Pochalla Integrated Programme, Okoth supplied learning materials, rehabilitated roof structures, and ran accelerated pedagogy workshops for volunteer teachers.",
      changed: "School attendance, particularly among young girls, has surged, and children now study in safe, rainproof learning environments."
    },
    support: [
      { label: "School Rehabilitation", detail: "Classroom repair and learning supplies" },
      { label: "Teacher Mentorship", detail: "Pedagogical training for local instructors" }
    ],
    impact: [
      { label: "Pupils enrolled in supported schools", value: 720, unit: "children", evidence: { type: "record", note: "County education register", sourceId: null } },
      { label: "Teachers trained", value: 18, unit: "teachers", evidence: { type: "record", note: "Training attendance records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pochalla-omot", "pochalla-okony"]
  },

  // 5. Pochalla - Omot
  {
    id: "pochalla-omot",
    status: "test",
    name: "Omot",
    role: "WASH Officer & Water Technician, Pochalla",
    locationId: "pochalla",
    programmeIds: ["pochalla-integrated"],
    sectors: ["water"],
    headline: "Restoring community boreholes and training water management committees in Pochalla.",
    portrait: { src: "media/people/nyabol-water.jpg", alt: "Omot at a borehole in Pochalla", credit: "Photo: PRDA WASH" },
    video: null,
    quote: "Clean water flowing from a pump in the morning means our children do not drink from murky rivers.",
    chapters: {
      before: "Broken hand pumps forced families to trek hours to contaminated riverbanks, leading to recurring outbreaks of waterborne illness among young children.",
      supported: "Omot repaired non-functional hand pumps, installed sanitary concrete aprons, and trained women-led water management committees in routine pump maintenance.",
      changed: "Safe water is now accessible within minutes for hundreds of households, with spare parts and maintenance fees managed locally by the community."
    },
    support: [
      { label: "Borehole Rehabilitation", detail: "Restored deep-well hand pumps in Pochalla" },
      { label: "Water Committee Training", detail: "Trained local caretakers in mechanics and hygiene" }
    ],
    impact: [
      { label: "Boreholes restored", value: 8, unit: "boreholes", evidence: { type: "record", note: "WASH technical inspection log", sourceId: null } },
      { label: "Households with clean water", value: 650, unit: "households", evidence: { type: "survey", note: "Community water mapping", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pochalla-okoth", "pochalla-okony"]
  },

  // 6. Pochalla - Okony
  {
    id: "pochalla-okony",
    status: "test",
    name: "Okony",
    role: "Agricultural Extension Lead, Pochalla",
    locationId: "pochalla",
    programmeIds: ["pochalla-integrated"],
    sectors: ["food"],
    headline: "Distributing resilient seeds and training smallholder farmers along Pochalla's riverbanks.",
    portrait: { src: "media/people/ochan-farmer.jpg", alt: "Okony standing in green crops in Pochalla", credit: "Photo: PRDA Livelihoods" },
    video: null,
    quote: "When we store grain properly, the hungry gap between harvests disappears.",
    chapters: {
      before: "Unpredictable rainfall and post-harvest pest infestations regularly destroyed up to half of farmers' yields, leaving families dependent on emergency handouts.",
      supported: "Okony distributed high-yield sorghum, maize, and vegetable seeds, taught ox-ploughing techniques, and established community hermetic grain storage.",
      changed: "Farmers now produce surplus crops to sell at the local market, and post-harvest losses have dropped significantly."
    },
    support: [
      { label: "Quality Seed & Tools", detail: "Sorghum, cowpea, and hoe distribution" },
      { label: "Post-Harvest Storage", detail: "Pest-resistant grain storage training" }
    ],
    impact: [
      { label: "Farmers trained in resilient methods", value: 310, unit: "farmers", evidence: { type: "record", note: "Livelihoods programme log", sourceId: null } },
      { label: "Hectares brought into cultivation", value: 85, unit: "hectares", evidence: { type: "survey", note: "Field harvest assessment", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["pochalla-okoth", "pochalla-omot"]
  },

  // 7. Malakal - Martha
  {
    id: "malakal-martha",
    status: "test",
    name: "Martha",
    role: "Midwife, Malakal Maternity Facility",
    locationId: "malakal",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing life-saving obstetric care and safe deliveries in Malakal.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Martha, midwife in Malakal", credit: "Photo: PRDA Health" },
    video: null,
    quote: "No mother should lose her life while bringing forth new life.",
    chapters: {
      before: "In Malakal, displacement and damaged health facilities left hundreds of expectant mothers with no access to skilled birth attendants during labor.",
      supported: "Following her graduation from PRDA's midwifery training, Martha was deployed to Malakal's maternal facility equipped with clean delivery kits and neonatal resuscitation equipment.",
      changed: "Martha now oversees institutional deliveries, identifies complications early, and provides warm, continuous support to mothers in labour."
    },
    support: [
      { label: "Diploma in Midwifery", detail: "Graduated with full maternal care certification" },
      { label: "Facility Delivery Station", detail: "Equipped with sterile obstetric kits and solar lighting" }
    ],
    impact: [
      { label: "Births attended this year", value: 165, unit: "births", evidence: { type: "record", note: "Maternity register", sourceId: null } },
      { label: "Mothers receiving postnatal care", value: 210, unit: "mothers", evidence: { type: "record", note: "Clinic logbook", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["malakal-nyachangjwok"]
  },

  // 8. Malakal - Nyachangjwok
  {
    id: "malakal-nyachangjwok",
    status: "test",
    name: "Nyachangjwok",
    role: "Midwife & Antenatal Care Specialist, Malakal",
    locationId: "malakal",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Screening high-risk pregnancies and protecting newborns in Malakal.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Nyachangjwok, midwife in Malakal", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Catching maternal complications early transforms an emergency into a safe birth.",
    chapters: {
      before: "Many pregnant women arrived at the facility in advanced stages of obstructed labour or eclampsia because antenatal visits were not regularly conducted.",
      supported: "Nyachangjwok established a daily antenatal clinic with maternal blood pressure monitoring, fetal heartbeat checks, and malaria prevention during pregnancy.",
      changed: "Over 80% of pregnant women in her catchment area now attend four or more antenatal visits, significantly lowering perinatal mortality."
    },
    support: [
      { label: "Antenatal Screening Hub", detail: "Daily checkups with ultrasound and diagnostic tests" },
      { label: "Community Outreach", detail: "Door-to-door education on pregnancy danger signs" }
    ],
    impact: [
      { label: "Antenatal checkups conducted", value: 430, unit: "visits", evidence: { type: "record", note: "Antenatal clinic log", sourceId: null } },
      { label: "High-risk cases referred safely", value: 32, unit: "mothers", evidence: { type: "record", note: "Facility referral log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["malakal-martha"]
  },

  // 9. Renk - Nyapal
  {
    id: "renk-nyapal",
    status: "test",
    name: "Nyapal",
    role: "Midwife, Renk County Hospital",
    locationId: "renk",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Delivering emergency maternity care to returnees and host communities in Renk.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyapal, midwife in Renk", credit: "Photo: PRDA Health" },
    video: null,
    quote: "At this border transit point, we care for mothers who have travelled hundreds of miles on foot.",
    chapters: {
      before: "The sudden influx of returnees and refugees across the northern border overwhelmed local maternity wards, leaving exhausted pregnant women without beds or skilled attendants.",
      supported: "Deployed through PRDA's PHSI network, Nyapal established an emergency triage and delivery area at the Renk facility with essential maternal medicines.",
      changed: "Every displaced mother arriving in labour is received with skilled, compassionate midwifery care, regardless of the hour."
    },
    support: [
      { label: "Emergency Delivery Post", detail: "Triage and obstetric care for border returnees" },
      { label: "Neonatal Care Kits", detail: "Sterile cord care, warm blankets, and resuscitation" }
    ],
    impact: [
      { label: "Deliveries attended at border clinic", value: 190, unit: "births", evidence: { type: "record", note: "Transit hospital register", sourceId: null } },
      { label: "Newborns immunized at birth", value: 185, unit: "babies", evidence: { type: "record", note: "Vaccination log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["renk-nyaluak", "renk-rebecca"]
  },

  // 10. Renk - Nyaluak
  {
    id: "renk-nyaluak",
    status: "test",
    name: "Nyaluak",
    role: "Midwife & Maternal Health Supervisor, Renk",
    locationId: "renk",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Supervising facility deliveries and training clinical birth attendants in Renk.",
    portrait: { src: "media/people/phsi-training.jpg", alt: "Nyaluak, midwife supervisor in Renk", credit: "Photo: PRDA PHSI" },
    video: null,
    quote: "Quality maternal care is the right of every South Sudanese mother.",
    chapters: {
      before: "Rural health posts in Renk County lacked certified midwives, leading to high rates of postpartum hemorrhage handled by untrained traditional attendants.",
      supported: "Nyaluak conducts clinical mentoring rounds, training traditional birth attendants to recognize danger signs and promptly refer mothers to the hospital.",
      changed: "The referral pipeline has stabilized, and institutional deliveries in the county have more than doubled."
    },
    support: [
      { label: "Midwifery Clinical Mentorship", detail: "Supervised 12 health facility birth attendants" },
      { label: "Emergency Obstetric Protocol", detail: "Standardized life-saving procedures for hemorrhage" }
    ],
    impact: [
      { label: "Health workers mentored", value: 14, unit: "attendants", evidence: { type: "record", note: "Supervision report", sourceId: null } },
      { label: "Postpartum complications prevented", value: 45, unit: "cases", evidence: { type: "testimony", note: "Clinical review meeting", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["renk-nyapal", "renk-rebecca"]
  },

  // 11. Renk - Rebecca
  {
    id: "renk-rebecca",
    status: "test",
    name: "Rebecca",
    role: "Clinical Nurse, Renk",
    locationId: "renk",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Managing pediatric triage and neonatal recovery in Renk health post.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Rebecca, nurse in Renk", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Seeing fragile newborns stabilize and smile brings peace to their mothers' hearts.",
    chapters: {
      before: "Many babies born on transit routes were severely malnourished, hypothermic, and suffering from respiratory distress without pediatric nursing support.",
      supported: "Rebecca established a dedicated neonatal stabilization corner with kangaroo-mother care blankets, clean oxygen, and therapeutic feeding.",
      changed: "Premature and distressed newborns who previously had low survival rates now receive immediate stabilization and recover safely."
    },
    support: [
      { label: "Neonatal Stabilization Unit", detail: "Specialized warm nursery care and monitoring" },
      { label: "Therapeutic Infant Feeding", detail: "Nutrition support for vulnerable infants" }
    ],
    impact: [
      { label: "Infants treated and stabilized", value: 140, unit: "infants", evidence: { type: "record", note: "Pediatric ward log", sourceId: null } },
      { label: "Mothers trained in infant care", value: 220, unit: "mothers", evidence: { type: "observation", note: "Maternal nutrition workshops", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["renk-nyapal", "renk-nyaluak"]
  },

  // 12. Fangak - Regina
  {
    id: "fangak-regina",
    status: "test",
    name: "Regina",
    role: "Midwife & Health In-Charge, Fangak",
    locationId: "fangak",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Reaching flood-isolated payams by canoe to deliver maternal healthcare in Fangak.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Regina, midwife in Fangak", credit: "Photo: PRDA Midwifery" },
    video: null,
    quote: "Even when floodwaters surround us, a mother in labour cannot wait.",
    chapters: {
      before: "Extensive flooding submerged roadways across Fangak, leaving islands of stranded villages completely isolated from the nearest dispensary.",
      supported: "Regina equipped a mobile health canoe with delivery kits, waterproof drug containers, and solar lanterns, navigating swampland to reach mothers in labor.",
      changed: "Remote villages now receive scheduled prenatal visits by water, and emergency boat evacuations are coordinated smoothly."
    },
    support: [
      { label: "Mobile Boat Clinic", detail: "Waterborne maternal outreach across Fangak swamps" },
      { label: "Waterproof Midwifery Packs", detail: "Sterile kits and essential uterotonic medicines" }
    ],
    impact: [
      { label: "Deliveries conducted in remote sites", value: 110, unit: "births", evidence: { type: "record", note: "Mobile clinic log", sourceId: null } },
      { label: "Isolated villages reached by canoe", value: 16, unit: "villages", evidence: { type: "record", note: "Community patrol book", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 13. Yei - Sunday
  {
    id: "yei-sunday",
    status: "test",
    name: "Sunday",
    role: "Midwife, Yei Civil Hospital Maternity Unit",
    locationId: "yei",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Promoting safe hospital deliveries and antenatal checkups in Yei River County.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Sunday, midwife in Yei", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Safe deliveries restore vitality and confidence to our community in Yei.",
    chapters: {
      before: "Prolonged insecurity in the Equatorias left many clinics shuttered, forcing mothers to deliver unassisted in rural homesteads with high maternal mortality.",
      supported: "Sunday joined the reopened maternity ward at Yei Hospital after finishing her training, providing respectful maternity care, maternal vaccines, and postnatal checkups.",
      changed: "Families have returned to the hospital with trust, and maternal survival rates in the municipality have reached their highest level in years."
    },
    support: [
      { label: "Hospital Maternity Staffing", detail: "Skilled 24/7 labor and delivery management" },
      { label: "Postnatal Family Care", detail: "Newborn immunization and maternal nutrition guidance" }
    ],
    impact: [
      { label: "Deliveries managed safely", value: 175, unit: "births", evidence: { type: "record", note: "Yei Civil Hospital maternity book", sourceId: null } },
      { label: "Women attending family wellness sessions", value: 290, unit: "women", evidence: { type: "record", note: "Outreach attendance", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["nimule-deborah"]
  },

  // 14. Nimule - Deborah
  {
    id: "nimule-deborah",
    status: "test",
    name: "Deborah",
    role: "Midwife, Nimule Hospital Maternity Ward",
    locationId: "nimule",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing round-the-clock emergency obstetric care along the southern corridor.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Deborah, midwife in Nimule", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Our doors are always open for any mother in need of skilled hands.",
    chapters: {
      before: "As a major transit corridor, Nimule's health facilities experienced surging caseloads with frequent night emergencies and inadequate staff on duty.",
      supported: "With PRDA's support, Deborah helped establish a 24-hour shift roster at Nimule Hospital with emergency blood transfusion readiness and newborn care.",
      changed: "Every mother arriving with complications receives immediate clinical assessment, averting preventable tragedies."
    },
    support: [
      { label: "24-Hour Obstetric Care", detail: "Uninterrupted emergency maternal services" },
      { label: "Sterile Instrument Packs", detail: "Autoclaved delivery tools and infection prevention" }
    ],
    impact: [
      { label: "Deliveries attended in hospital", value: 215, unit: "births", evidence: { type: "record", note: "Hospital maternity ward log", sourceId: null } },
      { label: "Complicated labors stabilized", value: 38, unit: "mothers", evidence: { type: "record", note: "Emergency obstetric log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["yei-sunday"]
  },

  // 15. Kakuma - Cecilia
  {
    id: "kakuma-cecilia",
    status: "test",
    name: "Cecilia",
    role: "Midwife & Community Healthcare Specialist, Cross-Border Hub",
    locationId: "kakuma",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Supporting displaced mothers and continuing clinical healthcare outreach.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Cecilia, midwife in Kakuma", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Wherever our people are, skilled healthcare must walk alongside them.",
    chapters: {
      before: "South Sudanese midwifery students and refugee families relocated to Kakuma faced immense displacement hurdles, language barriers, and fragmented healthcare.",
      supported: "Cecilia coordinated peer midwifery study groups and community health education sessions, keeping maternal care practices sharp and serving vulnerable mothers.",
      changed: "Dozens of midwives completed their clinical credentials and continue to provide care both in border areas and upon return to South Sudan."
    },
    support: [
      { label: "Cross-Border Midwifery Cohort", detail: "Clinical training and peer practice support" },
      { label: "Community Health Counseling", detail: "Maternal nutrition and safe motherhood workshops" }
    ],
    impact: [
      { label: "Displaced mothers supported with antenatal care", value: 180, unit: "mothers", evidence: { type: "record", note: "Community health log", sourceId: null } },
      { label: "Midwifery trainees mentored", value: 25, unit: "midwives", evidence: { type: "record", note: "Cohort attendance roster", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 16. Rubkona - Mary
  {
    id: "rubkona-mary",
    status: "test",
    name: "Mary",
    role: "Community Midwife, Rubkona PHCC",
    locationId: "rubkona",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Providing compassionate antenatal and delivery care in flood-affected Rubkona.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Mary, midwife in Rubkona", credit: "Photo: PRDA Health" },
    video: null,
    quote: "We bring care right to our mothers' doorsteps across the dikes.",
    chapters: {
      before: "Unprecedented multi-year flooding around Rubkona and Bentiu forced thousands into crowded dikes where access to basic delivery beds was nearly non-existent.",
      supported: "Mary conducted antenatal visits within the displacement camps and staffed the delivery room at Rubkona Primary Health Care Centre with clean solar lighting.",
      changed: "Expectant mothers now have a safe, clean, flood-free delivery space staffed day and night by trained midwives."
    },
    support: [
      { label: "Clean Delivery Station", detail: "Elevated, flood-protected delivery room" },
      { label: "Antenatal Dike Outreach", detail: "Mobile checkups for families residing on dikes" }
    ],
    impact: [
      { label: "Safe deliveries on protected ward", value: 205, unit: "births", evidence: { type: "record", note: "Rubkona PHCC delivery log", sourceId: null } },
      { label: "High-risk mothers monitored on dikes", value: 95, unit: "mothers", evidence: { type: "record", note: "Outreach card index", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["rubkona-veronica"]
  },

  // 17. Rubkona - Veronica
  {
    id: "rubkona-veronica",
    status: "test",
    name: "Veronica",
    role: "Midwife & Newborn Care Specialist, Rubkona",
    locationId: "rubkona",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Safeguarding mother and child during high-risk deliveries in Rubkona.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Veronica, midwife in Rubkona", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Every successful birth strengthens the spirit of Unity State.",
    chapters: {
      before: "Complications such as prolonged labor or fetal distress frequently led to tragic outcomes due to the delay in reaching secondary surgical facilities.",
      supported: "Veronica received specialized training in emergency obstetric life support, enabling her to manage breech births, post-partum bleeding, and infant asphyxia.",
      changed: "Emergency deliveries are stabilized immediately, and survival rates for both mothers and newborns have risen significantly."
    },
    support: [
      { label: "Emergency Obstetric Training", detail: "Advanced neonatal resuscitation and hemorrhage management" },
      { label: "Vital Signs Monitoring", detail: "Fetal Doppler monitors and infant warmers" }
    ],
    impact: [
      { label: "Complicated deliveries safely resolved", value: 42, unit: "births", evidence: { type: "record", note: "Complications register", sourceId: null } },
      { label: "Newborns resuscitated successfully", value: 19, unit: "babies", evidence: { type: "record", note: "Neonatal register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["rubkona-mary"]
  },

  // 18. Pibor - Hannah (Hannah Korok!)
  {
    id: "pibor-hannah",
    status: "test",
    name: "Hannah",
    role: "Midwife, Pibor Health Centre",
    locationId: "pibor",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "A dedicated PHSI graduate providing skilled maternal care in remote Pibor.",
    portrait: { src: "media/people/hannah-korok.jpg", alt: "Hannah Korok, midwife in Pibor", credit: "Photo: PRDA PHSI" },
    video: null,
    quote: "When a trained midwife is present, fear is replaced with confidence and life.",
    chapters: {
      before: "In Greater Pibor, chronic isolation, seasonal flooding, and inter-communal clashes left many pregnant women with no medical facility within days of walking.",
      supported: "After completing her diploma at the Presbyterian Health Science Institute, Hannah returned to Pibor, providing compassionate bedside care, prenatal testing, and clean delivery kits.",
      changed: "Expectant mothers in Pibor now seek out Hannah at the clinic early in pregnancy, knowing she provides gentle, skilled, and life-saving care."
    },
    support: [
      { label: "Midwifery Diploma at PHSI", detail: "Comprehensive professional training in Juba" },
      { label: "Clinical Placement in Pibor", detail: "Delivering maternal health services in remote health centre" }
    ],
    impact: [
      { label: "Deliveries attended in Pibor", value: 145, unit: "births", evidence: { type: "record", note: "Pibor health facility register", sourceId: null } },
      { label: "Mothers attending antenatal care", value: 280, unit: "mothers", evidence: { type: "record", note: "Antenatal records", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 19. Rumbek - Abuk
  {
    id: "rumbek-abuk",
    status: "test",
    name: "Abuk",
    role: "Midwife, Rumbek Maternity Wing",
    locationId: "rumbek",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Leading maternal health checkups and safe child delivery in Rumbek Centre.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Abuk, midwife in Rumbek", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Encouraging facility deliveries saves lives and builds healthy families.",
    chapters: {
      before: "Cultural hesitations and long distances to clinics kept home delivery rates high in Lakes State, with preventable infections claiming many newborn lives.",
      supported: "Abuk partnered with local women's groups and church leaders in Rumbek, dispelling fears and providing respectful, community-centred maternal care at the hospital.",
      changed: "Facility deliveries have risen sharply, and traditional birth attendants now actively escort women to Abuk's ward."
    },
    support: [
      { label: "Community Delivery Facility", detail: "Well-equipped maternity room at Rumbek Centre" },
      { label: "Women's Health Advocacy", detail: "Community sessions on maternal nutrition and hygiene" }
    ],
    impact: [
      { label: "Hospital deliveries conducted", value: 185, unit: "births", evidence: { type: "record", note: "Rumbek maternity log", sourceId: null } },
      { label: "Community mothers reached with health education", value: 350, unit: "mothers", evidence: { type: "observation", note: "Health talk logs", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: []
  },

  // 20. Juba - Sunday
  {
    id: "juba-sunday",
    status: "test",
    name: "Sunday",
    role: "Senior Midwife & PHSI Clinical Instructor, Juba",
    locationId: "juba",
    programmeIds: ["phsi"],
    sectors: ["health", "education"],
    headline: "Training South Sudan's future midwives at the Presbyterian Health Science Institute.",
    portrait: { src: "media/people/phsi-training.jpg", alt: "Sunday, clinical instructor in Juba", credit: "Photo: PRDA PHSI" },
    video: null,
    quote: "Teaching our students the clinical discipline of midwifery changes our entire country.",
    chapters: {
      before: "South Sudan suffers from one of the highest maternal mortality ratios globally, driven by a critical shortage of qualified midwifery educators.",
      supported: "Sunday leads classroom theory and clinical simulation labs at the PHSI institute in Juba, training cohorts of young women and men from every state.",
      changed: "Dozens of certified midwives graduate each year and deploy to underserved hospitals and rural clinics across the country."
    },
    support: [
      { label: "PHSI Clinical Instruction", detail: "Classroom and practical simulation training" },
      { label: "Ward Practicum Supervision", detail: "Hands-on supervision at Juba Teaching Hospital" }
    ],
    impact: [
      { label: "Midwifery students graduated and deployed", value: 55, unit: "graduates", evidence: { type: "record", note: "PHSI academic register", sourceId: null } },
      { label: "Clinical training modules conducted", value: 24, unit: "modules", evidence: { type: "record", note: "Curriculum schedule", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-nyakuoth", "juba-phsi-graduate"]
  },

  // 21. Juba - Nyakuoth
  {
    id: "juba-nyakuoth",
    status: "test",
    name: "Nyakuoth",
    role: "Midwife & Maternal Health Mentor, Juba",
    locationId: "juba",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Mentoring midwifery interns and conducting hospital deliveries in Juba.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyakuoth, midwife in Juba", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Midwifery is about gentle compassion paired with unwavering medical readiness.",
    chapters: {
      before: "New graduates often faced overwhelming patient loads and emergency cases without senior clinical mentoring upon entering busy hospital wards.",
      supported: "Nyakuoth provides bedside mentorship for PHSI interns in Juba, teaching advanced fetal monitoring, sterile procedures, and empathetic bedside communication.",
      changed: "Junior midwives gain clinical competence rapidly, ensuring that every mother receives dignified, high-standard obstetric care."
    },
    support: [
      { label: "Bedside Clinical Mentorship", detail: "One-on-one coaching for midwifery interns" },
      { label: "Labor Ward Management", detail: "Overseeing high-volume urban maternity care" }
    ],
    impact: [
      { label: "Deliveries supervised", value: 240, unit: "births", evidence: { type: "record", note: "Clinical supervisor log", sourceId: null } },
      { label: "Interns mentored to graduation", value: 20, unit: "interns", evidence: { type: "testimony", note: "Internship evaluation", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["juba-sunday", "juba-phsi-graduate"]
  },

  // 22. Chuil, Jonglei - Nyaduop
  {
    id: "chuil-nyaduop",
    status: "test",
    name: "Nyaduop",
    role: "Senior Midwife, Chuil Primary Health Care Centre",
    locationId: "chuil",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Leading the frontline maternity team in Chuil, Jonglei amidst humanitarian displacement.",
    portrait: { src: "media/people/nyakim-midwife.jpg", alt: "Nyaduop, midwife in Chuil", credit: "Photo: PRDA Health" },
    video: null,
    quote: "In times of displacement, bringing healthy new life into our community brings hope.",
    chapters: {
      before: "Severe fighting and flooding in northern Jonglei caused thousands of families to flee into Chuil, where medical facilities were sparse and unequipped for maternal care.",
      supported: "As senior midwife, Nyaduop organized a dedicated maternity wing at Chuil PHCC, stocking clean delivery supplies and training a team of midwives and nurses.",
      changed: "Mothers arriving in Chuil now have round-the-clock access to skilled delivery care and emergency neonatal support."
    },
    support: [
      { label: "Maternity Clinic Leadership", detail: "Supervising 5 midwives and nurses in Chuil PHCC" },
      { label: "Emergency Delivery Packs", detail: "Clean birth supplies and solar lighting" }
    ],
    impact: [
      { label: "Deliveries conducted in Chuil", value: 160, unit: "births", evidence: { type: "record", note: "Chuil PHCC maternity log", sourceId: null } },
      { label: "Displaced mothers supported", value: 230, unit: "mothers", evidence: { type: "record", note: "Clinic attendance register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["chuil-nyamouch", "chuil-nyakuoth", "chuil-nyajuok", "chuil-nyanguon"]
  },

  // 23. Chuil, Jonglei - Nyamouch
  {
    id: "chuil-nyamouch",
    status: "test",
    name: "Nyamouch",
    role: "Midwife, Chuil PHCC",
    locationId: "chuil",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Conducting safe deliveries and antenatal checkups for families arriving in Chuil.",
    portrait: { src: "media/people/achol-nurse.jpg", alt: "Nyamouch, midwife in Chuil", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Mothers walk long distances to reach our clinic; we greet them with life-saving care.",
    chapters: {
      before: "Exhausted pregnant women walked for days through marshes to escape conflict, arriving in Chuil dehydrated and in urgent need of antenatal evaluation.",
      supported: "Nyamouch conducts comprehensive prenatal checkups, treats maternal malaria, and stays by mothers' bedsides throughout their labor.",
      changed: "Maternal complications are identified early, and babies are born safely into warm, sterile surroundings."
    },
    support: [
      { label: "Antenatal Health Clinic", detail: "Routine blood pressure, hemoglobin, and fetal checks" },
      { label: "Safe Delivery Attendance", detail: "Sterile delivery procedures and immediate skin-to-skin contact" }
    ],
    impact: [
      { label: "Antenatal visits conducted", value: 310, unit: "visits", evidence: { type: "record", note: "Antenatal register", sourceId: null } },
      { label: "Deliveries attended", value: 125, unit: "births", evidence: { type: "record", note: "Delivery register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["chuil-nyaduop", "chuil-nyakuoth", "chuil-nyajuok", "chuil-nyanguon"]
  },

  // 24. Chuil, Jonglei - Nyakuoth
  {
    id: "chuil-nyakuoth",
    status: "test",
    name: "Nyakuoth",
    role: "Registered Nurse, Chuil PHCC",
    locationId: "chuil",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Treating acute pediatric illnesses, malaria, and infections in Chuil.",
    portrait: { src: "media/people/gatluak-officer.jpg", alt: "Nyakuoth, nurse in Chuil", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Providing medical care in remote Jonglei is challenging, but our community depends on us.",
    chapters: {
      before: "Malaria, acute respiratory infections, and severe diarrhea were claiming the lives of young children living in displacement camps around Chuil.",
      supported: "Nyakuoth established a pediatric triage area, administering rapid diagnostic tests, IV fluids, and essential antibiotic treatments.",
      changed: "Childhood mortality at the centre dropped dramatically, with hundreds of critically ill children recovering completely each month."
    },
    support: [
      { label: "Pediatric Emergency Triage", detail: "Rapid diagnostics and essential medicines" },
      { label: "Inpatient Ward Management", detail: "Continuous care for sick children and mothers" }
    ],
    impact: [
      { label: "Children treated for malaria and illness", value: 580, unit: "patients", evidence: { type: "record", note: "Pediatric outpatient log", sourceId: null } },
      { label: "Severe cases stabilized", value: 65, unit: "children", evidence: { type: "record", note: "Inpatient register", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["chuil-nyaduop", "chuil-nyamouch", "chuil-nyajuok", "chuil-nyanguon"]
  },

  // 25. Chuil, Jonglei - Nyajuok
  {
    id: "chuil-nyajuok",
    status: "test",
    name: "Nyajuok",
    role: "Community Midwife, Chuil Outreach",
    locationId: "chuil",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Reaching isolated villages around Chuil with essential maternal and newborn health packs.",
    portrait: { src: "media/people/nyaduoth-mother.jpg", alt: "Nyajuok, midwife in Chuil", credit: "Photo: PRDA Health" },
    video: null,
    quote: "Distance should never be a death sentence for an expectant mother.",
    chapters: {
      before: "Families in outer settlements surrounding Chuil could not cross seasonal floodwaters to visit the health centre, leading to unsupervised home births.",
      supported: "Nyajuok leads outreach patrols, distributing clean delivery kits, checking blood pressure, and educating village elders on emergency transport plans.",
      changed: "No village in the payam is left unvisited, and mothers are transported to the clinic at the earliest sign of labor."
    },
    support: [
      { label: "Mobile Maternity Patrols", detail: "Field visits to outer displacement settlements" },
      { label: "Clean Delivery Kits", detail: "Supplying expectant mothers with sterile delivery materials" }
    ],
    impact: [
      { label: "Clean birth kits distributed", value: 175, unit: "kits", evidence: { type: "record", note: "Outreach distribution log", sourceId: null } },
      { label: "Mothers referred safely to PHCC", value: 48, unit: "mothers", evidence: { type: "record", note: "Referral record", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["chuil-nyaduop", "chuil-nyamouch", "chuil-nyakuoth", "chuil-nyanguon"]
  },

  // 26. Chuil, Jonglei - Nyanguon
  {
    id: "chuil-nyanguon",
    status: "test",
    name: "Nyanguon",
    role: "Clinical Nurse & Immunization Lead, Chuil",
    locationId: "chuil",
    programmeIds: ["phsi"],
    sectors: ["health"],
    headline: "Vaccinating children and conducting health screenings for displaced populations in Chuil.",
    portrait: { src: "media/people/phsi-students.jpg", alt: "Nyanguon, nurse in Chuil", credit: "Photo: PRDA PHSI" },
    video: null,
    quote: "Every vaccinated child is a future protected against preventable illness.",
    chapters: {
      before: "Displaced infants arriving from conflict areas had missed routine immunizations, creating a dangerous risk of measles and polio outbreaks in Chuil.",
      supported: "Nyanguon manages the cold chain vaccine refrigerator and organizes daily immunization stations for infants and pregnant women.",
      changed: "Over 90% of eligible children in the catchment area are now fully immunized against common childhood diseases."
    },
    support: [
      { label: "Solar Vaccine Cold Chain", detail: "Maintaining vaccine potency and daily supply" },
      { label: "Routine Immunization Sessions", detail: "Vaccinating against measles, polio, and tetanus" }
    ],
    impact: [
      { label: "Children vaccinated", value: 720, unit: "children", evidence: { type: "record", note: "Cold chain immunization log", sourceId: null } },
      { label: "Mothers vaccinated against tetanus", value: 260, unit: "women", evidence: { type: "record", note: "EPI log", sourceId: null } }
    ],
    consent: { obtained: false, date: null, scope: null },
    recordedBy: "Test data",
    recordedOn: null,
    relatedStoryIds: ["chuil-nyaduop", "chuil-nyamouch", "chuil-nyakuoth", "chuil-nyajuok"]
  }
];

const combined = [...existing, ...newPersonas];
writeFileSync('./src/data/content/test-personas.json', JSON.stringify(combined, null, 2) + '\n');
console.log(`Successfully wrote ${combined.length} personas to test-personas.json`);
