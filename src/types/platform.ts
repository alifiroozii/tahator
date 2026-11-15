export type UserRole = 'user' | 'business' | 'moderator' | 'support' | 'admin';

export type DashboardTab =
  | 'overview'
  | 'business'
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
  accountType?: string;
  onboardingCompleted?: boolean;
  nationalId?: string;
  iban?: string;
  isVerified: boolean;
  verifiedAt?: string;
  simOwnershipRevoked?: boolean;
  autoOfficialInvoice?: boolean;
  uiTheme?: 'system' | 'light' | 'dark';
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
  name: '',
  phone: '',
  city: 'تهران',
  nationalId: '',
  iban: '',
  isVerified: false,
  joinedAt: '',
  lastLoginAt: '',
  storeName: '',
  storeCity: 'تهران',
  storeBio: '',
  preferredBarterCategories: [],
  personalizedFeed: true,
  hidePhoneInChat: true,
  allowCallHours: '۹:۰۰ تا ۲۱:۰۰',
  blockedUsers: [],
};

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_BARTER_OFFERS: BarterOffer[] = [];

export const INITIAL_INSTALLMENT_REQUESTS: InstallmentRequest[] = [];

export const INITIAL_SAVED_SEARCHES: SavedSearch[] = [];

export const INITIAL_AD_REPORTS: AdReport[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];

export const INITIAL_PLATFORM_USERS: PlatformUserAccount[] = [];

export const DEFAULT_TARIFFS: TariffConfig = {
  ladderFee: 75_000,
  urgentFee: 95_000,
  aiExpertiseFee: 0,
  installmentBaseRate: 22,
};

export const INITIAL_BARTER_ASSETS: BarterAsset[] = [];

export const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [];

export const INITIAL_AUTH_SESSIONS: AuthSessionRecord[] = [];

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
