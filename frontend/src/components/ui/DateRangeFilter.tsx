import { useState, useRef, useEffect } from 'react';

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
    const start = `${startY}-${String(startM).padStart(2, '0')}-26`;
    const end = `${currentTahun}-${String(currentBulan).padStart(2, '0')}-25`;
    
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
    const start = `${startY}-${String(startM).padStart(2, '0')}-26`;
    const end = `${prevTahun}-${String(prevBulan).padStart(2, '0')}-25`;
    
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
        <div className="absolute left-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-premium border border-premium-border animate-fade-in p-4 z-50">
          <p className="text-body-sm font-bold text-on-surface mb-3 border-b border-premium-border pb-2">Pilih Rentang Waktu</p>
          
          <div className="flex flex-col gap-2 mb-4">
            <button 
              onClick={handlePresetBulanIni}
              className="text-left px-3 py-2 text-body-sm rounded-lg hover:bg-surface-container-low transition-colors text-on-surface"
            >
              🗓️ Siklus Bulan Ini (Tgl 26 - 25)
            </button>
            <button 
              onClick={handlePresetBulanLalu}
              className="text-left px-3 py-2 text-body-sm rounded-lg hover:bg-surface-container-low transition-colors text-on-surface"
            >
              ⏮️ Siklus Bulan Lalu
            </button>
          </div>

          <div className="border-t border-premium-border pt-3 mb-3">
            <p className="text-xs font-bold text-on-surface-variant mb-2">Atau pilih manual:</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-on-surface-variant mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={tempStart} 
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-on-surface-variant mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={tempEnd} 
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleApply}
            className="w-full bg-primary text-on-primary py-2 rounded-xl text-body-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}
