import { useState, useCallback, useMemo } from 'react';
import { MabaProfile } from '../types/asrama';

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(profile: MabaProfile, ktpUrl?: string, selfieUrl?: string) {
  const [submitErrors, setSubmitErrors] = useState<ValidationErrors>({});

  const validate = (p: MabaProfile, ktp?: string, selfie?: string) => {
    const newErrors: ValidationErrors = {};

    // Mandatory Identity Fields
    if (!p.nama?.trim()) newErrors.nama = 'Nama Lengkap wajib diisi';
    if (!p.nimNoReg?.trim()) newErrors.nimNoReg = 'No Pendaftaran / NIM wajib diisi';
    if (!p.fakultas?.trim()) newErrors.fakultas = 'Fakultas wajib diisi';
    if (!p.prodi?.trim()) newErrors.prodi = 'Program Studi wajib diisi';
    
    // Mandatory Personal Contact
    if (!p.email?.trim()) newErrors.email = 'Email aktif wajib diisi';
    if (!p.noHpWa?.trim()) newErrors.noHpWa = 'No HP / WhatsApp wajib diisi';

    // Mandatory KTP Address
    if (!p.alamatKtpJalan?.trim()) newErrors.alamatKtpJalan = 'Jalan / Dusun (KTP) wajib diisi';
    if (!p.alamatKtpRtRw?.trim()) newErrors.alamatKtpRtRw = 'RT/RW (KTP) wajib diisi';
    if (!p.alamatKtpKelurahan?.trim()) newErrors.alamatKtpKelurahan = 'Desa/Kelurahan (KTP) wajib diisi';
    if (!p.alamatKtpKecamatan?.trim()) newErrors.alamatKtpKecamatan = 'Kecamatan (KTP) wajib diisi';
    if (!p.alamatKtpKabupatenKota?.trim()) newErrors.alamatKtpKabupatenKota = 'Kabupaten/Kota (KTP) wajib diisi';
    if (!p.alamatKtpProvinsi?.trim()) newErrors.alamatKtpProvinsi = 'Provinsi (KTP) wajib diisi';

    // Mandatory Domicile Address (if different from KTP)
    if (p.isAlamatDomisiliSamaDenganKtp === false && p.alamatDomisiliJalan) {
      if (!p.alamatDomisiliJalan?.trim()) newErrors.alamatDomisiliJalan = 'Jalan / Dusun (Domisili) wajib diisi';
      if (!p.alamatDomisiliRtRw?.trim()) newErrors.alamatDomisiliRtRw = 'RT/RW (Domisili) wajib diisi';
      if (!p.alamatDomisiliKelurahan?.trim()) newErrors.alamatDomisiliKelurahan = 'Desa/Kelurahan (Domisili) wajib diisi';
      if (!p.alamatDomisiliKecamatan?.trim()) newErrors.alamatDomisiliKecamatan = 'Kecamatan (Domisili) wajib diisi';
      if (!p.alamatDomisiliKabupatenKota?.trim()) newErrors.alamatDomisiliKabupatenKota = 'Kabupaten/Kota (Domisili) wajib diisi';
      if (!p.alamatDomisiliProvinsi?.trim()) newErrors.alamatDomisiliProvinsi = 'Provinsi (Domisili) wajib diisi';
    }

    // Mandatory Emergency Contact
    if (!p.kontakDaruratNama?.trim()) newErrors.kontakDaruratNama = 'Nama Kontak Darurat wajib diisi';
    if (!p.kontakDaruratHubungan?.trim()) newErrors.kontakDaruratHubungan = 'Hubungan Kontak Darurat wajib diisi';
    if (!p.kontakDaruratNoHp?.trim()) newErrors.kontakDaruratNoHp = 'No HP Kontak Darurat wajib diisi';
    if (!p.kontakDaruratAlamat?.trim()) newErrors.kontakDaruratAlamat = 'Alamat Kontak Darurat wajib diisi';

    // Mandatory e-KYC fields
    if (!ktp && !p.ktpUrl) newErrors.ktpUrl = 'Unggah KTP wajib dilakukan';
    if (!selfie && !p.selfieUrl) newErrors.selfieUrl = 'Selfie KTP wajib dilakukan';
    if (!p.persetujuanAwal) newErrors.persetujuanAwal = 'Persetujuan wajib dicentang';

    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const errs = validate(profile, ktpUrl, selfieUrl);
    return Object.keys(errs).length === 0;
  }, [profile, ktpUrl, selfieUrl]);

  const validateProfile = useCallback((p?: MabaProfile, k?: string, s?: string): { valid: boolean; errors: ValidationErrors } => {
    const errs = validate(p || profile, k !== undefined ? k : ktpUrl, s !== undefined ? s : selfieUrl);
    setSubmitErrors(errs);
    return { valid: Object.keys(errs).length === 0, errors: errs };
  }, [profile, ktpUrl, selfieUrl]);

  const clearErrors = useCallback(() => {
    setSubmitErrors({});
  }, []);

  return {
    errors: submitErrors,
    isValid: isFormValid,
    validateProfile,
    clearErrors
  };
}
