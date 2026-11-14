'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BellRing,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Package,
  Percent,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Sun,
  User,
  Wallet,
} from 'lucide-react';
import { CITIES, Listing, formatToman, toPersianDigits } from '@/data/mockData';
import {
  AuthSessionRecord,
  BarterAsset,
  BarterOffer,
  DashboardTab,
  InstallmentRequest,
  ListingAnalyticsMeta,
  ROLE_META,
  getRoleMeta,
  SavedSearch,
  UserNotification,
  UserProfile,
  UserRole,
  WalletTransaction,
  computeProfileMetrics,
} from '@/types/platform';
import MyAdsSection, { ArchivedAdEntry } from '@/components/dashboard/MyAdsSection';
import { BarterAssetsSection, BarterOffersSection } from '@/components/dashboard/BarterWorkflowSection';
import BookmarksNotesSection from '@/components/dashboard/BookmarksNotesSection';

interface UserDashboardModalProps {
  initialTab?: DashboardTab;
  isLoggedIn: boolean;
  user: UserProfile;
  userRole: UserRole;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenRolePanel: () => void;
  onOpenSupport?: () => void;
  walletBalance: number;
  transactions: WalletTransaction[];
  onTopUpWallet: (amount: number) => void;
  allListings: Listing[];
  myAds: Listing[];
  archivedAds?: ArchivedAdEntry[];
  onRestoreArchivedAd?: (id: string) => void;
  listingMeta: Record<string, ListingAnalyticsMeta>;
  onOpenPostAd: () => void;
  onOpenFacilities: () => void;
  onOpenCompareWith: (listing: Listing) => void;
  onOpenAiTab?: (tab: 'chat' | 'compare' | 'estimator' | 'chain') => void;
  onSelectListing: (listing: Listing) => void;
  onLadderAd: (id: string) => void;
  onUrgentAd: (id: string) => void;
  onRenewAd: (id: string) => void;
  onEditAd: (
    id: string,
    updates: { title: string; price: number; hasExchange: boolean; exchangeWith: string; description: string }
  ) => void;
  onDeleteAd: (id: string, reason: string) => void;
  barterAssets: BarterAsset[];
  onAddBarterAsset: (asset: Omit<BarterAsset, 'id' | 'createdAt'>) => void;
  onDeleteBarterAsset: (id: string) => void;
  barterOffers: BarterOffer[];
  onRespondBarterOffer: (offerId: string, status: 'accepted' | 'rejected') => void;
  onOpenChatFromOffer: (offer: BarterOffer) => void;
  installmentRequests: InstallmentRequest[];
  bookmarkedAds: Listing[];
  onToggleBookmark: (id: string) => void;
  notes: Record<string, string>;
  onSaveNote: (id: string, text: string) => void;
  recentAds: Listing[];
  onClearRecent: () => void;
  savedSearches: SavedSearch[];
  onToggleSavedSearchNotify: (id: string) => void;
  onApplySavedSearch: (search: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  notifications: UserNotification[];
  onMarkNotificationsRead: () => void;
  sessions: AuthSessionRecord[];
  onRevokeOtherSessions: () => void;
  onSubmitSafetyReport: (subject: string, details: string) => void;
  onClose: () => void;
}

type CanonicalTab = Exclude<DashboardTab, 'notes' | 'savedSearches'>;

const normalizeTab = (t: DashboardTab): { tab: CanonicalTab; bookmarkSub: 'adsAndNotes' | 'searches' } => {
  if (t === 'notes') return { tab: 'bookmarks', bookmarkSub: 'adsAndNotes' };
  if (t === 'savedSearches') return { tab: 'bookmarks', bookmarkSub: 'searches' };
  return { tab: t, bookmarkSub: 'adsAndNotes' };
};

interface NavRowConfig {
  id: CanonicalTab;
  label: string;
  group: number;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: NavRowConfig[] = [
  { id: 'business', label: 'حساب کسب‌وکار تهاتر', group: 1, icon: Star },
  { id: 'profile', label: 'تأیید هویت', group: 1, icon: ShieldCheck },
  { id: 'overview', label: 'نمای کلی و تطبیق هوشمند', group: 2, icon: LayoutDashboard },
  { id: 'barterAssets', label: 'سبد دارایی‌های تهاتر من', group: 2, icon: Package },
  { id: 'barterOffers', label: 'معاوضه‌ها و تفاهم‌نامه‌ها', group: 2, icon: ArrowLeftRight },
  { id: 'myAds', label: 'آگهی‌های من', group: 2, icon: FileText },
  { id: 'wallet', label: 'کیف‌پول و پرداخت‌ها', group: 3, icon: Wallet },
  { id: 'installments', label: 'اقساط ۵۰/۵۰ و تسهیلات', group: 3, icon: Percent },
  { id: 'bookmarks', label: 'نشان‌ها و یادداشت‌ها', group: 4, icon: Bookmark },
  { id: 'recent', label: 'بازدیدهای اخیر', group: 4, icon: Clock },
  { id: 'safety', label: 'مقابله با مزاحمت و کلاهبرداری', group: 5, icon: ShieldAlert },
  { id: 'settings', label: 'تنظیمات', group: 5, icon: Settings },
];

export default function UserDashboardModal({
  initialTab = 'overview',
  isLoggedIn,
  user,
  userRole,
  onOpenAuthModal,
  onLogout,
  onUpdateProfile,
  onSwitchRole,
  onOpenRolePanel,
  onOpenSupport,
  walletBalance,
  transactions,
  onTopUpWallet,
  allListings,
  myAds,
  archivedAds = [],
  onRestoreArchivedAd,
  listingMeta,
  onOpenPostAd,
  onOpenFacilities,
  onOpenCompareWith,
  onOpenAiTab,
  onSelectListing,
  onLadderAd,
  onUrgentAd,
  onRenewAd,
  onEditAd,
  onDeleteAd,
  barterAssets,
  onAddBarterAsset,
  onDeleteBarterAsset,
  barterOffers,
  onRespondBarterOffer,
  onOpenChatFromOffer,
  installmentRequests,
  bookmarkedAds,
  onToggleBookmark,
  notes,
  onSaveNote,
  recentAds,
  onClearRecent,
  savedSearches,
  onToggleSavedSearchNotify,
  onApplySavedSearch,
  onDeleteSavedSearch,
  notifications,
  onMarkNotificationsRead,
  sessions,
  onRevokeOtherSessions,
  onSubmitSafetyReport,
  onClose,
}: UserDashboardModalProps) {
  const initialMapped = normalizeTab(initialTab);
  const [tab, setTab] = useState<CanonicalTab>(initialMapped.tab);
  const [bookmarkSubTab, setBookmarkSubTab] = useState<'adsAndNotes' | 'searches'>(
    initialMapped.bookmarkSub
  );
  // Tahator mobile UX: menu list first when entering My Tahator overview; direct content when deep-linking
  const [mobileScreen, setMobileScreen] = useState<'menu' | 'content'>(
    initialTab === 'overview' ? 'menu' : 'content'
  );

  // Profile / KYC states
  const [profName, setProfName] = useState(user.name);
  const [profCity, setProfCity] = useState(user.city || 'تهران');
  const [profNationalId, setProfNationalId] = useState(user.nationalId || '');
  const [profIban, setProfIban] = useState(user.iban || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');
  const [showSimConfirm, setShowSimConfirm] = useState(false);

  // Wallet states
  const [customCharge, setCustomCharge] = useState('200000');

  // Safety states
  const [reportCategory, setReportCategory] = useState<'harassment' | 'fraud'>('fraud');
  const [safetySubject, setSafetySubject] = useState('درخواست بیعانه پیش از رویت حضوری');
  const [safetyDetails, setSafetyDetails] = useState('');
  const [safetySubmittedMsg, setSafetySubmittedMsg] = useState('');

  // Store & Settings states
  const [storeName, setStoreName] = useState(user.storeName || '');
  const [storeCity, setStoreCity] = useState(user.storeCity || 'تهران');
  const [storeBio, setStoreBio] = useState(user.storeBio || '');
  const [callHours, setCallHours] = useState(user.allowCallHours || '۹:۰۰ تا ۲۱:۰۰');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [businessSavedMsg, setBusinessSavedMsg] = useState('');

  useEffect(() => {
    const mapped = normalizeTab(initialTab);
    setTab(mapped.tab);
    setBookmarkSubTab(mapped.bookmarkSub);
    setMobileScreen(initialTab === 'overview' ? 'menu' : 'content');
  }, [initialTab]);

  useEffect(() => {
    setProfName(user.name);
    setProfCity(user.city || 'تهران');
    setProfNationalId(user.nationalId || '');
    setProfIban(user.iban || '');
    setStoreName(user.storeName || '');
    setStoreCity(user.storeCity || 'تهران');
    setStoreBio(user.storeBio || '');
    setCallHours(user.allowCallHours || '۹:۰۰ تا ۲۱:۰۰');
  }, [user]);

  const noteCount = Object.values(notes).filter((txt) => txt.trim().length > 0).length;
  const pendingOffersCount = barterOffers.filter(
    (o) => o.direction === 'received' && o.status === 'pending'
  ).length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const profileMetrics = computeProfileMetrics(user, isLoggedIn, myAds.length, barterAssets.length);
  const totalAssetValue = barterAssets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
  const totalAdViews = myAds.reduce(
    (sum, ad) => sum + (listingMeta[ad.id]?.views || 120),
    0
  );

  const selectSidebarTab = (nextTab: CanonicalTab) => {
    setTab(nextTab);
    setMobileScreen('content');
  };

  const activeNavMeta = SIDEBAR_ITEMS.find((i) => i.id === tab);

  const getBadgeForItem = (id: CanonicalTab): number | null => {
    if (id === 'overview' && unreadNotifCount > 0) return unreadNotifCount;
    if (id === 'barterAssets' && barterAssets.length > 0) return barterAssets.length;
    if (id === 'barterOffers' && pendingOffersCount > 0) return pendingOffersCount;
    if (id === 'myAds' && myAds.length > 0) return myAds.length;
    if (id === 'bookmarks' && bookmarkedAds.length + noteCount > 0)
      return bookmarkedAds.length + noteCount;
    return null;
  };

  return (
    <section
      className="max-w-[1140px] w-full mx-auto px-3 sm:px-6 pt-4 pb-24 lg:pb-12 flex-1"
      aria-label="پنل کاربری تهاتر من"
    >
      {/* Top Breadcrumb Navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        {mobileScreen === 'content' ? (
          <button
            type="button"
            onClick={() => setMobileScreen('menu')}
            className="lg:hidden inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--content-neutral-stronger)] hover:text-[var(--brand-primary)]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فهرست تهاتر من</span>
            <span className="text-[var(--content-neutral-default)] font-normal">
              / {activeNavMeta?.label}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--content-neutral-default)] hover:text-[var(--brand-primary)]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه آگهی‌ها</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="hidden lg:inline-flex items-center gap-1.5 text-[13px] text-[var(--content-neutral-default)] hover:text-[var(--brand-primary)] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به همه آگهی‌ها</span>
        </button>

        {isLoggedIn && userRole !== 'user' && (
          <button
            type="button"
            onClick={onOpenRolePanel}
            className="kt-button--outlined !h-[32px] !px-3 text-[12px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-action)]" />
            <span>پنل {getRoleMeta(userRole).shortTitle}</span>
          </button>
        )}
      </div>

      {/* Exact Tahator 2-Column Workspace Layout (#F5F5F5 Sidebar Right + White Content Pane Left) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
        {/* RIGHT NAVIGATION SIDEBAR (Full-width menu on mobile when mobileScreen==='menu', fixed 292px card on lg+) */}
        <aside
          className={`w-full lg:w-[292px] shrink-0 ${
            mobileScreen === 'content' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-[#F5F5F5] rounded-[8px] border border-[#EBEBEB] overflow-hidden">
            {/* User Header Block (Clickable to Overview) */}
            <div className="p-4 border-b border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => selectSidebarTab('overview')}
                className="w-full text-right flex items-start justify-between gap-2 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <User className="w-5 h-5 text-[var(--content-neutral-default)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[var(--content-neutral-stronger)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                        {isLoggedIn ? user.name : 'کاربر مهمان تهاتر آپ'}
                      </span>
                      {user.isVerified && !user.simOwnershipRevoked && (
                        <CheckCircle2
                          className="w-4 h-4 text-[var(--semantic-positive)] shrink-0"
                          aria-label="هویت تاییدشده"
                        />
                      )}
                    </div>
                    <div className="text-[12px] text-[#757575] mt-1 dir-ltr text-right">
                      {isLoggedIn ? toPersianDigits(user.phone) : 'حساب موبایل متصل نشده'}
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#999999] shrink-0 mt-1" />
              </button>

              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="mt-3 w-full kt-button--primary !h-[36px] text-[12px] font-bold"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ورود / عضویت با موبایل</span>
                </button>
              )}
            </div>

            {/* Grouped Tahator Menu Rows */}
            <nav aria-label="منوی حساب کاربری تهاتر من">
              {SIDEBAR_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const active = tab === item.id;
                const badge = getBadgeForItem(item.id);
                const startsNewGroup = idx > 0 && SIDEBAR_ITEMS[idx - 1].group !== item.group;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSidebarTab(item.id)}
                    className={`w-full px-4 py-3.5 text-right flex items-center justify-between gap-2 transition-colors hover:bg-[#ECECEC] ${
                      startsNewGroup
                        ? 'border-t-[6px] border-t-white'
                        : idx > 0
                        ? 'border-t border-[#E6E6E6]'
                        : ''
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${
                          active ? 'text-[var(--brand-primary)]' : 'text-[#666666]'
                        }`}
                      />
                      <span
                        className={`text-[13.5px] truncate ${
                          active
                            ? 'text-[var(--brand-primary)] font-bold'
                            : 'text-[var(--content-neutral-stronger)] font-normal'
                        }`}
                      >
                        {item.label}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 shrink-0">
                      {badge !== null && (
                        <span
                          className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                            active
                              ? 'bg-[var(--brand-action)] text-white'
                              : 'bg-white text-[var(--content-neutral-stronger)] border border-[#E0E0E0]'
                          }`}
                        >
                          {toPersianDigits(badge)}
                        </span>
                      )}
                      {item.id === 'profile' && (!user.isVerified || user.simOwnershipRevoked) && (
                        <span className="w-2 h-2 rounded-full bg-[var(--semantic-warning)]" />
                      )}
                      <ChevronLeft
                        className={`w-4 h-4 ${
                          active ? 'text-[var(--brand-primary)]' : 'text-[#9E9E9E]'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}

              {/* Logout / Login Row at Bottom */}
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full px-4 py-3.5 text-right flex items-center justify-between gap-2 border-t-[6px] border-t-white hover:bg-[#ECECEC] transition-colors"
                >
                  <span className="flex items-center gap-3 text-[var(--semantic-negative)] font-medium text-[13.5px]">
                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                    <span>خروج</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
              )}
            </nav>
          </div>

          {/* Subtle Footer Micro-Links Underneath Sidebar Card (Matching Tahator Desktop) */}
          <div className="hidden lg:flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 px-2 text-[11px] text-[#757575]">
            <button
              type="button"
              onClick={() => selectSidebarTab('business')}
              className="hover:text-[var(--brand-primary)]"
            >
              درباره تهاتر آپ
            </button>
            <button
              type="button"
              onClick={() => selectSidebarTab('safety')}
              className="hover:text-[var(--brand-primary)]"
            >
              قوانین معاملات امن
            </button>
            <button
              type="button"
              onClick={() => (onOpenSupport ? onOpenSupport() : selectSidebarTab('safety'))}
              className="hover:text-[var(--brand-primary)]"
            >
              پشتیبانی و داوری
            </button>
          </div>
        </aside>

        {/* LEFT MAIN CONTENT WORKSPACE */}
        <div
          className={`flex-1 min-w-0 w-full ${
            mobileScreen === 'menu' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Compact Guest Sign-In Reminder Banner */}
          {!isLoggedIn && (
            <div className="mb-5 p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                <div>
                  <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                    برای ذخیره دائمی آگهی‌ها، پیشنهادهای تهاتر و احراز هویت وارد شوید
                  </div>
                  <div className="text-[11px] text-[var(--content-neutral-default)]">
                    کد تایید ۶ رقمی بدون نیاز به سرویس پیامکی روی صفحه نمایش داده می‌شود.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="kt-button--primary !h-[34px] !px-4 text-[12px] shrink-0"
              >
                ورود با موبایل
              </button>
            </div>
          )}

          {/* TAB: OVERVIEW (نمای کلی و تطبیق هوشمند) */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Calm Tahator Profile Summary Header */}
              <div className="p-5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-[18px] font-bold shrink-0">
                    {isLoggedIn ? user.name?.trim().charAt(0) || 'ت' : 'م'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[17px] font-bold text-[var(--content-neutral-stronger)] truncate">
                        {isLoggedIn ? user.name : 'کاربر مهمان تهاتر آپ'}
                      </h2>
                      {isLoggedIn && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          {userRole === 'user' ? 'حساب کاربری شخصی' : getRoleMeta(userRole).shortTitle}
                        </span>
                      )}
                      {user.isVerified && !user.simOwnershipRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تأیید هویت شده</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectSidebarTab('profile')}
                          className="px-2 py-0.5 rounded-full bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11px] font-bold hover:underline"
                        >
                          نیازمند تکمیل تأیید هویت
                        </button>
                      )}
                    </div>
                    <div className="text-[12px] text-[var(--content-neutral-default)] mt-1 flex flex-wrap items-center gap-3">
                      <span className="dir-ltr">
                        {isLoggedIn ? toPersianDigits(user.phone) : 'شماره موبایل ثبت نشده'}
                      </span>
                      <span>· شهر: {user.city || 'تهران'}</span>
                      <span>· عضویت: {user.joinedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 bg-white px-4 py-2.5 rounded-[8px] border border-[var(--border-neutral-weaker)]">
                  <Award className="w-6 h-6 text-[var(--semantic-positive)] shrink-0" />
                  <div>
                    <div className="text-[11px] text-[var(--content-neutral-default)]">
                      امتیاز اعتماد تهاتر
                    </div>
                    <div className="text-[16px] font-extrabold text-[var(--semantic-positive)]">
                      {toPersianDigits(profileMetrics.trustScore)} از ۱۰۰
                    </div>
                  </div>
                </div>
              </div>

              {/* Completeness Checklist */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                    آمادگی حساب برای معاملات تهاتر و اقساط ۵۰/۵۰ ({toPersianDigits(profileMetrics.completionPercent)}٪)
                  </span>
                  <div className="w-full sm:w-48 h-2 rounded-full bg-[var(--surface-neutral-weak)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--semantic-positive)] transition-all"
                      style={{ width: `${profileMetrics.completionPercent}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {profileMetrics.checks.map((chk) => (
                    <button
                      key={chk.id}
                      type="button"
                      onClick={() => {
                        if (chk.id === 'phone' && !isLoggedIn) {
                          onOpenAuthModal();
                        } else {
                          selectSidebarTab(normalizeTab(chk.targetTab).tab);
                        }
                      }}
                      className={`px-3 py-2 rounded-[6px] border text-[12px] flex items-center justify-between gap-2 text-right transition-colors ${
                        chk.done
                          ? 'bg-[var(--semantic-positive-soft)]/45 border-[var(--semantic-positive)]/30 text-[var(--semantic-positive)]'
                          : 'bg-[var(--surface-neutral-subtle)] border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[var(--content-neutral-stronger)]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {chk.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-[var(--brand-action)] shrink-0" />
                        )}
                        <span className="truncate">{chk.label}</span>
                      </span>
                      {!chk.done && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Core KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => selectSidebarTab('myAds')}
                  className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                >
                  <div className="text-[11px] text-[var(--content-neutral-default)]">آگهی‌های جاری من</div>
                  <div className="text-[18px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                    {toPersianDigits(myAds.length)} آگهی
                  </div>
                  <div className="text-[11px] text-[var(--brand-primary)] mt-1">
                    {toPersianDigits(totalAdViews)} بازدید ۷ روز اخیر
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectSidebarTab('barterAssets')}
                  className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                >
                  <div className="text-[11px] text-[var(--content-neutral-default)]">سبد دارایی‌های تهاتر</div>
                  <div className="text-[18px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                    {toPersianDigits(barterAssets.length)} دارایی
                  </div>
                  <div className="text-[11px] text-[var(--semantic-positive)] mt-1 truncate">
                    ارزش: {formatToman(totalAssetValue)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectSidebarTab('barterOffers')}
                  className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                >
                  <div className="text-[11px] text-[var(--content-neutral-default)]">معاوضه‌ها و اقساط</div>
                  <div className="text-[18px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                    {toPersianDigits(pendingOffersCount)} در انتظار
                  </div>
                  <div className="text-[11px] text-[var(--content-neutral-default)] mt-1">
                    {toPersianDigits(installmentRequests.length)} پرونده ۵۰/۵۰ فعال
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectSidebarTab('wallet')}
                  className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                >
                  <div className="text-[11px] text-[var(--content-neutral-default)]">اعتبار کیف پول</div>
                  <div className="text-[16px] sm:text-[18px] font-extrabold text-[var(--brand-primary)] mt-1 truncate">
                    {formatToman(walletBalance)}
                  </div>
                  <div className="text-[11px] text-[var(--semantic-info)] mt-1">شارژ و فاکتور رسمی</div>
                </button>
              </div>

              {/* Notifications List */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    <BellRing className="w-4 h-4 text-[var(--brand-action)]" />
                    <span>اعلان‌ها و رویدادهای حساب ({toPersianDigits(unreadNotifCount)} جدید)</span>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkNotificationsRead}
                      className="text-[11px] font-bold text-[var(--brand-primary)] hover:underline"
                    >
                      همه خوانده شد
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-[6px] border text-[12px] flex items-start justify-between gap-3 ${
                        n.read
                          ? 'bg-[var(--surface-neutral-subtle)] border-[var(--border-neutral-weaker)]'
                          : 'bg-[var(--brand-soft)]/45 border-[var(--brand-action)]/30'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-[var(--content-neutral-stronger)] flex items-center gap-1.5">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--brand-action)] shrink-0" />}
                          <span>{n.title}</span>
                        </div>
                        <p className="text-[11px] text-[var(--content-neutral-default)] leading-5">
                          {n.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--content-neutral-default)] shrink-0">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TAHATOR BUSINESS / SHOWROOM PARTNER (Adapted for Barter & 50/50) */}
          {tab === 'business' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-[var(--border-neutral-weaker)]">
                <div className="text-[11px] text-[var(--content-neutral-default)] mb-1">
                  حساب کسب‌وکار تهاتر &gt; نمایشگاه، آژانس و فروشگاه همکار
                </div>
                <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                  اگر نمایشگاه خودرو، دفتر املاک یا فروشگاه تهاتری دارید
                </h2>
              </div>

              {businessSavedMsg && (
                <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{businessSavedMsg}</span>
                </div>
              )}

              {/* 3 Tahator Clean Benefit Rows Adapted to Tahator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] space-y-1.5">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    گزارش تبدیل معاوضه
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-5">
                    آمار دقیق بازدید، نمایش شماره، شروع گفتگو و پیشنهادهای تهاتر هر آگهی را ببینید.
                  </p>
                </div>
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] space-y-1.5">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    پیش‌تأیید اقساط ۵۰/۵۰
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-5">
                    روی همه آگهی‌های نمایشگاه خود نشان رسمی معاوضه با ۵۰٪ تهاتر و ۵۰٪ اقساط دریافت کنید.
                  </p>
                </div>
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] space-y-1.5">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    ویترین اختصاصی و تیم فروش
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-5">
                    صفحه نمایشگاه یا آژانس خود را با بیوگرافی، شهر فعالیت و کارشناسان فروش مدیریت کنید.
                  </p>
                </div>
              </div>

              {/* Business Store Form */}
              <div className="p-5 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-4">
                <div className="flex items-center gap-2 text-[14px] font-bold">
                  <Store className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>مشخصات فروشگاه، آژانس املاک یا نمایشگاه</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] mb-1">نام نمایشگاه / فروشگاه / برند</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثلاً: اتوگالری تهاتر پایتخت"
                      className="kt-input !h-[38px] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] mb-1">شهر فعالیت</label>
                    <input
                      type="text"
                      value={storeCity}
                      onChange={(e) => setStoreCity(e.target.value)}
                      className="kt-input !h-[38px] text-[13px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] mb-1">زمینه فعالیت و شرایط تهاتر فروشگاه</label>
                  <textarea
                    rows={3}
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    placeholder="معاوضه خودروهای کارشناسی‌شده با ملک مسکونی و پرداخت مابه‌التفاوت اقساطی..."
                    className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[13px]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProfile({
                        storeName,
                        storeCity,
                        storeBio,
                      });
                      setBusinessSavedMsg('مشخصات حساب کسب‌وکار تهاتر با موفقیت ذخیره شد.');
                      setTimeout(() => setBusinessSavedMsg(''), 3500);
                    }}
                    className="kt-button--primary !h-[36px] !px-5 text-[13px]"
                  >
                    ذخیره اطلاعات کسب‌وکار
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IDENTITY CONFIRMATION (تأیید هویت — Exact Tahator Screenshot Fidelity!) */}
          {tab === 'profile' && (
            <div className="space-y-6">
              {profileSavedMsg && (
                <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              {/* Tahator Verified State vs Unverified */}
              {user.isVerified && !user.simOwnershipRevoked ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-[16px] font-bold text-[var(--semantic-positive)]">
                      تأیید هویت شده
                    </h2>
                    <p className="text-[13px] text-[var(--content-neutral-stronger)] mt-2">
                      تأیید هویت شما در {user.verifiedAt || '۱۴۰۵/۰۸'} از طریق کد ملی و شماره موبایل انجام شد.
                    </p>
                  </div>

                  <div className="border-t border-[var(--border-neutral-weaker)] pt-5 space-y-2.5">
                    <h3 className="text-[15px] font-bold text-[var(--content-neutral-stronger)]">
                      تغییر مالکیت سیم‌کارت
                    </h3>
                    <p className="text-[13px] text-[var(--content-neutral-stronger)] leading-6">
                      در صورتی که سیم‌کارت را تازه خریده‌اید و یا قصد فروش دارید، حتماً تغییر مالکیت آن را اعلام کنید. در غیر این صورت، عواقب هرگونه تخلف مالک قبلی یا جدید، بر عهدهٔ شما است.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSimConfirm((prev) => !prev)}
                      className="w-full py-3 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between text-[13.5px] font-bold text-[var(--content-neutral-stronger)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                      <span>اعلام تغییر مالکیت سیم‌کارت</span>
                      <ChevronLeft className="w-4 h-4 text-[#888]" />
                    </button>

                    {showSimConfirm && (
                      <div className="p-3.5 rounded-[8px] border border-[var(--semantic-warning)]/40 bg-[var(--semantic-warning-soft)]/50 space-y-2.5">
                        <p className="text-[12px] text-[var(--content-neutral-stronger)]">
                          با تایید این مورد، نشان تایید هویت فعلی لغو می‌شود و می‌توانید شماره موبایل یا کد ملی جدید را ثبت کنید.
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSimConfirm(false)}
                            className="kt-button--outlined !h-[32px] !px-3 text-[12px]"
                          >
                            انصراف
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProfile({
                                isVerified: false,
                                simOwnershipRevoked: true,
                              });
                              setShowSimConfirm(false);
                              setProfileSavedMsg('تغییر مالکیت سیم‌کارت ثبت شد. لطفاً احراز هویت جدید را تکمیل کنید.');
                            }}
                            className="kt-button--primary !h-[32px] !px-4 text-[12px]"
                          >
                            ثبت تغییر مالکیت سیم‌کارت
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[8px] border border-[var(--semantic-warning)]/40 bg-[var(--semantic-warning-soft)]/40 space-y-2">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    تأیید هویت هنوز تکمیل نشده است
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-6">
                    برای دریافت نشان «تأیید هویت شده»، صدور تفاهم‌نامه تهاتر امن و امکان ثبت درخواست اقساط ۵۰/۵۰، کد ملی ۱۰ رقمی خود را وارد کنید.
                  </p>
                </div>
              )}

              {/* Editable Identity & Settlement Form */}
              <div className="border-t border-[var(--border-neutral-weaker)] pt-5">
                <h3 className="text-[14px] font-bold text-[var(--content-neutral-stronger)] mb-4">
                  مشخصات هویتی و حساب تسویه امن تهاتر
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const verified = profNationalId.trim().length >= 10;
                    onUpdateProfile({
                      name: profName.trim() || user.name,
                      city: profCity,
                      nationalId: profNationalId.trim(),
                      iban: profIban.trim(),
                      isVerified: verified,
                      simOwnershipRevoked: false,
                      verifiedAt: verified ? user.verifiedAt || 'امروز (۱۴۰۵/۰۸)' : user.verifiedAt,
                    });
                    setProfileSavedMsg(
                      verified
                        ? 'اطلاعات ذخیره شد و نشان «تأیید هویت شده» برای حساب شما فعال گردید.'
                        : 'اطلاعات حساب ذخیره شد (برای دریافت نشان تأیید هویت، کد ملی ۱۰ رقمی وارد کنید).'
                    );
                    setTimeout(() => setProfileSavedMsg(''), 4000);
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-[13px] font-medium mb-1">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="kt-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1">شماره موبایل حساب</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={isLoggedIn ? toPersianDigits(user.phone) : 'وارد نشده'}
                        disabled
                        className="kt-input opacity-80 text-left dir-ltr cursor-not-allowed flex-1"
                      />
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="kt-button--outlined !px-3 text-[12px] shrink-0"
                      >
                        تغییر / ورود با کد
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1">شهر اصلی فعالیت</label>
                    <select
                      value={profCity}
                      onChange={(e) => setProfCity(e.target.value)}
                      className="kt-input bg-white"
                    >
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1">
                      کد ملی (جهت احراز هویت)
                    </label>
                    <input
                      type="text"
                      value={profNationalId}
                      onChange={(e) => setProfNationalId(e.target.value)}
                      placeholder="مثلاً: 0012345678"
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[13px] font-medium mb-1">
                      شماره شبا یا کارت (جهت دریافت مابه‌التفاوت نقدی تهاتر)
                    </label>
                    <input
                      type="text"
                      value={profIban}
                      onChange={(e) => setProfIban(e.target.value)}
                      placeholder="IR000000000000000000000000"
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-2.5 pt-1">
                    <button type="submit" className="kt-button--primary !px-6">
                      ذخیره و بررسی احراز هویت
                    </button>
                    {(!user.isVerified || user.simOwnershipRevoked) && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfNationalId('0019876543');
                          onUpdateProfile({
                            nationalId: '0019876543',
                            isVerified: true,
                            simOwnershipRevoked: false,
                            verifiedAt: 'امروز (۱۴۰۵/۰۸)',
                          });
                          setProfileSavedMsg('احراز هویت آزمایشی با موفقیت تایید و نشان سبز فعال شد.');
                        }}
                        className="kt-button--outlined text-[12px]"
                      >
                        تکمیل خودکار احراز هویت آزمایشی
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: BARTER ASSETS INVENTORY */}
          {tab === 'barterAssets' && (
            <BarterAssetsSection
              user={user}
              allListings={allListings}
              barterAssets={barterAssets}
              onUpdateProfile={onUpdateProfile}
              onAddBarterAsset={onAddBarterAsset}
              onDeleteBarterAsset={onDeleteBarterAsset}
              onSelectListing={onSelectListing}
              onOpenAiTab={onOpenAiTab}
              onClose={onClose}
            />
          )}

          {/* TAB: MY ADS (Exact Tahator 3-Tab Structure: جاری | نیمه‌کاره | آرشیو) */}
          {tab === 'myAds' && (
            <MyAdsSection
              myAds={myAds}
              archivedAds={archivedAds}
              listingMeta={listingMeta}
              onOpenPostAd={onOpenPostAd}
              onSelectListing={onSelectListing}
              onLadderAd={onLadderAd}
              onUrgentAd={onUrgentAd}
              onRenewAd={onRenewAd}
              onEditAd={onEditAd}
              onDeleteAd={onDeleteAd}
              onRestoreArchivedAd={onRestoreArchivedAd}
              onClose={onClose}
            />
          )}

          {/* TAB: BARTER OFFERS & AGREEMENTS */}
          {tab === 'barterOffers' && (
            <BarterOffersSection
              allListings={allListings}
              barterOffers={barterOffers}
              onRespondBarterOffer={onRespondBarterOffer}
              onOpenChatFromOffer={onOpenChatFromOffer}
              onClose={onClose}
            />
          )}

          {/* TAB: WALLET & PAYMENTS (Exact Tahator Audit #5 Elements Included) */}
          {tab === 'wallet' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                  کیف‌پول و پرداخت‌ها
                </h2>
                <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                  مدیریت اعتبار کیف‌پول برای نردبان، برچسب فوری و تاریخچه پرداخت‌ها
                </p>
              </div>

              {/* Tahator 72-Hour Refund Banner */}
              <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] flex items-start gap-2.5 text-[12.5px] text-[var(--content-neutral-stronger)]">
                <AlertCircle className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                <span>
                  در صورت کسر پول در پرداخت‌های ناموفق، مبلغ حداکثر تا ۷۲ ساعت به حساب یا کیف پول شما برمی‌گردد.
                </span>
              </div>

              <div className="p-5 rounded-[8px] bg-gradient-to-l from-[var(--brand-primary)] to-[var(--brand-action)] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[12px] opacity-90">موجودی فعلی کیف پول تهاتر آپ</div>
                  <div className="text-[24px] font-extrabold mt-1">
                    {formatToman(walletBalance)}
                  </div>
                  <div className="text-[11px] opacity-85 mt-1">
                    قابل استفاده برای نردبان، فوری، تمدید آگهی و استعلام کارشناسی
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[100_000, 250_000, 500_000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => onTopUpWallet(amt)}
                      className="px-3 py-2 rounded-[6px] bg-white/15 hover:bg-white/25 text-white text-[12px] font-bold transition-colors"
                    >
                      + {formatToman(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="text-[13px] font-medium shrink-0">
                  شارژ مبلغ دلخواه (تومان):
                </label>
                <input
                  type="number"
                  min={10000}
                  step={50000}
                  value={customCharge}
                  onChange={(e) => setCustomCharge(e.target.value)}
                  className="kt-input sm:max-w-[220px] text-left dir-ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = Number(customCharge) || 0;
                    if (val >= 10_000) onTopUpWallet(val);
                  }}
                  className="kt-button--primary !px-5"
                >
                  پرداخت و افزایش اعتبار
                </button>
              </div>

              {/* Auto Official Invoice Row */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-bold text-[var(--content-neutral-stronger)]">
                    صدور خودکار فاکتور رسمی
                  </div>
                  <div className="text-[11.5px] text-[var(--content-neutral-default)] mt-0.5">
                    ارسال خودکار فاکتور رسمی برای پرداخت‌های نردبان و خدمات کسب‌وکار با کد ملی ثبت‌شده
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(user.autoOfficialInvoice)}
                  onChange={(e) => onUpdateProfile({ autoOfficialInvoice: e.target.checked })}
                  className="w-4 h-4 accent-[var(--brand-action)] cursor-pointer shrink-0"
                  aria-label="صدور خودکار فاکتور رسمی"
                />
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-[var(--content-neutral-stronger)] mb-3">
                  تاریخچهٔ پرداخت‌ها و تراکنش‌ها
                </h3>
                <div className="border border-[var(--border-neutral-weaker)] rounded-[8px] divide-y divide-[var(--border-neutral-weaker)]">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-[13px]"
                    >
                      <div>
                        <div className="font-medium text-[var(--content-neutral-stronger)]">
                          {tx.title}
                        </div>
                        <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                          {tx.date} · وضعیت: {tx.status}
                        </div>
                      </div>
                      <div
                        className={`font-bold shrink-0 ${
                          tx.type === 'credit'
                            ? 'text-[var(--semantic-positive)]'
                            : 'text-[var(--brand-primary)]'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'} {formatToman(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: 50/50 INSTALLMENTS */}
          {tab === 'installments' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-neutral-weaker)]">
                <div>
                  <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                    اقساط ۵۰/۵۰ و تسهیلات تهاتر
                  </h2>
                  <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                    پوشش ۵۰٪ ارزش معامله با کالا یا ملک و تقسیط ۵۰٪ باقیمانده
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFacilities();
                  }}
                  className="kt-button--outlined !h-[34px] text-[12px]"
                >
                  محاسبه آنلاین سود و قسط
                </button>
              </div>

              {installmentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[14px]">{req.listingTitle}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11px] font-bold">
                      {req.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] pt-1">
                    <div className="p-2 rounded bg-[var(--surface-neutral-subtle)]">
                      <div className="text-[var(--content-neutral-default)]">ارزش کل</div>
                      <div className="font-bold mt-0.5">{formatToman(req.totalAmount)}</div>
                    </div>
                    <div className="p-2 rounded bg-[var(--surface-neutral-subtle)]">
                      <div className="text-[var(--content-neutral-default)]">سهم تهاتر</div>
                      <div className="font-bold mt-0.5">{formatToman(req.barterCoveredAmount)}</div>
                    </div>
                    <div className="p-2 rounded bg-[var(--surface-neutral-subtle)]">
                      <div className="text-[var(--content-neutral-default)]">مبلغ تسهیلات</div>
                      <div className="font-bold mt-0.5">{formatToman(req.loanAmount)}</div>
                    </div>
                    <div className="p-2 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)]">
                      <div>قسط ماهیانه ({toPersianDigits(req.months)} ماه)</div>
                      <div className="font-extrabold mt-0.5">{formatToman(req.monthlyInstallment)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: BOOKMARKS, NOTES & SAVED SEARCHES (Combined 2-Tab Tahator Hub) */}
          {tab === 'bookmarks' && (
            <BookmarksNotesSection
              initialSubTab={bookmarkSubTab}
              bookmarkedAds={bookmarkedAds}
              allListings={allListings}
              notes={notes}
              savedSearches={savedSearches}
              onSelectListing={onSelectListing}
              onOpenCompareWith={onOpenCompareWith}
              onToggleBookmark={onToggleBookmark}
              onSaveNote={onSaveNote}
              onToggleSavedSearchNotify={onToggleSavedSearchNotify}
              onApplySavedSearch={onApplySavedSearch}
              onDeleteSavedSearch={onDeleteSavedSearch}
              onClose={onClose}
            />
          )}

          {/* TAB: RECENT VIEWS */}
          {tab === 'recent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-neutral-weaker)]">
                <div>
                  <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                    بازدیدهای اخیر ({toPersianDigits(recentAds.length)})
                  </h2>
                </div>
                {recentAds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearRecent}
                    className="kt-button--outlined !h-[32px] !px-3 text-[12px] text-[var(--semantic-negative)]"
                  >
                    حذف تاریخچه
                  </button>
                )}
              </div>
              {recentAds.length === 0 ? (
                <p className="py-12 text-center text-[13px] text-[var(--content-neutral-default)]">
                  هنوز آگهی‌ای را مشاهده نکرده‌اید.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentAds.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => {
                        onSelectListing(ad);
                        onClose();
                      }}
                      className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex items-center gap-3 cursor-pointer hover:bg-[var(--surface-neutral-weak)] transition-colors"
                    >
                      <img
                        src={ad.images[0] || '/ads/fake-1.svg'}
                        alt={ad.title}
                        className="w-14 h-14 rounded-[4px] object-cover shrink-0 border border-[var(--border-neutral-weaker)]"
                      />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold truncate">{ad.title}</div>
                        <div className="text-[11.5px] text-[var(--content-neutral-default)] mt-0.5">
                          {ad.city} · {ad.neighborhood}
                        </div>
                        <div className="text-[12px] font-bold text-[var(--brand-primary)] mt-0.5">
                          {ad.price > 0 ? formatToman(ad.price) : 'توافقی'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAFETY, ANTI-FRAUD & ACTIVE SESSIONS (Exact Tahator Split) */}
          {tab === 'safety' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-[var(--border-neutral-weaker)]">
                <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                  مقابله با مزاحمت و کلاهبرداری
                </h2>
                <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                  راهنمای معامله امن تهاتر، ثبت فوری گزارش تخلف و کنترل نشست‌های ورود حساب موبایل
                </p>
              </div>

              {/* Exact Tahator 2-Card Guide Adapted for Tahator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] space-y-2">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    تهاتر بدون مزاحمت
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-6">
                    در تنظیمات می‌توانید نمایش شماره تماس در چت را پنهان کرده و ساعات مجاز پاسخگویی را محدود کنید یا کاربران مزاحم را مسدود نمایید.
                  </p>
                </div>
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA] space-y-2">
                  <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    تهاتر بدون کلاهبرداری
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)] leading-6">
                    پیش از رویت حضوری کالا، استعلام اصالت سند (`my.ssaa.ir`) و تنظیم تفاهم‌نامه، هیچ مبلغی به‌عنوان بیعانه واریز نکنید.
                  </p>
                </div>
              </div>

              {/* Report Toggle Buttons Matching Tahator: گزارش مزاحمت | گزارش کلاهبرداری */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!safetyDetails.trim()) return;
                  onSubmitSafetyReport(safetySubject, safetyDetails.trim());
                  setSafetyDetails('');
                  setSafetySubmittedMsg(
                    'گزارش امنیتی شما ثبت شد و تیم نظارت تهاتر آپ به‌سرعت رسیدگی می‌کند.'
                  );
                  setTimeout(() => setSafetySubmittedMsg(''), 4000);
                }}
                className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportCategory('fraud');
                      setSafetySubject('درخواست بیعانه پیش از رویت حضوری');
                    }}
                    className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold border transition-colors ${
                      reportCategory === 'fraud'
                        ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)]'
                        : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                    }`}
                  >
                    گزارش کلاهبرداری و رفتار مشکوک
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportCategory('harassment');
                      setSafetySubject('مزاحمت تلفنی یا پیام نامتعارف');
                    }}
                    className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold border transition-colors ${
                      reportCategory === 'harassment'
                        ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)]'
                        : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                    }`}
                  >
                    گزارش مزاحمت
                  </button>
                </div>

                {safetySubmittedMsg && (
                  <div className="p-2.5 rounded bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-medium">
                    {safetySubmittedMsg}
                  </div>
                )}

                <select
                  value={safetySubject}
                  onChange={(e) => setSafetySubject(e.target.value)}
                  className="kt-input !h-[38px] text-[12px] bg-white"
                >
                  <option value="درخواست بیعانه پیش از رویت حضوری">
                    درخواست بیعانه پیش از رویت حضوری
                  </option>
                  <option value="ارسال لینک جعلی یا فیشینگ در چت">
                    ارسال لینک جعلی یا فیشینگ در چت
                  </option>
                  <option value="مزاحمت تلفنی یا پیام نامتعارف">
                    مزاحمت تلفنی یا پیام نامتعارف
                  </option>
                  <option value="عدم تطابق کالا یا سند جعلی">
                    عدم تطابق کالا یا سند جعلی
                  </option>
                </select>
                <textarea
                  rows={2}
                  value={safetyDetails}
                  onChange={(e) => setSafetyDetails(e.target.value)}
                  placeholder="شماره تماس متخلف، کد آگهی یا شرح دقیق ماجرا را بنویسید..."
                  className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[12px]"
                />
                <div className="flex justify-end">
                  <button type="submit" className="kt-button--primary !h-[36px] !px-4 text-[12px]">
                    ارسال گزارش به تیم امنیت
                  </button>
                </div>
              </form>

              {/* Active Mobile Sessions */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[13.5px] font-bold text-[var(--content-neutral-stronger)]">
                    دستگاه‌ها و نشست‌های فعال ({toPersianDigits(sessions.length)})
                  </div>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={onRevokeOtherSessions}
                      className="text-[11px] font-bold text-[var(--semantic-negative)] hover:underline"
                    >
                      خروج از سایر دستگاه‌ها
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[var(--border-neutral-weaker)] border border-[var(--border-neutral-weaker)] rounded-[6px]">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-3 flex items-center justify-between gap-2 text-[12px]">
                      <div>
                        <div className="font-bold text-[var(--content-neutral-stronger)]">
                          {s.deviceLabel}
                        </div>
                        <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                          {s.loginMethod} · شماره: <span className="dir-ltr">{s.phoneMasked}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isCurrent
                            ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                            : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-default)]'
                        }`}
                      >
                        {s.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS (Exact Tahator Settings Structure + Quiet Collapsible Role Tester) */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
                  تنظیمات
                </h2>
                <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                  تنظیم ظاهر برنامه، پیشنهادهای هوشمند تهاتر، حریم خصوصی و تاریخچه بازدیدها
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              {/* Tahator Appearance Selector (ظاهر برنامه: سیستم | روز | شب) */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                  ظاهر برنامه
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'system' as const, label: 'هماهنگ با سیستم', icon: Monitor },
                    { id: 'light' as const, label: 'روز (روشن)', icon: Sun },
                    { id: 'dark' as const, label: 'شب (تاریک)', icon: Moon },
                  ].map((th) => {
                    const ThIcon = th.icon;
                    const active = (user.uiTheme || 'light') === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => onUpdateProfile({ uiTheme: th.id })}
                        className={`p-2.5 rounded-[6px] border text-[12px] flex items-center justify-center gap-1.5 transition-colors ${
                          active
                            ? 'border-[var(--brand-action)] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                            : 'border-[var(--border-neutral-weaker)] bg-white hover:bg-[var(--surface-neutral-weak)]'
                        }`}
                      >
                        <ThIcon className="w-4 h-4 shrink-0" />
                        <span>{th.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy & Smart Barter Recommendations */}
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3.5">
                <div className="flex items-center gap-2 text-[14px] font-bold">
                  <Lock className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>آگهی‌های پیشنهادی، حریم خصوصی و تماس</span>
                </div>
                <label className="flex items-center justify-between gap-2 text-[13px] cursor-pointer">
                  <span>پیشنهاد آگهی‌ها و تهاترهای هوشمند بر اساس بازدیدها و سبد دارایی من</span>
                  <input
                    type="checkbox"
                    checked={user.personalizedFeed !== false}
                    onChange={(e) => onUpdateProfile({ personalizedFeed: e.target.checked })}
                    className="w-4 h-4 accent-[var(--brand-action)] shrink-0"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-[13px] cursor-pointer">
                  <span>شماره تماس من هنگام شروع گفتگو در چت مخفی بماند</span>
                  <input
                    type="checkbox"
                    checked={user.hidePhoneInChat}
                    onChange={(e) => onUpdateProfile({ hidePhoneInChat: e.target.checked })}
                    className="w-4 h-4 accent-[var(--brand-action)] shrink-0"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="text-[12px]">ساعات مجاز پاسخگویی تماس:</label>
                  <input
                    type="text"
                    value={callHours}
                    onChange={(e) => setCallHours(e.target.value)}
                    className="kt-input !h-[34px] max-w-[200px] text-[12px]"
                  />
                </div>

                {/* Blocked Users */}
                <div className="pt-3 border-t border-[var(--border-neutral-weaker)]">
                  <div className="text-[12px] font-bold mb-1.5">
                    کاربران مسدودشده ({toPersianDigits(user.blockedUsers.length)})
                  </div>
                  {user.blockedUsers.length === 0 ? (
                    <div className="text-[12px] text-[var(--content-neutral-default)]">
                      هیچ کاربری مسدود نیست.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.blockedUsers.map((bu) => (
                        <span
                          key={bu}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--surface-neutral-weak)] text-[12px]"
                        >
                          <span>{bu}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProfile({
                                blockedUsers: user.blockedUsers.filter((x) => x !== bu),
                              })
                            }
                            className="text-[var(--brand-primary)] font-bold text-[11px]"
                          >
                            رفع مسدودی
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-neutral-weaker)]">
                  <button
                    type="button"
                    onClick={onClearRecent}
                    className="text-[12.5px] font-bold text-[var(--semantic-negative)] hover:underline"
                  >
                    حذف همهٔ بازدیدهای اخیر ({toPersianDigits(recentAds.length)})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProfile({
                        allowCallHours: callHours,
                      });
                      setSettingsSavedMsg('تنظیمات با موفقیت ذخیره شد.');
                      setTimeout(() => setSettingsSavedMsg(''), 3500);
                    }}
                    className="kt-button--primary !h-[36px] !px-5 text-[13px]"
                  >
                    ذخیره تنظیمات
                  </button>
                </div>
              </div>

              {/* Quiet Collapsible Staff / Role Preview Switcher (hidden from public homepage & normal profile) */}
              <details className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[#FAFAFA]">
                <summary className="cursor-pointer text-[13px] font-bold text-[var(--content-neutral-stronger)] select-none">
                  پیش‌نمایش پنل‌های همکاران و سطوح دسترسی (ویژه تست داخلی)
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">
                    برای بررسی پنل اختصاصی هر سطح دسترسی (کسب‌وکار، ناظر آگهی، پشتیبان یا مدیریت سامانه)، می‌توانید موقتاً نقش تست را تغییر دهید:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.keys(ROLE_META) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onSwitchRole(r)}
                        className={`p-2 rounded-[6px] border text-[12px] text-center transition-colors ${
                          userRole === r
                            ? 'border-[var(--brand-action)] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                            : 'border-[var(--border-neutral-weaker)] bg-white hover:bg-[var(--surface-neutral-weak)]'
                        }`}
                      >
                        {ROLE_META[r].shortTitle}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRolePanel();
                      }}
                      className="kt-button--outlined !h-[34px] !px-4 text-[12px]"
                    >
                      باز کردن پنل {getRoleMeta(userRole).shortTitle}
                    </button>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
