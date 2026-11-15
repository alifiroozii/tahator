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
  return String(input).replace(/\d/g, (d) => persianDigits[Number(d)]);
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

export const CITIES: CityItem[] = [
  { id: 'tehran', name: 'تهران', province: 'تهران', popular: true, neighborhoods: TEHRAN_NEIGHBORHOODS },
  { id: 'sari', name: 'ساری', province: 'مازندران', popular: true, neighborhoods: ['نوشهر', 'چالوس', 'نور', 'نمک‌آبرود', 'سرخرود'] },
  { id: 'rasht', name: 'رشت', province: 'گیلان', popular: true, neighborhoods: ['گلسار', 'لاهیجان', 'بندر انزلی', 'کلاچای'] },
  { id: 'shiraz', name: 'شیراز', province: 'فارس', popular: true, neighborhoods: ['کوی بهاران', 'معالی‌آباد', 'قدوسی', 'عفیف‌آباد'] },
  { id: 'mashhad', name: 'مشهد', province: 'خراسان رضوی', popular: true, neighborhoods: ['رحمانیه', 'هنرستان', 'احمدآباد', 'وکیل‌آباد'] },
  { id: 'isfahan', name: 'اصفهان', province: 'اصفهان', popular: true, neighborhoods: ['آپادانا', 'چهارباغ', 'مرداویج', 'سپاهان‌شهر'] },
  { id: 'karaj', name: 'کرج', province: 'البرز', popular: true, neighborhoods: ['گوهردشت', 'عظیمیه', 'مهرشهر', 'هشتگرد'] },
  { id: 'tabriz', name: 'تبریز', province: 'آذربایجان شرقی', popular: true, neighborhoods: ['شهرک مرزداران', 'ولیعصر', 'رشدیه'] },
  { id: 'arak', name: 'اراک', province: 'مرکزی', popular: false, neighborhoods: ['الغدیر', 'الهیه', 'صنایع'] },
  { id: 'gorgan', name: 'گرگان', province: 'گلستان', popular: false, neighborhoods: ['ناهارخوران', 'گلوگاه'] },
  { id: 'yazd', name: 'یزد', province: 'یزد', popular: false, neighborhoods: ['صفائیه', 'آزادشهر'] },
  { id: 'bushehr', name: 'بوشهر', province: 'بوشهر', popular: false, neighborhoods: ['بهمنی', 'سنگی'] },
  { id: 'zanjan', name: 'زنجان', province: 'زنجان', popular: false, neighborhoods: ['انصاریه', 'گلشهر'] },
  { id: 'urmia', name: 'ارومیه', province: 'آذربایجان غربی', popular: false, neighborhoods: ['آزادگان', 'خیام'] },
  { id: 'hamedan', name: 'همدان', province: 'همدان', popular: false, neighborhoods: ['پاسداران', 'سعیدیه'] },
  { id: 'kermanshah', name: 'کرمانشاه', province: 'کرمانشاه', popular: false, neighborhoods: ['نوبهار', '۲۲ بهمن'] },
  { id: 'yasuj', name: 'یاسوج', province: 'کهگیلویه و بویراحمد', popular: false, neighborhoods: ['مرکزی', 'گلستان'] },
  { id: 'ahvaz', name: 'اهواز', province: 'خوزستان', popular: false, neighborhoods: ['کیانپارس', 'زیتون کارمندی'] },
  { id: 'qom', name: 'قم', province: 'قم', popular: false, neighborhoods: ['سالاریه', 'پردیسان'] },
];

export const POPULAR_SEARCHES = [
  'آپارتمان تهران',
  'خودرو',
  'ویلا شمال',
  'خودرو سنگین و کشاورزی',
  'موتورسیکلت',
  'تهاتر ملک',
];

export const INITIAL_LISTINGS: Listing[] = [];
