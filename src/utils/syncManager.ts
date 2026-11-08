/**
 * CrediGestión Real-Time Automatic Synchronization Engine
 * Connects to the central Express database server via Server-Sent Events (SSE)
 * and HTTP API, plus local BroadcastChannel & Storage events for zero-latency multi-device sync.
 */

const SYNC_CHANNEL_NAME = 'credigestion_sync_bus';
const SYNC_TIMESTAMP_KEY = 'credigestion_last_sync_timestamp';

export interface SyncPayload {
  entityType: 'loans' | 'clients' | 'payments' | 'invoices' | 'notifications' | 'settings' | 'users' | 'all';
  timestamp: number;
  sourceId?: string;
  version?: number;
}

// Generate unique ID for this browser tab/session
export const SESSION_ID = 'session_' + Math.random().toString(36).substring(2, 9);

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private sse: EventSource | null = null;
  private listeners: Set<(payload: SyncPayload) => void> = new Set();
  private onlineListeners: Set<(isOnline: boolean) => void> = new Set();
  private serverStatusListeners: Set<(connected: boolean, activeClients?: number) => void> = new Set();
  private lastKnownTimestamp: number = 0;
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isServerOnline: boolean = false;
  private activeConnectionsCount: number = 1;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // 1. Initialize BroadcastChannel if available
    try {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncPayload>) => {
          if (event.data && event.data.sourceId !== SESSION_ID) {
            this.handleIncomingSync(event.data);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err);
    }

    // 2. Storage event listener (fallback & cross-tab sync)
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === SYNC_TIMESTAMP_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.sourceId !== SESSION_ID) {
            this.handleIncomingSync(parsed);
          }
        } catch {
          this.handleIncomingSync({ entityType: 'all', timestamp: Date.now() });
        }
      }
    });

    // 3. Online/Offline network monitoring
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.notifyOnlineChange(true);
      this.connectSSE();
      this.broadcastChange('all');
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
      this.isServerOnline = false;
      this.notifyOnlineChange(false);
      this.notifyServerStatus(false);
    });

    // 4. Connect to Real-time Central Server SSE stream
    this.connectSSE();

    // Read initial timestamp
    try {
      const stored = localStorage.getItem(SYNC_TIMESTAMP_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.lastKnownTimestamp = parsed.timestamp || Date.now();
      } else {
        this.lastKnownTimestamp = Date.now();
      }
    } catch {
      this.lastKnownTimestamp = Date.now();
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined' || !window.EventSource) return;

    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }

    try {
      this.sse = new EventSource('/api/events');

      this.sse.addEventListener('connected', (e: MessageEvent) => {
        try {
          const info = JSON.parse(e.data);
          this.isServerOnline = true;
          this.activeConnectionsCount = info.connectedClients || 1;
          this.notifyServerStatus(true, this.activeConnectionsCount);
          console.log('[Central DB] Connected to real-time database event stream.');
        } catch {
          this.isServerOnline = true;
          this.notifyServerStatus(true);
        }
      });

      this.sse.addEventListener('sync', (e: MessageEvent) => {
        try {
          const payload: SyncPayload = JSON.parse(e.data);
          if (payload && payload.sourceId !== SESSION_ID) {
            console.log(`[Central DB] Live update received from central database for: ${payload.entityType}`);
            this.handleIncomingSync(payload);
          }
        } catch (err) {
          console.error('[Central DB] Failed to parse sync event:', err);
        }
      });

      this.sse.onerror = () => {
        this.isServerOnline = false;
        this.notifyServerStatus(false);
        if (this.sse) {
          this.sse.close();
          this.sse = null;
        }

        // Auto-reconnect after 4s
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (this.isOnlineStatus) {
              this.connectSSE();
            }
          }, 4000);
        }
      };
    } catch (err) {
      console.warn('[Central DB] EventSource init failed:', err);
    }
  }

  private handleIncomingSync(payload: SyncPayload) {
    this.lastKnownTimestamp = payload.timestamp;
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in sync listener callback:', err);
      }
    });
  }

  private notifyOnlineChange(status: boolean) {
    this.onlineListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in online status listener:', err);
      }
    });
  }

  private notifyServerStatus(connected: boolean, activeClients?: number) {
    this.serverStatusListeners.forEach((listener) => {
      try {
        listener(connected, activeClients);
      } catch (err) {
        console.error('Error in server status listener:', err);
      }
    });
  }

  /**
   * Broadcast that a dataset was updated locally AND push to Central Server
   */
  public broadcastChange(entityType: SyncPayload['entityType'] = 'all', dataPayload?: any) {
    const timestamp = Date.now();
    this.lastKnownTimestamp = timestamp;

    const payload: SyncPayload = {
      entityType,
      timestamp,
      sourceId: SESSION_ID,
    };

    // Save to localStorage to trigger storage events across windows
    try {
      localStorage.setItem(SYNC_TIMESTAMP_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Could not write sync timestamp:', err);
    }

    // Broadcast through BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('Could not post to broadcast channel:', err);
      }
    }

    // Dispatch custom event in current window
    try {
      window.dispatchEvent(new CustomEvent('credigestion:sync', { detail: payload }));
    } catch (err) {
      console.warn('Could not dispatch custom sync event:', err);
    }

    // Push to central database server
    if (dataPayload !== undefined) {
      this.pushToServer(entityType, dataPayload);
    }
  }

  /**
   * Push mutation to Central Database HTTP API
   */
  public async pushToServer(entityType: string, data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          data,
          sourceId: SESSION_ID,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        this.isServerOnline = true;
        this.notifyServerStatus(true);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Central DB] Failed to push to server:', err);
      this.isServerOnline = false;
      this.notifyServerStatus(false);
      return false;
    }
  }

  /**
   * Fetch full state from Central Database Server
   */
  public async fetchServerDatabase(): Promise<any | null> {
    try {
      const response = await fetch('/api/database', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        this.isServerOnline = true;
        this.notifyServerStatus(true);
        return data;
      }
      return null;
    } catch (err) {
      console.warn('[Central DB] Could not fetch server database:', err);
      this.isServerOnline = false;
      this.notifyServerStatus(false);
      return null;
    }
  }

  /**
   * Subscribe to automatic synchronization events
   */
  public onSync(callback: (payload: SyncPayload) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to network online/offline transitions
   */
  public onOnlineChange(callback: (isOnline: boolean) => void): () => void {
    this.onlineListeners.add(callback);
    return () => {
      this.onlineListeners.delete(callback);
    };
  }

  /**
   * Subscribe to server connection status
   */
  public onServerStatus(callback: (connected: boolean, activeClients?: number) => void): () => void {
    this.serverStatusListeners.add(callback);
    callback(this.isServerOnline, this.activeConnectionsCount);
    return () => {
      this.serverStatusListeners.delete(callback);
    };
  }

  public isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : this.isOnlineStatus;
  }

  public isServerConnected(): boolean {
    return this.isServerOnline;
  }

  public getActiveConnections(): number {
    return this.activeConnectionsCount;
  }

  public getLastSyncTimestamp(): number {
    return this.lastKnownTimestamp;
  }
}

export const syncManager = new SyncManager();
