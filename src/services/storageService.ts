import { EnvironmentalObject, AnalysisHistoryItem, UserSession, CitizenReport } from '../types/gis';
import { initialDummyObjects } from '../data/dummyData';
import * as XLSX from 'xlsx';

const OBJECTS_STORAGE_KEY = 'gis_dlh_environmental_objects_v1';
const HISTORY_STORAGE_KEY = 'gis_dlh_analysis_history_v1';
const USER_SESSION_KEY = 'gis_dlh_user_session_v1';
const CITIZEN_REPORTS_KEY = 'gis_dlh_citizen_reports_v1';

import { OFFICIAL_DINAS_USERS, GUEST_CITIZEN_SESSION } from '../data/dinasUsers';

export const DEFAULT_OFFICIAL_USER: UserSession = {
  id: OFFICIAL_DINAS_USERS[0].id,
  name: OFFICIAL_DINAS_USERS[0].name,
  email: OFFICIAL_DINAS_USERS[0].email,
  role: 'dinas',
  isGuest: false,
  nipOrNik: OFFICIAL_DINAS_USERS[0].nip,
  position: OFFICIAL_DINAS_USERS[0].position,
  departmentOrDistrict: OFFICIAL_DINAS_USERS[0].department,
  avatarColor: OFFICIAL_DINAS_USERS[0].avatarColor,
};

export const DEFAULT_CITIZEN_USER: UserSession = GUEST_CITIZEN_SESSION;

export function getStoredUserSession(): UserSession {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse user session', e);
  }
  // Default to official for full GIS exploration, but allows instant switch
  return DEFAULT_OFFICIAL_USER;
}

export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear user session', e);
  }
}

// ----------------- CITIZEN REPORTS -----------------

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'LAP-001',
    citizenName: 'Dewi Lestari',
    phone: '081234567890',
    title: 'Timbunan Sampah Liar di Bantaran Sungai',
    category: 'Timbunan Sampah Liar',
    address: 'Jl. Cikapundung Barat No. 14',
    district: 'Sumur Bandung',
    latitude: -6.9142,
    longitude: 107.6110,
    description: 'Terjadi penumpukan kantong sampah plastik liar di dekat jembatan penyeberangan sejak 2 hari lalu.',
    createdAt: '2024-05-02',
    status: 'Menunggu Verifikasi',
  },
  {
    id: 'LAP-002',
    citizenName: 'Ahmad Fauzi',
    phone: '085712345678',
    title: 'Usulan Penambahan Fasilitas TPS3R Baru',
    category: 'Usulan Fasilitas Pengelolaan',
    address: 'Kompleks RW 05 Sekeloa',
    district: 'Coblong',
    latitude: -6.8890,
    longitude: 107.6190,
    description: 'Warga RW 05 sudah mengumpulkan sampah terpilah, membutuhkan pendampingan pembentukan fasilitas pengolahan TPS3R mandiri dari DLH.',
    createdAt: '2024-05-03',
    status: 'Disetujui DLH',
  }
];

export function getCitizenReports(): CitizenReport[] {
  try {
    const raw = localStorage.getItem(CITIZEN_REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(CITIZEN_REPORTS_KEY, JSON.stringify(INITIAL_CITIZEN_REPORTS));
      return INITIAL_CITIZEN_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CITIZEN_REPORTS;
  }
}

export function addCitizenReport(report: Omit<CitizenReport, 'id' | 'createdAt' | 'status'>): CitizenReport {
  const current = getCitizenReports();
  const newReport: CitizenReport = {
    ...report,
    id: `LAP-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'Menunggu Verifikasi',
  };
  const updated = [newReport, ...current];
  try {
    localStorage.setItem(CITIZEN_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving citizen report', e);
  }
  return newReport;
}

export function updateCitizenReportStatus(id: string, status: CitizenReport['status']): void {
  const current = getCitizenReports();
  const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
  try {
    localStorage.setItem(CITIZEN_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating citizen report status', e);
  }
}


export function getStoredObjects(): EnvironmentalObject[] {
  try {
    const raw = localStorage.getItem(OBJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(OBJECTS_STORAGE_KEY, JSON.stringify(initialDummyObjects));
      return initialDummyObjects;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Clean up any legacy 'Bank Sampah' records if present in user browser localStorage
      const cleaned = (parsed as any[]).map((obj) => {
        if (obj.category === 'Bank Sampah') {
          return {
            ...obj,
            category: 'Tempat Penampungan Sementara (TPS)',
            name: obj.name.replace(/Bank Sampah/gi, 'TPS')
          };
        }
        return obj;
      });
      // Auto-upgrade if stored dataset has old 15 items and all are simulation items
      if (cleaned.length < initialDummyObjects.length && cleaned.every((o: any) => o.is_dummy)) {
        localStorage.setItem(OBJECTS_STORAGE_KEY, JSON.stringify(initialDummyObjects));
        return initialDummyObjects;
      }
      return cleaned;
    }
    return initialDummyObjects;
  } catch (err) {
    console.error('Failed to parse stored objects, falling back to dummy dataset:', err);
    return initialDummyObjects;
  }
}

export function saveStoredObjects(objects: EnvironmentalObject[]): void {
  try {
    localStorage.setItem(OBJECTS_STORAGE_KEY, JSON.stringify(objects));
  } catch (err) {
    console.error('Failed to save objects to localStorage:', err);
  }
}

export function addObject(newObj: Omit<EnvironmentalObject, 'id'>): EnvironmentalObject {
  const current = getStoredObjects();
  const id = `DLH-OBJ-${Date.now().toString().slice(-6)}`;
  const object: EnvironmentalObject = { ...newObj, id };
  const updated = [object, ...current];
  saveStoredObjects(updated);
  return object;
}

export function updateObject(id: string, patch: Partial<EnvironmentalObject>): EnvironmentalObject | null {
  const current = getStoredObjects();
  const idx = current.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updatedObj = { ...current[idx], ...patch };
  current[idx] = updatedObj;
  saveStoredObjects(current);
  return updatedObj;
}

export function deleteObject(id: string): boolean {
  const current = getStoredObjects();
  const filtered = current.filter((o) => o.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredObjects(filtered);
  return true;
}

export function removeAllDummyObjects(): number {
  const current = getStoredObjects();
  const filtered = current.filter((o) => !o.is_dummy);
  const removed = current.length - filtered.length;
  saveStoredObjects(filtered);
  return removed;
}

export function resetToDefaultDummyData(): void {
  saveStoredObjects(initialDummyObjects);
}

export function insertFullOfficialDataset(): EnvironmentalObject[] {
  saveStoredObjects(initialDummyObjects);
  return initialDummyObjects;
}

export function generateMySQLInsertQuery(objectsToExport?: EnvironmentalObject[]): string {
  const dataset = objectsToExport && objectsToExport.length > 0 ? objectsToExport : initialDummyObjects;
  const values = dataset.map((o) => {
    const esc = (val?: string) => (val ? `'${val.replace(/'/g, "''")}'` : 'NULL');
    return `(${esc(o.name)}, ${esc(o.category)}, ${esc(o.address)}, ${esc(o.regency || 'Kota Bandung')}, ${esc(o.district)}, ${esc(o.village)}, ${o.latitude.toFixed(6)}, ${o.longitude.toFixed(6)}, 'Point', ${esc(o.source || 'Survei Lapangan DLH 2024')}, ${esc(o.recorded_at || '2024-05-01')}, ${esc(o.notes)}, ${o.is_dummy ? 1 : 0})`;
  }).join(',\n');

  return `-- ========================================================
-- Query INSERT MySQL / MariaDB (phpMyAdmin / XAMPP)
-- Database: gis_dlh | Tabel: environmental_objects
-- Total Data: ${dataset.length} Titik Koordinat Kota Bandung
-- ========================================================
USE \`gis_dlh\`;

INSERT INTO \`environmental_objects\` 
(\`name\`, \`category\`, \`address\`, \`regency\`, \`district\`, \`village\`, \`latitude\`, \`longitude\`, \`geom_type\`, \`source\`, \`recorded_at\`, \`notes\`, \`is_dummy\`)
VALUES
${values};
`;
}

// ----------------- ANALYSIS HISTORY -----------------

export function getAnalysisHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAnalysisHistory(item: Omit<AnalysisHistoryItem, 'id' | 'createdAt'>): void {
  try {
    const current = getAnalysisHistory();
    const newItem: AnalysisHistoryItem = {
      ...item,
      id: `HIST-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([newItem, ...current.slice(0, 19)]));
  } catch (err) {
    console.error('Error saving history item', err);
  }
}

// ----------------- IMPORT & EXPORT UTILITIES -----------------

export function parseCsvText(csvContent: string): Omit<EnvironmentalObject, 'id'>[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('File CSV kosong atau tidak memiliki baris data.');
  }

  // Parse header
  const header = lines[0].split(/,|;/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const nameIdx = header.findIndex((h) => h === 'name' || h === 'nama' || h === 'nama_objek');
  const catIdx = header.findIndex((h) => h === 'category' || h === 'kategori');
  const latIdx = header.findIndex((h) => h === 'latitude' || h === 'lat' || h === 'lintang' || h === 'y');
  const lonIdx = header.findIndex((h) => h === 'longitude' || h === 'lon' || h === 'long' || h === 'bujur' || h === 'x');
  const distIdx = header.findIndex((h) => h === 'district' || h === 'kecamatan');
  const villIdx = header.findIndex((h) => h === 'village' || h === 'kelurahan' || h === 'desa');
  const addrIdx = header.findIndex((h) => h === 'address' || h === 'alamat');
  const srcIdx = header.findIndex((h) => h === 'source' || h === 'sumber');

  if (nameIdx === -1 || latIdx === -1 || lonIdx === -1) {
    throw new Error('Header CSV wajib memuat: name/nama, latitude/lat, dan longitude/lon.');
  }

  const results: Omit<EnvironmentalObject, 'id'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/,|;/).map((c) => c.trim().replace(/^['"]|['"]$/g, ''));
    if (row.length <= Math.max(nameIdx, latIdx, lonIdx)) continue;

    const name = row[nameIdx];
    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);

    if (!name || isNaN(lat) || isNaN(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    results.push({
      name,
      category: (catIdx !== -1 && row[catIdx] ? row[catIdx] : 'Tempat Penampungan Sementara (TPS)') as any,
      latitude: lat,
      longitude: lon,
      address: addrIdx !== -1 ? row[addrIdx] : '',
      regency: 'Kota/Kabupaten',
      district: distIdx !== -1 ? row[distIdx] : '',
      village: villIdx !== -1 ? row[villIdx] : '',
      geom_type: 'Point',
      source: srcIdx !== -1 && row[srcIdx] ? row[srcIdx] : 'Impor CSV Pengguna',
      recorded_at: new Date().toISOString().split('T')[0],
      is_dummy: false,
    });
  }

  return results;
}

export function parseXlsxBuffer(buffer: ArrayBuffer): Omit<EnvironmentalObject, 'id'>[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

  if (!jsonData || jsonData.length === 0) {
    throw new Error('File Excel tidak memiliki baris data.');
  }

  const results: Omit<EnvironmentalObject, 'id'>[] = [];

  for (const row of jsonData) {
    const keys = Object.keys(row);
    const nameKey = keys.find((k) => /^(name|nama|nama_objek)$/i.test(k));
    const latKey = keys.find((k) => /^(latitude|lat|lintang|y)$/i.test(k));
    const lonKey = keys.find((k) => /^(longitude|lon|long|bujur|x)$/i.test(k));
    const catKey = keys.find((k) => /^(category|kategori)$/i.test(k));
    const distKey = keys.find((k) => /^(district|kecamatan)$/i.test(k));
    const villKey = keys.find((k) => /^(village|kelurahan|desa)$/i.test(k));
    const addrKey = keys.find((k) => /^(address|alamat)$/i.test(k));
    const srcKey = keys.find((k) => /^(source|sumber)$/i.test(k));

    if (!nameKey || !latKey || !lonKey) continue;

    const name = String(row[nameKey]).trim();
    const lat = parseFloat(row[latKey]);
    const lon = parseFloat(row[lonKey]);

    if (!name || isNaN(lat) || isNaN(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    results.push({
      name,
      category: catKey && row[catKey] ? String(row[catKey]) as any : 'Tempat Penampungan Sementara (TPS)',
      latitude: lat,
      longitude: lon,
      address: addrKey && row[addrKey] ? String(row[addrKey]) : '',
      regency: 'Kota/Kabupaten',
      district: distKey && row[distKey] ? String(row[distKey]) : '',
      village: villKey && row[villKey] ? String(row[villKey]) : '',
      geom_type: 'Point',
      source: srcKey && row[srcKey] ? String(row[srcKey]) : 'Impor Excel Pengguna',
      recorded_at: new Date().toISOString().split('T')[0],
      is_dummy: false,
    });
  }

  return results;
}

export function parseGeoJson(jsonText: string): Omit<EnvironmentalObject, 'id'>[] {
  const geojson = JSON.parse(jsonText);
  if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error('Format GeoJSON tidak valid. Harap gunakan FeatureCollection.');
  }

  const results: Omit<EnvironmentalObject, 'id'>[] = [];

  for (const feat of geojson.features) {
    if (!feat.geometry || feat.geometry.type !== 'Point' || !Array.isArray(feat.geometry.coordinates)) {
      continue;
    }
    const [lon, lat] = feat.geometry.coordinates;
    const props = feat.properties || {};

    results.push({
      name: props.name || props.nama || 'Objek GeoJSON',
      category: props.category || props.kategori || 'Tempat Penampungan Sementara (TPS)',
      latitude: lat,
      longitude: lon,
      address: props.address || props.alamat || '',
      regency: props.regency || props.kabupaten || 'Kota/Kabupaten',
      district: props.district || props.kecamatan || '',
      village: props.village || props.kelurahan || '',
      geom_type: 'Point',
      source: props.source || 'Impor GeoJSON',
      recorded_at: new Date().toISOString().split('T')[0],
      is_dummy: false,
    });
  }

  return results;
}

export function exportObjectsToCsv(objects: EnvironmentalObject[]): string {
  const header = ['id', 'name', 'category', 'latitude', 'longitude', 'district', 'village', 'address', 'source', 'recorded_at', 'is_dummy'];
  const rows = objects.map((o) => [
    `"${o.id}"`,
    `"${o.name.replace(/"/g, '""')}"`,
    `"${o.category}"`,
    o.latitude,
    o.longitude,
    `"${(o.district || '').replace(/"/g, '""')}"`,
    `"${(o.village || '').replace(/"/g, '""')}"`,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    `"${(o.source || '').replace(/"/g, '""')}"`,
    `"${o.recorded_at}"`,
    o.is_dummy ? '1' : '0',
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportObjectsToGeoJson(objects: EnvironmentalObject[]): string {
  const features = objects.map((o) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [o.longitude, o.latitude],
    },
    properties: {
      id: o.id,
      name: o.name,
      category: o.category,
      district: o.district,
      village: o.village,
      address: o.address,
      source: o.source,
      recorded_at: o.recorded_at,
      is_dummy: o.is_dummy,
    },
  }));

  return JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
}
