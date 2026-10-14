import { LivePriceTick, ConnectionStatus } from '../types/crypto';

type TickListener = (ticks: LivePriceTick[]) => void;
type StatusListener = (status: ConnectionStatus) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private tickListeners: Set<TickListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private status: ConnectionStatus = 'OFFLINE';
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private isIntentionallyClosed = false;

  constructor() {
    this.connect();
  }

  private getWsUrl(): string {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    const isHttps = window.location.protocol === 'https:';
    const host = window.location.host;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:5000/ws';
    }
    return `${isHttps ? 'wss:' : 'ws:'}//${host}/ws`;
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isIntentionallyClosed = false;
    const wsUrl = this.getWsUrl();

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateStatus('LIVE');
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'INITIAL_STATE' && Array.isArray(payload.data)) {
            this.notifyTicks(payload.data);
            this.updateStatus('LIVE');
          } else if (payload.type === 'PRICE_UPDATE' && Array.isArray(payload.ticks)) {
            this.notifyTicks(payload.ticks);
          } else if (payload.type === 'STATUS_UPDATE') {
            this.updateStatus(payload.status);
          }
        } catch {
          // ignore malformed packets
        }
      };

      this.socket.onclose = () => {
        if (!this.isIntentionallyClosed) {
          this.updateStatus('RECONNECTING');
          this.scheduleReconnect();
        } else {
          this.updateStatus('OFFLINE');
        }
      };

      this.socket.onerror = () => {
        this.updateStatus('RECONNECTING');
        if (this.socket) {
          try {
            this.socket.close();
          } catch {}
        }
      };
    } catch {
      this.updateStatus('RECONNECTING');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isIntentionallyClosed) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private updateStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      for (const listener of this.statusListeners) {
        listener(status);
      }
    }
  }

  private notifyTicks(ticks: LivePriceTick[]): void {
    for (const listener of this.tickListeners) {
      listener(ticks);
    }
  }

  public subscribeToTicks(listener: TickListener): () => void {
    this.tickListeners.add(listener);
    return () => {
      this.tickListeners.delete(listener);
    };
  }

  public subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public close(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
    }
  }
}

export const wsClient = new WebSocketClient();
