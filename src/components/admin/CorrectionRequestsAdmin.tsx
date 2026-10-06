import React, { useState } from 'react';
import { FileEdit, Check, X, Search, Lock, Unlock, Phone, FileText, ArrowRight } from 'lucide-react';
import { AuditLogView } from '../shared/AuditLogView';

interface CorrectionRequest {
  id: string;
  nim: string;
  nama: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  editableFields?: string[];
  modificationLogs?: {
    id: string;
    timestamp: string;
    actor: 'User' | 'Admin' | 'System';
    action: string;
    changedFields: { field: string; oldValue: any; newValue: any }[];
  }[];
}

const INITIAL_REQUESTS: CorrectionRequest[] = [
  {
    id: 'REQ-001',
    nim: 'PMB2026-08942',
    nama: 'Bagus Pratama Putra',
    date: '2026-08-13 14:30',
    reason: 'Nomor HP Wali salah ketik, seharusnya 081234567...',
    status: 'PENDING',
  },
  {
    id: 'REQ-002',
    nim: 'PMB2026-09112',
    nama: 'Siti Aminah',
    date: '2026-08-12 09:15',
    reason: 'Data alamat KTP pindah RT, butuh update sebelum TTE',
    status: 'PENDING',
  },
  {
    id: 'REQ-003',
    nim: 'PMB2026-07884',
    nama: 'Ahmad Raihan',
    date: '2026-08-10 11:20',
    reason: 'Salah upload pas foto (terupload foto bebas)',
    status: 'APPROVED',
    editableFields: ['ktpUrl', 'selfieUrl'],
    modificationLogs: [
      {
        id: 'log-1',
        timestamp: '2026-08-10T13:45:00Z',
        actor: 'User',
        action: 'Pembaruan Data Koreksi',
        changedFields: [
          { field: 'selfieUrl', oldValue: 'private_storage/kyc/selfie_07884_old.enc', newValue: 'private_storage/kyc/selfie_07884_new.enc' }
        ]
      }
    ]
  },
];

export const CorrectionRequestsAdmin: React.FC = () => {
  const [requests, setRequests] = useState<CorrectionRequest[]>(INITIAL_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for Partial Unlock
  const [approvalModalId, setApprovalModalId] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Modal State for Audit Trail
  const [logModalData, setLogModalData] = useState<CorrectionRequest | null>(null);

  const handleOpenApproveModal = (id: string) => {
    setApprovalModalId(id);
    setSelectedFields([]);
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
  };

  const handleConfirmApprove = () => {
    if (!approvalModalId) return;
    setRequests(requests.map(req => 
      req.id === approvalModalId ? { ...req, status: 'APPROVED', editableFields: selectedFields } : req
    ));
    setApprovalModalId(null);
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'REJECTED' } : req
    ));
  };

  const filteredRequests = requests.filter(req => 
    req.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.nim.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-indigo-600" />
              <span>Pengajuan Koreksi Data (e-KYC & Profil)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kelola permintaan mahasiswa untuk membuka kunci form pendaftaran yang sudah disubmit.
            </p>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIM atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-200">ID & Tanggal</th>
                <th className="p-4 font-bold border-b border-slate-200">Mahasiswa</th>
                <th className="p-4 font-bold border-b border-slate-200">Alasan Koreksi</th>
                <th className="p-4 font-bold border-b border-slate-200">Status</th>
                <th className="p-4 font-bold border-b border-slate-200 text-right">Aksi (Unlock Form)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-xs font-bold text-slate-700">{req.id}</div>
                    <div className="text-[11px] text-slate-500">{req.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{req.nama}</div>
                    <div className="text-xs text-slate-500">{req.nim}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-xs text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100 italic">
                      "{req.reason}"
                    </p>
                  </td>
                  <td className="p-4">
                    {req.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3" /> PENDING
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        <Unlock className="w-3 h-3" /> UNLOCKED
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <Lock className="w-3 h-3" /> REJECTED
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          title="Tolak Permintaan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Approve & Unlock</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-400 italic">Diselesaikan</span>
                        {req.status === 'APPROVED' && req.editableFields && req.editableFields.length > 0 && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            Unlocked: {req.editableFields.join(', ')}
                          </span>
                        )}
                        {req.modificationLogs && req.modificationLogs.length > 0 && (
                          <button
                            onClick={() => setLogModalData(req)}
                            className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded font-semibold transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            Audit Trail
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Tidak ada pengajuan koreksi data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL APPROVAL & PARTIAL UNLOCK */}
      {approvalModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 flex items-center space-x-2">
                <Unlock className="w-5 h-5 text-indigo-600" />
                <span>Pilih Bagian Form (Partial Unlock)</span>
              </h3>
              <button
                type="button"
                onClick={() => setApprovalModalId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <p>
                Pilih bagian form mana saja yang diizinkan untuk diubah oleh mahasiswa. 
                Bagian yang tidak dicentang akan tetap terkunci rapat (read-only).
              </p>
              
                            <div className="flex items-center space-x-2 pt-2 pb-1 text-[11px] font-bold text-indigo-700 uppercase tracking-widest border-t border-slate-100 mt-4">
                <span>ADMISSION FORM</span>
                <span className="text-indigo-300">•</span>
                <span>ASRAMA UBT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start mt-2 max-h-[55vh] overflow-y-auto pr-2 pb-4">
                
                {/* GROUP 1: DATA AKADEMIK */}
                <div className="md:col-span-1 lg:col-span-4">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">1</span> Data Akademik
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'nama', label: 'Nama Lengkap' },
                      { id: 'nim', label: 'NIM' },
                      { id: 'prodi', label: 'Program Studi' },
                    ].map((field) => (
                      <label key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={`font-semibold text-xs ${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 2: KONTAK PRIBADI */}
                <div className="md:col-span-1 lg:col-span-4">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">2</span> Kontak Pribadi
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'email', label: 'Email Aktif' },
                      { id: 'noHpWa', label: 'Nomor HP (WhatsApp)' },
                      { id: 'alamatUtama', label: 'Alamat Domisili / KTP' },
                    ].map((field) => (
                      <label key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={`font-semibold text-xs ${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 3: KONTAK DARURAT */}
                <div className="md:col-span-1 lg:col-span-4">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">3</span> Kontak Darurat
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'kontakDaruratNama', label: 'Nama Kontak Darurat 1' },
                      { id: 'kontakDaruratHp', label: 'No HP Kontak Darurat 1' },
                      { id: 'kontakDaruratHubungan', label: 'Hubungan Kontak Darurat 1' },
                      { id: 'kontakDaruratAlamat', label: 'Alamat Kontak Darurat 1' },
                    ].map((field) => (
                      <label key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={`font-semibold text-xs ${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 4: PREFERENSI HUNIAN */}
                <div className="md:col-span-1 lg:col-span-6">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">4</span> Preferensi Hunian
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'tipeKamar', label: 'Preferensi Kamar' },
                      { id: 'kebutuhanKhusus', label: 'Kebutuhan Khusus / Kesehatan' },
                    ].map((field) => (
                      <label key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={`font-semibold text-xs ${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 5: UPLOAD DOKUMEN & e-KYC */}
                <div className="md:col-span-2 lg:col-span-6">
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">5</span> Upload Dokumen & e-KYC
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'ktpUrl', label: 'Upload KTP' },
                      { id: 'selfieUrl', label: 'Upload Swafoto' }
                    ].map((field) => (
                      <label key={field.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={`font-semibold text-xs ${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setApprovalModalId(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={selectedFields.length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md flex items-center space-x-2 text-xs transition-colors"
              >
                <Check className="w-4 h-4 text-indigo-300" />
                <span>Setujui & Buka Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {logModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  Audit Trail: {logModalData.nama}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{logModalData.nim} - {logModalData.id}</p>
              </div>
              <button onClick={() => setLogModalData(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              <AuditLogView logs={logModalData.modificationLogs || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
