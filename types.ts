
export interface Satellite {
  name: string;
  satelliteId: number;
}

export interface TLEData {
  name: string;
  satelliteId: number;
  line1: string;
  line2: string;
}

export interface OrbitalData {
  altitude: number;
  velocity: number;
  period: number;
  inclination: number;
}

export interface SatelliteAPIResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  totalItems: number;
  member: Satellite[];
}