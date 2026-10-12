import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Tag, User, AlertCircle,
  CheckCircle, Package, Clock, MessageSquare, Image
} from 'lucide-react';
import { itemsAPI, claimsAPI } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=500&fit=crop',
  'ID Cards': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&h=500&fit=crop',
  Books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop',
  Bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=500&fit=crop',
  Keys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
  Accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=500&fit=crop',
  Other: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ItemDetailPage({ toast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimText, setClaimText] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    itemsAPI.getById(id)
      .then(r => { setItem(r.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/404'); });
  }, [id, navigate]);

  const handleClaim = async e => {
    e.preventDefault();
    if (!claimText.trim()) { setClaimError('Please describe why you believe this is your item.'); return; }
    setClaiming(true);
    setClaimError('');
    try {
      await claimsAPI.submit({ itemId: parseInt(id), claimDescription: claimText });
      toast.success('Your claim has been submitted! The reporter will review it.', 'Claim Submitted');
      setClaimed(true);
      setShowClaimForm(false);
      setItem(prev => ({ ...prev, status: 'MATCHED' }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit claim. Please try again.';
      setClaimError(msg);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="page-content"><LoadingSpinner /></div>;
  if (!item) return null;

  const isOwner = user?.id === item.ownerId;
  const canClaim = user && !isOwner && item.reportType === 'FOUND' && item.status !== 'RETURNED';
  const fallbackImg = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.Other;

  return (
    <div className="page-content">
      <div className="container">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="item-detail">
          {/* Left: Image + Info */}
          <div>
            <div className="item-detail-image">
              <img
                src={item.imageUrl || fallbackImg}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.src = fallbackImg; }}
              />
            </div>

            <div className="card" style={{ marginTop: 24, boxShadow: 'none' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.title}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <StatusBadge status={item.reportType} />
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="card-body">
                {item.description && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Description</h4>
                    <p style={{ lineHeight: 1.7 }}>{item.description}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Category</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 600 }}>{item.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      {item.reportType === 'LOST' ? 'Last Seen Location' : 'Found Location'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={15} color="var(--coral)" />
                      <span style={{ fontWeight: 600 }}>{item.location}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      {item.reportType === 'LOST' ? 'Date Lost' : 'Date Found'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={15} color="var(--secondary)" />
                      <span style={{ fontWeight: 600 }}>{formatDate(item.itemDate)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Reported By</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 600 }}>{item.ownerName}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Reported On</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600 }}>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Claim Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status Info */}
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: 16 }}>Item Status</h3>
                {item.status === 'RETURNED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#D1FAE5', borderRadius: 'var(--radius)', color: '#065F46' }}>
                    <CheckCircle size={20} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Successfully Returned</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>This item has been returned to its owner.</div>
                    </div>
                  </div>
                ) : item.status === 'MATCHED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#FEF3C7', borderRadius: 'var(--radius)', color: '#92400E' }}>
                    <Clock size={20} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Under Review</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>A claim has been submitted and is being reviewed.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#E0F2FE', borderRadius: 'var(--radius)', color: '#0369A1' }}>
                    <Package size={20} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Available</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {item.reportType === 'FOUND'
                          ? 'This found item is awaiting its owner.'
                          : 'This lost item is still being searched for.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Form (only for FOUND items) */}
            {item.reportType === 'FOUND' && (
              <div className="card" style={{ boxShadow: 'none' }}>
                <div className="card-header">
                  <h3>Is this your item?</h3>
                </div>
                <div className="card-body">
                  {!user ? (
                    <div>
                      <p style={{ marginBottom: 14, fontSize: '0.9rem' }}>Sign in to submit a claim for this item.</p>
                      <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>
                        Sign In to Claim
                      </button>
                    </div>
                  ) : isOwner ? (
                    <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      This is your own report. You can manage it from your{' '}
                      <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        dashboard
                      </button>.
                    </div>
                  ) : claimed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#D1FAE5', borderRadius: 'var(--radius)', color: '#065F46' }}>
                      <CheckCircle size={20} />
                      <div>
                        <div style={{ fontWeight: 700 }}>Claim Submitted!</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Check your dashboard for status updates.</div>
                      </div>
                    </div>
                  ) : item.status === 'RETURNED' ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>This item has already been returned.</p>
                  ) : (
                    <>
                      {!showClaimForm ? (
                        <div>
                          <p style={{ fontSize: '0.875rem', marginBottom: 14, lineHeight: 1.6 }}>
                            If you believe this item belongs to you, submit a claim with a description explaining how you can identify it.
                          </p>
                          <button className="btn btn-primary btn-block" onClick={() => setShowClaimForm(true)} id="claim-btn">
                            <MessageSquare size={16} /> Submit a Claim
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleClaim}>
                          <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label" htmlFor="claim-desc">Describe your ownership proof</label>
                            <textarea
                              id="claim-desc"
                              className={`form-textarea ${claimError ? 'error' : ''}`}
                              placeholder="E.g., My phone has a blue case with a cracked back, contains photos of my dog, locked with PIN 123..."
                              value={claimText}
                              onChange={e => { setClaimText(e.target.value); setClaimError(''); }}
                              rows={4}
                            />
                            {claimError && (
                              <span className="form-error">
                                <AlertCircle size={12} /> {claimError}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowClaimForm(false)}>
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={claiming} style={{ flex: 1 }}>
                              {claiming ? 'Submitting...' : 'Submit Claim'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {item.reportType === 'LOST' && (
              <div className="card" style={{ boxShadow: 'none' }}>
                <div className="card-body">
                  <h4 style={{ marginBottom: 8 }}>Found this item?</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                    If you've found this item on campus, please report it as a found item so the owner can claim it.
                  </p>
                  <button className="btn btn-primary btn-block" style={{ marginTop: 14 }}
                    onClick={() => user ? navigate('/report-found') : navigate('/login')}>
                    Report as Found
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
