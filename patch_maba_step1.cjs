const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Find the start and end of step 1
const step1Start = code.indexOf('{currentStep === 1 && (');
const step2Start = code.indexOf('{currentStep === 2 && (');

if (step1Start !== -1 && step2Start !== -1) {
  const newStep1 = `
      {currentStep === 1 && (
        <div id="step-1-panel" className="space-y-6">
          {/* HEADER DASHBOARD MABA LAMA */}
          <div className="bg-emerald-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4 text-xs font-medium text-emerald-200 uppercase tracking-widest">
                <span>ADMISSION FORM</span>
                <span>•</span>
                <span>Asrama UBT</span>
              </div>
              <h1 className="text-3xl font-extrabold mb-2 text-white">
                Registrasi Data Penghuni Asrama
              </h1>
              <p className="text-emerald-100 max-w-2xl text-sm leading-relaxed mb-2">
                Silakan lengkapi informasi domisili dan kontak darurat Anda. Data akademik telah disinkronisasi langsung dari sistem universitas dan bersifat <em>read-only</em> (hanya baca).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: DATA AKADEMIK */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span>Data Akademik</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Read-only dari import SIAKAD/PMB</p>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">LOCKED</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Lengkap</label>
                  <input type="text" value={profile.nama || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">No PMB</label>
                  <input type="text" value={profile.noPmb || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">NIM</label>
                  <input type="text" value={profile.nim || 'Belum tersedia'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">NIK KTP (e-KYC)</label>
                  <input type="text" value={profile.kycVerified ? 'Terverifikasi' : 'Menunggu verifikasi...'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Program Studi</label>
                  <input type="text" value={profile.prodi || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Fakultas</label>
                  <input type="text" value={profile.fakultas || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Angkatan</label>
                  <input type="text" value={profile.angkatan || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Jenis Kelamin</label>
                  <input type="text" value={profile.jenisKelamin === 'L' ? 'Laki-laki' : profile.jenisKelamin === 'P' ? 'Perempuan' : ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-medium text-xs" />
                </div>
                <div className="col-span-2 flex gap-2">
                  <div className="flex-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kategori Status</label>
                    <input type="text" value={profile.kategori || 'Reguler'} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-bold text-xs" />
                  </div>
                  <div className="flex items-end">
                    <button className="px-4 py-2 border border-emerald-500 text-emerald-600 bg-white rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors">Ubah</button>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: KONTAK DARURAT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm row-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span>Kontak Darurat</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Wajib untuk administrasi hunian</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <PhoneCall className="w-3.5 h-3.5" /> Kontak Utama (Wajib)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Kontak *</label>
                      <input type="text" value={profile.kontakDaruratNama || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDaruratNama: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Hubungan *</label>
                      <select value={profile.kontakDaruratHubungan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDaruratHubungan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                        <option value="">Pilih Hubungan...</option>
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Wali">Wali</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp *</label>
                      <input type="text" value={profile.kontakDaruratNoHp || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDaruratNoHp: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Alamat Ringkas *</label>
                      <input type="text" value={profile.kontakDaruratAlamat || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDaruratAlamat: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Kontak Alternatif (Opsional)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Kontak</label>
                      <input type="text" value={profile.kontakDarurat2Nama || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDarurat2Nama: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Hubungan</label>
                      <select value={profile.kontakDarurat2Hubungan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDarurat2Hubungan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                        <option value="">Pilih Hubungan...</option>
                        <option value="Saudara">Saudara</option>
                        <option value="Paman/Bibi">Paman/Bibi</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp</label>
                      <input type="text" value={profile.kontakDarurat2NoHp || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDarurat2NoHp: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Alamat Ringkas</label>
                      <input type="text" value={profile.kontakDarurat2Alamat || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kontakDarurat2Alamat: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: KONTAK PRIBADI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span>Kontak Pribadi</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Data komunikasi mahasiswa</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Email Aktif *</label>
                  <input type="email" value={profile.email || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp *</label>
                  <input type="tel" value={profile.noHpWa || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, noHpWa: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2 mt-2">
                  <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Alamat Asal (Sesuai KTP)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-700 block mb-1 text-[10px] font-bold">Jalan / Dusun *</label>
                      <input type="text" value={profile.alamatKtpJalan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpJalan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">RT / RW *</label>
                        <input type="text" value={profile.alamatKtpRtRw || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpRtRw: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Desa / Kelurahan *</label>
                        <input type="text" value={profile.alamatKtpKelurahan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpKelurahan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Provinsi *</label>
                        <select value={profile.alamatKtpProvinsi || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpProvinsi: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                          <option value="">Pilih...</option>
                          <option value="KALIMANTAN UTARA">KALIMANTAN UTARA</option>
                          <option value="KALIMANTAN TIMUR">KALIMANTAN TIMUR</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kabupaten / Kota *</label>
                        <select value={profile.alamatKtpKabupatenKota || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpKabupatenKota: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                          <option value="">Pilih...</option>
                          <option value="Tarakan">Tarakan</option>
                          <option value="Bulungan">Bulungan</option>
                          <option value="Nunukan">Nunukan</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kecamatan *</label>
                        <input type="text" value={profile.alamatKtpKecamatan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpKecamatan: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kode Pos</label>
                        <input type="text" value={profile.alamatKtpKodePos || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, alamatKtpKodePos: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: PREFERENSI HUNIAN */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">4</span>
                  <span>Preferensi Hunian</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Kamar dan kebutuhan khusus</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Tipe Asrama / Kamar</label>
                    <select value={profile.tipeKamar || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, tipeKamar: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                      <option value="">Pilih Tipe...</option>
                      <option value="Asrama 54 (Kapasitas 2 Orang)">Asrama 54 (Kapasitas 2 Orang)</option>
                      <option value="Asrama 54 (Kapasitas 4 Orang)">Asrama 54 (Kapasitas 4 Orang)</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Preferensi Lantai</label>
                    <select value={profile.preferensiLantai || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, preferensiLantai: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500">
                      <option value="">Pilih Lantai...</option>
                      <option value="Lantai 1">Lantai 1</option>
                      <option value="Lantai 2">Lantai 2</option>
                      <option value="Lantai 3">Lantai 3</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kebutuhan Khusus</label>
                  <input type="text" value={profile.kebutuhanKhusus || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, kebutuhanKhusus: e.target.value})} placeholder="Tidak ada" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 text-[11px] font-bold">Catatan Kesehatan / Alergi</label>
                  <input type="text" value={profile.catatanKesehatan || ''} onChange={e => onUpdateProfile && onUpdateProfile({...profile, catatanKesehatan: e.target.value})} placeholder="Alergi ringan / opsional" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: UPLOAD DOKUMEN & e-KYC */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">5</span>
                  <span>Upload Dokumen Identitas & e-KYC Security</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Disimpan pada Private File Storage terenkripsi (DFD P2 / Laragon disk)</p>
              </div>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3" /> Encrypted Disk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed">
              {/* KTP UPLOAD */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Upload Kartu Tanda Penduduk (KTP)</h4>
                    <p className="text-[10px] text-slate-500">Kamera Belakang / File Scanned KTP (Max 5MB)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Live
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors">
                    <Smartphone className="w-4 h-4" /> Kamera HP Direct
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors">
                    <ImageIcon className="w-4 h-4" /> Pilih File Galeri
                  </button>
                  <button 
                    onClick={() => {
                      toast.success("Simulasi Upload KTP Berhasil");
                      onUpdateProfile && onUpdateProfile({...profile, ktpUrl: 'mock_ktp.jpg'});
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Simulasi File Cepat
                  </button>
                </div>
                {profile.ktpUrl && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> File KTP Tersimpan</span>
                    <button className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>

              {/* SELFIE UPLOAD */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Upload Pasfoto Selfie + KTP (e-KYC)</h4>
                    <p className="text-[10px] text-slate-500">Kamera Depan (User Selfie) • Verifikasi Biometrik Wajah</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Selfie
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors">
                    <Smartphone className="w-4 h-4" /> Kamera HP Direct
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors">
                    <ImageIcon className="w-4 h-4" /> Pilih File Galeri
                  </button>
                  <button 
                    onClick={() => {
                      toast.success("Simulasi Upload Selfie Berhasil");
                      onUpdateProfile && onUpdateProfile({...profile, selfieUrl: 'mock_selfie.jpg'});
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Simulasi File Cepat
                  </button>
                </div>
                {profile.selfieUrl && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> File Selfie Tersimpan</span>
                    <button className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PERSETUJUAN */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
              checked={profile.persetujuanAwal || false}
              onChange={(e) => onUpdateProfile && onUpdateProfile({...profile, persetujuanAwal: e.target.checked})}
            />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm mb-1">Persetujuan Pendaftaran & Konfirmasi Data Sah:</h4>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Saya menyatakan bahwa seluruh data akademik, kontak pribadi, kontak darurat, preferensi hunian, dan dokumen identitas di atas adalah benar dan sah untuk digunakan dalam administrasi hunian Asrama UBT.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={() => {
                if(!profile.persetujuanAwal) {
                  toast.error("Harap centang kotak persetujuan pendaftaran terlebih dahulu.");
                  return;
                }
                onUpdateProfile && onUpdateProfile({
                  ...profile, 
                  isKycRequired: true, 
                  kycSubmitted: true
                });
                handleStepNavigation(2);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Kirim Formulir Pendaftaran</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* AUDIT LOG BOX (Requested from screenshot) */}
          <div className="bg-white border border-slate-200 rounded-xl mt-8">
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <History className="w-4 h-4" /> Riwayat Aktivitas (Audit Log)
              </h4>
            </div>
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada aktivitas yang tercatat.
            </div>
          </div>
        </div>
      )}
`;

  code = code.slice(0, step1Start) + newStep1 + "\n      " + code.slice(step2Start);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Successfully patched MabaDashboard.");
} else {
  console.error("Could not find boundaries for patch.");
}
