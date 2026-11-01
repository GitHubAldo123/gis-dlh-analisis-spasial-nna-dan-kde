import React from 'react';
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
  Building2,
  TreePine,
  ExternalLink
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'peta'
  | 'data'
  | 'nna'
  | 'kde'
  | 'komparasi'
  | 'laporan'
  | 'pengaturan';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalObjects: number;
  dummyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  totalObjects,
  dummyCount,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'peta', label: 'Peta Persebaran', icon: <MapPin className="w-4 h-4" /> },
    { id: 'data', label: 'Data Objek', icon: <Database className="w-4 h-4" />, badge: `${totalObjects}` },
    { id: 'nna', label: 'Analisis NNA', icon: <Route className="w-4 h-4" /> },
    { id: 'kde', label: 'Analisis KDE', icon: <Flame className="w-4 h-4" /> },
    { id: 'komparasi', label: 'Perbandingan Analisis', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan PKL', icon: <FileText className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan & Panduan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/50">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              GIS DLH
            </h1>
            <p className="text-xs text-emerald-400 font-medium">Analisis Spasial NNA & KDE</p>
          </div>
        </div>
        <div className="mt-3 bg-slate-800/80 rounded-lg p-2 text-[11px] text-slate-300 border border-slate-700/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Portal PKL Mahasiswa
          </span>
          <span className="bg-emerald-950 text-emerald-300 font-semibold px-1.5 py-0.5 rounded text-[10px] border border-emerald-800/50">
            SIG DLH
          </span>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
          Menu Navigasi
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/40 font-semibold'
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
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Data Dummy / Resmi Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[11px]">Status Dataset:</span>
            {dummyCount > 0 ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-medium">
                Simulasi PKL
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-medium">
                Data Resmi DLH
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 font-medium">
            {dummyCount > 0
              ? `${dummyCount} data simulasi aktif untuk uji analisis.`
              : `${totalObjects} data resmi terverifikasi.`}
          </p>
        </div>
      </div>
    </aside>
  );
};
