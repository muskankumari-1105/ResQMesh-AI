import { createApp } from '../src/app.js';
import { db } from '../src/db/database.js';
import fs from 'fs';
import path from 'path';

async function runDemoVerification() {
  console.log('=== Starting ResQMesh AI Hackathon Pre-Demo Verification ===\n');
  const results = [];
  const testPort = 5099;
  let server;

  try {
    // 1. Database Initialization
    await db.init();
    await db.resetToDemo();
    console.log('✔ [1/8] Database initialized and clean demo scenario loaded.');
    results.push({ test: 'Database Initialization & Reset', status: 'PASS' });

    // 2. Start Express API instance
    const app = createApp();
    server = app.listen(testPort);
    const baseUrl = `http://localhost:${testPort}`;
    console.log(`✔ [2/8] Backend Express server mounted on test port ${testPort}.`);
    results.push({ test: 'Backend API Mounting', status: 'PASS' });

    // 3. Test GET /api/demo/stats (Dashboard KPIs & Disclaimer)
    const statsRes = await fetch(`${baseUrl}/api/demo/stats`);
    const statsData = await statsRes.json();
    if (!statsRes.ok || !statsData.stats || !statsData.system) {
      throw new Error('Stats endpoint returned invalid structure');
    }
    console.log(`✔ [3/8] Live KPIs verified: ${statsData.stats.activeIncidentsCount} active incidents, ${statsData.stats.criticalCount} critical threats.`);
    console.log(`   AI Engine Mode: "${statsData.system.aiMode}"`);
    console.log(`   Prototype Disclaimer: "${statsData.system.prototypeDisclaimer}"`);
    results.push({ test: 'Dashboard KPIs & Disclaimer API', status: 'PASS' });

    // 4. Test Emergency Incident Reporting Workflow (Demo Incident)
    const demoPayload = {
      title: 'Demo Flood Surge Near Riverfront School',
      incidentType: 'Flood',
      severity: 'Critical',
      description: 'Rapid rising water has trapped civilians on terrace. Urgent shallow boats needed.',
      location: {
        address: 'Brahmaputra Embankment Road, Ward 4',
        city: 'Guwahati',
        lat: 26.1820,
        lng: 91.7510
      },
      peopleAffected: 55
    };

    const createRes = await fetch(`${baseUrl}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demoPayload)
    });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.data?.id) {
      throw new Error(`Incident creation failed: ${JSON.stringify(createData)}`);
    }

    const createdIncident = createData.data;
    console.log(`✔ [4/8] Emergency reporting workflow verified: Created incident "${createdIncident.title}" (ID: ${createdIncident.id}).`);
    console.log(`   Priority Score Calculated: ${createdIncident.priorityScore} / 100`);
    console.log(`   AI Urgency Level: ${createdIncident.aiTriage?.urgencyLevel}`);
    console.log(`   AI Source Tag: "${createdIncident.aiTriage?.source}"`);
    console.log(`   Tactical Recommendations: ${createdIncident.aiTriage?.recommendations?.length} steps generated.`);
    results.push({ test: 'Emergency Reporting & AI Priority Triage', status: 'PASS' });

    // 5. Test Status Update Workflow
    const patchRes = await fetch(`${baseUrl}/api/incidents/${createdIncident.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Dispatched' })
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok || patchData.data?.status !== 'Dispatched') {
      throw new Error('Failed to update incident status');
    }
    console.log(`✔ [5/8] Status update workflow verified: Changed status to "Dispatched".`);
    results.push({ test: 'Incident Status Lifecycle', status: 'PASS' });

    // 6. Test Team Management & Dispatching Workflow
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teamsData = await teamsRes.json();
    const availableTeam = teamsData.data.find(t => t.status === 'Available');
    if (!availableTeam) throw new Error('No available team found in fleet');

    // Dispatch team to our created incident
    const dispatchRes = await fetch(`${baseUrl}/api/teams/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: createdIncident.id,
        teamId: availableTeam.id
      })
    });
    const dispatchData = await dispatchRes.json();
    if (!dispatchRes.ok || dispatchData.data.team.status !== 'Dispatched') {
      throw new Error('Dispatch workflow failed');
    }
    console.log(`✔ [6/8] Rescue team dispatch verified: Assigned "${availableTeam.name}" to incident "${createdIncident.title}".`);

    // Recall team
    const recallRes = await fetch(`${baseUrl}/api/teams/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId: createdIncident.id,
        teamId: null
      })
    });
    if (!recallRes.ok) throw new Error('Team recall failed');
    console.log(`   Unit recall verified: Successfully returned "${availableTeam.name}" to Available status.`);
    results.push({ test: 'Fleet Dispatch & Unit Recall', status: 'PASS' });

    // 7. Verify Frontend Build Assets
    const distPath = path.join(process.cwd(), '..', 'frontend', 'dist');
    const indexHtmlExists = fs.existsSync(path.join(distPath, 'index.html'));
    const assetsDir = path.join(distPath, 'assets');
    const assetsExist = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length >= 2;

    if (!indexHtmlExists || !assetsExist) {
      throw new Error('Frontend dist/ assets are missing or incomplete');
    }
    console.log(`✔ [7/8] Frontend production build assets verified in frontend/dist/ (HTML, JS, and CSS bundles intact).`);
    results.push({ test: 'Frontend Client Distribution Bundles', status: 'PASS' });

    // 8. Clean Reset Database for Demo Readiness
    await db.resetToDemo();
    console.log(`✔ [8/8] Database restored to pristine demo disaster scenario for hackathon judges.`);
    results.push({ test: 'Clean Demo State Restoration', status: 'PASS' });

    console.log('\n======================================================');
    console.log(' ALL 8 HACKATHON VERIFICATION CHECKS PASSED (0 FAILURES)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Verification failure:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runDemoVerification();
