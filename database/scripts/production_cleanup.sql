-- ==============================================================================
-- SKRIP SANITASI BASIS DATA PRA-IMPLEMENTASI PRODUKSI (asrama_ubt_db)
-- Portal SI-GABUNG 54 Asrama Universitas Bunda Thamrin (UBT)
-- ==============================================================================
-- PENTING: Eksekusi skrip ini HANYA pada basis data operasional asrama (asrama_ubt_db).
-- Skrip ini membersihkan seluruh transaksi sementara, staging pengujian, dan profil
-- pendaftar dummy mahasiswa tanpa merusak struktur tabel, migrasi, maupun akun admin.
-- ==============================================================================

USE `asrama_ubt_db`;

-- 1. Nonaktifkan sementara pemeriksaan foreign key agar truncate berjalan mulus
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Bersihkan tabel staging pendaftaran dan transaksi sementara
TRUNCATE TABLE `request_pembayaran`;
TRUNCATE TABLE `pembayaran`;
TRUNCATE TABLE `transaksi`;
TRUNCATE TABLE `billing_invoices`;

-- 3. Bersihkan kontrak digital, ratifikasi penempatan, dan tiket masuk asrama
TRUNCATE TABLE `kontrak_digital`;
TRUNCATE TABLE `contracts`;
TRUNCATE TABLE `e_tickets`;
TRUNCATE TABLE `tickets`;
TRUNCATE TABLE `delinquencies`;

-- 4. Bersihkan profil mahasiswa pendaftar simulasi PMB
TRUNCATE TABLE `maba_profiles`;

-- 5. Bersihkan akun pendaftar non-admin (hanya sisakan akun staf/admin)
DELETE FROM `users` WHERE `role` NOT IN ('admin', 'superadmin');

-- 6. Bersihkan riwayat audit pengujian staging
TRUNCATE TABLE `audit_trails`;

-- 7. Reset status kamar menjadi AVAILABLE dan terisi = 0
UPDATE `rooms` SET `terisi` = 0, `status` = 'AVAILABLE';

-- 8. Aktifkan kembali pemeriksaan foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- VERIFIKASI KEBERSIHAN BASIS DATA SETELAH EKSEKUSI:
-- ==============================================================================
-- SELECT 'request_pembayaran' as tabel, count(*) as sisa_baris FROM request_pembayaran
-- UNION ALL
-- SELECT 'pembayaran', count(*) FROM pembayaran
-- UNION ALL
-- SELECT 'transaksi', count(*) FROM transaksi
-- UNION ALL
-- SELECT 'users_non_admin', count(*) FROM users WHERE role NOT IN ('admin', 'superadmin')
-- UNION ALL
-- SELECT 'kamar_terisi', sum(terisi) FROM rooms;
-- ==============================================================================
