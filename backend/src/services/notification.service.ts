import { db } from '../db';
import { tagihan, tagihanBulan, budget } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getSpendingSubquery } from './budget.service';

export interface NotificationItem {
  id: string;
  type: 'warning' | 'error';
  title: string;
  message: string;
  link: string;
}

export const getDynamicNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const notifications: NotificationItem[] = [];
  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();

  // 1. Tagihan Alerts
  const tagihanList = await db
    .select({
      id: tagihan.id,
      nama: tagihan.nama,
      tanggalJatuhTempo: tagihan.tanggalJatuhTempo,
      status: tagihanBulan.status,
    })
    .from(tagihan)
    .leftJoin(
      tagihanBulan,
      and(
        eq(tagihanBulan.tagihanId, tagihan.id),
        eq(tagihanBulan.bulan, currentBulan),
        eq(tagihanBulan.tahun, currentTahun)
      )
    )
    .where(eq(tagihan.userId, userId));

  for (const t of tagihanList) {
    if (t.status === 'lunas') continue;
    
    const jatuhTempo = new Date(currentTahun, currentBulan - 1, t.tanggalJatuhTempo);
    const diffDays = Math.ceil((jatuhTempo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      notifications.push({
        id: `tagihan-error-${t.id}`,
        type: 'error',
        title: 'Tagihan Terlambat',
        message: `Tagihan ${t.nama} sudah lewat jatuh tempo!`,
        link: '/tagihan'
      });
    } else if (diffDays <= 3) {
      notifications.push({
        id: `tagihan-warning-${t.id}`,
        type: 'warning',
        title: 'Tagihan Segera Jatuh Tempo',
        message: `Tagihan ${t.nama} jatuh tempo ${diffDays === 0 ? 'hari ini' : `dalam ${diffDays} hari`}.`,
        link: '/tagihan'
      });
    }
  }

  // 2. Budget Alerts
  const budgetList = await db
    .select({
      id: budget.id,
      kategori: budget.kategori,
      nominal: budget.nominal,
      terpakai: getSpendingSubquery(userId, currentBulan, currentTahun),
    })
    .from(budget)
    .where(
      and(
        eq(budget.userId, userId),
        eq(budget.bulan, currentBulan),
        eq(budget.tahun, currentTahun)
      )
    );

  for (const b of budgetList) {
    if (b.nominal > 0) {
      const terpakaiNum = Number(b.terpakai) || 0;
      const persen = (terpakaiNum / b.nominal) * 100;
      if (persen >= 100) {
        notifications.push({
          id: `budget-error-${b.id}`,
          type: 'error',
          title: 'Budget Melebihi Batas',
          message: `Pengeluaran ${b.kategori} melebihi budget (${Math.round(persen)}%).`,
          link: '/budget'
        });
      } else if (persen >= 80) {
        notifications.push({
          id: `budget-warning-${b.id}`,
          type: 'warning',
          title: 'Budget Hampir Habis',
          message: `Pengeluaran ${b.kategori} sudah mencapai ${Math.round(persen)}%.`,
          link: '/budget'
        });
      }
    }
  }

  return notifications;
};
