import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Filter, Search, Building } from 'lucide-react';
import { schemeService } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_TRANSLATIONS, getLocalizedScheme } from '../utils/schemeTamilTranslations';

const BrowseSchemes = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(60);

  const selectedCategory = searchParams.get('category_id') || '';
  const selectedGovLevel = searchParams.get('government_level') || '';
  const selectedState = searchParams.get('state') || '';
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    schemeService.getCategories().then((res) => setCategories(res.data)).catch(console.error);
    schemeService.getStates().then((res) => setStates(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const params = { sort: sortBy, limit: 1500 };
        if (selectedCategory) params.category_id = selectedCategory;
        if (selectedGovLevel) params.government_level = selectedGovLevel;
        if (selectedState) params.state = selectedState;

        const res = await schemeService.getSchemes(params);
        setSchemes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [selectedCategory, selectedGovLevel, selectedState, sortBy]);

  const handleCategoryChange = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category_id', catId);
    } else {
      newParams.delete('category_id');
    }
    setSearchParams(newParams);
  };

  const handleGovLevelChange = (level) => {
    const newParams = new URLSearchParams(searchParams);
    if (level) {
      newParams.set('government_level', level);
    } else {
      newParams.delete('government_level');
    }
    setSearchParams(newParams);
  };

  const handleStateChange = (st) => {
    const newParams = new URLSearchParams(searchParams);
    if (st) {
      newParams.set('state', st);
    } else {
      newParams.delete('state');
    }
    setSearchParams(newParams);
  };

  // Filter schemes matching either English or Tamil names/descriptions
  const filteredSchemes = schemes.filter((s) => {
    const loc = getLocalizedScheme(s, lang);
    const filterLower = searchFilter.toLowerCase();
    return (
      s.name.toLowerCase().includes(filterLower) ||
      s.short_description.toLowerCase().includes(filterLower) ||
      (loc.name && loc.name.toLowerCase().includes(filterLower)) ||
      (loc.short_description && loc.short_description.toLowerCase().includes(filterLower))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                <Compass className="w-3.5 h-3.5 text-blue-700" />
                <span>
                  {lang === 'ta' ? 'தேசிய & மாநில நலத்திட்டங்கள் தொகுப்பு' : 'National & State Welfare Repository'}
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                {schemes.length} {lang === 'ta' ? 'அரசுத் திட்டங்கள் உள்ளன' : 'Verified Schemes Listed'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'ta' ? 'அரசு நலத்திட்டங்களை உலாவுக' : 'Browse Government Schemes'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'ta'
                ? 'அங்கீகரிக்கப்பட்ட அதிகாரப்பூர்வ அரசு தளங்களிலிருந்து தொகுக்கப்பட்ட நலத்திட்டங்கள், உதவித்தொகைகள் மற்றும் மானியங்களை எளிதாகக் கண்டறியுங்கள்.'
                : 'Explore welfare benefits, scholarships, subsidies, and assistance programs cataloged from verified official government portals.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">
                {lang === 'ta' ? 'மாநிலம்:' : 'State:'}
              </span>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
              >
                <option value="">{lang === 'ta' ? 'அனைத்து மாநிலங்கள் / மத்திய அரசு' : 'All States / Central'}</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">
                {lang === 'ta' ? 'வரிசைப்படுத்து:' : 'Sort:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
              >
                <option value="popular">{lang === 'ta' ? 'அதிகம் பார்க்கப்பட்டவை' : 'Most Viewed'}</option>
                <option value="latest">{lang === 'ta' ? 'சமீபத்தில் சரிபார்க்கப்பட்டவை' : 'Latest Verified'}</option>
                <option value="name">{lang === 'ta' ? 'அகரவரிசைப்படி' : 'Alphabetical'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Government Level Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
          <button
            onClick={() => handleGovLevelChange('')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              !selectedGovLevel
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ta' ? `அனைத்து திட்டங்கள் (${schemes.length})` : `All Schemes (${schemes.length})`}
          </button>
          <button
            onClick={() => handleGovLevelChange('Central')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedGovLevel === 'Central'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ta' ? 'மத்திய அரசுத் திட்டங்கள்' : 'Central Government Schemes'}
          </button>
          <button
            onClick={() => handleGovLevelChange('State')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedGovLevel === 'State'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ta' ? 'தமிழ்நாடு மாநில அரசுத் திட்டங்கள்' : 'Tamil Nadu State Schemes'}
          </button>
        </div>

        {/* Category Pills & Quick Filter input */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={lang === 'ta' ? 'திட்டங்களை பெயர் அல்லது சொற்கள் மூலம் வடிகட்டுக...' : 'Filter listed schemes by keyword...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleCategoryChange('')}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lang === 'ta' ? 'அனைத்துப் பிரிவுகள்' : 'All Categories'}
            </button>
            {categories.map((c) => {
              const catTitle = lang === 'ta' ? (CATEGORY_TRANSLATIONS[c.slug] || CATEGORY_TRANSLATIONS[c.name] || c.name) : c.name;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id.toString())}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    selectedCategory === c.id.toString()
                      ? 'bg-blue-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {catTitle} ({c.schemes_count || 1})
                </button>
              );
            })}
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'ta' ? 'திட்டங்கள் எதுவும் காணப்படவில்லை' : 'No schemes found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ta' ? 'உங்கள் தேடல் அல்லது பிரிவு தேர்வை மாற்றி முயற்சிக்கவும்.' : 'Try resetting your category or filter selection.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.slice(0, displayLimit).map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>

            {filteredSchemes.length > displayLimit && (
              <div className="mt-10 text-center pb-8">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 60)}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>
                    {lang === 'ta'
                      ? `மேலும் திட்டங்களைக் காட்டு (+60) (${filteredSchemes.length - displayLimit} மீதமுள்ளது)`
                      : `Load More Schemes (+60) (${filteredSchemes.length - displayLimit} remaining)`}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseSchemes;
