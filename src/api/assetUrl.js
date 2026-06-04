const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://foxiom-product-backend.onrender.com/api';
const assetBaseUrl = (import.meta.env.VITE_ASSET_URL || apiBaseUrl.replace(/\/api\/?$/, '')).replace(/\/$/, '');

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${assetBaseUrl}${normalizedPath}`;
};

export default getAssetUrl;
