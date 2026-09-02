import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface DropdownFilterProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export default function DropdownFilter({ options, value, onChange, label }: DropdownFilterProps) {
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

  const selectedOption = options.find((o) => o.value === value) || options[0];

  const handleSelect = (val: string) => {
    onChange(val);
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
        {selectedOption?.label}
        <span className={`material-symbols-outlined transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 min-w-[160px] bg-surface-container-lowest rounded-2xl shadow-premium border border-premium-border overflow-hidden animate-fade-in py-2 z-50">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSelect(o.value)}
              className={`w-full text-left px-4 py-2.5 text-body-md font-medium transition-colors hover:bg-surface-container-low ${
                value === o.value 
                  ? 'text-primary bg-primary-fixed/10' 
                  : 'text-on-surface'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
