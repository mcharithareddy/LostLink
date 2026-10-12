import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast(message, 'success', title),
    error: (message, title = 'Error') => addToast(message, 'error', title),
    warning: (message, title = 'Warning') => addToast(message, 'warning', title),
    info: (message, title = 'Info') => addToast(message, 'info', title),
  };

  return { toasts, toast, removeToast };
}
