import { Listing, toPersianDigits } from '@/data/mockData';
import { BackendListingItem } from '@/lib/apiClient';

export function mapBackendListingToUi(item: BackendListingItem): Listing {
  const numericPrice = Number(item.price) || 0;
  const categoryName = item.category?.name || 'املاک';
  const cityName = item.city?.name || 'تهران';
  const neighborhood = item.neighborhood || 'مرکزی';
  const ownerName =
    item.owner?.fullName &&
    item.owner.fullName !== 'کاربر تهاتر' &&
    item.owner.fullName !== 'کاربر جدید'
      ? item.owner.fullName
      : 'ثبت‌کننده آگهی';
  const displayPhone = item.owner?.phone || item.contactPhone || '02191016487';
  const publishedAt =
    item.sourceDateFa ||
    (item.createdAt ? new Date(item.createdAt).toLocaleDateString('fa-IR') : 'امروز');

  const baseDetails =
    Array.isArray(item.detailsJson) && item.detailsJson.length > 0
      ? item.detailsJson
      : [
          { label: 'کد آگهی', value: toPersianDigits(item.code.replace('TH-', '')) },
          { label: 'دسته‌بندی', value: `${categoryName} · ${item.subcategory || 'سایر'}` },
          { label: 'شهر', value: cityName },
          { label: 'تاریخ ثبت', value: publishedAt },
          { label: 'امکان معاوضه', value: item.hasExchange ? 'بله' : 'خیر' },
        ];

  const badge = item.isUrgent
    ? ('فوری' as const)
    : item.hasExchange
    ? ('معاوضه' as const)
    : undefined;

  return {
    id: item.id,
    code: item.code,
    title: item.title,
    category: categoryName,
    subcategory: item.subcategory || 'سایر',
    city: cityName,
    neighborhood,
    price: numericPrice,
    priceLabel: item.priceLabel || (numericPrice === 0 ? 'توافقی' : undefined),
    isNegotiable: item.isNegotiable || numericPrice === 0,
    hasExchange: Boolean(item.hasExchange),
    exchangeWith: item.exchangeWith || undefined,
    hasInstallmentPlan: Boolean(item.hasInstallmentPlan),
    isVerifiedPhotos: Boolean(item.isVerifiedPhotos),
    isUrgent: Boolean(item.isUrgent),
    isTraded: Boolean(item.isTraded),
    badge,
    publishedAt,
    timeCategory: 'month',
    images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    specs: Array.isArray(item.specsJson) ? item.specsJson : [],
    details: baseDetails,
    description: item.description || item.title,
    sellerPhone: toPersianDigits(displayPhone),
    sellerName: ownerName,
    coordinates: {
      lat: typeof item.lat === 'number' ? item.lat : 35.6997,
      lng: typeof item.lng === 'number' ? item.lng : 51.338,
      streetHint: item.streetHint || neighborhood || cityName,
    },
  };
}
