import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Building2, Users, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { RoomPlot } from '../../types/asrama';

interface AnalyticsProps {
  rooms?: RoomPlot[];
}

export const AdminAnalyticsDashboard: React.FC<AnalyticsProps> = ({ rooms = [] }) => {
  // Mock Data Generators for Analytics if rooms not provided or to augment missing data
  
  // 1. Occupancy Data
  const occupancyData = [
    { name: 'Terisi', value: 850, color: '#10b981' },
    { name: 'Tersedia', value: 120, color: '#3b82f6' },
    { name: 'Maintenance', value: 30, color: '#f59e0b' }
  ];

  // 2. Payment Status Distribution (Skenario Lunas vs Cicilan)
  const paymentData = [
    { name: 'Lunas 100%', value: 650, color: '#10b981' },
    { name: 'Cicilan Lancar', value: 200, color: '#3b82f6' },
    { name: 'Cicilan Menunggak', value: 45, color: '#ef4444' },
    { name: 'Belum Bayar (Staging)', value: 105, color: '#94a3b8' }
  ];

  // 3. Room Availability Trends by Building (Dynamic if rooms provided, else mock)
  const buildingData = rooms.length > 0 
    ? rooms.map(r => ({
        name: r.gedung,
        Kapasitas: r.kapasitas,
        Terisi: r.terisi,
        Tersedia: r.kapasitas - r.terisi
      }))
    : [
        { name: 'Gedung A (Enggang)', Kapasitas: 250, Terisi: 240, Tersedia: 10 },
        { name: 'Gedung B (Hiu)', Kapasitas: 250, Terisi: 235, Tersedia: 15 },
        { name: 'Gedung C (Bekantan)', Kapasitas: 250, Terisi: 210, Tersedia: 40 },
        { name: 'Gedung D (Pesut)', Kapasitas: 250, Terisi: 165, Tersedia: 85 },
      ];

  // 4. Monthly Trend (Trend Okupansi 6 Bulan Terakhir)
  const monthlyTrendData = [
    { name: 'Jan', Okupansi: 80 },
    { name: 'Feb', Okupansi: 82 },
    { name: 'Mar', Okupansi: 85 },
    { name: 'Apr', Okupansi: 86 },
    { name: 'Mei', Okupansi: 90 },
    { name: 'Jun', Okupansi: 88 },
    { name: 'Jul', Okupansi: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Summary Cards */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Penghuni</p>
              <h4 className="text-2xl font-black text-slate-800">850</h4>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+12% dari semester lalu</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tingkat Okupansi</p>
              <h4 className="text-2xl font-black text-slate-800">85%</h4>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
            <span>Kapasitas Total: 1000 bed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pendapatan Teralisasi</p>
              <h4 className="text-2xl font-black text-slate-800">85%</h4>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
            <span>Berdasarkan tagihan aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Penunggak (NPL)</p>
              <h4 className="text-2xl font-black text-red-600">45</h4>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-red-500 font-medium">
            <span>Dalam pemantauan toleransi/deposit</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Room Availability by Building */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Okupansi per Gedung</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Terisi" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Tersedia" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Status Pembayaran (Skenario)</h3>
          <div className="h-80 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`${value} Mahasiswa`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label for Donut Chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">1000</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Occupancy Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Okupansi Asrama (7 Bulan Terakhir)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOkupansi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip 
                  formatter={(value: any) => [`${value}%`, 'Tingkat Okupansi']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Okupansi" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOkupansi)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
