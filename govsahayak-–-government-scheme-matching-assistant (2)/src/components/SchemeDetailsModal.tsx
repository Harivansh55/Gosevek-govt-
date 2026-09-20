import React from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { Scheme } from '../types';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onOpenDocuments: (scheme: Scheme) => void;
  onAskAi: (schemeName: string) => void;
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({
  scheme,
  onClose,
  onOpenDocuments,
  onAskAi
}) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
                {scheme.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-800 text-blue-100 border border-blue-700">
                {scheme.level} Scheme
              </span>
              {scheme.states.includes('All India') ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  All India
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {scheme.states.join(', ')}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
              {scheme.name}
            </h2>
            {scheme.hindi_name && (
              <p className="text-sm text-blue-200 font-medium">
                {scheme.hindi_name}
              </p>
            )}
            <div className="flex items-center text-xs text-blue-300 pt-1">
              <Building2 className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>{scheme.ministry} • {scheme.department}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Benefit Banner */}
          {scheme.estimated_benefit_amount && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Estimated Financial / Social Benefit
                </div>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  {scheme.estimated_benefit_amount}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Overview */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>Scheme Overview & Objectives</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {scheme.overview}
            </p>
          </div>

          {/* Benefits detail */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Detailed Key Entitlements</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-200">
              {scheme.benefits}
            </p>
          </div>

          {/* Eligibility Rules Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Prescribed Eligibility Criteria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Age Limit: </span>
                <span className="font-bold text-slate-800">
                  {scheme.rules.min_age ?? 0} to {scheme.rules.max_age ?? 'No upper limit'} years
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Income Ceiling: </span>
                <span className="font-bold text-slate-800">
                  {scheme.rules.max_income ? `Up to ₹${scheme.rules.max_income.toLocaleString('en-IN')}/year` : 'No specific ceiling'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Target Occupation: </span>
                <span className="font-bold text-slate-800">
                  {scheme.rules.occupations?.join(', ') || 'Open to all occupations'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Eligible Categories: </span>
                <span className="font-bold text-slate-800">
                  {scheme.rules.eligible_categories?.join(', ') || 'All Communities / General / OBC / SC / ST'}
                </span>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>Mandatory Documents Checklist</span>
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenDocuments(scheme);
                }}
                className="text-xs font-bold text-blue-900 hover:text-blue-950 underline cursor-pointer"
              >
                Open Checklist Tracker
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Application Procedure */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Step-by-Step Application Procedure
            </h3>
            <div className="space-y-2">
              {scheme.application_process.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Official Source Info */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Last Verified against Government Gazette: <span className="font-bold text-slate-800">{scheme.last_verified}</span></span>
            </div>
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>Verify Official Gazette / Guidelines</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAskAi(scheme.name);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask GovSahayak AI about this Scheme</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-colors"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
