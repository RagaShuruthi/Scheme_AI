import React, { useState, useEffect } from 'react';
import { User, Bell, Check, Save, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService, schemeService } from '../services/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [preferences, setPreferences] = useState({
    preferred_categories: [],
    preferred_states: ['Tamil Nadu'],
    notify_updates: true,
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    schemeService.getCategories().then((res) => setCategories(res.data)).catch(console.error);

    if (isAuthenticated) {
      userService.getPreferences().then((res) => {
        setPreferences({
          preferred_categories: res.data.preferred_categories || [],
          preferred_states: res.data.preferred_states || ['Tamil Nadu'],
          notify_updates: res.data.notify_updates !== false,
        });
      }).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleCategoryToggle = (catId) => {
    setPreferences((prev) => {
      const exists = prev.preferred_categories.includes(catId);
      const updated = exists
        ? prev.preferred_categories.filter((id) => id !== catId)
        : [...prev.preferred_categories, catId];
      return { ...prev, preferred_categories: updated };
    });
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await userService.updatePreferences(preferences);
      setSuccessMsg('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <p className="text-slate-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user.full_name}</h1>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              <div className="text-[11px] text-slate-400 mt-2">
                Registered Citizen Profile • Verified Account
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Categories Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Scheme Update Alerts & Subscriptions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Select the categories you care about most. When official portals publish approved deadline extensions or policy amendments, SchemeSaarthi will notify you immediately.
          </p>

          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notify_updates}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, notify_updates: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-700"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Enable Real-Time Verified Alerts
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Receive in-app notifications whenever relevant schemes are officially updated.
                  </div>
                </div>
              </label>
            </div>

            {/* Category Subscriptions */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Subscribe to Specific Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((c) => {
                  const isChecked = preferences.preferred_categories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategoryToggle(c.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isChecked && <Check className="w-4 h-4 text-blue-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Alert Preferences'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
