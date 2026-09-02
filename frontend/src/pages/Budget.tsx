import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';
import MonthSelector from '../components/ui/MonthSelector';
import BudgetForm, { type BudgetFormData } from '../components/budget/BudgetForm';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { formatRupiah, KATEGORI_ICON, KATEGORI_COLOR, getBudgetPersen } from '../utils/helpers';

interface BudgetItem {
  id: string;
  userId: string;
  kategori: string;
  nominal: number;
  bulan: number;
  tahun: number;
  createdAt: string;
  terpakai: number;
}

export default function Budget() {
  const [budgetList, setBudgetList] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<BudgetItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBudget();
  }, [bulan, tahun]);

  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/budget', { params: { bulan, tahun } });
      setBudgetList(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data budget');
      console.error('Failed to fetch budget', error);
    } finally {
      setIsLoading(false);
    }
  };

  const usedCategories = budgetList.map((b) => b.kategori);

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BudgetItem) => {
    setEditingData(b);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/budget/${deleteId}`);
      toast.success('Budget berhasil dihapus');
      fetchBudget();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus budget');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmitForm = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await api.put(`/budget/${editingData.id}`, { nominal: data.nominal });
        toast.success('Budget berhasil diperbarui');
      } else {
        await api.post('/budget', data);
        toast.success('Budget berhasil ditambahkan');
      }
      setIsModalOpen(false);

      if (data.bulan !== bulan || data.tahun !== tahun) {
        setBulan(data.bulan);
        setTahun(data.tahun);
      } else {
        fetchBudget();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Budget Bulanan" />
      <main className="px-xl pt-lg pb-xxl max-w-[1280px] mx-auto animate-fade-in">
        
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-4 relative z-20">
          <div className="flex flex-wrap items-center gap-4">
            <MonthSelector 
              selectedBulan={bulan}
              selectedTahun={tahun}
              onChange={(b, t) => { setBulan(b); setTahun(t); }}
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-premium-charcoal text-white px-5 py-2.5 rounded-xl font-body text-body-sm font-medium flex items-center gap-2 hover:bg-premium-charcoal/90 transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Atur Budget
          </button>
        </div>

        {/* List */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-lg border border-premium-border shadow-premium min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-5 border border-premium-border rounded-2xl">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="w-1/4 h-5" />
                      <Skeleton className="w-1/4 h-5" />
                    </div>
                    <Skeleton className="w-full h-3 rounded-full" />
                    <Skeleton className="w-1/3 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : budgetList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
              <h3 className="font-headline text-headline-md text-on-surface mb-2">Belum ada budget</h3>
              <p className="text-body-sm text-on-surface-variant max-w-[300px]">
                Buat batasan pengeluaran tiap kategori agar keuanganmu lebih terkontrol.
              </p>
              <button onClick={handleOpenAdd} className="mt-6 text-primary font-bold text-body-sm hover:underline">
                Atur sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {budgetList.map((b) => {
                const persen = getBudgetPersen(b.terpakai, b.nominal);
                let progressColor = 'bg-primary';
                if (persen >= 100) progressColor = 'bg-error';
                else if (persen >= 75) progressColor = 'bg-orange-500';

                return (
                  <div 
                    key={b.id} 
                    className="group border border-premium-border rounded-2xl p-5 hover:border-premium-border hover:shadow-sm hover:bg-surface-container-lowest/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${KATEGORI_COLOR[b.kategori] || KATEGORI_COLOR['Lainnya']}`}>
                            <span className="material-symbols-outlined text-[20px]">{KATEGORI_ICON[b.kategori] || 'category'}</span>
                          </div>
                          <h4 className="font-body text-body-md font-bold text-on-surface">{b.kategori}</h4>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(b)}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => setDeleteId(b.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <p className="font-body text-body-sm text-on-surface-variant">Terpakai</p>
                        <p className="font-body text-body-md font-bold text-on-surface">{formatRupiah(b.terpakai)}</p>
                      </div>
                      <div className="flex justify-between items-end mb-3">
                        <p className="font-body text-body-sm text-on-surface-variant">Dari total target</p>
                        <p className="font-body text-body-md font-bold text-on-surface-variant">{formatRupiah(b.nominal)}</p>
                      </div>

                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`} 
                          style={{ width: `${persen}%` }}
                        />
                      </div>
                      <div className="mt-2 text-right">
                        <span className={`text-xs font-bold ${persen >= 100 ? 'text-error' : persen >= 75 ? 'text-orange-500' : 'text-primary'}`}>
                          {persen}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingData ? 'Edit Budget' : 'Atur Budget'}
      >
        <BudgetForm
          initialData={{
            ...editingData,
            bulan,
            tahun,
          } as any}
          onSubmit={handleSubmitForm}
          isLoading={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
          usedCategories={usedCategories}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Budget"
        message="Yakin ingin menghapus budget ini? Semua riwayat pengeluaran yang terikat tetap aman."
      />
    </>
  );
}
