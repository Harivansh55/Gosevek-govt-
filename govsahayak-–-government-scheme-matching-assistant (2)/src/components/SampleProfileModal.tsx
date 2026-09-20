import React from 'react';
import { X, ArrowRight, Sparkles, GraduationCap, Tractor, Briefcase, UserCheck, HeartPulse } from 'lucide-react';
import { SAMPLE_PROFILES, SampleProfileItem } from '../data/sampleProfiles';

interface SampleProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SampleProfileItem) => void;
}

export const SampleProfileModal: React.FC<SampleProfileModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return GraduationCap;
      case 'Tractor': return Tractor;
      case 'Briefcase': return Briefcase;
      case 'UserCheck': return UserCheck;
      default: return HeartPulse;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1-Click Demo Evaluation Personas
              </h2>
              <p className="text-xs text-slate-500">
                Select a citizen persona to immediately test the rule engine and explainable eligibility
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Cards */}
        <div className="p-6 overflow-y-auto space-y-3">
          {SAMPLE_PROFILES.map((sample) => {
            const Icon = getIcon(sample.avatarIcon);
            return (
              <div
                key={sample.id}
                onClick={() => {
                  onSelect(sample);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                      {sample.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {sample.subtitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sample.expectedHighlights.map((hl, hIdx) => (
                        <span 
                          key={hIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                        >
                          ✓ {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-1 text-xs font-bold text-blue-800 group-hover:translate-x-1 transition-transform">
                  <span>Load Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
          Evaluates all criteria deterministically with zero artificial hallucination.
        </div>

      </div>
    </div>
  );
};
