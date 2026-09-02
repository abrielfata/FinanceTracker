import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Format number to Indonesian Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format compact rupiah (1.250.000 → Rp 1,25 Jt)
export const formatRupiahCompact = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(2).replace('.', ',')} Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(amount);
};

// Nama bulan dalam Bahasa Indonesia
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const formatBulanTahun = (bulan: number, tahun: number): string =>
  `${NAMA_BULAN[bulan - 1]} ${tahun}`;

// Format date to DD Mon YYYY (1 Sep 2024)
export const formatTanggal = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Get days until due date this month
export const hariMenujuJatuhTempo = (tanggalJatuhTempo: number): number => {
  const now = new Date();
  const jatuhTempo = new Date(now.getFullYear(), now.getMonth(), tanggalJatuhTempo);
  if (jatuhTempo < now) {
    jatuhTempo.setMonth(jatuhTempo.getMonth() + 1);
  }
  const diff = jatuhTempo.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Budget status
export const getBudgetStatus = (terpakai: number, nominal: number): 'aman' | 'warning' | 'over' => {
  const persen = nominal > 0 ? (terpakai / nominal) * 100 : 0;
  if (persen >= 100) return 'over';
  if (persen >= 75) return 'warning';
  return 'aman';
};

export const getBudgetPersen = (terpakai: number, nominal: number) => {
  if (nominal <= 0) return 0;
  return Math.min((terpakai / nominal) * 100, 100);
};

export const exportToExcel = async (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transaksi');

  // Define columns based on our TransaksiItem structure
  worksheet.columns = [
    { header: 'Tanggal', key: 'tanggal', width: 15 },
    { header: 'Kategori', key: 'kategori', width: 25 },
    { header: 'Deskripsi', key: 'deskripsi', width: 40 },
    { header: 'Jenis', key: 'jenis', width: 15 },
    { header: 'Nominal', key: 'nominal', width: 20 },
  ];

  // Style Header
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' } // premium-charcoal
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add Data
  data.forEach((item) => {
    worksheet.addRow({
      tanggal: item.tanggal, // Expected format YYYY-MM-DD
      kategori: item.kategori,
      deskripsi: item.deskripsi || '-',
      jenis: item.jenis.toUpperCase(),
      nominal: item.nominal
    });
  });

  // Format Data Rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Date alignment
      row.getCell('tanggal').alignment = { horizontal: 'center' };
      // Jenis alignment and color
      const jenisCell = row.getCell('jenis');
      jenisCell.alignment = { horizontal: 'center' };
      if (jenisCell.value === 'PEMASUKAN') {
        jenisCell.font = { color: { argb: 'FF10B981' }, bold: true }; // Green
      } else {
        jenisCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
      }
      
      // Nominal format (Accounting/Currency)
      const nominalCell = row.getCell('nominal');
      nominalCell.numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
    }
  });

  // Generate Buffer and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// Kategori icons (Material Symbols)
export const KATEGORI_ICON: Record<string, string> = {
  'Makan & Minum': 'restaurant',
  'Makanan & Minuman': 'restaurant',
  Transportasi: 'directions_car',
  Hiburan: 'movie',
  Kesehatan: 'medical_services',
  Pendidikan: 'school',
  Tagihan: 'receipt',
  Belanja: 'shopping_bag',
  Pemasukan: 'account_balance',
  Tabungan: 'savings',
  Gaji: 'account_balance_wallet',
  Bonus: 'redeem',
  'Hasil Investasi': 'trending_up',
  Pemberian: 'volunteer_activism',
  Lainnya: 'category',
};

// Kategori colors
export const KATEGORI_COLOR: Record<string, string> = {
  'Makan & Minum': 'bg-orange-100 text-orange-600',
  'Makanan & Minuman': 'bg-orange-100 text-orange-600',
  Transportasi: 'bg-blue-100 text-blue-600',
  Hiburan: 'bg-purple-100 text-purple-600',
  Kesehatan: 'bg-red-100 text-red-600',
  Pendidikan: 'bg-indigo-100 text-indigo-600',
  Tagihan: 'bg-yellow-100 text-yellow-700',
  Belanja: 'bg-pink-100 text-pink-600',
  Pemasukan: 'bg-emerald-100 text-emerald-700',
  Tabungan: 'bg-teal-100 text-teal-700',
  Gaji: 'bg-emerald-100 text-emerald-700',
  Bonus: 'bg-yellow-100 text-yellow-700',
  'Hasil Investasi': 'bg-blue-100 text-blue-700',
  Pemberian: 'bg-pink-100 text-pink-700',
  Lainnya: 'bg-gray-100 text-gray-600',
};

export const KATEGORI_PENGELUARAN = [
  'Makan & Minum',
  'Transportasi',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan',
  'Belanja',
  'Lainnya',
];

export const KATEGORI_PEMASUKAN = [
  'Gaji',
  'Bonus',
  'Hasil Investasi',
  'Pemberian',
  'Lainnya',
];

export const KATEGORI_LIST = Array.from(new Set([...KATEGORI_PENGELUARAN, ...KATEGORI_PEMASUKAN]));

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};
