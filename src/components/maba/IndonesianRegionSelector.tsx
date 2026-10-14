import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Loader2,
  Building2,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import {
  Province,
  Regency,
  District,
  Village,
  PROVINCES,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getVillagesByDistrict,
  findPostalCode,
} from '../../data/indonesiaRegions';
import {
  fetchNationalProvinces,
  fetchNationalRegencies,
  fetchNationalDistricts,
  fetchNationalVillages,
  searchNationalRegions,
  NationalRegionSearchResult,
} from '../../services/indonesiaRegionService';

export interface RegionValues {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode?: string;
  rtRw?: string;
}

interface IndonesianRegionSelectorProps {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode?: string;
  rtRw?: string;
  onProvinceChange?: (province: string) => void;
  onRegencyChange?: (regency: string) => void;
  onDistrictChange?: (district: string) => void;
  onVillageChange?: (village: string, autoPostalCode?: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  onRtRwChange?: (rtRw: string) => void;
  onRegionChange?: (values: RegionValues) => void;
  labelSuffix?: string;
  disabled?: boolean;
}

export const IndonesianRegionSelector: React.FC<IndonesianRegionSelectorProps> = ({
  province,
  regency,
  district,
  village,
  postalCode,
  rtRw,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onVillageChange,
  onPostalCodeChange,
  onRtRwChange,
  onRegionChange,
  labelSuffix = '',
  disabled = false,
}) => {
  // Synchronous immediate local lists (Guarantee 0ms instant cascade)
  const localRegencies = useMemo(() => getRegenciesByProvince(province), [province]);
  const localDistricts = useMemo(() => getDistrictsByRegency(regency), [regency]);
  const localVillages = useMemo(() => getVillagesByDistrict(district), [district]);

  // Dynamic state for merged / API fetched data
  const [provincesList, setProvincesList] = useState<Province[]>(PROVINCES);
  const [regenciesList, setRegenciesList] = useState<Regency[]>(localRegencies);
  const [districtsList, setDistrictsList] = useState<District[]>(localDistricts);
  const [villagesList, setVillagesList] = useState<Village[]>(localVillages);

  // Loading flags
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Manual fallback mode
  const [isManualMode, setIsManualMode] = useState(false);

  // Quick search bar
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NationalRegionSearchResult[]>([]);

  // 1. Keep Regencies in sync instantly when Province changes
  useEffect(() => {
    // Immediately set from local catalog
    const local = getRegenciesByProvince(province);
    setRegenciesList(local);

    if (!province) return;

    let isMounted = true;
    setLoadingRegencies(true);
    fetchNationalRegencies(province)
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setRegenciesList(data);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingRegencies(false);
      });

    return () => {
      isMounted = false;
    };
  }, [province]);

  // 2. Keep Districts in sync instantly when Regency changes
  useEffect(() => {
    const local = getDistrictsByRegency(regency);
    setDistrictsList(local);

    if (!regency) return;

    let isMounted = true;
    setLoadingDistricts(true);
    fetchNationalDistricts(regency, province)
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setDistrictsList(data);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingDistricts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [regency, province]);

  // 3. Keep Villages in sync instantly when District changes
  useEffect(() => {
    const local = getVillagesByDistrict(district);
    setVillagesList(local);

    if (!district) return;

    let isMounted = true;
    setLoadingVillages(true);
    fetchNationalVillages(district, regency)
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setVillagesList(data);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingVillages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [district, regency]);

  // Initial Provinces load
  useEffect(() => {
    let isMounted = true;
    fetchNationalProvinces().then((data) => {
      if (isMounted && data && data.length > 0) {
        setProvincesList(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers
  const handleRtRwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onRtRwChange) {
      onRtRwChange(val);
    }
    if (onRegionChange) {
      onRegionChange({
        province,
        regency,
        district,
        village,
        postalCode: postalCode || '',
        rtRw: val,
      });
    }
  };

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onRegionChange) {
      onRegionChange({
        province: val,
        regency: '',
        district: '',
        village: '',
        postalCode: '',
        rtRw: rtRw || '',
      });
    } else {
      if (onProvinceChange) onProvinceChange(val);
      if (onRegencyChange) onRegencyChange('');
      if (onDistrictChange) onDistrictChange('');
      if (onVillageChange) onVillageChange('');
      if (onPostalCodeChange) onPostalCodeChange('');
    }
  };

  const handleRegencySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onRegionChange) {
      onRegionChange({
        province,
        regency: val,
        district: '',
        village: '',
        postalCode: '',
        rtRw: rtRw || '',
      });
    } else {
      if (onRegencyChange) onRegencyChange(val);
      if (onDistrictChange) onDistrictChange('');
      if (onVillageChange) onVillageChange('');
      if (onPostalCodeChange) onPostalCodeChange('');
    }
  };

  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onRegionChange) {
      onRegionChange({
        province,
        regency,
        district: val,
        village: '',
        postalCode: '',
        rtRw: rtRw || '',
      });
    } else {
      if (onDistrictChange) onDistrictChange(val);
      if (onVillageChange) onVillageChange('');
      if (onPostalCodeChange) onPostalCodeChange('');
    }
  };

  const handleVillageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selectedObj =
      villagesList.find((v) => v.name === val) ||
      localVillages.find((v) => v.name === val);
    const autoPostal = selectedObj?.postalCode || findPostalCode(val, district) || '';

    if (onRegionChange) {
      onRegionChange({
        province,
        regency,
        district,
        village: val,
        postalCode: autoPostal,
        rtRw: rtRw || '',
      });
    } else {
      if (onVillageChange) onVillageChange(val, autoPostal);
      if (autoPostal && onPostalCodeChange) onPostalCodeChange(autoPostal);
    }
  };

  // Quick Search Apply
  const applySearchResult = (res: NationalRegionSearchResult) => {
    if (onRegionChange) {
      onRegionChange({
        province: res.province,
        regency: res.regency,
        district: res.district,
        village: res.village,
        postalCode: res.postalCode,
        rtRw: rtRw || '',
      });
    } else {
      if (onProvinceChange) onProvinceChange(res.province);
      if (onRegencyChange) onRegencyChange(res.regency);
      if (onDistrictChange) onDistrictChange(res.district);
      if (onVillageChange) onVillageChange(res.village, res.postalCode);
      if (onPostalCodeChange) onPostalCodeChange(res.postalCode);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowQuickSearch(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setSearchResults(searchNationalRegions(val));
    } else {
      setSearchResults([]);
    }
  };

  // Choose the effective lists (combine local and dynamic)
  const effectiveRegencies = regenciesList.length > 0 ? regenciesList : localRegencies;
  const effectiveDistricts = districtsList.length > 0 ? districtsList : localDistricts;
  const effectiveVillages = villagesList.length > 0 ? villagesList : localVillages;

  return (
    <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
      {/* HEADER WITH BADGE & QUICK SEARCH TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-3 h-3" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              Wilayah Administrasi & Kode Pos {labelSuffix}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-teal-700 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Data Nasional Kemendagri & Pos Indonesia (38 Provinsi • 514 Kab/Kota)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowQuickSearch(!showQuickSearch)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3 h-3 text-teal-600" />
            <span>{showQuickSearch ? 'Tutup Pencarian' : 'Cari Cepat Kode Pos / Desa'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsManualMode(!isManualMode)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Beralih ke mode ketik bebas jika wilayah baru belum terdaftar"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isManualMode ? 'Mode Pilih' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* QUICK SEARCH BAR (OPTIONAL FAST FINDER) */}
      {showQuickSearch && (
        <div className="bg-white p-3 rounded-lg border border-teal-200 shadow-xs space-y-2 animate-in fade-in duration-150">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ketik 5 digit kode pos atau nama desa (contoh: 20212, Dago, Pandan Hulu, Gambir)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800"
              autoFocus
            />
          </div>

          {searchResults.length > 0 && (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto rounded-lg border border-slate-100 bg-white shadow-xs">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySearchResult(res)}
                  className="w-full text-left p-2 hover:bg-teal-50/70 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-900">{res.village}</span>, {res.district} • {res.regency} ({res.province})
                  </div>
                  <span className="font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded text-[11px] shrink-0 ml-2">
                    {res.postalCode}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <p className="text-[11px] text-slate-500 italic px-1">
              Tidak ditemukan preset cepat. Gunakan pilihan dropdown berjenjang di bawah ini.
            </p>
          )}
        </div>
      )}

      {/* ROW 1: PROVINSI & KABUPATEN / KOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-700 block mb-1 text-[10px] font-bold">
            Provinsi {labelSuffix} *
          </label>
          {isManualMode ? (
            <input
              type="text"
              disabled={disabled}
              placeholder="Contoh: SUMATERA UTARA"
              value={province || ''}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (onRegionChange) {
                  onRegionChange({ province: val, regency: '', district: '', village: '', postalCode: '' });
                } else if (onProvinceChange) {
                  onProvinceChange(val);
                }
              }}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100"
              required
            />
          ) : (
            <div className="relative">
              <select
                disabled={disabled}
                value={province || ''}
                onChange={handleProvinceSelect}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500 appearance-none pr-8 cursor-pointer"
                required
              >
                <option value="">-- Pilih Provinsi (38 Provinsi) --</option>
                {provincesList.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 text-[10px] font-bold">
              Kabupaten / Kota {labelSuffix} *
            </label>
            {loadingRegencies && (
              <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Memuat...
              </span>
            )}
          </div>

          {isManualMode || effectiveRegencies.length === 0 ? (
            <input
              type="text"
              disabled={disabled}
              placeholder={province ? 'Contoh: KOTA MEDAN' : 'Pilih Provinsi terlebih dahulu'}
              value={regency || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onRegionChange) {
                  onRegionChange({ province, regency: val, district: '', village: '', postalCode: '' });
                } else if (onRegencyChange) {
                  onRegencyChange(val);
                }
              }}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100"
              required
            />
          ) : (
            <div className="relative">
              <select
                disabled={disabled || !province}
                value={regency || ''}
                onChange={handleRegencySelect}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500 appearance-none pr-8 cursor-pointer"
                required
              >
                <option value="">
                  {province ? `-- Pilih Kabupaten / Kota (${effectiveRegencies.length}) --` : 'Pilih Provinsi dahulu'}
                </option>
                {effectiveRegencies.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: KECAMATAN & RT / RW (SETELAH KECAMATAN, SEBELUM DESA/KELURAHAN, TIDAK MANDATORI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 text-[10px] font-bold">
              Kecamatan {labelSuffix} *
            </label>
            {loadingDistricts && (
              <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Memuat...
              </span>
            )}
          </div>

          {isManualMode || effectiveDistricts.length === 0 ? (
            <input
              type="text"
              disabled={disabled}
              placeholder={regency ? 'Contoh: Medan Kota' : 'Pilih Kab/Kota dahulu'}
              value={district || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onRegionChange) {
                  onRegionChange({ province, regency, district: val, village: '', postalCode: '', rtRw: rtRw || '' });
                } else if (onDistrictChange) {
                  onDistrictChange(val);
                }
              }}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100"
              required
            />
          ) : (
            <div className="relative">
              <select
                disabled={disabled || !regency}
                value={district || ''}
                onChange={handleDistrictSelect}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500 appearance-none pr-8 cursor-pointer"
                required
              >
                <option value="">
                  {regency ? `-- Pilih Kecamatan (${effectiveDistricts.length}) --` : 'Pilih Kab/Kota dahulu'}
                </option>
                {effectiveDistricts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        {/* RT / RW: Diletakkan setelah Kecamatan dan sebelum Desa/Kelurahan - Tidak Mandatori (Opsional) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 text-[10px] font-bold">
              RT / RW {labelSuffix} <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
          </div>
          <input
            type="text"
            disabled={disabled}
            placeholder="Contoh: 002/004"
            value={rtRw || ''}
            onChange={handleRtRwChange}
            className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ROW 3: DESA / KELURAHAN & KODE POS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 text-[10px] font-bold">
              Desa / Kelurahan {labelSuffix} *
            </label>
            {loadingVillages && (
              <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Memuat...
              </span>
            )}
          </div>

          {isManualMode || effectiveVillages.length === 0 ? (
            <input
              type="text"
              disabled={disabled}
              placeholder={district ? 'Contoh: Pasar Baru' : 'Pilih Kecamatan dahulu'}
              value={village || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onRegionChange) {
                  onRegionChange({ province, regency, district, village: val, postalCode: postalCode || '', rtRw: rtRw || '' });
                } else if (onVillageChange) {
                  onVillageChange(val);
                }
              }}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100"
              required
            />
          ) : (
            <div className="relative">
              <select
                disabled={disabled || !district}
                value={village || ''}
                onChange={handleVillageSelect}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs disabled:bg-slate-100 disabled:text-slate-500 appearance-none pr-8 cursor-pointer"
                required
              >
                <option value="">
                  {district ? `-- Pilih Desa / Kelurahan (${effectiveVillages.length}) --` : 'Pilih Kecamatan dahulu'}
                </option>
                {effectiveVillages.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} {v.postalCode ? `(Kode Pos: ${v.postalCode})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 text-[10px] font-bold">
              Kode Pos {labelSuffix} *
            </label>
            {postalCode && (
              <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Terisi Otomatis
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              maxLength={5}
              disabled={disabled}
              placeholder="Contoh: 20212"
              value={postalCode || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                if (onRegionChange) {
                  onRegionChange({ province, regency, district, village, postalCode: val, rtRw: rtRw || '' });
                } else if (onPostalCodeChange) {
                  onPostalCodeChange(val);
                }
              }}
              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 font-mono text-slate-900 font-bold text-xs disabled:bg-slate-100"
              required
            />
            {postalCode && postalCode.length === 5 && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-lg border border-slate-200/80">
        <p className="leading-snug">
          💡 <strong>Korelasi Berjenjang:</strong> Memilih Provinsi → Kab/Kota → Kecamatan → (RT/RW opsional) → Desa/Kelurahan akan mengisi Kode Pos secara otomatis.
        </p>
      </div>
    </div>
  );
};
