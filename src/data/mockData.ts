export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  showInSidebar?: boolean;
  iconName:
    | 'building'
    | 'car'
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
    subcategories: ['آپارتمان', 'ویلا', 'مغازه و دفتر', 'زمین و کلنگی'],
  },
  {
    id: 'vehicles',
    name: 'وسایل نقلیه',
    emoji: '🚗',
    showInSidebar: true,
    iconName: 'car',
    subcategories: ['خودرو', 'موتورسیکلت', 'قطعات و لوازم یدکی', 'قایق و سایر'],
  },
  {
    id: 'digital',
    name: 'کالای دیجیتال',
    emoji: '📱',
    showInSidebar: true,
    iconName: 'smartphone',
    subcategories: ['موبایل و تبلت', 'لپ‌تاپ و کامپیوتر', 'صوتی و تصویری', 'کنسول بازی'],
  },
  {
    id: 'home-kitchen',
    name: 'خانه و آشپزخانه',
    emoji: '🍳',
    showInSidebar: true,
    iconName: 'lamp',
    subcategories: ['لوازم خانگی', 'مبلمان و میز', 'فرش و گلیم', 'دکوراسیون'],
  },
  {
    id: 'personal',
    name: 'وسایل شخصی',
    emoji: '👜',
    showInSidebar: true,
    iconName: 'watch',
    subcategories: ['پوشاک', 'کیف و کفش', 'ساعت و اکسسوری', 'آرایشی و بهداشتی'],
  },
  {
    id: 'industrial',
    name: 'تجهیزات و صنعتی',
    emoji: '⚙️',
    showInSidebar: true,
    iconName: 'cog',
    subcategories: ['ابزارآلات', 'ماشین‌آلات صنعتی', 'تجهیزات اداری', 'لوازم فروشگاهی'],
  },
  {
    id: 'services',
    name: 'خدمات',
    emoji: '🛠️',
    showInSidebar: false,
    iconName: 'wrench',
    subcategories: [
      'موتور و ماشین',
      'پذیرایی و مراسم',
      'خدمات رایانه‌ای و موبایل',
      'مالی و حسابداری و بیمه',
      'حمل و نقل',
      'پیشه و مهارت',
      'آرایشگری و زیبایی',
      'نظافت',
      'باغبانی و درختکاری',
      'آموزشی',
    ],
  },
  {
    id: 'entertainment',
    name: 'سرگرمی و فراغت',
    emoji: '🎮',
    showInSidebar: false,
    iconName: 'gamepad',
    subcategories: [
      'بلیط',
      'تور و چارتر',
      'کتاب و مجله',
      'دوچرخه/اسکیت/اسکوتر',
      'حیوانات',
      'کلکسیون و سرگرمی',
      'آلات موسیقی',
      'ورزش و تناسب اندام',
      'اسباب‌بازی',
    ],
  },
  {
    id: 'social',
    name: 'اجتماعی',
    emoji: '👥',
    showInSidebar: false,
    iconName: 'users',
    subcategories: ['رویداد', 'داوطلبانه', 'گم‌شده‌ها'],
  },
  {
    id: 'jobs',
    name: 'استخدام و کاریابی',
    emoji: '💼',
    showInSidebar: false,
    iconName: 'briefcase',
    subcategories: [
      'اداری و مدیریت',
      'سرایداری و نظافت',
      'معماری و عمران و ساختمانی',
      'خدمات فروشگاه و رستوران',
      'رایانه و فناوری اطلاعات',
      'مالی و حسابداری و حقوقی',
      'بازاریابی و فروش',
      'صنعتی و فنی و مهندسی',
      'آموزشی',
      'حمل و نقل',
      'درمانی و زیبایی و بهداشتی',
      'هنری و رسانه',
    ],
  },
];

export const CITIES: CityItem[] = [
  {
    id: 'tehran',
    name: 'تهران',
    province: 'تهران',
    popular: true,
    neighborhoods: TEHRAN_NEIGHBORHOODS,
  },
  {
    id: 'sari',
    name: 'ساری',
    province: 'مازندران',
    popular: true,
    neighborhoods: ['نوشهر - ونوش', 'چالوس', 'نور', 'نمک‌آبرود', 'سرخرود', 'فرهنگ'],
  },
  {
    id: 'shiraz',
    name: 'شیراز',
    province: 'فارس',
    popular: true,
    neighborhoods: ['کوی بهاران', 'معالی‌آباد', 'ستارخان', 'قدوسی', 'عفیف‌آباد'],
  },
  {
    id: 'mashhad',
    name: 'مشهد',
    province: 'خراسان رضوی',
    popular: true,
    neighborhoods: ['رحمانیه', 'وکیل‌آباد', 'هنرستان', 'احمدآباد', 'سجاد'],
  },
  {
    id: 'rasht',
    name: 'رشت',
    province: 'گیلان',
    popular: true,
    neighborhoods: ['گلسار', 'چابکسر', 'منظریه', 'معلم'],
  },
  {
    id: 'isfahan',
    name: 'اصفهان',
    province: 'اصفهان',
    popular: true,
    neighborhoods: ['مرداویج', 'جلفا', 'چهارباغ', 'ملک‌شهر'],
  },
  {
    id: 'karaj',
    name: 'کرج',
    province: 'البرز',
    popular: true,
    neighborhoods: ['گوهردشت', 'مهرشهر', 'جهانشهر', 'عظیمیه'],
  },
  {
    id: 'tabriz',
    name: 'تبریز',
    province: 'آذربایجان شرقی',
    popular: true,
    neighborhoods: ['ولیعصر', 'زعفرانیه تبریز', 'رشدیه', 'ائل‌گلی'],
  },
  {
    id: 'qom',
    name: 'قم',
    province: 'قم',
    popular: true,
    neighborhoods: ['سالاریه', 'صفاشهر', 'پردیسان', 'بنیاد'],
  },
  {
    id: 'ahvaz',
    name: 'اهواز',
    province: 'خوزستان',
    popular: true,
    neighborhoods: ['کیانپارس', 'زیتون کارمندی', 'گلستان'],
  },
];

export const POPULAR_SEARCHES = [
  'ویلا تریبلکس ونوش',
  'آپارتمان ستارخان',
  'تارا دنده‌ای',
  'توسان ۲۰۱۷',
  'کلنگی هوانیروز',
  'سراتو اتوماتیک',
  'آریزو ۵ توربو',
  '۲۰۷ پانا اتومات',
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'ad-1',
    code: 'TH-01',
    title: '۷۰۰ متر ویلا تریبلکس ۶ خواب مستر ، ونوش / تهاتر / نوشهر',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'ساری',
    neighborhood: 'نوشهر - ونوش',
    price: 80_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'ملک در تهران یا خودرو لوکس',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۳',
    timeCategory: '24h',
    images: ['/ads/fake-1.svg'],
    specs: [
      { label: 'متراژ', value: '۷۰۰ متر' },
      { label: 'ساخت', value: '۱۴۰۳' },
      { label: 'اتاق', value: '۶ خواب مستر' },
    ],
    details: [
      { label: 'قیمت کل', value: '80 میلیارد تومان' },
      { label: 'شهر', value: 'ساری' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۳' },
      { label: 'امکان معاوضه', value: 'دارد (تهاتر با ملک تهران)' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      '۷۰۰ متر ویلا تریبلکس ۶ خواب مستر در منطقه برند ونوش نوشهر با استخر سرپوشیده چهارفصل، روف‌گاردن و چشم‌انداز هم‌زمان جنگل و دریا. قابلیت تهاتر کامل یا ۵۰٪ نقد/اقساط با ملک یا خودرو.',
    sellerPhone: '۰۹۱۲۱۰۱۶۴۸۷',
    sellerName: 'گروه املاک ساحلی',
    coordinates: { lat: 36.5659, lng: 51.8355, streetHint: 'نوشهر - ونوش' },
  },
  {
    id: 'ad-2',
    code: 'TH-02',
    title: 'آپارتمان ۵۰ متر شمال ستارخان معاوضه با خودرو',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'تهران',
    neighborhood: 'ستارخان',
    price: 18_900_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو سواری یا شاسی‌بلند',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۳',
    timeCategory: '24h',
    images: ['/ads/fake-2.svg'],
    specs: [
      { label: 'متراژ', value: '۵۰ متر' },
      { label: 'ساخت', value: '۱۳۹۹' },
      { label: 'اتاق', value: '۱' },
    ],
    details: [
      { label: 'قیمت کل', value: '18.9 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'محله', value: 'ستارخان' },
      { label: 'امکان معاوضه', value: 'با خودرو سواری' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'آپارتمان ۵۰ متری بسیار خوش‌نقشه و نورگیر در شمال ستارخان. سند تک‌برگ، بازسازی کامل و آماده تهاتر با خودروی صفر یا کارکرده تمیز و مابقی نقد یا اقساط.',
    sellerPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    sellerName: 'مشاورین تهاتر غرب',
    coordinates: { lat: 35.7219, lng: 51.3568, streetHint: 'شمال ستارخان' },
  },
  {
    id: 'ad-3',
    code: 'TH-03',
    title: 'تیبا1 مدل آخر ۹۹ ، فنی درجه ۱ ، نقدی و قابل معاوضه',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'مرزداران',
    price: 1_300_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو مدل بالاتر یا موتور',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۲',
    timeCategory: '24h',
    images: ['/ads/fake-3.svg'],
    specs: [
      { label: 'مدل', value: '۱۳۹۹' },
      { label: 'وضعیت فنی', value: 'درجه ۱' },
      { label: 'فروش', value: 'نقد و معاوضه' },
    ],
    details: [
      { label: 'قیمت', value: '1.3 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۲' },
    ],
    description:
      'تیبا ۱ مدل آخر ۹۹، از نظر فنی کاملاً سالم و درجه ۱، شاسی‌ها پلمپ، مناسب مصرف‌کننده. فروش به صورت نقدی یا قابل معاوضه در پلتفرم تهاتر آپ.',
    sellerPhone: '۰۹۱۹۸۸۷۷۶۶۵',
    sellerName: 'آقای سلطانی',
    coordinates: { lat: 35.7365, lng: 51.3412, streetHint: 'محدوده مرزداران' },
  },
  {
    id: 'ad-4',
    code: 'TH-04',
    title: 'تارا دنده ای v1p مدل ۴۰۵',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'سعادت‌آباد',
    price: 3_400_000_000,
    isNegotiable: false,
    hasExchange: true,
    exchangeWith: 'خودرو یا ملک کوچک‌متراژ',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۲',
    timeCategory: '24h',
    images: ['/ads/fake-4.svg'],
    specs: [
      { label: 'مدل', value: '۱۴۰۵' },
      { label: 'گیربکس', value: 'دنده‌ای V1P' },
      { label: 'کارکرد', value: 'صفر' },
    ],
    details: [
      { label: 'قیمت', value: '3.4 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۲' },
    ],
    description:
      'تارا دنده‌ای V1P مدل ۱۴۰۵ تحویل روز، سند آزاد و گارانتی فعال. امکان خرید اقساطی و معاوضه با خودروی کارکرده یا کالا وجود دارد.',
    sellerPhone: '۰۹۱۲۹۸۷۶۵۴۳',
    sellerName: 'اتوگالری سپهر',
    coordinates: { lat: 35.7819, lng: 51.3752, streetHint: 'سعادت‌آباد' },
  },
  {
    id: 'ad-5',
    code: 'TH-05',
    title: 'کلنگی ۲۰۸متر دوکله بر هوانیروز',
    category: 'املاک',
    subcategory: 'زمین و کلنگی',
    city: 'تهران',
    neighborhood: 'شهرک غرب',
    price: 120_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'آپارتمان نوساز یا مغازه تجاری',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-5.svg'],
    specs: [
      { label: 'متراژ', value: '۲۰۸ متر' },
      { label: 'موقعیت', value: 'دوکله' },
      { label: 'سند', value: 'تک‌برگ' },
    ],
    details: [
      { label: 'قیمت کل', value: '120 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    description:
      'کلنگی ۲۰۸ متر دوکله بر بلوار هوانیروز با جواز ساخت عالی و سند تک‌برگ بدون ریشه. آماده تهاتر با واحدهای نوساز آماده تحویل.',
    sellerPhone: '۰۹۱۲۲۲۳۳۴۴۵',
    sellerName: 'دفتر املاک پایتخت',
    coordinates: { lat: 35.7478, lng: 51.2314, streetHint: 'بر هوانیروز' },
  },
  {
    id: 'ad-6',
    code: 'TH-06',
    title: 'توسان ۲۰۱۷ تک رادار فول',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'فرمانیه',
    price: 9_100_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'آپارتمان یا خودروی مدل بالاتر',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'فوری',
    isUrgent: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-6.svg'],
    specs: [
      { label: 'مدل', value: '۲۰۱۷' },
      { label: 'آپشن', value: 'تک رادار فول' },
      { label: 'رنگ', value: 'بدون رنگ' },
    ],
    details: [
      { label: 'قیمت', value: '9.1 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    description:
      'هیوندای توسان ۲۰۱۷ تک رادار فول وارداتی بدون رنگ، سرویس‌ها انجام شده در نمایندگی رسمی. قابل تهاتر و معاوضه.',
    sellerPhone: '۰۹۱۲۵۵۵۴۴۳۳',
    sellerName: 'آقای تقوی',
    coordinates: { lat: 35.802, lng: 51.4648, streetHint: 'فرمانیه' },
  },
  {
    id: 'ad-7',
    code: 'TH-07',
    title: 'فروش یک واحد آپارتمان ۱۸۱ متری ۳ خواب نوساز / شیراز ، کوی بهاران',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'شیراز',
    neighborhood: 'کوی بهاران',
    price: 24_600_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'واحد کوچک‌تر یا خودرو',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-7.svg'],
    specs: [
      { label: 'متراژ', value: '۱۸۱ متر' },
      { label: 'خواب', value: '۳ خواب' },
      { label: 'وضعیت', value: 'نوساز' },
    ],
    details: [
      { label: 'قیمت کل', value: '24.6 میلیارد تومان' },
      { label: 'شهر', value: 'شیراز' },
      { label: 'محله', value: 'کوی بهاران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'یک واحد آپارتمان ۱۸۱ متری ۳ خواب نوساز در بهترین موقعیت کوی بهاران شیراز با متریال لوکس، سالن پرده‌خور و قابلیت معاوضه و اقساط.',
    sellerPhone: '۰۹۱۷۳۱۱۴۴۵۵',
    sellerName: 'املاک شیراز نوین',
    coordinates: { lat: 29.6694, lng: 52.4789, streetHint: 'شیراز، کوی بهاران' },
  },
  {
    id: 'ad-8',
    code: 'TH-08',
    title: 'فروش واحد ۱۲۰ متری نوساز ۲ خواب در شیراز',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'شیراز',
    neighborhood: 'معالی‌آباد',
    price: 19_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو سواری یا زمین مسکونی',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-8.svg'],
    specs: [
      { label: 'متراژ', value: '۱۲۰ متر' },
      { label: 'خواب', value: '۲ خواب' },
      { label: 'وضعیت', value: 'نوساز' },
    ],
    details: [
      { label: 'قیمت کل', value: '19 میلیارد تومان' },
      { label: 'شهر', value: 'شیراز' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'واحد ۱۲۰ متری نوساز ۲ خواب خوش‌نقشه در شیراز، دسترسی عالی، سند در دست اقدام، امکان تهاتر بخشی از مبلغ با خودرو.',
    sellerPhone: '۰۹۱۷۴۴۵۵۶۶۷',
    sellerName: 'مشاور املاک فارس',
    coordinates: { lat: 29.662, lng: 52.472, streetHint: 'شیراز، معالی‌آباد' },
  },
  {
    id: 'ad-9',
    code: 'TH-09',
    title: 'فروش/ ۱۰۰ متری / ۲ خواب / فول / رحمانیه / مشهد',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'مشهد',
    neighborhood: 'رحمانیه',
    price: 13_100_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو یا واحد در الهیه مشهد',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-9.svg'],
    specs: [
      { label: 'متراژ', value: '۱۰۰ متر' },
      { label: 'خواب', value: '۲ خواب' },
      { label: 'امکانات', value: 'فول' },
    ],
    details: [
      { label: 'قیمت کل', value: '13.1 میلیارد تومان' },
      { label: 'شهر', value: 'مشهد' },
      { label: 'محله', value: 'رحمانیه' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'فروش واحد ۱۰۰ متری ۲ خواب فول امکانات در محدوده رحمانیه مشهد. طراحی مدرن، پارکینگ اختصاصی و قابل معاوضه.',
    sellerPhone: '۰۹۱۵۱۲۳۴۵۶۷',
    sellerName: 'کارگزاری مسکن خراسان',
    coordinates: { lat: 36.365, lng: 59.485, streetHint: 'مشهد، رحمانیه' },
  },
  {
    id: 'ad-10',
    code: 'TH-10',
    title: 'ملک ویلایی ۱۲۰ متر و ۱۸۰ متر بنا دارد',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'مشهد',
    neighborhood: 'وکیل‌آباد',
    price: 32_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'آپارتمان در وکیل‌آباد یا خودرو',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-10.svg'],
    specs: [
      { label: 'زمین', value: '۱۲۰ متر' },
      { label: 'بنا', value: '۱۸۰ متر' },
      { label: 'نوع', value: 'ویلایی' },
    ],
    details: [
      { label: 'قیمت کل', value: '32 میلیارد تومان' },
      { label: 'شهر', value: 'مشهد' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    description:
      'ملک ویلایی دو طبقه مجزا با ۱۲۰ متر عرصه و ۱۸۰ متر بنای مفید در موقعیت بسیار آرام و دسترسی آسان به بلوار وکیل‌آباد.',
    sellerPhone: '۰۹۱۵۷۶۵۴۳۲۱',
    sellerName: 'آقای حسینی',
    coordinates: { lat: 36.325, lng: 59.498, streetHint: 'مشهد، وکیل‌آباد' },
  },
  {
    id: 'ad-11',
    code: 'TH-11',
    title: '۳۴۵ متر بهترین مکان هنرستان',
    category: 'املاک',
    subcategory: 'زمین و کلنگی',
    city: 'مشهد',
    neighborhood: 'هنرستان',
    price: 70_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'ملک آماده یا مشارکت در ساخت',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-11.svg'],
    specs: [
      { label: 'مساحت', value: '۳۴۵ متر' },
      { label: 'محدوده', value: 'هنرستان' },
      { label: 'سند', value: 'شش‌دانگ' },
    ],
    details: [
      { label: 'قیمت کل', value: '70 میلیارد تومان' },
      { label: 'شهر', value: 'مشهد' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    description:
      '۳۴۵ متر زمین با موقعیت بی‌نظیر در بهترین فرعی هنرستان مشهد، مناسب ساخت پروژه لوکس یا سرمایه‌گذاری.',
    sellerPhone: '۰۹۱۵۳۳۳۲۲۱۱',
    sellerName: 'املاک برتر هنرستان',
    coordinates: { lat: 36.318, lng: 59.512, streetHint: 'مشهد، هنرستان' },
  },
  {
    id: 'ad-12',
    code: 'TH-12',
    title: 'اپارتمان ۱۵۰ متری احمد اباد صفر',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'مشهد',
    neighborhood: 'احمدآباد',
    price: 42_000_000_000,
    isNegotiable: false,
    hasExchange: true,
    exchangeWith: 'آپارتمان کوچک‌تر یا خودرو',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۱',
    timeCategory: 'week',
    images: ['/ads/fake-12.svg'],
    specs: [
      { label: 'متراژ', value: '۱۵۰ متر' },
      { label: 'وضعیت', value: 'صفر کلید اول' },
      { label: 'منطقه', value: 'احمدآباد' },
    ],
    details: [
      { label: 'قیمت کل', value: '42 میلیارد تومان' },
      { label: 'شهر', value: 'مشهد' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۱' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'آپارتمان ۱۵۰ متری صفر کلید اول در خیابان احمدآباد مشهد با طراحی مدرن، لابی شیک و امکانات کامل رفاهی.',
    sellerPhone: '۰۹۱۵۸۸۸۹۹۰۰',
    sellerName: 'کارگزاری مسکن احمدآباد',
    coordinates: { lat: 36.298, lng: 59.568, streetHint: 'مشهد، احمدآباد' },
  },
  {
    id: 'ad-13',
    code: 'TH-13',
    title: 'سوئیت 40 متری فرمانیه',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'تهران',
    neighborhood: 'فرمانیه',
    price: 21_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو لوکس یا ملک در شمال',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-13.svg'],
    specs: [
      { label: 'متراژ', value: '۴۰ متر' },
      { label: 'نوع', value: 'سوئیت' },
      { label: 'محله', value: 'فرمانیه' },
    ],
    details: [
      { label: 'قیمت کل', value: '21 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'سوئیت ۴۰ متری بسیار شیک و مدرن در لوکیشن دنج فرمانیه، مناسب سکونت یا هوم آفیس، قابل تهاتر با خودرو.',
    sellerPhone: '۰۹۱۲۱۱۲۳۳۴۴',
    sellerName: 'مسکن پلاس منطقه ۱',
    coordinates: { lat: 35.805, lng: 51.466, streetHint: 'فرمانیه شرقی' },
  },
  {
    id: 'ad-14',
    code: 'TH-14',
    title: 'باغ ۲۰۰۰ متر / در فاصله ۱ ساعته از تهران',
    category: 'املاک',
    subcategory: 'زمین و کلنگی',
    city: 'تهران',
    neighborhood: 'حومه تهران',
    price: 1_500_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو سواری هم‌قیمت یا طلا',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-14.svg'],
    specs: [
      { label: 'متراژ', value: '۲۰۰۰ متر' },
      { label: 'نوع', value: 'باغ ویلا' },
      { label: 'فاصله', value: '۱ ساعت تا تهران' },
    ],
    details: [
      { label: 'قیمت کل', value: '1.5 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'باغ ۲۰۰۰ متری سرسبز با درختان مثمر و سهمیه آب دائم در فاصله ۱ ساعته از تهران، بهترین گزینه برای سرمایه‌گذاری یا معاوضه با خودرو.',
    sellerPhone: '۰۹۱۲۴۵۶۷۸۹۰',
    sellerName: 'آقای رضوی',
    coordinates: { lat: 35.72, lng: 51.62, streetHint: 'حومه شرقی تهران' },
  },
  {
    id: 'ad-15',
    code: 'TH-15',
    title: 'مگه داریم قشنگتر از این زمین/ ۲۲۲ متر مسکونی دو نبش در چالوس',
    category: 'املاک',
    subcategory: 'زمین و کلنگی',
    city: 'ساری',
    neighborhood: 'چالوس',
    price: 14_400_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو یا آپارتمان در تهران',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-15.svg'],
    specs: [
      { label: 'متراژ', value: '۲۲۲ متر' },
      { label: 'کاربری', value: 'مسکونی دو نبش' },
      { label: 'منطقه', value: 'چالوس' },
    ],
    details: [
      { label: 'قیمت کل', value: '14.4 میلیارد تومان' },
      { label: 'شهر', value: 'ساری' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      '۲۲۲ متر زمین مسکونی دو نبش خوش‌قواره در چالوس با چشم‌انداز جنگل، دارای انشعابات سر زمین و آماده ساخت ویلا.',
    sellerPhone: '۰۹۱۱۱۲۳۴۵۶۷',
    sellerName: 'املاک کاسپین',
    coordinates: { lat: 36.655, lng: 51.42, streetHint: 'چالوس' },
  },
  {
    id: 'ad-16',
    code: 'TH-16',
    title: 'سراتو اتوماتیک ۲۰۰۰cc , مدل ۹۵',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'ونک',
    price: 4_500_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو مدل بالاتر یا زمین',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-16.svg'],
    specs: [
      { label: 'مدل', value: '۱۳۹۵' },
      { label: 'موتور', value: '۲۰۰۰cc' },
      { label: 'گیربکس', value: 'اتوماتیک' },
    ],
    details: [
      { label: 'قیمت', value: '4.5 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'کیا سراتو ۲۰۰۰ اتوماتیک آپشنال مدل ۹۵، بسیار تمیز و کم‌کار، موتور و گیربکس پلمپ، آماده معاوضه یا فروش اقساطی.',
    sellerPhone: '۰۹۱۲۳۲۱۶۵۴۹',
    sellerName: 'نمایشگاه خودرو ونک',
    coordinates: { lat: 35.7575, lng: 51.4099, streetHint: 'میدان ونک' },
  },
  {
    id: 'ad-17',
    code: 'TH-17',
    title: 'آریزو ۵ توربو',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'تهرانپارس',
    price: 3_600_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو اقتصادی یا کالای دیجیتال',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-17.svg'],
    specs: [
      { label: 'پیشرانه', value: 'توربو' },
      { label: 'مدل', value: 'سدان مدرن' },
      { label: 'وضعیت', value: 'سالم' },
    ],
    details: [
      { label: 'قیمت', value: '3.6 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'آریزو ۵ توربو بسیار تمیز، نگهداری‌شده با وسواس بالا، کلیه سرویس‌های دوره‌ای انجام شده و آماده تهاتر یا فروش نقدی.',
    sellerPhone: '۰۹۱۲۶۵۴۹۸۷۱',
    sellerName: 'آقای کریمی',
    coordinates: { lat: 35.7361, lng: 51.5294, streetHint: 'تهرانپارس' },
  },
  {
    id: 'ad-18',
    code: 'TH-18',
    title: 'تریبلکس ( استخر داخلی ) ویو ۳۶۰ جنگل/ در نور / فروش یا معاوضه با خودرو',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'ساری',
    neighborhood: 'نور',
    price: 10_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'خودرو لوکس و شاسی‌بلند',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    badge: 'معاوضه',
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: 'month',
    images: ['/ads/fake-18.svg'],
    specs: [
      { label: 'نوع', value: 'تریبلکس' },
      { label: 'امکانات', value: 'استخر داخلی' },
      { label: 'چشم‌انداز', value: '۳۶۰ جنگل' },
    ],
    details: [
      { label: 'قیمت کل', value: '10 میلیارد تومان' },
      { label: 'شهر', value: 'ساری' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'ویلای تریبلکس استخردار با چشم‌انداز ۳۶۰ درجه به جنگل در شهر نور، دارای استخر داخلی و تراس دلباز. فروش نقدی یا معاوضه کامل با خودرو.',
    sellerPhone: '۰۹۱۱۷۷۷۸۸۹۹',
    sellerName: 'ویلاهای جنگلی نور',
    coordinates: { lat: 36.572, lng: 52.012, streetHint: 'شهرستان نور' },
  },
  {
    id: 'ad-19',
    code: 'TH-19',
    title: '۱۶۰ متر ۳ خواب پر نور و خوش نقشه در رشت ( با پارکینگ اختصاصی )',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'رشت',
    neighborhood: 'گلسار',
    price: 30_400_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'ملک در گلسار یا خودرو',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-19.svg'],
    specs: [
      { label: 'متراژ', value: '۱۶۰ متر' },
      { label: 'خواب', value: '۳ خواب' },
      { label: 'پارکینگ', value: 'اختصاصی' },
    ],
    details: [
      { label: 'قیمت کل', value: '30.4 میلیارد تومان' },
      { label: 'شهر', value: 'رشت' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'آپارتمان ۱۶۰ متری ۳ خواب بسیار خوش‌نقشه و غرق در نور در رشت، دارای پارکینگ اختصاصی بدون مزاحم و دسترسی عالی به مراکز خرید.',
    sellerPhone: '۰۹۱۱۴۵۶۷۸۹۰',
    sellerName: 'املاک گیلان نو',
    coordinates: { lat: 37.295, lng: 49.588, streetHint: 'رشت، گلسار' },
  },
  {
    id: 'ad-20',
    code: 'TH-20',
    title: 'ویلا سه خوابه استخردار کلید اول محدوده نمک آبرود ( فروشی )',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'ساری',
    neighborhood: 'نمک‌آبرود',
    price: 44_000_000_000,
    isNegotiable: false,
    hasExchange: true,
    exchangeWith: 'ملک تهران یا خودرو',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-20.svg'],
    specs: [
      { label: 'خواب', value: '۳ خواب' },
      { label: 'امکانات', value: 'استخردار' },
      { label: 'وضعیت', value: 'کلید اول' },
    ],
    details: [
      { label: 'قیمت کل', value: '44 میلیارد تومان' },
      { label: 'شهر', value: 'ساری' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'ویلای سه خوابه استخردار کلید اول در محدوده شهرک نمک‌آبرود با متریال لوکس، محوطه‌سازی زیبا و سند تک‌برگ.',
    sellerPhone: '۰۹۱۱۲۳۴۵۶۷۸',
    sellerName: 'املاک نمک‌آبرود',
    coordinates: { lat: 36.682, lng: 51.301, streetHint: 'نمک‌آبرود' },
  },
  {
    id: 'ad-21',
    code: 'TH-21',
    title: 'ویلای تریبلکس ۳۵۰ متری سرخرود',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'ساری',
    neighborhood: 'سرخرود',
    price: 40_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'آپارتمان تهران یا خودرو',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-21.svg'],
    specs: [
      { label: 'متراژ', value: '۳۵۰ متر' },
      { label: 'نوع', value: 'تریبلکس' },
      { label: 'منطقه', value: 'سرخرود' },
    ],
    details: [
      { label: 'قیمت کل', value: '40 میلیارد تومان' },
      { label: 'شهر', value: 'ساری' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'ویلای تریبلکس ۳۵۰ متری مدرن در منطقه توریستی سرخرود، نزدیک به ساحل دریا، روف‌گاردن مبله و جکوزی.',
    sellerPhone: '۰۹۱۱۶۵۴۳۲۱۰',
    sellerName: 'گروه ویلاسازان مازندران',
    coordinates: { lat: 36.674, lng: 52.451, streetHint: 'سرخرود' },
  },
  {
    id: 'ad-22',
    code: 'TH-22',
    title: 'ویلای ساحلی شیک در چابکسر',
    category: 'املاک',
    subcategory: 'ویلا',
    city: 'رشت',
    neighborhood: 'چابکسر',
    price: 145_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'املاک تجاری یا مسکونی در تهران',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-22.svg'],
    specs: [
      { label: 'موقعیت', value: 'ساحلی' },
      { label: 'منطقه', value: 'چابکسر' },
      { label: 'سبک', value: 'مدرن شیک' },
    ],
    details: [
      { label: 'قیمت کل', value: '145 میلیارد تومان' },
      { label: 'شهر', value: 'رشت' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'ویلای ساحلی فوق‌العاده شیک با پلاک یک دریا در چابکسر، حیاط مشجر اختصاصی، اسکله کوچک و معماری چشم‌نواز.',
    sellerPhone: '۰۹۱۱۵۵۵۶۶۷۷',
    sellerName: 'املاک لوکس ساحل خزر',
    coordinates: { lat: 36.968, lng: 50.584, streetHint: 'چابکسر، نوار ساحلی' },
  },
  {
    id: 'ad-23',
    code: 'TH-23',
    title: '۲۰۷ پانا اتومات ۴۰۴ در حد صفر',
    category: 'وسایل نقلیه',
    subcategory: 'خودرو',
    city: 'تهران',
    neighborhood: 'نیاوران',
    price: 3_900_000_000,
    isNegotiable: false,
    hasExchange: true,
    exchangeWith: 'خودرو شاسی یا سدان وارداتی',
    hasInstallmentPlan: true,
    isVerifiedPhotos: true,
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-23.svg'],
    specs: [
      { label: 'مدل', value: '۱۴۰۴' },
      { label: 'سقف', value: 'پانوراما' },
      { label: 'وضعیت', value: 'در حد صفر' },
    ],
    details: [
      { label: 'قیمت', value: '3.9 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    description:
      'پژو ۲۰۷ اتوماتیک سقف شیشه‌ای (پانا) مدل ۱۴۰۴ واقعی، در حد صفر بدون کوچک‌ترین خط و خش، گارانتی فعال و آماده انتقال یا معاوضه.',
    sellerPhone: '۰۹۱۲۷۸۹۴۵۶۱',
    sellerName: 'آقای شریفی',
    coordinates: { lat: 35.8172, lng: 51.4648, streetHint: 'نیاوران' },
  },
  {
    id: 'ad-24',
    code: 'TH-24',
    title: 'قیطریه جنوبی ، یک شاهکار کلاسیک تک واحدی',
    category: 'املاک',
    subcategory: 'آپارتمان',
    city: 'تهران',
    neighborhood: 'قیطریه',
    price: 275_000_000_000,
    isNegotiable: true,
    hasExchange: true,
    exchangeWith: 'کلنگی یا آپارتمان در منطقه ۱',
    hasInstallmentPlan: false,
    isVerifiedPhotos: true,
    badge: 'نردبان شده',
    publishedAt: '۱۴۰۵/۸/۲۰',
    timeCategory: '3months',
    images: ['/ads/fake-24.svg'],
    specs: [
      { label: 'نوع', value: 'تک واحدی' },
      { label: 'سبک', value: 'کلاسیک' },
      { label: 'موقعیت', value: 'قیطریه جنوبی' },
    ],
    details: [
      { label: 'قیمت کل', value: '275 میلیارد تومان' },
      { label: 'شهر', value: 'تهران' },
      { label: 'تاریخ انتشار', value: '۱۴۰۵/۸/۲۰' },
    ],
    amenities: [
      { label: 'آسانسور', available: true, iconType: 'elevator' },
      { label: 'پارکینگ', available: true, iconType: 'parking' },
      { label: 'انباری', available: true, iconType: 'storage' },
    ],
    description:
      'شاهکار معماری کلاسیک تک واحدی در بهترین فرعی قیطریه جنوبی، متریال وارداتی اروپایی، مشاعات آبی کامل، لابی مجلل و نگهبانی ۲۴ ساعته.',
    sellerPhone: '۰۹۱۲۱۱۱۱۰۰۰',
    sellerName: 'هلدینگ املاک کلاسیک',
    coordinates: { lat: 35.789, lng: 51.448, streetHint: 'قیطریه جنوبی' },
  },
];
