import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-2">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
            isDestructive ? 'bg-error-container/30 text-error' : 'bg-primary-container/30 text-primary'
          }`}>
            <span className="material-symbols-outlined text-3xl">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-[280px] leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl font-medium text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-error hover:bg-error/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
