'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Search,
  X,
  Plus,
  Calculator,
  Percent,
  Menu,
  ClipboardList,
  Sparkles,
  Shield,
  Clock,
  ArrowUpLeft,
  LogIn,
  Star,
  Bookmark,
  ShieldAlert,
  Settings,
  LogOut,
  UserCheck,
  Package,
  ArrowLeftRight,
  Wallet,
  LayoutDashboard,
  ChevronLeft,
  User,
} from 'lucide-react';
import {
  CATEGORIES,
  Listing,
  POPULAR_SEARCHES,
  formatToman,
  toPersianDigits,
} from '@/data/mockData';
import { DashboardTab, UserRole, getRoleMeta } from '@/types/platform';

interface NavbarProps {
  selectedCities: string[];
  onOpenCityModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory?: string | null;
  allListings?: Listing[];
  recentSearches?: string[];
  onRecordSearch?: (term: string) => void;
  onSelectListing?: (listing: Listing) => void;
  onSelectCategory: (cat: string | null, sub?: string | null) => void;
  onLogoClick?: () => void;
  onOpenCategoriesModal: () => void;
  onOpenPostAd: () => void;
  onOpenFacilities: () => void;
  onOpenInstallmentPlan: () => void;
  onOpenDashboardTab: (tab: DashboardTab) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenAiAssistant: () => void;
  onOpenRolePanel: () => void;
  onOpenMobileSidebar: () => void;
  bookmarkCount: number;
  isLoggedIn: boolean;
  userName: string;
  userPhone?: string;
  userRole: UserRole;
  walletBalance?: number;
  unreadNotifications?: number;
  pendingOffersCount?: number;
}

export default function Navbar({
  selectedCities,
  onOpenCityModal,
  searchQuery,
  onSearchChange,
  activeCategory = null,
  allListings = [],
  recentSearches = [],
  onRecordSearch,
  onSelectListing,
  onSelectCategory,
  onLogoClick,
  onOpenCategoriesModal,
  onOpenPostAd,
  onOpenFacilities,
  onOpenInstallmentPlan,
  onOpenDashboardTab,
  onOpenAuthModal,
  onLogout,
  onOpenAiAssistant,
  onOpenRolePanel,
  onOpenMobileSidebar,
  bookmarkCount,
  isLoggedIn,
  userName,
  userPhone = '',
  userRole,
  walletBalance = 0,
  unreadNotifications = 0,
  pendingOffersCount = 0,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cityButtonLabel =
    selectedCities.length === 0
      ? 'انتخاب شهر'
      : selectedCities.length === 1
      ? selectedCities[0]
      : `${toPersianDigits(selectedCities.length)} شهر`;

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const autocompleteMatches = React.useMemo(() => {
    if (!trimmedQuery || allListings.length === 0) return { byCategory: [], matchingAds: [], total: 0 };
    const matchingAds = allListings.filter((item) =>
      `${item.title} ${item.description} ${item.category} ${item.subcategory} ${item.neighborhood} ${item.city} ${item.exchangeWith || ''}`
        .toLowerCase()
        .includes(trimmedQuery)
    );
    const catCounts = new Map<string, number>();
    matchingAds.forEach((ad) => {
      catCounts.set(ad.category, (catCounts.get(ad.category) || 0) + 1);
    });
    const byCategory = Array.from(catCounts.entries())
      .map(([category, count]) => ({
        category,
        emoji: CATEGORIES.find((c) => c.name === category)?.emoji || '📋',
        count,
      }))
      .slice(0, 4);

    return {
      byCategory,
      matchingAds: matchingAds.slice(0, 3),
      total: matchingAds.length,
    };
  }, [allListings, trimmedQuery]);

  const searchPlaceholder = activeCategory
    ? `جستجو در ${activeCategory}...`
    : 'جستجو در همه آگهی‌ها...';

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface-neutral-weaker)] border-b border-[var(--border-neutral-weaker)]">
      <div className="max-w-[1440px] mx-auto px-2.5 sm:px-4 h-[64px] flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Right side (Start in RTL): Brand Logo + Categories + Search + City */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {/* Mobile & Tablet Filter Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden kt-button--ghost !px-2 shrink-0"
            aria-label="فیلترها و دسته‌بندی‌ها"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo: تهاتر آپ with Classic Red #A62626 Styling */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null, null);
              onSearchChange('');
              onLogoClick?.();
            }}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-0.5 sm:pl-1.5 group cursor-pointer"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 transition-transform group-hover:scale-105"
            >
              <rect width="36" height="36" rx="6" fill="var(--brand-primary)" />
              <path
                d="M10.5 13.5H23M23 13.5L19.5 10M23 13.5L19.5 17"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25.5 22.5H13M13 22.5L16.5 19M13 22.5L16.5 26"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[15px] sm:text-[18px] xl:text-[19px] font-extrabold tracking-tight text-[var(--brand-primary)] whitespace-nowrap">
                تهاتر آپ
              </span>
              <span className="hidden xl:block text-[10px] font-bold text-[var(--content-neutral-default)] mt-0.5 whitespace-nowrap">
                سایت تهاتر کالا
              </span>
            </div>
          </button>

          {/* Vertical Divider */}
          <div className="hidden xl:block h-6 w-px bg-[var(--border-neutral-weaker)] mx-0.5" />

          {/* Exact tahator.app Categories Trigger: دسته‌بندی‌ها ▼ */}
          <button
            type="button"
            onClick={onOpenCategoriesModal}
            className="hidden xl:inline-flex kt-button--ghost shrink-0 !px-2 text-[var(--content-neutral-stronger)]"
          >
            <span className="text-[14px]">دسته‌بندی‌ها</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--content-neutral-default)]" />
          </button>

          {/* Exact City Selector: 📍 انتخاب شهر */}
          <button
            type="button"
            onClick={onOpenCityModal}
            className="hidden sm:inline-flex kt-button--ghost shrink-0 !px-2"
          >
            <MapPin className="w-[17px] h-[17px] text-[var(--brand-primary)] shrink-0" />
            <span className="text-[13px] font-medium text-[var(--content-neutral-stronger)] max-w-[88px] truncate">
              {cityButtonLabel}
            </span>
          </button>

          {/* Dynamic Search Input with Scoped Autocomplete */}
          <div className="relative flex-1 min-w-0 max-w-[360px]" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-[16px] h-[16px] text-[var(--content-neutral-default)] absolute right-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onRecordSearch?.(searchQuery.trim());
                    setSearchFocused(false);
                  }
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder={searchPlaceholder}
                className="w-full h-[38px] sm:h-[40px] pr-9 pl-8 bg-[var(--surface-neutral-weak)] border border-transparent focus:border-[var(--border-neutral-weak)] focus:bg-[var(--surface-neutral-weaker)] rounded-[4px] text-[12px] sm:text-[13px] text-[var(--content-neutral-stronger)] placeholder:text-[var(--content-neutral-default)] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]"
                  aria-label="پاک کردن جستجو"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchFocused && (
              <div className="fixed sm:absolute right-2 left-2 sm:right-0 sm:left-0 top-[66px] sm:top-[46px] sm:min-w-[310px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] rounded-[8px] shadow-xl p-3 z-50 space-y-3 max-h-[70vh] overflow-y-auto">
                {trimmedQuery.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onRecordSearch?.(searchQuery.trim());
                        setSearchFocused(false);
                      }}
                      className="w-full p-2 rounded-[6px] hover:bg-[var(--surface-neutral-weak)] flex items-center justify-between text-[13px] font-bold text-[var(--content-neutral-stronger)]"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Search className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span className="truncate">جستجوی «{searchQuery.trim()}»</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] shrink-0">
                        {toPersianDigits(autocompleteMatches.total)} آگهی
                      </span>
                    </button>

                    {autocompleteMatches.byCategory.length > 0 && (
                      <div className="border-t border-[var(--border-neutral-weaker)] pt-2 space-y-1">
                        <div className="text-[11px] font-bold text-[var(--content-neutral-default)] px-1">
                          پیشنهاد بر اساس دسته‌بندی:
                        </div>
                        {autocompleteMatches.byCategory.map((c) => (
                          <button
                            key={c.category}
                            type="button"
                            onClick={() => {
                              onSelectCategory(c.category, null);
                              onRecordSearch?.(searchQuery.trim());
                              setSearchFocused(false);
                            }}
                            className="w-full px-2 py-1.5 rounded-[6px] hover:bg-[var(--surface-neutral-weak)] flex items-center justify-between text-[12px]"
                          >
                            <span>
                              {c.emoji} در دسته <strong className="text-[var(--brand-primary)]">{c.category}</strong>
                            </span>
                            <span className="text-[11px] text-[var(--content-neutral-default)]">
                              {toPersianDigits(c.count)} آگهی
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {autocompleteMatches.matchingAds.length > 0 && onSelectListing && (
                      <div className="border-t border-[var(--border-neutral-weaker)] pt-2 space-y-1.5">
                        <div className="text-[11px] font-bold text-[var(--content-neutral-default)] px-1">
                          نتایج مستقیم:
                        </div>
                        {autocompleteMatches.matchingAds.map((ad) => (
                          <button
                            key={ad.id}
                            type="button"
                            onClick={() => {
                              onRecordSearch?.(searchQuery.trim());
                              setSearchFocused(false);
                              onSelectListing(ad);
                            }}
                            className="w-full p-1.5 rounded-[6px] hover:bg-[var(--surface-neutral-weak)] flex items-center gap-2 text-right"
                          >
                            <img
                              src={ad.images[0] || '/ads/fake-1.svg'}
                              alt={ad.title}
                              className="w-9 h-9 rounded-[4px] object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px] font-medium truncate">{ad.title}</div>
                              <div className="text-[11px] text-[var(--content-neutral-default)]">
                                {ad.city} · {ad.neighborhood}
                              </div>
                            </div>
                            <ArrowUpLeft className="w-3.5 h-3.5 text-[var(--content-neutral-weak)] shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-[var(--content-neutral-default)] mb-1.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>جستجوهای اخیر شما:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                onSearchChange(term);
                                setSearchFocused(false);
                              }}
                              className="px-2.5 py-1 rounded-full text-[12px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[var(--content-neutral-stronger)]"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[12px] font-medium text-[var(--content-neutral-default)] mb-2">
                        بیشترین جستجوهای تهاتر آپ:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              onSearchChange(term);
                              onRecordSearch?.(term);
                              setSearchFocused(false);
                            }}
                            className="px-2.5 py-1 rounded-full text-[12px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[var(--content-neutral-stronger)] hover:text-[var(--brand-primary)] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Left side (End in RTL): Dashboard, AI Assistant, Role Center & Primary CTAs */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* هوش مصنوعی آفلاین ✨ */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="hidden md:inline-flex kt-button--outlined !h-[36px] !px-2.5 !border-[var(--brand-action)]/40 text-[var(--brand-primary)] hover:!bg-[var(--brand-soft)] text-[12px] shrink-0"
            title="دستیار هوشمند آفلاین تهاتر آپ"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">هوش مصنوعی</span>
          </button>

          {/* پنل همکار/مدیریت (فقط در صورت ورود با نقش غیرعادی نمایش داده می‌شود) */}
          {isLoggedIn && userRole !== 'user' && (
            <button
              type="button"
              onClick={onOpenRolePanel}
              className="hidden lg:inline-flex kt-button--ghost !px-2 text-[12px] shrink-0"
              title="مشاهده پنل اختصاصی"
            >
              <Shield className="w-4 h-4 text-[var(--brand-action)] shrink-0" />
              <span className="whitespace-nowrap">پنل {getRoleMeta(userRole).shortTitle}</span>
            </button>
          )}

          {/* 👤 تهاتر من (منوی کشویی پروفایل + ورود با موبایل) */}
          <div ref={userMenuRef} className="relative hidden md:block shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="inline-flex kt-button--ghost !px-2 relative shrink-0"
              aria-expanded={userMenuOpen}
            >
              <User className="w-4 h-4 text-[var(--content-neutral-default)] shrink-0" />
              <span className="text-[12px] lg:text-[13px] max-w-[100px] truncate">
                {isLoggedIn ? userName : 'تهاتر من'}
              </span>
              {unreadNotifications + pendingOffersCount > 0 && isLoggedIn ? (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-action)] text-white text-[10px] font-bold flex items-center justify-center">
                  {toPersianDigits(unreadNotifications + pendingOffersCount)}
                </span>
              ) : (
                bookmarkCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold flex items-center justify-center">
                    {toPersianDigits(bookmarkCount)}
                  </span>
                )
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--content-neutral-default)] shrink-0" />
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 top-[44px] w-[268px] bg-white rounded-[8px] shadow-2xl border border-[var(--border-neutral-weaker)] z-50 overflow-hidden py-1">
                {!isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full px-4 py-3 text-right flex items-center gap-2.5 hover:bg-[var(--semantic-positive-soft)]/50 border-b border-[var(--border-neutral-weaker)] transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-[var(--semantic-positive)] shrink-0" />
                      <div>
                        <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                          ورود به حساب کاربری
                        </div>
                        <div className="text-[11px] text-[var(--content-neutral-default)]">
                          با شماره موبایل و کد تایید آنی
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('business');
                      }}
                      className="w-full px-4 py-2.5 text-right text-[13px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] flex items-center gap-2.5 border-b border-[var(--border-neutral-weaker)]"
                    >
                      <Star className="w-4 h-4 text-[var(--content-neutral-default)]" />
                      <span>حساب کسب‌وکار تهاتر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('bookmarks');
                      }}
                      className="w-full px-4 py-2.5 text-right text-[13px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] flex items-center justify-between border-b border-[var(--border-neutral-weaker)]"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-[var(--content-neutral-default)]" />
                        <span>نشان‌ها</span>
                      </span>
                      {bookmarkCount > 0 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold">
                          {toPersianDigits(bookmarkCount)}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('recent');
                      }}
                      className="w-full px-4 py-2.5 text-right text-[13px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] flex items-center gap-2.5 border-b border-[var(--border-neutral-weaker)]"
                    >
                      <Clock className="w-4 h-4 text-[var(--content-neutral-default)]" />
                      <span>بازدیدهای اخیر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('safety');
                      }}
                      className="w-full px-4 py-2.5 text-right text-[13px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] flex items-center gap-2.5 border-b border-[var(--border-neutral-weaker)]"
                    >
                      <ShieldAlert className="w-4 h-4 text-[var(--content-neutral-default)]" />
                      <span>مقابله با مزاحمت و کلاهبرداری</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('settings');
                      }}
                      className="w-full px-4 py-2.5 text-right text-[13px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-[var(--content-neutral-default)]" />
                      <span>تنظیمات و حریم خصوصی</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboardTab('overview');
                      }}
                      className="w-full px-4 py-3 text-right hover:bg-[var(--surface-neutral-weak)] border-b border-[var(--border-neutral-weaker)] flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <User className="w-4 h-4 text-[var(--content-neutral-default)] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)] truncate flex items-center gap-1.5">
                            <span>{userName}</span>
                            {userRole !== 'user' && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[10px]">
                                {getRoleMeta(userRole).shortTitle}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] dir-ltr text-right mt-0.5">
                            {toPersianDigits(userPhone)}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-[var(--content-neutral-default)] shrink-0" />
                    </button>

                    {[
                      {
                        tab: 'business' as DashboardTab,
                        label: 'حساب کسب‌وکار تهاتر',
                        icon: Star,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'profile' as DashboardTab,
                        label: 'تأیید هویت',
                        icon: UserCheck,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'overview' as DashboardTab,
                        label: 'نمای کلی و تطبیق هوشمند',
                        icon: LayoutDashboard,
                        badge: unreadNotifications > 0 ? unreadNotifications : null,
                        hint: null,
                      },
                      {
                        tab: 'barterAssets' as DashboardTab,
                        label: 'دارایی‌های آماده تهاتر من',
                        icon: Package,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'barterOffers' as DashboardTab,
                        label: 'معاوضه‌ها و تفاهم‌نامه‌ها',
                        icon: ArrowLeftRight,
                        badge: pendingOffersCount > 0 ? pendingOffersCount : null,
                        hint: null,
                      },
                      {
                        tab: 'myAds' as DashboardTab,
                        label: 'آگهی‌های من',
                        icon: ClipboardList,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'wallet' as DashboardTab,
                        label: 'کیف‌پول و پرداخت‌ها',
                        icon: Wallet,
                        badge: null,
                        hint: formatToman(walletBalance),
                      },
                      {
                        tab: 'bookmarks' as DashboardTab,
                        label: 'نشان‌ها و یادداشت‌ها',
                        icon: Bookmark,
                        badge: bookmarkCount > 0 ? bookmarkCount : null,
                        hint: null,
                      },
                      {
                        tab: 'recent' as DashboardTab,
                        label: 'بازدیدهای اخیر',
                        icon: Clock,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'safety' as DashboardTab,
                        label: 'مقابله با مزاحمت و کلاهبرداری',
                        icon: ShieldAlert,
                        badge: null,
                        hint: null,
                      },
                      {
                        tab: 'settings' as DashboardTab,
                        label: 'تنظیمات',
                        icon: Settings,
                        badge: null,
                        hint: null,
                      },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <button
                          key={row.tab}
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenDashboardTab(row.tab);
                          }}
                          className="w-full px-4 py-2.5 text-right text-[12px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] border-b border-[var(--border-neutral-weaker)] flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-[var(--content-neutral-default)]" />
                            <span>{row.label}</span>
                          </span>
                          {row.badge !== null ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[10px] font-bold">
                              {toPersianDigits(row.badge)}
                            </span>
                          ) : row.hint ? (
                            <span className="text-[10px] text-[var(--content-neutral-default)]">
                              {row.hint}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-right text-[12px] text-[var(--semantic-negative)] hover:bg-[var(--brand-soft)] flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* + ثبت آگهی (Primary Red CTA) */}
          <button
            type="button"
            onClick={onOpenPostAd}
            className="kt-button--primary !h-[38px] !px-2.5 sm:!px-3.5 text-[12px] sm:text-[13px] shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>ثبت آگهی</span>
          </button>

          {/* تسهیلات */}
          <button
            type="button"
            onClick={onOpenFacilities}
            className="hidden lg:inline-flex kt-button--outlined !h-[38px] !px-2.5 text-[12px] shrink-0 whitespace-nowrap"
            title="محاسبه آنلاین سود و قسط"
          >
            <Calculator className="w-4 h-4 text-[var(--brand-action)] shrink-0" />
            <span>تسهیلات</span>
          </button>

          {/* اقساطی */}
          <button
            type="button"
            onClick={onOpenInstallmentPlan}
            className="hidden xl:inline-flex kt-button--outlined !h-[38px] !px-2.5 text-[12px] shrink-0 whitespace-nowrap"
            title="شرایط خرید اقساطی و تهاتر"
          >
            <Percent className="w-4 h-4 text-[var(--brand-action)] shrink-0" />
            <span>اقساطی</span>
          </button>
        </div>
      </div>
    </header>
  );
}
