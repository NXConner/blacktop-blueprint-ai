export type LatLng = [number, number];

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Simple marching squares to extract the outer contour from a binary mask
export async function vectorizeMaskToPolygon(maskBlob: Blob, bounds: GeoBounds, threshold = 127): Promise<LatLng[]> {
  const img = await createImageBitmap(maskBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Build binary grid (1 = foreground)
  const grid = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const v = data[idx]; // assume grayscale/alpha irrelevant
      grid[y * width + x] = v >= threshold ? 1 : 0;
    }
  }

  // Marching squares: find first foreground pixel
  function findStart(): [number, number] | null {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y * width + x] === 1) return [x, y];
      }
    }
    return null;
  }

  const start = findStart();
  if (!start) return [];

  // Trace contour (clockwise) using a simple border-follow algorithm
  const path: [number, number][] = [];
  let [cx, cy] = start;
  let dir = 0; // 0:right, 1:down, 2:left, 3:up
  const visited = new Set<string>();

  function isInside(x: number, y: number): boolean {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return grid[y * width + x] === 1;
  }

  function key(x: number, y: number): string { return `${x},${y}`; }

  // Limit to avoid infinite loops
  const maxSteps = width * height * 4;
  let steps = 0;

  do {
    path.push([cx, cy]);
    visited.add(key(cx, cy));
    // Try to keep the filled pixels on the left to follow outer boundary
    const rightDir = (dir + 3) & 3; // turn right
    const forwardDir = dir;
    const leftDir = (dir + 1) & 3; // turn left

    function stepDir(d: number): [number, number] {
      if (d === 0) return [1, 0];
      if (d === 1) return [0, 1];
      if (d === 2) return [-1, 0];
      return [0, -1];
    }

    // Check neighbors by preference: left, forward, right, back
    const candidates = [leftDir, forwardDir, rightDir, (dir + 2) & 3];
    let moved = false;
    for (const nd of candidates) {
      const [dx, dy] = stepDir(nd);
      const nx = cx + dx;
      const ny = cy + dy;
      // Move if next pixel is inside or we're skirting boundary in that direction
      if (isInside(nx, ny)) {
        cx = nx; cy = ny; dir = nd; moved = true; break;
      }
    }
    if (!moved) break;
    steps++;
    if (steps > maxSteps) break;
  } while ((cx !== start[0] || cy !== start[1]) || path.length < 2);

  // Simplify path by sampling every Nth point to reduce vertices
  const sampleStep = Math.max(1, Math.floor(path.length / 200));
  const sampled = path.filter((_, i) => i % sampleStep === 0);

  // Map pixel coords to lat/lon using provided bounds
  function toLatLng(px: number, py: number): LatLng {
    const lon = bounds.west + (px / (width - 1)) * (bounds.east - bounds.west);
    const lat = bounds.north - (py / (height - 1)) * (bounds.north - bounds.south);
    return [lat, lon];
  }

  const polygon: LatLng[] = sampled.map(([x, y]) => toLatLng(x, y));
  if (polygon.length > 0 && (polygon[0][0] !== polygon[polygon.length - 1][0] || polygon[0][1] !== polygon[polygon.length - 1][1])) {
    polygon.push(polygon[0]);
  }
  return polygon;
}