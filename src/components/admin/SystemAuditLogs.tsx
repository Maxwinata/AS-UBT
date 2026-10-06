import React, { useState } from 'react';
import { Activity, LogIn, KeyRound, Building, CheckCircle2, ShieldAlert, Filter, Search, ShieldCheck } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actionType: 'LOGIN' | 'ROOM_PLOT' | 'CONTRACT_SIGN' | 'CHECKOUT' | 'SECURITY' | 'EKYC_VERIFICATION';
  user: string;
  description: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
}

const DUMMY_LOGS: AuditLog[] = [
  {
    id: 'LOG-000-A',
    timestamp: '2026-08-18 09:20:15',
    actionType: 'EKYC_VERIFICATION',
    user: 'ADM-ASR-01 (Admin)',
    description: 'Bulk approved e-KYC selfies for 4 students.',
    status: 'SUCCESS',
    ipAddress: '10.0.0.5'
  },
  {
    id: 'LOG-000-B',
    timestamp: '2026-08-18 09:25:40',
    actionType: 'EKYC_VERIFICATION',
    user: 'ADM-ASR-02 (SPV)',
    description: 'Rejected e-KYC selfie for PMB2026-09115 (Face mismatch).',
    status: 'WARNING',
    ipAddress: '10.0.0.12'
  },
  {
    id: 'LOG-001',
    timestamp: '2026-08-10 10:45:12',
    actionType: 'LOGIN',
    user: 'MaxWinata@gmail.com (Maba)',
    description: 'Successful dual-tab login via Maba portal.',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-08-10 10:47:33',
    actionType: 'ROOM_PLOT',
    user: 'ADM-ASR-01 (Admin)',
    description: 'Plotted PMB2026-08942 to Gedung A - Kamar 101.',
    status: 'SUCCESS',
    ipAddress: '10.0.0.5'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-08-10 10:50:05',
    actionType: 'CONTRACT_SIGN',
    user: 'PMB2026-08942',
    description: 'Digital contract signed via OTP verification.',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-08-10 11:02:18',
    actionType: 'LOGIN',
    user: '2240101088 (SSO)',
    description: 'Failed SSO login attempt. Invalid credentials.',
    status: 'FAILED',
    ipAddress: '203.0.113.45'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-08-10 11:05:42',
    actionType: 'SECURITY',
    user: 'SYSTEM',
    description: 'Multiple failed login attempts from IP 203.0.113.45',
    status: 'WARNING',
    ipAddress: '203.0.113.45'
  }
];

export const SystemAuditLogs: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = DUMMY_LOGS.filter(log => {
    const matchesFilter = filterType === 'ALL' || log.actionType === filterType;
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionIcon = (type: string) => {
    switch(type) {
      case 'LOGIN': return <LogIn className="w-4 h-4" />;
      case 'ROOM_PLOT': return <Building className="w-4 h-4" />;
      case 'CONTRACT_SIGN': return <KeyRound className="w-4 h-4" />;
      case 'SECURITY': return <ShieldAlert className="w-4 h-4" />;
      case 'EKYC_VERIFICATION': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'WARNING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            System Audit Logs
          </h3>
          <p className="text-sm text-slate-500 mt-1">Real-time tracking of security events and critical state changes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user or event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 appearance-none bg-white cursor-pointer"
            >
              <option value="ALL">All Events</option>
              <option value="LOGIN">Logins</option>
              <option value="ROOM_PLOT">Room Plotting</option>
              <option value="CONTRACT_SIGN">Contracts</option>
              <option value="SECURITY">Security</option>
              <option value="EKYC_VERIFICATION">e-KYC Verification</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">IP Address</th>
              <th className="px-4 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{getActionIcon(log.actionType)}</span>
                    <span className="font-medium">{log.actionType}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{log.user}</td>
                <td className="px-4 py-3 truncate max-w-xs" title={log.description}>{log.description}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ipAddress}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No audit logs found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
