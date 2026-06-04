import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STORE_BADGES = {
  android:
    'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
  ios:
    'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
};

const TABS = [
  { id: 'production', label: 'Production' },
  { id: 'development', label: 'Development' },
];

const PLATFORM_OPTIONS = {
  production: [
    { value: 'android', label: 'Android App' },
    { value: 'ios', label: 'iOS App' },
    { value: 'apk', label: 'APK Download' },
    { value: 'website', label: 'Website' },
  ],
  development: [
    { value: 'android', label: 'Android App' },
    // { value: 'ios', label: 'iOS App' },
    { value: 'apk', label: 'APK Download' },
    { value: 'website', label: ' Website' },
    // { value: 'staging', label: 'Staging' },
    { value: 'testing', label: 'Testing' },
  ],
};

const platformLabel = Object.values(PLATFORM_OPTIONS)
  .flat()
  .reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {});

const getDefaultPlatform = (environment) => {
  const first = PLATFORM_OPTIONS?.[environment]?.[0];
  return first?.value || '';
};

const EMPTY_FORM = {
  environment: 'production',
  platform: getDefaultPlatform('production'),
  url: '',
  username: '',
  password: '',
};


const CredentialPanel = ({ productId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('production');
  const [form, setForm] = useState(EMPTY_FORM);

  const activeLinks = useMemo(
    () => links.filter((l) => (l.environment || 'production') === activeTab),
    [links, activeTab]
  );

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}/credentials`);
      setLinks(res.data || []);
    } catch {
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}/credentials`);
        if (!cancelled) setLinks(res.data || []);
      } catch {
        if (!cancelled) toast.error('Failed to load credentials');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const resetForm = (environment = activeTab) => {
    setForm({
      environment,
      platform: getDefaultPlatform(environment),
      url: '',
      username: '',
      password: '',
    });
    setEditId(null);
  };

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    if (!editId) resetForm(tabId);
  };

  const handleEdit = (item) => {
    const environment = item.environment || 'production';
    setActiveTab(environment);
    setForm({
      environment,
      platform: item.platform || getDefaultPlatform(environment),
      url: item.url || '',
      username: item.email || item.username || '',
      password: item.password || '',
    });
    setEditId(item._id);
    setShowForm(true);
  };

  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || '');
      toast.success(`${label} copied`);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete?._id) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/products/${productId}/credentials/${pendingDelete._id}`);
      toast.success('Deleted');
      setPendingDelete(null);
      await fetchCredentials();
    } catch {
      toast.error('Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      environment: form.environment,
      platform: form.platform,
      url: form.url,
      username: form.username,
    };

    const shouldSendPassword = !editId || (form.password || '').trim() !== '';
    if (shouldSendPassword) {
      payload.password = form.password;
    }

    try {
      if (editId) {
        await api.put(`/products/${productId}/credentials/${editId}`, payload);
        toast.success('Credential updated');
      } else {
        await api.post(`/products/${productId}/credentials`, payload);
        toast.success('Credential added');
      }

      setShowForm(false);
      resetForm(form.environment);
      await fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const renderLinkButton = (link) => {
    const url = link.url;

    if (link.platform === 'android') {
      return (
        <a
          className="detail-demo-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Google Play"
        >
          <img
            src={STORE_BADGES.android}
            alt="Get it on Google Play"
            style={{ height: 28, width: 'auto' }}
          />
        </a>
      );
    }

    if (link.platform === 'ios') {
      return (
        <a
          className="detail-demo-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Apple App Store"
        >
          <img
            src={STORE_BADGES.ios}
            alt="Download on the App Store"
            style={{ height: 28, width: 'auto' }}
          />
        </a>
      );
    }

    if (link.platform === 'apk') {
      return (
        <a
          className="detail-primary-button"
          href={url}
          download
          target="_self"
          rel="noreferrer"
        >
          <span aria-hidden="true">↓</span> Download APK
        </a>
      );
    }

    return (
      <a className="detail-demo-link" href={url} target="_blank" rel="noopener noreferrer">
        <span aria-hidden="true">⤴</span> Visit Website
      </a>
    );
  };

  return (
    <section className={`detail-panel access-panel ${activeTab}`}>
      <div className="detail-panel-head">
        <div>
          <p className="detail-eyebrow">Access</p>
          <h2>Demo Credentials</h2>
          <span>Platform links for product environments</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="detail-primary-button"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditId(null);
                resetForm(activeTab);
              } else {
                setShowForm(true);
                setEditId(null);
                resetForm(activeTab);
              }
            }}
          >
            {showForm ? 'Cancel' : 'Add'}
          </button>
        )}
      </div>

      <div className="access-tabs" role="tablist" aria-label="Access environments">
        <span className="access-tab-light" aria-hidden="true" />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`access-tab ${t.id} ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="detail-form">
          <div className="detail-form-grid">
            <label>
              Environment
              <select value={form.environment} onChange={(e) => resetForm(e.target.value)}>
                {TABS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Platform
              <select
                value={form.platform}
                onChange={(e) => setForm((cur) => ({ ...cur, platform: e.target.value }))}
              >
                {(PLATFORM_OPTIONS[form.environment] || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="full">
              URL
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm((cur) => ({ ...cur, url: e.target.value }))}
                required
              />
            </label>

            <label className="full">
              Email
              <input
                type="email"
                placeholder="demo@example.com"
                value={form.username}
                onChange={(e) => setForm((cur) => ({ ...cur, username: e.target.value }))}
                required
              />
            </label>

            <label className="full">
              Password
              <input
                type="text"
                placeholder={editId ? 'Leave blank to keep existing password' : 'Demo password'}
                value={form.password}
                onChange={(e) => setForm((cur) => ({ ...cur, password: e.target.value }))}
                required={!editId}
              />
            </label>
          </div>

          <button type="submit" className="detail-primary-button wide">
            {editId ? 'Update Credential' : 'Save Credential'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="detail-inline-loading">
          <span className="detail-spinner small" /> Loading
        </div>
      ) : activeLinks.length === 0 ? (
        <div className="detail-empty">
          <strong>No {activeTab} credentials yet</strong>
          <span>Add a URL and platform info when it is ready.</span>
        </div>
      ) : (
        <div className="access-link-list">
          {activeLinks.map((link) => (
            <article key={link._id} className="access-link-card">
              <div className="access-link-content">
                <div className="access-link-main">
                  <div className="access-platform-row">
                    <span className="access-platform-label">{platformLabel[link.platform] || link.platform}</span>
                    {renderLinkButton(link)}
                  </div>
                </div>

                {(link.email || link.username || link.password) && (
                  <div className="access-credential-list">
                    {(link.email || link.username) && (
                      <div className="access-credential-row">
                        <span>Email</span>
                        <strong>{link.email || link.username}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(link.email || link.username, 'Email')}
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {link.password && (
                      <div className="access-credential-row">
                        <span>Password</span>
                        <strong>{visiblePasswords[link._id] ? link.password : '••••••••'}</strong>
                        <button type="button" onClick={() => togglePassword(link._id)}>
                          {visiblePasswords[link._id] ? 'Hide' : 'Show'}
                        </button>
                        <button type="button" onClick={() => copyToClipboard(link.password, 'Password')}>
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="detail-action-row access-link-actions">
                  <button type="button" onClick={() => handleEdit(link)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => setPendingDelete(link)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="access-confirm-backdrop" role="presentation">
          <div
            className="access-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-credential-title"
          >
            <div className="access-confirm-icon" aria-hidden="true">!</div>
            <div className="access-confirm-content">
              <p className="detail-eyebrow">Confirm Delete</p>
              <h3 id="delete-credential-title">Delete credential link?</h3>
              <p>
                This will remove the {platformLabel[pendingDelete.platform] || 'selected'} access
                link from this product.
              </p>
            </div>
            <div className="access-confirm-actions">
              <button
                type="button"
                className="access-confirm-secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="access-confirm-danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CredentialPanel;

