import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff' };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created');
      setShowForm(false);
      setShowPassword(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Deactivated' : 'Activated');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Deleted');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const activeUsers = users.filter(user => user.isActive).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Active Users', value: activeUsers },
    { label: 'Admins', value: adminUsers },
    { label: 'Staff', value: Math.max(users.length - adminUsers, 0) },
  ];

  return (
    <div className="hub-page">
      <Navbar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">User Management</h1>
            <p className="admin-page-subtitle">Manage team access, roles, and account status.</p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setShowPassword(false);
              setShowForm(current => !current);
            }}
          >
            {showForm ? 'Close Form' : 'Add User'}
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

        {showForm && (
          <form onSubmit={handleCreate} className="admin-form-card" autoComplete="off">
            <input type="text" name="username" autoComplete="username" hidden readOnly />
            <input type="password" name="password" autoComplete="current-password" hidden readOnly />
            <h2 className="admin-form-title">New User Profile</h2>
            <div className="admin-form-grid">
              <label className="product-field">
                <span className="product-label">Full Name</span>
                <input
                  className="admin-input"
                  placeholder="Full Name"
                  name="newUserFullName"
                  autoComplete="off"
                  value={form.name}
                  onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
                  required
                />
              </label>

              <label className="product-field">
                <span className="product-label">Email Address</span>
                <input
                  className="admin-input"
                  placeholder="Email Address"
                  type="email"
                  name="newUserEmail"
                  autoComplete="off"
                  value={form.email}
                  onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
                  required
                />
              </label>

              <label className="product-field">
                <span className="product-label">Password</span>
                <div className="admin-password-field">
                  <input
                    className="admin-input"
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="newUserPassword"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'View password'}
                    title={showPassword ? 'Hide password' : 'View password'}
                    onClick={() => setShowPassword(current => !current)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M8.3 5.1A10.8 10.8 0 0 1 12 4c5 0 8.5 4.3 9.6 6a2.4 2.4 0 0 1 0 2.1 15.8 15.8 0 0 1-2.3 2.9" />
                        <path d="M15.5 18.1A10.4 10.4 0 0 1 12 19c-5 0-8.5-4.3-9.6-6a2.4 2.4 0 0 1 0-2.1 15.4 15.4 0 0 1 3.4-3.8" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2.4 10.9C3.5 8.9 7 4 12 4s8.5 4.9 9.6 6.9a2.3 2.3 0 0 1 0 2.2C20.5 15.1 17 20 12 20S3.5 15.1 2.4 13.1a2.3 2.3 0 0 1 0-2.2Z" />
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="product-field">
                <span className="product-label">Role</span>
                <select
                  className="admin-input"
                  value={form.role}
                  onChange={e => setForm(current => ({ ...current, role: e.target.value }))}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-primary-button">Create User</button>
            </div>
          </form>
        )}

        <section className="admin-table-card">
          <div className="admin-table-header admin-users-table-header">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <div className="detail-spinner" />
              <p className="admin-empty-copy">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">U</div>
              <p className="admin-empty-title">No users yet</p>
              <p className="admin-empty-copy">
                Add your first team member to manage product access and admin permissions.
              </p>
              <button type="button" className="admin-primary-button" onClick={() => setShowForm(true)}>
                Add User
              </button>
            </div>
          ) : (
            users.map(user => (
              <div key={user._id} className="admin-table-row admin-users-table-row">
                <div className="admin-user-cell">
                  <span className="admin-user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                  <span className="admin-user-name">{user.name}</span>
                </div>

                <div className="admin-muted-text">{user.email}</div>

                <div>
                  <span className={`admin-pill ${user.role === 'admin' ? 'admin' : 'staff'}`}>
                    {user.role}
                  </span>
                </div>

                <div>
                  <span className={`admin-status ${user.isActive ? 'active' : ''}`}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="admin-actions">
                  <button
                    type="button"
                    className={`admin-action-button ${user.isActive ? 'pause' : 'activate'}`}
                    onClick={() => handleToggle(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="admin-action-button delete"
                    onClick={() => handleDelete(user._id)}
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

export default AdminUsers;
