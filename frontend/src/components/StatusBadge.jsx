const STATUS_CONFIG = {
  OPEN:     { label: 'Open',     className: 'badge-open' },
  MATCHED:  { label: 'Matched',  className: 'badge-matched' },
  RETURNED: { label: 'Returned', className: 'badge-returned' },
  PENDING:  { label: 'Pending',  className: 'badge-pending' },
  APPROVED: { label: 'Approved', className: 'badge-approved' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
  LOST:     { label: 'Lost',     className: 'badge-lost' },
  FOUND:    { label: 'Found',    className: 'badge-found' },
  ADMIN:    { label: 'Admin',    className: 'badge-admin' },
  USER:     { label: 'User',     className: 'badge-user' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toUpperCase()] || { label: status, className: 'badge-user' };
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
