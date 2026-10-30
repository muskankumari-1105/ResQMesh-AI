import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config.js';
import { initialIncidents, initialTeams } from './seedData.js';

export class ResQMeshDatabase {
  constructor() {
    this.filePath = CONFIG.dataPath;
    this.data = {
      incidents: [],
      teams: [],
      meta: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        app: "ResQMesh AI"
      }
    };
    this.initialized = false;
  }

  async init() {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      try {
        const raw = await fs.readFile(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure structure is intact
        if (!Array.isArray(this.data.incidents)) this.data.incidents = [];
        if (!Array.isArray(this.data.teams)) this.data.teams = [];
      } catch (readErr) {
        // File does not exist yet or corrupted; populate with default demo seed
        this.data = {
          incidents: JSON.parse(JSON.stringify(initialIncidents)),
          teams: JSON.parse(JSON.stringify(initialTeams)),
          meta: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            app: "ResQMesh AI"
          }
        };
        await this.save();
      }
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize ResQMesh persistent database:', err);
      throw err;
    }
  }

  async save() {
    this.data.meta.lastUpdated = new Date().toISOString();
    const tempPath = `${this.filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  // Incident Operations
  async getAllIncidents() {
    if (!this.initialized) await this.init();
    return [...this.data.incidents];
  }

  async getIncidentById(id) {
    if (!this.initialized) await this.init();
    return this.data.incidents.find(inc => inc.id === id) || null;
  }

  async createIncident(incident) {
    if (!this.initialized) await this.init();
    this.data.incidents.unshift(incident);
    await this.save();
    return incident;
  }

  async updateIncident(id, updates) {
    if (!this.initialized) await this.init();
    const index = this.data.incidents.findIndex(inc => inc.id === id);
    if (index === -1) return null;

    this.data.incidents[index] = {
      ...this.data.incidents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.save();
    return this.data.incidents[index];
  }

  async deleteIncident(id) {
    if (!this.initialized) await this.init();
    const index = this.data.incidents.findIndex(inc => inc.id === id);
    if (index === -1) return false;

    // Release any assigned team
    const assignedTeamId = this.data.incidents[index].assignedTeamId;
    if (assignedTeamId) {
      const team = this.data.teams.find(t => t.id === assignedTeamId);
      if (team && team.activeIncidentId === id) {
        team.activeIncidentId = null;
        team.status = 'Available';
      }
    }

    this.data.incidents.splice(index, 1);
    await this.save();
    return true;
  }

  // Rescue Team Operations
  async getAllTeams() {
    if (!this.initialized) await this.init();
    return [...this.data.teams];
  }

  async getTeamById(id) {
    if (!this.initialized) await this.init();
    return this.data.teams.find(team => team.id === id) || null;
  }

  async updateTeam(id, updates) {
    if (!this.initialized) await this.init();
    const index = this.data.teams.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.data.teams[index] = {
      ...this.data.teams[index],
      ...updates
    };
    await this.save();
    return this.data.teams[index];
  }

  async assignTeam(incidentId, teamId) {
    if (!this.initialized) await this.init();
    const incident = await this.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    // If incident already had a different team, free that team
    if (incident.assignedTeamId && incident.assignedTeamId !== teamId) {
      const prevTeam = this.data.teams.find(t => t.id === incident.assignedTeamId);
      if (prevTeam) {
        prevTeam.activeIncidentId = null;
        prevTeam.status = 'Available';
      }
    }

    if (teamId) {
      const team = await this.getTeamById(teamId);
      if (!team) throw new Error('Rescue team not found');

      incident.assignedTeamId = teamId;
      incident.status = incident.status === 'Reported' ? 'Dispatched' : incident.status;
      incident.updatedAt = new Date().toISOString();

      team.activeIncidentId = incidentId;
      team.status = 'Dispatched';
    } else {
      // Unassign team
      const prevTeam = this.data.teams.find(t => t.id === incident.assignedTeamId);
      if (prevTeam) {
        prevTeam.activeIncidentId = null;
        prevTeam.status = 'Available';
      }
      incident.assignedTeamId = null;
      incident.updatedAt = new Date().toISOString();
    }

    await this.save();
    return { incident, team: teamId ? await this.getTeamById(teamId) : null };
  }

  // Reset to Demo Data
  async resetToDemo() {
    this.data = {
      incidents: JSON.parse(JSON.stringify(initialIncidents)),
      teams: JSON.parse(JSON.stringify(initialTeams)),
      meta: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        app: "ResQMesh AI"
      }
    };
    await this.save();
    return {
      incidentCount: this.data.incidents.length,
      teamCount: this.data.teams.length,
      timestamp: this.data.meta.lastUpdated
    };
  }
}

export const db = new ResQMeshDatabase();
