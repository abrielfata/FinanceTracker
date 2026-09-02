import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  label?: string;
}

export default function DateRangeFilter({ startDate, endDate, onChange, label }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  
  const { user } = useAuthStore();
  const siklusTgl = user?.siklusTgl || 26;

  // Sync state if props change externally
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
  };

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setIsOpen(false);
  };

  const handlePresetBulanIni = () => {
    const now = new Date();
    const currentBulan = now.getMonth() + 1;
    const currentTahun = now.getFullYear();
    
    let startM = currentBulan - 1;
    let startY = currentTahun;
    if (startM === 0) {
      startM = 12;
      startY -= 1;
    }
    // But since siklusTgl is the START date of the cycle, the END date is siklusTgl - 1 (of the current month)
    // Actually, if siklusTgl is 1, then the cycle is 1st to End of Month.
    // If siklusTgl is 26, cycle is 26th of prev month to 25th of current month.
    
    let cycleStartM = startM;
    let cycleStartY = startY;
    let cycleEndM = currentBulan;
    let cycleEndY = currentTahun;
    
    if (siklusTgl === 1) {
      cycleStartM = currentBulan;
      cycleStartY = currentTahun;
      const lastDay = new Date(currentTahun, currentBulan, 0).getDate();
      const start = `${cycleStartY}-${String(cycleStartM).padStart(2, '0')}-01`;
      const end = `${cycleEndY}-${String(cycleEndM).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      onChange(start, end);
      setIsOpen(false);
      return;
    }

    const start = `${cycleStartY}-${String(cycleStartM).padStart(2, '0')}-${String(siklusTgl).padStart(2, '0')}`;
    const end = `${cycleEndY}-${String(cycleEndM).padStart(2, '0')}-${String(siklusTgl - 1).padStart(2, '0')}`;
    
    onChange(start, end);
    setIsOpen(false);
  };

  const handlePresetBulanLalu = () => {
    const now = new Date();
    let prevBulan = now.getMonth(); // previous month
    let prevTahun = now.getFullYear();
    if (prevBulan === 0) {
      prevBulan = 12;
      prevTahun -= 1;
    }
    
    let startM = prevBulan - 1;
    let startY = prevTahun;
    if (startM === 0) {
      startM = 12;
      startY -= 1;
    }
    
    let cycleStartM = startM;
    let cycleStartY = startY;
    let cycleEndM = prevBulan;
    let cycleEndY = prevTahun;
    
    if (siklusTgl === 1) {
      cycleStartM = prevBulan;
      cycleStartY = prevTahun;
      const lastDay = new Date(prevTahun, prevBulan, 0).getDate();
      const start = `${cycleStartY}-${String(cycleStartM).padStart(2, '0')}-01`;
      const end = `${cycleEndY}-${String(cycleEndM).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      onChange(start, end);
      setIsOpen(false);
      return;
    }

    const start = `${cycleStartY}-${String(cycleStartM).padStart(2, '0')}-${String(siklusTgl).padStart(2, '0')}`;
    const end = `${cycleEndY}-${String(cycleEndM).padStart(2, '0')}-${String(siklusTgl - 1).padStart(2, '0')}`;
    
    onChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <p className="font-body text-body-sm text-on-surface-variant mb-1 ml-2">{label}</p>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-body-sm font-medium border px-4 py-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 whitespace-nowrap shadow-sm ${
          isOpen 
            ? 'bg-primary-fixed/10 border-primary/30 text-primary' 
            : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        {formatShortDate(startDate)} - {formatShortDate(endDate)}
        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-[340px] bg-white rounded-3xl shadow-premium border border-premium-border animate-fade-in p-5 z-50">
          <div className="flex items-center gap-2 mb-4 border-b border-premium-border pb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
            <p className="text-body-md font-bold text-on-surface">Pilih Rentang Waktu</p>
          </div>
          
          <div className="flex flex-col gap-2 mb-5">
            <button 
              onClick={handlePresetBulanIni}
              className="group flex items-center justify-between px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-on-surface"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">today</span>
                <span className="text-body-sm font-bold">Siklus Bulan Ini</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium bg-surface-container-low px-2 py-1 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                Tgl {siklusTgl} - {siklusTgl === 1 ? 'Akhir' : siklusTgl - 1}
              </span>
            </button>
            <button 
              onClick={handlePresetBulanLalu}
              className="group flex items-center justify-between px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all text-on-surface"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <span className="text-body-sm font-bold">Siklus Bulan Lalu</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-primary transition-colors">chevron_right</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-premium-border mb-4">
            <p className="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
              Kustom Manual
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-on-surface-variant w-16">Mulai</label>
                <input 
                  type="date" 
                  value={tempStart} 
                  onChange={(e) => setTempStart(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-transparent rounded-xl text-body-sm focus:outline-none focus:bg-white focus:border-primary transition-all text-on-surface font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-on-surface-variant w-16">Sampai</label>
                <input 
                  type="date" 
                  value={tempEnd} 
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-transparent rounded-xl text-body-sm focus:outline-none focus:bg-white focus:border-primary transition-all text-on-surface font-medium"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleApply}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-body-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
