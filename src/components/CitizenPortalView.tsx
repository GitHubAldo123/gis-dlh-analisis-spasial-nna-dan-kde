import React, { useState } from 'react';
import { EnvironmentalObject, CitizenReport, UserSession } from '../types/gis';
import { InteractiveMap } from './InteractiveMap';
import {
  Users,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Recycle,
  Sparkles,
  Info,
  Building2,
  Trash2,
  ShieldCheck,
  Search
} from 'lucide-react';

interface CitizenPortalViewProps {
  objects: EnvironmentalObject[];
  userSession: UserSession;
  reports: CitizenReport[];
  onSubmitReport: (report: Omit<CitizenReport, 'id' | 'createdAt' | 'status'>) => void;
  onOpenLoginModal: () => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  objects,
  userSession,
  reports,
  onSubmitReport,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'MAP' | 'LAPOR' | 'EDUKASI'>('MAP');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Laporan Warga
  const [formData, setFormData] = useState({
    title: '',
    category: 'Timbunan Sampah Liar',
    address: '',
    district: 'Coblong',
    latitude: -6.9142,
    longitude: 107.6110,
    description: '',
    phone: '',
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.address) {
      alert('Harap lengkapi judul laporan dan alamat lokasi.');
      return;
    }

    onSubmitReport({
      citizenName: userSession.name,
      phone: formData.phone || '081234567890',
      title: formData.title,
      category: formData.category,
      address: formData.address,
      district: formData.district,
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description,
    });

    setNotification('Laporan Anda berhasil dikirim ke sistem SIG Dinas Lingkungan Hidup untuk ditindaklanjuti petugas.');
    setFormData({
      title: '',
      category: 'Timbunan Sampah Liar',
      address: '',
      district: 'Coblong',
      latitude: -6.9142,
      longitude: 107.6110,
      description: '',
      phone: '',
    });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(coords.lat.toFixed(5)),
      longitude: parseFloat(coords.lng.toFixed(5)),
    }));
  };

  // Filter objek fasilitas untuk warga
  const filteredObjects = objects.filter((o) => {
    const matchesCat = selectedCategory === 'ALL' || o.category === selectedCategory;
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const tpsCount = objects.filter((o) => o.category.includes('TPS')).length;
  const bankSampahCount = objects.filter((o) => o.category.includes('Bank Sampah')).length;
  const tps3rCount = objects.filter((o) => o.category.includes('TPS3R')).length;

  return (
    <div className="space-y-6">
      {/* Banner Warga */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs px-3 py-1 rounded-full font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Portal Kependudukan & Layanan Lingkungan Hidup</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat Datang, {userSession.name}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
            Akses informasi lokasi Tempat Penampungan Sementara (TPS), Bank Sampah terdekat, pantau kualitas lingkungan, atau laporkan timbunan sampah liar di sekitar Anda.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'MAP'
                  ? 'bg-white text-blue-900 shadow-sm font-bold'
                  : 'bg-blue-600/50 hover:bg-blue-600 text-white'
              }`}
            >
              Cari Fasilitas Terdekat
            </button>
            <button
              onClick={() => setActiveTab('LAPOR')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'LAPOR'
                  ? 'bg-amber-400 text-slate-900 shadow-sm font-bold'
                  : 'bg-amber-500/40 hover:bg-amber-500 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Lapor Timbunan Sampah
            </button>
            <button
              onClick={() => setActiveTab('EDUKASI')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'EDUKASI'
                  ? 'bg-white text-blue-900 shadow-sm font-bold'
                  : 'bg-blue-600/50 hover:bg-blue-600 text-white'
              }`}
            >
              Panduan Pemilahan
            </button>
          </div>
        </div>

        {/* Info Ringkas Kartu */}
        <div className="hidden lg:flex absolute right-6 top-6 bottom-6 flex-col justify-center gap-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right min-w-[160px]">
            <div className="text-2xl font-bold">{tpsCount}</div>
            <div className="text-[11px] text-blue-200">TPS Aktif</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right min-w-[160px]">
            <div className="text-2xl font-bold">{bankSampahCount}</div>
            <div className="text-[11px] text-blue-200">Bank Sampah Warga</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Konten Tab 1: Peta Fasilitas untuk Warga */}
      {activeTab === 'MAP' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari TPS atau Bank Sampah terdekat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Fasilitas ({objects.length})</option>
                <option value="Tempat Penampungan Sementara (TPS)">TPS ({tpsCount})</option>
                <option value="Bank Sampah">Bank Sampah ({bankSampahCount})</option>
                <option value="TPS3R (Reuse, Reduce, Recycle)">TPS3R ({tps3rCount})</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Peta Lokasi Sarana Kebersihan & Titik Pantau Lingkungan
              </h3>
              <p className="text-xs text-slate-500">
                Klik ikon pada peta untuk melihat nama, alamat, kapasitas, dan jam operasional.
              </p>
            </div>

            <InteractiveMap
              objects={filteredObjects}
              showNnaLines={false}
              showKdeLayer={false}
              height="480px"
            />
          </div>
        </div>
      )}

      {/* Konten Tab 2: Formulir Pengaduan Sampah Liar / Usulan TPS */}
      {activeTab === 'LAPOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Input */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" />
                Formulir Pengaduan Sampah Liar / Usulan TPS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Laporkan timbunan sampah liar atau usulkan titik penempatan sarana pengolahan sampah di lingkungan Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Pengaduan / Usulan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Timbunan Sampah Liar di Pinggir Jalan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Masalah</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Timbunan Sampah Liar">Timbunan Sampah Liar</option>
                    <option value="Kontainer TPS Penuh/Rusak">Kontainer TPS Penuh/Rusak</option>
                    <option value="Usulan Fasilitas Pengelolaan">Usulan Fasilitas Bank Sampah / TPS3R</option>
                    <option value="Pencemaran Air/Bau Limbah">Pencemaran Air / Bau Limbah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Contoh: Coblong / Andir"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat / Patokan Lokasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Depan Gang Cikaso No. 12 dekat pos ronda..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude (Koordinat)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude (Koordinat)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP Pelapor</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxx"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ceritakan estimasi volume sampah, durasi penumpukan, atau foto lokasi..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pengaduan ke Dinas Lingkungan Hidup</span>
              </button>
            </form>
          </div>

          {/* Peta Pemilih Lokasi & Daftar Pengaduan */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Klik Peta untuk Menentukan Titik Laporan:
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              </div>
              <InteractiveMap
                objects={objects}
                showNnaLines={false}
                showKdeLayer={false}
                height="220px"
                allowClickToPick={true}
                onMapClick={handleMapClick}
              />
            </div>

            {/* Riwayat Pengaduan Warga */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Status Pengaduan Warga Terkirim ({reports.length})
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{rep.title}</span>
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
                    <p className="text-slate-600 text-[11px]">{rep.address} ({rep.district})</p>
                    <p className="text-slate-500 text-[11px] mt-1 italic">"{rep.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Tab 3: Edukasi Pemilahan Sampah */}
      {activeTab === 'EDUKASI' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Sampah Organik (Mudah Terurai)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sisa makanan, daun, sayuran, dan sisa dapur. Dapat diolah mandiri menjadi kompos atau pakan maggot BSF di TPS3R setempat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Sampah Anorganik (Daur Ulang)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Botol plastik PET, kardus, kaleng, kaca, dan kertas. Jangan dibuang ke TPS! Setorkan ke Bank Sampah RW untuk ditukar dengan saldo tabungan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Sampah B3 & Residu</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Baterai bekas, lampu neon, botol racun serangga, dan jarum suntik. Wajib dipisahkan secara khusus untuk diserahkan ke Laboratorium Lingkungan DLH.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
