import React from 'react';
import { useSalon } from '../context/SalonContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useSalon();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-zinc-900 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-amber-400 text-zinc-950 border-amber-500',
    error: 'bg-white text-zinc-900 border-red-200 shadow-xl',
    info: 'bg-zinc-900 text-white border-zinc-800',
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={dismissToast}
          className="p-1 hover:opacity-75 transition-opacity"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
