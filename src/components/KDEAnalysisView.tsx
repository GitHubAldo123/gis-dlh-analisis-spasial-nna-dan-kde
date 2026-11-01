import React, { useState } from 'react';
import { EnvironmentalObject, KDEResult, KDESettings, KernelType } from '../types/gis';
import { computeKDE } from '../utils/spatialMath';
import { InteractiveMap } from './InteractiveMap';
import { CATEGORIES_LIST } from '../data/dummyData';
import {
  Flame,
  Layers,
  Sliders,
  Palette,
  AlertCircle,
  HelpCircle,
  MapPin,
  TrendingUp,
  Info,
  Maximize2
} from 'lucide-react';

interface KDEAnalysisViewProps {
  objects: EnvironmentalObject[];
  currentResult: KDEResult | null;
  onRunKDE: (result: KDEResult) => void;
}

export const KDEAnalysisView: React.FC<KDEAnalysisViewProps> = ({
  objects,
  currentResult,
  onRunKDE,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [bandwidthMode, setBandwidthMode] = useState<'AUTO' | 'CUSTOM'>('AUTO');
  const [customBandwidthM, setCustomBandwidthM] = useState<number>(1000); // 1000 meters default
  const [gridResolution, setGridResolution] = useState<number>(80);
  const [kernelType, setKernelType] = useState<KernelType>('gaussian');
  const [colorRamp, setColorRamp] = useState<'ForestEmerald' | 'YlOrRd' | 'Viridis'>('ForestEmerald');
  const [isComputing, setIsComputing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const candidateObjects = selectedCategory === 'ALL'
    ? objects
    : objects.filter((o) => o.category === selectedCategory);

  const handleCompute = () => {
    setErrorMessage(null);
    setIsComputing(true);

    try {
      if (candidateObjects.length < 3) {
        throw new Error(
          `Analisis KDE memerlukan minimal 3 titik objek koordinat. Saat ini terpilih ${candidateObjects.length} titik.`
        );
      }

      const settings: KDESettings = {
        bandwidthMeter: bandwidthMode === 'CUSTOM' ? customBandwidthM : undefined,
        gridResolution,
        kernel: kernelType,
        colorRamp,
      };

      const label = selectedCategory === 'ALL' ? 'Seluruh Objek Lingkungan' : selectedCategory;
      const result = computeKDE(candidateObjects, settings, label);
      onRunKDE(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat permukaan KDE.');
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Konfigurasi Parameter KDE */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              Kernel Density Estimation (KDE)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimasi kepadatan kontinu 2D untuk memetakan konsentrasi lokal (Hotspot dan Dispersi spasial).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Objek Dianalisis:</span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg border border-amber-200">
              {candidateObjects.length} Titik Koordinat
            </span>
          </div>
        </div>

        {/* Form Parameter KDE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          {/* Kategori Dataset */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dataset / Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Objek Lingkungan ({objects.length})</option>
              {CATEGORIES_LIST.map((cat) => {
                const count = objects.filter((o) => o.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Bandwidth (Radius Pengaruh h) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Radius Bandwidth (h)</label>
            <div className="flex items-center gap-1.5">
              <select
                value={bandwidthMode}
                onChange={(e) => setBandwidthMode(e.target.value as any)}
                className="w-1/2 py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="AUTO">Otomatis</option>
                <option value="CUSTOM">Manual (m)</option>
              </select>
              {bandwidthMode === 'CUSTOM' ? (
                <input
                  type="number"
                  step="100"
                  min="200"
                  max="10000"
                  value={customBandwidthM}
                  onChange={(e) => setCustomBandwidthM(parseInt(e.target.value) || 1000)}
                  className="w-1/2 py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="1000"
                />
              ) : (
                <span className="w-1/2 text-[11px] text-slate-500 italic py-2">
                  Silverman's Rule
                </span>
              )}
            </div>
          </div>

          {/* Fungsi Kernel & Resolusi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fungsi Kernel & Resolusi</label>
            <div className="flex items-center gap-2">
              <select
                value={kernelType}
                onChange={(e) => setKernelType(e.target.value as KernelType)}
                className="w-1/2 py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="gaussian">Gaussian</option>
                <option value="quartic">Quartic</option>
                <option value="epanechnikov">Epanechnikov</option>
              </select>
              <select
                value={gridResolution}
                onChange={(e) => setGridResolution(parseInt(e.target.value))}
                className="w-1/2 py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              >
                <option value={60}>60x60 Sel</option>
                <option value={80}>80x80 Sel</option>
                <option value={100}>100x100 Sel</option>
              </select>
            </div>
          </div>

          {/* Skema Warna & Tombol Eksekusi */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleCompute}
              disabled={isComputing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>{isComputing ? 'Menghitung Grid...' : 'Hasilkan Raster Heatmap'}</span>
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

      {/* Hasil Tampilan KDE */}
      {currentResult && (
        <>
          {/* Ringkasan Metrik KDE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-amber-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Radius Bandwidth (h)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-amber-700">
                  {currentResult.bandwidthMeters.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500">meter</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kernel: <strong>{kernelType.toUpperCase()}</strong>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-rose-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Hotspot (Konsentrasi Tinggi)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-rose-700">
                  {currentResult.hotspotsCount}
                </span>
                <span className="text-xs text-slate-500">sel grid</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {((currentResult.hotspotsCount / (currentResult.gridResolution * currentResult.gridResolution)) * 100).toFixed(1)}% dari total area raster
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Resolusi Raster Matriks
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-emerald-700">
                  {currentResult.gridResolution} &times; {currentResult.gridResolution}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Total: {(currentResult.gridResolution * currentResult.gridResolution).toLocaleString('id-ID')} sel raster
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-indigo-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Klasifikasi Kuantil
              </span>
              <div className="text-xs text-slate-700 mt-1 space-y-0.5">
                <div>
                  <strong>Sedang:</strong> &gt; {(currentResult.thresholdLow * 1e6).toFixed(2)} &times; 10⁻⁶
                </div>
                <div>
                  <strong>Tinggi (Hotspot):</strong> &gt; {(currentResult.thresholdMedium * 1e6).toFixed(2)} &times; 10⁻⁶
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Peta Raster Overlay + Legenda */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peta Interaktif dengan Layer Overlay Heatmap */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Peta Permukaan Kepadatan Spasial (Raster Continuous Overlay)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Citra raster bergradasi warna ditumpangsusunkan secara langsung pada koordinat geografis.
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-[440px]">
                <InteractiveMap
                  objects={candidateObjects}
                  kdeResult={currentResult}
                  showKdeLayer={true}
                  height="450px"
                />
              </div>
            </div>

            {/* Kolom Kanan: Legenda dan Interpretasi Ilmiah */}
            <div className="space-y-4">
              {/* Legenda 3 Kelas Kuantil */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  Legenda Kepadatan Objek
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded bg-rose-600 shrink-0 border border-rose-700" />
                    <div>
                      <div className="font-bold text-slate-800">Konsentrasi Tinggi (Hotspot)</div>
                      <div className="text-slate-500 text-[11px]">
                        Akumulasi objek padat (&gt; kuantil ke-66)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded bg-amber-500 shrink-0 border border-amber-600" />
                    <div>
                      <div className="font-bold text-slate-800">Konsentrasi Sedang</div>
                      <div className="text-slate-500 text-[11px]">
                        Frekuensi objek moderat (kuantil ke-33 s.d. 66)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded bg-emerald-400 shrink-0 border border-emerald-500" />
                    <div>
                      <div className="font-bold text-slate-800">Konsentrasi Rendah / Dispersi</div>
                      <div className="text-slate-500 text-[11px]">
                        Keberadaan objek renggang atau terisolir
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Ilmiah PKL */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  Interpretasi Ilmiah & Batasan Metode
                </h4>
                <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-950 leading-relaxed mb-3">
                  {currentResult.interpretation}
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong className="text-slate-700">Peringatan Analis Spasial:</strong>
                  <br />
                  Permukaan KDE mencerminkan konsentrasi spasial fasilitas/titik sampling, bukan secara otomatis membuktikan tingkat pencemaran lingkungan atau tingkat risiko sebelum dilakukan interpolasi analit geokimia (seperti Kriging atau IDW) pada parameter kualitas air/udara.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
