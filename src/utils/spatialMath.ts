import { EnvironmentalObject, NNAResult, NNAPair, KDESettings, KDEResult } from '../types/gis';

/**
 * Konversi Derajat ke Radian dan sebaliknya
 */
export const toRad = (deg: number): number => (deg * Math.PI) / 180;
export const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Menghitung Zona UTM dari koordinat Longitude dan Latitude
 * Indonesia berada pada Zona 46 s.d. 54
 */
export function getUtmZone(lon: number, lat: number): { zone: number; isSouth: boolean; epsg: number } {
  const zone = Math.floor((lon + 180) / 6) + 1;
  const isSouth = lat < 0;
  const epsg = isSouth ? 32700 + zone : 32600 + zone;
  return { zone, isSouth, epsg };
}

/**
 * Proyeksi Transverse Mercator (UTM) dari WGS84 (lon, lat) ke koordinat Metrik Planar (x, y) dalam meter.
 * Menggunakan elipsoid WGS84 standar.
 */
export function projectWgs84ToUtm(lon: number, lat: number, overrideZone?: number): { x: number; y: number; zone: number; epsg: number } {
  const a = 6378137.0; // semi-major axis WGS84
  const f = 1 / 298.257223563; // flattening
  const b = a * (1 - f);
  const e2 = (a * a - b * b) / (a * a);
  const ePrime2 = (a * a - b * b) / (b * b);
  const k0 = 0.9996; // scale factor UTM

  const { zone: autoZone, isSouth, epsg } = getUtmZone(lon, lat);
  const zone = overrideZone ?? autoZone;

  // Central Meridian
  const lon0 = (zone - 1) * 6 - 180 + 3;
  const phi = toRad(lat);
  const lambda = toRad(lon);
  const lambda0 = toRad(lon0);

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const T = Math.tan(phi) * Math.tan(phi);
  const C = ePrime2 * Math.cos(phi) * Math.cos(phi);
  const A = Math.cos(phi) * (lambda - lambda0);

  // Meridian Distance M
  const M = a * (
    (1 - e2 / 4 - 3 * Math.pow(e2, 2) / 64 - 5 * Math.pow(e2, 3) / 256) * phi -
    (3 * e2 / 8 + 3 * Math.pow(e2, 2) / 32 + 45 * Math.pow(e2, 3) / 1024) * Math.sin(2 * phi) +
    (15 * Math.pow(e2, 2) / 256 + 45 * Math.pow(e2, 3) / 1024) * Math.sin(4 * phi) -
    (35 * Math.pow(e2, 3) / 3072) * Math.sin(6 * phi)
  );

  const xEast = k0 * N * (
    A +
    (1 - T + C) * Math.pow(A, 3) / 6 +
    (5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * Math.pow(A, 5) / 120
  ) + 500000; // False Easting 500,000 m

  let yNorth = k0 * (
    M +
    N * Math.tan(phi) * (
      Math.pow(A, 2) / 2 +
      (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 +
      (61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * Math.pow(A, 6) / 720
    )
  );

  if (isSouth) {
    yNorth += 10000000; // False Northing 10,000,000 m untuk belahan bumi selatan
  }

  return { x: xEast, y: yNorth, zone, epsg };
}

/**
 * Menghitung jarak Euclidean 2D planar dalam meter
 */
export function planarDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Menghitung Jarak Haversine (Great Circle) dalam meter untuk validasi
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Jari-jari bumi rata-rata dalam meter
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fungsi galat (Error Function) Gauss untuk aproksimasi p-value kurva normal standar
 */
export function erf(x: number): number {
  // Chebyshev approximation
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

/**
 * Menghitung Cumulative Distribution Function (CDF) dari Normal Standar Z
 */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Analisis Pola Persebaran Spasial: Nearest Neighbor Analysis (NNA)
 */
export function computeNNA(
  objects: EnvironmentalObject[],
  customStudyAreaM2?: number,
  datasetLabel: string = 'Dataset Objek Lingkungan'
): NNAResult {
  const validObjects = objects.filter(
    (o) => typeof o.latitude === 'number' && typeof o.longitude === 'number' && !isNaN(o.latitude) && !isNaN(o.longitude)
  );

  const n = validObjects.length;
  if (n < 4) {
    throw new Error('Analisis NNA memerlukan minimal 4 titik objek geografis yang valid.');
  }

  // Tentukan central UTM zone berdasarkan rata-rata bujur titik
  const avgLon = validObjects.reduce((acc, o) => acc + o.longitude, 0) / n;
  const avgLat = validObjects.reduce((acc, o) => acc + o.latitude, 0) / n;
  const { zone: commonZone, epsg } = getUtmZone(avgLon, avgLat);

  // Proyeksikan seluruh titik ke planar metrik
  const projected = validObjects.map((obj) => {
    const { x, y } = projectWgs84ToUtm(obj.longitude, obj.latitude, commonZone);
    return {
      obj,
      x,
      y,
    };
  });

  // Tentukan Batas Wilayah Studi (Planar Bounding Box)
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of projected) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const rawWidth = maxX - minX;
  const rawHeight = maxY - minY;

  if (rawWidth <= 0 || rawHeight <= 0) {
    throw new Error('Titik koordinat berada di posisi identik atau satu garis lurus.');
  }

  // Jika luas wilayah tidak disediakan, gunakan Bounding Box dengan buffer adaptif 5%
  // untuk meminimalkan boundary edge effects.
  const bufferRatio = 0.05;
  const paddedWidth = rawWidth * (1 + 2 * bufferRatio);
  const paddedHeight = rawHeight * (1 + 2 * bufferRatio);
  const calculatedAreaM2 = paddedWidth * paddedHeight;

  const studyAreaM2 = customStudyAreaM2 && customStudyAreaM2 > 0 ? customStudyAreaM2 : calculatedAreaM2;

  // Temukan tetangga terdekat untuk setiap titik i
  const distanceDetails: number[] = [];
  const nearestPairs: NNAPair[] = [];

  for (let i = 0; i < n; i++) {
    let minD = Infinity;
    let nearestIdx = -1;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = planarDistance(projected[i].x, projected[i].y, projected[j].x, projected[j].y);
      if (d < minD) {
        minD = d;
        nearestIdx = j;
      }
    }

    distanceDetails.push(minD);
    nearestPairs.push({
      fromId: projected[i].obj.id,
      fromName: projected[i].obj.name,
      fromCoords: [projected[i].obj.latitude, projected[i].obj.longitude],
      toId: projected[nearestIdx].obj.id,
      toName: projected[nearestIdx].obj.name,
      toCoords: [projected[nearestIdx].obj.latitude, projected[nearestIdx].obj.longitude],
      distanceMeter: Math.round(minD * 100) / 100,
    });
  }

  // 1. Rata-rata jarak teramati (Observed Mean Distance - Do)
  const sumDo = distanceDetails.reduce((a, b) => a + b, 0);
  const Do = sumDo / n;

  // 2. Kepadatan titik (Density - lambda)
  const density = n / studyAreaM2;

  // 3. Jarak harapan model acak Poisson (Expected Mean Distance - De)
  const De = 1.0 / (2.0 * Math.sqrt(density));

  // 4. Nearest Neighbor Ratio (R)
  const R = Do / De;

  // 5. Standard Error (SE) untuk model Poisson homogen 2D
  const SE = 0.26136 / Math.sqrt(n * density);

  // 6. Z-Score inferensial
  const zScore = (Do - De) / SE;

  // 7. Dua arah p-value
  const pValue = 2.0 * (1.0 - normalCdf(Math.abs(zScore)));
  const isStatisticallySignificant = pValue < 0.05;

  // 8. Klasifikasi Pola Persebaran
  let patternResult: 'Mengelompok (Clustered)' | 'Acak (Random)' | 'Seragam / Teratur (Dispersed)';
  let interpretation = '';

  if (R < 0.85) {
    patternResult = 'Mengelompok (Clustered)';
    interpretation = `Nilai Rasio NNA R = ${R.toFixed(3)} (< 0.85). Objek lingkungan cenderung membentuk klaster atau mengumpul di lokasi tertentu. Jarak teramati (${Do.toFixed(1)} m) secara nyata lebih pendek daripada jarak harapan acak (${De.toFixed(1)} m).`;
  } else if (R > 1.15) {
    patternResult = 'Seragam / Teratur (Dispersed)';
    interpretation = `Nilai Rasio NNA R = ${R.toFixed(3)} (> 1.15). Objek lingkungan tersebar teratur dengan jarak antar-titik yang relatif konstan dan seragam. Jarak teramati (${Do.toFixed(1)} m) lebih besar dibandingkan jarak acak (${De.toFixed(1)} m).`;
  } else {
    patternResult = 'Acak (Random)';
    interpretation = `Nilai Rasio NNA R = ${R.toFixed(3)} (berkisar antara 0.85 - 1.15). Persebaran objek lingkungan mengikuti pola acak Poisson tanpa bukti kuat adanya klasterisasi terpusat maupun dispersi seragam.`;
  }

  if (isStatisticallySignificant) {
    interpretation += ` Hasil ini signifikan secara statistik pada tingkat kepercayaan 95% (Z = ${zScore.toFixed(2)}, p = ${pValue.toFixed(4)} < 0.05), menolak hipotesis nol pola acak.`;
  } else {
    interpretation += ` Hasil ini tidak signifikan secara statistik (p = ${pValue.toFixed(4)} >= 0.05), sehingga variasi jarak dapat terjadi secara kebetulan belaka.`;
  }

  return {
    totalPoints: n,
    crsUsed: `WGS84 / UTM Zona ${commonZone} (EPSG:${epsg})`,
    studyAreaM2: Math.round(studyAreaM2),
    studyAreaKm2: Math.round((studyAreaM2 / 1000000) * 1000) / 1000,
    observedMeanDistanceM: Math.round(Do * 100) / 100,
    expectedMeanDistanceM: Math.round(De * 100) / 100,
    nnaIndexR: Math.round(R * 10000) / 10000,
    standardError: Math.round(SE * 100) / 100,
    zScore: Math.round(zScore * 10000) / 10000,
    pValue: Math.round(pValue * 1000000) / 1000000,
    isStatisticallySignificant,
    patternResult,
    interpretation,
    distanceDetails: distanceDetails.map((d) => Math.round(d * 100) / 100),
    nearestPairs,
    analyzedAt: new Date().toISOString(),
    datasetLabel,
  };
}

/**
 * Perhitungan Kernel Density Estimation (KDE) 2D
 * Menghasilkan raster permukaan kepadatan kontinu dan mengonversinya menjadi Canvas DataURL.
 */
export function computeKDE(
  objects: EnvironmentalObject[],
  settings: KDESettings,
  datasetLabel: string = 'Dataset Objek Lingkungan'
): KDEResult {
  const validObjects = objects.filter(
    (o) => typeof o.latitude === 'number' && typeof o.longitude === 'number' && !isNaN(o.latitude) && !isNaN(o.longitude)
  );

  const n = validObjects.length;
  if (n < 3) {
    throw new Error('Analisis KDE memerlukan minimal 3 titik objek koordinat.');
  }

  // Tentukan bounding box geospasial
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const obj of validObjects) {
    if (obj.latitude < minLat) minLat = obj.latitude;
    if (obj.latitude > maxLat) maxLat = obj.latitude;
    if (obj.longitude < minLon) minLon = obj.longitude;
    if (obj.longitude > maxLon) maxLon = obj.longitude;
  }

  // Tambahkan buffer 15% pada batas geografis
  const latSpan = maxLat - minLat || 0.02;
  const lonSpan = maxLon - minLon || 0.02;
  const padLat = latSpan * 0.15;
  const padLon = lonSpan * 0.15;

  const southWest: [number, number] = [minLat - padLat, minLon - padLon];
  const northEast: [number, number] = [maxLat + padLat, maxLon + padLon];

  // Proyeksikan ke metrik untuk menghitung deviasi standar spasial dan bandwidth
  const avgLon = (minLon + maxLon) / 2;
  const avgLat = (minLat + maxLat) / 2;
  const { zone, epsg } = getUtmZone(avgLon, avgLat);

  const metricPoints = validObjects.map((obj) => projectWgs84ToUtm(obj.longitude, obj.latitude, zone));

  // Hitung Standard Distance (SD) spasial
  const meanX = metricPoints.reduce((acc, p) => acc + p.x, 0) / n;
  const meanY = metricPoints.reduce((acc, p) => acc + p.y, 0) / n;
  const varianceX = metricPoints.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0) / n;
  const varianceY = metricPoints.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0) / n;
  const standardDistance = Math.sqrt(varianceX + varianceY);

  // Bandwidth Silverman's Rule of Thumb adaptif (dalam meter)
  const defaultBandwidth = Math.max(0.9 * standardDistance * Math.pow(n, -0.2), 200);
  const bandwidthMeters = settings.bandwidthMeter && settings.bandwidthMeter > 0 ? settings.bandwidthMeter : defaultBandwidth;

  const resolution = Math.max(40, Math.min(160, settings.gridResolution || 80));

  // Buat grid matriks
  const grid: number[][] = Array.from({ length: resolution }, () => new Array(resolution).fill(0));
  const latStep = (northEast[0] - southWest[0]) / (resolution - 1);
  const lonStep = (northEast[1] - southWest[1]) / (resolution - 1);

  let maxDensity = 0;
  let minDensity = Infinity;
  let sumDensity = 0;
  const allValues: number[] = [];

  // Hitung densitas pada tiap sel grid menggunakan kernel pilihan
  for (let r = 0; r < resolution; r++) {
    const curLat = southWest[0] + r * latStep;
    for (let c = 0; c < resolution; c++) {
      const curLon = southWest[1] + c * lonStep;
      const { x: gridX, y: gridY } = projectWgs84ToUtm(curLon, curLat, zone);

      let cellDensity = 0;

      for (let i = 0; i < n; i++) {
        const d = planarDistance(gridX, gridY, metricPoints[i].x, metricPoints[i].y);
        const u = d / bandwidthMeters;

        if (settings.kernel === 'gaussian') {
          // Gaussian Kernel: K(u) = (1 / 2*PI) * exp(-u^2 / 2)
          cellDensity += (1.0 / (2.0 * Math.PI)) * Math.exp(-0.5 * u * u);
        } else if (settings.kernel === 'quartic') {
          // Quartic (Biweight): 15/16 * (1 - u^2)^2 for u <= 1
          if (u <= 1) {
            cellDensity += (15 / 16) * Math.pow(1 - u * u, 2);
          }
        } else {
          // Epanechnikov Kernel: 3/(4*PI) * (1 - u^2) for u <= 1
          if (u <= 1) {
            cellDensity += (3 / (4 * Math.PI)) * (1 - u * u);
          }
        }
      }

      // Normalisasi terhadap luas bandwidth h^2
      cellDensity = cellDensity / (n * bandwidthMeters * bandwidthMeters);

      grid[r][c] = cellDensity;
      allValues.push(cellDensity);

      if (cellDensity > maxDensity) maxDensity = cellDensity;
      if (cellDensity < minDensity) minDensity = cellDensity;
      sumDensity += cellDensity;
    }
  }

  const meanDensity = sumDensity / (resolution * resolution);

  // Hitung Threshold Klasifikasi Kuantil (Rendah, Sedang, Tinggi)
  allValues.sort((a, b) => a - b);
  const nonZeroValues = allValues.filter((v) => v > maxDensity * 0.05);
  const q33Index = Math.floor(nonZeroValues.length * 0.33);
  const q66Index = Math.floor(nonZeroValues.length * 0.66);
  const thresholdLow = nonZeroValues[q33Index] || maxDensity * 0.2;
  const thresholdMedium = nonZeroValues[q66Index] || maxDensity * 0.6;

  // Hitung jumlah sel yang termasuk zona Hotspot (Kepadatan Tinggi)
  let hotspotsCount = 0;
  for (let r = 0; r < resolution; r++) {
    for (let c = 0; c < resolution; c++) {
      if (grid[r][c] >= thresholdMedium) {
        hotspotsCount++;
      }
    }
  }

  // Render Raster ke Canvas (Membalikkan baris Y untuk kesesuaian koordinat spasial)
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(resolution, resolution);

  // Fungsi pemetaan warna gradien
  const getColor = (val: number, max: number, ramp: string): [number, number, number, number] => {
    if (val <= minDensity + (max - minDensity) * 0.03) {
      return [0, 0, 0, 0]; // Transparan penuh untuk area berdensitas nol / latar
    }
    const t = Math.min(1, Math.max(0, (val - minDensity) / (max - minDensity)));

    if (ramp === 'ForestEmerald') {
      // Skema DLH Lingkungan Hidup: Lembut Hijau ke Emas ke Merah Tua
      if (t < 0.33) {
        // Kuning-hijau muda transparan
        return [120, 198, 121, Math.floor(140 + t * 60)];
      } else if (t < 0.66) {
        // Amber emas
        return [254, 178, 76, Math.floor(180 + t * 40)];
      } else {
        // Merah pekat intensitas tinggi
        return [227, 26, 28, 220];
      }
    } else if (ramp === 'Viridis') {
      // Skema Ilmiah Viridis: Ungu - Biru - Hijau - Kuning
      const r = Math.floor(255 * Math.sin(t * Math.PI * 0.5));
      const g = Math.floor(255 * t);
      const b = Math.floor(255 * (1 - t * 0.7));
      return [r, g, b, Math.floor(130 + t * 100)];
    } else {
      // Default: YlOrRd (Yellow-Orange-Red)
      if (t < 0.3) {
        return [255, 237, 160, 150];
      } else if (t < 0.65) {
        return [253, 141, 60, 190];
      } else {
        return [189, 0, 38, 225];
      }
    }
  };

  for (let r = 0; r < resolution; r++) {
    // Canvas Y=0 adalah bagian atas (North), sehingga kita balik r (North ke South)
    const gridRow = resolution - 1 - r;
    for (let c = 0; c < resolution; c++) {
      const val = grid[gridRow][c];
      const [cr, cg, cb, ca] = getColor(val, maxDensity, settings.colorRamp || 'ForestEmerald');
      const idx = (r * resolution + c) * 4;
      imgData.data[idx] = cr;
      imgData.data[idx + 1] = cg;
      imgData.data[idx + 2] = cb;
      imgData.data[idx + 3] = ca;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const imageSrc = canvas.toDataURL('image/png');

  const interpretation = `Analisis Kernel Density Estimation (${settings.kernel.toUpperCase()}, bandwidth $h = ${Math.round(bandwidthMeters)} m) mendeteksi gradasi konsentrasi lokal di seluruh area studi. Terdapat ${hotspotsCount} sel raster tergolong intensitas tinggi (Hotspot), yang menunjukkan titik temu aktivitas atau akumulasi objek lingkungan dengan kepadatan relatif tinggi.`;

  return {
    bounds: [southWest, northEast],
    imageSrc,
    maxDensity,
    minDensity,
    meanDensity,
    bandwidthMeters: Math.round(bandwidthMeters),
    gridResolution: resolution,
    thresholdLow,
    thresholdMedium,
    classificationMethod: 'Kuantil Spasial 3 Kelas (Rendah, Sedang, Tinggi / Hotspot)',
    hotspotsCount,
    interpretation,
    analyzedAt: new Date().toISOString(),
    datasetLabel,
    pointsCount: n,
  };
}
