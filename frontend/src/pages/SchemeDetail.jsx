import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Bookmark,
  Share2,
  ArrowLeft,
  Coins,
  History,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { schemeService, userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedScheme } from '../utils/schemeTamilTranslations';

const SchemeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();

  const [rawScheme, setRawScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await schemeService.getSchemeDetail(id);
        setRawScheme(res.data);
      } catch (err) {
        setError(lang === 'ta' ? 'திட்ட விவரங்களைப் பெற முடியவில்லை.' : 'Scheme details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, lang]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      alert(lang === 'ta' ? 'இத்திட்டத்தைச் சேமிக்க தயவுசெய்து உள்நுழையவும்.' : 'Please log in to save this scheme to your profile.');
      return;
    }
    setSaving(true);
    try {
      const res = await userService.toggleSaveScheme(rawScheme.id);
      setSaved(res.data.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const scheme = getLocalizedScheme(rawScheme, lang);
    if (navigator.share) {
      navigator.share({
        title: scheme.name,
        text: scheme.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'ta' ? 'திட்டத்திற்கான இணைப்பு கிளிப்போர்டில் நகலெடுக்கப்பட்டது!' : 'Scheme link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !rawScheme) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'ta' ? 'திட்டம் காணப்படவில்லை' : 'Scheme Not Found'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {error || (lang === 'ta' ? 'இந்த திட்டத்தின் விவரப் பதிவு கிடைக்கவில்லை.' : 'This scheme record does not exist.')}
          </p>
          <Link
            to="/schemes"
            className="inline-block mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold"
          >
            {lang === 'ta' ? 'அனைத்து திட்டங்கள் பக்கத்திற்குத் திரும்பு' : 'Back to All Schemes'}
          </Link>
        </div>
      </div>
    );
  }

  // Localized scheme
  const scheme = getLocalizedScheme(rawScheme, lang);
  const rules = scheme.eligibility_rule || {};

  // Demographic labels localized
  const demographicTags = [
    rules.is_student && (lang === 'ta' ? 'மாணவர்கள்' : 'Students'),
    rules.is_farmer && (lang === 'ta' ? 'விவசாயிகள் / நில உரிமையாளர்கள்' : 'Farmers / Landholders'),
    rules.is_entrepreneur && (lang === 'ta' ? 'தொழில்முனைவோர் / குறுந்தொழில்' : 'Entrepreneurs / MSME'),
    rules.is_disabled && (lang === 'ta' ? 'மாற்றுத்திறனாளிகள்' : 'Persons with Disability'),
  ].filter(Boolean);

  const genderLabel = rules.gender === 'Female'
    ? (lang === 'ta' ? 'பெண்கள் மட்டும்' : 'Female Only')
    : (rules.gender === 'Male'
      ? (lang === 'ta' ? 'ஆண்கள் மட்டும்' : 'Male Only')
      : (lang === 'ta' ? 'அனைத்து பாலினமும்' : 'All Genders'));

  const ageText = (rules.min_age || rules.max_age)
    ? `${rules.min_age || 0} ${lang === 'ta' ? 'முதல்' : 'to'} ${rules.max_age || (lang === 'ta' ? 'உச்ச வரம்பில்லை' : 'No Upper Limit')} ${lang === 'ta' ? 'ஆண்டுகள் வரை' : 'Years'}`
    : (lang === 'ta' ? 'குறிப்பிட்ட வயது வரம்பு இல்லை' : 'No strict age restriction');

  const incomeText = rules.max_income
    ? `≤ ₹${rules.max_income.toLocaleString('en-IN')} ${lang === 'ta' ? '(ஆண்டு வருமானம்)' : 'per year'}`
    : (lang === 'ta' ? 'வருமான வரம்பு இல்லை' : 'No Income Cap');

  const socialCatText = rules.social_categories && rules.social_categories.length > 0 && !rules.social_categories.includes('All')
    ? rules.social_categories.join(', ')
    : (lang === 'ta' ? 'அனைத்து சமூகப் பிரிவுகளும் (General, OBC, SC, ST)' : 'All Categories (General, OBC, SC, ST)');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ta' ? 'திட்டங்கள் பட்டியலுக்குத் திரும்பு' : 'Back to Schemes Catalog'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                saved
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-blue-600' : ''}`} />
              <span>
                {saved
                  ? (lang === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved')
                  : (lang === 'ta' ? 'திட்டத்தைச் சேமிக்க' : 'Save Scheme')}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
              title={lang === 'ta' ? 'திட்டத்தைப் பகிர்க' : 'Share Scheme'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HERO HEADER CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                scheme.government_level === 'Central'
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {lang === 'ta'
                ? (scheme.government_level === 'Central' ? 'மத்திய அரசுத் திட்டம்' : `மாநில அரசு: ${scheme.state_display || 'தமிழ்நாடு'}`)
                : (scheme.government_level === 'Central' ? 'Central Government' : `State: ${scheme.state || 'Tamil Nadu'}`)}
            </span>

            {scheme.category_name && (
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {scheme.category_name}
              </span>
            )}

            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {lang === 'ta' ? 'நிலை: ' : 'Status: '}
                {scheme.application_status}
              </span>
            </span>

            <span className="text-xs font-medium text-slate-500 ml-auto flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> {lang === 'ta' ? 'பதிப்பு' : 'Version'} v{scheme.version}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {scheme.name}
          </h1>

          {scheme.department_name && (
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{scheme.department_name}</span>
            </div>
          )}

          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {scheme.full_description}
          </p>

          {/* Official Portal CTA Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'ta' ? 'சரிபார்க்கப்பட்டது: ' : 'Verified on '}
                <strong className="text-slate-800">
                  {new Date(scheme.last_verified_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
                </strong>{' '}
                {lang === 'ta' ? '(அதிகாரப்பூர்வ அரசு இணையதளம்)' : `via ${scheme.source_name}`}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={scheme.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>{lang === 'ta' ? 'துறை இணையதளம்' : 'Department Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={scheme.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial text-xs font-extrabold bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்' : 'Apply on Official Portal'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* 2-COLUMN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Benefits, Eligibility, Steps, Docs */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. BENEFITS SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  {lang === 'ta' ? 'திட்டப் பயன்கள் மற்றும் சலுகைகள்' : 'Scheme Benefits'}
                </h2>
              </div>

              <div className="space-y-3">
                {scheme.benefits && scheme.benefits.length > 0 ? (
                  scheme.benefits.map((b) => (
                    <div key={b.id} className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                        <span>{b.title}</span>
                        <span className="bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                          {b.benefit_type}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800">{b.description}</p>
                      {b.amount_details && (
                        <div className="mt-2 text-xs font-semibold text-emerald-800">
                          {lang === 'ta' ? 'தொகை / சலுகை விவரம்: ' : 'Amount / Quantum: '}
                          {b.amount_details}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    {lang === 'ta'
                      ? 'அரசு விதிகளின்படி முழுமையான நிதி மற்றும் சமூக நல ஆதரவு.'
                      : 'Government assistance and financial support as per official gazette.'}
                  </p>
                )}
              </div>
            </div>

            {/* 2. ELIGIBILITY CRITERIA */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  {lang === 'ta' ? 'விண்ணப்பிப்பதற்கான தகுதி வரம்புகள்' : 'Eligibility Requirements'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* State */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'தகுதியான பகுதி / மாநிலம்' : 'Eligible Regions'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {scheme.state_display || (rules.applicable_states ? rules.applicable_states.join(', ') : (lang === 'ta' ? 'அகில இந்தியா' : 'All India'))}
                  </div>
                </div>

                {/* Age */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'வயது வரம்பு' : 'Age Limit'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {ageText}
                  </div>
                </div>

                {/* Gender */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'இலக்கு பாலினம்' : 'Target Gender'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {genderLabel}
                  </div>
                </div>

                {/* Income */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'ஆண்டு குடும்ப வருமான உச்சவரம்பு' : 'Annual Family Income Ceiling'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {incomeText}
                  </div>
                </div>

                {/* Social Category */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'சமூகப் பிரிவு' : 'Social Category'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {socialCatText}
                  </div>
                </div>

                {/* Special Flags */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">
                    {lang === 'ta' ? 'பயனாளி தகுதி வகை' : 'Target Demographics'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {demographicTags.join(' • ') || (lang === 'ta' ? 'பொது குடிமக்கள்' : 'General Citizen Beneficiaries')}
                  </div>
                </div>
              </div>

              {rules.criteria_summary && (
                <div className="mt-3 p-3 bg-blue-50 text-blue-900 rounded-lg text-xs leading-relaxed">
                  {rules.criteria_summary}
                </div>
              )}
            </div>

            {/* 3. APPLICATION PROCESS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-700" />
                <h2 className="text-lg font-bold text-slate-900">
                  {lang === 'ta' ? 'படிமுறை விண்ணப்ப முறை' : 'Step-by-Step Application Process'}
                </h2>
              </div>

              {scheme.application_process ? (
                <div className="space-y-3">
                  {scheme.application_process.split('\n').filter(Boolean).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </div>
                      <div className="pt-0.5 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  {lang === 'ta'
                    ? 'ஆதார் சரிபார்ப்புடன் அதிகாரப்பூர்வ இணையதளம் மூலம் ஆன்லைனில் விண்ணப்பிக்கவும்.'
                    : 'Apply online through the official portal with Aadhaar authentication.'}
                </p>
              )}
            </div>

            {/* 4. REQUIRED DOCUMENTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {lang === 'ta' ? 'தேவையான அத்தியாவசிய ஆவணங்கள்' : 'Mandatory Documents Checklist'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scheme.documents && scheme.documents.length > 0 ? (
                  scheme.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{doc.document_name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">
                    {lang === 'ta' ? 'ஆதார் அட்டை, வங்கிக் கணக்கு புத்தகம், அடையாளச் சான்று' : 'Aadhaar Card, Bank Passbook, Identity Proof'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Key Dates, Official Source, Version Updates */}
          <div className="space-y-6">
            {/* Important Dates */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>{lang === 'ta' ? 'முக்கிய தேதிகள் & காலக்கெடு' : 'Important Dates'}</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-500">
                    {lang === 'ta' ? 'விண்ணப்பக் காலக்கெடு' : 'Application Deadline'}
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {scheme.application_deadline || (lang === 'ta' ? 'தொடர் சேர்க்கை' : 'Open Enrollment')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">
                    {lang === 'ta' ? 'திட்டச் சுழற்சி' : 'Application Cycle'}
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {scheme.application_start_date || (lang === 'ta' ? 'செயலில் உள்ள தொடர் திட்டம்' : 'Active Continuous')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">
                    {lang === 'ta' ? 'அதிகாரப்பூர்வ தளத்தில் கடைசியாக சரிபார்க்கப்பட்டது' : 'Last Verified from Official Source'}
                  </div>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    {new Date(scheme.last_verified_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Source Provenance */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ அரசு ஆதாரம்' : 'Source Provenance'}</span>
              </div>
              <h4 className="font-bold text-sm text-white">{scheme.source_name}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'ta'
                  ? 'மத்திய மற்றும் தமிழ்நாடு அரசின் அதிகாரப்பூர்வ துறை இணையதளங்களிலிருந்து நேரடியாக சரிபார்க்கப்பட்டது.'
                  : 'Data extracted exclusively from official state or central department repositories.'}
              </p>
              <a
                href={scheme.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300 font-bold hover:underline"
              >
                {lang === 'ta' ? 'அரசு இணையதளத்தைப் பார்வையிடுக' : 'Inspect Official Authority'}{' '}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Verified Change History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-700" />
                <span>
                  {lang === 'ta'
                    ? `சரிபார்க்கப்பட்ட மாற்றங்கள் (${scheme.updates?.filter((u) => u.verification_status === 'Approved').length || 0})`
                    : `Verified Updates (${scheme.updates?.filter((u) => u.verification_status === 'Approved').length || 0})`}
                </span>
              </h3>

              <div className="space-y-3">
                {scheme.updates && scheme.updates.filter((u) => u.verification_status === 'Approved').length > 0 ? (
                  scheme.updates
                    .filter((u) => u.verification_status === 'Approved')
                    .map((upd) => (
                      <div key={upd.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                        <div className="font-bold text-purple-900">{upd.title}</div>
                        <div className="text-slate-600 mt-0.5">{upd.change_summary}</div>
                        <div className="text-[10px] text-purple-700 mt-1 font-semibold">
                          {lang === 'ta' ? 'சரிபார்க்கப்பட்ட நாள்: ' : 'Verified on '}
                          {upd.verified_at ? new Date(upd.verified_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN') : 'Official'}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-500">
                    {lang === 'ta'
                      ? 'கொள்கை திருத்தங்கள் எதுவும் இல்லை. தற்போதைய அதிகாரப்பூர்வ பதிப்பில் செயலில் உள்ளது.'
                      : 'No policy revisions recorded. Active at current published version.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetail;
