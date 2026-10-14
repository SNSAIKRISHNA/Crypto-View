import React from 'react';
import { useCrypto } from '../../store/useCryptoStore';

export const LiveIndicator: React.FC = () => {
  const { connectionStatus } = useCrypto();

  if (connectionStatus === 'LIVE') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected to real-time crypto price stream">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>LIVE</span>
      </div>
    );
  }

  if (connectionStatus === 'RECONNECTING') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Reconnecting to real-time price feed...">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>RECONNECTING</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20" title="Live stream offline. Showing cached market data.">
      <span className="h-2 w-2 rounded-full bg-slate-500"></span>
      <span>OFFLINE</span>
    </div>
  );
};
