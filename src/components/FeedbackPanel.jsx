import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = {
  feedback_type: 'Bug Report',
  title: '',
  description: '',
  priority: 'Medium',
};

const typeClass = {
  'Bug Report': 'bug',
  'Feature Suggestion': 'feature',
  'UI Issue': 'ui',
  'Market Observation': 'market',
  'General Note': 'note',
};

const priorityClass = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const statusClass = {
  Open: 'open',
  'Under Review': 'review',
  Implemented: 'done',
  Rejected: 'rejected',
};

const FeedbackPanel = ({ productId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();

  const fetchFeedback = async () => {
    try {
      const res = await api.get(`/products/${productId}/feedback`);
      setFeedbacks(res.data);
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [productId]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/feedback`, form);
      toast.success('Feedback submitted');
      setForm(EMPTY);
      setShowForm(false);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (feedbackId) => {
    try {
      await api.post(`/products/${productId}/feedback/${feedbackId}/upvote`);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatus = async (feedbackId, status) => {
    try {
      await api.patch(`/products/${productId}/feedback/${feedbackId}/status`, { status });
      toast.success('Status updated');
      fetchFeedback();
    } catch {
      toast.error('Failed');
    }
  };

  const handleReply = async (feedbackId) => {
    try {
      await api.post(`/products/${productId}/feedback/${feedbackId}/reply`, { reply: replyText });
      toast.success('Reply added');
      setReplyId(null);
      setReplyText('');
      fetchFeedback();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <section className="detail-panel">
      <div className="detail-panel-head">
        <div>
          <p className="detail-eyebrow">Feedback</p>
          <h2>Suggestions</h2>
          <span>{feedbacks.length} item{feedbacks.length !== 1 ? 's' : ''} submitted</span>
        </div>
        <button type="button" className="detail-primary-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="detail-form">
          <div className="detail-form-grid">
            <label>
              Type
              <select value={form.feedback_type} onChange={e => setForm({ ...form, feedback_type: e.target.value })}>
                {['Bug Report', 'Feature Suggestion', 'UI Issue', 'Market Observation', 'General Note'].map(type => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['Low', 'Medium', 'High'].map(priority => <option key={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="full">
              Title
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="full">
              Details
              <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </label>
          </div>
          <button type="submit" disabled={submitting} className="detail-primary-button wide">
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="detail-inline-loading"><span className="detail-spinner small" /> Loading</div>
      ) : feedbacks.length === 0 ? (
        <div className="detail-empty">
          <strong>No feedback yet</strong>
          <span>Capture bugs, UI notes, and product ideas here.</span>
        </div>
      ) : (
        <div className="feedback-thread">
          {feedbacks.map(feedback => (
            <article key={feedback._id} className="feedback-item">
              <div className="feedback-tags">
                <span className={`feedback-tag ${typeClass[feedback.feedback_type] || 'note'}`}>{feedback.feedback_type}</span>
                <span className={`feedback-priority-tag ${priorityClass[feedback.priority] || 'medium'}`}>{feedback.priority}</span>
                <span className={`feedback-status-tag ${statusClass[feedback.status] || 'open'}`}>{feedback.status}</span>
                {user?.role === 'admin' && (
                  <select value={feedback.status} onChange={e => handleStatus(feedback._id, e.target.value)}>
                    {['Open', 'Under Review', 'Implemented', 'Rejected'].map(status => <option key={status}>{status}</option>)}
                  </select>
                )}
              </div>

              <h3>{feedback.title}</h3>
              <p>{feedback.description}</p>

              <div className="feedback-meta-row">
                <span>{feedback.submitted_by?.name || 'Unknown'}</span>
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                <button type="button" onClick={() => handleUpvote(feedback._id)}>
                  Upvote {feedback.upvote_count}
                </button>
              </div>

              {feedback.admin_reply && (
                <div className="feedback-reply">
                  <strong>Admin response</strong>
                  {feedback.admin_reply}
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="feedback-reply-box">
                  {replyId === feedback._id ? (
                    <>
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
                      <button type="button" onClick={() => handleReply(feedback._id)}>Send</button>
                      <button type="button" onClick={() => setReplyId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setReplyId(feedback._id)}>Reply</button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeedbackPanel;
