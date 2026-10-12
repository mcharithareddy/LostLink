import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, Package } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=200&fit=crop',
  'ID Cards': 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400&h=200&fit=crop',
  Books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
  Bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop',
  Keys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
  Accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=200&fit=crop',
  Other: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ItemCard({ item }) {
  const navigate = useNavigate();
  const fallbackImg = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.Other;

  return (
    <div className="item-card" onClick={() => navigate(`/items/${item.id}`)} role="button" tabIndex={0}
      onKeyPress={e => e.key === 'Enter' && navigate(`/items/${item.id}`)}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="item-card-image"
          onError={e => { e.target.src = fallbackImg; }}
        />
      ) : (
        <img src={fallbackImg} alt={item.category} className="item-card-image" />
      )}

      <div className="item-card-body">
        <div className="item-card-header">
          <div className="item-card-title">{item.title}</div>
          <StatusBadge status={item.reportType} />
        </div>

        <div className="item-card-meta">
          <div className="item-card-meta-row">
            <Tag size={12} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
            <span className="truncate">{item.category}</span>
          </div>
          <div className="item-card-meta-row">
            <MapPin size={12} style={{ color: 'var(--coral)', flexShrink: 0 }} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="item-card-meta-row">
            <Calendar size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span>{formatDate(item.itemDate)}</span>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <StatusBadge status={item.status} />
        </div>
      </div>
    </div>
  );
}
