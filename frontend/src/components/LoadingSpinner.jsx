export function LoadingSpinner({ size = 'default', text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {text && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</p>}
    </div>
  );
}

export function InlineSpinner() {
  return <div className="spinner spinner-sm" style={{ display: 'inline-block' }} />;
}
