import { Link } from 'react-router-dom';
import { Link2, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <div style={{
                width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Link2 size={16} color="white" />
              </div>
              LostLink
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 280, color: 'rgba(255,255,255,0.6)' }}>
              A centralized campus lost and found platform connecting students and staff with their missing belongings.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/browse" className="footer-link">Browse Items</Link>
            <Link to="/report-lost" className="footer-link">Report Lost</Link>
            <Link to="/report-found" className="footer-link">Report Found</Link>
            <Link to="/dashboard" className="footer-link">My Dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <span className="footer-link" style={{ cursor: 'default' }}>Campus Lost & Found</span>
            <span className="footer-link" style={{ cursor: 'default' }}>Secure & Verified</span>
            <span className="footer-link" style={{ cursor: 'default' }}>Real-Time Updates</span>
            <span className="footer-link" style={{ cursor: 'default' }}>Community Driven</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LostLink. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Made with <Heart size={13} color="#EF4444" fill="#EF4444" /> for campus communities
          </span>
        </div>
      </div>
    </footer>
  );
}
