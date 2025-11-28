export interface AlgorithmStep {
  description: string;
  currentNode?: number;
  visitedNodes: number[];
  currentPath: number[];
  exploringEdges?: Array<{ from: number; to: number }>;
  highlightEdge?: { from: number; to: number };
  cost?: number;
  additionalInfo?: string;
}

export interface TSPResult {
  path: number[];
  cost: number;
  executionTime: number;
  steps: AlgorithmStep[];
}

// Greedy Algorithm - Nearest Neighbor
export function greedyTSP(distanceMatrix: number[][]): TSPResult {
  const startTime = performance.now();
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const path: number[] = [0];
  visited[0] = true;
  let totalCost = 0;
  const steps: AlgorithmStep[] = [];

  steps.push({
    description: "Start at node 0",
    currentNode: 0,
    visitedNodes: [0],
    currentPath: [0],
    cost: 0,
    additionalInfo: "Greedy algorithm always starts at node 0"
  });

  for (let i = 0; i < n - 1; i++) {
    const current = path[path.length - 1];
    let nearest = -1;
    let minDistance = Infinity;

    // Find unvisited neighbors to explore
    const exploringEdges: Array<{ from: number; to: number }> = [];
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        exploringEdges.push({ from: current, to: j });
      }
    }

    steps.push({
      description: `At node ${current}, exploring unvisited neighbors`,
      currentNode: current,
      visitedNodes: [...path],
      currentPath: [...path],
      exploringEdges,
      cost: totalCost,
      additionalInfo: `Looking for the nearest unvisited node from ${current}`
    });

    for (let j = 0; j < n; j++) {
      if (!visited[j] && distanceMatrix[current][j] < minDistance) {
        minDistance = distanceMatrix[current][j];
        nearest = j;
      }
    }

    if (nearest !== -1) {
      path.push(nearest);
      visited[nearest] = true;
      totalCost += minDistance;

      steps.push({
        description: `Move to nearest node ${nearest} (distance: ${minDistance.toFixed(2)})`,
        currentNode: nearest,
        visitedNodes: [...path],
        currentPath: [...path],
        highlightEdge: { from: current, to: nearest },
        cost: totalCost,
        additionalInfo: `Added edge ${current} → ${nearest} with cost ${minDistance.toFixed(2)}`
      });
    }
  }

  // Return to start
  const finalCost = distanceMatrix[path[path.length - 1]][path[0]];
  totalCost += finalCost;

  steps.push({
    description: `Return to start node 0 (distance: ${finalCost.toFixed(2)})`,
    currentNode: 0,
    visitedNodes: [...path, 0],
    currentPath: [...path, 0],
    highlightEdge: { from: path[path.length - 1], to: 0 },
    cost: totalCost,
    additionalInfo: `Complete the tour. Total cost: ${totalCost.toFixed(2)}`
  });

  const executionTime = performance.now() - startTime;
  return { path, cost: totalCost, executionTime, steps };
}

// Held-Karp Algorithm - Dynamic Programming (Fixed)
export function heldKarpTSP(distanceMatrix: number[][]): TSPResult {
  const startTime = performance.now();
  const n = distanceMatrix.length;
  const steps: AlgorithmStep[] = [];
  
  // For large graphs, this becomes too expensive
  if (n > 15) {
    return {
      path: [],
      cost: Infinity,
      executionTime: performance.now() - startTime,
      steps: [{
        description: "Graph too large for Held-Karp",
        visitedNodes: [],
        currentPath: [],
        additionalInfo: `Held-Karp has O(n² 2ⁿ) complexity. For ${n} nodes, this is too expensive.`
      }]
    };
  }

  steps.push({
    description: "Initialize: Calculate distances from node 0 to all other nodes",
    currentNode: 0,
    visitedNodes: [0],
    currentPath: [0],
    additionalInfo: "Dynamic programming approach: build solutions for subsets"
  });

  // dp[mask][i] = minimum cost to visit all nodes in mask ending at node i
  const dp: number[][] = Array(1 << n).fill(0).map(() => Array(n).fill(Infinity));
  const parent: number[][] = Array(1 << n).fill(0).map(() => Array(n).fill(-1));
  
  // Start from node 0
  dp[1][0] = 0;

  steps.push({
    description: "Build solutions for all subsets of nodes",
    visitedNodes: [0],
    currentPath: [0],
    additionalInfo: "Computing optimal paths for each subset using dynamic programming"
  });

  // Iterate through all subsets
  for (let mask = 1; mask < (1 << n); mask++) {
    for (let last = 0; last < n; last++) {
      // If last node is not in the subset, skip
      if (!(mask & (1 << last))) continue;
      if (dp[mask][last] === Infinity) continue;

      // Try to extend to all nodes not in the subset
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue; // Already visited
        
        const newMask = mask | (1 << next);
        const newCost = dp[mask][last] + distanceMatrix[last][next];
        
        if (newCost < dp[newMask][next]) {
          dp[newMask][next] = newCost;
          parent[newMask][next] = last;
        }
      }
    }
  }

  // Find the best ending node
  const fullMask = (1 << n) - 1;
  let minCost = Infinity;
  let lastNode = -1;

  for (let i = 0; i < n; i++) {
    if (i === 0) continue;
    const cost = dp[fullMask][i] + distanceMatrix[i][0];
    if (cost < minCost) {
      minCost = cost;
      lastNode = i;
    }
  }

  // Reconstruct path
  const path: number[] = [];
  let mask = fullMask;
  let curr = lastNode;

  while (curr !== -1) {
    path.push(curr);
    const prev = parent[mask][curr];
    mask ^= (1 << curr);
    curr = prev;
  }

  path.reverse();

  steps.push({
    description: "Reconstructed optimal path",
    visitedNodes: path,
    currentPath: path,
    cost: minCost,
    additionalInfo: `Found optimal tour with cost ${minCost.toFixed(2)}`
  });

  const executionTime = performance.now() - startTime;
  return { path, cost: minCost, executionTime, steps };
}

// Christofides Algorithm
export function christofidesTSP(distanceMatrix: number[][]): TSPResult {
  const startTime = performance.now();
  const n = distanceMatrix.length;
  const steps: AlgorithmStep[] = [];

  steps.push({
    description: "Step 1: Find Minimum Spanning Tree (MST)",
    visitedNodes: [],
    currentPath: [],
    additionalInfo: "Using Prim's algorithm to find MST"
  });

  // Step 1: Find Minimum Spanning Tree using Prim's algorithm
  const mst = primMST(distanceMatrix);

  const mstEdges = mst.map(e => ({ from: e.from, to: e.to }));
  steps.push({
    description: "MST computed",
    visitedNodes: [],
    currentPath: [],
    exploringEdges: mstEdges,
    additionalInfo: `MST has ${mst.length} edges`
  });

  // Step 2: Find vertices with odd degree
  const degree = new Array(n).fill(0);
  for (const edge of mst) {
    degree[edge.from]++;
    degree[edge.to]++;
  }

  const oddVertices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] % 2 === 1) {
      oddVertices.push(i);
    }
  }

  steps.push({
    description: "Step 2: Find vertices with odd degree",
    visitedNodes: oddVertices,
    currentPath: [],
    additionalInfo: `Found ${oddVertices.length} vertices with odd degree: [${oddVertices.join(', ')}]`
  });

  // Step 3: Find minimum weight perfect matching on odd vertices
  const matching = minimumWeightMatching(oddVertices, distanceMatrix);

  const matchingEdges = matching.map(e => ({ from: e.from, to: e.to }));
  steps.push({
    description: "Step 3: Find minimum weight perfect matching",
    visitedNodes: oddVertices,
    currentPath: [],
    exploringEdges: matchingEdges,
    additionalInfo: `Created ${matching.length} matching pairs`
  });

  // Step 4: Combine MST and matching to form Eulerian graph
  const eulerianGraph: number[][] = Array(n).fill(0).map(() => []);
  for (const edge of mst) {
    eulerianGraph[edge.from].push(edge.to);
    eulerianGraph[edge.to].push(edge.from);
  }
  for (const edge of matching) {
    eulerianGraph[edge.from].push(edge.to);
    eulerianGraph[edge.to].push(edge.from);
  }

  steps.push({
    description: "Step 4: Combine MST and matching to form Eulerian graph",
    visitedNodes: [],
    currentPath: [],
    exploringEdges: [...mstEdges, ...matchingEdges],
    additionalInfo: "All vertices now have even degree"
  });

  // Step 5: Find Eulerian circuit
  const circuit = findEulerianCircuit(eulerianGraph, 0);

  steps.push({
    description: "Step 5: Find Eulerian circuit",
    visitedNodes: circuit,
    currentPath: circuit,
    additionalInfo: `Eulerian circuit visits ${circuit.length} vertices (with repetitions)`
  });

  // Step 6: Convert to Hamiltonian circuit by skipping repeated vertices
  const visited = new Set<number>();
  const path: number[] = [];
  for (const vertex of circuit) {
    if (!visited.has(vertex)) {
      path.push(vertex);
      visited.add(vertex);
    }
  }

  // Calculate total cost
  let totalCost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalCost += distanceMatrix[path[i]][path[i + 1]];
  }
  totalCost += distanceMatrix[path[path.length - 1]][path[0]];

  steps.push({
    description: "Step 6: Create Hamiltonian circuit by removing duplicates",
    visitedNodes: path,
    currentPath: path,
    cost: totalCost,
    additionalInfo: `Final tour with ${path.length} unique vertices. Total cost: ${totalCost.toFixed(2)}`
  });

  const executionTime = performance.now() - startTime;
  return { path, cost: totalCost, executionTime, steps };
}

function primMST(distanceMatrix: number[][]): { from: number; to: number; weight: number }[] {
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const mst: { from: number; to: number; weight: number }[] = [];
  
  visited[0] = true;
  
  for (let i = 0; i < n - 1; i++) {
    let minWeight = Infinity;
    let minFrom = -1;
    let minTo = -1;
    
    for (let j = 0; j < n; j++) {
      if (!visited[j]) continue;
      
      for (let k = 0; k < n; k++) {
        if (!visited[k] && distanceMatrix[j][k] < minWeight) {
          minWeight = distanceMatrix[j][k];
          minFrom = j;
          minTo = k;
        }
      }
    }
    
    if (minTo !== -1) {
      visited[minTo] = true;
      mst.push({ from: minFrom, to: minTo, weight: minWeight });
    }
  }
  
  return mst;
}

function minimumWeightMatching(
  vertices: number[],
  distanceMatrix: number[][]
): { from: number; to: number }[] {
  const matching: { from: number; to: number }[] = [];
  const used = new Set<number>();
  
  // Simple greedy matching
  for (let i = 0; i < vertices.length; i++) {
    if (used.has(vertices[i])) continue;
    
    let minDist = Infinity;
    let bestMatch = -1;
    
    for (let j = i + 1; j < vertices.length; j++) {
      if (used.has(vertices[j])) continue;
      
      const dist = distanceMatrix[vertices[i]][vertices[j]];
      if (dist < minDist) {
        minDist = dist;
        bestMatch = j;
      }
    }
    
    if (bestMatch !== -1) {
      matching.push({ from: vertices[i], to: vertices[bestMatch] });
      used.add(vertices[i]);
      used.add(vertices[bestMatch]);
    }
  }
  
  return matching;
}

function findEulerianCircuit(graph: number[][], start: number): number[] {
  const adjList = graph.map(neighbors => [...neighbors]);
  const circuit: number[] = [];
  const stack: number[] = [start];
  
  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    
    if (adjList[v].length > 0) {
      const u = adjList[v].pop()!;
      // Remove reverse edge
      const idx = adjList[u].indexOf(v);
      if (idx !== -1) {
        adjList[u].splice(idx, 1);
      }
      stack.push(u);
    } else {
      circuit.push(stack.pop()!);
    }
  }
  
  return circuit.reverse();
}
