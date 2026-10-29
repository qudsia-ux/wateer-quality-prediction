import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FLASK_PORT = 5000;
const FLASK_URL = `http://127.0.0.1:${FLASK_PORT}`;

// Launch Python Flask process if not already running
let flaskProcess: any = null;

function ensureFlaskRunning() {
  fetch(`${FLASK_URL}/api/status`)
    .then((res) => {
      if (res.ok) {
        console.log(`[Backend] Flask server already active on ${FLASK_URL}`);
      }
    })
    .catch(() => {
      console.log(`[Backend] Starting Python Flask backend on port ${FLASK_PORT}...`);
      flaskProcess = spawn('python3', [path.join(__dirname, 'backend', 'app.py')], {
        env: { ...process.env, PORT: String(FLASK_PORT) },
        stdio: 'inherit',
      });
      flaskProcess.on('error', (err: any) => {
        console.error('[Backend] Failed to start Flask process:', err);
      });
      flaskProcess.on('exit', (code: any, signal: any) => {
        console.log(`[Backend] Flask process exited with code ${code}, signal ${signal}`);
      });
    });
}

ensureFlaskRunning();

app.use(express.json());

// Proxy API requests to Flask backend
app.use('/api', async (req, res) => {
  const targetUrl = `${FLASK_URL}/api${req.url}`;
  
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const flaskRes = await fetch(targetUrl, fetchOptions);
    const contentType = flaskRes.headers.get('content-type') || 'application/json';
    const bodyText = await flaskRes.text();

    res.status(flaskRes.status);
    res.setHeader('Content-Type', contentType);
    res.send(bodyText);
  } catch (err: any) {
    console.error(`[API Proxy Error] Failed to proxy to ${targetUrl}:`, err.message);
    res.status(503).json({
      success: false,
      error: 'Backend Flask service is initializing or unreachable. Please retry in a moment.',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Web application running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
