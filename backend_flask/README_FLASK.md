# Panduan Menjalankan Backend Python Flask (GIS DLH)

Backend ini dibangun menggunakan **Python Flask**, **SciPy**, **NumPy**, **PyProj**, **Pandas**, dan **SQLite** untuk menyediakan REST API pengolahan spasial NNA dan KDE bagi Dinas Lingkungan Hidup (DLH).

---

## 1. Menjalankan Backend Flask di Windows (Terminal Baru di VS Code)

Buka terminal kedua di VS Code (klik tanda `+` di panel terminal):

### Langkah 1: Masuk ke folder backend
```bash
cd backend_flask
```

### Langkah 2: Buat Virtual Environment Python (Disarankan)
```bash
python -m venv venv
.\venv\Scripts\activate
```

### Langkah 3: Instal Dependensi Python
```bash
pip install -r requirements.txt
```

### Langkah 4: Tanam Data Simulasi Awal (15 Titik Objek Lingkungan)
```bash
python database/seed_dummy.py
```

### Langkah 5: Jalankan Server Flask
```bash
python app.py
```

Server API Flask akan aktif di:
```text
http://127.0.0.1:5000
```

---

## 2. Daftar Endpoint REST API Python Flask

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/objects` | Mengambil seluruh data objek lingkungan |
| `POST` | `/api/objects` | Menambah data objek baru |
| `PUT` | `/api/objects/<id>` | Memperbarui atribut objek |
| `DELETE` | `/api/objects/<id>` | Menghapus objek |
| `POST` | `/api/analysis/nna` | Menghitung Nearest Neighbor Analysis dengan proyeksi UTM |
| `POST` | `/api/analysis/kde` | Menghitung Kernel Density 2D & menghasilkan raster PNG Base64 |
| `POST` | `/api/reset-dummy` | Menanam ulang 15 data dummy Kota Bandung |
