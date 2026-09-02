import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';
import MonthSelector from '../components/ui/MonthSelector';
import TagihanForm, { type TagihanFormData } from '../components/tagihan/TagihanForm';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { formatRupiah, KATEGORI_ICON, KATEGORI_COLOR, hariMenujuJatuhTempo } from '../utils/helpers';

interface TagihanItem {
  id: string;
  nama: string;
  nominal: number;
  tanggalJatuhTempo: number;
  kategori: string;
  catatan: string | null;
  isBerulang: boolean;
  createdAt: string;
  statusBulanIni: string | null;
  tanggalBayar: string | null;
  tagihanBulanId: string | null;
}

export default function Tagihan() {
  const [tagihanList, setTagihanList] = useState<TagihanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<TagihanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTagihan();
  }, [bulan, tahun]);

  const fetchTagihan = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tagihan', { params: { bulan, tahun } });
      setTagihanList(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data tagihan');
      console.error('Failed to fetch tagihan', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TagihanItem) => {
    setEditingData(t);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/tagihan/${deleteId}`);
      toast.success('Tagihan berhasil dihapus');
      fetchTagihan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus tagihan');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmitForm = async (data: TagihanFormData) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await api.put(`/tagihan/${editingData.id}`, data);
        toast.success('Tagihan berhasil diperbarui');
      } else {
        await api.post('/tagihan', data);
        toast.success('Tagihan berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchTagihan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan tagihan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (t: TagihanItem) => {
    // Jika belum ada tagihanBulanId untuk bulan ini, kita belum punya API auto-create on demand dari frontend
    // Namun untuk MVP, asumsikan saat dibuat, bulan berjalan otomatis tergenerate.
    if (!t.tagihanBulanId) {
      alert('Sistem belum menghasilkan riwayat bulan ini. Silakan kembali bulan depan atau buat ulang tagihan.');
      return;
    }

    try {
      if (t.statusBulanIni === 'lunas') {
        await api.patch(`/tagihan/bulan/${t.tagihanBulanId}/batal`);
        toast.success('Status tagihan dibatalkan');
      } else {
        await api.patch(`/tagihan/bulan/${t.tagihanBulanId}/bayar`);
        toast.success('Tagihan berhasil dilunasi');
      }
      fetchTagihan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status tagihan');
    }
  };

  return (
    <>
      <Header title="Tagihan Rutin" />
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
            Tambah Pengingat
          </button>
        </div>

        {/* List */}
        <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-lg border border-premium-border shadow-premium min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-5 border border-premium-border rounded-2xl">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/2 h-5" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                  <Skeleton className="w-24 h-8 rounded-xl self-center" />
                </div>
              ))}
            </div>
          ) : tagihanList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-3xl">event_upcoming</span>
              </div>
              <h3 className="font-headline text-headline-md text-on-surface mb-2">Belum ada tagihan rutin</h3>
              <p className="text-body-sm text-on-surface-variant max-w-[300px]">
                Buat pengingat tagihan bulananmu agar tidak pernah telat bayar lagi.
              </p>
              <button onClick={handleOpenAdd} className="mt-6 text-primary font-bold text-body-sm hover:underline">
                Buat sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {tagihanList.map((t) => {
                const sisaHari = hariMenujuJatuhTempo(t.tanggalJatuhTempo);
                const isLunas = t.statusBulanIni === 'lunas';
                
                let sisaStatus = <span className="text-primary-container bg-primary-fixed px-2 py-1 rounded-lg text-xs font-bold">{sisaHari} hari lagi</span>;
                if (sisaHari === 0) sisaStatus = <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded-lg text-xs font-bold">Hari ini!</span>;
                if (sisaHari > 15) sisaStatus = <span className="text-on-surface-variant bg-surface-variant px-2 py-1 rounded-lg text-xs font-bold">{sisaHari} hari lagi</span>;
                
                // If past due this month and not paid (Assuming hariMenujuJatuhTempo wraps to next month if past due, wait, yes my helper does wrap it. 
                // We'll just rely on the helper for simplicity).

                return (
                  <div 
                    key={t.id} 
                    className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-2xl transition-all gap-4 ${isLunas ? 'border-primary/30 bg-primary-fixed/10 opacity-75' : 'border-premium-border hover:border-premium-border hover:shadow-sm hover:bg-surface-container-lowest/50'}`}
                  >
                    <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLunas ? 'bg-primary text-white' : KATEGORI_COLOR[t.kategori] || KATEGORI_COLOR['Lainnya']}`}>
                        <span className="material-symbols-outlined">{isLunas ? 'check_circle' : (KATEGORI_ICON[t.kategori] || 'receipt')}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-body text-body-md font-bold truncate ${isLunas ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                            {t.nama}
                          </h4>
                          {!isLunas && sisaStatus}
                        </div>
                        <p className="font-body text-body-sm text-on-surface-variant">
                          Tgl {t.tanggalJatuhTempo} • {formatRupiah(t.nominal)}
                        </p>
                        {t.catatan && (
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{t.catatan}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 mt-2 sm:mt-0">
                      
                      {/* Edit/Delete Actions (visible on hover or always on mobile via opacity) */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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

                      {/* Pay Button */}
                      <button
                        onClick={() => handleToggleStatus(t)}
                        disabled={!t.tagihanBulanId}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                          isLunas 
                            ? 'bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface'
                            : 'bg-primary text-white hover:bg-primary-container shadow-sm'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLunas ? 'Batal Lunas' : 'Tandai Lunas'}
                      </button>
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
        title={editingData ? 'Edit Tagihan' : 'Buat Pengingat Tagihan'}
      >
        <TagihanForm
          initialData={editingData || undefined}
          onSubmit={handleSubmitForm}
          isLoading={isSubmitting}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Tagihan"
        message="Yakin ingin menghapus tagihan ini? Seluruh riwayat pembayaran tagihan ini juga akan ikut terhapus secara permanen."
      />
    </>
  );
}
