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
export const KATEGORI_CONFIG = [
  { name: 'Makan & Minum', type: 'pengeluaran', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' },
  { name: 'Makanan & Minuman', type: 'pengeluaran', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' },
  { name: 'Transportasi', type: 'pengeluaran', icon: 'directions_car', color: 'bg-blue-100 text-blue-600' },
  { name: 'Hiburan', type: 'pengeluaran', icon: 'movie', color: 'bg-purple-100 text-purple-600' },
  { name: 'Kesehatan', type: 'pengeluaran', icon: 'medical_services', color: 'bg-red-100 text-red-600' },
  { name: 'Pendidikan', type: 'pengeluaran', icon: 'school', color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Tagihan', type: 'pengeluaran', icon: 'receipt', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Belanja', type: 'pengeluaran', icon: 'shopping_bag', color: 'bg-pink-100 text-pink-600' },
  { name: 'Pemasukan', type: 'pemasukan', icon: 'account_balance', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Tabungan', type: 'pengeluaran', icon: 'savings', color: 'bg-teal-100 text-teal-700' },
  { name: 'Gaji', type: 'pemasukan', icon: 'account_balance_wallet', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Bonus', type: 'pemasukan', icon: 'redeem', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Hasil Investasi', type: 'pemasukan', icon: 'trending_up', color: 'bg-blue-100 text-blue-700' },
  { name: 'Pemberian', type: 'pemasukan', icon: 'volunteer_activism', color: 'bg-pink-100 text-pink-700' },
  { name: 'Uang Saku', type: 'pemasukan', icon: 'payments', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Beasiswa', type: 'pemasukan', icon: 'school', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Kerja Sampingan', type: 'pemasukan', icon: 'work', color: 'bg-teal-100 text-teal-700' },
  { name: 'Hasil Jualan', type: 'pemasukan', icon: 'storefront', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Lainnya', type: 'lainnya', icon: 'category', color: 'bg-gray-100 text-gray-600' },
];

export const KATEGORI_ICON = Object.fromEntries(KATEGORI_CONFIG.map(k => [k.name, k.icon])) as Record<string, string>;
export const KATEGORI_COLOR = Object.fromEntries(KATEGORI_CONFIG.map(k => [k.name, k.color])) as Record<string, string>;
export const KATEGORI_PENGELUARAN = KATEGORI_CONFIG.filter(k => k.type === 'pengeluaran').map(k => k.name);
export const KATEGORI_PEMASUKAN = KATEGORI_CONFIG.filter(k => k.type === 'pemasukan').map(k => k.name);
export const KATEGORI_LIST = Array.from(new Set(KATEGORI_CONFIG.map(k => k.name)));

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};
