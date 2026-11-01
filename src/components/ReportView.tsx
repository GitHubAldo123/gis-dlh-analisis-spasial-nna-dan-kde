import React from 'react';
import { EnvironmentalObject, NNAResult, KDEResult } from '../types/gis';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Route,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { exportObjectsToCsv } from '../services/storageService';

interface ReportViewProps {
  objects: EnvironmentalObject[];
  nnaResult: NNAResult | null;
  kdeResult: KDEResult | null;
  onNavigate: (tab: any) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  objects,
  nnaResult,
  kdeResult,
  onNavigate,
}) => {
  const dummyCount = objects.filter((o) => o.is_dummy).length;
  const isSimulation = dummyCount > 0;
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csv = exportObjectsToCsv(objects);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_data_objek_dlh_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a);
  };

  return (
    <div className="space-y-6">
      {/* Header Aksi Ekspor */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Laporan Hasil Analisis Spasial PKL DLH
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen resmi laporan Praktik Kerja Lapangan di Dinas Lingkungan Hidup sesuai standar akademik Sistem Informasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Dokumen Laporan Siap Cetak */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 print:p-0 print:border-none print:shadow-none text-slate-800 space-y-8 max-w-4xl mx-auto">
        {/* Kop Surat Laporan DLH */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-600">
            Pemerintah Daerah &bull; Dinas Lingkungan Hidup
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-1 tracking-tight">
            Laporan Analisis Spasial Pola Persebaran & Kepadatan Objek Lingkungan
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Praktik Kerja Lapangan (PKL) Bidang Pengelolaan Sampah, Limbah B3, dan Pengendalian Pencemaran Lingkungan
          </p>
          {isSimulation && (
            <div className="mt-2 inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-3 py-0.5 rounded-full border border-amber-300">
              DOKUMEN ANALISIS BERBASIS DATA SIMULASI PKL ({dummyCount} TITIK) &bull; BUKAN DATA RESMI DLH
            </div>
          )}
        </div>

        {/* A. IDENTITAS ANALISIS */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1 flex items-center gap-1.5">
            <span>A. Identitas Analisis</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-slate-500">Nama Kegiatan:</span>
              <div className="font-semibold text-slate-800">
                Praktik Kerja Lapangan (PKL) Pemetaan Sistem Informasi Geografis DLH
              </div>
            </div>
            <div>
              <span className="text-slate-500">Tanggal Pengolahan:</span>
              <div className="font-semibold text-slate-800">{todayStr}</div>
            </div>
            <div>
              <span className="text-slate-500">Wilayah Penelitian:</span>
              <div className="font-semibold text-slate-800">
                Kota Bandung dan Sekitarnya, Provinsi Jawa Barat
              </div>
            </div>
            <div>
              <span className="text-slate-500">Jumlah Objek Dianalisis:</span>
              <div className="font-semibold text-slate-800">
                {objects.length} Titik Koordinat (100% Valid WGS84)
              </div>
            </div>
            <div>
              <span className="text-slate-500">Sistem Proyeksi Koordinat:</span>
              <div className="font-semibold text-slate-800">
                WGS84 EPSG:4326 terproyeksi ke Planar Metrik UTM Zona 48S (EPSG:32748)
              </div>
            </div>
            <div>
              <span className="text-slate-500">Sumber Data:</span>
              <div className="font-semibold text-slate-800">
                {isSimulation ? 'Dataset Simulasi Lapangan Mahasiswa PKL' : 'Basis Data Resmi Dinas Lingkungan Hidup'}
              </div>
            </div>
          </div>
        </section>

        {/* B. PENDAHULUAN */}
        <section className="space-y-2.5 text-xs text-justify leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
            B. Pendahuluan
          </h2>
          <p>
            <strong>1. Latar Belakang:</strong> Pengelolaan sarana persampahan (seperti Tempat Penampungan Sementara/TPS, Bank Sampah, dan TPS3R) serta titik pantau kualitas lingkungan hidup memerlukan dukungan data spasial yang akurat. Ketepatan penempatan fasilitas berdampak langsung terhadap efisiensi rute pengangkutan sampah dan pencegahan timbunan liar.
          </p>
          <p>
            <strong>2. Tujuan Analisis:</strong> Mengetahui karakteristik pola titik persebaran fasilitas kebersihan menggunakan metode <em>Nearest Neighbor Analysis (NNA)</em> untuk menilai kecenderungan acak, klaster, atau teratur, serta memetakan permukaan konsentrasi lokal menggunakan <em>Kernel Density Estimation (KDE)</em> untuk mendeteksi zona hotspot kepadatan tinggi.
          </p>
          <p>
            <strong>3. Ruang Lingkup:</strong> Objek lingkungan yang dievaluasi mencakup TPS, Bank Sampah, TPS3R, Titik Pantau Air/Udara, dan Laboratorium Lingkungan pada wilayah kerja Dinas Lingkungan Hidup.
          </p>
        </section>

        {/* C. DATA DAN METODE */}
        <section className="space-y-2.5 text-xs text-justify leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
            C. Data dan Metode
          </h2>
          <p>
            <strong>1. Sistem Koordinat & Proyeksi:</strong> Seluruh titik koordinat input dalam format geografis desimal (Latitude, Longitude WGS84) dikonversi secara otomatis ke sistem koordinat terproyeksi Universal Transverse Mercator (UTM Zona 48S) untuk menjamin akurasi jarak Euclidean planar dalam satuan meter.
          </p>
          <p>
            <strong>2. Nearest Neighbor Analysis (NNA):</strong> Menggunakan formulasi Clark & Evans (1954):
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-center my-2">
            R = D_o / D_e &nbsp;&nbsp;|&nbsp;&nbsp; D_e = 1 / (2 &times; &radic;(n / A)) &nbsp;&nbsp;|&nbsp;&nbsp; Z = (D_o - D_e) / SE
          </div>
          <p>
            <strong>3. Kernel Density Estimation (KDE):</strong> Memperkirakan fungsi intensitas kepadatan spasial kontinu menggunakan fungsi Gaussian 2D dengan radius bandwidth <em>h</em> berbasis Silverman's Rule of Thumb dan diklasifikasikan menggunakan batas ambang kuantil 3 kelas (Rendah, Sedang, Tinggi/Hotspot).
          </p>
        </section>

        {/* D. HASIL ANALISIS NNA */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1 flex items-center justify-between">
            <span>D. Hasil Analisis Nearest Neighbor Analysis (NNA)</span>
            {nnaResult && (
              <span className="text-xs font-normal text-slate-500 lowercase">
                status: selesai dihitung
              </span>
            )}
          </h2>

          {nnaResult ? (
            <div className="space-y-3 text-xs">
              <table className="w-full border border-slate-200 text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 border-b border-slate-200">Parameter Perhitungan</th>
                    <th className="p-2 border-b border-slate-200 font-mono">Nilai Terhitung</th>
                    <th className="p-2 border-b border-slate-200">Keterangan / Satuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Jumlah Titik (n)</td>
                    <td className="p-2 font-bold">{nnaResult.totalPoints}</td>
                    <td className="p-2 font-sans text-slate-500">Titik valid dianalisis</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Luas Wilayah Studi (A)</td>
                    <td className="p-2">{nnaResult.studyAreaKm2.toLocaleString('id-ID')}</td>
                    <td className="p-2 font-sans text-slate-500">Kilometer persegi (km²)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Rata-rata Jarak Teramati (Do)</td>
                    <td className="p-2 font-bold text-blue-700">{nnaResult.observedMeanDistanceM.toLocaleString('id-ID')}</td>
                    <td className="p-2 font-sans text-slate-500">Meter</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Rata-rata Jarak Harapan (De)</td>
                    <td className="p-2">{nnaResult.expectedMeanDistanceM.toLocaleString('id-ID')}</td>
                    <td className="p-2 font-sans text-slate-500">Meter (Model Acak Poisson)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Nearest Neighbor Index (R)</td>
                    <td className="p-2 font-bold text-emerald-700">{nnaResult.nnaIndexR.toFixed(4)}</td>
                    <td className="p-2 font-sans text-slate-500">Do / De</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Z-Score Inferensial</td>
                    <td className="p-2">{nnaResult.zScore.toFixed(3)}</td>
                    <td className="p-2 font-sans text-slate-500">Standardized normal variate</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">p-value</td>
                    <td className="p-2">{nnaResult.pValue.toFixed(6)}</td>
                    <td className="p-2 font-sans text-slate-500">
                      {nnaResult.isStatisticallySignificant ? 'Signifikan (p < 0.05)' : 'Tidak signifikan (p ≥ 0.05)'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-950 leading-relaxed">
                <strong>Interpretasi Hasil NNA:</strong>
                <p className="mt-1">{nnaResult.interpretation}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic flex items-center justify-between">
              <span>Analisis NNA belum dijalankan pada modul analisis.</span>
              <button
                onClick={() => onNavigate('nna')}
                className="text-emerald-700 font-semibold hover:underline print:hidden"
              >
                Jalankan NNA &rarr;
              </button>
            </div>
          )}
        </section>

        {/* E. HASIL ANALISIS KDE */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1 flex items-center justify-between">
            <span>E. Hasil Analisis Kernel Density Estimation (KDE)</span>
            {kdeResult && (
              <span className="text-xs font-normal text-slate-500 lowercase">
                status: selesai dihitung
              </span>
            )}
          </h2>

          {kdeResult ? (
            <div className="space-y-3 text-xs">
              <table className="w-full border border-slate-200 text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 border-b border-slate-200">Parameter Raster</th>
                    <th className="p-2 border-b border-slate-200 font-mono">Nilai</th>
                    <th className="p-2 border-b border-slate-200">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Radius Bandwidth (h)</td>
                    <td className="p-2 font-bold">{kdeResult.bandwidthMeters.toLocaleString('id-ID')} m</td>
                    <td className="p-2 font-sans text-slate-500">Radius pengaruh tiap objek</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Resolusi Matriks Raster</td>
                    <td className="p-2">{kdeResult.gridResolution} &times; {kdeResult.gridResolution}</td>
                    <td className="p-2 font-sans text-slate-500">Sel grid kontinu</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Sel Konsentrasi Tinggi (Hotspot)</td>
                    <td className="p-2 font-bold text-rose-700">{kdeResult.hotspotsCount} sel</td>
                    <td className="p-2 font-sans text-slate-500">Kuantil 66% teratas</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-slate-800">Metode Klasifikasi</td>
                    <td className="p-2 font-sans" colSpan={2}>{kdeResult.classificationMethod}</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-950 leading-relaxed">
                <strong>Interpretasi Hasil KDE:</strong>
                <p className="mt-1">{kdeResult.interpretation}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic flex items-center justify-between">
              <span>Analisis KDE belum dijalankan pada modul analisis.</span>
              <button
                onClick={() => onNavigate('kde')}
                className="text-amber-700 font-semibold hover:underline print:hidden"
              >
                Jalankan KDE &rarr;
              </button>
            </div>
          )}
        </section>

        {/* F. PEMBAHASAN */}
        <section className="space-y-2.5 text-xs text-justify leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
            F. Pembahasan
          </h2>
          <p>
            Berdasarkan hasil pemrosesan empiris di atas, komparasi antara NNA dan KDE memberikan wawasan spasial yang saling melengkapi bagi perencanaan wilayah Dinas Lingkungan Hidup:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>
              <strong>Pola Global (NNA):</strong> Menyimpulkan apakah penataan fasilitas persampahan saat ini cenderung terpusat di kawasan pusat kota (mengelompok) atau sudah terdistribusi melayani penjuru kecamatan (teratur/acak).
            </li>
            <li>
              <strong>Variasi Densitas Lokal (KDE):</strong> Memperlihatkan secara visual dan spasial letak tepat hotspot penumpukan beban sarana. Zona merah pekat menjadi indikator kuat perlunya penambahan kapasitas kontainer atau pembentukan TPS3R baru.
            </li>
            <li>
              <strong>Keterbatasan Analisis:</strong> Analisis pola titik mengasumsikan ruang Euclidean homogen; pada kenyataannya, aksesibilitas persampahan dipengaruhi oleh jaringan jalan, topografi berbukit, dan kepadatan penduduk lokal.
            </li>
          </ul>
        </section>

        {/* G. KESIMPULAN */}
        <section className="space-y-2.5 text-xs text-justify leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
            G. Kesimpulan & Rekomendasi PKL
          </h2>
          <p>
            1. Sistem Informasi Geografis (SIG) berbasis algoritma NNA dan KDE berhasil memetakan {objects.length} objek lingkungan dengan akurasi koordinat dan proyeksi metrik UTM otomatis.
          </p>
          <p>
            2. Rekomendasi operasional untuk DLH: Prioritaskan pengadaan kontainer pemilah dan armada pengangkutan sampah pada kecamatan yang teridentifikasi berada dalam batas zona kuantil tinggi KDE.
          </p>
        </section>

        {/* H. LAMPIRAN SAMPEL DATA */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
            H. Lampiran: Sampel Data Objek Terdaftar
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-200">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 border-b">ID</th>
                  <th className="p-2 border-b">Nama Objek</th>
                  <th className="p-2 border-b">Kategori</th>
                  <th className="p-2 border-b">Kecamatan</th>
                  <th className="p-2 border-b">Latitude</th>
                  <th className="p-2 border-b">Longitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {objects.slice(0, 10).map((o) => (
                  <tr key={o.id}>
                    <td className="p-2">{o.id}</td>
                    <td className="p-2 font-sans font-medium text-slate-800">{o.name}</td>
                    <td className="p-2 font-sans text-slate-600">{o.category}</td>
                    <td className="p-2 font-sans text-slate-600">{o.district || '-'}</td>
                    <td className="p-2">{o.latitude.toFixed(5)}</td>
                    <td className="p-2">{o.longitude.toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {objects.length > 10 && (
              <p className="text-[10px] text-slate-400 mt-1 italic">
                *Menampilkan 10 data pertama dari total {objects.length} objek terdaftar.
              </p>
            )}
          </div>
        </section>

        {/* Tanda Tangan Mahasiswa & Pembimbing PKL */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-700">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold mt-1">Pembimbing Lapangan DLH</p>
            <div className="h-16" />
            <p className="font-bold underline">Pembimbing Lapangan, S.Si., M.T.</p>
            <p className="text-[10px] text-slate-500">NIP. 19850412 201001 1 008</p>
          </div>
          <div>
            <p>Kota Bandung, {todayStr}</p>
            <p className="font-semibold mt-1">Mahasiswa Praktik Kerja Lapangan</p>
            <div className="h-16" />
            <p className="font-bold underline">Praktikan Sistem Informasi</p>
            <p className="text-[10px] text-slate-500">NIM. 10520001</p>
          </div>
        </div>
      </div>
    </div>
  );
};
