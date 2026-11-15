'use client';

import React, { useState } from 'react';
import {
  Copy,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CATEGORIES, CITIES, Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { generateBarterAgreementDraft } from '@/lib/offlineAi';
import { BarterAsset, BarterOffer, UserProfile } from '@/types/platform';

interface BarterAssetsSectionProps {
  user: UserProfile;
  allListings: Listing[];
  barterAssets: BarterAsset[];
  onUpdateProfile: (partial: Partial<UserProfile>) => void;
  onAddBarterAsset: (asset: Omit<BarterAsset, 'id' | 'createdAt'>) => void;
  onDeleteBarterAsset: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenAiTab?: (tab: 'chat' | 'compare' | 'estimator' | 'chain') => void;
  onClose: () => void;
}

export function BarterAssetsSection({
  user,
  allListings,
  barterAssets,
  onUpdateProfile,
  onAddBarterAsset,
  onDeleteBarterAsset,
  onSelectListing,
  onOpenAiTab,
  onClose,
}: BarterAssetsSectionProps) {
  const [assetTitle, setAssetTitle] = useState('');
  const [assetCategory, setAssetCategory] = useState('خودرو');
  const [assetValue, setAssetValue] = useState('');
  const [assetCondition, setAssetCondition] = useState<BarterAsset['condition']>('در حد نو');
  const [assetCity, setAssetCity] = useState(user.city || 'تهران');
  const [assetPref, setAssetPref] = useState('');
  const [matchedAssetId, setMatchedAssetId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="pb-3 border-b border-[var(--border-neutral-weaker)]">
        <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
          سبد دارایی‌های آماده تهاتر من
        </h2>
        <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
          دارایی‌ها و کالاهایی که قصد معاوضه آن‌ها را دارید ثبت کنید تا موتور تطبیق هوشمند بهترین آگهی‌های ۲ طرفه و ۳ ضلعی را پیشنهاد دهد.
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
          <p className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
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
  );
}

interface BarterOffersSectionProps {
  allListings: Listing[];
  barterOffers: BarterOffer[];
  onRespondBarterOffer: (offerId: string, status: 'accepted' | 'rejected') => void;
  onOpenChatFromOffer: (offer: BarterOffer) => void;
  onClose: () => void;
}

export function BarterOffersSection({
  allListings,
  barterOffers,
  onRespondBarterOffer,
  onOpenChatFromOffer,
  onClose,
}: BarterOffersSectionProps) {
  const [offerDir, setOfferDir] = useState<'received' | 'sent'>('received');
  const [previewOfferAgreement, setPreviewOfferAgreement] = useState<BarterOffer | null>(null);
  const [agreementCopied, setAgreementCopied] = useState(false);

  const visibleOffers = barterOffers.filter((o) => o.direction === offerDir);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
          معاوضه‌ها و تفاهم‌نامه‌ها
        </h2>
        <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
          مدیریت پیشنهادهای دریافتی و ارسالی تهاتر همراه با ردیابی ۴ مرحله‌ای و پیش‌نویس تفاهم‌نامه
        </p>
      </div>

      {/* Clean Underlined Sub-Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border-neutral-weaker)]">
        {[
          {
            id: 'received' as const,
            label: 'پیشنهادهای دریافتی',
            count: barterOffers.filter((o) => o.direction === 'received').length,
          },
          {
            id: 'sent' as const,
            label: 'پیشنهادهای ارسالی',
            count: barterOffers.filter((o) => o.direction === 'sent').length,
          },
        ].map((t) => {
          const active = offerDir === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOfferDir(t.id)}
              className={`pb-3 text-[14px] transition-colors relative flex items-center gap-1.5 ${
                active
                  ? 'text-[var(--brand-primary)] font-bold'
                  : 'text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]">
                {toPersianDigits(t.count)}
              </span>
              {active && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--brand-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {visibleOffers.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-[var(--content-neutral-default)]">
          در این بخش پیشنهادی ثبت نشده است.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleOffers.map((offer) => (
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
                برای آگهی:{' '}
                <strong className="text-[var(--content-neutral-stronger)]">{offer.listingTitle}</strong> ·{' '}
                مابه‌التفاوت:{' '}
                <strong className="text-[var(--brand-primary)]">{formatToman(offer.cashDifference)}</strong>
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
                <div className="flex flex-wrap items-center gap-2">
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
      )}

      {previewOfferAgreement &&
        (() => {
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
  );
}
