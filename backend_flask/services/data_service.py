import sqlite3
import pandas as pd
import json

def get_db_connection(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_objects(db_path, category=None):
    conn = get_db_connection(db_path)
    query = "SELECT * FROM environmental_objects WHERE 1=1"
    params = []
    if category and category != 'ALL':
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY id DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def insert_object(db_path, data):
    conn = get_db_connection(db_path)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO environmental_objects 
        (name, category, address, regency, district, village, latitude, longitude, geom_type, source, recorded_at, notes, is_dummy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['name'], data['category'], data.get('address', ''),
        data.get('regency', 'Kota Bandung'), data.get('district', ''), data.get('village', ''),
        float(data['latitude']), float(data['longitude']),
        data.get('geom_type', 'Point'), data.get('source', 'Survei Lapangan DLH'),
        data.get('recorded_at', '2024-05-01'), data.get('notes', ''),
        int(data.get('is_dummy', 0))
    ))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_object(db_path, obj_id, data):
    conn = get_db_connection(db_path)
    conn.execute("""
        UPDATE environmental_objects
        SET name=?, category=?, address=?, regency=?, district=?, village=?,
            latitude=?, longitude=?, source=?, recorded_at=?, notes=?
        WHERE id=?
    """, (
        data['name'], data['category'], data.get('address', ''),
        data.get('regency', 'Kota Bandung'), data.get('district', ''), data.get('village', ''),
        float(data['latitude']), float(data['longitude']),
        data.get('source', 'Survei Lapangan DLH'), data.get('recorded_at', '2024-05-01'),
        data.get('notes', ''), obj_id
    ))
    conn.commit()
    conn.close()

def delete_object(db_path, obj_id):
    conn = get_db_connection(db_path)
    conn.execute("DELETE FROM environmental_objects WHERE id = ?", (obj_id,))
    conn.commit()
    conn.close()

def delete_all_dummy(db_path):
    conn = get_db_connection(db_path)
    conn.execute("DELETE FROM environmental_objects WHERE is_dummy = 1")
    conn.commit()
    conn.close()
