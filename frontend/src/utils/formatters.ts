import { CurrencyCode } from '../types/crypto';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  inr: '₹',
};

/**
 * Format currency price accurately.
 * Handles micro-prices ($0.00001234) without loss of precision.
 */
export function formatPrice(
  amount: number | null | undefined,
  currency: CurrencyCode = 'usd',
  customDecimals?: number
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (amount === 0) {
    return `${symbol}0.00`;
  }

  if (customDecimals !== undefined) {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: customDecimals,
      maximumFractionDigits: customDecimals,
    })}`;
  }

  const absAmount = Math.abs(amount);

  if (absAmount >= 1000) {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (absAmount >= 1) {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  } else if (absAmount >= 0.0001) {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    })}`;
  } else {
    // Very small tokens (e.g. PEPE, SHIB)
    return `${symbol}${amount.toFixed(8)}`;
  }
}

/**
 * Formats large market numbers into compact T (Trillion), B (Billion), M (Million), K (Thousand)
 * Example: $1.24T, $45.32B
 */
export function formatCompactNumber(
  amount: number | null | undefined,
  currency: CurrencyCode = 'usd'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const abs = Math.abs(amount);

  if (abs >= 1e12) {
    return `${symbol}${(amount / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${symbol}${(amount / 1e9).toFixed(2)}B`;
  }
  if (abs >= 1e6) {
    return `${symbol}${(amount / 1e6).toFixed(2)}M`;
  }
  if (abs >= 1e3) {
    return `${symbol}${(amount / 1e3).toFixed(2)}K`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/**
 * Format quantity numbers (e.g. circulating supply)
 */
export function formatSupply(amount: number | null | undefined, symbol = ''): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const abs = Math.abs(amount);
  let formatted = '';

  if (abs >= 1e12) {
    formatted = `${(amount / 1e12).toFixed(2)}T`;
  } else if (abs >= 1e9) {
    formatted = `${(amount / 1e9).toFixed(2)}B`;
  } else if (abs >= 1e6) {
    formatted = `${(amount / 1e6).toFixed(2)}M`;
  } else {
    formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  return symbol ? `${formatted} ${symbol.toUpperCase()}` : formatted;
}

/**
 * Formats percentage change with sign and arrow indicator (+5.23% ↑, -2.13% ↓)
 */
export function formatPercentage(
  percent: number | null | undefined,
  includeArrow = true
): {
  text: string;
  isPositive: boolean;
  isZero: boolean;
} {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return { text: '0.00%', isPositive: true, isZero: true };
  }

  const isZero = Math.abs(percent) < 0.001;
  const isPositive = percent > 0;
  const sign = isPositive ? '+' : '';
  const arrow = includeArrow ? (isPositive ? ' ↑' : isZero ? '' : ' ↓') : '';

  return {
    text: `${sign}${percent.toFixed(2)}%${arrow}`,
    isPositive,
    isZero,
  };
}

/**
 * Format timestamp to readable date/time
 */
export function formatDate(timestamp: number | string, includeTime = false): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';

  if (includeTime) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
