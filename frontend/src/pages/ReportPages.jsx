import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, CalendarDays } from 'lucide-react';
import { itemsAPI } from '../services/api';

const CATEGORIES = ['Electronics', 'ID Cards', 'Books', 'Bags', 'Keys', 'Accessories', 'Other'];

function ReportForm({ reportType, toast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', location: '',
    itemDate: new Date().toISOString().slice(0, 10), imageUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Item name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.itemDate) errs.itemDate = 'Date is required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await itemsAPI.create({
        ...form,
        reportType,
        itemDate: form.itemDate,
      });
      toast.success(`Your ${reportType.toLowerCase()} report has been submitted!`, 'Report Created');
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const isLost = reportType === 'LOST';
  const accent = isLost ? '#EF4444' : '#10B981';

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <div className="report-form-card">
        <div className="report-form-header" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            background: accent, color: 'white', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: 700, marginBottom: 12
          }}>
            {isLost ? '😟 Report Lost Item' : '🎉 Report Found Item'}
          </div>
          <h2>{isLost ? 'Report a Lost Item' : 'Report a Found Item'}</h2>
          <p style={{ marginTop: 6, fontSize: '0.9rem' }}>
            {isLost
              ? "Tell us what you've lost. The more detail you provide, the better chance of recovery."
              : "Thank you for being helpful! Report the item you found so the owner can claim it."}
          </p>
        </div>

        <form className="report-form-body" onSubmit={handleSubmit} id={`${reportType.toLowerCase()}-form`}>
          <div className="form-group">
            <label className="form-label" htmlFor="item-title">Item Name *</label>
            <input
              id="item-title"
              className={`form-input ${errors.title ? 'error' : ''}`}
              name="title"
              placeholder={isLost ? 'e.g., Black iPhone 14, Blue Backpack...' : 'e.g., Found blue Nokia phone...'}
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error"><AlertCircle size={12}/>{errors.title}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-category">Category *</label>
              <select
                id="item-category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="form-error"><AlertCircle size={12}/>{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-date">
                {isLost ? 'Date Lost *' : 'Date Found *'}
              </label>
              <input
                id="item-date"
                className={`form-input ${errors.itemDate ? 'error' : ''}`}
                type="date"
                name="itemDate"
                value={form.itemDate}
                onChange={handleChange}
                max={new Date().toISOString().slice(0, 10)}
              />
              {errors.itemDate && <span className="form-error"><AlertCircle size={12}/>{errors.itemDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-location">
              {isLost ? 'Last Seen Location *' : 'Found Location *'}
            </label>
            <input
              id="item-location"
              className={`form-input ${errors.location ? 'error' : ''}`}
              name="location"
              placeholder={isLost ? 'e.g., Library 2nd Floor, Canteen...' : 'e.g., Near the main gate, Parking lot B...'}
              value={form.location}
              onChange={handleChange}
            />
            {errors.location && <span className="form-error"><AlertCircle size={12}/>{errors.location}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-description">Description</label>
            <textarea
              id="item-description"
              className="form-textarea"
              name="description"
              placeholder={isLost
                ? 'Describe the item in detail: color, brand, any identifying marks, contents...'
                : 'Describe the item you found: its condition, any contents visible, where exactly...'}
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-image">Image URL (optional)</label>
            <div style={{ position: 'relative' }}>
              <Upload size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="item-image"
                className="form-input"
                name="imageUrl"
                placeholder="https://example.com/photo.jpg"
                value={form.imageUrl}
                onChange={handleChange}
                style={{ paddingLeft: 36 }}
              />
            </div>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ marginTop: 8, height: 100, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Paste a direct link to your item photo. Supported: jpg, png, webp.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
              id={`${reportType.toLowerCase()}-submit`}
            >
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Submitting...</>
              ) : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReportLostPage({ toast }) {
  return (
    <div className="page-content">
      <ReportForm reportType="LOST" toast={toast} />
    </div>
  );
}

export function ReportFoundPage({ toast }) {
  return (
    <div className="page-content">
      <ReportForm reportType="FOUND" toast={toast} />
    </div>
  );
}
