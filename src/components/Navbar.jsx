import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="hub-navbar">
      <div className="hub-navbar-inner">
        <button type="button" className="hub-brand" onClick={() => navigate('/')}>
          <span className="hub-logo">F</span>
          <span className="hub-brand-copy">
            <span className="hub-brand-title">Foxiom</span>
            <span className="hub-brand-subtitle">IT Product Hub</span>
          </span>
        </button>

        <div className="hub-nav-right">
          {user?.role === 'admin' && (
            <div className="hub-nav-links">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className={`hub-nav-link ${isActive('/admin/products') ? 'active' : ''}`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className={`hub-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/feedback')}
                className={`hub-nav-link ${isActive('/admin/feedback') ? 'active' : ''}`}
              >
                Feedback
              </button>
            </div>
          )}

          <div className="hub-user">
            <span className="hub-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <span>
              <span className="hub-user-name">{user?.name}</span>
              <span className="hub-user-role">{user?.role}</span>
            </span>
          </div>

          <button type="button" className="hub-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
