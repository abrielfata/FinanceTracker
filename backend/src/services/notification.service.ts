import { db } from '../db';
import { tagihan, tagihanBulan, budget, users } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getSpendingSubquery, autoCopyPreviousBudget } from './budget.service';

import { formatDateString } from '../utils/date';

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
  const today = now.getDate();

  // Get user's salary cycle date
  const [u] = await db.select({ siklusTgl: users.siklusTgl }).from(users).where(eq(users.id, userId)).limit(1);
  const siklusTgl = u?.siklusTgl || 26;

  let targetBulan = currentBulan;
  let targetTahun = currentTahun;
  let startYear = currentTahun;
  let startMonth = currentBulan;
  let endYear = currentTahun;
  let endMonth = currentBulan;
  let startDate = '';
  let endDate = '';

  if (siklusTgl === 1) {
    const lastDay = new Date(currentTahun, currentBulan, 0).getDate();
    startDate = `${currentTahun}-${String(currentBulan).padStart(2, '0')}-01`;
    endDate = `${currentTahun}-${String(currentBulan).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  } else if (today >= siklusTgl) {
    targetBulan = currentBulan + 1;
    if (targetBulan > 12) {
      targetBulan = 1;
      targetTahun += 1;
    }
    endMonth = currentBulan + 1;
    if (endMonth > 12) {
      endMonth = 1;
      endYear += 1;
    }
    startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(siklusTgl).padStart(2, '0')}`;
    endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(siklusTgl - 1).padStart(2, '0')}`;
  } else {
    startMonth = currentBulan - 1;
    if (startMonth === 0) {
      startMonth = 12;
      startYear -= 1;
    }
    startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(siklusTgl).padStart(2, '0')}`;
    endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(siklusTgl - 1).padStart(2, '0')}`;
  }

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
        eq(tagihanBulan.bulan, targetBulan),
        eq(tagihanBulan.tahun, targetTahun)
      )
    )
    .where(
      and(
        eq(tagihan.userId, userId),
        isNull(tagihan.deletedAt)
      )
    );

  for (const t of tagihanList) {
    if (t.status === 'lunas') continue;
    
    const jatuhTempo = new Date(targetTahun, targetBulan - 1, t.tanggalJatuhTempo);
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
  await autoCopyPreviousBudget(userId, targetBulan, targetTahun);

  const budgetList = await db
    .select({
      id: budget.id,
      kategori: budget.kategori,
      nominal: budget.nominal,
      terpakai: getSpendingSubquery(userId, startDate, endDate),
    })
    .from(budget)
    .where(
      and(
        eq(budget.userId, userId),
        eq(budget.bulan, targetBulan),
        eq(budget.tahun, targetTahun)
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
