import { describe, expect, it } from "vitest";
import { clusterByGrid } from "./cluster";

type P = { id: string; x: number; y: number };
const toPixel = (p: P) => ({ x: p.x, y: p.y });
const ids = (clusters: { items: P[] }[]) => clusters.map((c) => c.items.map((i) => i.id).sort());

describe("clusterByGrid", () => {
  it("returns nothing for no points", () => {
    expect(clusterByGrid([], toPixel, 60)).toEqual([]);
  });

  it("groups points in the same grid cell", () => {
    const points = [
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 50, y: 40 },
      { id: "c", x: 200, y: 200 },
    ];
    expect(ids(clusterByGrid(points, toPixel, 60))).toEqual([["a", "b"], ["c"]]);
  });

  it("places a cluster at the centroid of its points", () => {
    const [cluster] = clusterByGrid(
      [
        { id: "a", x: 10, y: 10 },
        { id: "b", x: 30, y: 50 },
      ],
      toPixel,
      60,
    );
    expect(cluster).toMatchObject({ x: 20, y: 30 });
  });

  it("keeps every point exactly once", () => {
    const points = Array.from({ length: 50 }, (_, i) => ({ id: String(i), x: (i * 37) % 300, y: (i * 53) % 300 }));
    const all = clusterByGrid(points, toPixel, 60).flatMap((c) => c.items.map((p) => p.id));
    expect(all.sort()).toEqual(points.map((p) => p.id).sort());
  });

  it("handles negative pixel coordinates", () => {
    const points = [
      { id: "a", x: -5, y: -5 },
      { id: "b", x: 5, y: 5 },
    ];
    expect(clusterByGrid(points, toPixel, 60)).toHaveLength(2);
  });
});
