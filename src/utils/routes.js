const normalizeSlug = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

export const buildProductSlug = (product = {}) => {
  if (product?.slug) return normalizeSlug(product.slug);

  return normalizeSlug(
    product?.name_en
      || product?.name_ar
      || product?.title
      || product?.name
      || `product-${product?.id || ''}`
  );
};

export const buildProductPath = (product = {}) => {
  const id = Number(product?.id || product?.product_id || 0);
  if (!id) return '/products';

  const slug = buildProductSlug(product);
  return slug ? `/products/${slug}-${id}` : `/products/${id}`;
};

