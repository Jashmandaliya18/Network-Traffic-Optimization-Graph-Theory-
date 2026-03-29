/**
 * Mumbai Flood Evacuation Network Dataset
 *
 * Derived from:
 * - OpenStreetMap Mumbai road network (road names, types, connectivity)
 * - BMC historical flood reports (flooded zones: Kurla, Dharavi, Sion, Vikhroli, Chembur, Ghatkopar, Andheri East)
 * - HCM traffic flow standard: capacity = lanes × 1800 vehicles/hr, scaled to combined people+vehicles units
 */

// ── Node Definitions ────────────────────────────────────────────────────────
export const MUMBAI_NODES = [
  // Virtual super nodes
  { id: 'super_source', label: 'Super Source', type: 'super', lat: null, lng: null },
  { id: 'super_sink', label: 'Super Sink', type: 'super', lat: null, lng: null },

  // Flooded zones (historically worst-hit during monsoon)
  { id: 'kurla', label: 'Kurla', type: 'flooded', lat: 19.0726, lng: 72.8794, description: 'Mithi River overflow, historically worst flooded' },
  { id: 'dharavi', label: 'Dharavi', type: 'flooded', lat: 19.0438, lng: 72.8534, description: 'Low elevation, dense population 300k+' },
  { id: 'sion', label: 'Sion', type: 'flooded', lat: 19.0400, lng: 72.8620, description: 'Sion-Trombay Road flooding' },
  { id: 'vikhroli', label: 'Vikhroli', type: 'flooded', lat: 19.1100, lng: 72.9280, description: 'Bhandup pumping station overflow' },
  { id: 'chembur', label: 'Chembur', type: 'flooded', lat: 19.0522, lng: 72.8970, description: 'Eastern Express Hwy flooding' },
  { id: 'ghatkopar', label: 'Ghatkopar', type: 'flooded', lat: 19.0860, lng: 72.9080, description: 'Low-lying residential area' },
  { id: 'andheri_east', label: 'Andheri East', type: 'flooded', lat: 19.1190, lng: 72.8580, description: 'Mithi River basin' },

  // Transit nodes (intermediate routing points)
  { id: 'dadar', label: 'Dadar', type: 'transit', lat: 19.0178, lng: 72.8478 },
  { id: 'bandra', label: 'Bandra', type: 'transit', lat: 19.0544, lng: 72.8402 },
  { id: 'worli', label: 'Worli', type: 'transit', lat: 19.0130, lng: 72.8174 },
  { id: 'mulund', label: 'Mulund', type: 'transit', lat: 19.1726, lng: 72.9560 },
  { id: 'thane_check', label: 'Thane Naka', type: 'transit', lat: 19.1860, lng: 72.9740 },
  { id: 'wadala', label: 'Wadala', type: 'transit', lat: 19.0176, lng: 72.8680 },
  { id: 'mankhurd', label: 'Mankhurd', type: 'transit', lat: 19.0660, lng: 72.9320 },

  // Safe shelter nodes (evacuation destinations)
  { id: 'borivali', label: 'Borivali', type: 'shelter', lat: 19.2290, lng: 72.8560, description: 'Highest elevation, NDRF camp' },
  { id: 'cst', label: 'CST / Fort', type: 'shelter', lat: 18.9400, lng: 72.8356, description: 'Solid ground, major shelter' },
  { id: 'churchgate', label: 'Churchgate', type: 'shelter', lat: 18.9350, lng: 72.8270, description: 'South Mumbai, evacuation hub' },
  { id: 'thane', label: 'Thane', type: 'shelter', lat: 19.2183, lng: 72.9781, description: 'Outside Mumbai, NDRF relief camp' },
];

// ── Edge Definitions ────────────────────────────────────────────────────────
export const MUMBAI_EDGES = [
  // Eastern Express Highway segments (4 lanes = 7200 veh/hr, scaled to ~900-1000 units/hr)
  { source: 'kurla', target: 'ghatkopar', capacity: 900, roadName: 'Eastern Express Hwy', roadType: 'highway', lanes: 4 },
  { source: 'ghatkopar', target: 'mulund', capacity: 900, roadName: 'Eastern Express Hwy', roadType: 'highway', lanes: 4 },
  { source: 'mulund', target: 'thane', capacity: 1000, roadName: 'Eastern Express Hwy', roadType: 'highway', lanes: 4 },

  // Sion-Panvel Highway (3 lanes)
  { source: 'chembur', target: 'mankhurd', capacity: 600, roadName: 'Sion-Panvel Hwy', roadType: 'highway', lanes: 3 },
  { source: 'mankhurd', target: 'thane', capacity: 600, roadName: 'Sion-Panvel Hwy', roadType: 'highway', lanes: 3 },

  // LBS Marg (3 lanes = 500 units/hr)
  { source: 'kurla', target: 'sion', capacity: 500, roadName: 'LBS Marg', roadType: 'major', lanes: 3 },
  { source: 'sion', target: 'dadar', capacity: 500, roadName: 'LBS Marg', roadType: 'major', lanes: 3 },
  { source: 'dadar', target: 'worli', capacity: 450, roadName: 'Dr. Ambedkar Rd', roadType: 'major', lanes: 3 },
  { source: 'worli', target: 'churchgate', capacity: 400, roadName: 'Worli Sea Face Rd', roadType: 'major', lanes: 2 },

  // Western Express Highway (4 lanes)
  { source: 'andheri_east', target: 'bandra', capacity: 850, roadName: 'Western Express Hwy', roadType: 'highway', lanes: 4 },
  { source: 'bandra', target: 'worli', capacity: 700, roadName: 'Bandra-Worli Sea Link', roadType: 'highway', lanes: 4 },
  { source: 'andheri_east', target: 'borivali', capacity: 950, roadName: 'Western Express Hwy North', roadType: 'highway', lanes: 4 },

  // Local connector roads (1-2 lanes = 150-300 units/hr)
  { source: 'dharavi', target: 'sion', capacity: 200, roadName: 'Dharavi Rd', roadType: 'local', lanes: 2 },
  { source: 'dharavi', target: 'bandra', capacity: 180, roadName: '90 Feet Rd', roadType: 'local', lanes: 2 },
  { source: 'vikhroli', target: 'ghatkopar', capacity: 250, roadName: 'Jogeshwari-Vikhroli Link Rd', roadType: 'major', lanes: 2 },
  { source: 'vikhroli', target: 'mulund', capacity: 300, roadName: 'LBS Marg East', roadType: 'major', lanes: 2 },
  { source: 'sion', target: 'wadala', capacity: 250, roadName: 'Sion-Bandra Link', roadType: 'local', lanes: 2 },
  { source: 'wadala', target: 'cst', capacity: 350, roadName: 'Eastern Freeway', roadType: 'highway', lanes: 3 },
  { source: 'dadar', target: 'cst', capacity: 400, roadName: 'Dr. Babasaheb Ambedkar Rd', roadType: 'major', lanes: 3 },
  { source: 'thane_check', target: 'thane', capacity: 500, roadName: 'Thane-Belapur Rd', roadType: 'major', lanes: 3 },
  { source: 'mulund', target: 'thane_check', capacity: 400, roadName: 'Mulund-Airoli Bridge', roadType: 'major', lanes: 2 },

  // Super source to all flooded zones (unlimited supply from flooded population)
  { source: 'super_source', target: 'kurla', capacity: 2000, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'dharavi', capacity: 1500, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'sion', capacity: 1000, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'vikhroli', capacity: 800, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'chembur', capacity: 900, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'ghatkopar', capacity: 1200, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'super_source', target: 'andheri_east', capacity: 1100, roadName: '', roadType: 'virtual', lanes: 0 },

  // All shelters to super sink
  { source: 'borivali', target: 'super_sink', capacity: 2000, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'cst', target: 'super_sink', capacity: 1500, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'churchgate', target: 'super_sink', capacity: 1200, roadName: '', roadType: 'virtual', lanes: 0 },
  { source: 'thane', target: 'super_sink', capacity: 2500, roadName: '', roadType: 'virtual', lanes: 0 },
];

// ── Flood Scenarios ─────────────────────────────────────────────────────────
export const FLOOD_SCENARIOS = {
  mild: {
    label: 'Mild Flooding',
    description: 'Reduced local road capacity, highways unaffected',
    modifiers: (edges) =>
      edges.map((e) => {
        if (e.roadType === 'local') {
          return { ...e, capacity: Math.round(e.capacity * 0.6) }; // -40%
        }
        return { ...e };
      }),
  },

  moderate: {
    label: 'Moderate Flooding',
    description: 'Dharavi Rd blocked, LBS Marg −50%, Sion-Panvel Hwy −30%',
    modifiers: (edges) =>
      edges.map((e) => {
        if (e.roadName === 'Dharavi Rd') {
          return { ...e, capacity: 0 }; // blocked
        }
        if (e.roadName === 'LBS Marg') {
          return { ...e, capacity: Math.round(e.capacity * 0.5) }; // -50%
        }
        if (e.roadName === 'Sion-Panvel Hwy') {
          return { ...e, capacity: Math.round(e.capacity * 0.7) }; // -30%
        }
        return { ...e };
      }),
  },

  severe: {
    label: 'Severe Flooding',
    description: 'Multiple roads blocked, major roads −60%, EEH −40%',
    modifiers: (edges) =>
      edges.map((e) => {
        // Blocked roads
        if (['Dharavi Rd', '90 Feet Rd', 'Sion-Bandra Link'].includes(e.roadName)) {
          return { ...e, capacity: 0 };
        }
        // Eastern Express Highway -40%
        if (e.roadName === 'Eastern Express Hwy') {
          return { ...e, capacity: Math.round(e.capacity * 0.6) };
        }
        // All major roads -60%
        if (e.roadType === 'major') {
          return { ...e, capacity: Math.round(e.capacity * 0.4) };
        }
        return { ...e };
      }),
  },
};

// ── Helper: Apply flood scenario to edges ───────────────────────────────────
export function applyFloodScenario(edges, severity) {
  if (!severity || severity === 'none' || !FLOOD_SCENARIOS[severity]) {
    return edges.map((e) => ({ ...e }));
  }
  return FLOOD_SCENARIOS[severity].modifiers(edges);
}

// ── Convenience: Build the sample object for ControlPanel ───────────────────
export function getMumbaiSample(severity = 'none') {
  const modifiedEdges = applyFloodScenario(MUMBAI_EDGES, severity);

  const nodeIds = MUMBAI_NODES.map((n) => n.id);
  const edgeData = modifiedEdges.map((e) => ({
    source: e.source,
    target: e.target,
    capacity: e.capacity,
    roadName: e.roadName || '',
    roadType: e.roadType || '',
    lanes: e.lanes || 0,
  }));

  return {
    name: 'Mumbai Flood Evacuation',
    desc: `${nodeIds.length} nodes, ${edgeData.length} edges — Monsoon evacuation routing`,
    nodes: nodeIds,
    edges: edgeData,
    source: 'super_source',
    sink: 'super_sink',
    nodeMetadata: MUMBAI_NODES,
    isMumbai: true,
  };
}

// Population at risk per flooded zone (default assumption: 10,000 per zone)
export const POPULATION_PER_ZONE = 10000;
export const FLOODED_ZONE_COUNT = MUMBAI_NODES.filter((n) => n.type === 'flooded').length;
export const TOTAL_POPULATION_AT_RISK = FLOODED_ZONE_COUNT * POPULATION_PER_ZONE;
