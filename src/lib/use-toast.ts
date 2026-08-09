import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Global toast state
let toastListeners: Array<(toast: Toast) => void> = [];
let toastId = 0;

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number; // ms, null = manual dismiss
}

/**
 * Subscribe to toast events. Returns unsubscribe function.
 */
export function onToast(listener: (toast: Toast) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter(l => l !== listener);
  };
}

/**
 * Hook to show toast notifications.
 */
export function useToast() {
  return useCallback((type: ToastType, message: string, options?: { action?: Toast['action']; duration?: number }) => {
    const id = String(toastId++);
    const toast: Toast = {
      id,
      type,
      message,
      ...options,
      duration: options?.duration ?? (type === 'error' ? 5000 : 3000),
    };
    toastListeners.forEach(listener => listener(toast));
    return id;
  }, []);
}

/**
 * Standalone function to show a toast.
 */
export function showToast(type: ToastType, message: string, options?: { action?: Toast['action']; duration?: number }) {
  const id = String(toastId++);
  const toast: Toast = {
    id,
    type,
    message,
    ...options,
    duration: options?.duration ?? (type === 'error' ? 5000 : 3000),
  };
  toastListeners.forEach(listener => listener(toast));
  return id;
}
