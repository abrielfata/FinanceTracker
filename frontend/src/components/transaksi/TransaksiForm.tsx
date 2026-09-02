import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KATEGORI_PENGELUARAN, KATEGORI_PEMASUKAN } from '../../utils/helpers';

const transaksiSchema = z.object({
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  deskripsi: z.string().optional(),
});

export type TransaksiFormData = z.infer<typeof transaksiSchema>;

interface TransaksiFormProps {
  initialData?: Partial<TransaksiFormData>;
  onSubmit: (data: TransaksiFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function TransaksiForm({ initialData, onSubmit, isLoading, onCancel }: TransaksiFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransaksiFormData>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      jenis: initialData?.jenis || 'pengeluaran',
      nominal: initialData?.nominal || undefined,
      kategori: initialData?.kategori || '',
      tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
      deskripsi: initialData?.deskripsi || '',
    },
  });

  const jenis = watch('jenis');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Jenis Switcher */}
      <div className="flex bg-surface-container-low p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setValue('jenis', 'pengeluaran');
            setValue('kategori', '');
          }}
          className={`flex-1 py-2 text-body-sm font-bold rounded-lg transition-all ${
            jenis === 'pengeluaran' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => {
            setValue('jenis', 'pemasukan');
            setValue('kategori', '');
          }}
          className={`flex-1 py-2 text-body-sm font-bold rounded-lg transition-all ${
            jenis === 'pemasukan' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Pemasukan
        </button>
      </div>

      {/* Nominal */}
      <div>
        <label htmlFor="nominal" className="block text-sm font-medium text-on-surface-variant mb-1">
          Nominal (Rp)
        </label>
        <Controller
          name="nominal"
          control={control}
          render={({ field: { onChange, value } }) => (
            <input
              type="text"
              inputMode="numeric"
              id="nominal"
              value={value ? value.toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                onChange(rawValue ? parseInt(rawValue, 10) : undefined);
              }}
              className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary text-headline-md font-bold bg-white transition-colors"
              placeholder="0"
            />
          )}
        />
        {errors.nominal && <p className="mt-1 text-sm text-error">{errors.nominal.message}</p>}
      </div>

      {/* Kategori */}
      <div>
        <label htmlFor="kategori" className="block text-sm font-medium text-on-surface-variant mb-1">
          Kategori
        </label>
        <select
          {...register('kategori')}
          id="kategori"
          className="block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled>Pilih Kategori</option>
          {(jenis === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        {errors.kategori && <p className="mt-1 text-sm text-error">{errors.kategori.message}</p>}
      </div>

      {/* Tanggal */}
      <div>
        <label htmlFor="tanggal" className="block text-sm font-medium text-on-surface-variant mb-1">
          Tanggal
        </label>
        <input
          {...register('tanggal')}
          type="date"
          id="tanggal"
          className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors"
        />
        {errors.tanggal && <p className="mt-1 text-sm text-error">{errors.tanggal.message}</p>}
      </div>

      {/* Deskripsi */}
      <div>
        <label htmlFor="deskripsi" className="block text-sm font-medium text-on-surface-variant mb-1">
          Catatan (Opsional)
        </label>
        <textarea
          {...register('deskripsi')}
          id="deskripsi"
          rows={3}
          className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors resize-none"
          placeholder="Contoh: Makan siang dengan teman..."
        />
      </div>

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
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-xl text-body-md font-bold text-white bg-premium-charcoal hover:bg-premium-charcoal/90 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
