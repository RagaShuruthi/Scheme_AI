import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Bookmark,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Compass,
  Bell,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on outside click or route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: lang === 'ta' ? 'திட்டங்கள் (2.1K)' : 'Schemes (2.1K)', path: '/schemes', badge: '2,105' },
    { name: lang === 'ta' ? 'தகுதி வழிகாட்டி' : 'Smart Matcher', path: '/find-for-me', highlight: true },
    { name: t('nav.updates'), path: '/updates' },
  ];

  const userInitial = user?.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Top Ambient Tricolor Micro-Stripe */}
      <div className="h-[3px] bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 w-full" />

      {/* Floating Modern Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
            
            {/* 1. Brand Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-950 flex items-center justify-center text-white shadow-md ring-1 ring-blue-200/50 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  SchemeSaarthi
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  AI
                </span>
              </div>
            </Link>

            {/* 2. Interactive Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-800 shadow-2xs font-bold'
                        : link.highlight
                        ? 'text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {link.highlight && <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                  <span>{link.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* 3. Action Suite (Language & Auth) */}
            <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
              
              {/* Modern Segmented Language Switcher */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-full border border-slate-200/80 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ta')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    lang === 'ta'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Profile or Primary CTA */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-900 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/saved"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors font-medium"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>{t('nav.saved')}</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t('nav.profile')}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-purple-700 hover:bg-purple-50 font-bold transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span>{t('nav.admin')}</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 hover:bg-red-50 text-left transition-colors font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 hover:text-blue-700 px-3 py-1.5 transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/find-for-me"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'ta' ? 'தகுதியைச் சரிபார்' : 'Check Eligibility'}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  link.highlight
                    ? 'text-indigo-700 bg-indigo-50/70'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 font-semibold"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>{t('nav.saved')}</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 font-semibold"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-purple-700 font-bold"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 font-semibold text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full shadow-sm"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
