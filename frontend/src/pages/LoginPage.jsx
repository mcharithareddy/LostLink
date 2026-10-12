import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ toast }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to LostLink!', 'Logged In');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Link2 size={28} />
          </div>
          <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: '0.9rem' }}>Sign in to your LostLink account</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', background: '#FEE2E2', borderRadius: 'var(--radius)',
            marginBottom: 20, fontSize: '0.875rem', color: '#991B1B'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={14} style={{ display: 'inline', marginRight: 4 }} />
              Email Address
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="student@college.edu"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={14} style={{ display: 'inline', marginRight: 4 }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="form-input"
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer'
                }}
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            id="login-submit"
            disabled={loading}
            style={{ padding: '14px', fontSize: '0.95rem', marginTop: 4 }}
          >
            {loading ? (
              <><div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '20px 0' }}>or</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
