import { ReactNode, useEffect } from 'react';

interface Props { title: string; onClose: () => void; children: ReactNode }

/** Basic accessible dialog: closes on Escape or backdrop click. */
export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-full w-full max-w-md overflow-y-auto rounded-t-xl bg-surface p-6 shadow-xl sm:rounded-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
