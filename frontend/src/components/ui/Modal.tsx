import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-premium-md animate-slide-in my-auto">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-premium-border flex items-center justify-between shrink-0 bg-surface-container-lowest">
          <h3 className="font-headline text-headline-sm sm:text-headline-md font-semibold text-on-surface truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="px-4 py-5 sm:px-6 sm:py-6 overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
