import React, { useState } from 'react';
import {
  Settings,
  Terminal,
  FileSpreadsheet,
  Layers,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  ExternalLink,
  BookOpen,
  Server
} from 'lucide-react';
import { generateMySQLInsertQuery } from '../services/storageService';

interface SettingsGuideViewProps {
  totalObjects: number;
  dummyCount: number;
  onResetDummy: () => void;
  onRemoveDummy: () => void;
}

export const SettingsGuideView: React.FC<SettingsGuideViewProps> = ({
  totalObjects,
  dummyCount,
  onResetDummy,
  onRemoveDummy,
}) => {
  const [activeGuide, setActiveGuide] = useState<'WINDOWS_VSCODE' | 'SQL_DATABASE' | 'REPLACE_DATA' | 'QGIS'>('SQL_DATABASE');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Pengaturan & Panduan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          Pengaturan Sistem & Panduan Implementasi PKL
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dokumentasi teknis pengoperasian aplikasi di Windows (VS Code & XAMPP), database MySQL/MariaDB, dan analisis spasial DLH.
        </p>
      </div>

      {/* Kontrol Manajemen Data & Reset */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Manajemen Status Data Geospasial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 text-sm mb-1">
                Data Simulasi / Terverifikasi ({dummyCount} Objek)
              </div>
              <p className="text-slate-500 leading-relaxed mb-3">
                Memuat 32 titik koordinat terverifikasi Kota Bandung (TPS, TPS3R, Titik Pantau Air & Udara) untuk demonstrasi analisis NNA & KDE.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onResetDummy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Insert / Muat Ulang 32 Titik
              </button>
              {dummyCount > 0 && (
                <button
                  onClick={onRemoveDummy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Data Simulasi
                </button>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 text-sm mb-1">
                Data Lapangan Resmi DLH ({totalObjects - dummyCount} Objek)
              </div>
              <p className="text-slate-500 leading-relaxed mb-3">
                Objek yang diunggah melalui formulir impor Excel/CSV atau survei manual dengan verifikasi keabsahan data dinas.
              </p>
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              {totalObjects - dummyCount > 0
                ? `${totalObjects - dummyCount} titik resmi tersimpan permanen di penyimpanan lokal.`
                : 'Belum ada data resmi diunggah. Silakan gunakan menu Data Objek untuk menambah atau mengimpor file.'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigasi Panduan Teknis */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveGuide('SQL_DATABASE')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeGuide === 'SQL_DATABASE'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Database MySQL (XAMPP / phpMyAdmin)
        </button>
        <button
          onClick={() => setActiveGuide('WINDOWS_VSCODE')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeGuide === 'WINDOWS_VSCODE'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Panduan Windows & VS Code
        </button>
        <button
          onClick={() => setActiveGuide('REPLACE_DATA')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeGuide === 'REPLACE_DATA'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Panduan Ganti Data Resmi DLH
        </button>
        <button
          onClick={() => setActiveGuide('QGIS')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeGuide === 'QGIS'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Validasi Silang dengan QGIS
        </button>
      </div>

      {/* Konten Panduan Aktif */}
      {activeGuide === 'SQL_DATABASE' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Langkah Insert Data ke MySQL / MariaDB (XAMPP phpMyAdmin)
            </h3>
            <button
              onClick={() => copyToClipboard(generateMySQLInsertQuery(), 100)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedIndex === 100 ? 'Query Tersalin!' : 'Salin Semua Query INSERT SQL'}</span>
            </button>
          </div>

          <p className="text-slate-600">
            Berikut adalah cara memasukkan data seluruh objek geospasial ({totalObjects} titik) dan akun dinas resmi ke dalam MySQL melalui phpMyAdmin di komputer lokal:
          </p>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">1. Buka XAMPP Control Panel</div>
              <p className="text-slate-600">
                Jalankan service <strong>Apache</strong> dan <strong>MySQL</strong> pada XAMPP Control Panel hingga indikator berwarna hijau.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">2. Buka phpMyAdmin & Impor File Skema</div>
              <p className="text-slate-600 mb-2">
                Buka browser di alamat: <code className="text-emerald-700 font-bold">http://localhost/phpmyadmin</code>, buat database bernama <code className="text-emerald-700 font-bold">gis_dlh</code>, lalu pilih menu <strong>Import</strong> dan pilih file:
              </p>
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px]">
                backend_flask/database/gis_dlh_mysql.sql
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-800">3. Contoh Cuplikan Query INSERT MySQL</div>
                <span className="text-[10px] text-slate-400">Total 32 Baris Koordinat Valid</span>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56">
{`-- Cuplikan Query INSERT Tabel environmental_objects:
INSERT INTO \`environmental_objects\` 
(\`name\`, \`category\`, \`address\`, \`regency\`, \`district\`, \`village\`, \`latitude\`, \`longitude\`, \`geom_type\`, \`source\`, \`recorded_at\`, \`notes\`, \`is_dummy\`)
VALUES
('TPS 01 Kebon Jeruk Pasar', 'Tempat Penampungan Sementara (TPS)', 'Jl. Kebon Jati No. 12', 'Kota Bandung', 'Andir', 'Kebon Jeruk', -6.917500, 107.604200, 'Point', 'Survei Lapangan DLH 2024', '2024-04-10', 'Kapasitas 12 m3/hari', 1),
('TPS 02 Braga Heritage', 'Tempat Penampungan Sementara (TPS)', 'Jl. Braga No. 45', 'Kota Bandung', 'Sumur Bandung', 'Braga', -6.916800, 107.610500, 'Point', 'Survei Lapangan DLH 2024', '2024-04-10', 'Kontainer semi-tertutup', 1),
('TPS3R Barokah Mandiri Lestari', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Asia Afrika No. 100', 'Kota Bandung', 'Regol', 'Balonggede', -6.922100, 107.607400, 'Point', 'Survei Lapangan DLH 2024', '2024-04-15', 'Mesin pencacah dan komposter BSF', 1),
('Titik Pantau Air Sungai Cikapundung', 'Titik Pantau Kualitas Air', 'Jembatan Viaduct', 'Kota Bandung', 'Sumur Bandung', 'Babakan Ciamis', -6.913500, 107.609000, 'Point', 'Survei Lapangan DLH 2024', '2024-04-22', 'BOD, COD, TSS berkala', 1),
('Stasiun Pemantau Udara SPKU Alun-Alun', 'Stasiun Pemantau Kualitas Udara (SPKU)', 'Kompleks Alun-Alun Bandung', 'Kota Bandung', 'Regol', 'Balonggede', -6.921800, 107.602500, 'Point', 'Survei Lapangan DLH 2024', '2024-04-18', 'PM2.5, CO, SO2 real-time', 1);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeGuide === 'WINDOWS_VSCODE' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            Langkah Menjalankan Proyek di Windows Menggunakan Visual Studio Code
          </h3>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">1. Buka Proyek di Visual Studio Code</div>
              <p className="text-slate-600">
                Ekstrak folder proyek, jalankan VS Code, pilih menu <strong>File &gt; Open Folder...</strong>, lalu pilih folder proyek <code>gis-dlh</code>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">2. Buka Terminal Terintegrasi</div>
              <p className="text-slate-600">
                Tekan kombinasi tombol <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Ctrl + `</kbd> (Backtick) atau pilih menu <strong>Terminal &gt; New Terminal</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-800">3. Instal Dependensi Node / NPM</div>
                <button
                  onClick={() => copyToClipboard('npm install', 1)}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === 1 ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto">
                npm install
              </pre>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-800">4. Jalankan Server Pengembangan</div>
                <button
                  onClick={() => copyToClipboard('npm run dev', 2)}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === 2 ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto">
                npm run dev
              </pre>
              <p className="text-slate-500 mt-2">
                Buka peramban (Google Chrome / Edge) dan kunjungi alamat: <code className="text-emerald-700 font-bold">http://localhost:3000</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeGuide === 'REPLACE_DATA' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Panduan Mengganti Data Simulasi dengan Data Resmi DLH
          </h3>

          <p className="text-slate-600">
            Aplikasi ini telah dirancang untuk memfasilitasi penggantian data dummy menjadi data survei resmi DLH secara mulus:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Langkah 1: Hapus Data Simulasi</div>
              <p className="text-slate-600">
                Klik tombol <strong>"Hapus Data Simulasi"</strong> pada kartu di atas, atau masuk ke menu <strong>Data Objek</strong> dan klik tombol hapus simulasi.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Langkah 2: Siapkan Berkas Excel / CSV Resmi</div>
              <p className="text-slate-600 mb-2">
                Pastikan berkas spreadsheet Anda memiliki nama kolom (header) berikut pada baris pertama:
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] overflow-x-auto">
                name,category,latitude,longitude,district,village,address,source
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                <li><code>name</code>: Nama fasilitas atau titik sampling (contoh: TPS Babakan Surabaya).</li>
                <li><code>category</code>: Kategori (TPS, TPS3R, Titik Pantau Air, SPKU, dsb).</li>
                <li><code>latitude</code>: Lintang desimal WGS84 (contoh: -6.9175).</li>
                <li><code>longitude</code>: Bujur desimal WGS84 (contoh: 107.6042).</li>
                <li><code>district</code>: Nama Kecamatan.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Langkah 3: Unggah Berkas ke Sistem</div>
              <p className="text-slate-600">
                Buka menu <strong>Data Objek</strong>, klik tombol <strong>"Impor File"</strong>, lalu pilih berkas <code>.xlsx</code> atau <code>.csv</code> Anda. Sistem akan memvalidasi koordinat, menyimpan data secara permanen, dan memperbarui seluruh modul analisis.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeGuide === 'QGIS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Panduan Validasi Silang Menggunakan Perangkat Lunak QGIS Desktop
          </h3>

          <p className="text-slate-600">
            Untuk memperkuat laporan ilmiah PKL, Anda dapat mengekspor data dari aplikasi ini ke format GeoJSON dan memeriksanya di QGIS:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>
              Di menu <strong>Data Objek</strong>, klik tombol <strong>"GeoJSON"</strong> untuk mengunduh berkas vektor geospasial.
            </li>
            <li>
              Buka aplikasi <strong>QGIS Desktop</strong>.
            </li>
            <li>
              Pilih menu <strong>Layer &gt; Add Layer &gt; Add Vector Layer...</strong> dan pilih berkas GeoJSON yang baru diunduh.
            </li>
            <li>
              Untuk validasi NNA di QGIS: Buka <strong>Processing Toolbox &gt; Vector Analysis &gt; Nearest Neighbour Analysis</strong>. Bandingkan nilai rasio $R$ dan $Z$-score di QGIS dengan kalkulasi aplikasi web ini. Keduanya menggunakan proyeksi planar dan rumus Clark & Evans yang identik.
            </li>
            <li>
              Untuk validasi KDE di QGIS: Buka <strong>Processing Toolbox &gt; Interpolation &gt; Heatmap (Kernel Density Estimation)</strong>. Masukkan bandwidth yang sama (misal 1.000 meter) dan bandingkan gradasi hotspot.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
