'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ChevronDown,
  Phone,
  MessageSquare,
  Headphones,
  Bookmark,
  Share2,
  ArrowLeftRight,
  CheckCircle2,
  Percent,
  Copy,
  Check,
  Building,
  Car,
  Package,
  MapPin,
  Flag,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';

interface AdDetailModalProps {
  listing: Listing;
  allListings: Listing[];
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  note: string;
  onSaveNote: (id: string, note: string) => void;
  onClose: () => void;
  onOpenChatWith: (listing: Listing, isAdmin?: boolean) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenInstallmentPlan: () => void;
}

export default function AdDetailModal({
  listing,
  allListings,
  isBookmarked,
  onToggleBookmark,
  note,
  onSaveNote,
  onClose,
  onOpenChatWith,
  onSelectListing,
  onOpenInstallmentPlan,
}: AdDetailModalProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [fullscreenImg, setFullscreenImg] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [reported, setReported] = useState(false);

  const images =
    listing.images.length > 0
      ? listing.images
      : ['/ads/fake-2.svg'];

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(listing.sellerPhone).catch(() => {});
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleShare = () => {
    const shareText = `${listing.title} - ${window.location.origin}/?ad=${listing.id}`;
    navigator.clipboard?.writeText(shareText).catch(() => {});
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  // Smart Barter Matching: find other listings with hasExchange that match or complement price/category
  const barterMatches = useMemo(() => {
    if (!listing.hasExchange) return [];
    return allListings
      .filter((item) => item.id !== listing.id && item.hasExchange)
      .slice(0, 3);
  }, [allListings, listing]);

  const getAmenityIcon = (type: string, available: boolean) => {
    const cls = `w-5 h-5 ${
      available ? 'text-[var(--content-neutral-stronger)]' : 'text-[var(--content-neutral-weak)]'
    }`;
    switch (type) {
      case 'elevator':
        return <Building className={cls} strokeWidth={1.6} />;
      case 'parking':
        return <Car className={cls} strokeWidth={1.6} />;
      default:
        return <Package className={cls} strokeWidth={1.6} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto p-0 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1040px] bg-[var(--surface-neutral-weaker)] sm:rounded-[8px] shadow-2xl min-h-screen sm:min-h-0 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header with Breadcrumbs & Close */}
        <div className="sticky top-0 z-20 bg-[var(--surface-neutral-weaker)] border-b border-[var(--border-neutral-weaker)] px-4 sm:px-6 h-[56px] flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[var(--content-neutral-default)] overflow-x-auto whitespace-nowrap">
            <button type="button" onClick={onClose} className="hover:text-[var(--content-neutral-stronger)]">
              همهٔ آگهی‌ها
            </button>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-[var(--content-neutral-weak)]" />
            <span>{listing.category}</span>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-[var(--content-neutral-weak)]" />
            <span>{listing.subcategory}</span>
            <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-[var(--content-neutral-weak)]" />
            <span className="text-[var(--content-neutral-stronger)] font-medium truncate max-w-[200px] sm:max-w-[340px]">
              {listing.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center text-[var(--content-neutral-default)] shrink-0"
            aria-label="بستن جزئیات آگهی"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column Divar Detail Body */}
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Right Column (Content & Specs - ~58% -> 7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-bold leading-[36px] text-[var(--content-neutral-stronger)]">
                {listing.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[var(--content-neutral-default)]">
                <span>
                  {listing.publishedAt} در {listing.city}، {listing.neighborhood}
                </span>
                <span className="text-[var(--border-neutral-weak)]">•</span>
                <span className="text-[12px] px-2 py-0.5 rounded-[4px] bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]">
                  کد: {toPersianDigits(listing.code)}
                </span>
              </div>

              {/* Tahator Feature Badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.hasExchange && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[12px] font-bold">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>امکان معاوضه (تهاتر)</span>
                  </span>
                )}
                {listing.hasInstallmentPlan && (
                  <button
                    type="button"
                    onClick={onOpenInstallmentPlan}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[12px] font-bold hover:opacity-90"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>اقساط ۵۰/۵۰ تهاتر آپ</span>
                  </button>
                )}
                {listing.isVerifiedPhotos && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تصاویر تاییدشده مالک</span>
                  </span>
                )}
              </div>
            </div>

            {/* Divar Safety Warning Accordion */}
            <div className="border-y border-[var(--border-neutral-weaker)]">
              <button
                type="button"
                onClick={() => setShowSafetyTips((prev) => !prev)}
                className="w-full py-3.5 flex items-center justify-between text-[14px] text-[var(--content-neutral-stronger)] hover:bg-[var(--surface-neutral-subtle)] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-[var(--content-neutral-default)]" />
                  <span className="font-medium">زنگ خطرهای قبل از معامله</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--content-neutral-default)] transition-transform ${
                    showSafetyTips ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showSafetyTips && (
                <div className="pb-4 pr-7 text-[13px] leading-[24px] text-[var(--content-neutral-default)] space-y-1">
                  <p>• پیش از رویت حضوری کالا، ملک یا مدارک مالکیت، هیچ مبلغی به عنوان بیعانه پرداخت نکنید.</p>
                  <p>• در معاملات تهاتر، اصالت سند و قیمت کارشناسی دو طرف را با حضور کارشناس تایید کنید.</p>
                  <p>• از پرداخت وجه از طریق لینک‌های ناشناس خودداری کرده و تنها در چت امن تهاتر آپ گفتگو کنید.</p>
                </div>
              )}
            </div>

            {/* Action Buttons Row (اطلاعات تماس، چت، ادمین، نشان، اشتراک) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPhone((prev) => !prev)}
                  className="kt-button--primary !h-[42px] !px-5 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{showPhone ? listing.sellerPhone : 'اطلاعات تماس'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChatWith(listing, false)}
                  className="kt-button--outlined !h-[42px] !px-5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>چت</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChatWith(listing, true)}
                  className="kt-button--outlined !h-[42px] !px-3.5 !border-[var(--brand-action)]/40 text-[var(--brand-primary)] hover:!bg-[var(--brand-soft)]"
                  title="مشاوره و کارشناسی تهاتر با ادمین سایت"
                >
                  <Headphones className="w-4 h-4" />
                  <span>گفتگو با ادمین</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleBookmark(listing.id)}
                  className="w-10 h-10 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center text-[var(--content-neutral-default)]"
                  title="نشان کردن آگهی"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      isBookmarked
                        ? 'fill-[var(--brand-action)] text-[var(--brand-action)]'
                        : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center text-[var(--content-neutral-default)] relative"
                  title="اشتراک‌گذاری"
                >
                  {copiedShare ? (
                    <Check className="w-5 h-5 text-[var(--semantic-positive)]" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Revealed Seller Contact Card */}
            {showPhone && (
              <div className="p-3.5 rounded-[6px] bg-[var(--surface-neutral-weak)] border border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] text-[var(--content-neutral-default)]">
                    شماره تماس {listing.sellerName}:
                  </div>
                  <div className="text-[16px] font-bold text-[var(--content-neutral-stronger)] dir-ltr text-right mt-0.5">
                    {listing.sellerPhone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="kt-button--outlined !h-[34px] !px-3 text-[12px]"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی شماره</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 3-Column Boxed Quick Specs Table (.kt-group-row) */}
            {listing.specs && listing.specs.length > 0 && (
              <div className="grid grid-cols-3 border border-[var(--border-neutral-weaker)] rounded-[6px] divide-x divide-x-reverse divide-[var(--border-neutral-weaker)] py-3 bg-[var(--surface-neutral-weaker)]">
                {listing.specs.map((spec) => (
                  <div key={spec.label} className="text-center px-2">
                    <div className="text-[12px] text-[var(--content-neutral-default)] mb-1">
                      {spec.label}
                    </div>
                    <div className="text-[15px] font-bold text-[var(--content-neutral-stronger)]">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key-Value Specification Rows (.kt-base-row) */}
            <div className="divide-y divide-[var(--border-neutral-weaker)] border-t border-b border-[var(--border-neutral-weaker)]">
              <div className="kt-base-row">
                <span className="text-[var(--content-neutral-default)]">قیمت / ارزش</span>
                <span className="font-medium text-[var(--content-neutral-stronger)]">
                  {listing.priceLabel
                    ? listing.priceLabel
                    : listing.deposit
                    ? `ودیعه ${formatToman(listing.deposit)}`
                    : listing.price > 0
                    ? formatToman(listing.price)
                    : 'توافقی'}
                </span>
              </div>

              <div className="kt-base-row">
                <span className="text-[var(--content-neutral-default)]">امکان معاوضه (تهاتر)</span>
                <span
                  className={`font-medium ${
                    listing.hasExchange
                      ? 'text-[var(--brand-primary)]'
                      : 'text-[var(--content-neutral-default)]'
                  }`}
                >
                  {listing.hasExchange ? 'دارد (معاوضه پذیرفته می‌شود)' : 'ندارد'}
                </span>
              </div>

              {listing.hasExchange && listing.exchangeWith && (
                <div className="kt-base-row gap-4">
                  <span className="text-[var(--content-neutral-default)] shrink-0">
                    کالای مورد نظر جهت تهاتر
                  </span>
                  <span className="font-medium text-[var(--content-neutral-stronger)] text-left">
                    {listing.exchangeWith}
                  </span>
                </div>
              )}

              <div className="kt-base-row">
                <span className="text-[var(--content-neutral-default)]">اصالت تصاویر</span>
                <span className="font-medium text-[var(--semantic-positive)]">
                  {listing.isVerifiedPhotos
                    ? 'تصویر واقعی متعلق به آگهی‌دهنده'
                    : 'نیاز به بررسی حضوری'}
                </span>
              </div>

              {listing.details.map((row) => (
                <div key={row.label} className="kt-base-row">
                  <span className="text-[var(--content-neutral-default)]">{row.label}</span>
                  <span className="font-medium text-[var(--content-neutral-stronger)]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Amenities / Features 3-Column Table */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h3 className="text-[16px] font-bold text-[var(--content-neutral-stronger)] mb-3">
                  ویژگی‌ها و امکانات
                </h3>
                <div className="grid grid-cols-3 border border-[var(--border-neutral-weaker)] rounded-[6px] divide-x divide-x-reverse divide-[var(--border-neutral-weaker)] py-3">
                  {listing.amenities.map((am) => (
                    <div
                      key={am.label}
                      className="flex flex-col items-center justify-center gap-1.5 px-2 text-center"
                    >
                      <div className="relative">
                        {getAmenityIcon(am.iconType, am.available)}
                        {!am.available && (
                          <span className="absolute inset-0 flex items-center justify-center text-[var(--content-neutral-weak)] font-bold text-[18px]">
                            /
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[13px] ${
                          am.available
                            ? 'text-[var(--content-neutral-stronger)]'
                            : 'text-[var(--content-neutral-weak)] line-through'
                        }`}
                      >
                        {am.available ? am.label : `${am.label} ندارد`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div>
              <h2 className="text-[17px] font-bold text-[var(--content-neutral-stronger)] mb-2.5">
                توضیحات
              </h2>
              <p className="text-[15px] leading-[28px] text-[var(--content-neutral-stronger)] whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Smart Barter Match Suggestions (Tahator Feature) */}
            {listing.hasExchange && barterMatches.length > 0 && (
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--brand-primary)] mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>پیشنهادهای هوشمند تهاتر هم‌تراز در سیستم</span>
                </div>
                <div className="space-y-2">
                  {barterMatches.map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => onSelectListing(match)}
                      className="w-full p-2.5 rounded-[6px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] flex items-center justify-between gap-3 text-right transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={match.images[0]}
                          alt={match.title}
                          className="w-11 h-11 rounded-[4px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[var(--content-neutral-stronger)] truncate">
                            {match.title}
                          </div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                            {match.city} ·{' '}
                            {match.price > 0 ? formatToman(match.price) : 'توافقی'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--brand-action)] shrink-0">
                        بررسی تهاتر ‹
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Left Column (Gallery, Personal Note, Map, Report - ~42% -> 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Image Gallery */}
            <figure className="space-y-2.5">
              <div className="relative w-full aspect-[4/3] rounded-[6px] overflow-hidden bg-[var(--surface-neutral-weak)] border border-[var(--border-neutral-weaker)] group">
                <img
                  src={images[activeImgIdx] || images[0]}
                  alt={`${listing.title} - تصویر ${activeImgIdx + 1}`}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length)
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors"
                      aria-label="تصویر قبلی"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImgIdx((prev) => (prev + 1) % images.length)
                      }
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-colors"
                      aria-label="تصویر بعدی"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setFullscreenImg(true)}
                  className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-[4px] bg-black/65 hover:bg-black/80 text-white text-[12px] flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>
                    {toPersianDigits(activeImgIdx + 1)} / {toPersianDigits(images.length)}
                  </span>
                </button>
              </div>

              {/* Thumbnail Strip (up to 6 thumbnails) */}
              {images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {images.slice(0, 6).map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImgIdx(idx)}
                      className={`relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all ${
                        activeImgIdx === idx
                          ? 'border-[var(--brand-action)] opacity-100'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </figure>

            {/* Personal Note Box (Exact Divar copy) */}
            <div className="space-y-1.5">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => onSaveNote(listing.id, e.target.value)}
                placeholder="یادداشت شما..."
                className="w-full p-3 rounded-[4px] border border-[var(--border-neutral-weaker)] focus:border-[var(--brand-action)] focus:outline-none text-[13px] text-[var(--content-neutral-stronger)] placeholder:text-[var(--content-neutral-weak)] resize-none"
              />
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                یادداشت تنها برای شما قابل دیدن است و پس از حذف آگهی، پاک خواهد شد.
              </p>
            </div>

            {/* Simulated Divar Location Map with Red Translucent Radius */}
            <div className="rounded-[6px] border border-[var(--border-neutral-weaker)] overflow-hidden">
              <div className="relative h-[196px] bg-[#eef2f6] overflow-hidden select-none">
                {/* Simulated Street Grid SVG */}
                <svg
                  className="w-full h-full opacity-75"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="none"
                >
                  <rect width="400" height="200" fill="#eef1f5" />
                  <path
                    d="M0 40 L400 55 M0 110 L400 95 M0 165 L400 175 M70 0 L55 200 M160 0 L180 200 M270 0 L255 200 M350 0 L365 200"
                    stroke="#ffffff"
                    strokeWidth="7"
                  />
                  <path
                    d="M0 78 Q190 60 400 130"
                    stroke="#fde68a"
                    strokeWidth="8"
                    fill="none"
                  />
                  <rect x="90" y="55" width="45" height="30" rx="3" fill="#dcfce7" />
                  <rect x="285" y="115" width="55" height="35" rx="3" fill="#dcfce7" />
                </svg>

                {/* Divar Translucent Red Circle Radius */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-28 h-28 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(195, 46, 46, 0.2)',
                      borderColor: 'var(--brand-action)',
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[var(--brand-action)] ring-4 ring-white shadow" />
                  </div>
                </div>

                {/* Map Location Label */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-[4px] bg-white/95 shadow-sm text-[12px] text-[var(--content-neutral-stronger)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                  <span>
                    {listing.city}، {listing.coordinates.streetHint}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Ad Row */}
            <button
              type="button"
              onClick={() => setReported(true)}
              className="w-full py-3 px-2 border-t border-[var(--border-neutral-weaker)] flex items-center justify-between text-[13px] text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                <span>
                  {reported
                    ? 'گزارش شما با موفقیت ثبت و برای بررسی ارسال شد.'
                    : 'گزارش آگهی'}
                </span>
              </span>
              {!reported && <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      {fullscreenImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setFullscreenImg(false);
          }}
        >
          <button
            type="button"
            onClick={() => setFullscreenImg(false)}
            className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[activeImgIdx] || images[0]}
            alt={listing.title}
            className="max-w-full max-h-[88vh] rounded-[6px] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
