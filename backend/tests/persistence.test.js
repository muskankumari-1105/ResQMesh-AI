import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ResQMeshDatabase } from '../src/db/database.js';
import crypto from 'crypto';

describe('Database Persistence Verification Across Server Restarts', () => {
  test('Data created in session 1 is fully preserved when a fresh server instance boots up', async () => {
    // Session 1: Simulate running server
    const dbSession1 = new ResQMeshDatabase();
    await dbSession1.init();

    const uniqueId = `persist-${crypto.randomUUID().slice(0, 6)}`;
    const testIncident = {
      id: uniqueId,
      title: 'Persistent Verification Incident',
      incidentType: 'Flood',
      severity: 'Critical',
      description: 'Testing that data survives complete process termination and reboot.',
      location: { address: 'Test Sector 9', city: 'Guwahati', lat: 26.18, lng: 91.75 },
      peopleAffected: 50,
      status: 'Reported',
      priorityScore: 88,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbSession1.createIncident(testIncident);

    // Verify it is in session 1
    const found1 = await dbSession1.getIncidentById(uniqueId);
    assert.ok(found1, 'Incident must exist in session 1');
    assert.strictEqual(found1.title, 'Persistent Verification Incident');

    // Session 2: Simulate complete server reboot (fresh memory, re-reading from disk)
    const dbSession2 = new ResQMeshDatabase();
    await dbSession2.init();

    const found2 = await dbSession2.getIncidentById(uniqueId);
    assert.ok(found2, 'Incident MUST persist across server restart');
    assert.strictEqual(found2.id, uniqueId);
    assert.strictEqual(found2.title, 'Persistent Verification Incident');
    assert.strictEqual(found2.peopleAffected, 50);
    assert.strictEqual(found2.priorityScore, 88);

    // Clean up test entry
    await dbSession2.deleteIncident(uniqueId);
    const cleaned = await dbSession2.getIncidentById(uniqueId);
    assert.strictEqual(cleaned, null);
  });
});
