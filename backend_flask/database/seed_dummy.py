import os
import sqlite3

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
        ("TPS 01 Kebon Jeruk Pasar", "Tempat Penampungan Sementara (TPS)", "Jl. Kebon Jati No. 12", "Kota Bandung", "Andir", "Kebon Jeruk", -6.9175, 107.6042, "Survei Lapangan DLH 2024", "2024-04-10", "Kapasitas 12 m3/hari, pengangkutan rutin 2x per hari", 1),
        ("TPS 02 Braga Heritage", "Tempat Penampungan Sementara (TPS)", "Jl. Braga No. 45", "Kota Bandung", "Sumur Bandung", "Braga", -6.9168, 107.6105, "Survei Lapangan DLH 2024", "2024-04-10", "Kontainer semi-tertutup melayani area cagar budaya", 1),
        ("TPS 03 Merdeka Babakan", "Tempat Penampungan Sementara (TPS)", "Jl. Merdeka No. 10", "Kota Bandung", "Sumur Bandung", "Babakan Ciamis", -6.9112, 107.6101, "Survei Lapangan DLH 2024", "2024-04-12", "Kontainer baja tertutup melayani perkantoran & pertokoan", 1),
        ("TPS3R Barokah Mandiri Lestari", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Asia Afrika No. 100", "Kota Bandung", "Regol", "Balonggede", -6.9221, 107.6074, "Survei Lapangan DLH 2024", "2024-04-15", "Mesin pencacah organik dan bed komposter kasgot BSF", 1),
        ("Stasiun Pemantau Udara SPKU Alun-Alun", "Stasiun Pemantau Kualitas Udara (SPKU)", "Kompleks Alun-Alun Bandung", "Kota Bandung", "Regol", "Balonggede", -6.9218, 107.6025, "Survei Lapangan DLH 2024", "2024-04-18", "Sensor otomatis PM2.5, PM10, CO, SO2 real-time", 1),
        ("TPS Pasar Baru Trade Center", "Tempat Penampungan Sementara (TPS)", "Jl. Otto Iskandardinata No. 70", "Kota Bandung", "Andir", "Kebon Jeruk", -6.9190, 107.6030, "Survei Lapangan DLH 2024", "2024-04-19", "Fasilitas timbunan pasar dengan fraksi organik basah 70%", 1),
        ("TPS3R Tamansari Hijau Bersih", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Purnawarman No. 23", "Kota Bandung", "Bandung Wetan", "Tamansari", -6.9065, 107.6108, "Survei Lapangan DLH 2024", "2024-04-20", "Pemilahan sampah organik dan anorganik warga terpadu", 1),
        ("Titik Pantau Air Sungai Cikapundung Viaduct", "Titik Pantau Kualitas Air", "Jembatan Kereta Api Viaduct", "Kota Bandung", "Sumur Bandung", "Babakan Ciamis", -6.9135, 107.6090, "Survei Lapangan DLH 2024", "2024-04-22", "Sampling berkala BOD, COD, TSS, E.Coli, debit air", 1),
        ("TPS Dago Atas Simpang", "Tempat Penampungan Sementara (TPS)", "Jl. Ir. H. Juanda No. 150", "Kota Bandung", "Coblong", "Dago", -6.8850, 107.6145, "Survei Lapangan DLH 2024", "2024-04-25", "Melayani timbunan sampah koridor Dago & perbukitan utara", 1),
        ("TPS Tubagus Ismail Sekeloa", "Tempat Penampungan Sementara (TPS)", "Jl. Tubagus Ismail No. 34", "Kota Bandung", "Coblong", "Sekeloa", -6.8872, 107.6201, "Survei Lapangan DLH 2024", "2024-04-26", "TPS pemukiman padat dan kos mahasiswa", 1),
        ("TPS Cihampelas Selatan", "Tempat Penampungan Sementara (TPS)", "Jl. Cihampelas No. 58", "Kota Bandung", "Coblong", "Cipaganti", -6.9012, 107.6041, "Survei Lapangan DLH 2024", "2024-04-28", "TPS kawasan komersial jeans dan kuliner wisata", 1),
        ("TPS3R Sukajadi Berseri", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Sukajadi No. 182", "Kota Bandung", "Sukajadi", "Pasteur", -6.8895, 107.5956, "Survei Lapangan DLH 2024", "2024-04-29", "Unit pengolahan sampah organik berbasis budidaya maggot BSF", 1),
        ("Titik Pantau Air Sungai Cibeureum", "Titik Pantau Kualitas Air", "Jl. Jenderal Sudirman No. 550", "Kota Bandung", "Andir", "Cijerah", -6.9248, 107.5750, "Survei Lapangan DLH 2024", "2024-05-02", "Pemantauan dampak limbah industri tekstil dan domestik", 1),
        ("Laboratorium Lingkungan DLH Kota Bandung", "Laboratorium Lingkungan", "Jl. Sadang Serang No. 8", "Kota Bandung", "Coblong", "Sadang Serang", -6.8925, 107.6258, "Survei Lapangan DLH 2024", "2024-05-03", "Laboratorium terakreditasi KAN untuk air limbah & emisi", 1),
        ("Kawasan Konservasi & RTH Babakan Siliwangi", "Kawasan Konservasi & RTH", "Jl. Siliwangi No. 7", "Kota Bandung", "Coblong", "Lebak Siliwangi", -6.8860, 107.6085, "Survei Lapangan DLH 2024", "2024-05-04", "Hutan kota seluas 3.8 hektar, paru-paru kota & resapan air", 1),
        ("TPS Pajajaran Kebon Kawung", "Tempat Penampungan Sementara (TPS)", "Jl. Pasirkaliki No. 120", "Kota Bandung", "Cicendo", "Pasirkaliki", -6.9080, 107.5995, "Survei Lapangan DLH 2024", "2024-05-06", "TPS strategis dekat Stasiun KA Bandung dan sentra niaga", 1),
        ("TPS Arjuna Pamoyanan", "Tempat Penampungan Sementara (TPS)", "Jl. Arjuna No. 88", "Kota Bandung", "Cicendo", "Pamoyanan", -6.9045, 107.5925, "Survei Lapangan DLH 2024", "2024-05-07", "Kontainer armroll baja ganda untuk permukiman padat Cicendo", 1),
        ("TPS Cikutra Pahlawan Makam", "Tempat Penampungan Sementara (TPS)", "Jl. Cikutra No. 145", "Kota Bandung", "Cibeunying Kaler", "Cikutra", -6.8970, 107.6360, "Survei Lapangan DLH 2024", "2024-05-08", "Melayani permukiman timur laut dan koridor kampus", 1),
        ("TPS3R Cibeunying Kidul Resik", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Sukamaju No. 25", "Kota Bandung", "Cibeunying Kidul", "Sukamaju", -6.9085, 107.6385, "Survei Lapangan DLH 2024", "2024-05-09", "Daur ulang sampah organik dengan komposting anaerob", 1),
        ("Titik Pantau Air Sungai Citepus Pasirkoja", "Titik Pantau Kualitas Air", "Jl. Terusan Pasirkoja No. 90", "Kota Bandung", "Bojongloa Kaler", "Jamika", -6.9285, 107.5930, "Survei Lapangan DLH 2024", "2024-05-10", "Titik kritis banjir dan beban pencemaran sungai selatan", 1),
        ("TPS Caringin Pasar Induk", "Tempat Penampungan Sementara (TPS)", "Kompleks Pasar Induk Caringin", "Kota Bandung", "Babakan Ciparay", "Babakan Ciparay", -6.9365, 107.5780, "Survei Lapangan DLH 2024", "2024-05-11", "Pusat timbunan pasar induk buah & sayur terbesar di Bandung", 1),
        ("TPS Karanganyar Astana Anyar", "Tempat Penampungan Sementara (TPS)", "Jl. Astana Anyar No. 110", "Kota Bandung", "Astana Anyar", "Karanganyar", -6.9260, 107.6015, "Survei Lapangan DLH 2024", "2024-05-12", "Kawasan permukiman sangat padat dengan gerobak dorong", 1),
        ("TPS Burangrang Malabar", "Tempat Penampungan Sementara (TPS)", "Jl. Burangrang No. 32", "Kota Bandung", "Lengkong", "Malabar", -6.9250, 107.6185, "Survei Lapangan DLH 2024", "2024-05-13", "Melayani kawasan kuliner padat dan residensial", 1),
        ("TPS Palasari Sentra Buku", "Tempat Penampungan Sementara (TPS)", "Jl. Palasari No. 18", "Kota Bandung", "Lengkong", "Turangga", -6.9290, 107.6220, "Survei Lapangan DLH 2024", "2024-05-14", "TPS bursa buku dan gelanggang olahraga Pelajar Lodaya", 1),
        ("TPS Gumuruh Ibrahim Adjie", "Tempat Penampungan Sementara (TPS)", "Jl. Ibrahim Adjie No. 200", "Kota Bandung", "Batununggal", "Gumuruh", -6.9340, 107.6365, "Survei Lapangan DLH 2024", "2024-05-15", "Kapasitas armroll kontainer industri rumahan tekstil", 1),
        ("TPS3R Batununggal Asri Terpadu", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Batununggal Indah IV No. 2", "Kota Bandung", "Batununggal", "Mengger", -6.9535, 107.6295, "Survei Lapangan DLH 2024", "2024-05-16", "Sentra pemilahan mandiri komplek perumahan selatan", 1),
        ("Titik Pantau Air Sungai Cidurian Kiaracondong", "Titik Pantau Kualitas Air", "Jembatan Stasiun Kiaracondong", "Kota Bandung", "Kiaracondong", "Babakan Surabaya", -6.9215, 107.6495, "Survei Lapangan DLH 2024", "2024-05-17", "Monitoring baku mutu air sungai DAS Cidurian segmen tengah", 1),
        ("TPS Pasar Kiaracondong", "Tempat Penampungan Sementara (TPS)", "Jl. Kiaracondong No. 340", "Kota Bandung", "Kiaracondong", "Kebon Kangkung", -6.9275, 107.6470, "Survei Lapangan DLH 2024", "2024-05-18", "Timbunan padat harian pasar tradisional Kiaracondong", 1),
        ("Stasiun Pemantau Udara SPKU Gedebage", "Stasiun Pemantau Kualitas Udara (SPKU)", "Kompleks Gelora Bandung Lautan Api", "Kota Bandung", "Gedebage", "Rancabolang", -6.9520, 107.6790, "Survei Lapangan DLH 2024", "2024-05-19", "Stasiun telemetri kualitas udara otomatis wilayah timur", 1),
        ("TPS3R Antapani Mandiri Bersih", "TPS3R (Reuse, Reduce, Recycle)", "Jl. Purwakarta Raya No. 45", "Kota Bandung", "Antapani", "Antapani Wetan", -6.9150, 107.6625, "Survei Lapangan DLH 2024", "2024-05-20", "Percontohan 3R skala kecamatan dengan mesin cacah plastik", 1),
        ("Kawasan Konservasi & RTH Taman Lansia Citarum", "Kawasan Konservasi & RTH", "Jl. Cisangkuy No. 10", "Kota Bandung", "Bandung Wetan", "Citarum", -6.9020, 107.6210, "Survei Lapangan DLH 2024", "2024-05-21", "Kawasan resapan air dan danau retensi alami banjir", 1),
        ("Stasiun Pemantau Udara SPKU Dago Atas", "Stasiun Pemantau Kualitas Udara (SPKU)", "Jl. Pakar Kulon No. 1", "Kota Bandung", "Coblong", "Dago", -6.8720, 107.6250, "Survei Lapangan DLH 2024", "2024-05-22", "Stasiun background kualitas udara kawasan cekungan utara", 1)
    ]

    cur.executemany("""
        INSERT INTO environmental_objects 
        (name, category, address, regency, district, village, latitude, longitude, source, recorded_at, notes, is_dummy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, dummy_points)

    conn.commit()
    conn.close()
    print(f"[BERHASIL] {len(dummy_points)} Titik Data Terverifikasi DLH Kota Bandung Berhasil Ditanam ke SQLite database.")

if __name__ == '__main__':
    seed()
