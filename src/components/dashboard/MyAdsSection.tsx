'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Eye,
  MessageSquare,
  PhoneCall,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { AdModerationStatus, ListingAnalyticsMeta } from '@/types/platform';

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

export interface ArchivedAdEntry {
  listing: Listing;
  reason: string;
  archivedAt: string;
}

interface MyAdsSectionProps {
  myAds: Listing[];
  archivedAds: ArchivedAdEntry[];
  listingMeta: Record<string, ListingAnalyticsMeta>;
  onOpenPostAd: () => void;
  onSelectListing: (listing: Listing) => void;
  onLadderAd: (id: string) => void;
  onUrgentAd: (id: string) => void;
  onRenewAd: (id: string) => void;
  onEditAd: (
    id: string,
    updates: { title: string; price: number; hasExchange: boolean; exchangeWith: string; description: string }
  ) => void;
  onDeleteAd: (id: string, reason: string) => void;
  onRestoreArchivedAd?: (id: string) => void;
  onClose: () => void;
}

export default function MyAdsSection({
  myAds,
  archivedAds,
  listingMeta,
  onOpenPostAd,
  onSelectListing,
  onLadderAd,
  onUrgentAd,
  onRenewAd,
  onEditAd,
  onDeleteAd,
  onRestoreArchivedAd,
  onClose,
}: MyAdsSectionProps) {
  const [bucketTab, setBucketTab] = useState<'current' | 'drafts' | 'archived'>('current');
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | AdModerationStatus>('all');
  const [editingAd, setEditingAd] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editExchange, setEditExchange] = useState(true);
  const [editExchangeWith, setEditExchangeWith] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('در تهاتر آپ معامله/معاوضه شد');

  const openEditorForAd = (ad: Listing) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(ad.price > 0 ? String(ad.price) : '');
    setEditExchange(ad.hasExchange);
    setEditExchangeWith(ad.exchangeWith || '');
    setEditDesc(ad.description);
  };

  const filteredMyAds = myAds.filter((ad) => {
    if (adStatusFilter === 'all') return true;
    const status = listingMeta[ad.id]?.moderationStatus || 'published';
    return status === adStatusFilter;
  });

  return (
    <div className="space-y-5">
      {/* Top Heading + Primary Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
            آگهی‌های من
          </h2>
          <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
            مدیریت آگهی‌های جاری، پیش‌نویس‌های نیمه‌کاره و تاریخچه آگهی‌های تهاترشده
          </p>
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

      {/* Clean Underlined 3 Tabs: جاری | نیمه‌کاره | آرشیو */}
      <div className="flex items-center gap-6 border-b border-[var(--border-neutral-weaker)]">
        {[
          { id: 'current' as const, label: 'جاری', count: myAds.length },
          { id: 'drafts' as const, label: 'نیمه‌کاره', count: 0 },
          { id: 'archived' as const, label: 'آرشیو', count: archivedAds.length },
        ].map((t) => {
          const active = bucketTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setBucketTab(t.id)}
              className={`pb-3 text-[14px] transition-colors relative flex items-center gap-1.5 ${
                active
                  ? 'text-[var(--brand-primary)] font-bold'
                  : 'text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]'
              }`}
            >
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]">
                  {toPersianDigits(t.count)}
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--brand-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: CURRENT (جاری) */}
      {bucketTab === 'current' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'همه جاری' },
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
                    : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)] hover:bg-[var(--surface-neutral-subtle)]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {editingAd && (
            <div className="p-4 rounded-[8px] border border-[var(--brand-action)]/40 bg-[var(--surface-neutral-subtle)] space-y-3">
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
                  <label className="block text-[12px] font-medium mb-1">ارزش تخمینی / قیمت (تومان)</label>
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
                className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] text-[13px] bg-white"
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

          {deletingAdId && (
            <div className="p-4 rounded-[8px] border border-[var(--semantic-negative)]/40 bg-[var(--brand-soft)] space-y-2.5">
              <div className="text-[13px] font-bold text-[var(--semantic-negative)]">
                لطفاً علت انتقال آگهی به آرشیو را انتخاب کنید:
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
                  انتقال به آرشیو
                </button>
              </div>
            </div>
          )}

          {filteredMyAds.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <p className="text-[14px] text-[var(--content-neutral-default)]">
                در حال حاضر آگهی فعالی در این وضعیت ندارید.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPostAd();
                }}
                className="kt-button--outlined !h-[36px] !px-5 text-[12px]"
              >
                ثبت آگهی جدید
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-neutral-weaker)] border-y border-[var(--border-neutral-weaker)]">
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
                  <div key={ad.id} className="py-4 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        onClick={() => {
                          onSelectListing(ad);
                          onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <img
                          src={ad.images[0] || '/ads/no-image.svg'}
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

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onLadderAd(ad.id)}
                          className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
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
                          title="حذف / انتقال به آرشیو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--content-neutral-default)]">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          <span>بازدید ۷ روز:</span>
                          <strong className="text-[var(--content-neutral-stronger)]">
                            {toPersianDigits(meta.views)}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
                          <span>تماس:</span>
                          <strong className="text-[var(--content-neutral-stronger)]">
                            {toPersianDigits(meta.contactClicks)}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[var(--semantic-info)]" />
                          <span>چت:</span>
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

      {/* SUB-TAB 2: DRAFTS (نیمه‌کاره) */}
      {bucketTab === 'drafts' && (
        <div className="py-16 text-center space-y-3">
          <p className="text-[14px] text-[var(--content-neutral-default)]">
            در حال حاضر آگهی نیمه‌کاره‌ای ندارید.
          </p>
          <p className="text-[12px] text-[var(--content-neutral-default)]">
            برای ثبت کالا یا ملک آماده تهاتر، کافی است دکمه زیر را بزنید.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPostAd();
            }}
            className="kt-button--primary !h-[36px] !px-5 text-[12px]"
          >
            ثبت آگهی جدید
          </button>
        </div>
      )}

      {/* SUB-TAB 3: ARCHIVE (آرشیو) */}
      {bucketTab === 'archived' && (
        <div>
          {archivedAds.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-[14px] text-[var(--content-neutral-default)]">
                در حال حاضر آگهی غیرفعال یا آرشیوشده‌ای ندارید.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-neutral-weaker)] border-y border-[var(--border-neutral-weaker)]">
              {archivedAds.map((entry) => (
                <div
                  key={entry.listing.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={entry.listing.images[0] || '/ads/no-image.svg'}
                      alt={entry.listing.title}
                      className="w-14 h-14 rounded-[6px] object-cover opacity-75 shrink-0 border border-[var(--border-neutral-weaker)]"
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)] truncate">
                        {entry.listing.title}
                      </div>
                      <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                        آرشیو در {entry.archivedAt} · علت: {entry.reason}
                      </div>
                    </div>
                  </div>
                  {onRestoreArchivedAd && (
                    <button
                      type="button"
                      onClick={() => onRestoreArchivedAd(entry.listing.id)}
                      className="kt-button--outlined !h-[32px] !px-3.5 text-[12px] shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                      <span>بازنشر مجدد</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
