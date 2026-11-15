import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building2,
  Bookmark,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eligibilityService, userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedScheme } from '../utils/schemeTamilTranslations';

const FindForMe = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    age: 20,
    gender: 'All',
    state: 'Tamil Nadu',
    district: 'Chennai',
    occupation: 'Student',
    student_status: true,
    education_level: 'Undergraduate',
    annual_income: 150000,
    social_category: 'SC',
    disability_status: false,
    employment_status: 'Student',
    is_farmer: false,
    is_entrepreneur: false,
    owns_land: false,
    other_info: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await eligibilityService.checkEligibility({
        ...formData,
        age: parseInt(formData.age, 10),
        annual_income: parseFloat(formData.annual_income),
      });
      setResults(res.data);
      setStep(4); // Move to results step
    } catch (err) {
      console.error(err);
      alert('Unable to evaluate criteria. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScheme = async (schemeId) => {
    if (!isAuthenticated) {
      alert('Please log in to save this scheme to your profile.');
      return;
    }
    try {
      await userService.toggleSaveScheme(schemeId);
      alert('Scheme saved to your profile!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>AI Automated Eligibility Profiler</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('eligibilityFinder.title')}
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {t('eligibilityFinder.subtitle')}
          </p>
        </div>

        {/* Multi-step Progress Indicator */}
        {step <= 3 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-8 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-blue-700' : ''}>1. Personal & Residency</span>
              <span className={step >= 2 ? 'text-blue-700' : ''}>2. Education & Income</span>
              <span className={step >= 3 ? 'text-blue-700' : ''}>3. Demographics & Land</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-700 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Personal & Location */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 1: Personal & State Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Applicant Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="105"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
                >
                  <option value="All">All / Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State of Domicile / Residence
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none font-semibold text-blue-900"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other State</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  District / Taluk
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="e.g. Chennai, Coimbatore, Madurai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Education, Income, Occupation */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 2: Education & Family Income
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Are you a student? */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Are you currently enrolled as a student?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.student_status === true}
                      onChange={() => handleChange('student_status', true)}
                      className="text-blue-700"
                    />
                    <span>Yes, I am an active student</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.student_status === false}
                      onChange={() => handleChange('student_status', false)}
                      className="text-blue-700"
                    />
                    <span>No, not enrolled as student</span>
                  </label>
                </div>
              </div>

              {/* Education level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current / Highest Education Level
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => handleChange('education_level', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
                >
                  <option value="School">School (Class 1-12)</option>
                  <option value="Diploma">Polytechnic / Diploma</option>
                  <option value="Undergraduate">Undergraduate Degree (BA, B.Sc, B.Com)</option>
                  <option value="Engineering">Engineering / Professional Degree (BE, B.Tech, MBBS)</option>
                  <option value="Postgraduate">Postgraduate / Ph.D</option>
                  <option value="None">None / Basic Literacy</option>
                </select>
              </div>

              {/* Family Income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Annual Family Income (INR ₹)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={formData.annual_income}
                  onChange={(e) => handleChange('annual_income', e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current entered: ₹{Number(formData.annual_income).toLocaleString('en-IN')}/year
                </span>
              </div>

              {/* Primary Occupation */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Occupation / Livelihood
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="e.g. Student, Small Farmer, Self Employed, Homemaker, Daily Wage"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Social Category, Farmer, Entrepreneur, Disability */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Step 3: Social Category & Demographic Details
            </h2>

            <div className="space-y-4">
              {/* Social Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Social Category / Caste Group
                </label>
                <select
                  value={formData.social_category}
                  onChange={(e) => handleChange('social_category', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none font-semibold text-slate-800"
                >
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="MBC">MBC / DNC (Most Backward Classes - TN)</option>
                  <option value="BC">BC (Backward Classes - TN)</option>
                  <option value="General">General / Open Category</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              {/* Specific status checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_farmer}
                    onChange={(e) => handleChange('is_farmer', e.target.checked)}
                    className="mt-0.5 text-blue-700 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Farmer / Agri Laborer</div>
                    <div className="text-[11px] text-slate-500">Engaged in agriculture or allied farming</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.owns_land}
                    onChange={(e) => handleChange('owns_land', e.target.checked)}
                    className="mt-0.5 text-blue-700 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Agricultural Landowner</div>
                    <div className="text-[11px] text-slate-500">Owns cultivable land with Patta/RoR</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_entrepreneur}
                    onChange={(e) => handleChange('is_entrepreneur', e.target.checked)}
                    className="mt-0.5 text-blue-700 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Entrepreneur / Small Business</div>
                    <div className="text-[11px] text-slate-500">Promoting new business, MSME, or enterprise</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disability_status}
                    onChange={(e) => handleChange('disability_status', e.target.checked)}
                    className="mt-0.5 text-blue-700 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Person with Disability (PwD)</div>
                    <div className="text-[11px] text-slate-500">Has 40%+ benchmark certified disability</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="border border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleCalculate}
                disabled={loading}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>{loading ? 'Analyzing Official Rules...' : 'Check My Eligibility'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS DISPLAY */}
        {step === 4 && results && (
          <div className="space-y-6">
            {/* Mandatory Accuracy Disclaimer Alert */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-amber-950">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Preliminary Automated Eligibility Evaluation</h4>
                <p className="text-xs mt-1 text-amber-900 leading-relaxed">
                  {results.disclaimer}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                You May Be Eligible For ({results.results?.length || 0} Schemes)
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modify Answers
              </button>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {results.results?.map((item, index) => {
                const rawS = item.scheme;
                const s = getLocalizedScheme(rawS, lang);
                const matchPct = item.match_percentage;

                const govBadge = lang === 'ta'
                  ? (s.government_level === 'Central' ? 'மத்திய அரசுத் திட்டம்' : `மாநில அரசு: ${s.state_display || 'தமிழ்நாடு'}`)
                  : `${s.government_level} Scheme • ${s.state || 'All India'}`;

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {govBadge}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {s.name}
                        </h3>
                      </div>

                      {/* Match percentage badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-sm self-start sm:self-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{matchPct}% {lang === 'ta' ? 'பொருத்தம்' : 'Match'}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                      {s.short_description}
                    </p>

                    {/* Criteria Satisfaction Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      {/* Why You May Qualify */}
                      <div>
                        <div className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'ta' ? 'நீங்கள் தகுதிபெறக்கூடிய காரணங்கள்:' : 'Why you may qualify:'}</span>
                        </div>
                        <ul className="space-y-1 text-slate-700">
                          {item.why_qualify.map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Requirements You May Not Satisfy */}
                      {item.why_not_qualify && item.why_not_qualify.length > 0 && (
                        <div>
                          <div className="font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>{lang === 'ta' ? 'சரிபார்க்க வேண்டிய நிபந்தனைகள்:' : 'Requirements to double check:'}</span>
                          </div>
                          <ul className="space-y-1 text-slate-700">
                            {item.why_not_qualify.map((clause, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold shrink-0">⚠</span>
                                <span>{clause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-500 font-medium">
                        {lang === 'ta' ? 'அதிகாரப்பூர்வ ஆதாரம்: ' : 'Source: '}
                        <span className="text-slate-800 font-semibold">{s.source_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveScheme(s.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{lang === 'ta' ? 'சேமிக்க' : 'Save'}</span>
                        </button>

                        <Link
                          to={`/schemes/${s.id}`}
                          className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1"
                        >
                          <span>{lang === 'ta' ? 'முழு விவரங்கள்' : 'View Scheme Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindForMe;
