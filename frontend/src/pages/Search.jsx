import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchService, schemeService } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_TRANSLATIONS } from '../utils/schemeTamilTranslations';

const exampleQueriesEn = [
  "I am a 20 year old engineering student from Tamil Nadu and my family income is ₹2 lakh. Show me scholarships.",
  "I am a farmer and need financial assistance.",
  "Are there any schemes for women starting a business?",
  "Healthcare insurance for poor families in Tamil Nadu",
  "Interest free housing loan for urban families"
];

const exampleQueriesTa = [
  "நான் தமிழ்நாட்டைச் சேர்ந்த 20 வயது பொறியியல் மாணவன், குடும்ப வருமானம் ₹2 லட்சம். கல்வி உதவித்தொகை காட்டுக.",
  "விவசாயிகளுக்கான உதவித்தொகை மற்றும் மானிய திட்டங்கள் எவை?",
  "மகளிருக்கான ₹1,000 உரிமைத் தொகை திட்டம் மற்றும் கடனுதவி பற்றி சொல்லுங்கள்.",
  "தமிழ்நாடு முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்",
  "புதிய தொழில் தொடங்க பிணையமில்லா முத்ரா கடன் உதவி"
];

const Search = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(48);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [selectedGovLevel, setSelectedGovLevel] = useState(searchParams.get('gov_level') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');

  const exampleQueries = lang === 'ta' ? exampleQueriesTa : exampleQueriesEn;

  useEffect(() => {
    schemeService.getCategories().then((res) => setCategories(res.data)).catch(console.error);
    schemeService.getStates().then((res) => setStates(res.data)).catch(console.error);
  }, []);

  const performSearch = async (searchTerm, catId, govLevel, stateVal) => {
    setLoading(true);
    try {
      const params = {};
      if (catId) params.category_id = catId;
      if (govLevel) params.government_level = govLevel;
      if (stateVal) params.state = stateVal;

      const res = await searchService.search(searchTerm, params);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery, selectedCategory, selectedGovLevel, selectedState);
  }, [initialQuery, selectedCategory, selectedGovLevel, selectedState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query, selectedCategory, selectedGovLevel, selectedState);
  };

  const handleChipClick = (prompt) => {
    setQuery(prompt);
    setSearchParams({ q: prompt });
    performSearch(prompt, selectedCategory, selectedGovLevel, selectedState);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>
              {lang === 'ta' ? 'AI நுண்ணறிவு இயற்கை மொழித் தேடல்' : 'AI Intent-Aware Natural Language Search'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'ta' ? 'நுண்ணறிவு திட்டத் தேடல்' : 'Smart Scheme Search'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'ta'
              ? 'உங்கள் வயது, கல்வி, மாவட்டம் அல்லது தேவையை இயல்பான மொழியில் உள்ளிடுங்கள். AI உங்கள் தேவையைப் புரிந்து கொண்டு சரியான திட்டங்களை பரிந்துரைக்கும்.'
              : 'Type in normal language describing your age, education, location, or occupation. SchemeSaarthi understands intent and satisfies criteria rather than simple keyword matching.'}
          </p>
        </div>

        {/* Search Bar & Prompt suggestions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'ta'
                    ? "எ.கா: 'நான் தமிழ்நாட்டைச் சேர்ந்த 20 வயது பொறியியல் மாணவன், கல்வி உதவித்தொகை காட்டுக'..."
                    : "e.g. 'I am a 20 year old engineering student from Tamil Nadu with family income ₹2 lakh. Show me scholarships.'"
                }
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer shrink-0"
            >
              {lang === 'ta' ? 'தேடுக' : 'Search'}
            </button>
          </form>

          {/* Quick example queries */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              {lang === 'ta' ? 'முக்கிய மாதிரி தேடல்கள்:' : 'Popular queries to try:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChipClick(ex)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-left cursor-pointer"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar & Results count */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-blue-700" />
              <span>{lang === 'ta' ? 'வடிகட்டிகள்:' : 'Filters:'}</span>
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none"
            >
              <option value="">{lang === 'ta' ? 'அனைத்துப் பிரிவுகள்' : 'All Categories'}</option>
              {categories.map((c) => {
                const catName = lang === 'ta' ? (CATEGORY_TRANSLATIONS[c.slug] || CATEGORY_TRANSLATIONS[c.name] || c.name) : c.name;
                return (
                  <option key={c.id} value={c.id}>
                    {catName}
                  </option>
                );
              })}
            </select>

            {/* Gov Level filter */}
            <select
              value={selectedGovLevel}
              onChange={(e) => setSelectedGovLevel(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து அரசு நிலைகளும்' : 'All Government Levels'}</option>
              <option value="Central">{lang === 'ta' ? 'மத்திய அரசு' : 'Central Government'}</option>
              <option value="State">{lang === 'ta' ? 'மாநில அரசு' : 'State Government'}</option>
            </select>

            {/* State filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none"
            >
              <option value="">{lang === 'ta' ? 'அனைத்து மாநிலங்கள் / மத்திய அரசு' : 'All States / Central'}</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {(selectedCategory || selectedGovLevel || selectedState) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedGovLevel('');
                  setSelectedState('');
                }}
                className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
              >
                {lang === 'ta' ? 'வடிகட்டிகளை நீக்கு' : 'Clear Filters'}
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-600">
            {lang === 'ta'
              ? `${results.length} திட்டங்கள் கண்டறியப்பட்டன`
              : `Found ${results.length} Verified Schemes`}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'ta' ? 'பொருத்தமான திட்டங்கள் இல்லை' : 'No schemes match your query'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ta'
                ? 'உங்கள் வயது அல்லது குறிப்பிட்ட துறையை மாற்றி மீண்டும் தேடவும்.'
                : 'Try adjusting your search terms or clearing applied filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(0, displayLimit).map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>

            {results.length > displayLimit && (
              <div className="mt-10 text-center pb-8">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 48)}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>
                    {lang === 'ta'
                      ? `மேலும் முடிவுகளைக் காட்டு (+48) (${results.length - displayLimit} மீதமுள்ளது)`
                      : `Load More Results (+48) (${results.length - displayLimit} remaining)`}
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

export default Search;
