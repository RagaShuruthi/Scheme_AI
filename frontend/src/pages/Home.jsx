import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  HeartPulse,
  Wheat,
  Users,
  UserCheck,
  Home as HomeIcon,
  Coins,
  Rocket,
  Accessibility,
  TreePine,
  Hammer,
  Clock,
  ExternalLink,
  Mic,
  MicOff,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { schemeService, updateService } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_TRANSLATIONS } from '../utils/schemeTamilTranslations';

const categoryIcons = {
  education: GraduationCap,
  scholarships: Award,
  employment: Briefcase,
  healthcare: HeartPulse,
  agriculture: Wheat,
  'women-child-welfare': Users,
  'senior-citizens': UserCheck,
  housing: HomeIcon,
  finance: Coins,
  entrepreneurship: Rocket,
  disability: Accessibility,
  'rural-development': TreePine,
  'skill-development': Hammer,
  'social-welfare': ShieldCheck,
};

const sampleQueriesEn = [
  "I am a 20 year old engineering student from Tamil Nadu and my family income is ₹2 lakh. Show me scholarships.",
  "I am a farmer and need financial assistance.",
  "Are there any schemes for women starting a business?",
  "Health insurance coverage for senior citizens in Tamil Nadu"
];

const sampleQueriesTa = [
  "நான் தமிழ்நாட்டைச் சேர்ந்த 20 வயது பொறியியல் மாணவன், கல்வி உதவித்தொகை காட்டுக.",
  "விவசாயிகளுக்கான உதவித்தொகை மற்றும் மானிய திட்டங்கள் எவை?",
  "மகளிருக்கான ₹1,000 உரிமைத் தொகை திட்டம் மற்றும் தொழில் கடன்கள்",
  "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் பற்றி சொல்லுங்கள்"
];

const Home = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ta' ? 'உங்கள் உலாவியில் குரல் தேடல் ஆதரவு இல்லை.' : 'Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        navigate(`/search?q=${encodeURIComponent(transcript)}`);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const sampleQueries = lang === 'ta' ? sampleQueriesTa : sampleQueriesEn;

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, schemesRes, updatesRes, statsRes] = await Promise.all([
          schemeService.getCategories(),
          schemeService.getSchemes({ limit: 6, sort: 'popular' }),
          updateService.getUpdates({ limit: 3 }),
          schemeService.getStats().catch(() => ({ data: { total_schemes: 2105, total_categories: 14 } }))
        ]);
        setCategories(catsRes.data);
        setFeaturedSchemes(schemesRes.data);
        setLatestUpdates(updatesRes.data.slice(0, 3));
        if (statsRes && statsRes.data) setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePromptClick = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - SchemeSaarthi Original AI Welfare Discovery Hub */}
      <section className="relative bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 text-slate-900 pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200/60">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[350px] h-[250px] bg-emerald-100/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-900">
              {lang === 'ta' ? '2,105+ அரசு நலத்திட்டங்கள்' : '2,105+ Verified Schemes'}
            </span>
          </div>

          {/* Inspiring Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto">
            {lang === 'ta'
              ? 'உங்களுக்கான அரசு நலத்திட்டங்கள்'
              : 'Find Government Schemes Built for You'}
          </h1>

          {/* Intelligent Omnibox with Speech-to-Text */}
          <div className="mt-8 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-2 shadow-xl border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all"
            >
              {/* Search Icon */}
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-blue-700" />
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isListening
                    ? (lang === 'ta' ? 'கேட்கிறது... பேசுங்கள்...' : 'Listening... Speak now...')
                    : t('hero.searchPlaceholder')
                }
                className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-hidden bg-transparent py-2.5 pr-2"
              />

              {/* Integrated Voice Input Button */}
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-2.5 rounded-xl transition-all mr-1.5 cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title={isListening ? 'Stop listening' : 'Speak in Tamil or English'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-700" />}
              </button>

              {/* Search Submit CTA */}
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold px-5 py-3 rounded-xl transition-all shrink-0 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>{t('hero.btnSearch')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Natural Language Sample Queries */}
            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{lang === 'ta' ? 'உதாரணம்:' : 'Try asking:'}</span>
              {sampleQueries.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 transition-all text-[11px] truncate max-w-xs cursor-pointer shadow-2xs"
                >
                  "{prompt.length > 36 ? prompt.substring(0, 36) + '...' : prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Access Citizen Demographic Chips */}
          <div className="mt-8 flex items-center justify-center gap-2.5 flex-wrap">
            {[
              { label: lang === 'ta' ? 'மாணவர்கள் & கல்வி' : 'Students & Education', q: 'scholarship student' },
              { label: lang === 'ta' ? 'விவசாயிகள்' : 'Farmers & Agri', q: 'farmer agriculture kisan' },
              { label: lang === 'ta' ? 'மகளிர் நலம்' : 'Women Welfare', q: 'women mother girl' },
              { label: lang === 'ta' ? 'சிறு தொழில் & கடன்' : 'MSME & Business', q: 'msme loan startup mudra' },
              { label: lang === 'ta' ? 'மருத்துவம் & காப்பீடு' : 'Healthcare & Insurance', q: 'health insurance medical' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/search?q=${encodeURIComponent(chip.q)}`)}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 3 Interactive Feature Trust Pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  🏛️
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  {lang === 'ta' ? '17 அரசு இணையதளங்கள்' : '17 Official Portals'}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === 'ta'
                  ? 'மத்திய அரசு, myScheme மற்றும் தமிழ்நாடு அரசின் அதிகாரப்பூர்வ தகவல்கள்.'
                  : 'Directly verified from myScheme, India.gov.in, and TN Government departments.'}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  {lang === 'ta' ? 'உடனடி தகுதி சரிபார்ப்பு' : 'Instant AI Eligibility'}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === 'ta'
                  ? 'வயது, வருமானம் மற்றும் சாதி வாரியாக 60 வினாடிகளில் தகுதியை அறியலாம்.'
                  : 'Match your age, income, and background against rule-based eligibility.'}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  🗣️
                </div>
                <h4 className="font-bold text-xs text-slate-900">
                  {lang === 'ta' ? 'குரல்வழி தேடல் (தமிழ்/EN)' : 'Voice AI (Tamil & English)'}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === 'ta'
                  ? 'தட்டச்சு செய்யாமல் நேரடியாக தமிழில் பேசிக் கேட்டாலே திட்டங்கள் கிடைக்கும்.'
                  : 'Ask naturally out loud in your mother tongue without typing.'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-white border-y border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">100%</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {lang === 'ta' ? 'அதிகாரப்பூர்வ அரசு ஆதாரங்கள்' : 'Official Government Sources'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">
              {stats?.total_schemes ? `${stats.total_schemes.toLocaleString()}+` : '2,100+'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {lang === 'ta' ? 'மத்திய & மாநில அரசுத் திட்டங்கள்' : 'Central & State Schemes'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">
              {stats?.total_categories || 14}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {lang === 'ta' ? 'இலக்கு நலப்பிரிவுகள்' : 'Target Welfare Categories'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {lang === 'ta' ? 'நிர்வாகக் கண்காணிப்புப் புதுப்பிப்புகள்' : 'Admin Monitored Updates'}
            </div>
          </div>
        </div>
      </section>

      {/* LATEST VERIFIED UPDATES BANNER */}
      {latestUpdates.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Real-Time Bulletin</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {t('home.latestUpdates')}
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                  {t('home.latestUpdatesSub')}
                </p>
              </div>

              <Link
                to="/updates"
                className="inline-flex items-center gap-1 text-xs font-bold bg-white text-blue-950 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shrink-0 shadow-sm"
              >
                View All Updates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestUpdates.map((update) => (
                <div
                  key={update.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-amber-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] mb-2">
                      <span className="font-semibold text-amber-300">{update.update_type}</span>
                      <span className="text-blue-200">
                        {update.verified_at ? new Date(update.verified_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{update.scheme_name}</h4>
                    <p className="text-xs text-blue-100 mt-1 line-clamp-2">{update.change_summary}</p>
                  </div>

                  <Link
                    to={`/schemes/${update.scheme_id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white mt-3"
                  >
                    View Scheme Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POPULAR CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('home.popularCategories')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t('home.popularCategoriesSub')}
            </p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
          >
            {lang === 'ta' ? 'அனைத்துப் பிரிவுகளையும் காண்க' : 'Explore all categories'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Award;
            const catName = lang === 'ta' ? (CATEGORY_TRANSLATIONS[cat.slug] || CATEGORY_TRANSLATIONS[cat.name] || cat.name) : cat.name;
            return (
              <Link
                key={cat.id}
                to={`/schemes?category_id=${cat.id}`}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                    {catName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>{cat.schemes_count || 1} {lang === 'ta' ? 'திட்டங்கள்' : 'schemes'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED SCHEMES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('home.recentlyAdded')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t('home.recentlyAddedSub')}
            </p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
          >
            {t('hero.btnBrowseAll')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* AI ELIGIBILITY FINDER PROMO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-12">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-8 sm:p-12 text-slate-950 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/10 text-slate-950 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Eligibility Matching Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight text-slate-950">
              Not sure which schemes apply to your current situation?
            </h2>
            <p className="mt-3 text-slate-900 text-sm sm:text-base leading-relaxed">
              Answer a simple 3-step questionnaire (age, state, income, student or farmer status) and SchemeSaarthi will match you against government criteria with satisfaction explanations.
            </p>
          </div>

          <Link
            to="/find-for-me"
            className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 shrink-0 text-sm sm:text-base flex items-center gap-2"
          >
            <span>Start Free Eligibility Check</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
