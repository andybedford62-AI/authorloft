'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { onToast, type Toast } from '@/lib/use-toast';

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = onToast((toast) => {
      setToasts(prev => [...prev, toast]);

      if (toast.duration !== null) {
        const timer = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="h-5 w-5 text-green-500" />,
          error: <AlertCircle className="h-5 w-5 text-red-500" />,
          warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          info: <Info className="h-5 w-5 text-blue-500" />,
        };

        const bgColors = {
          success: 'bg-green-50 border-green-200 text-green-800',
          error: 'bg-red-50 border-red-200 text-red-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          info: 'bg-blue-50 border-blue-200 text-blue-800',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border ${bgColors[toast.type]} animate-in slide-in-from-right duration-300`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-semibold underline hover:opacity-80"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 mt-0.5 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
