import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KATEGORI_LIST } from '../../utils/helpers';

const budgetSchema = z.object({
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020).max(2100),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  initialData?: Partial<BudgetFormData>;
  onSubmit: (data: BudgetFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  usedCategories?: string[]; // Array of categories already budgeted this month
}

export default function BudgetForm({ initialData, onSubmit, isLoading, onCancel, usedCategories = [] }: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      kategori: initialData?.kategori || '',
      nominal: initialData?.nominal || undefined,
      bulan: initialData?.bulan || new Date().getMonth() + 1,
      tahun: initialData?.tahun || new Date().getFullYear(),
    },
  });

  // Filter out categories that are already used, EXCEPT the one we are editing
  const availableCategories = KATEGORI_LIST.filter(
    (cat) => !usedCategories.includes(cat) || cat === initialData?.kategori
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Kategori */}
      <div>
        <label htmlFor="kategori" className="block text-sm font-medium text-on-surface-variant mb-1">
          Kategori Pengeluaran
        </label>
        <select
          {...register('kategori')}
          id="kategori"
          disabled={!!initialData?.kategori} // Disallow changing category when editing
          className="block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors appearance-none cursor-pointer disabled:bg-surface-container-low disabled:cursor-not-allowed"
        >
          <option value="" disabled>Pilih Kategori</option>
          {availableCategories.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        {errors.kategori && <p className="mt-1 text-sm text-error">{errors.kategori.message}</p>}
        {availableCategories.length === 0 && !initialData?.kategori && (
          <p className="mt-1 text-xs text-on-surface-variant">Semua kategori sudah dianggarkan bulan ini.</p>
        )}
      </div>

      {/* Nominal */}
      <div>
        <label htmlFor="nominal" className="block text-sm font-medium text-on-surface-variant mb-1">
          Nominal Target (Rp)
        </label>
        <input
          {...register('nominal', { valueAsNumber: true })}
          type="number"
          id="nominal"
          className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary text-headline-md font-bold bg-white transition-colors"
          placeholder="0"
        />
        {errors.nominal && <p className="mt-1 text-sm text-error">{errors.nominal.message}</p>}
      </div>

      {/* Hidden Fields for Bulan & Tahun */}
      <input type="hidden" {...register('bulan', { valueAsNumber: true })} />
      <input type="hidden" {...register('tahun', { valueAsNumber: true })} />

      {/* Actions */}
      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 px-4 border border-outline-variant rounded-xl text-body-md font-bold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading || (availableCategories.length === 0 && !initialData?.kategori)}
          className="flex-1 py-3 px-4 rounded-xl text-body-md font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
