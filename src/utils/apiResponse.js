export function getApiEnvelope(response) {
  return response?.data ?? response ?? null;
}

export function getApiData(response) {
  const envelope = getApiEnvelope(response);
  if (
    envelope &&
    typeof envelope === 'object' &&
    !Array.isArray(envelope) &&
    Object.prototype.hasOwnProperty.call(envelope, 'data')
  ) {
    return envelope.data;
  }
  return envelope;
}

export function getApiCollection(response, collectionKeys = ['items', 'products', 'orders', 'rfqs']) {
  const data = getApiData(response);
  if (Array.isArray(data)) return data;

  for (const key of collectionKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

export function getApiMessage(response, fallback = '') {
  const envelope = getApiEnvelope(response);
  return envelope?.message || fallback;
}
