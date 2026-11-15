import React from 'react';
import { ShieldCheck, ExternalLink, Heart, Globe2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Official trust bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t('home.trustBadgeTitle')}
              </h4>
              <p className="text-xs text-slate-400">
                {t('home.trustBadgeDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400 flex-wrap">
            <a
              href="https://www.myscheme.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              myScheme <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              India.gov.in <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.tn.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              Tamil Nadu Portal <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              NSP Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm">
                SS
              </div>
              <span className="font-extrabold text-lg text-white">SchemeSaarthi</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              SchemeSaarthi is an AI-powered discovery gateway dedicated to assisting Indian citizens, students, farmers, women, and entrepreneurs in discovering welfare benefits from verified Central and State Government sources.
            </p>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-[11px] text-amber-200/90 leading-normal">
              <strong>Mandatory Disclaimer:</strong> SchemeSaarthi evaluates automated preliminary eligibility rules. Information provided does not constitute legal entitlement. Final approval and fund disbursement is exclusively governed by the official government authorities.
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Portals</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">PM-KISAN Samman Nidhi</a></li>
              <li><a href="https://pmjay.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">Ayushman Bharat PM-JAY</a></li>
              <li><a href="https://cmchistn.com" target="_blank" rel="noreferrer" className="hover:text-white">TN CMCHIS State Insurance</a></li>
              <li><a href="https://penkalvi.tn.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">TN Puthumai Penn Kalvi</a></li>
              <li><a href="https://mudra.org.in" target="_blank" rel="noreferrer" className="hover:text-white">MUDRA Loan Scheme</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System & Trust</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span>Automated Scraper Engine: Active</span></li>
              <li><span>Verification Standard: Admin Reviewed</span></li>
              <li><span>Official Domain Allowlist: Active</span></li>
              <li><span>Bilingual: English & தமிழ்</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 SchemeSaarthi. Open Government Welfare Discovery Platform.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built for citizen empowerment & financial inclusion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
