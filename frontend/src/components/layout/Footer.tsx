import React from 'react';
import { Link } from 'react-router-dom';
import { LiveIndicator } from '../common/LiveIndicator';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1e2333] bg-[#07080c] text-slate-400 mt-24 pb-28 md:pb-14 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1a1e2b]">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#12151e] border border-emerald-500/40 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17L9 11L13 15L21 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="21" cy="7" r="2" fill="#10b981"/>
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-heading">
                Crypto<span className="text-emerald-400">View</span> Terminal
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Low-latency cryptocurrency market dashboard streaming real-time spot prices, 24h trading volume, and global metrics directly to your workstation.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <LiveIndicator />
              <span className="text-[11px] font-mono text-slate-500">
                WSS Protocol • 45s Polling Cycle
              </span>
            </div>
          </div>

          {/* Col 2: Terminal Links */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Terminal
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Market Overview
                </Link>
              </li>
              <li>
                <Link to="/markets" className="text-slate-400 hover:text-white transition-colors">
                  Top 100 Assets
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="text-slate-400 hover:text-white transition-colors">
                  Personal Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Provenance & Architecture */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Data Ingestion
            </span>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>Spot Stream:</span>
                <span className="font-mono text-slate-300">Binance WSS</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Aggregations:</span>
                <span className="font-mono text-slate-300">CoinGecko v3</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Storage:</span>
                <span className="font-mono text-slate-300">Local (Private)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} Crypto-View. Real-time market analytics terminal.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Zero Tracker Cookies</span>
            <span>•</span>
            <span className="text-slate-400">100% Free & Open-Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

