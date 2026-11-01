import numpy as np
from scipy.spatial import cKDTree
from scipy.stats import norm
from services.spatial_utils import project_to_utm

def calculate_nna(points, study_area_m2=None):
    """
    Perhitungan Nearest Neighbor Analysis (NNA) menggunakan cKDTree.
    Titik diproyeksikan ke sistem koordinat planar metrik UTM.
    """
    n = len(points)
    if n < 4:
        raise ValueError("Analisis NNA membutuhkan minimal 4 titik koordinat objek yang valid.")

    wgs_coords = [(p['longitude'], p['latitude']) for p in points]
    xs, ys, epsg, zone_num = project_to_utm(wgs_coords)
    pts_planar = np.column_stack((xs, ys))

    # Tentukan batas wilayah studi
    min_x, min_y = np.min(pts_planar, axis=0)
    max_x, max_y = np.max(pts_planar, axis=0)

    width = max_x - min_x
    height = max_y - min_y
    if width <= 0 or height <= 0:
        raise ValueError("Seluruh titik koordinat berada pada satu garis lurus atau identik.")

    if study_area_m2 is None or study_area_m2 <= 0:
        # Bounding box dengan buffer adaptif 5%
        study_area_m2 = (width * 1.1) * (height * 1.1)

    # KDTree untuk mencari tetangga terdekat dalam meter
    tree = cKDTree(pts_planar)
    distances, indices = tree.query(pts_planar, k=2)

    nn_distances = distances[:, 1]
    nearest_indices = indices[:, 1]

    # Rumus Matematis NNA (Clark & Evans, 1954)
    Do = float(np.mean(nn_distances))
    point_density = n / study_area_m2
    De = float(1.0 / (2.0 * np.sqrt(point_density)))
    R = float(Do / De)

    # Standard Error dan Z-Score
    se = float(0.26136 / np.sqrt(n * point_density))
    z_score = float((Do - De) / se)
    p_value = float(2.0 * (1.0 - norm.cdf(abs(z_score))))

    # Klasifikasi Pola Persebaran
    if R < 0.85:
        pola = "Mengelompok (Clustered)"
        penjelasan = f"Nilai R = {R:.3f} (< 0.85). Objek lingkungan cenderung membentuk klaster terkonsentrasi."
    elif R > 1.15:
        pola = "Seragam / Teratur (Dispersed)"
        penjelasan = f"Nilai R = {R:.3f} (> 1.15). Objek lingkungan tersebar teratur saling berjauhan."
    else:
        pola = "Acak (Random)"
        penjelasan = f"Nilai R = {R:.3f} (0.85 - 1.15). Persebaran objek lingkungan mengikuti pola acak Poisson."

    nearest_lines = []
    for i in range(n):
        nearest_lines.append({
            "from_id": points[i].get('id', str(i+1)),
            "from_name": points[i].get('name', f"Objek {i+1}"),
            "from_coords": [points[i]['latitude'], points[i]['longitude']],
            "to_id": points[nearest_indices[i]].get('id', str(nearest_indices[i]+1)),
            "to_name": points[nearest_indices[i]].get('name', f"Objek {nearest_indices[i]+1}"),
            "to_coords": [points[nearest_indices[i]]['latitude'], points[nearest_indices[i]]['longitude']],
            "distance_meter": round(float(nn_distances[i]), 2)
        })

    return {
        "total_points": n,
        "crs_used": f"WGS84 / UTM Zona {zone_num} (EPSG:{epsg})",
        "study_area_m2": round(study_area_m2, 2),
        "study_area_km2": round(study_area_m2 / 1_000_000, 4),
        "observed_mean_distance_m": round(Do, 2),
        "expected_mean_distance_m": round(De, 2),
        "nna_index_r": round(R, 4),
        "z_score": round(z_score, 4),
        "p_value": round(p_value, 6),
        "is_statistically_significant": p_value < 0.05,
        "pattern_result": pola,
        "interpretation": penjelasan,
        "distance_details": [round(float(d), 2) for d in nn_distances],
        "nearest_pairs": nearest_lines
    }
