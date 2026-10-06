import React from 'react';
import { PROVINCES, getRegenciesByProvince } from '../../data/indonesiaRegions';

export { PROVINCES };

interface RegionSelectorProps {
  selectedProvince: string;
  selectedRegency: string;
  onProvinceChange: (province: string) => void;
  onRegencyChange: (regency: string) => void;
}

export function RegionSelector({
  selectedProvince,
  selectedRegency,
  onProvinceChange,
  onRegencyChange,
}: RegionSelectorProps) {
  const filteredRegencies = getRegenciesByProvince(selectedProvince);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    onProvinceChange(provinceName);
    onRegencyChange(''); // Reset regency when province changes
  };

  return (
    <>
      <div>
        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Provinsi *</label>
        <select
          required
          value={selectedProvince || ''}
          onChange={handleProvinceChange}
          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
        >
          <option value="">Pilih Provinsi...</option>
          {PROVINCES.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kabupaten / Kota *</label>
        <select
          required
          value={selectedRegency || ''}
          onChange={(e) => onRegencyChange(e.target.value)}
          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
          disabled={!selectedProvince}
        >
          <option value="">
            {selectedProvince ? 'Pilih Kota/Kab...' : 'Pilih Provinsi dahulu'}
          </option>
          {filteredRegencies.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

