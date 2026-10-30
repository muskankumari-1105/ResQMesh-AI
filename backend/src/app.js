import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import incidentRoutes from './routes/incidentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'ResQMesh AI API',
      version: '1.0.0',
      description: 'Intelligent Disaster-Response & Rescue-Coordination Platform',
      hackathon: 'Build With Bharat 5.0',
      disclaimer: CONFIG.hackathonNotice,
      endpoints: {
        incidents: '/api/incidents',
        teams: '/api/teams',
        demo: '/api/demo/stats'
      }
    });
  });

  // API Routes
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/demo', demoRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.path}`
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected internal server error occurred',
      message: err.message
    });
  });

  return app;
}
