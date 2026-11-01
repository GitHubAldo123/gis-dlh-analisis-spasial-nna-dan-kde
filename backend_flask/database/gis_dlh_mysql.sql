-- ========================================================
-- Database GIS DLH untuk MySQL / MariaDB (XAMPP phpMyAdmin)
-- Aplikasi: GIS DLH - Analisis Spasial NNA dan KDE
-- ========================================================
-- Catatan Peran Pengguna:
-- 1. Pihak Dinas (Tuan Rumah): Akun tersimpan resmi di tabel `dinas_users`.
--    Wajib login menggunakan NIP / Username / Email dan Password yang terdaftar.
--    Memiliki hak akses penuh: CRUD Objek, Eksekusi NNA & KDE, Laporan PKL, Verifikasi Pengaduan.
-- 2. Penduduk / Warga (Tamu / Guest): Masuk langsung 1-klik tanpa input data kependudukan.
--    Dapat melihat titik lokasi TPS & sampah di peta interaktif, rute terdekat, dan kirim pengaduan.
-- ========================================================

CREATE DATABASE IF NOT EXISTS `gis_dlh` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gis_dlh`;

-- --------------------------------------------------------
-- 1. Tabel Pengguna Resmi Pihak Dinas DLH (Tuan Rumah)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `dinas_users`;
CREATE TABLE `dinas_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(30) NOT NULL,
  `username` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `position` varchar(150) NOT NULL,
  `department` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'dinas_official',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_nip` (`nip`),
  UNIQUE KEY `idx_username` (`username`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Akun Dinas Resmi (Password default: 'dlhbandung2024')
INSERT INTO `dinas_users` (`id`, `nip`, `username`, `full_name`, `position`, `department`, `email`, `password_hash`, `role`, `is_active`) VALUES
(1, '19850412 201001 1 008', 'budi_dlh', 'Ir. Budi Santoso, M.Si.', 'Kepala Bidang Pengelolaan Sampah & B3', 'Dinas Lingkungan Hidup Kota Bandung', 'budi.santoso@dlh.bandung.go.id', SHA2('dlhbandung2024', 256), 'dinas_head', 1),
(2, '19920315 201802 2 004', 'siti_gis', 'Siti Rahmawati, S.T.', 'Analis SIG & Spasial Lingkungan', 'Seksi Pemantauan & Sistem Informasi Lingkungan', 'siti.rahma@dlh.bandung.go.id', SHA2('dlhbandung2024', 256), 'dinas_analyst', 1),
(3, '19900822 201601 1 012', 'admin_dlh', 'Hendra Wijaya, S.Kom.', 'Administrator Database & Server GIS', 'Pusat Data & Informasi DLH', 'admin.gis@dlh.bandung.go.id', SHA2('dlhbandung2024', 256), 'dinas_admin', 1),
(4, '19951105 202001 1 003', 'deni_lapangan', 'Deni Kurniawan, A.Md.', 'Pengawas Lapangan & Verifikator TPS', 'Seksi Operasional Persampahan DLH', 'deni.lapangan@dlh.bandung.go.id', SHA2('dlhbandung2024', 256), 'dinas_officer', 1);

-- --------------------------------------------------------
-- 2. Tabel Objek Lingkungan Hidup (TPS, TPS3R, Titik Pantau Air/Udara)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `environmental_objects`;
CREATE TABLE `environmental_objects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `regency` varchar(100) DEFAULT 'Kota Bandung',
  `district` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `geom_type` varchar(50) DEFAULT 'Point',
  `source` varchar(150) NOT NULL,
  `recorded_at` date NOT NULL,
  `notes` text DEFAULT NULL,
  `is_dummy` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Awal Objek Lingkungan (15 Titik Simulasi DLH Kota Bandung)
INSERT INTO `environmental_objects` (`id`, `name`, `category`, `address`, `regency`, `district`, `village`, `latitude`, `longitude`, `geom_type`, `source`, `recorded_at`, `notes`, `is_dummy`) VALUES
(1, 'TPS 01 Kebon Jeruk Pasar', 'Tempat Penampungan Sementara (TPS)', 'Jl. Kebon Jati No. 12', 'Kota Bandung', 'Andir', 'Kebon Jeruk', -6.91750, 107.60420, 'Point', 'Simulasi PKL DLH 2024', '2024-04-10', 'Kapasitas 12 m3/hari', 1),
(2, 'TPS 02 Braga Heritage', 'Tempat Penampungan Sementara (TPS)', 'Jl. Braga No. 45', 'Kota Bandung', 'Sumur Bandung', 'Braga', -6.91680, 107.61050, 'Point', 'Simulasi PKL DLH 2024', '2024-04-10', 'Kontainer semi-tertutup', 1),
(3, 'TPS 03 Merdeka Babakan', 'Tempat Penampungan Sementara (TPS)', 'Jl. Merdeka No. 10', 'Kota Bandung', 'Sumur Bandung', 'Babakan Ciamis', -6.91120, 107.61010, 'Point', 'Simulasi PKL DLH 2024', '2024-04-12', 'Kontainer baja tertutup', 1),
(4, 'TPS3R Barokah Mandiri Lestari', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Asia Afrika No. 100', 'Kota Bandung', 'Regol', 'Balonggede', -6.92210, 107.60740, 'Point', 'Simulasi PKL DLH 2024', '2024-04-15', 'Mesin pencacah organik dan BSF', 1),
(5, 'Stasiun Pemantau Udara SPKU Alun-Alun', 'Stasiun Pemantau Kualitas Udara (SPKU)', 'Kompleks Alun-Alun', 'Kota Bandung', 'Regol', 'Balonggede', -6.92180, 107.60250, 'Point', 'Simulasi PKL DLH 2024', '2024-04-18', 'Sensor PM2.5, SO2, CO real-time', 1),
(6, 'TPS Pasar Baru Trade Center', 'Tempat Penampungan Sementara (TPS)', 'Jl. Otto Iskandardinata No. 70', 'Kota Bandung', 'Andir', 'Kebon Jeruk', -6.91900, 107.60300, 'Point', 'Simulasi PKL DLH 2024', '2024-04-19', 'Timbunan sampah pasar basah', 1),
(7, 'TPS3R Tamansari Hijau', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Purnawarman No. 23', 'Kota Bandung', 'Bawet', 'Tamansari', -6.90650, 107.61080, 'Point', 'Simulasi PKL DLH 2024', '2024-04-20', 'Pemilahan sampah organik dan anorganik', 1),
(8, 'Titik Pantau Air Sungai Cikapundung Viaduct', 'Titik Pantau Kualitas Air', 'Jembatan Viaduct', 'Kota Bandung', 'Sumur Bandung', 'Babakan Ciamis', -6.91350, 107.60900, 'Point', 'Simulasi PKL DLH 2024', '2024-04-22', 'Sampling rutin BOD & COD', 1),
(9, 'TPS Dago Atas Simpang', 'Tempat Penampungan Sementara (TPS)', 'Jl. Ir. H. Juanda No. 150', 'Kota Bandung', 'Coblong', 'Dago', -6.88500, 107.61450, 'Point', 'Simulasi PKL DLH 2024', '2024-04-25', 'TPS perbukitan utara', 1),
(10, 'TPS Tubagus Ismail Sekeloa', 'Tempat Penampungan Sementara (TPS)', 'Jl. Tubagus Ismail No. 34', 'Kota Bandung', 'Coblong', 'Sekeloa', -6.88720, 107.62010, 'Point', 'Simulasi PKL DLH 2024', '2024-04-26', 'Pelayanan permukiman padat penduduk', 1),
(11, 'TPS Cihampelas Selatan', 'Tempat Penampungan Sementara (TPS)', 'Jl. Cihampelas No. 58', 'Kota Bandung', 'Coblong', 'Cipaganti', -6.90120, 107.60410, 'Point', 'Simulasi PKL DLH 2024', '2024-04-28', 'Area komersial kuliner & jeans', 1),
(12, 'TPS3R Sukajadi Berseri', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Sukajadi No. 182', 'Kota Bandung', 'Sukajadi', 'Pasteur', -6.88950, 107.59560, 'Point', 'Simulasi PKL DLH 2024', '2024-04-29', 'Pengolahan kompos mandiri', 1),
(13, 'Titik Pantau Air Sungai Cibeureum', 'Titik Pantau Kualitas Air', 'Jl. Jenderal Sudirman No. 550', 'Kota Bandung', 'Andir', 'Cijerah', -6.92480, 107.57500, 'Point', 'Simulasi PKL DLH 2024', '2024-05-02', 'Pemantauan limbah domestik & industri', 1),
(14, 'Laboratorium Lingkungan DLH Kota', 'Laboratorium Lingkungan', 'Jl. Sadang Serang No. 8', 'Kota Bandung', 'Coblong', 'Sadang Serang', -6.89250, 107.62580, 'Point', 'Simulasi PKL DLH 2024', '2024-05-03', 'Laboratorium terakreditasi KAN', 1),
(15, 'Kawasan Konservasi & RTH Babakan Siliwangi', 'Kawasan Konservasi & RTH', 'Jl. Siliwangi No. 7', 'Kota Bandung', 'Coblong', 'Lebak Siliwangi', -6.88600, 107.60850, 'Point', 'Simulasi PKL DLH 2024', '2024-05-04', 'Hutan kota lindung dan resapan air', 1);

-- --------------------------------------------------------
-- 3. Tabel Pengaduan Warga (Citizen Reports)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `citizen_reports`;
CREATE TABLE `citizen_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizen_name` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Menunggu Verifikasi',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `citizen_reports` (`id`, `citizen_name`, `phone`, `title`, `category`, `address`, `district`, `latitude`, `longitude`, `description`, `status`) VALUES
(1, 'Dewi Lestari', '081234567890', 'Timbunan Sampah Liar di Bantaran Sungai', 'Timbunan Sampah Liar', 'Jl. Cikapundung Barat No. 14', 'Sumur Bandung', -6.91420, 107.61100, 'Terjadi penumpukan kantong sampah plastik liar di dekat jembatan penyeberangan sejak 2 hari lalu.', 'Menunggu Verifikasi'),
(2, 'Ahmad Fauzi', '085712345678', 'Usulan Penambahan TPS3R Pengolahan Kompos Baru', 'Usulan Fasilitas Pengelolaan', 'Kompleks RW 05 Sekeloa', 'Coblong', -6.88900, 107.61900, 'Warga RW 05 sudah mengumpulkan sampah anorganik terpilah, membutuhkan pendampingan pembentukan fasilitas pengolahan TPS3R dari DLH.', 'Disetujui DLH');

-- --------------------------------------------------------
-- 4. Tabel Riwayat Analisis Spasial NNA & KDE
-- --------------------------------------------------------
DROP TABLE IF EXISTS `analysis_history`;
CREATE TABLE `analysis_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `analysis_type` varchar(20) NOT NULL,
  `dataset_name` varchar(150) NOT NULL,
  `total_points` int(11) NOT NULL,
  `study_area_m2` double DEFAULT NULL,
  `parameters_json` text DEFAULT NULL,
  `results_json` longtext NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
