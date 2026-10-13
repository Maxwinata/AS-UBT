<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class RequestPembayaran extends Model
{
    protected $table = 'request_pembayaran';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_pembayaran' => 'datetime',
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        'tanggal_verifikasi' => 'datetime',
        'tanggal_perpanjang' => 'datetime',
        'total_tagihan' => 'decimal:2',
        'total_potongan_harga' => 'decimal:2',
        'total_bayar' => 'decimal:2',
        'status_verifikasi' => 'integer',
        'status_asrama' => 'integer',
        'status_catering' => 'integer',
        'operator_id' => 'integer',
    ];

    /**
     * Rincian item tagihan permintaan (Sewa, Deposit, Admin fee)
     */
    public function details(): HasMany
    {
        return $this->hasMany(RequestPembayaranDetail::class, 'no_request', 'no_request');
    }

    /**
     * Catatan mutasi & bukti transfer yang diunggah Maba
     */
    public function transaksi(): HasOne
    {
        return $this->hasOne(RequestTransaksi::class, 'no_request', 'no_request');
    }

    /**
     * Relasi ke profil penyewa
     */
    public function penyewa(): BelongsTo
    {
        return $this->belongsTo(Penyewa::class, 'penyewa_id');
    }

    /**
     * Relasi ke kamar yang dipilih Maba
     */
    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'kamar_id');
    }

    /**
     * Bridging Logika: Promosi Staging Pendaftaran Otonom ke Master Web Admin Berjalan
     * Mentransformasi:
     * - request_pembayaran -> pembayaran (operator_id = ID Admin)
     * - request_pembayaran_detail -> pembayaran_detail (no_invoice resmi)
     * - request_transaksi -> transaksi (no_invoice resmi & jenis_transaksi = Asrama)
     * - penyewa (status = 1, status_asrama = 1)
     */
    public function promoteToMaster(int $operatorId = 1, ?string $customInvoiceNo = null): Pembayaran
    {
        return DB::transaction(function () use ($operatorId, $customInvoiceNo) {
            $penyewa = $this->penyewa;
            $officialInvoiceNo = $customInvoiceNo ?? ('INV-' . date('Ym') . '-' . sprintf('%04d', $this->id ?: rand(1000, 9999)));

            // 1. Catat ke Master Pembayaran Resmi
            $pembayaran = Pembayaran::create([
                'no_invoice' => $officialInvoiceNo,
                'tanggal_pembayaran' => now(),
                'jenis_penyewa' => $penyewa->jenis_penyewa ?? 'mahasiswa',
                'tanggal_masuk' => $this->tanggal_masuk ?? now(),
                'tanggal_keluar' => $this->tanggal_keluar ?? now()->addMonths($this->durasi ?: 6),
                'durasi' => $this->durasi ?: 6,
                'penyewa_id' => $this->penyewa_id,
                'nama_lengkap' => $penyewa->namalengkap ?? $this->nama_bill_to,
                'no_ktp' => $penyewa->noktp ?? null,
                'nama_bill_to' => $this->nama_bill_to,
                'kamar_id' => $this->kamar_id,
                'total_tagihan' => $this->total_tagihan,
                'total_potongan_harga' => $this->total_potongan_harga ?? 0.00,
                'total_bayar' => $this->total_bayar,
                'status_pembayaran' => 'paid',
                'status_asrama' => 1,
                'status_catering' => $this->status_catering ?? 0,
                'operator_id' => $operatorId,
            ]);

            // 2. Salin Detail Komponen ke Master Pembayaran Detail
            $details = $this->details;
            foreach ($details as $detail) {
                PembayaranDetail::create([
                    'no_invoice' => $officialInvoiceNo,
                    'harga_id' => $detail->harga_id,
                    'jenissewa' => $detail->jenissewa,
                    'harga' => $detail->harga,
                    'qty' => $detail->qty,
                    'jumlah_pembayaran' => $detail->jumlah_pembayaran,
                    'potongan_harga' => $detail->potongan_harga ?? 0.00,
                    'status' => 1,
                ]);
            }

            // 3. Salin Mutasi ke Master Transaksi Kas
            $reqTransaksi = $this->transaksi;
            $officialTrxNo = 'TRX-' . date('Ym') . '-' . sprintf('%04d', $this->id ?: rand(1000, 9999));
            
            Transaksi::create([
                'parent_id' => null,
                'no_invoice' => $officialInvoiceNo,
                'penyewa_id' => $this->penyewa_id,
                'no_transaksi' => $reqTransaksi ? $reqTransaksi->no_transaksi : $officialTrxNo,
                'tanggal_transaksi' => $reqTransaksi ? $reqTransaksi->tanggal_transaksi : now(),
                'jumlah_uang' => $this->total_bayar,
                'metode_pembayaran' => $reqTransaksi ? $reqTransaksi->metode_pembayaran : 'Transfer Bank BSI',
                'file_bukti' => $reqTransaksi ? $reqTransaksi->file_bukti : null,
                'jenis_transaksi' => 'Asrama',
                'operator_id' => $operatorId,
            ]);

            // 4. Update Status Staging Bridging
            $this->update([
                'status_verifikasi' => 1,
                'status_pembayaran' => 'paid',
                'tanggal_verifikasi' => now(),
                'operator_id' => $operatorId,
            ]);

            // 5. Update Status Master Penyewa
            if ($penyewa) {
                $penyewa->update([
                    'status' => 1,
                    'status_asrama' => 1,
                    'operator_id' => $operatorId,
                ]);
            }

            return $pembayaran;
        });
    }
}
