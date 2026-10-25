import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type Kind = 'success' | 'error';
interface Toast { id: number; kind: Kind; text: string }
interface ToastApi { notify: (kind: Kind, text: string) => void }

const ToastContext = createContext<ToastApi>({ notify: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`max-w-sm rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${t.kind === 'error' ? 'bg-brake' : 'bg-pine'}`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
