// Database Wilayah Administrasi Nasional Indonesia (Kemendagri / BPS)

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  provinceId: string;
  name: string;
  type: 'KOTA' | 'KABUPATEN';
}

export interface District {
  id: string;
  regencyId: string;
  name: string;
}

export interface Village {
  id: string;
  districtId: string;
  name: string;
  postalCode: string;
}

// 38 Provinsi Lengkap Indonesia
export const PROVINCES: Province[] = [
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '11', name: 'ACEH' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '92', name: 'PAPUA' },
  { id: '93', name: 'PAPUA SELATAN' },
  { id: '94', name: 'PAPUA TENGAH' },
  { id: '95', name: 'PAPUA PEGUNUNGAN' },
  { id: '96', name: 'PAPUA BARAT DAYA' },
];

// Kabupaten & Kota se-Indonesia
export const REGENCIES: Regency[] = [
  // SUMATERA UTARA (12)
  { id: '1271', provinceId: '12', name: 'KOTA MEDAN', type: 'KOTA' },
  { id: '1207', provinceId: '12', name: 'KAB. DELI SERDANG', type: 'KABUPATEN' },
  { id: '1275', provinceId: '12', name: 'KOTA BINJAI', type: 'KOTA' },
  { id: '1272', provinceId: '12', name: 'KOTA PEMATANGSIANTAR', type: 'KOTA' },
  { id: '1206', provinceId: '12', name: 'KAB. KARO', type: 'KABUPATEN' },
  { id: '1208', provinceId: '12', name: 'KAB. SIMALUNGUN', type: 'KABUPATEN' },
  { id: '1276', provinceId: '12', name: 'KOTA TEBING TINGGI', type: 'KOTA' },
  { id: '1209', provinceId: '12', name: 'KAB. ASAHAN', type: 'KABUPATEN' },
  { id: '1212', provinceId: '12', name: 'KAB. TOBA', type: 'KABUPATEN' },
  { id: '1205', provinceId: '12', name: 'KAB. LANGKAT', type: 'KABUPATEN' },
  { id: '1219', provinceId: '12', name: 'KAB. BATU BARA', type: 'KABUPATEN' },
  { id: '1274', provinceId: '12', name: 'KOTA TANJUNG BALAI', type: 'KOTA' },
  { id: '1218', provinceId: '12', name: 'KAB. SERDANG BEDAGAI', type: 'KABUPATEN' },
  { id: '1202', provinceId: '12', name: 'KAB. TAPANULI UTARA', type: 'KABUPATEN' },
  { id: '1201', provinceId: '12', name: 'KAB. TAPANULI TENGAH', type: 'KABUPATEN' },
  { id: '1203', provinceId: '12', name: 'KAB. TAPANULI SELATAN', type: 'KABUPATEN' },
  { id: '1273', provinceId: '12', name: 'KOTA SIBOLGA', type: 'KOTA' },
  { id: '1277', provinceId: '12', name: 'KOTA PADANGSIDIMPUAN', type: 'KOTA' },
  { id: '1210', provinceId: '12', name: 'KAB. LABUHANBATU', type: 'KABUPATEN' },
  { id: '1222', provinceId: '12', name: 'KAB. LABUHANBATU UTARA', type: 'KABUPATEN' },
  { id: '1223', provinceId: '12', name: 'KAB. LABUHANBATU SELATAN', type: 'KABUPATEN' },
  { id: '1211', provinceId: '12', name: 'KAB. DAIRI', type: 'KABUPATEN' },
  { id: '1215', provinceId: '12', name: 'KAB. PAKPAK BHARAT', type: 'KABUPATEN' },
  { id: '1216', provinceId: '12', name: 'KAB. HUMBANG HASUNDUTAN', type: 'KABUPATEN' },
  { id: '1217', provinceId: '12', name: 'KAB. SAMOSIR', type: 'KABUPATEN' },
  { id: '1213', provinceId: '12', name: 'KAB. MANDAILING NATAL', type: 'KABUPATEN' },
  { id: '1220', provinceId: '12', name: 'KAB. PADANG LAWAS UTARA', type: 'KABUPATEN' },
  { id: '1221', provinceId: '12', name: 'KAB. PADANG LAWAS', type: 'KABUPATEN' },
  { id: '1278', provinceId: '12', name: 'KOTA GUNUNGSITOLI', type: 'KOTA' },
  { id: '1204', provinceId: '12', name: 'KAB. NIAS', type: 'KABUPATEN' },
  { id: '1214', provinceId: '12', name: 'KAB. NIAS SELATAN', type: 'KABUPATEN' },
  { id: '1224', provinceId: '12', name: 'KAB. NIAS UTARA', type: 'KABUPATEN' },
  { id: '1225', provinceId: '12', name: 'KAB. NIAS BARAT', type: 'KABUPATEN' },

  // ACEH (11)
  { id: '1171', provinceId: '11', name: 'KOTA BANDA ACEH', type: 'KOTA' },
  { id: '1173', provinceId: '11', name: 'KOTA LHOKSEUMAWE', type: 'KOTA' },
  { id: '1174', provinceId: '11', name: 'KOTA LANGSA', type: 'KOTA' },
  { id: '1172', provinceId: '11', name: 'KOTA SABANG', type: 'KOTA' },
  { id: '1175', provinceId: '11', name: 'KOTA SUBULUSSALAM', type: 'KOTA' },
  { id: '1106', provinceId: '11', name: 'KAB. ACEH BESAR', type: 'KABUPATEN' },
  { id: '1107', provinceId: '11', name: 'KAB. PIDIE', type: 'KABUPATEN' },
  { id: '1118', provinceId: '11', name: 'KAB. PIDIE JAYA', type: 'KABUPATEN' },
  { id: '1111', provinceId: '11', name: 'KAB. BIREUEN', type: 'KABUPATEN' },
  { id: '1108', provinceId: '11', name: 'KAB. ACEH UTARA', type: 'KABUPATEN' },
  { id: '1104', provinceId: '11', name: 'KAB. ACEH TENGAH', type: 'KABUPATEN' },
  { id: '1117', provinceId: '11', name: 'KAB. BENER MERIAH', type: 'KABUPATEN' },
  { id: '1105', provinceId: '11', name: 'KAB. ACEH BARAT', type: 'KABUPATEN' },
  { id: '1112', provinceId: '11', name: 'KAB. ACEH BARAT DAYA', type: 'KABUPATEN' },
  { id: '1101', provinceId: '11', name: 'KAB. ACEH SELATAN', type: 'KABUPATEN' },
  { id: '1102', provinceId: '11', name: 'KAB. ACEH TENGGARA', type: 'KABUPATEN' },
  { id: '1103', provinceId: '11', name: 'KAB. ACEH TIMUR', type: 'KABUPATEN' },
  { id: '1110', provinceId: '11', name: 'KAB. ACEH SINGKIL', type: 'KABUPATEN' },
  { id: '1113', provinceId: '11', name: 'KAB. GAYO LUES', type: 'KABUPATEN' },
  { id: '1114', provinceId: '11', name: 'KAB. ACEH JAYA', type: 'KABUPATEN' },
  { id: '1115', provinceId: '11', name: 'KAB. NAGAN RAYA', type: 'KABUPATEN' },
  { id: '1116', provinceId: '11', name: 'KAB. ACEH TAMIANG', type: 'KABUPATEN' },
  { id: '1109', provinceId: '11', name: 'KAB. SIMEULUE', type: 'KABUPATEN' },

  // SUMATERA BARAT (13)
  { id: '1371', provinceId: '13', name: 'KOTA PADANG', type: 'KOTA' },
  { id: '1375', provinceId: '13', name: 'KOTA BUKITTINGGI', type: 'KOTA' },
  { id: '1376', provinceId: '13', name: 'KOTA PAYAKUMBUH', type: 'KOTA' },
  { id: '1377', provinceId: '13', name: 'KOTA PARIAMAN', type: 'KOTA' },
  { id: '1374', provinceId: '13', name: 'KOTA PADANG PANJANG', type: 'KOTA' },
  { id: '1372', provinceId: '13', name: 'KOTA SOLOK', type: 'KOTA' },
  { id: '1373', provinceId: '13', name: 'KOTA SAWAHLUNTO', type: 'KOTA' },
  { id: '1304', provinceId: '13', name: 'KAB. AGAM', type: 'KABUPATEN' },
  { id: '1305', provinceId: '13', name: 'KAB. PADANG PARIAMAN', type: 'KABUPATEN' },
  { id: '1306', provinceId: '13', name: 'KAB. TANAH DATAR', type: 'KABUPATEN' },
  { id: '1307', provinceId: '13', name: 'KAB. LIMA PULUH KOTA', type: 'KABUPATEN' },
  { id: '1301', provinceId: '13', name: 'KAB. PESISIR SELATAN', type: 'KABUPATEN' },
  { id: '1302', provinceId: '13', name: 'KAB. SOLOK', type: 'KABUPATEN' },
  { id: '1303', provinceId: '13', name: 'KAB. SIJUNJUNG', type: 'KABUPATEN' },
  { id: '1310', provinceId: '13', name: 'KAB. DHARMASRAYA', type: 'KABUPATEN' },
  { id: '1311', provinceId: '13', name: 'KAB. SOLOK SELATAN', type: 'KABUPATEN' },
  { id: '1312', provinceId: '13', name: 'KAB. PASAMAN BARAT', type: 'KABUPATEN' },
  { id: '1308', provinceId: '13', name: 'KAB. PASAMAN', type: 'KABUPATEN' },
  { id: '1309', provinceId: '13', name: 'KAB. KEPULAUAN MENTAWAI', type: 'KABUPATEN' },

  // RIAU (14)
  { id: '1471', provinceId: '14', name: 'KOTA PEKANBARU', type: 'KOTA' },
  { id: '1472', provinceId: '14', name: 'KOTA DUMAI', type: 'KOTA' },
  { id: '1401', provinceId: '14', name: 'KAB. KAMPAR', type: 'KABUPATEN' },
  { id: '1405', provinceId: '14', name: 'KAB. SIAK', type: 'KABUPATEN' },
  { id: '1403', provinceId: '14', name: 'KAB. BENGKALIS', type: 'KABUPATEN' },
  { id: '1404', provinceId: '14', name: 'KAB. INDRAGIRI HILIR', type: 'KABUPATEN' },
  { id: '1402', provinceId: '14', name: 'KAB. INDRAGIRI HULU', type: 'KABUPATEN' },
  { id: '1406', provinceId: '14', name: 'KAB. PELALAWAN', type: 'KABUPATEN' },
  { id: '1407', provinceId: '14', name: 'KAB. ROKAN HULU', type: 'KABUPATEN' },
  { id: '1408', provinceId: '14', name: 'KAB. ROKAN HILIR', type: 'KABUPATEN' },
  { id: '1409', provinceId: '14', name: 'KAB. KUANTAN SINGINGI', type: 'KABUPATEN' },
  { id: '1410', provinceId: '14', name: 'KAB. KEPULAUAN MERANTI', type: 'KABUPATEN' },

  // KEPULAUAN RIAU (21)
  { id: '2171', provinceId: '21', name: 'KOTA BATAM', type: 'KOTA' },
  { id: '2172', provinceId: '21', name: 'KOTA TANJUNGPINANG', type: 'KOTA' },
  { id: '2101', provinceId: '21', name: 'KAB. BINTAN', type: 'KABUPATEN' },
  { id: '2102', provinceId: '21', name: 'KAB. KARIMUN', type: 'KABUPATEN' },
  { id: '2103', provinceId: '21', name: 'KAB. NATUNA', type: 'KABUPATEN' },
  { id: '2104', provinceId: '21', name: 'KAB. LINGGA', type: 'KABUPATEN' },
  { id: '2105', provinceId: '21', name: 'KAB. KEPULAUAN ANAMBAS', type: 'KABUPATEN' },

  // JAMBI (15)
  { id: '1571', provinceId: '15', name: 'KOTA JAMBI', type: 'KOTA' },
  { id: '1572', provinceId: '15', name: 'KOTA SUNGAI PENUH', type: 'KOTA' },
  { id: '1501', provinceId: '15', name: 'KAB. KERINCI', type: 'KABUPATEN' },
  { id: '1502', provinceId: '15', name: 'KAB. MERANGIN', type: 'KABUPATEN' },
  { id: '1503', provinceId: '15', name: 'KAB. SAROLANGUN', type: 'KABUPATEN' },
  { id: '1504', provinceId: '15', name: 'KAB. BATANGHARI', type: 'KABUPATEN' },
  { id: '1505', provinceId: '15', name: 'KAB. MUARO JAMBI', type: 'KABUPATEN' },
  { id: '1506', provinceId: '15', name: 'KAB. TANJUNG JABUNG BARAT', type: 'KABUPATEN' },
  { id: '1507', provinceId: '15', name: 'KAB. TANJUNG JABUNG TIMUR', type: 'KABUPATEN' },
  { id: '1508', provinceId: '15', name: 'KAB. BUNGO', type: 'KABUPATEN' },
  { id: '1509', provinceId: '15', name: 'KAB. TEBO', type: 'KABUPATEN' },

  // SUMATERA SELATAN (16)
  { id: '1671', provinceId: '16', name: 'KOTA PALEMBANG', type: 'KOTA' },
  { id: '1672', provinceId: '16', name: 'KOTA PRABUMULIH', type: 'KOTA' },
  { id: '1673', provinceId: '16', name: 'KOTA PAGAR ALAM', type: 'KOTA' },
  { id: '1674', provinceId: '16', name: 'KOTA LUBUK LINGGAU', type: 'KOTA' },
  { id: '1601', provinceId: '16', name: 'KAB. OGAN KOMERING ULU', type: 'KABUPATEN' },
  { id: '1602', provinceId: '16', name: 'KAB. OGAN KOMERING ILIR', type: 'KABUPATEN' },
  { id: '1603', provinceId: '16', name: 'KAB. MUARA ENIM', type: 'KABUPATEN' },
  { id: '1604', provinceId: '16', name: 'KAB. LAHAT', type: 'KABUPATEN' },
  { id: '1605', provinceId: '16', name: 'KAB. MUSI RAWAS', type: 'KABUPATEN' },
  { id: '1606', provinceId: '16', name: 'KAB. MUSI BANYUASIN', type: 'KABUPATEN' },
  { id: '1607', provinceId: '16', name: 'KAB. BANYUASIN', type: 'KABUPATEN' },
  { id: '1608', provinceId: '16', name: 'KAB. OKU TIMUR', type: 'KABUPATEN' },
  { id: '1609', provinceId: '16', name: 'KAB. OKU SELATAN', type: 'KABUPATEN' },
  { id: '1610', provinceId: '16', name: 'KAB. OGAN ILIR', type: 'KABUPATEN' },
  { id: '1611', provinceId: '16', name: 'KAB. EMPAT LAWANG', type: 'KABUPATEN' },

  // LAMPUNG (18)
  { id: '1871', provinceId: '18', name: 'KOTA BANDAR LAMPUNG', type: 'KOTA' },
  { id: '1872', provinceId: '18', name: 'KOTA METRO', type: 'KOTA' },
  { id: '1801', provinceId: '18', name: 'KAB. LAMPUNG SELATAN', type: 'KABUPATEN' },
  { id: '1802', provinceId: '18', name: 'KAB. LAMPUNG TENGAH', type: 'KABUPATEN' },
  { id: '1803', provinceId: '18', name: 'KAB. LAMPUNG UTARA', type: 'KABUPATEN' },
  { id: '1804', provinceId: '18', name: 'KAB. LAMPUNG BARAT', type: 'KABUPATEN' },
  { id: '1805', provinceId: '18', name: 'KAB. TULANG BAWANG', type: 'KABUPATEN' },
  { id: '1806', provinceId: '18', name: 'KAB. TANGGAMUS', type: 'KABUPATEN' },
  { id: '1807', provinceId: '18', name: 'KAB. LAMPUNG TIMUR', type: 'KABUPATEN' },
  { id: '1808', provinceId: '18', name: 'KAB. WAY KANAN', type: 'KABUPATEN' },
  { id: '1809', provinceId: '18', name: 'KAB. PESAWARAN', type: 'KABUPATEN' },
  { id: '1810', provinceId: '18', name: 'KAB. PRINGSEWU', type: 'KABUPATEN' },

  // BENGKULU (17)
  { id: '1771', provinceId: '17', name: 'KOTA BENGKULU', type: 'KOTA' },
  { id: '1701', provinceId: '17', name: 'KAB. BENGKULU SELATAN', type: 'KABUPATEN' },
  { id: '1702', provinceId: '17', name: 'KAB. REJANG LEBONG', type: 'KABUPATEN' },
  { id: '1703', provinceId: '17', name: 'KAB. BENGKULU UTARA', type: 'KABUPATEN' },
  { id: '1704', provinceId: '17', name: 'KAB. KAUR', type: 'KABUPATEN' },
  { id: '1705', provinceId: '17', name: 'KAB. SELUMA', type: 'KABUPATEN' },
  { id: '1706', provinceId: '17', name: 'KAB. MUKOMUKO', type: 'KABUPATEN' },
  { id: '1707', provinceId: '17', name: 'KAB. LEBONG', type: 'KABUPATEN' },
  { id: '1708', provinceId: '17', name: 'KAB. KEPAHIANG', type: 'KABUPATEN' },
  { id: '1709', provinceId: '17', name: 'KAB. BENGKULU TENGAH', type: 'KABUPATEN' },

  // KEPULAUAN BANGKA BELITUNG (19)
  { id: '1971', provinceId: '19', name: 'KOTA PANGKAL PINANG', type: 'KOTA' },
  { id: '1901', provinceId: '19', name: 'KAB. BANGKA', type: 'KABUPATEN' },
  { id: '1902', provinceId: '19', name: 'KAB. BELITUNG', type: 'KABUPATEN' },
  { id: '1903', provinceId: '19', name: 'KAB. BANGKA SELATAN', type: 'KABUPATEN' },
  { id: '1904', provinceId: '19', name: 'KAB. BANGKA TENGAH', type: 'KABUPATEN' },
  { id: '1905', provinceId: '19', name: 'KAB. BANGKA BARAT', type: 'KABUPATEN' },
  { id: '1906', provinceId: '19', name: 'KAB. BELITUNG TIMUR', type: 'KABUPATEN' },

  // DKI JAKARTA (31)
  { id: '3171', provinceId: '31', name: 'KOTA JAKARTA PUSAT', type: 'KOTA' },
  { id: '3172', provinceId: '31', name: 'KOTA JAKARTA UTARA', type: 'KOTA' },
  { id: '3173', provinceId: '31', name: 'KOTA JAKARTA BARAT', type: 'KOTA' },
  { id: '3174', provinceId: '31', name: 'KOTA JAKARTA SELATAN', type: 'KOTA' },
  { id: '3175', provinceId: '31', name: 'KOTA JAKARTA TIMUR', type: 'KOTA' },
  { id: '3101', provinceId: '31', name: 'KAB. ADM. KEP. SERIBU', type: 'KABUPATEN' },

  // JAWA BARAT (32)
  { id: '3273', provinceId: '32', name: 'KOTA BANDUNG', type: 'KOTA' },
  { id: '3271', provinceId: '32', name: 'KOTA BOGOR', type: 'KOTA' },
  { id: '3276', provinceId: '32', name: 'KOTA DEPOK', type: 'KOTA' },
  { id: '3275', provinceId: '32', name: 'KOTA BEKASI', type: 'KOTA' },
  { id: '3277', provinceId: '32', name: 'KOTA CIMAHI', type: 'KOTA' },
  { id: '3278', provinceId: '32', name: 'KOTA TASIKMALAYA', type: 'KOTA' },
  { id: '3274', provinceId: '32', name: 'KOTA CIREBON', type: 'KOTA' },
  { id: '3272', provinceId: '32', name: 'KOTA SUKABUMI', type: 'KOTA' },
  { id: '3279', provinceId: '32', name: 'KOTA BANJAR', type: 'KOTA' },
  { id: '3201', provinceId: '32', name: 'KAB. BOGOR', type: 'KABUPATEN' },
  { id: '3204', provinceId: '32', name: 'KAB. BANDUNG', type: 'KABUPATEN' },
  { id: '3217', provinceId: '32', name: 'KAB. BANDUNG BARAT', type: 'KABUPATEN' },
  { id: '3216', provinceId: '32', name: 'KAB. BEKASI', type: 'KABUPATEN' },
  { id: '3215', provinceId: '32', name: 'KAB. KARAWANG', type: 'KABUPATEN' },
  { id: '3214', provinceId: '32', name: 'KAB. PURWAKARTA', type: 'KABUPATEN' },
  { id: '3213', provinceId: '32', name: 'KAB. SUBANG', type: 'KABUPATEN' },
  { id: '3203', provinceId: '32', name: 'KAB. CIANJUR', type: 'KABUPATEN' },
  { id: '3202', provinceId: '32', name: 'KAB. SUKABUMI', type: 'KABUPATEN' },
  { id: '3205', provinceId: '32', name: 'KAB. GARUT', type: 'KABUPATEN' },
  { id: '3206', provinceId: '32', name: 'KAB. TASIKMALAYA', type: 'KABUPATEN' },
  { id: '3207', provinceId: '32', name: 'KAB. CIAMIS', type: 'KABUPATEN' },
  { id: '3208', provinceId: '32', name: 'KAB. KUNINGAN', type: 'KABUPATEN' },
  { id: '3209', provinceId: '32', name: 'KAB. CIREBON', type: 'KABUPATEN' },
  { id: '3210', provinceId: '32', name: 'KAB. MAJALENGKA', type: 'KABUPATEN' },
  { id: '3211', provinceId: '32', name: 'KAB. SUMEDANG', type: 'KABUPATEN' },
  { id: '3212', provinceId: '32', name: 'KAB. INDRAMAYU', type: 'KABUPATEN' },
  { id: '3218', provinceId: '32', name: 'KAB. PANGANDARAN', type: 'KABUPATEN' },

  // BANTEN (36)
  { id: '3674', provinceId: '36', name: 'KOTA TANGERANG SELATAN', type: 'KOTA' },
  { id: '3671', provinceId: '36', name: 'KOTA TANGERANG', type: 'KOTA' },
  { id: '3673', provinceId: '36', name: 'KOTA SERANG', type: 'KOTA' },
  { id: '3672', provinceId: '36', name: 'KOTA CILEGON', type: 'KOTA' },
  { id: '3603', provinceId: '36', name: 'KAB. TANGERANG', type: 'KABUPATEN' },
  { id: '3604', provinceId: '36', name: 'KAB. SERANG', type: 'KABUPATEN' },
  { id: '3602', provinceId: '36', name: 'KAB. LEBAK', type: 'KABUPATEN' },
  { id: '3601', provinceId: '36', name: 'KAB. PANDEGLANG', type: 'KABUPATEN' },

  // JAWA TENGAH (33)
  { id: '3374', provinceId: '33', name: 'KOTA SEMARANG', type: 'KOTA' },
  { id: '3372', provinceId: '33', name: 'KOTA SURAKARTA (SOLO)', type: 'KOTA' },
  { id: '3371', provinceId: '33', name: 'KOTA MAGELANG', type: 'KOTA' },
  { id: '3373', provinceId: '33', name: 'KOTA SALATIGA', type: 'KOTA' },
  { id: '3375', provinceId: '33', name: 'KOTA PEKALONGAN', type: 'KOTA' },
  { id: '3376', provinceId: '33', name: 'KOTA TEGAL', type: 'KOTA' },
  { id: '3302', provinceId: '33', name: 'KAB. BANYUMAS (PURWOKERTO)', type: 'KABUPATEN' },
  { id: '3301', provinceId: '33', name: 'KAB. CILACAP', type: 'KABUPATEN' },
  { id: '3310', provinceId: '33', name: 'KAB. KLATEN', type: 'KABUPATEN' },
  { id: '3311', provinceId: '33', name: 'KAB. SUKOHARJO', type: 'KABUPATEN' },
  { id: '3313', provinceId: '33', name: 'KAB. KARANGANYAR', type: 'KABUPATEN' },
  { id: '3312', provinceId: '33', name: 'KAB. WONOGIRI', type: 'KABUPATEN' },
  { id: '3314', provinceId: '33', name: 'KAB. SRAGEN', type: 'KABUPATEN' },
  { id: '3309', provinceId: '33', name: 'KAB. BOYOLALI', type: 'KABUPATEN' },
  { id: '3322', provinceId: '33', name: 'KAB. SEMARANG', type: 'KABUPATEN' },
  { id: '3324', provinceId: '33', name: 'KAB. KENDAL', type: 'KABUPATEN' },
  { id: '3321', provinceId: '33', name: 'KAB. DEMAK', type: 'KABUPATEN' },
  { id: '3319', provinceId: '33', name: 'KAB. KUDUS', type: 'KABUPATEN' },
  { id: '3320', provinceId: '33', name: 'KAB. JEPARA', type: 'KABUPATEN' },
  { id: '3318', provinceId: '33', name: 'KAB. PATI', type: 'KABUPATEN' },
  { id: '3317', provinceId: '33', name: 'KAB. REMBANG', type: 'KABUPATEN' },
  { id: '3316', provinceId: '33', name: 'KAB. BLORA', type: 'KABUPATEN' },
  { id: '3315', provinceId: '33', name: 'KAB. GROBOGAN', type: 'KABUPATEN' },
  { id: '3308', provinceId: '33', name: 'KAB. MAGELANG', type: 'KABUPATEN' },
  { id: '3323', provinceId: '33', name: 'KAB. TEMANGGUNG', type: 'KABUPATEN' },
  { id: '3307', provinceId: '33', name: 'KAB. WONOSOBO', type: 'KABUPATEN' },
  { id: '3306', provinceId: '33', name: 'KAB. PURWOREJO', type: 'KABUPATEN' },
  { id: '3305', provinceId: '33', name: 'KAB. KEBUMEN', type: 'KABUPATEN' },
  { id: '3304', provinceId: '33', name: 'KAB. BANJARNEGARA', type: 'KABUPATEN' },
  { id: '3303', provinceId: '33', name: 'KAB. PURBALINGGA', type: 'KABUPATEN' },
  { id: '3329', provinceId: '33', name: 'KAB. BREBES', type: 'KABUPATEN' },
  { id: '3328', provinceId: '33', name: 'KAB. TEGAL', type: 'KABUPATEN' },
  { id: '3327', provinceId: '33', name: 'KAB. PEMALANG', type: 'KABUPATEN' },
  { id: '3326', provinceId: '33', name: 'KAB. PEKALONGAN', type: 'KABUPATEN' },
  { id: '3325', provinceId: '33', name: 'KAB. BATANG', type: 'KABUPATEN' },

  // DI YOGYAKARTA (34)
  { id: '3471', provinceId: '34', name: 'KOTA YOGYAKARTA', type: 'KOTA' },
  { id: '3404', provinceId: '34', name: 'KAB. SLEMAN', type: 'KABUPATEN' },
  { id: '3402', provinceId: '34', name: 'KAB. BANTUL', type: 'KABUPATEN' },
  { id: '3401', provinceId: '34', name: 'KAB. KULON PROGO', type: 'KABUPATEN' },
  { id: '3403', provinceId: '34', name: 'KAB. GUNUNGKIDUL', type: 'KABUPATEN' },

  // JAWA TIMUR (35)
  { id: '3578', provinceId: '35', name: 'KOTA SURABAYA', type: 'KOTA' },
  { id: '3573', provinceId: '35', name: 'KOTA MALANG', type: 'KOTA' },
  { id: '3579', provinceId: '35', name: 'KOTA BATU', type: 'KOTA' },
  { id: '3571', provinceId: '35', name: 'KOTA KEDIRI', type: 'KOTA' },
  { id: '3572', provinceId: '35', name: 'KOTA BLITAR', type: 'KOTA' },
  { id: '3574', provinceId: '35', name: 'KOTA PROBOLINGGO', type: 'KOTA' },
  { id: '3575', provinceId: '35', name: 'KOTA PASURUAN', type: 'KOTA' },
  { id: '3576', provinceId: '35', name: 'KOTA MOJOKERTO', type: 'KOTA' },
  { id: '3577', provinceId: '35', name: 'KOTA MADIUN', type: 'KOTA' },
  { id: '3515', provinceId: '35', name: 'KAB. SIDOARJO', type: 'KABUPATEN' },
  { id: '3525', provinceId: '35', name: 'KAB. GRESIK', type: 'KABUPATEN' },
  { id: '3507', provinceId: '35', name: 'KAB. MALANG', type: 'KABUPATEN' },
  { id: '3514', provinceId: '35', name: 'KAB. PASURUAN', type: 'KABUPATEN' },
  { id: '3516', provinceId: '35', name: 'KAB. MOJOKERTO', type: 'KABUPATEN' },
  { id: '3517', provinceId: '35', name: 'KAB. JOMBANG', type: 'KABUPATEN' },
  { id: '3506', provinceId: '35', name: 'KAB. KEDIRI', type: 'KABUPATEN' },
  { id: '3505', provinceId: '35', name: 'KAB. BLITAR', type: 'KABUPATEN' },
  { id: '3504', provinceId: '35', name: 'KAB. TULUNGAGUNG', type: 'KABUPATEN' },
  { id: '3503', provinceId: '35', name: 'KAB. TRENGGALEK', type: 'KABUPATEN' },
  { id: '3501', provinceId: '35', name: 'KAB. PACITAN', type: 'KABUPATEN' },
  { id: '3502', provinceId: '35', name: 'KAB. PONOROGO', type: 'KABUPATEN' },
  { id: '3519', provinceId: '35', name: 'KAB. MADIUN', type: 'KABUPATEN' },
  { id: '3520', provinceId: '35', name: 'KAB. MAGETAN', type: 'KABUPATEN' },
  { id: '3521', provinceId: '35', name: 'KAB. NGAWI', type: 'KABUPATEN' },
  { id: '3518', provinceId: '35', name: 'KAB. NGANJUK', type: 'KABUPATEN' },
  { id: '3522', provinceId: '35', name: 'KAB. BOJONEGORO', type: 'KABUPATEN' },
  { id: '3523', provinceId: '35', name: 'KAB. TUBAN', type: 'KABUPATEN' },
  { id: '3524', provinceId: '35', name: 'KAB. LAMONGAN', type: 'KABUPATEN' },
  { id: '3526', provinceId: '35', name: 'KAB. BANGKALAN', type: 'KABUPATEN' },
  { id: '3527', provinceId: '35', name: 'KAB. SAMPANG', type: 'KABUPATEN' },
  { id: '3528', provinceId: '35', name: 'KAB. PAMEKASAN', type: 'KABUPATEN' },
  { id: '3529', provinceId: '35', name: 'KAB. SUMENEP', type: 'KABUPATEN' },
  { id: '3508', provinceId: '35', name: 'KAB. LUMAJANG', type: 'KABUPATEN' },
  { id: '3509', provinceId: '35', name: 'KAB. JEMBER', type: 'KABUPATEN' },
  { id: '3510', provinceId: '35', name: 'KAB. BANYUWANGI', type: 'KABUPATEN' },
  { id: '3511', provinceId: '35', name: 'KAB. BONDOWOSO', type: 'KABUPATEN' },
  { id: '3512', provinceId: '35', name: 'KAB. SITUBONDO', type: 'KABUPATEN' },
  { id: '3513', provinceId: '35', name: 'KAB. PROBOLINGGO', type: 'KABUPATEN' },

  // BALI (51)
  { id: '5171', provinceId: '51', name: 'KOTA DENPASAR', type: 'KOTA' },
  { id: '5103', provinceId: '51', name: 'KAB. BADUNG', type: 'KABUPATEN' },
  { id: '5104', provinceId: '51', name: 'KAB. GIANYAR', type: 'KABUPATEN' },
  { id: '5102', provinceId: '51', name: 'KAB. TABANAN', type: 'KABUPATEN' },
  { id: '5108', provinceId: '51', name: 'KAB. BULELENG (SINGARAJA)', type: 'KABUPATEN' },
  { id: '5101', provinceId: '51', name: 'KAB. JEMBRANA', type: 'KABUPATEN' },
  { id: '5105', provinceId: '51', name: 'KAB. KLUNGKUNG', type: 'KABUPATEN' },
  { id: '5106', provinceId: '51', name: 'KAB. BANGLI', type: 'KABUPATEN' },
  { id: '5107', provinceId: '51', name: 'KAB. KARANGASEM', type: 'KABUPATEN' },

  // NUSA TENGGARA BARAT (52)
  { id: '5271', provinceId: '52', name: 'KOTA MATARAM', type: 'KOTA' },
  { id: '5272', provinceId: '52', name: 'KOTA BIMA', type: 'KOTA' },
  { id: '5201', provinceId: '52', name: 'KAB. LOMBOK BARAT', type: 'KABUPATEN' },
  { id: '5202', provinceId: '52', name: 'KAB. LOMBOK TENGAH', type: 'KABUPATEN' },
  { id: '5203', provinceId: '52', name: 'KAB. LOMBOK TIMUR', type: 'KABUPATEN' },
  { id: '5208', provinceId: '52', name: 'KAB. LOMBOK UTARA', type: 'KABUPATEN' },
  { id: '5204', provinceId: '52', name: 'KAB. SUMBAWA', type: 'KABUPATEN' },
  { id: '5207', provinceId: '52', name: 'KAB. SUMBAWA BARAT', type: 'KABUPATEN' },
  { id: '5205', provinceId: '52', name: 'KAB. DOMPU', type: 'KABUPATEN' },
  { id: '5206', provinceId: '52', name: 'KAB. BIMA', type: 'KABUPATEN' },

  // NUSA TENGGARA TIMUR (53)
  { id: '5371', provinceId: '53', name: 'KOTA KUPANG', type: 'KOTA' },
  { id: '5301', provinceId: '53', name: 'KAB. KUPANG', type: 'KABUPATEN' },
  { id: '5315', provinceId: '53', name: 'KAB. MANGGARAI BARAT (LABUAN BAJO)', type: 'KABUPATEN' },
  { id: '5310', provinceId: '53', name: 'KAB. MANGGARAI', type: 'KABUPATEN' },
  { id: '5308', provinceId: '53', name: 'KAB. ENDE', type: 'KABUPATEN' },
  { id: '5307', provinceId: '53', name: 'KAB. SIKKA (MAUMERE)', type: 'KABUPATEN' },
  { id: '5302', provinceId: '53', name: 'KAB. TIMOR TENGAH SELATAN', type: 'KABUPATEN' },
  { id: '5303', provinceId: '53', name: 'KAB. TIMOR TENGAH UTARA', type: 'KABUPATEN' },
  { id: '5304', provinceId: '53', name: 'KAB. BELU', type: 'KABUPATEN' },
  { id: '5309', provinceId: '53', name: 'KAB. NGADA', type: 'KABUPATEN' },

  // KALIMANTAN TIMUR (64)
  { id: '6471', provinceId: '64', name: 'KOTA BALIKPAPAN', type: 'KOTA' },
  { id: '6472', provinceId: '64', name: 'KOTA SAMARINDA', type: 'KOTA' },
  { id: '6474', provinceId: '64', name: 'KOTA BONTANG', type: 'KOTA' },
  { id: '6402', provinceId: '64', name: 'KAB. KUTAI KARTANEGARA', type: 'KABUPATEN' },
  { id: '6409', provinceId: '64', name: 'KAB. PENAJAM PASER UTARA (IKN)', type: 'KABUPATEN' },

  // KALIMANTAN BARAT (61)
  { id: '6171', provinceId: '61', name: 'KOTA PONTIANAK', type: 'KOTA' },
  { id: '6172', provinceId: '61', name: 'KOTA SINGKAWANG', type: 'KOTA' },
  { id: '6112', provinceId: '61', name: 'KAB. KUBU RAYA', type: 'KABUPATEN' },

  // KALIMANTAN SELATAN (63)
  { id: '6371', provinceId: '63', name: 'KOTA BANJARMASIN', type: 'KOTA' },
  { id: '6372', provinceId: '63', name: 'KOTA BANJARBARU', type: 'KOTA' },
  { id: '6303', provinceId: '63', name: 'KAB. BANJAR', type: 'KABUPATEN' },

  // KALIMANTAN TENGAH (62)
  { id: '6271', provinceId: '62', name: 'KOTA PALANGKA RAYA', type: 'KOTA' },
  { id: '6201', provinceId: '62', name: 'KAB. KOTAWARINGIN BARAT', type: 'KABUPATEN' },

  // KALIMANTAN UTARA (65)
  { id: '6571', provinceId: '65', name: 'KOTA TARAKAN', type: 'KOTA' },
  { id: '6501', provinceId: '65', name: 'KAB. BULUNGAN', type: 'KABUPATEN' },

  // SULAWESI SELATAN (73)
  { id: '7371', provinceId: '73', name: 'KOTA MAKASSAR', type: 'KOTA' },
  { id: '7372', provinceId: '73', name: 'KOTA PAREPARE', type: 'KOTA' },
  { id: '7373', provinceId: '73', name: 'KOTA PALOPO', type: 'KOTA' },
  { id: '7306', provinceId: '73', name: 'KAB. GOWA', type: 'KABUPATEN' },
  { id: '7309', provinceId: '73', name: 'KAB. MAROS', type: 'KABUPATEN' },
  { id: '7318', provinceId: '73', name: 'KAB. TANA TORAJA', type: 'KABUPATEN' },
  { id: '7326', provinceId: '73', name: 'KAB. TORAJA UTARA', type: 'KABUPATEN' },

  // SULAWESI UTARA (71)
  { id: '7171', provinceId: '71', name: 'KOTA MANADO', type: 'KOTA' },
  { id: '7172', provinceId: '71', name: 'KOTA BITUNG', type: 'KOTA' },
  { id: '7173', provinceId: '71', name: 'KOTA TOMOHON', type: 'KOTA' },
  { id: '7174', provinceId: '71', name: 'KOTA KOTAMOBAGU', type: 'KOTA' },
  { id: '7102', provinceId: '71', name: 'KAB. MINAHASA', type: 'KABUPATEN' },

  // SULAWESI TENGAH (72)
  { id: '7271', provinceId: '72', name: 'KOTA PALU', type: 'KOTA' },
  { id: '7202', provinceId: '72', name: 'KAB. POSO', type: 'KABUPATEN' },

  // SULAWESI TENGGARA (74)
  { id: '7471', provinceId: '74', name: 'KOTA KENDARI', type: 'KOTA' },
  { id: '7472', provinceId: '74', name: 'KOTA BAUBAU', type: 'KOTA' },

  // GORONTALO (75)
  { id: '7571', provinceId: '75', name: 'KOTA GORONTALO', type: 'KOTA' },
  { id: '7501', provinceId: '75', name: 'KAB. GORONTALO', type: 'KABUPATEN' },

  // SULAWESI BARAT (76)
  { id: '7602', provinceId: '76', name: 'KAB. MAMUJU', type: 'KABUPATEN' },
  { id: '7604', provinceId: '76', name: 'KAB. POLEWALI MANDAR', type: 'KABUPATEN' },

  // MALUKU (81)
  { id: '8171', provinceId: '81', name: 'KOTA AMBON', type: 'KOTA' },
  { id: '8172', provinceId: '81', name: 'KOTA TUAL', type: 'KOTA' },

  // MALUKU UTARA (82)
  { id: '8271', provinceId: '82', name: 'KOTA TERNATE', type: 'KOTA' },
  { id: '8272', provinceId: '82', name: 'KOTA TIDORE KEPULAUAN', type: 'KOTA' },

  // PAPUA & DOB PAPUA (91-96)
  { id: '9271', provinceId: '92', name: 'KOTA JAYAPURA', type: 'KOTA' },
  { id: '9203', provinceId: '92', name: 'KAB. JAYAPURA', type: 'KABUPATEN' },
  { id: '9171', provinceId: '91', name: 'KOTA SORONG', type: 'KOTA' },
  { id: '9102', provinceId: '91', name: 'KAB. MANOKWARI', type: 'KABUPATEN' },
  { id: '9301', provinceId: '93', name: 'KAB. MERAUKE', type: 'KABUPATEN' },
  { id: '9401', provinceId: '94', name: 'KAB. NABIRE', type: 'KABUPATEN' },
  { id: '9404', provinceId: '94', name: 'KAB. MIMIKA (TIMIKA)', type: 'KABUPATEN' },
  { id: '9501', provinceId: '95', name: 'KAB. JAYAWIJAYA (WAMENA)', type: 'KABUPATEN' },
];

// Master Kecamatan
export const DISTRICTS: District[] = [
  // KOTA MEDAN (1271) - 21 Kecamatan Lengkap
  { id: '127101', regencyId: '1271', name: 'Medan Kota' },
  { id: '127102', regencyId: '1271', name: 'Medan Baru' },
  { id: '127103', regencyId: '1271', name: 'Medan Petisah' },
  { id: '127104', regencyId: '1271', name: 'Medan Selayang' },
  { id: '127105', regencyId: '1271', name: 'Medan Sunggal' },
  { id: '127106', regencyId: '1271', name: 'Medan Helvetia' },
  { id: '127107', regencyId: '1271', name: 'Medan Barat' },
  { id: '127108', regencyId: '1271', name: 'Medan Timur' },
  { id: '127109', regencyId: '1271', name: 'Medan Perjuangan' },
  { id: '127110', regencyId: '1271', name: 'Medan Tembung' },
  { id: '127111', regencyId: '1271', name: 'Medan Denai' },
  { id: '127112', regencyId: '1271', name: 'Medan Area' },
  { id: '127113', regencyId: '1271', name: 'Medan Amplas' },
  { id: '127114', regencyId: '1271', name: 'Medan Johor' },
  { id: '127115', regencyId: '1271', name: 'Medan Tuntungan' },
  { id: '127116', regencyId: '1271', name: 'Medan Polonia' },
  { id: '127117', regencyId: '1271', name: 'Medan Deli' },
  { id: '127118', regencyId: '1271', name: 'Medan Labuhan' },
  { id: '127119', regencyId: '1271', name: 'Medan Marelan' },
  { id: '127120', regencyId: '1271', name: 'Medan Belawan' },
  { id: '127121', regencyId: '1271', name: 'Medan Maimun' },

  // KAB. DELI SERDANG (1207) - Kecamatan Utama
  { id: '120701', regencyId: '1207', name: 'Percut Sei Tuan' },
  { id: '120702', regencyId: '1207', name: 'Sunggal' },
  { id: '120703', regencyId: '1207', name: 'Lubuk Pakam' },
  { id: '120704', regencyId: '1207', name: 'Tanjung Morawa' },
  { id: '120705', regencyId: '1207', name: 'Pancur Batu' },
  { id: '120706', regencyId: '1207', name: 'Patumbak' },
  { id: '120707', regencyId: '1207', name: 'Deli Tua' },
  { id: '120708', regencyId: '1207', name: 'Hamparan Perak' },
  { id: '120709', regencyId: '1207', name: 'Batang Kuis' },
  { id: '120710', regencyId: '1207', name: 'Beringin (KNO)' },
  { id: '120711', regencyId: '1207', name: 'Sibolangit' },
  { id: '120712', regencyId: '1207', name: 'Kutalimbaru' },
  { id: '120713', regencyId: '1207', name: 'Namorambe' },
  { id: '120714', regencyId: '1207', name: 'Biru-Biru' },
  { id: '120715', regencyId: '1207', name: 'Labuhan Deli' },

  // KOTA BINJAI (1275)
  { id: '127501', regencyId: '1275', name: 'Binjai Kota' },
  { id: '127502', regencyId: '1275', name: 'Binjai Barat' },
  { id: '127503', regencyId: '1275', name: 'Binjai Timur' },
  { id: '127504', regencyId: '1275', name: 'Binjai Utara' },
  { id: '127505', regencyId: '1275', name: 'Binjai Selatan' },

  // KOTA PEMATANGSIANTAR (1272)
  { id: '127201', regencyId: '1272', name: 'Siantar Timur' },
  { id: '127202', regencyId: '1272', name: 'Siantar Barat' },
  { id: '127203', regencyId: '1272', name: 'Siantar Utara' },
  { id: '127204', regencyId: '1272', name: 'Siantar Selatan' },
  { id: '127205', regencyId: '1272', name: 'Siantar Marihat' },
  { id: '127206', regencyId: '1272', name: 'Siantar Martoba' },
  { id: '127207', regencyId: '1272', name: 'Siantar Sitalasari' },
  { id: '127208', regencyId: '1272', name: 'Siantar Marimbun' },

  // KAB. KARO (1206)
  { id: '120601', regencyId: '1206', name: 'Kabanjahe' },
  { id: '120602', regencyId: '1206', name: 'Berastagi' },
  { id: '120603', regencyId: '1206', name: 'Tigapanah' },
  { id: '120604', regencyId: '1206', name: 'Merek' },
  { id: '120605', regencyId: '1206', name: 'Barusjahe' },

  // KAB. SIMALUNGUN (1208)
  { id: '120801', regencyId: '1208', name: 'Raya' },
  { id: '120802', regencyId: '1208', name: 'Siantar' },
  { id: '120803', regencyId: '1208', name: 'Girsang Sipangan Bolon (Parapat)' },
  { id: '120804', regencyId: '1208', name: 'Tanah Jawa' },
  { id: '120805', regencyId: '1208', name: 'Tapian Dolok' },
  { id: '120806', regencyId: '1208', name: 'Bosar Maligas' },

  // KOTA TEBING TINGGI (1276)
  { id: '127601', regencyId: '1276', name: 'Tebing Tinggi Kota' },
  { id: '127602', regencyId: '1276', name: 'Padang Hulu' },
  { id: '127603', regencyId: '1276', name: 'Padang Hilir' },
  { id: '127604', regencyId: '1276', name: 'Rambutan' },
  { id: '127605', regencyId: '1276', name: 'Bajenis' },

  // KAB. ASAHAN (1209)
  { id: '120901', regencyId: '1209', name: 'Kisaran Barat' },
  { id: '120902', regencyId: '1209', name: 'Kisaran Timur' },
  { id: '120903', regencyId: '1209', name: 'Air Batu' },
  { id: '120904', regencyId: '1209', name: 'Simpang Empat' },

  // KAB. TOBA (1212)
  { id: '121201', regencyId: '1212', name: 'Balige' },
  { id: '121202', regencyId: '1212', name: 'Laguboti' },
  { id: '121203', regencyId: '1212', name: 'Porsea' },
  { id: '121204', regencyId: '1212', name: 'Sigumpar' },

  // KAB. TAPANULI UTARA (1202)
  { id: '120201', regencyId: '1202', name: 'Tarutung' },
  { id: '120202', regencyId: '1202', name: 'Sipoholon' },
  { id: '120203', regencyId: '1202', name: 'Siborong-Borong' },

  // KOTA BANDA ACEH (1171)
  { id: '117101', regencyId: '1171', name: 'Baiturrahman' },
  { id: '117102', regencyId: '1171', name: 'Kuta Alam' },
  { id: '117103', regencyId: '1171', name: 'Syiah Kuala' },
  { id: '117104', regencyId: '1171', name: 'Ulee Kareng' },
  { id: '117105', regencyId: '1171', name: 'Meuraxa' },

  // KOTA PADANG (1371)
  { id: '137101', regencyId: '1371', name: 'Padang Barat' },
  { id: '137102', regencyId: '1371', name: 'Padang Timur' },
  { id: '137103', regencyId: '1371', name: 'Padang Utara' },
  { id: '137104', regencyId: '1371', name: 'Padang Selatan' },
  { id: '137105', regencyId: '1371', name: 'Koto Tangah' },
  { id: '137106', regencyId: '1371', name: 'Kuranji' },

  // KOTA PEKANBARU (1471)
  { id: '147101', regencyId: '1471', name: 'Sukajadi' },
  { id: '147102', regencyId: '1471', name: 'Pekanbaru Kota' },
  { id: '147103', regencyId: '1471', name: 'Tampan' },
  { id: '147104', regencyId: '1471', name: 'Marpoyan Damai' },
  { id: '147105', regencyId: '1471', name: 'Payung Sekaki' },
  { id: '147106', regencyId: '1471', name: 'Rumbai' },

  // KOTA BATAM (2171)
  { id: '217101', regencyId: '2171', name: 'Batam Kota' },
  { id: '217102', regencyId: '2171', name: 'Lubuk Baja' },
  { id: '217103', regencyId: '2171', name: 'Batu Ampar' },
  { id: '217104', regencyId: '2171', name: 'Sekupang' },
  { id: '217105', regencyId: '2171', name: 'Nongsa' },
  { id: '217106', regencyId: '2171', name: 'Sagulung' },

  // KOTA JAKARTA PUSAT (3171)
  { id: '317101', regencyId: '3171', name: 'Gambir' },
  { id: '317102', regencyId: '3171', name: 'Menteng' },
  { id: '317103', regencyId: '3171', name: 'Tanah Abang' },
  { id: '317104', regencyId: '3171', name: 'Senen' },
  { id: '317105', regencyId: '3171', name: 'Cempaka Putih' },
  { id: '317106', regencyId: '3171', name: 'Kemayoran' },

  // KOTA JAKARTA SELATAN (3174)
  { id: '317401', regencyId: '3174', name: 'Kebayoran Baru' },
  { id: '317402', regencyId: '3174', name: 'Kebayoran Lama' },
  { id: '317403', regencyId: '3174', name: 'Cilandak' },
  { id: '317404', regencyId: '3174', name: 'Setiabudi' },
  { id: '317405', regencyId: '3174', name: 'Tebet' },
  { id: '317406', regencyId: '3174', name: 'Pasar Minggu' },

  // KOTA BANDUNG (3273)
  { id: '327301', regencyId: '3273', name: 'Coblong' },
  { id: '327302', regencyId: '3273', name: 'Cicendo' },
  { id: '327303', regencyId: '3273', name: 'Sukasari' },
  { id: '327304', regencyId: '3273', name: 'Sumur Bandung' },
  { id: '327305', regencyId: '3273', name: 'Lengkong' },
  { id: '327306', regencyId: '3273', name: 'Buahbatu' },

  // KOTA SURABAYA (3578)
  { id: '357801', regencyId: '3578', name: 'Gubeng' },
  { id: '357802', regencyId: '3578', name: 'Tegalsari' },
  { id: '357803', regencyId: '3578', name: 'Wonokromo' },
  { id: '357804', regencyId: '3578', name: 'Genteng' },
  { id: '357805', regencyId: '3578', name: 'Sukolilo' },
  { id: '357806', regencyId: '3578', name: 'Rungkut' },

  // KOTA YOGYAKARTA (3471)
  { id: '347101', regencyId: '3471', name: 'Danurejan' },
  { id: '347102', regencyId: '3471', name: 'Gedongtengen' },
  { id: '347103', regencyId: '3471', name: 'Gondokusuman' },
  { id: '347104', regencyId: '3471', name: 'Kraton' },
  { id: '347105', regencyId: '3471', name: 'Umbulharjo' },

  // KOTA SEMARANG (3374)
  { id: '337401', regencyId: '3374', name: 'Semarang Tengah' },
  { id: '337402', regencyId: '3374', name: 'Semarang Selatan' },
  { id: '337403', regencyId: '3374', name: 'Semarang Barat' },
  { id: '337404', regencyId: '3374', name: 'Banyumanik' },
  { id: '337405', regencyId: '3374', name: 'Pedurungan' },
];

// Master Kelurahan & Desa dengan Kode Pos Otomatis
export const VILLAGES: Village[] = [
  // Medan Kota (127101)
  { id: '12710101', districtId: '127101', name: 'Pandan Hulu I', postalCode: '20211' },
  { id: '12710102', districtId: '127101', name: 'Pandan Hulu II', postalCode: '20211' },
  { id: '12710103', districtId: '127101', name: 'Pasar Baru', postalCode: '20212' },
  { id: '12710104', districtId: '127101', name: 'Teladan Barat', postalCode: '20217' },
  { id: '12710105', districtId: '127101', name: 'Mesjid', postalCode: '20213' },
  { id: '12710106', districtId: '127101', name: 'Kotamatsum III', postalCode: '20215' },
  { id: '12710107', districtId: '127101', name: 'Sei Rengas I', postalCode: '20214' },
  { id: '12710108', districtId: '127101', name: 'Sukaraja', postalCode: '20212' },
  { id: '12710109', districtId: '127101', name: 'Pasar Merah Barat', postalCode: '20216' },

  // Medan Baru (127102)
  { id: '12710201', districtId: '127102', name: 'Padang Bulan', postalCode: '20155' },
  { id: '12710202', districtId: '127102', name: 'Titi Rantai', postalCode: '20156' },
  { id: '12710203', districtId: '127102', name: 'Petisah Hulu', postalCode: '20153' },
  { id: '12710204', districtId: '127102', name: 'Babura', postalCode: '20154' },
  { id: '12710205', districtId: '127102', name: 'Merdeka', postalCode: '20154' },
  { id: '12710206', districtId: '127102', name: 'Darad', postalCode: '20155' },

  // Medan Petisah (127103)
  { id: '12710301', districtId: '127103', name: 'Petisah Tengah', postalCode: '20112' },
  { id: '12710302', districtId: '127103', name: 'Sekip', postalCode: '20113' },
  { id: '12710303', districtId: '127103', name: 'Sei Putih Barat', postalCode: '20118' },
  { id: '12710304', districtId: '127103', name: 'Sei Putih Timur I', postalCode: '20118' },
  { id: '12710305', districtId: '127103', name: 'Sei Putih Tengah', postalCode: '20118' },
  { id: '12710306', districtId: '127103', name: 'Sei Sikambing D', postalCode: '20119' },

  // Medan Selayang (127104)
  { id: '12710401', districtId: '127104', name: 'Padang Bulan Selayang I', postalCode: '20131' },
  { id: '12710402', districtId: '127104', name: 'Padang Bulan Selayang II', postalCode: '20131' },
  { id: '12710403', districtId: '127104', name: 'Sempakata', postalCode: '20131' },
  { id: '12710404', districtId: '127104', name: 'Tanjung Sari', postalCode: '20132' },
  { id: '12710405', districtId: '127104', name: 'Beringin', postalCode: '20131' },
  { id: '12710406', districtId: '127104', name: 'Asam Kumbang', postalCode: '20133' },

  // Medan Sunggal (127105)
  { id: '12710501', districtId: '127105', name: 'Sunggal', postalCode: '20128' },
  { id: '12710502', districtId: '127105', name: 'Tanjung Rejo', postalCode: '20122' },
  { id: '12710503', districtId: '127105', name: 'Sei Sikambing B', postalCode: '20122' },
  { id: '12710504', districtId: '127105', name: 'Simpang Tanjung', postalCode: '20122' },
  { id: '12710505', districtId: '127105', name: 'Babura Sunggal', postalCode: '20121' },
  { id: '12710506', districtId: '127105', name: 'Lalang', postalCode: '20127' },

  // Medan Helvetia (127106)
  { id: '12710601', districtId: '127106', name: 'Helvetia', postalCode: '20124' },
  { id: '12710602', districtId: '127106', name: 'Helvetia Tengah', postalCode: '20124' },
  { id: '12710603', districtId: '127106', name: 'Helvetia Timur', postalCode: '20124' },
  { id: '12710604', districtId: '127106', name: 'Dwikora', postalCode: '20123' },
  { id: '12710605', districtId: '127106', name: 'Tanjung Gusta', postalCode: '20125' },
  { id: '12710606', districtId: '127106', name: 'Cinta Damai', postalCode: '20126' },

  // Medan Barat (127107)
  { id: '12710701', districtId: '127107', name: 'Kesawan', postalCode: '20111' },
  { id: '12710702', districtId: '127107', name: 'Glugur Kota', postalCode: '20115' },
  { id: '12710703', districtId: '127107', name: 'Pulo Brayan Kota', postalCode: '20116' },
  { id: '12710704', districtId: '127107', name: 'Karang Berombak', postalCode: '20117' },
  { id: '12710705', districtId: '127107', name: 'Silalas', postalCode: '20114' },
  { id: '12710706', districtId: '127107', name: 'Sei Agul', postalCode: '20117' },

  // Medan Timur (127108)
  { id: '12710801', districtId: '127108', name: 'Perintis', postalCode: '20231' },
  { id: '12710802', districtId: '127108', name: 'Gaharu', postalCode: '20235' },
  { id: '12710803', districtId: '127108', name: 'Sidodadi', postalCode: '20234' },
  { id: '12710804', districtId: '127108', name: 'Glugur Darat I', postalCode: '20238' },
  { id: '12710805', districtId: '127108', name: 'Glugur Darat II', postalCode: '20238' },
  { id: '12710806', districtId: '127108', name: 'Pulo Brayan Darat I', postalCode: '20239' },
  { id: '12710807', districtId: '127108', name: 'Pulo Brayan Darat II', postalCode: '20239' },

  // Medan Area (127112)
  { id: '12711201', districtId: '127112', name: 'Kotamatsum I', postalCode: '20215' },
  { id: '12711202', districtId: '127112', name: 'Kotamatsum II', postalCode: '20215' },
  { id: '12711203', districtId: '127112', name: 'Kotamatsum IV', postalCode: '20215' },
  { id: '12711204', districtId: '127112', name: 'Pasar Merah Timur', postalCode: '20216' },
  { id: '12711205', districtId: '127112', name: 'Tegal Sari I', postalCode: '20216' },
  { id: '12711206', districtId: '127112', name: 'Tegal Sari II', postalCode: '20216' },
  { id: '12711207', districtId: '127112', name: 'Tegal Sari III', postalCode: '20216' },
  { id: '12711208', districtId: '127112', name: 'Sei Rengas II', postalCode: '20214' },
  { id: '12711209', districtId: '127112', name: 'Sei Rengas Permata', postalCode: '20214' },

  // Medan Johor (127114)
  { id: '12711401', districtId: '127114', name: 'Kwitang / Gedung Johor', postalCode: '20147' },
  { id: '12711402', districtId: '127114', name: 'Pangkalan Masyhur', postalCode: '20146' },
  { id: '12711403', districtId: '127114', name: 'Kedai Durian', postalCode: '20147' },
  { id: '12711404', districtId: '127114', name: 'Suka Maju', postalCode: '20147' },
  { id: '12711405', districtId: '127114', name: 'Titi Kuning', postalCode: '20146' },
  { id: '12711406', districtId: '127114', name: 'Kwala Bekala', postalCode: '20146' },

  // Medan Amplas (127113)
  { id: '12711301', districtId: '127113', name: 'Amplas', postalCode: '20149' },
  { id: '12711302', districtId: '127113', name: 'Harjosari I', postalCode: '20147' },
  { id: '12711303', districtId: '127113', name: 'Harjosari II', postalCode: '20147' },
  { id: '12711304', districtId: '127113', name: 'Sitirejo II', postalCode: '20148' },
  { id: '12711305', districtId: '127113', name: 'Sitirejo III', postalCode: '20148' },
  { id: '12711306', districtId: '127113', name: 'Timbang Deli', postalCode: '20148' },

  // Medan Tembung (127110)
  { id: '12711001', districtId: '127110', name: 'Bandar Selamat', postalCode: '20223' },
  { id: '12711002', districtId: '127110', name: 'Bantan', postalCode: '20224' },
  { id: '12711003', districtId: '127110', name: 'Bantan Timur', postalCode: '20224' },
  { id: '12711004', districtId: '127110', name: 'Indra Kasih', postalCode: '20221' },
  { id: '12711005', districtId: '127110', name: 'Sidorejo', postalCode: '20222' },
  { id: '12711006', districtId: '127110', name: 'Sidorejo Hilir', postalCode: '20222' },
  { id: '12711007', districtId: '127110', name: 'Tembung', postalCode: '20225' },

  // Medan Denai (127111)
  { id: '12711101', districtId: '127111', name: 'Denai', postalCode: '20227' },
  { id: '12711102', districtId: '127111', name: 'Medan Tenggara', postalCode: '20228' },
  { id: '12711103', districtId: '127111', name: 'Binjai', postalCode: '20228' },
  { id: '12711104', districtId: '127111', name: 'Tegal Sari Mandala I', postalCode: '20226' },
  { id: '12711105', districtId: '127111', name: 'Tegal Sari Mandala II', postalCode: '20226' },
  { id: '12711106', districtId: '127111', name: 'Tegal Sari Mandala III', postalCode: '20226' },

  // Percut Sei Tuan - Deli Serdang (120701)
  { id: '12070101', districtId: '120701', name: 'Bandar Khalipah', postalCode: '20371' },
  { id: '12070102', districtId: '120701', name: 'Kenangan', postalCode: '20371' },
  { id: '12070103', districtId: '120701', name: 'Kenangan Baru', postalCode: '20371' },
  { id: '12070104', districtId: '120701', name: 'Tembung', postalCode: '20371' },
  { id: '12070105', districtId: '120701', name: 'Sampali', postalCode: '20371' },
  { id: '12070106', districtId: '120701', name: 'Laut Dendang', postalCode: '20371' },
  { id: '12070107', districtId: '120701', name: 'Bandar Klippa', postalCode: '20371' },
  { id: '12070108', districtId: '120701', name: 'Bandar Setia', postalCode: '20371' },

  // Sunggal - Deli Serdang (120702)
  { id: '12070201', districtId: '120702', name: 'Sunggal Kanan', postalCode: '20351' },
  { id: '12070202', districtId: '120702', name: 'Sei Semayang', postalCode: '20351' },
  { id: '12070203', districtId: '120702', name: 'Mulyorejo', postalCode: '20351' },
  { id: '12070204', districtId: '120702', name: 'Puji Mulyo', postalCode: '20351' },
  { id: '12070205', districtId: '120702', name: 'Medan Krio', postalCode: '20351' },
  { id: '12070206', districtId: '120702', name: 'Sumber Melati Diski', postalCode: '20351' },

  // Lubuk Pakam (120703)
  { id: '12070301', districtId: '120703', name: 'Lubuk Pakam I / II', postalCode: '20511' },
  { id: '12070302', districtId: '120703', name: 'Lubuk Pakam Pekan', postalCode: '20512' },
  { id: '12070303', districtId: '120703', name: 'Paluh Kemiri', postalCode: '20513' },
  { id: '12070304', districtId: '120703', name: 'Petapahan', postalCode: '20514' },
  { id: '12070305', districtId: '120703', name: 'Syahmad', postalCode: '20516' },

  // Siantar Timur (127201)
  { id: '12720101', districtId: '127201', name: 'Pahlawan', postalCode: '21132' },
  { id: '12720102', districtId: '127201', name: 'Siopat Suhu', postalCode: '21136' },
  { id: '12720103', districtId: '127201', name: 'Tomuan', postalCode: '21137' },
  { id: '12720104', districtId: '127201', name: 'Kebun Sayur', postalCode: '21138' },
  { id: '12720105', districtId: '127201', name: 'Merdeka', postalCode: '21131' },

  // Binjai Kota (127501)
  { id: '12750101', districtId: '127501', name: 'Kartini', postalCode: '20714' },
  { id: '12750102', districtId: '127501', name: 'Pekan Binjai', postalCode: '20713' },
  { id: '12750103', districtId: '127501', name: 'Satria', postalCode: '20715' },
  { id: '12750104', districtId: '127501', name: 'Setia', postalCode: '20711' },
  { id: '12750105', districtId: '127501', name: 'Tangsi', postalCode: '20712' },

  // Berastagi - Karo (120602)
  { id: '12060201', districtId: '120602', name: 'Tambak Lau Mulgap I', postalCode: '22152' },
  { id: '12060202', districtId: '120602', name: 'Tambak Lau Mulgap II', postalCode: '22152' },
  { id: '12060203', districtId: '120602', name: 'Gundaling I', postalCode: '22153' },
  { id: '12060204', districtId: '120602', name: 'Gundaling II', postalCode: '22153' },
  { id: '12060205', districtId: '120602', name: 'Lau Gumba', postalCode: '22152' },

  // Balige - Toba (121201)
  { id: '12120101', districtId: '121201', name: 'Balige I', postalCode: '22311' },
  { id: '12120102', districtId: '121201', name: 'Balige II', postalCode: '22312' },
  { id: '12120103', districtId: '121201', name: 'Balige III', postalCode: '22313' },
  { id: '12120104', districtId: '121201', name: 'Sangkar Nihuta', postalCode: '22314' },
  { id: '12120105', districtId: '121201', name: 'Lumban Dolok Hauma', postalCode: '22315' },

  // Baiturrahman - Banda Aceh (117101)
  { id: '11710101', districtId: '117101', name: 'Kampung Baru', postalCode: '23242' },
  { id: '11710102', districtId: '117101', name: 'Ateuk Pahlawan', postalCode: '23241' },
  { id: '11710103', districtId: '117101', name: 'Ateuk Deah Tanoh', postalCode: '23241' },
  { id: '11710104', districtId: '117101', name: 'Neusu Aceh', postalCode: '23243' },
  { id: '11710105', districtId: '117101', name: 'Peuniti', postalCode: '23241' },

  // Gambir - Jakarta Pusat (317101)
  { id: '31710101', districtId: '317101', name: 'Gambir', postalCode: '10110' },
  { id: '31710102', districtId: '317101', name: 'Kebon Kelapa', postalCode: '10120' },
  { id: '31710103', districtId: '317101', name: 'Petojo Selatan', postalCode: '10130' },
  { id: '31710104', districtId: '317101', name: 'Duri Pulo', postalCode: '10140' },
  { id: '31710105', districtId: '317101', name: 'Petojo Utara', postalCode: '10150' },
  { id: '31710106', districtId: '317101', name: 'Cideng', postalCode: '10160' },

  // Coblong - Bandung (327301)
  { id: '32730101', districtId: '327301', name: 'Dago', postalCode: '40135' },
  { id: '32730102', districtId: '327301', name: 'Lebakgede', postalCode: '40132' },
  { id: '32730103', districtId: '327301', name: 'Lebaksiliwangi', postalCode: '40132' },
  { id: '32730104', districtId: '327301', name: 'Sadang Serang', postalCode: '40133' },
  { id: '32730105', districtId: '327301', name: 'Sekeloa', postalCode: '40134' },
  { id: '32730106', districtId: '327301', name: 'Cipaganti', postalCode: '40131' },

  // Gubeng - Surabaya (357801)
  { id: '35780101', districtId: '357801', name: 'Gubeng', postalCode: '60281' },
  { id: '35780102', districtId: '357801', name: 'Mojo', postalCode: '60285' },
  { id: '35780103', districtId: '357801', name: 'Airlangga', postalCode: '60286' },
  { id: '35780104', districtId: '357801', name: 'Kertajaya', postalCode: '60282' },
  { id: '35780105', districtId: '357801', name: 'Barata Jaya', postalCode: '60284' },
  { id: '35780106', districtId: '357801', name: 'Pucang Sewu', postalCode: '60283' },
];

// Helper functions
export function getProvinces(): Province[] {
  return PROVINCES;
}

export function getRegenciesByProvince(provinceNameOrId?: string): Regency[] {
  if (!provinceNameOrId) return REGENCIES;
  const p = PROVINCES.find(
    (prov) =>
      prov.id === provinceNameOrId ||
      prov.name.toUpperCase() === provinceNameOrId.toUpperCase()
  );
  if (!p) return REGENCIES;
  return REGENCIES.filter((r) => r.provinceId === p.id);
}

export function getDistrictsByRegency(regencyNameOrId?: string): District[] {
  if (!regencyNameOrId) return [];
  const r = REGENCIES.find(
    (reg) =>
      reg.id === regencyNameOrId ||
      reg.name.toUpperCase() === regencyNameOrId.toUpperCase() ||
      reg.name.replace(/^KOTA\s+|^KAB\.\s+|^KABUPATEN\s+/i, '').toUpperCase() ===
        regencyNameOrId.replace(/^KOTA\s+|^KAB\.\s+|^KABUPATEN\s+/i, '').toUpperCase()
  );
  if (!r) return [];
  return DISTRICTS.filter((d) => d.regencyId === r.id);
}

export function getVillagesByDistrict(districtNameOrId?: string): Village[] {
  if (!districtNameOrId) return [];
  const d = DISTRICTS.find(
    (dist) =>
      dist.id === districtNameOrId ||
      dist.name.toUpperCase() === districtNameOrId.toUpperCase()
  );
  if (!d) return [];
  return VILLAGES.filter((v) => v.districtId === d.id);
}

export function findPostalCode(villageName?: string, districtName?: string): string | undefined {
  if (!villageName && !districtName) return undefined;
  if (villageName) {
    const v = VILLAGES.find(
      (vil) => vil.name.toUpperCase() === villageName.toUpperCase()
    );
    if (v) return v.postalCode;
  }
  return undefined;
}
