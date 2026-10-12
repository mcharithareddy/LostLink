import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Package, ClipboardList, TrendingUp,
  Trash2, UserCheck, CheckCircle, XCircle, ChevronRight, Search
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/ConfirmModal';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminDashboardPage({ toast }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [s, u, i, c] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
          adminAPI.getItems(),
          adminAPI.getClaims(),
        ]);
        setStats(s.data);
        setUsers(u.data);
        setItems(i.data);
        setClaims(c.data);
      } catch (err) {
        toast.error('Failed to load admin data.', 'Error');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      toast.success('User deleted.', 'Done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.', 'Error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await adminAPI.deleteItem(deleteTarget.id);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast.success('Item deleted.', 'Done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item.', 'Error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handlePromote = async (userId) => {
    try {
      const res = await adminAPI.promoteUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
      toast.success('User promoted to Admin.', 'Promoted');
    } catch (err) {
      toast.error('Failed to promote user.', 'Error');
    }
  };

  const handleReview = async (claimId, action) => {
    setReviewLoading(claimId);
    try {
      const res = await adminAPI.reviewClaim(claimId, action);
      setClaims(prev => prev.map(c => c.id === claimId ? res.data : c));
      toast.success(`Claim ${action}d successfully.`, 'Done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review claim.', 'Error');
    } finally {
      setReviewLoading(null);
    }
  };

  const filteredItems = items.filter(i =>
    !searchQ || i.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQ.toLowerCase())
  );

  const TABS = [
    { id: 'stats', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'items', label: `Items (${items.length})`, icon: Package },
    { id: 'claims', label: `Claims (${claims.length})`, icon: ClipboardList },
  ];

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #1E1B4B, #4F46E5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={24} color="white" />
            </div>
            <div>
              <h2>Admin Dashboard</h2>
              <p>LostLink management console</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`dashboard-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSearchQ(''); }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Stats */}
            {tab === 'stats' && stats && (
              <div className="grid-3" style={{ gap: 20 }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
                  { label: 'Total Reports', value: stats.totalReports, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
                  { label: 'Lost Items', value: stats.lostItems, color: '#EF4444', bg: '#FEE2E2' },
                  { label: 'Found Items', value: stats.foundItems, color: '#10B981', bg: '#D1FAE5' },
                  { label: 'Pending Claims', value: stats.pendingClaims, color: '#F59E0B', bg: '#FEF3C7' },
                  { label: 'Items Returned', value: stats.returnedItems, color: '#06B6D4', bg: '#E0F2FE' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-icon" style={{ background: s.bg }}>
                      <TrendingUp size={22} color={s.color} />
                    </div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search users..."
                      value={searchQ} onChange={e => setSearchQ(e.target.value)} id="admin-user-search" />
                  </div>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td><StatusBadge status={u.role} /></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(u.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {u.role !== 'ADMIN' && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handlePromote(u.id)}
                                  title="Promote to Admin" id={`promote-${u.id}`}>
                                  <UserCheck size={14} />
                                </button>
                              )}
                              {u.role !== 'ADMIN' && (
                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget({ ...u, type: 'user' })}
                                  title="Delete User" id={`delete-user-${u.id}`}>
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Items */}
            {tab === 'items' && (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search items..."
                      value={searchQ} onChange={e => setSearchQ(e.target.value)} id="admin-item-search" />
                  </div>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Reporter</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600, maxWidth: 200 }} className="truncate">{item.title}</td>
                          <td>{item.category}</td>
                          <td><StatusBadge status={item.reportType} /></td>
                          <td><StatusBadge status={item.status} /></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{item.ownerName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(item.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/items/${item.id}`)}>
                                <ChevronRight size={14} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget({ ...item, type: 'item' })}
                                id={`admin-delete-item-${item.id}`}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Claims */}
            {tab === 'claims' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {claims.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><ClipboardList size={36} /></div>
                    <h3>No claims yet</h3>
                  </div>
                ) : claims.map(claim => (
                  <div key={claim.id} className="card" style={{ cursor: 'default' }}>
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>Claim for: {claim.itemTitle}</span>
                          <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>by {claim.claimantName}</span>
                        </div>
                        <StatusBadge status={claim.status} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                        "{claim.claimDescription}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        Submitted: {formatDate(claim.createdAt)}
                        {claim.reviewedByName && ` · Reviewed by ${claim.reviewedByName}`}
                      </div>
                      {claim.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-success btn-sm" disabled={reviewLoading === claim.id}
                            onClick={() => handleReview(claim.id, 'approve')} id={`admin-approve-${claim.id}`}>
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" disabled={reviewLoading === claim.id}
                            onClick={() => handleReview(claim.id, 'reject')} id={`admin-reject-${claim.id}`}>
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.type === 'user' ? 'User' : 'Item'}`}
          message={`Are you sure you want to delete "${deleteTarget.name || deleteTarget.title}"? This cannot be undone.`}
          onConfirm={deleteTarget.type === 'user' ? handleDeleteUser : handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
