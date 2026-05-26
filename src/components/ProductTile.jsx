import { useNavigate } from 'react-router-dom';

const defaultAccents = ['blue', 'mint', 'violet', 'rose', 'amber', 'lime'];

const fallbackLabels = {
  blue: 'A',
  mint: 'H',
  violet: 'C',
  rose: 'I',
  amber: 'T',
  lime: 'M',
};

const ProductTile = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const accent = product.accent || defaultAccents[index % defaultAccents.length];
  const status = product.status || 'Draft';
  const statusClass = String(status).toLowerCase();

  const handleClick = () => {
    if (!product.demo) navigate(`/products/${product._id}`);
  };

  return (
    <button type="button" className="hub-product-card" onClick={handleClick}>
      <span className={`hub-card-icon ${accent}`}>
        {product.icon_url ? (
          <img src={`http://localhost:5000${product.icon_url}`} alt={product.name} />
        ) : (
          product.name?.[0]?.toUpperCase() || fallbackLabels[accent] || 'P'
        )}
      </span>

      <span className="hub-card-title">{product.name}</span>
      <span className="hub-card-copy">
        {product.tagline || product.description || 'Product information and workspace tools.'}
      </span>

      <span className={`hub-status ${statusClass}`}>{status}</span>
      {!product.demo && <span className="hub-card-open">Open product</span>}
    </button>
  );
};

export default ProductTile;
