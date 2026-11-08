import fs from 'node:fs';
import path from 'node:path';
import { Response } from 'express';
import { getFullSeedDatabase } from './seedData';
import { 
  Client, 
  CompanySettings, 
  ElectronicInvoice, 
  Loan, 
  NotificationLog, 
  Payment, 
  SystemUser 
} from '../types';

export interface CentralDatabase {
  version: number;
  updatedAt: string;
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  invoices: ElectronicInvoice[];
  notifications: NotificationLog[];
  settings: CompanySettings;
  users: SystemUser[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseManager {
  private db: CentralDatabase;
  private sseClients: Set<Response> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDirectory();
    this.db = this.loadDatabase();
    this.startHeartbeat();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Error creating data directory:', err);
      }
    }
  }

  private loadDatabase(): CentralDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.loans)) {
          console.log(`[Central DB] Loaded existing database v${parsed.version || 1} from ${DB_FILE}`);
          return {
            version: parsed.version || 1,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            clients: parsed.clients || [],
            loans: parsed.loans || [],
            payments: parsed.payments || [],
            invoices: parsed.invoices || [],
            notifications: parsed.notifications || [],
            settings: parsed.settings || {},
            users: parsed.users || [],
          };
        }
      }
    } catch (err) {
      console.warn('[Central DB] Could not read existing database.json, initializing fresh seed database:', err);
    }

    const fresh = getFullSeedDatabase();
    this.writeSync(fresh);
    console.log(`[Central DB] Initialized fresh central database with default records.`);
    return fresh;
  }

  private writeSync(data: CentralDatabase) {
    try {
      this.ensureDataDirectory();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[Central DB] Failed to save database to disk:', err);
    }
  }

  public scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.writeSync(this.db);
    }, 200);
  }

  public getDatabase(): CentralDatabase {
    return this.db;
  }

  public getStatus() {
    return {
      online: true,
      version: this.db.version,
      updatedAt: this.db.updatedAt,
      connectedClients: this.sseClients.size,
      records: {
        clients: this.db.clients.length,
        loans: this.db.loans.length,
        payments: this.db.payments.length,
        invoices: this.db.invoices.length,
        notifications: this.db.notifications.length,
        users: this.db.users.length,
      },
    };
  }

  public updateEntity(
    entityType: 'clients' | 'loans' | 'payments' | 'invoices' | 'notifications' | 'settings' | 'users' | 'all',
    data: any,
    sourceId?: string
  ): { version: number; updatedAt: string } {
    this.db.version += 1;
    this.db.updatedAt = new Date().toISOString();

    if (entityType === 'clients') this.db.clients = data;
    else if (entityType === 'loans') this.db.loans = data;
    else if (entityType === 'payments') this.db.payments = data;
    else if (entityType === 'invoices') this.db.invoices = data;
    else if (entityType === 'notifications') this.db.notifications = data;
    else if (entityType === 'settings') this.db.settings = data;
    else if (entityType === 'users') this.db.users = data;
    else if (entityType === 'all' && data) {
      if (data.clients) this.db.clients = data.clients;
      if (data.loans) this.db.loans = data.loans;
      if (data.payments) this.db.payments = data.payments;
      if (data.invoices) this.db.invoices = data.invoices;
      if (data.notifications) this.db.notifications = data.notifications;
      if (data.settings) this.db.settings = data.settings;
      if (data.users) this.db.users = data.users;
    }

    this.scheduleSave();
    this.broadcastSyncEvent(entityType, sourceId);

    return {
      version: this.db.version,
      updatedAt: this.db.updatedAt,
    };
  }

  public resetDatabase(sourceId?: string): CentralDatabase {
    const fresh = getFullSeedDatabase();
    fresh.version = this.db.version + 1;
    this.db = fresh;
    this.writeSync(this.db);
    this.broadcastSyncEvent('all', sourceId);
    return this.db;
  }

  public restoreDatabase(backupData: any, sourceId?: string): CentralDatabase {
    this.db.version += 1;
    this.db.updatedAt = new Date().toISOString();
    this.db.clients = backupData.clients || [];
    this.db.loans = backupData.loans || [];
    this.db.payments = backupData.payments || [];
    this.db.invoices = backupData.invoices || [];
    this.db.notifications = backupData.notifications || [];
    this.db.settings = backupData.settings || this.db.settings;
    if (backupData.users) {
      this.db.users = backupData.users;
    }
    this.writeSync(this.db);
    this.broadcastSyncEvent('all', sourceId);
    return this.db;
  }

  // --- Real-Time Server-Sent Events (SSE) ---

  public registerClient(res: Response) {
    this.sseClients.add(res);

    // Initial handshake
    res.write(`event: connected\ndata: ${JSON.stringify({
      version: this.db.version,
      updatedAt: this.db.updatedAt,
      connectedClients: this.sseClients.size,
    })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  public broadcastSyncEvent(entityType: string, sourceId?: string) {
    const payload = JSON.stringify({
      entityType,
      version: this.db.version,
      updatedAt: this.db.updatedAt,
      timestamp: Date.now(),
      sourceId,
    });

    for (const client of this.sseClients) {
      try {
        client.write(`event: sync\ndata: ${payload}\n\n`);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  private startHeartbeat() {
    setInterval(() => {
      for (const client of this.sseClients) {
        try {
          client.write(`: heartbeat\n\n`);
        } catch {
          this.sseClients.delete(client);
        }
      }
    }, 20000);
  }
}

export const dbManager = new DatabaseManager();
