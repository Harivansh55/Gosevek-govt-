import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Globe2, 
  Search, 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  currentView: 'landing' | 'intake' | 'dashboard' | 'directory' | 'admin';
  onNavigate: (view: 'landing' | 'intake' | 'dashboard' | 'directory' | 'admin') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSampleModal: () => void;
  hasEvaluations: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  onOpenSampleModal,
  hasEvaluations,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Govt of India style saffron-white-green subtle stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  GOV<span className="text-amber-600">SAHAYAK</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Gov.in Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Government Scheme Matching Assistant • भारत सरकार योजना पोर्टल
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('intake')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'intake'
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Find Schemes (AI Intake)</span>
            </button>

            {hasEvaluations && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>My Dashboard</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('directory')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'directory'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>All Schemes (28+)</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'admin'
                  ? 'bg-purple-50 text-purple-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Controls: Language Selector & Demo Samples */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Sample Profiles button */}
            <button
              onClick={onOpenSampleModal}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors shadow-sm"
              title="Test with pre-configured student, farmer, or entrepreneur personas"
            >
              <Users className="w-3.5 h-3.5 mr-1 text-amber-700" />
              <span className="hidden sm:inline">Demo Personas</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <Globe2 className="w-3.5 h-3.5 ml-2 mr-1 text-slate-500" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-slate-800 py-1 pr-2 rounded focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>

            {/* Mobile Nav Button */}
            <button
              onClick={() => onNavigate(currentView === 'intake' ? 'dashboard' : 'intake')}
              className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {currentView === 'intake' ? (
                <LayoutDashboard className="w-5 h-5 text-blue-900" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-600" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
