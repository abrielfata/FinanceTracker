import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/axios';
import { formatRupiah } from '../utils/helpers';
import toast from 'react-hot-toast';

interface SavingGoal {
  id: string;
  nama: string;
  targetNominal: number;
  terkumpulNominal: number;
  targetBulan?: string;
  kategori: string;
  warna: string;
  ikon: string;
  catatan?: string;
  isCompleted: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Tabungan: '#2B6CB0',
  Darurat: '#C53030',
  Liburan: '#DD6B20',
  Kendaraan: '#319795',
  Gadget: '#805AD5',
  Investasi: '#22543D',
  Lainnya: '#4A5568',
};

const CATEGORY_ICONS: Record<string, string> = {
  Tabungan: 'savings',
  Darurat: 'health_and_safety',
  Liburan: 'flight_takeoff',
  Kendaraan: 'directions_car',
  Gadget: 'devices',
  Investasi: 'trending_up',
  Lainnya: 'star',
};

export default function SavingGoals() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [targetNominal, setTargetNominal] = useState('');
  const [terkumpulNominal, setTerkumpulNominal] = useState('');
  const [targetBulan, setTargetBulan] = useState('');
  const [kategori, setKategori] = useState('Tabungan');
  const [catatan, setCatatan] = useState('');

  // Modal State Deposit
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingGoal | null>(null);
  const [depositNominal, setDepositNominal] = useState('');

  // Confirm Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/saving-goals');
      setGoals(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memuat target tabungan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setNama('');
    setTargetNominal('');
    setTerkumpulNominal('');
    setTargetBulan('');
    setKategori('Tabungan');
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingGoal) => {
    setEditingId(goal.id);
    setNama(goal.nama);
    setTargetNominal(goal.targetNominal.toString());
    setTerkumpulNominal(goal.terkumpulNominal.toString());
    setTargetBulan(goal.targetBulan || '');
    setKategori(goal.kategori);
    setCatatan(goal.catatan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return toast.error('Nama impian tabungan wajib diisi');
    const target = Number(targetNominal);
    if (!target || target <= 0) return toast.error('Target nominal harus valid');

    const payload = {
      nama,
      targetNominal: target,
      terkumpulNominal: Number(terkumpulNominal) || 0,
      targetBulan: targetBulan || undefined,
      kategori,
      warna: CATEGORY_COLORS[kategori] || '#2B6CB0',
      ikon: CATEGORY_ICONS[kategori] || 'savings',
      catatan,
    };

    try {
      if (editingId) {
        await api.put(`/saving-goals/${editingId}`, payload);
        toast.success('Target tabungan berhasil diperbarui');
      } else {
        await api.post('/saving-goals', payload);
        toast.success('Target tabungan baru berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleOpenDeposit = (goal: SavingGoal) => {
    setDepositGoal(goal);
    setDepositNominal('');
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositNominal);
    if (!amount || amount <= 0) return toast.error('Nominal setoran harus valid');
    if (!depositGoal) return;

    try {
      await api.post(`/saving-goals/${depositGoal.id}/deposit`, { nominal: amount });
      toast.success(`Setoran sebesar ${formatRupiah(amount)} berhasil ditambahkan! 🎉`);
      setIsDepositModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan setoran');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/saving-goals/${deleteId}`);
      toast.success('Target tabungan berhasil dihapus');
      setDeleteId(null);
      fetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  // Kalkulasi Ringkasan
  const totalTarget = goals.reduce((acc, g) => acc + g.targetNominal, 0);
  const totalTerkumpul = goals.reduce((acc, g) => acc + g.terkumpulNominal, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalTerkumpul / totalTarget) * 100)) : 0;

  return (
    <>
      <Header
        title="Target Tabungan"
        subtitle="Rencanakan dan wujudkan impian finansial masa depan"
      />

      <main className="px-4 sm:px-6 md:px-xl py-6 max-w-[1280px] mx-auto space-y-6 animate-fade-in w-full">
        {/* Ringkasan Banner */}
        <div className="p-5 sm:p-6 md:p-8 rounded-3xl bg-premium-charcoal text-white shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-white/10">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              Total Progres Tabungan
            </span>
            <h2 className="text-3xl font-black font-headline tracking-tight">
              {formatRupiah(totalTerkumpul)}
              <span className="text-sm font-normal text-zinc-400 ml-2">dari {formatRupiah(totalTarget)}</span>
            </h2>
            <p className="text-xs text-zinc-300">
              Kamu sudah mengumpulkan <strong className="text-emerald-400">{overallPercentage}%</strong> dari seluruh rencana impianmu!
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="relative z-10 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Tambah Target Baru
          </button>
        </div>

        {/* List Saving Goals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-surface-container-low animate-pulse border border-premium-border" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-premium-border p-8">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">savings</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Belum Ada Target Tabungan</h3>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto mb-6">
              Mulai rencanakan tabungan liburan, dana darurat, atau gadget impianmu hari ini.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-premium-charcoal text-white font-medium text-sm hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Target Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.terkumpulNominal / goal.targetNominal) * 100));
              const isDone = percent >= 100;

              return (
                <div
                  key={goal.id}
                  className={`p-6 rounded-3xl bg-surface-container-lowest border transition-all duration-200 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                    isDone ? 'border-emerald-500/40' : 'border-premium-border hover:shadow-md'
                  }`}
                >
                  {/* Category Accent Stripe Top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: goal.warna || '#2B6CB0' }}
                  />

                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: goal.warna || '#2B6CB0' }}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {goal.ikon || 'savings'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">
                            {goal.kategori}
                          </span>
                          <h3 className="font-headline font-bold text-on-surface text-base mt-0.5 leading-snug">
                            {goal.nama}
                          </h3>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(goal.id)}
                          className="p-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Nominal */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-on-surface-variant">Terkumpul:</span>
                        <span className="text-xs text-on-surface-variant">Target: {formatRupiah(goal.targetNominal)}</span>
                      </div>
                      <p className="font-headline text-xl font-extrabold text-on-surface">
                        {formatRupiah(goal.terkumpulNominal)}
                      </p>
                    </div>

                    {/* Progress Bar Visual */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className={isDone ? 'text-emerald-600' : 'text-on-surface'}>
                          {isDone ? 'Target Tercapai! 🏆' : `${percent}% Tercapai`}
                        </span>
                        <span className="text-on-surface-variant">
                          Sisa: {formatRupiah(Math.max(0, goal.targetNominal - goal.terkumpulNominal))}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-surface-container-low overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {goal.catatan && (
                      <p className="text-xs text-on-surface-variant italic mb-4 line-clamp-2">
                        "{goal.catatan}"
                      </p>
                    )}
                  </div>

                  {/* Button Setor */}
                  <button
                    onClick={() => handleOpenDeposit(goal)}
                    className="w-full py-2.5 rounded-xl border border-premium-border hover:bg-surface-container-low text-on-surface font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">add_circle</span>
                    + Setor Uang Tabungan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL FORM TAMBAH / EDIT */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Nama Impian Tabungan *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Beli Laptop MacBook Pro"
              className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Target Nominal (Rp) *</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={targetNominal ? Number(targetNominal).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setTargetNominal(rawValue);
                }}
                placeholder="20.000.000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Saldo Awal (Opsional)</label>
              <input
                type="text"
                inputMode="numeric"
                value={terkumpulNominal ? Number(terkumpulNominal).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setTerkumpulNominal(rawValue);
                }}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Catatan / Alasan (Opsional)</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan kecil untuk memotivasi dirimu..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-premium-charcoal hover:bg-zinc-800 text-white text-xs font-bold shadow-sm"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL SETOR TABUNGAN */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title={`Setor Uang: ${depositGoal?.nama ?? ''}`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            Target saat ini: <strong>{formatRupiah(depositGoal?.targetNominal || 0)}</strong> (Sudah terkumpul {formatRupiah(depositGoal?.terkumpulNominal || 0)}).
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Nominal Setoran (Rp) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              autoFocus
              value={depositNominal ? Number(depositNominal).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setDepositNominal(rawValue);
              }}
              placeholder="Contoh: 100.000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-premium-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Simpan Setoran
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Target Tabungan"
        message="Apakah kamu yakin ingin menghapus impian tabungan ini? Data yang dihapus tidak dapat dipulihkan."
        confirmText="Hapus"
      />
    </>
  );
}
