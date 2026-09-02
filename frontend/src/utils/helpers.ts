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

export interface ExportData {
  transaksi: any[];
  tagihan: any[];
  budget: any[];
}

export const exportToExcel = async (data: ExportData, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  
  // Header Style
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } } as ExcelJS.Fill,
    alignment: { vertical: 'middle', horizontal: 'center' } as Partial<ExcelJS.Alignment>
  };

  // --- SHEET 1: TRANSAKSI ---
  if (data.transaksi?.length > 0) {
    const ws1 = workbook.addWorksheet('Transaksi');
    ws1.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Kategori', key: 'kategori', width: 25 },
      { header: 'Deskripsi', key: 'deskripsi', width: 40 },
      { header: 'Jenis', key: 'jenis', width: 15 },
      { header: 'Nominal', key: 'nominal', width: 20 },
    ];
    
    ws1.getRow(1).font = headerStyle.font;
    ws1.getRow(1).fill = headerStyle.fill;
    ws1.getRow(1).alignment = headerStyle.alignment;

    data.transaksi.forEach((item) => {
      ws1.addRow({
        tanggal: item.tanggal,
        kategori: item.kategori,
        deskripsi: item.deskripsi || '-',
        jenis: item.jenis.toUpperCase(),
        nominal: item.nominal
      });
    });

    ws1.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell('tanggal').alignment = { horizontal: 'center' };
        const jenisCell = row.getCell('jenis');
        jenisCell.alignment = { horizontal: 'center' };
        jenisCell.font = { color: { argb: jenisCell.value === 'PEMASUKAN' ? 'FF10B981' : 'FFEF4444' }, bold: true };
        row.getCell('nominal').numFmt = '"Rp"#,##0;[Red]\\-"Rp"#,##0';
      }
    });
  }

  // --- SHEET 2: TAGIHAN ---
  if (data.tagihan?.length > 0) {
    const ws2 = workbook.addWorksheet('Tagihan');
    ws2.columns = [
      { header: 'Nama Tagihan', key: 'nama', width: 30 },
      { header: 'Kategori', key: 'kategori', width: 20 },
      { header: 'Tgl Jatuh Tempo', key: 'tanggal', width: 15 },
      { header: 'Nominal', key: 'nominal', width: 20 },
      { header: 'Catatan', key: 'catatan', width: 40 },
    ];
    
    ws2.getRow(1).font = headerStyle.font;
    ws2.getRow(1).fill = headerStyle.fill;
    ws2.getRow(1).alignment = headerStyle.alignment;

    data.tagihan.forEach((item) => {
      ws2.addRow({
        nama: item.nama,
        kategori: item.kategori,
        tanggal: `Tgl ${item.tanggalJatuhTempo}`,
        nominal: item.nominal,
        catatan: item.catatan || '-'
      });
    });

    ws2.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell('tanggal').alignment = { horizontal: 'center' };
        row.getCell('nominal').numFmt = '"Rp"#,##0;[Red]\\-"Rp"#,##0';
      }
    });
  }

  // --- SHEET 3: BUDGET ---
  if (data.budget?.length > 0) {
    const ws3 = workbook.addWorksheet('Budget');
    ws3.columns = [
      { header: 'Tahun', key: 'tahun', width: 10 },
      { header: 'Bulan', key: 'bulan', width: 10 },
      { header: 'Kategori', key: 'kategori', width: 25 },
      { header: 'Nominal Budget', key: 'nominal', width: 20 },
    ];
    
    ws3.getRow(1).font = headerStyle.font;
    ws3.getRow(1).fill = headerStyle.fill;
    ws3.getRow(1).alignment = headerStyle.alignment;

    data.budget.forEach((item) => {
      ws3.addRow({
        tahun: item.tahun,
        bulan: item.bulan,
        kategori: item.kategori,
        nominal: item.nominal
      });
    });

    ws3.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell('tahun').alignment = { horizontal: 'center' };
        row.getCell('bulan').alignment = { horizontal: 'center' };
        row.getCell('nominal').numFmt = '"Rp"#,##0;[Red]\\-"Rp"#,##0';
      }
    });
  }
  
  if (workbook.worksheets.length === 0) {
    workbook.addWorksheet('No Data');
  }

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
  'Uang Saku': 'payments',
  Beasiswa: 'school',
  'Kerja Sampingan': 'work',
  'Hasil Jualan': 'storefront',
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
  'Uang Saku': 'bg-emerald-100 text-emerald-700',
  Beasiswa: 'bg-indigo-100 text-indigo-700',
  'Kerja Sampingan': 'bg-teal-100 text-teal-700',
  'Hasil Jualan': 'bg-yellow-100 text-yellow-700',
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
  'Uang Saku',
  'Gaji',
  'Beasiswa',
  'Kerja Sampingan',
  'Hasil Jualan',
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
