import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import ta from '../locales/ta.json';

const translations = { en, ta };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('schemesaarthi_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('schemesaarthi_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.en;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
