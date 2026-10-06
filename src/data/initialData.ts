
export const initialTariffs: any[] = [
  { id: 't1', name: 'Sewa Kamar Standar (Per Bulan)', amount: 500000, category: 'SEWA', target: 'ALL' },
  { id: 't2', name: 'Deposit Jaminan (Non-KIP)', amount: 1000000, category: 'DEPOSIT', target: 'REGULER' },
  { id: 't3', name: 'Deposit Jaminan KIP (Lunas 1x)', amount: 500000, category: 'DEPOSIT', target: 'KIP' },
  { id: 't4', name: 'Biaya Administrasi (Non-KIP)', amount: 100000, category: 'PERLENGKAPAN', target: 'REGULER' },
  { id: 't5', name: 'Biaya Administrasi (KIP)', amount: 100000, category: 'PERLENGKAPAN', target: 'KIP' },
  { id: 't6', name: 'Biaya Admin Cicilan 2x (Deposit KIP)', amount: 125000, category: 'CICILAN', target: 'KIP' },
  { id: 't8', name: 'Deposit Jaminan KIP (Dicicil 1,5x)', amount: 750000, category: 'DEPOSIT', target: 'KIP' },
  { id: 't7', name: 'Biaya Admin Cicilan 3x (Deposit KIP)', amount: 250000, category: 'CICILAN', target: 'KIP' },
  { id: 't9', name: 'Maksimal Tenor Cicilan Deposit KIP (Bulan)', amount: 3, category: 'PENGATURAN', target: 'KIP' },
];

import { 
  MabaProfile,
  BillingInvoice,
  RoomPlot,
  DigitalContract,
  ETicket,
  DelinquencyRecord,
  MaintenanceTicket,
  PackageNotification,
  FacilityRegister,
  DepositRefundCalculation,
PaymentScheme } from '../types/asrama';

export const initialPaymentSchemes: PaymentScheme[] = [
  { id: 'ps1', target: 'KIP', maxInstallments: 3, installmentMultiplier: 1.5, allowDepositInstallment: false },
  { id: 'ps2', target: 'REGULER', maxInstallments: 1, installmentMultiplier: 1.0, allowDepositInstallment: false },
  { id: 'ps3', target: 'INTERNAL', maxInstallments: 6, installmentMultiplier: 1.2, allowDepositInstallment: false },
  { id: 'ps4', target: 'EXTERNAL', maxInstallments: 1, installmentMultiplier: 1.0, allowDepositInstallment: false },
  { id: 'ps5', target: 'SCHOLARSHIP', maxInstallments: 3, installmentMultiplier: 1.5, allowDepositInstallment: false },
];

export const INITIAL_MABA: MabaProfile = {
  nimNoReg: 'PMB2026-08942',
  noPmb: 'PMB-2026-0142',
  nim: 'Belum tersedia',
  nama: 'Maximilian Wimin Winata',
  jalurMasuk: 'SNBP 2026',
  fakultas: 'Teknik',
  prodi: 'Teknik Informatika',
  angkatan: '2026',
  jenisKelamin: 'Laki-laki',
  kategori: 'Reguler',
  noHpWa: '081234567890',
  email: 'mahasiswa@ubtsu.ac.id',

  // Alamat KTP (Asal)
  alamatKtpJalan: 'Jl. MH Thamrin No. 45',
  alamatKtpRtRw: '002/004',
  alamatKtpKelurahan: 'Pandan Hulu',
  alamatKtpKecamatan: 'Medan Kota',
  alamatKtpKabupatenKota: 'Kota Medan',
  alamatKtpProvinsi: 'Sumatera Utara',
  alamatKtpKodePos: '20212',

  // Alamat Domisili (Kontak)
  isAlamatDomisiliSamaDenganKtp: true,
  alamatDomisiliJalan: 'Jl. MH Thamrin No. 45',
  alamatDomisiliRtRw: '002/004',
  alamatDomisiliKelurahan: 'Pandan Hulu',
  alamatDomisiliKecamatan: 'Medan Kota',
  alamatDomisiliKabupatenKota: 'Kota Medan',
  alamatDomisiliProvinsi: 'Sumatera Utara',
  alamatDomisiliKodePos: '20212',

  // Kontak Darurat 1
  kontakDaruratNama: 'Bpk. Bambang Winata',
  kontakDaruratHubungan: 'Orang Tua (Ayah)',
  kontakDaruratNoHp: '081299999999',
  kontakDaruratAlamat: 'Jl. MH Thamrin No. 45, Kota Medan',

  // Kontak Darurat 2
  kontakDarurat2Nama: '',
  kontakDarurat2Hubungan: '',
  kontakDarurat2NoHp: '',
  kontakDarurat2Alamat: '',
  tipeKamar: 'Standar',
  preferensiLantai: 'Lantai 2',
  kebutuhanKhusus: 'Tidak ada',
  catatanKesehatan: 'Alergi ringan / opsional',
  persetujuanAwal: true,
  isKipStudent: false, // Default is Regular Non-KIP (Can toggle KIP in Maba dashboard)
  isKycRequired: true,
  kycSubmitted: false,
  ktpUrl: '',
  selfieUrl: '',
  kycVerified: false,
};

export const INITIAL_INVOICE: BillingInvoice = {
  invoiceId: 'INV-UBT-2026-8891',
  nim: 'PMB2026-08942',
  nama: 'Bagus Pratama Putra',
  isKip: false,
  durasiBulan: 6, // Default 1 Semester (6 Bulan)
  tarifPerBulan: 500000, // Master Tarif Rp 500.000/bulan
  biayaSewa: 3000000, // 6 x Rp 500.000
  isCicilanDeposit: false, // Default Lunas (1x = Rp 500.000)
  opsiCicilan: 1, // Lunas
  biayaDeposit: 500000, // Deposit 1x = Rp 500.000
  biayaDepositTotal: 500000,
  sisaCicilanDeposit: 0,
  biayaPerlengkapanAwal: 100000, // Biaya Administrasi
  kodeUnik: 142, // 3 Digit unik verifikasi transfer otomatis
  totalBayar: 3600142, // 3.000.000 + 500.000 + 100.000 + 142
  cicilanDepositAllowed: false, // Default: OFF (Opsi cicilan deposit dinonaktifkan secara default)
  status: 'UNPAID',
};

export const INITIAL_ROOMS: RoomPlot[] = [
  {
    roomId: 'RM-A101',
    gedung: 'Gedung A (Thamrin Utara)',
    lantai: 1,
    nomorKamar: '101',
    kapasitas: 2,
    terisi: 1,
    fasilitas: ['2 Kasur Busa Single', '2 Meja Belajar', 'AC 1PK', 'Kamar Mandi Dalam', 'Lemari 2 Pintu'],
  },
  {
    roomId: 'RM-B204',
    gedung: 'Gedung B (Roemah 54)',
    lantai: 2,
    nomorKamar: '204',
    kapasitas: 2,
    terisi: 0,
    fasilitas: ['2 Bed Springbed', '2 Study Desk + Ergonomic Chair', 'AC 1.5PK', 'Kamar Mandi Dalam + Water Heater', 'Wi-Fi 100Mbps'],
  },
  {
    roomId: 'RM-C302',
    gedung: 'Gedung C (Angsana)',
    lantai: 3,
    nomorKamar: '302',
    kapasitas: 2,
    terisi: 2,
    fasilitas: ['2 Bed Busa Super', '2 Desk Belajar', 'Kipas Angin Dinding', 'Kamar Mandi Luar', 'Balcon View'],
  },
];

export const INITIAL_CONTRACT: DigitalContract = {
  contractId: 'KONTRAK-UBT-54-098',
  batchNumber: 'BATCH-2026-08',
  nim: 'PMB2026-08942',
  nama: 'Bagus Pratama Putra',
  nomorKamar: '204',
  gedung: 'Gedung B (Roemah 54)',
  depositAmount: 1000000,
  otpVerified: false,
  waNumber: '081254992011',
  parentConsentRequired: true,
  parentWaNumber: '081199990000',
  status: 'DRAFT',
  bastkSigned: false,
  bastkItems: [
    { item: 'Kasur Busa / Springbed & Seprei Standard', condition: 'BAIK', notes: 'Kondisi bersih tanpa noda' },
    { item: 'Meja Belajar & Kursi Ergonomis', condition: 'BAIK', notes: 'Tidak ada goresan mayor' },
    { item: 'Lemari Pakaian 2 Pintu + Kunci Master', condition: 'BAIK', notes: 'Kunci berfungsi sempurna' },
    { item: 'Unit AC 1.5PK / Remote Kipas', condition: 'BAIK', notes: 'Dingin dan tidak berisik' },
    { item: 'Kran Air & Sanitasi Kamar Mandi', condition: 'BAIK', notes: 'Aliran lancar, tidak bocor' },
    { item: 'Kunci Digital RFID / Kunci Fisik Kamar', condition: 'BAIK', notes: 'Diserahterimakan 1 set' }
  ],
};

export const INITIAL_TICKET: ETicket = {
  ticketId: 'TCK-UBT-2026-778',
  nim: 'PMB2026-08942',
  nama: 'Bagus Pratama Putra',
  gedung: 'Gedung B (Roemah 54)',
  kamar: '204',
  qrData: 'UBT-ROEMAH54-CHECKIN|PMB2026-08942|RM-B204|BASTK-VALID|2026-08-15',
  barcode: '988273641092',
  validUntil: '15 Agustus 2026 (23:59 WIB)',
  status: 'PENDING',
  isBastkVerified: true,
};

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    ticketId: 'TKT-2026-001',
    nim: '2240101004',
    nama: 'Ahmad Raihan',
    kamar: '101',
    gedung: 'Gedung A (Thamrin Utara)',
    kategori: 'PLUMBING',
    priority: 'DARURAT',
    deskripsi: 'Pipa air wastafel bocor deras membasahi lantai kamar mandi.',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-04 14:30',
    petugasName: 'Budi (Teknisi Air)',
  },
  {
    ticketId: 'TKT-2026-002',
    nim: '2240101055',
    nama: 'Dina Nurul Syahifa',
    kamar: '302',
    gedung: 'Gedung C (Angsana)',
    kategori: 'INTERNET',
    priority: 'SEDANG',
    deskripsi: 'Wi-Fi lantai 3 kadang terputus saat jam sibuk malam hari.',
    status: 'OPEN',
    createdAt: '2026-08-05 09:15',
  },
  {
    ticketId: 'TKT-2026-003',
    nim: 'PMB2026-08942',
    nama: 'Bagus Pratama Putra',
    kamar: '204',
    gedung: 'Gedung B (Roemah 54)',
    kategori: 'LISTRIK',
    priority: 'TINGGI',
    deskripsi: 'Stopkontak meja belajar sebelah kanan longgar dan mengeluarkan percikan.',
    status: 'OPEN',
    createdAt: '2026-08-05 11:00',
  }
];

export const INITIAL_PACKAGES: PackageNotification[] = [
  {
    packageId: 'PKT-9901',
    nim: 'PMB2026-08942',
    nama: 'Bagus Pratama Putra',
    kamar: '204',
    kurir: 'Shopee Express',
    noResi: 'SPXID029984120',
    kodeAmbil: 'AMBIL-8821',
    status: 'DITERIMA_POS_SATPAM',
    receivedAt: '2026-08-05 10:14',
  },
  {
    packageId: 'PKT-9892',
    nim: '2240101004',
    nama: 'Ahmad Raihan',
    kamar: '101',
    kurir: 'J&T Express',
    noResi: 'JT892011928',
    kodeAmbil: 'AMBIL-3310',
    status: 'SUDAH_DIAMBIL',
    receivedAt: '2026-08-04 16:20',
    pickedUpAt: '2026-08-04 18:00',
  }
];

export const INITIAL_FACILITY_REGISTERS: FacilityRegister[] = [
  {
    registerId: 'REG-001',
    facilityName: 'Ruang Belajar Bersama & Pod Zoom',
    nim: 'PMB2026-08942',
    nama: 'Bagus Pratama Putra',
    startTime: '19:00 WIB',
    endTime: '21:00 WIB',
    purpose: 'Diskusi Kelompok Pemrograman Web',
    status: 'ACTIVE',
  },
  {
    registerId: 'REG-002',
    facilityName: 'Gym & Fitness Center Asrama',
    nim: '2240101004',
    nama: 'Ahmad Raihan',
    startTime: '16:00 WIB',
    endTime: '17:30 WIB',
    purpose: 'Latihan Beban Rutin',
    status: 'COMPLETED',
  }
];

export const SAMPLE_DELINQUENCY: DelinquencyRecord[] = [
  {
    nim: '2240101004',
    nama: 'Ahmad Raihan',
    kamar: 'Gedung A - 101',
    daysOverdue: 3, // Cth: 4 Sept (Jatuh tempo 1 Sept)
    stage: 'GRACE_PERIOD_SEWA',
    dueDate: '1 September',
    gracePeriodSewaEnd: '6 September',
    gracePeriodTopupEnd: '11 September',
    depositDeductedForRent: false,
    depositDeductedAmount: 0,
    fineAmount: 0,
    contractTerminated: false,
    evictionIssued: false,
    notes: 'Masa toleransi (grace period) pembayaran tunggakan sewa 5 hari s/d 6 September. Tidak dikenakan denda.',
    spLevel: 'TOLERANSI_SEWA',
    servicesSuspended: false,
    parkingFrozen: false,
    depositForfeited: false,
  },
  {
    nim: '2240101055',
    nama: 'Dina Nurul Syahifa',
    kamar: 'Gedung C - 302',
    daysOverdue: 7, // Cth: 8 Sept (Lewat 6 Sept)
    stage: 'DEPOSIT_DIPAKAI_GRACE_TOPUP',
    dueDate: '1 September',
    gracePeriodSewaEnd: '6 September',
    gracePeriodTopupEnd: '11 September',
    depositDeductedForRent: true,
    depositDeductedAmount: 500000,
    fineAmount: 0,
    contractTerminated: false,
    evictionIssued: false,
    notes: 'Lewat 5 hari toleransi (6 Sept): Uang deposit otomatis dipakai melunasi tunggakan sewa (Rp 500.000). Diberikan tambahan 5 hari toleransi s/d 11 September untuk pemenuhan setoran deposit kembali.',
    spLevel: 'DEPOSIT_DIPOTONG_TOPUP',
    servicesSuspended: false,
    parkingFrozen: false,
    depositForfeited: false,
  },
  {
    nim: '2140304099',
    nama: 'Rizky Kurniawan',
    kamar: 'Gedung B - 105',
    daysOverdue: 12, // Cth: 13 Sept (Lewat 11 Sept)
    stage: 'DEFAULT_KONTRAK_BERAKHIR',
    dueDate: '1 September',
    gracePeriodSewaEnd: '6 September',
    gracePeriodTopupEnd: '11 September',
    depositDeductedForRent: true,
    depositDeductedAmount: 500000,
    fineAmount: 500000, // Denda 500 ribu
    contractTerminated: true, // Kontrak berakhir
    evictionIssued: true, // Perintah Pengosongan
    notes: 'Lewat batas toleransi 11 September tanpa pemenuhan setoran deposit: Dikenakan denda keterlambatan Rp 500.000 dan Kontrak Tinggal Berakhir (Wajib Pengosongan Kamar).',
    spLevel: 'KONTRAK_BERAKHIR_DENDA_500K',
    servicesSuspended: true,
    parkingFrozen: true,
    depositForfeited: true,
  },
];

export const SAMPLE_REFUND_CALCULATIONS: DepositRefundCalculation[] = [
  {
    nim: '2140100012',
    nama: 'Chandra Kirana',
    kamar: 'Gedung A - 202',
    initialDeposit: 1000000,
    p1_tunggakanBiaya: 0,
    p2_dendaOverstay: 0,
    p3_biayaSimpanBarang: 0,
    p4_gantiRugiBastk: 150000, // Kerusakan engsel lemari
    p5_penaltiPengakhiranDini: 0,
    totalDeduction: 150000,
    finalRefundAmount: 850000,
    status: 'APPROVED',
  }
];

