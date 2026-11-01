import React, { useState } from 'react';
import { EnvironmentalObject, NNAResult } from '../types/gis';
import { computeNNA } from '../utils/spatialMath';
import { InteractiveMap } from './InteractiveMap';
import { CATEGORIES_LIST } from '../data/dummyData';
import {
  Route,
  Calculator,
  AlertCircle,
  HelpCircle,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Table,
  Info,
  Maximize2
} from 'lucide-react';

interface NNAAnalysisViewProps {
  objects: EnvironmentalObject[];
  currentResult: NNAResult | null;
  onRunNNA: (result: NNAResult) => void;
}

export const NNAAnalysisView: React.FC<NNAAnalysisViewProps> = ({
  objects,
  currentResult,
  onRunNNA,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [areaMode, setAreaMode] = useState<'AUTO' | 'CUSTOM'>('AUTO');
  const [customAreaKm2, setCustomAreaKm2] = useState<number>(25); // default 25 km2
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [showVectorLines, setShowVectorLines] = useState(true);

  // Filter objects based on selection
  const candidateObjects = selectedCategory === 'ALL'
    ? objects
    : objects.filter((o) => o.category === selectedCategory);

  const handleCompute = () => {
    setErrorMessage(null);
    setIsComputing(true);

    try {
      if (candidateObjects.length < 4) {
        throw new Error(
          `Analisis NNA membutuhkan minimal 4 titik objek. Saat ini terpilih ${candidateObjects.length} titik.`
        );
      }

      const customAreaM2 = areaMode === 'CUSTOM' && customAreaKm2 > 0 ? customAreaKm2 * 1_000_000 : undefined;
      const label = selectedCategory === 'ALL' ? 'Seluruh Objek Lingkungan' : selectedCategory;

      const result = computeNNA(candidateObjects, customAreaM2, label);
      onRunNNA(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghitung NNA.');
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Konfigurasi NNA */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Route className="w-5 h-5 text-emerald-600" />
              Nearest Neighbor Analysis (NNA)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifikasi kecenderungan persebaran spasial: Mengelompok (Clustered), Acak (Random), atau Teratur (Dispersed).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Objek Terpilih:</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
              {candidateObjects.length} Titik Koordinat
            </span>
          </div>
        </div>

        {/* Form Pengaturan Parameter NNA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dataset / Kategori Objek
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Objek Lingkungan ({objects.length} titik)</option>
              {CATEGORIES_LIST.map((cat) => {
                const count = objects.filter((o) => o.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count} titik)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penetapan Luas Wilayah Studi (A)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={areaMode}
                onChange={(e) => setAreaMode(e.target.value as any)}
                className="w-1/2 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="AUTO">Otomatis (Planar Bounding)</option>
                <option value="CUSTOM">Manual (km²)</option>
              </select>
              {areaMode === 'CUSTOM' ? (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={customAreaKm2}
                  onChange={(e) => setCustomAreaKm2(parseFloat(e.target.value) || 1)}
                  placeholder="25.0 km²"
                  className="w-1/2 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              ) : (
                <span className="w-1/2 text-[11px] text-slate-500 italic py-2">
                  Dihitung dari envelope koordinat titik
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCompute}
              disabled={isComputing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              <span>{isComputing ? 'Memproses Proyeksi & Jarak...' : 'Kalkulasi NNA Sekarang'}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tampilan Hasil Kalkulasi NNA */}
      {currentResult && (
        <>
          {/* Kartu Ringkasan Hasil Matematis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rasio R */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Indeks NNA (R)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-700">
                  {currentResult.nnaIndexR.toFixed(3)}
                </span>
                <span className="text-xs text-slate-400 font-mono">Do / De</span>
              </div>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {currentResult.patternResult}
              </p>
            </div>

            {/* Jarak Teramati (Do) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-blue-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Rata-rata Jarak Teramati (Do)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-blue-700">
                  {currentResult.observedMeanDistanceM.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500">meter</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Jarak harapan (De): {currentResult.expectedMeanDistanceM.toLocaleString('id-ID')} m
              </p>
            </div>

            {/* Uji Z-Score */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Z-Score Inferensial
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-800">
                  {currentResult.zScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  p = {currentResult.pValue.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentResult.isStatisticallySignificant
                  ? 'Signifikan secara statistik (p < 0.05)'
                  : 'Tidak signifikan secara statistik (p ≥ 0.05)'}
              </p>
            </div>

            {/* Parameter Wilayah & CRS */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Wilayah & Proyeksi
              </span>
              <div className="text-xs text-slate-700 mt-1 space-y-1">
                <div>
                  <strong>Luas Area:</strong> {currentResult.studyAreaKm2.toLocaleString('id-ID')} km²
                </div>
                <div className="truncate text-slate-500">
                  <strong>CRS:</strong> {currentResult.crsUsed}
                </div>
                <div>
                  <strong>Kepadatan:</strong> {(currentResult.totalPoints / currentResult.studyAreaKm2).toFixed(2)} titik/km²
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Peta dan Interpretasi Ilmiah */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peta Interaktif dengan Vektor Hubungan NNA (2 Kolom) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Peta Vektor Pasangan Tetangga Terdekat
                  </h3>
                  <p className="text-xs text-slate-500">
                    Garis putus-putus merah menghubungkan setiap objek ke tetangga terdekatnya secara planar metrik.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVectorLines}
                    onChange={(e) => setShowVectorLines(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Garis Vektor Jarak</span>
                </label>
              </div>

              <div className="flex-1 min-h-[440px]">
                <InteractiveMap
                  objects={candidateObjects}
                  nnaPairs={currentResult.nearestPairs}
                  showNnaLines={showVectorLines}
                  height="450px"
                />
              </div>
            </div>

            {/* Kolom Kanan: Penjelasan Teori & Interpretasi Ilmiah */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Interpretasi Ilmiah Hasil NNA
                </h4>
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-950 leading-relaxed mb-3">
                  {currentResult.interpretation}
                </div>

                <h5 className="font-semibold text-slate-700 text-xs mb-1.5">
                  Ketentuan Nilai Indeks R (Clark & Evans, 1954):
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong className="text-slate-800">R &lt; 0.85:</strong> Mengelompok (Clustered). Titik-titik beraglomerasi pada zona tertentu.
                  </li>
                  <li>
                    <strong className="text-slate-800">0.85 ≤ R ≤ 1.15:</strong> Acak (Random). Pola mengikuti proses Poisson independen tanpa tendensi klaster maupun dispersi.
                  </li>
                  <li>
                    <strong className="text-slate-800">R &gt; 1.15:</strong> Seragam / Teratur (Dispersed). Titik-titik saling menjaga jarak (misal penataan sarana yang berjarak minimum).
                  </li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Formulasi Matematis Planar</h4>
                <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                  <div>Do = &Sigma;(di) / n = {currentResult.observedMeanDistanceM.toFixed(1)} m</div>
                  <div>&lambda; = n / A = {(currentResult.totalPoints / currentResult.studyAreaM2).toExponential(3)} titik/m²</div>
                  <div>De = 1 / (2 &times; &radic;&lambda;) = {currentResult.expectedMeanDistanceM.toFixed(1)} m</div>
                  <div>R = Do / De = {currentResult.nnaIndexR.toFixed(4)}</div>
                  <div>Z = (Do - De) / SE = {currentResult.zScore.toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Pasangan Jarak Tetangga Terdekat */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              Tabel Pasangan Jarak Tetangga Terdekat (Nearest Neighbor Distances)
            </h3>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">No</th>
                    <th className="px-4 py-2.5">Objek Asal (i)</th>
                    <th className="px-4 py-2.5">Tetangga Terdekat (j)</th>
                    <th className="px-4 py-2.5">Jarak Planar (meter)</th>
                    <th className="px-4 py-2.5">Deviasi terhadap De</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentResult.nearestPairs.map((pair, idx) => {
                    const dev = pair.distanceMeter - currentResult.expectedMeanDistanceM;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium text-slate-800">{pair.fromName}</td>
                        <td className="px-4 py-2 text-slate-600">{pair.toName}</td>
                        <td className="px-4 py-2 font-mono font-semibold text-emerald-700">
                          {pair.distanceMeter.toLocaleString('id-ID')} m
                        </td>
                        <td className={`px-4 py-2 font-mono text-[11px] ${dev >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {dev >= 0 ? `+${dev.toFixed(1)} m` : `${dev.toFixed(1)} m`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
