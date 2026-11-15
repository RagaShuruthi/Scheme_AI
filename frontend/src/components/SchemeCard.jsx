import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Building2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedScheme } from '../utils/schemeTamilTranslations';

const SchemeCard = ({ scheme: rawScheme, initialSaved = false, onSaveToggle }) => {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  // Localize scheme according to selected language
  const scheme = getLocalizedScheme(rawScheme, lang);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert(lang === 'ta' ? 'திட்டங்களைச் சேமிக்க தயவுசெய்து உள்நுழையவும்.' : 'Please sign in to save schemes to your profile.');
      return;
    }
    setSaving(true);
    try {
      const res = await userService.toggleSaveScheme(scheme.id);
      setSaved(res.data.saved);
      if (onSaveToggle) onSaveToggle(scheme.id, res.data.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isStateTN = scheme.state === 'Tamil Nadu' || scheme.state_display === 'தமிழ்நாடு';
  const matchPct = scheme.match_percentage;

  const govLevelBadge = lang === 'ta'
    ? (scheme.government_level === 'Central' ? 'மத்திய அரசுத் திட்டம்' : `மாநிலம்: ${scheme.state_display || 'தமிழ்நாடு'}`)
    : (scheme.government_level === 'Central' ? 'Central Scheme' : `State: ${scheme.state || 'Tamil Nadu'}`);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isStateTN
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-blue-100 text-blue-900 border border-blue-200'
              }`}
            >
              {govLevelBadge}
            </span>

            {scheme.category_name && (
              <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {scheme.category_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {matchPct !== undefined && matchPct !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {matchPct}% {t('schemeCard.match')}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-1.5 rounded-lg border transition-colors ${
                saved
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={saved ? (lang === 'ta' ? 'சேமிப்பிலிருந்து நீக்கு' : 'Remove from Saved') : (lang === 'ta' ? 'திட்டத்தைச் சேமிக்க' : 'Save Scheme')}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scheme Name */}
        <Link to={`/schemes/${scheme.id}`} className="block group-hover:text-blue-700 transition-colors">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">
            {scheme.name}
          </h3>
        </Link>

        {/* Department */}
        {scheme.department_name && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{scheme.department_name}</span>
          </div>
        )}

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
          {scheme.short_description}
        </p>

        {/* Match checklist / reasons if available */}
        {scheme.qualifying_reasons && scheme.qualifying_reasons.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
            {scheme.qualifying_reasons.slice(0, 3).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">{reason.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Benefits summary badge */}
        {scheme.benefits_summary && (
          <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-lg p-2 text-xs text-blue-900 font-medium">
            <span className="text-blue-600 font-semibold">{lang === 'ta' ? 'பயன்: ' : 'Benefit: '}</span>
            {scheme.benefits_summary}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('schemeCard.officialSource')}</span>
          </div>
          {scheme.application_deadline && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{t('schemeCard.deadline')}: {scheme.application_deadline}</span>
            </div>
          )}
        </div>

        <Link
          to={`/schemes/${scheme.id}`}
          className="inline-flex items-center gap-1 font-semibold text-xs text-blue-700 bg-white hover:bg-blue-700 hover:text-white px-3 py-1.5 rounded-lg border border-blue-200 transition-all shadow-xs"
        >
          {t('schemeCard.viewScheme')} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default SchemeCard;
