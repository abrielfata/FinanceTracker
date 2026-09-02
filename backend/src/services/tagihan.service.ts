import { db } from '../db';
import { tagihan, tagihanBulan, NewTagihan, transaksi } from '../db/schema';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

export const getTagihanList = async (userId: string, bulan?: string, tahun?: string) => {
  return await db
    .select({
      id: tagihan.id,
      nama: tagihan.nama,
      nominal: tagihan.nominal,
      tanggalJatuhTempo: tagihan.tanggalJatuhTempo,
      kategori: tagihan.kategori,
      catatan: tagihan.catatan,
      isBerulang: tagihan.isBerulang,
      createdAt: tagihan.createdAt,
      statusBulanIni: tagihanBulan.status,
      tanggalBayar: tagihanBulan.tanggalBayar,
      tagihanBulanId: tagihanBulan.id,
    })
    .from(tagihan)
    .leftJoin(
      tagihanBulan,
      and(
        eq(tagihanBulan.tagihanId, tagihan.id),
        bulan ? eq(tagihanBulan.bulan, parseInt(bulan)) : undefined,
        tahun ? eq(tagihanBulan.tahun, parseInt(tahun)) : undefined
      )
    )
    .where(
      and(
        eq(tagihan.userId, userId),
        isNull(tagihan.deletedAt)
      )
    )
    .orderBy(tagihan.tanggalJatuhTempo);
};

export const createTagihan = async (userId: string, data: Omit<NewTagihan, 'userId'>) => {
  const [newTagihan] = await db
    .insert(tagihan)
    .values({ ...data, userId })
    .returning();

  // Auto-create tagihan_bulan for current month
  const now = new Date();
  await db.insert(tagihanBulan).values({
    tagihanId: newTagihan.id,
    userId,
    bulan: now.getMonth() + 1,
    tahun: now.getFullYear(),
    status: 'belum_lunas',
  }).onConflictDoNothing();

  return newTagihan;
};

export const updateTagihan = async (userId: string, tagihanId: string, data: Partial<NewTagihan>) => {
  const [updatedTagihan] = await db
    .update(tagihan)
    .set(data)
    .where(and(eq(tagihan.id, tagihanId), eq(tagihan.userId, userId)))
    .returning();

  if (!updatedTagihan) {
    throw new NotFoundError('Tagihan tidak ditemukan');
  }

  return updatedTagihan;
};

export const deleteTagihan = async (userId: string, tagihanId: string) => {
  const [deletedTagihan] = await db
    .update(tagihan)
    .set({ deletedAt: new Date() })
    .where(and(eq(tagihan.id, tagihanId), eq(tagihan.userId, userId)))
    .returning({ id: tagihan.id });

  if (!deletedTagihan) {
    throw new NotFoundError('Tagihan tidak ditemukan');
  }
};

export const payTagihan = async (userId: string, tagihanBulanId: string) => {
  const [data] = await db
    .update(tagihanBulan)
    .set({ status: 'lunas', tanggalBayar: new Date() })
    .where(and(eq(tagihanBulan.id, tagihanBulanId), eq(tagihanBulan.userId, userId)))
    .returning();

  if (!data) {
    throw new NotFoundError('Data tagihan bulan tidak ditemukan');
  }

  if (!data.tagihanId) return data;

  const [baseTagihan] = await db.select().from(tagihan).where(eq(tagihan.id, data.tagihanId));
  if (baseTagihan) {
    await db.insert(transaksi).values({
      userId,
      jenis: 'pengeluaran',
      nominal: baseTagihan.nominal,
      kategori: baseTagihan.kategori,
      deskripsi: `Bayar Tagihan: ${baseTagihan.nama}`,
      tanggal: new Date().toISOString().split('T')[0],
      tagihanBulanId: data.id,
    });
  }

  return data;
};

export const cancelPayTagihan = async (userId: string, tagihanBulanId: string) => {
  const [data] = await db
    .update(tagihanBulan)
    .set({ status: 'belum_lunas', tanggalBayar: null })
    .where(and(eq(tagihanBulan.id, tagihanBulanId), eq(tagihanBulan.userId, userId)))
    .returning();

  if (!data) {
    throw new NotFoundError('Data tagihan bulan tidak ditemukan');
  }

  await db.update(transaksi)
    .set({ deletedAt: new Date() })
    .where(eq(transaksi.tagihanBulanId, data.id));

  return data;
};
