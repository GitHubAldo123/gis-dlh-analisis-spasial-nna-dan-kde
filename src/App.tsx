/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EnvironmentalObject,
  NNAResult,
  KDEResult,
  AnalysisHistoryItem
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
  addAnalysisHistory
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [objects, setObjects] = useState<EnvironmentalObject[]>([]);
  const [latestNNA, setLatestNNA] = useState<NNAResult | null>(null);
  const [latestKDE, setLatestKDE] = useState<KDEResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Inisialisasi Data dari Storage
  useEffect(() => {
    const loaded = getStoredObjects();
    setObjects(loaded);
    setHistory(getAnalysisHistory());

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

  // Handler CRUD Objek
  const handleAddObject = (newObj: Omit<EnvironmentalObject, 'id'>) => {
    const created = addObject(newObj);
    const updated = [created, ...objects];
    setObjects(updated);

    // Auto recalculate analysis
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

    // Recompute NNA & KDE
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        totalObjects={objects.length}
        dummyCount={dummyCount}
      />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          dummyCount={dummyCount}
          totalObjects={objects.length}
          onOpenAddModal={() => {
            setActiveTab('data');
          }}
          onNavigate={setActiveTab}
        />

        {/* View Konten Berdasarkan Tab */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              objects={objects}
              latestNNA={latestNNA}
              latestKDE={latestKDE}
              history={history}
              onNavigate={setActiveTab}
              onOpenAddModal={() => setActiveTab('data')}
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

          {activeTab === 'data' && (
            <DataManagementView
              objects={objects}
              onAddObject={handleAddObject}
              onUpdateObject={handleUpdateObject}
              onDeleteObject={handleDeleteObject}
              onImportObjects={handleImportObjects}
              onSelectObjectOnMap={(obj) => {
                setSelectedObjectId(obj.id);
                setActiveTab('peta');
              }}
              onRemoveAllDummy={handleRemoveDummy}
            />
          )}

          {activeTab === 'nna' && (
            <NNAAnalysisView
              objects={objects}
              currentResult={latestNNA}
              onRunNNA={handleRunNNA}
            />
          )}

          {activeTab === 'kde' && (
            <KDEAnalysisView
              objects={objects}
              currentResult={latestKDE}
              onRunKDE={handleRunKDE}
            />
          )}

          {activeTab === 'komparasi' && (
            <ComparisonView
              objects={objects}
              nnaResult={latestNNA}
              kdeResult={latestKDE}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportView
              objects={objects}
              nnaResult={latestNNA}
              kdeResult={latestKDE}
              onNavigate={setActiveTab}
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
    </div>
  );
}
