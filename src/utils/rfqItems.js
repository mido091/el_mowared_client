const cleanText = (value) => `${value ?? ''}`.trim();

function parseItems(input) {
  if (Array.isArray(input)) return input;

  if (typeof input === 'string') {
    const normalized = input.trim();
    if (!normalized) return [];

    try {
      const parsed = JSON.parse(normalized);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function normalizeRfqItems(rfq) {
  const source = parseItems(rfq?.rfq_items);
  const items = source
    .map((item, index) => ({
      label: cleanText(item?.label),
      details: cleanText(item?.details),
      order: Number(item?.order) > 0 ? Number(item.order) : index + 1
    }))
    .filter((item) => item.label && item.details)
    .sort((a, b) => a.order - b.order);

  if (items.length) return items;

  const title = cleanText(rfq?.title);
  const description = cleanText(rfq?.description);
  if (!title && !description) return [];

  return [
    {
      label: title || (rfq?.id ? `RFQ #${rfq.id}` : 'RFQ'),
      details: description || title || '',
      order: 1
    }
  ];
}

export function getRfqItemsPreview(rfq, maxItems = 2) {
  return normalizeRfqItems(rfq).slice(0, maxItems);
}

export function getRfqItemsSearchText(rfq) {
  return normalizeRfqItems(rfq)
    .map((item) => `${item.label} ${item.details}`)
    .join(' ');
}
