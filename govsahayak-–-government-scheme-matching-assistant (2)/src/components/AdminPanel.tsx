import React, { useState } from 'react';
import { Scheme } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Building2, 
  BarChart3, 
  Calendar, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

interface AdminPanelProps {
  schemes: Scheme[];
  onAddScheme: (scheme: Scheme) => void;
  onUpdateScheme: (scheme: Scheme) => void;
  onDeleteScheme: (schemeId: string) => void;
  onViewDetails: (scheme: Scheme) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schemes,
  onAddScheme,
  onUpdateScheme,
  onDeleteScheme,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Scheme>>({
    name: '',
    hindi_name: '',
    ministry: '',
    department: '',
    category: 'Scholarships',
    level: 'Central',
    states: ['All India'],
    overview: '',
    benefits: '',
    estimated_benefit_amount: '',
    documents: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook'],
    application_process: ['Register on official portal', 'Upload required certificates', 'Submit for verification'],
    application_url: 'https://myscheme.gov.in',
    source_url: 'https://myscheme.gov.in',
    last_verified: new Date().toISOString().split('T')[0],
    rules: {
      min_age: 18,
      max_age: 35,
      max_income: 250000
    },
    tags: ['education', 'welfare']
  });

  const filtered = schemes.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ministry) return;

    if (editingScheme) {
      onUpdateScheme({
        ...editingScheme,
        ...formData
      } as Scheme);
      setEditingScheme(null);
    } else {
      const newId = `scheme_${Date.now()}`;
      onAddScheme({
        ...formData,
        id: newId
      } as Scheme);
    }
    setIsAddModalOpen(false);
  };

  const startEdit = (s: Scheme) => {
    setEditingScheme(s);
    setFormData(s);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt Gazette & Rules Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Government Scheme Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage scheme catalog, eligibility rules, and statutory verification dates.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScheme(null);
            setFormData({
              name: '',
              hindi_name: '',
              ministry: '',
              department: '',
              category: 'Scholarships',
              level: 'Central',
              states: ['All India'],
              overview: '',
              benefits: '',
              estimated_benefit_amount: '',
              documents: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook'],
              application_process: ['Register on official portal', 'Upload certificates'],
              application_url: 'https://myscheme.gov.in',
              source_url: 'https://myscheme.gov.in',
              last_verified: new Date().toISOString().split('T')[0],
              rules: { min_age: 18, max_age: 40, max_income: 300000 },
              tags: ['welfare']
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Scheme</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Active Schemes</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{schemes.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Central Schemes</div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {schemes.filter(s => s.level === 'Central').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500">State Schemes</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {schemes.filter(s => s.level === 'State').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Rule Engine Version</div>
          <div className="text-2xl font-black text-purple-900 mt-1">v2.4.0 (Live)</div>
        </div>
      </div>

      {/* Scheme Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scheme by name, category, or ministry..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Scheme Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Ministry</th>
                <th className="px-4 py-3">Eligibility Rules</th>
                <th className="px-4 py-3">Last Verified</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    {s.hindi_name && (
                      <div className="text-[11px] text-slate-400 font-sans">{s.hindi_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 max-w-[180px] truncate">
                    {s.ministry}
                  </td>
                  <td className="px-4 py-3.5 text-[11px]">
                    <div>Age: {s.rules.min_age ?? 0}–{s.rules.max_age ?? 'Any'}</div>
                    {s.rules.max_income && <div>Income: ₹{s.rules.max_income.toLocaleString('en-IN')}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">
                    {s.last_verified}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors"
                      title="Edit Scheme"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                          onDeleteScheme(s.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Scheme"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Scheme Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingScheme ? 'Edit Scheme' : 'Add New Government Scheme'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name (Hindi)</label>
                  <input
                    type="text"
                    value={formData.hindi_name || ''}
                    onChange={(e) => setFormData({ ...formData, hindi_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ministry *</label>
                  <input
                    type="text"
                    required
                    value={formData.ministry || ''}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category || 'Scholarships'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Agriculture">Agriculture</option>
                    <option value="Farmer support">Farmer support</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Housing">Housing</option>
                    <option value="Women & child welfare">Women & child welfare</option>
                    <option value="Skill development">Skill development</option>
                    <option value="Social security">Social security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Financial Benefit</label>
                <input
                  type="text"
                  placeholder="e.g. ₹6,000 / year or Up to ₹10 Lakh"
                  value={formData.estimated_benefit_amount || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_benefit_amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overview Description</label>
                <textarea
                  rows={2}
                  value={formData.overview || ''}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    value={formData.rules?.min_age ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rules: { ...formData.rules, min_age: e.target.value ? parseInt(e.target.value, 10) : undefined } 
                    })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    value={formData.rules?.max_age ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rules: { ...formData.rules, max_age: e.target.value ? parseInt(e.target.value, 10) : undefined } 
                    })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Income (₹)</label>
                  <input
                    type="number"
                    value={formData.rules?.max_income ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rules: { ...formData.rules, max_income: e.target.value ? parseInt(e.target.value, 10) : undefined } 
                    })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-sm"
                >
                  {editingScheme ? 'Save Changes' : 'Create Scheme'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
