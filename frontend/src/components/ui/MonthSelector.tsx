import { useState, useRef, useEffect } from 'react';
import { NAMA_BULAN } from '../../utils/helpers';

interface MonthSelectorProps {
  selectedBulan: number;
  selectedTahun: number;
  onChange: (bulan: number, tahun: number) => void;
  label?: string;
  generateMonths?: number;
}

export default function MonthSelector({ 
  selectedBulan, 
  selectedTahun, 
  onChange, 
  label,
  generateMonths = 12 
}: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate recent months
  const recentMonths = [];
  const currentDate = new Date();
  // Include some future months if needed, but usually we just want current and past.
  // We'll generate current month + future 1 month, and the rest past.
  for (let i = -1; i < generateMonths - 1; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    recentMonths.push({ bulan: d.getMonth() + 1, tahun: d.getFullYear() });
  }

  const handleSelect = (bulan: number, tahun: number) => {
    onChange(bulan, tahun);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <p className="font-body text-body-sm text-on-surface-variant mb-1">{label}</p>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-headline text-headline-md text-on-surface hover:text-primary transition-colors focus:outline-none rounded-lg focus:ring-2 focus:ring-primary/20 p-1 -ml-1 whitespace-nowrap bg-transparent"
      >
        {NAMA_BULAN[selectedBulan - 1]} {selectedTahun}
        <span className={`material-symbols-outlined transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 max-h-[300px] overflow-y-auto custom-scrollbar bg-surface-container-lowest rounded-2xl shadow-premium border border-premium-border animate-fade-in py-2 z-50">
          {recentMonths.map((m) => (
            <button
              key={`${m.bulan}-${m.tahun}`}
              onClick={() => handleSelect(m.bulan, m.tahun)}
              className={`w-full text-left px-4 py-2.5 text-body-md font-medium transition-colors hover:bg-surface-container-low ${
                selectedBulan === m.bulan && selectedTahun === m.tahun 
                  ? 'text-primary bg-primary-fixed/10' 
                  : 'text-on-surface'
              }`}
            >
              {NAMA_BULAN[m.bulan - 1]} {m.tahun}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
