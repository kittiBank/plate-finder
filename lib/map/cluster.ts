export type PixelPoint = { x: number; y: number };

export type Cluster<T> = PixelPoint & { items: T[] };

/**
 * Group items whose screen positions fall in the same `cellPx` square.
 * Each cluster sits at the centroid of its items. Single items come back as clusters of one.
 */
export function clusterByGrid<T>(
  items: readonly T[],
  toPixel: (item: T) => PixelPoint,
  cellPx: number,
): Cluster<T>[] {
  const cells = new Map<string, { items: T[]; sumX: number; sumY: number }>();

  for (const item of items) {
    const { x, y } = toPixel(item);
    const key = `${Math.floor(x / cellPx)}:${Math.floor(y / cellPx)}`;
    const cell = cells.get(key) ?? { items: [], sumX: 0, sumY: 0 };
    cell.items.push(item);
    cell.sumX += x;
    cell.sumY += y;
    cells.set(key, cell);
  }

  return [...cells.values()].map(({ items, sumX, sumY }) => ({
    items,
    x: sumX / items.length,
    y: sumY / items.length,
  }));
}
