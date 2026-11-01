import os
import sqlite3
import pandas as pd
from config import Config

def get_connection():
    """
    Mengembalikan koneksi database berdasarkan Config.DB_TYPE:
    - 'sqlite' (Default - File lokal tanpa server terpisah)
    - 'mysql'  (XAMPP MySQL / MariaDB)
    """
    if Config.DB_TYPE.lower() == 'mysql':
        try:
            import pymysql
            conn = pymysql.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            return conn, 'mysql'
        except Exception as e:
            print(f"[PERINGATAN] Gagal terhubung ke MySQL XAMPP: {e}. Mengalihkan ke SQLite lokal.")
    
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite'

def get_all_objects(category=None):
    conn, db_type = get_connection()
    placeholder = "%s" if db_type == 'mysql' else "?"
    query = "SELECT * FROM environmental_objects WHERE 1=1"
    params = []
    if category and category != 'ALL':
        query += f" AND category = {placeholder}"
        params.append(category)
    query += " ORDER BY id DESC"
    
    if db_type == 'mysql':
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
        conn.close()
        return rows
    else:
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [dict(r) for r in rows]

def insert_object(data):
    conn, db_type = get_connection()
    placeholder = "%s" if db_type == 'mysql' else "?"
    ph_list = ", ".join([placeholder] * 13)
    
    query = f"""
        INSERT INTO environmental_objects 
        (name, category, address, regency, district, village, latitude, longitude, geom_type, source, recorded_at, notes, is_dummy)
        VALUES ({ph_list})
    """
    params = (
        data['name'], data['category'], data.get('address', ''),
        data.get('regency', 'Kota Bandung'), data.get('district', ''), data.get('village', ''),
        float(data['latitude']), float(data['longitude']),
        data.get('geom_type', 'Point'), data.get('source', 'Survei Lapangan DLH'),
        data.get('recorded_at', '2024-05-01'), data.get('notes', ''),
        int(data.get('is_dummy', 0))
    )

    if db_type == 'mysql':
        with conn.cursor() as cur:
            cur.execute(query, params)
            new_id = cur.lastrowid
        conn.close()
        return new_id
    else:
        cur = conn.cursor()
        cur.execute(query, params)
        new_id = cur.lastrowid
        conn.commit()
        conn.close()
        return new_id

def update_object(obj_id, data):
    conn, db_type = get_connection()
    placeholder = "%s" if db_type == 'mysql' else "?"
    query = f"""
        UPDATE environmental_objects
        SET name={placeholder}, category={placeholder}, address={placeholder},
            regency={placeholder}, district={placeholder}, village={placeholder},
            latitude={placeholder}, longitude={placeholder}, source={placeholder},
            recorded_at={placeholder}, notes={placeholder}
        WHERE id={placeholder}
    """
    params = (
        data['name'], data['category'], data.get('address', ''),
        data.get('regency', 'Kota Bandung'), data.get('district', ''), data.get('village', ''),
        float(data['latitude']), float(data['longitude']),
        data.get('source', 'Survei Lapangan DLH'), data.get('recorded_at', '2024-05-01'),
        data.get('notes', ''), obj_id
    )

    if db_type == 'mysql':
        with conn.cursor() as cur:
            cur.execute(query, params)
        conn.close()
    else:
        conn.execute(query, params)
        conn.commit()
        conn.close()

def delete_object(obj_id):
    conn, db_type = get_connection()
    placeholder = "%s" if db_type == 'mysql' else "?"
    query = f"DELETE FROM environmental_objects WHERE id = {placeholder}"
    if db_type == 'mysql':
        with conn.cursor() as cur:
            cur.execute(query, (obj_id,))
        conn.close()
    else:
        conn.execute(query, (obj_id,))
        conn.commit()
        conn.close()

def delete_all_dummy():
    conn, db_type = get_connection()
    query = "DELETE FROM environmental_objects WHERE is_dummy = 1"
    if db_type == 'mysql':
        with conn.cursor() as cur:
            cur.execute(query)
        conn.close()
    else:
        conn.execute(query)
        conn.commit()
        conn.close()
