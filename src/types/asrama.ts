export type UserRole = 
  | 'maba' 
  | 'eksisting' 
  | 'maintenance_ticketing'
  | 'admin_keuangan' 
  | 'admin_asrama' 
  | 'cron_monitor' 
  | 'dfd_architecture'
  | 'laravel_blueprint'
  | 'sql_importer'
  | 'schema_diagram'
  | 'sso_migration';

export type AdmissionStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface ModificationLog {
  id: string;
  timestamp: string;
  actor: 'User' | 'Admin' | 'System';
  action: string;
  changedFields?: { field: string; oldValue: any; newValue: any }[];
}

export interface MabaProfile {
  metodePersetujuanOrtu?: 'TERTULIS_F20' | 'ELEKTRONIK_OTP' | 'VIDEO_CALL' | 'REUSE_KIP';
  nimNoReg: string;
  noPmb: string;
  nim: string;
  nik?: string;
  nama: string;
  jalurMasuk: string;
  fakultas: string;
  prodi: string;
  angkatan: string;
  jenisKelamin: string;
  kategori: string;
  noHpWa: string;
  email: string;

  // Alamat KTP (Asal)
  alamatKtpJalan: string;
  alamatKtpRtRw: string;
  alamatKtpKelurahan: string;
  alamatKtpKecamatan: string;
  alamatKtpKabupatenKota: string; 
  alamatKtpProvinsi: string; 
  alamatKtpKodePos: string;

  // Alamat Domisili (Kontak)
  isAlamatDomisiliSamaDenganKtp: boolean;
  alamatDomisiliJalan: string;
  alamatDomisiliRtRw: string;
  alamatDomisiliKelurahan: string;
  alamatDomisiliKecamatan: string;
  alamatDomisiliKabupatenKota: string;
  alamatDomisiliProvinsi: string;
  alamatDomisiliKodePos: string;

  // Kontak Darurat 1 (Utama)
  kontakDaruratNama: string;
  kontakDaruratHubungan: string;
  kontakDaruratNoHp: string;
  kontakDaruratAlamat: string;

  // Kontak Darurat 2 (Opsional)
  kontakDarurat2Nama?: string;
  kontakDarurat2Hubungan?: string;
  kontakDarurat2NoHp?: string;
  kontakDarurat2Alamat?: string;
  tipeKamar: string;
  preferensiLantai: string;
  kebutuhanKhusus: string;
  catatanKesehatan: string;
  persetujuanAwal: boolean;
  isKipStudent: boolean; // Beasiswa KIP vs Non-KIP (Single Source of Truth)
  kategoriMahasiswa?: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP';
  kipNumber?: string;
  isKycRequired: boolean;
  kycSubmitted: boolean;
  correctionStatus?: 'none' | 'pending' | 'unlocked';
  editableFields?: string[];
  modificationLogs?: ModificationLog[];
  ktpUrl?: string;
  selfieUrl?: string;
  kycVerified: boolean;
}

export interface BillingInvoice {
  invoiceId: string;
  nim: string;
  nama: string;
  isKip: boolean;
  durasiBulan: number; // Minimal 6 bulan (1 semester) atau 12 bulan (1 tahun)
  skemaBayarSewa?: 'LUNAS_DIMUKA' | 'BULANAN'; // Opsi bayar sewa: lunas 6 bulan sekaligus atau cicilan bulanan
  tarifPerBulan: number; // Master Tarif Dasar Rp 500.000/bulan
  biayaSewa: number; // Total sewa yang ditagihkan pada invoice ini (Rp 3.000.000 jika lunas 6 bln, atau Rp 500.000 jika bulanan)
  biayaSewaTotalKontrak?: number; // Total komitmen sewa seluruh kontrak (durasiBulan * tarifPerBulan, misal Rp 3.000.000)
  sisaSewaKontrak?: number; // Sisa sewa yang akan ditagihkan di bulan-bulan berikutnya
  isCicilanDeposit: boolean; // false = Lunas, true = Dicicil
  opsiCicilan: 1 | 2 | 3; // 1 = Lunas, 2 = 2x, 3 = 3x
  biayaDeposit: number; // Deposit Termin 1 (yang dibayar saat pendaftaran)
  biayaDepositTotal: number; // Total kewajiban deposit (500.000 atau 750.000)
  sisaCicilanDeposit: number; // Sisa deposit yang dicicil pada bulan/termin berikutnya
  biayaPerlengkapanAwal: number;
  kodeUnik: number; // 3 digit unik e.g. 142
  totalBayar: number; // Total tagihan pendaftaran saat ini
  cicilanDepositAllowed: boolean;
  status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'EXPIRED';
  metodeBayar?: 'TRANSFER_MANUAL' | 'VIRTUAL_ACCOUNT';
  buktiTransferUrl?: string;
  paidAt?: string;
  vaNumber?: string;
  isMigrated?: boolean;
}

export interface RoomPlot {
  roomId: string;
  gedung: string; // e.g. "Gedung A (Enggang)", "Gedung B (Hiu UBT)"
  lantai: number;
  nomorKamar: string; // e.g. "204"
  kapasitas: number;
  terisi: number;
  fasilitas: string[];
}

export interface BASTKItemCondition {
  item: string; // Kasur, Meja Belajar, Lemari Pakaian, Kunci Kamar, AC/Kipas, Lampu
  condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'TIDAK_ADA';
  notes?: string;
}

export interface DigitalContract {
  signatureData?: string;
  contractId: string;
  batchNumber?: string;
  nim: string;
  nama: string;
  nomorKamar: string;
  gedung: string;
  depositAmount: number;
  signedAt?: string;
  otpVerified: boolean;
  waNumber: string;
  
  // Kepatuhan Hukum: Pasal 39 & UU ITE Pasal 11 (Audit Trail)
  parentConsentRequired: boolean;
  parentWaNumber?: string;
  parentOtpVerified?: boolean;
  parentSignedAt?: string;
  documentHash?: string;
  authMethod?: string;
  signerIpAddress?: string;
  retentionUntil?: string; // Pasal 39(10): 5 Tahun sejak berakhir

  status: 'DRAFT' | 'OTP_SENT' | 'SIGNED';
  // BASTK requirement (Yayasan Gleni rule)
  bastkSigned: boolean;
  bastkSignedAt?: string;
  bastkItems: BASTKItemCondition[];
}

export interface ETicket {
  qrCode?: string;
  ticketId: string;
  nim: string;
  nama: string;
  gedung: string;
  kamar: string;
  qrData: string;
  barcode: string;
  validUntil: string;
  status: 'PENDING' | 'ACTIVE' | 'USED';
  isBastkVerified: boolean;
}

export interface GeofenceRecord {
  nim: string;
  nama: string;
  lat: number;
  lng: number;
  distanceFromDormMeter: number;
  isInsideGeofence: boolean;
  timestamp: string;
  gateStatus: 'OPEN' | 'LOCKED_BY_CRON';
}

export interface MaintenanceTicket {
  ticketId: string;
  nim: string;
  nama: string;
  kamar: string;
  gedung: string;
  kategori: 'PLUMBING' | 'LISTRIK' | 'FURNITUR' | 'INTERNET' | 'LAINNYA';
  priority: 'DARURAT' | 'TINGGI' | 'SEDANG' | 'RENDAH'; // 4 Level Prioritas (Peraturan Gleni)
  deskripsi: string;
  fotoUrl?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  resolvedAt?: string;
  petugasName?: string;
}

export interface PackageNotification {
  packageId: string;
  nim: string;
  nama: string;
  kamar: string;
  kurir: string; // J&T, JNE, Shopee Express, Pos
  noResi: string;
  kodeAmbil: string; // e.g. PKT-882
  status: 'DITERIMA_POS_SATPAM' | 'SUDAH_DIAMBIL';
  receivedAt: string;
  pickedUpAt?: string;
}

export interface FacilityRegister {
  registerId: string;
  facilityName: string; // Gym, Ruang Belajar, Laundry, Aula
  nim: string;
  nama: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export type DelinquencyStage = 
  | 'CURRENT'                       // D+0 (Lunas / Jatuh Tempo Hari Ini)
  | 'GRACE_PERIOD_SEWA'             // D+1 s/d D+5 (Toleransi bayar sewa 5 hari, cth: 1-6 Sept)
  | 'DEPOSIT_DIPAKAI_GRACE_TOPUP'   // D+6 s/d D+10 (Deposit dipotong bayar sewa + Toleransi topup 5 hari, cth: 6-11 Sept)
  | 'DEFAULT_KONTRAK_BERAKHIR';     // D+11+ (Lewat 11 Sept: Denda 500rb + Kontrak berakhir)

export interface DelinquencyRecord {
  nim: string;
  nama: string;
  kamar: string;
  daysOverdue: number; // Hari sejak jatuh tempo (cth: jatuh tempo 1 Sept)
  stage?: DelinquencyStage;
  dueDate?: string; // cth: '1 September'
  gracePeriodSewaEnd?: string; // cth: '6 September'
  gracePeriodTopupEnd?: string; // cth: '11 September'
  depositDeductedForRent?: boolean; // true jika lewat 5 hari (tgl 6 Sept)
  depositDeductedAmount?: number; // Nilai deposit yang terpotong untuk sewa
  fineAmount: number; // 0 selama toleransi, 500.000 jika lewat batas top-up (11 Sept)
  contractTerminated?: boolean; // Kontrak tinggal berakhir
  evictionIssued: boolean; // Perintah pengosongan kamar
  notes?: string;

  // Backward compatibility fields
  spLevel?: string;
  servicesSuspended?: boolean;
  parkingFrozen?: boolean;
  depositForfeited?: boolean;
}

export interface DepositRefundCalculation {
  nim: string;
  nama: string;
  kamar: string;
  initialDeposit: number;
  // Deductions in strict priority order (Yayasan Gleni rule)
  p1_tunggakanBiaya: number;
  p2_dendaOverstay: number;
  p3_biayaSimpanBarang: number;
  p4_gantiRugiBastk: number;
  p5_penaltiPengakhiranDini: number;
  totalDeduction: number;
  finalRefundAmount: number;
  status: 'INSPECTION' | 'APPROVED' | 'DISBURSED';
  disbursedAt?: string;
}

export interface CheckoutInspection {
  inspectionId: string;
  nim: string;
  nama: string;
  kamar: string;
  damageFine: number;
  damageNotes: string;
  initialDeposit: number;
  netRefund: number;
  status: 'PENDING' | 'APPROVED' | 'REFUNDED';
  inspectedAt: string;
}



export interface TariffItem {
  id: string;
  name: string;
  amount: number;
  category: 'SEWA' | 'DEPOSIT' | 'PERLENGKAPAN' | 'CICILAN' | 'PENGATURAN' | 'LAINNYA';
  target: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP' | 'ALL';
}

export interface PaymentScheme {
  id: string;
  target: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP' | 'ALL';
  maxInstallments: number;
  installmentMultiplier: number;
  allowDepositInstallment?: boolean; // false = Nonaktif (Default), true = Diaktifkan oleh Admin
}
