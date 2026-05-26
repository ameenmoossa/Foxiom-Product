import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductTile from '../components/ProductTile';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const countSince = (items, field, date) => {
  return items.filter(item => item[field] && new Date(item[field]) >= date).length;
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    users: [],
    feedback: [],
    feedbackLoaded: false,
    usersLoaded: false,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const productsRes = await api.get('/products');
        const nextProducts = productsRes.data || [];
        setProducts(nextProducts);

        const feedbackRequests = nextProducts.map(product =>
          api.get(`/products/${product._id}/feedback`).then(res => res.data || []).catch(() => [])
        );

        const [feedbackGroups, usersRes] = await Promise.all([
          Promise.all(feedbackRequests),
          user?.role === 'admin'
            ? api.get('/users').catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        setDashboard({
          users: usersRes.data || [],
          feedback: feedbackGroups.flat(),
          feedbackLoaded: true,
          usersLoaded: user?.role === 'admin',
        });
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.role]);

  const filters = useMemo(() => {
    const statuses = products
      .map(product => product.status)
      .filter(Boolean)
      .filter((status, index, all) => all.indexOf(status) === index);

    return ['All', ...statuses];
  }, [products]);

  const searched = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filtered = searched.filter(product => {
    if (activeFilter === 'All') return true;
    return String(product.status || '').toLowerCase() === activeFilter.toLowerCase();
  });

  const monthStart = startOfMonth();
  const productsThisMonth = countSince(products, 'createdAt', monthStart);
  const feedbackThisMonth = countSince(dashboard.feedback, 'createdAt', monthStart);
  const openFeedback = dashboard.feedback.filter(item => item.status === 'Open').length;
  const activeProducts = products.filter(product => product.status === 'Active').length;
  const activeUsers = dashboard.users.filter(item => item.isActive).length;

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      note: `${productsThisMonth} added this month`,
      icon: '01',
    },
    {
      label: 'Active Products',
      value: activeProducts,
      note: `${products.length - activeProducts} not active`,
      icon: '02',
    },
    {
      label: 'Feedback Items',
      value: dashboard.feedbackLoaded ? dashboard.feedback.length : '...',
      note: `${openFeedback} open${feedbackThisMonth ? `, ${feedbackThisMonth} new this month` : ''}`,
      icon: '03',
      warn: openFeedback > 0,
    },
    {
      label: user?.role === 'admin' ? 'Team Members' : 'Catalog Status',
      value: user?.role === 'admin' ? dashboard.users.length : 'Live',
      note: user?.role === 'admin' ? `${activeUsers} active users` : 'Synced with backend',
      icon: '04',
    },
  ];

  return (
    <div className="hub-page">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="hub-main">
        <section className="hub-header">
          <div>
            <h1 className="hub-title">All Products</h1>
            <p className="hub-count">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} available in the directory
            </p>
          </div>

          {user?.role === 'admin' && (
            <button type="button" className="hub-add" onClick={() => navigate('/admin/products/new')}>
              Add Product
            </button>
          )}
        </section>

        <section className="hub-stats">
          {stats.map(stat => (
            <article key={stat.label} className="hub-stat-card">
              <div className="hub-stat-content">
                <p className="hub-stat-label">{stat.label}</p>
                <p className="hub-stat-value">{stat.value}</p>
                <p className={`hub-stat-note ${stat.warn ? 'warn' : ''}`}>{stat.note}</p>
              </div>
              <span className="hub-stat-icon">{stat.icon}</span>
            </article>
          ))}
        </section>

        <section className="hub-filters">
          {filters.map(filter => (
            <button
              key={filter}
              type="button"
              className={`hub-filter ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </section>

        {loading ? (
          <section className="hub-loading">Loading products...</section>
        ) : filtered.length === 0 ? (
          <section className="admin-empty-state hub-empty-card">
            <div className="admin-empty-icon">?</div>
            <h3 className="admin-empty-title">No matching products</h3>
            <p className="admin-empty-copy">
              Try another search term or switch to a different status filter.
            </p>
          </section>
        ) : (
          <section className="hub-grid">
            {filtered.map((product, index) => (
              <ProductTile key={product._id} product={product} index={index} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
