import React from 'react';
import { ActiveTab } from './Sidebar';
import {
  Building2,
  TreePine,
  ShieldCheck,
  PlusCircle,
  Play,
  Flame,
  Route,
  Database
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  dummyCount: number;
  totalObjects: number;
  onOpenAddModal: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Utama GIS DLH',
    subtitle: 'Pemetaan, rekapitulasi data lingkungan hidup, dan ringkasan analisis spasial.',
  },
  peta: {
    title: 'Peta Persebaran Interaktif',
    subtitle: 'Visualisasi spasial berbasis Leaflet.js dengan kontrol multi-layer dan legenda.',
  },
  data: {
    title: 'Manajemen Data Objek Geografis (CRUD)',
    subtitle: 'Pengelolaan data titik pantau, sarana persampahan, impor CSV/Excel/GeoJSON.',
  },
  nna: {
    title: 'Nearest Neighbor Analysis (NNA)',
    subtitle: 'Analisis pola persebaran titik dengan proyeksi planar metrik UTM dan uji statistik Z.',
  },
  kde: {
    title: 'Kernel Density Estimation (KDE)',
    subtitle: 'Pemodelan raster kontur kepadatan spasial kontinu 2D dan identifikasi hotspot.',
  },
  komparasi: {
    title: 'Perbandingan Analisis: NNA vs KDE',
    subtitle: 'Sintesis perbandingan pola global agregat berbanding konsentrasi lokal.',
  },
  laporan: {
    title: 'Laporan Praktik Kerja Lapangan (PKL)',
    subtitle: 'Dokumen laporan lengkap berformat akademik siap cetak atau simpan PDF.',
  },
  pengaturan: {
    title: 'Pengaturan & Panduan Implementasi',
    subtitle: 'Panduan menjalankan di Windows VS Code, penggantian data dummy, dan QGIS.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  dummyCount,
  totalObjects,
  onOpenAddModal,
  onNavigate,
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'GIS Dinas Lingkungan Hidup',
    subtitle: 'Analisis Spasial NNA & KDE',
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {currentTabInfo.title}
          </h2>
          {dummyCount > 0 ? (
            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
              SIMULASI PKL
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
              DATA RESMI DLH
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{currentTabInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tambah Objek</span>
        </button>

        <button
          onClick={() => onNavigate('nna')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Route className="w-3.5 h-3.5" />
          <span>Hitung NNA</span>
        </button>

        <button
          onClick={() => onNavigate('kde')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hitung KDE</span>
        </button>
      </div>
    </header>
  );
};
