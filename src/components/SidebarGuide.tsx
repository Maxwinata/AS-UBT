import React, { useState } from 'react';
import { UserRole } from '../types/asrama';
import { 
  UserCheck, 
  Sparkles, 
  Wrench,
  FileText, 
  Database,
  Building2,
  Wallet,
  Settings2,
  Code2,
  DatabaseZap,
  ChevronRight, 
  Settings,
  X
} from 'lucide-react';

interface SidebarGuideProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const SidebarGuide: React.FC<SidebarGuideProps> = ({ currentRole, onSelectRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed top-1/2 right-0 -translate-y-1/2 bg-slate-800 text-white p-2 rounded-l-xl shadow-lg border border-r-0 border-slate-700 z-50 hover:bg-slate-700 transition-all ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        title="Open Dev Tools & Persona Switcher"
      >
        <Settings className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
      </button>

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl border-l border-slate-200 z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-sm">Dev Tools & Persona</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Main Personas */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">User Personas</div>
            
            <button
              onClick={() => onSelectRole('maba')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 ${
                currentRole === 'maba'
                  ? 'bg-teal-50 text-teal-700 border-2 border-teal-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'maba' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs">PMB (Maba)</span>
            </button>

            <button
              onClick={() => onSelectRole('eksisting')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 ${
                currentRole === 'eksisting'
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'eksisting' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs">SSO Mahasiswa</span>
            </button>

            <button
              id="sidebar-role-maintenance"
              onClick={() => onSelectRole('maintenance_ticketing')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 ${
                currentRole === 'maintenance_ticketing'
                  ? 'bg-amber-50 text-amber-800 border-2 border-amber-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'maintenance_ticketing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs">Maintenance & Kerusakan</span>
            </button>
          </div>

          {/* Admin Personas */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Personas</div>
            
            <button
              onClick={() => onSelectRole('admin_asrama')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 ${
                currentRole === 'admin_asrama'
                  ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'admin_asrama' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs">Admin Asrama</span>
            </button>

            <button
              onClick={() => onSelectRole('admin_keuangan')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all flex items-center gap-3 ${
                currentRole === 'admin_keuangan'
                  ? 'bg-purple-50 text-purple-700 border-2 border-purple-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'admin_keuangan' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs">Admin Keuangan</span>
            </button>
          </div>

          {/* Architecture & Specs */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Architecture & Specs</div>
            
            <button
              onClick={() => onSelectRole('dfd_architecture')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                currentRole === 'dfd_architecture'
                  ? 'bg-slate-800 text-white border-2 border-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'dfd_architecture' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Spec DFD 0-1</span>
            </button>

            <button
              onClick={() => onSelectRole('schema_diagram')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                currentRole === 'schema_diagram'
                  ? 'bg-slate-800 text-white border-2 border-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'schema_diagram' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">DB Schema Mapping</span>
            </button>
            
            <button
              onClick={() => onSelectRole('laravel_blueprint')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                currentRole === 'laravel_blueprint'
                  ? 'bg-rose-50 text-rose-700 border-2 border-rose-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'laravel_blueprint' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Laravel Blueprint</span>
            </button>

            <button
              onClick={() => onSelectRole('sql_importer')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                currentRole === 'sql_importer'
                  ? 'bg-sky-50 text-sky-700 border-2 border-sky-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'sql_importer' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                <DatabaseZap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">SQL Importer Tool</span>
            </button>
            
            <button
              onClick={() => onSelectRole('cron_monitor')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-3 ${
                currentRole === 'cron_monitor'
                  ? 'bg-amber-50 text-amber-700 border-2 border-amber-500'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${currentRole === 'cron_monitor' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                <Settings2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold">Cron Monitor</span>
            </button>
          </div>
          
        </div>
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
