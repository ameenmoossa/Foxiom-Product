import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { label: '', environment: 'Demo', demo_url: '', username: '', password: '' };

const envClass = {
  Dev: 'dev',
  Staging: 'staging',
  Demo: 'demo',
};

const CredentialPanel = ({ productId }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [form, setForm] = useState(EMPTY);
  const { user } = useAuth();

  const fetchCredentials = async () => {
    try {
      const res = await api.get(`/products/${productId}/credentials`);
      setCredentials(res.data);
    } catch {
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredentials(); }, [productId]);

  const togglePassword = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text || '');
    toast.success(`${label} copied`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/products/${productId}/credentials/${editId}`, form);
        toast.success('Credential updated');
      } else {
        await api.post(`/products/${productId}/credentials`, form);
        toast.success('Credential added');
      }
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (cred) => {
    setForm({
      label: cred.label || '',
      environment: cred.environment || 'Demo',
      demo_url: cred.demo_url || '',
      username: cred.username || '',
      password: '',
    });
    setEditId(cred._id);
    setShowForm(true);
  };

  const handleDelete = async (credId) => {
    if (!confirm('Delete this credential?')) return;
    try {
      await api.delete(`/products/${productId}/credentials/${credId}`);
      toast.success('Deleted');
      fetchCredentials();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <section className="detail-panel">
      <div className="detail-panel-head">
        <div>
          <p className="detail-eyebrow">Access</p>
          <h2>Demo Credentials</h2>
          <span>Login details for product environments</span>
        </div>
        {user?.role === 'admin' && (
          <button
            type="button"
            className="detail-primary-button"
            onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null); }}
          >
            {showForm ? 'Cancel' : 'Add'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <form onSubmit={handleSubmit} className="detail-form">
          <div className="detail-form-grid">
            <label>
              Label
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required />
            </label>
            <label>
              Environment
              <select value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}>
                {['Dev', 'Staging', 'Demo'].map(env => <option key={env}>{env}</option>)}
              </select>
            </label>
            <label className="full">
              Demo URL
              <input placeholder="https://..." value={form.demo_url} onChange={e => setForm({ ...form, demo_url: e.target.value })} />
            </label>
            <label>
              Username
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder={editId ? 'Leave blank to keep current password' : ''}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
            </label>
          </div>
          <button type="submit" className="detail-primary-button wide">{editId ? 'Update Credential' : 'Save Credential'}</button>
        </form>
      )}

      {loading ? (
        <div className="detail-inline-loading"><span className="detail-spinner small" /> Loading</div>
      ) : credentials.length === 0 ? (
        <div className="detail-empty">
          <strong>No credentials yet</strong>
          <span>Add a demo URL and login set when it is ready.</span>
        </div>
      ) : (
        <div className="credential-list">
          {credentials.map(cred => (
            <article key={cred._id} className="credential-card">
              <div className="credential-card-head">
                <div>
                  <h3>{cred.label}</h3>
                  <span className={`detail-pill ${envClass[cred.environment] || 'demo'}`}>{cred.environment}</span>
                </div>
                {user?.role === 'admin' && (
                  <div className="detail-action-row">
                    <button type="button" onClick={() => handleEdit(cred)}>Edit</button>
                    <button type="button" className="danger" onClick={() => handleDelete(cred._id)}>Delete</button>
                  </div>
                )}
              </div>

              {cred.demo_url && (
                <div className="credential-line">
                  <span>URL</span>
                  <a href={cred.demo_url} target="_blank" rel="noopener noreferrer">{cred.demo_url}</a>
                </div>
              )}

              <div className="credential-line">
                <span>User</span>
                <code>{cred.username || '-'}</code>
                <button type="button" onClick={() => copyToClipboard(cred.username, 'Username')}>Copy</button>
              </div>

              <div className="credential-line">
                <span>Pass</span>
                <code>{visiblePasswords[cred._id] ? cred.password_encrypted : '••••••••••'}</code>
                <button type="button" onClick={() => togglePassword(cred._id)}>
                  {visiblePasswords[cred._id] ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={() => copyToClipboard(cred.password_encrypted, 'Password')}>Copy</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CredentialPanel;
