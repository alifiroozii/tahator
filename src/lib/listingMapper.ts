import { Listing, formatJalaliFa, formatToman, toPersianDigits } from '@/data/mockData';
import { IRAN_CITY_COORDS_MAP } from '@/data/iranLocations';
import { BackendListingItem } from '@/lib/apiClient';

function resolveCityFallbackCoords(cityName: string, seed: string): [number, number] {
  const base = IRAN_CITY_COORDS_MAP[cityName.trim()] || IRAN_CITY_COORDS_MAP['تهران'] || [35.6997, 51.338];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const latJitter = (((hash & 0xff) / 255) - 0.5) * 0.032;
  const lngJitter = ((((hash >> 8) & 0xff) / 255) - 0.5) * 0.042;
  return [Number((base[0] + latJitter).toFixed(5)), Number((base[1] + lngJitter).toFixed(5))];
}

export function mapBackendListingToUi(item: BackendListingItem): Listing {
  const numericPrice = Number(item.price) || 0;
  const categoryName = item.category?.name || 'املاک';
  const cityName = item.city?.name || 'تهران';
  const neighborhood = item.neighborhood || 'مرکزی';
  const ownerName =
    item.owner?.fullName &&
    item.owner.fullName !== 'کاربر تهاتر' &&
    item.owner.fullName !== 'کاربر جدید' &&
    item.owner.fullName !== 'مالک آگهی تهاتر'
      ? item.owner.fullName
      : 'ثبت‌کننده آگهی';
  const isMaskedOwnerPhone =
    typeof item.owner?.phone === 'string' && item.owner.phone.startsWith('محافظت‌شده');
  const rawContact = item.contactPhone?.trim();
  const displayPhone = isMaskedOwnerPhone
    ? item.owner!.phone!
    : rawContact && rawContact !== '02191016487'
      ? rawContact
      : item.owner?.phone || rawContact || '02191016487';
  const publishedAt = formatJalaliFa(item.sourceDateFa || item.createdAt);

  const exactExchange = Boolean(item.hasExchange);
  const priceDisplayLabel = item.priceLabel
    ? toPersianDigits(item.priceLabel)
    : numericPrice > 0
      ? formatToman(numericPrice)
      : 'توافقی';

  const baseDetails =
    Array.isArray(item.detailsJson) && item.detailsJson.length > 0
      ? item.detailsJson.map((d) => ({
          label: d.label,
          value: toPersianDigits(d.value),
        }))
      : [
          { label: 'کد آگهی', value: toPersianDigits(item.code.replace('TH-', '')) },
          { label: 'دسته‌بندی', value: `${categoryName} · ${item.subcategory || 'سایر'}` },
          { label: 'شهر', value: cityName },
          { label: 'تاریخ ثبت', value: publishedAt },
          { label: 'امکان معاوضه', value: exactExchange ? 'بله' : 'خیر' },
        ];

  const badge = item.isUrgent
    ? ('فوری' as const)
    : exactExchange
    ? ('معاوضه' as const)
    : undefined;

  const hasExactCoords = typeof item.lat === 'number' && typeof item.lng === 'number';
  const [fallbackLat, fallbackLng] = hasExactCoords
    ? [item.lat as number, item.lng as number]
    : resolveCityFallbackCoords(cityName, item.code || item.id);

  return {
    id: item.id,
    code: item.code,
    title: toPersianDigits(item.title),
    category: categoryName,
    subcategory: item.subcategory || 'سایر',
    city: cityName,
    neighborhood,
    price: numericPrice,
    priceLabel: item.priceLabel ? priceDisplayLabel : numericPrice === 0 ? 'توافقی' : undefined,
    isNegotiable: item.isNegotiable || numericPrice === 0,
    hasExchange: exactExchange,
    exchangeWith: exactExchange ? (item.exchangeWith || undefined) : undefined,
    hasInstallmentPlan: Boolean(item.hasInstallmentPlan || numericPrice > 0),
    isVerifiedPhotos: Boolean(item.isVerifiedPhotos),
    isUrgent: Boolean(item.isUrgent),
    isTraded: Boolean(item.isTraded),
    badge,
    publishedAt,
    timeCategory: 'month',
    images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    specs: Array.isArray(item.specsJson)
      ? item.specsJson.map((s) => ({ label: s.label, value: toPersianDigits(s.value) }))
      : [],
    details: baseDetails,
    description: toPersianDigits(item.description || item.title),
    sellerPhone: toPersianDigits(displayPhone),
    sellerName: ownerName,
    coordinates: {
      lat: fallbackLat,
      lng: fallbackLng,
      streetHint: toPersianDigits(item.streetHint || neighborhood || cityName),
      isApproximate: hasExactCoords ? Boolean(item.isApproximateLocation) : true,
      hasCoords: hasExactCoords,
    },
  };
}
