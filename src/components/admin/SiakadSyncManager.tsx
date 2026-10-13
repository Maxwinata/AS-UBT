import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Link2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck, 
  Clock, 
  GraduationCap, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { ApiLinkRecord, SiakadMahasiswaStgRecord } from '../../types/asrama';
import { toast } from 'sonner';

interface SiakadSyncManagerProps {
  apiLinks: ApiLinkRecord[];
  stagingList: SiakadMahasiswaStgRecord[];
  onTriggerSync: () => void;
  onVerifySubsidi: (stgId: number, status: 1 | -1, notes?: string) => void;
}

export const SiakadSyncManager: React.FC<SiakadSyncManagerProps> = ({
  apiLinks,
  stagingList,
  onTriggerSync,
  onVerifySubsidi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'kip' | 'nonkip'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
      toast.success('Sinkronisasi API SIAKAD UBT berhasil! Data staging pra-registrasi telah diperbarui.');
    }, 900);
  };

  const filteredStaging = stagingList.filter((item) => {
    const matchesSearch =
      item.nomor_registrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nik && item.nik.includes(searchTerm)) ||
      (item.program_studi && item.program_studi.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' ? true : item.kategori_beasiswa === categoryFilter;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? item.status_verifikasi_subsidi === 0
        : statusFilter === 'APPROVED'
        ? item.status_verifikasi_subsidi === 1
        : item.status_verifikasi_subsidi === -1;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalKip = stagingList.filter(s => s.kategori_beasiswa === 'kip').length;
  const totalNonKip = stagingList.filter(s => s.kategori_beasiswa === 'nonkip').length;
  const pendingCount = stagingList.filter(s => s.status_verifikasi_subsidi === 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-indigo-400 font-mono font-bold">INTEGRASI BASIS DATA SIAKAD</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-mono text-[11px]">Tabel api_link ➔ siakad_mahasiswa_stg</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight mt-1 text-white">
            Sinkronisasi API SIAKAD UBT & Verifikasi Hak Subsidi
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Menarik data calon mahasiswa dari endpoint resmi SIAKAD (Beasiswa Khusus & KIP) ke tabel pra-registrasi staging. Mahasiswa dapat langsung auto-fill formulir saat mendaftar, sementara hak subsidi tarif tetap diaudit secara akuntabel oleh Admin Keuangan.
          </p>
        </div>

        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menghubungkan SIAKAD...' : 'Tarik Data SIAKAD Sekarang'}</span>
        </button>
      </div>

      {/* 2 Endpoint Cards (Mirroring phpMyAdmin api_link Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiLinks.map((link) => {
          const isKip = link.kategori === 'kip';
          const recordsCount = stagingList.filter(s => s.kategori_beasiswa === link.kategori).length;

          return (
            <div
              key={link.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${isKip ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{link.nama}</span>
                      <span className="text-xs text-slate-400 font-mono">ID: {link.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                      <span>kategori: {link.kategori}</span>
                      <span>·</span>
                      <span>jenis: {link.jenis}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-base tabular-nums">
                    {recordsCount} Calon
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Endpoint Aktif</span>
                  </div>
                </div>
              </div>

              {/* Endpoint Link Container */}
              <div className="mt-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between gap-2 text-xs font-mono text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{link.link}</span>
                </div>
                <a
                  href={link.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 shrink-0 p-1 rounded hover:bg-white"
                  title="Buka Link API di Tab Baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Terakhir ditarik: {link.last_synced_at || 'Hari ini, 10:00 WIB'}
                </span>
                <span className="text-slate-500 font-medium">Auto-Sync Harian Aktif</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staging Data Table (siakad_mahasiswa_stg) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Daftar Calon Mahasiswa Pra-Registrasi (Tabel `siakad_mahasiswa_stg`)</span>
            </h4>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Total: {stagingList.length} data</span>
              <span>·</span>
              <span>KIP: {totalKip}</span>
              <span>·</span>
              <span>Beasiswa Khusus: {totalNonKip}</span>
              {pendingCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-amber-700 font-medium">{pendingCount} menunggu verifikasi subsidi</span>
                </>
              )}
            </div>
          </div>

          {/* Search & Segmented Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari PMB, Nama, NIK, Prodi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setCategoryFilter('kip')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'kip' ? 'bg-white text-amber-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KIP
              </button>
              <button
                onClick={() => setCategoryFilter('nonkip')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === 'nonkip' ? 'bg-white text-blue-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Beasiswa Khusus
              </button>
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">No. Registrasi / PMB</th>
                <th className="p-3.5">Nama & Identitas</th>
                <th className="p-3.5">Program Studi</th>
                <th className="p-3.5">Jalur SIAKAD</th>
                <th className="p-3.5">Status Klaim Maba</th>
                <th className="p-3.5">Verifikasi Hak Subsidi</th>
                <th className="p-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredStaging.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data calon mahasiswa yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStaging.map((item) => {
                  const isKip = item.kategori_beasiswa === 'kip';
                  const isApproved = item.status_verifikasi_subsidi === 1;
                  const isRejected = item.status_verifikasi_subsidi === -1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <div>{item.nomor_registrasi}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          NIK: {item.nik || '-'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.nama_lengkap}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{item.email || '-'}</span>
                          <span>·</span>
                          <span>{item.nomor_telepon || '-'}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{item.program_studi}</div>
                        <div className="text-[10px] text-slate-500">{item.fakultas}</div>
                      </td>

                      <td className="p-3.5 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isKip ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                          <span className={isKip ? 'text-amber-800 font-bold' : 'text-blue-800 font-bold'}>
                            {item.nama_beasiswa}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Endpoint: {isKip ? 'mahasiswa-btt-002' : 'mahasiswa-btt-006'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {item.status_klaim === 1 ? (
                          <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Form Terisi (Aktif)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum Klaim Form</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {isApproved ? (
                          <div>
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Subsidi Sah (Disetujui)
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Oleh: {item.verified_by || 'Admin Keuangan'}
                            </div>
                          </div>
                        ) : isRejected ? (
                          <div>
                            <span className="text-red-700 font-semibold text-[11px] flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              Tarif Normal (Ditolak)
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Subsidi tidak berlaku</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Menunggu Review Admin
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Gunakan tombol verifikasi</div>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {!isApproved && (
                          <button
                            onClick={() => onVerifySubsidi(item.id, 1, 'Disetujui oleh Admin Keuangan')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Setujui hak subsidi tarif/deposit untuk mahasiswa ini"
                          >
                            <Check className="w-3 h-3" /> Setujui
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => onVerifySubsidi(item.id, -1, 'Ditetapkan menggunakan tarif standar')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Tolak subsidi dan kenakan tarif asrama reguler"
                          >
                            <XCircle className="w-3 h-3" /> Tolak
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Informational Guidance Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Kepatuhan Audit:</strong> Data SIAKAD yang ditarik berfungsi sebagai data pra-registrasi. Subsidi beasiswa hanya akan memotong deposit/tarif pada invoice maba jika status verifikasi telah disetujui oleh Admin Keuangan.
            </span>
          </div>
          <span className="font-mono text-slate-400 text-[11px] shrink-0">CRON: siakad:sync</span>
        </div>
      </div>
    </div>
  );
};
