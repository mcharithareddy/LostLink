
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Trash2, CheckCircle, XCircle,
  ClipboardList, MapPin, Calendar, ChevronRight, AlertCircle
} from 'lucide-react';
import { itemsAPI, claimsAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function DashboardPage({ toast }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('my-items');
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      // Each request is handled separately so a claims error
      // does not prevent My Reports from displaying.
      const results = await Promise.allSettled([
        itemsAPI.getMy(),
        claimsAPI.getMy(),
        claimsAPI.getReceived()
      ]);

      if (!active) return;

      const [itemsResult, claimsResult, receivedResult] = results;

      if (itemsResult.status === 'fulfilled') {
        const data = itemsResult.value.data;
        setMyItems(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : []
        );
      } else {
        console.error('Failed to load your reports:', itemsResult.reason);
        setMyItems([]);
      }

      if (claimsResult.status === 'fulfilled') {
        const data = claimsResult.value.data;
        setMyClaims(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : []
        );
      } else {
        console.error('Failed to load your claims:', claimsResult.reason);
        setMyClaims([]);
      }

      if (receivedResult.status === 'fulfilled') {
        const data = receivedResult.value.data;
        setReceivedClaims(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
              ? data.content
              : []
        );
      } else {
        console.error(
          'Failed to load received claims:',
          receivedResult.reason
        );
        setReceivedClaims([]);
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await itemsAPI.delete(deleteItem.id);

      setMyItems(prev =>
        prev.filter(item => item.id !== deleteItem.id)
      );

      toast.success('Item report deleted successfully.', 'Deleted');
      setDeleteItem(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not delete this item.',
        'Error'
      );
      setDeleteItem(null);
    }
  };

  const handleReview = async (claimId, action) => {
    setReviewLoading(claimId);

    try {
      const res = await claimsAPI.review(claimId, action);
      const updated = res.data;

      setReceivedClaims(prev =>
        prev.map(claim =>
          claim.id === claimId ? updated : claim
        )
      );

      if (action === 'approve') {
        setMyItems(prev =>
          prev.map(item =>
            item.id === updated.itemId
              ? { ...item, status: 'RETURNED' }
              : item
          )
        );

        toast.success(
          'Claim approved! The item is now marked as returned.',
          'Approved'
        );
      } else {
        toast.info('Claim rejected.', 'Rejected');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to process review.',
        'Error'
      );
    } finally {
      setReviewLoading(null);
    }
  };

  const lostCount = myItems.filter(
    item => item.reportType === 'LOST'
  ).length;

  const foundCount = myItems.filter(
    item => item.reportType === 'FOUND'
  ).length;

  const pendingClaims = receivedClaims.filter(
    claim => claim.status === 'PENDING'
  ).length;

  const tabs = [
    {
      id: 'my-items',
      label: 'My Reports',
      icon: Package,
      count: myItems.length
    },
    {
      id: 'my-claims',
      label: 'My Claims',
      icon: ClipboardList,
      count: myClaims.length
    },
    {
      id: 'received',
      label: 'Received Claims',
      icon: AlertCircle,
      count: pendingClaims > 0 ? pendingClaims : null
    }
  ];

  return (
    <div className="page-content">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <h2>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p style={{ marginTop: 6 }}>
                Manage your lost and found reports from here.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              <button
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}
                onClick={() => navigate('/report-lost')}
              >
                <Plus size={16} /> Report Lost
              </button>

              <button
                className="btn"
                style={{
                  background: 'white',
                  color: 'var(--primary)'
                }}
                onClick={() => navigate('/report-found')}
              >
                <Plus size={16} /> Report Found
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginTop: 24
            }}
          >
            {[
              {
                label: 'Total Reports',
                value: myItems.length,
                color: 'rgba(255,255,255,0.2)'
              },
              {
                label: 'Lost Items',
                value: lostCount,
                color: 'rgba(239,68,68,0.3)'
              },
              {
                label: 'Found Items',
                value: foundCount,
                color: 'rgba(16,185,129,0.3)'
              },
              {
                label: 'Pending Claims',
                value: pendingClaims,
                color: 'rgba(245,158,11,0.3)'
              }
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: stat.color,
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'white'
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: 4
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`dashboard-tab ${
                tab === t.id ? 'active' : ''
              }`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={15} />
              {t.label}

              {t.count > 0 && (
                <span
                  style={{
                    background:
                      tab === t.id
                        ? 'rgba(255,255,255,0.3)'
                        : 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: 'center'
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* My Reports */}
            {tab === 'my-items' && (
              <div>
                {myItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Package size={36} />
                    </div>

                    <h3>No reports yet</h3>
                    <p>
                      Start by reporting a lost or found item.
                    </p>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/report-lost')}
                      >
                        Report Lost Item
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/report-found')}
                      >
                        Report Found Item
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {myItems.map(item => (
                      <div
                        key={item.id}
                        className="card"
                        style={{ cursor: 'default' }}
                      >
                        <div
                          className="card-body"
                          style={{
                            display: 'flex',
                            gap: 16,
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 6,
                                flexWrap: 'wrap'
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  fontSize: '0.95rem'
                                }}
                              >
                                {item.title}
                              </span>

                              <StatusBadge status={item.reportType} />
                              <StatusBadge status={item.status} />
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: 16,
                                flexWrap: 'wrap'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <MapPin size={12} />
                                {item.location}
                              </span>

                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Calendar size={12} />
                                {formatDate(item.itemDate)}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexShrink: 0
                            }}
                          >
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                navigate(`/items/${item.id}`)
                              }
                            >
                              <ChevronRight size={14} /> View
                            </button>

                            {item.status === 'OPEN' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteItem(item)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Claims */}
            {tab === 'my-claims' && (
              <div>
                {myClaims.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <ClipboardList size={36} />
                    </div>

                    <h3>No claims submitted yet</h3>
                    <p>
                      Browse found items and claim the ones that belong to you.
                    </p>

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        navigate('/browse?reportType=FOUND')
                      }
                    >
                      Browse Found Items
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {myClaims.map(claim => (
                      <div
                        key={claim.id}
                        className="card"
                        style={{ cursor: 'default' }}
                      >
                        <div className="card-body">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: 8,
                              marginBottom: 8
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-primary)'
                                }}
                              >
                                {claim.itemTitle}
                              </span>

                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--text-secondary)',
                                  marginLeft: 8
                                }}
                              >
                                {claim.itemCategory}
                              </span>
                            </div>

                            <StatusBadge status={claim.status} />
                          </div>

                          <p
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              marginBottom: 8
                            }}
                          >
                            {claim.claimDescription}
                          </p>

                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)'
                            }}
                          >
                            Submitted: {formatDate(claim.createdAt)}
                            {claim.reviewedByName &&
                              ` · Reviewed by ${claim.reviewedByName}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Received Claims */}
            {tab === 'received' && (
              <div>
                {receivedClaims.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <AlertCircle size={36} />
                    </div>

                    <h3>No claims received</h3>
                    <p>
                      When someone claims your found item, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {receivedClaims.map(claim => (
                      <div
                        key={claim.id}
                        className="card"
                        style={{ cursor: 'default' }}
                      >
                        <div className="card-body">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: 8,
                              marginBottom: 10
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  marginBottom: 2
                                }}
                              >
                                Claim for:{' '}
                                <span style={{ color: 'var(--primary)' }}>
                                  {claim.itemTitle}
                                </span>
                              </div>

                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                by {claim.claimantName} ·{' '}
                                {formatDate(claim.createdAt)}
                              </div>
                            </div>

                            <StatusBadge status={claim.status} />
                          </div>

                          <p
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                              marginBottom: 12
                            }}
                          >
                            "{claim.claimDescription}"
                          </p>

                          {claim.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="btn btn-success btn-sm"
                                disabled={reviewLoading === claim.id}
                                onClick={() =>
                                  handleReview(claim.id, 'approve')
                                }
                                id={`approve-${claim.id}`}
                              >
                                <CheckCircle size={14} />
                                {reviewLoading === claim.id
                                  ? 'Processing...'
                                  : 'Approve & Return'}
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                disabled={reviewLoading === claim.id}
                                onClick={() =>
                                  handleReview(claim.id, 'reject')
                                }
                                id={`reject-${claim.id}`}
                              >
                                <XCircle size={14} /> Reject
                              </button>

                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() =>
                                  navigate(`/items/${claim.itemId}`)
                                }
                              >
                                View Item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {deleteItem && (
        <ConfirmModal
          title="Delete Item Report"
          message={`Are you sure you want to delete "${deleteItem.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          confirmText="Delete"
        />
      )}
    </div>
  );
}
