import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminLogs = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getScrapeLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin]);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

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
              Scraper Engine Execution Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Live audit logs of official portal fetches, hashing comparisons, and change detection events.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 self-start sm:self-auto cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4 text-blue-700" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          {['All', 'Success', 'Changes Detected', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filter === status
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Terminal className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No logs for this filter</h3>
          </div>
        ) : (
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 font-mono text-xs shadow-xl space-y-3 overflow-x-auto">
            {filteredLogs.map((log) => {
              const isSuccess = log.status === 'Success';
              const isChange = log.status === 'Changes Detected';
              const isFail = log.status === 'Failed';

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : isChange
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-slate-400 font-semibold">{log.source_name || 'System Scraper'}</span>
                    </div>
                    <div className="text-slate-200 text-xs">{log.message}</div>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
