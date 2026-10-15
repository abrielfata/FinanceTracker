export interface ReleaseHighlight {
  title: string;
  description: string;
  icon: string;
  badge?: 'Baru' | 'Peningkatan' | 'Perbaikan';
}

export interface ReleaseUpdate {
  version: string;
  date: string;
  title: string;
  subtitle: string;
  highlights: ReleaseHighlight[];
}

export const APP_UPDATES: ReleaseUpdate[] = [
  {
    version: '1.2.0',
    date: '16 Oktober 2026',
    title: 'Pembaruan Fitur FiTrack',
    subtitle: 'Kami menambahkan fitur baru dan meningkatkan kenyamanan pengelolaan keuangan Anda.',
    highlights: [
      {
        title: 'Catatan & Deskripsi Budget',
        description: 'Kini Anda dapat menambahkan catatan khusus pada target budget bulanan (misal: "Maksimal jajan 2x seminggu"). Catatan ini juga otomatis disalin ke bulan berikutnya.',
        icon: 'edit_note',
        badge: 'Baru',
      },
      {
        title: 'Input Nominal Lebih Halus & Responsif',
        description: 'Perbaikan pada form nominal transaksi & budget. Kini pengeditan per angka dan penghapusan dengan tombol backspace berjalan lancar tanpa kendala format.',
        icon: 'payments',
        badge: 'Peningkatan',
      },
      {
        title: 'Error Handling & Keamanan Auth',
        description: 'Pemberitahuan error saat login dan verifikasi sesi kini lebih informatif dan sesuai standar keamanan.',
        icon: 'verified_user',
        badge: 'Perbaikan',
      },
    ],
  },
];

export const LATEST_UPDATE: ReleaseUpdate = APP_UPDATES[0];
export const CURRENT_APP_VERSION = LATEST_UPDATE.version;
