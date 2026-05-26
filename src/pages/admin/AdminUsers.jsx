import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

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
      setForm({ name: '', email: '', password: '', role: 'staff' });
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

          <button type="button" className="admin-primary-button" onClick={() => setShowForm(!showForm)}>
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
          <form onSubmit={handleCreate} className="admin-form-card">
            <h2 className="admin-form-title">New User Profile</h2>
            <div className="admin-form-grid">
              <label className="product-field">
                <span className="product-label">Full Name</span>
                <input
                  className="admin-input"
                  placeholder="Full Name"
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
                  value={form.email}
                  onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
                  required
                />
              </label>

              <label className="product-field">
                <span className="product-label">Password</span>
                <input
                  className="admin-input"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
                  required
                />
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
