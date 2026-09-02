import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KATEGORI_LIST } from '../../utils/helpers';

const tagihanSchema = z.object({
  nama: z.string().min(1, 'Nama tagihan wajib diisi'),
  nominal: z.number().positive('Nominal harus lebih dari 0'),
  tanggalJatuhTempo: z.number().min(1, 'Minimal tanggal 1').max(31, 'Maksimal tanggal 31'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  catatan: z.string().optional(),
  isBerulang: z.boolean(),
});

export type TagihanFormData = z.infer<typeof tagihanSchema>;

interface TagihanFormProps {
  initialData?: Partial<TagihanFormData>;
  onSubmit: (data: TagihanFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function TagihanForm({ initialData, onSubmit, isLoading, onCancel }: TagihanFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TagihanFormData>({
    resolver: zodResolver(tagihanSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      nominal: initialData?.nominal || undefined,
      tanggalJatuhTempo: initialData?.tanggalJatuhTempo || 1,
      kategori: initialData?.kategori || 'Tagihan',
      catatan: initialData?.catatan || '',
      isBerulang: initialData?.isBerulang ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nama Tagihan */}
      <div>
        <label htmlFor="nama" className="block text-sm font-medium text-on-surface-variant mb-1">
          Nama Tagihan
        </label>
        <input
          {...register('nama')}
          type="text"
          id="nama"
          className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors"
          placeholder="Contoh: Listrik PLN, Air PDAM..."
        />
        {errors.nama && <p className="mt-1 text-sm text-error">{errors.nama.message}</p>}
      </div>

      {/* Nominal */}
      <div>
        <label htmlFor="nominal" className="block text-sm font-medium text-on-surface-variant mb-1">
          Nominal Perkiraan (Rp)
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

      <div className="grid grid-cols-2 gap-4">
        {/* Jatuh Tempo */}
        <div>
          <label htmlFor="tanggalJatuhTempo" className="block text-sm font-medium text-on-surface-variant mb-1">
            Tanggal Jatuh Tempo
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant font-medium">
              Tgl
            </span>
            <input
              {...register('tanggalJatuhTempo', { valueAsNumber: true })}
              type="number"
              id="tanggalJatuhTempo"
              min="1"
              max="31"
              className="appearance-none block w-full pl-12 pr-4 py-3 border border-outline-variant rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors"
            />
          </div>
          {errors.tanggalJatuhTempo && <p className="mt-1 text-sm text-error">{errors.tanggalJatuhTempo.message}</p>}
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
            {KATEGORI_LIST.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {errors.kategori && <p className="mt-1 text-sm text-error">{errors.kategori.message}</p>}
        </div>
      </div>

      {/* Catatan */}
      <div>
        <label htmlFor="catatan" className="block text-sm font-medium text-on-surface-variant mb-1">
          Catatan (Opsional)
        </label>
        <textarea
          {...register('catatan')}
          id="catatan"
          rows={2}
          className="appearance-none block w-full px-4 py-3 border border-outline-variant rounded-xl shadow-sm placeholder-outline focus:outline-none focus:ring-primary focus:border-primary text-body-md bg-white transition-colors resize-none"
          placeholder="No. Pelanggan, dll..."
        />
      </div>

      {/* Is Berulang */}
      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl">
        <input
          {...register('isBerulang')}
          type="checkbox"
          id="isBerulang"
          className="w-5 h-5 text-primary bg-white border-outline-variant rounded focus:ring-primary cursor-pointer accent-primary"
        />
        <label htmlFor="isBerulang" className="text-sm font-medium text-on-surface cursor-pointer select-none">
          Ulangi tagihan ini setiap bulan
        </label>
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
