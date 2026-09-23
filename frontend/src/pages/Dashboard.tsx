import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import api from '../lib/axios';
import { formatRupiah, getSiklusDateRange, KATEGORI_ICON } from '../utils/helpers';
import { Link } from 'react-router-dom';
import DateRangeFilter from '../components/ui/DateRangeFilter';
import Skeleton from '../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/useAuthStore';

interface DashboardSummary {
  bulan: number;
  tahun: number;
  saldo: number;
  pemasukan: number;
  pengeluaran: number;
  persenSaldo: number;
  tagihanTerdekat: Array<{
    id: string;
    nama: string;
    nominal: number;
    tanggalJatuhTempo: number;
    kategori: string;
    status: string;
    tagihanBulanId: string;
  }>;
  budgetSummary: Array<{
    id: string;
    kategori: string;
    nominal: number;
    terpakai: number;
  }>;
}

interface TrendItem {
  bulan: number;
  tahun: number;
  pemasukan: number;
  pengeluaran: number;
}

const BULAN_NAMA = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    return localStorage.getItem('fitrack:hide-balance') === 'true';
  });
  const { user } = useAuthStore();
  const siklusTgl = user?.siklusTgl || 26;

  const [startDate, setStartDate] = useState(() => getSiklusDateRange(siklusTgl).start);
  const [endDate, setEndDate] = useState(() => getSiklusDateRange(siklusTgl).end);

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, trendRes] = await Promise.all([
        api.get('/dashboard/summary', { params: { startDate, endDate } }),
        api.get('/dashboard/trend', { params: { startDate, endDate } })
      ]);
      setData(summaryRes.data);
      setTrendData(trendRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleMonthChange since DateRangeFilter handles changes directly

  if (isLoading || !data) {
    return (
      <>
        <Header title="Dashboard keuangan" />
        <main className="px-4 sm:px-6 md:px-xl pt-lg max-w-[1280px] mx-auto w-full min-w-0">
           <div className="flex flex-col sm:flex-row justify-between mb-lg gap-4">
             <Skeleton className="w-64 h-12 rounded-xl" />
             <Skeleton className="w-48 h-12 rounded-xl" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-lg">
             <Skeleton className="md:col-span-6 h-[200px] rounded-3xl" />
             <Skeleton className="md:col-span-3 h-[200px] rounded-3xl" />
             <Skeleton className="md:col-span-3 h-[200px] rounded-3xl" />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-lg">
             <Skeleton className="lg:col-span-7 h-[400px] rounded-3xl" />
             <Skeleton className="lg:col-span-5 h-[400px] rounded-3xl" />
           </div>
           <div>
             <Skeleton className="w-full h-[400px] rounded-3xl" />
           </div>
        </main>
      </>
    );
  }

  const toggleBalance = () => {
    const newState = !isBalanceHidden;
    setIsBalanceHidden(newState);
    localStorage.setItem('fitrack:hide-balance', String(newState));
  };

  const chartData = [...trendData].map(d => ({
    name: `${BULAN_NAMA[d.bulan - 1]} ${d.tahun.toString().slice(-2)}`,
    Pemasukan: d.pemasukan,
    Pengeluaran: d.pengeluaran,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest p-4 border border-premium-border shadow-premium rounded-xl">
          <p className="font-bold text-on-surface mb-2 border-b border-premium-border pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-body-sm text-on-surface-variant">{entry.name}</span>
              </div>
              <span className="font-bold text-body-sm text-on-surface" style={{ color: entry.color }}>
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header title="Dashboard keuangan" />
      <main className="px-4 sm:px-6 md:px-xl pt-lg pb-xxl max-w-[1280px] mx-auto animate-fade-in w-full min-w-0">
        
        {/* Month Selector & Add Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-4 relative z-20">
          <div className="flex flex-col gap-2">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
          <Link
            to="/transaksi"
            className="bg-premium-charcoal text-white px-5 py-3 rounded-2xl font-body font-medium flex items-center gap-2 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-90">add</span>
            <span>Tambah transaksi</span>
          </Link>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-gutter mb-6 md:mb-lg relative z-10">
          {/* Main Balance Card */}
          <div className="col-span-2 md:col-span-6 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px] md:h-[220px] border border-white/10 group">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <span className="material-symbols-outlined text-white/90 text-[20px]">nfc</span>
                </div>
                <div>
                  <h2 className="font-body text-[10px] text-white/50 tracking-[0.2em] font-semibold uppercase mb-0.5">
                    Total Saldo Aktif
                  </h2>
                  <p className="font-mono text-xs text-white/70 tracking-wider">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}
                  </p>
                </div>
              </div>
              <button 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-all backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95"
                onClick={toggleBalance}
                title={isBalanceHidden ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isBalanceHidden ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            
            <div className="relative z-10 mt-8 mb-2">
              <p className={`font-headline font-bold mb-4 tracking-tight drop-shadow-md transition-all duration-300 ${isBalanceHidden ? 'text-4xl md:text-5xl text-white/40' : 'text-4xl md:text-5xl text-white'}`}>
                {isBalanceHidden ? 'Rp •••••••••' : formatRupiah(data.saldo)}
              </p>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                  <span className={`inline-flex items-center gap-1 font-bold text-xs ${data.persenSaldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {data.persenSaldo >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {Math.abs(data.persenSaldo)}%
                  </span>
                  <span className="font-body text-[11px] text-white/60">Bulan ini</span>
                </div>
                
                {/* Visual Debit Card Brand */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 font-semibold tracking-widest uppercase">FiTrack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className="col-span-1 md:col-span-3 bg-surface-container-lowest rounded-3xl p-4 md:p-lg border border-premium-border shadow-premium flex flex-col justify-between min-h-[140px] md:h-[200px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">south_west</span>
              </div>
            </div>
            <div>
              <p className="font-body text-body-sm text-on-surface-variant mb-1">Pemasukan</p>
              <p className="font-headline text-lg md:text-headline-md text-on-surface truncate">{formatRupiah(data.pemasukan)}</p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="col-span-1 md:col-span-3 bg-surface-container-lowest rounded-3xl p-4 md:p-lg border border-premium-border shadow-premium flex flex-col justify-between min-h-[140px] md:h-[200px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">north_east</span>
              </div>
            </div>
            <div>
              <p className="font-body text-body-sm text-on-surface-variant mb-1">Pengeluaran</p>
              <p className="font-headline text-lg md:text-headline-md text-on-surface truncate">{formatRupiah(data.pengeluaran)}</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
          
          {/* Bills Column */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-lg border border-premium-border shadow-premium h-full min-h-[300px] md:min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline text-headline-sm text-on-surface">Tagihan terdekat</h3>
                  <p className="font-body text-body-sm text-on-surface-variant">Jangan sampai terlewat.</p>
                </div>
                <Link to="/tagihan" className="text-body-sm font-bold text-on-surface hover:text-primary transition-colors">
                  Lihat semua
                </Link>
              </div>

              {data.tagihanTerdekat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-on-surface-variant">
                  <p className="text-body-sm">Tidak ada tagihan terdekat.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.tagihanTerdekat.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-2xl hover:border-premium-border hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface">
                          <span className="material-symbols-outlined">{KATEGORI_ICON[t.kategori] || 'receipt_long'}</span>
                        </div>
                        <div>
                          <h4 className="font-body text-body-md font-bold text-on-surface">{t.nama}</h4>
                          <p className="font-body text-body-sm text-on-surface-variant">Jatuh tempo tgl {t.tanggalJatuhTempo}</p>
                        </div>
                      </div>
                      <p className="font-body text-body-md font-bold text-on-surface">{formatRupiah(t.nominal)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget Column */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-lg border border-premium-border shadow-premium h-full min-h-[300px] md:min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline text-headline-sm text-on-surface">Budget bulan ini</h3>
                  <p className="font-body text-body-sm text-on-surface-variant">Ringkasan pengeluaranmu.</p>
                </div>
              </div>

              {data.budgetSummary.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-on-surface-variant">
                  <p className="text-body-sm mb-4">Belum ada budget yang diatur.</p>
                  <Link to="/budget" className="px-6 py-2 border border-premium-border rounded-xl font-bold text-body-sm text-on-surface hover:bg-surface-container transition-colors">
                    Kelola budget
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.budgetSummary.map((b) => {
                    const persen = b.nominal > 0 ? (b.terpakai / b.nominal) * 100 : 0;
                    let color = 'bg-primary';
                    if (persen >= 100) color = 'bg-error';
                    else if (persen >= 75) color = 'bg-orange-500';

                    return (
                      <div key={b.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-body text-body-sm font-bold text-on-surface">{b.kategori}</span>
                          <span className="font-body text-xs text-on-surface-variant">
                            {formatRupiah(b.terpakai)} / {formatRupiah(b.nominal)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${Math.min(persen, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t border-premium-border mt-4">
                     <Link to="/budget" className="w-full block text-center py-3 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl font-bold text-body-sm text-on-surface">
                       Kelola Semua Budget
                     </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Tren Chart */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-lg border border-premium-border shadow-premium mt-lg">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="font-headline text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">bar_chart</span>
                Tren 6 Bulan Terakhir
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Perbandingan Pemasukan dan Pengeluaran bulanan.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-on-surface-variant">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold text-on-surface-variant">Pengeluaran</span>
              </div>
            </div>
          </div>

          <div className="h-[380px] w-full">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">trending_down</span>
                <p className="text-on-surface-variant">Belum ada data untuk ditampilkan.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="none"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `Rp ${(value / 1000).toLocaleString('id-ID')}k`}
                    width={85}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="Pemasukan" 
                    fill="#10B981" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={45} 
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="Pengeluaran" 
                    fill="#F43F5E" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={45} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
