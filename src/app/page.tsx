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
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar, { FilterState } from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import AdDetailModal from '@/components/AdDetailModal';
import {
  CategoriesModal,
  CityModal,
  PostAdModal,
  FacilitiesModal,
  InstallmentPlanModal,
  ChatModal,
  MyTahatorModal,
  SupportModal,
  ChatThread,
} from '@/components/Modals';
import {
  CATEGORIES,
  INITIAL_LISTINGS,
  Listing,
  toPersianDigits,
} from '@/data/mockData';

const DEFAULT_FILTERS: FilterState = {
  category: null,
  subcategory: null,
  neighborhood: '',
  minPrice: '',
  maxPrice: '',
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
  {
    id: 'seller-ad-2',
    title: 'مشاورین تهاتر غرب (آپارتمان ستارخان)',
    subtitle: 'آپارتمان ۵۰ متر شمال ستارخان معاوضه با خودرو',
    messages: [
      {
        id: 'm2',
        sender: 'other',
        text: 'سلام، واحد آماده بازدید است. اگر خودروی پیشنهادی برای معاوضه دارید مشخصات آن را بفرستید.',
        time: '۱۱:۳۰',
      },
    ],
  },
];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<'newest' | 'cheapest' | 'expensive'>('newest');
  const [cardLayout, setCardLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [remainingCount, setRemainingCount] = useState<number>(130);

  // Persisted user data
  const [bookmarks, setBookmarks] = useState<string[]>(['ad-1', 'ad-2']);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('admin-support');

  // Modal & drawer states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPostAdModal, setShowPostAdModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMyTahatorModal, setShowMyTahatorModal] = useState(false);
  const [myTahatorTab, setMyTahatorTab] = useState<'myAds' | 'bookmarks' | 'notes' | 'recent'>('myAds');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    try {
      const savedAds = localStorage.getItem('tahator_user_ads');
      if (savedAds) {
        const parsed = JSON.parse(savedAds) as Listing[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setListings([...parsed, ...INITIAL_LISTINGS]);
        }
      }
      const savedBookmarks = localStorage.getItem('tahator_bookmarks');
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      const savedNotes = localStorage.getItem('tahator_notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      const savedUser = localStorage.getItem('tahator_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedRecent = localStorage.getItem('tahator_recent');
      if (savedRecent) setRecentIds(JSON.parse(savedRecent));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [id, ...prev];
      try {
        localStorage.setItem('tahator_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      triggerToast(exists ? 'آگهی از نشان‌ها حذف شد' : 'آگهی به نشان‌ها اضافه شد');
      return next;
    });
  };

  const handleSaveNote = (id: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [id]: text };
      try {
        localStorage.setItem('tahator_notes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setRecentIds((prev) => {
      const next = [listing.id, ...prev.filter((id) => id !== listing.id)].slice(0, 12);
      try {
        localStorage.setItem('tahator_recent', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCreateListing = (newAd: Listing) => {
    setListings((prev) => {
      const next = [newAd, ...prev];
      const userOnly = next.filter((item) => item.isUserCreated);
      try {
        localStorage.setItem('tahator_user_ads', JSON.stringify(userOnly));
      } catch {
        // ignore
      }
      return next;
    });
    if (selectedCities.length > 0 && !selectedCities.includes(newAd.city)) {
      setSelectedCities((prev) => [...prev, newAd.city]);
    }
    triggerToast('آگهی شما با موفقیت در تهاتر آپ ثبت و منتشر شد!');
  };

  const handleDeleteUserAd = (id: string) => {
    setListings((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const userOnly = next.filter((item) => item.isUserCreated);
      try {
        localStorage.setItem('tahator_user_ads', JSON.stringify(userOnly));
      } catch {
        // ignore
      }
      return next;
    });
    triggerToast('آگهی با موفقیت حذف شد');
  };

  const handleLadderAd = (id: string) => {
    setListings((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      const updated = { ...target, badge: 'نردبان شده' as const, publishedAt: 'لحظاتی پیش' };
      return [updated, ...prev.filter((i) => i.id !== id)];
    });
    triggerToast('آگهی شما نردبان شد و در صدر فهرست قرار گرفت');
  };

  const handleLoadMore = () => {
    if (remainingCount <= 0) return;
    const batchCount = Math.min(6, remainingCount);
    const nextBatch: Listing[] = INITIAL_LISTINGS.slice(0, batchCount).map((item, idx) => ({
      ...item,
      id: `more-${listings.length + idx}`,
      code: `TH-${listings.length + idx + 1}`,
      publishedAt: '۱۴۰۵/۸/۱۹',
      timeCategory: '3months',
    }));
    setListings((prev) => [...prev, ...nextBatch]);
    setRemainingCount((prev) => Math.max(0, prev - batchCount));
    triggerToast(`${toPersianDigits(batchCount)} آگهی بیشتر نمایش داده شد`);
  };

  const handleOpenChatWith = (listing?: Listing, isAdmin = false) => {
    if (isAdmin || !listing) {
      setActiveThreadId('admin-support');
      setShowChatModal(true);
      return;
    }

    const threadId = `seller-${listing.id}`;
    setThreads((prev) => {
      if (prev.some((t) => t.id === threadId)) return prev;
      return [
        {
          id: threadId,
          title: `${listing.sellerName} (${listing.neighborhood})`,
          subtitle: listing.title,
          messages: [
            {
              id: `init-${Date.now()}`,
              sender: 'other',
              text: `سلام! آگهی «${listing.title}» موجود است. سوال یا پیشنهاد معاوضه‌ای دارید در خدمتم.`,
              time: 'الان',
            },
          ],
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
                    text: t.isAdmin
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

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const exQ = filters.exchangeKeyword.trim().toLowerCase();
    const minP = filters.minPrice ? Number(filters.minPrice) : null;
    const maxP = filters.maxPrice ? Number(filters.maxPrice) : null;

    const list = listings.filter((item) => {
      if (selectedCities.length > 0 && !selectedCities.includes(item.city)) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.subcategory && item.subcategory !== filters.subcategory) return false;
      if (filters.neighborhood && item.neighborhood !== filters.neighborhood) return false;

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

  const cityStatusText =
    selectedCities.length === 0
      ? 'هیچ شهری انتخاب نشده'
      : selectedCities.join('، ');

  const bookmarkedAds = useMemo(
    () => listings.filter((l) => bookmarks.includes(l.id)),
    [listings, bookmarks]
  );

  const myAds = useMemo(() => listings.filter((l) => l.isUserCreated), [listings]);

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
        onSelectCategory={(cat, sub = null) =>
          updateFilters({ category: cat, subcategory: sub || null })
        }
        onOpenCategoriesModal={() => setShowCategoriesModal(true)}
        onOpenPostAd={() => setShowPostAdModal(true)}
        onOpenFacilities={() => setShowFacilitiesModal(true)}
        onOpenInstallmentPlan={() => setShowInstallmentModal(true)}
        onOpenMyAds={() => {
          setMyTahatorTab('myAds');
          setShowMyTahatorModal(true);
        }}
        onOpenRegister={() => {
          setMyTahatorTab('myAds');
          setShowMyTahatorModal(true);
        }}
        onOpenMobileSidebar={() => setShowMobileSidebar(true)}
        bookmarkCount={bookmarks.length}
        user={user}
      />

      {/* Mobile Quick Category & Filter Strip */}
      <div className="lg:hidden border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setShowMobileSidebar(true)}
          className="shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>فیلترها</span>
        </button>
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
          className="shrink-0 h-[32px] px-3 rounded-full border border-[var(--border-neutral-weaker)] text-[12px] font-medium flex items-center gap-1"
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
            className={`shrink-0 h-[32px] px-3 rounded-full border text-[12px] transition-colors ${
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
                filters.neighborhood ||
                filters.onlyExchange ||
                filters.withPhoto ||
                filters.minPrice ||
                filters.maxPrice ||
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
                  {filters.neighborhood && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--surface-neutral-weak)] text-[12px]">
                      <span>محله: {filters.neighborhood}</span>
                      <button
                        type="button"
                        onClick={() => updateFilters({ neighborhood: '' })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
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
                </div>
              )}
            </div>

            {/* Sort & Card Layout Switcher */}
            <div className="flex items-center gap-2 shrink-0">
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

          {/* 3-Column Listing Grid */}
          {filteredListings.length === 0 ? (
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
                {filteredListings.map((item) => (
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

              {/* Load More Button — Verbatim tahator.app */}
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

      {/* Mobile Bottom Navigation Bar — Verbatim tahator.app 5 Tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[62px] bg-[var(--surface-neutral-weaker)] border-t border-[var(--border-neutral-weaker)] flex items-center justify-around px-2">
        <button
          type="button"
          onClick={() => {
            setFilters(DEFAULT_FILTERS);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--brand-primary)] font-bold"
        >
          <Home className="w-5 h-5" />
          <span>آگهی‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMyTahatorTab('bookmarks');
            setShowMyTahatorModal(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--content-neutral-default)]"
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
            setMyTahatorTab('myAds');
            setShowMyTahatorModal(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--content-neutral-default)]"
        >
          <User className="w-5 h-5" />
          <span>تهاتر من</span>
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

      {/* Full Categories Modal (📂 همه آگهی‌ها) */}
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
        />
      )}

      {/* My Tahator Modal */}
      {showMyTahatorModal && (
        <MyTahatorModal
          initialTab={myTahatorTab}
          user={user}
          onLogin={(u) => {
            setUser(u);
            try {
              localStorage.setItem('tahator_user', JSON.stringify(u));
            } catch {
              // ignore
            }
            triggerToast('ورود به حساب تهاتر آپ با موفقیت انجام شد');
          }}
          onLogout={() => {
            setUser(null);
            try {
              localStorage.removeItem('tahator_user');
            } catch {
              // ignore
            }
          }}
          myAds={myAds}
          bookmarkedAds={bookmarkedAds}
          recentAds={recentAds}
          notes={notes}
          onDeleteAd={handleDeleteUserAd}
          onLadderAd={handleLadderAd}
          onSelectListing={handleSelectListing}
          onClose={() => setShowMyTahatorModal(false)}
        />
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal
          onClose={() => setShowSupportModal(false)}
          onOpenAdminChat={() => handleOpenChatWith(undefined, true)}
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
