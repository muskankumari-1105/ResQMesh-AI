const BASE_URL = '/api';

/**
 * ResQMesh AI Frontend API Service
 */
export const api = {
  // 1. Fetch system statistics & AI triage state
  async getStats() {
    const res = await fetch(`${BASE_URL}/demo/stats`);
    if (!res.ok) throw new Error(`Failed to load stats: ${res.statusText}`);
    return res.json();
  },

  // 2. Fetch list of incidents with optional filters
  async getIncidents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.search) params.append('search', filters.search);

    const url = `${BASE_URL}/incidents${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load incidents: ${res.statusText}`);
    return res.json();
  },

  // 3. Submit a new emergency incident report
  async createIncident(incidentData) {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.errors?.join(', ') || data.error || 'Failed to submit incident');
    }
    return data;
  },

  // 4. Update incident status
  async updateIncident(id, updates) {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update incident');
    return data;
  },

  // 5. Fetch rescue teams
  async getTeams() {
    const res = await fetch(`${BASE_URL}/teams`);
    if (!res.ok) throw new Error(`Failed to load teams: ${res.statusText}`);
    return res.json();
  },

  // 5b. Register a new rescue unit
  async createTeam(teamData) {
    const res = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register rescue team');
    return data;
  },

  // 5c. Update team status (Available, Dispatched, On-Site, Resting / Off-Duty)
  async updateTeamStatus(id, status) {
    const res = await fetch(`${BASE_URL}/teams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update team status');
    return data;
  },

  // 6. Coordinate rescue team dispatch
  async dispatchTeam(incidentId, teamId) {
    const res = await fetch(`${BASE_URL}/teams/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, teamId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch team');
    return data;
  },

  // 7. Reset to safe demo dataset
  async resetDemoData() {
    const res = await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo dataset');
    return data;
  }
};
