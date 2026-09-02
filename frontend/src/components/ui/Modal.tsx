import { ReactNode, useEffect } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-premium-md animate-slide-in">
        <div className="px-6 py-5 border-b border-premium-border flex items-center justify-between">
          <h3 className="font-headline text-headline-md font-semibold text-on-surface">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
