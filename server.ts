import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server/server.js';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const server = http.createServer(app);

  if (!isProduction) {
    // Development mode: mount Vite middlewares
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[FixMyCity] Vite dev middleware attached in development mode.');
  } else {
    // Production mode: serve static build assets
    const distPath = path.resolve('dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[FixMyCity] Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FixMyCity] Failed to start server:', err);
  process.exit(1);
});
