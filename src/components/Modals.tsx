'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IRAN_CITY_COORDS } from '@/components/InteractiveMap';
import { tahatorApi } from '@/lib/apiClient';
import {
  X,
  Search,
  MapPin,
  Check,
  Calculator,
  Percent,
  Phone,
  Send,
  Headphones,
  MessageSquare,
  User,
  Trash2,
  TrendingUp,
  ArrowLeftRight,
  Upload,
  ShieldCheck,
  Bookmark,
  FileText,
  Clock,
  FolderOpen,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  CATEGORIES,
  CITIES,
  Listing,
  formatToman,
  toPersianDigits,
} from '@/data/mockData';
import {
  AiConfig,
  DEFAULT_AI_CONFIG,
  analyzeChatSafety,
  autoCompleteDraftAd,
  generateSmartChatReplies,
  normalizeDigits,
} from '@/lib/offlineAi';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[190px] w-full flex items-center justify-center bg-[var(--surface-neutral-weak)] text-[12px] text-[var(--content-neutral-default)]">
      در حال بارگذاری نقشه...
    </div>
  ),
});

/* -------------------------------------------------------------------------- */
/* 0. Full Categories Modal (📂 همه آگهی‌ها)                                  */
/* -------------------------------------------------------------------------- */
interface CategoriesModalProps {
  onSelectCategory: (cat: string | null, sub?: string | null) => void;
  onClose: () => void;
}

export function CategoriesModal({ onSelectCategory, onClose }: CategoriesModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[780px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[86vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold text-[var(--content-neutral-stronger)]">
              📂 همه آگهی‌ها
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null, null);
              onClose();
            }}
            className="w-full p-3 rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold text-[14px] flex items-center justify-between hover:opacity-90 transition-opacity"
          >
            <span>📋 مشاهده همه آگهی‌های ثبت‌شده</span>
            <span className="text-[12px]">نمایش کل فهرست ‹</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.name, null);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between text-[14px] font-bold text-[var(--content-neutral-stronger)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  <span>
                    {cat.emoji} {cat.name}
                  </span>
                  <span className="text-[11px] font-normal text-[var(--brand-action)]">
                    همه {cat.name} ‹
                  </span>
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.name, sub);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-[4px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] hover:text-[var(--brand-primary)] text-[12px] text-[var(--content-neutral-default)] transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. City Selection Modal (📍 انتخاب شهر)                                    */
/* -------------------------------------------------------------------------- */
interface CityModalProps {
  selectedCities: string[];
  onConfirmCities: (cities: string[]) => void;
  onClose: () => void;
}

export function CityModal({ selectedCities, onConfirmCities, onClose }: CityModalProps) {
  const [draft, setDraft] = useState<string[]>(selectedCities);
  const [query, setQuery] = useState('');

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.includes(query.trim()) ||
      c.province.includes(query.trim())
  );

  const toggleCity = (cityName: string) => {
    setDraft((prev) =>
      prev.includes(cityName) ? prev.filter((c) => c !== cityName) : [...prev, cityName]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[var(--content-neutral-stronger)]">
              انتخاب شهر
            </h3>
            <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
              حداقل یک شهر را انتخاب کنید یا برای مشاهده کل کشور گزینه همه شهرها را بزنید.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-[var(--border-neutral-weaker)]">
          <div className="flex flex-wrap gap-1.5">
            {draft.length === 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[12px] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-medium">
                همه شهرهای ایران
              </span>
            ) : (
              draft.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-medium"
                >
                  <span>{city}</span>
                  <button type="button" onClick={() => toggleCity(city)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[var(--content-neutral-default)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در شهرها و استان‌ها..."
              className="kt-input pr-9"
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!query && (
            <div>
              <div className="text-[12px] font-bold text-[var(--content-neutral-default)] mb-2">
                شهرهای پربازدید
              </div>
              <div className="flex flex-wrap gap-2">
                {CITIES.filter((c) => c.popular).map((c) => {
                  const active = draft.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCity(c.name)}
                      className={`px-3 py-1.5 rounded-[4px] text-[13px] border transition-colors ${
                        active
                          ? 'border-[var(--brand-action)] bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                          : 'border-[var(--border-neutral-weaker)] hover:bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-[12px] font-bold text-[var(--content-neutral-default)] mb-2">
              فهرست کامل شهرها ({toPersianDigits(filteredCities.length)} شهر)
            </div>
            <div className="divide-y divide-[var(--border-neutral-weaker)]">
              {filteredCities.map((city) => {
                const checked = draft.includes(city.name);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => toggleCity(city.name)}
                    className="w-full py-2.5 px-2 flex items-center justify-between hover:bg-[var(--surface-neutral-weak)] rounded-[4px] transition-colors"
                  >
                    <div className="text-right">
                      <span className="text-[14px] font-medium text-[var(--content-neutral-stronger)]">
                        {city.name}
                      </span>
                      <span className="text-[12px] text-[var(--content-neutral-default)] mr-2">
                        ({city.province})
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-[4px] border flex items-center justify-center ${
                        checked
                          ? 'bg-[var(--brand-action)] border-[var(--brand-action)] text-white'
                          : 'border-[var(--border-neutral-weak)]'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onConfirmCities([]);
              onClose();
            }}
            className="kt-button--outlined"
          >
            همه شهرها
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="kt-button--ghost">
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmCities(draft);
                onClose();
              }}
              className="kt-button--primary !px-6"
            >
              تایید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Post Ad Modal (+ ثبت آگهی - Verbatim tahator.app Fields)              */
/* -------------------------------------------------------------------------- */
interface PostAdModalProps {
  onCreateListing: (listing: Listing) => void;
  onClose: () => void;
  aiConfig?: AiConfig;
}

export function PostAdModal({
  onCreateListing,
  onClose,
  aiConfig = DEFAULT_AI_CONFIG,
}: PostAdModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [city, setCity] = useState(CITIES[0].name);
  const [neighborhood, setNeighborhood] = useState(CITIES[0].neighborhoods[0]);
  const [price, setPrice] = useState('');
  const [phone1, setPhone1] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>({
    lat: IRAN_CITY_COORDS['تهران'][0],
    lng: IRAN_CITY_COORDS['تهران'][1],
  });
  const [isApproximateLoc, setIsApproximateLoc] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasExchange, setHasExchange] = useState(true);
  const [exchangeWith, setExchangeWith] = useState('');
  const [hasInstallmentPlan, setHasInstallmentPlan] = useState(true);
  const [description, setDescription] = useState('');
  const [isVerifiedPhotos, setIsVerifiedPhotos] = useState<'yes' | 'no'>('yes');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [aiAuditHint, setAiAuditHint] = useState<{
    approvalChance: number;
    warnings: string[];
    tips: string[];
  } | null>(null);
  const [error, setError] = useState('');

  const selectedCatObj = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];
  const selectedCityObj = CITIES.find((c) => c.name === city) || CITIES[0];

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const obj = CATEGORIES.find((c) => c.name === newCat);
    if (obj && obj.subcategories.length > 0) setSubcategory(obj.subcategories[0]);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const obj = CITIES.find((c) => c.name === newCity);
    if (obj && obj.neighborhoods.length > 0) setNeighborhood(obj.neighborhoods[0]);
    const base = IRAN_CITY_COORDS[newCity] || IRAN_CITY_COORDS['تهران'];
    setPickedCoords({ lat: base[0], lng: base[1] });
  };

  const handleRunAiCopilot = () => {
    const res = autoCompleteDraftAd({
      title: title || `${subcategory} در ${neighborhood}`,
      category,
      subcategory,
      city,
      neighborhood,
      price,
      exchangeWith,
    });
    setTitle(res.suggestedTitle);
    setCategory(res.detectedCategory);
    setSubcategory(res.detectedSubcategory);
    if (!price.trim()) setPrice(String(res.suggestedPrice));
    setHasExchange(true);
    setExchangeWith(res.suggestedExchangeWith);
    setDescription(res.suggestedDescription);
    setAiAuditHint({
      approvalChance: res.approvalChance,
      warnings: res.warnings,
      tips: res.tips,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 7 - uploadedImages.length);
    if (files.length === 0) return;

    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setError('حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    setError('');
    setUploadingImages(true);
    try {
      const res = await tahatorApi.uploadImages(files);
      const urls = res.items.map((item) => item.url);
      setUploadedImages((prev) => [...prev, ...urls].slice(0, 7));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'برای آپلود امن تصاویر، ابتدا وارد حساب کاربری خود شوید (فرمت JPEG، PNG یا WEBP).'
      );
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('لطفاً عنوان آگهی را وارد کنید.');
      return;
    }
    const cleanPhone = normalizeDigits(phone1.trim());
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('لطفاً شماره تماس اول معتبر وارد کنید.');
      return;
    }
    if (!pickedCoords) {
      setError('لطفاً موقعیت مکانی دقیق آگهی را روی نقشه دیوارگونه مشخص کنید.');
      return;
    }

    const cleanPrice = Number(normalizeDigits(price).replace(/[^\d]/g, '')) || 0;
    const finalImages = uploadedImages;

    const newListing: Listing = {
      id: `ad-user-${Date.now()}`,
      code: `TH-${Math.floor(406000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      subcategory,
      city,
      neighborhood,
      price: cleanPrice,
      priceLabel: cleanPrice === 0 ? 'توافقی' : undefined,
      isNegotiable: cleanPrice === 0,
      hasExchange,
      exchangeWith: hasExchange ? exchangeWith.trim() || 'کالا، خودرو یا ملک هم‌ارزش' : undefined,
      hasInstallmentPlan,
      isVerifiedPhotos: isVerifiedPhotos === 'yes',
      badge: hasExchange ? 'معاوضه' : undefined,
      publishedAt: 'لحظاتی پیش',
      timeCategory: '24h',
      images: finalImages,
      details: [
        { label: 'دسته‌بندی', value: `${category} - ${subcategory}` },
        { label: 'آدرس / محدوده', value: address.trim() || `${city}، ${neighborhood}` },
        ...(postalCode.trim() ? [{ label: 'کد پستی', value: toPersianDigits(postalCode.trim()) }] : []),
        ...(nationalId.trim() ? [{ label: 'کد ملی ثبت‌شده', value: 'تأیید شده' }] : []),
      ],
      description:
        description.trim() ||
        `${title.trim()} در ${city} (${neighborhood}). آماده بازدید و معامله یا تهاتر توافقی.`,
      sellerPhone: toPersianDigits(cleanPhone),
      sellerName: 'کاربر تهاتر آپ',
      coordinates: {
        lat: pickedCoords.lat,
        lng: pickedCoords.lng,
        streetHint: address.trim() || `محدوده ${neighborhood}`,
        isApproximate: isApproximateLoc,
        hasCoords: true,
      },
      isUserCreated: true,
    };

    onCreateListing(newListing);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
              ثبت آگهی جدید
            </h3>
            <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
              تمامی آگهی‌ها امکان فروش نقدی، معاوضه و بررسی شرایط پرداخت اقساطی دارند.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-[4px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[13px] font-medium">
              {error}
            </div>
          )}

          {/* عنوان آگهی * */}
          <div>
            <label className="block text-[13px] font-medium mb-1">عنوان آگهی *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: آپارتمان ۸۰ متری، خودرو سواری/سنگین/کشاورزی یا موتورسیکلت"
              className="kt-input"
            />
          </div>

          {/* Offline AI Ad Copilot Bar */}
          {aiConfig.enabled && aiConfig.adCopilot && (
            <div className="p-3 rounded-[6px] border border-[var(--brand-action)]/30 bg-[var(--brand-soft)]/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--brand-primary)]">
                  <Sparkles className="w-4 h-4" />
                  <span>دستیار ثبت آگهی (هوش مصنوعی آفلاین)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiCopilot}
                  className="kt-button--primary !h-[30px] !px-3 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تکمیل خودکار و تخمین قیمت ✨</span>
                </button>
              </div>
              {aiAuditHint && (
                <div className="text-[11px] text-[var(--content-neutral-stronger)] space-y-1 bg-white/80 p-2 rounded">
                  <div className="font-bold text-[var(--semantic-positive)]">
                    شانس تایید فوری ناظر: {toPersianDigits(aiAuditHint.approvalChance)}٪
                  </div>
                  {aiAuditHint.warnings.map((w, i) => (
                    <div key={i} className="text-[var(--semantic-negative)]">
                      • {w}
                    </div>
                  ))}
                  {aiAuditHint.tips.map((t, i) => (
                    <div key={i} className="text-[var(--content-neutral-default)]">
                      • {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* دسته‌بندی * و زیردسته * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">دسته‌بندی *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="kt-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">زیردسته *</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="kt-input"
              >
                {selectedCatObj.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* شهر * و محله */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">شهر *</label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="kt-input"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">محله</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="kt-input"
              >
                {selectedCityObj.neighborhoods.map((nb) => (
                  <option key={nb} value={nb}>
                    {nb}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* قیمت (تومان) */}
          <div>
            <label className="block text-[13px] font-medium mb-1">قیمت (تومان)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثلاً: ۵٬۰۰۰٬۰۰۰"
              className="kt-input text-left dir-ltr"
            />
          </div>

          {/* شماره تماس اول * و کد ملی (اختیاری) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">شماره تماس اول *</label>
              <input
                type="tel"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="09121234567"
                className="kt-input text-left dir-ltr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">کد ملی (اختیاری)</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="مثلاً: 0012345678"
                className="kt-input text-left dir-ltr"
              />
            </div>
          </div>

          {/* آدرس کامل (اختیاری) و کد پستی (اختیاری) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-[13px] font-medium mb-1">آدرس کامل (اختیاری)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="آدرس کامل محل..."
                className="kt-input"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[13px] font-medium mb-1">کد پستی (اختیاری)</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="مثلاً: 1234567890"
                className="kt-input text-left dir-ltr"
              />
            </div>
          </div>

          {/* موقعیت دقیق آگهی روی نقشه (دیوارگونه - الزامی) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div>
                <label className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                  موقعیت مکانی آگهی روی نقشه *
                </label>
                <p className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                  نقشه را جابه‌جا کنید تا پین قرمز روی محل دقیق ملک یا خودرو قرار گیرد.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const base = IRAN_CITY_COORDS[city] || IRAN_CITY_COORDS['تهران'];
                  setPickedCoords({ lat: base[0], lng: base[1] });
                }}
                className="px-2.5 py-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[11px] font-medium text-[var(--content-neutral-stronger)]"
              >
                📍 مرکز {city}
              </button>
            </div>
            <InteractiveMap
              mode="picker"
              selectedCity={city}
              selectedNeighborhood={neighborhood}
              centerLat={pickedCoords?.lat}
              centerLng={pickedCoords?.lng}
              isApproximate={isApproximateLoc}
              onToggleApproximate={setIsApproximateLoc}
              onPickLocation={(coords) => {
                setPickedCoords({ lat: coords.lat, lng: coords.lng });
                if (typeof coords.isApproximate === 'boolean') {
                  setIsApproximateLoc(coords.isApproximate);
                }
              }}
              heightClassName="h-[250px]"
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--content-neutral-default)]">
              <span>
                {pickedCoords
                  ? `مختصات ثبت‌شده: ${pickedCoords.lat.toFixed(4)}، ${pickedCoords.lng.toFixed(4)} (${city} - ${neighborhood})`
                  : 'موقعیتی روی نقشه انتخاب نشده است'}
              </span>
              {isApproximateLoc && (
                <span className="px-2 py-0.5 rounded bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] font-bold">
                  نمایش به صورت محدودهٔ تقریبی (دایره ۴۵۰ متری)
                </span>
              )}
            </div>
          </div>

          {/* امکان معاوضه و تسهیلات ۵۰/۵۰ */}
          <div className="p-3.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] space-y-2.5">
            <label className="block text-[13px] font-bold text-[var(--content-neutral-stronger)]">
              امکان معاوضه و فروش اقساطی
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasExchange}
                onChange={(e) => setHasExchange(e.target.checked)}
                className="accent-[var(--brand-action)] w-4 h-4"
              />
              <span className="text-[13px] font-medium text-[var(--brand-primary)] flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4" />
                <span>بله - امکان معاوضه (تهاتر) وجود دارد</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasInstallmentPlan}
                onChange={(e) => setHasInstallmentPlan(e.target.checked)}
                className="accent-[var(--brand-action)] w-4 h-4"
              />
              <span className="text-[13px] font-medium text-[var(--semantic-warning)] flex items-center gap-1.5">
                <Percent className="w-4 h-4" />
                <span>امکان خرید اقساطی با تسهیلات ۵۰/۵۰ (۱ تا ۵ سال · حتی بدون پیش‌پرداخت نقدی)</span>
              </span>
            </label>
            {hasExchange && (
              <input
                type="text"
                value={exchangeWith}
                onChange={(e) => setExchangeWith(e.target.value)}
                placeholder="مورد دلخواه جهت معاوضه (مثلاً: خودرو هم‌رده، ماشین‌آلات کشاورزی، موتورسیکلت یا ملک)..."
                className="kt-input !h-[36px] text-[12px]"
              />
            )}
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-[13px] font-medium mb-1">توضیحات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات آگهی خود را بنویسید..."
              className="kt-input !h-auto py-2.5 text-[13px] w-full"
            />
          </div>

          {/* عکس ها برای خود ملک یا وسایل یا خودرو شما هست ؟ */}
          <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[var(--content-neutral-stronger)]">
              عکس ها برای خود ملک یا وسایل یا خودرو شما هست ؟
            </span>
            <div className="flex items-center gap-4 text-[13px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="photoAuth"
                  checked={isVerifiedPhotos === 'yes'}
                  onChange={() => setIsVerifiedPhotos('yes')}
                  className="accent-[var(--brand-action)]"
                />
                <span>بله</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="photoAuth"
                  checked={isVerifiedPhotos === 'no'}
                  onChange={() => setIsVerifiedPhotos('no')}
                  className="accent-[var(--brand-action)]"
                />
                <span>خیر</span>
              </label>
            </div>
          </div>

          {/* تصاویر (حداکثر ۷ عکس) */}
          <div>
            <label className="block text-[13px] font-medium mb-1">
              تصاویر (حداکثر ۷ عکس)
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="w-24 h-20 rounded-[6px] border-2 border-dashed border-[var(--border-neutral-weak)] hover:border-[var(--brand-action)] flex flex-col items-center justify-center gap-1 text-[11px] text-[var(--content-neutral-default)] cursor-pointer transition-colors px-2 text-center">
                <Upload className="w-4 h-4" />
                <span>{uploadingImages ? 'در حال آپلود...' : '+ · افزودن عکس'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploadingImages}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {uploadedImages.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-[6px] overflow-hidden border border-[var(--border-neutral-weaker)]"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setUploadedImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="kt-button--outlined">
              انصراف
            </button>
            <button type="submit" className="kt-button--primary !px-8">
              ذخیره آگهی
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Facilities Calculator Modal (محاسبه آنلاین سود و قسط - tahator.app)     */
/* -------------------------------------------------------------------------- */
export function FacilitiesModal({
  onClose,
  onOpenAdminChat,
}: {
  onClose: () => void;
  onOpenAdminChat: () => void;
}) {
  const [calcMethod, setCalcMethod] = useState<'monthly' | 'annual'>('annual');
  const [inputMode, setInputMode] = useState<'deal5050' | 'directLoan'>('deal5050');
  const [zeroCashBarter, setZeroCashBarter] = useState(true);
  const [amountInput, setAmountInput] = useState('2000000000');
  const [rateInput, setRateInput] = useState('22');
  const [monthsInput, setMonthsInput] = useState('36');
  const [computed, setComputed] = useState<{
    rawAmount: number;
    loanAmount: number;
    rate: number;
    months: number;
    method: 'monthly' | 'annual';
    mode: 'deal5050' | 'directLoan';
  }>({
    rawAmount: 2_000_000_000,
    loanAmount: 1_000_000_000,
    rate: 22,
    months: 36,
    method: 'annual',
    mode: 'deal5050',
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Math.max(0, Number(normalizeDigits(amountInput).replace(/[^\d]/g, '')) || 0);
    const rate = Math.max(0, Number(normalizeDigits(rateInput)) || 0);
    const months = Math.min(60, Math.max(12, Number(normalizeDigits(monthsInput)) || 36));
    const loanAmount = inputMode === 'deal5050' ? Math.round(rawAmount * 0.5) : rawAmount;
    setComputed({ rawAmount, loanAmount, rate, months, method: calcMethod, mode: inputMode });
  };

  const applyPresetMonths = (m: number) => {
    setMonthsInput(String(m));
    const rawAmount = Math.max(0, Number(normalizeDigits(amountInput).replace(/[^\d]/g, '')) || 0);
    const rate = Math.max(0, Number(normalizeDigits(rateInput)) || 0);
    const loanAmount = inputMode === 'deal5050' ? Math.round(rawAmount * 0.5) : rawAmount;
    setComputed({ rawAmount, loanAmount, rate, months: m, method: calcMethod, mode: inputMode });
  };

  const calculation = useMemo(() => {
    const { rawAmount, loanAmount, rate, months, method, mode } = computed;
    const totalInterest =
      method === 'monthly'
        ? months * ((rate / 12 / 100) * loanAmount)
        : loanAmount * ((rate / 100) * (months / 12));
    const totalPayment = loanAmount + totalInterest;
    const monthlyPayment = months > 0 ? totalPayment / months : 0;
    const interestRatio =
      totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;
    const downPayment = mode === 'deal5050' ? Math.max(0, rawAmount - loanAmount) : 0;

    return {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestRatio,
    };
  }, [computed]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[610px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">محاسبه‌گر تسهیلات و اقساط ۵۰/۵۰ (۱ تا ۵ سال)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCalculate} className="p-5 overflow-y-auto space-y-4">
          {/* Verbatim Intro Text from tahator.app */}
          <div className="p-3.5 rounded-[6px] bg-[var(--brand-soft)] text-[12.5px] leading-[23px] text-[var(--content-neutral-stronger)] space-y-1.5 border border-[var(--brand-action)]/25">
            <p className="font-bold text-[var(--brand-primary)] text-[13.5px]">
              فرصت خرید ملک و خودرو را به تعویق نیندازید! (طرح ۵۰/۵۰ تهاتر آپ)
            </p>
            <p>
              ۵۰٪ ارزش معامله را نقد بپردازید یا <strong>حتی بدون پیش‌پرداخت نقدی</strong> با تهاتر ملک، خودرو یا موتورسیکلت تأمین کنید و ۵۰٪ مابقی را در اقساط <strong>۱ تا ۵ سال (۱۲ تا ۶۰ ماه)</strong> بپردازید.
            </p>
            <p className="text-[11.5px] text-[var(--content-neutral-default)]">
              پشتیبانی مستقیم پرونده‌های تسهیلات: <span className="font-bold dir-ltr">{toPersianDigits('02191016487')}</span>
            </p>
          </div>

          {/* انتخاب نحوه محاسبه ۵۰/۵۰ یا مبلغ مستقیم وام */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInputMode('deal5050')}
              className={`flex-1 py-2 px-3 rounded-[6px] border text-[12px] font-bold transition-colors ${
                inputMode === 'deal5050'
                  ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)]'
                  : 'bg-[var(--surface-neutral-default)] border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)]'
              }`}
            >
              محاسبه بر اساس قیمت کل ملک/خودرو (۵۰/۵۰)
            </button>
            <button
              type="button"
              onClick={() => setInputMode('directLoan')}
              className={`flex-1 py-2 px-3 rounded-[6px] border text-[12px] font-bold transition-colors ${
                inputMode === 'directLoan'
                  ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)]'
                  : 'bg-[var(--surface-neutral-default)] border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)]'
              }`}
            >
              وارد کردن مستقیم مبلغ تسهیلات
            </button>
          </div>

          {inputMode === 'deal5050' && (
            <label className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={zeroCashBarter}
                onChange={(e) => setZeroCashBarter(e.target.checked)}
                className="accent-[var(--semantic-positive)] w-4 h-4"
              />
              <span>بدون پیش‌پرداخت نقدی (تأمین ۵۰٪ اول از طریق تهاتر دارایی غیرنقدی)</span>
            </label>
          )}

          {/* بازه ۱ تا ۵ سال (کلیدهای سریع) */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--content-neutral-default)] mb-1.5">
              مدت بازپرداخت اقساط (۱ تا ۵ سال)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { m: 12, label: '۱ سال' },
                { m: 24, label: '۲ سال' },
                { m: 36, label: '۳ سال' },
                { m: 48, label: '۴ سال' },
                { m: 60, label: '۵ سال' },
              ].map((term) => (
                <button
                  key={term.m}
                  type="button"
                  onClick={() => applyPresetMonths(term.m)}
                  className={`py-1.5 rounded-[6px] border text-[12px] font-bold transition-colors ${
                    Number(monthsInput) === term.m
                      ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)]'
                      : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)] hover:bg-[var(--surface-neutral-weak)]'
                  }`}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          {/* روش محاسبه سود */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">روش محاسبه سود</label>
              <select
                value={calcMethod}
                onChange={(e) => setCalcMethod(e.target.value as 'monthly' | 'annual')}
                className="kt-input"
              >
                <option value="annual">سالانه (نرخ بانکی سالانه)</option>
                <option value="monthly">ماهانه</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">
                تعداد قسط (۱۲ تا ۶۰ ماه) *
              </label>
              <input
                type="number"
                min={12}
                max={60}
                value={monthsInput}
                onChange={(e) => setMonthsInput(e.target.value)}
                className="kt-input text-left dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">
                {inputMode === 'deal5050'
                  ? 'ارزش کل ملک یا خودرو (تومان) *'
                  : 'مبلغ تسهیلات درخواستی (تومان) *'}
              </label>
              <input
                type="number"
                min={0}
                step={10_000_000}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="kt-input text-left dir-ltr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">نرخ سود (% سالانه) *</label>
              <input
                type="number"
                min={0}
                max={48}
                step={0.5}
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="kt-input text-left dir-ltr"
              />
            </div>
          </div>

          {/* Buttons: انصراف / 📊 محاسبه */}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="kt-button--outlined">
              انصراف
            </button>
            <button type="submit" className="kt-button--primary !px-6">
              📊 محاسبه قسط و سود
            </button>
          </div>

          {/* Output Breakdown */}
          <div className="p-4 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] space-y-2.5">
            {computed.mode === 'deal5050' && (
              <div className="flex items-center justify-between text-[12.5px] pb-2 border-b border-[var(--border-neutral-weaker)]">
                <span className="text-[var(--content-neutral-default)]">
                  {zeroCashBarter ? '۵۰٪ آورده از طریق تهاتر دارایی (۰ نقد):' : '۵۰٪ پیش‌پرداخت نقد:'}
                </span>
                <span className="font-bold text-[var(--semantic-positive)]">
                  {formatToman(calculation.downPayment)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[var(--content-neutral-default)]">اصل تسهیلات ۵۰٪:</span>
              <span className="font-bold text-[var(--content-neutral-stronger)]">
                {formatToman(calculation.loanAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                مبلغ هر قسط ماهانه:
              </span>
              <span className="text-[17px] font-extrabold text-[var(--brand-primary)]">
                {formatToman(calculation.monthlyPayment)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[var(--content-neutral-default)]">مبلغ کل سود:</span>
              <span className="font-medium text-[var(--content-neutral-stronger)]">
                {formatToman(calculation.totalInterest)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[var(--content-neutral-default)]">
                مبلغ کل بازپرداخت:
              </span>
              <span className="font-bold text-[var(--content-neutral-stronger)]">
                {formatToman(calculation.totalPayment)}
              </span>
            </div>

            <div className="pt-1">
              <div className="h-2.5 w-full rounded-full overflow-hidden bg-[var(--border-neutral-weaker)] flex">
                <div
                  className="bg-[var(--brand-action)] h-full"
                  style={{ width: `${100 - calculation.interestRatio}%` }}
                />
                <div
                  className="bg-[var(--semantic-warning)] h-full"
                  style={{ width: `${calculation.interestRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--content-neutral-default)] mt-1">
                <span>اصل تسهیلات ({toPersianDigits(100 - calculation.interestRatio)}٪)</span>
                <span>سود دوره ({toPersianDigits(calculation.interestRatio)}٪)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdminChat();
            }}
            className="kt-button--outlined w-full"
          >
            <Headphones className="w-4 h-4 text-[var(--brand-action)]" />
            <span>ثبت درخواست تسهیلات با کارشناس</span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. 50/50 Barter Installment Plan Modal (شرایط خرید اقساطی و تهاتر ۵۰/۵۰)   */
/* -------------------------------------------------------------------------- */
export function InstallmentPlanModal({
  onClose,
  onOpenCalculator,
  onOpenAdminChat,
}: {
  onClose: () => void;
  onOpenCalculator: () => void;
  onOpenAdminChat: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">شرایط تسهیلات و خرید اقساطی ۵۰/۵۰ (۱ تا ۵ سال)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-[14px] leading-[26px]">
          <div className="p-4 rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand-primary)] space-y-1.5 border border-[var(--brand-action)]/25">
            <div className="font-bold text-[15px]">
              ۵۰٪ نقد یا تهاتر (حتی بدون پیش‌پرداخت نقدی) + ۵۰٪ اقساط ۱ تا ۵ سال
            </div>
            <p className="text-[13px] text-[var(--content-neutral-stronger)]">
              اگر امکان تأمین ۵۰٪ پیش‌پرداخت نقدی را ندارید، می‌توانید آورده خود را از طریق ارائه ملک، خودرو، موتورسیکلت یا دارایی غیرنقدی قابل تهاتر تأمین کنید و مابقی را در اقساط بلندمدت ۱۲ تا ۶۰ ماهه (۱ تا ۵ سال) بپردازید.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
              <div className="font-bold text-[13px] mb-1">۱. انتخاب و کارشناسی</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                انتخاب ملک یا خودرو و ارزش‌گذاری رسمی دو طرف با حضور کارشناس تهاتر آپ.
              </p>
            </div>
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
              <div className="font-bold text-[13px] mb-1">۲. تأمین ۵۰٪ (نقد یا تهاتر)</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                پوشش نیمه اول قرارداد به صورت نقدی یا با واگذاری دارایی غیرنقدی (بدون نقدینگی).
              </p>
            </div>
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
              <div className="font-bold text-[13px] mb-1">۳. تقسیط ۱۲ تا ۶۰ ماهه</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                پرداخت ۵۰٪ دوم طی اقساط ۱ تا ۵ سال متناسب با توان بازپرداخت شما.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-weak)] flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 font-medium">
              <Phone className="w-4 h-4 text-[var(--brand-action)]" />
              <span>خط مستقیم مشاوره تسهیلات و اقساط:</span>
            </span>
            <a href="tel:02191016487" className="font-bold dir-ltr text-[var(--brand-primary)] hover:underline">
              {toPersianDigits('02191016487')}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCalculator();
              }}
              className="kt-button--outlined flex-1"
            >
              <Calculator className="w-4 h-4" />
              <span>محاسبه آنلاین سود و قسط (۱ تا ۵ سال)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminChat();
              }}
              className="kt-button--primary flex-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>گفتگو با کارشناس تسهیلات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Live Chat Modal (چت و گفتگوی امن تهاتر آپ)                             */
/* -------------------------------------------------------------------------- */
export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  isAdmin?: boolean;
  messages: { id: string; sender: 'me' | 'other'; text: string; time: string }[];
}

interface ChatModalProps {
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onSendMessage: (threadId: string, text: string) => void;
  onClose: () => void;
  aiConfig?: AiConfig;
}

export function ChatModal({
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onClose,
  aiConfig = DEFAULT_AI_CONFIG,
}: ChatModalProps) {
  const [input, setInput] = useState('');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const threadRisk = useMemo(() => {
    if (!aiConfig.enabled || !aiConfig.chatSafetyShield || !activeThread) {
      return { riskLevel: 'safe' as const };
    }
    const combinedText = `${input} ${activeThread.messages.map((m) => m.text).join(' ')}`;
    return analyzeChatSafety(combinedText);
  }, [aiConfig, activeThread, input]);

  const smartReplies = useMemo(
    () =>
      activeThread
        ? generateSmartChatReplies(activeThread.subtitle || activeThread.title, true)
        : [],
    [activeThread]
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeThread) return;
    onSendMessage(activeThread.id, input.trim());
    setInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[780px] h-[82vh] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[16px] font-bold">چت و گفتگوی امن تهاتر آپ</h3>
            {aiConfig.enabled && aiConfig.chatSafetyShield && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>محافظ هوشمند فعال</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
          <div className="md:col-span-4 border-l border-[var(--border-neutral-weaker)] overflow-y-auto divide-y divide-[var(--border-neutral-weaker)]">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`w-full p-3 text-right transition-colors flex flex-col gap-1 ${
                  activeThread?.id === thread.id
                    ? 'bg-[var(--brand-soft)]'
                    : 'hover:bg-[var(--surface-neutral-weak)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[var(--content-neutral-stronger)] truncate">
                    {thread.title}
                  </span>
                  {thread.isAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--brand-action)] text-white text-[10px]">
                      پشتیبانی
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--content-neutral-default)] truncate">
                  {thread.subtitle}
                </span>
              </button>
            ))}
          </div>

          <div className="md:col-span-8 flex flex-col min-h-0 bg-[var(--surface-neutral-subtle)]">
            {activeThread ? (
              <>
                <div className="p-3 bg-[var(--surface-neutral-weaker)] border-b border-[var(--border-neutral-weaker)]">
                  <div className="text-[14px] font-bold">{activeThread.title}</div>
                  <div className="text-[11px] text-[var(--content-neutral-default)]">
                    {activeThread.subtitle}
                  </div>
                </div>

                {/* Offline AI Chat Safety Shield Alert */}
                {threadRisk.riskLevel !== 'safe' && threadRisk.warningText && (
                  <div
                    className={`px-3.5 py-2 text-[11px] font-bold flex items-center gap-2 border-b ${
                      threadRisk.riskLevel === 'danger'
                        ? 'bg-[var(--brand-soft)] text-[var(--semantic-negative)] border-[var(--semantic-negative)]/30'
                        : 'bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] border-[var(--semantic-warning)]/30'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{threadRisk.warningText}</span>
                  </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                  {activeThread.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'me' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-[8px] text-[13px] leading-[22px] ${
                          m.sender === 'me'
                            ? 'bg-[var(--brand-action)] text-white rounded-tr-none'
                            : 'bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)] rounded-tl-none'
                        }`}
                      >
                        <div>{m.text}</div>
                        <div
                          className={`text-[10px] mt-1 ${
                            m.sender === 'me'
                              ? 'text-white/75'
                              : 'text-[var(--content-neutral-weak)]'
                          }`}
                        >
                          {m.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {smartReplies.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => onSendMessage(activeThread.id, chip)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[var(--content-neutral-default)] hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1 text-right"
                    >
                      <Sparkles className="w-3 h-3 text-[var(--brand-action)] shrink-0" />
                      <span className="truncate max-w-[260px]">{chip}</span>
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-3 flex items-center gap-2 bg-[var(--surface-neutral-weaker)] border-t border-[var(--border-neutral-weaker)] mt-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="kt-input flex-1"
                  />
                  <button type="submit" className="kt-button--primary !px-4">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--content-neutral-default)] text-[14px]">
                یک گفتگو را انتخاب کنید.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. My Tahator Modal (تهاتر من / آگهی‌های من / نشان‌ها)                    */
/* -------------------------------------------------------------------------- */
interface MyTahatorModalProps {
  initialTab?: 'myAds' | 'bookmarks' | 'notes' | 'recent';
  user: { name: string; phone: string } | null;
  onLogin?: (user: { name: string; phone: string }) => void;
  onOpenAuthModal?: () => void;
  onLogout: () => void;
  myAds: Listing[];
  bookmarkedAds: Listing[];
  recentAds: Listing[];
  notes: Record<string, string>;
  onDeleteAd: (id: string) => void;
  onLadderAd: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onClose: () => void;
}

export function MyTahatorModal({
  initialTab = 'myAds',
  user,
  onOpenAuthModal,
  onLogout,
  myAds,
  bookmarkedAds,
  recentAds,
  notes,
  onDeleteAd,
  onLadderAd,
  onSelectListing,
  onClose,
}: MyTahatorModalProps) {
  const [tab, setTab] = useState<'myAds' | 'bookmarks' | 'notes' | 'recent'>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const noteEntries = Object.entries(notes).filter(([, text]) => text.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[86vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">تهاتر من (آگهی‌های من و نشان‌ها)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[var(--surface-neutral-subtle)] border-b border-[var(--border-neutral-weaker)]">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[15px]">{user.name}</div>
                <div className="text-[12px] text-[var(--content-neutral-default)] dir-ltr text-right">
                  {toPersianDigits(user.phone)}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="kt-button--outlined !h-[34px] text-[12px]"
              >
                خروج از حساب
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-[13px] font-medium text-[var(--content-neutral-stronger)]">
                برای مدیریت آگهی‌ها، ثبت آگهی و دسترسی به تهاتر من وارد حساب کاربری خود شوید:
              </div>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="kt-button--primary !h-[36px] text-[13px] shrink-0"
                >
                  ورود با شماره موبایل
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex border-b border-[var(--border-neutral-weaker)] text-[13px]">
          {[
            { id: 'myAds', label: `آگهی‌های من (${toPersianDigits(myAds.length)})`, icon: FileText },
            { id: 'bookmarks', label: `نشان‌ها (${toPersianDigits(bookmarkedAds.length)})`, icon: Bookmark },
            { id: 'notes', label: `یادداشت‌ها (${toPersianDigits(noteEntries.length)})`, icon: FileText },
            { id: 'recent', label: `بازدید اخیر (${toPersianDigits(recentAds.length)})`, icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as typeof tab)}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  tab === item.id
                    ? 'border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                    : 'border-transparent text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {tab === 'bookmarks' &&
            (bookmarkedAds.length === 0 ? (
              <p className="text-center py-8 text-[13px] text-[var(--content-neutral-default)]">
                هنوز آگهی‌ای را نشان نکرده‌اید.
              </p>
            ) : (
              bookmarkedAds.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => {
                    onSelectListing(ad);
                    onClose();
                  }}
                  className="p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] hover:border-[var(--border-neutral-weak)] flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium truncate">{ad.title}</div>
                    <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                      {ad.city} · {ad.price > 0 ? formatToman(ad.price) : 'توافقی'}
                    </div>
                  </div>
                </div>
              ))
            ))}

          {tab === 'myAds' &&
            (myAds.length === 0 ? (
              <p className="text-center py-8 text-[13px] text-[var(--content-neutral-default)]">
                شما هنوز آگهی جدیدی ثبت نکرده‌اید. از دکمه «+ ثبت آگهی» در بالا استفاده کنید.
              </p>
            ) : (
              myAds.map((ad) => (
                <div
                  key={ad.id}
                  className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3"
                >
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
                      className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium truncate">{ad.title}</div>
                      <div className="text-[12px] text-[var(--content-neutral-default)]">
                        {ad.badge && (
                          <span className="text-[var(--brand-action)] ml-2">{ad.badge}</span>
                        )}
                        {ad.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLadderAd(ad.id)}
                      className="kt-button--outlined !h-[32px] !px-2.5 text-[12px]"
                      title="نردبان آگهی"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                      <span>نردبان</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAd(ad.id)}
                      className="p-1.5 rounded hover:bg-[var(--brand-soft)] text-[var(--semantic-negative)]"
                      title="حذف آگهی"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ))}

          {tab === 'notes' &&
            (noteEntries.length === 0 ? (
              <p className="text-center py-8 text-[13px] text-[var(--content-neutral-default)]">
                یادداشتی روی آگهی‌ها ثبت نشده است.
              </p>
            ) : (
              noteEntries.map(([adId, text]) => (
                <div
                  key={adId}
                  className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] text-[13px]"
                >
                  <div className="text-[11px] text-[var(--content-neutral-default)] mb-1">
                    شناسه آگهی: {adId}
                  </div>
                  <div>{text}</div>
                </div>
              ))
            ))}

          {tab === 'recent' &&
            (recentAds.length === 0 ? (
              <p className="text-center py-8 text-[13px] text-[var(--content-neutral-default)]">
                هنوز آگهی‌ای را مشاهده نکرده‌اید.
              </p>
            ) : (
              recentAds.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => {
                    onSelectListing(ad);
                    onClose();
                  }}
                  className="p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] flex items-center gap-3 cursor-pointer hover:bg-[var(--surface-neutral-weak)]"
                >
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-12 h-12 rounded-[4px] object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{ad.title}</div>
                    <div className="text-[11px] text-[var(--content-neutral-default)]">
                      {ad.city} · {ad.neighborhood}
                    </div>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Support Modal (پشتیبانی و راهنمای تهاتر آپ)                             */
/* -------------------------------------------------------------------------- */
export function SupportModal({
  onClose,
  onOpenAdminChat,
  onSubmitTicket,
}: {
  onClose: () => void;
  onOpenAdminChat: () => void;
  onSubmitTicket?: (subject: string, category: 'فنی' | 'معاوضه و داوری' | 'تسهیلات و اقساط' | 'گزارش تخلف', text: string) => void;
}) {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'فنی' | 'معاوضه و داوری' | 'تسهیلات و اقساط' | 'گزارش تخلف'>('معاوضه و داوری');
  const [ticketText, setTicketText] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">پشتیبانی و تماس با ما (تهاتر آپ)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-[13px] leading-[24px] overflow-y-auto">
          <div className="p-3.5 rounded-[6px] bg-[var(--surface-neutral-weak)] flex items-center justify-between">
            <span className="font-medium">شماره تماس مستقیم پشتیبانی:</span>
            <span className="font-bold text-[15px] text-[var(--brand-primary)] dir-ltr">
              {toPersianDigits('02191016487')}
            </span>
          </div>

          <div className="space-y-2 text-[var(--content-neutral-default)]">
            <p>• پاسخگویی همه‌روزه توسط کارشناسان تهاتر، معاوضه و امنیت معاملات در tahator.app.</p>
            <p>• بررسی اصالت تصاویر آگهی‌ها و مشاوره تسهیلات و اقساط.</p>
            <p>
              • شبکه‌های اجتماعی رسمی:{' '}
              <span className="font-bold text-[var(--content-neutral-stronger)]">@tehatrup</span>
            </p>
          </div>

          {onSubmitTicket && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ticketSubject.trim() || !ticketText.trim()) return;
                onSubmitTicket(ticketSubject.trim(), ticketCategory, ticketText.trim());
                setTicketSent(true);
                setTicketSubject('');
                setTicketText('');
              }}
              className="p-3.5 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5"
            >
              <div className="font-bold text-[13px] text-[var(--content-neutral-stronger)]">
                ثبت تیکت در کارتابل کارشناس پشتیبانی
              </div>
              {ticketSent && (
                <div className="p-2 rounded bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-medium">
                  تیکت شما ثبت شد و در پنل کارشناس پشتیبانی قابل مشاهده است.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="موضوع تیکت..."
                  className="kt-input !h-[34px] text-[12px]"
                />
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as typeof ticketCategory)}
                  className="kt-input !h-[34px] text-[12px]"
                >
                  <option value="معاوضه و داوری">معاوضه و داوری</option>
                  <option value="تسهیلات و اقساط">تسهیلات و اقساط</option>
                  <option value="گزارش تخلف">گزارش تخلف</option>
                  <option value="فنی">فنی</option>
                </select>
              </div>
              <textarea
                rows={2}
                value={ticketText}
                onChange={(e) => setTicketText(e.target.value)}
                placeholder="شرح درخواست یا سوال خود را بنویسید..."
                className="w-full p-2.5 rounded-[4px] border border-[var(--border-neutral-weaker)] bg-white text-[12px]"
              />
              <button type="submit" className="kt-button--outlined w-full !h-[34px] text-[12px]">
                ارسال تیکت به پشتیبانی
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdminChat();
            }}
            className="kt-button--primary w-full"
          >
            <Headphones className="w-4 h-4" />
            <span>شروع گفتگو آنلاین با کارشناس</span>
          </button>
        </div>
      </div>
    </div>
  );
}
