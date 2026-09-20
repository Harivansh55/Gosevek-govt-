import { Language, UserProfile, ConversationalStep, OccupationType, SocialCategory, GenderType } from '../types';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

export const CONVERSATIONAL_STEPS: ConversationalStep[] = [
  {
    id: 'step_name',
    field: 'name',
    question: {
      en: "Namaste! Welcome to GOVSAHAYAK. What is your name?",
      hi: "नमस्ते! GOVSAHAYAK में आपका स्वागत है। आपका शुभ नाम क्या है?",
      hinglish: "Namaste! GOVSAHAYAK me aapka swagat hai. Aapka shubh naam kya hai?"
    },
    placeholder: {
      en: "E.g., Priya Sharma or Ramesh Patel",
      hi: "उदा. प्रिया शर्मा या रमेश पटेल",
      hinglish: "Eg. Priya Sharma ya Ramesh Patel"
    },
    inputType: 'text'
  },
  {
    id: 'step_age',
    field: 'age',
    question: {
      en: "What is your age in years?",
      hi: "आपकी उम्र (आयु) कितने वर्ष है?",
      hinglish: "Aapki age kitne saal hai?"
    },
    placeholder: {
      en: "E.g., 21 or 'I am 21 years old'",
      hi: "उदा. 21 वर्ष या 'मेरी उम्र 21 है'",
      hinglish: "E.g. 21 ya 'Meri age 21 hai'"
    },
    quickReplies: [
      { label: { en: "18 years", hi: "18 वर्ष", hinglish: "18 saal" }, value: 18 },
      { label: { en: "21 years", hi: "21 वर्ष", hinglish: "21 saal" }, value: 21 },
      { label: { en: "25 years", hi: "25 वर्ष", hinglish: "25 saal" }, value: 25 },
      { label: { en: "35 years", hi: "35 वर्ष", hinglish: "35 saal" }, value: 35 },
      { label: { en: "60+ years", hi: "60+ वर्ष (वरिष्ठ)", hinglish: "60+ saal" }, value: 62 }
    ],
    inputType: 'number'
  },
  {
    id: 'step_gender',
    field: 'gender',
    question: {
      en: "What is your gender?",
      hi: "आपका लिंग (Gender) क्या है?",
      hinglish: "Aapka gender kya hai?"
    },
    placeholder: {
      en: "Select or type Male / Female",
      hi: "पुरुष / महिला चुनें या लिखें",
      hinglish: "Male / Female select ya type karein"
    },
    quickReplies: [
      { label: { en: "Female", hi: "महिला", hinglish: "Female / Mahila" }, value: 'Female' },
      { label: { en: "Male", hi: "पुरुष", hinglish: "Male / Purush" }, value: 'Male' },
      { label: { en: "Transgender", hi: "ट्रांसजेंडर", hinglish: "Transgender" }, value: 'Transgender' }
    ],
    inputType: 'radio'
  },
  {
    id: 'step_state',
    field: 'state',
    question: {
      en: "Which Indian state or union territory do you reside in?",
      hi: "आप भारत के किस राज्य या केंद्र शासित प्रदेश में रहते हैं?",
      hinglish: "Aap India ke kis State me rehte hain?"
    },
    placeholder: {
      en: "E.g., Rajasthan, Gujarat, UP, Maharashtra",
      hi: "उदा. राजस्थान, गुजरात, उत्तर प्रदेश, महाराष्ट्र",
      hinglish: "E.g. Rajasthan, Gujarat, UP, Maharashtra"
    },
    quickReplies: [
      { label: { en: "Rajasthan", hi: "राजस्थान", hinglish: "Rajasthan" }, value: 'Rajasthan' },
      { label: { en: "Gujarat", hi: "गुजरात", hinglish: "Gujarat" }, value: 'Gujarat' },
      { label: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", hinglish: "Uttar Pradesh" }, value: 'Uttar Pradesh' },
      { label: { en: "Madhya Pradesh", hi: "मध्य प्रदेश", hinglish: "Madhya Pradesh" }, value: 'Madhya Pradesh' },
      { label: { en: "Maharashtra", hi: "महाराष्ट्र", hinglish: "Maharashtra" }, value: 'Maharashtra' },
      { label: { en: "Bihar", hi: "बिहार", hinglish: "Bihar" }, value: 'Bihar' }
    ],
    inputType: 'text'
  },
  {
    id: 'step_occupation',
    field: 'occupation',
    question: {
      en: "What is your primary occupation or current status?",
      hi: "आपका मुख्य व्यवसाय या वर्तमान स्थिति क्या है?",
      hinglish: "Aapka main profession ya current status kya hai?"
    },
    placeholder: {
      en: "E.g., Student, Farmer, Small Business, Job Seeker",
      hi: "उदा. छात्र, किसान, व्यापारी, बेरोजगार",
      hinglish: "E.g. Student, Farmer, Business, Job Seeker"
    },
    quickReplies: [
      { label: { en: "Student", hi: "विद्यार्थी / छात्र", hinglish: "Student / Padhai" }, value: 'Student' },
      { label: { en: "Farmer", hi: "किसान (कृषि)", hinglish: "Farmer / Kheti" }, value: 'Farmer' },
      { label: { en: "Entrepreneur / Business", hi: "उद्यमी / व्यापारी", hinglish: "Business / Dukaan" }, value: 'Entrepreneur' },
      { label: { en: "Artisan / Craftsperson", hi: "कारीगर / शिल्पकार", hinglish: "Artisan / Karigar" }, value: 'Artisan / Craftsperson' },
      { label: { en: "Daily Wage / Worker", hi: "श्रमिक / दैनिक वेतन", hinglish: "Worker / Majdoor" }, value: 'Daily Wage Worker / Laborer' },
      { label: { en: "Unemployed / Job Seeker", hi: "बेरोजगार / नौकरी खोज रहे", hinglish: "Unemployed / Job khoj rahe" }, value: 'Unemployed' },
      { label: { en: "Senior Citizen / Retired", hi: "वरिष्ठ नागरिक", hinglish: "Senior Citizen" }, value: 'Senior Citizen / Retired' }
    ],
    inputType: 'radio'
  },
  {
    id: 'step_farmer_land',
    field: 'land_size_acres',
    question: {
      en: "How many acres of cultivable agricultural land does your family hold?",
      hi: "आपके परिवार के पास कितने एकड़ कृषि योग्य भूमि है?",
      hinglish: "Aapke family ke paas kitne acres kheti ki zameen hai?"
    },
    placeholder: {
      en: "E.g., 2.5 acres (or 0 if tenant farmer)",
      hi: "उदा. 2.5 एकड़ (या 0 यदि भूमिहीन हैं)",
      hinglish: "E.g. 2.5 acre ya '2 acre zameen hai'"
    },
    quickReplies: [
      { label: { en: "Less than 2 acres (Small)", hi: "2 एकड़ से कम", hinglish: "< 2 acre (Chhota kisan)" }, value: 1.5 },
      { label: { en: "2 to 5 acres", hi: "2 से 5 एकड़", hinglish: "2-5 acre" }, value: 3.5 },
      { label: { en: "More than 5 acres", hi: "5 एकड़ से अधिक", hinglish: "> 5 acre" }, value: 7 },
      { label: { en: "Landless / Tenant", hi: "भूमिहीन / पट्टेदार", hinglish: "Bhoomiheen / No land" }, value: 0 }
    ],
    inputType: 'number'
  },
  {
    id: 'step_student_level',
    field: 'education_level',
    question: {
      en: "What level of education are you currently pursuing or completed?",
      hi: "आप वर्तमान में किस स्तर की शिक्षा ग्रहण कर रहे हैं या पूरी की है?",
      hinglish: "Aap currently kaunsi class ya degree me padhai kar rahe hain?"
    },
    placeholder: {
      en: "School, College (UG), PG, Diploma",
      hi: "स्कूल, कॉलेज (स्नातक), परास्नातक, डिप्लोमा",
      hinglish: "School, College (UG), PG, Diploma"
    },
    quickReplies: [
      { label: { en: "School (9th-12th)", hi: "स्कूल (9वीं-12वीं)", hinglish: "School (9th-12th)" }, value: 'School' },
      { label: { en: "College / Degree (UG)", hi: "कॉलेज / स्नातक (UG)", hinglish: "College / UG Degree" }, value: 'Undergraduate' },
      { label: { en: "Postgraduate (PG)", hi: "परास्नातक (PG / Masters)", hinglish: "PG / Masters" }, value: 'Postgraduate' },
      { label: { en: "ITI / Diploma / Vocational", hi: "आईटीआई / डिप्लोमा", hinglish: "ITI / Diploma / Skill" }, value: 'Vocational' }
    ],
    inputType: 'radio'
  },
  {
    id: 'step_income',
    field: 'annual_income',
    question: {
      en: "What is your approximate total annual family income?",
      hi: "आपके परिवार की कुल अनुमानित वार्षिक आय (Annual Family Income) कितनी है?",
      hinglish: "Aapke family ki total annual income lagbhag kitni hai?"
    },
    placeholder: {
      en: "E.g., ₹1.5 Lakh, ₹2,00,000, 80000",
      hi: "उदा. ₹1.5 लाख या ₹2,00,000",
      hinglish: "E.g. ₹2 lakh ya ₹1,50,000"
    },
    quickReplies: [
      { label: { en: "Under ₹1 Lakh", hi: "₹1 लाख से कम", hinglish: "< 1 Lakh (Kam aay)" }, value: 80000 },
      { label: { en: "₹1 to ₹2.5 Lakh", hi: "₹1 से ₹2.5 लाख", hinglish: "₹1 - 2.5 Lakh" }, value: 180000 },
      { label: { en: "₹2.5 to ₹5 Lakh", hi: "₹2.5 से ₹5 लाख", hinglish: "₹2.5 - 5 Lakh" }, value: 350000 },
      { label: { en: "₹5 to ₹8 Lakh", hi: "₹5 से ₹8 लाख", hinglish: "₹5 - 8 Lakh" }, value: 650000 },
      { label: { en: "Above ₹8 Lakh", hi: "₹8 लाख से अधिक", hinglish: "> 8 Lakh" }, value: 950000 }
    ],
    inputType: 'currency'
  },
  {
    id: 'step_category',
    field: 'category',
    question: {
      en: "What is your social category? (Many government schemes provide designated reservations/aid)",
      hi: "आपका सामाजिक वर्ग (Category) क्या है? (कई योजनाओं में विशेष सहायता प्रावधान हैं)",
      hinglish: "Aapka social category kya hai? (Govt schemes me specific benefits hote hain)"
    },
    placeholder: {
      en: "General, OBC, SC, ST, EWS, Minority",
      hi: "सामान्य, ओबीसी, एससी, एसटी, ईडब्ल्यूएस, अल्पसंख्यक",
      hinglish: "General, OBC, SC, ST, EWS, Minority"
    },
    quickReplies: [
      { label: { en: "General", hi: "सामान्य (General)", hinglish: "General" }, value: 'General' },
      { label: { en: "OBC", hi: "अन्य पिछड़ा वर्ग (OBC)", hinglish: "OBC" }, value: 'OBC' },
      { label: { en: "SC", hi: "अनुसूचित जाति (SC)", hinglish: "SC" }, value: 'SC' },
      { label: { en: "ST", hi: "अनुसूचित जनजाति (ST)", hinglish: "ST" }, value: 'ST' },
      { label: { en: "EWS", hi: "आर्थिक रूप से कमजोर (EWS)", hinglish: "EWS" }, value: 'EWS' },
      { label: { en: "Minority", hi: "अल्पसंख्यक (Minority)", hinglish: "Minority" }, value: 'Minority' }
    ],
    inputType: 'radio'
  },
  {
    id: 'step_special_conditions',
    field: 'is_disabled',
    question: {
      en: "Do you or any applicant hold a certified Disability (PwD / UDID card) or BPL card?",
      hi: "क्या आपके पास प्रमाणित दिव्यांगता (UDID कार्ड) या बीपीएल राशन कार्ड है?",
      hinglish: "Kya aapke paas certified Disability (UDID card) ya BPL card hai?"
    },
    placeholder: {
      en: "Yes / No / UDID Card / None",
      hi: "हाँ / नहीं / यूडीआईडी / कोई नहीं",
      hinglish: "Yes / No / BPL card hai / None"
    },
    quickReplies: [
      { label: { en: "Yes, PwD / Disability (40%+)", hi: "हाँ, दिव्यांगता (40%+)", hinglish: "Yes, PwD / UDID card" }, value: true },
      { label: { en: "No / None of these", hi: "नहीं / इनमें से कोई नहीं", hinglish: "No, koi nahi" }, value: false }
    ],
    inputType: 'radio'
  }
];

export function getNextStep(profile: UserProfile): ConversationalStep | null {
  if (!profile.name) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_name') || null;
  }
  if (profile.age === undefined) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_age') || null;
  }
  if (!profile.gender) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_gender') || null;
  }
  if (!profile.state) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_state') || null;
  }
  if (!profile.occupation) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_occupation') || null;
  }
  if (profile.occupation === 'Farmer' && profile.land_size_acres === undefined) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_farmer_land') || null;
  }
  if (profile.occupation === 'Student' && !profile.education_level) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_student_level') || null;
  }
  if (profile.annual_income === undefined) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_income') || null;
  }
  if (!profile.category) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_category') || null;
  }
  if (profile.is_disabled === undefined) {
    return CONVERSATIONAL_STEPS.find(s => s.id === 'step_special_conditions') || null;
  }

  return null; // Profile intake completed!
}

// Local Natural Language Understanding (NLU) Parser for English / Hindi / Hinglish
export function parseConversationalAnswer(text: string, currentField: keyof UserProfile): { updatedProfile: Partial<UserProfile>; detectedField: string; parsedValue: any } {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const result: Partial<UserProfile> = {};

  // Age parsing
  if (currentField === 'age' || lower.includes('age') || lower.includes('saal') || lower.includes('वर्ष') || lower.includes('umar')) {
    const match = lower.match(/(?:age|umar|saal|varsh|hai|am|i am|is)?\s*(\d{1,3})/i);
    if (match && match[1]) {
      const parsedAge = parseInt(match[1], 10);
      if (parsedAge >= 1 && parsedAge <= 120) {
        result.age = parsedAge;
        return { updatedProfile: result, detectedField: 'age', parsedValue: parsedAge };
      }
    }
  }

  // Name parsing
  if (currentField === 'name') {
    const nameMatch = clean.replace(/^(my name is|mera naam|naam|i am|iam|namaste|im)\s+/i, '').trim();
    const finalName = nameMatch || clean;
    result.name = finalName;
    return { updatedProfile: result, detectedField: 'name', parsedValue: finalName };
  }

  // Gender parsing
  if (currentField === 'gender' || lower.includes('female') || lower.includes('male') || lower.includes('mahila') || lower.includes('purush') || lower.includes('ladka') || lower.includes('ladki') || lower.includes('aurat') || lower.includes('aadmi')) {
    if (lower.includes('female') || lower.includes('mahila') || lower.includes('woman') || lower.includes('girl') || lower.includes('ladki') || lower.includes('aurat') || lower.includes('stree')) {
      result.gender = 'Female';
      return { updatedProfile: result, detectedField: 'gender', parsedValue: 'Female' };
    } else if (lower.includes('trans')) {
      result.gender = 'Transgender';
      return { updatedProfile: result, detectedField: 'gender', parsedValue: 'Transgender' };
    } else if (lower.includes('male') || lower.includes('purush') || lower.includes('man') || lower.includes('ladka') || lower.includes('aadmi') || lower.includes('boy')) {
      result.gender = 'Male';
      return { updatedProfile: result, detectedField: 'gender', parsedValue: 'Male' };
    }
  }

  // State parsing
  if (currentField === 'state' || lower.includes('state') || lower.includes('rajya') || lower.includes('se hu') || lower.includes('from')) {
    for (const st of INDIAN_STATES) {
      if (lower.includes(st.toLowerCase())) {
        result.state = st;
        return { updatedProfile: result, detectedField: 'state', parsedValue: st };
      }
    }
    // Shortcuts like UP, MP, AP
    if (/\bup\b|uttar pradesh/i.test(lower)) {
      result.state = 'Uttar Pradesh';
      return { updatedProfile: result, detectedField: 'state', parsedValue: 'Uttar Pradesh' };
    }
    if (/\bmp\b|madhya pradesh/i.test(lower)) {
      result.state = 'Madhya Pradesh';
      return { updatedProfile: result, detectedField: 'state', parsedValue: 'Madhya Pradesh' };
    }
    if (/\bap\b|andhra/i.test(lower)) {
      result.state = 'Andhra Pradesh';
      return { updatedProfile: result, detectedField: 'state', parsedValue: 'Andhra Pradesh' };
    }
    // Fallback if typed directly in state step
    if (currentField === 'state') {
      const directState = clean.replace(/^(i am from|main|me|from|state is|mera state)\s+/i, '').replace(/\s+(se hu|se|state)$/i, '').trim();
      result.state = directState;
      return { updatedProfile: result, detectedField: 'state', parsedValue: directState };
    }
  }

  // Occupation parsing
  if (currentField === 'occupation' || lower.includes('student') || lower.includes('farmer') || lower.includes('kheti') || lower.includes('business') || lower.includes('dukaan') || lower.includes('kisan')) {
    if (lower.includes('student') || lower.includes('padh') || lower.includes('college') || lower.includes('school') || lower.includes('chhatra') || lower.includes('vidyarthi')) {
      result.occupation = 'Student';
      result.is_student = true;
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Student' };
    } else if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('kheti') || lower.includes('krishi')) {
      result.occupation = 'Farmer';
      result.is_farmer = true;
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Farmer' };
    } else if (lower.includes('business') || lower.includes('entrepreneur') || lower.includes('startup') || lower.includes('dukaan') || lower.includes('shop') || lower.includes('vyapar')) {
      result.occupation = 'Entrepreneur';
      result.owns_business = true;
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Entrepreneur' };
    } else if (lower.includes('artisan') || lower.includes('karigar') || lower.includes('craft') || lower.includes('vishwakarma') || lower.includes('carpenter') || lower.includes('potter')) {
      result.occupation = 'Artisan / Craftsperson';
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Artisan / Craftsperson' };
    } else if (lower.includes('worker') || lower.includes('mazdoor') || lower.includes('majdoor') || lower.includes('daily wage') || lower.includes('shramik') || lower.includes('vendor')) {
      result.occupation = 'Daily Wage Worker / Laborer';
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Daily Wage Worker / Laborer' };
    } else if (lower.includes('unemployed') || lower.includes('berojgar') || lower.includes('job search') || lower.includes('no job') || lower.includes('fresher')) {
      result.occupation = 'Unemployed';
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Unemployed' };
    } else if (lower.includes('senior') || lower.includes('retired') || lower.includes('pension')) {
      result.occupation = 'Senior Citizen / Retired';
      return { updatedProfile: result, detectedField: 'occupation', parsedValue: 'Senior Citizen / Retired' };
    }
  }

  // Farmer land size parsing
  if (currentField === 'land_size_acres' || lower.includes('acre') || lower.includes('bigha') || lower.includes('zameen') || lower.includes('hectare')) {
    const landNumMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acre|ekad|bigha|hectare)?/);
    if (landNumMatch && landNumMatch[1]) {
      const landVal = parseFloat(landNumMatch[1]);
      result.land_size_acres = landVal;
      result.is_farmer = true;
      return { updatedProfile: result, detectedField: 'land_size_acres', parsedValue: landVal };
    }
  }

  // Student level parsing
  if (currentField === 'education_level') {
    if (lower.includes('school') || lower.includes('10th') || lower.includes('12th') || lower.includes('matric')) {
      result.education_level = 'School';
      return { updatedProfile: result, detectedField: 'education_level', parsedValue: 'School' };
    } else if (lower.includes('ug') || lower.includes('graduat') || lower.includes('btech') || lower.includes('ba') || lower.includes('bsc') || lower.includes('bcom') || lower.includes('college')) {
      result.education_level = 'Undergraduate';
      return { updatedProfile: result, detectedField: 'education_level', parsedValue: 'Undergraduate' };
    } else if (lower.includes('pg') || lower.includes('post') || lower.includes('master') || lower.includes('mtech') || lower.includes('mba') || lower.includes('msc')) {
      result.education_level = 'Postgraduate';
      return { updatedProfile: result, detectedField: 'education_level', parsedValue: 'Postgraduate' };
    } else if (lower.includes('iti') || lower.includes('diploma') || lower.includes('polytechnic') || lower.includes('vocation')) {
      result.education_level = 'Vocational';
      return { updatedProfile: result, detectedField: 'education_level', parsedValue: 'Vocational' };
    }
  }

  // Income parsing (e.g. 2 lakh, 1.5L, 200000, 80k)
  if (currentField === 'annual_income' || lower.includes('income') || lower.includes('lakh') || lower.includes('hazar') || lower.includes('aay')) {
    // "2.5 lakh" / "2 lakh"
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|लाख)/i);
    if (lakhMatch && lakhMatch[1]) {
      const val = parseFloat(lakhMatch[1]) * 100000;
      result.annual_income = val;
      return { updatedProfile: result, detectedField: 'annual_income', parsedValue: val };
    }
    // "50k" / "80 hazar"
    const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:k|hazar|thousand|हजार)/i);
    if (kMatch && kMatch[1]) {
      const val = parseFloat(kMatch[1]) * 1000;
      result.annual_income = val;
      return { updatedProfile: result, detectedField: 'annual_income', parsedValue: val };
    }
    // pure number e.g. 180000
    const rawNumMatch = lower.replace(/,/g, '').match(/\b(\d{4,8})\b/);
    if (rawNumMatch && rawNumMatch[1]) {
      const val = parseInt(rawNumMatch[1], 10);
      result.annual_income = val;
      return { updatedProfile: result, detectedField: 'annual_income', parsedValue: val };
    }
  }

  // Category parsing
  if (currentField === 'category' || lower.includes('obc') || lower.includes('sc') || lower.includes('st') || lower.includes('general') || lower.includes('ews') || lower.includes('minority')) {
    if (lower.includes('obc')) {
      result.category = 'OBC';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'OBC' };
    } else if (lower.includes('sc') && !lower.includes('scholar')) {
      result.category = 'SC';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'SC' };
    } else if (lower.includes('st')) {
      result.category = 'ST';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'ST' };
    } else if (lower.includes('ews')) {
      result.category = 'EWS';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'EWS' };
    } else if (lower.includes('minority') || lower.includes('muslim') || lower.includes('christian') || lower.includes('sikh') || lower.includes('jain') || lower.includes('buddhist')) {
      result.category = 'Minority';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'Minority' };
    } else if (lower.includes('general') || lower.includes('samanya') || lower.includes('open')) {
      result.category = 'General';
      return { updatedProfile: result, detectedField: 'category', parsedValue: 'General' };
    }
  }

  // Disability parsing
  if (currentField === 'is_disabled' || lower.includes('disab') || lower.includes('divyang') || lower.includes('udid') || lower.includes('handicap')) {
    if (lower.includes('yes') || lower.includes('haan') || lower.includes('ha') || lower.includes('disabled') || lower.includes('divyang') || lower.includes('udid')) {
      result.is_disabled = true;
      return { updatedProfile: result, detectedField: 'is_disabled', parsedValue: true };
    } else {
      result.is_disabled = false;
      return { updatedProfile: result, detectedField: 'is_disabled', parsedValue: false };
    }
  }

  return { updatedProfile: result, detectedField: currentField as string, parsedValue: clean };
}
