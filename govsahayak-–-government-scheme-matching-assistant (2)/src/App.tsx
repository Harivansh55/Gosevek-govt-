/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Language, 
  UserProfile, 
  Scheme, 
  EligibilityEvaluation 
} from './types';
import { INITIAL_SCHEMES } from './data/schemes';
import { evaluateSchemeEligibility, rankEvaluations } from './lib/eligibilityEngine';
import { SAMPLE_PROFILES, SampleProfileItem } from './data/sampleProfiles';

import { Header } from './components/Header';
import { HeroLanding } from './components/HeroLanding';
import { ConversationalIntake } from './components/ConversationalIntake';
import { DashboardView } from './components/DashboardView';
import { SchemeDirectory } from './components/SchemeDirectory';
import { AdminPanel } from './components/AdminPanel';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';
import { DocumentChecklistModal } from './components/DocumentChecklistModal';
import { SampleProfileModal } from './components/SampleProfileModal';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';

import { 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Heart, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'intake' | 'dashboard' | 'directory' | 'admin'>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile>({});
  const [schemes, setSchemes] = useState<Scheme[]>(INITIAL_SCHEMES);
  const [evaluations, setEvaluations] = useState<EligibilityEvaluation[]>([]);
  
  // Modals
  const [detailsScheme, setDetailsScheme] = useState<Scheme | null>(null);
  const [docsScheme, setDocsScheme] = useState<Scheme | null>(null);
  const [isMasterDocsOpen, setIsMasterDocsOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [aiPrefilledQuery, setAiPrefilledQuery] = useState<string | null>(null);
  const [initialDirectoryCategory, setInitialDirectoryCategory] = useState<string>('All');

  // Load schemes from server if running
  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => {
        if (data.schemes && data.schemes.length > 0) {
          setSchemes(data.schemes);
        }
      })
      .catch(() => {
        // Use INITIAL_SCHEMES default
      });
  }, []);

  // Compute evaluations for a profile
  const runEvaluation = async (userProf: UserProfile) => {
    try {
      const res = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProf })
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data.evaluations);
      } else {
        // Run locally
        const evals = schemes.map(s => evaluateSchemeEligibility(s, userProf));
        setEvaluations(rankEvaluations(evals));
      }
    } catch {
      // Local fallback
      const evals = schemes.map(s => evaluateSchemeEligibility(s, userProf));
      setEvaluations(rankEvaluations(evals));
    }
  };

  // Complete conversational intake
  const handleIntakeComplete = (completedProfile: UserProfile) => {
    setProfile(completedProfile);
    runEvaluation(completedProfile);
    setCurrentView('dashboard');
  };

  // 1-Click sample profile selection
  const handleSelectSample = (sample: SampleProfileItem) => {
    setProfile(sample.profile);
    runEvaluation(sample.profile);
    setCurrentView('dashboard');
  };

  // Ask AI handler
  const handleAskAi = (schemeName: string) => {
    setAiPrefilledQuery(`What are the exact eligibility criteria and document requirements for ${schemeName}?`);
  };

  // Scheme CRUD handlers for Admin
  const handleAddScheme = (newScheme: Scheme) => {
    setSchemes(prev => [newScheme, ...prev]);
    fetch('/api/admin/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScheme)
    }).catch(console.error);
  };

  const handleUpdateScheme = (updatedScheme: Scheme) => {
    setSchemes(prev => prev.map(s => s.id === updatedScheme.id ? updatedScheme : s));
    fetch(`/api/admin/schemes/${updatedScheme.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedScheme)
    }).catch(console.error);
  };

  const handleDeleteScheme = (schemeId: string) => {
    setSchemes(prev => prev.filter(s => s.id !== schemeId));
    fetch(`/api/admin/schemes/${schemeId}`, {
      method: 'DELETE'
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-200">
      
      <div>
        {/* Navigation Header */}
        <Header
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          onOpenSampleModal={() => setIsSampleModalOpen(true)}
          hasEvaluations={evaluations.length > 0}
        />

        {/* Main Content Area */}
        <main>
          {currentView === 'landing' && (
            <HeroLanding
              onStartIntake={() => setCurrentView('intake')}
              onSelectSampleProfile={handleSelectSample}
              onExploreDirectory={(cat) => {
                setInitialDirectoryCategory(cat || 'All');
                setCurrentView('directory');
              }}
              language={language}
            />
          )}

          {currentView === 'intake' && (
            <ConversationalIntake
              initialProfile={profile}
              language={language}
              onComplete={handleIntakeComplete}
              onCancel={() => setCurrentView('landing')}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              profile={profile}
              evaluations={evaluations}
              onEditProfile={() => setCurrentView('intake')}
              onViewDetails={(scheme) => setDetailsScheme(scheme)}
              onOpenDocuments={(scheme) => {
                if (scheme) {
                  setDocsScheme(scheme);
                } else {
                  setIsMasterDocsOpen(true);
                }
              }}
              onAskAi={handleAskAi}
            />
          )}

          {currentView === 'directory' && (
            <SchemeDirectory
              schemes={schemes}
              initialCategory={initialDirectoryCategory}
              onViewDetails={(scheme) => setDetailsScheme(scheme)}
              onOpenDocuments={(scheme) => setDocsScheme(scheme)}
              onAskAi={handleAskAi}
            />
          )}

          {currentView === 'admin' && (
            <AdminPanel
              schemes={schemes}
              onAddScheme={handleAddScheme}
              onUpdateScheme={handleUpdateScheme}
              onDeleteScheme={handleDeleteScheme}
              onViewDetails={(scheme) => setDetailsScheme(scheme)}
            />
          )}
        </main>
      </div>

      {/* Floating AI RAG Assistant */}
      <FloatingAiAssistant
        profile={profile}
        language={language}
        prefilledQuery={aiPrefilledQuery}
        onClearPrefilledQuery={() => setAiPrefilledQuery(null)}
        onViewSchemeDetails={(scheme) => setDetailsScheme(scheme)}
      />

      {/* Modals */}
      <SchemeDetailsModal
        scheme={detailsScheme}
        onClose={() => setDetailsScheme(null)}
        onOpenDocuments={(scheme) => setDocsScheme(scheme)}
        onAskAi={handleAskAi}
      />

      {(docsScheme || isMasterDocsOpen) && (
        <DocumentChecklistModal
          scheme={docsScheme}
          allSchemes={schemes}
          onClose={() => {
            setDocsScheme(null);
            setIsMasterDocsOpen(false);
          }}
        />
      )}

      <SampleProfileModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelect={handleSelectSample}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">
                  GOV<span className="text-amber-600">SAHAYAK</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Indian Citizen Welfare Scheme Discovery & Eligibility Assistant
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <button onClick={() => setCurrentView('landing')} className="hover:text-blue-900">Home</button>
              <button onClick={() => setCurrentView('intake')} className="hover:text-blue-900">Find Schemes</button>
              <button onClick={() => setCurrentView('directory')} className="hover:text-blue-900">Browse 28+ Schemes</button>
              <a 
                href="https://myscheme.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-900 flex items-center space-x-1"
              >
                <span>National Portal (myScheme.gov.in)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={() => setCurrentView('admin')} className="hover:text-purple-900">Admin</button>
            </div>

            <div className="text-center md:text-right text-[11px] text-slate-400">
              Deterministic Rule Engine v2.4.0 • Grounded with Gemini RAG
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>GOVSAHAYAK is designed for civic benefit and statutory welfare matching.</span>
            <span className="hidden sm:inline">•</span>
            <span>All official applications are processed directly through Government of India portals.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
