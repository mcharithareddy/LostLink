import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', confirmClass = 'btn-danger' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="var(--danger)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
