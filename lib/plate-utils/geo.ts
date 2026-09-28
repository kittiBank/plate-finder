export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;
const METERS_PER_DEG_LAT = 111_320;
/** Public locations are shown at ~200 m precision (CLAUDE.md §7). */
const BLUR_CELL_METERS = 200;

export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Snap to the centre of a ~200 m grid cell. Deterministic on purpose:
 * random noise could be averaged out over repeated reads.
 */
export function blurLocation(lat: number, lng: number): LatLng {
  const latStep = BLUR_CELL_METERS / METERS_PER_DEG_LAT;
  const snappedLat = snap(lat, latStep);
  // Use the snapped latitude so every point in a row of cells shares one longitude step.
  const lngStep = latStep / Math.cos((snappedLat * Math.PI) / 180);
  return { lat: snappedLat, lng: snap(lng, lngStep) };
}

function snap(value: number, step: number): number {
  return (Math.floor(value / step) + 0.5) * step;
}
