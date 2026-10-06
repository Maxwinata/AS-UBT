import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Bell } from 'lucide-react';
import { UserRole, MabaProfile } from '../types/asrama';
import { ShieldCheck, UserCheck, CreditCard, Building2, Cpu, FileText, Sparkles, LogOut, Code2, Database, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationBoardModal } from './notifications/NotificationBoardModal';

interface HeaderProps {
  currentRole: UserRole;
  isLoggedIn: boolean;
  onLogout: () => void;
  userName?: string;
  mabaProfile?: MabaProfile | any;
  isBooking?: boolean;
  isMasterMigrated?: boolean;
  invoiceStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  isLoggedIn,
  onLogout,
  userName = 'Bagus Pratama Putra',
  mabaProfile,
  isBooking,
  isMasterMigrated,
  invoiceStatus
}) => {
  const { unreadCount, setIsBoardOpen } = useNotifications();
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <header id="header-root" className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div id="main-nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-nowrap items-center justify-between gap-y-3 gap-x-2 sm:gap-x-4">
        {/* Brand & Logo */}
        <div id="brand-logo-section" className="flex items-center space-x-2 sm:space-x-3 order-1 flex-shrink min-w-0">
          <div className="flex flex-col justify-center min-w-0 py-0.5">
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-emerald-600 leading-none truncate pb-0.5">
                PORTAL SI-GABUNG
              </h1>
              <span className="hidden md:inline-flex items-center justify-center flex-shrink-0 bg-teal-50 text-teal-700 text-[9px] px-2 py-0.5 rounded-full font-bold border border-teal-200/50 uppercase tracking-widest shadow-sm">
                Roemah 54
              </span>
            </div>
            <p className="text-[9px] sm:text-[11px] text-slate-500 font-medium tracking-wide truncate mt-0.5 max-w-[200px] sm:max-w-md">
              Langkah Awal Menuju Rumah Keduamu di Asrama UBT
            </p>
          </div>
        </div>

        {/* Role & Perspective Selector Tabs */}

        {/* User Account / Logout */}
        {isLoggedIn && (
          <div id="user-profile-badge" className="flex items-center gap-2 sm:gap-3.5 sm:border-l border-slate-200 sm:pl-4 order-2 lg:order-3 relative flex-shrink-0 md:ml-auto">
            
            {/* Combined UBT Logo & Network Status Badge */}
            <div className={`flex items-center rounded-lg border shadow-sm transition-colors ${isOnline ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`} title={isOnline ? 'Koneksi Stabil (Siap Sinkronisasi & Upload)' : 'Koneksi Terputus (Sinkronisasi Tertunda)'}>
              <div className={`relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center text-white font-black text-[10px] sm:text-xs rounded-l-md ${isOnline ? 'bg-gradient-to-br from-teal-600 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}>
                UBT
                {/* Pulse Indicator */}
                <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </div>
              </div>
              <div className={`flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2.5 py-1 text-[10px] font-bold tracking-wider ${isOnline ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5 sm:w-3 sm:h-3" /> : <WifiOff className="w-3.5 h-3.5 sm:w-3 sm:h-3" />}
                <span className="hidden sm:inline">{isOnline ? 'LIVE SYNC' : 'OFFLINE'}</span>
              </div>
            </div>
            
            {/* Notification Bell (Desktop) */}
            <button 
              id="button-desktop-notifications"
              onClick={() => setIsBoardOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50/80 border border-transparent hover:border-teal-200 transition-all hidden sm:flex items-center justify-center group"
              title="Papan Pengumuman & Notifikasi Asrama"
              aria-label="Papan Pengumuman Asrama"
            >
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" title="Semua terbaca"></span>
              )}
            </button>

            {/* Notification Bell (Mobile Standalone Button) */}
            <button
              id="button-mobile-notifications"
              onClick={() => setIsBoardOpen(true)}
              className="relative p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 sm:hidden flex items-center justify-center"
              title="Papan Pengumuman Asrama"
              aria-label="Papan Pengumuman Asrama"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute 0 -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-rose-600 text-white font-black text-[9px] rounded-full flex items-center justify-center px-0.5 ring-2 ring-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Info & SSO Status */}
            <div className="relative">
              <button 
                id="button-user-profile-menu"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 focus:outline-none"
                aria-label="Menu Profil Pengguna"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{userName}</div>
                  {currentRole === 'eksisting' ? (
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">UBT SSO Verified</span>
                    </div>
                  ) : currentRole === 'maba' ? (
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Akun PMB (Guest)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">Administrator</span>
                    </div>
                  )}
                </div>
                
                <div className="relative flex items-center">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm border-2 border-white ring-1 ring-slate-200 cursor-pointer hover:ring-teal-400 transition-all">
                    {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  {/* Mobile SSO Indicator Badge (Shows on small screens) */}
                  <div className="absolute -bottom-1 -right-1 sm:hidden bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
                    {currentRole === 'eksisting' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    ) : currentRole === 'maba' ? (
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                    <div className="text-sm font-bold text-slate-800 truncate">{userName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                      {currentRole === 'eksisting' ? 'UBT SSO Verified' : currentRole === 'maba' ? 'Akun PMB (Guest)' : 'Administrator'}
                    </div>
                  </div>
                  
                  {/* Additional Profile Info for Mobile Maba */}
                  {currentRole === 'maba' && mabaProfile && (
                    <div className="sm:hidden border-b border-slate-100 bg-slate-50/50">
                      <div className="px-4 py-2 border-b border-slate-100/50">
                        <p className="text-[9px] text-teal-600 uppercase font-bold tracking-wider">No. PMB / Pendaftaran</p>
                        <p className="font-mono text-xs font-bold text-slate-700">{mabaProfile.noPmb || '-'}</p>
                      </div>
                      <div className="px-4 py-2 border-b border-slate-100/50">
                        <p className="text-[9px] text-teal-600 uppercase font-bold tracking-wider">Status NIM (SSO)</p>
                        <p className="font-mono text-xs font-bold text-slate-700">
                          {mabaProfile.nim === 'Belum tersedia' ? 'Menunggu Sinkronisasi' : mabaProfile.nim || '-'}
                        </p>
                      </div>
                      <div className="px-4 py-2">
                        <p className="text-[9px] text-teal-600 uppercase font-bold tracking-wider mb-0.5">Status Pendaftaran</p>
                        <div className="inline-flex items-center">
                          {isBooking ? (
                            <span className="font-mono text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              🟡 BOOKING TERVERIFIKASI
                            </span>
                          ) : isMasterMigrated ? (
                            <span className="font-mono text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                              🟢 PENGHUNI AKTIF (MASTER)
                            </span>
                          ) : invoiceStatus === 'PENDING_VERIFICATION' ? (
                            <span className="font-mono text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              ⏳ MENUNGGU VERIFIKASI
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200">
                              🔵 PROSES PENDAFTARAN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shortcut to Open Board from Menu */}
                  <button
                    id="button-menu-announcements"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsBoardOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between transition-colors font-medium border-b border-slate-100"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span>Papan Pengumuman Asrama</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-rose-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    id="button-logout"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Board Announcement Modal */}
      <NotificationBoardModal />
    </header>
  );
};

