import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastBarProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastBar: React.FC<ToastBarProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    info: 'bg-teal-50 border-teal-600 text-teal-950',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-700 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0 no-print">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border-l-4 shadow-lg transition-all ${styles[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium leading-relaxed">{toast.text}</div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
