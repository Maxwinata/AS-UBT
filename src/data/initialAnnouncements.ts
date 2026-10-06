import { BoardAnnouncement } from '../types/announcement';

export const INITIAL_ANNOUNCEMENTS: BoardAnnouncement[] = [
  {
    id: 'ann-001',
    title: '⚠️ Pemeliharaan Berkala Pompa Distribusi Air Bersih & Jaringan WiFi',
    summary: 'Pekerjaan teknis pembersihan tandon utama dan upgrade router koridor lantai 2 & 3 Gedung A dan B.',
    content: `Diberitahukan kepada seluruh warga asrama Roemah 54 Universitas Borneo Tarakan:

Sehubungan dengan pemeliharaan rutin infrastruktur utilitas, Unit Pengelola Asrama akan melaksanakan:
1. Pengurasan tandon utama air bersih pada Sabtu, 26 September 2026 pukul 08.00 - 12.00 WITA. Aliran air akan mengalami penurunan debit sementara.
2. Kalibrasi dan penambahan access point WiFi pada pukul 13.00 - 15.00 WITA.

Mohon para penghuni dapat menampung kebutuhan air secukupnya sebelum waktu pemeliharaan berlangsung. Kami memohon maaf atas ketidaknyamanan operasional ini.`,
    category: 'maintenance',
    priority: 'urgent',
    targetAudience: 'Semua Penghuni (Gedung A & B)',
    author: 'Unit Sarana & Prasarana Asrama UBT',
    authorRole: 'Teknisi & Fasilitas',
    publishedAt: '2026-09-20T08:30:00Z',
    isPinned: true,
    actionTag: 'Air & Listrik'
  },
  {
    id: 'ann-002',
    title: '📢 Tata Cara Check-In & Pengambilan Kunci Kamar Periode Ganjil 2026/2027',
    summary: 'Syarat wajib membawa e-Ticket barcode dan menunjukkan identitas KTM/KTP asli di loket Front Desk.',
    content: `Selamat datang bagi seluruh penghuni baru asrama Roemah 54 UBT!

Berikut tata laksana check-in dan serah terima kunci kamar:
1. Pastikan Anda telah menyelesaikan Tahap 1 sampai Tahap 5 (Penerbitan e-Ticket) pada portal ini.
2. Tunjukkan QR Code e-Ticket (baik cetak maupun tangkapan layar digital) kepada petugas resepsionis di Lobby Utama.
3. Petugas akan melakukan scan verifikasi dan mendampingi pemeriksaan inventaris kamar serta penandatanganan Berita Acara Serah Terima Kamar (BASTK).
4. Layanan loket check-in dibuka setiap hari kerja pukul 08.00 - 16.30 WITA.`,
    category: 'general',
    priority: 'important',
    targetAudience: 'Mahasiswa Baru & Penghuni Baru',
    author: 'Sekretariat Pengelola Asrama UBT',
    authorRole: 'Pelayanan Residen',
    publishedAt: '2026-09-19T14:15:00Z',
    isPinned: true,
    actionTag: 'Panduan Check-In'
  },
  {
    id: 'ann-003',
    title: '💳 Penyesuaian Rekonsiliasi Otomatis Pembayaran Tarif Asrama via VA Bank',
    summary: 'Status pembayaran sewa kamar kini terverifikasi instan tanpa perlu unggah bukti transfer manual.',
    content: `Kabar baik bagi seluruh calon penghuni dan warga asrama:

Sistem Pembayaran Virtual Account (VA) Bank Kaltimtara dan BSI kini telah terintegrasi dengan sistem pemutakhiran data otomatis (Auto-Reconcile).
- Begitu transfer berhasil dieksekusi di ATM / Mobile Banking, status Tagihan pada Portal SI-GABUNG akan otomatis berubah menjadi "LUNAS".
- Mahasiswa tidak perlu lagi melakukan konfirmasi manual atau mengirim foto struk pembayaran melalui chat petugas.
- Apabila terjadi kendala jaringan lebih dari 15 menit, silakan gunakan fitur Bantuan Keuangan di sistem.`,
    category: 'finance',
    priority: 'normal',
    targetAudience: 'Semua Residen & Bendahara',
    author: 'Bagian Keuangan & Kerjasama Perbankan',
    authorRole: 'Admin Keuangan',
    publishedAt: '2026-09-18T10:00:00Z',
    actionTag: 'Sistem Pembayaran'
  },
  {
    id: 'ann-004',
    title: '🧺 Jadwal Operasional & Tata Tertib Ruang Laundry Bersama',
    summary: 'Penggunaan mesin cuci komunal dibuka mulai pukul 06.00 hingga 21.00 WITA dengan sistem nomor antrean digital.',
    content: `Demi kenyamanan dan ketertiban bersama di area utilitas bersama:
1. Ruang Laundry Gedung A dan B beroperasi mulai pukul 06.00 - 21.00 WITA.
2. Harap membawa deterjen cair ramah mesin cuci dan tidak meninggalkan pakaian basah di dalam tabung lebih dari 15 menit setelah siklus pencucian selesai.
3. Jemuran hanya diperkenankan di lantai jemur terbuka (Rooftop / Selasar Belakang), tidak diperkenankan menjemur di koridor kamar atau jendela depan.`,
    category: 'facility',
    priority: 'normal',
    targetAudience: 'Seluruh Penghuni Asrama',
    author: 'Pengawas Ketertiban Asrama',
    authorRole: 'Tata Tertib',
    publishedAt: '2026-09-17T16:45:00Z',
    actionTag: 'Fasilitas'
  },
  {
    id: 'ann-005',
    title: '🔒 Penegasan Jam Malam (Pukul 22.00 WITA) & Prosedur Izin Menginap Luar',
    summary: 'Pintu gerbang utama ditutup pukul 22.00 WITA. Mahasiswa wajib melapor jika ada kegiatan akademik mendesak.',
    content: `Mengingatkan kembali seluruh warga asrama Roemah 54:
- Pintu gerbang kompleks asrama akan dikunci tepat pada pukul 22.00 WITA demi menjaga keamanan dan keselamatan bersama.
- Bagi mahasiswa yang memiliki praktikum lab lembur atau kegiatan organisasi resmi kampus, wajib menyertakan surat izin resmi yang ditandatangani Dosen Pembimbing / Kaprodi maksimal sebelum pukul 18.00 WITA ke pos penjagaan.
- Tamu lawan jenis dilarang keras memasuki lorong hunian kamar kamar asrama. Pertemuan hanya diperkenankan di Gazebo & Ruang Tamu Lobby.`,
    category: 'security',
    priority: 'important',
    targetAudience: 'Seluruh Penghuni & Petugas Keamanan',
    author: 'Komandan Keamanan & Ketertiban Kampus',
    authorRole: 'Satpam & Pengawas',
    publishedAt: '2026-09-16T19:20:00Z',
    actionTag: 'Keamanan'
  },
  {
    id: 'ann-006',
    title: '🎉 Malam Keakraban & Welcoming Gathering Warga Baru Roemah 54',
    summary: 'Temu sambut penghuni baru dan pemilihan koordinator lantai (Korkel) yang akan diadakan akhir pekan ini.',
    content: `Halo Warga Asrama 54!

Untuk mempererat silaturahmi antarpenghuni dari berbagai fakultas dan daerah asal, Dewan Perwakilan Penghuni Asrama (DPPA) mengundang seluruh warga dalam agenda:
- Hari / Tanggal: Sabtu, 3 Oktober 2026
- Waktu: 19.30 WITA s.d. Selesai
- Tempat: Aula Komunal Serbaguna Asrama UBT
- Dresscode: Pakaian Santai Sopan

Akan ada sesi sharing alumni asrama, perkenalan mentor kamar, kudapan bersama, dan pemilihan Koordinator Lantai (Korkel). Kehadiran Anda sangat dinanti!`,
    category: 'general',
    priority: 'normal',
    targetAudience: 'Semua Residen & Pengurus Asrama',
    author: 'Dewan Perwakilan Penghuni Asrama (DPPA)',
    authorRole: 'Organisasi Residen',
    publishedAt: '2026-09-15T11:00:00Z',
    actionTag: 'Kegiatan Residen'
  }
];
