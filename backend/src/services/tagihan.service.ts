import { db } from '../db';
import { tagihan, tagihanBulan, NewTagihan, transaksi } from '../db/schema';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { NotFoundError } from '../utils/errors';

import { formatDateString } from '../utils/date';

export const getTagihanList = async (userId: string, bulan?: string, tahun?: string) => {
  const targetBulan = bulan ? parseInt(bulan) : new Date().getMonth() + 1;
  const targetTahun = tahun ? parseInt(tahun) : new Date().getFullYear();

  // Get active tagihan
  const activeTagihan = await db
    .select()
    .from(tagihan)
    .where(and(eq(tagihan.userId, userId), isNull(tagihan.deletedAt)));

  // Ensure tagihan_bulan exists for all active tagihan for the requested month/year
  if (activeTagihan.length > 0) {
    const existingEntries = await db
      .select({ tagihanId: tagihanBulan.tagihanId })
      .from(tagihanBulan)
      .where(
        and(
          eq(tagihanBulan.userId, userId),
          eq(tagihanBulan.bulan, targetBulan),
          eq(tagihanBulan.tahun, targetTahun)
        )
      );

    const existingTagihanIds = new Set(existingEntries.map((e) => e.tagihanId));

    for (const t of activeTagihan) {
      if (!existingTagihanIds.has(t.id)) {
        await db
          .insert(tagihanBulan)
          .values({
            tagihanId: t.id,
            userId,
            bulan: targetBulan,
            tahun: targetTahun,
            status: 'belum_lunas',
          })
          .onConflictDoNothing();
      }
    }
  }

  const list = await db
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
        eq(tagihanBulan.bulan, targetBulan),
        eq(tagihanBulan.tahun, targetTahun)
      )
    )
    .where(and(eq(tagihan.userId, userId), isNull(tagihan.deletedAt)))
    .orderBy(tagihan.tanggalJatuhTempo);

  return list.map((item) => ({
    ...item,
    nominal: Number(item.nominal),
  }));
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
  const [existing] = await db
    .select()
    .from(tagihanBulan)
    .where(and(eq(tagihanBulan.id, tagihanBulanId), eq(tagihanBulan.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Data tagihan bulan tidak ditemukan');
  }

  if (existing.status === 'lunas') {
    return existing;
  }

  const [data] = await db
    .update(tagihanBulan)
    .set({ status: 'lunas', tanggalBayar: new Date() })
    .where(and(eq(tagihanBulan.id, tagihanBulanId), eq(tagihanBulan.userId, userId)))
    .returning();

  if (!data || !data.tagihanId) return data;

  const [baseTagihan] = await db.select().from(tagihan).where(eq(tagihan.id, data.tagihanId));
  if (baseTagihan) {
    await db.insert(transaksi).values({
      userId,
      jenis: 'pengeluaran',
      nominal: baseTagihan.nominal,
      kategori: baseTagihan.kategori,
      deskripsi: `Bayar Tagihan: ${baseTagihan.nama}`,
      tanggal: formatDateString(new Date()),
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
