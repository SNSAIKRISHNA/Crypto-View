import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Star, Search } from 'lucide-react';
import { useCrypto } from '../../store/useCryptoStore';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { watchlist, setIsSearchOpen } = useCrypto();

  const links = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'Markets', path: '/markets', icon: TrendingUp },
    {
      label: 'Watchlist',
      path: '/watchlist',
      icon: Star,
      badge: watchlist.length > 0 ? watchlist.length : undefined,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#090a0f] border-t border-[#1e2333] md:hidden pb-safe">
      <div className="grid grid-cols-4 h-16 items-center px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center gap-1 py-1 relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {link.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{link.label}</span>
            </Link>
          );
        })}

        {/* Search Action */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-slate-200"
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px]">Search</span>
        </button>
      </div>
    </div>
  );
};
