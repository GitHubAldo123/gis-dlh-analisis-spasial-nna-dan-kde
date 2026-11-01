import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dlh-secret-gis-token-2024')
    
    # Pilihan Tipe Database: 'sqlite' atau 'mysql'
    # Jika menggunakan XAMPP, ubah DB_TYPE menjadi 'mysql'
    DB_TYPE = os.environ.get('DB_TYPE', 'sqlite')
    
    # Konfigurasi SQLite (Default - Portabel tanpa instalasi server)
    SQLITE_DB_PATH = os.path.join(BASE_DIR, 'database', 'gis_dlh.db')
    
    # Konfigurasi MySQL XAMPP
    MYSQL_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')  # Default XAMPP password kosong
    MYSQL_DB = os.environ.get('MYSQL_DB', 'gis_dlh')
