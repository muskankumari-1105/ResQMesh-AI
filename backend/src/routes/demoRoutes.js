import express from 'express';
import { db } from '../db/database.js';
import { CONFIG } from '../config.js';

const router = express.Router();

/**
 * GET /api/demo/stats
 * Dashboard summary metrics & system status
 */
router.get('/stats', async (req, res) => {
  try {
    const incidents = await db.getAllIncidents();
    const teams = await db.getAllTeams();

    const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Cancelled');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'Critical');
    const dispatchedTeams = teams.filter(t => t.status === 'Dispatched' || t.status === 'On-Site');
    const totalPeopleAffected = activeIncidents.reduce((sum, i) => sum + (i.peopleAffected || 0), 0);

    const hasGemini = Boolean(CONFIG.geminiApiKey && CONFIG.geminiApiKey.trim().length > 0);

    res.json({
      success: true,
      stats: {
        totalIncidents: incidents.length,
        activeIncidentsCount: activeIncidents.length,
        criticalCount: criticalIncidents.length,
        dispatchedTeamsCount: dispatchedTeams.length,
        availableTeamsCount: teams.length - dispatchedTeams.length,
        totalPeopleAffected,
        resolvedCount: incidents.filter(i => i.status === 'Resolved').length
      },
      system: {
        prototypeDisclaimer: CONFIG.hackathonNotice,
        aiMode: hasGemini ? 'Gemini 1.5 Flash AI Active' : 'Deterministic Rule-Based Fallback Engine (No API Key Required)',
        aiEngine: hasGemini ? 'gemini' : 'rule-based',
        storage: 'Persistent JSON Store (Zero external DB setup required)',
        isSimulation: true,
        hackathon: 'Build With Bharat 5.0'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/demo/reset
 * Restore safe demo scenario data
 */
router.post('/reset', async (req, res) => {
  try {
    const summary = await db.resetToDemo();
    res.json({
      success: true,
      message: 'Demo dataset restored successfully.',
      summary
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
