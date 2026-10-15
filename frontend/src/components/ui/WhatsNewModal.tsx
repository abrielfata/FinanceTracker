import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LATEST_UPDATE, type ReleaseUpdate } from '../../config/changelog';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  release?: ReleaseUpdate;
}

export const LAST_SEEN_STORAGE_KEY = 'fitrack_last_seen_version';

export default function WhatsNewModal({ isOpen, onClose, release = LATEST_UPDATE }: WhatsNewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleAcknowledge();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAcknowledge = () => {
    try {
      localStorage.setItem(LAST_SEEN_STORAGE_KEY, release.version);
    } catch (e) {
      console.warn('Failed to save last seen version in localStorage', e);
    }
    onClose();
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Baru':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Peningkatan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Perbaikan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-premium-border';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleAcknowledge}
      />

      {/* Modal Container */}
      <div 
        className="relative z-10 bg-surface-container-lowest rounded-3xl w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-slide-in my-auto border border-premium-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-premium-border flex items-start justify-between bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white tracking-wide uppercase">
                  v{release.version}
                </span>
                <span className="text-xs text-on-surface-variant">
                  • {release.date}
                </span>
              </div>
              <h2 id="whats-new-title" className="font-headline text-headline-sm sm:text-headline-md font-bold text-on-surface">
                {release.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors shrink-0"
            aria-label="Tutup pembaruan"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          <p className="text-body-sm text-on-surface-variant">
            {release.subtitle}
          </p>

          <div className="space-y-3 pt-1">
            {release.highlights.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl border border-premium-border bg-surface-container-lowest/70 hover:bg-surface-container-lowest hover:border-primary/30 transition-all flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <h3 className="font-body text-body-md font-bold text-on-surface">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeStyle(item.badge)}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-premium-border bg-surface-container-lowest shrink-0">
          <button
            onClick={handleAcknowledge}
            className="w-full bg-premium-charcoal text-white hover:bg-premium-charcoal/90 py-3 px-5 rounded-xl font-body text-body-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Saya Mengerti & Lanjutkan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
