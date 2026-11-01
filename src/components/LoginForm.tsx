import React, { useState } from 'react';
import { UserRole, UserSession } from '../types/gis';
import { DEFAULT_OFFICIAL_USER, DEFAULT_CITIZEN_USER } from '../services/storageService';
import {
  ShieldCheck,
  Users,
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TreePine,
  KeyRound
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
  const [email, setEmail] = useState(
    currentSession.role === 'dinas' ? DEFAULT_OFFICIAL_USER.email : DEFAULT_CITIZEN_USER.email
  );
  const [name, setName] = useState(
    currentSession.role === 'dinas' ? DEFAULT_OFFICIAL_USER.name : DEFAULT_CITIZEN_USER.name
  );
  const [password, setPassword] = useState('password123');
  const [nipNik, setNipNik] = useState(
    currentSession.role === 'dinas' ? DEFAULT_OFFICIAL_USER.nipOrNik || '' : DEFAULT_CITIZEN_USER.nipOrNik || ''
  );

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'dinas') {
      setEmail(DEFAULT_OFFICIAL_USER.email);
      setName(DEFAULT_OFFICIAL_USER.name);
      setNipNik(DEFAULT_OFFICIAL_USER.nipOrNik || '');
    } else {
      setEmail(DEFAULT_CITIZEN_USER.email);
      setName(DEFAULT_CITIZEN_USER.name);
      setNipNik(DEFAULT_CITIZEN_USER.nipOrNik || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'dinas') {
      onLogin({
        id: 'USR-DLH-' + Date.now().toString().slice(-4),
        name: name || DEFAULT_OFFICIAL_USER.name,
        email: email || DEFAULT_OFFICIAL_USER.email,
        role: 'dinas',
        nipOrNik: nipNik || DEFAULT_OFFICIAL_USER.nipOrNik,
        departmentOrDistrict: 'Bidang Pengelolaan Sampah & B3 DLH',
        avatarColor: '#10b981',
      });
    } else {
      onLogin({
        id: 'USR-CIT-' + Date.now().toString().slice(-4),
        name: name || DEFAULT_CITIZEN_USER.name,
        email: email || DEFAULT_CITIZEN_USER.email,
        role: 'penduduk',
        nipOrNik: nipNik || DEFAULT_CITIZEN_USER.nipOrNik,
        departmentOrDistrict: 'Masyarakat Kota Bandung',
        avatarColor: '#3b82f6',
      });
    }
    onClose();
  };

  const handleQuickDemoOfficial = () => {
    onLogin(DEFAULT_OFFICIAL_USER);
    onClose();
  };

  const handleQuickDemoCitizen = () => {
    onLogin(DEFAULT_CITIZEN_USER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30 mb-3">
            <TreePine className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Portal Masuk GIS DLH</h3>
          <p className="text-xs text-slate-300 mt-1">
            Sistem Informasi Geografis Dinas Lingkungan Hidup — Analisis Spasial NNA & KDE
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition"
          >
            &times;
          </button>
        </div>

        {/* Tab Pilihan Peran: Pihak Dinas vs Penduduk */}
        <div className="grid grid-cols-2 p-3 bg-slate-100/90 gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleChange('dinas')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeRole === 'dinas'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pihak Dinas (DLH)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('penduduk')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeRole === 'penduduk'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Penduduk / Warga</span>
          </button>
        </div>

        {/* Hak Akses Info Box */}
        <div className="px-6 pt-4 text-xs">
          {activeRole === 'dinas' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Hak Akses Pihak Dinas DLH:</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Akses penuh Administrator, Manajemen Objek (CRUD & Impor), Eksekusi NNA & KDE, Evaluasi Pengaduan Warga, Ekspor Data, dan Pembuatan Laporan Resmi PKL.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Hak Akses Penduduk / Warga:</strong>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Peta Fasilitas Terdekat (TPS & Bank Sampah), Memantau Kualitas Udara/Air, Mengirimkan Pengaduan Timbunan Sampah Liar, dan Informasi Edukasi Lingkungan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {activeRole === 'dinas' ? 'Nama Petugas / Analis DLH' : 'Nama Lengkap Warga'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ir. Budi Santoso / Rian Pratama"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@instansi.go.id"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {activeRole === 'dinas' ? 'NIP Pegawai / Kode Dinas' : 'NIK (Nomor Induk Kependudukan)'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={nipNik}
                onChange={(e) => setNipNik(e.target.value)}
                placeholder={activeRole === 'dinas' ? '19850412 201001 1 008' : '3273011508940002'}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                activeRole === 'dinas'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-700/20'
              }`}
            >
              <span>Masuk Sebagai {activeRole === 'dinas' ? 'Pihak Dinas DLH' : 'Penduduk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Opsi Masuk Cepat (One-Click Demo Login) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2 text-center">
            Pilihan Masuk Cepat (Demo Langsung):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoOfficial}
              className="py-2 px-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition text-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Petugas DLH</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDemoCitizen}
              className="py-2 px-2.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition text-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Penduduk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
