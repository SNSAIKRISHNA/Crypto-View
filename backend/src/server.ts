import express from 'express';
import http from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import marketRoutes from './routes/marketRoutes.js';
import coinRoutes from './routes/coinRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { marketController } from './controllers/marketController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { webSocketService } from './services/crypto/websocketService.js';

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Global API Rate Limiter
app.use('/api', apiRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    wsClients: webSocketService.getConnectedClientsCount(),
  });
});

// Direct alias for /api/global
app.get('/api/global', (req, res, next) => marketController.getGlobal(req, res, next));

// API Routes
app.use('/api/markets', marketRoutes);
app.use('/api/coin', coinRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize WebSocket Service on the HTTP server
webSocketService.initialize(server);

// Start server
server.listen(ENV.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Crypto-View Backend Server Running`);
  console.log(`📡 HTTP Server: http://localhost:${ENV.PORT}`);
  console.log(`⚡ WebSocket Server: ws://localhost:${ENV.PORT}/ws`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log(`=========================================`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down server gracefully...');
  webSocketService.shutdown();
  server.close(() => {
    console.log('HTTP and WebSocket server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app, server };
