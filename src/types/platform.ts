export type UserRole = 'user' | 'business' | 'moderator' | 'support' | 'admin';

export type DashboardTab =
  | 'overview'
  | 'profile'
  | 'barterAssets'
  | 'wallet'
  | 'myAds'
  | 'barterOffers'
  | 'installments'
  | 'bookmarks'
  | 'notes'
  | 'recent'
  | 'savedSearches'
  | 'safety'
  | 'settings';

export interface RoleMeta {
  id: UserRole;
  title: string;
  shortTitle: string;
  description: string;
  badgeText: string;
  permissions: string[];
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  user: {
    id: 'user',
    title: 'کاربر عادی (خریدار / فروشنده)',
    shortTitle: 'کاربر عادی',
    description: 'ثبت آگهی، نشان کردن، چت، پیشنهاد معاوضه، درخواست تسهیلات و مدیریت حساب تهاتر من.',
    badgeText: 'کاربر',
    permissions: ['ثبت و مدیریت آگهی‌ها', 'ارسال پیشنهاد معاوضه', 'چت امن و تسهیلات'],
  },
  business: {
    id: 'business',
    title: 'پنل کسب‌وکار (آژانس / نمایشگاه)',
    shortTitle: 'کسب‌وکار',
    description: 'مدیریت فروشگاه حرفه‌ای، افزودن مشاوران فروش، بسته‌های نردبان و آمار پیشرفته آگهی‌ها.',
    badgeText: 'کسب‌وکار',
    permissions: ['فروشگاه اختصاصی در تهاتر آپ', 'مدیریت مشاوران زیرمجموعه', 'آمار بازدید و تماس حرفه‌ای'],
  },
  moderator: {
    id: 'moderator',
    title: 'کارشناس بررسی و ناظر آگهی',
    shortTitle: 'ناظر آگهی',
    description: 'صف انتشار آگهی‌ها، بررسی ممیزی هوش مصنوعی آفلاین، تایید تصاویر مالک و رسیدگی به گزارش‌ها.',
    badgeText: 'ناظر آگهی',
    permissions: ['تایید / رد آگهی در صف انتظار', 'تایید نشان اصالت تصاویر', 'بررسی گزارش‌های تخلف'],
  },
  support: {
    id: 'support',
    title: 'کارشناس پشتیبانی و حل اختلاف',
    shortTitle: 'پشتیبان',
    description: 'پاسخگویی به تیکت‌ها، پیگیری پرونده‌های اقساط ۵۰/۵۰، داوری معاوضه و رفع مسدودی حساب.',
    badgeText: 'پشتیبان',
    permissions: ['صندوق تیکت کاربران', 'پیگیری داوری و تسهیلات', 'مسدودی / رفع مسدودی حساب'],
  },
  admin: {
    id: 'admin',
    title: 'مدیر ارشد سیستم (سوپرادمین)',
    shortTitle: 'مدیر ارشد',
    description: 'کنترل کامل کاربران و نقش‌ها، مدیریت کل آگهی‌ها، تعرفه‌های نردبان/اقساط و تنظیمات هوش مصنوعی آفلاین.',
    badgeText: 'مدیر ارشد',
    permissions: ['تغییر نقش تمام کاربران', 'تنظیم تعرفه و نرخ تسهیلات', 'مدیریت موتور هوش مصنوعی آفلاین'],
  },
};

export function normalizeUserRole(raw: unknown): UserRole {
  if (typeof raw !== 'string') return 'user';
  let candidate = raw.trim();
  if (candidate.startsWith('"') && candidate.endsWith('"')) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === 'string') candidate = parsed.trim();
    } catch {
      candidate = candidate.replace(/^"+|"+$/g, '');
    }
  }
  if (Object.prototype.hasOwnProperty.call(ROLE_META, candidate)) {
    return candidate as UserRole;
  }
  return 'user';
}

export function getRoleMeta(role: unknown): RoleMeta {
  return ROLE_META[normalizeUserRole(role)];
}

export interface UserProfile {
  name: string;
  phone: string;
  city?: string;
  nationalId?: string;
  iban?: string;
  isVerified: boolean;
  joinedAt: string;
  lastLoginAt?: string;
  storeName?: string;
  storeCity?: string;
  storeBio?: string;
  preferredBarterCategories?: string[];
  personalizedFeed?: boolean;
  hidePhoneInChat: boolean;
  allowCallHours: string;
  blockedUsers: string[];
}

export interface BarterAsset {
  id: string;
  title: string;
  category: string;
  estimatedValue: number;
  condition: 'پلمپ / صفر' | 'در حد نو' | 'کارکرده سالم';
  city: string;
  swapPreference: string;
  note?: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  title: string;
  description: string;
  type: 'offer' | 'ai' | 'security' | 'ad';
  time: string;
  read: boolean;
}

export interface AuthSessionRecord {
  id: string;
  deviceLabel: string;
  phoneMasked: string;
  loginMethod: string;
  time: string;
  isCurrent: boolean;
}

export interface WalletTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'موفق' | 'در انتظار';
}

export interface BarterOffer {
  id: string;
  direction: 'received' | 'sent';
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: number;
  offeredItemTitle: string;
  offeredEstimatedPrice: number;
  cashDifference: number;
  installmentRequested: boolean;
  aiMatchPercent: number;
  proposerName: string;
  proposerPhone: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface InstallmentRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  totalAmount: number;
  barterCoveredAmount: number;
  loanAmount: number;
  months: number;
  monthlyInstallment: number;
  status: 'در حال بررسی اعتبارسنجی' | 'تایید شده' | 'تکمیل مدارک';
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  title: string;
  query: string;
  category: string | null;
  cityLabel: string;
  onlyExchange: boolean;
  notifyEnabled: boolean;
  createdAt: string;
}

export type AdModerationStatus = 'published' | 'pending' | 'needs_edit' | 'rejected';

export interface ListingAnalyticsMeta {
  moderationStatus: AdModerationStatus;
  moderationNote?: string;
  views: number;
  contactClicks: number;
  chatClicks: number;
  isUrgent?: boolean;
  expiryDays: number;
}

export interface AdReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
  details: string;
  reporterRole: UserRole;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  userName: string;
  userPhone: string;
  category: 'فنی' | 'معاوضه و داوری' | 'تسهیلات و اقساط' | 'گزارش تخلف';
  priority: 'عادی' | 'فوری';
  status: 'باز' | 'در حال پیگیری' | 'بسته‌شده';
  messages: { sender: 'user' | 'support'; text: string; time: string }[];
  createdAt: string;
}

export interface PlatformUserAccount {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  status: 'فعال' | 'مسدود موقت';
  adsCount: number;
  joinedAt: string;
}

export interface TariffConfig {
  ladderFee: number;
  urgentFee: number;
  aiExpertiseFee: number;
  installmentBaseRate: number;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'علی فیروزی',
  phone: '09123456789',
  city: 'تهران',
  nationalId: '',
  iban: '',
  isVerified: false,
  joinedAt: '۱۴۰۵/۰۲/۱۰',
  lastLoginAt: 'امروز',
  storeName: 'بازرگانی و املاک تهاتر پلاس',
  storeCity: 'تهران',
  storeBio: 'مرکز تخصصی تهاتر ملک، خودرو و کالا با امکان اقساط ۵۰/۵۰ در تهران',
  preferredBarterCategories: ['املاک', 'وسایل نقلیه', 'کالای دیجیتال'],
  personalizedFeed: true,
  hidePhoneInChat: true,
  allowCallHours: '۹:۰۰ تا ۲۱:۰۰',
  blockedUsers: ['کاربر شماره ۹۹۰۱ (ارسال اسپم)'],
};

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    title: 'افزایش اعتبار کیف پول از درگاه شاپرک',
    amount: 500_000,
    type: 'credit',
    date: '۱۴۰۵/۰۸/۲۰',
    status: 'موفق',
  },
  {
    id: 'tx-2',
    title: 'نردبان آگهی آپارتمان شمال ستارخان',
    amount: 75_000,
    type: 'debit',
    date: '۱۴۰۵/۰۸/۲۱',
    status: 'موفق',
  },
  {
    id: 'tx-3',
    title: 'کارشناسی هوشمند تهاتر و ثبت نشان فوری',
    amount: 95_000,
    type: 'debit',
    date: '۱۴۰۵/۰۸/۲۲',
    status: 'موفق',
  },
];

export const INITIAL_BARTER_OFFERS: BarterOffer[] = [
  {
    id: 'bo-1',
    direction: 'received',
    listingId: 'ad-1',
    listingTitle: 'آیفون ۱۶ پرو مکس ۵۱۲ گیگابایت ZAA پلمپ',
    listingImage: '/ads/fake-1.svg',
    listingPrice: 128_000_000,
    offeredItemTitle: 'مک‌بوک پرو M3 Pro 14 اینچ در حد نو + ۲۰ میلیون نقد',
    offeredEstimatedPrice: 108_000_000,
    cashDifference: 20_000_000,
    installmentRequested: false,
    aiMatchPercent: 93,
    proposerName: 'حسین رضایی',
    proposerPhone: '۰۹۱۲۳۱۱۴۴۵۵',
    note: 'دستگاه سایکل باتری ۱۲ دارد و بدون خط و خش است. آماده معامله حضوری در ونک.',
    status: 'pending',
    createdAt: '۲ ساعت پیش',
  },
  {
    id: 'bo-2',
    direction: 'sent',
    listingId: 'ad-2',
    listingTitle: 'آپارتمان ۵۰ متر شمال ستارخان معاوضه با خودرو',
    listingImage: '/ads/fake-2.svg',
    listingPrice: 5_200_000_000,
    offeredItemTitle: 'هیوندای توسان ۲۰۱۸ فول وارداتی + اقساط ۵۰/۵۰',
    offeredEstimatedPrice: 3_600_000_000,
    cashDifference: 1_600_000_000,
    installmentRequested: true,
    aiMatchPercent: 89,
    proposerName: 'مشاورین تهاتر غرب',
    proposerPhone: '۰۹۱۲۵۵۶۸۸۷۷',
    note: 'پیشنهاد تهاتر خودرو به مبلغ ۳.۶ میلیارد و تقسیط ۱.۶ میلیارد طی ۲۴ ماه.',
    status: 'accepted',
    createdAt: 'دیروز',
  },
];

export const INITIAL_INSTALLMENT_REQUESTS: InstallmentRequest[] = [
  {
    id: 'ins-1',
    listingId: 'ad-2',
    listingTitle: 'آپارتمان ۵۰ متر شمال ستارخان معاوضه با خودرو',
    totalAmount: 5_200_000_000,
    barterCoveredAmount: 3_600_000_000,
    loanAmount: 1_600_000_000,
    months: 24,
    monthlyInstallment: 83_000_000,
    status: 'در حال بررسی اعتبارسنجی',
    createdAt: '۱۴۰۵/۰۸/۲۲',
  },
];

export const INITIAL_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: 'ss-1',
    title: 'آپارتمان معاوضه با خودرو در ستارخان و غرب تهران',
    query: 'معاوضه خودرو',
    category: 'املاک',
    cityLabel: 'تهران',
    onlyExchange: true,
    notifyEnabled: true,
    createdAt: '۱۴۰۵/۰۸/۱۹',
  },
  {
    id: 'ss-2',
    title: 'کالای دیجیتال بالای ۵۰ میلیون با اقساط',
    query: 'آیفون',
    category: 'کالای دیجیتال',
    cityLabel: 'همه شهرها',
    onlyExchange: false,
    notifyEnabled: false,
    createdAt: '۱۴۰۵/۰۸/۲۱',
  },
];

export const INITIAL_AD_REPORTS: AdReport[] = [
  {
    id: 'rep-1',
    listingId: 'ad-9',
    listingTitle: 'ساعت رولکس ساب‌مارینر کلکسیونی سوئیسی',
    reason: 'نیاز به احراز اصالت و فاکتور معتبر',
    details: 'کاربر درخواست بررسی اصالت تصویر و ضمانت‌نامه بین‌المللی ساعت را ثبت کرده است.',
    reporterRole: 'user',
    status: 'open',
    createdAt: '۴۵ دقیقه پیش',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    subject: 'تایید مدارک تسهیلات ۵۰/۵۰ برای معاوضه خودرو و ملک',
    userName: 'سارا محمدی',
    userPhone: '09128876655',
    category: 'تسهیلات و اقساط',
    priority: 'فوری',
    status: 'باز',
    createdAt: '۱ ساعت پیش',
    messages: [
      {
        sender: 'user',
        text: 'سلام، مدارک کارشناسی خودرو را بارگذاری کردم. چقدر زمان می‌برد سقف تسهیلات اقساطی اعلام شود؟',
        time: '۱۳:۱۰',
      },
    ],
  },
  {
    id: 'tkt-102',
    subject: 'درخواست داوری تهاتر کالای دیجیتال با لپ‌تاپ',
    userName: 'رضا کرمی',
    userPhone: '09357712233',
    category: 'معاوضه و داوری',
    priority: 'عادی',
    status: 'در حال پیگیری',
    createdAt: 'دیروز',
    messages: [
      {
        sender: 'user',
        text: 'طرف مقابل برای ارسال به شهرستان درخواست بیعانه داشت، لطفاً راهنمایی کنید چطور امن انجام شود.',
        time: '۱۶:۴۰',
      },
      {
        sender: 'support',
        text: 'سلام! تا زمان کارشناسی حضوری یا ثبت معامله امن در سامانه تهاتر آپ هیچ بیعانه‌ای واریز نکنید.',
        time: '۱۶:۵۵',
      },
    ],
  },
];

export const INITIAL_PLATFORM_USERS: PlatformUserAccount[] = [
  {
    id: 'u-1',
    name: 'علی فیروزی',
    phone: '09123456789',
    role: 'admin',
    verified: true,
    status: 'فعال',
    adsCount: 4,
    joinedAt: '۱۴۰۵/۰۱/۱۵',
  },
  {
    id: 'u-2',
    name: 'مهسا کاظمی (ناظر ارشد)',
    phone: '09124459900',
    role: 'moderator',
    verified: true,
    status: 'فعال',
    adsCount: 0,
    joinedAt: '۱۴۰۵/۰۲/۰۲',
  },
  {
    id: 'u-3',
    name: 'کیوان مرادی (پشتیبان و داوری)',
    phone: '09129987766',
    role: 'support',
    verified: true,
    status: 'فعال',
    adsCount: 0,
    joinedAt: '۱۴۰۵/۰۳/۱۱',
  },
  {
    id: 'u-4',
    name: 'مشاورین تهاتر غرب',
    phone: '09125568877',
    role: 'business',
    verified: true,
    status: 'فعال',
    adsCount: 12,
    joinedAt: '۱۴۰۵/۰۴/۰۵',
  },
  {
    id: 'u-5',
    name: 'امیرحسین نادری',
    phone: '09361123344',
    role: 'user',
    verified: false,
    status: 'فعال',
    adsCount: 2,
    joinedAt: '۱۴۰۵/۰۷/۱۹',
  },
];

export const DEFAULT_TARIFFS: TariffConfig = {
  ladderFee: 75_000,
  urgentFee: 95_000,
  aiExpertiseFee: 0,
  installmentBaseRate: 22,
};

export const INITIAL_BARTER_ASSETS: BarterAsset[] = [
  {
    id: 'ba-1',
    title: 'پژو ۲۰۷ پانوراما دنده‌ای مدل ۱۴۰۲ بی‌رنگ',
    category: 'وسایل نقلیه',
    estimatedValue: 920_000_000,
    condition: 'در حد نو',
    city: 'تهران',
    swapPreference: 'معاوضه با آپارتمان کوچک در غرب تهران یا خودرو شاسی‌بلند + اقساط ۵۰/۵۰',
    note: 'کارکرد ۲۸ هزار کیلومتر، بیمه ۱۱ ماه، آماده کارشناسی',
    createdAt: '۱۴۰۵/۰۸/۱۸',
  },
  {
    id: 'ba-2',
    title: 'مک‌بوک پرو ۱۴ اینچ M3 Pro حافظه ۵۱۲ گیگ',
    category: 'کالای دیجیتال',
    estimatedValue: 118_000_000,
    condition: 'در حد نو',
    city: 'تهران',
    swapPreference: 'معاوضه با آیفون ۱۶ پرو مکس یا تجهیزات اداری',
    note: 'سایکل باتری ۱۵، بدون خط و خش همراه با جعبه اصلی',
    createdAt: '۱۴۰۵/۰۸/۲۱',
  },
];

export const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-1',
    title: 'تطابق ۹۳٪ هوش مصنوعی برای پیشنهاد معاوضه جدید',
    description: 'حسین رضایی برای آگهی آیفون ۱۶ پرو مکس شما پیشنهاد معاوضه با مک‌بوک پرو + ۲۰ میلیون نقد ثبت کرد.',
    type: 'offer',
    time: '۲ ساعت پیش',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'کشف زنجیره تهاتر ۳ ضلعی متناسب با سبد دارایی شما',
    description: 'موتور آفلاین یک حلقه تهاتر جدید بین خودروی سبد شما و آپارتمان ۵۰ متری ستارخان پیدا کرد.',
    type: 'ai',
    time: 'دیروز',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'یادآور تکمیل احراز هویت و فعال‌سازی نشان اعتماد سبز',
    description: 'برای افزایش اعتماد طرف‌های معاوضه و دریافت سقف تسهیلات ۵۰/۵۰، کد ملی و شبا را در پروفایل ثبت کنید.',
    type: 'security',
    time: '۳ روز پیش',
    read: true,
  },
];

export const INITIAL_AUTH_SESSIONS: AuthSessionRecord[] = [
  {
    id: 'sess-current',
    deviceLabel: 'مرورگر وب فعلی (دسکتاپ / موبایل)',
    phoneMasked: '۰۹۱۲ *** ۶۷۸۹',
    loginMethod: 'ورود با کد تایید پیامکی',
    time: 'نشست فعال کنونی',
    isCurrent: true,
  },
];

export interface ProfileCompletenessCheck {
  id: string;
  label: string;
  done: boolean;
  targetTab: DashboardTab;
}

export function computeProfileMetrics(
  profile: UserProfile,
  isLoggedIn: boolean,
  adsCount: number,
  assetsCount: number
): {
  completionPercent: number;
  trustScore: number;
  checks: ProfileCompletenessCheck[];
} {
  const hasPhone = isLoggedIn && /^09\d{9}$/.test(profile.phone || '');
  const hasName = Boolean(profile.name && profile.name.trim().length >= 3);
  const hasKyc = Boolean(profile.isVerified || (profile.nationalId && profile.nationalId.trim().length >= 10));
  const hasIban = Boolean(profile.iban && profile.iban.trim().length >= 10);
  const hasAssetOrAd = assetsCount > 0 || adsCount > 0;
  const hasCity = Boolean(profile.city && profile.city.trim().length > 0);

  const checks: ProfileCompletenessCheck[] = [
    { id: 'phone', label: 'ورود و تایید شماره موبایل', done: hasPhone, targetTab: 'profile' },
    { id: 'name', label: 'تکمیل نام و نام خانوادگی', done: hasName, targetTab: 'profile' },
    { id: 'city', label: 'تعیین شهر اصلی فعالیت', done: hasCity, targetTab: 'profile' },
    { id: 'kyc', label: 'احراز هویت (کد ملی و نشان سبز)', done: hasKyc, targetTab: 'profile' },
    { id: 'iban', label: 'ثبت شماره شبا برای تسویه امن', done: hasIban, targetTab: 'profile' },
    { id: 'inventory', label: 'ثبت دارایی در سبد تهاتر یا آگهی', done: hasAssetOrAd, targetTab: 'barterAssets' },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const completionPercent = Math.round((doneCount / checks.length) * 100);
  const trustScore = Math.min(
    99,
    (hasPhone ? 35 : 15) +
      (hasName ? 15 : 0) +
      (hasKyc ? 25 : 0) +
      (hasIban ? 10 : 0) +
      (hasAssetOrAd ? 10 : 0) +
      (hasCity ? 4 : 0)
  );

  return { completionPercent, trustScore, checks };
}
