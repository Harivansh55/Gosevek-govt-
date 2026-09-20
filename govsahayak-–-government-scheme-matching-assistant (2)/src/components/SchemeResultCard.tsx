import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  ExternalLink, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Building2, 
  ArrowRight,
  ShieldAlert,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { EligibilityEvaluation, Scheme } from '../types';

interface SchemeResultCardProps {
  evaluation: EligibilityEvaluation;
  onViewDetails: (scheme: Scheme) => void;
  onOpenDocuments: (scheme: Scheme) => void;
  onAskAi: (schemeName: string) => void;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
}

export const SchemeResultCard: React.FC<SchemeResultCardProps> = ({
  evaluation,
  onViewDetails,
  onOpenDocuments,
  onAskAi,
  isSaved = false,
  onToggleSave
}) => {
  const [showRules, setShowRules] = useState(false);
  const { scheme, status, score, matchedReasons, failedReasons, nearMissExplanation, requiredChange, ruleDetails } = evaluation;

  // Status configuration
  const statusConfig = {
    ELIGIBLE: {
      label: 'Eligible',
      sublabel: 'Fully Qualified',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      borderClass: 'border-emerald-200 hover:border-emerald-400'
    },
    NEAR_MISS: {
      label: 'Almost Eligible',
      sublabel: 'Near Miss (1 Condition)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: AlertCircle,
      borderClass: 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
    },
    POSSIBLY_ELIGIBLE: {
      label: 'Needs Verification',
      sublabel: 'Unconfirmed criteria',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: HelpCircle,
      borderClass: 'border-blue-200 hover:border-blue-400'
    },
    NOT_ELIGIBLE: {
      label: 'Not Eligible',
      sublabel: 'Criteria not met',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: XCircle,
      borderClass: 'border-slate-200 opacity-75'
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md p-5 flex flex-col justify-between ${currentStatus.borderClass}`}>
      
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatus.badgeClass}`}>
              <StatusIcon className="w-3.5 h-3.5 mr-1" />
              {currentStatus.label}
            </span>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {scheme.category}
            </span>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Match Score: {score}%
            </span>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(scheme.id)}
              className="text-slate-400 hover:text-amber-600 transition-colors p-1"
              title={isSaved ? "Remove from saved" : "Save scheme"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-amber-600 fill-amber-600" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Scheme Title & Hindi Name */}
        <div className="cursor-pointer" onClick={() => onViewDetails(scheme)}>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 hover:text-blue-900 transition-colors leading-snug">
            {scheme.name}
          </h3>
          {scheme.hindi_name && (
            <div className="text-xs font-medium text-slate-500 mt-0.5 font-sans">
              {scheme.hindi_name}
            </div>
          )}
        </div>

        {/* Ministry */}
        <div className="flex items-center text-[11px] text-slate-500 mt-1.5">
          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
          <span className="truncate">{scheme.ministry}</span>
        </div>

        {/* Key Benefit Highlight Pill */}
        {scheme.estimated_benefit_amount && (
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
            💰 Estimated Benefit: {scheme.estimated_benefit_amount}
          </div>
        )}

        {/* Overview paragraph */}
        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
          {scheme.overview}
        </p>

        {/* Mandatory Near Miss Explanations Callout */}
        {status === 'NEAR_MISS' && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Near-Miss Notice (Almost Qualified)</span>
            </div>
            {nearMissExplanation && (
              <p className="text-[11px] text-amber-900 font-medium">
                <span className="font-bold">Why currently not qualified: </span>
                {nearMissExplanation}
              </p>
            )}
            {requiredChange && (
              <p className="text-[11px] text-amber-800">
                <span className="font-bold">Required action/condition: </span>
                {requiredChange}
              </p>
            )}
          </div>
        )}

        {/* Summary of matched criteria */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
          >
            <span className="flex items-center space-x-1">
              <span>Why you qualify ({matchedReasons.length} rules verified)</span>
            </span>
            {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRules && (
            <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
              {matchedReasons.map((m, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
              {failedReasons.map((f, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-rose-800">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Chip Preview */}
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Key Documents Required ({scheme.documents.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {scheme.documents.slice(0, 3).map((doc, idx) => (
              <span 
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
              >
                {doc}
              </span>
            ))}
            {scheme.documents.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                +{scheme.documents.length - 3} more
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => onViewDetails(scheme)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-950 text-white transition-colors cursor-pointer"
          >
            View Details
          </button>

          <button
            onClick={() => onOpenDocuments(scheme)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Checklist</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => onAskAi(scheme.name)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition-colors flex items-center space-x-1 cursor-pointer"
            title="Ask AI assistant questions about this scheme"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Ask AI</span>
          </button>

          <a
            href={scheme.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center space-x-1"
            title="Visit official government portal"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

    </div>
  );
};
