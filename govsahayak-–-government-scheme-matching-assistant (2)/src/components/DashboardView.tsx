import React, { useState, useMemo } from 'react';
import { 
  UserProfile, 
  EligibilityEvaluation, 
  Scheme, 
  EligibilityStatus 
} from '../types';
import { SchemeResultCard } from './SchemeResultCard';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Bookmark, 
  Search, 
  Filter, 
  FileText, 
  User, 
  Edit3, 
  Download, 
  Printer, 
  Sparkles,
  Coins,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  evaluations: EligibilityEvaluation[];
  onEditProfile: () => void;
  onViewDetails: (scheme: Scheme) => void;
  onOpenDocuments: (scheme?: Scheme) => void;
  onAskAi: (query: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  evaluations,
  onEditProfile,
  onViewDetails,
  onOpenDocuments,
  onAskAi
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ELIGIBLE' | 'NEAR_MISS' | 'POSSIBLY_ELIGIBLE' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);

  const toggleSave = (schemeId: string) => {
    setSavedSchemeIds(prev => 
      prev.includes(schemeId) ? prev.filter(id => id !== schemeId) : [...prev, schemeId]
    );
  };

  // Counts
  const eligibleCount = evaluations.filter(e => e.status === 'ELIGIBLE').length;
  const nearMissCount = evaluations.filter(e => e.status === 'NEAR_MISS').length;
  const possibleCount = evaluations.filter(e => e.status === 'POSSIBLY_ELIGIBLE').length;
  const savedCount = savedSchemeIds.length;

  // Categories present in evaluations
  const categories = useMemo(() => {
    const cats = new Set(evaluations.map(e => e.scheme.category));
    return ['All', ...Array.from(cats)];
  }, [evaluations]);

  // Filtered results
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(item => {
      // Tab filter
      if (activeTab === 'saved') {
        if (!savedSchemeIds.includes(item.scheme.id)) return false;
      } else if (activeTab !== 'all') {
        if (item.status !== activeTab) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.scheme.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.scheme.name.toLowerCase().includes(q);
        const matchHindi = item.scheme.hindi_name?.toLowerCase().includes(q);
        const matchOverview = item.scheme.overview.toLowerCase().includes(q);
        const matchMinistry = item.scheme.ministry.toLowerCase().includes(q);
        const matchCategory = item.scheme.category.toLowerCase().includes(q);
        if (!matchName && !matchHindi && !matchOverview && !matchMinistry && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [evaluations, activeTab, selectedCategory, searchQuery, savedSchemeIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Citizen Profile Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {profile.name || 'Citizen Profile'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                  <span>Verified Rules Applied</span>
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-blue-200">
                <span className="bg-blue-800/80 px-2 py-0.5 rounded">
                  🎂 {profile.age ? `${profile.age} Yrs` : 'Age: N/A'}
                </span>
                <span className="bg-blue-800/80 px-2 py-0.5 rounded">
                  📍 {profile.state || 'India'}
                </span>
                <span className="bg-blue-800/80 px-2 py-0.5 rounded">
                  💼 {profile.occupation || 'General'}
                </span>
                <span className="bg-blue-800/80 px-2 py-0.5 rounded">
                  💰 {profile.annual_income !== undefined ? `₹${profile.annual_income.toLocaleString('en-IN')}/yr` : 'Income: N/A'}
                </span>
                <span className="bg-blue-800/80 px-2 py-0.5 rounded">
                  🏷️ {profile.category || 'General'}
                </span>
                {profile.land_size_acres !== undefined && (
                  <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
                    🌾 {profile.land_size_acres} Acres Land
                  </span>
                )}
                {profile.is_disabled && (
                  <span className="bg-purple-800/80 px-2 py-0.5 rounded text-purple-200">
                    ♿ UDID / Disability
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onEditProfile}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Profile</span>
            </button>
            <button
              onClick={() => onOpenDocuments()}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Master Document Checklist</span>
            </button>
          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Eligible */}
        <div 
          onClick={() => setActiveTab('ELIGIBLE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ELIGIBLE' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Eligible Schemes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-2">{eligibleCount}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">100% rules confirmed</p>
        </div>

        {/* Near Miss */}
        <div 
          onClick={() => setActiveTab('NEAR_MISS')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'NEAR_MISS' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Almost Eligible</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2">{nearMissCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Near-miss (1 condition away)</p>
        </div>

        {/* Needs Verification */}
        <div 
          onClick={() => setActiveTab('POSSIBLY_ELIGIBLE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'POSSIBLY_ELIGIBLE' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Needs Verification</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-950 mt-2">{possibleCount}</div>
          <p className="text-[11px] text-blue-700 mt-0.5">Needs doc or BPL confirm</p>
        </div>

        {/* Saved */}
        <div 
          onClick={() => setActiveTab('saved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'saved' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Bookmarked</span>
            <Bookmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-950 mt-2">{savedCount}</div>
          <p className="text-[11px] text-purple-700 mt-0.5">Saved for application</p>
        </div>

      </div>

      {/* Near Miss Informational Banner */}
      {nearMissCount > 0 && activeTab === 'NEAR_MISS' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-amber-950">
              Understanding Near-Miss Recommendations
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              These are schemes where your profile satisfies almost all core criteria, but misses by a narrow margin (e.g., annual income slightly above limit or age within 2 years). Each card outlines the exact condition and recommended action.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Schemes ({evaluations.length})
          </button>

          <button
            onClick={() => setActiveTab('ELIGIBLE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'ELIGIBLE' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Eligible ({eligibleCount})
          </button>

          <button
            onClick={() => setActiveTab('NEAR_MISS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'NEAR_MISS' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            Almost Eligible ({nearMissCount})
          </button>

          <button
            onClick={() => setActiveTab('POSSIBLY_ELIGIBLE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'POSSIBLY_ELIGIBLE' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Needs Verification ({possibleCount})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'saved' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Saved ({savedCount})
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, keyword, or benefits..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Schemes Grid */}
      {filteredEvaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching schemes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try resetting your search query, switching categories, or adjusting your citizen profile criteria.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-950 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvaluations.map((item) => (
            <SchemeResultCard
              key={item.scheme.id}
              evaluation={item}
              onViewDetails={onViewDetails}
              onOpenDocuments={onOpenDocuments}
              onAskAi={onAskAi}
              isSaved={savedSchemeIds.includes(item.scheme.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

    </div>
  );
};
