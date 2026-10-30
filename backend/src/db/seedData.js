export const initialIncidents = [
  {
    id: "inc-001",
    title: "Flash Flood Surge - Riverside Ward 12",
    incidentType: "Flood",
    severity: "Critical",
    description: "Water levels rose 1.8 meters in 40 minutes following dam release. 42 families stranded on rooftops, including infants and senior citizens. Rapid current prevents standard vehicle access.",
    location: {
      address: "Riverside Colony, Ghat Road, Ward 12",
      city: "Guwahati",
      lat: 26.1855,
      lng: 91.7539
    },
    peopleAffected: 85,
    status: "In Progress",
    assignedTeamId: "team-005",
    priorityScore: 94,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "Immediate Life Threat",
      recommendations: [
        "Deploy motorized shallow-draft inflatable rescue boats.",
        "Equip responders with personal flotation devices and tether lines.",
        "Establish elevated emergency triage point at High School terrace."
      ],
      hazardFactors: ["Rapid current", "Rising water", "Trapped vulnerable individuals"]
    },
    reportedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: "inc-002",
    title: "Structural Partial Collapse - Old Market Complex",
    incidentType: "Building Collapse",
    severity: "Critical",
    description: "Three-story brick masonry commercial building collapsed following heavy torrential rain. Shouts heard from rubble basement. Gas smell reported nearby.",
    location: {
      address: "Old Municipal Market, Station Road",
      city: "Guwahati",
      lat: 26.1822,
      lng: 91.7482
    },
    peopleAffected: 16,
    status: "Dispatched",
    assignedTeamId: "team-001",
    priorityScore: 91,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "Immediate Life Threat",
      recommendations: [
        "Shut off local municipal gas mains before hydraulic cutting.",
        "Deploy acoustic and thermal sensing cameras to detect trapped survivors.",
        "Maintain secondary structural shoring to prevent further collapse."
      ],
      hazardFactors: ["Secondary collapse risk", "Suspected gas leak", "Trapped survivors"]
    },
    reportedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "inc-003",
    title: "Maternity & Pediatric Clinic Submerged Generator Failure",
    incidentType: "Medical Emergency",
    severity: "High",
    description: "Basement backup generator submerged in rainwater. Neonatal intensive care unit operating on 45-minute battery reserves. 22 patients need rapid transfer.",
    location: {
      address: "Mother & Child Care Center, Hill View Lane",
      city: "Guwahati",
      lat: 26.1738,
      lng: 91.7610
    },
    peopleAffected: 28,
    status: "Dispatched",
    assignedTeamId: "team-002",
    priorityScore: 84,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "High Priority",
      recommendations: [
        "Dispatch transport incubators with mobile oxygen supplies.",
        "Coordinate green-corridor ambulance route to Civil Hospital.",
        "Send backup portable generator on elevated utility truck."
      ],
      hazardFactors: ["Failing battery life", "Infants in ICU", "Waterlogged access"]
    },
    reportedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: "inc-004",
    title: "Highway NH-27 Landslide & Mudslip",
    incidentType: "Landslide",
    severity: "High",
    description: "Heavy debris and mudflow blocked both lanes of the arterial highway. At least 35 vehicles stranded with no detour. Two cars pushed to road shoulder edge.",
    location: {
      address: "National Highway 27, Mountain Bypass Km 14",
      city: "Guwahati",
      lat: 26.1420,
      lng: 91.7820
    },
    peopleAffected: 45,
    status: "Reported",
    assignedTeamId: null,
    priorityScore: 78,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "High Priority",
      recommendations: [
        "Halt approaching uphill traffic to avoid further weight on slope.",
        "Dispatch earthmoving equipment and safety spotters for continuing slope movement.",
        "Supply drinking water and thermal blankets to stranded passengers."
      ],
      hazardFactors: ["Unstable hillside", "Nighttime temperature drop", "Arterial route blocked"]
    },
    reportedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: "inc-005",
    title: "Drinking Water Contamination & Supplies Depleted in Shelter",
    incidentType: "Relief Supply",
    severity: "Medium",
    description: "Community school shelter holding 140 displaced residents has run out of potable water and clean baby formula. Three children exhibiting fever and dehydration symptoms.",
    location: {
      address: "Government High School Relief Camp, Ward 7",
      city: "Guwahati",
      lat: 26.1950,
      lng: 91.7350
    },
    peopleAffected: 140,
    status: "Reported",
    assignedTeamId: null,
    priorityScore: 65,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "Elevated Concern",
      recommendations: [
        "Dispatch 1,000 liters of bottled water and electrolyte packets.",
        "Deploy mobile paramedic for pediatric symptom screening.",
        "Distribute water purification chlorine tablets for emergency storage."
      ],
      hazardFactors: ["Waterborne illness risk", "Large concentrated population", "Young children"]
    },
    reportedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: "inc-006",
    title: "High-Voltage Cable Snapped Over Waterlogged Footpath",
    incidentType: "Hazard",
    severity: "Medium",
    description: "Tree branch severed 11kV distribution line across pedestrian alley. Wire is dangling close to standing floodwater. Area cordoned off by local residents with ropes.",
    location: {
      address: "Shastri Nagar Main Crossing",
      city: "Guwahati",
      lat: 26.1680,
      lng: 91.7450
    },
    peopleAffected: 25,
    status: "Reported",
    assignedTeamId: null,
    priorityScore: 60,
    aiTriage: {
      source: "Rule-Based Fallback Engine",
      urgencyLevel: "Elevated Concern",
      recommendations: [
        "Request urgent substation grid disconnect on Feeder Line 4.",
        "Maintain minimum 15-meter safety perimeter around water pool.",
        "Deploy utility lineman squad with insulated grounding tools."
      ],
      hazardFactors: ["Electrocution risk in water", "Heavy pedestrian corridor"]
    },
    reportedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString()
  }
];

export const initialTeams = [
  {
    id: "team-001",
    name: "NDRF 1st Battalion - Alpha Unit",
    teamType: "Urban Search & Rescue (USAR)",
    status: "Dispatched",
    activeIncidentId: "inc-002",
    membersCount: 14,
    contactNumber: "+91 98765-01001",
    equipment: ["Hydraulic Cutters", "Acoustic Life Detector", "Shoring Timber", "Thermal Scope"],
    baseLocation: "Guwahati Sector 2 Base"
  },
  {
    id: "team-002",
    name: "Rapid Medical Trauma Squad - Unit 3",
    teamType: "Medical Triage & Evacuation",
    status: "Dispatched",
    activeIncidentId: "inc-003",
    membersCount: 8,
    contactNumber: "+91 98765-01002",
    equipment: ["2 Advanced Life Support Ambulances", "Mobile Oxygen", "Pediatric Trauma Bags"],
    baseLocation: "Civil Hospital Emergency Hub"
  },
  {
    id: "team-003",
    name: "Fire & Hazardous Materials Squad 7",
    teamType: "Fire & Chemical Hazards",
    status: "Available",
    activeIncidentId: null,
    membersCount: 10,
    contactNumber: "+91 98765-01003",
    equipment: ["High-Pressure Water Tender", "Chemical Foam Unit", "Insulated Power Gear"],
    baseLocation: "Central Fire Station"
  },
  {
    id: "team-004",
    name: "SkyScan Aerial Recon Wing",
    teamType: "Drone Survey & Situational Intel",
    status: "Available",
    activeIncidentId: null,
    membersCount: 4,
    contactNumber: "+91 98765-01004",
    equipment: ["3 Thermal Imaging Drones", "Satellite Uplink Dish", "Long-Range Telemetry"],
    baseLocation: "Disaster Management HQ Rooftop"
  },
  {
    id: "team-005",
    name: "Riverine Deep Water Rescue Unit",
    teamType: "Flood & Swift Water Rescue",
    status: "Dispatched",
    activeIncidentId: "inc-001",
    membersCount: 12,
    contactNumber: "+91 98765-01005",
    equipment: ["4 Rigid Inflatable Boats", "Outboard Motors", "Water Tethers & PFDs"],
    baseLocation: "Brahmaputra Pier Depot"
  }
];
