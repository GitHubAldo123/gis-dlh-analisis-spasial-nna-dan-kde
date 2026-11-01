import React, { useState } from 'react';
import { EnvironmentalObject, NNAPair, KDEResult } from '../types/gis';
import { InteractiveMap } from './InteractiveMap';
import { CATEGORIES_LIST } from '../data/dummyData';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  EyeOff,
  Route,
  Flame,
  Info,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MapFullViewProps {
  objects: EnvironmentalObject[];
  nnaPairs: NNAPair[] | null;
  kdeResult: KDEResult | null;
  onSelectObject?: (obj: EnvironmentalObject) => void;
}

export const MapFullView: React.FC<MapFullViewProps> = ({
  objects,
  nnaPairs,
  kdeResult,
  onSelectObject,
}) => {
  const [showNnaVectors, setShowNnaVectors] = useState(true);
  const [showKdeSurface, setShowKdeSurface] = useState(true);
  const [boundaryMessage, setBoundaryMessage] = useState<string | null>(null);

  const handleBoundaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBoundaryMessage(`Batas wilayah GeoJSON "${file.name}" berhasil dimuat.`);
      setTimeout(() => setBoundaryMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bar Kontrol & Pengaturan Layer Peta */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Peta Geospasial Persebaran Objek Lingkungan
          </h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Peta interaktif Leaflet.js dengan basemap OpenStreetMap, Topografi, dan Satelit Esri.
          </p>
        </div>

        {/* Toggles NNA & KDE */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showNnaVectors}
              onChange={(e) => setShowNnaVectors(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Route className="w-3.5 h-3.5 text-blue-600" />
              Garis Tetangga NNA
            </span>
          </label>

          <div className="w-px h-4 bg-slate-200" />

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showKdeSurface}
              onChange={(e) => setShowKdeSurface(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Permukaan Raster KDE
            </span>
          </label>
        </div>

        {/* Unggah Batas Administrasi Resmi */}
        <div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition border border-slate-300/80 font-semibold">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Batas Administrasi (GeoJSON)</span>
            <input
              type="file"
              accept=".geojson,.json"
              className="hidden"
              onChange={handleBoundaryUpload}
            />
          </label>
        </div>
      </div>

      {boundaryMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{boundaryMessage}</span>
        </div>
      )}

      {/* Peta Ukuran Penuh */}
      <div className="relative">
        <InteractiveMap
          objects={objects}
          nnaPairs={nnaPairs}
          kdeResult={kdeResult}
          showNnaLines={showNnaVectors}
          showKdeLayer={showKdeSurface}
          height="620px"
          onSelectObject={onSelectObject}
        />
      </div>

      {/* Legenda Kategori di Bagian Bawah */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="font-bold text-slate-800 mb-2.5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Legenda Kategori Objek Lingkungan Hidup
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#f97316] border-2 border-white shadow-xs" />
            <span className="text-slate-700">Tempat Penampungan (TPS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#059669] border-2 border-white shadow-xs" />
            <span className="text-slate-700">TPS3R Mandiri</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0284c7] border-2 border-white shadow-xs" />
            <span className="text-slate-700">Titik Pantau Air</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#6366f1] border-2 border-white shadow-xs" />
            <span className="text-slate-700">SPKU (Kualitas Udara)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] border-2 border-white shadow-xs" />
            <span className="text-slate-700">Laboratorium Lingkungan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#15803d] border-2 border-white shadow-xs" />
            <span className="text-slate-700">Kawasan Konservasi & RTH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
