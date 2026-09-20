export type Language = 'en' | 'hi' | 'hinglish';

export type EligibilityStatus = 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NEAR_MISS' | 'NOT_ELIGIBLE';

export type OccupationType = 
  | 'Student'
  | 'Farmer'
  | 'Entrepreneur'
  | 'Self-Employed'
  | 'Salaried Employee'
  | 'Daily Wage Worker / Laborer'
  | 'Artisan / Craftsperson'
  | 'Unemployed'
  | 'Homemaker'
  | 'Senior Citizen / Retired'
  | 'Other';

export type SocialCategory = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';

export type GenderType = 'Male' | 'Female' | 'Transgender' | 'All';

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: GenderType;
  state?: string;
  district?: string;
  residenceType?: 'Rural' | 'Urban';
  occupation?: OccupationType;
  annual_income?: number; // in INR
  category?: SocialCategory;
  is_student?: boolean;
  education_level?: 'School' | 'Undergraduate' | 'Postgraduate' | 'Vocational' | 'Diploma' | 'None';
  is_farmer?: boolean;
  land_size_acres?: number;
  owns_business?: boolean;
  business_type?: string;
  annual_turnover?: number;
  is_disabled?: boolean;
  disability_percentage?: number;
  marital_status?: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  family_members?: number;
  has_bpl_card?: boolean;
  special_conditions?: string[];
}

export interface SchemeRule {
  min_age?: number;
  max_age?: number;
  allowed_genders?: GenderType[];
  states?: string[]; // "All India" or specific states
  occupations?: OccupationType[];
  max_income?: number; // annual family income in INR
  min_income?: number;
  eligible_categories?: SocialCategory[];
  requires_student?: boolean;
  requires_farmer?: boolean;
  max_land_acres?: number;
  requires_business?: boolean;
  requires_disability?: boolean;
  requires_bpl?: boolean;
  marital_statuses?: string[];
  education_levels?: string[];
}

export interface Scheme {
  id: string;
  name: string;
  hindi_name?: string;
  department: string;
  ministry: string;
  category: 
    | 'Education'
    | 'Scholarships'
    | 'Agriculture'
    | 'Farmer support'
    | 'Women & child welfare'
    | 'Employment'
    | 'Entrepreneurship'
    | 'Startup support'
    | 'Housing'
    | 'Healthcare'
    | 'Disability support'
    | 'Senior citizens'
    | 'Financial inclusion'
    | 'Skill development'
    | 'Social welfare';
  level: 'Central' | 'State';
  states: string[]; // ['All India'] or specific states
  benefits: string;
  benefit_type: 'Direct Cash Transfer' | 'Subsidy' | 'Loan / Credit' | 'Scholarship' | 'Insurance' | 'Skill Training' | 'In-kind Benefit' | 'Financial inclusion' | 'Social Security / Pension';
  estimated_benefit_amount?: string;
  rules: SchemeRule;
  documents: string[];
  application_process: string[];
  application_url: string;
  source_url: string;
  last_verified: string;
  tags: string[];
  overview: string;
}

export interface RuleEvaluationDetail {
  criterion: string;
  passed: boolean;
  userValue: string;
  requiredValue: string;
  isNearMiss?: boolean;
  notes?: string;
}

export interface EligibilityEvaluation {
  schemeId: string;
  scheme: Scheme;
  status: EligibilityStatus;
  score: number; // 0 to 100
  matchedReasons: string[];
  failedReasons: string[];
  pendingReasons?: string[];
  nearMissExplanation?: string;
  requiredChange?: string;
  ruleDetails: RuleEvaluationDetail[];
}

export interface ConversationalStep {
  id: string;
  field: keyof UserProfile;
  question: {
    en: string;
    hi: string;
    hinglish: string;
  };
  placeholder: {
    en: string;
    hi: string;
    hinglish: string;
  };
  helpText?: {
    en: string;
    hi: string;
    hinglish: string;
  };
  quickReplies?: Array<{
    label: { en: string; hi: string; hinglish: string };
    value: any;
  }>;
  inputType: 'text' | 'number' | 'select' | 'radio' | 'currency';
  validation?: (value: any) => boolean | string;
}

export interface DocumentStatus {
  [documentName: string]: 'available' | 'missing';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: Language;
  suggestedQuestions?: string[];
  groundedSchemes?: Scheme[];
}
