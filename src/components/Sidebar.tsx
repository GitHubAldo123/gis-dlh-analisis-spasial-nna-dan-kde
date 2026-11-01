import React from 'react';
import { UserRole, UserSession } from '../types/gis';
import {
  LayoutDashboard,
  MapPin,
  Database,
  Route,
  Flame,
  GitCompare,
  FileText,
  Settings,
  ShieldCheck,
  TreePine,
  Users,
  Send,
  Recycle,
  LogIn,
  Inbox
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'peta'
  | 'data'
  | 'nna'
  | 'kde'
  | 'komparasi'
  | 'laporan'
  | 'pengaturan'
  | 'warga';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalObjects: number;
  dummyCount: number;
  userSession: UserSession;
  onOpenLoginModal: () => void;
  citizenReportsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  totalObjects,
  dummyCount,
  userSession,
  onOpenLoginModal,
  citizenReportsCount,
}) => {
  const isDinas = userSession.role === 'dinas';

  // Menu untuk Pihak Dinas DLH
  const dinasMenuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'peta', label: 'Peta Persebaran', icon: <MapPin className="w-4 h-4" /> },
    { id: 'data', label: 'Data Objek (CRUD)', icon: <Database className="w-4 h-4" />, badge: `${totalObjects}` },
    { id: 'nna', label: 'Analisis NNA', icon: <Route className="w-4 h-4" /> },
    { id: 'kde', label: 'Analisis KDE', icon: <Flame className="w-4 h-4" /> },
    { id: 'komparasi', label: 'Perbandingan Analisis', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan PKL DLH', icon: <FileText className="w-4 h-4" /> },
    { id: 'warga', label: 'Aspirasi Warga', icon: <Inbox className="w-4 h-4" />, badge: `${citizenReportsCount}` },
    { id: 'pengaturan', label: 'Pengaturan & Panduan', icon: <Settings className="w-4 h-4" /> },
  ];

  // Menu untuk Penduduk / Warga
  const citizenMenuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'warga', label: 'Portal Warga', icon: <Users className="w-4 h-4" /> },
    { id: 'peta', label: 'Peta Lokasi TPS & Sampah', icon: <MapPin className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Panduan Informasi', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentMenuItems = isDinas ? dinasMenuItems : citizenMenuItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isDinas
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-emerald-900/50'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-400 shadow-blue-900/50'
            }`}
          >
            {isDinas ? <TreePine className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              GIS DLH
            </h1>
            <p className="text-xs text-emerald-400 font-medium">Analisis Spasial NNA & KDE</p>
          </div>
        </div>

        {/* Badge Peran Aktif */}
        <div className="mt-3 bg-slate-800/80 rounded-lg p-2.5 text-[11px] text-slate-300 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            {isDinas ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )}
            <span className="truncate font-medium">{userSession.name}</span>
          </div>
          <button
            onClick={onOpenLoginModal}
            className={`font-bold px-1.5 py-0.5 rounded text-[10px] border transition shrink-0 ${
              isDinas
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                : 'bg-blue-950 text-blue-300 border-blue-800 hover:bg-blue-900'
            }`}
          >
            Ganti
          </button>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1 flex items-center justify-between">
          <span>{isDinas ? 'Menu Administrator DLH' : 'Menu Layanan Warga'}</span>
          <span className="text-[9px] text-slate-400 font-normal">
            {isDinas ? 'Akses Penuh' : 'Akses Publik'}
          </span>
        </div>

        {currentMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? isDinas
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/40 font-semibold'
                    : 'bg-blue-600 text-white shadow-sm shadow-blue-700/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? isDinas
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-blue-800 text-blue-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Switcher Mode Peran */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <button
          onClick={onOpenLoginModal}
          className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition"
        >
          <LogIn className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isDinas ? 'Beralih ke Akun Penduduk' : 'Masuk Petugas Dinas DLH'}</span>
        </button>

        <div className="bg-slate-800/40 rounded-lg p-2 text-center text-[10px] text-slate-400">
          GIS DLH v1.0 &bull; Praktik Kerja Lapangan
        </div>
      </div>
    </aside>
  );
};
