import React, { useState } from 'react';
import { UserRole, UserSession } from '../types/gis';
import {
  OFFICIAL_DINAS_USERS,
  GUEST_CITIZEN_SESSION,
  authenticateDinasUser,
} from '../data/dinasUsers';
import {
  ShieldCheck,
  Users,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TreePine,
  KeyRound,
  AlertTriangle,
  Building2,
  MapPin,
  Send,
  Info,
  BadgeCheck,
} from 'lucide-react';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
  currentSession: UserSession;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentSession,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(currentSession.role || 'dinas');

  // State untuk form login Pihak Dinas
  const [dinasIdentifier, setDinasIdentifier] = useState(OFFICIAL_DINAS_USERS[0].nip);
  const [dinasPassword, setDinasPassword] = useState('dlhbandung2024');
  const [dinasError, setDinasError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler Submit untuk Pihak Dinas (Tuan Rumah)
  const handleDinasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDinasError(null);

    const authenticated = authenticateDinasUser(dinasIdentifier, dinasPassword);
    if (!authenticated) {
      setDinasError(
        'Kredensial Petugas Dinas tidak cocok! Pastikan NIP/Username/Email dan kata sandi sesuai dengan data resmi pegawai DLH di database.'
      );
      return;
    }

    const session: UserSession = {
      id: authenticated.id,
      name: authenticated.name,
      email: authenticated.email,
      role: 'dinas',
      isGuest: false,
      nipOrNik: authenticated.nip,
      position: authenticated.position,
      departmentOrDistrict: authenticated.department,
      avatarColor: authenticated.avatarColor,
    };

    onLogin(session);
    onClose();
  };

  // Pilih langsung akun dinas resmi (Quick Selector)
  const handleSelectOfficialAccount = (accountIndex: number) => {
    const acc = OFFICIAL_DINAS_USERS[accountIndex];
    setDinasIdentifier(acc.nip);
    setDinasPassword('dlhbandung2024');
    setDinasError(null);

    const session: UserSession = {
      id: acc.id,
      name: acc.name,
      email: acc.email,
      role: 'dinas',
      isGuest: false,
      nipOrNik: acc.nip,
      position: acc.position,
      departmentOrDistrict: acc.department,
      avatarColor: acc.avatarColor,
    };

    onLogin(session);
    onClose();
  };

  // Handler Masuk Langsung Tamu (Penduduk / Warga)
  const handleGuestCitizenLogin = () => {
    onLogin(GUEST_CITIZEN_SESSION);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 text-white text-center relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30 mb-2.5">
            <TreePine className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Portal Masuk Sistem GIS DLH</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Dinas Lingkungan Hidup — Pemetaan Spasial NNA & KDE
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition"
          >
            &times;
          </button>
        </div>

        {/* Tab Pilihan Peran: Pihak Dinas (Tuan Rumah) vs Penduduk (Tamu) */}
        <div className="grid grid-cols-2 p-3 bg-slate-100 gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveRole('dinas');
              setDinasError(null);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeRole === 'dinas'
                ? 'bg-emerald-600 text-white shadow-sm font-bold ring-2 ring-emerald-600/30'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-bold">Pihak Dinas DLH</span>
              <span className="block text-[10px] opacity-80 font-normal">Tuan Rumah (Kredensial)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('penduduk');
              setDinasError(null);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeRole === 'penduduk'
                ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-600/30'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <div className="text-left">
              <span className="block font-bold">Penduduk / Warga</span>
              <span className="block text-[10px] opacity-80 font-normal">Tamu (Masuk Langsung)</span>
            </div>
          </button>
        </div>

        {/* KONTEN TAB 1: PIHAK DINAS (TUAN RUMAH) */}
        {activeRole === 'dinas' && (
          <div className="p-5 space-y-4 text-xs">
            {/* Informasi Hak Akses Tuan Rumah */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>Akses Pihak Dinas (Tuan Rumah)</span>
                  <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                    MySQL Auth
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Hanya staf dan pejabat DLH terdaftar di basis data yang dapat mengakses Dashboard Tuan Rumah, Manajemen Data Objek (CRUD & Impor), Eksekusi Analisis Spasial NNA & KDE, Verifikasi Pengaduan, dan Pembuatan Laporan Resmi PKL.
                </p>
              </div>
            </div>

            {/* Alert Error jika kredensial salah */}
            {dinasError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{dinasError}</p>
              </div>
            )}

            {/* Form Input Kredensial Dinas */}
            <form onSubmit={handleDinasSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP / Username / Email Petugas Dinas:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={dinasIdentifier}
                    onChange={(e) => setDinasIdentifier(e.target.value)}
                    placeholder="Contoh: 19850412 201001 1 008 atau budi_dlh"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={dinasPassword}
                    onChange={(e) => setDinasPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun dinas"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                  <span>Kata sandi default akun resmi: <strong className="font-mono text-slate-700">dlhbandung2024</strong></span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk sebagai Petugas Dinas (Tuan Rumah)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            {/* Daftar Akun Resmi Terdaftar di MySQL (1-Click Switch untuk Penguji/Dosen PKL) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Data User Dinas Terdaftar di MySQL:
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk langsung masuk</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OFFICIAL_DINAS_USERS.map((user, idx) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectOfficialAccount(idx)}
                    className="p-2.5 text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-800 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold truncate">
                        {user.position}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
                        NIP: {user.nip}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>User: {user.username}</span>
                      <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
                        Pilih <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB 2: PENDUDUK / WARGA (TAMU - GUEST) */}
        {activeRole === 'penduduk' && (
          <div className="p-6 space-y-4 text-xs">
            {/* Kartu Selamat Datang Tamu */}
            <div className="text-center p-5 bg-gradient-to-b from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30 mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Selamat Datang, Warga Masyarakat!
              </h4>
              <p className="text-xs text-blue-900 font-medium mt-1">
                Akses Langsung sebagai <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Tamu (Guest)</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Anda tidak perlu mengisi formulir pendaftaran atau data kependudukan (NIK). Warga dapat langsung menjelajahi peta sebaran TPS dan fasilitas persampahan kota.
              </p>
            </div>

            {/* Fitur yang dapat diakses Tamu */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Layanan & Fitur yang Tersedia untuk Tamu:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Peta Sebaran Titik TPS & Sampah Interaktif</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cari Lokasi TPS Terdekat dari Tempat Tinggal</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Form Pengaduan Timbulan Sampah Liar</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Panduan Pemilahan Sampah Organik & 3R</span>
                </div>
              </div>
            </div>

            {/* Catatan Perbedaan Peran */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2 text-[11px]">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan Akses:</strong> Fitur manajemen basis data master (CRUD), impor shapefile/CSV, dan kalkulasi analisis spasial NNA/KDE adalah wewenang <strong>Pihak Dinas (Tuan Rumah)</strong>.
              </p>
            </div>

            {/* Tombol 1-Klik Masuk Langsung Tamu */}
            <button
              type="button"
              onClick={handleGuestCitizenLogin}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Masuk Langsung sebagai Tamu (Portal Warga)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Dialog */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Sistem Informasi Geografis DLH</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
