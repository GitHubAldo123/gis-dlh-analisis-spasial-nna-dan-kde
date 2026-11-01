-- Skema Database Relasional SQLite untuk GIS DLH

-- 1. Pengguna Resmi Pihak Dinas (Tuan Rumah)
CREATE TABLE IF NOT EXISTS dinas_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'dinas_official',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Objek Lingkungan Hidup
CREATE TABLE IF NOT EXISTS environmental_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT,
    regency TEXT DEFAULT 'Kota Bandung',
    district TEXT,
    village TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    geom_type TEXT DEFAULT 'Point',
    source TEXT NOT NULL,
    recorded_at DATE NOT NULL,
    notes TEXT,
    is_dummy INTEGER DEFAULT 0
);

-- 3. Pengaduan & Aspirasi Warga (Tamu)
CREATE TABLE IF NOT EXISTS citizen_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_name TEXT NOT NULL,
    phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Menunggu Verifikasi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Riwayat Analisis NNA & KDE
CREATE TABLE IF NOT EXISTS analysis_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_type TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    total_points INTEGER NOT NULL,
    study_area_m2 REAL,
    parameters_json TEXT,
    results_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
