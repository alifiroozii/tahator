'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Eye,
  MapPin,
  MessageSquare,
  PhoneCall,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { CATEGORIES, CITIES, Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { ApiClientError, tahatorApi } from '@/lib/apiClient';
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

export interface EditableListingFields {
  title: string;
  price: number;
  category?: string;
  subcategory?: string;
  city?: string;
  neighborhood?: string;
  streetHint?: string;
  hasExchange: boolean;
  exchangeWith: string;
  hasInstallmentPlan?: boolean;
  description: string;
  images?: string[];
}

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
  onEditAd: (id: string, updates: EditableListingFields) => void;
  onDeleteAd: (id: string, reason: string) => void;
  onRestoreArchivedAd?: (id: string) => void;
  onPinLocationAd?: (ad: Listing) => void;
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
  onPinLocationAd,
  onClose,
}: MyAdsSectionProps) {
  const [bucketTab, setBucketTab] = useState<'current' | 'drafts' | 'archived'>('current');
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | AdModerationStatus>('all');
  const [editingAd, setEditingAd] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[0].name);
  const [editSubcategory, setEditSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [editCity, setEditCity] = useState(CITIES[0].name);
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editStreetHint, setEditStreetHint] = useState('');
  const [editExchange, setEditExchange] = useState(false);
  const [editExchangeWith, setEditExchangeWith] = useState('');
  const [editInstallment, setEditInstallment] = useState(true);
  const [editDesc, setEditDesc] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [uploadingEditImg, setUploadingEditImg] = useState(false);
  const [uploadEditErr, setUploadEditErr] = useState('');

  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('در تهاتر آپ معامله/معاوضه شد');

  const openEditorForAd = (ad: Listing) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(ad.price > 0 ? String(ad.price) : '');
    setEditCategory(ad.category || CATEGORIES[0].name);
    setEditSubcategory(ad.subcategory || CATEGORIES[0].subcategories[0]);
    setEditCity(ad.city || CITIES[0].name);
    setEditNeighborhood(ad.neighborhood || '');
    setEditStreetHint(ad.coordinates?.streetHint || '');
    setEditExchange(ad.hasExchange);
    setEditExchangeWith(ad.exchangeWith || '');
    setEditInstallment(ad.hasInstallmentPlan !== false);
    setEditDesc(ad.description);
    setEditImages(ad.images || []);
    setUploadEditErr('');
  };

  const selectedEditCatObj = CATEGORIES.find((c) => c.name === editCategory) || CATEGORIES[0];
  const selectedEditCityObj = CITIES.find((c) => c.name === editCity) || CITIES[0];

  const handleEditImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadEditErr('');
    setUploadingEditImg(true);
    try {
      const uploaded = await tahatorApi.uploadImages(Array.from(files));
      setEditImages((prev) =>
        Array.from(new Set([...prev, ...uploaded.items.map((u) => u.url)])).slice(0, 7)
      );
    } catch (err) {
      setUploadEditErr(err instanceof ApiClientError ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploadingEditImg(false);
    }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1">دسته‌بندی</label>
                  <select
                    value={editCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setEditCategory(nextCat);
                      const found = CATEGORIES.find((c) => c.name === nextCat);
                      if (found?.subcategories[0]) setEditSubcategory(found.subcategories[0]);
                    }}
                    className="kt-input !h-[36px] text-[12.5px]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1">زیردسته</label>
                  <select
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    className="kt-input !h-[36px] text-[12.5px]"
                  >
                    {selectedEditCatObj.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1">شهر</label>
                  <select
                    value={editCity}
                    onChange={(e) => {
                      const nextCity = e.target.value;
                      setEditCity(nextCity);
                      const found = CITIES.find((c) => c.name === nextCity);
                      if (found?.neighborhoods[0]) setEditNeighborhood(found.neighborhoods[0]);
                    }}
                    className="kt-input !h-[36px] text-[12.5px]"
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1">محله</label>
                  <input
                    type="text"
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                    list="edit-neighborhoods-list"
                    placeholder="نام محله..."
                    className="kt-input !h-[36px] text-[12.5px]"
                  />
                  <datalist id="edit-neighborhoods-list">
                    {selectedEditCityObj.neighborhoods.map((nb) => (
                      <option key={nb} value={nb} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1">محدوده / خیابان</label>
                  <input
                    type="text"
                    value={editStreetHint}
                    onChange={(e) => setEditStreetHint(e.target.value)}
                    placeholder="خیابان یا محدوده..."
                    className="kt-input !h-[36px] text-[12.5px]"
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
                <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editInstallment}
                    onChange={(e) => setEditInstallment(e.target.checked)}
                    className="accent-[var(--brand-action)]"
                  />
                  <span>تسهیلات اقساطی ۵۰/۵۰ (۱ تا ۵ سال)</span>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[12px] font-medium">
                    تصاویر آگهی ({toPersianDigits(editImages.length)} از ۷)
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-default)] text-[11px] font-bold cursor-pointer hover:border-[var(--brand-action)]">
                    <Upload className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                    <span>{uploadingEditImg ? 'در حال آپلود...' : 'افزودن عکس'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingEditImg}
                      onChange={(e) => void handleEditImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadEditErr && (
                  <div className="text-[11px] text-[var(--semantic-negative)]">{uploadEditErr}</div>
                )}
                {editImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editImages.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="relative w-14 h-14 rounded-[4px] overflow-hidden border border-[var(--border-neutral-weaker)]"
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center"
                          title="حذف تصویر"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="kt-input !h-auto py-2 text-[13px] w-full"
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
                      category: editCategory,
                      subcategory: editSubcategory,
                      city: editCity,
                      neighborhood: editNeighborhood.trim() || 'مرکز شهر',
                      streetHint: editStreetHint.trim() || undefined,
                      hasExchange: editExchange,
                      exchangeWith: editExchangeWith.trim(),
                      hasInstallmentPlan: editInstallment,
                      description: editDesc.trim() || editingAd.description,
                      images: editImages,
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
                        : 'bg-[var(--surface-neutral-default)] text-[var(--content-neutral-stronger)] border-[var(--border-neutral-weaker)]'
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
                  <div key={ad.id} className="py-4 bg-[var(--surface-neutral-default)] space-y-3">
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
                            {ad.coordinates?.hasCoords === false ? (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[10px] font-bold">
                                موقعیت نقشه ثبت نشده
                              </span>
                            ) : (
                              ad.coordinates?.isApproximate && (
                                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[10px] font-bold">
                                  محدوده تقریبی ۴۵۰م
                                </span>
                              )
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
                        {onPinLocationAd && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onPinLocationAd(ad);
                            }}
                            className={`kt-button--outlined !h-[32px] !px-2.5 text-[11px] ${
                              ad.coordinates?.hasCoords === false
                                ? '!border-[var(--semantic-warning)] !text-[var(--semantic-warning)]'
                                : ''
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {ad.coordinates?.hasCoords === false ? 'تعیین موقعیت نقشه' : 'ویرایش موقعیت نقشه'}
                            </span>
                          </button>
                        )}
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
