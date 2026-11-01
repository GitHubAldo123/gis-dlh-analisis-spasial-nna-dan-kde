import io
import base64
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.stats import gaussian_kde

def generate_kde(points, bandwidth=None, grid_resolution=80, kernel='gaussian'):
    """
    Perhitungan Kernel Density Estimation (KDE) 2D
    Menghasilkan citra raster PNG base64 transparan untuk ditampilkan langsung di Leaflet L.imageOverlay.
    """
    if len(points) < 3:
        raise ValueError("Analisis KDE membutuhkan minimal 3 titik koordinat objek.")

    lons = np.array([p['longitude'] for p in points])
    lats = np.array([p['latitude'] for p in points])

    # Tambahkan padding geospasial 15%
    lon_pad = (lons.max() - lons.min()) * 0.15 or 0.015
    lat_pad = (lats.max() - lats.min()) * 0.15 or 0.015

    min_lon, max_lon = lons.min() - lon_pad, lons.max() + lon_pad
    min_lat, max_lat = lats.min() - lat_pad, lats.max() + lat_pad

    grid_lon, grid_lat = np.meshgrid(
        np.linspace(min_lon, max_lon, grid_resolution),
        np.linspace(min_lat, max_lat, grid_resolution)
    )

    positions = np.vstack([grid_lon.ravel(), grid_lat.ravel()])
    values = np.vstack([lons, lats])

    kde = gaussian_kde(values, bw_method=bandwidth)
    density = np.reshape(kde(positions).T, grid_lon.shape)

    val_flat = density.flatten()
    q33 = float(np.percentile(val_flat, 33.3))
    q66 = float(np.percentile(val_flat, 66.6))
    max_density = float(np.max(density))

    # Hitung jumlah sel kategori hotspot (kuantil di atas 66%)
    hotspots_count = int(np.sum(density >= q66))

    # Render PNG transparan
    fig, ax = plt.subplots(figsize=(6, 6), dpi=150)
    fig.patch.set_alpha(0.0)
    ax.patch.set_alpha(0.0)
    ax.axis('off')

    levels = np.linspace(density.min(), density.max(), 30)
    ax.contourf(grid_lon, grid_lat, density, levels=levels, cmap='YlOrRd', alpha=0.72)

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', pad_inches=0, transparent=True)
    buffer.seek(0)
    img_b64 = base64.b64encode(buffer.read()).decode('utf-8')
    plt.close(fig)

    return {
        "image_base64": f"data:image/png;base64,{img_b64}",
        "bounds": [
            [float(min_lat), float(min_lon)],
            [float(max_lat), float(max_lon)]
        ],
        "statistics": {
            "bandwidth_factor": float(kde.factor),
            "max_density": max_density,
            "threshold_low": q33,
            "threshold_medium": q66,
            "hotspots_count": hotspots_count,
            "grid_resolution": grid_resolution,
            "classification_method": "Kuantil Spasial 3 Kelas (Rendah, Sedang, Tinggi / Hotspot)"
        },
        "interpretation": (
            f"Analisis KDE mendeteksi {hotspots_count} sel raster intensitas tinggi (Hotspot). "
            "Pola konsentrasi lokal mengindikasikan prioritas penambahan armada pengangkutan atau pendirian TPS3R."
        )
    }
