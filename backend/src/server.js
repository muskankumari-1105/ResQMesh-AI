import { createApp } from './app.js';
import { CONFIG } from './config.js';
import { db } from './db/database.js';

async function startServer() {
  try {
    // 1. Initialize persistent database
    console.log('[ResQMesh AI] Initializing persistent database store...');
    await db.init();
    const incidents = await db.getAllIncidents();
    const teams = await db.getAllTeams();
    console.log(`[ResQMesh AI] Database ready: ${incidents.length} incidents, ${teams.length} rescue teams loaded.`);

    // 2. Start Express application
    const app = createApp();
    const server = app.listen(CONFIG.port, () => {
      console.log('====================================================');
      console.log(` ResQMesh AI Backend Server Running`);
      console.log(` URL: http://localhost:${CONFIG.port}`);
      console.log(` Environment: ${CONFIG.nodeEnv}`);
      console.log(` AI Mode: ${CONFIG.geminiApiKey ? 'Gemini 1.5 Flash AI Active' : 'Deterministic Rule-Based Fallback Engine'}`);
      console.log(` Note: Simulation mode for Build With Bharat 5.0`);
      console.log('====================================================');
    });

    return server;
  } catch (err) {
    console.error('[ResQMesh AI] Failed to start server:', err);
    process.exit(1);
  }
}

// Start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export { startServer };
