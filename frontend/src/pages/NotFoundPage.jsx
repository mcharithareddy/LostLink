import { useNavigate } from 'react-router-dom';
import { Link2, Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(124,58,237,0.08) 0%, transparent 60%), var(--bg)'
    }}>
      <div style={{
        width: 100, height: 100, background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, boxShadow: '0 20px 48px rgba(124,58,237,0.35)', fontSize: '2.5rem'
      }}>
        🔍
      </div>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: 8 }}>
        404
      </h1>
      <h2 style={{ marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ maxWidth: 400, lineHeight: 1.7, marginBottom: 32, color: 'var(--text-secondary)' }}>
        Oops! Looks like this page got lost too. Let's help you find your way back.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/browse')}>
          <Search size={16} /> Browse Items
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <Home size={16} /> Go Home
        </button>
      </div>
    </div>
  );
}
