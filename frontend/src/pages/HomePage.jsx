import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, Package, MapPin, CheckCircle,
  Smartphone, CreditCard, BookOpen, Briefcase, Key, Watch, HelpCircle,
  ArrowRight, Star, Users
} from 'lucide-react';
import { itemsAPI } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone },
  { name: 'ID Cards', icon: CreditCard },
  { name: 'Books', icon: BookOpen },
  { name: 'Bags', icon: Briefcase },
  { name: 'Keys', icon: Key },
  { name: 'Accessories', icon: Watch },
  { name: 'Other', icon: HelpCircle },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    itemsAPI.getStats().then(r => setStats(r.data)).catch(() => {});
    itemsAPI.getRecent(8).then(r => {
      setRecentItems(r.data);
      setLoadingItems(false);
    }).catch(() => setLoadingItems(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    navigate(`/browse?${params.toString()}`);
  };

  const handleCategory = (cat) => {
    navigate(`/browse?category=${encodeURIComponent(cat)}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={14} fill="currentColor" />
              Campus Lost & Found Platform
            </div>
            <h1>Lost something?<br />Let's bring it home.</h1>
            <p className="hero-desc">
              LostLink connects students and staff with their missing belongings.
              Report what you've lost or found, and let our campus community help reunite them.
            </p>

            {/* Search Bar */}
            <form className="hero-search" onSubmit={handleSearch}>
              <Search size={18} style={{ alignSelf: 'center', marginLeft: 8, color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                className="hero-search-input"
                type="text"
                placeholder="Search for lost or found items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="hero-search-input"
              />
              <select
                className="hero-search-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                id="hero-category-select"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <button type="submit" className="btn btn-primary">Find an Item</button>
            </form>

            <div className="hero-buttons">
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/browse')}>
                <Search size={18} /> Browse All Items
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => user ? navigate('/report-lost') : navigate('/login')}
              >
                <Package size={18} /> Report an Item <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'white', padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <Package size={24} color="var(--primary)" />
              </div>
              <div className="stat-value">{stats?.totalReports ?? '—'}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEE2E2' }}>
                <TrendingUp size={24} color="var(--danger)" />
              </div>
              <div className="stat-value">{stats?.lostItems ?? '—'}</div>
              <div className="stat-label">Lost Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#D1FAE5' }}>
                <MapPin size={24} color="var(--success)" />
              </div>
              <div className="stat-value">{stats?.foundItems ?? '—'}</div>
              <div className="stat-label">Found Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#D1FAE5' }}>
                <CheckCircle size={24} color="var(--success)" />
              </div>
              <div className="stat-value">{stats?.returnedItems ?? '—'}</div>
              <div className="stat-label">Successfully Returned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ paddingTop: 60 }}>
        <div className="section-title">
          <div className="section-label">Quick Browse</div>
          <h2>Browse by Category</h2>
          <p style={{ marginTop: 8 }}>Find items faster by selecting a category</p>
        </div>
        <div className="categories-row">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <button key={name} className="category-pill" onClick={() => handleCategory(name)} id={`cat-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="category-pill-icon">
                <Icon size={20} />
              </div>
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-label" style={{ textAlign: 'left', display: 'inline-block', marginBottom: 8 }}>Recent Activity</div>
            <h2>Latest Reports</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/browse')}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        {loadingItems ? (
          <LoadingSpinner text="Loading recent items..." />
        ) : recentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={36} /></div>
            <h3>No items reported yet</h3>
            <p>Be the first to report a lost or found item on campus.</p>
            <button className="btn btn-primary" onClick={() => user ? navigate('/report-lost') : navigate('/login')}>
              Report an Item
            </button>
          </div>
        ) : (
          <div className="item-grid">
            {recentItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <div className="how-it-works">
          <div className="section-title" style={{ marginBottom: 40 }}>
            <div className="section-label">Simple Process</div>
            <h2>How LostLink Works</h2>
          </div>
          <div className="steps-row">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Report</h3>
              <p>Submit a detailed report for your lost item or an item you've found on campus, including photos and location.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Match</h3>
              <p>Our community searches the database. If someone finds your item, they can submit a claim with proof.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Reunite</h3>
              <p>Review the claim, verify ownership, and arrange a safe handover to return the item to its rightful owner.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
