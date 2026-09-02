import { useState, useEffect, useMemo } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';
import MonthSelector from '../components/ui/MonthSelector';
import DropdownFilter from '../components/ui/DropdownFilter';
import TransaksiForm, { type TransaksiFormData } from '../components/transaksi/TransaksiForm';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { formatRupiah, KATEGORI_ICON, KATEGORI_COLOR, formatTanggal, exportToExcel } from '../utils/helpers';

interface TransaksiItem {
  id: string;
  jenis: 'pemasukan' | 'pengeluaran';
  nominal: number;
  kategori: string;
  deskripsi: string | null;
  tanggal: string;
}

type SortOption = 'terbaru' | 'terlama' | 'terbesar' | 'terkecil';

export default function Transaksi() {
  const [transaksiList, setTransaksiList] = useState<TransaksiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Search
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const calculateDateRange = (bulan: number, tahun: number) => {
    let startM = bulan - 1;
    let startY = tahun;
    if (startM === 0) {
      startM = 12;
      startY -= 1;
    }
    const start = `${startY}-${String(startM).padStart(2, '0')}-25`;
    const end = `${tahun}-${String(bulan).padStart(2, '0')}-24`;
    return { start, end };
  };

  const [startDate, setStartDate] = useState(() => calculateDateRange(bulan, tahun).start);
  const [endDate, setEndDate] = useState(() => calculateDateRange(bulan, tahun).end);

  const [jenisFilter, setJenisFilter] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('terbaru');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<TransaksiItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchTransaksi(1, true);
  }, [bulan, tahun, startDate, endDate, jenisFilter]);

  const fetchTransaksi = async (targetPage: number = 1, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    
    try {
      const params: any = { bulan, tahun, startDate, endDate, page: targetPage, limit: 15 };
      if (jenisFilter !== 'semua') params.jenis = jenisFilter;
      
      const res = await api.get('/transaksi', { params });
      
      if (reset) {
        setTransaksiList(res.data.data);
      } else {
        setTransaksiList(prev => [...prev, ...res.data.data]);
      }
      
      setHasMore(targetPage < res.data.meta.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data transaksi');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransaksi(nextPage, false);
  };

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TransaksiItem) => {
    setEditingData(t);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/transaksi/${deleteId}`);
      toast.success('Transaksi berhasil dihapus');
      // Set page to 1 and refetch
      setPage(1);
      fetchTransaksi(1, true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus transaksi');
    }
  };

  const handleSubmitForm = async (data: TransaksiFormData) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await api.put(`/transaksi/${editingData.id}`, data);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await api.post('/transaksi', data);
        toast.success('Transaksi berhasil ditambahkan');
      }
      const newDate = new Date(data.tanggal);
      const newBulan = newDate.getMonth() + 1;
      const newTahun = newDate.getFullYear();
      
      setIsModalOpen(false);

      if (newBulan !== bulan || newTahun !== tahun) {
        setBulan(newBulan);
        setTahun(newTahun);
        const range = calculateDateRange(newBulan, newTahun);
        setStartDate(range.start);
        setEndDate(range.end);
        // useEffect will trigger fetchTransaksi automatically
      } else {
        setPage(1);
        fetchTransaksi(1, true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await api.get('/dashboard/export');
      await exportToExcel(res.data, `Fitrack_All_Data_${bulan}_${tahun}`);
      toast.success('Seluruh data berhasil diunduh ke Excel');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Process data based on search and sort
  const processedData = useMemo(() => {
    let data = [...transaksiList];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(t => 
        t.kategori.toLowerCase().includes(query) || 
        (t.deskripsi && t.deskripsi.toLowerCase().includes(query))
      );
    }

    data.sort((a, b) => {
      switch (sortOrder) {
        case 'terbaru': return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
        case 'terlama': return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
        case 'terbesar': return b.nominal - a.nominal;
        case 'terkecil': return a.nominal - b.nominal;
        default: return 0;
      }
    });

    return data;
  }, [transaksiList, searchQuery, sortOrder]);

  // Group by date for UI if sorting by date (terbaru/terlama)
  const isSortedByDate = sortOrder === 'terbaru' || sortOrder === 'terlama';
  
  const groupedTransaksi = useMemo(() => {
    if (!isSortedByDate) return { 'Semua': processedData };
    return processedData.reduce((acc, t) => {
      if (!acc[t.tanggal]) acc[t.tanggal] = [];
      acc[t.tanggal].push(t);
      return acc;
    }, {} as Record<string, TransaksiItem[]>);
  }, [processedData, isSortedByDate]);

  const groupKeys = isSortedByDate
    ? Object.keys(groupedTransaksi).sort((a, b) => 
        sortOrder === 'terbaru' 
          ? new Date(b).getTime() - new Date(a).getTime()
          : new Date(a).getTime() - new Date(b).getTime()
      )
    : ['Semua'];

  return (
    <>
      <Header title="Riwayat Transaksi" />
      <main className="px-xl pt-lg pb-xxl max-w-[1280px] mx-auto animate-fade-in">
        
        {/* Actions & Filters */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-lg gap-4 relative z-20">
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <MonthSelector 
                selectedBulan={bulan}
                selectedTahun={tahun}
                onChange={(b, t) => { 
                  setBulan(b); 
                  setTahun(t); 
                  const range = calculateDateRange(b, t);
                  setStartDate(range.start);
                  setEndDate(range.end);
                }}
              />
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-white px-3 py-2 rounded-xl border border-outline-variant shadow-sm h-11">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-on-surface font-medium"
                />
                <span className="text-outline-variant">/</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-on-surface font-medium"
                />
              </div>
            </div>
            
            <div className="h-6 w-[1px] bg-premium-border hidden sm:block"></div>

            <DropdownFilter
              value={jenisFilter}
              onChange={(val) => setJenisFilter(val as any)}
              options={[
                { value: 'semua', label: 'Semua Jenis' },
                { value: 'pengeluaran', label: 'Pengeluaran' },
                { value: 'pemasukan', label: 'Pemasukan' },
              ]}
            />
            
            <DropdownFilter
              value={sortOrder}
              onChange={(val) => setSortOrder(val as SortOption)}
              options={[
                { value: 'terbaru', label: 'Terbaru' },
                { value: 'terlama', label: 'Terlama' },
                { value: 'terbesar', label: 'Terbesar' },
                { value: 'terkecil', label: 'Terkecil' },
              ]}
            />

            <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-body-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors bg-white text-on-surface"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full xl:w-auto mt-4 xl:mt-0">
            <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-body-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-rounded text-[20px]">download</span>
            {isExporting ? 'Mengekspor...' : 'Export Semua Data'}
          </button>
            <button
              onClick={handleOpenAdd}
              className="bg-premium-charcoal flex-1 xl:flex-none text-white px-5 py-2.5 rounded-xl font-body text-body-sm font-medium flex items-center justify-center gap-2 hover:bg-premium-charcoal/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tambah
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-lg border border-premium-border shadow-premium min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="w-40 h-6 mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-premium-border rounded-2xl">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/3 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                  <Skeleton className="w-24 h-6 self-center" />
                </div>
              ))}
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <h3 className="font-headline text-headline-md text-on-surface mb-2">Data tidak ditemukan</h3>
              <p className="text-body-sm text-on-surface-variant max-w-[300px]">
                {searchQuery ? 'Coba ubah kata kunci pencarianmu.' : 'Catat pengeluaran dan pemasukan kamu bulan ini.'}
              </p>
              {!searchQuery && (
                <button onClick={handleOpenAdd} className="mt-6 text-primary font-bold text-body-sm hover:underline">
                  Tambah sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {groupKeys.map((key) => (
                <div key={key}>
                  {isSortedByDate && (
                    <h3 className="font-body text-body-sm font-bold text-on-surface-variant mb-4 border-b border-premium-border pb-2">
                      {formatTanggal(key)}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {groupedTransaksi[key].map((t) => (
                      <div 
                        key={t.id} 
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-transparent hover:border-premium-border hover:bg-surface-container-lowest/50 hover:shadow-sm rounded-2xl transition-all gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${KATEGORI_COLOR[t.kategori] || KATEGORI_COLOR['Lainnya']}`}>
                            <span className="material-symbols-outlined">{KATEGORI_ICON[t.kategori] || 'category'}</span>
                          </div>
                          <div>
                            <p className="font-body text-body-md font-bold text-on-surface leading-tight mb-1">{t.kategori}</p>
                            <div className="flex items-center gap-2">
                              {t.deskripsi && (
                                <p className="font-body text-body-sm text-on-surface-variant truncate max-w-[150px] sm:max-w-[300px]">{t.deskripsi}</p>
                              )}
                              {!isSortedByDate && (
                                <span className="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-md">
                                  {formatTanggal(t.tanggal)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-[250px]">
                          <p className={`font-body text-body-md font-bold ${t.jenis === 'pemasukan' ? 'text-primary' : 'text-on-surface'}`}>
                            {t.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(t.nominal)}
                          </p>
                          
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEdit(t)}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button 
                              onClick={() => setDeleteId(t.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-6 pb-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface-variant font-medium rounded-full transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isFetchingMore ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Memuat...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">expand_more</span>
                        Muat Lebih Banyak
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingData ? 'Edit Transaksi' : 'Tambah Transaksi'}
      >
        <TransaksiForm
          initialData={editingData ? { ...editingData, deskripsi: editingData.deskripsi ?? undefined } : undefined}
          onSubmit={handleSubmitForm}
          isLoading={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message="Yakin ingin menghapus transaksi ini? Data yang sudah dihapus tidak bisa dikembalikan."
      />
    </>
  );
}
