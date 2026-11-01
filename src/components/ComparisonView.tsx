import React, { useState } from 'react';
import { EnvironmentalObject, NNAResult, KDEResult } from '../types/gis';
import { InteractiveMap } from './InteractiveMap';
import {
  GitCompare,
  Route,
  Flame,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';

interface ComparisonViewProps {
  objects: EnvironmentalObject[];
  nnaResult: NNAResult | null;
  kdeResult: KDEResult | null;
  onNavigate: (tab: any) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  objects,
  nnaResult,
  kdeResult,
  onNavigate,
}) => {
  const [activeMapView, setActiveMapView] = useState<'SPLIT' | 'NNA' | 'KDE'>('SPLIT');

  return (
    <div className="space-y-6">
      {/* Header Halaman Komparasi */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-600" />
              Perbandingan Analisis Spasial: NNA vs KDE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sintesis komparatif antara keteraturan pola titik global (NNA) dan variasi kepadatan lokal kontinu (KDE).
            </p>
          </div>
          {/* Toggle Tampilan Peta */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveMapView('SPLIT')}
              className={`px-3 py-1.5 rounded transition ${
                activeMapView === 'SPLIT' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Berdampingan (Dual Map)
            </button>
            <button
              onClick={() => setActiveMapView('NNA')}
              className={`px-3 py-1.5 rounded transition ${
                activeMapView === 'NNA' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Fokus NNA
            </button>
            <button
              onClick={() => setActiveMapView('KDE')}
              className={`px-3 py-1.5 rounded transition ${
                activeMapView === 'KDE' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Fokus KDE
            </button>
          </div>
        </div>
      </div>

      {/* Peringatan jika salah satu belum dianalisis */}
      {(!nnaResult || !kdeResult) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {!nnaResult && !kdeResult
                ? 'Analisis NNA dan KDE belum dijalankan pada dataset saat ini.'
                : !nnaResult
                ? 'Analisis NNA belum dijalankan. Jalankan NNA untuk membandingkan secara komprehensif.'
                : 'Analisis KDE belum dijalankan. Jalankan KDE untuk membandingkan secara komprehensif.'}
            </span>
          </div>
          <div className="flex gap-2">
            {!nnaResult && (
              <button
                onClick={() => onNavigate('nna')}
                className="bg-emerald-600 text-white font-semibold px-3 py-1 rounded hover:bg-emerald-700"
              >
                Hitung NNA
              </button>
            )}
            {!kdeResult && (
              <button
                onClick={() => onNavigate('kde')}
                className="bg-amber-600 text-white font-semibold px-3 py-1 rounded hover:bg-amber-700"
              >
                Hitung KDE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bagian Visualisasi Peta Komparasi */}
      {activeMapView === 'SPLIT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peta Sisi Kiri: NNA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-blue-600" />
                Vektor Hubungan Jarak NNA
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                R = {nnaResult ? nnaResult.nnaIndexR.toFixed(3) : '-'} ({nnaResult ? nnaResult.patternResult.split(' ')[0] : '-'})
              </span>
            </div>
            <div className="h-[360px]">
              <InteractiveMap
                objects={objects}
                nnaPairs={nnaResult ? nnaResult.nearestPairs : null}
                showNnaLines={true}
                showKdeLayer={false}
                height="100%"
              />
            </div>
          </div>

          {/* Peta Sisi Kanan: KDE */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                Permukaan Kepadatan Raster KDE
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {kdeResult ? `${kdeResult.hotspotsCount} Hotspot Sel` : '-'}
              </span>
            </div>
            <div className="h-[360px]">
              <InteractiveMap
                objects={objects}
                kdeResult={kdeResult}
                showKdeLayer={true}
                showNnaLines={false}
                height="100%"
              />
            </div>
          </div>
        </div>
      ) : activeMapView === 'NNA' ? (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Tampilan Tunggal: Pola Titik NNA</h3>
          <InteractiveMap
            objects={objects}
            nnaPairs={nnaResult ? nnaResult.nearestPairs : null}
            showNnaLines={true}
            showKdeLayer={false}
            height="460px"
          />
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Tampilan Tunggal: Permukaan Kepadatan KDE</h3>
          <InteractiveMap
            objects={objects}
            kdeResult={kdeResult}
            showKdeLayer={true}
            showNnaLines={false}
            height="460px"
          />
        </div>
      )}

      {/* Tabel Komparasi Karakteristik Ilmiah */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            Matriks Perbandingan Karakteristik Metode Spasial
          </h3>
          <span className="text-[11px] text-slate-500">Kajian Metodologi PKL DLH</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3 w-1/4">Aspek Metodologi</th>
                <th className="px-4 py-3 w-3/8 text-blue-900 bg-blue-50/40">Nearest Neighbor Analysis (NNA)</th>
                <th className="px-4 py-3 w-3/8 text-amber-900 bg-amber-50/40">Kernel Density Estimation (KDE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Skala Pengukuran</td>
                <td className="px-4 py-3 text-slate-700 bg-blue-50/10">
                  <strong>Global (Makro Ruang):</strong> Memberikan satu nilai skalar indeks ($R$) yang mewakili kecenderungan agregat seluruh wilayah studi.
                </td>
                <td className="px-4 py-3 text-slate-700 bg-amber-50/10">
                  <strong>Lokal (Mikro Ruang):</strong> Menghasilkan permukaan kontinu matriks 2D yang memperlihatkan variasi intensitas antar-zona.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Prinsip Komputasi</td>
                <td className="px-4 py-3 text-slate-700 bg-blue-50/10">
                  Perbandingan rata-rata jarak Euclidean terdekat teramati ($D_o$) dengan jarak harapan Poisson acak ($D_e$).
                </td>
                <td className="px-4 py-3 text-slate-700 bg-amber-50/10">
                  Penerapan fungsi kernel kurva pembobot probabilitas terhadap jarak dalam radius bandwidth ($h$).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Uji Signifikansi</td>
                <td className="px-4 py-3 text-slate-700 bg-blue-50/10">
                  Memiliki dasar inferensial baku ($Z$-score dan $p$-value terhadap model Poisson acak).
                </td>
                <td className="px-4 py-3 text-slate-700 bg-amber-50/10">
                  Eksplorasi visual dan klasifikasi kuantil/jenks tanpa uji hipotesis tunggal otomatis.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Batasan Metode</td>
                <td className="px-4 py-3 text-slate-700 bg-blue-50/10">
                  Sangat sensitif terhadap definisi luas batas wilayah ($A$). Tidak memperlihatkan <em>di mana</em> tepatnya titik-titik mengelompok.
                </td>
                <td className="px-4 py-3 text-slate-700 bg-amber-50/10">
                  Sangat bergantung pada pemilihan radius bandwidth ($h$). Pemilihan bandwidth terlalu besar menghaluskan pola, terlalu kecil menimbulkan spike tajam.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-800">Pemanfaatan DLH</td>
                <td className="px-4 py-3 text-slate-700 bg-blue-50/10">
                  Evaluasi efisiensi pemerataan penempatan fasilitas sarana kebersihan kota dan keteraturan titik pantau.
                </td>
                <td className="px-4 py-3 text-slate-700 bg-amber-50/10">
                  Delineasi zona prioritas penambahan TPS3R/truk pengangkut dan mitigasi titik akumulasi beban lingkungan tinggi.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kesimpulan Sintesis Ilmiah */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-xs text-emerald-950">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700" />
          Sintesis Analisis Spasial Mahasiswa PKL
        </h4>
        <p className="leading-relaxed">
          Kedua metode ini saling melengkapi (komplementer) dan tidak boleh dipertentangkan. NNA memberikan konfirmasi statistik apakah fenomena lingkungan memiliki struktur keteraturan atau terjadi secara acak, sedangkan KDE menyediakan peta panduan operasional bagi Dinas Lingkungan Hidup untuk mengidentifikasi koordinat spesifik lokasi intervensi lapangan.
        </p>
      </div>
    </div>
  );
};
