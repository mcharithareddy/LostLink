
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Package } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CATEGORIES = [
  'Electronics',
  'ID Cards',
  'Books',
  'Bags',
  'Keys',
  'Accessories',
  'Other'
];

export function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    reportType: searchParams.get('reportType') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'newest',
    page: 0,
    size: 12
  });

  const fetchItems = useCallback(async (f) => {
    setLoading(true);

    try {
      const params = {};

      if (f.search) params.search = f.search;
      if (f.reportType) params.reportType = f.reportType;
      if (f.category) params.category = f.category;
      if (f.location) params.location = f.location;
      if (f.status) params.status = f.status;

      params.sort = f.sort;
      params.page = f.page;
      params.size = f.size;

      const res = await itemsAPI.getAll(params);
      const data = res.data;

      // Support both Spring Page responses and plain arrays.
      if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(data.length > 0 ? 1 : 0);
        setTotalElements(data.length);
      } else {
        const content = Array.isArray(data?.content)
          ? data.content
          : [];

        setItems(content);
        setTotalPages(Number(data?.totalPages) || 0);
        setTotalElements(
          Number(data?.totalElements) || content.length
        );
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);

      setItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(filters);
  }, [filters, fetchItems]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      reportType: '',
      category: '',
      location: '',
      status: '',
      sort: 'newest',
      page: 0,
      size: 12
    });

    setSearchParams({});
  };

  const hasFilters =
    filters.search ||
    filters.reportType ||
    filters.category ||
    filters.location ||
    filters.status;

  const handleSearchSubmit = event => {
    event.preventDefault();

    // Start searching from the first page.
    const updatedFilters = {
      ...filters,
      page: 0
    };

    setFilters(updatedFilters);
    fetchItems(updatedFilters);
  };

  return (
    <div className="page-content">
      <div className="container">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>Browse Items</h2>

            <p style={{ marginTop: 4 }}>
              {loading
                ? 'Loading...'
                : `${totalElements} item${
                    totalElements !== 1 ? 's' : ''
                  } found`}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">

          {/* Search */}
          <div
            className="filter-group"
            style={{ flex: 2, minWidth: 200 }}
          >
            <label className="filter-label">Search</label>

            <form
              onSubmit={handleSearchSubmit}
              style={{ display: 'flex', gap: 8 }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />

                <input
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={event =>
                    setFilters(prev => ({
                      ...prev,
                      search: event.target.value
                    }))
                  }
                  id="browse-search"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Type */}
          <div className="filter-group">
            <label className="filter-label">Type</label>

            <select
              className="form-select"
              value={filters.reportType}
              onChange={event =>
                updateFilter('reportType', event.target.value)
              }
              id="filter-type"
            >
              <option value="">All Types</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Category</label>

            <select
              className="form-select"
              value={filters.category}
              onChange={event =>
                updateFilter('category', event.target.value)
              }
              id="filter-category"
            >
              <option value="">All Categories</option>

              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="filter-group">
            <label className="filter-label">Status</label>

            <select
              className="form-select"
              value={filters.status}
              onChange={event =>
                updateFilter('status', event.target.value)
              }
              id="filter-status"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="MATCHED">Matched</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label">Sort</label>

            <select
              className="form-select"
              value={filters.sort}
              onChange={event =>
                updateFilter('sort', event.target.value)
              }
              id="filter-sort"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearFilters}
              style={{
                alignSelf: 'flex-end',
                marginBottom: 2
              }}
              id="clear-filters"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching items..." />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={36} />
            </div>

            <h3>No items found</h3>

            <p>
              Try adjusting your search filters or{' '}
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'inline',
                  padding: '0 4px',
                  color: 'var(--primary)'
                }}
                onClick={clearFilters}
              >
                clear all filters
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="item-grid">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={filters.page === 0}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      page: prev.page - 1
                    }))
                  }
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index
                )
                  .filter(
                    index => Math.abs(index - filters.page) <= 2
                  )
                  .map(index => (
                    <button
                      key={index}
                      className={`page-btn ${
                        index === filters.page ? 'active' : ''
                      }`}
                      onClick={() =>
                        setFilters(prev => ({
                          ...prev,
                          page: index
                        }))
                      }
                    >
                      {index + 1}
                    </button>
                  ))}

                <button
                  className="page-btn"
                  disabled={filters.page >= totalPages - 1}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      page: prev.page + 1
                    }))
                  }
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
