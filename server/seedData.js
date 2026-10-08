const bcrypt = require('bcryptjs');
const db = require('./db');

function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('Seeding KnowBefore database with clinical and editorial content...');

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const userHash = bcrypt.hashSync('user123', salt);

  // Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, avatar_color, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('admin@knowbefore.org', adminHash, 'Dr. Aris Thorne', 'admin', '#2A5C43', 'Editorial Director & Preventive Medicine Lead');
  insertUser.run('clara@example.com', userHash, 'Clara Henderson', 'user', '#C85A32', 'Active health learner & community advocate');

  // Diseases
  const insertDisease = db.prepare(`
    INSERT INTO diseases (slug, name, category, headline, overview, anatomical_system, prevalence, key_stat, hero_quote, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const diseases = [
    {
      slug: 'hypertension',
      name: 'Hypertension',
      category: 'Cardiovascular',
      headline: 'The Silent Vascular Pressure That Gives No Daily Warning',
      overview: 'Hypertension occurs when the long-term force of the blood against your arterial walls is high enough that it may eventually cause health problems, such as heart disease and stroke. It is frequently called the silent surge because billions of people live with elevated vascular resistance for decades without experiencing a single acute symptom until end-organ damage begins.',
      anatomical_system: 'Circulatory & Vascular System',
      prevalence: '1 in 3 adults globally (~1.28 billion people)',
      key_stat: '46% of adults with hypertension are unaware they have the condition',
      hero_quote: 'Blood pressure does not hurt, itch, or warn you. It leaves arterial micro-scars in silence until tested.',
      is_featured: 1
    },
    {
      slug: 'type-2-diabetes',
      name: 'Type 2 Diabetes & Pre-Diabetes',
      category: 'Metabolic & Endocrine',
      headline: 'Progressive Insulin Resistance and Cellular Energetics',
      overview: 'Type 2 Diabetes is an impairment in the way the body regulates and uses sugar (glucose) as a fuel. In early pre-diabetes, the pancreas produces compensatory surges of insulin to overcome peripheral cellular resistance. Over years, beta cells exhaust their functional reserve, resulting in chronic hyperglycemia and microvascular degradation.',
      anatomical_system: 'Endocrine & Metabolic System',
      prevalence: 'Over 537 million adults globally, projected to reach 783 million by 2045',
      key_stat: 'Up to 80% of pre-diabetes progression can be prevented through structured lifestyle intervention',
      hero_quote: 'Pre-diabetes is not a fate; it is the single most valuable window of biological opportunity.',
      is_featured: 1
    },
    {
      slug: 'coronary-heart-disease',
      name: 'Coronary Artery Disease',
      category: 'Cardiovascular',
      headline: 'Sub-Endothelial Plaque Accumulation and Myocardial Perfusion',
      overview: 'Coronary artery disease (CAD) develops when the major blood vessels supplying oxygen-rich blood to the myocardium become narrowed by atheromatous plaques. Atherosclerosis begins in early adulthood as endothelial micro-injuries capture oxidized LDL particles, triggering a chronic inflammatory cascade that slowly restricts lumen diameter.',
      anatomical_system: 'Cardiovascular & Myocardial System',
      prevalence: 'Leading single cause of mortality worldwide (~17.9 million annual deaths from CVD)',
      key_stat: 'Over 50% of first acute coronary events occur in individuals with no prior recognized symptoms',
      hero_quote: 'Arteries do not clog overnight. Plaque builds cell by cell over thirty years of unnoticed inflammation.',
      is_featured: 0
    },
    {
      slug: 'pcos',
      name: 'Polycystic Ovary Syndrome (PCOS)',
      category: 'Women\'s Health & Endocrine',
      headline: 'A Complex Neuro-Endocrine and Metabolic Condition',
      overview: 'PCOS is far more than a reproductive disorder; it is a systemic metabolic-endocrine condition characterized by androgen excess, ovulatory dysfunction, and hyperinsulinemia. Because symptoms span dermatological, metabolic, psychological, and reproductive domains, diagnosis is frequently delayed by an average of two to three years.',
      anatomical_system: 'Endocrine & Reproductive System',
      prevalence: 'Affects 8% to 13% of women of reproductive age worldwide',
      key_stat: 'Up to 70% of affected women remain undiagnosed in primary care settings',
      hero_quote: 'PCOS is not an ovary problem; it is a total-body endocrine signaling imbalance that responds to targeted metabolic care.',
      is_featured: 1
    },
    {
      slug: 'bronchial-asthma',
      name: 'Bronchial Asthma',
      category: 'Respiratory',
      headline: 'Chronic Airway Hyper-responsiveness and Variable Obstruction',
      overview: 'Asthma is a heterogeneous chronic inflammatory disease of the conducting airways characterized by episodic bronchospasm, mucosal edema, and mucus hypersecretion. Triggers range from environmental allergens and cold air to respiratory viral infections and exercise.',
      anatomical_system: 'Pulmonary & Conducting Airways',
      prevalence: 'Over 260 million people globally',
      key_stat: 'Asthma is responsible for over 455,000 deaths annually, the vast majority preventable with controller therapies',
      hero_quote: 'A dry nocturnal cough is often asthma masquerading as a stubborn cold.',
      is_featured: 0
    },
    {
      slug: 'tuberculosis',
      name: 'Tuberculosis (TB)',
      category: 'Infectious & Respiratory',
      headline: 'Mycobacterial Infection and Immune Granuloma Dynamics',
      overview: 'Tuberculosis is an airborne infectious disease caused by Mycobacterium tuberculosis that primarily infects pulmonary parenchyma but can disseminate systemically. One quarter of the world\'s population carries latent TB infection, where immune granulomas contain bacilli without clinical illness, requiring vigilant recognition of reactivation warning signs.',
      anatomical_system: 'Pulmonary & Immune System',
      prevalence: '10.6 million new cases diagnosed globally each year',
      key_stat: 'Curable in over 85% of cases with timely diagnosis and standard 6-month antimycobacterial regimens',
      hero_quote: 'A cough lingering past three weeks is not normal recovery; it is an immune signal requiring chest radiography.',
      is_featured: 0
    },
    {
      slug: 'dengue-fever',
      name: 'Dengue Fever',
      category: 'Infectious & Vector-Borne',
      headline: 'Arboviral Infection and Critical Phase Vascular Permeability',
      overview: 'Dengue is a mosquito-borne viral infection caused by four distinct flavivirus serotypes (DENV-1 through 4) transmitted primarily by female Aedes aegypti mosquitoes. The crucial clinical challenge is recognizing the transition from the febrile phase to the critical phase (days 3–7), where capillary leak syndrome can trigger severe hypovolemic shock.',
      anatomical_system: 'Hematologic & Vascular Endothelium',
      prevalence: '390 million infections per year across 100+ countries',
      key_stat: 'Mortality drops below 1% when plasma leakage warning signs are identified and treated with timely fluid management',
      hero_quote: 'The most dangerous period of dengue begins when the high fever finally breaks.',
      is_featured: 0
    },
    {
      slug: 'colorectal-cancer',
      name: 'Colorectal Cancer (Early Screening)',
      category: 'Oncology & Screening',
      headline: 'The Adenoma-to-Carcinoma Sequence and Timely Detection',
      overview: 'Colorectal cancer almost universally originates from benign pre-cancerous adenomatous polyps along the mucosal lining of the colon or rectum. This adenoma-to-carcinoma progression typically takes 10 to 15 years, presenting a monumental window where screening can intercept and remove lesions before malignant transformation occurs.',
      anatomical_system: 'Gastrointestinal & Colorectal Tract',
      prevalence: 'Third most common cancer worldwide (~1.9 million annual cases)',
      key_stat: 'Over 90% 5-year survival rate when detected at localized early stages compared to 14% at distant stages',
      hero_quote: 'Colorectal screening does not just find cancer early; it stops cancer from ever developing by removing polyps.',
      is_featured: 0
    },
    {
      slug: 'mental-health-depression',
      name: 'Depressive & Anxiety Disorders',
      category: 'Mental & Cognitive Health',
      headline: 'Neuro-affective Dysregulation and Neuroplastic Recovery',
      overview: 'Clinical depression and generalized anxiety disorders are complex neurobiological conditions involving dysregulation of monoaminergic neurotransmission, neuroendocrine stress axes (HPA axis), and neuroplastic connectivity in prefrontal-limbic circuits. They are biological health conditions, not character flaws or temporary mood slumps.',
      anatomical_system: 'Central Nervous & Neuroendocrine System',
      prevalence: 'Affects roughly 280 million people globally (5% of adults)',
      key_stat: 'Over 75% of people in low- and middle-income regions receive no clinical treatment despite high disability burden',
      hero_quote: 'Depression changes brain physiology and energy metabolism; recovery requires evidence-based psychological and medical care.',
      is_featured: 0
    },
    {
      slug: 'chronic-kidney-disease',
      name: 'Chronic Kidney Disease (CKD)',
      category: 'Renal & Metabolic',
      headline: 'Silent Nephron Depletion and Glomerular Filtration Decline',
      overview: 'Chronic Kidney Disease represents progressive, irreversible loss of renal function lasting longer than three months. The kidneys contain approximately 2 million microscopic filtering units called nephrons. As systemic hypertension or diabetes damages glomerular capillaries, surviving nephrons hyperfilter to compensate until significant functional capacity is permanently lost.',
      anatomical_system: 'Renal & Filtration System',
      prevalence: 'Over 850 million individuals worldwide (10% of global population)',
      key_stat: '90% of individuals with early stage CKD have zero symptoms and do not know their kidneys are impaired',
      hero_quote: 'Kidney damage whispers through subtle urine protein long before swollen ankles announce advanced disease.',
      is_featured: 0
    }
  ];

  diseases.forEach(d => {
    insertDisease.run(
      d.slug, d.name, d.category, d.headline, d.overview,
      d.anatomical_system, d.prevalence, d.key_stat, d.hero_quote, d.is_featured
    );
  });

  // Fetch disease IDs map
  const diseaseRows = db.prepare('SELECT id, slug FROM diseases').all();
  const diseaseMap = {};
  diseaseRows.forEach(row => { diseaseMap[row.slug] = row.id; });

  // Warning Signs
  const insertWarningSign = db.prepare(`
    INSERT INTO warning_signs (disease_id, sign_name, category, stage, description, biological_mechanism, clinical_significance, what_to_do, is_red_flag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const warningSigns = [
    // Hypertension
    {
      slug: 'hypertension',
      name: 'Occipital Morning Headaches',
      category: 'pain',
      stage: 'progressive',
      description: 'Dull, throbbing headache typically localized to the back of the head upon waking that gradually dissipates over a few hours.',
      mechanism: 'Severely elevated intracranial capillary perfusion pressure causing subtle meningeal vascular distension during sleep.',
      significance: 'Usually only emerges in severe hypertension (systolic > 180 mmHg) or rapid pressure surges; does NOT occur in mild-to-moderate elevation.',
      action: 'Check blood pressure with a validated upper-arm automated cuff. Seek immediate urgent medical evaluation if BP > 180/120.',
      red_flag: 0
    },
    {
      slug: 'hypertension',
      name: 'Exertional Dyspnea (Shortness of Breath)',
      category: 'cardiovascular',
      stage: 'progressive',
      description: 'Disproportionate breathlessness when climbing a single flight of stairs or walking briskly on level ground.',
      mechanism: 'Increased left ventricular afterload causes elevated filling pressures and secondary pulmonary venous congestion.',
      significance: 'Signals potential left ventricular hypertrophy or diastolic dysfunction requiring cardiac evaluation.',
      action: 'Schedule a thorough clinical evaluation with resting blood pressure measurement and electrocardiogram (ECG).',
      red_flag: 0
    },
    {
      slug: 'hypertension',
      name: 'Visual Disturbances / Blurry Vision',
      category: 'physical',
      stage: 'emergency',
      description: 'Sudden onset of blurring, shimmering scotomas, or double vision accompanied by elevated pressure reading.',
      mechanism: 'Acute arteriolar spasm or retinal microvascular extravasation (hypertensive retinopathy / papilledema).',
      significance: 'High likelihood of acute hypertensive crisis with end-organ target retinal damage.',
      action: 'Immediate emergency medical care (Emergency Department); do not wait to see if it resolves.',
      red_flag: 1
    },

    // Type 2 Diabetes
    {
      slug: 'type-2-diabetes',
      name: 'Polydipsia (Unquenchable Thirst)',
      category: 'metabolic',
      stage: 'early',
      description: 'Persistent, intense sensation of dry mouth and thirst even after consuming multiple liters of water.',
      mechanism: 'Hyperglycemia exceeds renal tubular absorptive threshold (>180 mg/dL), causing osmotic diuresis and severe intracellular cellular dehydration.',
      significance: 'Classic physiological indicator of significant serum glucose elevation.',
      action: 'Request a fasting plasma glucose test and an HbA1c screening from your primary care clinic.',
      red_flag: 0
    },
    {
      slug: 'type-2-diabetes',
      name: 'Acanthosis Nigricans (Velvety Skin Creases)',
      category: 'physical',
      stage: 'early',
      description: 'Hyperpigmented, thickened, velvety patches of skin appearing in intertriginous folds, notably posterior neck, armpits, and groin.',
      mechanism: 'High circulating insulin levels cross-bind to insulin-like growth factor (IGF-1) receptors on keratinocytes and dermal fibroblasts, stimulating hyperproliferation.',
      significance: 'Visual physical marker of significant peripheral insulin resistance, often present years before frank diabetes diagnosis.',
      action: 'Consult your clinician for an oral glucose tolerance test or fasting insulin/glucose index check.',
      red_flag: 0
    },
    {
      slug: 'type-2-diabetes',
      name: 'Slow-Healing Skin Wounds & Cuts',
      category: 'physical',
      stage: 'progressive',
      description: 'Minor abrasions, blisters, or skin tears on feet or lower extremities that fail to re-epithelialize over two to three weeks.',
      mechanism: 'Hyperglycemia impairs neutrophil phagocytosis, blunts microvascular endothelial nitric oxide release, and diminishes tissue oxygen delivery.',
      significance: 'Warns of microvascular compromise and elevated risk of non-healing diabetic ulcers and secondary infection.',
      action: 'Keep wound clean, avoid weight-bearing friction, and see a healthcare practitioner promptly for diabetic foot assessment.',
      red_flag: 0
    },
    {
      slug: 'type-2-diabetes',
      name: 'Postprandial Fatigue & Brain Fog',
      category: 'energy',
      stage: 'early',
      description: 'Pronounced energy crash, drowsiness, and cognitive sluggishness occurring 45 to 90 minutes following carbohydrate-rich meals.',
      mechanism: 'Exaggerated postprandial glucose spike followed by delayed pancreatic insulin hypersecretion causing reactive hypoglycemia or cellular neuro-glycopenia.',
      significance: 'Early clue for impaired glycemic variability and metabolic inflexibility.',
      action: 'Log meal compositions against energy dips and discuss a continuous glucose monitor (CGM) trial or HbA1c test with a doctor.',
      red_flag: 0
    },

    // Coronary Artery Disease
    {
      slug: 'coronary-heart-disease',
      name: 'Angina Pectoris (Exertional Pressure)',
      category: 'cardiovascular',
      stage: 'progressive',
      description: 'Sensation of tightness, heaviness, squeezing, or burning in the retrosternal chest that comes on with exertion and eases with rest.',
      mechanism: 'Transient myocardial ischemia where coronary arterial stenosis prevents adequate oxygen delivery to match increased metabolic demand.',
      significance: 'Cardinal warning symptom of significant hemodynamically relevant coronary plaque narrowing.',
      action: 'Do not ignore chest discomfort. Schedule an urgent cardiology consultation for exercise stress testing and echocardiography.',
      red_flag: 0
    },
    {
      slug: 'coronary-heart-disease',
      name: 'Radiating Pain to Left Arm, Jaw, or Back',
      category: 'pain',
      stage: 'emergency',
      description: 'Heaviness or ache traveling into the left shoulder, down the inner arm, into the jawline or between the shoulder blades accompanied by cold sweat.',
      mechanism: 'Visceral cardiac afferent nerve fibers converge at spinal cord segments C7-T4, leading the cerebral cortex to interpret cardiac distress as somatic dermatomal pain.',
      significance: 'May indicate acute coronary syndrome or myocardial infarction in progress.',
      action: 'Call emergency medical services (e.g. 911/112/local emergency) immediately. Rest seated and do not drive yourself.',
      red_flag: 1
    },

    // PCOS
    {
      slug: 'pcos',
      name: 'Oligomenorrhea / Irregular Menstrual Cycles',
      category: 'physical',
      stage: 'early',
      description: 'Menstrual cycles spaced greater than 35 days apart, fewer than 8 cycles per year, or unpredictably absent periods for consecutive months.',
      mechanism: 'Chronic elevated LH-to-FSH ratio and intra-ovarian hyperandrogenism stall follicular maturation, arresting follicles in an immature antral state without ovulation.',
      significance: 'One of the core Rotterdam criteria for PCOS; prolonged anovulation also carries risks of endometrial hyperplasia if untreated.',
      action: 'Track cycle lengths on a calendar and discuss a pelvic ultrasound and hormonal blood panel with a gynecologist.',
      red_flag: 0
    },
    {
      slug: 'pcos',
      name: 'Hirsutism & Persistent Adult Jawline Acne',
      category: 'physical',
      stage: 'early',
      description: 'Coarse terminal hair growth on the chin, upper lip, chest, or abdomen, alongside cystic hormonal acne along the jaw and neck.',
      mechanism: 'Excess circulating free testosterone converted by 5-alpha reductase in pilosebaceous units into dihydrotestosterone (DHT).',
      significance: 'Clinical sign of hyperandrogenism requiring differentiation from other adrenal or thyroid disorders.',
      action: 'Request fasting total/free testosterone, DHEAS, and 17-OH progesterone levels from your physician.',
      red_flag: 0
    },

    // Asthma
    {
      slug: 'bronchial-asthma',
      name: 'Persistent Nocturnal Dry Cough',
      category: 'respiratory',
      stage: 'early',
      description: 'Dry, irritating cough that specifically flares between 2:00 AM and 5:00 AM, frequently waking you from sleep.',
      mechanism: 'Circadian nadir of endogenous cortisol and sympathetic tone coincides with nighttime bronchial cooling and allergen exposure, heightening airway reactivity.',
      significance: 'Often the sole presenting feature of "cough-variant asthma," easily misdiagnosed as seasonal bronchitis.',
      action: 'Perform a spirometry test with bronchodilator reversibility testing at a pulmonary or primary care clinic.',
      red_flag: 0
    },
    {
      slug: 'bronchial-asthma',
      name: 'Expiratory Wheeze & Inability to Speak Full Sentences',
      category: 'respiratory',
      stage: 'emergency',
      description: 'Audible high-pitched whistling during exhalation accompanied by breathlessness that prevents speaking more than 3 consecutive words.',
      mechanism: 'Severe dynamic airway narrowing from smooth muscle constriction, airway mucosal edema, and luminal mucus plugging.',
      significance: 'Critical acute exacerbation with impending respiratory muscle exhaustion.',
      action: 'Administer prescribed rescue bronchodilator (albuterol) and seek immediate emergency care without delay.',
      red_flag: 1
    },

    // Tuberculosis
    {
      slug: 'tuberculosis',
      name: 'Chronic Productive Cough > 3 Weeks',
      category: 'respiratory',
      stage: 'early',
      description: 'Persistent daily cough producing purulent or blood-tinged sputum that fails to resolve with ordinary OTC remedies.',
      mechanism: 'Caseating granulomatous liquefaction in the lung parenchyma eroding into adjacent terminal bronchioles.',
      significance: 'Primary clinical alert trigger for sputum acid-fast bacilli (AFB) testing or GeneXpert molecular testing.',
      action: 'Wear a surgical mask when near others and schedule a sputum examination and chest X-ray immediately.',
      red_flag: 0
    },
    {
      slug: 'tuberculosis',
      name: 'Drenching Night Sweats & Unexplained Weight Loss',
      category: 'energy',
      stage: 'progressive',
      description: 'Waking up with nightclothes soaked in perspiration alongside involuntary loss of 5% or more of body weight over 2 months.',
      mechanism: 'Systemic cytokine release (notably TNF-alpha and Interleukin-1) driving chronic cachexia and nocturnal thermal dysregulation.',
      significance: 'Classic constitutional symptoms of active pulmonary or extrapulmonary mycobacterial proliferation.',
      action: 'Seek prompt infectious disease or chest clinic evaluation for tuberculin skin testing / IGRA blood test.',
      red_flag: 0
    },

    // Dengue
    {
      slug: 'dengue-fever',
      name: 'Sudden High Fever with Retro-Orbital Pain',
      category: 'pain',
      stage: 'early',
      description: 'Abrupt fever spiking to 40°C (104°F) accompanied by intense, deep pain behind the eyeballs that worsens on eye movement.',
      mechanism: 'Viremia induces systemic inflammatory myalgias and trigeminal ophthalmic nerve sensory sensitization.',
      significance: 'Hallmark presentation of the acute febrile phase (days 1 to 3) of dengue virus.',
      action: 'Hydrate continuously with oral rehydration solutions. AVOID aspirin or ibuprofen (NSAIDs) due to bleeding risk; use paracetamol/acetaminophen only.',
      red_flag: 0
    },
    {
      slug: 'dengue-fever',
      name: 'Critical Phase Warning Signs (Persistent Vomiting, Mucosal Bleeding)',
      category: 'cardiovascular',
      stage: 'emergency',
      description: 'Severe abdominal pain, persistent vomiting (>3 times in 24h), spontaneous bleeding from gums or nose, extreme lethargy as fever drops.',
      mechanism: 'Acute systemic endothelial hyperpermeability causing plasma leakage into pleural/peritoneal cavities and profound thrombocytopenia.',
      significance: 'Markers of progression toward severe dengue and hypovolemic shock; can deteriorate within hours.',
      action: 'Immediate hospitalization and inpatient IV fluid resuscitation is essential.',
      red_flag: 1
    },

    // Colorectal Cancer
    {
      slug: 'colorectal-cancer',
      name: 'Persistent Change in Bowel Habits & Stool Caliber',
      category: 'physical',
      stage: 'progressive',
      description: 'New-onset constipation or diarrhea lasting more than 4 weeks, or noticeable narrowing of stool diameter ("pencil-thin stool").',
      mechanism: 'Luminal circumferential growth of a distal colon or rectal lesion physically impeding fecal transit.',
      significance: 'Requires prompt endoscopic evaluation to rule out obstructive colonic neoplasm.',
      action: 'Consult a gastroenterologist for colonoscopy; do not self-treat with long-term laxatives without diagnostic workup.',
      red_flag: 0
    },
    {
      slug: 'colorectal-cancer',
      name: 'Occult Blood in Stool or Unexplained Iron Deficiency Anemia',
      category: 'physical',
      stage: 'progressive',
      description: 'Dark, tarry stools, visible maroon blood mixed with stool, or blood lab showing unexplained microcytic anemia in an adult.',
      mechanism: 'Friable tumor surface micro-ulcerations bleeding chronically into the intestinal lumen.',
      significance: 'Any unexplained iron deficiency in adults aged 45+ warrants bidirectional endoscopy (colonoscopy + EGD).',
      action: 'Schedule diagnostic fecal immunochemical testing (FIT) and complete colonoscopy.',
      red_flag: 0
    },

    // Depression / Mental Health
    {
      slug: 'mental-health-depression',
      name: 'Anhedonia (Loss of Interest or Pleasure)',
      category: 'cognitive',
      stage: 'early',
      description: 'Inability to feel enjoyment from activities, hobbies, relationships, or food that previously brought satisfaction.',
      mechanism: 'Blunted mesolimbic dopaminergic reward pathway neurotransmission and altered ventral striatal functional connectivity.',
      significance: 'One of the two primary gatekeeper diagnostic criteria for major depressive episode.',
      action: 'Take a validated PHQ-9 self-assessment and discuss mental health support with a licensed therapist or physician.',
      red_flag: 0
    },
    {
      slug: 'mental-health-depression',
      name: 'Early Morning Awakening & Psychomotor Retardation',
      category: 'energy',
      stage: 'progressive',
      description: 'Waking up 2 to 3 hours before desired time unable to return to sleep, accompanied by physical sensation of moving through molasses.',
      mechanism: 'Abnormal circadian melatonin rhythm paired with sustained nocturnal HPA axis hypercortisolemia.',
      significance: 'Often indicates biological depressive subtype with significant neurovegetative symptoms.',
      action: 'Consult a primary care doctor or psychiatrist for holistic evaluation including sleep hygiene, therapy, and medical support.',
      red_flag: 0
    },

    // Chronic Kidney Disease
    {
      slug: 'chronic-kidney-disease',
      name: 'Persistent Foamy or Bubbly Urine',
      category: 'physical',
      stage: 'early',
      description: 'Urine that creates persistent, frothy bubbles in the toilet bowl that do not dissipate after flushing.',
      mechanism: 'Disruption of glomerular podocyte filtration slit diaphragms allowing large serum albumin molecules to leak into urinary filtrate (proteinuria).',
      significance: 'One of the earliest and most reliable clues for nephron microvascular damage before blood creatinine rises.',
      action: 'Request a spot urine albumin-to-creatinine ratio (uACR) test from your physician.',
      red_flag: 0
    },
    {
      slug: 'chronic-kidney-disease',
      name: 'Bilateral Periorbital & Lower Extremity Edema',
      category: 'physical',
      stage: 'progressive',
      description: 'Puffiness around the eyes upon waking, followed by pitting fluid retention around ankles and calves by evening.',
      mechanism: 'Combined renal sodium and water retention alongside decreased oncotic capillary pressure from significant urinary albumin loss.',
      significance: 'Indicates declining glomerular filtration rate (GFR) or nephrotic-range proteinuria.',
      action: 'Seek renal function lab testing (serum creatinine, estimated GFR, electrolyte panel) and blood pressure review.',
      red_flag: 0
    }
  ];

  warningSigns.forEach(s => {
    const diseaseId = diseaseMap[s.slug];
    if (diseaseId) {
      insertWarningSign.run(
        diseaseId, s.name, s.category, s.stage, s.description,
        s.mechanism, s.significance, s.action, s.red_flag
      );
    }
  });

  // Risk Factors
  const insertRiskFactor = db.prepare(`
    INSERT INTO risk_factors (disease_id, factor_type, title, description, impact_level)
    VALUES (?, ?, ?, ?, ?)
  `);

  const riskFactors = [
    { slug: 'hypertension', type: 'modifiable', title: 'High Dietary Sodium Intake (>2,300 mg/day)', desc: 'Excess sodium shifts fluid balance into the intravascular space, placing sustained hydrostatic pressure on endothelial linings.', impact: 'high' },
    { slug: 'hypertension', type: 'modifiable', title: 'Sedentary Lifestyle & Low Aerobic Activity', desc: 'Lack of regular cardio reduces vascular endothelial nitric oxide synthase, leading to chronic arterial stiffness.', impact: 'high' },
    { slug: 'hypertension', type: 'modifiable', title: 'Chronic High Alcohol Consumption', desc: 'Stimulates the sympathetic nervous system, increases renin secretion, and inhibits baroreceptors.', impact: 'moderate' },
    { slug: 'hypertension', type: 'non_modifiable', title: 'Genetic Family History', desc: 'First-degree relatives with early-onset hypertension confer up to a 2.5-fold higher risk.', impact: 'high' },
    { slug: 'hypertension', type: 'non_modifiable', title: 'Advancing Arterial Age (>55 years)', desc: 'Natural gradual loss of elastin fibers in the aortic wall replaced by collagen increases pulse wave velocity.', impact: 'high' },

    { slug: 'type-2-diabetes', type: 'modifiable', title: 'Visceral Adiposity & Waist Circumference', desc: 'Intra-abdominal fat secretes inflammatory adipokines (TNF-a, IL-6) that directly antagonize insulin receptor substrate phosphorylation.', impact: 'high' },
    { slug: 'type-2-diabetes', type: 'modifiable', title: 'Ultra-Processed Foods & Refined Carbohydrates', desc: 'Frequent rapid glycemic spikes cause repetitive pancreatic beta-cell stress and hyperinsulinemic exhaustion.', impact: 'high' },
    { slug: 'type-2-diabetes', type: 'modifiable', title: 'Chronically Disrupted Sleep (<6 hours/night)', desc: 'Sleep deprivation increases nocturnal cortisol and free fatty acids, inducing immediate acute insulin resistance.', impact: 'moderate' },
    { slug: 'type-2-diabetes', type: 'non_modifiable', title: 'First-Degree Relative with Type 2 Diabetes', desc: 'Polygenic susceptibility alleles significantly alter beta-cell insulin secretory capacity and peripheral sensitivity.', impact: 'high' },
    { slug: 'type-2-diabetes', type: 'non_modifiable', title: 'History of Gestational Diabetes', desc: 'Women who develop gestational diabetes face a 50% lifetime likelihood of developing Type 2 Diabetes within 10 years.', impact: 'high' },

    { slug: 'coronary-heart-disease', type: 'modifiable', title: 'Elevated Apolipoprotein B / LDL Particles', desc: 'ApoB particles penetrate the damaged arterial intima and become oxidized, initiating atheromatous foam cell clusters.', impact: 'high' },
    { slug: 'coronary-heart-disease', type: 'modifiable', title: 'Cigarette Smoking & Tobacco Combustion', desc: 'Nicotine and combustion chemicals trigger immediate coronary vasoconstriction, platelet activation, and endothelial sloughing.', impact: 'high' },
    { slug: 'coronary-heart-disease', type: 'non_modifiable', title: 'Premature CAD Family History (<55 male, <65 female)', desc: 'Inherited lipid clearance defects, elevated Lp(a), and pro-inflammatory genetic architecture.', impact: 'high' },

    { slug: 'pcos', type: 'modifiable', title: 'Sedentary State & High Glycemic Index Diet', desc: 'Worsens hyperinsulinemia, which directly stimulates the ovarian theca cells to synthesize excess androgens.', impact: 'high' },
    { slug: 'pcos', type: 'non_modifiable', title: 'Family History of PCOS or Type 2 Diabetes', desc: 'Strong familial aggregation reflecting genetic variants in androgen synthesis, insulin receptor signaling, and follicle dynamics.', impact: 'high' },

    { slug: 'bronchial-asthma', type: 'modifiable', title: 'Indoor Aeroallergens & Secondhand Smoke', desc: 'Dust mites, molds, animal dander, and combustion particulates trigger IgE-mediated eosinophilic airway inflammation.', impact: 'high' },
    { slug: 'bronchial-asthma', type: 'non_modifiable', title: 'Atopic Diathesis (History of Eczema or Allergic Rhinitis)', desc: 'The "allergic march" where genetic predisposition toward Th2 immune response hyper-activates mucosal surfaces.', impact: 'high' }
  ];

  riskFactors.forEach(r => {
    const dId = diseaseMap[r.slug];
    if (dId) {
      insertRiskFactor.run(dId, r.type, r.title, r.desc, r.impact);
    }
  });

  // Prevention Pillars (KNOW, WATCH, PREVENT, PREPARE, ACT)
  const insertPreventionPillar = db.prepare(`
    INSERT INTO prevention_pillars (disease_id, pillar, title, description, actionable_steps, target_metrics)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const pillars = [
    // Hypertension
    {
      slug: 'hypertension',
      pillar: 'KNOW',
      title: 'Know Your Resting Vascular Numbers',
      desc: 'Understand the difference between systolic (pumping) and diastolic (resting) pressure, and why single isolated readings are inadequate.',
      steps: JSON.stringify([
        'Learn your baseline: Normal is < 120/80 mmHg; Stage 1 Hypertension is 130-139 / 80-89 mmHg',
        'Recognize the "white coat effect": Clinical anxiety frequently inflates in-office readings by 10-15 mmHg',
        'Learn proper cuff placement: Arm at heart level, back supported, 5 minutes silent rest beforehand'
      ]),
      metrics: 'Goal: Consistently < 120/80 mmHg at home rest'
    },
    {
      slug: 'hypertension',
      pillar: 'WATCH',
      title: 'Establish a 7-Day Home Monitoring Protocol',
      desc: 'Accurate ambulatory tracking yields far higher cardiovascular prognostic value than sporadic annual checkups.',
      steps: JSON.stringify([
        'Measure twice in the morning before eating or taking meds, and twice in the evening before bed',
        'Record readings in a standardized health log or digital tracker',
        'Observe dietary and stress correlations over two consecutive weeks'
      ]),
      metrics: 'Standardized 7-day average home systolic < 130 mmHg'
    },
    {
      slug: 'hypertension',
      pillar: 'PREVENT',
      title: 'Adopt the DASH Dietary Framework & Potassium Rebalancing',
      desc: 'Evidence demonstrates that dietary sodium reduction combined with rich potassium sources rivals monotherapy medication in reducing blood pressure.',
      steps: JSON.stringify([
        'Target daily dietary sodium under 2,000 mg (under 1 teaspoon total across all meals)',
        'Increase potassium-rich leafy greens, legumes, avocados, and sweet potatoes to promote renal sodium excretion',
        'Engage in 150 minutes weekly of zone 2 aerobic exercise (brisk walking, cycling, swimming)'
      ]),
      metrics: 'DASH compliance + 150 min aerobic cardio weekly'
    },
    {
      slug: 'hypertension',
      pillar: 'PREPARE',
      title: 'Prepare Target Questions and Medication Reviews',
      desc: 'Assemble questions for your next appointment regarding secondary hypertension screenings and medication tolerability.',
      steps: JSON.stringify([
        'Export your 14-day home BP averages into a clean printable summary sheet',
        'List all current supplements (decongestants and NSAIDs can silently raise BP)',
        'Ask your doctor about baseline kidney function (eGFR) and urine microalbumin testing'
      ]),
      metrics: 'Printed 14-day log ready for doctor review'
    },
    {
      slug: 'hypertension',
      pillar: 'ACT',
      title: 'Know Your Red-Flag Emergency Action Thresholds',
      desc: 'Recognize the critical difference between asymptomatic high numbers and acute hypertensive emergencies.',
      steps: JSON.stringify([
        'If reading is > 180/120 without symptoms: Rest quietly for 10 minutes and re-test',
        'If reading remains > 180/120 WITH headache, chest pain, blurry vision, or numbness: Seek emergency room care immediately',
        'Never stop prescribed antihypertensive medications abruptly without clinician supervision'
      ]),
      metrics: 'Immediate action plan for readings > 180/120 mmHg'
    },

    // Type 2 Diabetes
    {
      slug: 'type-2-diabetes',
      pillar: 'KNOW',
      title: 'Understand Glycemic Biomarkers & Insulin Dynamics',
      desc: 'Master the fundamental biological markers of glucose regulation before complications develop.',
      steps: JSON.stringify([
        'Learn your HbA1c: Normal is < 5.7%; Pre-diabetes is 5.7% – 6.4%; Diabetes is >= 6.5%',
        'Understand fasting blood sugar: Normal < 100 mg/dL; Pre-diabetes 100 – 125 mg/dL',
        'Recognize the protective window: Pre-diabetes is 100% reversible with cellular habit adaptation'
      ]),
      metrics: 'Target HbA1c < 5.7%, Fasting Glucose < 100 mg/dL'
    },
    {
      slug: 'type-2-diabetes',
      pillar: 'WATCH',
      title: 'Monitor Energy Fluctuations & Glycemic Spikes',
      desc: 'Connect how specific meals, sleep durations, and sedentary periods affect your daily physiological alertness.',
      steps: JSON.stringify([
        'Notice extreme energy crashes following heavy starchy lunches',
        'Watch for progressive changes in skin pigmentation around collar and underarms',
        'Track waist-to-height ratio (ideal is waist circumference less than half your height)'
      ]),
      metrics: 'Waist-to-height ratio < 0.50'
    },
    {
      slug: 'type-2-diabetes',
      pillar: 'PREVENT',
      title: 'Musculoskeletal Glucose Sinks & Meal Sequencing',
      desc: 'Skeletal muscle absorbs up to 80% of postprandial glucose independently of insulin during contractions.',
      steps: JSON.stringify([
        'Take a 10 to 15 minute light walk immediately after your largest daily meal',
        'Adopt fiber-first meal sequencing: Eat fiber/vegetables and protein before starches and sugars',
        'Perform resistance training 2 to 3 days weekly to expand muscular glycogen storage capacity'
      ]),
      metrics: '2-3 resistance sessions weekly + post-meal movement'
    },
    {
      slug: 'type-2-diabetes',
      pillar: 'PREPARE',
      title: 'Schedule Annual Comprehensive Metabolic Panels',
      desc: 'Proactively prepare preventative screening orders with your primary care provider.',
      steps: JSON.stringify([
        'Request an annual HbA1c and lipid particle panel',
        'Inquire whether fasting insulin or HOMA-IR is appropriate to detect early hyperinsulinemia',
        'Review family metabolic history for multi-generational diabetes patterns'
      ]),
      metrics: 'Annual documented HbA1c lab review'
    },
    {
      slug: 'type-2-diabetes',
      pillar: 'ACT',
      title: 'Implement Structured Lifestyle Changes Upon Any Pre-Diabetes Flag',
      desc: 'Act proactively the very week an elevated lab arrives rather than waiting for formal diabetes diagnosis.',
      steps: JSON.stringify([
        'Enroll in a certified Diabetes Prevention Program (DPP) or work with a registered dietitian',
        'Aim for a sustainable 5% to 7% loss of body weight if carrying visceral adiposity',
        'Eliminate sugar-sweetened beverages completely from daily consumption'
      ]),
      metrics: '5-7% weight reduction if indicated'
    },

    // PCOS
    {
      slug: 'pcos',
      pillar: 'KNOW',
      title: 'De-stigmatize the Diagnosis and Understand Androgen Excess',
      desc: 'Understand that polycystic ovaries are an ultrasound finding, not the root disease itself.',
      steps: JSON.stringify([
        'Understand the Rotterdam Diagnostic Criteria (requires 2 of 3: irregular cycles, androgen signs, polycystic morphology)',
        'Learn the metabolic connection: 70% of women with PCOS have peripheral insulin resistance regardless of body weight',
        'Know that fertility is preserved with proper ovulatory support and metabolic care'
      ]),
      metrics: 'Clear grasp of hormonal profile (LH/FSH, androgens, insulin)'
    },
    {
      slug: 'pcos',
      pillar: 'WATCH',
      title: 'Track Cycle Predictability and Symptom Clusters',
      desc: 'Detailed menstrual tracking provides crucial clinical evidence for your gynecologist and endocrinologist.',
      steps: JSON.stringify([
        'Log start dates, duration, flow intensity, and pain scores for every cycle',
        'Track skin flare-ups, adult cystic acne, and scalp shedding against cycle phases',
        'Monitor basal body temperature or urinary luteinizing hormone strips to verify ovulation'
      ]),
      metrics: 'Accurate 6-month cycle journal'
    },
    {
      slug: 'pcos',
      pillar: 'PREVENT',
      title: 'Metabolic Insulin Sensitivity and Anti-Inflammatory Nutrition',
      desc: 'Stabilizing blood sugar dampens the ovarian stimulus to overproduce testosterone.',
      steps: JSON.stringify([
        'Prioritize low glycemic load carbohydrates and 25-30g protein at breakfast',
        'Consider evidence-backed nutritional supplements (Myo-inositol, Omega-3 fatty acids, Vitamin D3) after clinician discussion',
        'Incorporate progressive resistance training to enhance peripheral insulin receptor sensitivity'
      ]),
      metrics: 'Balanced daily glycemic curve & low inflammation diet'
    },
    {
      slug: 'pcos',
      pillar: 'PREPARE',
      title: 'Assemble a Targeted Endocrine & Gynecological Inquiry',
      desc: 'Prepare questions for specialist consultations to explore personalized management beyond birth control pills.',
      steps: JSON.stringify([
        'Request fasting glucose, fasting insulin, full lipid panel, and free/total testosterone',
        'Discuss long-term endometrial protection strategies if menstrual cycles exceed 90 days',
        'Ask about pelvic ultrasound timing (ideally follicular phase when possible)'
      ]),
      metrics: 'Targeted hormonal consultation plan'
    },
    {
      slug: 'pcos',
      pillar: 'ACT',
      title: 'Seek Specialist Care for Anovulatory Intervals > 90 Days',
      desc: 'Understand the biological necessity of preventing prolonged unopposed estrogen exposure.',
      steps: JSON.stringify([
        'If a cycle is absent for >3 months without pregnancy, consult your physician for progestin-induced withdrawal',
        'Engage psychological support or cognitive behavioral therapy for anxiety or body image distress',
        'Partner with a reproductive endocrinologist when planning pregnancy'
      ]),
      metrics: 'Medical evaluation for any cycle gap > 90 days'
    }
  ];

  pillars.forEach(p => {
    const dId = diseaseMap[p.slug];
    if (dId) {
      insertPreventionPillar.run(dId, p.pillar, p.title, p.desc, p.steps, p.metrics);
    }
  });

  // Myths vs Facts
  const insertMyth = db.prepare(`
    INSERT INTO myths (disease_id, category, myth, fact, explanation, scientific_evidence)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const myths = [
    {
      slug: 'hypertension',
      category: 'Cardiovascular',
      myth: 'If you have high blood pressure, you will feel tense, anxious, or have frequent nosebleeds.',
      fact: 'Hypertension is clinically asymptomatic in over 90% of cases until severe target organ damage occurs.',
      explanation: 'Most people with stage 1 or stage 2 hypertension feel completely normal and calm. Relying on physical sensations or emotional states to guess blood pressure is a dangerous medical mistake.',
      evidence: 'American Heart Association (AHA) and Lancet Commission on Hypertension consensus guidelines.'
    },
    {
      slug: 'hypertension',
      category: 'Cardiovascular',
      myth: 'Only older people with poor diets need to worry about blood pressure.',
      fact: 'Hypertension is increasingly diagnosed in young adults aged 18 to 39 due to chronic stress, sleep debt, and genetic predisposition.',
      explanation: 'Vascular endothelial stiffening and autonomic dysregulation can occur at any age. Early detection in young adulthood prevents decades of cumulative heart and kidney microvascular damage.',
      evidence: 'Global Burden of Disease Study 2021; Journal of the American College of Cardiology.'
    },
    {
      slug: 'type-2-diabetes',
      category: 'Metabolic',
      myth: 'Type 2 Diabetes is caused solely by eating too much table sugar.',
      fact: 'It is a complex multifactorial condition driven by visceral fat, cellular insulin resistance, genetic beta-cell capacity, and systemic inflammation.',
      explanation: 'While excessive consumption of sweetened drinks contributes to caloric surplus and hepatic steatosis, diabetes is not caused by table sugar alone. Genetics, lack of physical activity, chronic cortisol surges, and sleep loss play major biological roles.',
      evidence: 'International Diabetes Federation (IDF) Diabetes Atlas; American Diabetes Association (ADA).'
    },
    {
      slug: 'type-2-diabetes',
      category: 'Metabolic',
      myth: 'Once you are diagnosed with pre-diabetes, developing full Type 2 Diabetes is an inevitable certainty.',
      fact: 'Pre-diabetes is highly reversible; sustained lifestyle modifications reduce the risk of diabetes progression by over 58%.',
      explanation: 'The famous landmark Diabetes Prevention Program clinical trials proved that modest weight loss (5-7%) and 150 minutes of weekly brisk walking reversed pre-diabetes back to normoglycemia in the majority of participants.',
      evidence: 'New England Journal of Medicine (Diabetes Prevention Program Research Group).'
    },
    {
      slug: 'pcos',
      category: 'Women\'s Health',
      myth: 'PCOS only affects women who are visibly overweight.',
      fact: 'Lean PCOS accounts for 20% to 30% of all cases; thin individuals can experience the exact same hormonal and metabolic disruptions.',
      explanation: 'Even without elevated BMI, women with lean PCOS frequently possess visceral adiposity, impaired glucose disposal, and elevated androgen levels. BMI alone should never be used to rule out PCOS.',
      evidence: 'Endocrine Society Clinical Practice Guidelines; Human Reproduction Update.'
    },
    {
      slug: 'bronchial-asthma',
      category: 'Respiratory',
      myth: 'People with asthma should avoid all vigorous exercise and physical sports.',
      fact: 'Regular cardiovascular exercise strengthens respiratory muscles, improves lung capacity, and reduces asthma exacerbations when properly managed.',
      explanation: 'Numerous Olympic athletes compete and win with asthma. With appropriate controller medication and pre-exercise warm-ups, regular physical training is strongly recommended for respiratory health.',
      evidence: 'Global Initiative for Asthma (GINA) 2023 Strategy Report.'
    },
    {
      slug: 'tuberculosis',
      category: 'Infectious',
      myth: 'Tuberculosis is a disease of the past that has been entirely eradicated.',
      fact: 'TB remains one of the world\'s deadliest infectious killers, infecting over 10 million people each year.',
      explanation: 'TB is an active global health priority. Due to drug-resistant strains and missed diagnoses, continued vigilance, public testing, and completed antibiotic treatments are vital.',
      evidence: 'World Health Organization (WHO) Global Tuberculosis Report.'
    },
    {
      slug: 'dengue-fever',
      category: 'Infectious',
      myth: 'You should take strong pain relievers like aspirin or ibuprofen as soon as dengue fever starts.',
      fact: 'Aspirin and NSAIDs (ibuprofen, naproxen) are strictly contraindicated in dengue because they increase life-threatening internal bleeding risk.',
      explanation: 'Dengue virus impairs platelet count and vascular integrity. NSAIDs inhibit platelet aggregation and irritate gastric mucosa, multiplying hemorrhagic risk. Only paracetamol/acetaminophen should be used under clinical dosage limits.',
      evidence: 'WHO Dengue Guidelines for Diagnosis, Treatment, Prevention and Control.'
    },
    {
      slug: 'colorectal-cancer',
      category: 'Oncology',
      myth: 'If you don\'t have stomach pain or blood in your stool, you don\'t need a colon cancer screening.',
      fact: 'Pre-cancerous polyps and early-stage colorectal cancers almost never cause symptoms or bleeding.',
      explanation: 'The entire purpose of screening (such as colonoscopy or stool FIT testing starting at age 45) is to detect and remove lesions before symptoms ever occur. Once bleeding or pain appears, the lesion is often substantially advanced.',
      evidence: 'U.S. Preventive Services Task Force (USPSTF) Colorectal Cancer Screening Recommendations.'
    },
    {
      slug: 'chronic-kidney-disease',
      category: 'Renal',
      myth: 'Drinking extra gallons of water will cleanse damaged kidneys and restore kidney function.',
      fact: 'Excessive water consumption cannot reverse nephron damage and can cause dangerous fluid overload in declining kidneys.',
      explanation: 'While adequate hydration is good for overall health, kidneys damaged by chronic hypertension or diabetes have lost filtration capacity. Flooding the system with excessive fluid can precipitate peripheral edema, pulmonary congestion, and hyponatremia.',
      evidence: 'Kidney Disease: Improving Global Outcomes (KDIGO) Clinical Practice Guidelines.'
    }
  ];

  myths.forEach(m => {
    const dId = diseaseMap[m.slug];
    insertMyth.run(dId || null, m.category, m.myth, m.fact, m.explanation, m.evidence);
  });

  // Seek Care Guidelines
  const insertCare = db.prepare(`
    INSERT INTO seek_care_guidelines (disease_id, urgency, trigger_condition, recommended_action)
    VALUES (?, ?, ?, ?)
  `);

  const careGuidelines = [
    { slug: 'hypertension', urgency: 'routine', condition: 'Single elevated clinic reading between 130-139 / 80-89 with no symptoms', action: 'Schedule a routine follow-up with your primary physician within 2 to 4 weeks with a 7-day home BP log.' },
    { slug: 'hypertension', urgency: 'prompt', condition: 'Consistent home BP readings > 160/100 mmHg across 3 consecutive days', action: 'Contact your doctor\'s office for an expedited visit within 48 to 72 hours for medication review or initiation.' },
    { slug: 'hypertension', urgency: 'emergency', condition: 'BP > 180/120 mmHg accompanied by chest tightness, shortness of breath, blurry vision, or weakness', action: 'Call 911 / emergency services immediately for acute hypertensive emergency evaluation in an emergency department.' },

    { slug: 'type-2-diabetes', urgency: 'routine', condition: 'Fasting glucose between 100-125 mg/dL or HbA1c 5.7-6.4% on routine labs', action: 'Schedule a dedicated preventive consultation to discuss nutritional lifestyle therapy, exercise prescription, and follow-up lab timing.' },
    { slug: 'type-2-diabetes', urgency: 'prompt', condition: 'Persistent unquenchable thirst, frequent nighttime urination, and unexplained 5kg weight drop over 3 weeks', action: 'Visit an urgent care or primary care provider within 24 to 48 hours for immediate point-of-care capillary glucose and ketone testing.' },
    { slug: 'type-2-diabetes', urgency: 'emergency', condition: 'Extreme confusion, fruity-smelling breath, deep rapid breathing, and severe nausea/vomiting', action: 'Go to the nearest emergency room immediately to rule out diabetic ketoacidosis (DKA) or hyperosmolar hyperglycemic state (HHS).' },

    { slug: 'dengue-fever', urgency: 'routine', condition: 'Mild low-grade fever with muscle aches after travel to endemic area', action: 'Visit a primary care clinic for complete blood count (CBC) and dengue NS1 antigen rapid test; stay well hydrated.' },
    { slug: 'dengue-fever', urgency: 'prompt', condition: 'Platelet count dropping below 100,000 or petechial red spots on skin', action: 'Present to a clinical evaluation center for daily hematocrit and platelet monitoring.' },
    { slug: 'dengue-fever', urgency: 'emergency', condition: 'Severe abdominal pain, persistent vomiting, mucosal gum bleeding, or sudden hypothermia/cold clammy skin as fever drops', action: 'Emergency hospital admission immediately; critical phase capillary leakage requires urgent intravenous fluid protocol.' }
  ];

  careGuidelines.forEach(c => {
    const dId = diseaseMap[c.slug];
    if (dId) {
      insertCare.run(dId, c.urgency, c.condition, c.action);
    }
  });

  // Doctor Question Templates
  const insertDocQ = db.prepare(`
    INSERT INTO doctor_question_templates (disease_id, category, question, rationale, when_to_ask)
    VALUES (?, ?, ?, ?, ?)
  `);

  const docQuestions = [
    { slug: 'hypertension', category: 'Diagnostics', q: 'What is my personal target blood pressure based on my age, lifestyle, and cardiovascular risk profile?', rationale: 'Target numbers differ for individuals with diabetes, kidney disease, or prior stroke history.', when: 'Initial diagnosis or annual checkup' },
    { slug: 'hypertension', category: 'Medication', q: 'Are my current medications or supplements contributing to elevated blood pressure?', rationale: 'Many over-the-counter decongestants, NSAIDs, oral contraceptives, and herbal supplements elevate vascular tone.', when: 'Routine medication review' },
    { slug: 'hypertension', category: 'Organ Protection', q: 'Should we perform a baseline urine microalbumin test or ECG to check for early heart or kidney strain?', rationale: 'Identifies subclinical end-organ microvascular changes long before symptoms manifest.', when: 'Stage 1 or Stage 2 discussion' },

    { slug: 'type-2-diabetes', category: 'Biomarkers', q: 'What was my exact HbA1c number on my latest lab, and how often should we re-test it?', rationale: 'Knowing the exact percentage helps you benchmark lifestyle progress and establish concrete targets.', when: 'Reviewing blood test results' },
    { slug: 'type-2-diabetes', category: 'Prevention', q: 'Can I be referred to a registered dietitian or accredited diabetes self-management education program?', rationale: 'Structured nutritional counseling significantly outperforms general generic dietary advice.', when: 'Pre-diabetes or new diagnosis' },
    { slug: 'type-2-diabetes', category: 'Screening', q: 'Do I need annual dilated eye exams and comprehensive diabetic foot exams at this stage?', rationale: 'Proactive microvascular surveillance prevents irreversible retinopathy and neuropathy complications.', when: 'Annual comprehensive care review' },

    { slug: 'pcos', category: 'Endocrine', q: 'Can we test for fasting insulin or an oral glucose tolerance test alongside my hormone levels?', rationale: 'Standard fasting glucose frequently looks normal even when severe compensatory hyperinsulinemia is present.', when: 'Diagnostic investigation' },
    { slug: 'pcos', category: 'Endometrial Health', q: 'How many menstrual cycles per year do I need to maintain to protect my endometrial lining?', rationale: 'Prolonged anovulation allows unopposed estrogen to thicken the endometrium, elevating hyperplasia risk.', when: 'Irregular cycles discussion' },

    { slug: 'bronchial-asthma', category: 'Action Plan', q: 'Can we create a written Asthma Action Plan detailing green, yellow, and red zone peak-flow levels?', rationale: 'Written action plans reduce emergency hospital visits and clarify exact medication step-up triggers.', when: 'Routine pulmonary consultation' },
    { slug: 'colorectal-cancer', category: 'Screening', q: 'Based on my family history, at what age should I begin colorectal cancer screening, and which test is best for me?', rationale: 'People with first-degree relatives with colorectal polyps or cancer must often begin screening 10 years earlier than age 45.', when: 'Age 40+ or upon family history discovery' }
  ];

  docQuestions.forEach(q => {
    const dId = diseaseMap[q.slug];
    if (dId) {
      insertDocQ.run(dId, q.category, q.q, q.rationale, q.when);
    }
  });

  // User Doctor Questions (Initial for Clara)
  const insertUserDocQ = db.prepare(`
    INSERT INTO user_doctor_questions (user_id, disease_id, question, rationale, priority, is_discussed, doctor_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUserDocQ.run(2, diseaseMap['hypertension'], 'What is my personal target blood pressure based on my age and cardio profile?', 'Ensure I am targeting the right home readings.', 'high', 1, 'Target discussed: 120/80. Doctor recommended 2-week home log.');
  insertUserDocQ.run(2, diseaseMap['hypertension'], 'Should we perform a baseline urine microalbumin test to check for kidney strain?', 'Identifies early subclinical signs.', 'routine', 0, null);
  insertUserDocQ.run(2, diseaseMap['type-2-diabetes'], 'What was my exact HbA1c on my latest blood panel?', 'Need to track trend over past 12 months.', 'high', 0, null);

  // User Saved Diseases
  const insertSaved = db.prepare('INSERT INTO user_saved_diseases (user_id, disease_id) VALUES (?, ?)');
  insertSaved.run(2, diseaseMap['hypertension']);
  insertSaved.run(2, diseaseMap['type-2-diabetes']);
  insertSaved.run(2, diseaseMap['pcos']);

  // User Checklist Progress
  const insertProgress = db.prepare('INSERT INTO user_checklist_progress (user_id, prevention_pillar_id, pillar, disease_id, completed) VALUES (?, ?, ?, ?, ?)');
  const samplePillars = db.prepare('SELECT id, pillar, disease_id FROM prevention_pillars LIMIT 6').all();
  samplePillars.forEach(p => {
    insertProgress.run(2, p.id, p.pillar, p.disease_id, 1);
  });

  // Quizzes & Questions
  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (title, description, category, disease_id, time_minutes)
    VALUES (?, ?, ?, ?, ?)
  `);

  const q1Id = insertQuiz.run(
    'Comprehensive Cardiovascular Awareness Check',
    'Assess your foundational knowledge of arterial blood pressure, silent progression, and evidence-based vascular protection.',
    'Cardiovascular',
    diseaseMap['hypertension'],
    5
  ).lastInsertRowid;

  const q2Id = insertQuiz.run(
    'Metabolic Health & Pre-Diabetes Fundamentals',
    'Test how well you understand insulin resistance, the HbA1c window of opportunity, and glucose dynamics.',
    'Metabolic',
    diseaseMap['type-2-diabetes'],
    6
  ).lastInsertRowid;

  const insertQQ = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_text, category, rationale_correct, rationale_incorrect)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertQOpt = db.prepare(`
    INSERT INTO quiz_options (question_id, option_text, is_correct, explanation)
    VALUES (?, ?, ?, ?)
  `);

  // Quiz 1 Questions
  const q1_q1 = insertQQ.run(
    q1Id,
    'Why is hypertension clinically referred to as the "silent surge" or "silent killer"?',
    'Understanding',
    'Hypertension causes progressive microvascular damage for years without producing daily physical symptoms in the majority of individuals.',
    'Physical sensations such as tension or nosebleeds are not reliable indicators of blood pressure levels.'
  ).lastInsertRowid;

  insertQOpt.run(q1_q1, 'Because it only develops during nighttime deep sleep', 0, 'Incorrect. Blood pressure follows a circadian rhythm, but hypertension is present throughout daily activities.');
  insertQOpt.run(q1_q1, 'Because it rarely produces noticeable daily symptoms while silently damaging arterial walls', 1, 'Correct! Over 90% of individuals with hypertension feel completely healthy despite sustained elevated pressures.');
  insertQOpt.run(q1_q1, 'Because it only affects the vocal cords and pulmonary airways', 0, 'Incorrect. It is a systemic vascular condition affecting arterial beds throughout the heart, brain, and kidneys.');
  insertQOpt.run(q1_q1, 'Because it always causes severe immediate nosebleeds within 24 hours', 0, 'Incorrect. Epistaxis (nosebleeds) is rare in ordinary hypertension and cannot be relied upon as an early warning.');

  const q1_q2 = insertQQ.run(
    q1Id,
    'Which dietary intervention has clinical trial evidence demonstrating blood pressure reductions comparable to monotherapy medication?',
    'Prevention',
    'The DASH (Dietary Approaches to Stop Hypertension) diet, rich in potassium, magnesium, and reduced sodium, demonstrates substantial systolic lowering.',
    'Simply skipping breakfast or eliminating all dietary fats does not produce target vascular improvements.'
  ).lastInsertRowid;

  insertQOpt.run(q1_q2, 'DASH dietary pattern combining sodium reduction (<2,000mg) with high potassium/magnesium whole foods', 1, 'Correct! Landmark DASH clinical trials demonstrated 8-14 mmHg systolic reductions in hypertensive individuals.');
  insertQOpt.run(q1_q2, 'Drinking three cups of green tea without modifying dietary sodium or processed food', 0, 'Incorrect. Green tea contains antioxidants but lacks evidence to replace foundational sodium and potassium dietary adjustments.');
  insertQOpt.run(q1_q2, 'A zero-carbohydrate diet regardless of saturated fat and sodium consumption', 0, 'Incorrect. Very high sodium and saturated fat intake can worsen endothelial stiffness and renal filtration pressures.');
  insertQOpt.run(q1_q2, 'Taking high-dose calcium supplements without dietary changes', 0, 'Incorrect. Unregulated calcium supplementation does not lower vascular resistance and may increase arterial calcification risks.');

  const q1_q3 = insertQQ.run(
    q1Id,
    'What is the recommended protocol before taking a resting home blood pressure measurement?',
    'Action',
    'Sitting quietly with supported back and uncrossed legs for 5 minutes, arm rested at heart level, avoiding caffeine/nicotine for 30 minutes.',
    'Measuring immediately after rushing into a room or while actively conversing creates false spikes.'
  ).lastInsertRowid;

  insertQOpt.run(q1_q3, 'Measure immediately after climbing stairs to capture peak exertional response', 0, 'Incorrect. Standard home monitoring requires resting baseline pressure, not post-exertional peaks.');
  insertQOpt.run(q1_q3, 'Rest quietly for 5 minutes, arm supported at heart level, back supported, without talking', 1, 'Correct! This standardized positioning prevents postural and emotional artifacts from distorting readings.');
  insertQOpt.run(q1_q3, 'Drink a large espresso 10 minutes beforehand to stimulate blood flow', 0, 'Incorrect. Caffeine causes transient acute vasoconstriction, inflating readings by 5-10 mmHg.');
  insertQOpt.run(q1_q3, 'Stand upright with the arm hanging loose at the side', 0, 'Incorrect. Standing causes hydrostatic gravity shifts; the cuff must be at precise cardiac level while seated.');

  const q1_q4 = insertQQ.run(
    q1Id,
    'True or False: If your blood pressure reading was normal during your annual doctor visit three years ago, you do not need to check it again until age 60.',
    'Myth Awareness',
    'Blood pressure increases progressively with age and lifestyle shifts; adults should screen at least annually or more frequently if elevated.',
    'Vascular stiffness evolves over time; assuming a 3-year-old clinic reading remains static is dangerous.'
  ).lastInsertRowid;

  insertQOpt.run(q1_q4, 'True, blood pressure remains fixed once set in early adulthood', 0, 'Incorrect. Vascular compliance and lifestyle factors change continuously throughout adult life.');
  insertQOpt.run(q1_q4, 'False, blood pressure evolves with arterial age and should be checked at least once per year', 1, 'Correct! Annual screening is universally recommended for all adults, with more frequent checks if borderline.');

  // Quiz Results for Clara
  const insertQuizRes = db.prepare(`
    INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, percentage, category_breakdown_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertQuizRes.run(
    2,
    q1Id,
    4,
    4,
    100,
    JSON.stringify({
      'Understanding': { correct: 1, total: 1 },
      'Prevention': { correct: 1, total: 1 },
      'Action': { correct: 1, total: 1 },
      'Myth Awareness': { correct: 1, total: 1 }
    })
  );

  // Campaigns
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (slug, title, subtitle, category, goal_statement, target_participants, current_participants, start_date, end_date, is_active, hero_quote, content_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCampaign.run(
    'know-your-numbers',
    'Under Pressure: Know Your Baseline Numbers',
    'A community initiative to bring 10,000 individuals from silent vascular risk to regular home blood pressure monitoring.',
    'Cardiovascular Health',
    'Empower individuals to record a verified 7-day home blood pressure average and discuss target ranges with their doctor.',
    10000,
    4820,
    '2026-09-01',
    '2026-11-30',
    1,
    'You cannot manage what you do not measure. A 5-minute home test can protect 30 years of vascular health.',
    JSON.stringify({
      pillars: ['Test baseline BP', 'Complete 7-day log', 'Adopt sodium reduction', 'Review with physician'],
      resourceSummary: 'Downloadable 7-day ambulatory monitoring worksheet, sodium rebalance meal guide, and doctor discussion cards.',
      actions: [
        'Take your resting blood pressure twice daily for 7 days',
        'Replace processed snack sodium with mineral-rich whole foods',
        'Share this awareness check with one family member'
      ]
    })
  );

  insertCampaign.run(
    'demystifying-prediabetes',
    'Sugar & Cell: The Pre-Diabetes Window',
    'Translating cellular biology into practical daily habits before pancreatic beta cells exhaust their reserve.',
    'Metabolic Health',
    'Help 5,000 people at risk of pre-diabetes take action through muscular glucose disposal habits and post-meal movement.',
    5000,
    3140,
    '2026-10-01',
    '2026-12-31',
    1,
    'Pre-diabetes is not a pre-destined illness; it is the human body\'s clearest warning and greatest opportunity.',
    JSON.stringify({
      pillars: ['Check HbA1c', '10-min post-meal walk', 'Fiber-first nutrition', 'Resistance training'],
      resourceSummary: 'Metabolic awareness primer, meal ordering cheat-sheet, and lab interpretation walkthrough.',
      actions: [
        'Learn your latest HbA1c percentage',
        'Commit to a 10-minute walk after your heaviest daily meal',
        'Add 2 resistance training sessions to your weekly routine'
      ]
    })
  );

  insertCampaign.run(
    'breathing-room',
    'Breathing Room: Recognizing Silent Airway Inflammation',
    'Dispelling misconceptions surrounding chronic nocturnal cough and early bronchial hyper-responsiveness.',
    'Respiratory Health',
    'Encourage 3,000 individuals with unresolved chronic cough to complete spirometry assessments and build an Asthma Action Plan.',
    3000,
    1890,
    '2026-08-15',
    '2026-11-15',
    1,
    'A cough that wakes you night after night is not just a stubborn cold. Your airways are speaking.',
    JSON.stringify({
      pillars: ['Identify nocturnal cough', 'Spirometry confirmation', 'Trigger mapping', 'Action plan'],
      resourceSummary: 'GINA guidelines summary, environmental trigger audit, and peak flow logging guide.',
      actions: [
        'Track nighttime cough patterns for 14 days',
        'Eliminate indoor combustion and tobacco exposures',
        'Discuss spirometry with your family physician'
      ]
    })
  );

  // Campaign Participants
  const insertCampPart = db.prepare('INSERT INTO campaign_participants (campaign_id, user_id, pledge_text) VALUES (?, ?, ?)');
  insertCampPart.run(1, 2, 'I pledge to measure and record my resting blood pressure for 7 consecutive days and share the log with my family doctor.');

  // Resources
  const insertResource = db.prepare(`
    INSERT INTO resources (disease_id, title, resource_type, organization, url_reference, summary)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertResource.run(
    diseaseMap['hypertension'],
    '2023 Practice Guideline for the Management of Arterial Hypertension',
    'Clinical Guideline',
    'European Society of Hypertension (ESH)',
    'https://www.eshonline.org',
    'Comprehensive evidence-based recommendations on office and home blood pressure thresholds, lifestyle interventions, and therapy algorithms.'
  );

  insertResource.run(
    diseaseMap['hypertension'],
    'DASH Eating Plan: Reducing Blood Pressure with Nutrition',
    'Patient Guide',
    'National Heart, Lung, and Blood Institute (NHLBI)',
    'https://www.nhlbi.nih.gov',
    'Structured dietary guide focusing on daily potassium, magnesium, calcium, and sodium targets proven to lower vascular resistance.'
  );

  insertResource.run(
    diseaseMap['type-2-diabetes'],
    'Standards of Care in Diabetes — 2024 Prevention Guidelines',
    'Clinical Guideline',
    'American Diabetes Association (ADA)',
    'https://diabetes.org',
    'Authoritative clinical guidance on pre-diabetes identification, lifestyle intervention protocols, and microvascular screening schedules.'
  );

  insertResource.run(
    diseaseMap['pcos'],
    'International Evidence-Based Guideline for the Assessment and Management of PCOS',
    'Clinical Guideline',
    'Monash University & International PCOS Network',
    'https://www.monash.edu/medicine/sphpm/mchri/pcos',
    'Rigorous multidisciplinary guideline covering diagnostic criteria, emotional wellbeing, metabolic screening, and reproductive care.'
  );

  // Submissions
  const insertSub = db.prepare(`
    INSERT INTO submissions (user_id, submission_type, title, content, author_name, author_email, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertSub.run(
    2,
    'question_suggestion',
    'Question for Pre-diabetes: Fasting Insulin vs HbA1c',
    'Could we add a doctor question asking whether fasting insulin or HOMA-IR is helpful for younger patients whose HbA1c is still borderline 5.6%?',
    'Clara Henderson',
    'clara@example.com',
    'reviewed'
  );

  insertSub.run(
    null,
    'feedback',
    'Appreciation for the non-alarmist warning sign explanations',
    'I found the biological mechanisms under warning signs so refreshing. Instead of scaring me with WebMD-style cancer results, it explained why dehydration happens in high glucose.',
    'Marcus Vance',
    'marcus.v@example.com',
    'published'
  );

  console.log('Database seeding successfully completed with 10 diseases, 25+ warning signs, risk factors, 5 prevention pillars, myths, quizzes, and campaigns!');
}

seedDatabase();
