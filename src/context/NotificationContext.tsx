import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BoardAnnouncement, AnnouncementCategory, AnnouncementPriority } from '../types/announcement';
import { INITIAL_ANNOUNCEMENTS } from '../data/initialAnnouncements';
import { toast } from 'sonner';

interface NotificationContextType {
  announcements: BoardAnnouncement[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  broadcastAnnouncement: (announcement: Partial<BoardAnnouncement>) => void;
  simulateLiveBroadcast: () => void;
  isBoardOpen: boolean;
  setIsBoardOpen: (open: boolean) => void;
  selectedAnnouncement: BoardAnnouncement | null;
  setSelectedAnnouncement: (announcement: BoardAnnouncement | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filterOnlyUnread: boolean;
  setFilterOnlyUnread: (unread: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_STORAGE_READ_KEY = 'sigabung_read_announcements_v1';

// Subtle acoustic ping for incoming real-time notifications
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // AudioContext blocked or not allowed, graceful fallback
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<BoardAnnouncement[]>(() => {
    return INITIAL_ANNOUNCEMENTS;
  });

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    // By default, let's mark the older announcements as read so user initially has 2 unread notices
    return new Set(['ann-003', 'ann-004', 'ann-005', 'ann-006']);
  });

  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<BoardAnnouncement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(Array.from(readIds)));
    } catch {
      // ignore
    }
  }, [readIds]);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(announcements.map(a => a.id));
    setReadIds(allIds);
    toast.success('Semua pengumuman asrama ditandai telah dibaca');
  }, [announcements]);

  const broadcastAnnouncement = useCallback((data: Partial<BoardAnnouncement>) => {
    const newId = `ann-live-${Date.now()}`;
    const newAnnouncement: BoardAnnouncement = {
      id: newId,
      title: data.title || 'Pengumuman Baru Asrama',
      summary: data.summary || 'Informasi penting untuk seluruh warga asrama.',
      content: data.content || 'Konten pengumuman resmi dari pengelola asrama.',
      category: data.category || 'general',
      priority: data.priority || 'important',
      targetAudience: data.targetAudience || 'Semua Penghuni Asrama',
      author: data.author || 'Pengelola Asrama UBT',
      authorRole: data.authorRole || 'Pusat Informasi',
      publishedAt: new Date().toISOString(),
      isPinned: data.isPinned ?? false,
      actionTag: data.actionTag || 'Real-time Broadcast'
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    playNotificationChime();

    toast.info(`📢 Pengumuman Baru: ${newAnnouncement.title}`, {
      description: newAnnouncement.summary,
      duration: 6000,
      action: {
        label: 'Buka Pengumuman',
        onClick: () => {
          setSelectedAnnouncement(newAnnouncement);
          setIsBoardOpen(true);
          markAsRead(newId);
        }
      }
    });
  }, [markAsRead]);

  // Sample automated pool of incoming real-time simulations
  const SIMULATION_TEMPLATES = [
    {
      title: '🚨 Inspeksi Kelayakan Jalur Evakuasi Kebakaran Lantai 1 s.d. 3',
      summary: 'Tim K3 Kampus akan melakukan pengecekan sensor asap dan tabung APAR di seluruh lorong asrama.',
      content: `Diberitahukan kepada seluruh warga asrama:
Siang ini mulai pukul 14.00 WITA, Tim Keselamatan dan Kesehatan Kerja (K3) Universitas Borneo Tarakan akan melakukan uji coba sistem alarm dan inspeksi visual kelengkapan pemadam api (APAR).

Harap tidak meletakkan barang pribadi (sepatu, rak piring, kardus) di jalur lorong utama koridor. Bunyi sirine pendek mungkin terdengar selama pengetesan. Terima kasih atas kerjasamanya.`,
      category: 'security' as AnnouncementCategory,
      priority: 'urgent' as AnnouncementPriority,
      author: 'Satgas K3 & Keamanan Kampus UBT',
      authorRole: 'Keselamatan Kerja',
      targetAudience: 'Semua Residen Gedung A & B',
      actionTag: 'K3 & Kebakaran'
    },
    {
      title: '📶 Peningkatan Bandwidth WiFi Edukasi Asrama Menjadi 500 Mbps',
      summary: 'Dukungan akses riset dan perkuliahan daring kini lebih cepat di ruang belajar dan kamar residen.',
      content: `Kabar gembira bagi mahasiswa penghuni asrama:
Unit TI Kampus UBT telah selesai melakukan instalasi fiber optik baru dengan peningkatan kapasitas bandwidth menjadi 500 Mbps simetris.

Akses login menggunakan akun SSO Mahasiswa (NIM dan Password Portal Akademik). Jika mengalami kendala roaming access, silakan lapor di Pos Layanan Komunikasi Asrama.`,
      category: 'facility' as AnnouncementCategory,
      priority: 'normal' as AnnouncementPriority,
      author: 'Unit Pelaksana Teknis Teknologi Informasi (UPT TI)',
      authorRole: 'Teknologi & Jaringan',
      targetAudience: 'Seluruh Civitas Asrama',
      actionTag: 'WiFi Kampus'
    },
    {
      title: '📦 Pemberitahuan Kiriman Paket Residen Tiba di Lobby Utama',
      summary: 'Sebanyak 18 paket kiriman kurir telah diterima petugas. Silakan ambil dengan membawa kartu identitas.',
      content: `Daftar kiriman paket ekspedisi (J&T, SiCepat, Pos Indonesia, JNE) telah didata oleh petugas piket resepsionis.

Penghuni yang merasa memesan paket dapat mengambilnya di Meja Front Desk Lobby Utama dengan menyebutkan Nama Lengkap dan Nomor Kamar. Batas waktu pengambilan adalah sebelum jam piket malam berakhir pukul 21.30 WITA.`,
      category: 'facility' as AnnouncementCategory,
      priority: 'normal' as AnnouncementPriority,
      author: 'Front Desk Resepsionis Asrama 54',
      authorRole: 'Layanan Pengiriman',
      targetAudience: 'Warga Penerima Paket',
      actionTag: 'Paket & Logistik'
    },
    {
      title: '🩺 Pemeriksaan Kesehatan Gratis & Donor Darah di Klinik Kampus',
      summary: 'Program pengabdian F-Kedokteran UBT bersama PMI Tarakan terbuka khusus mahasiswa asrama.',
      content: `Dalam rangka Dies Natalis Universitas Borneo Tarakan, Korps Sukarela (KSR) PMI dan Fakultas Kedokteran menyelenggarakan pemeriksaan tensi, gula darah, dan donor darah gratis.

Waktu: Besok Pagi, 08.30 - 12.00 WITA
Tempat: Selasar Klinik Kampus (Samping Asrama Gedung B)
Disediakan suplemen dan sertifikat pengabdian bagi para pendonor.`,
      category: 'general' as AnnouncementCategory,
      priority: 'normal' as AnnouncementPriority,
      author: 'KSR PMI Unit Universitas Borneo Tarakan',
      authorRole: 'Kesehatan & Relawan',
      targetAudience: 'Semua Mahasiswa Asrama',
      actionTag: 'Kesehatan'
    }
  ];

  const simulateLiveBroadcast = useCallback(() => {
    const randomTemplate = SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)];
    broadcastAnnouncement(randomTemplate);
  }, [broadcastAnnouncement]);

  return (
    <NotificationContext.Provider
      value={{
        announcements,
        unreadCount,
        isRead,
        markAsRead,
        markAllAsRead,
        broadcastAnnouncement,
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
