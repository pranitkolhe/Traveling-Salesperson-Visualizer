export interface Point {
  x: number;
  y: number;
  id: number;
}

export interface Edge {
  from: number;
  to: number;
  distance: number;
}

export function generateRandomPoints(count: number, width: number, height: number): Point[] {
  const points: Point[] = [];
  const padding = 50;
  
  for (let i = 0; i < count; i++) {
    points.push({
      x: padding + Math.random() * (width - 2 * padding),
      y: padding + Math.random() * (height - 2 * padding),
      id: i
    });
  }
  
  return points;
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function createDistanceMatrix(points: Point[]): number[][] {
  const n = points.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        matrix[i][j] = calculateDistance(points[i], points[j]);
      }
    }
  }
  
  return matrix;
}

export function calculatePathCost(path: number[], distanceMatrix: number[][]): number {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    cost += distanceMatrix[path[i]][path[i + 1]];
  }
  // Add cost to return to start
  cost += distanceMatrix[path[path.length - 1]][path[0]];
  return cost;
}
