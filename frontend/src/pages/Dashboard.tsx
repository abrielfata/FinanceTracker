import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import api from '../lib/axios';
import { formatRupiah, getSiklusDateRange, KATEGORI_ICON } from '../utils/helpers';
import { Link } from 'react-router-dom';
import DateRangeFilter from '../components/ui/DateRangeFilter';
import Skeleton from '../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
        <main className="px-xl pt-lg max-w-[1280px] mx-auto">
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
      <main className="px-xl pt-lg pb-xxl max-w-[1280px] mx-auto animate-fade-in">
        
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
            className="bg-premium-charcoal text-white px-5 py-3 rounded-xl font-body font-medium flex items-center gap-2 hover:bg-premium-charcoal/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah transaksi
          </Link>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-gutter mb-6 md:mb-lg relative z-10">
          {/* Main Balance Card */}
          <div className="col-span-2 md:col-span-6 bg-premium-charcoal rounded-3xl p-6 md:p-lg text-white shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[140px] md:h-[200px]">
            <div className="flex justify-between items-start">
              <h2 className="font-body text-body-sm text-white/80">Saldo saat ini</h2>
              <span className="material-symbols-outlined text-white/60">account_balance_wallet</span>
            </div>
            <div>
              <p className="font-headline text-headline-xl font-bold mb-4">{formatRupiah(data.saldo)}</p>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg font-body text-body-sm ${data.persenSaldo >= 0 ? 'text-white' : 'text-error-container'}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {data.persenSaldo >= 0 ? 'arrow_outward' : 'south_west'}
                  </span>
                  {Math.abs(data.persenSaldo)}%
                </span>
                <span className="font-body text-body-sm text-white/70">dari bulan lalu</span>
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
          <div className="mb-8">
            <h3 className="font-headline text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">bar_chart</span>
              Tren 6 Bulan Terakhir
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">Perbandingan Pemasukan dan Pengeluaran.</p>
          </div>

          <div className="h-[400px] w-full">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">trending_down</span>
                <p className="text-on-surface-variant">Belum ada data untuk ditampilkan.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="none"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar yAxisId="left" dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar yAxisId="left" dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
