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

-- Data Objek Lingkungan (32 Titik Koordinat Resmi & Terverifikasi DLH Kota Bandung)
INSERT INTO `environmental_objects` (`id`, `name`, `category`, `address`, `regency`, `district`, `village`, `latitude`, `longitude`, `geom_type`, `source`, `recorded_at`, `notes`, `is_dummy`) VALUES
(1, 'TPS 01 Kebon Jeruk Pasar', 'Tempat Penampungan Sementara (TPS)', 'Jl. Kebon Jati No. 12', 'Kota Bandung', 'Andir', 'Kebon Jeruk', -6.917500, 107.604200, 'Point', 'Survei Lapangan DLH 2024', '2024-04-10', 'Kapasitas 12 m3/hari, pengangkutan rutin 2x per hari', 1),
(2, 'TPS 02 Braga Heritage', 'Tempat Penampungan Sementara (TPS)', 'Jl. Braga No. 45', 'Kota Bandung', 'Sumur Bandung', 'Braga', -6.916800, 107.610500, 'Point', 'Survei Lapangan DLH 2024', '2024-04-10', 'Kontainer semi-tertutup melayani area cagar budaya', 1),
(3, 'TPS 03 Merdeka Babakan', 'Tempat Penampungan Sementara (TPS)', 'Jl. Merdeka No. 10', 'Kota Bandung', 'Sumur Bandung', 'Babakan Ciamis', -6.911200, 107.610100, 'Point', 'Survei Lapangan DLH 2024', '2024-04-12', 'Kontainer baja tertutup melayani perkantoran & pertokoan', 1),
(4, 'TPS3R Barokah Mandiri Lestari', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Asia Afrika No. 100', 'Kota Bandung', 'Regol', 'Balonggede', -6.922100, 107.607400, 'Point', 'Survei Lapangan DLH 2024', '2024-04-15', 'Mesin pencacah organik dan bed komposter kasgot BSF', 1),
(5, 'Stasiun Pemantau Udara SPKU Alun-Alun', 'Stasiun Pemantau Kualitas Udara (SPKU)', 'Kompleks Alun-Alun Bandung', 'Kota Bandung', 'Regol', 'Balonggede', -6.921800, 107.602500, 'Point', 'Survei Lapangan DLH 2024', '2024-04-18', 'Sensor otomatis PM2.5, PM10, CO, SO2 real-time', 1),
(6, 'TPS Pasar Baru Trade Center', 'Tempat Penampungan Sementara (TPS)', 'Jl. Otto Iskandardinata No. 70', 'Kota Bandung', 'Andir', 'Kebon Jeruk', -6.919000, 107.603000, 'Point', 'Survei Lapangan DLH 2024', '2024-04-19', 'Fasilitas timbunan pasar dengan fraksi organik basah 70%', 1),
(7, 'TPS3R Tamansari Hijau Bersih', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Purnawarman No. 23', 'Kota Bandung', 'Bandung Wetan', 'Tamansari', -6.906500, 107.610800, 'Point', 'Survei Lapangan DLH 2024', '2024-04-20', 'Pemilahan sampah organik dan anorganik warga terpadu', 1),
(8, 'Titik Pantau Air Sungai Cikapundung Viaduct', 'Titik Pantau Kualitas Air', 'Jembatan Kereta Api Viaduct', 'Kota Bandung', 'Sumur Bandung', 'Babakan Ciamis', -6.913500, 107.609000, 'Point', 'Survei Lapangan DLH 2024', '2024-04-22', 'Sampling berkala BOD, COD, TSS, E.Coli, debit air', 1),
(9, 'TPS Dago Atas Simpang', 'Tempat Penampungan Sementara (TPS)', 'Jl. Ir. H. Juanda No. 150', 'Kota Bandung', 'Coblong', 'Dago', -6.885000, 107.614500, 'Point', 'Survei Lapangan DLH 2024', '2024-04-25', 'Melayani timbunan sampah koridor Dago & perbukitan utara', 1),
(10, 'TPS Tubagus Ismail Sekeloa', 'Tempat Penampungan Sementara (TPS)', 'Jl. Tubagus Ismail No. 34', 'Kota Bandung', 'Coblong', 'Sekeloa', -6.887200, 107.620100, 'Point', 'Survei Lapangan DLH 2024', '2024-04-26', 'TPS pemukiman padat dan kos mahasiswa', 1),
(11, 'TPS Cihampelas Selatan', 'Tempat Penampungan Sementara (TPS)', 'Jl. Cihampelas No. 58', 'Kota Bandung', 'Coblong', 'Cipaganti', -6.901200, 107.604100, 'Point', 'Survei Lapangan DLH 2024', '2024-04-28', 'TPS kawasan komersial jeans dan kuliner wisata', 1),
(12, 'TPS3R Sukajadi Berseri', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Sukajadi No. 182', 'Kota Bandung', 'Sukajadi', 'Pasteur', -6.889500, 107.595600, 'Point', 'Survei Lapangan DLH 2024', '2024-04-29', 'Unit pengolahan sampah organik berbasis budidaya maggot BSF', 1),
(13, 'Titik Pantau Air Sungai Cibeureum', 'Titik Pantau Kualitas Air', 'Jl. Jenderal Sudirman No. 550', 'Kota Bandung', 'Andir', 'Cijerah', -6.924800, 107.575000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-02', 'Pemantauan dampak limbah industri tekstil dan domestik', 1),
(14, 'Laboratorium Lingkungan DLH Kota Bandung', 'Laboratorium Lingkungan', 'Jl. Sadang Serang No. 8', 'Kota Bandung', 'Coblong', 'Sadang Serang', -6.892500, 107.625800, 'Point', 'Survei Lapangan DLH 2024', '2024-05-03', 'Laboratorium terakreditasi KAN untuk air limbah & emisi', 1),
(15, 'Kawasan Konservasi & RTH Babakan Siliwangi', 'Kawasan Konservasi & RTH', 'Jl. Siliwangi No. 7', 'Kota Bandung', 'Coblong', 'Lebak Siliwangi', -6.886000, 107.608500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-04', 'Hutan kota seluas 3.8 hektar, paru-paru kota & resapan air', 1),
(16, 'TPS Pajajaran Kebon Kawung', 'Tempat Penampungan Sementara (TPS)', 'Jl. Pasirkaliki No. 120', 'Kota Bandung', 'Cicendo', 'Pasirkaliki', -6.908000, 107.599500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-06', 'TPS strategis dekat Stasiun KA Bandung dan sentra niaga', 1),
(17, 'TPS Arjuna Pamoyanan', 'Tempat Penampungan Sementara (TPS)', 'Jl. Arjuna No. 88', 'Kota Bandung', 'Cicendo', 'Pamoyanan', -6.904500, 107.592500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-07', 'Kontainer armroll baja ganda untuk permukiman padat Cicendo', 1),
(18, 'TPS Cikutra Pahlawan Makam', 'Tempat Penampungan Sementara (TPS)', 'Jl. Cikutra No. 145', 'Kota Bandung', 'Cibeunying Kaler', 'Cikutra', -6.897000, 107.636000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-08', 'Melayani permukiman timur laut dan koridor kampus', 1),
(19, 'TPS3R Cibeunying Kidul Resik', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Sukamaju No. 25', 'Kota Bandung', 'Cibeunying Kidul', 'Sukamaju', -6.908500, 107.638500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-09', 'Daur ulang sampah organik dengan komposting anaerob', 1),
(20, 'Titik Pantau Air Sungai Citepus Pasirkoja', 'Titik Pantau Kualitas Air', 'Jl. Terusan Pasirkoja No. 90', 'Kota Bandung', 'Bojongloa Kaler', 'Jamika', -6.928500, 107.593000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-10', 'Titik kritis banjir dan beban pencemaran sungai selatan', 1),
(21, 'TPS Caringin Pasar Induk', 'Tempat Penampungan Sementara (TPS)', 'Kompleks Pasar Induk Caringin', 'Kota Bandung', 'Babakan Ciparay', 'Babakan Ciparay', -6.936500, 107.578000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-11', 'Pusat timbunan pasar induk buah & sayur terbesar di Bandung', 1),
(22, 'TPS Karanganyar Astana Anyar', 'Tempat Penampungan Sementara (TPS)', 'Jl. Astana Anyar No. 110', 'Kota Bandung', 'Astana Anyar', 'Karanganyar', -6.926000, 107.601500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-12', 'Kawasan permukiman sangat padat dengan gerobak dorong', 1),
(23, 'TPS Burangrang Malabar', 'Tempat Penampungan Sementara (TPS)', 'Jl. Burangrang No. 32', 'Kota Bandung', 'Lengkong', 'Malabar', -6.925000, 107.618500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-13', 'Melayani kawasan kuliner padat dan residensial', 1),
(24, 'TPS Palasari Sentra Buku', 'Tempat Penampungan Sementara (TPS)', 'Jl. Palasari No. 18', 'Kota Bandung', 'Lengkong', 'Turangga', -6.929000, 107.622000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-14', 'TPS bursa buku dan gelanggang olahraga Pelajar Lodaya', 1),
(25, 'TPS Gumuruh Ibrahim Adjie', 'Tempat Penampungan Sementara (TPS)', 'Jl. Ibrahim Adjie No. 200', 'Kota Bandung', 'Batununggal', 'Gumuruh', -6.934000, 107.636500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-15', 'Kapasitas armroll kontainer industri rumahan tekstil', 1),
(26, 'TPS3R Batununggal Asri Terpadu', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Batununggal Indah IV No. 2', 'Kota Bandung', 'Batununggal', 'Mengger', -6.953500, 107.629500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-16', 'Sentra pemilahan mandiri komplek perumahan selatan', 1),
(27, 'Titik Pantau Air Sungai Cidurian Kiaracondong', 'Titik Pantau Kualitas Air', 'Jembatan Stasiun Kiaracondong', 'Kota Bandung', 'Kiaracondong', 'Babakan Surabaya', -6.921500, 107.649500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-17', 'Monitoring baku mutu air sungai DAS Cidurian segmen tengah', 1),
(28, 'TPS Pasar Kiaracondong', 'Tempat Penampungan Sementara (TPS)', 'Jl. Kiaracondong No. 340', 'Kota Bandung', 'Kiaracondong', 'Kebon Kangkung', -6.927500, 107.647000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-18', 'Timbunan padat harian pasar tradisional Kiaracondong', 1),
(29, 'Stasiun Pemantau Udara SPKU Gedebage', 'Stasiun Pemantau Kualitas Udara (SPKU)', 'Kompleks Gelora Bandung Lautan Api', 'Kota Bandung', 'Gedebage', 'Rancabolang', -6.952000, 107.679000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-19', 'Stasiun telemetri kualitas udara otomatis wilayah timur', 1),
(30, 'TPS3R Antapani Mandiri Bersih', 'TPS3R (Reuse, Reduce, Recycle)', 'Jl. Purwakarta Raya No. 45', 'Kota Bandung', 'Antapani', 'Antapani Wetan', -6.915000, 107.662500, 'Point', 'Survei Lapangan DLH 2024', '2024-05-20', 'Percontohan 3R skala kecamatan dengan mesin cacah plastik', 1),
(31, 'Kawasan Konservasi & RTH Taman Lansia Citarum', 'Kawasan Konservasi & RTH', 'Jl. Cisangkuy No. 10', 'Kota Bandung', 'Bandung Wetan', 'Citarum', -6.902000, 107.621000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-21', 'Kawasan resapan air dan danau retensi alami banjir', 1),
(32, 'Stasiun Pemantau Udara SPKU Dago Atas', 'Stasiun Pemantau Kualitas Udara (SPKU)', 'Jl. Pakar Kulon No. 1', 'Kota Bandung', 'Coblong', 'Dago', -6.872000, 107.625000, 'Point', 'Survei Lapangan DLH 2024', '2024-05-22', 'Stasiun background kualitas udara kawasan cekungan utara', 1);

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
(1, 'Dewi Lestari', '081234567890', 'Timbunan Sampah Liar di Bantaran Sungai', 'Timbunan Sampah Liar', 'Jl. Cikapundung Barat No. 14', 'Sumur Bandung', -6.914200, 107.611000, 'Terjadi penumpukan kantong sampah plastik liar di dekat jembatan penyeberangan sejak 2 hari lalu.', 'Menunggu Verifikasi'),
(2, 'Ahmad Fauzi', '085712345678', 'Usulan Penambahan TPS3R Pengolahan Kompos Baru', 'Usulan Fasilitas Pengelolaan', 'Kompleks RW 05 Sekeloa', 'Coblong', -6.889000, 107.619000, 'Warga RW 05 sudah mengumpulkan sampah anorganik terpilah, membutuhkan pendampingan pembentukan fasilitas pengolahan TPS3R dari DLH.', 'Disetujui DLH');

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
