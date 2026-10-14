import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CurrencyCode, LivePriceTick, ConnectionStatus } from '../types/crypto';
import { wsClient } from '../services/websocket';

interface CryptoContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  connectionStatus: ConnectionStatus;
  liveTicks: Record<string, LivePriceTick>;
  priceFlashes: Record<string, 'up' | 'down'>;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const CryptoContext = createContext<CryptoContextType | null>(null);

const STORAGE_KEYS = {
  CURRENCY: 'crypto_view_currency',
  THEME: 'crypto_view_theme',
  WATCHLIST: 'crypto_view_watchlist',
  RECENT: 'crypto_view_recent',
};

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Currency
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode) || 'usd';
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
  }, []);

  // 2. Theme (default dark)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // 3. Watchlist
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return saved ? JSON.parse(saved) : ['bitcoin', 'ethereum', 'solana'];
    } catch {
      return ['bitcoin', 'ethereum', 'solana'];
    }
  });

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((item) => item !== id);
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(next));
      return next;
    });
  }, []);

  const isInWatchlist = useCallback(
    (id: string) => watchlist.includes(id),
    [watchlist]
  );

  // 4. Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const next = [id, ...filtered].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(next));
      return next;
    });
  }, []);

  // 5. WebSocket & Real-time price ticks
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('OFFLINE');
  const [liveTicks, setLiveTicks] = useState<Record<string, LivePriceTick>>({});
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    const unsubStatus = wsClient.subscribeToStatus((status) => {
      setConnectionStatus(status);
    });

    const unsubTicks = wsClient.subscribeToTicks((incomingTicks) => {
      setLiveTicks((prevTicks) => {
        const nextTicks = { ...prevTicks };
        const newFlashes: Record<string, 'up' | 'down'> = {};

        for (const tick of incomingTicks) {
          const oldTick = prevTicks[tick.id] || prevTicks[tick.symbol];
          if (oldTick) {
            if (tick.priceUsd > oldTick.priceUsd) {
              newFlashes[tick.id] = 'up';
              newFlashes[tick.symbol] = 'up';
            } else if (tick.priceUsd < oldTick.priceUsd) {
              newFlashes[tick.id] = 'down';
              newFlashes[tick.symbol] = 'down';
            }
          }

          nextTicks[tick.id] = tick;
          nextTicks[tick.symbol] = tick;
        }

        if (Object.keys(newFlashes).length > 0) {
          setPriceFlashes((prevFlashes) => ({ ...prevFlashes, ...newFlashes }));
          // Clear flash after 1200ms
          setTimeout(() => {
            setPriceFlashes((cur) => {
              const cleaned = { ...cur };
              for (const k of Object.keys(newFlashes)) {
                delete cleaned[k];
              }
              return cleaned;
            });
          }, 1200);
        }

        return nextTicks;
      });
    });

    return () => {
      unsubStatus();
      unsubTicks();
    };
  }, []);

  // 6. Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      theme,
      toggleTheme,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      recentlyViewed,
      addRecentlyViewed,
      connectionStatus,
      liveTicks,
      priceFlashes,
      isSearchOpen,
      setIsSearchOpen,
    }),
    [
      currency,
      setCurrency,
      theme,
      toggleTheme,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      recentlyViewed,
      addRecentlyViewed,
      connectionStatus,
      liveTicks,
      priceFlashes,
      isSearchOpen,
    ]
  );

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
