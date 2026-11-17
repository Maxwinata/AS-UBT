/**
 * ============================================================================
 * PUSAT KONFIGURASI ATURAN BISNIS ASRAMA (SINGLE SOURCE OF TRUTH)
 * Portal SI-GABUNG 54 — Universitas Bunda Thamrin (Roemah 54)
 * ============================================================================
 *
 * PANDUAN UNTUK PENGELOLA & PROGRAMMER:
 * File ini adalah SATU-SATUNYA tempat untuk mengubah angka tarif, rumus
 * kode unik transaksi (3 digit), serta batas waktu pembayaran (48 jam).
 * Anda TIDAK PERLU mengedit ribuan baris kode tampilan (UI) jika hanya
 * ingin mengubah tarif sewa, nominal deposit, biaya admin, atau batas jam.
 */

// ============================================================================
// 1. IDENTITAS INSTITUSI & KAPASITAS ASRAMA
// ============================================================================
export const ASRAMA_IDENTITY = {
  /** Nama resmi perguruan tinggi */
  INSTITUTION_NAME: 'Universitas Bunda Thamrin',
  /** Singkatan resmi kampus */
  INSTITUTION_SHORT: 'UBT',
  /** Nama unit gedung asrama */
  DORM_NAME: 'Asrama Mahasiswa UBT (Roemah 54)',
  /** Mode SSO mahasiswa eksisting: Murni menggunakan NIM (tanpa email domain) */
  SSO_AUTH_MODE: 'PURE_NIM_SSO' as const,
  /** Total kamar fisik Roemah 54 */
  TOTAL_ROOMS: 36,
  /** Kapasitas tempat tidur per kamar */
  BEDS_PER_ROOM: 2,
  /** Total daya tampung mahasiswa (36 kamar x 2 bed = 72 penghuni) */
  TOTAL_CAPACITY: 72,
} as const;

// ============================================================================
// 2. KONFIGURASI TARIF RESMI (DALAM RUPIAH)
// ============================================================================
export const ASRAMA_TARIFFS = {
  /** Biaya sewa kamar standar per bulan (Rp 500.000) */
  SEWA_BULANAN: 500_000,
  /** Deposit jaminan mahasiswa Reguler / Non-KIP (Rp 1.000.000) */
  DEPOSIT_REGULER: 1_000_000,
  /** Deposit jaminan mahasiswa KIP jika dibayar lunas 1x di awal (Rp 500.000) */
  DEPOSIT_KIP_LUNAS_1X: 500_000,
  /** Deposit jaminan mahasiswa KIP jika dicicil (1,5x = Rp 750.000) */
  DEPOSIT_KIP_CICILAN: 750_000,
  /** Biaya administrasi pendaftaran awal untuk semua jalur (Rp 100.000) */
  BIAYA_ADMINISTRASI: 100_000,
  /** Biaya admin tambahan skema cicilan 2x untuk KIP (Rp 125.000) */
  BIAYA_ADMIN_CICILAN_2X: 125_000,
  /** Biaya admin tambahan skema cicilan 3x untuk KIP (Rp 250.000) */
  BIAYA_ADMIN_CICILAN_3X: 250_000,
  /** Maksimal tenor cicilan deposit KIP (3 bulan) */
  MAX_TENOR_CICILAN_KIP: 3,
} as const;

// ============================================================================
// 3. ATURAN BATAS WAKTU TAGIHAN & PENGUNCIAN KAMAR (48 JAM)
// ============================================================================
export const ASRAMA_SLA_TIMERS = {
  /** Masa berlaku tagihan & hold kamar sejak pilih kamar: 48 Jam (2 x 24 Jam) */
  INVOICE_EXPIRY_HOURS: 48,
  /** Masa berlaku dalam satuan detik (48 * 3600 = 172.800 detik) */
  INVOICE_EXPIRY_SECONDS: 48 * 3600,
  /** Masa berlaku dalam satuan milidetik (untuk objek Date JavaScript) */
  INVOICE_EXPIRY_MS: 48 * 3600 * 1000,
  /** Ambang batas peringatan darurat sebelum hangus (H-12 Jam) */
  URGENT_WARNING_HOURS: 12,
} as const;

// ============================================================================
// 4. ATURAN KODE UNIK TRANSAKSI (3 DIGIT: 001 - 999)
// ============================================================================
export const UNIQUE_CODE_RULES = {
  /** Nilai minimal kode unik 3 digit */
  MIN_CODE: 1,
  /** Nilai maksimal kode unik 3 digit */
  MAX_CODE: 999,
  /** Status kode unik: ditambahkan ke total transfer sebagai identitas mutasi */
  IS_REVENUE: false,
} as const;

// ============================================================================
// 5. FUNGSI PEMBANTU PERHITUNGAN TAGIHAN (HELPER FUNCTIONS)
// ============================================================================

/**
 * Menghasilkan angka kode unik transaksi 3 digit (antara 1 s.d. 999)
 */
export function generateTransactionUniqueCode(seedNumber?: number): number {
  if (typeof seedNumber === 'number' && seedNumber >= UNIQUE_CODE_RULES.MIN_CODE && seedNumber <= UNIQUE_CODE_RULES.MAX_CODE) {
    return Math.floor(seedNumber);
  }
  return Math.floor(Math.random() * (UNIQUE_CODE_RULES.MAX_CODE - UNIQUE_CODE_RULES.MIN_CODE + 1)) + UNIQUE_CODE_RULES.MIN_CODE;
}

/**
 * Menghitung rincian tagihan pendaftaran awal Mahasiswa Baru (Maba):
 * Rumus: Sewa 1 Bulan (Rp 500rb) + Deposit + Biaya Administrasi (Rp 100rb) + Kode Unik 3 Digit
 */
export function calculateNewRegistrationInvoice(params: {
  isKip: boolean;
  installmentTenor?: 1 | 2 | 3;
  uniqueCode: number;
}) {
  const sewaBulanPertama = ASRAMA_TARIFFS.SEWA_BULANAN;
  const biayaAdmin = ASRAMA_TARIFFS.BIAYA_ADMINISTRASI;

  let deposit: number = ASRAMA_TARIFFS.DEPOSIT_REGULER;
  let biayaAdminCicilan: number = 0;

  if (params.isKip) {
    if (!params.installmentTenor || params.installmentTenor === 1) {
      deposit = ASRAMA_TARIFFS.DEPOSIT_KIP_LUNAS_1X;
    } else {
      deposit = ASRAMA_TARIFFS.DEPOSIT_KIP_CICILAN;
      biayaAdminCicilan =
        params.installmentTenor === 2
          ? ASRAMA_TARIFFS.BIAYA_ADMIN_CICILAN_2X
          : ASRAMA_TARIFFS.BIAYA_ADMIN_CICILAN_3X;
    }
  }

  const nominalPokok = sewaBulanPertama + deposit + biayaAdmin + biayaAdminCicilan;
  const totalTransfer = nominalPokok + params.uniqueCode;

  return {
    sewaBulanPertama,
    deposit,
    biayaAdmin,
    biayaAdminCicilan,
    uniqueCode: params.uniqueCode,
    nominalPokok,
    totalTransfer,
  };
}

/**
 * Menghitung rincian tagihan perpanjangan sewa bulanan Mahasiswa Eksisting:
 * Rumus: (Jumlah Bulan x Rp 500.000) + Kode Unik 3 Digit
 */
export function calculateMonthlyExtensionInvoice(params: {
  months: number;
  uniqueCode: number;
}) {
  const validMonths = Math.max(1, Math.floor(params.months));
  const nominalPokok = validMonths * ASRAMA_TARIFFS.SEWA_BULANAN;
  const totalTransfer = nominalPokok + params.uniqueCode;

  return {
    months: validMonths,
    tarifPerBulan: ASRAMA_TARIFFS.SEWA_BULANAN,
    uniqueCode: params.uniqueCode,
    nominalPokok,
    totalTransfer,
  };
}

/**
 * Menghitung waktu kedaluwarsa tagihan (48 jam sejak dibuat)
 */
export function getInvoiceExpiryTimestamp(fromTimestampMs: number = Date.now()): string {
  return new Date(fromTimestampMs + ASRAMA_SLA_TIMERS.INVOICE_EXPIRY_MS).toISOString();
}
