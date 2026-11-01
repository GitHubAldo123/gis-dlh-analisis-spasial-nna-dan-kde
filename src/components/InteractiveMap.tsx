import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { EnvironmentalObject, NNAPair, KDEResult } from '../types/gis';
import { Layers, MapPin, Eye, EyeOff, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface InteractiveMapProps {
  objects: EnvironmentalObject[];
  selectedObjectId?: string | null;
  onSelectObject?: (obj: EnvironmentalObject) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  nnaPairs?: NNAPair[] | null;
  kdeResult?: KDEResult | null;
  showNnaLines?: boolean;
  showKdeLayer?: boolean;
  height?: string;
  allowClickToPick?: boolean;
}

// Kategori warna marker
const CATEGORY_COLORS: Record<string, string> = {
  'Tempat Penampungan Sementara (TPS)': '#f97316', // Orange
  'Bank Sampah': '#10b981',                         // Emerald Green
  'TPS3R (Reuse, Reduce, Recycle)': '#059669',     // Dark Emerald
  'Titik Pantau Kualitas Air': '#0284c7',          // Sky Blue
  'Stasiun Pemantau Kualitas Udara (SPKU)': '#6366f1', // Indigo
  'Laboratorium Lingkungan': '#8b5cf6',             // Purple
  'Kawasan Konservasi & RTH': '#15803d',            // Forest Green
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onMapClick,
  nnaPairs,
  kdeResult,
  showNnaLines = true,
  showKdeLayer = true,
  height = '500px',
  allowClickToPick = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const nnaLinesLayerRef = useRef<L.LayerGroup | null>(null);
  const kdeOverlayRef = useRef<L.ImageOverlay | null>(null);

  const [activeBasemap, setActiveBasemap] = useState<'osm' | 'topo' | 'satellite'>('osm');
  const [showPoints, setShowPoints] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap URLs
  const basemaps = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // Inisialisasi Peta
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = [-6.9147, 107.6098]; // Bandung DLH default
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(basemaps[activeBasemap], {
      attribution: '&copy; OpenStreetMap contributors, CartoDB, Esri',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    nnaLinesLayerRef.current = L.layerGroup().addTo(map);

    // Event Klik Peta
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(basemaps[activeBasemap]);
  }, [activeBasemap]);

  // Render Objek Titik
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (!showPoints) return;

    const bounds: [number, number][] = [];

    const filtered = filterCategory === 'ALL'
      ? objects
      : objects.filter((o) => o.category === filterCategory);

    filtered.forEach((obj) => {
      if (typeof obj.latitude !== 'number' || typeof obj.longitude !== 'number') return;

      const isSelected = selectedObjectId === obj.id;
      const color = CATEGORY_COLORS[obj.category] || '#16a34a';

      const customIcon = L.divIcon({
        className: 'custom-gis-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${isSelected ? '24px' : '18px'};
            height: ${isSelected ? '24px' : '18px'};
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            cursor: pointer;
            ${isSelected ? 'transform: scale(1.3); outline: 3px solid #facc15;' : ''}
          ">
            ${obj.is_dummy ? '<span style="font-size: 8px; color: white; font-weight: bold;">D</span>' : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([obj.latitude, obj.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 200px;">
          <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px;">
            ${obj.id} ${obj.is_dummy ? '<span style="background: #fef08a; color: #854d0e; padding: 1px 4px; border-radius: 4px; font-size: 10px;">DATA DUMMY</span>' : '<span style="background: #bbf7d0; color: #166534; padding: 1px 4px; border-radius: 4px; font-size: 10px;">DATA RESMI</span>'}
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 4px;">
            ${obj.name}
          </div>
          <div style="color: ${color}; font-weight: 600; margin-bottom: 6px;">
            ${obj.category}
          </div>
          <div style="color: #475569; font-size: 12px; margin-bottom: 4px;">
            <strong>Lokasi:</strong> ${obj.district ? `${obj.district}, ` : ''}${obj.village || '-'}
          </div>
          <div style="color: #475569; font-size: 12px; margin-bottom: 6px;">
            <strong>Koordinat:</strong> ${obj.latitude.toFixed(5)}, ${obj.longitude.toFixed(5)}
          </div>
          ${obj.notes ? `<div style="background: #f1f5f9; padding: 4px 6px; border-radius: 4px; font-size: 11px; color: #334155;">${obj.notes}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectObject) onSelectObject(obj);
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.push([obj.latitude, obj.longitude]);
    });

    if (bounds.length > 0 && !nnaPairs && !kdeResult) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [objects, selectedObjectId, showPoints, filterCategory]);

  // Render Garis Vektor Tetangga Terdekat (NNA Pairs)
  useEffect(() => {
    if (!mapInstanceRef.current || !nnaLinesLayerRef.current) return;
    nnaLinesLayerRef.current.clearLayers();

    if (!showNnaLines || !nnaPairs || nnaPairs.length === 0) return;

    const bounds: [number, number][] = [];

    nnaPairs.forEach((pair) => {
      // Garis penghubung tetangga terdekat dengan panah dan jarak
      const polyline = L.polyline([pair.fromCoords, pair.toCoords], {
        color: '#dc2626', // Crimson red
        weight: 2.2,
        dashArray: '5, 5',
        opacity: 0.85,
      });

      const tooltipText = `<b>${pair.fromName}</b> &rarr; <b>${pair.toName}</b><br>Jarak Metrik: <b>${pair.distanceMeter.toLocaleString('id-ID')} meter</b>`;
      polyline.bindTooltip(tooltipText, { sticky: true });
      polyline.bindPopup(`
        <div style="font-size: 12px;">
          <strong style="color: #dc2626;">Pasangan Tetangga Terdekat:</strong><br>
          Dari: ${pair.fromName}<br>
          Ke: ${pair.toName}<br>
          <strong>Jarak Planar Terproyeksi:</strong> ${pair.distanceMeter.toLocaleString('id-ID')} meter
        </div>
      `);

      nnaLinesLayerRef.current?.addLayer(polyline);
      bounds.push(pair.fromCoords);
      bounds.push(pair.toCoords);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [nnaPairs, showNnaLines]);

  // Render Raster Permukaan Kepadatan KDE (ImageOverlay)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (kdeOverlayRef.current) {
      mapInstanceRef.current.removeLayer(kdeOverlayRef.current);
      kdeOverlayRef.current = null;
    }

    if (!showKdeLayer || !kdeResult || !kdeResult.imageSrc) return;

    const overlay = L.imageOverlay(kdeResult.imageSrc, kdeResult.bounds, {
      opacity: 0.72,
      interactive: false,
    }).addTo(mapInstanceRef.current);

    kdeOverlayRef.current = overlay;
    mapInstanceRef.current.fitBounds(kdeResult.bounds, { padding: [30, 30] });
  }, [kdeResult, showKdeLayer]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white" style={{ height }}>
      {/* Container Leaflet DOM */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Kontrol Peta Mengambang Atas Kiri: Navigasi & Layer */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        {/* Layer Selector */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-1 flex items-center gap-1 text-xs font-medium text-slate-780">
          <button
            onClick={() => setActiveBasemap('osm')}
            className={`px-2.5 py-1 rounded transition-colors ${activeBasemap === 'osm' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="OpenStreetMap Standard"
          >
            OSM
          </button>
          <button
            onClick={() => setActiveBasemap('topo')}
            className={`px-2.5 py-1 rounded transition-colors ${activeBasemap === 'topo' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Topografi Kontur"
          >
            Topografi
          </button>
          <button
            onClick={() => setActiveBasemap('satellite')}
            className={`px-2.5 py-1 rounded transition-colors ${activeBasemap === 'satellite' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
            title="Citra Satelit Esri"
          >
            Satelit
          </button>
        </div>

        {/* Toggle Titik & Filter Kategori */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-2 text-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Layer Titik ({objects.length})
            </span>
            <button
              onClick={() => setShowPoints(!showPoints)}
              className="text-slate-500 hover:text-slate-800 p-0.5"
              title={showPoints ? 'Sembunyikan Titik' : 'Tampilkan Titik'}
            >
              {showPoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Kategori ({objects.length})</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kontrol Zoom Kanan Bawah */}
      <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-1 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-1">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-emerald-700 transition"
          title="Perbesar Peta"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-emerald-700 transition"
          title="Perkecil Peta"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (objects.length > 0 && mapInstanceRef.current) {
              const bounds = objects.map((o) => [o.latitude, o.longitude] as [number, number]);
              mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
          }}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-emerald-700 transition"
          title="Fokus ke Seluruh Objek"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Indikator Mode Pemilih Lokasi jika diaktifkan */}
      {allowClickToPick && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-emerald-800/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>Klik lokasi di peta untuk memilih koordinat lintang & bujur</span>
        </div>
      )}
    </div>
  );
};
