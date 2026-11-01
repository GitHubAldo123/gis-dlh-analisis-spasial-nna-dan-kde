import React, { useMemo } from 'react';
import { EnvironmentalObject, NNAResult, KDEResult, AnalysisHistoryItem } from '../types/gis';
import { InteractiveMap } from './InteractiveMap';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Route,
  Flame,
  PlusCircle,
  Play,
  FileText,
  BarChart3,
  History,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface DashboardViewProps {
  objects: EnvironmentalObject[];
  latestNNA: NNAResult | null;
  latestKDE: KDEResult | null;
  history: AnalysisHistoryItem[];
  onNavigate: (tab: any) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  objects,
  latestNNA,
  latestKDE,
  history,
  onNavigate,
  onOpenAddModal,
}) => {
  const totalCount = objects.length;
  const validCoordinatesCount = objects.filter(
    (o) => typeof o.latitude === 'number' && typeof o.longitude === 'number' && !isNaN(o.latitude) && !isNaN(o.longitude)
  ).length;
  const dummyCount = objects.filter((o) => o.is_dummy).length;

  // Distribusi kategori
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    objects.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [objects]);

  // Distribusi kecamatan
  const districtStats = useMemo(() => {
    const counts: Record<string, number> = {};
    objects.forEach((o) => {
      const d = o.district || 'Belum Terdata';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [objects]);

  return (
    <div className="space-y-6">
      {/* Banner Peringatan Data Dummy jika aktif */}
      {dummyCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>SIMULASI PKL AKTIF: DATA DUMMY ({dummyCount} OBJEK)</span>
                <span className="text-xs bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Bukan Data Resmi DLH
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Data ini dibuat khusus untuk memfasilitasi pengujian algoritma NNA, KDE, dan pembuatan laporan PKL. Anda dapat menggantinya dengan data resmi DLH kapan saja.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pengaturan')}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg transition shrink-0 ml-4"
          >
            Panduan Ganti Data
          </button>
        </div>
      )}

      {/* Header Selamat Datang & Tombol Cepat */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>Sistem Pemetaan & Analisis Spasial Lingkungan Hidup</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan objek geospasial, kalkulasi pola titik terproyeksi (NNA), dan estimasi kepadatan kontinu (KDE).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Tambah Data
          </button>
          <button
            onClick={() => onNavigate('nna')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs shadow-emerald-700/30 transition"
          >
            <Play className="w-4 h-4" />
            Jalankan Analisis
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Objek</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Tercatat di basis data SIG</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Koordinat Valid</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{validCoordinatesCount}</h3>
            <p className="text-xs text-emerald-600/80 mt-1">100% siap dianalisis</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indeks Pola NNA</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {latestNNA ? latestNNA.nnaIndexR.toFixed(2) : '-'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate max-w-[130px]">
              {latestNNA ? latestNNA.patternResult.split(' ')[0] : 'Belum dihitung'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Route className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Permukaan KDE</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {latestKDE ? `${latestKDE.hotspotsCount} Sel` : '-'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {latestKDE ? `Bandwidth ${latestKDE.bandwidthMeters}m` : 'Belum dihitung'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Peta Spasial + Ringkasan Analitik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Peta Interaktif Leaflet (2 Span) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Persebaran Objek Lingkungan Hidup
              </h3>
              <p className="text-xs text-slate-500">Visualisasi titik survei dan fasilitas pengelolaan lingkungan.</p>
            </div>
            <button
              onClick={() => onNavigate('peta')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              Layar Penuh
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-h-[380px]">
            <InteractiveMap
              objects={objects}
              nnaPairs={latestNNA ? latestNNA.nearestPairs : null}
              kdeResult={latestKDE}
              showNnaLines={false}
              showKdeLayer={false}
              height="400px"
            />
          </div>
        </div>

        {/* Kolom Kanan: Distribusi Kategori & Wilayah */}
        <div className="space-y-6">
          {/* Distribusi Kategori Objek */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Distribusi Kategori Objek
            </h3>
            <div className="space-y-2.5">
              {categoryStats.map(([category, count]) => {
                const pct = Math.round((count / totalCount) * 100) || 0;
                return (
                  <div key={category} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700 font-medium truncate max-w-[190px]">{category}</span>
                      <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Hasil Analisis Terkini */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Status Hasil Analisis
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Analisis NNA:</span>
                  {latestNNA ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                      Selesai
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      Belum dijalankan
                    </span>
                  )}
                </div>
                {latestNNA ? (
                  <p className="text-slate-600">
                    Pola: <strong>{latestNNA.patternResult}</strong> (R = {latestNNA.nnaIndexR}, Z = {latestNNA.zScore}).
                  </p>
                ) : (
                  <button
                    onClick={() => onNavigate('nna')}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1"
                  >
                    Kalkulasi NNA sekarang &rarr;
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Analisis KDE:</span>
                  {latestKDE ? (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                      Selesai
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      Belum dijalankan
                    </span>
                  )}
                </div>
                {latestKDE ? (
                  <p className="text-slate-600">
                    Raster kontinu {latestKDE.gridResolution}×{latestKDE.gridResolution} sel, {latestKDE.hotspotsCount} sel konsentrasi tinggi.
                  </p>
                ) : (
                  <button
                    onClick={() => onNavigate('kde')}
                    className="text-amber-600 hover:text-amber-700 font-semibold mt-1 inline-flex items-center gap-1"
                  >
                    Hasilkan raster KDE sekarang &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Analisis Terbaru */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            Riwayat Pemrosesan Spasial
          </h3>
          <span className="text-xs text-slate-400">Pencatatan sesi analisis SIG</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">Belum ada riwayat analisis yang dijalankan.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.type === 'NNA' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-slate-400 ml-2">({item.pointsCount} titik)</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{item.summary}</p>
                  </div>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0 ml-4">
                  {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
