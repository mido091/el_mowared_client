import { computed, unref } from 'vue';

const normalizeParentId = (category) => {
  const parentId = category?.parentId ?? category?.parent_id ?? null;
  return parentId == null || parentId === '' ? null : Number(parentId);
};

export function useCategoryHierarchy(categoriesSource, localeSource = 'en') {
  const categories = computed(() => {
    const rawCategories = unref(categoriesSource) || [];
    return rawCategories
      .map((category) => {
        if (!category || typeof category !== 'object') return null;

        return {
          ...category,
          id: Number(category.id),
          parentId: normalizeParentId(category),
        };
      })
      .filter((category) => Number.isFinite(category?.id));
  });

  const localizeName = (category) => {
    const locale = unref(localeSource) || 'en';
    if (!category) return '';
    return locale === 'ar'
      ? category.name || category.name_ar || category.nameAr || category.name_en || category.nameEn || ''
      : category.name || category.name_en || category.nameEn || category.name_ar || category.nameAr || '';
  };

  const byId = computed(() => {
    const map = new Map();
    categories.value.forEach((category) => {
      map.set(Number(category.id), {
        ...category,
        label: localizeName(category),
      });
    });
    return map;
  });

  const rootCategories = computed(() =>
    categories.value
      .filter((category) => category.parentId == null)
      .map((category) => ({
        ...category,
        label: localizeName(category),
      }))
  );

  const childMap = computed(() => {
    const map = new Map();

    categories.value.forEach((category) => {
      if (category.parentId == null) return;
      const siblings = map.get(category.parentId) || [];
      siblings.push({
        ...category,
        label: localizeName(category),
      });
      map.set(category.parentId, siblings);
    });

    return map;
  });

  const getChildren = (parentId) => {
    const normalizedParentId = Number(parentId);
    if (!Number.isFinite(normalizedParentId)) return [];
    return childMap.value.get(normalizedParentId) || [];
  };

  const getCategoryById = (id) => {
    const normalizedId = Number(id);
    if (!Number.isFinite(normalizedId)) return null;
    return byId.value.get(normalizedId) || null;
  };

  const getCategoryPath = (id) => {
    const category = getCategoryById(id);
    if (!category) return [];
    if (category.parentId == null) return [category];

    const parent = getCategoryById(category.parentId);
    return parent ? [parent, category] : [category];
  };

  const getCategoryPathLabel = (id, separator = ' / ') =>
    getCategoryPath(id)
      .map((category) => category.label)
      .filter(Boolean)
      .join(separator);

  return {
    categories,
    rootCategories,
    childMap,
    byId,
    localizeName,
    getChildren,
    getCategoryById,
    getCategoryPath,
    getCategoryPathLabel,
  };
}
