import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building,
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminUpdates = () => {
  const { isAdmin } = useAuth();
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingUpdates();
      setPendingUpdates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPending();
    }
  }, [isAdmin]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    setStatusMessage('');
    try {
      const res = await adminService.approveUpdate(id);
      setStatusMessage(res.data.message || 'Update approved and published live!');
      setPendingUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error approving update');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this scraped update? It will not be published.')) return;
    setProcessingId(id);
    setStatusMessage('');
    try {
      const res = await adminService.rejectUpdate(id);
      setStatusMessage('Update rejected.');
      setPendingUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error rejecting update');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center">Admin access required.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/admin"
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pending Updates Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Strict Admin Verification: No scraped modifications are published to citizens without manual administrative review and sanction.
            </p>
          </div>

          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-full">
            {pendingUpdates.length} Pending
          </span>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
            {statusMessage}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl h-40 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : pendingUpdates.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Queue is Clear</h3>
            <p className="text-xs text-slate-500 mt-1">
              All scraper detected modifications have been verified and processed.
            </p>
            <Link
              to="/admin"
              className="mt-4 inline-block px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Back to Overview
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {pendingUpdates.map((update) => (
              <div
                key={update.id}
                className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded-md">
                        {update.update_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        Detected on: {new Date(update.detected_at).toLocaleString()}
                      </span>
                    </div>

                    <a
                      href={update.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect Official Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{update.scheme_name}</h3>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{update.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{update.change_summary}</p>

                  {/* Previous vs New Values Comparison Box */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Database / Previous Value:
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {update.previous_value || 'None'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                        Detected Official New Value:
                      </div>
                      <div className="text-xs font-bold text-emerald-950">
                        {update.new_value || 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    ID: #{update.id} • Scheme ID: #{update.scheme_id}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={update.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Review Source</span>
                    </a>

                    <button
                      onClick={() => handleReject(update.id)}
                      disabled={processingId === update.id}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(update.id)}
                      disabled={processingId === update.id}
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{processingId === update.id ? 'Publishing...' : 'Approve & Publish'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpdates;
