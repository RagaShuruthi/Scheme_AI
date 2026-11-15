import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { updateService, schemeService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Updates = () => {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Filters
  const [govLevel, setGovLevel] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    schemeService.getCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const params = { sort: sortBy };
      if (govLevel) params.government_level = govLevel;
      if (stateFilter) params.state = stateFilter;
      if (catFilter) params.category_id = catFilter;

      const res = await updateService.getUpdates(params);
      setUpdates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [govLevel, stateFilter, catFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin Verified Official Bulletins</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('updates.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('updates.subtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-700" /> Filters:
            </span>

            {/* Gov level */}
            <select
              value={govLevel}
              onChange={(e) => setGovLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
            >
              <option value="">All Government Levels</option>
              <option value="Central">Central Government</option>
              <option value="State">State Government</option>
            </select>

            {/* State */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
            >
              <option value="">All Regions</option>
              <option value="Tamil Nadu">Tamil Nadu State</option>
            </select>

            {/* Category */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {(govLevel || stateFilter || catFilter) && (
              <button
                onClick={() => {
                  setGovLevel('');
                  setStateFilter('');
                  setCatFilter('');
                }}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
            >
              <option value="latest">Latest Verified</option>
              <option value="recently_changed">Recently Detected</option>
            </select>
          </div>
        </div>

        {/* Updates Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-36 border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <RefreshCw className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No verified updates matching filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              All schemes are operating on current baseline terms.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((upd) => (
              <div
                key={upd.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                        {upd.update_type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{t('updates.statusVerified')}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{upd.verified_at ? new Date(upd.verified_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {upd.title}
                  </h3>
                  <div className="text-xs font-semibold text-blue-700 mt-0.5">
                    Scheme: {upd.scheme_name}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {upd.change_summary}
                  </p>

                  {/* Previous vs New Box if available */}
                  {(upd.previous_value || upd.new_value) && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {upd.previous_value && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                          <span className="font-bold text-slate-700 block mb-0.5">Previous Value:</span>
                          <span>{upd.previous_value}</span>
                        </div>
                      )}
                      {upd.new_value && (
                        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                          <span className="font-bold text-emerald-800 block mb-0.5">Verified New Value:</span>
                          <span>{upd.new_value}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={upd.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <span>{t('updates.source')}</span> <ExternalLink className="w-3 h-3" />
                  </a>

                  <Link
                    to={`/schemes/${upd.scheme_id}`}
                    className="font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    <span>View Scheme Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;
