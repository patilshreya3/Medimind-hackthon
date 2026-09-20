import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Globe, 
  ChevronDown, 
  PhoneCall, 
  AlertTriangle, 
  Activity, 
  Radio, 
  MapPin, 
  Building2, 
  FileCheck, 
  Layers,
  Zap,
  Map,
  Sparkles,
  GitBranch,
  Bot,
  Siren,
  ArrowRightLeft,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../i18n/translations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCreateModal: () => void;
  activeRequestsCount: number;
  privacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openCreateModal,
  activeRequestsCount,
  privacyMode = true,
  onTogglePrivacyMode,
  onResetData,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const navItems = [
    { id: 'requests', label: t('navEmergencyRequest'), icon: AlertTriangle, badge: activeRequestsCount },
    { id: 'priority', label: '🚦 Dynamic Priority Queue', icon: Zap },
    { id: 'tracking', label: t('navLiveTracking'), icon: MapPin },
    { id: 'inventory', label: t('navInventory'), icon: Building2 },
    { id: 'heatmap', label: t('navHeatmap'), icon: Map },
    { id: 'predictions', label: t('navShortagePrediction'), icon: Sparkles },
    { id: 'failover', label: '🔄 Backup Donor Chain', icon: GitBranch },
    { id: 'coordinator', label: t('navAiCoordinator'), icon: Bot },
    { id: 'mass_casualty', label: t('navMassCasualty'), icon: Siren },
    { id: 'h2h', label: t('navHospitalTransfer'), icon: ArrowRightLeft },
    { id: 'alerts', label: t('navAlerts'), icon: Radio },
    { id: 'lifecycle', label: t('navLifecycle'), icon: Activity },
    { id: 'compatibility', label: t('navCompatibility'), icon: Layers },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      {/* Top Utility & Hackathon Problem Statement Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 sm:px-8 py-2.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center space-x-2 sm:space-x-2.5">
            {/* ☀️ / 🌙 Light & Dark Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 border border-slate-700"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-100">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-300" />
                  <span className="text-slate-100">Dark</span>
                </>
              )}
            </button>

            {/* 8. 🛡️ Patient Privacy Shield Toggle */}
            {onTogglePrivacyMode && (
              <button
                type="button"
                id="toggle-privacy-mode-btn"
                onClick={onTogglePrivacyMode}
                title="Toggle Patient Confidentiality & Phone Number Masking"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  privacyMode 
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/70 hover:bg-emerald-900' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${privacyMode ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{privacyMode ? '🛡️ Privacy: ON' : '🔓 Privacy: OFF'}</span>
              </button>
            )}

            {/* 3. 💾 Memory / Reset Demo Data Button */}
            {onResetData && (
              <button
                type="button"
                id="reset-memory-btn"
                onClick={onResetData}
                title="Reset application memory to initial factory state"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <span>↺ Reset</span>
              </button>
            )}

            <div className="hidden lg:flex items-center text-rose-300 font-bold text-xs bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800/40">
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-rose-400 animate-pulse" />
              <span>{t('emergencyHotline')}</span>
            </div>

            {/* Language Selection Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="language-dropdown-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 text-xs font-bold cursor-pointer"
                aria-haspopup="true"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span>{language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div 
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    {t('switchLanguage')}
                  </div>
                  <button
                    id="lang-select-en"
                    onClick={() => handleSelectLanguage('en')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      language === 'en' ? 'font-black text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40' : 'text-slate-700 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2.5 text-base">🇬🇧</span> English (Simple)
                    </span>
                    {language === 'en' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
                  </button>
                  <button
                    id="lang-select-hi"
                    onClick={() => handleSelectLanguage('hi')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      language === 'hi' ? 'font-black text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40' : 'text-slate-700 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2.5 text-base">🇮🇳</span> हिन्दी (सरल भाषा)
                    </span>
                    {language === 'hi' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-rose-200 dark:shadow-none shrink-0">
              <Heart className="w-7 h-7 fill-white stroke-rose-600 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  {t('appTitle')}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="header-create-emergency-btn"
              onClick={openCreateModal}
              className="flex items-center space-x-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-300"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              <span>{t('createRequestTitle')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <nav className="flex space-x-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 py-2" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-200 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-black ${
                    isActive ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
