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
  ShieldCheck,
  Scale,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import {
  AiConfig,
  DEFAULT_AI_CONFIG,
  evaluateListingPrice,
  generateBarterAgreementDraft,
  generateSmartListingSummary,
  getRelatedListings,
  matchBarterListings,
  normalizeDigits,
} from '@/lib/offlineAi';

interface AdDetailModalProps {
  listing: Listing;
  allListings: Listing[];
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  note: string;
  onSaveNote: (id: string, note: string) => void;
  onClose: () => void;
  onOpenChatWith: (listing: Listing, isAdmin?: boolean, prefillMessage?: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenInstallmentPlan: () => void;
  onOpenAiCompare?: (listing: Listing) => void;
  onOpenAiChain?: (listing: Listing) => void;
  onSubmitBarterOffer?: (payload: {
    listing: Listing;
    offeredItemTitle: string;
    offeredEstimatedPrice: number;
    installmentRequested: boolean;
    note: string;
  }) => void;
  onReportListing?: (listing: Listing, reason: string, details: string) => void;
  onTrackPhoneClick?: (listingId: string) => void;
  aiConfig?: AiConfig;
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
  onOpenAiCompare,
  onOpenAiChain,
  onSubmitBarterOffer,
  onReportListing,
  onTrackPhoneClick,
  aiConfig = DEFAULT_AI_CONFIG,
}: AdDetailModalProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [fullscreenImg, setFullscreenImg] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [copiedAgreement, setCopiedAgreement] = useState(false);
  const [dealMyAssetPrice, setDealMyAssetPrice] = useState(() =>
    listing.price > 0 ? String(Math.round(listing.price * 0.65)) : '1500000000'
  );
  const [showPhone, setShowPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerItemTitle, setOfferItemTitle] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerInstallment, setOfferInstallment] = useState(true);
  const [offerNote, setOfferNote] = useState('');
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('درخواست بیعانه / مشکوک');
  const [reportDetails, setReportDetails] = useState('');
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

  const priceEval = useMemo(
    () => evaluateListingPrice(listing, allListings),
    [listing, allListings]
  );

  const aiSummary = useMemo(
    () => generateSmartListingSummary(listing),
    [listing]
  );

  const barterMatches = useMemo(
    () => matchBarterListings(listing, allListings),
    [allListings, listing]
  );

  const relatedListings = useMemo(
    () => getRelatedListings(listing, allListings),
    [listing, allListings]
  );

  const dealCalc = useMemo(() => {
    const target = listing.price || 0;
    const myAsset = Number(normalizeDigits(dealMyAssetPrice).replace(/[^\d]/g, '')) || 0;
    const diff = target - myAsset;
    const absDiff = Math.abs(diff);
    const halfCash = Math.round(absDiff * 0.5);
    const monthly12 = Math.round((halfCash * 1.12) / 12);
    return { target, myAsset, diff, absDiff, halfCash, monthly12 };
  }, [listing.price, dealMyAssetPrice]);

  const agreementDraftText = useMemo(
    () =>
      generateBarterAgreementDraft({
        listingTitle: listing.title,
        listingCode: listing.code,
        listingPrice: listing.price,
        offeredTitle: offerItemTitle || listing.exchangeWith || 'دارایی پیشنهادی خریدار',
        offeredPrice: dealCalc.myAsset,
        sellerName: listing.sellerName,
        useInstallment: listing.hasInstallmentPlan,
      }),
    [dealCalc.myAsset, listing, offerItemTitle]
  );

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

        {/* Main 2-Column Detail Body */}
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

            {/* Safety Warning Accordion */}
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
                <div className="pb-4 pr-7 text-[13px] leading-[24px] text-[var(--content-neutral-default)] space-y-2">
                  <p>• پیش از رویت حضوری کالا، ملک یا مدارک مالکیت، هیچ مبلغی به عنوان بیعانه پرداخت نکنید.</p>
                  <p>• در معاملات تهاتر، اصالت سند و قیمت کارشناسی دو طرف را با حضور کارشناس تایید کنید.</p>
                  <p>• از پرداخت وجه از طریق لینک‌های ناشناس خودداری کرده و تنها در چت امن تهاتر آپ گفتگو کنید.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="https://my.ssaa.ir"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--semantic-info-soft)] text-[var(--semantic-info)] text-[11px] font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>سامانه تصدیق اصالت اسناد (ثبت احوال/اسناد)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowAgreementModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold"
                    >
                      <FileText className="w-3 h-3" />
                      <span>مشاهده پیش‌نویس تفاهم‌نامه امن تهاتر</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Row (اطلاعات تماس، چت، پیشنهاد معاوضه، ادمین، نشان، اشتراک) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhone((prev) => {
                      const next = !prev;
                      if (next) onTrackPhoneClick?.(listing.id);
                      return next;
                    });
                  }}
                  className="kt-button--primary !h-[42px] !px-4 sm:!px-5 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{showPhone ? listing.sellerPhone : 'اطلاعات تماس'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChatWith(listing, false)}
                  className="kt-button--outlined !h-[42px] !px-4"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>چت</span>
                </button>

                {listing.hasExchange && onSubmitBarterOffer && (
                  <button
                    type="button"
                    onClick={() => setShowOfferForm((prev) => !prev)}
                    className="kt-button--outlined !h-[42px] !px-3.5 !border-[var(--brand-action)]/40 text-[var(--brand-primary)] hover:!bg-[var(--brand-soft)]"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>ثبت پیشنهاد معاوضه</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenChatWith(listing, true)}
                  className="kt-button--outlined !h-[42px] !px-3.5 text-[12px]"
                  title="مشاوره و کارشناسی تهاتر با کارشناس سایت"
                >
                  <Headphones className="w-4 h-4 text-[var(--brand-action)]" />
                  <span>پشتیبان</span>
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

            {/* Inline Barter Offer Form */}
            {showOfferForm && onSubmitBarterOffer && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!offerItemTitle.trim()) return;
                  const estPrice =
                    Number(normalizeDigits(offerPrice).replace(/[^\d]/g, '')) || 0;
                  onSubmitBarterOffer({
                    listing,
                    offeredItemTitle: offerItemTitle.trim(),
                    offeredEstimatedPrice: estPrice,
                    installmentRequested: offerInstallment,
                    note:
                      offerNote.trim() ||
                      `پیشنهاد معاوضه با ${offerItemTitle.trim()} در شرایط عالی.`,
                  });
                  setOfferSubmitted(true);
                  setShowOfferForm(false);
                }}
                className="p-4 rounded-[8px] border-2 border-[var(--brand-action)]/35 bg-[var(--brand-soft)]/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                    🔄 ثبت پیشنهاد معاوضه برای این آگهی
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOfferForm(false)}
                    className="text-[12px] text-[var(--content-neutral-default)]"
                  >
                    بستن
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={offerItemTitle}
                    onChange={(e) => setOfferItemTitle(e.target.value)}
                    placeholder="کالا یا دارایی پیشنهادی شما (مثلاً: پژو ۲۰۷ مدل ۱۴۰۲)..."
                    className="kt-input !h-[38px] text-[12px]"
                  />
                  <input
                    type="text"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="ارزش تقریبی پیشنهادی (تومان)"
                    className="kt-input !h-[38px] text-[12px] text-left dir-ltr"
                  />
                </div>
                <textarea
                  rows={2}
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="توضیحات تکمیلی یا پیشنهاد زمان بازدید..."
                  className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] bg-white text-[12px]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerInstallment}
                      onChange={(e) => setOfferInstallment(e.target.checked)}
                      className="accent-[var(--brand-action)]"
                    />
                    <span>درخواست تسویه مابه‌التفاوت با اقساط ۵۰/۵۰</span>
                  </label>
                  <button type="submit" className="kt-button--primary !h-[34px] !px-4 text-[12px]">
                    ارسال پیشنهاد معاوضه
                  </button>
                </div>
              </form>
            )}

            {offerSubmitted && (
              <div className="p-3 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[13px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  پیشنهاد معاوضه شما ثبت شد و از بخش «پیشنهادهای معاوضه» در داشبورد تهاتر من قابل پیگیری است.
                </span>
              </div>
            )}

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

            {/* Offline AI Price Estimator & Market Range Thermometer Card */}
            {aiConfig.enabled && aiConfig.priceEstimator && (
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                    <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>کارشناسی هوشمند قیمت (هوش مصنوعی آفلاین)</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      priceEval.status === 'good-deal'
                        ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                        : priceEval.status === 'high'
                        ? 'bg-[var(--brand-soft)] text-[var(--semantic-negative)]'
                        : 'bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)]'
                    }`}
                  >
                    {priceEval.statusLabel}
                  </span>
                </div>

                {/* Thermometer Gauge */}
                <div className="space-y-1.5">
                  <div className="relative h-2.5 rounded-full overflow-hidden flex bg-[var(--border-neutral-weaker)]">
                    <div className="w-1/3 bg-[#10b981]" />
                    <div className="w-1/3 bg-[#f59e0b]" />
                    <div className="w-1/3 bg-[#ef4444]" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#2a2a30] shadow transition-all"
                      style={{ left: `calc(${priceEval.markerPercent}% - 7px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--content-neutral-default)]">
                    <span>حداقل منصفانه: {formatToman(priceEval.minFair)}</span>
                    <span>حداکثر بازار: {formatToman(priceEval.maxFair)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--content-neutral-default)] flex flex-wrap items-center justify-between gap-2">
                  <span>{priceEval.reason}</span>
                  <span>دقت تخمین: {toPersianDigits(priceEval.confidence)}٪</span>
                </div>
              </div>
            )}

            {/* Offline AI 3-Point Smart Summary & Safety Score */}
            {aiConfig.enabled && aiConfig.smartSummary && (
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--brand-primary)]">
                    <Sparkles className="w-4 h-4" />
                    <span>خلاصه هوشمند ۳ نکته‌ای آگهی</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--semantic-positive)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      شاخص سلامت: {toPersianDigits(aiSummary.safetyScore)}٪ ({aiSummary.safetyLabel})
                    </span>
                  </span>
                </div>
                <ul className="space-y-1.5 text-[12px] leading-[22px] text-[var(--content-neutral-stronger)] pr-1">
                  {aiSummary.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[var(--brand-primary)] font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
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

            {/* Seller Self-Assessment & Authenticity Checklist */}
            <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2">
              <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                ارزیابی و وضعیت اعلامی فروشنده
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="flex items-center gap-2 text-[var(--semantic-positive)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>مدارک مالکیت و سند آماده انتقال قطعی</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--semantic-positive)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>امکان کارشناسی حضوری و مابه‌التفاوت تهاتر</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--semantic-positive)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {listing.isVerifiedPhotos
                      ? 'تصاویر واقعی توسط فروشنده تایید شده'
                      : 'امکان دریافت تصویر جدید پیش از مراجعه'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--semantic-positive)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>پاسخگویی سریع در چت امن و تماس</span>
                </div>
              </div>
            </div>

            {/* Interactive Barter Sales Deal Structurer */}
            {listing.hasExchange && listing.price > 0 && (
              <div className="p-4 rounded-[8px] border border-[var(--brand-action)]/30 bg-[var(--brand-soft)]/35 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand-primary)]">
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>شبیه‌ساز توافق سریع تهاتر و اقساط ۵۰/۵۰</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAgreementModal(true)}
                    className="text-[11px] font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>پیش‌نویس تفاهم‌نامه</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] text-[var(--content-neutral-default)] mb-1">
                      ارزش تقریبی کالای پیشنهادی شما (تومان):
                    </label>
                    <input
                      type="text"
                      value={dealMyAssetPrice}
                      onChange={(e) => setDealMyAssetPrice(e.target.value)}
                      className="kt-input !h-[36px] text-[12px] text-left dir-ltr bg-white"
                    />
                  </div>
                  <div className="sm:col-span-6 flex flex-wrap gap-1 sm:pt-4">
                    {[
                      { label: '۵۰٪ ارزش', ratio: 0.5 },
                      { label: '۷۵٪ ارزش', ratio: 0.75 },
                      { label: 'سربه‌سر', ratio: 1 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setDealMyAssetPrice(String(Math.round(listing.price * preset.ratio)))
                        }
                        className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-[11px] font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
                  <div className="p-2.5 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                    <div className="text-[10px] text-[var(--content-neutral-default)]">مابه‌التفاوت کل</div>
                    <div className="font-bold text-[var(--content-neutral-stronger)] mt-0.5">
                      {dealCalc.absDiff === 0 ? 'سربه‌سر' : formatToman(dealCalc.absDiff)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                    <div className="text-[10px] text-[var(--content-neutral-default)]">۵۰٪ پیش‌پرداخت نقد</div>
                    <div className="font-bold text-[var(--brand-primary)] mt-0.5">
                      {dealCalc.absDiff === 0 ? '۰ تومان' : formatToman(dealCalc.halfCash)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                    <div className="text-[10px] text-[var(--content-neutral-default)]">۱۲ قسط ماهیانه (طرح ۵۰/۵۰)</div>
                    <div className="font-bold text-[var(--semantic-positive)] mt-0.5">
                      {dealCalc.absDiff === 0 ? 'بدون قسط' : `${formatToman(dealCalc.monthly12)} / ماه`}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const summaryMsg = `سلام، برای آگهی «${listing.title}» قصد معاوضه با دارایی به ارزش ${formatToman(dealCalc.myAsset)} را دارم. ${
                        dealCalc.absDiff === 0
                          ? 'ارزش پیشنهادی سربه‌سر است.'
                          : `مابه‌التفاوت ${formatToman(dealCalc.absDiff)} بوده و حاضرم نصف را نقد (${formatToman(dealCalc.halfCash)}) و مابقی را با اقساط ۵۰/۵۰ (${formatToman(dealCalc.monthly12)} ماهانه) تسویه کنم.`
                      }`;
                      onOpenChatWith(listing, false, summaryMsg);
                    }}
                    className="kt-button--primary !h-[34px] !px-4 text-[12px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ارسال همین ساختار پیشنهادی در چت</span>
                  </button>
                </div>
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

            {/* Smart Barter Match Suggestions (Offline AI Engine) */}
            {aiConfig.enabled && aiConfig.barterMatcher && listing.hasExchange && barterMatches.length > 0 && (
              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--brand-primary)]">
                    <Sparkles className="w-4 h-4" />
                    <span>تطبیق هوشمند معاوضه (هوش مصنوعی آفلاین)</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {onOpenAiCompare && (
                      <button
                        type="button"
                        onClick={() => onOpenAiCompare(listing)}
                        className="text-[11px] font-bold text-[var(--brand-action)] hover:underline"
                      >
                        مقایسه دوطرفه ‹
                      </button>
                    )}
                    {onOpenAiChain && (
                      <button
                        type="button"
                        onClick={() => onOpenAiChain(listing)}
                        className="text-[11px] font-bold text-[var(--semantic-info)] hover:underline"
                      >
                        زنجیره تهاتر ۳ نفره ‹
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {barterMatches.map((m) => (
                    <button
                      key={m.listing.id}
                      type="button"
                      onClick={() => onSelectListing(m.listing)}
                      className="w-full p-2.5 rounded-[6px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] flex flex-col gap-1.5 text-right transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.listing.images[0] || '/ads/fake-1.svg'}
                            alt={m.listing.title}
                            className="w-11 h-11 rounded-[4px] object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)] truncate">
                              {m.listing.title}
                            </div>
                            <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                              {m.listing.city} ·{' '}
                              {m.listing.price > 0 ? formatToman(m.listing.price) : 'توافقی'}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-extrabold shrink-0">
                          {toPersianDigits(m.matchPercent)}٪ تطابق
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--content-neutral-default)] bg-[var(--surface-neutral-subtle)] px-2 py-1 rounded">
                        {m.suggestedPlan}
                      </div>
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

            {/* Personal Note Box */}
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

            {/* Simulated Location Map with Red Translucent Radius */}
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

                {/* Translucent Red Circle Radius */}
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
            <div className="border-t border-[var(--border-neutral-weaker)]">
              <button
                type="button"
                onClick={() => {
                  if (!reported) setShowReportForm((prev) => !prev);
                }}
                className="w-full py-3 px-2 flex items-center justify-between text-[13px] text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>
                    {reported
                      ? 'گزارش شما در کارتابل ناظر آگهی ثبت شد.'
                      : 'گزارش آگهی / ثبت تخلف'}
                  </span>
                </span>
                {!reported && <ChevronLeft className="w-4 h-4" />}
              </button>

              {showReportForm && !reported && (
                <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] space-y-2.5 mb-2">
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="kt-input !h-[34px] text-[12px]"
                  >
                    <option value="درخواست بیعانه / مشکوک">درخواست بیعانه / رفتار مشکوک</option>
                    <option value="قیمت نامتعارف">قیمت نامتعارف یا نادرست</option>
                    <option value="تصاویر غیرواقعی">تصاویر غیرواقعی / نامرتبط</option>
                    <option value="آگهی تکراری">آگهی تکراری یا ناموجود</option>
                  </select>
                  <input
                    type="text"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="توضیح تکمیلی برای تیم نظارت (اختیاری)..."
                    className="kt-input !h-[34px] text-[12px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onReportListing?.(listing, reportReason, reportDetails);
                        setReported(true);
                        setShowReportForm(false);
                      }}
                      className="kt-button--primary !h-[30px] !px-4 text-[11px]"
                    >
                      ارسال به ناظر
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Similar Listings Row ("آگهی‌های مشابه") */}
        {relatedListings.length > 0 && (
          <div className="px-4 sm:px-6 md:px-8 py-6 border-t border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
            <h3 className="text-[16px] font-bold text-[var(--content-neutral-stronger)] mb-3.5">
              آگهی‌های مشابه و قابل تهاتر در {listing.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedListings.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectListing(rel)}
                  className="p-2.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white hover:border-[var(--brand-action)] text-right flex sm:flex-col gap-2.5 transition-all group"
                >
                  <img
                    src={rel.images[0] || '/ads/fake-1.svg'}
                    alt={rel.title}
                    className="w-20 h-20 sm:w-full sm:h-28 rounded-[6px] object-cover shrink-0 bg-[var(--surface-neutral-weak)]"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)] line-clamp-2 group-hover:text-[var(--brand-primary)]">
                      {rel.title}
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <div className="text-[12px] font-bold text-[var(--brand-primary)] truncate">
                        {rel.price > 0 ? formatToman(rel.price) : 'توافقی'}
                      </div>
                      <div className="text-[11px] text-[var(--content-neutral-default)] truncate">
                        {rel.city} · {rel.neighborhood}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barter Safe Pre-Agreement Preview Modal */}
      {showAgreementModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/65 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowAgreementModal(false);
          }}
        >
          <div
            className="w-full max-w-[560px] bg-white rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[15px] text-[var(--brand-primary)]">
                <FileText className="w-4 h-4" />
                <span>پیش‌نویس تفاهم‌نامه اولیه تهاتر امن</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <pre className="p-3.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] text-[12px] leading-[24px] text-[var(--content-neutral-stronger)] whitespace-pre-wrap font-sans">
                {agreementDraftText}
              </pre>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(agreementDraftText).catch(() => {});
                    setCopiedAgreement(true);
                    setTimeout(() => setCopiedAgreement(false), 2000);
                  }}
                  className="kt-button--primary !h-[36px] !px-4 text-[12px]"
                >
                  {copiedAgreement ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAgreement ? 'متن تفاهم‌نامه کپی شد' : 'کپی متن تفاهم‌نامه'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
