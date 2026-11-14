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
} from 'lucide-react';
import { POPULAR_SEARCHES, toPersianDigits } from '@/data/mockData';
import { ROLE_META, UserRole } from '@/types/platform';

interface NavbarProps {
  selectedCities: string[];
  onOpenCityModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (cat: string | null, sub?: string | null) => void;
  onOpenCategoriesModal: () => void;
  onOpenPostAd: () => void;
  onOpenFacilities: () => void;
  onOpenInstallmentPlan: () => void;
  onOpenMyAds: () => void;
  onOpenAiAssistant: () => void;
  onOpenRolePanel: () => void;
  onOpenMobileSidebar: () => void;
  bookmarkCount: number;
  isLoggedIn: boolean;
  userName: string;
  userRole: UserRole;
}

export default function Navbar({
  selectedCities,
  onOpenCityModal,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenCategoriesModal,
  onOpenPostAd,
  onOpenFacilities,
  onOpenInstallmentPlan,
  onOpenMyAds,
  onOpenAiAssistant,
  onOpenRolePanel,
  onOpenMobileSidebar,
  bookmarkCount,
  isLoggedIn,
  userName,
  userRole,
}: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
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

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface-neutral-weaker)] border-b border-[var(--border-neutral-weaker)]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 h-[64px] flex items-center justify-between gap-2">
        {/* Right side (Start in RTL): Brand Logo + Categories + Search + City */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden kt-button--ghost !px-2"
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
            }}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-0.5 sm:pl-2 group cursor-pointer"
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
              <span className="text-[16px] sm:text-[19px] font-extrabold tracking-tight text-[var(--brand-primary)]">
                تهاتر آپ
              </span>
              <span className="hidden sm:block text-[10px] font-bold text-[var(--content-neutral-default)] mt-0.5">
                سایت تهاتر کالا
              </span>
            </div>
          </button>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-6 w-px bg-[var(--border-neutral-weaker)] mx-0.5" />

          {/* Exact tahator.app Categories Trigger: دسته‌بندی‌ها ▼ */}
          <button
            type="button"
            onClick={onOpenCategoriesModal}
            className="hidden md:inline-flex kt-button--ghost shrink-0 !px-2.5 text-[var(--content-neutral-stronger)]"
          >
            <span className="text-[14px]">دسته‌بندی‌ها</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--content-neutral-default)]" />
          </button>

          {/* Exact Search Input: جستجو در همه آگهی‌ها... */}
          <div className="relative flex-1 min-w-0 sm:min-w-[170px] max-w-[320px]" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-[17px] h-[17px] text-[var(--content-neutral-default)] absolute right-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="جستجو در همه آگهی‌ها..."
                className="w-full h-[40px] pr-9 pl-8 bg-[var(--surface-neutral-weak)] border border-transparent focus:border-[var(--border-neutral-weak)] focus:bg-[var(--surface-neutral-weaker)] rounded-[4px] text-[13px] sm:text-[14px] text-[var(--content-neutral-stronger)] placeholder:text-[var(--content-neutral-default)] focus:outline-none transition-all"
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
              <div className="absolute right-0 left-0 top-[46px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] rounded-[6px] shadow-lg p-3 z-50">
                <div className="text-[12px] font-medium text-[var(--content-neutral-default)] mb-2">
                  جستجوهای پرطرفدار تهاتر آپ:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        onSearchChange(term);
                        setSearchFocused(false);
                      }}
                      className="px-2.5 py-1 rounded-full text-[12px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[var(--content-neutral-stronger)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exact City Selector: 📍 انتخاب شهر */}
          <button
            type="button"
            onClick={onOpenCityModal}
            className="hidden sm:inline-flex kt-button--ghost shrink-0 !px-2 sm:!px-2.5"
          >
            <MapPin className="w-[17px] h-[17px] text-[var(--brand-primary)] shrink-0" />
            <span className="text-[13px] font-medium text-[var(--content-neutral-stronger)] max-w-[96px] truncate">
              {cityButtonLabel}
            </span>
          </button>
        </div>

        {/* Left side (End in RTL): Dashboard, AI Assistant, Role Center & Primary CTAs */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* هوش مصنوعی آفلاین ✨ */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="hidden md:inline-flex kt-button--outlined !h-[36px] !px-2.5 !border-[var(--brand-action)]/40 text-[var(--brand-primary)] hover:!bg-[var(--brand-soft)] text-[12px]"
            title="دستیار هوشمند آفلاین تهاتر آپ"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>هوش مصنوعی</span>
          </button>

          {/* مرکز نقش‌ها (کاربر، کسب‌وکار، ناظر، پشتیبان، مدیر ارشد) */}
          <button
            type="button"
            onClick={onOpenRolePanel}
            className="hidden lg:inline-flex kt-button--ghost !px-2 text-[12px]"
            title="تغییر نقش و مشاهده پنل‌های مدیریتی و پشتیبانی"
          >
            <Shield className="w-4 h-4 text-[var(--brand-action)]" />
            <span>نقش: {ROLE_META[userRole].shortTitle}</span>
          </button>

          {/* 📋 تهاتر من (داشبورد کامل کاربری) */}
          <button
            type="button"
            onClick={onOpenMyAds}
            className="hidden md:inline-flex kt-button--ghost !px-2.5 relative"
          >
            <ClipboardList className="w-4 h-4 text-[var(--content-neutral-default)]" />
            <span className="text-[13px]">{isLoggedIn ? userName : 'تهاتر من'}</span>
            {bookmarkCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold flex items-center justify-center">
                {toPersianDigits(bookmarkCount)}
              </span>
            )}
          </button>

          {/* + ثبت آگهی (Primary Red CTA) */}
          <button
            type="button"
            onClick={onOpenPostAd}
            className="kt-button--primary !px-3 sm:!px-4 text-[13px] sm:text-[14px] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت آگهی</span>
          </button>

          {/* تسهیلات */}
          <button
            type="button"
            onClick={onOpenFacilities}
            className="hidden sm:inline-flex kt-button--outlined !h-[38px] !px-2.5 text-[13px]"
            title="محاسبه آنلاین سود و قسط"
          >
            <Calculator className="w-4 h-4 text-[var(--brand-action)]" />
            <span>تسهیلات</span>
          </button>

          {/* اقساطی */}
          <button
            type="button"
            onClick={onOpenInstallmentPlan}
            className="hidden xl:inline-flex kt-button--outlined !h-[38px] !px-2.5 text-[13px]"
            title="شرایط خرید اقساطی و تهاتر"
          >
            <Percent className="w-4 h-4 text-[var(--brand-action)]" />
            <span>اقساطی</span>
          </button>
        </div>
      </div>
    </header>
  );
}
