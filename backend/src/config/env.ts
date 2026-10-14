import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
  COINGECKO_BASE_URL: process.env.COINGECKO_API_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3',
  CACHE_TTL_MARKETS: parseInt(process.env.CACHE_TTL_MARKETS || '60', 10),
  CACHE_TTL_GLOBAL: parseInt(process.env.CACHE_TTL_GLOBAL || '120', 10),
  CACHE_TTL_COIN_DETAIL: parseInt(process.env.CACHE_TTL_COIN_DETAIL || '300', 10),
  CACHE_TTL_HISTORY: parseInt(process.env.CACHE_TTL_HISTORY || '300', 10),
};
