import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const Icon = icons[toast.type] || Info;
  return (
    <div className={`toast toast-${toast.type} ${toast.removing ? 'removing' : ''}`}>
      <div className="toast-icon">
        <Icon size={18} />
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close btn" onClick={() => onRemove(toast.id)}>
        <X size={14} />
      </button>
    </div>
  );
}
