import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { LivePriceTick } from '../../types/crypto.js';

// Common mapping from Binance USDT symbol pairs to CoinGecko IDs
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  SOLUSDT: 'solana',
  BNBUSDT: 'binancecoin',
  XRPUSDT: 'ripple',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  AVAXUSDT: 'avalanche-2',
  TRXUSDT: 'tron',
  DOTUSDT: 'polkadot',
  POLUSDT: 'polygon-ecosystem-token',
  MATICUSDT: 'matic-network',
  LINKUSDT: 'chainlink',
  SHIBUSDT: 'shiba-inu',
  LTCUSDT: 'litecoin',
  NEARUSDT: 'near',
  UNIUSDT: 'uniswap',
  SUIUSDT: 'sui',
  PEPEUSDT: 'pepe',
  APTUSDT: 'aptos',
  ICPUSDT: 'internet-computer',
  RENDERUSDT: 'render-token',
  XLMUSDT: 'stellar',
  HBARUSDT: 'hedera-hashgraph',
  BCHUSDT: 'bitcoin-cash',
  FETUSDT: 'fetch-ai',
  TAOUSDT: 'bittensor',
};

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private binanceWs: WebSocket | null = null;
  private clients: Set<WebSocket> = new Set();
  private latestTicks: Map<string, LivePriceTick> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (clientWs: WebSocket) => {
      this.clients.add(clientWs);

      // Send initial connection acknowledgment & live prices snapshot
      const snapshot = Array.from(this.latestTicks.values());
      const welcomePacket = {
        type: 'INITIAL_STATE',
        status: 'LIVE',
        timestamp: Date.now(),
        data: snapshot,
      };

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(welcomePacket));
      }

      clientWs.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.action === 'ping') {
            clientWs.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch {
          // ignore invalid json
        }
      });

      clientWs.on('close', () => {
        this.clients.delete(clientWs);
      });

      clientWs.on('error', () => {
        this.clients.delete(clientWs);
      });
    });

    // Start connection to upstream Binance miniTicker WebSocket
    this.connectToBinanceStream();

    // Client heartbeat ping to keep sockets open
    this.heartbeatInterval = setInterval(() => {
      const pingPacket = JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() });
      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(pingPacket);
        }
      }
    }, 15000);
  }

  private connectToBinanceStream(): void {
    if (this.isDestroyed) return;

    try {
      // Connect to all USDT mini tickers stream
      const binanceUrl = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
      this.binanceWs = new WebSocket(binanceUrl);

      this.binanceWs.on('open', () => {
        console.log('[WebSocketService] Connected to Binance live miniTicker stream');
        this.reconnectAttempts = 0;
        this.broadcastStatus('LIVE');
      });

      this.binanceWs.on('message', (data: any) => {
        try {
          const tickers = JSON.parse(data.toString());
          if (Array.isArray(tickers)) {
            const updates: LivePriceTick[] = [];

            for (const ticker of tickers) {
              const pair = ticker.s; // e.g. "BTCUSDT"
              if (!pair || !pair.endsWith('USDT')) continue;

              const symbolRaw = pair.replace('USDT', '').toLowerCase();
              const coinId = SYMBOL_TO_ID_MAP[pair] || symbolRaw;

              const closePrice = parseFloat(ticker.c);
              const openPrice = parseFloat(ticker.o);
              const highPrice = parseFloat(ticker.h);
              const lowPrice = parseFloat(ticker.l);
              const volume = parseFloat(ticker.v);

              const priceChangePercent =
                openPrice > 0 ? ((closePrice - openPrice) / openPrice) * 100 : 0;

              const tick: LivePriceTick = {
                id: coinId,
                symbol: symbolRaw,
                priceUsd: closePrice,
                priceChangePercent24h: Number(priceChangePercent.toFixed(2)),
                high24h: highPrice,
                low24h: lowPrice,
                volume,
                timestamp: Date.now(),
              };

              this.latestTicks.set(coinId, tick);
              this.latestTicks.set(symbolRaw, tick);
              updates.push(tick);
            }

            if (updates.length > 0) {
              this.broadcastUpdates(updates);
            }
          }
        } catch (err: any) {
          console.warn('[WebSocketService] Error parsing Binance message:', err.message);
        }
      });

      this.binanceWs.on('close', () => {
        console.warn('[WebSocketService] Binance stream closed, scheduling reconnect');
        this.broadcastStatus('RECONNECTING');
        this.scheduleBinanceReconnect();
      });

      this.binanceWs.on('error', (err) => {
        console.warn('[WebSocketService] Binance stream error:', err.message);
        this.broadcastStatus('RECONNECTING');
        if (this.binanceWs) {
          try {
            this.binanceWs.terminate();
          } catch {}
        }
      });
    } catch (err: any) {
      console.error('[WebSocketService] Failed to initialize Binance WebSocket:', err.message);
      this.scheduleBinanceReconnect();
    }
  }

  private scheduleBinanceReconnect(): void {
    if (this.isDestroyed || this.reconnectTimer) return;

    this.reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s, up to 30s
    const backoffMs = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    console.log(`[WebSocketService] Reconnecting to Binance in ${Math.round(backoffMs / 1000)}s (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectToBinanceStream();
    }, backoffMs);
  }

  private broadcastUpdates(ticks: LivePriceTick[]): void {
    if (this.clients.size === 0) return;

    const payload = JSON.stringify({
      type: 'PRICE_UPDATE',
      ticks,
      timestamp: Date.now(),
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  private broadcastStatus(status: 'LIVE' | 'RECONNECTING' | 'OFFLINE'): void {
    const payload = JSON.stringify({
      type: 'STATUS_UPDATE',
      status,
      timestamp: Date.now(),
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public getLatestTick(idOrSymbol: string): LivePriceTick | undefined {
    return this.latestTicks.get(idOrSymbol.toLowerCase());
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public shutdown(): void {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.binanceWs) {
      try {
        this.binanceWs.close();
      } catch {}
    }
    if (this.wss) {
      for (const client of this.clients) {
        try {
          client.close();
        } catch {}
      }
      this.wss.close();
    }
  }
}

export const webSocketService = new WebSocketService();
