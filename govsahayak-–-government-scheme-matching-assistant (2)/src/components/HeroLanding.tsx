import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  Users, 
  Coins, 
  GraduationCap, 
  Tractor, 
  Briefcase, 
  HeartHandshake, 
  HeartPulse, 
  ExternalLink 
} from 'lucide-react';
import { Language } from '../types';
import { SAMPLE_PROFILES, SampleProfileItem } from '../data/sampleProfiles';

interface HeroLandingProps {
  onStartIntake: () => void;
  onSelectSampleProfile: (sample: SampleProfileItem) => void;
  onExploreDirectory: (category?: string) => void;
  language: Language;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartIntake,
  onSelectSampleProfile,
  onExploreDirectory,
  language,
}) => {
  const content = {
    en: {
      headline: "Find Government Schemes You May Be Eligible For",
      subtitle: "Answer a few simple conversational questions and discover central & state government schemes precisely matched to your profile.",
      ctaButton: "Find My Schemes",
      secondaryCta: "Try Sample Profiles",
      stats: [
        { label: "Verified Schemes", value: "28+" },
        { label: "Ministries Covered", value: "14+" },
        { label: "Rule Accuracy", value: "100%" },
        { label: "Max Direct Benefit", value: "₹25 Lakh" }
      ],
      howItWorksTitle: "How GOVSAHAYAK Works",
      steps: [
        {
          num: "1",
          title: "Tell us about yourself",
          desc: "Answer 5–8 simple questions about your age, location, occupation, and family income."
        },
        {
          num: "2",
          title: "Deterministic Rule Engine",
          desc: "Our zero-hallucination engine rigorously validates your profile against official government eligibility criteria."
        },
        {
          num: "3",
          title: "Discover Matched Schemes",
          desc: "View clearly ranked eligible schemes, alongside 'Almost Eligible' near-miss recommendations."
        },
        {
          num: "4",
          title: "Prepare Documents",
          desc: "Interactive checklist to track Aadhaar, income certificates, land records, and student IDs."
        },
        {
          num: "5",
          title: "Apply via Official Portals",
          desc: "Direct official government links (myScheme, PM-KISAN, NSP) with step-by-step instructions."
        }
      ]
    },
    hi: {
      headline: "जानिए किन सरकारी योजनाओं के लिए आप पात्र हैं",
      subtitle: "कुछ सरल बातचीत के प्रश्नों के उत्तर दें और अपनी प्रोफाइल के अनुसार केंद्र एवं राज्य सरकार की लाभकारी योजनाएं खोजें।",
      ctaButton: "मेरी योजनाएं खोजें",
      secondaryCta: "डेमो प्रोफाइल देखें",
      stats: [
        { label: "सत्यापित योजनाएं", value: "28+" },
        { label: "संबद्ध मंत्रालय", value: "14+" },
        { label: "नियम सटीकता", value: "100%" },
        { label: "अधिकतम स्वास्थ्य लाभ", value: "₹25 लाख" }
      ],
      howItWorksTitle: "यह कैसे कार्य करता है?",
      steps: [
        {
          num: "1",
          title: "अपनी जानकारी साझा करें",
          desc: "उम्र, राज्य, व्यवसाय और पारिवारिक आय से संबंधित 5-8 आसान प्रश्नों के उत्तर दें।"
        },
        {
          num: "2",
          title: "नियम-आधारित पात्रता जांच",
          desc: "हमारा सुरक्षित इंजन बिना किसी भ्रम के आधिकारिक सरकारी नियमों के अनुसार पात्रता जांचता है।"
        },
        {
          num: "3",
          title: "अनुकूल योजनाएं देखें",
          desc: "पात्र योजनाएं और 'लगभग पात्र' (Near-Miss) सुझाव स्पष्ट कारणों के साथ प्राप्त करें।"
        },
        {
          num: "4",
          title: "आवश्यक दस्तावेज तैयार करें",
          desc: "आधार, आय प्रमाण पत्र, जमीन के कागजात आदि के लिए आसान चेकलिस्ट।"
        },
        {
          num: "5",
          title: "आधिकारिक पोर्टल पर आवेदन करें",
          desc: "myScheme, PM-KISAN, NSP जैसे आधिकारिक पोर्टल्स के सीधे लिंक और चरणबद्ध निर्देश।"
        }
      ]
    },
    hinglish: {
      headline: "Find Government Schemes You May Be Eligible For",
      subtitle: "Sirf 5–8 aasan sawalon ke jawab dein aur discover karein central aur state government schemes jo aapke profile se match karti hain.",
      ctaButton: "Find My Schemes",
      secondaryCta: "Try Sample Profiles",
      stats: [
        { label: "Verified Schemes", value: "28+" },
        { label: "Ministries Covered", value: "14+" },
        { label: "Rule Accuracy", value: "100%" },
        { label: "Max Direct Benefit", value: "₹25 Lakh" }
      ],
      howItWorksTitle: "How It Works (Process)",
      steps: [
        {
          num: "1",
          title: "Tell us about yourself",
          desc: "Age, State, profession, aur annual income ke 5-8 quick questions ka answer karein."
        },
        {
          num: "2",
          title: "Deterministic Rule Engine",
          desc: "No hallucination! Pure rule-based code checks your eligibility against real govt gazette criteria."
        },
        {
          num: "3",
          title: "Discover Matched Schemes",
          desc: "Eligible schemes dekhein plus 'Almost Eligible' near-miss schemes with exact reasons."
        },
        {
          num: "4",
          title: "Prepare Documents",
          desc: "Interactive checklist to track Aadhaar, income certificate, caste certificate, etc."
        },
        {
          num: "5",
          title: "Apply via Official Portals",
          desc: "Official government portals (pmkisan.gov.in, myscheme.gov.in) par direct apply karein."
        }
      ]
    }
  };

  const t = content[language] || content.en;

  const categories = [
    { name: "Farmer support", label: "Agriculture & Farmers", icon: Tractor, count: "4 Schemes", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Scholarships", label: "Student Scholarships", icon: GraduationCap, count: "4 Schemes", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Entrepreneurship", label: "Business & Loans (MUDRA)", icon: Briefcase, count: "5 Schemes", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Women & child welfare", label: "Women & Child Care", icon: HeartHandshake, count: "4 Schemes", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { name: "Healthcare", label: "Health & Ayushman", icon: HeartPulse, count: "2 Schemes", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { name: "Financial inclusion", label: "Social Security & Pension", icon: Coins, count: "5 Schemes", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>AI Conversational Intake + Deterministic Rule Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            {t.headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartIntake}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>{t.ctaButton}</span>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectSampleProfile(SAMPLE_PROFILES[0])}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>{t.secondaryCta}</span>
            </button>
          </div>

          {/* Key Assurance Badges */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-slate-200/80">
            {t.stats.map((stat, idx) => (
              <div key={idx} className="p-3 bg-white/80 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-blue-950 font-sans">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 1-Click Persona Demos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Instant Hackathon Evaluation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Try Pre-configured Sample Citizen Profiles (1-Click Test)
              </h2>
              <p className="text-xs text-slate-600">
                Click any profile to instantly run the deterministic rule engine and inspect explainable eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SAMPLE_PROFILES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSampleProfile(sample)}
                className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-blue-600 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-blue-900 leading-tight">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {sample.subtitle}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-700">
                  <span>Run Eligibility</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            A transparent 5-step path connecting citizens directly to official Government of India benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {t.steps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative flex flex-col">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold text-sm flex items-center justify-center mb-3">
                {step.num}
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore by Category */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Browse Schemes by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Over 28 official schemes across Central ministries and State portals
            </p>
          </div>
          <button
            onClick={() => onExploreDirectory()}
            className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => onExploreDirectory(cat.name)}
                className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900 line-clamp-2">
                  {cat.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {cat.count}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Official Transparency & Disclaimer Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Official Disclaimer: </span>
            GOVSAHAYAK provides automated eligibility guidance using official Government of India eligibility criteria. Final approval, verification, and disbursement are subject to statutory verification by the respective government department, block development office, and designated nodal banks.
          </div>
        </div>
      </section>

    </div>
  );
};
