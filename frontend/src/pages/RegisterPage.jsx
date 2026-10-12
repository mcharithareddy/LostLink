import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage({ toast }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '', general: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Your account has been created!', 'Welcome to LostLink');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#EF4444', '#F59E0B', '#10B981'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Link2 size={28} />
          </div>
          <h2 style={{ marginBottom: 4 }}>Create Account</h2>
          <p style={{ fontSize: '0.9rem' }}>Join your campus community on LostLink</p>
        </div>

        {errors.general && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', background: '#FEE2E2', borderRadius: 'var(--radius)',
            marginBottom: 20, fontSize: '0.875rem', color: '#991B1B'
          }}>
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <span className="form-error"><AlertCircle size={12}/>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">College Email</label>
            <input
              id="reg-email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="student@college.edu"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error"><AlertCircle size={12}/>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              <button type="button"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {form.password && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height: 3, flex: 1, borderRadius: 2,
                    background: i <= strength ? strengthColors[strength] : 'var(--border)',
                    transition: 'background 0.3s'
                  }} />
                ))}
                <span style={{ fontSize: '0.75rem', color: strengthColors[strength], fontWeight: 600, minWidth: 40 }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error"><AlertCircle size={12}/>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="form-error"><AlertCircle size={12}/>{errors.confirmPassword}</span>}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', gap: 4 }}>
                <CheckCircle size={13}/> Passwords match
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" id="register-submit"
            disabled={loading} style={{ padding: '14px', fontSize: '0.95rem', marginTop: 4 }}>
            {loading ? (
              <><div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Creating account...</>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '20px 0' }}>or</div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
