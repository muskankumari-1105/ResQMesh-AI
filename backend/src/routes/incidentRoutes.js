import express from 'express';
import { db } from '../db/database.js';
import { triageIncident } from '../services/aiService.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * GET /api/incidents
 * List incidents with optional filtering & sorting
 */
router.get('/', async (req, res) => {
  try {
    const { status, severity, incidentType, search, sortBy = 'priority' } = req.query;
    let incidents = await db.getAllIncidents();

    if (status && status !== 'all') {
      incidents = incidents.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }

    if (severity && severity !== 'all') {
      incidents = incidents.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
    }

    if (incidentType && incidentType !== 'all') {
      incidents = incidents.filter(i => i.incidentType.toLowerCase() === incidentType.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      incidents = incidents.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.location?.address && i.location.address.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'priority') {
      incidents.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    } else if (sortBy === 'newest') {
      incidents.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    } else if (sortBy === 'affected') {
      incidents.sort((a, b) => (b.peopleAffected || 0) - (a.peopleAffected || 0));
    }

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/incidents/:id
 * Retrieve a specific incident
 */
router.get('/:id', async (req, res) => {
  try {
    const incident = await db.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    let assignedTeam = null;
    if (incident.assignedTeamId) {
      assignedTeam = await db.getTeamById(incident.assignedTeamId);
    }

    res.json({
      success: true,
      data: {
        ...incident,
        assignedTeam
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/incidents
 * Create and prioritize a new incident
 */
router.post('/', async (req, res) => {
  try {
    const { title, incidentType, severity, description, location, peopleAffected } = req.body;

    // Beginner-friendly validation with clear error messages
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Title is required and must be at least 3 characters.');
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Description is required and must be at least 10 characters.');
    }
    if (!incidentType) {
      errors.push('Incident type is required (e.g. Flood, Medical Emergency, Building Collapse).');
    }
    const validSeverities = ['Critical', 'High', 'Medium', 'Low'];
    if (!severity || !validSeverities.includes(severity)) {
      errors.push(`Severity must be one of: ${validSeverities.join(', ')}.`);
    }
    const parsedPeople = parseInt(peopleAffected, 10);
    if (isNaN(parsedPeople) || parsedPeople < 0) {
      errors.push('People affected must be a valid non-negative number.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Default coordinates (e.g., Guwahati area for demo) if not provided
    const lat = location?.lat ? parseFloat(location.lat) : 26.1800 + (Math.random() - 0.5) * 0.05;
    const lng = location?.lng ? parseFloat(location.lng) : 91.7500 + (Math.random() - 0.5) * 0.05;

    const baseIncident = {
      id: `inc-${crypto.randomUUID().slice(0, 8)}`,
      title: title.trim(),
      incidentType,
      severity,
      description: description.trim(),
      location: {
        address: location?.address || 'Reported via Emergency Portal',
        city: location?.city || 'Disaster Zone',
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4))
      },
      peopleAffected: parsedPeople,
      status: 'Reported',
      assignedTeamId: null,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Run AI / Rule-Based Triage
    const triage = await triageIncident(baseIncident);
    baseIncident.priorityScore = triage.priorityScore;
    baseIncident.aiTriage = triage;

    const saved = await db.createIncident(baseIncident);

    res.status(201).json({
      success: true,
      message: 'Incident reported and prioritized successfully.',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/incidents/:id
 * Update incident status or details
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status, severity, description, title, peopleAffected } = req.body;
    const existing = await db.getIncidentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updates = {};
    if (status) {
      const validStatuses = ['Reported', 'Verified', 'Dispatched', 'In Progress', 'Resolved', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
      }
      updates.status = status;
    }

    if (severity) updates.severity = severity;
    if (description) updates.description = description;
    if (title) updates.title = title;
    if (peopleAffected !== undefined) updates.peopleAffected = parseInt(peopleAffected, 10);

    // If severity, description, or people count changed, re-run triage
    if (severity || description || peopleAffected !== undefined) {
      const updatedMock = { ...existing, ...updates };
      const triage = await triageIncident(updatedMock);
      updates.priorityScore = triage.priorityScore;
      updates.aiTriage = triage;
    }

    const updated = await db.updateIncident(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/incidents/:id/re-triage
 * Force re-assessment of an incident
 */
router.post('/:id/re-triage', async (req, res) => {
  try {
    const existing = await db.getIncidentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const triage = await triageIncident(existing);
    const updated = await db.updateIncident(req.params.id, {
      priorityScore: triage.priorityScore,
      aiTriage: triage
    });

    res.json({
      success: true,
      message: 'AI triage re-calculated.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/incidents/:id
 * Delete an incident
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteIncident(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, message: 'Incident removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
