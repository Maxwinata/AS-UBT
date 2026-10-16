<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SimabaDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds on 'simaba' connection.
     * Membuat skema tabel 'pendaftaranmahasiswa' dan 'programstudi' jika belum ada,
     * serta menyuntikkan data sampel PMB dari dump basis data u540633926_simaba.
     */
    public function run(): void
    {
        // 1. Pastikan tabel programstudi ada di koneksi simaba
        if (!Schema::connection('simaba')->hasTable('programstudi')) {
            Schema::connection('simaba')->create('programstudi', function (Blueprint $table) {
                $table->id();
                $table->string('nama', 255);
                $table->timestamps();
            });
        }

        $prodiList = [
            ['id' => 6, 'nama' => 'S1 Ilmu Keperawatan'],
            ['id' => 7, 'nama' => 'S1 Kesehatan Masyarakat'],
            ['id' => 8, 'nama' => 'S1 Hukum'],
            ['id' => 9, 'nama' => 'S1 Manajemen'],
            ['id' => 10, 'nama' => 'S1 Informatika'],
            ['id' => 11, 'nama' => 'D III Keperawatan'],
            ['id' => 12, 'nama' => 'D III Kebidanan'],
        ];

        foreach ($prodiList as $p) {
            DB::connection('simaba')->table('programstudi')->updateOrInsert(
                ['id' => $p['id']],
                array_merge($p, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 2. Pastikan tabel pendaftaranmahasiswa ada di koneksi simaba
        if (!Schema::connection('simaba')->hasTable('pendaftaranmahasiswa')) {
            Schema::connection('simaba')->create('pendaftaranmahasiswa', function (Blueprint $table) {
                $table->id();
                $table->string('nomor_pendaftaran', 255)->unique();
                $table->string('nama_mahasiswa', 255);
                $table->string('nama_ayah', 255)->nullable();
                $table->string('nama_ibu', 255)->nullable();
                $table->string('nik', 255)->nullable();
                $table->string('tempat_lahir', 255)->nullable();
                $table->date('tanggal_lahir');
                $table->enum('jenis_kelamin', ['L', 'P'])->default('L');
                $table->string('agama', 255)->nullable();
                $table->string('asal_sekolah', 255)->nullable();
                $table->unsignedBigInteger('program_studi')->default(6);
                $table->string('jenis_mahasiswa', 50)->default('nonkip');
                $table->string('nomorkip', 255)->nullable();
                $table->string('no_hp', 255)->nullable();
                $table->string('no_hp_ortu', 50)->nullable();
                $table->string('email', 255)->nullable();
                $table->text('alamat')->nullable();
                $table->integer('status_verifikasi')->default(1);
                $table->integer('status')->default(1);
                $table->timestamps();
            });
        }

        // 3. Suntikkan Data Nyata Calon Mahasiswa Baru dari Dump SQL SIMABA
        $mabaList = [
            [
                'id' => 1,
                'nomor_pendaftaran' => '250830001',
                'nama_mahasiswa' => 'Jenny Agustina Shellyana',
                'nik' => '6103206908060002',
                'tempat_lahir' => 'Parindu',
                'tanggal_lahir' => '2006-08-29',
                'jenis_kelamin' => 'P',
                'agama' => 'Kristen',
                'asal_sekolah' => 'SMKN 6 tanjung balai',
                'program_studi' => 11,
                'jenis_mahasiswa' => 'nonkip',
                'nomorkip' => null,
                'no_hp' => '082272836177',
                'email' => 'jennyagustinatobing@gmail.com',
                'alamat' => 'Emplasmen sungai dekan',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 2,
                'nomor_pendaftaran' => '250830002',
                'nama_mahasiswa' => 'MAZA ADITIYA',
                'nik' => '1208171906060001',
                'tempat_lahir' => 'HUTA KAHEAN 1',
                'tanggal_lahir' => '2006-06-19',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'asal_sekolah' => 'MAN PEMATANGSIANTAR',
                'program_studi' => 7,
                'jenis_mahasiswa' => 'kip',
                'nomorkip' => '1125102647611790758',
                'no_hp' => '083132605411',
                'email' => 'mazaaditiya19@gmail.com',
                'alamat' => 'HUTA KAHEAN 1,DOLOK BATUNANGGAR,SIMALUNGUN,SUMATERA UTARA',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 3,
                'nomor_pendaftaran' => '250830003',
                'nama_mahasiswa' => 'Azzahra Safa Musakinah',
                'nik' => '1271164609070002',
                'tempat_lahir' => 'Medan',
                'tanggal_lahir' => '2007-09-06',
                'jenis_kelamin' => 'P',
                'agama' => 'Islam',
                'asal_sekolah' => 'SMAS MUHAMMADIYAH 2 MEDAN',
                'program_studi' => 6,
                'jenis_mahasiswa' => 'kip',
                'nomorkip' => '1125102109081749266',
                'no_hp' => '088261463042',
                'email' => 'azzahrasafa538@gmail.com',
                'alamat' => 'Jl. Karya Sejati no. 78',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 4,
                'nomor_pendaftaran' => '250830004',
                'nama_mahasiswa' => 'DITA AZZAHRA SITORUS',
                'nik' => '1209154901050002',
                'tempat_lahir' => 'GUNUNG MELAYU',
                'tanggal_lahir' => '2005-01-09',
                'jenis_kelamin' => 'P',
                'agama' => 'Islam',
                'asal_sekolah' => 'MAN ASAHAN',
                'program_studi' => 7,
                'jenis_mahasiswa' => 'kip',
                'nomorkip' => '1125101138381760837',
                'no_hp' => '085262298845',
                'email' => 'sitorusditaazzahra@gmail.com',
                'alamat' => 'Desa Gunung Melayu, Dusun I, Kec. Rahuning, Kab. Asahan',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 338,
                'nomor_pendaftaran' => '260108001',
                'nama_mahasiswa' => 'GRACE MARLIN TELAUMBANUA',
                'nik' => '1204055202080001',
                'tempat_lahir' => "Sisobahili I Tanose'o",
                'tanggal_lahir' => '2008-02-12',
                'jenis_kelamin' => 'P',
                'agama' => 'Kristen',
                'asal_sekolah' => 'SMAS PEMDA 1 GUNUNGSITOLI',
                'program_studi' => 6,
                'jenis_mahasiswa' => 'kip',
                'nomorkip' => '1946840320756772',
                'no_hp' => '085379437197',
                'email' => 'gracetelaumbanua82@gmail.com',
                'alamat' => "Sisobahili I Tanose'o Kecamatan Hiliduho",
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 346,
                'nomor_pendaftaran' => '260205001',
                'nama_mahasiswa' => 'Elsis carnellia waruwu',
                'nik' => '1204295205080001',
                'tempat_lahir' => 'Fadoro hunogoa',
                'tanggal_lahir' => '2008-05-12',
                'jenis_kelamin' => 'P',
                'agama' => 'Kristen',
                'asal_sekolah' => 'SMK negeri 1 hiliserangkai',
                'program_studi' => 11,
                'jenis_mahasiswa' => 'kip',
                'nomorkip' => 'RA1MM3',
                'no_hp' => '085142197012',
                'email' => 'elsiswaruwu@gmail.com',
                'alamat' => 'Desa Fadoro Hunogoa Kec hiliserangkai Kab nias',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 355,
                'nomor_pendaftaran' => '260421001',
                'nama_mahasiswa' => 'Rizka mutiara',
                'nik' => '1609094708080002',
                'tempat_lahir' => 'Oku timur',
                'tanggal_lahir' => '2008-02-07',
                'jenis_kelamin' => 'P',
                'agama' => 'Islam',
                'asal_sekolah' => 'Sma negeri 2 buay pemaca',
                'program_studi' => 6,
                'jenis_mahasiswa' => 'nonkip',
                'nomorkip' => null,
                'no_hp' => '082184369877',
                'email' => 'riskamutiara386@gmail.com',
                'alamat' => 'Sakamurni desa Mekar jaya, kecamatan buay pemaca',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
            [
                'id' => 444,
                'nomor_pendaftaran' => '260704001',
                'nama_mahasiswa' => 'Alfonso Vincent Husly',
                'nik' => '3172061605081001',
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '2008-05-16',
                'jenis_kelamin' => 'L',
                'agama' => 'Kristen',
                'asal_sekolah' => 'Methodist Pelita Kasih',
                'program_studi' => 10,
                'jenis_mahasiswa' => 'nonkip',
                'nomorkip' => null,
                'no_hp' => '081808160508',
                'email' => 'alfonsovincent36@gmail.com',
                'alamat' => 'Citraland Gama City Medan',
                'status_verifikasi' => 1,
                'status' => 1,
            ],
        ];

        foreach ($mabaList as $maba) {
            DB::connection('simaba')->table('pendaftaranmahasiswa')->updateOrInsert(
                ['nomor_pendaftaran' => $maba['nomor_pendaftaran']],
                array_merge($maba, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
