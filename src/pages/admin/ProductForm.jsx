import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import getAssetUrl from '../../api/assetUrl';

const EMPTY = {
  name: '',
  tagline: '',
  description: '',
  category: 'Development',
  status: 'Draft',
  tech_stack: '',
  features: '',
  demo_video_url: '',
  sort_order: 0,
};

const EMPTY_USE_CASE = { title: '', description: '' };
const MAX_MEDIA_IMAGES = 5;
const MAX_MEDIA_IMAGE_SIZE = 5 * 1024 * 1024;
const MEDIA_IMAGE_TYPES = ['image/png', 'image/jpeg'];

const Field = ({ label, children, full = false }) => (
  <div className={`product-field ${full ? 'full' : ''}`}>
    <label className="product-label">{label}</label>
    {children}
  </div>
);

const ProductForm = () => {
  const [form, setForm] = useState(EMPTY);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [useCases, setUseCases] = useState([{ ...EMPTY_USE_CASE }]);
  const [mediaImages, setMediaImages] = useState([]);
  const mediaImagesRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data;
        setForm({
          name: p.name || '',
          tagline: p.tagline || '',
          description: p.description || '',
          category: p.category || 'Development',
          status: p.status || 'Draft',
          tech_stack: (p.tech_stack || []).join(', '),
          features: (p.features || []).join(', '),
          demo_video_url: p.demo_video_url || '',
          sort_order: p.sort_order || 0,
        });
        setUseCases(
          p.use_cases?.length
            ? p.use_cases.map(useCase => ({
                title: useCase.title || '',
                description: useCase.description || '',
              }))
            : [{ ...EMPTY_USE_CASE }]
        );
        if (p.icon_url) setIconPreview(p.icon_url);

      });
    }
  }, [id, isEdit]);

  useEffect(() => {
    mediaImagesRef.current = mediaImages;
  }, [mediaImages]);

  useEffect(() => {
    return () => {
      mediaImagesRef.current.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};


const handleIconChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const base64 = await convertToBase64(file);
  setIcon(base64);
  setIconPreview(base64);
};

  const splitCommaList = (value) => value.split(',').map(item => item.trim()).filter(Boolean);

  const updateUseCase = (index, key, value) => {
    setUseCases(current =>
      current.map((useCase, currentIndex) =>
        currentIndex === index ? { ...useCase, [key]: value } : useCase
      )
    );
  };

  const addUseCase = () => {
    setUseCases(current => [...current, { ...EMPTY_USE_CASE }]);
  };

  const removeUseCase = (index) => {
    setUseCases(current => {
      if (current.length === 1) return [{ ...EMPTY_USE_CASE }];
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleMediaImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = '';

    if (!selectedFiles.length) return;

    const availableSlots = MAX_MEDIA_IMAGES - mediaImages.length;
    if (availableSlots <= 0) {
      toast.error('You can upload up to 5 media images.');
      return;
    }

    const validFiles = [];
    selectedFiles.forEach(file => {
      if (!MEDIA_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} must be a PNG or JPG image.`);
        return;
      }

      if (file.size > MAX_MEDIA_IMAGE_SIZE) {
        toast.error(`${file.name} must be 5MB or smaller.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > availableSlots) {
      toast.error('Only 5 media images can be selected.');
    }

    const imagesToAdd = validFiles.slice(0, availableSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setMediaImages(current => [...current, ...imagesToAdd]);
  };

  const removeMediaImage = (index) => {
    setMediaImages(current => {
      const imageToRemove = current[index];
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const useCasesPayload = useCases
        .map(useCase => ({
          title: useCase.title.trim(),
          description: useCase.description.trim(),
        }))
        .filter(useCase => useCase.title || useCase.description);

      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tech_stack' || k === 'features') {
          const arr = splitCommaList(v);
          arr.forEach(item => formData.append(k, item));
        } else {
          formData.append(k, v);
        }
      });
      formData.append('use_cases', JSON.stringify(useCasesPayload));
if (icon) formData.append('icon_base64', icon);      
mediaImages.forEach(image => formData.append('media_images', image.file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please sign in again, then create the product.');
      } else {
        toast.error(err.response?.data?.message || 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  return (
    <div className="hub-page">
      <Navbar />

      <main className="product-form-main">
        <header className="product-form-header">
          <div>
            <h1 className="product-form-title">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="product-form-subtitle">
              {isEdit ? 'Update the product details and catalog settings.' : 'Create a polished product entry for the hub.'}
            </p>
          </div>

          <button type="button" onClick={() => navigate('/admin/products')} className="product-form-back">
            Back to products
          </button>
        </header>

        <form onSubmit={handleSubmit} className="product-form-layout">
          <aside className="product-form-side">
            <div className="product-icon-preview">
              {iconPreview ? (
                <img src={iconPreview} alt="Product icon preview" />
              ) : (
                form.name?.[0]?.toUpperCase() || '?'
              )}
            </div>

            <p className="product-upload-title">Product Icon</p>
            <p className="product-upload-copy">
              Upload a clear PNG or SVG. Square icons work best.
            </p>

            <label className="product-upload-button">
              Upload Icon
              <input type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
            </label>

            <div className="product-help-card">
              <p className="product-help-title">Tips for a clean listing</p>
              <ul className="product-help-list">
                <li>Keep the name short and recognizable.</li>
                <li>Use the tagline for the product card summary.</li>
                <li>Separate features and tech stack items with commas.</li>
              </ul>
            </div>
          </aside>



          

          <div className="product-form-panel">
            <section className="product-form-section">
              <h2 className="product-form-section-title">Basic Info</h2>
              <div className="product-form-grid">
                <Field label="Product Name*">
                  <input
                    className="product-input"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    required
                    placeholder="e.g. CorpConnect"
                  />
                </Field>

                <Field label="Tagline (max 80 chars)">
                  <input
                    className="product-input"
                    maxLength={80}
                    value={form.tagline}
                    onChange={e => updateField('tagline', e.target.value)}
                    placeholder="Short description..."
                  />
                </Field>

                <Field label="Description" full>
                  <textarea
                    className="product-input"
                    rows={4}
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Full product description..."
                  />
                </Field>
              </div>
            </section>

            <section className="product-form-section">
              <h2 className="product-form-section-title">Catalog Settings</h2>
              <div className="product-form-grid">
                <Field label="Category">
                  <select className="product-input" value={form.category} onChange={e => updateField('category', e.target.value)}>
                    {['Development', 'App', 'Internal Tool', 'SaaS', 'API', 'Mobile App', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Status">
                  <select className="product-input" value={form.status} onChange={e => updateField('status', e.target.value)}>
                    {['Draft', 'Active', 'Beta', 'Archived'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Demo Video URL">
                  <input
                    className="product-input"
                    value={form.demo_video_url}
                    onChange={e => updateField('demo_video_url', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </Field>

                <Field label="Sort Order">
                  <input
                    className="product-input"
                    type="number"
                    value={form.sort_order}
                    onChange={e => updateField('sort_order', e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className="product-form-section">
              <h2 className="product-form-section-title">Technical Details</h2>
              <div className="product-form-grid">
                <Field label="Tech Stack" full>
                  <input
                    className="product-input"
                    value={form.tech_stack}
                    onChange={e => updateField('tech_stack', e.target.value)}
                    placeholder="React, Node.js, MongoDB, Socket.io"
                  />
                </Field>

                <Field label="Key Features" full>
                  <input
                    className="product-input"
                    value={form.features}
                    onChange={e => updateField('features', e.target.value)}
                    placeholder="Real-time messaging, File uploads, Notifications"
                  />
                </Field>
              </div>
            </section>

            <section className="product-form-section">
              <div className="product-section-head">
                <h2 className="product-form-section-title">Use Cases</h2>
                <button type="button" className="product-add-row" onClick={addUseCase}>
                  + Add Use Case
                </button>
              </div>

              <div className="product-use-case-list">
                {useCases.map((useCase, index) => (
                  <div className="product-use-case-row" key={index}>
                    <div className="product-use-case-fields">
                      <Field label="Title" full>
                        <input
                          className="product-input"
                          value={useCase.title}
                          onChange={e => updateUseCase(index, 'title', e.target.value)}
                          placeholder="e.g. Internal knowledge base"
                        />
                      </Field>

                      <Field label="Description" full>
                        <textarea
                          className="product-input"
                          rows={3}
                          value={useCase.description}
                          onChange={e => updateUseCase(index, 'description', e.target.value)}
                          placeholder="Describe how teams use this product..."
                        />
                      </Field>
                    </div>

                    <button
                      type="button"
                      className="product-remove-row"
                      onClick={() => removeUseCase(index)}
                      aria-label="Remove use case"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="product-form-section">
              <h2 className="product-form-section-title">Media Images</h2>

              <label className="product-media-upload">
                Upload Media Images
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={handleMediaImagesChange}
                  disabled={mediaImages.length >= MAX_MEDIA_IMAGES}
                />
              </label>

              <p className="product-media-note">
                PNG or JPG only. Up to 5 images, 5MB each.
              </p>

              {mediaImages.length > 0 && (
                <div className="product-media-preview-grid">
                  {mediaImages.map((image, index) => (
                    <div className="product-media-preview" key={image.preview}>
                      <img src={image.preview} alt={`Media preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeMediaImage(index)}
                        aria-label="Remove media image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="product-form-actions">
              <button type="button" className="product-cancel" onClick={() => navigate('/admin/products')}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="product-submit">
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProductForm;
