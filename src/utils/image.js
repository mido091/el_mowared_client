const CLOUDINARY_HOST_PATTERN = /res\.cloudinary\.com/i;

export const isCloudinaryUrl = (url = '') => CLOUDINARY_HOST_PATTERN.test(String(url));

export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return '';

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  if (!isCloudinaryUrl(url)) return url;

  const transforms = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (width || height) transforms.push(`c_${crop}`);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
};

export const buildSrcSet = (url, widths = []) => {
  if (!url || !isCloudinaryUrl(url) || !widths.length) return '';

  return widths
    .map((width) => `${optimizeImageUrl(url, { width })} ${width}w`)
    .join(', ');
};
