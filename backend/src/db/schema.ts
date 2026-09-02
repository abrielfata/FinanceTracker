import {
  pgTable,
  uuid,
  text,
  bigint,
  boolean,
  integer,
  date,
  timestamp,
  unique,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Tagihan (Template tagihan rutin) ────────────────────────────────────────
export const tagihan = pgTable('tagihan', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  nominal: bigint('nominal', { mode: 'number' }).notNull(),
  tanggalJatuhTempo: integer('tanggal_jatuh_tempo').notNull(), // 1-31
  kategori: text('kategori').notNull().default('Lainnya'),
  catatan: text('catatan'),
  isBerulang: boolean('is_berulang').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Tagihan Bulan (Status per bulan) ────────────────────────────────────────
export const tagihanBulan = pgTable(
  'tagihan_bulan',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tagihanId: uuid('tagihan_id').references(() => tagihan.id, {
      onDelete: 'cascade',
    }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bulan: integer('bulan').notNull(), // 1-12
    tahun: integer('tahun').notNull(),
    status: text('status').notNull().default('belum_lunas'), // belum_lunas | lunas | terlambat
    tanggalBayar: timestamp('tanggal_bayar', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.tagihanId, t.bulan, t.tahun)]
);

// ─── Transaksi ────────────────────────────────────────────────────────────────
export const transaksi = pgTable('transaksi', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jenis: text('jenis').notNull(), // pemasukan | pengeluaran
  nominal: bigint('nominal', { mode: 'number' }).notNull(),
  kategori: text('kategori').notNull(),
  deskripsi: text('deskripsi'),
  tanggal: date('tanggal').notNull().default(sql`CURRENT_DATE`),
  tagihanBulanId: uuid('tagihan_bulan_id').references(() => tagihanBulan.id, { onDelete: 'set null' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
},
(t) => [index('user_tanggal_idx').on(t.userId, t.tanggal)]
);

// ─── Budget ───────────────────────────────────────────────────────────────────
export const budget = pgTable(
  'budget',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kategori: text('kategori').notNull(),
    nominal: bigint('nominal', { mode: 'number' }).notNull(),
    bulan: integer('bulan').notNull(), // 1-12
    tahun: integer('tahun').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.userId, t.kategori, t.bulan, t.tahun)]
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tagihan = typeof tagihan.$inferSelect;
export type NewTagihan = typeof tagihan.$inferInsert;
export type TagihanBulan = typeof tagihanBulan.$inferSelect;
export type Transaksi = typeof transaksi.$inferSelect;
export type NewTransaksi = typeof transaksi.$inferInsert;
export type Budget = typeof budget.$inferSelect;
export type NewBudget = typeof budget.$inferInsert;
