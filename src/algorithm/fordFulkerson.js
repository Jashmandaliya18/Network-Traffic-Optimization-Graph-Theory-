/**
 * Ford-Fulkerson Algorithm (Edmonds-Karp BFS variant)
 * Computes maximum flow and records each augmentation step for visualization.
 */

/**
 * Build an adjacency-list representation from edge data.
 * @param {string[]} nodes - Array of node IDs
 * @param {{ source: string, target: string, capacity: number }[]} edges
 * @returns {{ graph: Object, capacities: Object, flow: Object }}
 */
function buildGraph(nodes, edges) {
  const graph = {};
  const capacities = {};
  const flow = {};

  nodes.forEach((n) => {
    graph[n] = [];
  });

  edges.forEach(({ source, target, capacity }) => {
    // Forward edge
    if (!graph[source]) graph[source] = [];
    if (!graph[target]) graph[target] = [];

    graph[source].push(target);
    graph[target].push(source); // reverse edge for residual

    const fKey = `${source}->${target}`;
    const rKey = `${target}->${source}`;

    capacities[fKey] = (capacities[fKey] || 0) + capacity;
    if (capacities[rKey] === undefined) capacities[rKey] = 0;

    flow[fKey] = flow[fKey] || 0;
    flow[rKey] = flow[rKey] || 0;
  });

  return { graph, capacities, flow };
}

/**
 * BFS to find an augmenting path from source to sink in the residual graph.
 * @returns {string[]|null} Path as array of node IDs, or null if no path exists.
 */
function bfs(graph, capacities, flow, source, sink) {
  const visited = new Set();
  const parent = {};
  const queue = [source];
  visited.add(source);

  while (queue.length > 0) {
    const u = queue.shift();

    for (const v of graph[u] || []) {
      const key = `${u}->${v}`;
      const residual = (capacities[key] || 0) - (flow[key] || 0);

      if (!visited.has(v) && residual > 0) {
        visited.add(v);
        parent[v] = u;

        if (v === sink) {
          // Reconstruct path
          const path = [];
          let current = sink;
          while (current !== source) {
            path.unshift(current);
            current = parent[current];
          }
          path.unshift(source);
          return path;
        }

        queue.push(v);
      }
    }
  }

  return null;
}

/**
 * Run the Ford-Fulkerson algorithm and record each step.
 * @param {string[]} nodeIds
 * @param {{ source: string, target: string, capacity: number }[]} edgeData
 * @param {string} source
 * @param {string} sink
 * @returns {{ maxFlow: number, steps: Array, minCutEdges: Array, finalFlow: Object }}
 */
export function fordFulkerson(nodeIds, edgeData, source, sink) {
  const { graph, capacities, flow } = buildGraph(nodeIds, edgeData);
  const steps = [];
  let maxFlow = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const path = bfs(graph, capacities, flow, source, sink);
    if (!path) break;

    // Find bottleneck
    let bottleneck = Infinity;
    let bottleneckEdge = null;
    for (let i = 0; i < path.length - 1; i++) {
      const key = `${path[i]}->${path[i + 1]}`;
      const residual = (capacities[key] || 0) - (flow[key] || 0);
      if (residual < bottleneck) {
        bottleneck = residual;
        bottleneckEdge = key;
      }
    }

    // Update flow along path
    for (let i = 0; i < path.length - 1; i++) {
      const fKey = `${path[i]}->${path[i + 1]}`;
      const rKey = `${path[i + 1]}->${path[i]}`;
      flow[fKey] = (flow[fKey] || 0) + bottleneck;
      flow[rKey] = (flow[rKey] || 0) - bottleneck;
    }

    maxFlow += bottleneck;

    // Record step
    steps.push({
      path: [...path],
      bottleneck,
      bottleneckEdge,
      cumulativeFlow: maxFlow,
      flowSnapshot: { ...flow },
    });
  }

  // Compute min-cut: BFS from source on final residual graph
  const reachable = new Set();
  const queue = [source];
  reachable.add(source);

  while (queue.length > 0) {
    const u = queue.shift();
    for (const v of graph[u] || []) {
      const key = `${u}->${v}`;
      const residual = (capacities[key] || 0) - (flow[key] || 0);
      if (!reachable.has(v) && residual > 0) {
        reachable.add(v);
        queue.push(v);
      }
    }
  }

  // Min-cut edges: edges from reachable to non-reachable with original capacity > 0
  const minCutEdges = [];
  edgeData.forEach(({ source: s, target: t, capacity }) => {
    if (reachable.has(s) && !reachable.has(t) && capacity > 0) {
      minCutEdges.push({ source: s, target: t, capacity });
    }
  });

  // Build final flow map for original edges only
  const finalFlow = {};
  edgeData.forEach(({ source: s, target: t }) => {
    const key = `${s}->${t}`;
    finalFlow[key] = Math.max(0, flow[key] || 0);
  });

  return { maxFlow, steps, minCutEdges, finalFlow };
}
