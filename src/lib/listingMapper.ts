import { Listing, toPersianDigits } from '@/data/mockData';
import { BackendListingItem } from '@/lib/apiClient';

const CITY_FALLBACK_COORDS: Record<string, [number, number]> = {
  تهران: [35.6997, 51.338],
  مشهد: [36.2972, 59.6067],
  اصفهان: [32.6539, 51.666],
  شیراز: [29.5926, 52.5836],
  تبریز: [38.0962, 46.2738],
  کرج: [35.84, 50.9391],
  قم: [34.6416, 50.8746],
  اهواز: [31.3183, 48.6706],
  رشت: [37.2808, 49.5832],
  ساری: [36.5659, 53.0586],
  کیش: [26.5328, 53.9803],
  قشم: [26.9581, 56.2719],
  یزد: [31.8974, 54.3569],
  کرمان: [30.2839, 57.0834],
  همدان: [34.799, 48.515],
  ارومیه: [37.5527, 45.0761],
  قزوین: [36.2797, 50.0049],
  بندرعباس: [27.1832, 56.2666],
  بوشهر: [28.9234, 50.8203],
  اراک: [34.0954, 49.7013],
  زنجان: [36.6769, 48.4963],
  گرگان: [36.8456, 54.4393],
  کرمانشاه: [34.3142, 47.065],
  بابل: [36.5449, 52.6787],
  لاهیجان: [37.2071, 50.0034],
  انزلی: [37.4727, 49.4622],
  نوشهر: [36.649, 51.4962],
  چمستان: [36.479, 52.118],
  هشتگرد: [35.9619, 50.68],
};

function resolveCityFallbackCoords(cityName: string, seed: string): [number, number] {
  const base = CITY_FALLBACK_COORDS[cityName.trim()] || CITY_FALLBACK_COORDS['تهران'];
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
    item.owner.fullName !== 'کاربر جدید'
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

  const hasExactCoords = typeof item.lat === 'number' && typeof item.lng === 'number';
  const [fallbackLat, fallbackLng] = hasExactCoords
    ? [item.lat as number, item.lng as number]
    : resolveCityFallbackCoords(cityName, item.code || item.id);

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
    hasInstallmentPlan: Boolean(item.hasInstallmentPlan || numericPrice > 0),
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
      lat: fallbackLat,
      lng: fallbackLng,
      streetHint: item.streetHint || neighborhood || cityName,
      isApproximate: hasExactCoords ? Boolean(item.isApproximateLocation) : true,
      hasCoords: hasExactCoords,
    },
  };
}
