import React, { useMemo } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Radio, 
  Search, 
  AlertTriangle, 
  Info, 
  Wrench, 
  CreditCard, 
  ShieldAlert, 
  Sparkles, 
  Pin, 
  Calendar, 
  UserCheck, 
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { BoardAnnouncement, AnnouncementCategory, AnnouncementPriority } from '../../types/announcement';

export const NotificationBoardModal: React.FC = () => {
  const {
    announcements,
    unreadCount,
    isRead,
    markAsRead,
    markAllAsRead,
    simulateLiveBroadcast,
    isBoardOpen,
    setIsBoardOpen,
    selectedAnnouncement,
    setSelectedAnnouncement,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filterOnlyUnread,
    setFilterOnlyUnread
  } = useNotifications();

  // Category Icon & Color Mapping
  const getCategoryMeta = (category: AnnouncementCategory) => {
    switch (category) {
      case 'maintenance':
        return {
          label: 'Pemeliharaan',
          icon: Wrench,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'facility':
        return {
          label: 'Fasilitas & Sarpras',
          icon: Sparkles,
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'finance':
        return {
          label: 'Keuangan & Tarif',
          icon: CreditCard,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'security':
        return {
          label: 'Ketertiban & Keamanan',
          icon: ShieldAlert,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'general':
      default:
        return {
          label: 'Pengumuman Umum',
          icon: Info,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Mendesak
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Penting
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(item => {
      // Unread Filter
      if (filterOnlyUnread && isRead(item.id)) {
        return false;
      }
      // Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'urgent' && item.priority !== 'urgent') {
          return false;
        } else if (selectedCategory !== 'urgent' && item.category !== selectedCategory) {
          return false;
        }
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchContent = item.content.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchContent && !matchAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [announcements, filterOnlyUnread, selectedCategory, searchQuery, isRead]);

  if (!isBoardOpen) return null;

  return (
    <div 
      id="notification-board-overlay" 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsBoardOpen(false);
          setSelectedAnnouncement(null);
        }
      }}
    >
      <div 
        id="notification-board-modal"
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden border border-slate-200 flex flex-col transition-all"
      >
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-800/40 relative">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-600/30 border border-teal-400/40 text-teal-300 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Papan Pengumuman Asrama
                </h3>
                {/* Real-time Indicator */}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE BROADCAST
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-teal-200/80 font-medium">
                Pusat informasi siaran real-time seluruh residen Roemah 54 UBT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Live Broadcast Trigger (For demonstration / testing real-time) */}
            <button
              id="button-simulate-broadcast"
              onClick={simulateLiveBroadcast}
              title="Simulasi siaran pengumuman baru secara real-time"
              className="flex items-center gap-1 text-[11px] font-bold bg-teal-800/80 hover:bg-teal-700 text-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-600/50 transition-all active:scale-95 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span className="hidden sm:inline">Simulasi Siaran</span>
            </button>

            {/* Close Button */}
            <button
              id="button-close-notification-board"
              onClick={() => {
                setIsBoardOpen(false);
                setSelectedAnnouncement(null);
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup Papan Pengumuman"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT AREA: EITHER DETAIL VIEW OR LIST VIEW */}
        {selectedAnnouncement ? (
          /* DETAIL VIEW */
          <div id="announcement-detail-view" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <button
                id="button-back-to-announcements"
                onClick={() => setSelectedAnnouncement(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar</span>
              </button>

              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedAnnouncement.priority)}
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryMeta(selectedAnnouncement.category).badgeClass}`}>
                  {getCategoryMeta(selectedAnnouncement.category).label}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                {selectedAnnouncement.isPinned && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mb-2">
                    <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                    Pengumuman Disematkan
                  </div>
                )}
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimestamp(selectedAnnouncement.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    {selectedAnnouncement.author} ({selectedAnnouncement.authorRole})
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Sasaran Penerima:</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold text-teal-800">
                  {selectedAnnouncement.targetAudience}
                </span>
              </div>

              {/* Body Content */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2 font-normal">
                {selectedAnnouncement.content}
              </div>

              {selectedAnnouncement.actionTag && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Topik Terkait:</span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                    #{selectedAnnouncement.actionTag}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* SEARCH & FILTERS BAR */}
            <div className="p-3 sm:p-4 bg-white border-b border-slate-200 space-y-2.5">
              {/* Top Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-search-announcements"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pengumuman, jadwal, perbaikan..."
                    className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mark all as read button */}
                <button
                  id="button-mark-all-read"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    unreadCount > 0
                      ? 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                  title="Tandai semua pengumuman telah dibaca"
                >
                  <CheckCheck className="w-4 h-4 text-teal-600" />
                  <span className="hidden md:inline">Tandai Semua Dibaca</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                    selectedCategory === 'all' && !filterOnlyUnread
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Semua ({announcements.length})
                </button>

                <button
                  onClick={() => {
                    setFilterOnlyUnread(!filterOnlyUnread);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1 ${
                    filterOnlyUnread
                      ? 'bg-amber-600 text-white shadow-sm'
                      : unreadCount > 0
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span>Belum Dibaca</span>
                  {unreadCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${filterOnlyUnread ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('urgent');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1 ${
                    selectedCategory === 'urgent'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Mendesak</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('maintenance');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                    selectedCategory === 'maintenance'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Pemeliharaan
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('facility');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                    selectedCategory === 'facility'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Fasilitas
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('finance');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                    selectedCategory === 'finance'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Keuangan
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory('security');
                    setFilterOnlyUnread(false);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                    selectedCategory === 'security'
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Ketertiban
                </button>
              </div>
            </div>

            {/* ANNOUNCEMENTS LIST */}
            <div id="announcement-items-container" className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {filteredAnnouncements.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">
                    Tidak ada pengumuman ditemukan
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada hasil yang sesuai dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                      : 'Tidak ada pengumuman dalam kategori atau status ini saat ini.'}
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((item) => {
                  const read = isRead(item.id);
                  const meta = getCategoryMeta(item.category);
                  const CategoryIcon = meta.icon;

                  return (
                    <div
                      key={item.id}
                      id={`announcement-card-${item.id}`}
                      onClick={() => {
                        markAsRead(item.id);
                        setSelectedAnnouncement(item);
                      }}
                      className={`group p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
                        read 
                          ? 'bg-white hover:bg-slate-50/90 border-slate-200' 
                          : 'bg-teal-50/40 hover:bg-teal-50/70 border-teal-200 ring-1 ring-teal-300/40 shadow-sm'
                      }`}
                    >
                      {/* Unread Glow Indicator */}
                      {!read && (
                        <div className="absolute top-4 right-4 flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                          <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Baru</span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 border ${meta.badgeClass} mt-0.5`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {item.isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
                                <Pin className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                                Disematkan
                              </span>
                            )}
                            {getPriorityBadge(item.priority)}
                            <span className="text-[10px] font-semibold text-slate-500">
                              {meta.label}
                            </span>
                          </div>

                          <h4 className={`text-xs sm:text-sm font-bold leading-snug transition-colors line-clamp-2 ${
                            read ? 'text-slate-800 group-hover:text-teal-800' : 'text-slate-900 group-hover:text-teal-900 font-extrabold'
                          }`}>
                            {item.title}
                          </h4>

                          <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {item.summary}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100/80 text-[10px] text-slate-400">
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-semibold text-slate-600 truncate">
                                {item.author}
                              </span>
                              <span>•</span>
                              <span>{formatTimestamp(item.publishedAt)}</span>
                            </div>

                            <div className="flex items-center text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
                              <span>Baca</span>
                              <ChevronRight className="w-3 h-3 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Sinkronisasi Pengumuman Aktif (Roemah 54 UBT)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Unread: <strong className="text-teal-700 font-bold">{unreadCount}</strong> dari {announcements.length} pengumuman
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
