import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  Star,
  Search,
  Sun,
  Moon,
  Coins,
} from 'lucide-react';
import { useCrypto } from '../../store/useCryptoStore';
import { LiveIndicator } from '../common/LiveIndicator';
import { CurrencyCode } from '../../types/crypto';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    currency,
    setCurrency,
    theme,
    toggleTheme,
    watchlist,
    setIsSearchOpen,
  } = useCrypto();

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Markets', path: '/markets', icon: TrendingUp },
    {
      label: 'Watchlist',
      path: '/watchlist',
      icon: Star,
      badge: watchlist.length > 0 ? watchlist.length : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0f] border-b border-[#1e2333] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#12151e] border border-emerald-500/40 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17L9 11L13 15L21 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="21" cy="7" r="2" fill="#10b981"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white font-heading flex items-center gap-1.5">
                Crypto<span className="text-emerald-400">View</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase -mt-0.5 hidden sm:inline">
                Live Terminal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#161a26] text-white border border-[#262c3e]'
                      : 'text-slate-400 hover:text-white hover:bg-[#12151e]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div className="flex-1 max-w-sm mx-2 hidden lg:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#12151e] border border-[#1e2333] hover:border-[#2f374e] text-slate-400 hover:text-slate-200 text-xs transition group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              <span>Search coins, pairs, contracts...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-[#181c28] border border-[#262c3e] rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Live Indicator, Currency Selector, Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#12151e]"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Live Indicator */}
          <LiveIndicator />

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label="Select display currency"
              className="appearance-none bg-[#12151e] border border-[#1e2333] text-slate-200 text-xs font-mono font-medium py-1.5 pl-2.5 pr-6 rounded-lg hover:border-[#2f374e] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
              <option value="inr">INR (₹)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500 text-[9px]">
              ▼
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#12151e] border border-[#1e2333] hover:border-[#2f374e] transition"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Consistent Primary CTA in header */}
          <Link
            to="/markets"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors active:scale-95"
          >
            <span>Explore Live Markets</span>
            <span className="text-[11px]">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
