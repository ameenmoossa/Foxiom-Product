import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const feedbackTypeClass = {
  'Bug Report': 'bug',
  'Feature Suggestion': 'feature',
  'UI Issue': 'ui',
  'Market Observation': 'market',
  'General Note': 'note',
};

const AdminFeedback = () => {
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setFeedbacks([]);
      return;
    }

    setLoading(true);
    api.get(`/products/${selectedProduct}/feedback`)
      .then(res => setFeedbacks(res.data))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  const selectedProductName = useMemo(() => {
    return products.find(product => product._id === selectedProduct)?.name;
  }, [products, selectedProduct]);

  const stats = [
    { label: 'Products', value: products.length },
    { label: 'Feedback Items', value: feedbacks.length },
    { label: 'Open', value: feedbacks.filter(item => item.status === 'Open').length },
    { label: 'High Priority', value: feedbacks.filter(item => item.priority === 'High').length },
  ];

  const handleStatus = async (feedbackId, status) => {
    try {
      await api.patch(`/products/${selectedProduct}/feedback/${feedbackId}/status`, { status });
      toast.success('Status updated');
      const res = await api.get(`/products/${selectedProduct}/feedback`);
      setFeedbacks(res.data);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="hub-page">
      <Navbar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Feedback Overview</h1>
            <p className="admin-page-subtitle">Review customer notes, prioritize issues, and update feedback status.</p>
          </div>
        </header>

        <section className="admin-summary-grid">
          {stats.map(stat => (
            <article key={stat.label} className="admin-summary-card">
              <p className="admin-summary-label">{stat.label}</p>
              <p className="admin-summary-value">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="feedback-control-card">
          <div className="product-field">
            <label className="product-label">Product</label>
            <select
              className="feedback-product-select"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              disabled={productsLoading}
            >
              <option value="">{productsLoading ? 'Loading products...' : 'Select a product...'}</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>{product.name}</option>
              ))}
            </select>
          </div>
          <p className="feedback-helper">
            {selectedProduct
              ? `Showing feedback for ${selectedProductName || 'selected product'}.`
              : 'Choose a product to view submitted feedback and manage its review status.'}
          </p>
        </section>

        {loading ? (
          <section className="admin-table-card">
            <div className="admin-empty-state">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#172b66] border-t-transparent" />
              <p className="admin-empty-copy">Loading feedback...</p>
            </div>
          </section>
        ) : !selectedProduct ? (
          <section className="admin-table-card">
            <div className="admin-empty-state">
              <div className="admin-empty-icon">💬</div>
              <p className="admin-empty-title">Select a product</p>
              <p className="admin-empty-copy">Pick a product above to view bug reports, feature ideas, and customer notes.</p>
            </div>
          </section>
        ) : feedbacks.length === 0 ? (
          <section className="admin-table-card">
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📭</div>
              <p className="admin-empty-title">No feedback yet</p>
              <p className="admin-empty-copy">There are no feedback items for this product. New submissions will appear here.</p>
            </div>
          </section>
        ) : (
          <section className="feedback-list">
            {feedbacks.map(feedback => (
              <article key={feedback._id} className="feedback-card">
                <div className="feedback-card-top">
                  <span className={`feedback-chip ${feedbackTypeClass[feedback.feedback_type] || 'default'}`}>
                    {feedback.feedback_type || 'Feedback'}
                  </span>
                  <span className={`feedback-priority ${(feedback.priority || '').toLowerCase()}`}>
                    {feedback.priority || 'Low'}
                  </span>
                  <select
                    className="feedback-status-select"
                    value={feedback.status}
                    onChange={e => handleStatus(feedback._id, e.target.value)}
                  >
                    {['Open', 'Under Review', 'Implemented', 'Rejected'].map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <h2 className="feedback-title">{feedback.title}</h2>
                <p className="feedback-description">{feedback.description}</p>

                <div className="feedback-meta">
                  <span>By {feedback.submitted_by?.name || 'Unknown'}</span>
                  <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  <span>{feedback.upvote_count || 0} upvotes</span>
                </div>

                {feedback.admin_reply && (
                  <div className="feedback-admin-reply">
                    Admin reply: {feedback.admin_reply}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminFeedback;
