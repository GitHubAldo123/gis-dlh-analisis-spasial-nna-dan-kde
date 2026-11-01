-- Skema Database Relasional SQLite untuk GIS DLH
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
