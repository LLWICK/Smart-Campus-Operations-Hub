import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  };

  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${iconColors[variant]}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all active:scale-[0.98] focus:ring-2 focus:ring-offset-2 shadow-sm ${buttonColors[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
