import React from 'react';
import { Clock, ArrowRight, User, Shield } from 'lucide-react';
import { ModificationLog } from '../../types/asrama';

interface AuditLogViewProps {
  logs: ModificationLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Tidak ada riwayat modifikasi data.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.slice().reverse().map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {log.actor === 'Admin' || log.actor === 'System' ? (
                <Shield className="w-4 h-4 text-indigo-600" />
              ) : (
                <User className="w-4 h-4 text-emerald-600" />
              )}
              <span className="font-semibold text-slate-800 text-sm">{log.action}</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {log.actor}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              {new Date(log.timestamp).toLocaleString('id-ID')}
            </div>
          </div>
          
          {log.changedFields && log.changedFields.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">Field</th>
                    <th className="px-4 py-3 font-medium">Nilai Lama (Old Value)</th>
                    <th className="px-2 py-3 font-medium w-8 text-center"></th>
                    <th className="px-4 py-3 font-medium">Nilai Baru (New Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {log.changedFields.map((cf, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-700">{cf.field}</td>
                      <td className="px-4 py-3 text-rose-600">
                        <span className="bg-rose-50 px-2 py-1 rounded line-through opacity-80" title={cf.oldValue}>
                          {cf.oldValue || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center text-slate-300">
                        <ArrowRight className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-emerald-700">
                        <span className="bg-emerald-50 px-2 py-1 rounded font-medium" title={cf.newValue}>
                          {cf.newValue || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-500 italic text-center">
              Tidak ada perubahan nilai spesifik yang direkam.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
