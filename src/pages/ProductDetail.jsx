import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import CredentialPanel from '../components/CredentialPanel';

import FeedbackPanel from '../components/FeedbackPanel';

import getAssetUrl from '../api/assetUrl';

const statusClass = {
  Active: 'active', ACTIVE: 'active',
  Beta: 'beta', BETA: 'beta',
  Archived: 'archived', ARCHIVED: 'archived',
  Draft: 'draft', DRAFT: 'draft',
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setImageError(false);
        const res = await api.get(`/products/${id}`);
        if (!cancelled) setProduct(res.data);
      } catch {
        if (!cancelled) toast.error('Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-loading">
          <span className="detail-spinner" />
          Loading product
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-page">
        <div className="detail-loading">Product not found.</div>
      </div>
    );
  }

  const initial = product.name?.[0]?.toUpperCase() || 'P';
  const status = statusClass[product.status] || 'draft';
  const iconUrl = getAssetUrl(product.icon_url);
  const hasIcon = iconUrl && !imageError;

  return (
    <div className="detail-page">
      <Navbar />

      <main className="detail-main">
        <div className="detail-breadcrumb">
          <button type="button" onClick={() => navigate('/')}>Home</button>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className="detail-hero">
          <div className="detail-hero-top">
            <div className="detail-product-icon">
              {hasIcon ? (
                <img
                  src={iconUrl}
                  alt=""
                  onError={() => setImageError(true)}
                />
              ) : (
                initial
              )}
            </div>

            <div className="detail-title-block">
              <div className="detail-title-row">
                <h1>{product.name}</h1>
                <span className={`detail-status ${status}`}>{product.status || 'Draft'}</span>
              </div>

              <div className="detail-meta-row">
                {product.category && <span>{product.category}</span>}
                {product.tagline && <span>{product.tagline}</span>}
              </div>

              {product.description && (
                <p className="detail-description">{product.description}</p>
              )}
            </div>
          </div>

          {product.demo_video_url && (
            <a href={product.demo_video_url} target="_blank" rel="noopener noreferrer" className="detail-demo-link">
              <span>Play</span>
              Watch demo video
            </a>
          )}
        </section>

        <div className="detail-layout">
          <div className="detail-content">
            <section className="detail-card">
              <div className="detail-section-heading">
                <p>Product Overview</p>
                <h2>What this product offers</h2>
              </div>

              <div className="detail-grid two">
                <div className="detail-mini-panel">
                  <h3>Key Features</h3>
                  {product.features?.length > 0 ? (
                    <ul className="detail-feature-list">
                      {product.features.map((feature, index) => (
                        <li key={`${feature}-${index}`}>
                          <span />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-muted">No features listed yet.</p>
                  )}
                </div>

                <div className="detail-mini-panel">
                  <h3>Technologies Used</h3>
                  {product.tech_stack?.length > 0 ? (
                    <div className="detail-chip-row">
                      {product.tech_stack.map((tech, index) => (
                        <span key={`${tech}-${index}`} className="detail-chip">{tech}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="detail-muted">No technologies listed yet.</p>
                  )}
                </div>
              </div>
            </section>

            {product.use_cases?.length > 0 && (
              <section className="detail-card">
                <div className="detail-section-heading">
                  <p>Use Cases</p>
                  <h2>Where it fits</h2>
                </div>
                <div className="detail-grid two">
                  {product.use_cases.map((useCase, index) => (
                    <div key={`${useCase.title}-${index}`} className="detail-use-case">
                      <h3>{useCase.title}</h3>
                      <p>{useCase.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {product.media?.length > 0 && (
              <section className="detail-card">
                <div className="detail-section-heading">
                  <p>Gallery</p>
                  <h2>Screenshots</h2>
                </div>
                <div className="detail-media-grid">
                  {product.media.map((media, index) => (
                    <img key={`${media}-${index}`} src={getAssetUrl(media)} alt="" />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="detail-side">
            <CredentialPanel productId={id} />

            <FeedbackPanel productId={id} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
