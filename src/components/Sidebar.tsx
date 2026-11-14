'use client';

import React from 'react';
import {
  ChevronRight,
  Phone,
  ShieldCheck,
  Award,
  CheckCircle2,
  Send,
  Instagram,
  Twitter,
  MessageCircle,
  Headphones,
} from 'lucide-react';
import {
  CATEGORIES,
  CITIES,
  TEHRAN_NEIGHBORHOODS,
  toPersianDigits,
} from '@/data/mockData';

export interface FilterState {
  category: string | null;
  subcategory: string | null;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  withPhoto: boolean;
  onlyExchange: boolean;
  onlyInstallment: boolean;
  onlyUrgent: boolean;
  onlyVerifiedPhotos: boolean;
  exchangeKeyword: string;
  timeFilter: 'all' | '24h' | 'week' | 'month' | '3months';
}

interface SidebarProps {
  filters: FilterState;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onApplyFilters?: () => void;
  onResetFilters: () => void;
  selectedCities: string[];
  onOpenSupport: () => void;
  onOpenAdminChat: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export default function Sidebar({
  filters,
  onUpdateFilters,
  onApplyFilters,
  onResetFilters,
  selectedCities,
  onOpenSupport,
  onOpenAdminChat,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: SidebarProps) {
  const sidebarCategories = CATEGORIES.filter((c) => c.showInSidebar);
  const activeCategoryObj = CATEGORIES.find((c) => c.name === filters.category);

  // Neighborhood list: Tehran's exact 20 neighborhoods from tahator.app by default,
  // or city-specific neighborhoods when a single non-Tehran city is selected.
  const activeCityObj =
    selectedCities.length === 1
      ? CITIES.find((c) => c.name === selectedCities[0])
      : null;
  const neighborhoods = activeCityObj
    ? activeCityObj.neighborhoods
    : TEHRAN_NEIGHBORHOODS;

  return (
    <aside
      role="complementary"
      className={
        isMobileDrawer
          ? 'w-full p-4 bg-[var(--surface-neutral-weaker)]'
          : 'w-[252px] shrink-0 hidden lg:block sticky top-[80px] self-start max-h-[calc(100vh-96px)] overflow-y-auto pl-2 pb-8'
      }
    >
      {/* Categories Section — Verbatim tahator.app Sidebar */}
      <div className="pb-4 border-b border-[var(--border-neutral-weaker)]">
        <h2 className="text-[14px] font-bold text-[var(--content-neutral-stronger)] mb-2.5">
          دسته‌بندی‌ها
        </h2>

        {!activeCategoryObj ? (
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  onUpdateFilters({ category: null, subcategory: null });
                  onCloseMobileDrawer?.();
                }}
                className={`w-full h-[38px] px-2.5 rounded-[4px] flex items-center gap-2 text-[14px] transition-colors ${
                  !filters.category
                    ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                    : 'text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)]'
                }`}
              >
                <span>📋 · همه آگهی‌ها</span>
              </button>
            </li>
            {sidebarCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFilters({ category: cat.name, subcategory: null });
                    onCloseMobileDrawer?.();
                  }}
                  className="w-full h-[38px] px-2.5 rounded-[4px] flex items-center gap-2 text-[14px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)] transition-colors"
                >
                  <span>
                    {cat.emoji} · {cat.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onUpdateFilters({ category: null, subcategory: null })}
              className="w-full h-[36px] px-2 rounded-[4px] flex items-center gap-1.5 text-[13px] text-[var(--content-neutral-default)] hover:bg-[var(--surface-neutral-weak)] hover:text-[var(--content-neutral-stronger)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>📋 · همه آگهی‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateFilters({ subcategory: null })}
              className={`w-full h-[38px] px-2.5 rounded-[4px] flex items-center gap-2 text-[14px] font-bold transition-colors ${
                !filters.subcategory
                  ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                  : 'text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)]'
              }`}
            >
              <span>
                {activeCategoryObj.emoji} · {activeCategoryObj.name}
              </span>
            </button>

            <ul className="pr-5 space-y-0.5 border-r border-[var(--border-neutral-weaker)] mr-3">
              {activeCategoryObj.subcategories.map((sub) => (
                <li key={sub}>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateFilters({ subcategory: sub });
                      onCloseMobileDrawer?.();
                    }}
                    className={`w-full text-right py-1.5 px-2.5 rounded-[4px] text-[13px] transition-colors ${
                      filters.subcategory === sub
                        ? 'text-[var(--brand-primary)] font-bold bg-[var(--brand-soft)]'
                        : 'text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-weak)]'
                    }`}
                  >
                    {sub}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 📍 انتخاب محله */}
      <div className="py-3.5 border-b border-[var(--border-neutral-weaker)]">
        <label className="block text-[13px] font-bold text-[var(--content-neutral-stronger)] mb-2">
          📍 انتخاب محله
        </label>
        <select
          value={filters.neighborhood}
          onChange={(e) => onUpdateFilters({ neighborhood: e.target.value })}
          className="kt-input !h-[38px] text-[13px]"
        >
          <option value="">همه محله‌ها</option>
          {neighborhoods.map((nb) => (
            <option key={nb} value={nb}>
              {nb}
            </option>
          ))}
        </select>
      </div>

      {/* 💰 فیلتر قیمت (تومان) */}
      <div className="py-3.5 border-b border-[var(--border-neutral-weaker)] space-y-2.5">
        <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
          💰 فیلتر قیمت (تومان)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="از"
            value={filters.minPrice}
            onChange={(e) => onUpdateFilters({ minPrice: e.target.value })}
            className="kt-input !h-[38px] text-[13px]"
          />
          <span className="text-[12px] text-[var(--content-neutral-default)] shrink-0">
            تومان
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="تا"
            value={filters.maxPrice}
            onChange={(e) => onUpdateFilters({ maxPrice: e.target.value })}
            className="kt-input !h-[38px] text-[13px]"
          />
          <span className="text-[12px] text-[var(--content-neutral-default)] shrink-0">
            تومان
          </span>
        </div>
      </div>

      {/* 📷 فقط آگهی‌های عکس‌دار */}
      <div className="py-3.5 border-b border-[var(--border-neutral-weaker)] space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.withPhoto}
            onChange={(e) => onUpdateFilters({ withPhoto: e.target.checked })}
            className="accent-[var(--brand-action)] w-4 h-4 rounded"
          />
          <span className="text-[13px] font-medium text-[var(--content-neutral-stronger)]">
            📷 فقط آگهی‌های عکس‌دار
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onlyExchange}
            onChange={(e) => onUpdateFilters({ onlyExchange: e.target.checked })}
            className="accent-[var(--brand-action)] w-4 h-4 rounded"
          />
          <span className="text-[13px] font-medium text-[var(--content-neutral-stronger)]">
            فقط دارای امکان معاوضه
          </span>
        </label>
      </div>

      {/* ⏰ زمان انتشار */}
      <div className="py-3.5 border-b border-[var(--border-neutral-weaker)]">
        <label className="block text-[13px] font-bold text-[var(--content-neutral-stronger)] mb-2">
          ⏰ زمان انتشار
        </label>
        <select
          value={filters.timeFilter}
          onChange={(e) =>
            onUpdateFilters({
              timeFilter: e.target.value as FilterState['timeFilter'],
            })
          }
          className="kt-input !h-[38px] text-[13px]"
        >
          <option value="all">همه زمان‌ها</option>
          <option value="24h">۲۴ ساعت گذشته</option>
          <option value="week">یک هفته گذشته</option>
          <option value="month">یک ماه گذشته</option>
          <option value="3months">سه ماه گذشته</option>
        </select>
      </div>

      {/* Filter Action Buttons */}
      <div className="py-3.5 border-b border-[var(--border-neutral-weaker)] space-y-2">
        <button
          type="button"
          onClick={() => {
            onApplyFilters?.();
            onCloseMobileDrawer?.();
          }}
          className="kt-button--primary w-full !h-[38px] text-[13px]"
        >
          اعمال فیلترها
        </button>
        <button
          type="button"
          onClick={() => {
            onResetFilters();
            onCloseMobileDrawer?.();
          }}
          className="kt-button--outlined w-full !h-[38px] text-[13px]"
        >
          پاک کردن فیلترها
        </button>
      </div>

      {/* Social & Support Section — Verbatim tahator.app */}
      <div className="pt-4 space-y-3.5">
        <div>
          <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)] mb-2">
            ما را دنبال کنید
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://t.me/tehatrup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[34px] rounded-[4px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] hover:bg-[var(--brand-soft)] flex items-center justify-center gap-1 text-[11px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
              title="تلگرام تهاتر آپ"
            >
              <Send className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>تلگرام</span>
            </a>
            <a
              href="https://instagram.com/tehatrup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[34px] rounded-[4px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] hover:bg-[var(--brand-soft)] flex items-center justify-center gap-1 text-[11px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
              title="اینستاگرام تهاتر آپ"
            >
              <Instagram className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>اینستا</span>
            </a>
            <a
              href="https://twitter.com/tehatrup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[34px] rounded-[4px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] hover:bg-[var(--brand-soft)] flex items-center justify-center gap-1 text-[11px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
              title="توییتر تهاتر آپ"
            >
              <Twitter className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>توییتر</span>
            </a>
          </div>
        </div>

        {/* Support / WhatsApp / Contact Us */}
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={onOpenSupport}
            className="py-2 px-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[var(--content-neutral-stronger)] flex flex-col items-center gap-1 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>پشتیبانی</span>
          </button>
          <button
            type="button"
            onClick={onOpenAdminChat}
            className="py-2 px-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[var(--content-neutral-stronger)] flex flex-col items-center gap-1 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
            <span>واتساپ</span>
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="py-2 px-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[var(--content-neutral-stronger)] flex flex-col items-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>تماس با ما</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full py-2 px-3 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[12px] text-[var(--content-neutral-stronger)] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-[var(--brand-action)]" />
            <span>تماس با ما:</span>
          </span>
          <span className="font-bold dir-ltr">{toPersianDigits('02191016487')}</span>
        </button>

        {/* 3 Framed Trust Seals */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-[60px] border border-[var(--border-neutral-weaker)] rounded-[4px] flex flex-col items-center justify-center p-1 text-center bg-[var(--surface-neutral-subtle)]">
            <ShieldCheck className="w-4 h-4 text-[var(--semantic-info)] mb-1" />
            <span className="text-[10px] font-medium text-[var(--content-neutral-default)] leading-tight">
              نماد اعتماد
            </span>
          </div>
          <div className="h-[60px] border border-[var(--border-neutral-weaker)] rounded-[4px] flex flex-col items-center justify-center p-1 text-center bg-[var(--surface-neutral-subtle)]">
            <Award className="w-4 h-4 text-[var(--semantic-warning)] mb-1" />
            <span className="text-[10px] font-medium text-[var(--content-neutral-default)] leading-tight">
              کسب‌وکار مجازی
            </span>
          </div>
          <div className="h-[60px] border border-[var(--border-neutral-weaker)] rounded-[4px] flex flex-col items-center justify-center p-1 text-center bg-[var(--surface-neutral-subtle)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--semantic-positive)] mb-1" />
            <span className="text-[10px] font-medium text-[var(--content-neutral-default)] leading-tight">
              ساماندهی
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--content-neutral-default)] pt-1">
          © ۱۴۰۵ تهاتر آپ (tahator.app)
        </p>
      </div>
    </aside>
  );
}
