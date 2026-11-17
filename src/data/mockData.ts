import { IRAN_PROVINCE_CITIES } from '@/data/iranLocations';

export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  showInSidebar?: boolean;
  iconName:
    | 'building'
    | 'car'
    | 'bike'
    | 'smartphone'
    | 'lamp'
    | 'wrench'
    | 'watch'
    | 'gamepad'
    | 'users'
    | 'cog'
    | 'briefcase';
  subcategories: string[];
}

export interface CityItem {
  id: string;
  name: string;
  province: string;
  popular?: boolean;
  neighborhoods: string[];
}

export interface SpecBoxItem {
  label: string;
  value: string;
}

export interface DetailRowItem {
  label: string;
  value: string;
}

export interface AmenityItem {
  label: string;
  available: boolean;
  iconType: 'elevator' | 'parking' | 'storage' | 'balcony' | 'warranty' | 'exchange';
}

export interface Listing {
  id: string;
  code: string;
  title: string;
  category: string;
  subcategory: string;
  city: string;
  neighborhood: string;
  price: number;
  priceLabel?: string;
  deposit?: number;
  rent?: number;
  isNegotiable: boolean;
  hasExchange: boolean;
  exchangeWith?: string;
  hasInstallmentPlan: boolean;
  isVerifiedPhotos: boolean;
  isUrgent?: boolean;
  isTraded?: boolean;
  badge?: 'نردبان شده' | 'پله شده' | 'فوری' | 'معاوضه';
  publishedAt: string;
  timeCategory: '24h' | 'week' | 'month' | '3months';
  images: string[];
  hasVideo?: boolean;
  specs?: SpecBoxItem[];
  details: DetailRowItem[];
  amenities?: AmenityItem[];
  description: string;
  sellerPhone: string;
  sellerName: string;
  coordinates: {
    lat: number;
    lng: number;
    streetHint: string;
    isApproximate?: boolean;
    hasCoords?: boolean;
  };
  isUserCreated?: boolean;
}

export function formatPersianNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

export function formatToman(num: number): string {
  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    const formatted = Number.isInteger(billions)
      ? billions.toLocaleString('fa-IR')
      : billions.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
    return `${formatted} میلیارد تومان`;
  }
  return `${num.toLocaleString('fa-IR')} تومان`;
}

export function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input ?? '').replace(/\d/g, (d) => persianDigits[Number(d)]);
}

export function formatJalaliFa(dateInput?: string | null): string {
  const raw = String(dateInput || '').trim();
  if (!raw) return 'امروز';
  // If already contains Persian month/Jalali slash e.g. ۱۴۰۵/۰۸/۲۶
  if (/[\u0600-\u06FF]/.test(raw) && !/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return toPersianDigits(raw);
  }
  const isoMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
  const dt = new Date(isoMatch ? `${isoMatch[1]}T12:00:00Z` : raw);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toLocaleDateString('fa-IR');
  }
  return toPersianDigits(raw);
}

export const TEHRAN_NEIGHBORHOODS: string[] = [
  'زعفرانیه',
  'الهیه',
  'نیاوران',
  'ولنجک',
  'اقدسیه',
  'فرمانیه',
  'کامرانیه',
  'محمودیه',
  'سعادت‌آباد',
  'گیشا',
  'شهرک غرب',
  'مرزداران',
  'ستارخان',
  'تهرانپارس',
  'نارمک',
  'افسریه',
  'پیروزی',
  'رسالت',
  'ونک',
  'میرداماد',
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'real-estate',
    name: 'املاک',
    emoji: '🏠',
    showInSidebar: true,
    iconName: 'building',
    subcategories: [
      'آپارتمان',
      'ویلا',
      'مغازه و دفتر',
      'زمین و کلنگی',
      'باغ و اراضی کشاورزی',
      'اداری و تجاری',
      'سوله و صنعتی',
      'سایر املاک',
    ],
  },
  {
    id: 'cars',
    name: 'خودرو',
    emoji: '🚗',
    showInSidebar: true,
    iconName: 'car',
    subcategories: [
      'خودرو',
      'خودرو سواری (سبک)',
      'خودرو سنگین و نیمه‌سنگین',
      'ماشین‌آلات کشاورزی',
      'ماشین‌آلات صنعتی و غیرکشاورزی',
      'وانت، ون و خودرو کار',
    ],
  },
  {
    id: 'motorcycles',
    name: 'موتورسیکلت',
    emoji: '🏍️',
    showInSidebar: true,
    iconName: 'bike',
    subcategories: [
      'موتورسیکلت',
      'موتور شهری و دنده‌ای',
      'اسکوتر و اتوماتیک',
      'موتور سنگین و مسابقه‌ای',
      'موتور کراس و آفرود',
      'موتور برقی و سه‌چرخ',
    ],
  },
];

export const CITIES: CityItem[] = IRAN_PROVINCE_CITIES.map((c) => ({
  id: c.id,
  name: c.name,
  province: c.province,
  popular: c.popular,
  neighborhoods: c.neighborhoods,
}));

export const POPULAR_SEARCHES = [
  'آپارتمان تهران',
  'خودرو',
  'ویلا شمال',
  'خودرو سنگین و کشاورزی',
  'موتورسیکلت',
  'تهاتر ملک',
];

export const INITIAL_LISTINGS: Listing[] = [];
