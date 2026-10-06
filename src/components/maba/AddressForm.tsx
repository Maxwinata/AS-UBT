import React from 'react';
import { MapPin } from 'lucide-react';
import { MabaProfile } from '../../types/asrama';
import { IndonesianRegionSelector } from './IndonesianRegionSelector';

interface AddressFormProps {
  profile: MabaProfile;
  setProfile: (profile: MabaProfile) => void;
  errors?: Record<string, string>;
}

export function AddressForm({ profile, setProfile }: AddressFormProps) {
  return (
    <>
      {/* ALAMAT KTP */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-500" /> Alamat Asal (Sesuai KTP)
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-slate-700 block mb-1 text-[11px] font-bold">Jalan / Dusun *</label>
            <input
              type="text"
              required
              value={profile.alamatKtpJalan || ''}
              onChange={(e) => setProfile({ ...profile, alamatKtpJalan: e.target.value })}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
            />
          </div>
          <div>
            <label className="text-slate-700 block mb-1 text-[11px] font-bold">RT / RW *</label>
            <input
              type="text"
              required
              value={profile.alamatKtpRtRw || ''}
              onChange={(e) => setProfile({ ...profile, alamatKtpRtRw: e.target.value })}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
            />
          </div>

          <IndonesianRegionSelector
            province={profile.alamatKtpProvinsi || ''}
            regency={profile.alamatKtpKabupatenKota || ''}
            district={profile.alamatKtpKecamatan || ''}
            village={profile.alamatKtpKelurahan || ''}
            postalCode={profile.alamatKtpKodePos || ''}
            onProvinceChange={(prov) => setProfile({ ...profile, alamatKtpProvinsi: prov })}
            onRegencyChange={(reg) => setProfile({ ...profile, alamatKtpKabupatenKota: reg })}
            onDistrictChange={(dist) => setProfile({ ...profile, alamatKtpKecamatan: dist })}
            onVillageChange={(vil, postal) =>
              setProfile({
                ...profile,
                alamatKtpKelurahan: vil,
                ...(postal ? { alamatKtpKodePos: postal } : {}),
              })
            }
            onPostalCodeChange={(postal) => setProfile({ ...profile, alamatKtpKodePos: postal })}
          />
        </div>
      </div>

      {/* ALAMAT DOMISILI */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-500" /> Alamat Domisili (Kontak Surat)
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isAlamatDomisiliSamaDenganKtp}
              onChange={(e) => {
                const isChecked = e.target.checked;
                if (isChecked) {
                  setProfile({
                    ...profile,
                    isAlamatDomisiliSamaDenganKtp: true,
                    alamatDomisiliJalan: profile.alamatKtpJalan,
                    alamatDomisiliRtRw: profile.alamatKtpRtRw,
                    alamatDomisiliKelurahan: profile.alamatKtpKelurahan,
                    alamatDomisiliKecamatan: profile.alamatKtpKecamatan,
                    alamatDomisiliKabupatenKota: profile.alamatKtpKabupatenKota,
                    alamatDomisiliProvinsi: profile.alamatKtpProvinsi,
                    alamatDomisiliKodePos: profile.alamatKtpKodePos,
                  });
                } else {
                  setProfile({
                    ...profile,
                    isAlamatDomisiliSamaDenganKtp: false,
                  });
                }
              }}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
            />
            <span className="text-[11px] text-slate-600 font-medium">Sama dengan KTP</span>
          </label>
        </div>

        {!profile.isAlamatDomisiliSamaDenganKtp && (
          <div className="space-y-3">
            <div>
              <label className="text-slate-700 block mb-1 text-[11px] font-bold">Jalan / Dusun *</label>
              <input
                type="text"
                required
                value={profile.alamatDomisiliJalan || ''}
                onChange={(e) => setProfile({ ...profile, alamatDomisiliJalan: e.target.value })}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
              />
            </div>
            <div>
              <label className="text-slate-700 block mb-1 text-[11px] font-bold">RT / RW *</label>
              <input
                type="text"
                required
                value={profile.alamatDomisiliRtRw || ''}
                onChange={(e) => setProfile({ ...profile, alamatDomisiliRtRw: e.target.value })}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
              />
            </div>

            <IndonesianRegionSelector
              labelSuffix="(Domisili)"
              province={profile.alamatDomisiliProvinsi || ''}
              regency={profile.alamatDomisiliKabupatenKota || ''}
              district={profile.alamatDomisiliKecamatan || ''}
              village={profile.alamatDomisiliKelurahan || ''}
              postalCode={profile.alamatDomisiliKodePos || ''}
              onProvinceChange={(prov) => setProfile({ ...profile, alamatDomisiliProvinsi: prov })}
              onRegencyChange={(reg) => setProfile({ ...profile, alamatDomisiliKabupatenKota: reg })}
              onDistrictChange={(dist) => setProfile({ ...profile, alamatDomisiliKecamatan: dist })}
              onVillageChange={(vil, postal) =>
                setProfile({
                  ...profile,
                  alamatDomisiliKelurahan: vil,
                  ...(postal ? { alamatDomisiliKodePos: postal } : {}),
                })
              }
              onPostalCodeChange={(postal) => setProfile({ ...profile, alamatDomisiliKodePos: postal })}
            />
          </div>
        )}
      </div>
    </>
  );
}

