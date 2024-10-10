export interface LatLng {
  lat: number;
  lng: number;
}

export interface Polygon {
  id: string;
  paths: LatLng[];
}