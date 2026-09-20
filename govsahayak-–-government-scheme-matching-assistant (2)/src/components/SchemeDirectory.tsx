import React, { useState, useMemo } from 'react';
import { Scheme } from '../types';
import { 
  Search, 
  Building2, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Filter,
  Coins,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface SchemeDirectoryProps {
  schemes: Scheme[];
  initialCategory?: string;
  onViewDetails: (scheme: Scheme) => void;
  onOpenDocuments: (scheme: Scheme) => void;
  onAskAi: (schemeName: string) => void;
}

export const SchemeDirectory: React.FC<SchemeDirectoryProps> = ({
  schemes,
  initialCategory = 'All',
  onViewDetails,
  onOpenDocuments,
  onAskAi
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Central' | 'State'>('All');

  const categories = useMemo(() => {
    const set = new Set(schemes.map(s => s.category));
    return ['All', ...Array.from(set)];
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      if (selectedCategory !== 'All' && s.category !== selectedCategory) {
        return false;
      }
      if (selectedLevel !== 'All' && s.level !== selectedLevel) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchHindi = s.hindi_name?.toLowerCase().includes(q);
        const matchOverview = s.overview.toLowerCase().includes(q);
        const matchMinistry = s.ministry.toLowerCase().includes(q);
        const matchTags = s.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchHindi && !matchOverview && !matchMinistry && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [schemes, selectedCategory, selectedLevel, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Government Schemes Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore all 28+ verified Central and State Government of India welfare schemes and initiatives.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? `All Categories (${schemes.length})` : cat}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, ministry, benefits, or keywords (e.g., PM-KISAN, loan, scholarship)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">All Levels (Central & State)</option>
              <option value="Central">Central Schemes</option>
              <option value="State">State Specific</option>
            </select>
          </div>
        </div>

      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => (
          <div 
            key={scheme.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                  {scheme.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {scheme.level}
                </span>
              </div>

              <h3 
                onClick={() => onViewDetails(scheme)}
                className="text-base font-bold text-slate-900 hover:text-blue-900 cursor-pointer leading-snug"
              >
                {scheme.name}
              </h3>
              {scheme.hindi_name && (
                <div className="text-xs text-slate-500 font-sans mt-0.5">
                  {scheme.hindi_name}
                </div>
              )}

              <div className="flex items-center text-[11px] text-slate-500 mt-1.5">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                <span className="truncate">{scheme.ministry}</span>
              </div>

              {scheme.estimated_benefit_amount && (
                <div className="mt-2.5 inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  💰 {scheme.estimated_benefit_amount}
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {scheme.overview}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {scheme.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onViewDetails(scheme)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-950 text-white transition-colors cursor-pointer"
                >
                  Details
                </button>
                <button
                  onClick={() => onOpenDocuments(scheme)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  title="Check required documents"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onAskAi(scheme.name)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Ask AI</span>
                </button>
                <a
                  href={scheme.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Open Official Portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
