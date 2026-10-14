import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useCrypto } from '../../store/useCryptoStore';
import { api } from '../../services/api';
import { SearchResultItem } from '../../types/crypto';
import { formatPrice } from '../../utils/formatters';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, currency, liveTicks } = useCrypto();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input whenever modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Debounce search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.search(query);
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectCoin(results[selectedIndex].id);
      }
    }
  };

  const handleSelectCoin = (coinId: string) => {
    setIsSearchOpen(false);
    navigate(`/coin/${coinId}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
            placeholder="Search cryptocurrency by name or symbol (e.g. BTC, Solana)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
          {results.length > 0 ? (
            results.map((coin, index) => {
              const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={coin.thumb}
                      alt={coin.name}
                      className="w-7 h-7 rounded-full bg-slate-800 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{coin.name}</span>
                        <span className="text-xs uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {coin.symbol}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Rank #{coin.market_cap_rank || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    {liveTick ? (
                      <span className="text-sm font-semibold font-mono text-emerald-400">
                        {formatPrice(liveTick.priceUsd, currency)}
                      </span>
                    ) : null}
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          ) : query.trim() && !loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No cryptocurrencies found matching "{query}".
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-slate-400 text-sm space-y-2">
              <p>Type coin name or ticker (e.g. BTC, ETH, Solana)</p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {['Bitcoin', 'Ethereum', 'Solana', 'Ripple', 'Cardano'].map((popular) => (
                  <button
                    key={popular}
                    onClick={() => setQuery(popular)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-750 border border-slate-700/60 transition"
                  >
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↵</kbd>
          </div>
          <span>Crypto-View Real-Time</span>
        </div>
      </div>
    </div>
  );
};
