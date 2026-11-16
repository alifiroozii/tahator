'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  LayoutList,
  ArrowUpDown,
  X,
  Home,
  Bookmark,
  Plus,
  MessageSquare,
  User,
  SlidersHorizontal,
  ArrowLeftRight,
  Calculator,
  Percent,
  MapPin,
  Sparkles,
  Shield,
  Bell,
  Map as MapIcon,
  CheckCircle2,
  Zap,
  LogIn,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar, { FilterState } from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import AdDetailModal from '@/components/AdDetailModal';
import UserDashboardModal from '@/components/UserDashboardModal';
import AuthOtpModal from '@/components/AuthOtpModal';
import RolePanelModal from '@/components/RolePanelModal';
import AiAssistantModal from '@/components/AiAssistantModal';
import MapFeedView from '@/components/MapFeedView';
import { ApiClientError, BackendProfileResponse, tahatorApi } from '@/lib/apiClient';
import { mapBackendListingToUi } from '@/lib/listingMapper';
import {
  CategoriesModal,
  CityModal,
  PostAdModal,
  FacilitiesModal,
  InstallmentPlanModal,
  ChatModal,
  SupportModal,
  ChatThread,
} from '@/components/Modals';
import {
  CATEGORIES,
  Listing,
  toPersianDigits,
} from '@/data/mockData';
import {
  AiConfig,
  DEFAULT_AI_CONFIG,
  analyzeChatSafety,
  extractAreaFromListing,
  extractRoomsFromListing,
} from '@/lib/offlineAi';
import {
  AdModerationStatus,
  AdReport,
  AuthSessionRecord,
  BarterAsset,
  BarterOffer,
  DEFAULT_TARIFFS,
  DEFAULT_USER_PROFILE,
  DashboardTab,
  INITIAL_AD_REPORTS,
  INITIAL_AUTH_SESSIONS,
  INITIAL_BARTER_ASSETS,
  INITIAL_BARTER_OFFERS,
  INITIAL_INSTALLMENT_REQUESTS,
  INITIAL_PLATFORM_USERS,
  INITIAL_SAVED_SEARCHES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_USER_NOTIFICATIONS,
  INITIAL_WALLET_TRANSACTIONS,
  InstallmentRequest,
  ListingAnalyticsMeta,
  PlatformUserAccount,
  ROLE_META,
  getRoleMeta,
  normalizeUserRole,
  SavedSearch,
  SupportTicket,
  TariffConfig,
  UserNotification,
  UserProfile,
  UserRole,
  WalletTransaction,
} from '@/types/platform';

const DEFAULT_FILTERS: FilterState = {
  category: null,
  subcategory: null,
  neighborhoods: [],
  minPrice: '',
  maxPrice: '',
  minArea: '',
  roomsFilter: 'all',
  conditionFilter: 'all',
  withPhoto: false,
  onlyExchange: false,
  onlyInstallment: false,
  onlyUrgent: false,
  onlyVerifiedPhotos: false,
  exchangeKeyword: '',
  timeFilter: 'all',
};

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'admin-support',
    title: 'پشتیبانی و کارشناس تهاتر آپ',
    subtitle: 'پاسخگویی سریع · 02191016487',
    isAdmin: true,
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: 'سلام! به پشتیبانی رسمی تهاتر آپ خوش آمدید. برای کارشناسی معاوضه یا محاسبه شرایط اقساط در خدمت شما هستیم.',
        time: '۱۲:۰۰',
      },
    ],
  },
];

const INITIAL_LISTING_META: Record<string, ListingAnalyticsMeta> = {};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [backendCities, setBackendCities] = useState<
    { id: string; slug: string; name: string; province: string; isPopular: boolean; adCount: number }[]
  >([]);
  const [backendCategories, setBackendCategories] = useState<
    { id: string; slug: string; name: string; emoji: string; sortOrder: number; showInSidebar: boolean }[]
  >([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'newest' | 'cheapest' | 'expensive'>('newest');
  const [cardLayout, setCardLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // User Dashboard & Account State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [forceOnboarding, setForceOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [myAdIds, setMyAdIds] = useState<string[]>([]);
  const [archivedAds, setArchivedAds] = useState<
    { listing: Listing; reason: string; archivedAt: string }[]
  >([]);
  const [listingMeta, setListingMeta] = useState<Record<string, ListingAnalyticsMeta>>(
    INITIAL_LISTING_META
  );
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(
    INITIAL_WALLET_TRANSACTIONS
  );
  const [barterAssets, setBarterAssets] = useState<BarterAsset[]>(INITIAL_BARTER_ASSETS);
  const [barterOffers, setBarterOffers] = useState<BarterOffer[]>(INITIAL_BARTER_OFFERS);
  const [installmentRequests, setInstallmentRequests] = useState<InstallmentRequest[]>(
    INITIAL_INSTALLMENT_REQUESTS
  );
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(INITIAL_SAVED_SEARCHES);
  const [notifications, setNotifications] = useState<UserNotification[]>(
    INITIAL_USER_NOTIFICATIONS
  );
  const [sessions, setSessions] = useState<AuthSessionRecord[]>(INITIAL_AUTH_SESSIONS);

  // Bookmarks, Notes, Recent & Chat State
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('admin-support');

  // Role Control Center & Offline AI Config
  const [platformUsers, setPlatformUsers] = useState<PlatformUserAccount[]>(
    INITIAL_PLATFORM_USERS
  );
  const [adReports, setAdReports] = useState<AdReport[]>(INITIAL_AD_REPORTS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
    INITIAL_SUPPORT_TICKETS
  );
  const [tariffs, setTariffs] = useState<TariffConfig>(DEFAULT_TARIFFS);
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);

  // Modal & Drawer States
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPostAdModal, setShowPostAdModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [showRolePanelModal, setShowRolePanelModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'chat' | 'compare' | 'estimator' | 'chain'>('chat');
  const [aiCompareListingId, setAiCompareListingId] = useState<string | undefined>(undefined);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const resetGuestState = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    setUserProfile(DEFAULT_USER_PROFILE);
    setMyAdIds([]);
    setArchivedAds([]);
    setWalletBalance(0);
    setTransactions([]);
    setSessions([]);
    setNotifications([]);
    try {
      [
        'tahator_auth_v2',
        'tahator_role_v2',
        'tahator_profile_v2',
        'tahator_wallet_v2',
        'tahator_tx_v2',
        'tahator_sessions_v2',
        'tahator_notifications_v2',
        'tahator_user_ads',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore storage errors
    }
  };

  const loadPublicCatalog = async () => {
    setIsLoadingListings(true);
    setCatalogError(null);
    try {
      const [metaRes, listingsRes] = await Promise.all([
        tahatorApi.getListingsMeta().catch(() => null),
        tahatorApi.getPublicListings({ limit: 250 }),
      ]);
      if (metaRes) {
        if (Array.isArray(metaRes.cities) && metaRes.cities.length > 0) {
          setBackendCities(metaRes.cities);
        }
        if (Array.isArray(metaRes.categories) && metaRes.categories.length > 0) {
          setBackendCategories(metaRes.categories);
        }
      }
      const mapped = (listingsRes.items || []).map(mapBackendListingToUi);
      setListings((prev) => {
        const mappedIds = new Set(mapped.map((m) => m.id));
        const keptMine = prev.filter((item) => !mappedIds.has(item.id) && item.isUserCreated);
        return [...keptMine, ...mapped];
      });
      setListingMeta((prev) => {
        const next = { ...prev };
        for (const rawItem of listingsRes.items || []) {
          const st: AdModerationStatus =
            rawItem.moderationStatus === 'PENDING_REVIEW'
              ? 'pending'
              : rawItem.moderationStatus === 'DRAFT' || rawItem.moderationStatus === 'ARCHIVED'
              ? 'needs_edit'
              : rawItem.moderationStatus === 'REJECTED'
              ? 'rejected'
              : 'published';
          next[rawItem.id] = {
            moderationStatus: st,
            views: rawItem.viewsCount ?? prev[rawItem.id]?.views ?? 0,
            contactClicks: prev[rawItem.id]?.contactClicks ?? 0,
            chatClicks: prev[rawItem.id]?.chatClicks ?? 0,
            isUrgent: Boolean(rawItem.isUrgent),
            expiryDays: 30,
          };
        }
        return next;
      });
    } catch {
      setCatalogError('دریافت آگهی‌ها از سرور با خطا مواجه شد.');
    } finally {
      setIsLoadingListings(false);
    }
  };

  useEffect(() => {
    const readJsonSafe = <T,>(key: string, validate?: (val: unknown) => boolean): T | null => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (validate && !validate(parsed)) return null;
        return parsed as T;
      } catch {
        return null;
      }
    };

    try {
      localStorage.removeItem('tahator_user_ads');
    } catch {
      // ignore storage errors
    }

    const savedProfile = readJsonSafe<UserProfile>(
      'tahator_profile_v2',
      (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
    );
    const hasStaleMockProfile =
      savedProfile?.phone === '09123456789' || savedProfile?.name === 'علی فیروزی';

    if (hasStaleMockProfile) {
      resetGuestState();
      try {
        localStorage.removeItem('tahator_bookmarks');
      } catch {
        // ignore storage errors
      }
    } else {
      const savedBookmarks = readJsonSafe<string[]>('tahator_bookmarks', Array.isArray);
      if (savedBookmarks) setBookmarks(savedBookmarks);

      const savedNotes = readJsonSafe<Record<string, string>>(
        'tahator_notes',
        (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
      );
      if (savedNotes) setNotes(savedNotes);

      const savedRecent = readJsonSafe<string[]>('tahator_recent', Array.isArray);
      if (savedRecent) setRecentIds(savedRecent);

      if (savedProfile) setUserProfile(savedProfile);

      const savedAuth = readJsonSafe<boolean>('tahator_auth_v2', (v) => typeof v === 'boolean');
      if (savedAuth === true) {
        setIsLoggedIn(true);
        try {
          const rawRole = localStorage.getItem('tahator_role_v2');
          if (rawRole) {
            setUserRole(normalizeUserRole(rawRole));
          }
        } catch {
          // ignore storage errors
        }
      } else {
        setUserRole('user');
      }

      const savedWallet = readJsonSafe<number>(
        'tahator_wallet_v2',
        (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0
      );
      if (savedWallet !== null) setWalletBalance(savedWallet);

      const savedTx = readJsonSafe<WalletTransaction[]>('tahator_tx_v2', Array.isArray);
      if (savedTx) setTransactions(savedTx);

      const savedOffers = readJsonSafe<BarterOffer[]>('tahator_offers_v2', Array.isArray);
      if (savedOffers) setBarterOffers(savedOffers);

      const savedSearchesLS = readJsonSafe<SavedSearch[]>('tahator_searches_v2', Array.isArray);
      if (savedSearchesLS) setSavedSearches(savedSearchesLS);

      const savedAssets = readJsonSafe<BarterAsset[]>('tahator_barter_assets_v2', Array.isArray);
      if (savedAssets) setBarterAssets(savedAssets);

      const savedNotifs = readJsonSafe<UserNotification[]>('tahator_notifications_v2', Array.isArray);
      if (savedNotifs) setNotifications(savedNotifs);

      const savedSessions = readJsonSafe<AuthSessionRecord[]>('tahator_sessions_v2', Array.isArray);
      if (savedSessions && savedSessions.length > 0) setSessions(savedSessions);
    }

    const savedAi = readJsonSafe<AiConfig>(
      'tahator_ai_config',
      (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
    );
    if (savedAi) setAiConfig(savedAi);

    const savedRecentSearch = readJsonSafe<string[]>('tahator_recent_searches', Array.isArray);
    if (savedRecentSearch) setRecentSearches(savedRecentSearch);

    void loadPublicCatalog();
    void syncSessionFromBackend();
  }, []);

  const applyBackendProfile = (p: BackendProfileResponse) => {
    const themeMap = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' } as const;
    setUserProfile((prev) => {
      const next: UserProfile = {
        ...prev,
        name: p.fullName || prev.name,
        phone: p.phone || prev.phone,
        city: p.city?.name || prev.city || 'تهران',
        accountType: p.accountType || prev.accountType || 'PERSONAL',
        onboardingCompleted: p.onboardingCompleted,
        isVerified: p.isVerified,
        iban: p.ibanMasked || prev.iban,
        simOwnershipRevoked: p.simOwnershipRevoked,
        autoOfficialInvoice: p.autoOfficialInvoice,
        uiTheme: themeMap[p.uiTheme] || prev.uiTheme,
        personalizedFeed: p.personalizedFeed,
        hidePhoneInChat: p.hidePhoneInChat,
        allowCallHours: p.allowCallHours || prev.allowCallHours,
        preferredBarterCategories:
          p.preferredCategories && p.preferredCategories.length > 0
            ? p.preferredCategories
            : prev.preferredBarterCategories,
        joinedAt: prev.joinedAt || 'فعال',
        lastLoginAt: 'هم‌اکنون',
      };
      persistSafe('tahator_profile_v2', next);
      return next;
    });
    if (p.wallet?.availableBalance !== undefined) {
      const bal = Number(p.wallet.availableBalance);
      if (Number.isFinite(bal)) {
        setWalletBalance(bal);
        persistSafe('tahator_wallet_v2', bal);
      }
    }
    const primaryRole = normalizeUserRole(p.dashboards?.[0]?.roleCode);
    setUserRole(primaryRole);
    setIsLoggedIn(true);
    persistSafe('tahator_auth_v2', true);
    persistSafe('tahator_role_v2', primaryRole);
  };

  const syncSessionFromBackend = async () => {
    try {
      const profile = await tahatorApi.getMyProfile();
      applyBackendProfile(profile);
      if (profile.requiresOnboarding) {
        setForceOnboarding(true);
        setShowAuthModal(true);
      } else {
        setForceOnboarding(false);
      }

      const [walletData, sessionList, myListingsRes, archivedRes] = await Promise.all([
        tahatorApi.getMyWallet().catch(() => null),
        tahatorApi.getMySessions().catch(() => null),
        tahatorApi.getMyListings().catch(() => null),
        tahatorApi.getMyListings('archived').catch(() => null),
      ]);

      if (walletData) {
        const bal = Number(walletData.availableBalance);
        if (Number.isFinite(bal)) {
          setWalletBalance(bal);
          persistSafe('tahator_wallet_v2', bal);
        }
        if (Array.isArray(walletData.transactions)) {
          const mappedTx: WalletTransaction[] = walletData.transactions.map((tx) => ({
            id: tx.id,
            title: tx.titleFa,
            amount: Number(tx.amount) || 0,
            type: tx.txType === 'CREDIT' || tx.txType === 'ESCROW_RELEASE' ? 'credit' : 'debit',
            date: new Date(tx.createdAt).toLocaleDateString('fa-IR'),
            status: tx.status === 'COMPLETED' ? 'موفق' : 'در انتظار',
          }));
          setTransactions(mappedTx);
          persistSafe('tahator_tx_v2', mappedTx);
        }
      }

      if (Array.isArray(sessionList)) {
        const mappedSessions: AuthSessionRecord[] = sessionList.map((s) => ({
          id: s.id,
          deviceLabel: s.deviceLabel,
          phoneMasked: `${toPersianDigits(profile.phone.slice(0, 4))} *** ${toPersianDigits(profile.phone.slice(7))}`,
          loginMethod: 'کوکی امن HttpOnly + OTP',
          time: s.isCurrent ? 'نشست فعال کنونی' : new Date(s.lastUsedAt).toLocaleDateString('fa-IR'),
          isCurrent: s.isCurrent,
        }));
        setSessions(mappedSessions);
        persistSafe('tahator_sessions_v2', mappedSessions);
      }

      if (Array.isArray(myListingsRes)) {
        const mappedMine = myListingsRes.map((item) => ({
          ...mapBackendListingToUi(item),
          isUserCreated: true,
        }));
        setMyAdIds(mappedMine.map((m) => m.id));
        if (mappedMine.length > 0) {
          setListings((prev) => {
            const mineById = new Map(mappedMine.map((m) => [m.id, m]));
            const rest = prev.filter((item) => !mineById.has(item.id));
            return [...mappedMine, ...rest];
          });
          setListingMeta((prev) => {
            const next = { ...prev };
            for (const rawItem of myListingsRes) {
              const st: AdModerationStatus =
                rawItem.moderationStatus === 'PENDING_REVIEW'
                  ? 'pending'
                  : rawItem.moderationStatus === 'DRAFT' || rawItem.moderationStatus === 'ARCHIVED'
                  ? 'needs_edit'
                  : rawItem.moderationStatus === 'REJECTED'
                  ? 'rejected'
                  : 'published';
              next[rawItem.id] = {
                moderationStatus: st,
                views: rawItem.viewsCount ?? prev[rawItem.id]?.views ?? 0,
                contactClicks: prev[rawItem.id]?.contactClicks ?? 0,
                chatClicks: prev[rawItem.id]?.chatClicks ?? 0,
                isUrgent: Boolean(rawItem.isUrgent),
                expiryDays: 30,
              };
            }
            return next;
          });
        }
      }

      if (Array.isArray(archivedRes)) {
        setArchivedAds(
          archivedRes.map((item) => ({
            listing: mapBackendListingToUi(item),
            reason: 'آرشیوشده',
            archivedAt: new Date(item.updatedAt || item.createdAt).toLocaleDateString('fa-IR'),
          }))
        );
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        resetGuestState();
        return;
      }
    }
  };

  const handleRecordSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t !== clean)].slice(0, 6);
      persistSafe('tahator_recent_searches', next);
      return next;
    });
  };

  const persistSafe = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [id, ...prev];
      persistSafe('tahator_bookmarks', next);
      triggerToast(exists ? 'آگهی از نشان‌ها حذف شد' : 'آگهی به نشان‌ها اضافه شد');
      return next;
    });
  };

  const handleSaveNote = (id: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [id]: text };
      persistSafe('tahator_notes', next);
      return next;
    });
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setListingMeta((prev) => {
      const cur = prev[listing.id] || {
        moderationStatus: 'published' as AdModerationStatus,
        views: 120,
        contactClicks: 8,
        chatClicks: 4,
        expiryDays: 30,
      };
      return {
        ...prev,
        [listing.id]: { ...cur, views: cur.views + 1 },
      };
    });
    setRecentIds((prev) => {
      const next = [listing.id, ...prev.filter((id) => id !== listing.id)].slice(0, 12);
      persistSafe('tahator_recent', next);
      return next;
    });
  };

  const handleTrackPhoneClick = (listingId: string) => {
    setListingMeta((prev) => {
      const cur = prev[listingId] || {
        moderationStatus: 'published' as AdModerationStatus,
        views: 120,
        contactClicks: 8,
        chatClicks: 4,
        expiryDays: 30,
      };
      return {
        ...prev,
        [listingId]: { ...cur, contactClicks: cur.contactClicks + 1 },
      };
    });
  };

  const handleCreateListing = (newAd: Listing) => {
    if (!isLoggedIn) {
      triggerToast('برای ثبت آگهی ابتدا با شماره موبایل وارد شوید');
      setShowPostAdModal(false);
      setShowAuthModal(true);
      return;
    }

    const matchedCategory = backendCategories.find((c) => c.name === newAd.category);
    const matchedCity = backendCities.find((c) => c.name === newAd.city);
    const safeDescription =
      newAd.description && newAd.description.trim().length >= 5
        ? newAd.description.trim()
        : `${newAd.title} - قابل تهاتر در ${newAd.city}`;

    void tahatorApi
      .createListing({
        categoryId: matchedCategory?.id,
        categoryName: newAd.category,
        subcategory: newAd.subcategory,
        cityId: matchedCity?.id,
        cityName: newAd.city,
        neighborhood: newAd.neighborhood || 'مرکزی',
        title: newAd.title,
        description: safeDescription,
        price: newAd.price || 0,
        priceLabel: newAd.priceLabel,
        hasExchange: newAd.hasExchange,
        exchangeWith: newAd.exchangeWith,
        hasInstallmentPlan: newAd.hasInstallmentPlan,
        images: newAd.images,
      })
      .then((created) => {
        const mappedCreated: Listing = {
          ...mapBackendListingToUi(created),
          isUserCreated: true,
        };
        setListings((prev) => [mappedCreated, ...prev.filter((i) => i.id !== mappedCreated.id)]);
        setMyAdIds((prev) => [mappedCreated.id, ...prev.filter((id) => id !== mappedCreated.id)]);
        setListingMeta((prev) => ({
          ...prev,
          [mappedCreated.id]: {
            moderationStatus: 'published',
            views: 1,
            contactClicks: 0,
            chatClicks: 0,
            expiryDays: 30,
          },
        }));
        if (selectedCities.length > 0 && !selectedCities.includes(mappedCreated.city)) {
          setSelectedCities((prev) => [...prev, mappedCreated.city]);
        }
        triggerToast('آگهی شما با موفقیت در پایگاه‌داده ثبت و منتشر شد!');
      })
      .catch((err) => {
        triggerToast(err instanceof ApiClientError ? err.message : 'ثبت آگهی با خطا مواجه شد.');
      });
  };

  const handleEditAd = (
    id: string,
    updates: {
      title: string;
      price: number;
      hasExchange: boolean;
      exchangeWith: string;
      description: string;
    }
  ) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              title: updates.title,
              price: updates.price,
              priceLabel: updates.price === 0 ? 'توافقی' : undefined,
              hasExchange: updates.hasExchange,
              exchangeWith: updates.hasExchange ? updates.exchangeWith : undefined,
              description: updates.description,
            }
          : item
      )
    );
    triggerToast('تغییرات آگهی با موفقیت ذخیره شد');
  };

  const handleDeleteUserAd = (id: string, reason?: string) => {
    if (isLoggedIn) {
      void tahatorApi.archiveMyListing(id, reason || 'حذف‌شده توسط کاربر').catch((err) => {
        if (err instanceof ApiClientError) triggerToast(err.message);
      });
    }
    const target = listings.find((item) => item.id === id);
    if (target) {
      setArchivedAds((prev) => [
        { listing: target, reason: reason || 'حذف‌شده توسط کاربر', archivedAt: 'امروز' },
        ...prev.filter((a) => a.listing.id !== id),
      ]);
    }
    setListings((prev) => prev.filter((item) => item.id !== id));
    setMyAdIds((prev) => prev.filter((x) => x !== id));
    triggerToast(
      reason ? `آگهی به آرشیو منتقل شد (${reason})` : 'آگهی به آرشیو منتقل شد'
    );
  };

  const handleRestoreArchivedAd = (id: string) => {
    const archivedItem = archivedAds.find((a) => a.listing.id === id);
    if (!archivedItem) return;
    if (isLoggedIn) {
      void tahatorApi.restoreMyListing(id).catch((err) => {
        if (err instanceof ApiClientError) triggerToast(err.message);
      });
    }
    const restored: Listing = { ...archivedItem.listing, publishedAt: 'لحظاتی پیش' };
    setListings((prev) => [restored, ...prev.filter((l) => l.id !== id)]);
    setMyAdIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
    setArchivedAds((prev) => prev.filter((a) => a.listing.id !== id));
    triggerToast('آگهی از آرشیو بازنشر شد');
  };

  const handleTopUpWallet = (amount: number) => {
    const applyLocal = (newBal?: number) => {
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        title: 'افزایش اعتبار کیف پول تهاتر آپ',
        amount,
        type: 'credit',
        date: 'امروز',
        status: 'موفق',
      };
      setWalletBalance((prev) => {
        const next = newBal !== undefined ? newBal : prev + amount;
        persistSafe('tahator_wallet_v2', next);
        return next;
      });
      setTransactions((prev) => {
        const next = [newTx, ...prev];
        persistSafe('tahator_tx_v2', next);
        return next;
      });
      triggerToast('کیف پول با موفقیت شارژ شد');
    };

    if (isLoggedIn) {
      void tahatorApi
        .topUpWallet(amount)
        .then((res) => {
          const parsed = Number(res.availableBalance);
          applyLocal(Number.isFinite(parsed) ? parsed : undefined);
        })
        .catch(() => {
          applyLocal();
        });
      return;
    }
    applyLocal();
  };

  const handleLadderAd = (id: string) => {
    const target = listings.find((i) => i.id === id);
    if (!target) return;
    if (!isLoggedIn) {
      triggerToast('برای نردبان آگهی ابتدا با شماره موبایل وارد شوید');
      setShowAuthModal(true);
      return;
    }
    void tahatorApi
      .upgradeMyListing(id, 'ladder')
      .then(() => {
        const updated = { ...target, badge: 'نردبان شده' as const, publishedAt: 'لحظاتی پیش' };
        setListings((prev) => [updated, ...prev.filter((i) => i.id !== id)]);
        void syncSessionFromBackend();
        triggerToast('آگهی نردبان شد و در صدر فهرست قرار گرفت');
      })
      .catch((err) => {
        triggerToast(
          err instanceof ApiClientError
            ? err.message
            : 'نردبان آگهی انجام نشد؛ لطفاً موجودی کیف پول را بررسی کنید'
        );
      });
  };

  const handleUrgentAd = (id: string) => {
    const target = listings.find((i) => i.id === id);
    if (!target) return;
    if (!isLoggedIn) {
      triggerToast('برای ثبت نشان فوری ابتدا با شماره موبایل وارد شوید');
      setShowAuthModal(true);
      return;
    }
    void tahatorApi
      .upgradeMyListing(id, 'urgent')
      .then(() => {
        setListings((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isUrgent: true, badge: 'فوری' } : i))
        );
        setListingMeta((prev) => {
          const cur = prev[id] || {
            moderationStatus: 'published' as AdModerationStatus,
            views: 0,
            contactClicks: 0,
            chatClicks: 0,
            expiryDays: 30,
          };
          return { ...prev, [id]: { ...cur, isUrgent: true } };
        });
        void syncSessionFromBackend();
        triggerToast('نشان «فوری» برای آگهی فعال شد');
      })
      .catch((err) => {
        triggerToast(
          err instanceof ApiClientError
            ? err.message
            : 'ثبت نشان فوری انجام نشد؛ لطفاً موجودی کیف پول را بررسی کنید'
        );
      });
  };

  const handleRenewAd = (id: string) => {
    setListingMeta((prev) => {
      const cur = prev[id] || {
        moderationStatus: 'published' as AdModerationStatus,
        views: 0,
        contactClicks: 0,
        chatClicks: 0,
        expiryDays: 30,
      };
      return { ...prev, [id]: { ...cur, expiryDays: 30 } };
    });
    setListings((prev) =>
      prev.map((i) => (i.id === id ? { ...i, publishedAt: 'لحظاتی پیش' } : i))
    );
    triggerToast('اعتبار آگهی برای ۳۰ روز دیگر تمدید شد');
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 24);
    triggerToast('آگهی‌های بیشتری نمایش داده شد');
  };

  const handleOpenChatWith = (
    listing?: Listing,
    isAdmin = false,
    prefillMessage?: string
  ) => {
    if (isAdmin || !listing) {
      setActiveThreadId('admin-support');
      setShowChatModal(true);
      return;
    }

    setListingMeta((prev) => {
      const cur = prev[listing.id];
      if (!cur) return prev;
      return { ...prev, [listing.id]: { ...cur, chatClicks: cur.chatClicks + 1 } };
    });

    const threadId = `seller-${listing.id}`;
    const nowTime = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setThreads((prev) => {
      const existing = prev.find((t) => t.id === threadId);
      if (existing) {
        if (!prefillMessage) return prev;
        return prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  { id: `msg-${Date.now()}`, sender: 'me', text: prefillMessage, time: nowTime },
                ],
              }
            : t
        );
      }
      const initialMsgs: ChatThread['messages'] = [
        {
          id: `init-${Date.now()}`,
          sender: 'other',
          text: `سلام! آگهی «${listing.title}» موجود است. سوال یا پیشنهاد معاوضه‌ای دارید در خدمتم.`,
          time: 'الان',
        },
      ];
      if (prefillMessage) {
        initialMsgs.push({
          id: `msg-${Date.now() + 1}`,
          sender: 'me',
          text: prefillMessage,
          time: nowTime,
        });
      }
      return [
        {
          id: threadId,
          title: `${listing.sellerName} (${listing.neighborhood})`,
          subtitle: listing.title,
          messages: initialMsgs,
        },
        ...prev,
      ];
    });
    setActiveThreadId(threadId);
    setSelectedListing(null);
    setShowChatModal(true);
  };

  const handleSendMessage = (threadId: string, text: string) => {
    const nowTime = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const safety = analyzeChatSafety(text);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: `msg-${Date.now()}`, sender: 'me', text, time: nowTime },
              ],
            }
          : t
      )
    );

    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `reply-${Date.now()}`,
                    sender: 'other',
                    text:
                      safety.riskLevel === 'danger'
                        ? '⚠️ هشدار هوشمند: لطفاً هیچ مبلغی پیش از بازدید حضوری و ثبت معامله امن پرداخت نکنید.'
                        : t.isAdmin
                        ? 'پیام شما توسط کارشناس تهاتر آپ دریافت شد. لطفاً کد آگهی یا شماره تماس خود را جهت بررسی شرایط اقساط و معاوضه ارسال بفرمایید.'
                        : 'ممنون از پیام شما. لطفاً تصویر یا مشخصات مورد پیشنهادی برای معاوضه را ارسال کنید تا بررسی کنم.',
                    time: nowTime,
                  },
                ],
              }
            : t
        )
      );
    }, 650);
  };

  const handleSubmitBarterOffer = (payload: {
    listing: Listing;
    offeredItemTitle: string;
    offeredEstimatedPrice: number;
    installmentRequested: boolean;
    note: string;
  }) => {
    const targetPrice = payload.listing.price || 0;
    const diff =
      targetPrice > 0 && payload.offeredEstimatedPrice > 0
        ? Math.abs(targetPrice - payload.offeredEstimatedPrice)
        : 0;
    const newOffer: BarterOffer = {
      id: `bo-${Date.now()}`,
      direction: 'sent',
      listingId: payload.listing.id,
      listingTitle: payload.listing.title,
      listingImage: payload.listing.images[0] || '/ads/no-image.svg',
      listingPrice: targetPrice,
      offeredItemTitle: payload.offeredItemTitle,
      offeredEstimatedPrice: payload.offeredEstimatedPrice,
      cashDifference: diff,
      installmentRequested: payload.installmentRequested,
      aiMatchPercent: 91,
      proposerName: payload.listing.sellerName,
      proposerPhone: payload.listing.sellerPhone,
      note: payload.note,
      status: 'pending',
      createdAt: 'لحظاتی پیش',
    };
    setBarterOffers((prev) => {
      const next = [newOffer, ...prev];
      persistSafe('tahator_offers_v2', next);
      return next;
    });
    triggerToast('پیشنهاد معاوضه شما ارسال و در داشبورد تهاتر من ثبت شد');
  };

  const handleSaveCurrentSearch = () => {
    const newSearch: SavedSearch = {
      id: `ss-${Date.now()}`,
      title:
        searchQuery.trim() ||
        (filters.category
          ? `جستجو در ${filters.category}`
          : 'همه آگهی‌های جدید تهاتر آپ'),
      query: searchQuery.trim(),
      category: filters.category,
      cityLabel: selectedCities.length > 0 ? selectedCities.join('، ') : 'همه شهرها',
      onlyExchange: filters.onlyExchange,
      notifyEnabled: true,
      createdAt: 'امروز',
    };
    setSavedSearches((prev) => {
      const next = [newSearch, ...prev];
      persistSafe('tahator_searches_v2', next);
      return next;
    });
    triggerToast('این جستجو در بخش «جستجوهای ذخیره‌شده» داشبورد ثبت شد');
  };

  const handleSwitchRole = (role: UserRole) => {
    const safeRole = normalizeUserRole(role);
    setUserRole(safeRole);
    persistSafe('tahator_role_v2', safeRole);
    triggerToast(`نقش فعال به «${getRoleMeta(safeRole).shortTitle}» تغییر یافت`);
  };

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const exQ = filters.exchangeKeyword.trim().toLowerCase();
    const minP = filters.minPrice ? Number(filters.minPrice) : null;
    const maxP = filters.maxPrice ? Number(filters.maxPrice) : null;
    const minArea = filters.minArea ? Number(filters.minArea) : null;

    const list = listings.filter((item) => {
      if (selectedCities.length > 0 && !selectedCities.includes(item.city)) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.subcategory && item.subcategory !== filters.subcategory) return false;
      if (
        filters.neighborhoods.length > 0 &&
        !filters.neighborhoods.includes(item.neighborhood)
      ) {
        return false;
      }

      if (minArea !== null) {
        const area = extractAreaFromListing(item);
        if (area === null || area < minArea) return false;
      }
      if (filters.roomsFilter !== 'all') {
        const rooms = extractRoomsFromListing(item);
        if (rooms === null) return false;
        if (filters.roomsFilter === '3+' ? rooms < 3 : String(rooms) !== filters.roomsFilter) {
          return false;
        }
      }
      if (filters.conditionFilter !== 'all') {
        const hay = `${item.title} ${item.description} ${(item.specs || []).map((s) => s.value).join(' ')}`;
        const looksNew = hay.includes('نو') || hay.includes('صفر') || hay.includes('آکبند') || hay.includes('۱۴۰۵') || hay.includes('۱۴۰۴');
        if (filters.conditionFilter === 'new' && !looksNew) return false;
        if (filters.conditionFilter === 'used' && looksNew && !hay.includes('کارکرده')) return false;
      }

      if (q) {
        const haystack =
          `${item.title} ${item.description} ${item.category} ${item.subcategory} ${item.neighborhood} ${item.city} ${item.exchangeWith || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (exQ) {
        const exHaystack = `${item.title} ${item.exchangeWith || ''} ${item.description}`.toLowerCase();
        if (!item.hasExchange || !exHaystack.includes(exQ)) return false;
      }

      if (minP !== null && item.price > 0 && item.price < minP) return false;
      if (maxP !== null && item.price > maxP) return false;
      if (minP !== null && item.price === 0 && !item.deposit) return false;

      if (filters.withPhoto && item.images.length === 0) return false;
      if (filters.onlyExchange && !item.hasExchange) return false;
      if (filters.onlyInstallment && !item.hasInstallmentPlan) return false;
      if (filters.onlyUrgent && !item.isUrgent && item.badge !== 'فوری') return false;
      if (filters.onlyVerifiedPhotos && !item.isVerifiedPhotos) return false;

      if (filters.timeFilter === '24h' && item.timeCategory !== '24h') return false;
      if (
        filters.timeFilter === 'week' &&
        item.timeCategory !== '24h' &&
        item.timeCategory !== 'week'
      ) {
        return false;
      }
      if (
        filters.timeFilter === 'month' &&
        item.timeCategory === '3months'
      ) {
        return false;
      }

      return true;
    });

    if (sortBy === 'cheapest') {
      return [...list].sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
    }
    if (sortBy === 'expensive') {
      return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return list;
  }, [listings, selectedCities, filters, searchQuery, sortBy]);

  const displayedListings = useMemo(
    () => filteredListings.slice(0, visibleCount),
    [filteredListings, visibleCount]
  );

  const remainingCount = Math.max(0, filteredListings.length - displayedListings.length);

  const cityStatusText =
    selectedCities.length === 0
      ? 'هیچ شهری انتخاب نشده'
      : selectedCities.join('، ');

  const bookmarkedAds = useMemo(
    () => listings.filter((l) => bookmarks.includes(l.id)),
    [listings, bookmarks]
  );

  const myAds = useMemo(
    () => listings.filter((l) => l.isUserCreated || myAdIds.includes(l.id)),
    [listings, myAdIds]
  );

  const recentAds = useMemo(
    () =>
      recentIds
        .map((id) => listings.find((l) => l.id === id))
        .filter((x): x is Listing => Boolean(x)),
    [recentIds, listings]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-neutral-weaker)]">
      {/* Top Navbar */}
      <Navbar
        selectedCities={selectedCities}
        onOpenCityModal={() => setShowCityModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={filters.category}
        allListings={listings}
        recentSearches={recentSearches}
        onRecordSearch={handleRecordSearch}
        onSelectListing={handleSelectListing}
        onSelectCategory={(cat, sub = null) => {
          setShowDashboardModal(false);
          updateFilters({ category: cat, subcategory: sub || null });
        }}
        onLogoClick={() => setShowDashboardModal(false)}
        onOpenCategoriesModal={() => setShowCategoriesModal(true)}
        onOpenPostAd={() => setShowPostAdModal(true)}
        onOpenFacilities={() => setShowFacilitiesModal(true)}
        onOpenInstallmentPlan={() => setShowInstallmentModal(true)}
        onOpenDashboardTab={(tab) => {
          setDashboardTab(tab);
          setShowDashboardModal(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={() => {
          setIsLoggedIn(false);
          setUserRole('user');
          persistSafe('tahator_auth_v2', false);
          persistSafe('tahator_role_v2', 'user');
          triggerToast('از حساب کاربری خارج شدید');
        }}
        onOpenAiAssistant={() => {
          setAiModalTab('chat');
          setShowAiModal(true);
        }}
        onOpenRolePanel={() => setShowRolePanelModal(true)}
        onOpenMobileSidebar={() => setShowMobileSidebar(true)}
        bookmarkCount={bookmarks.length}
        isLoggedIn={isLoggedIn}
        userName={userProfile.name}
        userPhone={userProfile.phone}
        userRole={userRole}
        walletBalance={walletBalance}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        pendingOffersCount={
          barterOffers.filter((o) => o.direction === 'received' && o.status === 'pending').length
        }
      />

      {showDashboardModal ? (
        <UserDashboardModal
          initialTab={dashboardTab}
          isLoggedIn={isLoggedIn}
          user={userProfile}
          userRole={userRole}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onLogout={() => {
            void tahatorApi.logout().catch(() => {});
            resetGuestState();
            triggerToast('از حساب کاربری خارج شدید');
          }}
          onUpdateProfile={(partial) => {
            setUserProfile((prev) => {
              const next = { ...prev, ...partial };
              persistSafe('tahator_profile_v2', next);
              return next;
            });

            if (!isLoggedIn) return;

            if (partial.simOwnershipRevoked === true) {
              void tahatorApi
                .revokeSim(userProfile.phone)
                .then(() => syncSessionFromBackend())
                .catch((err) => {
                  if (err instanceof ApiClientError) triggerToast(err.message);
                });
              return;
            }

            if (partial.nationalId && partial.nationalId.trim().length >= 10) {
              void tahatorApi
                .submitKyc({
                  nationalId: partial.nationalId.trim(),
                  iban: partial.iban?.trim() || undefined,
                  fullName: partial.name?.trim() || undefined,
                })
                .then((res) => {
                  setUserProfile((prev) => {
                    const next = {
                      ...prev,
                      isVerified: res.isVerified,
                      iban: res.ibanMasked || prev.iban,
                    };
                    persistSafe('tahator_profile_v2', next);
                    return next;
                  });
                  triggerToast(res.message);
                })
                .catch((err) => {
                  setUserProfile((prev) => {
                    const reverted = { ...prev, isVerified: false };
                    persistSafe('tahator_profile_v2', reverted);
                    return reverted;
                  });
                  if (err instanceof ApiClientError) {
                    triggerToast(err.message);
                  }
                });
              return;
            }

            const patchPayload: Record<string, unknown> = {};
            if (partial.name !== undefined) patchPayload.fullName = partial.name;
            if (partial.autoOfficialInvoice !== undefined)
              patchPayload.autoOfficialInvoice = partial.autoOfficialInvoice;
            if (partial.uiTheme !== undefined)
              patchPayload.uiTheme = partial.uiTheme.toUpperCase();
            if (partial.personalizedFeed !== undefined)
              patchPayload.personalizedFeed = partial.personalizedFeed;
            if (partial.hidePhoneInChat !== undefined)
              patchPayload.hidePhoneInChat = partial.hidePhoneInChat;
            if (partial.allowCallHours !== undefined)
              patchPayload.allowCallHours = partial.allowCallHours;
            if (partial.preferredBarterCategories !== undefined)
              patchPayload.preferredCategories = partial.preferredBarterCategories;

            if (Object.keys(patchPayload).length > 0) {
              void tahatorApi.updateMyProfile(patchPayload).catch((err) => {
                if (err instanceof ApiClientError) triggerToast(err.message);
              });
            }
          }}
          onSwitchRole={handleSwitchRole}
          onOpenRolePanel={() => setShowRolePanelModal(true)}
          onOpenSupport={() => setShowSupportModal(true)}
          walletBalance={walletBalance}
          transactions={transactions}
          onTopUpWallet={handleTopUpWallet}
          allListings={listings}
          myAds={myAds}
          archivedAds={archivedAds}
          onRestoreArchivedAd={handleRestoreArchivedAd}
          listingMeta={listingMeta}
          onOpenPostAd={() => setShowPostAdModal(true)}
          onOpenFacilities={() => setShowFacilitiesModal(true)}
          onOpenCompareWith={(ad) => {
            setAiCompareListingId(ad.id);
            setAiModalTab('compare');
            setShowAiModal(true);
          }}
          onOpenAiTab={(aiTab) => {
            setAiModalTab(aiTab);
            setShowAiModal(true);
          }}
          onSelectListing={handleSelectListing}
          onLadderAd={handleLadderAd}
          onUrgentAd={handleUrgentAd}
          onRenewAd={handleRenewAd}
          onEditAd={handleEditAd}
          onDeleteAd={handleDeleteUserAd}
          barterAssets={barterAssets}
          onAddBarterAsset={(asset) => {
            const newAsset: BarterAsset = {
              ...asset,
              id: `ba-${Date.now()}`,
              createdAt: 'امروز',
            };
            setBarterAssets((prev) => {
              const next = [newAsset, ...prev];
              persistSafe('tahator_barter_assets_v2', next);
              return next;
            });
            triggerToast('دارایی جدید به سبد تهاتر شما اضافه شد');
          }}
          onDeleteBarterAsset={(id) => {
            setBarterAssets((prev) => {
              const next = prev.filter((a) => a.id !== id);
              persistSafe('tahator_barter_assets_v2', next);
              return next;
            });
            triggerToast('دارایی از سبد تهاتر حذف شد');
          }}
          barterOffers={barterOffers}
          onRespondBarterOffer={(offerId, status) => {
            setBarterOffers((prev) => {
              const next = prev.map((o) => (o.id === offerId ? { ...o, status } : o));
              persistSafe('tahator_offers_v2', next);
              return next;
            });
            triggerToast(
              status === 'accepted'
                ? 'پیشنهاد معاوضه پذیرفته شد'
                : 'پیشنهاد معاوضه رد شد'
            );
          }}
          onOpenChatFromOffer={(offer) => {
            const target = listings.find((l) => l.id === offer.listingId);
            handleOpenChatWith(target, !target);
          }}
          installmentRequests={installmentRequests}
          bookmarkedAds={bookmarkedAds}
          onToggleBookmark={handleToggleBookmark}
          notes={notes}
          onSaveNote={handleSaveNote}
          recentAds={recentAds}
          onClearRecent={() => {
            setRecentIds([]);
            persistSafe('tahator_recent', []);
            triggerToast('تاریخچه بازدیدهای اخیر پاک شد');
          }}
          savedSearches={savedSearches}
          onToggleSavedSearchNotify={(id) => {
            setSavedSearches((prev) => {
              const next = prev.map((s) =>
                s.id === id ? { ...s, notifyEnabled: !s.notifyEnabled } : s
              );
              persistSafe('tahator_searches_v2', next);
              return next;
            });
          }}
          onApplySavedSearch={(s) => {
            setSearchQuery(s.query);
            updateFilters({
              category: s.category,
              onlyExchange: s.onlyExchange,
            });
            triggerToast(`جستجوی «${s.title}» اجرا شد`);
          }}
          onDeleteSavedSearch={(id) => {
            setSavedSearches((prev) => {
              const next = prev.filter((s) => s.id !== id);
              persistSafe('tahator_searches_v2', next);
              return next;
            });
          }}
          notifications={notifications}
          onMarkNotificationsRead={() => {
            setNotifications((prev) => {
              const next = prev.map((n) => ({ ...n, read: true }));
              persistSafe('tahator_notifications_v2', next);
              return next;
            });
            triggerToast('همه اعلان‌ها به‌عنوان خوانده‌شده علامت‌گذاری شد');
          }}
          sessions={sessions}
          onRevokeOtherSessions={() => {
            const staleIds = sessions.filter((s) => !s.isCurrent).map((s) => s.id);
            if (isLoggedIn && staleIds.length > 0) {
              staleIds.forEach((sid) => {
                if (/^[0-9a-f-]{36}$/i.test(sid)) {
                  void tahatorApi.revokeSession(sid).catch(() => {});
                }
              });
            }
            setSessions((prev) => {
              const next = prev.filter((s) => s.isCurrent);
              persistSafe('tahator_sessions_v2', next);
              return next;
            });
            triggerToast('سایر نشست‌های قدیمی از حساب شما خارج شدند');
          }}
          onSubmitSafetyReport={(subject, details) => {
            const newReport: AdReport = {
              id: `rep-${Date.now()}`,
              listingId: 'safety-center',
              listingTitle: `گزارش امنیتی کاربر: ${subject}`,
              reason: subject,
              details,
              reporterRole: userRole,
              status: 'open',
              createdAt: 'لحظاتی پیش',
            };
            setAdReports((prev) => [newReport, ...prev]);
            triggerToast('گزارش امنیتی در کارتابل نظارت ثبت شد');
          }}
          onClose={() => setShowDashboardModal(false)}
        />
      ) : (
        <>
          {/* Mobile & Tablet Quick Category, City, Map, AI & Role Strip */}
          <div className="xl:hidden border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {!isLoggedIn && (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="md:hidden shrink-0 h-[32px] px-3 rounded-full bg-[var(--semantic-positive-soft)] border border-[var(--semantic-positive)]/40 text-[var(--semantic-positive)] text-[12px] font-bold flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ورود با موبایل</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowCityModal(true)}
          className="sm:hidden shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span>{selectedCities.length === 1 ? selectedCities[0] : 'شهر'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMobileSidebar(true)}
          className="lg:hidden shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>فیلترها</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCategoriesModal(true)}
          className="shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
        >
          <span>دسته‌بندی‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMapView((prev) => !prev)}
          className={`shrink-0 h-[32px] px-3 rounded-full border text-[12px] font-medium flex items-center gap-1 ${
            showMapView
              ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
              : 'border-[var(--border-neutral-weaker)]'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 text-[var(--brand-action)]" />
          <span>نقشه</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAiModalTab('chat');
            setShowAiModal(true);
          }}
          className="md:hidden shrink-0 h-[32px] px-3 rounded-full border border-[var(--brand-action)]/40 bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-bold flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>هوش مصنوعی</span>
        </button>
        {isLoggedIn && userRole !== 'user' && (
          <button
            type="button"
            onClick={() => setShowRolePanelModal(true)}
            className="lg:hidden shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-[var(--brand-action)]" />
            <span>پنل {getRoleMeta(userRole).shortTitle}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => updateFilters({ onlyExchange: !filters.onlyExchange })}
          className={`shrink-0 h-[32px] px-3 rounded-full border text-[12px] font-medium flex items-center gap-1 ${
            filters.onlyExchange
              ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)]'
              : 'border-[var(--border-neutral-weaker)]'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>فقط معاوضه</span>
        </button>
        <button
          type="button"
          onClick={() => setShowFacilitiesModal(true)}
          className="lg:hidden shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
        >
          <Calculator className="w-3.5 h-3.5 text-[var(--brand-action)]" />
          <span>تسهیلات</span>
        </button>
        <button
          type="button"
          onClick={() => setShowInstallmentModal(true)}
          className="shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
        >
          <Percent className="w-3.5 h-3.5 text-[var(--brand-action)]" />
          <span>اقساطی</span>
        </button>
        {CATEGORIES.filter((c) => c.showInSidebar).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() =>
              updateFilters({
                category: filters.category === c.name ? null : c.name,
                subcategory: null,
              })
            }
            className={`lg:hidden shrink-0 h-[32px] px-3 rounded-full border text-[12px] transition-colors ${
              filters.category === c.name
                ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Main Content Wrapper */}
      <main className="max-w-[1440px] w-full mx-auto px-3 sm:px-4 pt-5 pb-24 lg:pb-12 flex gap-6 lg:gap-8 flex-1">
        {/* Right Sidebar (RTL Start) */}
        <Sidebar
          filters={filters}
          onUpdateFilters={updateFilters}
          onApplyFilters={() => triggerToast('فیلترها اعمال شد')}
          onResetFilters={() => {
            setFilters(DEFAULT_FILTERS);
            setSearchQuery('');
            triggerToast('تمامی فیلترها پاک شد');
          }}
          selectedCities={selectedCities}
          onOpenSupport={() => setShowSupportModal(true)}
          onOpenAdminChat={() => handleOpenChatWith(undefined, true)}
        />

        {/* Left Main Feed Area */}
        <section className="flex-1 min-w-0">
          {/* Feed Top Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-neutral-weaker)]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCityModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[12px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{cityStatusText}</span>
                </button>
                <h1 className="text-[14px] sm:text-[15px] font-medium text-[var(--content-neutral-stronger)]">
                  {filters.category ? (
                    <>
                      آگهی‌های {filters.category}
                      {filters.subcategory ? ` › ${filters.subcategory}` : ''}
                    </>
                  ) : (
                    'همه آگهی‌های سایت تهاتر کالا'
                  )}
                  <span className="mr-2 text-[12px] font-normal text-[var(--content-neutral-default)]">
                    ({toPersianDigits(filteredListings.length)} آگهی)
                  </span>
                </h1>
              </div>

              {/* Active Filter Chips */}
              {(filters.category ||
                filters.neighborhoods.length > 0 ||
                filters.onlyExchange ||
                filters.onlyInstallment ||
                filters.onlyUrgent ||
                filters.onlyVerifiedPhotos ||
                filters.withPhoto ||
                filters.minPrice ||
                filters.maxPrice ||
                filters.minArea ||
                filters.roomsFilter !== 'all' ||
                filters.conditionFilter !== 'all' ||
                filters.exchangeKeyword ||
                filters.timeFilter !== 'all' ||
                searchQuery) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--surface-neutral-weak)] text-[12px]">
                      <span>جستجو: {searchQuery}</span>
                      <button type="button" onClick={() => setSearchQuery('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-medium">
                      <span>{filters.subcategory || filters.category}</span>
                      <button
                        type="button"
                        onClick={() => updateFilters({ category: null, subcategory: null })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.neighborhoods.map((nb) => (
                    <span
                      key={nb}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--surface-neutral-weak)] text-[12px]"
                    >
                      <span>محله: {nb}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateFilters({
                            neighborhoods: filters.neighborhoods.filter((x) => x !== nb),
                          })
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.onlyExchange && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-medium">
                      <span>فقط دارای معاوضه</span>
                      <button
                        type="button"
                        onClick={() => updateFilters({ onlyExchange: false })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.onlyInstallment && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[12px] font-medium">
                      <span>اقساط ۵۰/۵۰</span>
                      <button
                        type="button"
                        onClick={() => updateFilters({ onlyInstallment: false })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.exchangeKeyword && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-medium">
                      <span>معاوضه با: {filters.exchangeKeyword}</span>
                      <button
                        type="button"
                        onClick={() => updateFilters({ exchangeKeyword: '' })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Map Toggle + Save Search + Sort & Card Layout Switcher */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMapView((prev) => !prev)}
                className={`kt-button--outlined !h-[34px] !px-2.5 text-[12px] ${
                  showMapView
                    ? '!bg-[var(--brand-soft)] !border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                    : ''
                }`}
                title="نمایش آگهی‌ها روی نقشه"
              >
                <MapIcon className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                <span>نمایش روی نقشه</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCurrentSearch}
                className="kt-button--outlined !h-[34px] !px-2.5 text-[12px]"
                title="ذخیره جستجو و دریافت خبرنامه"
              >
                <Bell className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                <span>ذخیره جستجو</span>
              </button>

              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-[var(--content-neutral-default)] absolute right-2.5 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="h-[34px] pr-8 pl-3 rounded-[4px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] text-[12px] text-[var(--content-neutral-stronger)] focus:outline-none focus:border-[var(--brand-action)]"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="cheapest">ارزان‌ترین</option>
                  <option value="expensive">گران‌ترین</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center border border-[var(--border-neutral-weaker)] rounded-[4px] p-0.5 bg-[var(--surface-neutral-weak)]">
                <button
                  type="button"
                  onClick={() => setCardLayout('horizontal')}
                  className={`p-1.5 rounded-[3px] transition-colors ${
                    cardLayout === 'horizontal'
                      ? 'bg-[var(--surface-neutral-weaker)] text-[var(--brand-primary)] shadow-sm'
                      : 'text-[var(--content-neutral-default)]'
                  }`}
                  title="نمای کارت افقی"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayout('vertical')}
                  className={`p-1.5 rounded-[3px] transition-colors ${
                    cardLayout === 'vertical'
                      ? 'bg-[var(--surface-neutral-weaker)] text-[var(--brand-primary)] shadow-sm'
                      : 'text-[var(--content-neutral-default)]'
                  }`}
                  title="نمای شبکه‌ای عمودی"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Quick Barter & Sales Conversion Filter Chips */}
          <div className="hidden lg:flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => updateFilters({ onlyExchange: !filters.onlyExchange })}
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] flex items-center gap-1.5 transition-colors ${
                filters.onlyExchange
                  ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>فقط قابل معاوضه</span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ onlyInstallment: !filters.onlyInstallment })}
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] flex items-center gap-1.5 transition-colors ${
                filters.onlyInstallment
                  ? 'bg-[var(--semantic-warning-soft)] border-[var(--semantic-warning)] text-[var(--semantic-warning)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>اقساط ۵۰/۵۰</span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ onlyUrgent: !filters.onlyUrgent })}
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] flex items-center gap-1.5 transition-colors ${
                filters.onlyUrgent
                  ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>فقط فوری</span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ onlyVerifiedPhotos: !filters.onlyVerifiedPhotos })}
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] flex items-center gap-1.5 transition-colors ${
                filters.onlyVerifiedPhotos
                  ? 'bg-[var(--semantic-positive-soft)] border-[var(--semantic-positive)] text-[var(--semantic-positive)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تایید اصالت تصویر</span>
            </button>
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  onlyExchange: true,
                  exchangeKeyword: filters.exchangeKeyword === 'خودرو' ? '' : 'خودرو',
                })
              }
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] transition-colors ${
                filters.exchangeKeyword === 'خودرو'
                  ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              معاوضه با خودرو
            </button>
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  onlyExchange: true,
                  exchangeKeyword: filters.exchangeKeyword === 'ملک' ? '' : 'ملک',
                })
              }
              className={`shrink-0 h-[30px] px-3 rounded-full border text-[12px] transition-colors ${
                filters.exchangeKeyword === 'ملک'
                  ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                  : 'border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)]'
              }`}
            >
              معاوضه با ملک
            </button>
          </div>

          {showMapView && (
            <MapFeedView
              listings={filteredListings}
              onSelectListing={handleSelectListing}
              onFilterCity={(city) => {
                setSelectedCities([city]);
                triggerToast(`آگهی‌های شهر ${city} روی نقشه انتخاب شد`);
              }}
              onCloseMap={() => setShowMapView(false)}
            />
          )}

          {/* 3-Column Listing Grid */}
          {isLoadingListings && listings.length === 0 ? (
            <div
              className={
                cardLayout === 'horizontal'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[16px]'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]'
              }
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[152px] rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] animate-pulse p-3.5 flex justify-between gap-3"
                >
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-3/4 rounded bg-[var(--surface-neutral-weak)]" />
                    <div className="h-3 w-1/2 rounded bg-[var(--surface-neutral-weak)]" />
                    <div className="h-3 w-2/3 rounded bg-[var(--surface-neutral-weak)] mt-6" />
                  </div>
                  <div className="w-[104px] h-[104px] sm:w-[124px] sm:h-[124px] rounded-[4px] bg-[var(--surface-neutral-weak)] shrink-0" />
                </div>
              ))}
            </div>
          ) : catalogError && listings.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-[var(--border-neutral-weaker)] rounded-[8px] space-y-3">
              <p className="text-[15px] font-bold text-[var(--content-neutral-stronger)]">
                {catalogError}
              </p>
              <button
                type="button"
                onClick={() => void loadPublicCatalog()}
                className="kt-button--primary"
              >
                تلاش مجدد
              </button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 px-4 text-center border border-dashed border-[var(--border-neutral-weaker)] rounded-[8px] space-y-3">
              <p className="text-[16px] font-bold text-[var(--content-neutral-stronger)]">
                متأسفانه آگهی منطبق با فیلترهای شما پیدا نشد.
              </p>
              <p className="text-[13px] text-[var(--content-neutral-default)]">
                می‌توانید فیلترهای جستجو را تغییر دهید یا محدوده شهرها را گسترش دهید.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    setSearchQuery('');
                  }}
                  className="kt-button--primary"
                >
                  پاک کردن فیلترها
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCities([])}
                  className="kt-button--outlined"
                >
                  نمایش همه شهرها
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  cardLayout === 'horizontal'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[16px]'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]'
                }
              >
                {displayedListings.map((item) => (
                  <PostCard
                    key={item.id}
                    listing={item}
                    isBookmarked={bookmarks.includes(item.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={handleSelectListing}
                    layoutMode={cardLayout}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {remainingCount > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="kt-button--outlined !h-[42px] !px-6 text-[13px] hover:border-[var(--brand-action)] hover:text-[var(--brand-primary)]"
                  >
                    نمایش اطلاعات بیشتر ({toPersianDigits(remainingCount)} مورد باقیمانده)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
        </>
      )}

      {/* Mobile Bottom Navigation Bar — 5 Tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[62px] bg-[var(--surface-neutral-weaker)] border-t border-[var(--border-neutral-weaker)] flex items-center justify-around px-2">
        <button
          type="button"
          onClick={() => {
            setShowDashboardModal(false);
            setFilters(DEFAULT_FILTERS);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            !showDashboardModal
              ? 'text-[var(--brand-primary)] font-bold'
              : 'text-[var(--content-neutral-default)]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>آگهی‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setDashboardTab('bookmarks');
            setShowDashboardModal(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            showDashboardModal &&
            (dashboardTab === 'bookmarks' ||
              dashboardTab === 'notes' ||
              dashboardTab === 'savedSearches')
              ? 'text-[var(--brand-primary)] font-bold'
              : 'text-[var(--content-neutral-default)]'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>نشان‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPostAdModal(true)}
          className="flex flex-col items-center -mt-5"
        >
          <span className="w-12 h-12 rounded-full bg-[var(--brand-action)] text-white flex items-center justify-center shadow-lg ring-4 ring-[var(--surface-neutral-weaker)]">
            <Plus className="w-6 h-6" />
          </span>
          <span className="text-[11px] font-bold text-[var(--content-neutral-stronger)] mt-0.5">
            ثبت آگهی
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenChatWith(undefined, true)}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--content-neutral-default)]"
        >
          <MessageSquare className="w-5 h-5" />
          <span>چت</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setDashboardTab('overview');
            setShowDashboardModal(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            showDashboardModal &&
            dashboardTab !== 'bookmarks' &&
            dashboardTab !== 'notes' &&
            dashboardTab !== 'savedSearches'
              ? 'text-[var(--brand-primary)] font-bold'
              : 'text-[var(--content-neutral-default)]'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{isLoggedIn ? 'تهاتر من' : 'ورود / من'}</span>
        </button>
      </nav>

      {/* Mobile Sidebar Filter Drawer */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex justify-start"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="w-[86%] max-w-[320px] h-full bg-[var(--surface-neutral-weaker)] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
              <span className="font-bold text-[15px]">دسته‌بندی‌ها و فیلترها</span>
              <button
                type="button"
                onClick={() => setShowMobileSidebar(false)}
                className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              filters={filters}
              onUpdateFilters={updateFilters}
              onApplyFilters={() => triggerToast('فیلترها اعمال شد')}
              onResetFilters={() => {
                setFilters(DEFAULT_FILTERS);
                setSearchQuery('');
                triggerToast('تمامی فیلترها پاک شد');
              }}
              selectedCities={selectedCities}
              onOpenSupport={() => {
                setShowMobileSidebar(false);
                setShowSupportModal(true);
              }}
              onOpenAdminChat={() => {
                setShowMobileSidebar(false);
                handleOpenChatWith(undefined, true);
              }}
              isMobileDrawer
              onCloseMobileDrawer={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* Full Categories Modal */}
      {showCategoriesModal && (
        <CategoriesModal
          onSelectCategory={(cat, sub = null) =>
            updateFilters({ category: cat, subcategory: sub || null })
          }
          onClose={() => setShowCategoriesModal(false)}
        />
      )}

      {/* Ad Detail Modal */}
      {selectedListing && (
        <AdDetailModal
          listing={selectedListing}
          allListings={listings}
          isBookmarked={bookmarks.includes(selectedListing.id)}
          onToggleBookmark={handleToggleBookmark}
          note={notes[selectedListing.id] || ''}
          onSaveNote={handleSaveNote}
          onClose={() => setSelectedListing(null)}
          onOpenChatWith={handleOpenChatWith}
          onSelectListing={handleSelectListing}
          onOpenInstallmentPlan={() => {
            setSelectedListing(null);
            setShowInstallmentModal(true);
          }}
          onOpenAiCompare={(ad) => {
            setSelectedListing(null);
            setAiCompareListingId(ad.id);
            setAiModalTab('compare');
            setShowAiModal(true);
          }}
          onOpenAiChain={(ad) => {
            setSelectedListing(null);
            setAiCompareListingId(ad.id);
            setAiModalTab('chain');
            setShowAiModal(true);
          }}
          onSubmitBarterOffer={handleSubmitBarterOffer}
          onReportListing={(ad, reason, details) => {
            const newReport: AdReport = {
              id: `rep-${Date.now()}`,
              listingId: ad.id,
              listingTitle: ad.title,
              reason,
              details: details || 'ثبت‌شده توسط کاربر از صفحه جزئیات آگهی',
              reporterRole: userRole,
              status: 'open',
              createdAt: 'لحظاتی پیش',
            };
            setAdReports((prev) => [newReport, ...prev]);
            triggerToast('گزارش شما در کارتابل ناظر آگهی ثبت شد');
          }}
          onTrackPhoneClick={handleTrackPhoneClick}
          aiConfig={aiConfig}
        />
      )}

      {/* City Modal */}
      {showCityModal && (
        <CityModal
          selectedCities={selectedCities}
          onConfirmCities={setSelectedCities}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {/* Post Ad Modal */}
      {showPostAdModal && (
        <PostAdModal
          onCreateListing={handleCreateListing}
          onClose={() => setShowPostAdModal(false)}
          aiConfig={aiConfig}
        />
      )}

      {/* Facilities Calculator Modal */}
      {showFacilitiesModal && (
        <FacilitiesModal
          onClose={() => setShowFacilitiesModal(false)}
          onOpenAdminChat={() => handleOpenChatWith(undefined, true)}
        />
      )}

      {/* Installment Plan Modal */}
      {showInstallmentModal && (
        <InstallmentPlanModal
          onClose={() => setShowInstallmentModal(false)}
          onOpenCalculator={() => setShowFacilitiesModal(true)}
          onOpenAdminChat={() => handleOpenChatWith(undefined, true)}
        />
      )}

      {/* Live Chat Modal */}
      {showChatModal && (
        <ChatModal
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChatModal(false)}
          aiConfig={aiConfig}
        />
      )}

      {/* Mobile OTP Unified Login Modal */}
      {showAuthModal && (
        <AuthOtpModal
          initialPhone={isLoggedIn ? userProfile.phone : ''}
          initialStep={forceOnboarding ? 'onboarding' : 'phone'}
          initialFullName={
            forceOnboarding &&
            userProfile.name !== 'کاربر مهمان' &&
            userProfile.name !== 'کاربر تهاتر'
              ? userProfile.name
              : ''
          }
          availableCities={backendCities}
          availableCategories={backendCategories}
          onCompleteAuth={({
            phone,
            name,
            city,
            accountType,
            role,
            preferredCategories,
            isNewUser,
            isVerified,
            onboardingCompleted,
          }) => {
            const nextProfile: UserProfile = {
              ...userProfile,
              name,
              phone,
              city,
              accountType: accountType || userProfile.accountType || 'PERSONAL',
              onboardingCompleted,
              isVerified: isVerified ?? userProfile.isVerified,
              preferredBarterCategories: preferredCategories,
              lastLoginAt: 'هم‌اکنون',
              joinedAt: isNewUser ? 'امروز' : userProfile.joinedAt || 'فعال',
            };
            const safeRole = normalizeUserRole(role);
            setUserProfile(nextProfile);
            setIsLoggedIn(true);
            setUserRole(safeRole);
            persistSafe('tahator_profile_v2', nextProfile);
            persistSafe('tahator_auth_v2', true);
            persistSafe('tahator_role_v2', safeRole);
            setForceOnboarding(false);
            void syncSessionFromBackend();

            if (isNewUser) {
              const existingIdx = platformUsers.findIndex((u) => u.phone === phone);
              if (existingIdx === -1) {
                const newAccount: PlatformUserAccount = {
                  id: `u-${Date.now()}`,
                  name,
                  phone,
                  role,
                  verified: false,
                  status: 'فعال',
                  adsCount: 0,
                  joinedAt: 'امروز',
                };
                setPlatformUsers((prev) => [newAccount, ...prev]);
              }
            }

            const masked = `${toPersianDigits(phone.slice(0, 4))} *** ${toPersianDigits(phone.slice(7))}`;
            const nextSession: AuthSessionRecord = {
              id: `sess-${Date.now()}`,
              deviceLabel: 'ورود تاییدشده با موبایل (هم‌اکنون)',
              phoneMasked: masked,
              loginMethod: 'رمز یک‌بار مصرف پیامکی',
              time: 'نشست فعال کنونی',
              isCurrent: true,
            };
            setSessions((prev) => {
              const prevDemoted = prev.map((s) => ({
                ...s,
                isCurrent: false,
                time: s.isCurrent ? 'نشست قبلی' : s.time,
              }));
              const next = [nextSession, ...prevDemoted].slice(0, 5);
              persistSafe('tahator_sessions_v2', next);
              return next;
            });

            if (isNewUser) {
              const welcomeNotif: UserNotification = {
                id: `notif-${Date.now()}`,
                title: `خوش آمدید ${name}! ورود شما انجام شد`,
                description:
                  'برای دریافت نشان سبز اعتماد و پیشنهادهای ۳ ضلعی دقیق‌تر، کد ملی و دارایی‌های آماده تهاتر خود را تکمیل کنید.',
                type: 'ai',
                time: 'هم‌اکنون',
                read: false,
              };
              setNotifications((prev) => {
                const next = [welcomeNotif, ...prev];
                persistSafe('tahator_notifications_v2', next);
                return next;
              });
            }

            setDashboardTab('overview');
            setShowDashboardModal(true);
            triggerToast(
              onboardingCompleted && isNewUser
                ? `حساب شما با شماره ${toPersianDigits(phone)} آماده شد — خوش آمدید ${name}!`
                : `خوش آمدید ${name}! ورود با موفقیت انجام شد`
            );
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Multi-Role Control Center Modal (Admin -> Support) */}
      {showRolePanelModal && (
        <RolePanelModal
          activeRole={userRole}
          onSwitchRole={handleSwitchRole}
          onOpenUserDashboard={() => {
            setDashboardTab('myAds');
            setShowDashboardModal(true);
          }}
          listings={listings}
          listingMeta={listingMeta}
          onUpdateListingModeration={(listingId, status, note, verifyPhotos) => {
            setListingMeta((prev) => {
              const cur = prev[listingId] || {
                moderationStatus: 'published' as AdModerationStatus,
                views: 250,
                contactClicks: 14,
                chatClicks: 7,
                expiryDays: 29,
              };
              return {
                ...prev,
                [listingId]: {
                  ...cur,
                  moderationStatus: status,
                  moderationNote: note,
                },
              };
            });
            if (verifyPhotos) {
              setListings((prev) =>
                prev.map((l) =>
                  l.id === listingId ? { ...l, isVerifiedPhotos: true } : l
                )
              );
            }
            triggerToast('وضعیت ممیزی آگهی توسط ناظر به‌روزرسانی شد');
          }}
          onDeleteAnyListing={(listingId) => handleDeleteUserAd(listingId, 'حذف توسط مدیر ارشد')}
          platformUsers={platformUsers}
          onChangePlatformUserRole={(userId, role) => {
            setPlatformUsers((prev) =>
              prev.map((u) => (u.id === userId ? { ...u, role } : u))
            );
            triggerToast(`نقش کاربر به «${getRoleMeta(role).shortTitle}» تغییر یافت`);
          }}
          onTogglePlatformUserBan={(userId) => {
            setPlatformUsers((prev) =>
              prev.map((u) =>
                u.id === userId
                  ? { ...u, status: u.status === 'فعال' ? 'مسدود موقت' : 'فعال' }
                  : u
              )
            );
            triggerToast('وضعیت دسترسی کاربر تغییر یافت');
          }}
          adReports={adReports}
          onResolveAdReport={(reportId, status) => {
            setAdReports((prev) =>
              prev.map((r) => (r.id === reportId ? { ...r, status } : r))
            );
            triggerToast('وضعیت گزارش تخلف به‌روزرسانی شد');
          }}
          supportTickets={supportTickets}
          onReplySupportTicket={(ticketId, replyText, newStatus) => {
            const nowTime = new Date().toLocaleTimeString('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            setSupportTickets((prev) =>
              prev.map((t) =>
                t.id === ticketId
                  ? {
                      ...t,
                      status: newStatus || t.status,
                      messages: [
                        ...t.messages,
                        { sender: 'support', text: replyText, time: nowTime },
                      ],
                    }
                  : t
              )
            );
            triggerToast('پاسخ تیکت در کارتابل پشتیبانی ثبت شد');
          }}
          installmentRequests={installmentRequests}
          onUpdateInstallmentStatus={(reqId, status) => {
            setInstallmentRequests((prev) =>
              prev.map((r) => (r.id === reqId ? { ...r, status } : r))
            );
            triggerToast('وضعیت پرونده تسهیلات ۵۰/۵۰ به‌روزرسانی شد');
          }}
          tariffs={tariffs}
          onUpdateTariffs={(partial) => {
            setTariffs((prev) => ({ ...prev, ...partial }));
            triggerToast('تعرفه‌های سامانه به‌روزرسانی شد');
          }}
          aiConfig={aiConfig}
          onUpdateAiConfig={(partial) => {
            setAiConfig((prev) => {
              const next = { ...prev, ...partial };
              persistSafe('tahator_ai_config', next);
              return next;
            });
            triggerToast('تنظیمات موتور هوش مصنوعی آفلاین به‌روزرسانی شد');
          }}
          onSelectListing={handleSelectListing}
          onClose={() => setShowRolePanelModal(false)}
        />
      )}

      {/* Offline AI Assistant & Comparator Modal */}
      {showAiModal && (
        <AiAssistantModal
          allListings={listings}
          initialTab={aiModalTab}
          initialListingAId={aiCompareListingId}
          onSelectListing={handleSelectListing}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal
          onClose={() => setShowSupportModal(false)}
          onOpenAdminChat={() => handleOpenChatWith(undefined, true)}
          onSubmitTicket={(subject, category, text) => {
            const newTicket: SupportTicket = {
              id: `tkt-${Date.now()}`,
              subject,
              userName: userProfile.name,
              userPhone: userProfile.phone,
              category,
              priority: 'عادی',
              status: 'باز',
              createdAt: 'لحظاتی پیش',
              messages: [{ sender: 'user', text, time: 'الان' }],
            };
            setSupportTickets((prev) => [newTicket, ...prev]);
            triggerToast('تیکت شما در کارتابل پشتیبانی ثبت شد');
          }}
        />
      )}

      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-[6px] bg-[#2a2a30] text-white text-[13px] font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
