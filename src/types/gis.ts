export type GeometryType = 'Point' | 'LineString' | 'Polygon';

export type ObjectCategory = 
  | 'Tempat Penampungan Sementara (TPS)'
  | 'Bank Sampah'
  | 'TPS3R (Reuse, Reduce, Recycle)'
  | 'Titik Pantau Kualitas Air'
  | 'Stasiun Pemantau Kualitas Udara (SPKU)'
  | 'Laboratorium Lingkungan'
  | 'Kawasan Konservasi & RTH';

export interface EnvironmentalObject {
  id: string;
  name: string;
  category: ObjectCategory;
  address: string;
  regency: string;    // Kabupaten / Kota
  district: string;   // Kecamatan
  village: string;    // Kelurahan / Desa
  latitude: number;   // WGS84 EPSG:4326
  longitude: number;  // WGS84 EPSG:4326
  geom_type: GeometryType;
  source: string;     // e.g. "Survei Lapangan PKL DLH 2024"
  recorded_at: string; // YYYY-MM-DD
  notes?: string;
  is_dummy: boolean;  // true for simulation dataset, false for official DLH data
  elevation_m?: number;
  capacity?: string;
}

export interface NNAPair {
  fromId: string;
  fromName: string;
  fromCoords: [number, number]; // [lat, lon]
  toId: string;
  toName: string;
  toCoords: [number, number];   // [lat, lon]
  distanceMeter: number;
}

export interface NNAResult {
  totalPoints: number;
  crsUsed: string;
  studyAreaM2: number;
  studyAreaKm2: number;
  observedMeanDistanceM: number; // Do
  expectedMeanDistanceM: number; // De
  nnaIndexR: number;            // R = Do / De
  standardError: number;        // SE
  zScore: number;               // Z = (Do - De) / SE
  pValue: number;
  isStatisticallySignificant: boolean;
  patternResult: 'Mengelompok (Clustered)' | 'Acak (Random)' | 'Seragam / Teratur (Dispersed)';
  interpretation: string;
  distanceDetails: number[];    // array of distances to nearest neighbor for each point
  nearestPairs: NNAPair[];
  analyzedAt: string;
  datasetLabel: string;
}

export type KernelType = 'gaussian' | 'quartic' | 'epanechnikov';

export interface KDESettings {
  bandwidthMeter?: number; // bandwidth in meters (or auto)
  gridResolution: number;  // e.g. 80, 100, 120
  kernel: KernelType;
  colorRamp: 'YlOrRd' | 'Viridis' | 'ForestEmerald' | 'Thermal';
}

export interface KDEResult {
  bounds: [[number, number], [number, number]]; // [[southWestLat, southWestLon], [northEastLat, northEastLon]]
  imageSrc: string; // Base64 transparent PNG or DataURL
  maxDensity: number;
  minDensity: number;
  meanDensity: number;
  bandwidthMeters: number;
  gridResolution: number;
  thresholdLow: number;
  thresholdMedium: number;
  classificationMethod: string;
  hotspotsCount: number;
  interpretation: string;
  analyzedAt: string;
  datasetLabel: string;
  pointsCount: number;
}

export interface AnalysisHistoryItem {
  id: string;
  type: 'NNA' | 'KDE';
  title: string;
  createdAt: string;
  pointsCount: number;
  summary: string;
}

// ----------------- USER AUTH & ROLES -----------------
export type UserRole = 'dinas' | 'penduduk';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nipOrNik?: string;
  departmentOrDistrict?: string;
  avatarColor?: string;
}

export interface CitizenReport {
  id: string;
  citizenName: string;
  phone: string;
  title: string;
  category: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
  status: 'Menunggu Verifikasi' | 'Disetujui DLH' | 'Selesai Ditindaklanjuti';
}
