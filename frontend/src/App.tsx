import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CryptoProvider } from './store/useCryptoStore';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { HomePage } from './pages/HomePage';
import { MarketsPage } from './pages/MarketsPage';
import { CoinDetailPage } from './pages/CoinDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';

export function App() {
  return (
    <CryptoProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/coin/:id" element={<CoinDetailPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
          <SearchModal />
        </div>
      </BrowserRouter>
    </CryptoProvider>
  );
}

export default App;
