'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Wallet,
  FileText,
  ArrowLeftRight,
  Percent,
  Bookmark,
  StickyNote,
  Clock,
  Bell,
  Settings,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Zap,
  RefreshCw,
  Edit3,
  Trash2,
  Sparkles,
  Store,
  Lock,
  Eye,
  PhoneCall,
  MessageSquare,
  Plus,
  Search,
  Check,
  AlertCircle,
  LayoutDashboard,
  Package,
  ShieldAlert,
  LogIn,
  LogOut,
  Copy,
  BellRing,
  Smartphone,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { CATEGORIES, CITIES, Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { generateBarterAgreementDraft } from '@/lib/offlineAi';
import {
  AdModerationStatus,
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
  walletBalance: number;
  transactions: WalletTransaction[];
  onTopUpWallet: (amount: number) => void;
  allListings: Listing[];
  myAds: Listing[];
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

const NAV_ITEMS: {
  id: DashboardTab;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'نمای کلی پروفایل', group: 'حساب و مدیریت تهاتر', icon: LayoutDashboard },
  { id: 'profile', label: 'حساب کاربری و احراز هویت', group: 'حساب و مدیریت تهاتر', icon: User },
  { id: 'barterAssets', label: 'سبد دارایی‌های تهاتر من', group: 'حساب و مدیریت تهاتر', icon: Package },
  { id: 'myAds', label: 'آگهی‌های من', group: 'حساب و مدیریت تهاتر', icon: FileText },
  { id: 'barterOffers', label: 'معاوضه‌ها و تفاهم‌نامه‌ها', group: 'حساب و مدیریت تهاتر', icon: ArrowLeftRight },
  { id: 'wallet', label: 'کیف پول و پرداخت‌ها', group: 'مالی و تسهیلات', icon: Wallet },
  { id: 'installments', label: 'پرونده‌های اقساط ۵۰/۵۰', group: 'مالی و تسهیلات', icon: Percent },
  { id: 'bookmarks', label: 'نشان‌ها', group: 'فعالیت‌ها و امنیت', icon: Bookmark },
  { id: 'notes', label: 'یادداشت‌های من', group: 'فعالیت‌ها و امنیت', icon: StickyNote },
  { id: 'recent', label: 'بازدیدهای اخیر', group: 'فعالیت‌ها و امنیت', icon: Clock },
  { id: 'savedSearches', label: 'جستجوهای ذخیره‌شده', group: 'فعالیت‌ها و امنیت', icon: Bell },
  { id: 'safety', label: 'مقابله با مزاحمت و امنیت', group: 'فعالیت‌ها و امنیت', icon: ShieldAlert },
  { id: 'settings', label: 'فروشگاه من و تنظیمات', group: 'فعالیت‌ها و امنیت', icon: Settings },
];

const STATUS_LABELS: Record<AdModerationStatus, { text: string; cls: string }> = {
  published: {
    text: 'منتشرشده',
    cls: 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]',
  },
  pending: {
    text: 'در انتظار تأیید',
    cls: 'bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)]',
  },
  needs_edit: {
    text: 'نیازمند اصلاح',
    cls: 'bg-[var(--brand-soft)] text-[var(--brand-primary)]',
  },
  rejected: {
    text: 'رد شده',
    cls: 'bg-[var(--brand-soft)] text-[var(--semantic-negative)]',
  },
};

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
  walletBalance,
  transactions,
  onTopUpWallet,
  allListings,
  myAds,
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
  const [tab, setTab] = useState<DashboardTab>(initialTab);

  // Profile form state
  const [profName, setProfName] = useState(user.name);
  const [profCity, setProfCity] = useState(user.city || 'تهران');
  const [profNationalId, setProfNationalId] = useState(user.nationalId || '');
  const [profIban, setProfIban] = useState(user.iban || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Barter assets sub-states
  const [assetTitle, setAssetTitle] = useState('');
  const [assetCategory, setAssetCategory] = useState('وسایل نقلیه');
  const [assetValue, setAssetValue] = useState('');
  const [assetCondition, setAssetCondition] = useState<BarterAsset['condition']>('در حد نو');
  const [assetCity, setAssetCity] = useState(user.city || 'تهران');
  const [assetPref, setAssetPref] = useState('');
  const [matchedAssetId, setMatchedAssetId] = useState<string | null>(null);

  // Agreement draft preview modal inside Barter Offers
  const [previewOfferAgreement, setPreviewOfferAgreement] = useState<BarterOffer | null>(null);
  const [agreementCopied, setAgreementCopied] = useState(false);

  // Safety report sub-states
  const [safetySubject, setSafetySubject] = useState('درخواست بیعانه پیش از رویت حضوری');
  const [safetyDetails, setSafetyDetails] = useState('');
  const [safetySubmittedMsg, setSafetySubmittedMsg] = useState('');

  // Wallet custom top-up
  const [customCharge, setCustomCharge] = useState('200000');

  // My Ads sub-states
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | AdModerationStatus>('all');
  const [editingAd, setEditingAd] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editExchange, setEditExchange] = useState(true);
  const [editExchangeWith, setEditExchangeWith] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('در تهاتر آپ معامله/معاوضه شد');

  // Barter offers sub-tab
  const [offerDir, setOfferDir] = useState<'received' | 'sent'>('received');

  // Notes inline edit
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Store & security settings
  const [storeName, setStoreName] = useState(user.storeName || '');
  const [storeCity, setStoreCity] = useState(user.storeCity || 'تهران');
  const [storeBio, setStoreBio] = useState(user.storeBio || '');
  const [callHours, setCallHours] = useState(user.allowCallHours || '۹:۰۰ تا ۲۱:۰۰');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setProfName(user.name);
    setProfCity(user.city || 'تهران');
    setProfNationalId(user.nationalId || '');
    setProfIban(user.iban || '');
    setStoreName(user.storeName || '');
    setStoreCity(user.storeCity || 'تهران');
    setStoreBio(user.storeBio || '');
  }, [user]);

  const noteEntries = Object.entries(notes).filter(([, txt]) => txt.trim().length > 0);
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

  const filteredMyAds = myAds.filter((ad) => {
    if (adStatusFilter === 'all') return true;
    const status = listingMeta[ad.id]?.moderationStatus || 'published';
    return status === adStatusFilter;
  });

  const openEditorForAd = (ad: Listing) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(ad.price > 0 ? String(ad.price) : '');
    setEditExchange(ad.hasExchange);
    setEditExchangeWith(ad.exchangeWith || '');
    setEditDesc(ad.description);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1060px] h-[100dvh] sm:h-[88vh] bg-[var(--surface-neutral-weaker)] sm:rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dashboard Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3 bg-[var(--surface-neutral-weaker)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--content-neutral-stronger)] truncate">
                  تهاتر من — داشبورد کاربری
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                  نقش: {getRoleMeta(userRole).shortTitle}
                </span>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>هویت تأییدشده</span>
                  </span>
                )}
              </div>
              <div className="text-[12px] text-[var(--content-neutral-default)] truncate mt-0.5">
                {isLoggedIn
                  ? `${user.name} · ${toPersianDigits(user.phone)} · اعتبار کیف پول: ${formatToman(walletBalance)}`
                  : 'حالت پیش‌نمایش مهمان (برای ذخیره دائمی وارد شوید)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRolePanel();
              }}
              className="hidden sm:inline-flex kt-button--outlined !h-[34px] !px-3 text-[12px]"
            >
              <ShieldCheck className="w-4 h-4 text-[var(--brand-action)]" />
              <span>مرکز نقش‌ها ({getRoleMeta(userRole).shortTitle})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
              aria-label="بستن داشبورد"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Bar if not logged in */}
        {!isLoggedIn && (
          <div className="px-4 sm:px-6 py-3 bg-[var(--brand-soft)]/80 border-b border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[var(--brand-primary)] flex items-center justify-center shrink-0 shadow-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[var(--brand-primary)]">
                  برای مدیریت کامل پروفایل، آگهی‌ها و تهاترهای خود با شماره موبایل وارد شوید
                </div>
                <div className="text-[11px] text-[var(--content-neutral-default)]">
                  بدون نیاز به پنل پیامکی: کد تایید ۶ رقمی روی صفحه نمایش داده می‌شود و با یک کلیک وارد می‌شوید.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="kt-button--primary !h-[36px] !px-4 text-[12px] font-bold shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود / عضویت با موبایل</span>
            </button>
          </div>
        )}

        {/* Mobile Horizontal Tabs */}
        <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 border-b border-[var(--border-neutral-weaker)] overflow-x-auto no-scrollbar bg-[var(--surface-neutral-subtle)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 h-[32px] px-3 rounded-full text-[12px] flex items-center gap-1.5 border transition-colors ${
                  active
                    ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)] font-bold'
                    : 'bg-white border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Dashboard Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Desktop Right Sidebar (RTL Start - 3 cols) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col border-l border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] p-3 overflow-y-auto">
            <div className="space-y-1 flex-1">
              {NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const active = tab === item.id;
                const showGroupHeader = idx === 0 || NAV_ITEMS[idx - 1].group !== item.group;
                let countBadge: number | null = null;
                if (item.id === 'overview' && unreadNotifCount > 0) countBadge = unreadNotifCount;
                if (item.id === 'barterAssets' && barterAssets.length > 0) countBadge = barterAssets.length;
                if (item.id === 'myAds') countBadge = myAds.length;
                if (item.id === 'barterOffers' && pendingOffersCount > 0) countBadge = pendingOffersCount;
                if (item.id === 'bookmarks') countBadge = bookmarkedAds.length;
                if (item.id === 'notes' && noteEntries.length > 0) countBadge = noteEntries.length;
                if (item.id === 'savedSearches') countBadge = savedSearches.length;

                return (
                  <React.Fragment key={item.id}>
                    {showGroupHeader && (
                      <div className="px-2.5 pt-2.5 pb-1 text-[10px] font-bold text-[var(--content-neutral-default)]">
                        {item.group}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`w-full px-3 py-2 rounded-[6px] text-[12.5px] flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                          : 'text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {countBadge !== null && (
                        <span
                          className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] flex items-center justify-center ${
                            active
                              ? 'bg-[var(--brand-action)] text-white'
                              : 'bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                          }`}
                        >
                          {toPersianDigits(countBadge)}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Sidebar Wallet Summary + Quick Role Switch */}
            <div className="pt-3 mt-3 border-t border-[var(--border-neutral-weaker)] space-y-2.5">
              <div className="p-3 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                <div className="text-[11px] text-[var(--content-neutral-default)]">
                  موجودی کیف پول
                </div>
                <div className="text-[15px] font-extrabold text-[var(--brand-primary)] mt-0.5">
                  {formatToman(walletBalance)}
                </div>
                <button
                  type="button"
                  onClick={() => setTab('wallet')}
                  className="mt-2 w-full h-[30px] rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-bold hover:opacity-90"
                >
                  + افزایش اعتبار
                </button>
              </div>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full kt-button--outlined !h-[34px] text-[12px] text-[var(--semantic-negative)]"
                >
                  خروج از حساب کاربری
                </button>
              )}
            </div>
          </aside>

          {/* Main Left Panel (9 cols) */}
          <div className="lg:col-span-9 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[var(--surface-neutral-weaker)]">
            {/* TAB 0: OVERVIEW & MEMBER TRUST SUMMARY */}
            {tab === 'overview' && (
              <div className="space-y-5">
                {/* Identity & Trust Score Hero Card */}
                <div className="p-4 sm:p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-gradient-to-l from-[var(--brand-soft)]/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-[20px] font-extrabold shrink-0 shadow-sm">
                      {isLoggedIn ? (user.name?.trim().charAt(0) || 'ت') : '؟'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[16px] sm:text-[18px] font-bold text-[var(--content-neutral-stronger)] truncate">
                          {isLoggedIn ? user.name : 'کاربر مهمان تهاتر آپ'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          {getRoleMeta(userRole).shortTitle}
                        </span>
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>احراز هویت تاییدشده</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTab('profile')}
                            className="px-2 py-0.5 rounded-full bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11px] font-bold hover:underline"
                          >
                            نیازمند تکمیل احراز هویت
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

                {/* Profile Completeness Checklist */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                      وضعیت تکمیل پروفایل برای معاملات امن و اقساط ۵۰/۵۰ ({toPersianDigits(profileMetrics.completionPercent)}٪)
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
                            setTab(chk.targetTab);
                          }
                        }}
                        className={`px-3 py-2 rounded-[6px] border text-[12px] flex items-center justify-between gap-2 text-right transition-colors ${
                          chk.done
                            ? 'bg-[var(--semantic-positive-soft)]/50 border-[var(--semantic-positive)]/30 text-[var(--semantic-positive)]'
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

                {/* 4 Quick KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setTab('myAds')}
                    className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                  >
                    <div className="text-[11px] text-[var(--content-neutral-default)]">آگهی‌های فعال من</div>
                    <div className="text-[18px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                      {toPersianDigits(myAds.length)} آگهی
                    </div>
                    <div className="text-[11px] text-[var(--brand-primary)] mt-1">
                      {toPersianDigits(totalAdViews)} بازدید ۷ روز اخیر
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('barterAssets')}
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
                    onClick={() => setTab('barterOffers')}
                    className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                  >
                    <div className="text-[11px] text-[var(--content-neutral-default)]">معاوضه و اقساط ۵۰/۵۰</div>
                    <div className="text-[18px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                      {toPersianDigits(pendingOffersCount)} در انتظار
                    </div>
                    <div className="text-[11px] text-[var(--content-neutral-default)] mt-1">
                      {toPersianDigits(installmentRequests.length)} پرونده تسهیلات فعال
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('wallet')}
                    className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right transition-colors"
                  >
                    <div className="text-[11px] text-[var(--content-neutral-default)]">اعتبار کیف پول</div>
                    <div className="text-[16px] sm:text-[18px] font-extrabold text-[var(--brand-primary)] mt-1 truncate">
                      {formatToman(walletBalance)}
                    </div>
                    <div className="text-[11px] text-[var(--semantic-info)] mt-1">شارژ آنی شاپرک +</div>
                  </button>
                </div>

                {/* Notifications & Quick Actions */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                      <BellRing className="w-4 h-4 text-[var(--brand-action)]" />
                      <span>اعلان‌ها و رویدادهای هوشمند پروفایل ({toPersianDigits(unreadNotifCount)} جدید)</span>
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
                            : 'bg-[var(--brand-soft)]/50 border-[var(--brand-action)]/30'
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

            {/* TAB 1: PROFILE & VERIFICATION */}
            {tab === 'profile' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-neutral-weaker)]">
                  <div>
                    <h3 className="text-[17px] font-bold text-[var(--content-neutral-stronger)]">
                      حساب کاربری و تأیید هویت (احراز اصالت)
                    </h3>
                    <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                      کاربران احراز هویت‌شده اعتماد بالاتری در معاملات تهاتر و اقساط ۵۰/۵۰ دریافت می‌کنند.
                    </p>
                  </div>
                  <span className="text-[12px] text-[var(--content-neutral-default)]">
                    عضویت از: {user.joinedAt}
                  </span>
                </div>

                {profileSavedMsg && (
                  <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{profileSavedMsg}</span>
                  </div>
                )}

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
                    });
                    setProfileSavedMsg(
                      verified
                        ? 'اطلاعات ذخیره شد و نشان «هویت تأییدشده» برای حساب شما فعال گردید.'
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
                      کد ملی (جهت احراز هویت آنلاین)
                    </label>
                    <input
                      type="text"
                      value={profNationalId}
                      onChange={(e) => setProfNationalId(e.target.value)}
                      placeholder="مثلاً: 0012345678"
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1">
                      شماره شبا یا کارت (جهت تسویه امن تهاتر)
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
                    {!user.isVerified && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfNationalId('0019876543');
                          onUpdateProfile({
                            nationalId: '0019876543',
                            isVerified: true,
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

                {/* Role Switcher Card inside Profile */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                        نقش‌های کاربری و دسترسی‌های مدیریتی سامانه
                      </div>
                      <div className="text-[12px] text-[var(--content-neutral-default)]">
                        می‌توانید برای بررسی عملکرد سایت، نقش خود را بین کاربر، کسب‌وکار، ناظر، پشتیبان و مدیر ارشد تغییر دهید.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRolePanel();
                      }}
                      className="kt-button--primary !h-[34px] !px-4 text-[12px]"
                    >
                      باز کردن پنل اختصاصی {getRoleMeta(userRole).shortTitle}
                    </button>
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
                </div>
              </div>
            )}

            {/* TAB: BARTER ASSETS INVENTORY & AI MATCHING */}
            {tab === 'barterAssets' && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-[var(--border-neutral-weaker)]">
                  <h3 className="text-[17px] font-bold text-[var(--content-neutral-stronger)]">
                    سبد دارایی‌های آماده تهاتر من
                  </h3>
                  <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                    دارایی‌ها و کالاهایی که قصد معاوضه آن‌ها را دارید (حتی بدون انتشار آگهی عمومی) ثبت کنید تا هوش مصنوعی بهترین تطابق‌های ۲ طرفه و ۳ ضلعی را پیشنهاد دهد.
                  </p>
                </div>

                {/* Preferred Target Categories */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5">
                  <div className="text-[12px] font-bold text-[var(--content-neutral-stronger)]">
                    دسته‌های مورد علاقه من برای دریافت در تهاتر:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.filter((c) => c.showInSidebar).map((cat) => {
                      const prefs = user.preferredBarterCategories || [];
                      const active = prefs.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? prefs.filter((x) => x !== cat.name)
                              : [...prefs, cat.name];
                            onUpdateProfile({ preferredBarterCategories: next });
                          }}
                          className={`px-3 py-1 rounded-full text-[12px] border transition-colors ${
                            active
                              ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                              : 'bg-white border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                          }`}
                        >
                          {cat.emoji} {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add New Barter Asset Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const cleanTitle = assetTitle.trim();
                    const val = Number(assetValue) || 0;
                    if (!cleanTitle || val <= 0) return;
                    onAddBarterAsset({
                      title: cleanTitle,
                      category: assetCategory,
                      estimatedValue: val,
                      condition: assetCondition,
                      city: assetCity,
                      swapPreference: assetPref.trim() || 'معاوضه با ملک، خودرو یا کالای هم‌ارزش',
                    });
                    setAssetTitle('');
                    setAssetValue('');
                    setAssetPref('');
                  }}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3"
                >
                  <div className="text-[13px] font-bold text-[var(--brand-primary)] flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>افزودن دارایی جدید به سبد تهاتر</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={assetTitle}
                      onChange={(e) => setAssetTitle(e.target.value)}
                      placeholder="عنوان کالا یا ملک (مثلاً: سکه امامی / پژو پارس)"
                      className="kt-input !h-[36px] text-[12px] sm:col-span-2"
                    />
                    <input
                      type="number"
                      min={100000}
                      value={assetValue}
                      onChange={(e) => setAssetValue(e.target.value)}
                      placeholder="ارزش تخمینی (تومان)"
                      className="kt-input !h-[36px] text-[12px] text-left dir-ltr"
                    />
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value)}
                      className="kt-input !h-[36px] text-[12px] bg-white"
                    >
                      {CATEGORIES.filter((c) => c.showInSidebar).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={assetCondition}
                      onChange={(e) => setAssetCondition(e.target.value as BarterAsset['condition'])}
                      className="kt-input !h-[36px] text-[12px] bg-white"
                    >
                      <option value="پلمپ / صفر">پلمپ / صفر</option>
                      <option value="در حد نو">در حد نو</option>
                      <option value="کارکرده سالم">کارکرده سالم</option>
                    </select>
                    <select
                      value={assetCity}
                      onChange={(e) => setAssetCity(e.target.value)}
                      className="kt-input !h-[36px] text-[12px] bg-white"
                    >
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={assetPref}
                      onChange={(e) => setAssetPref(e.target.value)}
                      placeholder="ترجیح شما برای معاوضه (مثلاً: آپارتمان نقلی یا خودرو اتومات)"
                      className="kt-input !h-[36px] text-[12px] flex-1"
                    />
                    <button type="submit" className="kt-button--primary !h-[36px] !px-5 text-[12px]">
                      ثبت در سبد دارایی
                    </button>
                  </div>
                </form>

                {/* Registered Barter Assets List */}
                <div className="space-y-3">
                  {barterAssets.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-[var(--content-neutral-default)]">
                      هنوز دارایی‌ای در سبد تهاتر خود ثبت نکرده‌اید.
                    </p>
                  ) : (
                    barterAssets.map((asset) => {
                      const isExpanded = matchedAssetId === asset.id;
                      const topMatches = isExpanded
                        ? allListings
                            .filter((l) => l.hasExchange && l.price > 0)
                            .map((l) => {
                              const maxP = Math.max(l.price, asset.estimatedValue);
                              const diff = Math.abs(l.price - asset.estimatedValue);
                              const score = Math.max(
                                58,
                                Math.min(98, Math.round(98 - (diff / maxP) * 45))
                              );
                              return { listing: l, diff, score };
                            })
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 3)
                        : [];

                      return (
                        <div
                          key={asset.id}
                          className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2.5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                                  {asset.category}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] text-[11px]">
                                  {asset.condition}
                                </span>
                                <span className="text-[11px] text-[var(--content-neutral-default)]">
                                  {asset.city} · {asset.createdAt}
                                </span>
                              </div>
                              <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)] mt-1.5">
                                {asset.title}
                              </div>
                              <div className="text-[12px] text-[var(--semantic-positive)] font-extrabold mt-0.5">
                                ارزش کارشناسی: {formatToman(asset.estimatedValue)}
                              </div>
                              <div className="text-[12px] text-[var(--content-neutral-default)] mt-1">
                                ترجیح تهاتر: {asset.swapPreference}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setMatchedAssetId(isExpanded ? null : asset.id)}
                                className="kt-button--outlined !h-[32px] !px-3 text-[11px] text-[var(--brand-primary)]"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{isExpanded ? 'بستن پیشنهادها' : 'تطابق هوشمند'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteBarterAsset(asset.id)}
                                className="p-1.5 rounded border border-[var(--border-neutral-weaker)] text-[var(--semantic-negative)] hover:bg-[var(--brand-soft)]"
                                title="حذف دارایی"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="pt-3 mt-2 border-t border-[var(--border-neutral-weaker)] space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[12px] font-bold text-[var(--content-neutral-stronger)]">
                                  بهترین گزینه‌های تهاتر در بازار تهاتر آپ برای این دارایی:
                                </span>
                                {onOpenAiTab && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onOpenAiTab('chain');
                                    }}
                                    className="text-[11px] font-bold text-[var(--brand-primary)] hover:underline"
                                  >
                                    مشاهده زنجیره‌های ۳ ضلعی ←
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {topMatches.map(({ listing, diff, score }) => (
                                  <button
                                    key={listing.id}
                                    type="button"
                                    onClick={() => {
                                      onSelectListing(listing);
                                      onClose();
                                    }}
                                    className="p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] bg-[var(--surface-neutral-subtle)] text-right space-y-1 transition-colors"
                                  >
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-bold text-[var(--semantic-positive)]">
                                        {toPersianDigits(score)}٪ تطابق
                                      </span>
                                      <span className="text-[var(--content-neutral-default)]">{listing.city}</span>
                                    </div>
                                    <div className="text-[12px] font-bold truncate">{listing.title}</div>
                                    <div className="text-[11px] text-[var(--brand-primary)]">
                                      مابه‌التفاوت: {diff === 0 ? 'سربه‌سر' : formatToman(diff)}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: WALLET & PAYMENTS */}
            {tab === 'wallet' && (
              <div className="space-y-5">
                <div className="p-5 rounded-[8px] bg-gradient-to-l from-[var(--brand-primary)] to-[var(--brand-action)] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[12px] opacity-90">موجودی قابل استفاده در تهاتر آپ</div>
                    <div className="text-[24px] font-extrabold mt-1">
                      {formatToman(walletBalance)}
                    </div>
                    <div className="text-[11px] opacity-85 mt-1">
                      قابل استفاده برای نردبان، برچسب فوری، تمدید و کارشناسی هوشمند
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

                <div>
                  <h4 className="text-[14px] font-bold text-[var(--content-neutral-stronger)] mb-3">
                    تاریخچه تراکنش‌ها و پرداخت‌های من
                  </h4>
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

            {/* TAB 3: MY ADS WITH STATUS, ANALYTICS, EDIT, URGENT, LADDER, DELETE WITH REASON */}
            {tab === 'myAds' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'همه آگهی‌ها' },
                        { id: 'published', label: 'منتشرشده' },
                        { id: 'pending', label: 'در انتظار تأیید' },
                        { id: 'needs_edit', label: 'نیازمند اصلاح' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAdStatusFilter(st.id)}
                        className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                          adStatusFilter === st.id
                            ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                            : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPostAd();
                    }}
                    className="kt-button--primary !h-[36px] !px-4 text-[12px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت آگهی جدید</span>
                  </button>
                </div>

                {/* Inline Ad Editor */}
                {editingAd && (
                  <div className="p-4 rounded-[8px] border-2 border-[var(--brand-action)]/40 bg-[var(--surface-neutral-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[14px] text-[var(--brand-primary)]">
                        ویرایش آگهی: {editingAd.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingAd(null)}
                        className="text-[12px] text-[var(--content-neutral-default)] hover:underline"
                      >
                        انصراف
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-medium mb-1">عنوان آگهی</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="kt-input !h-[36px] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium mb-1">قیمت (تومان)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="kt-input !h-[36px] text-[13px] text-left dir-ltr"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editExchange}
                          onChange={(e) => setEditExchange(e.target.checked)}
                          className="accent-[var(--brand-action)]"
                        />
                        <span>امکان معاوضه فعال باشد</span>
                      </label>
                      {editExchange && (
                        <input
                          type="text"
                          value={editExchangeWith}
                          onChange={(e) => setEditExchangeWith(e.target.value)}
                          placeholder="مورد دلخواه برای معاوضه..."
                          className="kt-input !h-[34px] text-[12px] flex-1 min-w-[200px]"
                        />
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[13px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAd(null)}
                        className="kt-button--outlined !h-[34px] text-[12px]"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onEditAd(editingAd.id, {
                            title: editTitle.trim() || editingAd.title,
                            price: Number(editPrice) || 0,
                            hasExchange: editExchange,
                            exchangeWith: editExchangeWith.trim(),
                            description: editDesc.trim() || editingAd.description,
                          });
                          setEditingAd(null);
                        }}
                        className="kt-button--primary !h-[34px] !px-5 text-[12px]"
                      >
                        ثبت تغییرات
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete with Reason Prompt */}
                {deletingAdId && (
                  <div className="p-4 rounded-[8px] border border-[var(--semantic-negative)] bg-[var(--brand-soft)] space-y-2.5">
                    <div className="text-[13px] font-bold text-[var(--semantic-negative)]">
                      لطفاً علت حذف آگهی را انتخاب کنید (مشابه فرآیند استاندارد حذف آگهی):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'در تهاتر آپ معامله/معاوضه شد',
                        'از فروش/معاوضه منصرف شدم',
                        'اطلاعات آگهی نیاز به تغییر اساسی دارد',
                      ].map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setDeleteReason(reason)}
                          className={`px-3 py-1 rounded-[4px] text-[12px] border ${
                            deleteReason === reason
                              ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)]'
                              : 'bg-white border-[var(--border-neutral-weaker)]'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeletingAdId(null)}
                        className="kt-button--outlined !h-[32px] text-[12px]"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAd(deletingAdId, deleteReason);
                          setDeletingAdId(null);
                        }}
                        className="kt-button--primary !h-[32px] !px-4 text-[12px]"
                      >
                        تأیید حذف آگهی
                      </button>
                    </div>
                  </div>
                )}

                {filteredMyAds.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[var(--border-neutral-weaker)] rounded-[8px] space-y-3">
                    <p className="text-[14px] text-[var(--content-neutral-default)]">
                      آگهی‌ای در این وضعیت یافت نشد.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMyAds.map((ad) => {
                      const meta = listingMeta[ad.id] || {
                        moderationStatus: 'published' as AdModerationStatus,
                        views: 342,
                        contactClicks: 19,
                        chatClicks: 11,
                        expiryDays: 28,
                      };
                      const stBadge = STATUS_LABELS[meta.moderationStatus];

                      return (
                        <div
                          key={ad.id}
                          className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div
                              onClick={() => {
                                onSelectListing(ad);
                                onClose();
                              }}
                              className="flex items-center gap-3 min-w-0 cursor-pointer"
                            >
                              <img
                                src={ad.images[0] || '/ads/fake-1.svg'}
                                alt={ad.title}
                                className="w-16 h-16 rounded-[6px] object-cover shrink-0 border border-[var(--border-neutral-weaker)]"
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${stBadge.cls}`}>
                                    {stBadge.text}
                                  </span>
                                  {(ad.isUrgent || meta.isUrgent) && (
                                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--brand-action)] text-white text-[10px] font-bold">
                                      فوری
                                    </span>
                                  )}
                                  {ad.badge === 'نردبان شده' && (
                                    <span className="px-2 py-0.5 rounded-[4px] bg-[var(--semantic-info)]/10 text-[var(--semantic-info)] text-[10px] font-bold">
                                      نردبان شده
                                    </span>
                                  )}
                                </div>
                                <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)] truncate mt-1">
                                  {ad.title}
                                </div>
                                <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                                  {ad.price > 0 ? formatToman(ad.price) : 'توافقی'} · {ad.city} ({ad.neighborhood})
                                </div>
                              </div>
                            </div>

                            {/* Ad Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => onLadderAd(ad.id)}
                                className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
                                title="ارتقا به صدر آگهی‌ها"
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                                <span>نردبان</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onUrgentAd(ad.id)}
                                className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
                              >
                                <Zap className="w-3.5 h-3.5 text-[var(--semantic-warning)]" />
                                <span>فوری</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onRenewAd(ad.id)}
                                className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
                                <span>تمدید</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditorForAd(ad)}
                                className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>ویرایش</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAdId(ad.id)}
                                className="p-1.5 rounded border border-[var(--border-neutral-weaker)] hover:bg-[var(--brand-soft)] text-[var(--semantic-negative)]"
                                title="حذف آگهی"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Ad 7-day Analytics Strip */}
                          <div className="pt-2.5 border-t border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--content-neutral-default)]">
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                                <span>بازدید ۷ روز: </span>
                                <strong className="text-[var(--content-neutral-stronger)]">
                                  {toPersianDigits(meta.views)}
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <PhoneCall className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
                                <span>مشاهده شماره: </span>
                                <strong className="text-[var(--content-neutral-stronger)]">
                                  {toPersianDigits(meta.contactClicks)}
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-[var(--semantic-info)]" />
                                <span>شروع چت: </span>
                                <strong className="text-[var(--content-neutral-stronger)]">
                                  {toPersianDigits(meta.chatClicks)}
                                </strong>
                              </span>
                            </div>
                            <span>اعتبار باقی‌مانده: {toPersianDigits(meta.expiryDays)} روز</span>
                          </div>

                          {meta.moderationNote && (
                            <div className="p-2 rounded bg-[var(--brand-soft)] text-[11px] text-[var(--brand-primary)] flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>یادداشت ناظر: {meta.moderationNote}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BARTER OFFERS */}
            {tab === 'barterOffers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-neutral-weaker)] pb-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOfferDir('received')}
                      className={`px-3.5 py-1.5 rounded-[6px] text-[13px] font-bold ${
                        offerDir === 'received'
                          ? 'bg-[var(--brand-action)] text-white'
                          : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]'
                      }`}
                    >
                      پیشنهادهای دریافتی ({toPersianDigits(barterOffers.filter((o) => o.direction === 'received').length)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferDir('sent')}
                      className={`px-3.5 py-1.5 rounded-[6px] text-[13px] font-bold ${
                        offerDir === 'sent'
                          ? 'bg-[var(--brand-action)] text-white'
                          : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]'
                      }`}
                    >
                      پیشنهادهای ارسالی ({toPersianDigits(barterOffers.filter((o) => o.direction === 'sent').length)})
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {barterOffers
                    .filter((o) => o.direction === offerDir)
                    .map((offer) => (
                      <div
                        key={offer.id}
                        className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>تطابق هوش مصنوعی: {toPersianDigits(offer.aiMatchPercent)}٪</span>
                            </span>
                            {offer.installmentRequested && (
                              <span className="px-2 py-0.5 rounded bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11px] font-bold">
                                همراه با اقساط ۵۰/۵۰
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[var(--content-neutral-default)]">
                            {offer.createdAt}
                          </span>
                        </div>

                        <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                          پیشنهاد: {offer.offeredItemTitle}
                        </div>
                        <div className="text-[12px] text-[var(--content-neutral-default)]">
                          برای آگهی: <strong className="text-[var(--content-neutral-stronger)]">{offer.listingTitle}</strong> ·{' '}
                          مابه‌التفاوت: <strong className="text-[var(--brand-primary)]">{formatToman(offer.cashDifference)}</strong>
                        </div>
                        <p className="text-[12px] bg-[var(--surface-neutral-subtle)] p-2.5 rounded text-[var(--content-neutral-stronger)]">
                          {offer.note}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[12px]">
                            وضعیت:{' '}
                            <strong
                              className={
                                offer.status === 'accepted'
                                  ? 'text-[var(--semantic-positive)]'
                                  : offer.status === 'rejected'
                                  ? 'text-[var(--semantic-negative)]'
                                  : 'text-[var(--semantic-warning)]'
                              }
                            >
                              {offer.status === 'accepted'
                                ? 'تایید شده'
                                : offer.status === 'rejected'
                                ? 'رد شده'
                                : 'در انتظار بررسی'}
                            </strong>
                          </span>
                          <div className="flex items-center gap-2">
                            {offer.direction === 'received' && offer.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onRespondBarterOffer(offer.id, 'accepted')}
                                  className="kt-button--primary !h-[32px] !px-3.5 text-[12px]"
                                >
                                  پذیرش و هماهنگی
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRespondBarterOffer(offer.id, 'rejected')}
                                  className="kt-button--outlined !h-[32px] !px-3 text-[12px] text-[var(--semantic-negative)]"
                                >
                                  رد پیشنهاد
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setAgreementCopied(false);
                                setPreviewOfferAgreement(offer);
                              }}
                              className="kt-button--outlined !h-[32px] !px-3 text-[11px]"
                            >
                              <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                              <span>تفاهم‌نامه امن</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenChatFromOffer(offer);
                              }}
                              className="kt-button--outlined !h-[32px] !px-3 text-[12px]"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>گفتگو</span>
                            </button>
                          </div>
                        </div>

                        {offer.status === 'accepted' && (
                          <div className="pt-2.5 mt-1 border-t border-[var(--border-neutral-weaker)] grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                            {[
                              { step: '۱. توافق اولیه', done: true },
                              { step: '۲. رویت و کارشناسی', done: true },
                              { step: '۳. استعلام سند / ۵۰/۵۰', done: false },
                              { step: '۴. تحویل نهایی', done: false },
                            ].map((st) => (
                              <div
                                key={st.step}
                                className={`px-2 py-1.5 rounded text-center font-medium ${
                                  st.done
                                    ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                                    : 'bg-[var(--surface-neutral-subtle)] text-[var(--content-neutral-default)]'
                                }`}
                              >
                                {st.step} {st.done ? '✓' : '⏳'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {previewOfferAgreement && (() => {
                  const targetAd = allListings.find((l) => l.id === previewOfferAgreement.listingId);
                  const agreementText = generateBarterAgreementDraft({
                    listingTitle: targetAd?.title || previewOfferAgreement.listingTitle,
                    listingCode: targetAd?.id || previewOfferAgreement.listingId,
                    listingPrice: targetAd?.price || previewOfferAgreement.listingPrice,
                    offeredTitle: previewOfferAgreement.offeredItemTitle,
                    offeredPrice: previewOfferAgreement.offeredEstimatedPrice,
                    sellerName: targetAd?.sellerName || previewOfferAgreement.proposerName,
                    useInstallment: previewOfferAgreement.installmentRequested,
                  });
                  return (
                    <div className="p-4 rounded-[8px] border-2 border-[var(--brand-action)]/40 bg-[var(--surface-neutral-subtle)] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-[var(--brand-primary)]">
                          پیش‌نویس تفاهم‌نامه اولیه تهاتر امن
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(agreementText).catch(() => undefined);
                              setAgreementCopied(true);
                            }}
                            className="kt-button--primary !h-[30px] !px-3 text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{agreementCopied ? 'کپی شد ✓' : 'کپی متن قرارداد'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewOfferAgreement(null)}
                            className="text-[12px] text-[var(--content-neutral-default)] hover:underline"
                          >
                            بستن
                          </button>
                        </div>
                      </div>
                      <pre className="p-3 rounded bg-white border border-[var(--border-neutral-weaker)] text-[11px] leading-6 whitespace-pre-wrap font-sans text-[var(--content-neutral-stronger)]">
                        {agreementText}
                      </pre>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 5: INSTALLMENTS */}
            {tab === 'installments' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[16px] font-bold">پرونده‌های اقساط ۵۰/۵۰ و تسهیلات تهاتر</h3>
                    <p className="text-[12px] text-[var(--content-neutral-default)]">
                      وضعیت درخواست‌های تقسیط مابه‌التفاوت معاملات معاوضه شما
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

            {/* TAB 6: BOOKMARKS */}
            {tab === 'bookmarks' && (
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold">آگهی‌های نشان‌شده ({toPersianDigits(bookmarkedAds.length)})</h3>
                {bookmarkedAds.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
                    هنوز آگهی‌ای را نشان نکرده‌اید.
                  </p>
                ) : (
                  bookmarkedAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => {
                          onSelectListing(ad);
                          onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <img
                          src={ad.images[0] || '/ads/fake-1.svg'}
                          alt={ad.title}
                          className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold truncate">{ad.title}</div>
                          <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                            {ad.city} · {ad.price > 0 ? formatToman(ad.price) : 'توافقی'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCompareWith(ad);
                          }}
                          className="kt-button--outlined !h-[32px] !px-3 text-[11px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                          <span>مقایسه هوش مصنوعی</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(ad.id)}
                          className="kt-button--ghost !h-[32px] text-[12px] text-[var(--semantic-negative)]"
                        >
                          حذف نشان
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 7: NOTES */}
            {tab === 'notes' && (
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold">یادداشت‌های شخصی من ({toPersianDigits(noteEntries.length)})</h3>
                {noteEntries.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
                    یادداشتی روی آگهی‌ها ثبت نشده است. در صفحه جزئیات هر آگهی می‌توانید یادداشت خصوصی بنویسید.
                  </p>
                ) : (
                  noteEntries.map(([adId, text]) => {
                    const targetAd = allListings.find((l) => l.id === adId);
                    const isEditing = editingNoteId === adId;
                    return (
                      <div
                        key={adId}
                        className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (targetAd) {
                                onSelectListing(targetAd);
                                onClose();
                              }
                            }}
                            className="text-[13px] font-bold text-[var(--brand-primary)] hover:underline text-right"
                          >
                            {targetAd ? targetAd.title : `آگهی ${adId}`}
                          </button>
                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(adId);
                                setEditingNoteText(text);
                              }}
                              className="text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]"
                            >
                              ویرایش
                            </button>
                            <button
                              type="button"
                              onClick={() => onSaveNote(adId, '')}
                              className="text-[var(--semantic-negative)]"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              className="kt-input !h-[34px] text-[12px] flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onSaveNote(adId, editingNoteText);
                                setEditingNoteId(null);
                              }}
                              className="kt-button--primary !h-[34px] !px-4 text-[12px]"
                            >
                              ذخیره
                            </button>
                          </div>
                        ) : (
                          <p className="text-[13px] text-[var(--content-neutral-stronger)]">{text}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 8: RECENT VIEWS */}
            {tab === 'recent' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold">بازدیدهای اخیر ({toPersianDigits(recentAds.length)})</h3>
                  {recentAds.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearRecent}
                      className="kt-button--outlined !h-[32px] !px-3 text-[12px] text-[var(--semantic-negative)]"
                    >
                      پاک کردن تاریخچه
                    </button>
                  )}
                </div>
                {recentAds.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
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
                        className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex items-center gap-3 cursor-pointer hover:bg-[var(--surface-neutral-weak)]"
                      >
                        <img
                          src={ad.images[0] || '/ads/fake-1.svg'}
                          alt={ad.title}
                          className="w-12 h-12 rounded-[4px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold truncate">{ad.title}</div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                            {ad.city} · {ad.neighborhood}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: SAVED SEARCHES */}
            {tab === 'savedSearches' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-[16px] font-bold">جستجوهای ذخیره‌شده و خبرنامه آگهی</h3>
                  <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                    در صفحه اصلی با دکمه «ذخیره جستجو» فیلتر دلخواه خود را به این فهرست اضافه کنید.
                  </p>
                </div>
                {savedSearches.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
                    جستجویی ذخیره نشده است.
                  </p>
                ) : (
                  savedSearches.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-[14px] font-bold">{s.title}</div>
                        <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                          شهر: {s.cityLabel} · دسته: {s.category || 'همه دسته‌ها'}{' '}
                          {s.onlyExchange ? '· فقط معاوضه' : ''} · {s.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleSavedSearchNotify(s.id)}
                          className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium border ${
                            s.notifyEnabled
                              ? 'bg-[var(--semantic-positive-soft)] border-[var(--semantic-positive)] text-[var(--semantic-positive)]'
                              : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                          }`}
                        >
                          {s.notifyEnabled ? 'اعلان فعال ✓' : 'اعلان خاموش'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onApplySavedSearch(s);
                            onClose();
                          }}
                          className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
                        >
                          <Search className="w-3 h-3" />
                          <span>اجرا</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSavedSearch(s.id)}
                          className="p-1.5 rounded text-[var(--semantic-negative)] hover:bg-[var(--brand-soft)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 12: SAFETY, ANTI-FRAUD & SESSION SECURITY */}
            {tab === 'safety' && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-[var(--border-neutral-weaker)]">
                  <h3 className="text-[17px] font-bold text-[var(--content-neutral-stronger)]">
                    مقابله با مزاحمت، پیشگیری از کلاهبرداری و امنیت نشست‌ها
                  </h3>
                  <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                    راهنمای معامله امن تهاتر، ثبت فوری گزارش رفتار مشکوک و کنترل دستگاه‌های متصل به حساب موبایل شما.
                  </p>
                </div>

                {/* Anti-Fraud Golden Checklist */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--semantic-warning-soft)]/40 space-y-2">
                  <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>سپر امنیت معامله بدون کلاهبرداری در تهاتر آپ:</span>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-[var(--content-neutral-stronger)] leading-6">
                    <li>• پیش از رویت حضوری کالا/ملک و تطبیق مدارک، هیچ مبلغی به‌عنوان بیعانه واریز نکنید.</li>
                    <li>• برای معاملات ملک و خودرو از سامانه ثبت اسناد (`my.ssaa.ir`) استعلام اصالت سند و کد رهگیری بگیرید.</li>
                    <li>• از کلیک روی لینک‌های درگاه پرداخت ناشناس در پیامک یا شبکه‌های اجتماعی خارجی خودداری کنید.</li>
                  </ul>
                </div>

                {/* Report Fraud / Harassment Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!safetyDetails.trim()) return;
                    onSubmitSafetyReport(safetySubject, safetyDetails.trim());
                    setSafetyDetails('');
                    setSafetySubmittedMsg('گزارش امنیتی شما ثبت شد و همکاران پشتیبانی/نظارت به‌سرعت رسیدگی می‌کنند.');
                    setTimeout(() => setSafetySubmittedMsg(''), 4000);
                  }}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3"
                >
                  <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                    ثبت گزارش مزاحمت یا رفتار مشکوک
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
                    <option value="درخواست بیعانه پیش از رویت حضوری">درخواست بیعانه پیش از رویت حضوری</option>
                    <option value="ارسال لینک جعلی یا فیشینگ در چت">ارسال لینک جعلی یا فیشینگ در چت</option>
                    <option value="مزاحمت تلفنی یا پیام نامتعارف">مزاحمت تلفنی یا پیام نامتعارف</option>
                    <option value="عدم تطابق کالا یا سند جعلی">عدم تطابق کالا یا سند جعلی</option>
                  </select>
                  <textarea
                    rows={2}
                    value={safetyDetails}
                    onChange={(e) => setSafetyDetails(e.target.value)}
                    placeholder="شماره تماس متخلف، عنوان آگهی یا شرح دقیق ماجرا را بنویسید..."
                    className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[12px]"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="kt-button--primary !h-[36px] !px-4 text-[12px]">
                      ارسال به تیم امنیت و نظارت
                    </button>
                  </div>
                </form>

                {/* Active Mobile Sessions & Devices */}
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                      نشست‌های فعال و دستگاه‌های متصل با شماره موبایل ({toPersianDigits(sessions.length)})
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
                  {isLoggedIn && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={onLogout}
                        className="kt-button--outlined !h-[34px] text-[12px] text-[var(--semantic-negative)]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج کامل از حساب کاربری فعلی</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 10: BUSINESS STORE & PRIVACY/SECURITY SETTINGS */}
            {tab === 'settings' && (
              <div className="space-y-5">
                {settingsSavedMsg && (
                  <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{settingsSavedMsg}</span>
                  </div>
                )}

                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                  <div className="flex items-center gap-2 text-[14px] font-bold">
                    <Store className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>اطلاعات فروشگاه، آژانس املاک یا نمایشگاه من</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] mb-1">نام فروشگاه / برند</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="kt-input !h-[36px] text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] mb-1">شهر فعالیت</label>
                      <input
                        type="text"
                        value={storeCity}
                        onChange={(e) => setStoreCity(e.target.value)}
                        className="kt-input !h-[36px] text-[13px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] mb-1">توضیحات رزومه و زمینه فعالیت</label>
                    <textarea
                      rows={2}
                      value={storeBio}
                      onChange={(e) => setStoreBio(e.target.value)}
                      className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[13px]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                  <div className="flex items-center gap-2 text-[14px] font-bold">
                    <Lock className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>تنظیمات حریم خصوصی، تماس و امنیت</span>
                  </div>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.hidePhoneInChat}
                      onChange={(e) => onUpdateProfile({ hidePhoneInChat: e.target.checked })}
                      className="accent-[var(--brand-action)]"
                    />
                    <span>شماره تماس من هنگام شروع گفتگو در چت مخفی بماند</span>
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.personalizedFeed !== false}
                      onChange={(e) => onUpdateProfile({ personalizedFeed: e.target.checked })}
                      className="accent-[var(--brand-action)]"
                    />
                    <span>پیشنهاد آگهی‌ها و تهاترهای هوشمند بر اساس بازدیدها و سبد دارایی من</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[12px]">ساعات مجاز پاسخگویی تماس:</label>
                    <input
                      type="text"
                      value={callHours}
                      onChange={(e) => setCallHours(e.target.value)}
                      className="kt-input !h-[34px] max-w-[200px] text-[12px]"
                    />
                  </div>

                  {/* Blocked Users */}
                  <div className="pt-2 border-t border-[var(--border-neutral-weaker)]">
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

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({
                          storeName,
                          storeCity,
                          storeBio,
                          allowCallHours: callHours,
                        });
                        setSettingsSavedMsg('تنظیمات فروشگاه و حریم خصوصی با موفقیت ذخیره شد.');
                        setTimeout(() => setSettingsSavedMsg(''), 3500);
                      }}
                      className="kt-button--primary !h-[36px] !px-5 text-[13px]"
                    >
                      ذخیره تنظیمات
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
