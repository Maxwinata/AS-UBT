const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// The grep command accidentally put the comments into the file.
const errStart = code.indexOf('// const endLogic =');
if(errStart !== -1) {
    code = code.substring(0, errStart);
}

const theRest = `  const handleSimpanTandaTangan = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureDataUrl = signaturePadRef.current.toDataURL();
      onUpdateContract({ ...contract, signatureDataUrl, status: 'SIGNED' });
      toast.success('Tanda tangan digital berhasil disimpan!');
    } else {
      toast.error('Silakan tanda tangani dokumen terlebih dahulu.');
    }
  };

  const handleClearTandaTangan = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleGenerateTicket = () => {
    const ticketId = 'TIX-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    onUpdateTicket({ ...ticket, id: ticketId, qrCode: ticketId, status: 'ISSUED' });
    toast.success('e-Ticket Asrama berhasil diterbitkan!');
    setTimeout(() => {
      onClearSsoNotice();
      setCurrentStep(6);
    }, 1500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const downloadTicketPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 148, 210, 'F');

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('E-TICKET ASRAMA UBT', 148/2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('ID Tiket: ' + ticket.id, 148/2, 26, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Nama: ' + profile.nama, 15, 45);
    doc.text('NIM: ' + profile.nim, 15, 52);
    doc.text('Gedung: ' + room?.gedung, 15, 59);
    doc.text('Kamar: ' + room?.nomorKamar, 15, 66);

    doc.save(\`Ticket_Asrama_\${profile.nim}.pdf\`);
  };

  const handleKycApprovalComplete = (updatedProfile: MabaProfile) => {
    onUpdateProfile(updatedProfile);
    setIsScannerOpen(false);
  };

  const handleStepNavigation = (step: AdmissionStep) => {
    setCurrentStep(step);
    setTimeout(() => {
      document.getElementById(\`step-\${step}-panel\`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Add Kode Unik Generator
  const handleRegenerateKodeUnik = () => {
    if (invoice.status === 'UNPAID') {
      const newKode = Math.floor(Math.random() * 900) + 100;
      setInvoice(inv => {
        const baseTotal = inv.totalBayar - inv.kodeUnik;
        return {
          ...inv,
          kodeUnik: newKode,
          totalBayar: baseTotal + newKode
        };
      });
      toast.success(\`Kode unik diperbarui menjadi +\${newKode}\`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER DASHBOARD MABA */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CheckCircle2 className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              PORTAL MAHASISWA BARU (MABA)
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
              T.A 2026/2027
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
            Selamat Datang, {profile.nama.split(' ')[0]}!
          </h1>
          <p className="text-teal-100 max-w-2xl text-sm leading-relaxed mb-6">
            Anda sedang dalam proses <strong className="text-white">Fase A (Penerimaan & Orientasi)</strong>. 
            Silakan selesaikan 6 langkah wajib di bawah ini untuk mendapatkan e-Ticket dan akses resmi ke kamar asrama Anda.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center space-x-3">
              <div className="bg-teal-500/30 p-2 rounded-lg">
                <Scan className="w-4 h-4 text-teal-100" />
              </div>
              <div>
                <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider">No. PMB / Pendaftaran</p>
                <p className="font-mono text-sm font-bold text-white">{profile.noPmb}</p>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center space-x-3">
              <div className="bg-teal-500/30 p-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-teal-100" />
              </div>
              <div>
                <p className="text-[10px] text-teal-200 uppercase font-bold tracking-wider">Status NIM (SSO)</p>
                <p className="font-mono text-sm font-bold text-white">
                  {profile.nim === 'Belum tersedia' ? 'Menunggu Sinkronisasi' : profile.nim}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ssoNoticeBanner}

      {/* STEPPER NAVIGATOR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {[
            { step: 1, label: 'KYC & Persetujuan', icon: FileCheck },
            { step: 2, label: 'Konfigurasi Tagihan', icon: CreditCard },
            { step: 3, label: 'Metode Pembayaran', icon: CheckCircle2 },
            { step: 4, label: 'Tanda Tangan Kontrak', icon: PenTool },
            { step: 5, label: 'Penerbitan e-Ticket', icon: Ticket },
            { step: 6, label: 'Cetak BASTK', icon: Printer }
          ].map((item, index) => {
            const isCompleted = currentStep > item.step || (item.step === 6 && showBastk);
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;
            
            return (
              <div key={item.step} className="flex items-center">
                <button
                  onClick={() => handleStepNavigation(item.step as AdmissionStep)}
                  className={\`flex flex-col items-center space-y-2 transition-all \${
                    isCurrent ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
                  }\`}
                >
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors \${
                    isCompleted 
                      ? 'bg-teal-500 border-teal-500 text-white' 
                      : isCurrent 
                      ? 'bg-teal-50 border-teal-600 text-teal-700 ring-4 ring-teal-50' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }\`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                  </div>
                  <span className={\`text-[10px] font-bold uppercase tracking-wider hidden sm:block \${
                    isCurrent ? 'text-teal-700' : 'text-slate-500'
                  }\`}>
                    {item.label}
                  </span>
                </button>
                {index < 5 && (
                  <div className={\`hidden sm:block w-8 md:w-12 h-0.5 mx-2 md:mx-4 \${
                    isCompleted ? 'bg-teal-500' : 'bg-slate-200'
                  }\`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AutoResumeBanner currentStep={currentStep} onResume={(step) => handleStepNavigation(step as AdmissionStep)} />

      {/* STEP 1: VERIFIKASI KYC & PERSETUJUAN */}
      {currentStep === 1 && (
        <div id="step-1-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Step 1: Verifikasi KYC & Validasi Biometrik</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sesuai SOP, unggah KTP (Wali/Mahasiswa) dan lakukan liveness test wajah.</p>
            </div>
            {profile.isKycApproved && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi KYC
              </span>
            )}
          </div>

          {!profile.isKycApproved ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Proses e-KYC Wajib</h4>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Silakan siapkan KTP Asli dan pastikan pencahayaan ruangan cukup terang untuk pemindaian biometrik wajah.
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center space-x-2 mx-auto"
              >
                <Scan className="w-4 h-4" />
                <span>Mulai Pemindaian KYC Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Verifikasi Identitas Selesai</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Data KTP dan Biometrik wajah Anda telah dicocokkan dengan tingkat akurasi 98%.
                  </p>
                </div>
              </div>

              {profile.persetujuanOrtuUrl && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-sm text-slate-800 mb-2">Dokumen Persetujuan Wali</h5>
                  <div className="flex items-center space-x-3 bg-white p-3 border border-slate-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-700">Surat_Pernyataan_Wali.pdf</p>
                      <p className="text-[10px] text-slate-500">Metode: {profile.metodePersetujuanOrtu}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => handleStepNavigation(2)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
                >
                  <span>Lanjut Konfigurasi Tagihan (Step 2)</span>
                  <CreditCard className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isScannerOpen && (
        <VerifikasiTrail
          profile={profile}
          onComplete={handleKycApprovalComplete}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* STEP 2: KONFIGURASI TAGIHAN SEWA & DEPOSIT */}
      {currentStep === 2 && (
        <div id="step-2-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              <span>Step 2: Konfigurasi Skema Pembayaran</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Pilih durasi kontrak awal dan skema cicilan deposit yang Anda inginkan (jika berhak).</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
            {/* Status KIP */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Status Mahasiswa (KIP-Kuliah)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Penerima KIP-Kuliah berhak atas fasilitas cicilan Deposit hingga 3 termin dan potongan biaya Perlengkapan Awal.
                </p>
              </div>
              <button
                onClick={handleToggleKip}
                disabled={invoice.status !== 'UNPAID'}
                className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${
                  profile.isKipStudent ? 'bg-teal-600' : 'bg-slate-300'
                } \${invoice.status !== 'UNPAID' ? 'opacity-50 cursor-not-allowed' : ''}\`}
              >
                <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${
                  profile.isKipStudent ? 'translate-x-6' : 'translate-x-1'
                }\`} />
              </button>
            </div>

            {/* Pilihan Durasi Kontrak */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 block">Durasi Kontrak Awal</h4>
                  <p className="text-xs text-slate-500">Masa menginap minimal 1 semester (6 Bulan) atau 1 Tahun.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 3, 6, 12].map(durasi => (
                  <button
                    key={durasi}
                    type="button"
                    onClick={() => handleConfigureBilling(durasi, invoice.opsiCicilan || 1)}
                    disabled={invoice.status !== 'UNPAID'}
                    className={\`p-3 rounded-xl border text-center transition-all \${
                      invoice.durasiBulan === durasi 
                        ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500 text-teal-900 font-bold shadow-sm' 
                        : invoice.status !== 'UNPAID'
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }\`}
                  >
                    {durasi} Bulan
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi Pembayaran Deposit (KIP Only) */}
            <div className={\`transition-all duration-300 \${!profile.isKipStudent ? 'opacity-50 grayscale pointer-events-none' : ''}\`}>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="mb-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    Opsi Pembayaran Deposit (Khusus KIP)
                    {!profile.isKipStudent && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal border border-slate-200">
                        Hanya tersedia untuk KIP
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Sistem otomatis menghitung penyesuaian biaya deposit berdasarkan skema cicilan yang berlaku di Master Tarif.
                  </span>
                </div>
                
                <div className={\`grid grid-cols-1 gap-3 \${maxCicilan >= 3 ? "md:grid-cols-3" : maxCicilan === 2 ? "md:grid-cols-2" : ""}\`}>
                  {Array.from({ length: maxCicilan }, (_, i) => i + 1).map(opsi => {
                    const isLunas = opsi === 1;
                    const multiplier = isLunas ? 1.0 : activeScheme.installmentMultiplier;
                    const baseDeposit = tariffs.find(t => t.category === 'DEPOSIT' && t.target === (profile.isKipStudent ? 'KIP' : 'REGULER') && t.name.includes('Lunas'))?.amount || 500000;
                    const calculatedDeposit = baseDeposit * multiplier;
                    const termin1 = calculatedDeposit / opsi;
                    const sisa = calculatedDeposit - termin1;

                    return (
                      <div key={opsi} className="h-full">
                        <button
                          type="button"
                          onClick={() => handleConfigureBilling(invoice.durasiBulan || 6, opsi)}
                          disabled={invoice.status !== 'UNPAID'}
                          className={\`w-full h-full p-3.5 rounded-xl border text-left transition-all \${
                            invoice.opsiCicilan === opsi
                              ? (isLunas ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 shadow-sm' : 'bg-amber-50 border-amber-600 ring-2 ring-amber-500 text-amber-950 shadow-sm')
                              : invoice.status !== 'UNPAID'
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }\`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{isLunas ? 'LUNAS / 1X BAYAR' : \`CICILAN \${opsi}X\`}</span>
                            <span className={\`text-[10px] font-mono px-2 py-0.5 rounded font-bold border \${isLunas ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}\`}>
                              {isLunas ? '1x' : \`\${multiplier.toString().replace('.', ',')}x\`} = {formatRupiah(calculatedDeposit)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {isLunas
                              ? 'Dibayar penuh saat pendaftaran.'
                              : \`Termin 1: \${formatRupiah(termin1)}. Sisa \${formatRupiah(sisa)} dicicil \${opsi - 1} bulan berikutnya.\`
                            }
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rincian Komponen Tagihan */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-700">
                  Biaya Sewa Kamar Asrama ({invoice.durasiBulan || 6} Bulan @ Rp 500.000/bln):
                </span>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaSewa)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-700">Uang Deposit Asrama (Termin 1 Pendaftaran):</span>
                  {invoice.isCicilanDeposit ? (
                    <span className="text-[10px] text-amber-700 block font-medium">
                      *Skema Cicil {invoice.opsiCicilan}x (Total {formatRupiah(invoice.biayaDepositTotal || 0)}) — Sisa {formatRupiah(invoice.sisaCicilanDeposit || 0)} ditagihkan bulan berikutnya.
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 block font-medium">
                      *Skema Deposit Lunas (1x Biaya Sewa Bulanan Rp 500.000)
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaDeposit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-700">Biaya Perlengkapan Awal & Kit Kebersihan:</span>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaPerlengkapanAwal || 250000)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-amber-50 p-3 rounded-xl text-amber-900 border border-amber-200">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Kode Unik Pembayaran (Wajib Ditransfer Presisi):</span>
                    <span className="text-[10px] text-amber-800">Ditambahkan ke total bayar untuk verifikasi otomatis pencocokan mutasi bank.</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-amber-900 text-base bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300">
                    +{invoice.kodeUnik}
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateKodeUnik}
                    className="p-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                    title="Acak Ulang Kode Unik Pembayaran"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tagihan (Termin 1)</span>
                <span className="block text-xs text-slate-500 mt-0.5">Sewa + Deposit T1 + Perlengkapan + Kode Unik</span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-teal-800 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                {formatRupiah(invoice.totalBayar)}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-sm">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Aturan Pengikatan Deposit (Fase A & Fase C):</span>
                {invoice.isCicilanDeposit ? (
                  <span>
                    Anda memilih <strong className="text-amber-800">Skema Cicilan Deposit {invoice.opsiCicilan}x</strong>. Total deposit terikat adalah <strong>{formatRupiah(invoice.biayaDepositTotal || 0)}</strong> ({activeScheme.installmentMultiplier}x tarif dasar). Anda membayar <strong>{formatRupiah(invoice.biayaDeposit)}</strong> pada pendaftaran ini, dan sisanya <strong>{formatRupiah(invoice.sisaCicilanDeposit || 0)}</strong> akan dicicil pada bulan berikutnya.
                  </span>
                ) : (
                  <span>
                    Anda memilih <strong className="text-emerald-800">Skema Deposit Lunas</strong>. Uang deposit sebesar <strong>{formatRupiah(invoice.biayaDepositTotal || 0)}</strong> (1x tarif dasar) dibayar penuh di awal.
                  </span>
                )}
                <span className="block mt-1 text-slate-500">
                  Deposit digunakan sebagai jaminan keutuhan fasilitas kamar dan akan di-refund utuh saat Check-out (Fase C) jika tidak ada kerusakan fasilitas/tunggakan.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleStepNavigation(3)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
            >
              <span>Lanjut Pilih Metode Pembayaran (Step 3)</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OPSI PEMBAYARAN */}
      {currentStep === 3 && (
        <div id="step-3-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <span>Step 3: Pilihan Metode Pembayaran</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Pilih metode transfer bank (Virtual Account atau Manual). Batas waktu pembayaran: 24 Jam.</p>
            </div>
          </div>
          
          <StudentInvoiceSummary invoice={invoice} onUpdateInvoice={onUpdateInvoice} />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => handleStepNavigation(4)}
              disabled={invoice.status === 'UNPAID'}
              className={\`font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 \${
                invoice.status === 'PAID' 
                  ? 'bg-teal-700 hover:bg-teal-800 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }\`}
            >
              <span>Lanjut Tanda Tangan Kontrak (Step 4)</span>
              <PenTool className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DIGITAL SIGNATURE (F20) */}
      {currentStep === 4 && (
        <div id="step-4-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              <span>Step 4: Tanda Tangan Kontrak Digital (F20)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Tanda tangani kontrak kesepakatan sewa asrama di kotak yang disediakan.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm">
            <div className="h-64 overflow-y-auto pr-4 space-y-4 text-slate-700 custom-scrollbar">
              <h4 className="font-bold text-center text-slate-900">PERJANJIAN SEWA MENYEWA KAMAR ASRAMA UBT</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama Universitas Borneo Tarakan (selanjutnya disebut "Pihak Pertama") dan:</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="w-32 py-1 font-bold">Nama</td><td>: {profile.nama}</td></tr>
                  <tr><td className="py-1 font-bold">NIM</td><td>: {profile.nim}</td></tr>
                  <tr><td className="py-1 font-bold">Kamar</td><td>: {room?.gedung} - Kamar {room?.nomorKamar}</td></tr>
                  <tr><td className="py-1 font-bold">Durasi</td><td>: {invoice.durasiBulan || 6} Bulan</td></tr>
                </tbody>
              </table>
              <p>(Selanjutnya disebut "Pihak Kedua")</p>
              
              <h5 className="font-bold mt-4">Pasal 1: Ketentuan Pembayaran</h5>
              <p>Pihak Kedua telah membayar biaya sewa dan deposit sesuai konfigurasi tagihan. Deposit {invoice.isCicilanDeposit ? \`dicicil \${invoice.opsiCicilan} kali\` : 'dilunasi di awal'} dan akan dikembalikan pada akhir masa sewa dengan syarat tidak ada kerusakan fasilitas dan tunggakan.</p>

              <h5 className="font-bold mt-4">Pasal 2: Hak dan Kewajiban</h5>
              <p>1. Pihak Kedua berhak menempati kamar yang telah ditentukan.</p>
              <p>2. Pihak Kedua wajib menjaga kebersihan dan fasilitas kamar.</p>
              <p>3. Pihak Kedua wajib mematuhi seluruh peraturan dan tata tertib Asrama UBT.</p>

              <h5 className="font-bold mt-4">Pasal 3: Sanksi</h5>
              <p>Pelanggaran terhadap tata tertib dapat mengakibatkan sanksi mulai dari teguran hingga pencabutan hak sewa kamar (pengusiran) tanpa pengembalian uang sewa.</p>
              
              <p className="mt-6 italic text-xs">Dengan menandatangani dokumen ini secara digital, Pihak Kedua menyatakan setuju dan tunduk pada seluruh ketentuan yang berlaku.</p>
            </div>
          </div>

          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center">
            {contract.status === 'SIGNED' && contract.signatureDataUrl ? (
              <div className="text-center space-y-4 w-full">
                <div className="bg-emerald-50 text-emerald-700 py-2 px-4 rounded-lg text-sm font-bold border border-emerald-200 inline-flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Dokumen F20 Telah Ditandatangani
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 inline-block shadow-sm">
                  <img src={contract.signatureDataUrl} alt="Tanda Tangan Digital" className="h-32 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">Tanda Tangan di Bawah Ini:</span>
                  <button onClick={handleClearTandaTangan} className="text-xs text-red-600 font-bold hover:bg-red-50 px-2 py-1 rounded">
                    Hapus Ulang (Clear)
                  </button>
                </div>
                <div className="border border-slate-300 rounded-lg bg-slate-50 cursor-crosshair touch-none">
                  <SignaturePad
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full h-48 rounded-lg',
                    }}
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleSimpanTandaTangan}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm"
                  >
                    Simpan Tanda Tangan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
             <button
              onClick={() => handleStepNavigation(5)}
              disabled={contract.status !== 'SIGNED'}
              className={\`font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 \${
                contract.status === 'SIGNED'
                  ? 'bg-teal-700 hover:bg-teal-800 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }\`}
            >
              <span>Lanjut Penerbitan e-Ticket (Step 5)</span>
              <Ticket className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: E-TICKET */}
      {currentStep === 5 && (
        <div id="step-5-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
           <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-teal-600" />
              <span>Step 5: Penerbitan e-Ticket Check-in</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">E-Ticket ini digunakan untuk pemindaian saat Anda tiba di asrama (Check-in fisik).</p>
          </div>

          {ticket.status === 'ISSUED' ? (
            <div className="flex flex-col md:flex-row gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Ticket className="w-32 h-32" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                <QRCodeSVG value={ticket.qrCode || ticket.id} size={150} />
                <span className="font-mono font-bold text-slate-800 mt-3 text-sm tracking-widest">{ticket.id}</span>
              </div>
              <div className="flex-1 space-y-4 z-10">
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase">E-TICKET ASRAMA UBT</h4>
                  <p className="text-slate-500 text-sm font-medium">Berlaku untuk Check-in Fisik Tahun Ajaran 2026/2027</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nama Mahasiswa</span>
                    <span className="block text-sm font-bold text-slate-900">{profile.nama}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">NIM / No. PMB</span>
                    <span className="block text-sm font-bold text-slate-900">{profile.nim !== 'Belum tersedia' ? profile.nim : profile.noPmb}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gedung Asrama</span>
                    <span className="block text-sm font-bold text-teal-700">{room?.gedung}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nomor Kamar</span>
                    <span className="block text-sm font-bold text-teal-700">Kamar {room?.nomorKamar}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                   <button 
                     onClick={downloadTicketPdf}
                     className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center shadow-sm"
                   >
                     <Download className="w-4 h-4 mr-2" /> Download PDF
                   </button>
                   <button 
                     onClick={() => handleStepNavigation(6)}
                     className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center shadow-sm"
                   >
                     Selesai & Lanjut (Step 6) <ArrowRight className="w-4 h-4 ml-2" />
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Ticket className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Penerbitan E-Ticket</h4>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Anda telah menyelesaikan seluruh persyaratan administrasi dan pembayaran. Klik tombol di bawah untuk men-generate e-Ticket Check-in Anda.
              </p>
              <button
                onClick={handleGenerateTicket}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
              >
                <QrCode className="w-5 h-5" />
                <span>Generate e-Ticket Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: BASTK */}
      {currentStep === 6 && (
        <div id="step-6-panel" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {!showBastk ? (
             <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-teal-900 text-lg">Semua Tahapan Selesai! 🎉</h4>
                  <p className="text-teal-800 text-sm mt-1">Anda sekarang dapat mencetak form BASTK (Berita Acara Serah Terima Kamar) untuk diserahkan saat check-in fisik.</p>
                </div>
                <button
                  onClick={() => setShowBastk(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md whitespace-nowrap transition-colors"
                >
                  Tampilkan BASTK
                </button>
             </div>
           ) : (
             <BastkStep 
                profile={profile} 
                room={room!} 
                invoice={invoice} 
                ticket={ticket} 
                contract={contract} 
             />
           )}
        </div>
      )}
      
      {/* Audit Log View untuk Transparansi */}
      <AuditLogView 
        filters={{ entityId: invoice.invoiceId }} 
        title="Riwayat Audit Transaksi (Fase A)"
      />
    </div>
  );
};
`
code = code + "\n" + theRest;
fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log('Fixed syntax error!');
