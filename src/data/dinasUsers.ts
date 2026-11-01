import { DinasUser, UserSession } from '../types/gis';

/**
 * Data Petugas Resmi Dinas Lingkungan Hidup (Tuan Rumah)
 * Terdaftar secara resmi di basis data MySQL (tabel dinas_users)
 * Hanya akun terdaftar ini yang memiliki wewenang untuk:
 * - Mengakses Dashboard Utama DLH
 * - Melakukan CRUD Objek Lingkungan
 * - Menjalankan Analisis Spasial NNA & KDE
 * - Menyetujui / Memvalidasi Pengaduan Warga
 * - Membuat & Mengunduh Laporan Resmi PKL
 */
export const OFFICIAL_DINAS_USERS: DinasUser[] = [
  {
    id: 'USR-DLH-001',
    nip: '19850412 201001 1 008',
    username: 'budi_dlh',
    name: 'Ir. Budi Santoso, M.Si.',
    position: 'Kepala Bidang Pengelolaan Sampah & B3',
    department: 'Dinas Lingkungan Hidup Kota Bandung',
    email: 'budi.santoso@dlh.bandung.go.id',
    password: 'dlhbandung2024',
    avatarColor: '#10b981',
  },
  {
    id: 'USR-DLH-002',
    nip: '19920315 201802 2 004',
    username: 'siti_gis',
    name: 'Siti Rahmawati, S.T.',
    position: 'Analis SIG & Spasial Lingkungan',
    department: 'Seksi Pemantauan & Sistem Informasi Lingkungan',
    email: 'siti.rahma@dlh.bandung.go.id',
    password: 'dlhbandung2024',
    avatarColor: '#059669',
  },
  {
    id: 'USR-DLH-003',
    nip: '19900822 201601 1 012',
    username: 'admin_dlh',
    name: 'Hendra Wijaya, S.Kom.',
    position: 'Administrator Database & Server GIS',
    department: 'Pusat Data & Informasi DLH',
    email: 'admin.gis@dlh.bandung.go.id',
    password: 'dlhbandung2024',
    avatarColor: '#047857',
  },
  {
    id: 'USR-DLH-004',
    nip: '19951105 202001 1 003',
    username: 'deni_lapangan',
    name: 'Deni Kurniawan, A.Md.',
    position: 'Pengawas Lapangan & Verifikator TPS',
    department: 'Seksi Operasional Persampahan DLH',
    email: 'deni.lapangan@dlh.bandung.go.id',
    password: 'dlhbandung2024',
    avatarColor: '#0f766e',
  },
];

/**
 * Sesi Tamu untuk Warga Masyarakat (Publik)
 * Tidak memerlukan pendaftaran atau input NIK, langsung bisa melihat sebaran titik TPS & sampah
 */
export const GUEST_CITIZEN_SESSION: UserSession = {
  id: 'TAMU-WARGA-PUBLIK',
  name: 'Warga Masyarakat (Tamu)',
  email: 'tamu.warga@publik.bandung.go.id',
  role: 'penduduk',
  isGuest: true,
  departmentOrDistrict: 'Akses Publik Kota Bandung',
  position: 'Tamu / Pengguna Layanan Warga',
  avatarColor: '#3b82f6',
};

/**
 * Verifikasi kredensial Petugas Dinas (Tuan Rumah)
 * Memeriksa NIP, username, atau email serta kecocokan kata sandi
 */
export function authenticateDinasUser(
  identifier: string,
  passwordInput: string
): DinasUser | null {
  const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPass = passwordInput.trim();

  const found = OFFICIAL_DINAS_USERS.find((u) => {
    const matchNip = u.nip.toLowerCase().replace(/\s+/g, '') === cleanId;
    const matchUsername = u.username.toLowerCase() === cleanId;
    const matchEmail = u.email.toLowerCase() === cleanId;
    return matchNip || matchUsername || matchEmail;
  });

  if (!found) {
    return null;
  }

  // Cek kata sandi
  if (found.password !== cleanPass) {
    return null;
  }

  return found;
}
