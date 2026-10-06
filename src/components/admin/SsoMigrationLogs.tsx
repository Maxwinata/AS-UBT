import React, { useState } from 'react';
import { RefreshCcw, UserPlus, FileCheck, Building, Key, Search, Filter } from 'lucide-react';

interface MigrationEvent {
  id: string;
  timestamp: string;
  pmbNumber: string;
  nim?: string;
  studentName: string;
  eventType: 'PMB_REGISTERED' | 'PAYMENT_VERIFIED' | 'ROOM_ASSIGNED' | 'SSO_LINKED';
  details: string;
  status: 'PENDING' | 'COMPLETED';
}

const MIGRATION_LOGS: MigrationEvent[] = [
  {
    id: 'MIG-004',
    timestamp: '2026-08-14 09:30:15',
    pmbNumber: 'PMB2026-08942',
    nim: '241010045',
    studentName: 'Bagus Pratama Putra',
    eventType: 'SSO_LINKED',
    details: 'SIAKAD generated NIM. Successfully linked SSO account to PMB profile.',
    status: 'COMPLETED'
  },
  {
    id: 'MIG-003',
    timestamp: '2026-08-12 14:20:00',
    pmbNumber: 'PMB2026-08942',
    studentName: 'Bagus Pratama Putra',
    eventType: 'ROOM_ASSIGNED',
    details: 'Admin plotted to Gedung A - Kamar 101.',
    status: 'COMPLETED'
  },
  {
    id: 'MIG-002',
    timestamp: '2026-08-11 11:05:22',
    pmbNumber: 'PMB2026-08942',
    studentName: 'Bagus Pratama Putra',
    eventType: 'PAYMENT_VERIFIED',
    details: 'Finance verified 12-month boarding fee payment.',
    status: 'COMPLETED'
  },
  {
    id: 'MIG-001',
    timestamp: '2026-08-10 08:15:10',
    pmbNumber: 'PMB2026-08942',
    studentName: 'Bagus Pratama Putra',
    eventType: 'PMB_REGISTERED',
    details: 'Initial MABA registration via Guest Portal.',
    status: 'COMPLETED'
  },
  {
    id: 'MIG-005',
    timestamp: '2026-08-14 10:15:00',
    pmbNumber: 'PMB2026-09105',
    studentName: 'Siti Aminah',
    eventType: 'PMB_REGISTERED',
    details: 'Initial MABA registration via Guest Portal.',
    status: 'COMPLETED'
  },
  {
    id: 'MIG-006',
    timestamp: '2026-08-14 11:20:30',
    pmbNumber: 'PMB2026-09105',
    studentName: 'Siti Aminah',
    eventType: 'PAYMENT_VERIFIED',
    details: 'Finance verified 6-month boarding fee payment.',
    status: 'COMPLETED'
  }
];

export const SsoMigrationLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = MIGRATION_LOGS.filter(log => {
    const matchesSearch = 
      log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.pmbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.nim && log.nim.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'ALL' || log.eventType === filterType;

    return matchesSearch && matchesFilter;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PMB_REGISTERED': return <UserPlus className="w-4 h-4 text-slate-500" />;
      case 'PAYMENT_VERIFIED': return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'ROOM_ASSIGNED': return <Building className="w-4 h-4 text-indigo-500" />;
      case 'SSO_LINKED': return <Key className="w-4 h-4 text-amber-500" />;
      default: return <RefreshCcw className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'PMB_REGISTERED': return '1. PMB Regis';
      case 'PAYMENT_VERIFIED': return '2. Payment OK';
      case 'ROOM_ASSIGNED': return '3. Room Plotted';
      case 'SSO_LINKED': return '4. SSO Synced';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-indigo-600" />
            SSO Migration Audit Trail
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Track historical transition records from PMB registration to SSO-authenticated NIMs.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name, PMB, or NIM..." 
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
              <option value="ALL">All Stages</option>
              <option value="PMB_REGISTERED">1. PMB Registered</option>
              <option value="PAYMENT_VERIFIED">2. Payment Verified</option>
              <option value="ROOM_ASSIGNED">3. Room Assigned</option>
              <option value="SSO_LINKED">4. SSO Linked (NIM)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Identifiers (PMB ➔ NIM)</th>
              <th className="px-4 py-3 font-semibold">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getEventIcon(log.eventType)}
                    <span className="font-medium">{getEventLabel(log.eventType)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{log.studentName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {log.pmbNumber}
                    </span>
                    {log.nim && (
                      <>
                        <span className="text-slate-400">➔</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {log.nim}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs max-w-sm truncate" title={log.details}>
                  {log.details}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No migration records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
