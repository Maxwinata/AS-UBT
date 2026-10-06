import React from 'react';
import { Activity, Clock, User, Settings, Calendar, History } from 'lucide-react';
import { ModificationLog } from '../../types/asrama';

interface ActivityLogProps {
  logs: ModificationLog[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Riwayat Aktivitas & Perubahan (Activity Log)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">Daftar kronologis perubahan pada tarif, skema pembayaran, dan plotting kamar untuk akuntabilitas sistem.</p>
        </div>
      </div>

      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada riwayat aktivitas yang tercatat.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-8">
            {logs.slice().reverse().map(log => {
              const date = new Date(log.timestamp);
              const isRecent = (Date.now() - date.getTime()) < 60000; // less than a minute
              
              return (
                <div key={log.id} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[30px] w-3 h-3 rounded-full border-2 border-white ring-4 ring-white ${isRecent ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                  
                  <div className={`p-4 rounded-xl border ${isRecent ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'} hover:border-slate-300 transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        <span className={log.actor === 'System' ? 'text-blue-600' : log.actor === 'Admin' ? 'text-emerald-600' : 'text-slate-600'}>
                          {log.actor}
                        </span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      {isRecent && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Baru Saja</span>
                      )}
                    </div>
                    
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {log.action}
                    </p>
                    
                    {log.changedFields && log.changedFields.length > 0 && (
                      <div className="mt-3 bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                            <tr>
                              <th className="px-3 py-2 font-medium">Field</th>
                              <th className="px-3 py-2 font-medium">Nilai Lama</th>
                              <th className="px-3 py-2 font-medium">Nilai Baru</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {log.changedFields.map((field, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 font-mono text-slate-700">{field.field}</td>
                                <td className="px-3 py-2 text-rose-600 line-through">{String(field.oldValue)}</td>
                                <td className="px-3 py-2 text-emerald-600 font-medium">{String(field.newValue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
