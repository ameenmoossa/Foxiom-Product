import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import getAssetUrl from '../../api/assetUrl';

const ProductIcon = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const iconUrl = getAssetUrl(product.icon_url);
  const initial = product.name?.[0]?.toUpperCase() || 'P';

  if (!iconUrl || imageError) return initial;

  return (
    <img
      src={iconUrl}
      alt={product.name}
      onError={() => setImageError(true)}
    />
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
const res = await api.get('/products?includeArchived=true');      
setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(product =>
      [product.name, product.tagline, product.category, product.status]
        .some(value => String(value || '').toLowerCase().includes(term))
    );
  }, [products, query]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/products/${id}/status`, { status });
      toast.success('Status updated');
      fetchProducts();
    } catch {
      toast.error('Failed');
    }
  };

  const activeCount = products.filter(product => product.status === 'Active').length;
  const betaCount = products.filter(product => product.status === 'Beta').length;
  const draftCount = products.filter(product => product.status === 'Draft').length;

  const stats = [
    { label: 'Total Products', value: products.length },
    { label: 'Active', value: activeCount },
    { label: 'Beta', value: betaCount },
    { label: 'Drafts', value: draftCount },
  ];

  return (
    <div className="hub-page">
      <Navbar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Product Management</h1>
            <p className="admin-page-subtitle">Create, organize, and maintain products in the hub.</p>
          </div>

          <button type="button" className="admin-primary-button" onClick={() => navigate('/admin/products/new')}>
            Add Product
          </button>
        </header>

        <section className="admin-summary-grid">
          {stats.map(stat => (
            <article key={stat.label} className="admin-summary-card">
              <p className="admin-summary-label">{stat.label}</p>
              <p className="admin-summary-value">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="admin-filter-row">
          <div className="admin-search-wrap">
            <span className="admin-search-icon" />
            <input
              className="admin-search"
              placeholder="Search products..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <button type="button" className="admin-secondary-button" onClick={() => navigate('/')}>
            View Hub
          </button>
        </section>

        <section className="admin-table-card admin-products-table">
          <div className="admin-table-header">
            <div>Product</div>
            <div>Category</div>
            <div>Status</div>
            <div>Sort</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <div className="detail-spinner" />
              <p className="admin-empty-copy">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">P</div>
              <p className="admin-empty-title">
                {products.length === 0 ? 'No products yet' : 'No matching products'}
              </p>
              <p className="admin-empty-copy">
                {products.length === 0
                  ? 'Add your first product to start building the product hub catalog.'
                  : 'Try a different search term or clear the search field.'}
              </p>
              {products.length === 0 && (
                <button type="button" className="admin-primary-button" onClick={() => navigate('/admin/products/new')}>
                  Add Product
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id} className="admin-table-row">
                <div className="admin-user-cell">
                  <span className="admin-product-icon">
                    <ProductIcon product={product} />
                  </span>
                  <span className="admin-product-copy">
                    <span className="admin-user-name">{product.name}</span>
                    <span className="admin-muted-text">{product.tagline || 'No tagline added'}</span>
                  </span>
                </div>

                <div className="admin-muted-text">{product.category || 'Uncategorized'}</div>

                <select
                  className="admin-status-select"
                  value={product.status}
                  onChange={e => handleStatus(product._id, e.target.value)}
                >
                  {['Active', 'Draft', 'Beta', 'Archived'].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <div className="admin-muted-text">#{product.sort_order ?? 0}</div>

                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-action-button activate"
                    onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-action-button delete"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminProducts;
