import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminSources = () => {
  const { isAdmin } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [scrapeReport, setScrapeReport] = useState(null);

  // Form
  const [newSource, setNewSource] = useState({
    name: '',
    government_level: 'Central',
    state: 'All India',
    department: '',
    url: '',
    source_type: 'portal',
    scraping_frequency_hours: 24,
  });

  const loadSources = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSources();
      setSources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadSources();
  }, [isAdmin]);

  const handleCheckSource = async (id) => {
    setCheckingId(id);
    setActionMsg('');
    try {
      const res = await adminService.checkSource(id);
      if (res.data.status === 'success') {
        setActionMsg(`Scraper ran successfully for ${res.data.source}. Verified ${res.data.schemes_verified} schemes.`);
      } else {
        setActionMsg(`Warning: ${res.data.message || 'Scrape issue logged.'}`);
      }
      await loadSources();
    } catch (err) {
      console.error(err);
      alert('Error triggering check');
    } finally {
      setCheckingId(null);
    }
  };

  const handleRunAllScrapers = async () => {
    setRunningAll(true);
    setActionMsg('Scraping all 13 official government target portals in progress...');
    setScrapeReport(null);
    try {
      const res = await adminService.runAllScrapers();
      setScrapeReport(res.data);
      setActionMsg(`Success! Scraped all ${res.data.total_portals_scraped} portals. Extracted ${res.data.total_schemes_extracted} official scheme records in ${res.data.execution_duration_seconds}s.`);
      await loadSources();
    } catch (err) {
      console.error(err);
      setActionMsg('Error running multi-portal scraper.');
    } finally {
      setRunningAll(false);
    }
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      await adminService.createSource(newSource);
      setActionMsg('Government source registered successfully.');
      setShowAddForm(false);
      setNewSource({
        name: '',
        government_level: 'Central',
        state: 'All India',
        department: '',
        url: '',
        source_type: 'portal',
        scraping_frequency_hours: 24,
      });
      await loadSources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Domain rejected. Only authorized official domains (.gov.in, .nic.in, etc.) are permitted.');
    }
  };

  if (!isAdmin) return <div className="p-8 text-center">Admin access required.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Government Official Sources Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Strict allowlist policy: Only approved .gov.in, .nic.in and official state portals can be registered.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleRunAllScrapers}
              disabled={runningAll}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${runningAll ? 'animate-spin' : ''}`} />
              <span>{runningAll ? 'Scraping 13 Portals...' : 'Scrape All 13 Portals Now'}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel' : 'Add Official Source'}</span>
            </button>
          </div>
        </div>

        {scrapeReport && (
          <div className="p-5 bg-white border-2 border-emerald-300 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Portal Scraping Complete ({scrapeReport.total_portals_scraped} Portals Scraped)</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {scrapeReport.total_schemes_extracted} Schemes Extracted in {scrapeReport.execution_duration_seconds}s
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {scrapeReport.portal_results.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 truncate">{p.source_name}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Target: {p.target_extraction} ({p.schemes_count} items)
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{p.official_url}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionMsg && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
            {actionMsg}
          </div>
        )}

        {/* Add Source Form Modal/Box */}
        {showAddForm && (
          <form
            onSubmit={handleCreateSource}
            className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Register New Official Government Ingestion Target
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g. Tamil Nadu Adi Dravidar Welfare Portal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Portal URL</label>
                <input
                  type="url"
                  required
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://adtw.tn.gov.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Must be official domain (e.g. *.gov.in, *.nic.in)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Government Level</label>
                <select
                  value={newSource.government_level}
                  onChange={(e) => setNewSource({ ...newSource, government_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Central">Central Government</option>
                  <option value="State">State Government</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State / Territory</label>
                <input
                  type="text"
                  value={newSource.state}
                  onChange={(e) => setNewSource({ ...newSource, state: e.target.value })}
                  placeholder="e.g. Tamil Nadu or All India"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newSource.department}
                  onChange={(e) => setNewSource({ ...newSource, department: e.target.value })}
                  placeholder="e.g. Department of Social Welfare"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Type</label>
                <select
                  value={newSource.source_type}
                  onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="portal">National / State Portal</option>
                  <option value="department_site">Official Department Website</option>
                  <option value="api">Open Government API</option>
                </select>
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
                Verify & Register Source
              </button>
            </div>
          </form>
        )}

        {/* Sources List */}
        <div className="space-y-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">{src.name}</span>
                  <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded-full text-slate-600">
                    {src.government_level} • {src.state || 'All India'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{src.last_status || 'Active'}</span>
                  </span>
                </div>

                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 font-mono hover:underline flex items-center gap-1"
                >
                  <span>{src.url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="text-[11px] text-slate-400 mt-2">
                  Scraping frequency: every {src.scraping_frequency_hours} hours • Last checked:{' '}
                  {src.last_checked_at ? new Date(src.last_checked_at).toLocaleString() : 'Pending'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCheckSource(src.id)}
                  disabled={checkingId === src.id}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingId === src.id ? 'animate-spin' : ''}`} />
                  <span>{checkingId === src.id ? 'Checking...' : 'Run Scrape Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSources;
