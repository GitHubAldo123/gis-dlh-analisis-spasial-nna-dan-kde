import React, { useState, useMemo } from 'react';
import { EnvironmentalObject, ObjectCategory } from '../types/gis';
import { CATEGORIES_LIST } from '../data/dummyData';
import {
  parseCsvText,
  parseXlsxBuffer,
  parseGeoJson,
  exportObjectsToCsv,
  exportObjectsToGeoJson,
  generateMySQLInsertQuery
} from '../services/storageService';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  MapPin,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Database,
  Code,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface DataManagementViewProps {
  objects: EnvironmentalObject[];
  onAddObject: (obj: Omit<EnvironmentalObject, 'id'>) => void;
  onUpdateObject: (id: string, patch: Partial<EnvironmentalObject>) => void;
  onDeleteObject: (id: string) => void;
  onImportObjects: (newObjs: Omit<EnvironmentalObject, 'id'>[]) => void;
  onSelectObjectOnMap: (obj: EnvironmentalObject) => void;
  onRemoveAllDummy: () => void;
  onResetDummy?: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  objects,
  onAddObject,
  onUpdateObject,
  onDeleteObject,
  onImportObjects,
  onSelectObjectOnMap,
  onRemoveAllDummy,
  onResetDummy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [filterDummy, setFilterDummy] = useState<'ALL' | 'DUMMY' | 'OFFICIAL'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'category' | 'recorded_at' | 'district'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [editingObject, setEditingObject] = useState<EnvironmentalObject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<EnvironmentalObject, 'id'>>({
    name: '',
    category: 'Tempat Penampungan Sementara (TPS)',
    address: '',
    regency: 'Kota Bandung',
    district: '',
    village: '',
    latitude: -6.9175,
    longitude: 107.6042,
    geom_type: 'Point',
    source: 'Survei Lapangan DLH',
    recorded_at: new Date().toISOString().split('T')[0],
    notes: '',
    is_dummy: false,
    capacity: '',
  });

  // Quick preset template filler
  const applyTemplate = (templateType: 'tps' | 'tps3r' | 'air' | 'spku') => {
    const today = new Date().toISOString().split('T')[0];
    if (templateType === 'tps') {
      setFormData({
        name: 'TPS 04 Pajajaran Sentral',
        category: 'Tempat Penampungan Sementara (TPS)',
        address: 'Jl. Pajajaran No. 45',
        regency: 'Kota Bandung',
        district: 'Cicendo',
        village: 'Pasirkaliki',
        latitude: -6.9075,
        longitude: 107.5985,
        geom_type: 'Point',
        source: 'Survei Lapangan DLH 2024',
        recorded_at: today,
        notes: 'Kontainer baja 10 m³, ritasi truk armroll 2x sehari',
        is_dummy: false,
        capacity: '10 m³/hari',
      });
    } else if (templateType === 'tps3r') {
      setFormData({
        name: 'TPS3R Cikutra Bersih Mandiri',
        category: 'TPS3R (Reuse, Reduce, Recycle)',
        address: 'Jl. Cikutra Barat No. 20',
        regency: 'Kota Bandung',
        district: 'Cibeunying Kaler',
        village: 'Cikutra',
        latitude: -6.8990,
        longitude: 107.6320,
        geom_type: 'Point',
        source: 'Survei Lapangan DLH 2024',
        recorded_at: today,
        notes: 'Fasilitas komposting organik dan pemilahan sampah warga',
        is_dummy: false,
        capacity: '2.5 ton/hari',
      });
    } else if (templateType === 'air') {
      setFormData({
        name: 'Titik Pantau Air Sungai Citepus Pasirkoja',
        category: 'Titik Pantau Kualitas Air',
        address: 'Jembatan Citepus Pasirkoja',
        regency: 'Kota Bandung',
        district: 'Bojongloa Kaler',
        village: 'Jamika',
        latitude: -6.9270,
        longitude: 107.5940,
        geom_type: 'Point',
        source: 'Survei Lapangan DLH 2024',
        recorded_at: today,
        notes: 'Monitoring rutin baku mutu kualitas air permukaan (BOD/COD)',
        is_dummy: false,
      });
    } else if (templateType === 'spku') {
      setFormData({
        name: 'SPKU Ujungberung Sentra',
        category: 'Stasiun Pemantau Kualitas Udara (SPKU)',
        address: 'Jl. A.H. Nasution No. 80',
        regency: 'Kota Bandung',
        district: 'Ujungberung',
        village: 'Cigending',
        latitude: -6.9180,
        longitude: 107.6950,
        geom_type: 'Point',
        source: 'Survei Lapangan DLH 2024',
        recorded_at: today,
        notes: 'Sensor otomatis telemetri ISPU & partikulat PM2.5 real-time',
        is_dummy: false,
      });
    }
  };

  // Unique Districts for filter dropdown
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    objects.forEach((o) => {
      if (o.district) set.add(o.district);
    });
    return Array.from(set).sort();
  }, [objects]);

  // Filtered & Sorted Objects
  const filteredObjects = useMemo(() => {
    return objects
      .filter((o) => {
        const matchesSearch =
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'ALL' || o.category === selectedCategory;
        const matchesDist = selectedDistrict === 'ALL' || o.district === selectedDistrict;
        const matchesDummy =
          filterDummy === 'ALL'
            ? true
            : filterDummy === 'DUMMY'
            ? o.is_dummy
            : !o.is_dummy;

        return matchesSearch && matchesCat && matchesDist && matchesDummy;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [objects, searchQuery, selectedCategory, selectedDistrict, filterDummy, sortField, sortAsc]);

  // Handle Form Submit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      alert('Latitude harus berada pada rentang -90 hingga 90.');
      return;
    }
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      alert('Longitude harus berada pada rentang -180 hingga 180.');
      return;
    }

    if (editingObject) {
      onUpdateObject(editingObject.id, formData);
      setEditingObject(null);
    } else {
      onAddObject(formData);
      setIsAddModalOpen(false);
    }

    // Reset Form
    setFormData({
      name: '',
      category: 'Tempat Penampungan Sementara (TPS)',
      address: '',
      regency: 'Kota Bandung',
      district: '',
      village: '',
      latitude: -6.9175,
      longitude: 107.6042,
      geom_type: 'Point',
      source: 'Survei Lapangan DLH',
      recorded_at: new Date().toISOString().split('T')[0],
      notes: '',
      is_dummy: false,
      capacity: '',
    });
  };

  const handleEditClick = (obj: EnvironmentalObject) => {
    setEditingObject(obj);
    setFormData({
      name: obj.name,
      category: obj.category,
      address: obj.address,
      regency: obj.regency,
      district: obj.district,
      village: obj.village,
      latitude: obj.latitude,
      longitude: obj.longitude,
      geom_type: obj.geom_type,
      source: obj.source,
      recorded_at: obj.recorded_at,
      notes: obj.notes || '',
      is_dummy: obj.is_dummy,
      capacity: obj.capacity || '',
    });
    setIsAddModalOpen(true);
  };

  // Handle Import File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();
      let parsed: Omit<EnvironmentalObject, 'id'>[] = [];

      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        parsed = parseCsvText(text);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        parsed = parseXlsxBuffer(buffer);
      } else if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const text = await file.text();
        parsed = parseGeoJson(text);
      } else {
        throw new Error('Format file tidak didukung. Gunakan CSV, Excel (.xlsx/.xls), atau GeoJSON.');
      }

      if (parsed.length === 0) {
        throw new Error('Tidak ada baris data koordinat valid yang dapat diekstrak.');
      }

      onImportObjects(parsed);
      setImportMessage({
        type: 'success',
        text: `Berhasil mengimpor ${parsed.length} objek lingkungan dari file "${file.name}".`,
      });
    } catch (err: any) {
      setImportMessage({
        type: 'error',
        text: `Gagal membaca file: ${err.message}`,
      });
    } finally {
      e.target.value = '';
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    const csvStr = exportObjectsToCsv(objects);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_objek_dlh_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeoJson = () => {
    const geoJsonStr = exportObjectsToGeoJson(objects);
    const blob = new Blob([geoJsonStr], { type: 'application/geo+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_objek_dlh_${new Date().toISOString().split('T')[0]}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickInsertAll = () => {
    if (onResetDummy) {
      onResetDummy();
      setImportMessage({
        type: 'success',
        text: 'Berhasil memasukkan paket data lengkap (32 Titik Koordinat Terverifikasi DLH Kota Bandung).',
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Notifikasi Impor / Insert */}
      {importMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border ${
            importMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {importMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importMessage.text}</span>
          </div>
          <button
            onClick={() => setImportMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Banner Cepat Insert Data */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl p-4 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-wider uppercase">
              Basis Data Spasial DLH
            </span>
            <span className="text-xs text-emerald-100">
              Total {objects.length} Titik Koordinat Aktif
            </span>
          </div>
          <h3 className="text-base font-bold">
            Pengelolaan & Insert Data Titik Koordinat Lingkungan Hidup
          </h3>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Anda dapat langsung menambahkan titik baru melalui formulir input, memuat paket lengkap 32 titik survei DLH Kota Bandung, atau menyalin query SQL untuk MySQL / phpMyAdmin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onResetDummy && (
            <button
              onClick={handleQuickInsertAll}
              className="px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition"
              title="Muat 32 Titik Koordinat Bandung Lengkap"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Insert 32 Titik Lengkap</span>
            </button>
          )}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 border border-white/20 transition"
            title="Lihat Query SQL INSERT untuk MySQL"
          >
            <Database className="w-4 h-4" />
            <span>Script SQL INSERT</span>
          </button>
        </div>
      </div>

      {/* Action Bar Atas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manajemen Data Objek Lingkungan</h2>
          <p className="text-xs text-slate-500">
            Kelola data titik pantau air, udara, TPS, TPS3R, dan konservasi DLH (Total: {objects.length} data).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition border border-slate-300/80">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Impor File</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.geojson,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300/80"
            title="Ekspor CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          {/* Export GeoJSON */}
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300/80"
            title="Ekspor GeoJSON untuk QGIS"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>GeoJSON</span>
          </button>

          {/* Tambah Manual Button */}
          <button
            onClick={() => {
              setEditingObject(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Objek</span>
          </button>
        </div>
      </div>

      {/* Filter dan Pencarian */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Kolom Pencarian */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, ID, alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kategori Objek</option>
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kecamatan */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kecamatan</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Sumber / Status */}
          <div>
            <select
              value={filterDummy}
              onChange={(e) => setFilterDummy(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Sumber Data</option>
              <option value="DUMMY">Data Simulasi PKL DLH ({objects.filter((o) => o.is_dummy).length})</option>
              <option value="OFFICIAL">Data Lapangan Resmi ({objects.filter((o) => !o.is_dummy).length})</option>
            </select>
          </div>
        </div>

        {/* Status Filter & Aksi Bulk */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-700">{filteredObjects.length}</span> dari{' '}
            <span className="font-bold text-slate-700">{objects.length}</span> objek lingkungan.
          </div>
          {objects.some((o) => o.is_dummy) && (
            <button
              onClick={onRemoveAllDummy}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Data Simulasi ({objects.filter((o) => o.is_dummy).length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Objek */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Nama Objek & ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('category'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Kategori</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('district'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Wilayah (Kecamatan / Kelurahan)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Koordinat (WGS84)</th>
                <th className="py-3 px-4">Kapasitas / Info</th>
                <th className="py-3 px-4 text-center">Status Data</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredObjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Tidak ada data objek yang sesuai</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredObjects.map((obj) => (
                  <tr key={obj.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700">
                        {obj.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 px-1 py-0.5 rounded">{obj.id}</span>
                        <span>•</span>
                        <span>{obj.recorded_at}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {obj.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {obj.district || '-'}, {obj.village || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{obj.address}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>Lat: {obj.latitude.toFixed(6)}</div>
                      <div>Lon: {obj.longitude.toFixed(6)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{obj.capacity || '-'}</div>
                      {obj.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={obj.notes}>
                          {obj.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {obj.is_dummy ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Simulasi PKL
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Resmi DLH
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectObjectOnMap(obj)}
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Lihat di Peta"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(obj)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Ubah Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(obj.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Objek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Ubah Objek */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingObject ? 'Ubah Data Objek Lingkungan' : 'Tambah Objek Geografis Baru (Insert Data)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Masukkan koordinat WGS84 lintang dan bujur untuk pemetaan dan analisis spasial DLH.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Quick Template Buttons for Fast Data Insertion */}
            {!editingObject && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mb-4">
                <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Isi Otomatis Menggunakan Template Survei:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('tps')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded border border-slate-200 transition"
                  >
                    + Template TPS Pajajaran
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('tps3r')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded border border-slate-200 transition"
                  >
                    + Template TPS3R Cikutra
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('air')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded border border-slate-200 transition"
                  >
                    + Template Pantau Air Citepus
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('spku')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded border border-slate-200 transition"
                  >
                    + Template SPKU Ujungberung
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Objek / Fasilitas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: TPS 05 Kebon Kelapa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Objek <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ObjectCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas / Volume (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Contoh: 12 m³/hari atau 500 kg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Latitude (Lintang Desimal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    placeholder="-6.9175"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Longitude (Bujur Desimal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    placeholder="107.6042"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Contoh: Andir"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Contoh: Kebon Jeruk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Kebon Jeruk No. 12"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sumber Data</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Survei Lapangan DLH"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pencatatan</label>
                  <input
                    type="date"
                    value={formData.recorded_at}
                    onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Kondisi fisik, jadwal operasional, dll."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingObject ? 'Perbarui Data' : 'Simpan Data (Insert)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Script INSERT SQL (MySQL / MariaDB / XAMPP) */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Query SQL INSERT (MySQL / phpMyAdmin)</h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Gunakan script query SQL berikut untuk memasukkan data seluruh titik koordinat ({objects.length} objek) secara langsung ke tabel <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">environmental_objects</code> di MySQL (XAMPP phpMyAdmin) atau SQLite backend.
            </p>
            <div className="relative flex-1 min-h-0 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-auto border border-slate-800">
              <pre>{generateMySQLInsertQuery(objects)}</pre>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                File skema lengkap: <code>backend_flask/database/gis_dlh_mysql.sql</code>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateMySQLInsertQuery(objects));
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 2500);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                {sqlCopied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                <span>{sqlCopied ? 'Query SQL Berhasil Disalin!' : 'Salin Query INSERT SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Konfirmasi Hapus Objek</h4>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus data dengan ID <code>{deleteConfirmId}</code>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteObject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
