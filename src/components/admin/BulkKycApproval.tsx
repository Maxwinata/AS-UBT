import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, Check, X, AlertCircle, RefreshCw, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

interface PendingKyc {
  id: string;
  nim: string;
  name: string;
  submittedAt: string;
  ktpUrl: string;
  selfieUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const mockPendingData: PendingKyc[] = [
  {
    id: 'kyc-001',
    nim: 'PMB2026-08942',
    name: 'Budi Santoso',
    submittedAt: '2026-08-17T09:30:00Z',
    ktpUrl: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=200&auto=format&fit=crop',
    selfieUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    status: 'PENDING'
  },
  {
    id: 'kyc-002',
    nim: 'PMB2026-09115',
    name: 'Siti Rahma',
    submittedAt: '2026-08-17T10:15:00Z',
    ktpUrl: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=200&auto=format&fit=crop',
    selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    status: 'PENDING'
  },
  {
    id: 'kyc-003',
    nim: 'PMB2026-09220',
    name: 'Ahmad Faisal',
    submittedAt: '2026-08-17T11:05:00Z',
    ktpUrl: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=200&auto=format&fit=crop',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    status: 'PENDING'
  },
  {
    id: 'kyc-004',
    nim: 'PMB2026-09355',
    name: 'Diana Putri',
    submittedAt: '2026-08-17T13:45:00Z',
    ktpUrl: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=200&auto=format&fit=crop',
    selfieUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    status: 'PENDING'
  }
];

export const BulkKycApproval: React.FC = () => {
  const [items, setItems] = useState<PendingKyc[]>(mockPendingData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 3>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const pendingItems = items.filter(item => item.status === 'PENDING');

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map(item => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkAction = (action: 'APPROVED' | 'REJECTED') => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      setItems(prev => prev.map(item => {
        if (selectedIds.has(item.id)) {
          return { ...item, status: action };
        }
        return item;
      }));
      
      setActionSuccess(`Berhasil memproses ${selectedIds.size} data e-KYC mahasiswa.`);
      setSelectedIds(new Set());
      setIsProcessing(false);
      
      setTimeout(() => setActionSuccess(null), 3000);
    }, 1500);
  };

  const handleSingleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
      setActionSuccess(`Satu data e-KYC berhasil diproses.`);
      const newSet = new Set(selectedIds);
      newSet.delete(id);
      setSelectedIds(newSet);
      setIsProcessing(false);
      
      setTimeout(() => setActionSuccess(null), 3000);
    }, 800);
  };

  const gridCols = zoomLevel === 1 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : zoomLevel === 2 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6';

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-medium text-sm">{actionSuccess}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Verifikasi Masal e-KYC
            </h3>
            <p className="text-xs text-slate-500 mt-1">Review foto KTP dan Selfie dari pendaftar secara masal.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 mr-2 shadow-sm">
              <button 
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1) as 1|2|3)}
                className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"
                title="Perbesar Ukuran Kartu"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button 
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1) as 1|2|3)}
                className="p-1.5 hover:bg-slate-50 text-slate-500 rounded"
                title="Perkecil Ukuran Kartu"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {selectedIds.size === pendingItems.length && pendingItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Pilih Semua
            </button>
            <button
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => handleBulkAction('REJECTED')}
              className="px-4 py-2 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-colors"
            >
              Tolak ({selectedIds.size})
            </button>
            <button
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => handleBulkAction('APPROVED')}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              Setujui ({selectedIds.size})
            </button>
          </div>
        </div>
        
        {isProcessing && (
          <div className="bg-indigo-50 px-4 py-2 flex items-center justify-center gap-2 text-indigo-700 text-xs font-medium border-b border-indigo-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Sedang memproses sinkronisasi data ke server...
          </div>
        )}

        <div className="p-4 sm:p-5 bg-slate-50/50 min-h-[400px]">
          {pendingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Semua Selesai!</h4>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">Tidak ada lagi antrean foto e-KYC yang menunggu untuk diverifikasi saat ini.</p>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-4`}>
              {pendingItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative bg-white rounded-2xl border transition-all duration-200 ${selectedIds.has(item.id) ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'}`}
                >
                  <div 
                    className="absolute top-2 left-2 z-10 cursor-pointer p-1 bg-white/90 rounded-md backdrop-blur-sm shadow-sm"
                    onClick={() => toggleSelect(item.id)}
                  >
                    {selectedIds.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex flex-col h-full cursor-pointer" onClick={() => toggleSelect(item.id)}>
                    <div className="flex h-32 sm:h-40 border-b border-slate-100 bg-slate-900 overflow-hidden rounded-t-2xl">
                      {/* Selfie View */}
                      <div className="w-1/2 h-full border-r border-slate-700/50 relative group">
                        <img src={item.selfieUrl} alt="Selfie" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">SELFIE</span>
                      </div>
                      {/* KTP View */}
                      <div className="w-1/2 h-full relative group p-2 flex items-center justify-center">
                        <img src={item.ktpUrl} alt="KTP" className="w-full h-auto max-h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity rounded-sm shadow-md" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">KTP</span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{item.nim}</div>
                      
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSingleAction(item.id, 'APPROVED'); }}
                          disabled={isProcessing}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors border border-emerald-200 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Setuju
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSingleAction(item.id, 'REJECTED'); }}
                          disabled={isProcessing}
                          className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors border border-rose-200 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
