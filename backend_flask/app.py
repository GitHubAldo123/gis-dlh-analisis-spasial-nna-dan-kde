import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from services import data_service, nna_service, kde_service
from database.seed_dummy import seed as run_seed

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'gis_dlh.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'database', 'schema.sql')

app = Flask(__name__)
CORS(app)  # Izinkan akses API dari frontend React

# Inisialisasi basis data jika belum ada
if not os.path.exists(DB_PATH):
    os.makedirs(os.path.join(BASE_DIR, 'database'), exist_ok=True)
    run_seed()

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "GIS DLH - Backend Analisis Spasial NNA & KDE (Python Flask)",
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
    objects = data_service.get_all_objects(DB_PATH, category=category)
    return jsonify({"status": "success", "count": len(objects), "data": objects})

@app.route('/api/objects', methods=['POST'])
def add_object():
    data = request.json or request.form.to_dict()
    try:
        new_id = data_service.insert_object(DB_PATH, data)
        return jsonify({"status": "success", "message": "Objek berhasil disimpan", "id": new_id}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/objects/<int:obj_id>', methods=['PUT', 'POST'])
def update_object(obj_id):
    data = request.json or request.form.to_dict()
    try:
        data_service.update_object(DB_PATH, obj_id, data)
        return jsonify({"status": "success", "message": "Objek berhasil diperbarui"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/objects/<int:obj_id>', methods=['DELETE'])
def delete_object(obj_id):
    try:
        data_service.delete_object(DB_PATH, obj_id)
        return jsonify({"status": "success", "message": "Objek berhasil dihapus"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/analysis/nna', methods=['POST'])
def run_nna():
    payload = request.json or {}
    category = payload.get('category')
    custom_area = payload.get('study_area_m2')

    objects = data_service.get_all_objects(DB_PATH, category=category)
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

    objects = data_service.get_all_objects(DB_PATH, category=category)
    try:
        result = kde_service.generate_kde(objects, bandwidth=bandwidth, grid_resolution=resolution)
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/reset-dummy', methods=['POST'])
def reset_dummy():
    run_seed()
    return jsonify({"status": "success", "message": "Data simulasi dummy berhasil di-reset"})

if __name__ == '__main__':
    print("Memulai GIS DLH Flask Backend Server...")
    print("URL API: http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
