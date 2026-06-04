import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        <form onSubmit={handleSubmit} className="login-card">
          <div className="login-brand">
            <span className="login-logo">F</span>
            <span>
              <strong>Foxiom</strong>
              <small>IT Product Hub</small>
            </span>
          </div>

          <div className="login-card-head">
            <p>Welcome Back</p>
            <h1>Sign in to continue</h1>
            <span>Manage products, credentials, feedback, and team access from one place.</span>
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
            <span className="login-password-control">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(current => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                    <path d="M9.88 4.24A10.55 10.55 0 0 1 12 4c5 0 9 4.5 10 8a11.8 11.8 0 0 1-3.12 4.73" />
                    <path d="M6.1 6.1A11.8 11.8 0 0 0 2 12c1 3.5 5 8 10 8a10.9 10.9 0 0 0 5.02-1.23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </span>
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
