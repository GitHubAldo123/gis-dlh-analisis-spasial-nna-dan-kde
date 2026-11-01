import math
from pyproj import Transformer

def get_utm_epsg(lon: float, lat: float) -> int:
    """
    Menghitung kode EPSG UTM otomatis berdasarkan bujur dan lintang.
    Wilayah Indonesia terbentang dari zona 46 s.d. 54 belahan bumi selatan/utara.
    """
    utm_zone = int(math.floor((lon + 180) / 6)) + 1
    if lat >= 0:
        return 32600 + utm_zone
    else:
        return 32700 + utm_zone

def project_to_utm(points_wgs84: list):
    """
    Mengonversi daftar koordinat (longitude, latitude) WGS84 ke UTM terproyeksi (meter).
    Mengembalikan: (x_coords, y_coords, epsg_code, zone_number)
    """
    if not points_wgs84:
        return [], [], 4326, 0

    avg_lon = sum(p[0] for p in points_wgs84) / len(points_wgs84)
    avg_lat = sum(p[1] for p in points_wgs84) / len(points_wgs84)

    target_epsg = get_utm_epsg(avg_lon, avg_lat)
    zone_num = target_epsg % 100

    transformer = Transformer.from_crs("EPSG:4326", f"EPSG:{target_epsg}", always_xy=True)

    xs, ys = [], []
    for lon, lat in points_wgs84:
        x, y = transformer.transform(lon, lat)
        xs.append(x)
        ys.append(y)

    return xs, ys, target_epsg, zone_num
