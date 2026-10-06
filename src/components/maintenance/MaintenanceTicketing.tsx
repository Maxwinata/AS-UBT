import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  Camera, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  UserCheck, 
  Phone, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  PlayCircle,
  Eye,
  ShieldCheck,
  Flame,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  MaintenanceTicket, 
  MaintenanceCategory, 
  DamageUrgency, 
  TicketPriority,
  TicketStatus, 
  TicketStatusHistory 
} from '../../types/maintenance';
import { INITIAL_MAINTENANCE_TICKETS } from '../../data/initialMaintenanceData';
import { FacilityCameraModal } from './FacilityCameraModal';

const LOCAL_STORAGE_TICKETS_KEY = 'sigabung_maintenance_tickets_v1';

interface MaintenanceTicketingProps {
  userNim?: string;
  userName?: string;
  userPhone?: string;
  userRoom?: string;
  onNavigateHome?: () => void;
}

export const MaintenanceTicketing: React.FC<MaintenanceTicketingProps> = ({
  userNim = '2240101004',
  userName = 'Ahmad Raihan',
  userPhone = '081254332190',
  userRoom = 'Gedung A (Enggang Utara) — Kamar 101',
  onNavigateHome,
}) => {
  // Persistence state
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_MAINTENANCE_TICKETS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  // View state: 'dashboard' | 'create'
  const [activeView, setActiveView] = useState<'dashboard' | 'create'>('dashboard');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EMERGENCY'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<MaintenanceTicket | null>(null);
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Form State
  const [formBuilding, setFormBuilding] = useState('Gedung A (Enggang Utara)');
  const [formFloor, setFormFloor] = useState('Lantai 1');
  const [formRoom, setFormRoom] = useState('Kamar 101');
  const [formCategory, setFormCategory] = useState<MaintenanceCategory>('plumbing');
  const [formUrgency, setFormUrgency] = useState<DamageUrgency>('medium');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [formPhotoTime, setFormPhotoTime] = useState<string | null>(null);
  const [formPhone, setFormPhone] = useState(userPhone);

  // Category Configuration
  const categoryConfig: Record<MaintenanceCategory, { label: string; icon: any; colorClass: string }> = {
    plumbing: { label: 'Pipa & Sanitasi Air', icon: Wrench, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    electrical: { label: 'Kelistrikan & Lampu', icon: Sparkles, colorClass: 'bg-amber-50 text-amber-800 border-amber-200' },
    furniture: { label: 'Mebel, Meja & Lemari', icon: Building2, colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    hvac_fan: { label: 'Kipas Angin & Ventilasi', icon: Sparkles, colorClass: 'bg-teal-50 text-teal-700 border-teal-200' },
    doors_windows: { label: 'Pintu, Kunci & Jendela', icon: Building2, colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    civil_structure: { label: 'Plafon & Struktur Bangunan', icon: Wrench, colorClass: 'bg-purple-50 text-purple-700 border-purple-200' },
    cleaning_waste: { label: 'Kebersihan & Sanitasi', icon: Sparkles, colorClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    other: { label: 'Kerusakan Lain-lain', icon: HelpCircle, colorClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  // Urgency & Priority Configuration with Complete Dashboard Color-Coding
  const urgencyConfig: Record<DamageUrgency, { 
    label: string; 
    priorityLabel: 'Low' | 'Medium' | 'High';
    badgeClass: string; 
    desc: string;
    cardBorder: string;
    cardBg: string;
    cardLeftAccent: string;
    headerBg: string;
    codeBadge: string;
    glowRing: string;
    dotColor: string;
    slaText: string;
  }> = {
    low: { 
      label: 'Rendah (Low)', 
      priorityLabel: 'Low',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 font-bold', 
      desc: 'Pemeliharaan rutin / kosmetik tidak mengganggu aktivitas harian',
      cardBorder: 'border-sky-300 hover:border-sky-400',
      cardBg: 'bg-gradient-to-r from-sky-50/70 via-sky-50/15 to-white',
      cardLeftAccent: 'border-l-[6px] border-l-sky-500',
      headerBg: 'bg-sky-50/50 border-b border-sky-100',
      codeBadge: 'bg-sky-100 text-sky-900 border-sky-300 font-bold',
      glowRing: 'ring-sky-400',
      dotColor: 'bg-sky-500',
      slaText: 'Target Penanganan: 3 - 5 Hari Kerja'
    },
    medium: { 
      label: 'Sedang (Medium)', 
      priorityLabel: 'Medium',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', 
      desc: 'Mengurangi kenyamanan kamar, membutuhkan perbaikan standar',
      cardBorder: 'border-amber-300 hover:border-amber-400',
      cardBg: 'bg-gradient-to-r from-amber-50/70 via-amber-50/20 to-white',
      cardLeftAccent: 'border-l-[6px] border-l-amber-500',
      headerBg: 'bg-amber-50/50 border-b border-amber-100',
      codeBadge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      glowRing: 'ring-amber-400',
      dotColor: 'bg-amber-500',
      slaText: 'Target Penanganan: 24 - 48 Jam'
    },
    high: { 
      label: 'Tinggi (High)', 
      priorityLabel: 'High',
      badgeClass: 'bg-red-100 text-red-900 border-red-300 font-black', 
      desc: 'Kerusakan fungsi vital kamar, membutuhkan penanganan prioritas',
      cardBorder: 'border-red-300 hover:border-red-400',
      cardBg: 'bg-gradient-to-r from-red-50/80 via-red-50/25 to-white',
      cardLeftAccent: 'border-l-[6px] border-l-red-500',
      headerBg: 'bg-red-50/60 border-b border-red-100',
      codeBadge: 'bg-red-100 text-red-900 border-red-300 font-bold',
      glowRing: 'ring-red-400',
      dotColor: 'bg-red-500',
      slaText: 'Target Penanganan: < 24 Jam'
    },
    emergency: { 
      label: '🚨 Darurat (High Emergency)', 
      priorityLabel: 'High',
      badgeClass: 'bg-red-600 text-white border-red-700 font-black animate-pulse shadow-2xs', 
      desc: 'Bahaya keselamatan langsung / korsleting listrik / kebocoran pipa deras',
      cardBorder: 'border-red-400 hover:border-red-500 shadow-md',
      cardBg: 'bg-gradient-to-r from-red-100/85 via-red-50/30 to-white',
      cardLeftAccent: 'border-l-[6px] border-l-red-600',
      headerBg: 'bg-red-100/70 border-b border-red-200',
      codeBadge: 'bg-red-600 text-white border-red-700 font-black',
      glowRing: 'ring-red-500',
      dotColor: 'bg-red-600',
      slaText: 'Tindakan Tanggap Darurat: Segera'
    },
  };

  const statusConfig: Record<TicketStatus, { label: string; badgeClass: string; stepNumber: number }> = {
    SUBMITTED: { label: 'Laporan Diterima', badgeClass: 'bg-sky-100 text-sky-800 border-sky-200', stepNumber: 1 },
    VERIFIED: { label: 'Diverifikasi & Dijadwalkan', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200', stepNumber: 2 },
    IN_PROGRESS: { label: 'Sedang Dikerjakan Teknisi', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', stepNumber: 3 },
    COMPLETED: { label: 'Perbaikan Selesai', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', stepNumber: 4 },
    CANCELLED: { label: 'Dibatalkan', badgeClass: 'bg-slate-200 text-slate-700 border-slate-300', stepNumber: 0 },
  };

  // Handle Photo Snapped
  const handlePhotoCaptured = (dataUrl: string) => {
    setFormPhoto(dataUrl);
    setFormPhotoTime(new Date().toISOString());
    toast.success('Foto kerusakan fasilitas berhasil dilampirkan via kamera');
  };

  // Submit New Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Judul kerusakan wajib diisi');
      return;
    }

    if (!formDescription.trim()) {
      toast.error('Deskripsi rincian kerusakan wajib diisi');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTicketCode = `TKT-2026-${randomSuffix}`;
    const nowIso = new Date().toISOString();
    const nowReadable = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WITA';

    const newTicket: MaintenanceTicket = {
      id: `tkt-custom-${Date.now()}`,
      ticketCode: newTicketCode,
      reporterNim: userNim,
      reporterName: userName,
      reporterPhone: formPhone || userPhone,
      locationBuilding: formBuilding,
      locationFloor: formFloor,
      locationRoom: formRoom,
      category: formCategory,
      urgency: formUrgency,
      priority: formUrgency === 'low' ? 'Low' : formUrgency === 'medium' ? 'Medium' : 'High',
      title: formTitle.trim(),
      description: formDescription.trim(),
      photoUrl: formPhoto || undefined,
      photoCapturedAt: formPhotoTime || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'SUBMITTED',
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          status: 'SUBMITTED',
          timestamp: nowReadable,
          note: 'Laporan kerusakan diajukan oleh penghuni dengan lampiran foto kamera.',
          actor: `${userName} (Residen)`
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormPhoto(null);
    setFormPhotoTime(null);
    setActiveView('dashboard');

    toast.success(`Tiket ${newTicketCode} berhasil didaftarkan!`, {
      description: 'Laporan telah diteruskan ke Unit Sarana & Prasarana Asrama UBT.'
    });
  };

  // Simulate Technician Lifecycle Progression (Interactive Demo)
  const handleSimulateProgress = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;

      const nowReadable = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WITA';

      if (ticket.status === 'SUBMITTED') {
        const updatedHistory: TicketStatusHistory = {
          id: `hist-${Date.now()}`,
          status: 'VERIFIED',
          timestamp: nowReadable,
          note: 'Laporan diverifikasi oleh Bagian Sarpras. Ditugaskan ke tim teknisi lapangan.',
          actor: 'Koordinator Sarpras Asrama'
        };
        toast.info(`Tiket ${ticket.ticketCode} status berubah: DIVERIFIKASI & DIJADWALKAN`);
        return {
          ...ticket,
          status: 'VERIFIED',
          updatedAt: new Date().toISOString(),
          assignedTechnician: {
            name: ticket.category === 'electrical' ? 'Pak Joko Sukoco' : 'Pak Herman Santoso',
            role: ticket.category === 'electrical' ? 'Teknisi Listrik UBT' : 'Teknisi Plumbing & Sanitasi',
            phone: '081299887766'
          },
          scheduledDate: 'Hari Ini (Shift 2)',
          technicianNotes: 'Teknisi sudah menerima suku cadang dan dijadwalkan menuju kamar residen.',
          statusHistory: [...ticket.statusHistory, updatedHistory]
        };
      } else if (ticket.status === 'VERIFIED') {
        const updatedHistory: TicketStatusHistory = {
          id: `hist-${Date.now()}`,
          status: 'IN_PROGRESS',
          timestamp: nowReadable,
          note: 'Teknisi tiba di lokasi kerusakan dan memulai perbaikan fisik fasilitas.',
          actor: ticket.assignedTechnician?.name || 'Teknisi Lapangan'
        };
        toast.warning(`Tiket ${ticket.ticketCode} status berubah: SEDANG DIKERJAKAN TEKNISI`);
        return {
          ...ticket,
          status: 'IN_PROGRESS',
          updatedAt: new Date().toISOString(),
          technicianNotes: 'Pengerjaan penggantian komponen rusak sedang berlangsung di lokasi.',
          statusHistory: [...ticket.statusHistory, updatedHistory]
        };
      } else if (ticket.status === 'IN_PROGRESS') {
        const updatedHistory: TicketStatusHistory = {
          id: `hist-${Date.now()}`,
          status: 'COMPLETED',
          timestamp: nowReadable,
          note: 'Pekerjaan perbaikan selesai secara tuntas, fungsi fasilitas telah diuji coba dan normal.',
          actor: ticket.assignedTechnician?.name || 'Teknisi Lapangan'
        };
        toast.success(`Tiket ${ticket.ticketCode} status berubah: SELESAI DIPERBAIKI!`);
        return {
          ...ticket,
          status: 'COMPLETED',
          updatedAt: new Date().toISOString(),
          technicianNotes: 'Perbaikan telah selesai 100%. Fasilitas siap digunakan kembali oleh penghuni asrama.',
          statusHistory: [...ticket.statusHistory, updatedHistory]
        };
      } else {
        toast.info('Tiket ini sudah berstatus Selesai.');
        return ticket;
      }
    }));
  };

  // Cancel Ticket
  const handleCancelTicket = (ticketId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan laporan tiket kerusakan ini?')) return;

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const nowReadable = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WITA';

      return {
        ...t,
        status: 'CANCELLED',
        statusHistory: [
          ...t.statusHistory,
          {
            id: `hist-${Date.now()}`,
            status: 'CANCELLED',
            timestamp: nowReadable,
            note: 'Dibatalkan atas permintaan pelapor.',
            actor: `${userName} (Pelapor)`
          }
        ]
      };
    }));

    toast.info('Tiket laporan berhasil dibatalkan');
  };

  // Filtered List
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Status Filter
      if (statusFilter === 'ACTIVE' && (t.status === 'COMPLETED' || t.status === 'CANCELLED')) {
        return false;
      }
      if (statusFilter === 'COMPLETED' && t.status !== 'COMPLETED') {
        return false;
      }
      if (statusFilter === 'EMERGENCY' && t.urgency !== 'emergency') {
        return false;
      }

      // Priority Filter
      if (priorityFilter === 'LOW' && t.urgency !== 'low') {
        return false;
      }
      if (priorityFilter === 'MEDIUM' && t.urgency !== 'medium') {
        return false;
      }
      if (priorityFilter === 'HIGH' && t.urgency !== 'high' && t.urgency !== 'emergency') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = t.ticketCode.toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchRoom = t.locationRoom.toLowerCase().includes(q);
        const matchBuilding = t.locationBuilding.toLowerCase().includes(q);
        const matchCategory = categoryConfig[t.category]?.label.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchRoom && !matchBuilding && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter(t => t.status === 'SUBMITTED' || t.status === 'VERIFIED' || t.status === 'IN_PROGRESS').length;
    const completed = tickets.filter(t => t.status === 'COMPLETED').length;
    const emergency = tickets.filter(t => t.urgency === 'emergency' && t.status !== 'COMPLETED').length;
    const high = tickets.filter(t => (t.urgency === 'high' || t.urgency === 'emergency')).length;
    const medium = tickets.filter(t => t.urgency === 'medium').length;
    const low = tickets.filter(t => t.urgency === 'low').length;
    return { total, active, completed, emergency, high, medium, low };
  }, [tickets]);

  return (
    <div id="maintenance-ticketing-module-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 border border-teal-700/60 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Modul Layanan Sarpras
              </span>
              <span className="text-xs text-slate-300 font-mono">Roemah 54 UBT</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Maintenance Ticketing & Pelaporan Kerusakan
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Kirim laporan kerusakan fasilitas kamar maupun area publik asrama dengan foto bukti via kamera perangkat, dan pantau respons penanganan teknisi secara transparan.
            </p>
          </div>

          {/* Primary View Switcher Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="button-view-dashboard"
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                activeView === 'dashboard'
                  ? 'bg-white text-teal-950 ring-2 ring-teal-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Status Pelacakan ({stats.total})</span>
            </button>

            <button
              id="button-view-create-report"
              onClick={() => setActiveView('create')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                activeView === 'create'
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Laporan Baru</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-teal-800/40">
          <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-teal-200 font-bold uppercase tracking-wider block">Total Laporan</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Sedang Diproses</span>
            <span className="text-xl font-black text-amber-300">{stats.active}</span>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Selesai Diperbaiki</span>
            <span className="text-xl font-black text-emerald-300">{stats.completed}</span>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">Tiket Darurat Aktif</span>
            <span className="text-xl font-black text-rose-300">{stats.emergency}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: CREATE NEW REPORT FORM */}
      {activeView === 'create' && (
        <div id="create-report-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-700" />
                <span>Formulir Pelaporan Kerusakan Sarana & Fasilitas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan foto bukti kerusakan terlihat fokus agar teknisi dapat membawa alat dan suku cadang yang tepat.
              </p>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors self-start"
            >
              Kembali ke Dashboard Tiket
            </button>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-6">
            
            {/* Pelapor Profile Badge (Auto-filled) */}
            <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{userName} (NIM: {userNim})</div>
                  <div className="text-slate-500 text-[11px]">{userRoom}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-600 text-[11px] whitespace-nowrap">No. WhatsApp:</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>

            {/* Grid 1: Location & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Gedung */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Lokasi Gedung <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-building"
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Gedung A (Enggang Utara)">Gedung A (Enggang Utara)</option>
                  <option value="Gedung B (Enggang Selatan)">Gedung B (Enggang Selatan)</option>
                  <option value="Area Publik / Lobby & Gazebo">Area Publik / Lobby & Gazebo</option>
                  <option value="Fasilitas Komunal (Laundry & Dapur)">Fasilitas Komunal (Laundry & Dapur)</option>
                </select>
              </div>

              {/* Lantai */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Lantai <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-floor"
                  value={formFloor}
                  onChange={(e) => setFormFloor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Lantai 1">Lantai 1 (Dasar)</option>
                  <option value="Lantai 2">Lantai 2</option>
                  <option value="Lantai 3">Lantai 3</option>
                  <option value="Rooftop & Jemuran">Rooftop & Area Jemuran</option>
                </select>
              </div>

              {/* Spesifik Ruangan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nomor Kamar / Spesifik Tempat <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-room-location"
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="Contoh: Kamar 101 atau Kamar Mandi Barat"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
            </div>

            {/* Grid 2: Kategori & Tingkat Urgensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Kategori Kerusakan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Kategori Kerusakan <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector (Low, Medium, High) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="select-priority" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Priority <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">Tingkat Prioritas &amp; Urgensi</span>
                </div>

                {/* Priority Selection Cards: Low, Medium, High */}
                <div id="priority-selector" className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: 'low' as DamageUrgency,
                      label: 'Low',
                      indo: 'Rendah',
                      dotColor: 'bg-sky-500',
                      targetSLA: '3 - 5 Hari',
                      selectedClass: 'bg-sky-50 border-sky-500 ring-2 ring-sky-400 text-sky-950 font-black shadow-xs',
                    },
                    {
                      value: 'medium' as DamageUrgency,
                      label: 'Medium',
                      indo: 'Sedang',
                      dotColor: 'bg-amber-500',
                      targetSLA: '24 - 48 Jam',
                      selectedClass: 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 text-amber-950 font-black shadow-xs',
                    },
                    {
                      value: 'high' as DamageUrgency,
                      label: 'High',
                      indo: 'Tinggi',
                      dotColor: 'bg-red-500',
                      targetSLA: '< 24 Jam',
                      selectedClass: 'bg-red-50 border-red-500 ring-2 ring-red-400 text-red-950 font-black shadow-xs',
                    }
                  ].map((p) => {
                    const isSelected = formUrgency === p.value || (p.value === 'high' && formUrgency === 'emergency');
                    return (
                      <button
                        key={p.value}
                        id={`priority-btn-${p.value}`}
                        type="button"
                        onClick={() => setFormUrgency(p.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? p.selectedClass
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.dotColor} ${isSelected ? 'scale-110 ring-2 ring-white' : ''}`}></span>
                          <span className="text-xs font-bold">{p.label}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-medium">{p.indo}</span>
                        <span className="text-[9px] font-mono opacity-80 bg-white/70 px-1.5 py-0.2 rounded border border-slate-200/60">
                          {p.targetSLA}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Accessible Select Dropdown */}
                <select
                  id="select-priority"
                  value={formUrgency === 'emergency' ? 'high' : formUrgency}
                  onChange={(e) => setFormUrgency(e.target.value as DamageUrgency)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="low">Low - Rendah (Pemeliharaan Rutin / Target 3-5 Hari)</option>
                  <option value="medium">Medium - Sedang (Perbaikan Standar / Target 24-48 Jam)</option>
                  <option value="high">High - Tinggi (Fungsi Vital Rusak / Target &lt; 24 Jam)</option>
                </select>

                <p className="text-[11px] text-slate-500 leading-tight">
                  {formUrgency === 'low' && '🔵 Low: Kerusakan kosmetik atau perlengkapan non-esensial.'}
                  {(formUrgency === 'medium' || !formUrgency) && '🟡 Medium: Mengurangi kenyamanan kamar dan butuh perbaikan berkala.'}
                  {(formUrgency === 'high' || formUrgency === 'emergency') && '🔴 High: Kerusakan mendesak yang mengganggu fungsi utama fasilitas kamar.'}
                </p>
              </div>
            </div>

            {/* Judul Kerusakan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Ringkasan / Judul Kerusakan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-damage-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Pipa pembuangan wastafel bocor dan merembes ke bawah"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>

            {/* Deskripsi Rinci */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Deskripsi Lengkap Kondisi Kerusakan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="textarea-damage-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan secara rinci kronologi kerusakan, sejak kapan terjadi, apakah sudah dicoba diatasi sementara..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
                required
              />
            </div>

            {/* PHOTO CAPTURE VIA CAMERA TOOL SECTION */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>Dokumentasi Foto Kerusakan (Kamera Langsung)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Sertakan foto jelas untuk mempercepat diagnosis teknisi sebelum datang ke lokasi.
                  </p>
                </div>

                {formPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormPhoto(null);
                      setFormPhotoTime(null);
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {formPhoto ? (
                /* PREVIEW ATTACHED PHOTO */
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 max-w-md p-2 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-40 h-36 rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={formPhoto}
                      alt="Bukti Kerusakan"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedPhotoUrl(formPhoto)}
                    />
                    <button
                      type="button"
                      onClick={() => setEnlargedPhotoUrl(formPhoto)}
                      className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white text-[10px]"
                      title="Perbesar Foto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-white text-xs w-full">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Foto Berhasil Dilampirkan</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Foto telah terekam beserta stempel waktu inspeksi sarpras.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="text-xs text-teal-300 hover:text-teal-200 font-bold underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ambil Ulang Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TRIGGER CAMERA MODAL */
                <div 
                  onClick={() => setIsCameraOpen(true)}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-2xl p-6 text-center cursor-pointer transition-all group max-w-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    Buka Kamera Perangkat & Ambil Foto
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Kamera akan terbuka langsung dengan bidikan khusus kerusakan sarana.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700 text-white text-[10px] font-extrabold shadow-sm">
                    <Camera className="w-3 h-3" />
                    <span>Luncurkan Kamera</span>
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <button
                id="button-submit-report"
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Kirim Laporan Kerusakan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: STATUS TRACKING DASHBOARD */}
      {activeView === 'dashboard' && (
        <div id="tracking-dashboard-section" className="space-y-6">
          
          {/* Controls Bar: Search & Status Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-tickets"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Tiket, Kamar, atau Masalah..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-800"
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

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs no-scrollbar">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({tickets.length})
              </button>

              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Aktif / Diproses</span>
                <span className="bg-amber-500/30 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
                  {stats.active}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Selesai ({stats.completed})
              </button>

              <button
                onClick={() => setStatusFilter('EMERGENCY')}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  statusFilter === 'EMERGENCY'
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>Darurat</span>
              </button>
            </div>
          </div>

          {/* URGENCY & PRIORITY COLOR-CODE LEGEND & QUICK FILTER */}
          <div id="priority-color-legend-bar" className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block leading-tight">
                  Kode Warna Prioritas Tiket (Urgency Color-Coding)
                </span>
                <span className="text-[11px] text-slate-500">
                  Kartu tiket diwarnai sesuai tingkat urgensi penanganan tim sarpras
                </span>
              </div>
            </div>

            {/* Quick Filter Pill Buttons by Priority */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                id="filter-priority-high"
                onClick={() => setPriorityFilter(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH')}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all text-xs ${
                  priorityFilter === 'HIGH'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-300'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
                <span>High ({stats.high})</span>
              </button>

              <button
                id="filter-priority-medium"
                onClick={() => setPriorityFilter(priorityFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all text-xs ${
                  priorityFilter === 'MEDIUM'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
                <span>Medium ({stats.medium})</span>
              </button>

              <button
                id="filter-priority-low"
                onClick={() => setPriorityFilter(priorityFilter === 'LOW' ? 'ALL' : 'LOW')}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all text-xs ${
                  priorityFilter === 'LOW'
                    ? 'bg-sky-600 text-white border-sky-700 shadow-sm ring-2 ring-sky-300'
                    : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white"></span>
                <span>Low ({stats.low})</span>
              </button>

              {priorityFilter !== 'ALL' && (
                <button
                  onClick={() => setPriorityFilter('ALL')}
                  className="text-[11px] text-slate-600 hover:text-slate-900 underline font-bold px-1 py-1"
                >
                  Tampilkan Semua
                </button>
              )}
            </div>
          </div>

          {/* TICKETS LIST CONTAINER */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Tidak ada tiket laporan ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada tiket yang sesuai dengan pencarian "${searchQuery}". Coba kata kunci lain.`
                  : 'Belum ada tiket pada kategori prioritas ini. Seluruh sarana prasarana asrama terpantau aman.'}
              </p>
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setSearchQuery('');
                  setActiveView('create');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-600 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Laporan Kerusakan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const catMeta = categoryConfig[ticket.category] || categoryConfig.other;
                const CatIcon = catMeta.icon;
                const urgMeta = urgencyConfig[ticket.urgency] || urgencyConfig.medium;
                const statMeta = statusConfig[ticket.status] || statusConfig.SUBMITTED;

                return (
                  <div
                    key={ticket.id}
                    id={`ticket-card-${ticket.ticketCode}`}
                    className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-5 border ${urgMeta.cardBorder} ${urgMeta.cardBg} ${urgMeta.cardLeftAccent}`}
                  >
                    {/* Ticket Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Ticket Code with Urgency Theme */}
                        <span className={`font-mono text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg border ${urgMeta.codeBadge}`}>
                          #{ticket.ticketCode}
                        </span>

                        {/* Category */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${catMeta.colorClass}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catMeta.label}</span>
                        </span>

                        {/* Priority Badge */}
                        <span 
                          id={`priority-badge-${ticket.ticketCode}`}
                          className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs ${urgMeta.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${urgMeta.dotColor} ${ticket.urgency === 'emergency' || ticket.urgency === 'high' ? 'animate-ping' : ''}`}></span>
                          <span>Priority: {urgMeta.priorityLabel}</span>
                        </span>

                        <span className="hidden md:inline-block text-[10px] font-mono text-slate-500 bg-white/80 border border-slate-200/70 px-2 py-0.5 rounded-md">
                          {urgMeta.slaText}
                        </span>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statMeta.badgeClass}`}>
                          {statMeta.label}
                        </span>

                        {ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED' && (
                          <button
                            id={`button-simulate-step-${ticket.ticketCode}`}
                            onClick={() => handleSimulateProgress(ticket.id)}
                            title="Simulasi tahapan pengerjaan teknisi (Demo)"
                            className="flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-2xs"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-teal-600" />
                            <span className="hidden sm:inline">Simulasi Progres</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ticket Content: Photo & Description */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      
                      {/* Photo Thumbnail */}
                      {ticket.photoUrl ? (
                        <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 group">
                          <img
                            src={ticket.photoUrl}
                            alt={ticket.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setEnlargedPhotoUrl(ticket.photoUrl!)}
                          />
                          <div 
                            onClick={() => setEnlargedPhotoUrl(ticket.photoUrl!)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Perbesar</span>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm text-[9px] text-white font-mono px-1.5 py-0.5 rounded">
                            Foto Kamera
                          </span>
                        </div>
                      ) : (
                        <div className="w-full sm:w-36 h-36 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 p-3 text-center">
                          <Camera className="w-6 h-6 mb-1 text-slate-300" />
                          <span className="text-[10px]">Tanpa Foto</span>
                        </div>
                      )}

                      {/* Info & Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{ticket.locationBuilding} • {ticket.locationFloor} • <strong className="text-slate-800">{ticket.locationRoom}</strong></span>
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                          {ticket.title}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {ticket.description}
                        </p>

                        {/* Assigned Technician Card */}
                        {ticket.assignedTechnician && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {ticket.assignedTechnician.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{ticket.assignedTechnician.name}</span>
                                  <span className="text-[10px] font-normal text-slate-500">({ticket.assignedTechnician.role})</span>
                                </div>
                                <div className="text-[11px] text-teal-700 font-mono">
                                  WA: {ticket.assignedTechnician.phone}
                                </div>
                              </div>
                            </div>

                            {ticket.scheduledDate && (
                              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                Jadwal: {ticket.scheduledDate}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Technician Notes */}
                        {ticket.technicianNotes && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed">
                            <strong>Catatan Teknisi:</strong> {ticket.technicianNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STATUS LIFECYCLE STEPPER */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Alur Pelacakan Status:
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {[
                          { step: 1, label: 'Laporan Diterima' },
                          { step: 2, label: 'Diverifikasi Sarpras' },
                          { step: 3, label: 'Proses Pengerjaan' },
                          { step: 4, label: 'Perbaikan Selesai' }
                        ].map((s) => {
                          const currentStepNumber = statMeta.stepNumber;
                          const isDone = currentStepNumber >= s.step;
                          const isCurrent = currentStepNumber === s.step;

                          return (
                            <div key={s.step} className="space-y-1">
                              <div className={`h-2 rounded-full transition-all ${
                                isDone 
                                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600' 
                                  : 'bg-slate-200'
                              } ${isCurrent ? 'ring-2 ring-teal-400' : ''}`}></div>
                              <span className={`text-[10px] sm:text-[11px] block font-bold leading-tight ${
                                isDone ? 'text-teal-900' : 'text-slate-400'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[11px] text-slate-400">
                        Dilaporkan: {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        {ticket.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                          >
                            Batalkan
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedTicketDetail(ticket)}
                          className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Riwayat & Rincian</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CAMERA CAPTURE TOOL MODAL */}
      <FacilityCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
      />

      {/* TICKET DETAIL & AUDIT LOG MODAL */}
      {selectedTicketDetail && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTicketDetail(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">
                  Rincian Tiket #{selectedTicketDetail.ticketCode}
                </h4>
                <p className="text-xs text-teal-200">
                  {selectedTicketDetail.locationBuilding} • {selectedTicketDetail.locationRoom}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              
              {/* Photo Large Display */}
              {selectedTicketDetail.photoUrl && (
                <div className="rounded-2xl overflow-hidden bg-black max-h-64 flex items-center justify-center border border-slate-200">
                  <img
                    src={selectedTicketDetail.photoUrl}
                    alt={selectedTicketDetail.title}
                    className="max-h-64 w-auto object-contain cursor-pointer"
                    onClick={() => setEnlargedPhotoUrl(selectedTicketDetail.photoUrl!)}
                  />
                </div>
              )}

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyConfig[selectedTicketDetail.urgency]?.badgeClass || ''}`}>
                    Priority: {urgencyConfig[selectedTicketDetail.urgency]?.priorityLabel || 'Medium'} ({urgencyConfig[selectedTicketDetail.urgency]?.label || ''})
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {urgencyConfig[selectedTicketDetail.urgency]?.slaText || ''}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {selectedTicketDetail.title}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedTicketDetail.description}
                </p>
              </div>

              {/* Status History Timeline */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Log Riwayat & Catatan Teknisi:
                </h5>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedTicketDetail.statusHistory.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start gap-3 relative">
                      <div className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-teal-700 shrink-0 z-10">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{item.status}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{item.note}</p>
                        <span className="text-[10px] text-teal-700 font-semibold block mt-1">Oleh: {item.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {enlargedPhotoUrl && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setEnlargedPhotoUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setEnlargedPhotoUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={enlargedPhotoUrl}
              alt="Enlarged Facility Damage"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};
