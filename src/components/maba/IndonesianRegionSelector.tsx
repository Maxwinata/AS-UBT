import React, { useMemo } from 'react';
import {
  PROVINCES,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getVillagesByDistrict,
  findPostalCode,
} from '../../data/indonesiaRegions';

interface IndonesianRegionSelectorProps {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode?: string;
  onProvinceChange: (province: string) => void;
  onRegencyChange: (regency: string) => void;
  onDistrictChange: (district: string) => void;
  onVillageChange: (village: string, autoPostalCode?: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  labelSuffix?: string;
  disabled?: boolean;
}

export const IndonesianRegionSelector: React.FC<IndonesianRegionSelectorProps> = ({
  province,
  regency,
  district,
  village,
  postalCode,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  onPostalCodeChange,
  labelSuffix = '',
  disabled = false,
}) => {
  // Available Regencies based on Province
  const availableRegencies = useMemo(() => {
    return getRegenciesByProvince(province);
  }, [province]);

  // Available Districts (Kecamatan) based on Regency
  const availableDistricts = useMemo(() => {
    return getDistrictsByRegency(regency);
  }, [regency]);

  // Available Villages (Desa/Kelurahan) based on District
  const availableVillages = useMemo(() => {
    return getVillagesByDistrict(district);
  }, [district]);

  // Handle Province Change
  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onProvinceChange(val);
    // Reset subordinate selections
    onRegencyChange('');
    onDistrictChange('');
    onVillageChange('');
    if (onPostalCodeChange) onPostalCodeChange('');
  };

  // Handle Regency Change
  const handleRegencySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onRegencyChange(val);
    // Reset subordinate selections
    onDistrictChange('');
    onVillageChange('');
    if (onPostalCodeChange) onPostalCodeChange('');
  };

  // Handle District (Kecamatan) Change
  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onDistrictChange(val);
    // Reset subordinate village
    onVillageChange('');
    if (onPostalCodeChange) onPostalCodeChange('');
  };

  // Handle Village (Kelurahan) Change
  const handleVillageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const detectedPostal = findPostalCode(val, district);
    onVillageChange(val, detectedPostal);
    if (detectedPostal && onPostalCodeChange) {
      onPostalCodeChange(detectedPostal);
    }
  };

  return (
    <div className="space-y-3">
      {/* BARIS 1: PROVINSI & KABUPATEN/KOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-700 block mb-1 text-[10px] font-bold">
            Provinsi {labelSuffix} *
          </label>
          <select
            disabled={disabled}
            value={province || ''}
            onChange={handleProvinceSelect}
            className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
            required
          >
            <option value="">-- Pilih Provinsi (38 Provinsi) --</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-700 block mb-1 text-[10px] font-bold">
            Kabupaten / Kota {labelSuffix} *
          </label>
          {availableRegencies.length > 0 ? (
            <select
              disabled={disabled || !province}
              value={regency || ''}
              onChange={handleRegencySelect}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            >
              <option value="">
                {province ? '-- Pilih Kabupaten / Kota --' : 'Pilih Provinsi dahulu'}
              </option>
              {availableRegencies.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              placeholder="Contoh: Kota Medan"
              value={regency || ''}
              onChange={(e) => onRegencyChange(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            />
          )}
        </div>
      </div>

      {/* BARIS 2: KECAMATAN & DESA/KELURAHAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-700 block mb-1 text-[10px] font-bold">
            Kecamatan {labelSuffix} *
          </label>
          {availableDistricts.length > 0 ? (
            <select
              disabled={disabled || !regency}
              value={district || ''}
              onChange={handleDistrictSelect}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            >
              <option value="">
                {regency ? '-- Pilih Kecamatan --' : 'Pilih Kota/Kab dahulu'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              placeholder="Contoh: Medan Kota / Siantar Timur"
              value={district || ''}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            />
          )}
        </div>

        <div>
          <label className="text-slate-700 block mb-1 text-[10px] font-bold">
            Desa / Kelurahan {labelSuffix} *
          </label>
          {availableVillages.length > 0 ? (
            <select
              disabled={disabled || !district}
              value={village || ''}
              onChange={handleVillageSelect}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            >
              <option value="">
                {district ? '-- Pilih Desa / Kelurahan --' : 'Pilih Kecamatan dahulu'}
              </option>
              {availableVillages.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.postalCode})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              placeholder="Contoh: Pandan Hulu / Teladan Barat"
              value={village || ''}
              onChange={(e) => onVillageChange(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
              required
            />
          )}
        </div>
      </div>

      {/* BARIS 3: KODE POS */}
      {onPostalCodeChange && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-700 block mb-1 text-[10px] font-bold">
              Kode Pos {labelSuffix}
            </label>
            <input
              type="text"
              disabled={disabled}
              placeholder="Contoh: 20212"
              value={postalCode || ''}
              onChange={(e) => onPostalCodeChange(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div className="flex items-end pb-2">
            <span className="text-[10px] text-slate-500">
              💡 Kode pos terisi otomatis sesuai kelurahan / dapat disesuaikan manual.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
