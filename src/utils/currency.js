export const getCurrencyLocale = (locale = 'en') => (locale === 'ar' ? 'ar-EG' : 'en-EG');

export const formatEGPCurrency = (value, locale = 'en', options = {}) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(getCurrencyLocale(locale), {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(amount);
};

export const formatEGPRange = (from, to, locale = 'en', options = {}) => {
  const min = Number(from || 0);
  const max = Number(to || 0);

  if (max > min) {
    return `${formatEGPCurrency(min, locale, options)} - ${formatEGPCurrency(max, locale, options)}`;
  }

  return formatEGPCurrency(min, locale, options);
};
