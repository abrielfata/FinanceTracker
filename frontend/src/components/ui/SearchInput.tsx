import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  id = 'search-input',
  ariaLabel = 'Cari',
  className = '',
}: SearchInputProps) {
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange('');
  };

  return (
    <div className={`slippery-parrot-form ${className}`}>
      <button type="button" className="search-btn" aria-label="Submit search">
        <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
          <path
            d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        id={id}
        type="text"
        className="search-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={handleReset}
        className="reset-btn"
        aria-label="Clear search"
        title="Bersihkan pencarian"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
