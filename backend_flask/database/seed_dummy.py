import os
import sqlite3
from datetime import date

def seed():
    db_dir = os.path.dirname(__file__)
    db_path = os.path.join(db_dir, 'gis_dlh.db')
    schema_path = os.path.join(db_dir, 'schema.sql')

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Eksekusi schema jika belum ada tabel
    with open(schema_path, 'r', encoding='utf-8') as f:
        cur.executescript(f.read())

    # Hapus data simulasi lama jika ada untuk idempotensi
    cur.execute("DELETE FROM environmental_objects WHERE is_dummy = 1")

    dummy_points = [
        ("TPS 01 Kebon Jeruk Pasar", "Tempat Penampungan Sementara (TPS)", "Jl. Kebon Jati No. 12", "Kota Bandung", "Andir", "Kebon Jeruk", -6.9175, 107.6042, "Simulasi PKL DLH 2024", "2024-04-10", "Kapasitas 12 m3/hari", 1),
        ("TPS 02 Braga Heritage", "Tempat Penampungan Sementara (TPS)", "Jl. Braga No. 45", "Kota Bandung", "Sumur Bandung", "Braga", -6.9168, 107.6105, "Simulasi PKL DLH 2024", "2024-04-10", "Kontainer semi-tertutup", 1),
        ("Bank Sampah Resik Berkah 08", "Bank Sampah", "Jl. Merdeka No. 10", "Kota Bandung", "Sumur Bandung", "Babakan Ciamis", -6.9112, 107.6101, "Simulasi PKL DLH 2024", "2024-04-12", "Pengolahan anorganik aktif", 1),
        ("TPS3R Barokah Mandiri Lestari", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Asia Afrika No. 100", "Kota Bandung", "Regol", "Balonggede", -6.9221, 107.6074, "Simulasi PKL DLH 2024", "2024-04-15", "Mesin pencacah organik dan BSF", 1),
        ("Stasiun Pemantau Udara SPKU Alun-Alun", "Stasiun Pemantau Kualitas Udara (SPKU)", "Kompleks Alun-Alun", "Kota Bandung", "Regol", "Balonggede", -6.9218, 107.6025, "Simulasi PKL DLH 2024", "2024-04-18", "Sensor PM2.5, SO2, CO real-time", 1),
        ("TPS Pasar Baru Trade Center", "Tempat Penampungan Sementara (TPS)", "Jl. Otto Iskandardinata No. 70", "Kota Bandung", "Andir", "Kebon Jeruk", -6.9190, 107.6030, "Simulasi PKL DLH 2024", "2024-04-19", "Timbunan sampah pasar basah", 1),
        ("Bank Sampah Hijau Lestari Babakan", "Bank Sampah", "Jl. Purnawarman No. 23", "Kota Bandung", "Bawet", "Tamansari", -6.9065, 107.6108, "Simulasi PKL DLH 2024", "2024-04-20", "Tabungan sampah warga", 1),
        ("Titik Pantau Air Sungai Cikapundung Viaduct", "Titik Pantau Kualitas Air", "Jembatan Viaduct", "Kota Bandung", "Sumur Bandung", "Babakan Ciamis", -6.9135, 107.6090, "Simulasi PKL DLH 2024", "2024-04-22", "Sampling rutin BOD & COD", 1),
        ("TPS Dago Atas Simpang", "Tempat Penampungan Sementara (TPS)", "Jl. Ir. H. Juanda No. 150", "Kota Bandung", "Coblong", "Dago", -6.8850, 107.6145, "Simulasi PKL DLH 2024", "2024-04-25", "TPS perbukitan utara", 1),
        ("Bank Sampah Berkah Dago Mandiri", "Bank Sampah", "Jl. Tubagus Ismail No. 34", "Kota Bandung", "Coblong", "Sekeloa", -6.8872, 107.6201, "Simulasi PKL DLH 2024", "2024-04-26", "Kemitraan mahasiswa kampus", 1),
        ("TPS Cihampelas Selatan", "Tempat Penampungan Sementara (TPS)", "Jl. Cihampelas No. 58", "Kota Bandung", "Coblong", "Cipaganti", -6.9012, 107.6041, "Simulasi PKL DLH 2024", "2024-04-28", "Area komersial kuliner & jeans", 1),
        ("TPS3R Sukajadi Berseri", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Sukajadi No. 182", "Kota Bandung", "Sukajadi", "Pasteur", -6.8895, 107.5956, "Simulasi PKL DLH 2024", "2024-04-29", "Pengolahan kompos mandiri", 1),
        ("Titik Pantau Air Sungai Cibeureum", "Titik Pantau Kualitas Air", "Jl. Jenderal Sudirman No. 550", "Kota Bandung", "Andir", "Cijerah", -6.9248, 107.5750, "Simulasi PKL DLH 2024", "2024-05-02", "Pemantauan limbah domestik & industri", 1),
        ("Laboratorium Lingkungan DLH Kota", "Laboratorium Lingkungan", "Jl. Sadang Serang No. 8", "Kota Bandung", "Coblong", "Sadang Serang", -6.8925, 107.6258, "Simulasi PKL DLH 2024", "2024-05-03", "Laboratorium terakreditasi KAN", 1),
        ("Kawasan Konservasi & RTH Babakan Siliwangi", "Kawasan Konservasi & RTH", "Jl. Siliwangi No. 7", "Kota Bandung", "Coblong", "Lebak Siliwangi", -6.8860, 107.6085, "Simulasi PKL DLH 2024", "2024-05-04", "Hutan kota lindung dan resapan air", 1)
    ]

    cur.executemany("""
        INSERT INTO environmental_objects 
        (name, category, address, regency, district, village, latitude, longitude, source, recorded_at, notes, is_dummy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, dummy_points)

    conn.commit()
    conn.close()
    print("[BERHASIL] 15 Titik Data Simulasi PKL DLH Berhasil Ditanam ke SQLite database.")

if __name__ == '__main__':
    seed()
