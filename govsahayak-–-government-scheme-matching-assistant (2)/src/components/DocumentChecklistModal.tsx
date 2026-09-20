import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Printer, 
  Download, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Scheme } from '../types';

interface DocumentChecklistModalProps {
  scheme?: Scheme | null;
  allSchemes?: Scheme[];
  onClose: () => void;
}

export const DocumentChecklistModal: React.FC<DocumentChecklistModalProps> = ({
  scheme,
  allSchemes = [],
  onClose
}) => {
  // Aggregate document list
  const docList = scheme 
    ? scheme.documents 
    : Array.from(new Set(allSchemes.flatMap(s => s.documents)));

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    'Aadhaar Card': true,
    'Bank Account Passbook / Statement': true,
  });

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const totalCount = docList.length;
  const readyCount = docList.filter(d => checkedDocs[d]).length;
  const readinessPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // Guidance on where to obtain common documents
  const getDocumentGuidance = (docName: string): string => {
    const lower = docName.toLowerCase();
    if (lower.includes('aadhaar')) return "Download e-Aadhaar from uidai.gov.in or mAadhaar app with mobile OTP.";
    if (lower.includes('income')) return "Issued by Tehsildar / Sub-Divisional Magistrate (SDM) or apply online via State e-District portal.";
    if (lower.includes('caste') || lower.includes('category')) return "Obtained from Revenue Authority / Tahsildar office or State Caste Certificate Portal.";
    if (lower.includes('bank') || lower.includes('passbook')) return "Ensure bank account is Aadhaar-seeded for Direct Benefit Transfer (DBT).";
    if (lower.includes('land') || lower.includes('khatauni') || lower.includes('patta') || lower.includes('revenue')) return "Download digital copy from your state Bhulekh / Land Records portal or Talati office.";
    if (lower.includes('bonafide') || lower.includes('student') || lower.includes('fee')) return "Issued by the Registrar or Principal of your registered school/college.";
    if (lower.includes('disability') || lower.includes('udid')) return "Register and download digital UDID card on swavlambancard.gov.in.";
    return "Available through CSC Digital Seva Kendra or local block development office.";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {scheme ? `${scheme.name} – Document Checklist` : 'Master Application Document Checklist'}
              </h2>
              <p className="text-xs text-slate-500">
                {scheme ? scheme.ministry : 'Verified across all your eligible government schemes'}
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

        {/* Readiness Summary Bar */}
        <div className="px-6 py-4 bg-blue-50/70 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-950">Document Readiness Score:</span>
              <span className="text-sm font-black text-blue-900">{readinessPercent}%</span>
              <span className="text-xs text-blue-700 font-medium">({readyCount} of {totalCount} ready)</span>
            </div>
            <div className="w-full sm:w-64 bg-blue-200/80 h-2 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>

        {/* Document Checklist Items */}
        <div className="p-6 overflow-y-auto space-y-3">
          {docList.map((doc, idx) => {
            const isReady = Boolean(checkedDocs[doc]);
            const guidance = getDocumentGuidance(doc);

            return (
              <div
                key={idx}
                onClick={() => toggleDoc(doc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  isReady 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isReady ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isReady ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {doc}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isReady ? 'Ready ✓' : 'Needed'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    💡 <span className="font-medium">How to obtain:</span> {guidance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DigiLocker integrated documents are digitally verified by Govt of India</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
