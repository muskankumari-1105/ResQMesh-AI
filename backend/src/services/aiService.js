import { CONFIG } from '../config.js';

/**
 * Transparent Rule-Based Priority Scoring Formula
 * Returns an integer score between 1 and 100
 */
export function calculateRuleBasedPriority(incident) {
  let score = 10;

  // 1. Severity weight (Up to 45 pts)
  const severity = (incident.severity || 'Medium').toLowerCase();
  if (severity === 'critical') score += 45;
  else if (severity === 'high') score += 32;
  else if (severity === 'medium') score += 18;
  else if (severity === 'low') score += 8;

  // 2. People Affected factor (Up to 35 pts)
  const count = parseInt(incident.peopleAffected || 1, 10);
  if (count >= 100) score += 35;
  else if (count >= 50) score += 28;
  else if (count >= 20) score += 22;
  else if (count >= 10) score += 15;
  else if (count >= 3) score += 8;
  else score += 4;

  // 3. Keyword Hazard Amplification (Up to 15 pts)
  const desc = ((incident.description || '') + ' ' + (incident.title || '')).toLowerCase();
  const criticalKeywords = [
    { word: 'trapped', pts: 4 },
    { word: 'collapse', pts: 4 },
    { word: 'infant', pts: 4 },
    { word: 'child', pts: 3 },
    { word: 'elderly', pts: 3 },
    { word: 'oxygen', pts: 4 },
    { word: 'submerged', pts: 3 },
    { word: 'rising water', pts: 4 },
    { word: 'gas leak', pts: 4 },
    { word: 'electrocution', pts: 4 },
    { word: 'bleeding', pts: 3 }
  ];

  let hazardBonus = 0;
  for (const { word, pts } of criticalKeywords) {
    if (desc.includes(word)) {
      hazardBonus += pts;
    }
  }
  score += Math.min(hazardBonus, 15);

  // Clamp score between 10 and 99
  return Math.min(Math.max(score, 10), 99);
}

/**
 * Determine recommended team specialization based on incident type
 */
export function recommendTeamType(incidentType) {
  const type = (incidentType || '').toLowerCase();
  if (type.includes('flood') || type.includes('water') || type.includes('drown')) {
    return 'Flood & Swift Water Rescue';
  }
  if (type.includes('collapse') || type.includes('landslide') || type.includes('debris') || type.includes('earthquake')) {
    return 'Urban Search & Rescue (USAR)';
  }
  if (type.includes('medical') || type.includes('hospital') || type.includes('casualty') || type.includes('injury')) {
    return 'Medical Triage & Evacuation';
  }
  if (type.includes('fire') || type.includes('gas') || type.includes('hazard') || type.includes('electric')) {
    return 'Fire & Chemical Hazards';
  }
  return 'General Disaster Relief & Logistics';
}

/**
 * Deterministic Rule-Based Triage Generator (Zero external API required)
 */
export function generateRuleBasedTriage(incident) {
  const score = calculateRuleBasedPriority(incident);
  const type = (incident.incidentType || 'General').toLowerCase();
  const desc = (incident.description || '').toLowerCase();
  const detectedHazards = [];

  if (desc.includes('water') || desc.includes('flood') || desc.includes('submerged')) {
    detectedHazards.push('Active floodwater or rising current');
  }
  if (desc.includes('trapped') || desc.includes('rubble') || desc.includes('collapse')) {
    detectedHazards.push('Entrapment in structural debris');
  }
  if (desc.includes('child') || desc.includes('infant') || desc.includes('patient') || desc.includes('elderly')) {
    detectedHazards.push('Vulnerable demographics present');
  }
  if (desc.includes('gas') || desc.includes('electric') || desc.includes('wire') || desc.includes('fire')) {
    detectedHazards.push('Secondary utility or hazardous materials threat');
  }
  if (detectedHazards.length === 0) {
    detectedHazards.push('Unassessed environmental hazard');
  }

  let urgencyLevel = 'Routine Assistance';
  if (score >= 85) urgencyLevel = 'Immediate Life Threat';
  else if (score >= 70) urgencyLevel = 'High Priority';
  else if (score >= 50) urgencyLevel = 'Elevated Concern';

  // Recommendations tailored to hazard type
  const recommendations = [];
  const suggestedTeam = recommendTeamType(type);

  if (suggestedTeam === 'Flood & Swift Water Rescue') {
    recommendations.push('Dispatch shallow-draft rescue crafts and personal flotation devices.');
    recommendations.push('Establish elevated safe assembly zones on accessible high ground.');
    recommendations.push('Deploy drone recon to chart downstream surge progression.');
  } else if (suggestedTeam === 'Urban Search & Rescue (USAR)') {
    recommendations.push('Isolate utility supply lines (power/gas) before deploying mechanical excavators.');
    recommendations.push('Use acoustic listening detectors and search canines to locate void survivors.');
    recommendations.push('Establish structural shoring to prevent secondary progressive collapse.');
  } else if (suggestedTeam === 'Medical Triage & Evacuation') {
    recommendations.push('Prepare field triage staging area with oxygen and trauma stabilization kits.');
    recommendations.push('Establish priority transport corridor to nearest designated regional trauma hospital.');
    recommendations.push('Dispatch mobile pediatric/geriatric medical emergency support.');
  } else if (suggestedTeam === 'Fire & Chemical Hazards') {
    recommendations.push('Establish minimum 100-meter safety isolation perimeter downwind.');
    recommendations.push('Deploy specialized chemical/electrical fire suppression appliances.');
    recommendations.push('Evacuate adjacent structures facing direct thermal or fume exposure.');
  } else {
    recommendations.push('Establish on-site command post and confirm exact headcount affected.');
    recommendations.push('Coordinate emergency food rations, clean drinking water, and sanitization kits.');
    recommendations.push('Maintain continuous two-way radio check-in every 15 minutes.');
  }

  return {
    source: 'Rule-Based Fallback Engine (No API Key Required)',
    priorityScore: score,
    urgencyLevel,
    suggestedTeamType: suggestedTeam,
    hazardFactors: detectedHazards,
    recommendations,
    timestamp: new Date().toISOString()
  };
}

/**
 * Intelligent Incident Triage Engine
 * Uses Gemini API if configured; seamlessly falls back to Rule-Based Engine
 */
export async function triageIncident(incident) {
  const fallbackResult = generateRuleBasedTriage(incident);

  if (!CONFIG.geminiApiKey || CONFIG.geminiApiKey.trim() === '') {
    return fallbackResult;
  }

  try {
    const prompt = `You are ResQMesh AI, an emergency disaster dispatch intelligence engine.
Analyze this simulated disaster incident:
Title: ${incident.title}
Incident Type: ${incident.incidentType}
Reported Severity: ${incident.severity}
People Affected: ${incident.peopleAffected}
Description: ${incident.description}
Location: ${incident.location?.address || 'Unknown'}

Return ONLY a valid JSON object with the following keys:
{
  "priorityScore": <integer between 10 and 99>,
  "urgencyLevel": "<Immediate Life Threat | High Priority | Elevated Concern | Routine Assistance>",
  "suggestedTeamType": "<Flood & Swift Water Rescue | Urban Search & Rescue (USAR) | Medical Triage & Evacuation | Fire & Chemical Hazards | General Disaster Relief & Logistics>",
  "hazardFactors": ["hazard 1", "hazard 2", "hazard 3"],
  "recommendations": ["step 1", "step 2", "step 3"]
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Defaulting safely to Rule-Based Engine.`);
      return fallbackResult;
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return fallbackResult;

    const parsed = JSON.parse(textOutput);
    return {
      source: 'Gemini 1.5 Flash AI',
      priorityScore: Math.min(Math.max(parsed.priorityScore || fallbackResult.priorityScore, 10), 99),
      urgencyLevel: parsed.urgencyLevel || fallbackResult.urgencyLevel,
      suggestedTeamType: parsed.suggestedTeamType || fallbackResult.suggestedTeamType,
      hazardFactors: Array.isArray(parsed.hazardFactors) ? parsed.hazardFactors : fallbackResult.hazardFactors,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallbackResult.recommendations,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.warn('Gemini AI call timed out or failed. Seamlessly used Rule-Based Fallback Engine:', err.message);
    return fallbackResult;
  }
}
