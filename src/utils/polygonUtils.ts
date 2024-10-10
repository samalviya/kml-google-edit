import * as turf from '@turf/turf';
import { Polygon, LatLng } from '../types';

export function validatePolygon(polygon: Polygon): boolean {
  const turfPolygon = turf.polygon([polygon.paths.map(({ lat, lng }) => [lng, lat])]);
  return turf.kinks(turfPolygon).features.length === 0;
}

export function checkPolygonOverlap(newPolygon: Polygon, existingPolygons: Polygon[]): boolean {
  const newTurfPolygon = turf.polygon([newPolygon.paths.map(({ lat, lng }) => [lng, lat])]);

  return existingPolygons.some((existingPolygon) => {
    const existingTurfPolygon = turf.polygon([existingPolygon.paths.map(({ lat, lng }) => [lng, lat])]);
    return turf.booleanOverlap(newTurfPolygon, existingTurfPolygon) || turf.booleanContains(newTurfPolygon, existingTurfPolygon) || turf.booleanContains(existingTurfPolygon, newTurfPolygon);
  });
}

export function calculatePolygonArea(polygon: Polygon): number {
  const turfPolygon = turf.polygon([polygon.paths.map(({ lat, lng }) => [lng, lat])]);
  return turf.area(turfPolygon);
}

export function getPolygonCenter(polygon: Polygon): LatLng {
  const turfPolygon = turf.polygon([polygon.paths.map(({ lat, lng }) => [lng, lat])]);
  const center = turf.centroid(turfPolygon);
  return { lat: center.geometry.coordinates[1], lng: center.geometry.coordinates[0] };
}