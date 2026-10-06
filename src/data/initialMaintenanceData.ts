import { MaintenanceTicket } from '../types/maintenance';

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-001',
    ticketCode: 'TKT-2026-0419',
    reporterNim: '2240101004',
    reporterName: 'Ahmad Raihan',
    reporterPhone: '081254332190',
    locationBuilding: 'Gedung A (Enggang Utara)',
    locationFloor: 'Lantai 1',
    locationRoom: 'Kamar 101 - Kamar Mandi Dalam',
    category: 'plumbing',
    urgency: 'high',
    title: 'Kran Wastafel Bocor Deras & Pipa Sambungan PVC Rembes',
    description: 'Kran wastafel air bersih di kamar mandi kamar 101 tidak bisa ditutup rapat, air terus mengalir dan merembes ke lantai selasar.',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    photoCapturedAt: '2026-09-19T10:14:00Z',
    createdAt: '2026-09-19T10:15:00Z',
    updatedAt: '2026-09-20T08:30:00Z',
    status: 'IN_PROGRESS',
    assignedTechnician: {
      name: 'Pak Herman Santoso',
      role: 'Teknisi Sanitasi & Plumbing Sarpras',
      phone: '085246778901'
    },
    scheduledDate: '2026-09-20',
    technicianNotes: 'Teknisi sudah membawa spare-part cartridge kran 1/2 inch dan seal tape. Sedang proses penggantian pipa sambungan.',
    statusHistory: [
      {
        id: 'hist-1',
        status: 'SUBMITTED',
        timestamp: '2026-09-19 10:15 WITA',
        note: 'Laporan kerusakan dibuat oleh penghuni melalui portal.',
        actor: 'Ahmad Raihan (Residen)'
      },
      {
        id: 'hist-2',
        status: 'VERIFIED',
        timestamp: '2026-09-19 13:40 WITA',
        note: 'Laporan divalidasi oleh Admin Sarpras. Ditugaskan ke tim teknisi plumbing.',
        actor: 'Admin Sarpras Asrama'
      },
      {
        id: 'hist-3',
        status: 'IN_PROGRESS',
        timestamp: '2026-09-20 08:30 WITA',
        note: 'Teknisi Pak Herman tiba di lokasi dan memulai perbaikan.',
        actor: 'Pak Herman Santoso (Teknisi)'
      }
    ]
  },
  {
    id: 'tkt-002',
    ticketCode: 'TKT-2026-0420',
    reporterNim: '2240101004',
    reporterName: 'Ahmad Raihan',
    reporterPhone: '081254332190',
    locationBuilding: 'Gedung A (Enggang Utara)',
    locationFloor: 'Lantai 1',
    locationRoom: 'Kamar 101 - Meja Belajar Sisi Kanan',
    category: 'electrical',
    urgency: 'emergency',
    title: 'Stopkontak Dinding Longgar & Mengeluarkan Bau Hangus Saat Dicolok Laptop',
    description: 'Terdapat percikan api kecil dan bau hangus ketika kabel charger dicolokkan ke stopkontak dinding dekat kasur. Saklar MCB lokal sempat turun.',
    photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    photoCapturedAt: '2026-09-19T18:20:00Z',
    createdAt: '2026-09-19T18:22:00Z',
    updatedAt: '2026-09-19T19:00:00Z',
    status: 'VERIFIED',
    assignedTechnician: {
      name: 'Pak Joko Sukoco',
      role: 'Teknisi Kelistrikan & Jaringan UBT',
      phone: '081399881234'
    },
    scheduledDate: '2026-09-21',
    technicianNotes: 'Stopkontak telah dimatikan dari panel induk kamar demi keamanan. Penggantian modul inbow stopkontak dijadwalkan pagi hari.',
    statusHistory: [
      {
        id: 'hist-201',
        status: 'SUBMITTED',
        timestamp: '2026-09-19 18:22 WITA',
        note: 'Laporan kategori darurat diajukan oleh penghuni.',
        actor: 'Ahmad Raihan (Residen)'
      },
      {
        id: 'hist-202',
        status: 'VERIFIED',
        timestamp: '2026-09-19 19:00 WITA',
        note: 'Admin Asrama menetapkan status prioritas darurat dan menjadwalkan kunjungan teknisi kelistrikan.',
        actor: 'Admin Sarpras Asrama'
      }
    ]
  },
  {
    id: 'tkt-003',
    ticketCode: 'TKT-2026-0412',
    reporterNim: '2240101004',
    reporterName: 'Ahmad Raihan',
    reporterPhone: '081254332190',
    locationBuilding: 'Gedung A (Enggang Utara)',
    locationFloor: 'Lantai 1',
    locationRoom: 'Kamar 101 - Lemari Pakaian',
    category: 'furniture',
    urgency: 'medium',
    title: 'Engsel Pintu Lemari Pakaian Lepas dan Pintu Miring',
    description: 'Engsel bagian atas pintu lemari baju terlepas dari sekrup kayunya sehingga pintu bergesekan dengan lantai saat dibuka.',
    photoUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
    photoCapturedAt: '2026-09-15T09:00:00Z',
    createdAt: '2026-09-15T09:05:00Z',
    updatedAt: '2026-09-16T11:45:00Z',
    status: 'COMPLETED',
    assignedTechnician: {
      name: 'Pak Sugeng',
      role: 'Tukang Kayu & Mebel Sarpras',
      phone: '081256784321'
    },
    scheduledDate: '2026-09-16',
    technicianNotes: 'Engsel sendok hidrolik baru telah dipasang dengan sekrup baja diperkuat wood-filler. Pintu lemari sudah presisi dan lancar dibuka tutup.',
    statusHistory: [
      {
        id: 'hist-301',
        status: 'SUBMITTED',
        timestamp: '2026-09-15 09:05 WITA',
        note: 'Laporan kerusakan lemari dicatat.',
        actor: 'Ahmad Raihan (Residen)'
      },
      {
        id: 'hist-302',
        status: 'VERIFIED',
        timestamp: '2026-09-15 14:00 WITA',
        note: 'Disetujui untuk perbaikan mebel.',
        actor: 'Admin Sarpras Asrama'
      },
      {
        id: 'hist-303',
        status: 'IN_PROGRESS',
        timestamp: '2026-09-16 10:10 WITA',
        note: 'Pemasangan engsel baru oleh Pak Sugeng.',
        actor: 'Pak Sugeng (Teknisi Mebel)'
      },
      {
        id: 'hist-304',
        status: 'COMPLETED',
        timestamp: '2026-09-16 11:45 WITA',
        note: 'Pekerjaan selesai dan diverifikasi oleh penghuni.',
        actor: 'Pak Sugeng (Teknisi Mebel)'
      }
    ]
  },
  {
    id: 'tkt-004',
    ticketCode: 'TKT-2026-0422',
    reporterNim: '2240101004',
    reporterName: 'Ahmad Raihan',
    reporterPhone: '081254332190',
    locationBuilding: 'Gedung A (Enggang Utara)',
    locationFloor: 'Lantai 1',
    locationRoom: 'Selasar Koridor Depan Kamar 101-105',
    category: 'doors_windows',
    urgency: 'low',
    title: 'Grendel Jendela Selasar Koridor Depan Kamar Macet',
    description: 'Tuas pengunci grendel jendela aluminium di lorong depan kamar macet karena berkarat, tidak bisa ditutup rapat saat hujan lebat berangin.',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    photoCapturedAt: '2026-09-20T16:00:00Z',
    createdAt: '2026-09-20T16:05:00Z',
    updatedAt: '2026-09-20T16:05:00Z',
    status: 'SUBMITTED',
    statusHistory: [
      {
        id: 'hist-401',
        status: 'SUBMITTED',
        timestamp: '2026-09-20 16:05 WITA',
        note: 'Laporan baru diajukan oleh penghuni. Menunggu peninjauan petugas sarpras.',
        actor: 'Ahmad Raihan (Residen)'
      }
    ]
  }
];
