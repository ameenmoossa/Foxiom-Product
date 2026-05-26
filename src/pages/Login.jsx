import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-copy">
          <div className="login-brand">
            <span className="login-logo">F</span>
            <span>
              <strong>Foxiom</strong>
              <small>IT Product Hub</small>
            </span>
          </div>

          <h1>Access every product workspace from one hub.</h1>
          <p>
            Sign in to manage product catalogs, demo credentials, feedback, and internal team access.
          </p>

          <div className="login-highlights">
            <span>Products</span>
            <span>Credentials</span>
            <span>Feedback</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-card">
          <div className="login-card-head">
            <p>Welcome Back</p>
            <h2>Sign in to continue</h2>
          </div>

          <label className="login-field">
            Email Address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@foxiom.com"
              value={form.email}
              onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
            />
          </label>

          <label className="login-field">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
            />
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>

      <p className="login-footer">Foxiom IT Solutions © 2026</p>
    </main>
  );
};

export default Login;
