import React from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck, ShieldAlert, FileText, UserCheck } from 'lucide-react';

export interface VerificationAttempt {
  id: string;
  timestamp: Date;
  type: 'KTP' | 'Selfie' | 'KYC_SUBMISSION';
  status: 'success' | 'error';
  message: string;
}

interface VerifikasiTrailProps {
  history: VerificationAttempt[];
}

export function VerifikasiTrail({ history }: VerifikasiTrailProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-4">
        <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Verifikasi Trail (Audit Log)</h3>
          <p className="text-[11px] text-slate-500">Riwayat upaya pemindaian biometrik e-KYC AI</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((attempt, index) => (
          <div 
            key={attempt.id} 
            className="flex items-start space-x-3 relative before:absolute before:left-4 before:top-8 before:bottom-[-16px] before:w-[2px] before:bg-slate-200 last:before:hidden"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm ${attempt.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {attempt.type === 'KTP' ? <FileText className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </div>
            
            <div className={`flex-1 rounded-xl p-3 border ${attempt.status === 'success' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-800">Pemindaian {attempt.type}</span>
                  {attempt.status === 'success' ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Ditolak</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {attempt.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                {attempt.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
