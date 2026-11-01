import React, { useState, useMemo } from 'react';
import { EnvironmentalObject, ObjectCategory } from '../types/gis';
import { CATEGORIES_LIST } from '../data/dummyData';
import {
  parseCsvText,
  parseXlsxBuffer,
  parseGeoJson,
  exportObjectsToCsv,
  exportObjectsToGeoJson
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
  ArrowUpDown
} from 'lucide-react';

interface DataManagementViewProps {
  objects: EnvironmentalObject[];
  onAddObject: (obj: Omit<EnvironmentalObject, 'id'>) => void;
  onUpdateObject: (id: string, patch: Partial<EnvironmentalObject>) => void;
  onDeleteObject: (id: string) => void;
  onImportObjects: (newObjs: Omit<EnvironmentalObject, 'id'>[]) => void;
  onSelectObjectOnMap: (obj: EnvironmentalObject) => void;
  onRemoveAllDummy: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  objects,
  onAddObject,
  onUpdateObject,
  onDeleteObject,
  onImportObjects,
  onSelectObjectOnMap,
  onRemoveAllDummy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [filterDummy, setFilterDummy] = useState<'ALL' | 'DUMMY' | 'OFFICIAL'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'category' | 'recorded_at' | 'district'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Handle File Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let parsed: Omit<EnvironmentalObject, 'id'>[] = [];

      if (ext === 'csv') {
        const text = await file.text();
        parsed = parseCsvText(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        parsed = parseXlsxBuffer(buffer);
      } else if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        parsed = parseGeoJson(text);
      } else {
        throw new Error('Format file tidak didukung. Harap pilih file .csv, .xlsx, atau .geojson.');
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

  return (
    <div className="space-y-5">
      {/* Notifikasi Impor */}
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
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
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

      {/* Action Bar Atas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manajemen Data Objek Lingkungan</h2>
          <p className="text-xs text-slate-500">
            Kelola data titik pantau, TPS, bank sampah, dan fasilitas konservasi DLH (Total: {objects.length} data).
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

          {/* Filter Status Data */}
          <div>
            <select
              value={filterDummy}
              onChange={(e) => setFilterDummy(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status (Dummy & Resmi)</option>
              <option value="DUMMY">Hanya Data Simulasi PKL</option>
              <option value="OFFICIAL">Hanya Data Resmi DLH</option>
            </select>
          </div>
        </div>

        {/* Informasi Jumlah Ditemukan */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredObjects.length}</strong> dari <strong>{objects.length}</strong> objek terdaftar.
          </span>
          {objects.some((o) => o.is_dummy) && (
            <button
              onClick={onRemoveAllDummy}
              className="text-amber-700 hover:text-amber-800 hover:underline font-medium"
            >
              Hapus seluruh data simulasi dummy
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Objek Lingkungan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama & ID Objek</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('category');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kategori</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('district');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Wilayah (Kec./Kel.)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Koordinat WGS84</th>
                <th className="px-4 py-3">Sumber Data</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredObjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada objek yang sesuai dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredObjects.map((obj) => (
                  <tr key={obj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{obj.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <code>{obj.id}</code>
                        {obj.is_dummy ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Simulasi
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Resmi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {obj.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{obj.district || '-'}</div>
                      <div className="text-[11px] text-slate-400">{obj.village || '-'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {obj.latitude.toFixed(5)}, {obj.longitude.toFixed(5)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      <div>{obj.source}</div>
                      <div className="text-slate-400">{obj.recorded_at}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectObjectOnMap(obj)}
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Lihat Titik di Peta"
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingObject ? 'Ubah Data Objek Lingkungan' : 'Tambah Objek Geografis Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

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
                  {editingObject ? 'Perbarui Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
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
