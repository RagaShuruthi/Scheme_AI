import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass } from 'lucide-react';
import { userService } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import { useAuth } from '../contexts/AuthContext';

const SavedSchemes = () => {
  const { isAuthenticated } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchSaved = async () => {
      try {
        const res = await userService.getSavedSchemes();
        setSavedItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [isAuthenticated]);

  const handleSaveToggle = (schemeId, isSaved) => {
    if (!isSaved) {
      setSavedItems((prev) => prev.filter((item) => item.scheme.id !== schemeId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
          <Bookmark className="w-12 h-12 text-blue-700 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Saved Schemes</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Save interesting scholarships, financial schemes, and subsidies to receive notifications whenever deadlines or benefits change.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Saved Schemes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Schemes saved to your profile for tracking deadlines and updates.
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
            {savedItems.length} saved
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No schemes saved yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse government schemes and click the bookmark icon to save them here.
            </p>
            <Link
              to="/schemes"
              className="mt-4 inline-block px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Browse Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <SchemeCard
                key={item.id}
                scheme={item.scheme}
                initialSaved={true}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSchemes;
