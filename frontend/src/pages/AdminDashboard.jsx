import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Database,
  Terminal,
  Activity,
  Play,
  FileCheck,
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await adminService.getDashboard();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSimulateUpdate = async () => {
    setSimulating(true);
    setNotice('');
    try {
      const res = await adminService.simulateUpdate(
        'tamil-nadu-post-matric-scholarship',
        'Application Deadline',
        '31 October 2026'
      );
      setNotice('Simulated official change detected! Check "Pending Updates" to review and approve.');
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert('Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  const handleTriggerScraper = async () => {
    setSyncing(true);
    setNotice('');
    try {
      const sourcesRes = await adminService.getSources();
      if (sourcesRes.data.length > 0) {
        await adminService.checkSource(sourcesRes.data[0].id);
      }
      setNotice('Scraper engine run completed. Source statuses and logs updated.');
      await loadDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1">
            Administrative privileges are required to access this portal.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold"
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Quick Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>National Scheme Administration Control Panel</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Admin Governance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Supervise official sources, verify scraper change detections, and review scheme catalogs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleTriggerScraper}
              disabled={syncing}
              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Scanning Portals...' : 'Run Scraper Now'}</span>
            </button>

            <button
              onClick={handleSimulateUpdate}
              disabled={simulating}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-amber-300" />
              <span>{simulating ? 'Simulating...' : 'Simulate Portal Update'}</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Admin Section Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg bg-blue-700 text-white shadow-xs"
          >
            Overview
          </Link>
          <Link
            to="/admin/updates"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <span>Verification Queue</span>
            {stats?.pending_verification_updates > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {stats.pending_verification_updates}
              </span>
            )}
          </Link>
          <Link
            to="/admin/sources"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Government Sources</span>
          </Link>
          <Link
            to="/admin/logs"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Scraper Logs</span>
          </Link>
          <Link
            to="/admin/schemes"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Manage Schemes</span>
          </Link>
        </div>

        {/* Analytics KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Schemes</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_schemes || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Active Catalog</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pending Review</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats?.pending_verification_updates || 0}
            </div>
            <Link to="/admin/updates" className="text-[11px] text-blue-700 font-bold hover:underline mt-1 block">
              Verify Updates →
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Verified Updates</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {stats?.recently_updated_schemes || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Published live</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Failed Fetches</div>
            <div className="text-2xl font-black text-red-600 mt-1">
              {stats?.failed_source_fetches || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Domain rejects</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Registered Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_users || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Citizens & Admins</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Monitoring Engine</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">APScheduler 60m</div>
          </div>
        </div>

        {/* 2 COLUMN ANALYTICS BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Viewed Schemes Chart Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <span>Most Viewed Citizen Schemes</span>
            </h3>
            <div className="space-y-3">
              {stats?.most_viewed_schemes?.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <div>
                      <Link to={`/schemes/${s.id}`} className="font-bold text-slate-900 hover:text-blue-700">
                        {s.name}
                      </Link>
                      <div className="text-[11px] text-slate-500">{s.category}</div>
                    </div>
                  </div>
                  <span className="font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                    {s.views} views
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Categories Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Schemes Distribution by Category</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {stats?.popular_categories?.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate mr-2">{cat.name}</span>
                  <span className="font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Admin Audit Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span>Recent Administrative Actions & Audits</span>
          </h3>

          <div className="space-y-2.5">
            {stats?.recent_activity?.length > 0 ? (
              stats.recent_activity.map((act, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-purple-900 mr-2">{act.action}</span>
                    <span className="text-slate-600">{act.notes}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-4">{act.time}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No actions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
