import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getAssetUrl from '../api/assetUrl';

const defaultAccents = ['blue', 'mint', 'violet', 'rose', 'amber', 'lime'];

const accentClasses = {
  blue: 'bg-blue-100 text-blue-700',
  mint: 'bg-emerald-100 text-emerald-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  lime: 'bg-lime-100 text-lime-700',
};

const ProductTile = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const accent = product.accent || defaultAccents[index % defaultAccents.length];
  const initial = product.name?.trim()?.[0]?.toUpperCase() || 'P';
  const iconUrl = getAssetUrl(product.icon_url);
  const hasIcon = iconUrl && !imageError;

  return (
    <button
      type="button"
      className="product-tile"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <span
        className={`product-tile-icon ${accentClasses[accent] || accentClasses.blue}`}
      >
        {hasIcon ? (
          <img
            src={iconUrl}
            alt=""
            onError={() => setImageError(true)}
          />
        ) : (
          initial
        )}
      </span>

      <span className="product-tile-label">
        {product.name}
      </span>
    </button>
  );
};

export default ProductTile;
