import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services import data_service, nna_service, kde_service
from database.seed_dummy import seed as run_seed

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)  # Izinkan akses API dari frontend React

# Inisialisasi basis data jika menggunakan SQLite dan belum ada file .db
if Config.DB_TYPE.lower() == 'sqlite' and not os.path.exists(Config.SQLITE_DB_PATH):
    os.makedirs(os.path.join(BASE_DIR, 'database'), exist_ok=True)
    run_seed()

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "GIS DLH - Backend Analisis Spasial NNA & KDE (Python Flask)",
        "database_type": Config.DB_TYPE,
        "version": "1.0.0",
        "endpoints": {
            "get_objects": "GET /api/objects",
            "add_object": "POST /api/objects",
            "update_object": "PUT /api/objects/<id>",
            "delete_object": "DELETE /api/objects/<id>",
            "run_nna": "POST /api/analysis/nna",
            "run_kde": "POST /api/analysis/kde",
            "reset_seed": "POST /api/reset-dummy"
        }
    })

@app.route('/api/objects', methods=['GET'])
def get_objects():
    category = request.args.get('category')
    objects = data_service.get_all_objects(category=category)
    return jsonify({"status": "success", "count": len(objects), "data": objects})

@app.route('/api/objects', methods=['POST'])
def add_object():
    data = request.json or request.form.to_dict()
    try:
        new_id = data_service.insert_object(data)
        return jsonify({"status": "success", "message": "Objek berhasil disimpan", "id": new_id}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/objects/<int:obj_id>', methods=['PUT', 'POST'])
def update_object(obj_id):
    data = request.json or request.form.to_dict()
    try:
        data_service.update_object(obj_id, data)
        return jsonify({"status": "success", "message": "Objek berhasil diperbarui"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/objects/<int:obj_id>', methods=['DELETE'])
def delete_object(obj_id):
    try:
        data_service.delete_object(obj_id)
        return jsonify({"status": "success", "message": "Objek berhasil dihapus"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/analysis/nna', methods=['POST'])
def run_nna():
    payload = request.json or {}
    category = payload.get('category')
    custom_area = payload.get('study_area_m2')

    objects = data_service.get_all_objects(category=category)
    try:
        result = nna_service.calculate_nna(objects, study_area_m2=custom_area)
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/analysis/kde', methods=['POST'])
def run_kde():
    payload = request.json or {}
    category = payload.get('category')
    bandwidth = payload.get('bandwidth')
    resolution = payload.get('resolution', 80)

    objects = data_service.get_all_objects(category=category)
    try:
        result = kde_service.generate_kde(objects, bandwidth=bandwidth, grid_resolution=resolution)
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/reset-dummy', methods=['POST'])
def reset_dummy():
    run_seed()
    return jsonify({"status": "success", "message": "Data simulasi dummy berhasil di-reset"})

# Data Resmi Petugas Dinas DLH (Tuan Rumah)
OFFICIAL_DINAS_USERS_LIST = [
    {
        "id": "USR-DLH-001",
        "nip": "19850412 201001 1 008",
        "username": "budi_dlh",
        "name": "Ir. Budi Santoso, M.Si.",
        "position": "Kepala Bidang Pengelolaan Sampah & B3",
        "department": "Dinas Lingkungan Hidup Kota Bandung",
        "email": "budi.santoso@dlh.bandung.go.id",
        "password": "dlhbandung2024",
        "role": "dinas_head"
    },
    {
        "id": "USR-DLH-002",
        "nip": "19920315 201802 2 004",
        "username": "siti_gis",
        "name": "Siti Rahmawati, S.T.",
        "position": "Analis SIG & Spasial Lingkungan",
        "department": "Seksi Pemantauan & Sistem Informasi Lingkungan",
        "email": "siti.rahma@dlh.bandung.go.id",
        "password": "dlhbandung2024",
        "role": "dinas_analyst"
    },
    {
        "id": "USR-DLH-003",
        "nip": "19900822 201601 1 012",
        "username": "admin_dlh",
        "name": "Hendra Wijaya, S.Kom.",
        "position": "Administrator Database & Server GIS",
        "department": "Pusat Data & Informasi DLH",
        "email": "admin.gis@dlh.bandung.go.id",
        "password": "dlhbandung2024",
        "role": "dinas_admin"
    },
    {
        "id": "USR-DLH-004",
        "nip": "19951105 202001 1 003",
        "username": "deni_lapangan",
        "name": "Deni Kurniawan, A.Md.",
        "position": "Pengawas Lapangan & Verifikator TPS",
        "department": "Seksi Operasional Persampahan DLH",
        "email": "deni.lapangan@dlh.bandung.go.id",
        "password": "dlhbandung2024",
        "role": "dinas_officer"
    }
]

@app.route('/api/auth/dinas-login', methods=['POST'])
def dinas_login():
    payload = request.json or {}
    identifier = str(payload.get('identifier', '')).strip().lower().replace(' ', '')
    password = str(payload.get('password', '')).strip()

    for user in OFFICIAL_DINAS_USERS_LIST:
        clean_nip = user['nip'].lower().replace(' ', '')
        clean_username = user['username'].lower()
        clean_email = user['email'].lower()
        if (identifier == clean_nip or identifier == clean_username or identifier == clean_email) and password == user['password']:
            user_safe = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                "status": "success",
                "message": "Autentikasi Petugas Dinas Berhasil (Tuan Rumah)",
                "user": user_safe
            })

    return jsonify({
        "status": "error",
        "message": "Kredensial Petugas Dinas tidak valid! Hanya akun terdaftar di MySQL yang dapat masuk."
    }), 401

@app.route('/api/dinas-users', methods=['GET'])
def get_dinas_users():
    safe_list = [{k: v for k, v in u.items() if k != 'password'} for u in OFFICIAL_DINAS_USERS_LIST]
    return jsonify({"status": "success", "count": len(safe_list), "data": safe_list})

if __name__ == '__main__':
    print("==================================================")
    print("GIS DLH - Server Python Flask Aktif")
    print(f"Tipe Database Aktif: {Config.DB_TYPE.upper()}")
    print("Akses API: http://127.0.0.1:5000")
    print("==================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)
