import React, { useRef } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  className = '',
  placeholder = '0',
  id,
  ...props
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format nilai number ke display string lokal Indonesia
  const displayValue =
    value !== undefined && value !== null && !isNaN(value) && value > 0
      ? value.toLocaleString('id-ID')
      : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd, value: currentVal } = input;
      // Jika kursor persis di belakang titik pemisah ribuan (contoh: "50.|000") dan tidak ada seleksi teks
      if (selectionStart !== null && selectionStart === selectionEnd && selectionStart > 1) {
        if (currentVal[selectionStart - 1] === '.') {
          e.preventDefault();
          // Hapus digit di depan titik tersebut
          const beforeDot = currentVal.slice(0, selectionStart - 1);
          const afterDot = currentVal.slice(selectionStart);
          const newBeforeDot = beforeDot.slice(0, -1);
          const newRaw = (newBeforeDot + afterDot).replace(/\D/g, '');
          const cleanDigits = newRaw.replace(/^0+/, '');

          if (!cleanDigits) {
            onChange(undefined);
            return;
          }

          const num = parseInt(cleanDigits, 10);
          onChange(num);

          const formatted = num.toLocaleString('id-ID');
          const targetDigits = newBeforeDot.replace(/\D/g, '').length;

          requestAnimationFrame(() => {
            let digitCount = 0;
            let newCursor = 0;
            for (let i = 0; i < formatted.length; i++) {
              if (/\d/.test(formatted[i])) digitCount++;
              if (digitCount === targetDigits) {
                newCursor = i + 1;
                break;
              }
            }
            input.setSelectionRange(newCursor, newCursor);
          });
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawText = input.value;
    const cursor = input.selectionStart || 0;

    // Hitung jumlah digit angka sebelum posisi kursor saat ini
    const digitsBeforeCursor = rawText.slice(0, cursor).replace(/\D/g, '').length;

    // Bersihkan karakter non-digit dan leading zeroes
    const cleanDigits = rawText.replace(/\D/g, '').replace(/^0+/, '');

    if (!cleanDigits) {
      onChange(undefined);
      return;
    }

    const num = parseInt(cleanDigits, 10);
    onChange(num);

    const formatted = num.toLocaleString('id-ID');

    // Kembalikan posisi kursor sesuai jumlah digit angka sebelum perubahan
    requestAnimationFrame(() => {
      let digitCount = 0;
      let newCursor = formatted.length;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      input.setSelectionRange(newCursor, newCursor);
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      id={id}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}
