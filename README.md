# GIS DLH - Analisis Spasial NNA dan KDE

Sistem Informasi Geografis (SIG) berbasis web untuk mendukung kegiatan **Praktik Kerja Lapangan (PKL) di Dinas Lingkungan Hidup (DLH)**. Aplikasi ini menyediakan fungsionalitas manajemen objek geografis lingkungan (CRUD, CSV/Excel/GeoJSON import & export), analisis pola persebaran spasial menggunakan **Nearest Neighbor Analysis (NNA)** dengan proyeksi planar metrik otomatis (UTM), estimasi kepadatan kontinu menggunakan **Kernel Density Estimation (KDE)** dengan overlay raster 2D kontinu, dashboard analitik, dan generator dokumen **Laporan PKL** berstandar akademik.

---

## 1. Fitur Utama Aplikasi

1. **Dashboard Eksekutif SIG DLH:**
   - Rekapitulasi jumlah objek terdaftar, validitas koordinat WGS84, dan persentase data simulasi vs data resmi.
   - Ringkasan indikator NNA (R, pola, Z-score) dan hotspot raster KDE.
   - Peta pratinjau spasial dengan interaksi titik dan grafik distribusi kategori sarana.
2. **Peta Interaktif (Leaflet.js):**
   - Dukungan multi-basemap: OpenStreetMap Standard, Topografi Kontur, dan Citra Satelit Esri.
   - Marker kategori bertema khusus (TPS, Bank Sampah, TPS3R, Titik Pantau Air/Udara, SPKU, Laboratorium, RTH).
   - Layer control untuk menyalakan/mematikan titik, garis vektor tetangga terdekat, dan raster kontinu KDE.
   - Fitur impor batas administrasi GeoJSON mandiri.
3. **Manajemen Data Objek (CRUD & Impor/Ekspor):**
   - Tambah data manual dengan validasi koordinat lintang/bujur dan pemilihan lokasi di peta.
   - Ubah dan hapus data objek dengan konfirmasi keamanan.
   - Pencarian cerdas, penyortiran, dan filter multi-level (Kategori, Kecamatan, Status Data).
   - Impor massal berkas `.csv`, `.xlsx`, dan `.geojson`.
   - Ekspor data hasil olahan ke format `.csv` dan `.geojson` (kompatibel langsung dengan QGIS).
4. **Modul Nearest Neighbor Analysis (NNA):**
   - Proyeksi otomatis WGS84 ke sistem planar metrik UTM (Universal Transverse Mercator Zona 48S / 46-54).
   - Pencarian pasangan tetangga terdekat planar metrik $D_o$.
   - Perhitungan jarak acak harapan Poisson $D_e = \frac{1}{2\sqrt{\lambda}}$.
   - Rasio Clark & Evans: $R = \frac{D_o}{D_e}$.
   - Uji signifikansi statistik inferensial: Standard Error ($SE$), $Z$-score, dan dua arah $p$-value.
   - Visualisasi garis vektor putus-putus merah penghubung pasangan titik di peta Leaflet.
5. **Modul Kernel Density Estimation (KDE):**
   - Fungsi kernel Gaussian, Quartic, dan Epanechnikov 2D.
   - Radius bandwidth ($h$) otomatis adaptif (Silverman's Rule of Thumb) atau kustomisasi manual (meter).
   - Resolusi matriks sel grid dapat dikonfigurasi (60x60, 80x80, 100x100 sel).
   - Klasifikasi kuantil 3 kelas (Rendah, Sedang, Tinggi / Hotspot).
   - Pembangkitan raster dinamis transparan yang ditumpangkan langsung ke atas basemap koordinat.
6. **Modul Perbandingan Analisis (NNA vs KDE):**
   - Tampilan komparasi berdampingan (Dual Map).
   - Matriks sintesis metodologi (Skala makro/global vs mikro/lokal).
7. **Modul Laporan PKL DLH:**
   - Format laporan baku akademik (Seksi A s.d. H: Identitas, Pendahuluan, Data & Metode, Hasil NNA, Hasil KDE, Pembahasan, Kesimpulan, Lampiran Data).
   - Siap cetak ke PDF dengan styling print yang rapi tanpa tombol navigasi.
   - Ekspor data laporan ke format CSV.

---

## 2. Panduan Menjalankan di Windows Menggunakan Visual Studio Code

### Prasyarat:
- Komputer / Laptop dengan OS Windows 10/11.
- Telah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas) dan [Visual Studio Code](https://code.visualstudio.com/).

### Langkah-langkah:
1. **Buka Folder Proyek di VS Code:**
   - Buka VS Code.
   - Pilih menu **File > Open Folder...**, lalu pilih direktori proyek `gis-dlh`.
2. **Buka Terminal Terintegrasi:**
   - Tekan tombol `` Ctrl + ` `` pada keyboard (atau pilih menu **Terminal > New Terminal**).
3. **Instal Dependensi:**
   Jalankan perintah berikut pada terminal:
   ```bash
   npm install
   ```
4. **Menjalankan Unit Test (Validasi Algoritma Spasial):**
   Untuk menguji akurasi matematika proyeksi UTM, NNA, dan distribusi kurva normal standar:
   ```bash
   npx --yes tsx --test src/utils/spatialMath.test.ts
   ```
5. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
6. **Akses Aplikasi:**
   Buka peramban (Google Chrome, Microsoft Edge, atau Mozilla Firefox) dan buka tautan:
   ```text
   http://localhost:3000
   ```

---

## 3. Panduan Mengganti Data Simulasi dengan Data Resmi DLH

Secara default, aplikasi memuat 15 titik simulasi Kota Bandung (TPS, Bank Sampah, TPS3R, Titik Pantau Air/Udara) yang ditandai dengan lencana kuning `SIMULASI PKL`.

Untuk mengganti data tersebut dengan data resmi dari dinas:
1. **Menghapus Data Simulasi:**
   - Masuk ke menu **Pengaturan & Panduan** atau menu **Data Objek**.
   - Klik tombol **"Hapus Data Simulasi"**. Seluruh data dummy akan dihapus dari penyimpanan lokal.
2. **Menyiapkan Berkas Excel / CSV Resmi:**
   Buat file spreadsheet (`.xlsx` atau `.csv`) dengan format baris pertama (header) sebagai berikut:
   ```text
   name,category,latitude,longitude,district,village,address,source
   ```
   Contoh baris data:
   ```text
   TPS Karang Anyar,Tempat Penampungan Sementara (TPS),-6.9241,107.6015,Astanaanyar,Karanganyar,Jl. Astana Anyar No. 80,Survei Lapangan DLH 2024
   ```
3. **Mengunggah ke Sistem:**
   - Buka menu **Data Objek**.
   - Klik tombol **"Impor File"**, pilih berkas Excel atau CSV Anda.
   - Sistem secara otomatis memvalidasi koordinat, menyimpan data sebagai data resmi (`is_dummy: false`), dan secara real-time memperbarui peta serta hasil analisis NNA dan KDE.

---

## 4. Validasi Silang dengan Perangkat Lunak QGIS Desktop

Untuk keperluan laporan seminar PKL atau validasi hasil skripsi:
1. Di menu **Data Objek**, klik tombol **"GeoJSON"** untuk mengunduh seluruh data dalam format spasial standar OGC.
2. Buka software **QGIS Desktop**, pilih menu **Layer > Add Layer > Add Vector Layer...**, dan muat berkas `.geojson`.
3. Buka **Processing Toolbox > Vector Analysis > Nearest Neighbour Analysis** di QGIS untuk memvalidasi nilai indeks $R$ dan $Z$-score.
4. Buka **Processing Toolbox > Interpolation > Heatmap (Kernel Density Estimation)** di QGIS dengan radius bandwidth yang sama untuk memvalidasi permukaan kontur kepadatan.
