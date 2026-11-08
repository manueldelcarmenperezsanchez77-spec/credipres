import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbManager } from './src/server/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body Parser for API mutations
  app.use(express.json({ limit: '25mb' }));

  // --- API ROUTES FOR CENTRAL REAL-TIME DATABASE ---

  // Health and connection status
  app.get('/api/status', (req: Request, res: Response) => {
    res.json(dbManager.getStatus());
  });

  // Get full central database
  app.get('/api/database', (req: Request, res: Response) => {
    res.json(dbManager.getDatabase());
  });

  // Real-time synchronization push from any device
  app.post('/api/sync', (req: Request, res: Response) => {
    const { entityType, data, sourceId } = req.body;
    if (!entityType) {
      return res.status(400).json({ error: 'entityType is required' });
    }

    const result = dbManager.updateEntity(entityType, data, sourceId);
    return res.json({
      success: true,
      ...result,
    });
  });

  // Server-Sent Events (SSE) for zero-latency multi-device live streaming
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    dbManager.registerClient(res);
  });

  // Reset database to default records
  app.post('/api/database/reset', (req: Request, res: Response) => {
    const { sourceId } = req.body;
    const freshDb = dbManager.resetDatabase(sourceId);
    res.json({ success: true, database: freshDb });
  });

  // Restore database from backup
  app.post('/api/database/restore', (req: Request, res: Response) => {
    const { backup, sourceId } = req.body;
    if (!backup || !backup.data) {
      return res.status(400).json({ error: 'Invalid backup structure' });
    }
    const restored = dbManager.restoreDatabase(backup.data, sourceId);
    res.json({ success: true, database: restored });
  });

  // --- FRONTEND INTEGRATION: VITE MIDDLEWARE IN DEV / STATIC IN PROD ---

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Vite] Middleware mounted in development mode');
  } else {
    // Production mode: Serve built dist assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Production] Serving static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`CrediGestión Central Database & Real-Time Sync Online`);
    console.log(`Running on: http://0.0.0.0:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
