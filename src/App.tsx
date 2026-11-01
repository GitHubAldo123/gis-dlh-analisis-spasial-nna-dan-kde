/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EnvironmentalObject,
  NNAResult,
  KDEResult,
  AnalysisHistoryItem,
  UserSession,
  CitizenReport
} from './types/gis';
import {
  getStoredObjects,
  saveStoredObjects,
  addObject,
  updateObject,
  deleteObject,
  removeAllDummyObjects,
  resetToDefaultDummyData,
  getAnalysisHistory,
  addAnalysisHistory,
  getStoredUserSession,
  saveUserSession,
  getCitizenReports,
  addCitizenReport,
  updateCitizenReportStatus
} from './services/storageService';
import { computeNNA, computeKDE } from './utils/spatialMath';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DataManagementView } from './components/DataManagementView';
import { NNAAnalysisView } from './components/NNAAnalysisView';
import { KDEAnalysisView } from './components/KDEAnalysisView';
import { ComparisonView } from './components/ComparisonView';
import { ReportView } from './components/ReportView';
import { SettingsGuideView } from './components/SettingsGuideView';
import { MapFullView } from './components/MapFullView';
import { LoginForm } from './components/LoginForm';
import { CitizenPortalView } from './components/CitizenPortalView';
import {
  Inbox,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  ShieldCheck,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession>(getStoredUserSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    userSession.role === 'penduduk' ? 'warga' : 'dashboard'
  );
  const [objects, setObjects] = useState<EnvironmentalObject[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [latestNNA, setLatestNNA] = useState<NNAResult | null>(null);
  const [latestKDE, setLatestKDE] = useState<KDEResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Inisialisasi Data dari Storage
  useEffect(() => {
    const loaded = getStoredObjects();
    setObjects(loaded);
    setHistory(getAnalysisHistory());
    setCitizenReports(getCitizenReports());

    // Otomatis jalankan kalkulasi awal NNA dan KDE jika terdapat objek valid
    if (loaded.length >= 4) {
      try {
        const initialNna = computeNNA(loaded, undefined, 'Dataset Awal Simulasi');
        setLatestNNA(initialNna);

        const initialKde = computeKDE(
          loaded,
          {
            gridResolution: 80,
            kernel: 'gaussian',
            colorRamp: 'ForestEmerald',
          },
          'Dataset Awal Simulasi'
        );
        setLatestKDE(initialKde);
      } catch (err) {
        console.warn('Initial spatial analysis computation note:', err);
      }
    }
  }, []);

  const dummyCount = objects.filter((o) => o.is_dummy).length;

  // Handler Login & Pergantian Akun
  const handleLogin = (session: UserSession) => {
    saveUserSession(session);
    setUserSession(session);
    if (session.role === 'penduduk') {
      setActiveTab('warga');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handler CRUD Objek
  const handleAddObject = (newObj: Omit<EnvironmentalObject, 'id'>) => {
    const created = addObject(newObj);
    const updated = [created, ...objects];
    setObjects(updated);

    if (updated.length >= 4) {
      try {
        const nna = computeNNA(updated, undefined, 'Dataset Terkini');
        setLatestNNA(nna);
        const kde = computeKDE(
          updated,
          { gridResolution: 80, kernel: 'gaussian', colorRamp: 'ForestEmerald' },
          'Dataset Terkini'
        );
        setLatestKDE(kde);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateObject = (id: string, patch: Partial<EnvironmentalObject>) => {
    updateObject(id, patch);
    const updated = objects.map((o) => (o.id === id ? { ...o, ...patch } : o));
    setObjects(updated);
  };

  const handleDeleteObject = (id: string) => {
    deleteObject(id);
    const updated = objects.filter((o) => o.id !== id);
    setObjects(updated);
  };

  const handleImportObjects = (imported: Omit<EnvironmentalObject, 'id'>[]) => {
    const current = getStoredObjects();
    const newItems: EnvironmentalObject[] = imported.map((item, idx) => ({
      ...item,
      id: `DLH-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
    }));
    const combined = [...newItems, ...current];
    saveStoredObjects(combined);
    setObjects(combined);

    if (combined.length >= 4) {
      try {
        const nna = computeNNA(combined, undefined, 'Dataset Pasca Impor');
        setLatestNNA(nna);
        const kde = computeKDE(
          combined,
          { gridResolution: 80, kernel: 'gaussian', colorRamp: 'ForestEmerald' },
          'Dataset Pasca Impor'
        );
        setLatestKDE(kde);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleResetDummy = () => {
    resetToDefaultDummyData();
    const reloaded = getStoredObjects();
    setObjects(reloaded);
    if (reloaded.length >= 4) {
      const nna = computeNNA(reloaded, undefined, 'Dataset Simulasi PKL');
      setLatestNNA(nna);
      const kde = computeKDE(
        reloaded,
        { gridResolution: 80, kernel: 'gaussian', colorRamp: 'ForestEmerald' },
        'Dataset Simulasi PKL'
      );
      setLatestKDE(kde);
    }
  };

  const handleRemoveDummy = () => {
    removeAllDummyObjects();
    const remaining = getStoredObjects();
    setObjects(remaining);
  };

  const handleRunNNA = (result: NNAResult) => {
    setLatestNNA(result);
    addAnalysisHistory({
      type: 'NNA',
      title: `Analisis NNA: ${result.datasetLabel}`,
      pointsCount: result.totalPoints,
      summary: `R = ${result.nnaIndexR} (${result.patternResult}), Z = ${result.zScore}`,
    });
    setHistory(getAnalysisHistory());
  };

  const handleRunKDE = (result: KDEResult) => {
    setLatestKDE(result);
    addAnalysisHistory({
      type: 'KDE',
      title: `Analisis KDE: ${result.datasetLabel}`,
      pointsCount: result.pointsCount,
      summary: `Bandwidth ${result.bandwidthMeters}m, ${result.hotspotsCount} sel hotspot (${result.gridResolution}x${result.gridResolution})`,
    });
    setHistory(getAnalysisHistory());
  };

  // Handler Laporan Pengaduan Warga
  const handleSubmitCitizenReport = (report: Omit<CitizenReport, 'id' | 'createdAt' | 'status'>) => {
    const created = addCitizenReport(report);
    setCitizenReports([created, ...citizenReports]);
  };

  // Pihak Dinas Menyetujui Laporan Warga & Mengubahnya Menjadi Titik Pantau / TPS Resmi di Peta
  const handleApproveReportAsObject = (report: CitizenReport) => {
    updateCitizenReportStatus(report.id, 'Disetujui DLH');
    setCitizenReports(
      citizenReports.map((r) => (r.id === report.id ? { ...r, status: 'Disetujui DLH' } : r))
    );

    handleAddObject({
      name: report.title,
      category: report.category.includes('TPS3R')
        ? 'TPS3R (Reuse, Reduce, Recycle)'
        : 'Tempat Penampungan Sementara (TPS)',
      address: report.address,
      regency: 'Kota Bandung',
      district: report.district,
      village: 'Hasil Pengaduan Warga',
      latitude: report.latitude,
      longitude: report.longitude,
      geom_type: 'Point',
      source: `Aspirasi Warga: ${report.citizenName}`,
      recorded_at: new Date().toISOString().split('T')[0],
      notes: `Pengaduan warga ID: ${report.id} - ${report.description}`,
      is_dummy: false,
    });
  };

  // Handler Navigasi Tab dengan Proteksi Hak Akses (Tuan Rumah vs Tamu)
  const handleTabNavigate = (tab: ActiveTab) => {
    const adminOnlyTabs: ActiveTab[] = ['dashboard', 'data', 'nna', 'kde', 'komparasi', 'laporan'];
    if (userSession.role === 'penduduk' && adminOnlyTabs.includes(tab)) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabNavigate}
        totalObjects={objects.length}
        dummyCount={dummyCount}
        userSession={userSession}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        citizenReportsCount={citizenReports.length}
      />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          dummyCount={dummyCount}
          totalObjects={objects.length}
          userSession={userSession}
          onOpenAddModal={() => {
            if (userSession.role === 'penduduk') {
              setIsLoginModalOpen(true);
            } else {
              handleTabNavigate('data');
            }
          }}
          onNavigate={handleTabNavigate}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* View Konten Berdasarkan Tab */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Tampilan Khusus Penduduk / Tab Warga */}
          {activeTab === 'warga' && userSession.role === 'penduduk' && (
            <CitizenPortalView
              objects={objects}
              userSession={userSession}
              reports={citizenReports}
              onSubmitReport={handleSubmitCitizenReport}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}

          {/* Jika Pihak Dinas membuka tab Aspirasi Warga */}
          {activeTab === 'warga' && userSession.role === 'dinas' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-emerald-600" />
                    Manajemen Aspirasi & Pengaduan Warga (Crowdsourcing GIS)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tinjau laporan timbunan sampah liar atau usulan fasilitas dari penduduk dan setujui untuk dimasukkan ke peta resmi DLH.
                  </p>
                </div>
                <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                  {citizenReports.length} Laporan Masuk
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                  Daftar Pengaduan Masuk dari Penduduk
                </div>
                <div className="divide-y divide-slate-100">
                  {citizenReports.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Belum ada laporan atau pengaduan baru dari warga.
                    </div>
                  ) : (
                    citizenReports.map((rep) => (
                      <div key={rep.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{rep.title}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rep.status === 'Disetujui DLH'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rep.status}
                            </span>
                          </div>
                          <p className="text-slate-600">
                            <strong>Pelapor:</strong> {rep.citizenName} ({rep.phone || '-'}) &bull; <strong>Lokasi:</strong> {rep.address}, Kec. {rep.district}
                          </p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            Koordinat: {rep.latitude.toFixed(5)}, {rep.longitude.toFixed(5)}
                          </p>
                          <p className="text-slate-600 bg-slate-100 p-2 rounded-lg text-[11px] mt-1">
                            "{rep.description}"
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {rep.status !== 'Disetujui DLH' ? (
                            <button
                              onClick={() => handleApproveReportAsObject(rep)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui & Tambah ke Peta SIG</span>
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Telah Masuk ke Peta
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proteksi Akses Tamu: Jika Tamu mencoba membuka modul admin */}
          {userSession.role === 'penduduk' &&
            ['dashboard', 'data', 'nna', 'kde', 'komparasi', 'laporan'].includes(activeTab) && (
              <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Akses Khusus Pihak Dinas (Tuan Rumah)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Anda sedang berada dalam mode <strong>Tamu (Warga Masyarakat)</strong>. Modul manajemen data master (CRUD), impor file spasial, dan kalkulasi analisis spasial NNA/KDE dibatasi hanya untuk akun Petugas Dinas terverifikasi di basis data MySQL.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login Petugas Dinas (Tuan Rumah)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('warga')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                  >
                    Kembali ke Portal Warga
                  </button>
                </div>
              </div>
            )}

          {activeTab === 'dashboard' && userSession.role === 'dinas' && (
            <DashboardView
              objects={objects}
              latestNNA={latestNNA}
              latestKDE={latestKDE}
              history={history}
              onNavigate={handleTabNavigate}
              onOpenAddModal={() => handleTabNavigate('data')}
            />
          )}

          {activeTab === 'peta' && (
            <MapFullView
              objects={objects}
              nnaPairs={latestNNA ? latestNNA.nearestPairs : null}
              kdeResult={latestKDE}
              onSelectObject={(obj) => {
                setSelectedObjectId(obj.id);
              }}
            />
          )}

          {activeTab === 'data' && userSession.role === 'dinas' && (
            <DataManagementView
              objects={objects}
              onAddObject={handleAddObject}
              onUpdateObject={handleUpdateObject}
              onDeleteObject={handleDeleteObject}
              onImportObjects={handleImportObjects}
              onSelectObjectOnMap={(obj) => {
                setSelectedObjectId(obj.id);
                handleTabNavigate('peta');
              }}
              onRemoveAllDummy={handleRemoveDummy}
              onResetDummy={handleResetDummy}
            />
          )}

          {activeTab === 'nna' && userSession.role === 'dinas' && (
            <NNAAnalysisView
              objects={objects}
              currentResult={latestNNA}
              onRunNNA={handleRunNNA}
            />
          )}

          {activeTab === 'kde' && userSession.role === 'dinas' && (
            <KDEAnalysisView
              objects={objects}
              currentResult={latestKDE}
              onRunKDE={handleRunKDE}
            />
          )}

          {activeTab === 'komparasi' && userSession.role === 'dinas' && (
            <ComparisonView
              objects={objects}
              nnaResult={latestNNA}
              kdeResult={latestKDE}
              onNavigate={handleTabNavigate}
            />
          )}

          {activeTab === 'laporan' && userSession.role === 'dinas' && (
            <ReportView
              objects={objects}
              nnaResult={latestNNA}
              kdeResult={latestKDE}
              onNavigate={handleTabNavigate}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsGuideView
              totalObjects={objects.length}
              dummyCount={dummyCount}
              onResetDummy={handleResetDummy}
              onRemoveDummy={handleRemoveDummy}
            />
          )}
        </main>
      </div>

      {/* Modal Form Login Role Switcher */}
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        currentSession={userSession}
      />
    </div>
  );
}
