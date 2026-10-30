import express from 'express';
import { db } from '../db/database.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * GET /api/teams
 * List all rescue teams and their deployed status
 */
router.get('/', async (req, res) => {
  try {
    const teams = await db.getAllTeams();
    const incidents = await db.getAllIncidents();

    // Attach active incident summary if team is dispatched
    const populated = teams.map(team => {
      let activeIncident = null;
      if (team.activeIncidentId) {
        activeIncident = incidents.find(i => i.id === team.activeIncidentId) || null;
      }
      return {
        ...team,
        activeIncident: activeIncident ? {
          id: activeIncident.id,
          title: activeIncident.title,
          severity: activeIncident.severity,
          location: activeIncident.location
        } : null
      };
    });

    res.json({ success: true, count: populated.length, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/teams
 * Register a new rescue unit
 */
router.post('/', async (req, res) => {
  try {
    const { name, teamType, membersCount, contactNumber, equipment, baseLocation } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Team name is required.' });
    }
    if (!teamType) {
      return res.status(400).json({ success: false, error: 'Team specialization type is required.' });
    }

    const newTeam = {
      id: `team-${crypto.randomUUID().slice(0, 6)}`,
      name: name.trim(),
      teamType,
      status: 'Available',
      activeIncidentId: null,
      membersCount: parseInt(membersCount, 10) || 4,
      contactNumber: contactNumber || '+91 90000-00000',
      equipment: Array.isArray(equipment) ? equipment : [equipment || 'Standard Gear'],
      baseLocation: baseLocation || 'Base Station'
    };

    if (!db.initialized) await db.init();
    db.data.teams.push(newTeam);
    await db.save();

    res.status(201).json({ success: true, data: newTeam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/teams/:id
 * Update rescue team status or gear
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status, equipment, membersCount, baseLocation } = req.body;
    const existing = await db.getTeamById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const updates = {};
    if (status) {
      const valid = ['Available', 'Dispatched', 'On-Site', 'Resting / Off-Duty'];
      if (!valid.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid team status. Choose from: ${valid.join(', ')}` });
      }
      updates.status = status;
    }
    if (equipment) updates.equipment = equipment;
    if (membersCount) updates.membersCount = parseInt(membersCount, 10);
    if (baseLocation) updates.baseLocation = baseLocation;

    const updated = await db.updateTeam(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/teams/dispatch
 * Coordinate and assign a rescue unit to an incident
 */
router.post('/dispatch', async (req, res) => {
  try {
    const { incidentId, teamId } = req.body;

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'incidentId is required.' });
    }

    const result = await db.assignTeam(incidentId, teamId || null);

    res.json({
      success: true,
      message: teamId ? 'Rescue team dispatched successfully.' : 'Team unassigned from incident.',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
