import { UserProfile } from '../types';

export interface SampleProfileItem {
  id: string;
  title: string;
  subtitle: string;
  avatarIcon: string;
  profile: UserProfile;
  expectedHighlights: string[];
}

export const SAMPLE_PROFILES: SampleProfileItem[] = [
  {
    id: 'sample_student',
    title: 'Priya Sharma (College Student)',
    subtitle: '21 yrs • Gujarat • OBC • College Undergraduate',
    avatarIcon: 'GraduationCap',
    profile: {
      name: 'Priya Sharma',
      age: 21,
      gender: 'Female',
      state: 'Gujarat',
      residenceType: 'Urban',
      occupation: 'Student',
      is_student: true,
      education_level: 'Undergraduate',
      annual_income: 180000,
      category: 'OBC',
      is_disabled: false,
      marital_status: 'Single',
    },
    expectedHighlights: [
      'Post Matric Scholarship for OBC (100% tuition + allowance)',
      'CSSS College Merit Scholarship (₹12,000/yr)',
      'PMKVY 4.0 Free Industry Certifications'
    ]
  },
  {
    id: 'sample_farmer',
    title: 'Ramesh Patel (Small Farmer)',
    subtitle: '48 yrs • Madhya Pradesh • Farmer • 3.5 Acres Land',
    avatarIcon: 'Tractor',
    profile: {
      name: 'Ramesh Patel',
      age: 48,
      gender: 'Male',
      state: 'Madhya Pradesh',
      residenceType: 'Rural',
      occupation: 'Farmer',
      is_farmer: true,
      land_size_acres: 3.5,
      annual_income: 150000,
      category: 'General',
      is_disabled: false,
      marital_status: 'Married',
      family_members: 5
    },
    expectedHighlights: [
      'PM-KISAN (₹6,000 direct transfer/year)',
      'Kisan Credit Card (KCC) up to ₹3 Lakh @ 4% interest',
      'PM Fasal Bima Yojana (Crop loss insurance)'
    ]
  },
  {
    id: 'sample_woman_entrepreneur',
    title: 'Sunita Devi (Woman Entrepreneur)',
    subtitle: '34 yrs • Rajasthan • SC Category • Micro Enterprise',
    avatarIcon: 'Briefcase',
    profile: {
      name: 'Sunita Devi',
      age: 34,
      gender: 'Female',
      state: 'Rajasthan',
      residenceType: 'Rural',
      occupation: 'Entrepreneur',
      owns_business: true,
      annual_income: 220000,
      category: 'SC',
      is_disabled: false,
      marital_status: 'Married'
    },
    expectedHighlights: [
      'Stand-Up India Scheme (₹10 Lakh to ₹1 Crore enterprise loan)',
      'PM Mudra Yojana (PMMY) collateral-free credit',
      'PM Ujjwala Yojana 2.0 (Free LPG connection)',
      'Mukhyamantri Ayushman Arogya (Rajasthan ₹25 Lakh cover)'
    ]
  },
  {
    id: 'sample_youth_unemployed',
    title: 'Amit Kumar (Job Seeker / Youth)',
    subtitle: '22 yrs • Bihar • EWS • Technical Diploma',
    avatarIcon: 'UserCheck',
    profile: {
      name: 'Amit Kumar',
      age: 22,
      gender: 'Male',
      state: 'Bihar',
      residenceType: 'Rural',
      occupation: 'Unemployed',
      education_level: 'Vocational',
      annual_income: 95000,
      category: 'EWS',
      is_disabled: false,
      marital_status: 'Single'
    },
    expectedHighlights: [
      'PM Kaushal Vikas Yojana 4.0 (Skill certification & placement)',
      'National Apprenticeship Promotion Scheme (NAPS monthly stipend)',
      'PMEGP Subsidy (Up to 35% margin money for new unit)'
    ]
  },
  {
    id: 'sample_senior',
    title: 'Krishnan Iyer (Senior Citizen)',
    subtitle: '66 yrs • Tamil Nadu • Retired • Low Income',
    avatarIcon: 'HeartPulse',
    profile: {
      name: 'Krishnan Iyer',
      age: 66,
      gender: 'Male',
      state: 'Tamil Nadu',
      residenceType: 'Urban',
      occupation: 'Senior Citizen / Retired',
      annual_income: 110000,
      category: 'General',
      is_disabled: false,
      marital_status: 'Married'
    },
    expectedHighlights: [
      'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
      'Rashtriya Vayoshri Yojana (Free assisted living devices)',
      'Ayushman Bharat PM-JAY (₹5 Lakh family health cover)'
    ]
  }
];
