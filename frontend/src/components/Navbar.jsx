import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Link2, Search, LayoutDashboard, LogOut, User, ShieldCheck, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Link2 size={18} />
          </div>
          LostLink
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar-nav">
          <li><NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>Home</NavLink></li>
          <li><NavLink to="/browse" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Browse Items</NavLink></li>
          {user && <>
            <li><NavLink to="/report-lost" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Report Lost</NavLink></li>
            <li><NavLink to="/report-found" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Report Found</NavLink></li>
            <li><NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>My Dashboard</NavLink></li>
            {isAdmin && <li><NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Admin</NavLink></li>}
          </>}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : (
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setDropdownOpen(v => !v)} title={user.name}>
                {initials}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                  <button className="user-dropdown-item" onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>
                    <LayoutDashboard size={16} /> My Dashboard
                  </button>
                  <button className="user-dropdown-item" onClick={() => { navigate('/report-lost'); setDropdownOpen(false); }}>
                    <PlusCircle size={16} /> Report Lost Item
                  </button>
                  <button className="user-dropdown-item" onClick={() => { navigate('/report-found'); setDropdownOpen(false); }}>
                    <PlusCircle size={16} /> Report Found Item
                  </button>
                  {isAdmin && (
                    <button className="user-dropdown-item" onClick={() => { navigate('/admin'); setDropdownOpen(false); }}>
                      <ShieldCheck size={16} /> Admin Panel
                    </button>
                  )}
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
            {mobileOpen ? <><span /><span style={{opacity:0}}/><span /></> : <><span /><span /><span /></>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid var(--border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: 'var(--shadow)'
        }}>
          <NavLink to="/" className="navbar-link" onClick={() => setMobileOpen(false)} end>Home</NavLink>
          <NavLink to="/browse" className="navbar-link" onClick={() => setMobileOpen(false)}>Browse Items</NavLink>
          {user && <>
            <NavLink to="/report-lost" className="navbar-link" onClick={() => setMobileOpen(false)}>Report Lost</NavLink>
            <NavLink to="/report-found" className="navbar-link" onClick={() => setMobileOpen(false)}>Report Found</NavLink>
            <NavLink to="/dashboard" className="navbar-link" onClick={() => setMobileOpen(false)}>My Dashboard</NavLink>
            {isAdmin && <NavLink to="/admin" className="navbar-link" onClick={() => setMobileOpen(false)}>Admin</NavLink>}
          </>}
          {!user ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{flex:1}} onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--danger)' }} onClick={() => { handleLogout(); setMobileOpen(false); }}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
