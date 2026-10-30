import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { db } from '../src/db/database.js';
import { calculateRuleBasedPriority, generateRuleBasedTriage } from '../src/services/aiService.js';

describe('ResQMesh AI Backend Verification Suite', () => {
  let server;
  let baseUrl;
  const testPort = 5055;

  before(async () => {
    await db.init();
    await db.resetToDemo();
    const app = createApp();
    server = app.listen(testPort);
    baseUrl = `http://localhost:${testPort}`;
  });

  after(() => {
    if (server) server.close();
  });

  test('Rule-Based AI Engine: calculates transparent priority scores correctly', () => {
    // Critical incident with 60 people affected and critical keywords
    const highRiskIncident = {
      title: 'Severe flash flood',
      incidentType: 'Flood',
      severity: 'Critical',
      description: 'Rising water trapped families on roof and submerged roads',
      peopleAffected: 60
    };

    const score = calculateRuleBasedPriority(highRiskIncident);
    assert.ok(score >= 80, `Expected score to be high (>=80), got: ${score}`);

    const triage = generateRuleBasedTriage(highRiskIncident);
    assert.strictEqual(triage.urgencyLevel, 'Immediate Life Threat');
    assert.strictEqual(triage.suggestedTeamType, 'Flood & Swift Water Rescue');
    assert.ok(triage.recommendations.length >= 2, 'Should provide actionable recommendations');
    assert.ok(triage.hazardFactors.length > 0, 'Should identify hazard factors');
  });

  test('GET / - API health & status returns correctly', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, 'ResQMesh AI API');
    assert.ok(data.disclaimer.includes('Build With Bharat 5.0'));
  });

  test('GET /api/incidents - retrieves pre-seeded incidents', async () => {
    const res = await fetch(`${baseUrl}/api/incidents`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.count >= 6, `Expected at least 6 seed incidents, got ${body.count}`);
    assert.ok(body.data[0].priorityScore >= body.data[1].priorityScore, 'Incidents should default to priority sort');
  });

  test('POST /api/incidents - validates required input fields', async () => {
    // Missing required fields
    const res = await fetch(`${baseUrl}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Hi',
        description: 'short'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.errors.length > 0, 'Should return validation errors');
  });

  test('POST /api/incidents - successfully creates and triages a new incident', async () => {
    const newIncidentPayload = {
      title: 'Power Substation Flooding Hazard',
      incidentType: 'Hazard',
      severity: 'High',
      description: 'Water rising near transformer yard, urgent power shutdown required to protect local shelter.',
      location: {
        address: 'Substation Road, Sector 8',
        city: 'Guwahati',
        lat: 26.1750,
        lng: 91.7650
      },
      peopleAffected: 45
    };

    const res = await fetch(`${baseUrl}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIncidentPayload)
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.id.startsWith('inc-'));
    assert.strictEqual(body.data.severity, 'High');
    assert.ok(body.data.priorityScore > 50, 'Priority score should be computed');
    assert.ok(body.data.aiTriage, 'AI triage report should be attached');
    assert.ok(body.data.aiTriage.source, 'AI triage source must be labeled');
  });

  test('GET /api/teams - lists rescue teams with assignments', async () => {
    const res = await fetch(`${baseUrl}/api/teams`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.count >= 5, 'Expected 5 rescue teams');
    const firstTeam = body.data[0];
    assert.ok(firstTeam.name);
    assert.ok(firstTeam.status);
    assert.ok(firstTeam.equipment.length > 0);
  });

  test('POST /api/teams/dispatch - coordinates team assignment to incident', async () => {
    // Find an available team
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const { data: teams } = await teamsRes.json();
    const availableTeam = teams.find(t => t.status === 'Available');
    assert.ok(availableTeam, 'Should have at least one available team');

    // Find an unassigned incident
    const incRes = await fetch(`${baseUrl}/api/incidents`);
    const { data: incidents } = await incRes.json();
    const unassignedInc = incidents.find(i => !i.assignedTeamId);
    assert.ok(unassignedInc, 'Should have at least one unassigned incident');

    // Dispatch team
    const dispatchRes = await fetch(`${baseUrl}/api/teams/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: unassignedInc.id,
        teamId: availableTeam.id
      })
    });

    assert.strictEqual(dispatchRes.status, 200);
    const dispatchBody = await dispatchRes.json();
    assert.strictEqual(dispatchBody.success, true);
    assert.strictEqual(dispatchBody.data.incident.assignedTeamId, availableTeam.id);
    assert.strictEqual(dispatchBody.data.team.status, 'Dispatched');
  });

  test('GET /api/demo/stats - returns summary counts and prototype metadata', async () => {
    const res = await fetch(`${baseUrl}/api/demo/stats`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.stats.activeIncidentsCount > 0);
    assert.ok(body.system.prototypeDisclaimer);
    assert.strictEqual(body.system.hackathon, 'Build With Bharat 5.0');
  });

  test('POST /api/demo/reset - successfully restores clean demo dataset', async () => {
    const res = await fetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.summary.incidentCount, 6);
    assert.strictEqual(body.summary.teamCount, 5);
  });
});
