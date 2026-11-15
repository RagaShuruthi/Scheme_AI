import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Trash2,
  ExternalLink,
  Building,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { schemeService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminSchemes = () => {
  const { isAdmin } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    name: '',
    short_description: '',
    full_description: '',
    government_level: 'Central',
    state: 'All India',
    category_id: 1,
    application_status: 'Open',
    application_deadline: '31 December 2026',
    application_process: 'Apply online on the official department portal with Aadhaar.',
    official_application_url: 'https://scholarships.gov.in',
    official_source_url: 'https://education.gov.in',
    source_name: 'Official Ministry Portal',
    min_age: 18,
    max_age: 60,
    max_income: 300000,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [schRes, catRes] = await Promise.all([
        schemeService.getSchemes({ limit: 100 }),
        schemeService.getCategories(),
      ]);
      setSchemes(schRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setForm((prev) => ({ ...prev, category_id: catRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete scheme: ${name}?`)) return;
    try {
      await schemeService.deleteScheme(id);
      setNotice(`Deleted scheme '${name}'`);
      setSchemes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice('');
    try {
      await schemeService.createScheme({
        ...form,
        category_id: parseInt(form.category_id, 10),
        min_age: form.min_age ? parseInt(form.min_age, 10) : null,
        max_age: form.max_age ? parseInt(form.max_age, 10) : null,
        max_income: form.max_income ? parseFloat(form.max_income) : null,
        benefits_list: [{ benefit_type: 'Financial', title: 'Standard Welfare Grant', description: 'Direct assistance' }],
        documents_list: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook'],
      });
      setNotice('New government scheme cataloged successfully.');
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create scheme');
    }
  };

  if (!isAdmin) return <div className="p-8 text-center">Admin access required.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Scheme Repository Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Review, create, or modify verified schemes cataloged in the national database.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel' : 'Catalog New Scheme'}</span>
          </button>
        </div>

        {notice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
            {notice}
          </div>
        )}

        {/* Add Scheme Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Catalog New Official Government Scheme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Scheme Official Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tamil Nadu Talent Scholarship Scheme"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Government Level</label>
                <select
                  value={form.government_level}
                  onChange={(e) => setForm({ ...form, government_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Central">Central Government</option>
                  <option value="State">State Government</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State / Territory</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Tamil Nadu or All India"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="text"
                  value={form.application_deadline}
                  onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
                  placeholder="e.g. 31 October 2026"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  placeholder="One sentence summary of the welfare assistance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.full_description}
                  onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                  placeholder="Comprehensive details and provisions"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Application URL</label>
                <input
                  type="url"
                  required
                  value={form.official_application_url}
                  onChange={(e) => setForm({ ...form, official_application_url: e.target.value })}
                  placeholder="https://scholarships.gov.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Source URL</label>
                <input
                  type="url"
                  required
                  value={form.official_source_url}
                  onChange={(e) => setForm({ ...form, official_source_url: e.target.value })}
                  placeholder="https://education.gov.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold"
              >
                Save & Catalog Scheme
              </button>
            </div>
          </form>
        )}

        {/* Scheme List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Scheme Name</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Last Verified</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link to={`/schemes/${s.id}`} className="hover:text-blue-700">
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {s.government_level}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{s.category_name}</td>
                    <td className="p-4 text-slate-600">{s.application_deadline || 'Open'}</td>
                    <td className="p-4 text-emerald-700 font-semibold">
                      {new Date(s.last_verified_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/schemes/${s.id}`}
                          className="p-1 text-slate-500 hover:text-blue-700"
                          title="View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchemes;
