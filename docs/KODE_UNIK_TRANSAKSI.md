# Panduan Paripurna: Kode Unik Transaksi Pembayaran Asrama UBT
**Sistem Informasi Gerbang Administrasi Baru dan Unit Naungan Asrama Mahasiswa (SI-GABUNG 54)**  
*Universitas Bunda Thamrin · Roemah 54*

> **Dokumen Terkait:**
> - [Kesiapan Pra-Produksi & SOP Kasir (docs/PRE_PRODUCTION_READINESS.md)](PRE_PRODUCTION_READINESS.md)
> - [Arsitektur Data Staging & Master Ledger (docs/ARCHITECTURE.md)](ARCHITECTURE.md)
> - [Panduan Pengujian Laragon Data Real (docs/TESTING_DATA_REAL_LARAGON.md)](TESTING_DATA_REAL_LARAGON.md)

---

## 1. Hakikat & Analogi Sederhana (Untuk Orang Awam)

### Apa itu "Kode Unik Transaksi"?
**Kode Unik Transaksi** adalah deretan **3 angka acak (misal: `142`, `247`, `384`)** yang disisipkan di ujung nominal pembayaran saat mahasiswa melakukan transaksi keuangan di asrama. Angka ini berfungsi sebagai **"sidik jari transfer"** agar uang yang masuk ke rekening bank asrama langsung teridentifikasi secara presisi milik siapa, kamar berapa, dan untuk keperluan apa.

Sistem Asrama Universitas Bunda Thamrin memiliki **dua jenis transaksi utama** yang wajib menggunakan kode unik:
1. **Transaksi Pendaftaran Baru (Mahasiswa Baru)**: Pembayaran paket awal berupa **Deposit Jaminan + Sewa Bulan Pertama + Biaya Administrasi Rp 100.000**.
2. **Transaksi Perpanjangan Sewa (Mahasiswa Lama / Eksisting)**: Pembayaran iuran sewa bulanan berjalan sebesar **Rp 500.000 per bulan**.

---

### 1.1 Analogi 1: Saat Pendaftaran Baru (Maba)
#### *"Paket Masuk Wahana + Uang Jaminan Loker + Cetak Kartu Anggota"*

Bayangkan Anda mendaftar pertama kali ke sebuah klub rekreasi eksklusif:
* Anda membayar **tiket masuk bulan pertama**: `Rp 500.000,-` (Biaya Sewa Bulan ke-1).
* Anda menitipkan **uang jaminan kunci loker** yang utuh dan dapat diambil kembali saat keluar: `Rp 500.000,-` (atau `Rp 1.000.000,-` untuk skema reguler penuh).
* Anda membayar **biaya administrasi & pembuatan kartu tanda anggota fisik**: `Rp 100.000,-`.

Jika dijumlahkan, total tagihan pokok Anda adalah `Rp 1.100.000,-` (atau `Rp 1.600.000,-`).

Namun di loket, petugas memberikan **stiker nomor dada acak 3 digit**, misalnya **`142`**.
Total yang Anda bayarkan menjadi **`Rp 1.100.142,-`**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             CONTOH RINCIAN TAGIHAN PENDAFTARAN MAHASISWA BARU               │
├─────────────────────────────────────────────────────────────┬───────────────┤
│ Komponen Biaya                                              │       Nominal │
├─────────────────────────────────────────────────────────────┼───────────────┤
│ 1. Biaya Sewa Kamar Bulan ke-1 (Rp 500.000 / bulan)         │  Rp   500.000 │
│ 2. Uang Deposit Jaminan Kamar (dapat dicairkan saat lulus)   │  Rp   500.000 │
│ 3. Biaya Administrasi & Fasilitas Awal (baku SK Tarif)       │  Rp   100.000 │
│ 4. Kode Unik Pembeda Transaksi (Acak Generator Sistem)       │  Rp       142 │
├─────────────────────────────────────────────────────────────┼───────────────┤
│ TOTAL TRANSFER TEPAT                                        │ Rp  1.100.142 │
└─────────────────────────────────────────────────────────────┴───────────────┘
*(Catatan: Jika memilih deposit penuh Rp 1.000.000, total transfer menjadi Rp 1.600.142)*
```

**Mengapa butuh angka `142`?**  
Karena pada hari pendaftaran, ada 50 calon mahasiswa lain yang juga mendaftar paket yang persis sama. Jika semuanya mentransfer angka bulat `Rp 1.100.000`, kasir tidak tahu transferan dari ATM atau m-banking tersebut milik siapa. Begitu angka `Rp 1.100.142` muncul di mutasi bank, kasir langsung tahu dalam 1 detik: *"Uang ini milik Budi Santoso untuk mengunci Ranjang A di Kamar 101!"*

---

### 1.2 Analogi 2: Saat Perpanjangan Sewa Bulanan (Rp 500.000 / Bulan)
#### *"Token Pulsa Listrik Kamar & Kartu Bebas Denda"*

Sekarang bayangkan Anda sudah menjadi penghuni aktif asrama (mahasiswa eksisting). Setiap awal bulan (tanggal 1 s.d. 5), Anda wajib membayar iuran sewa bulanan sebesar **`Rp 500.000,- per bulan`**.
* Pada perpanjangan bulanan, Anda **tidak perlu lagi membayar deposit** (karena uang deposit sudah tersimpan sejak awal masuk).
* Anda juga **tidak perlu lagi membayar biaya administrasi Rp 100.000** (karena administrasi hanya dipungut sekali di awal).
* Biaya murni hanyalah sewa kamar: **`Rp 500.000,-`**.

**Masalah Besar yang Terjadi Tanpa Kode Unik:**
Di asrama terdapat lebih dari 100 kamar aktif. Setiap tanggal 1 s.d. 5, ratusan mahasiswa atau orang tua mentransfer uang sewa `Rp 500.000` ke satu nomor rekening yang sama (**Bank Mandiri `1050508988809` a.n. `Asrama Universitas Bunda Thamrin`**).

Celakanya:
* Sering kali yang mentransfer adalah orang tua di kampung menggunakan rekening atas nama ayah, ibu, paman, atau rekening toko kelontong (misal: *"Toko Berkah"*, *"Ibu Sumiati"*, *"Bapak Suryanto"*).
* Rekening koran bank kasir hanya mencatat 100 baris kembar yang membingungkan:
  ```
  01/10/2026  CR  Rp 500.000  (TRF LIVIN DARI IBU SUMIATI)  --> Kamar yang mana? ❓
  01/10/2026  CR  Rp 500.000  (TRF ATM MANDIRI)             --> Siapa pengirimnya? ❓
  01/10/2026  CR  Rp 500.000  (TRF DARI TOKO BERKAH)        --> Mahasiswa siapa? ❓
  01/10/2026  CR  Rp 500.000  (TRF BRIMO TELLER)            --> Tidak ada nama! ❓
  ```
* Akibatnya: Mahasiswa yang sebenarnya sudah tertib membayar bisa salah dikira menunggak, mendapat surat peringatan, dan terancam denda keterlambatan (SOP Toleransi 5+5 Hari).

**Solusi Cerdas: Kode Unik Perpanjangan Bulanan**  
Ketika mahasiswa membuka menu perpanjangan sewa di aplikasi, sistem menerbitkan tagihan bulanan dengan kode unik 3 digit:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             CONTOH PERPANJANGAN BULANAN MAHASISWA EKSISTING                 │
├───────────────────┬──────────────┬────────────┬─────────────────────────────┤
│ Penghuni Kamar    │ Sewa Bulanan │ Kode Unik  │ Total Wajib Transfer        │
├───────────────────┼──────────────┼────────────┼─────────────────────────────┤
│ Ahmad Raihan      │ Rp 500.000   │    183     │ Rp 500.183                  │
│ Kamar 101 (Lt 1)  │              │            │                             │
├───────────────────┼──────────────┼────────────┼─────────────────────────────┤
│ Dania Sifa        │ Rp 500.000   │    412     │ Rp 500.412                  │
│ Kamar 204 (Lt 2)  │              │            │                             │
├───────────────────┼──────────────┼────────────┼─────────────────────────────┤
│ Ferniati Lani     │ Rp 500.000   │    729     │ Rp 500.729                  │
│ Kamar 305 (Lt 3)  │              │            │                             │
└───────────────────┴──────────────┴────────────┴─────────────────────────────┘
```

Saat kasir membuka mutasi internet banking Bank Mandiri, kasir cukup mengetik **`183`** di kotak pencarian.
Seketika itu juga:
1. Kasir menemukan nominal **`Rp 500.183`**.
2. Kasir langsung tahu pasti bahwa Kamar 101 (Ahmad Raihan) telah lunas membayar sewa bulan ini, meskipun uang tersebut ditransfer dari rekening bibi atau pamannya.
3. Hak tinggal Ahmad Raihan diperpanjang 1 bulan ke depan secara otomatis, bebas dari risiko denda keterlambatan.

---

## 2. Latar Belakang & Urgensi Bisnis: Mengapa Tidak Memakai Payment Gateway Pihak Ketiga?

Banyak orang awam bertanya: *"Mengapa tidak langsung pakai kartu kredit, QRIS otomatis, atau payment gateway seperti e-commerce?"*

Keputusan Universitas Bunda Thamrin untuk menggunakan transfer bank manual dengan kode unik didasarkan pada pertimbangan manajerial yang matang:

1. **Efisiensi Finansial (Bebas Biaya Admin Tambahan)**:
   * Layanan *Payment Gateway* komersial memotong biaya transaksi berkisar antara `Rp 4.000` s.d. `Rp 5.500` per transaksi Virtual Account, atau `1,5%` s.d. `2,5%` untuk QRIS/kartu kredit.
   * Pada transaksi asrama bernilai jutaan rupiah, potongan tersebut sangat membebani mahasiswa atau yayasan jika diakumulasikan ke ratusan kamar.
2. **Kedaulatan Kas Langsung (Zero Settlement Delay)**:
   * Melalui transfer manual ke Bank Mandiri institusi, dana mahasiswa **100% langsung masuk seketika ke kas giro resmi kampus** tanpa tertahan (*holding period*) 1–3 hari kerja di perantara pihak ketiga.
3. **Kepatuhan Audit Keuangan Yayasan & Universitas**:
   * Seluruh mutasi dana masuk tercatat resmi di buku besar giro kampus, mempermudah pelaporan keuangan internal dan audit berkala.

---

## 3. Sistematika Fungsi & Tujuan

Kode unik transaksi memiliki **4 fungsi dan tujuan strategis**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 4 FUNGSI & TUJUAN KODE UNIK TRANSAKSI                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌──────────────────┬──────────────┴─────┬──────────────────┐
     ▼                  ▼                    ▼                  ▼
┌──────────────┐ ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│  1. FUNGSI   │ │  2. TUJUAN   │    │  3. FUNGSI   │   │  4. TUJUAN   │
│ DISAMBIGUASI │ │  EFISIENSI   │    │  PENCEGAHAN  │   │  PENGUNCIAN  │
│  IDENTITAS   │ │  REKONSILIASI│    │  FRAUD/STRUK │   │  KAMAR RIIL  │
└──────────────┘ └──────────────┘    └──────────────┘   └──────────────┘
```

### 1. Fungsi Disambiguasi (Pembeda Transaksi Identik)
Menjamin bahwa setiap tagihan yang terbit memiliki nilai akhir yang unik di hari berjalan, sehingga transaksi antar-mahasiswa tidak akan pernah saling tertukar meskipun mereka memilih tipe kamar, gedung, dan durasi yang sama persis.

### 2. Tujuan Efisiensi Rekonsiliasi Staf Kasir
Menghemat waktu operasional staf keuangan. Kasir tidak perlu mencocokkan nama pengirim satu per satu yang sering kali berbeda (misalnya: ditransfer menggunakan rekening bank paman, bibi, orang tua, atau agen transfer). Kasir cukup **mengetik 3 angka unik di kolom pencarian mutasi internet banking**, dan mutasi langsung ditemukan dalam hitungan detik.

### 3. Fungsi Keamanan & Anti-Fraud (Pencegahan Struk Daur Ulang)
Mencegah kecurangan (*fraud*) di mana satu lembar bukti transfer yang sama diedit atau diunggah ulang oleh calon mahasiswa berbeda. Karena setiap tagihan menuntut nominal transfer dengan 3 digit unik yang berbeda dan terikat batas waktu **48 jam ($2 \times 24$ jam)**, struk lama otomatis tidak akan valid.

### 4. Tujuan Kepastian Hak Kamar (*Room Inventory Guarantee*)
Kode unik mengikat secara presisi hak reservasi ranjang kamar tertentu. Ketika dana dengan kode unik tersebut dinyatakan sah masuk ke bank, sistem langsung mengubah status ranjang dari `HELD` menjadi `OCCUPIED` secara atomik di basis data master.

---

## 4. Perbandingan Spesifikasi Teknis: Pendaftaran Baru vs Perpanjangan Bulanan

Tabel berikut merangkum rumus pembentukan nominal transaksi pada kedua skenario:

| Parameter Evaluasi | Skenario A: Pendaftaran Mahasiswa Baru | Skenario B: Perpanjangan Sewa Bulanan |
| :--- | :--- | :--- |
| **Status Pengguna** | Calon Mahasiswa Baru (PMB / Maba) | Mahasiswa Lama / Eksisting (Senior) |
| **Komponen Sewa** | Biaya Sewa Bulan ke-1 (`Rp 500.000`) | Biaya Sewa 1 Bulan Berjalan (`Rp 500.000`) |
| **Deposit Jaminan** | `Rp 500.000` (Cicilan 1 / KIP) atau `Rp 1.000.000` (Reguler) | **`Rp 0`** (Sudah disetor saat awal masuk) |
| **Biaya Administrasi** | **`Rp 100.000`** (Fasilitas awal, baku SK Tarif) | **`Rp 0`** (Tidak dipungut lagi) |
| **Kode Unik Acak** | 3 digit acak generator (`100` – `999`), cth: `142` | 3 digit acak generator (`100` – `999`), cth: `384` |
| **Formula Perhitungan** | $\text{Sewa} + \text{Deposit} + \text{Admin} + \text{Kode Unik}$ | $\text{Sewa Bulanan} + \text{Kode Unik}$ |
| **Contoh Total Bayar** | **`Rp 1.100.142,-`** (atau `Rp 1.600.142,-`) | **`Rp 500.384,-`** |
| **Masa Berlaku Tagihan** | **48 Jam ($2 \times 24$ Jam)** (Ranjang kamar berstatus `HELD`) | **48 Jam** sebelum jatuh tempo cut-off |
| **Dampak Setelah Lunas** | Ranjang sah `OCCUPIED`, lanjut Kontrak Digital | Masa tinggal bertambah 30 hari, bebas denda |

---

## 5. Alur Penggunaan (Langkah Demi Langkah)

```
[ MAHASISWA / WALI (FRONTEND) ]                      [ KASIR ASRAMA UBT (BACKEND) ]
              │                                                     │
1. Memilih Skema Pendaftaran / Perpanjangan                         │
              │                                                     │
2. Sistem Menerbitkan Tagihan                                       │
   (Pokok + 3 Digit Kode Unik)                                      │
              │                                                     │
3. Mahasiswa Mentransfer ke Rekening Mandiri:                       │
   No. Rek: 1050508988809                                           │
   a.n. Asrama Universitas Bunda Thamrin                            │
   Nominal: TEPAT HINGGA 3 DIGIT TERAKHIR                           │
              │                                                     │
4. Mahasiswa Mengunggah Foto Struk Transfer                         │
              │                                                     │
              └───────────────────── NOTIFIKASI ───────────────────>│
                                                                    │
                                                        5. Kasir Buka Livin / Kopra
                                                           Cari 3 Digit Terakhir
                                                                    │
                                                        6. Nominal Cocok Sempurna?
                                                           ├── YA  -> Klik APPROVE
                                                           │          (Hak Kamar Aktif)
                                                           └── TIDAK-> Masuk SOP Selisih
```

### Langkah Calon Mahasiswa & Penghuni:
1. **Di Portal SI-GABUNG 54**: Mahasiswa memilih kamar (bagi pendaftar baru) atau memilih perpanjangan bulan sewa (bagi penghuni aktif).
2. **Penerbitan Invoice**: Sistem menampilkan halaman pembayaran dengan rincian biaya transparan dan nominal transfer bercetak tebal, disertai instruksi tegas:
   > *"PENTING: Mohon transfer TEPAT hingga 3 digit terakhir (Contoh: Rp 1.100.142 atau Rp 500.384). Jangan dibulatkan agar transaksi Anda langsung diverifikasi kasir."*
3. **Proses Transfer**: Mahasiswa atau orang tua membuka ATM / m-Banking / Teller, memasukkan rekening **Bank Mandiri `1050508988809`**, dan memasukkan angka transfer persis hingga 3 digit terakhir.
4. **Unggah Struk**: Mahasiswa mengunggah tangkapan layar m-banking atau foto struk ATM ke portal.

### Langkah Staf Kasir / Admin Keuangan:
1. **Buka Aplikasi Internet Banking**: Petugas membuka portal internet banking bisnis (**Kopra Mandiri** atau **Livin' by Mandiri**).
2. **Pencarian Cepat**: Petugas melihat invoice mahasiswa di portal asrama (misal perpanjangan sewa: `Rp 500.384`), lalu mencari angka `384` pada mutasi kredit hari ini.
3. **Verifikasi 1-Klik (*Approve & Promote*)**: Begitu angka cocok dan dana riil telah masuk, kasir menekan tombol **"Verifikasi & Sahkan"**.
4. **Otomasi Lanjutan**:
   * *Bagi Pendaftar Baru*: Mahasiswa langsung diarahkan ke penandatanganan kontrak digital OTP dan inventori ranjang terkunci sah.
   * *Bagi Penghuni Perpanjangan*: Masa tinggal kamar diperpanjang 30 hari ke depan dan struk lunas digital diterbitkan seketika.

---

## 6. SOP Penanganan Kendala (Human Error Handling)

Meskipun sistem telah memberikan instruksi yang jelas, terkadang terjadi kesalahan manusia (*human error*). Berikut adalah SOP resmi kasir untuk menangani 4 kasus selisih:

| Kasus Kendala | Situasi Riil di Lapangan | Tindakan Operasional Kasir | Dampak ke Sistem |
| :--- | :--- | :--- | :--- |
| **Kasus A: Mentransfer Nominal Bulat** | Mahasiswa lupa memasukkan kode unik (misal: hanya transfer `Rp 1.100.000` atau `Rp 500.000` bulat). | 1. Kasir memeriksa nama rekening pengirim di mutasi bank.<br>2. Mencocokkan nama dengan data pendaftar/penghuni kamar.<br>3. Jika identitas valid, kasir melakukan *Waive / Adjust Unique Code* secara manual di sistem dan menyetujui transaksi. | Tagihan disahkan lunas; kode unik dianggap diputihkan (*waived*). |
| **Kasus B: Kurang Bayar** | Mahasiswa salah ketik nominal transfer kurang dari tagihan pokok (misal: hanya transfer Rp 400.000 untuk sewa bulanan). | 1. Kasir mengubah status tagihan menjadi `PARTIALLY_PAID`.<br>2. Sistem memunculkan catatan sisa kekurangan bayar.<br>3. Mahasiswa wajib mentransfer kekurangan sebelum perpanjangan kamar disahkan. | Kamar tetap berstatus *Hold*, namun hak perpanjangan belum aktif sebelum lunas. |
| **Kasus C: Lebih Bayar** | Mahasiswa salah mentransfer nominal lebih besar dari tagihan (misal salah transfer Rp 600.000). | 1. Kasir menyetujui invoice utama.<br>2. Kelebihan dana (Rp 100.000) dicatat sebagai saldo kredit deposit mahasiswa di buku besar (`delinquencies` / saldo deposit tambahan) yang dapat dicairkan saat masa sewa berakhir. | Tagihan lunas; saldo deposit mahasiswa bertambah sesuai selisih lebih bayar. |
| **Kasus D: Struk Palsu / Mutasi Tidak Ditemukan** | Mahasiswa mengunggah struk palsu editan atau dana belum benar-benar masuk ke rekening giro kampus. | 1. Kasir menekan tombol **"REJECT"**.<br>2. Kasir memberikan catatan alasan penolakan: *"Mutasi bank tidak ditemukan pada tanggal terkait. Silakan hubungi kasir di 0812-5433-2190 atau unggah bukti transfer yang sah."* | Mahasiswa diminta mengunggah ulang bukti bayar sah dalam sisa waktu **48 jam**. |

---

## 7. Pemetaan Basis Data & Kode Sumber

Bagi pengembang (*developers*) dan auditor sistem informasi, keterkaitan kode unik pada arsitektur kode sumber adalah sebagai berikut:

| Komponen Arsitektur | Lokasi Berkas | Keterangan Teknis |
| :--- | :--- | :--- |
| **Generator Kode Unik** | `app/Http/Controllers/Billing/InvoiceController.php` | Fungsi `configure()`: Mengkalkulasi tarif dan mengeksekusi `$kodeUnik = rand(100, 999);`. |
| **Model Data Invoice** | `app/Models/BillingInvoice.php` | Atribut kolom `$fillable = [..., 'kode_unik', 'total_bayar', ...]`. |
| **Migrasi Database** | `database/migrations/2026_01_01_000003_create_asrama_system_tables.php` | Kolom `$table->integer('kode_unik');` pada tabel staging `stg_invoices`. |
| **Tabel Staging Request** | `docs/ARCHITECTURE.md` | Dicatat pada `request_pembayaran.total_bayar` dengan `operator_id = 0`. |
| **Pembersihan Otomatis** | `app/Console/Commands/ReleaseExpiredHolds.php` | Scheduler cron yang membatalkan invoice dan melepaskan kamar setelah **48 jam ($2 \times 24$ jam)**. |
| **Antarmuka Kasir** | `src/components/admin/AdminKeuangan.tsx` | UI pencocokan 3 digit mutasi bank Mandiri dan tombol *Approval*. |
| **Antarmuka Mahasiswa** | `src/components/maba/MabaDashboard.tsx` | Tampilan rincian tagihan merah/hijau dengan instruksi transfer 3 digit. |

---

## 8. Pertanyaan yang Sering Diajukan (FAQ Orang Awam)

### Q1: Apakah 3 digit kode unik ini merupakan biaya siluman yang memotong saldo mahasiswa?
**Jawab: Tidak sama sekali.** Tiga digit kode unik (misalnya Rp 142 atau Rp 384) nilainya sangat kecil (di bawah seribu rupiah) dan sepenuhnya **masuk utuh ke rekening resmi kas asrama kampus**. Nominal ini dicatat secara transparan pada kuitansi resmi dan buku besar keuangan universitas, bukan potongan biaya pihak ketiga.

### Q2: Mengapa pada perpanjangan sewa bulanan (Rp 500.000) kode unik tetap wajib digunakan?
**Jawab:** Karena di awal bulan, ada puluhan hingga ratusan mahasiswa yang membayar sewa Rp 500.000 secara bersamaan dari berbagai rekening bank keluarga yang namanya berbeda-beda. Tanpa kode unik, kasir tidak bisa membedakan uang Rp 500.000 tersebut untuk Kamar 101, Kamar 204, atau Kamar 305, sehingga mahasiswa berisiko salah dikira menunggak.

### Q3: Mengapa sistem tidak memakai Virtual Account (VA) saja?
**Jawab:** Sistem SI-GABUNG 54 sebenarnya **sudah siap dan memiliki integrasi Virtual Account BNI (Kode Bank: `009`)**. Namun, pada fase operasional reguler kampus, pembayaran transfer manual Bank Mandiri dengan kode unik dijadikan kanal utama untuk menjamin kedaulatan kas giro yayasan tanpa perantara dan tanpa potongan biaya merchant. Kanal VA tetap tersedia untuk otomasi Host-to-Host di masa mendatang.

### Q4: Bagaimana jika calon mahasiswa mentransfer dari bank lain (BCA, BRI, BSI, CIMB)?
**Jawab: Tetap bisa dan sangat mudah.** Mahasiswa cukup memilih menu *"Transfer Antar-Bank"*, memasukkan **Kode Bank Mandiri (`008`)**, memasukkan nomor rekening `1050508988809`, dan mengetik nominal persis beserta 3 digit uniknya.

---

## 9. Kesimpulan

Kode Unik Transaksi adalah **solusi rekayasa keuangan yang cerdas, efisien, dan berbiaya nol (*zero-cost engineering*)**. Baik untuk **pendaftaran mahasiswa baru** (`Sewa 1 Bulan + Deposit + Admin Rp 100.000 + Kode Unik`) maupun **perpanjangan sewa bulanan** (`Sewa Rp 500.000 + Kode Unik`):
1. Mahasiswa terlindungi dari risiko pembayaran tertukar atau salah catat.
2. Staf kasir dapat memverifikasi ratusan transaksi sewa harian dalam hitungan menit tanpa pusing.
3. Kampus menghemat puluhan juta rupiah dari potongan biaya pihak ketiga (*payment gateway fee*).
4. Tata kelola hunian asrama Roemah 54 Universitas Bunda Thamrin berjalan tertib, modern, dan akuntabel.
