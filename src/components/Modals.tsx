'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import {
  CATEGORIES,
  CITIES,
  Listing,
  formatToman,
  toPersianDigits,
} from '@/data/mockData';

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
}

const SAMPLE_AD_IMAGES: Record<string, string[]> = {
  املاک: ['/ads/fake-1.svg', '/ads/fake-2.svg'],
  'وسایل نقلیه': ['/ads/fake-4.svg', '/ads/fake-6.svg'],
  'کالای دیجیتال': ['/ads/iphone16.svg', '/ads/macbook.svg'],
  'خانه و آشپزخانه': ['/ads/sofa.svg'],
  'وسایل شخصی': ['/ads/watch.svg'],
  'تجهیزات و صنعتی': ['/ads/fake-5.svg'],
};

export function PostAdModal({ onCreateListing, onClose }: PostAdModalProps) {
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
  const [pinPos, setPinPos] = useState<{ x: number; y: number } | null>({ x: 50, y: 50 });
  const [hasExchange, setHasExchange] = useState(true);
  const [description, setDescription] = useState('');
  const [isVerifiedPhotos, setIsVerifiedPhotos] = useState<'yes' | 'no'>('yes');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 7 - uploadedImages.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages((prev) => [...prev.slice(0, 6), reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('لطفاً عنوان آگهی را وارد کنید.');
      return;
    }
    if (!phone1.trim() || phone1.trim().length < 10) {
      setError('لطفاً شماره تماس اول معتبر وارد کنید.');
      return;
    }

    const cleanPrice = Number(price.replace(/[^\d]/g, '')) || 0;
    const fallbackImages = SAMPLE_AD_IMAGES[category] || ['/ads/fake-2.svg'];
    const finalImages = uploadedImages.length > 0 ? uploadedImages : [fallbackImages[0]];

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
      exchangeWith: hasExchange ? 'کالا، خودرو یا ملک هم‌ارزش' : undefined,
      hasInstallmentPlan: true,
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
      sellerPhone: toPersianDigits(phone1.trim()),
      sellerName: 'کاربر تهاتر آپ',
      coordinates: {
        lat: pinPos ? 35.7 + pinPos.y * 0.001 : 35.72,
        lng: pinPos ? 51.3 + pinPos.x * 0.001 : 51.35,
        streetHint: address.trim() || `محدوده ${neighborhood}`,
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
              placeholder="مثلاً: آپارتمان ۸۰ متری در تهران"
              className="kt-input"
            />
          </div>

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

          {/* موقعیت آگهی روی نقشه (اختیاری) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-[13px] font-medium">
                موقعیت آگهی روی نقشه (اختیاری)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPinPos({ x: 52, y: 48 })}
                  className="px-2.5 py-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[11px] font-medium text-[var(--content-neutral-stronger)]"
                >
                  📍 مکان فعلی من
                </button>
                <button
                  type="button"
                  onClick={() => setPinPos(null)}
                  className="px-2.5 py-1 rounded-[4px] bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] text-[11px] font-medium text-[var(--semantic-negative)]"
                >
                  ✖ حذف موقعیت
                </button>
              </div>
            </div>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setPinPos({ x, y });
              }}
              className="relative h-[126px] rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[#eef1f5] overflow-hidden cursor-crosshair"
            >
              <svg className="w-full h-full opacity-70" viewBox="0 0 400 130" preserveAspectRatio="none">
                <path
                  d="M0 35 L400 45 M0 90 L400 85 M90 0 L75 130 M200 0 L220 130 M320 0 L310 130"
                  stroke="#ffffff"
                  strokeWidth="6"
                />
              </svg>
              {pinPos && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-full transition-all"
                  style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
                >
                  <MapPin className="w-7 h-7 text-[var(--brand-action)] fill-[var(--brand-soft)] drop-shadow" />
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/90 text-[11px] text-[var(--content-neutral-default)]">
                {pinPos ? `${city} - ${neighborhood}` : 'موقعیتی انتخاب نشده'}
              </span>
            </div>
          </div>

          {/* امکان معاوضه */}
          <div className="p-3.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)]">
            <label className="block text-[13px] font-bold text-[var(--content-neutral-stronger)] mb-2">
              امکان معاوضه
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
                <span>بله - امکان معاوضه وجود دارد</span>
              </span>
            </label>
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-[13px] font-medium mb-1">توضیحات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات آگهی خود را بنویسید..."
              className="w-full p-3 rounded-[4px] border border-[var(--border-neutral-weaker)] focus:border-[var(--brand-action)] focus:outline-none text-[13px]"
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
                <span>+ · افزودن عکس</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
  const [amountInput, setAmountInput] = useState('500000000');
  const [rateInput, setRateInput] = useState('22');
  const [monthsInput, setMonthsInput] = useState('24');
  const [computed, setComputed] = useState<{
    amount: number;
    rate: number;
    months: number;
    method: 'monthly' | 'annual';
  }>({
    amount: 500_000_000,
    rate: 22,
    months: 24,
    method: 'annual',
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.max(0, Number(amountInput.replace(/[^\d]/g, '')) || 0);
    const rate = Math.max(0, Number(rateInput) || 0);
    const months = Math.max(1, Number(monthsInput) || 1);
    setComputed({ amount, rate, months, method: calcMethod });
  };

  const calculation = useMemo(() => {
    const { amount, rate, months, method } = computed;
    const monthlyRate = method === 'monthly' ? rate / 100 : rate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    const monthlyPayment =
      monthlyRate === 0
        ? amount / months
        : (amount * (monthlyRate * factor)) / (factor - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    const interestRatio =
      totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;

    return {
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
        className="w-full max-w-[580px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">محاسبه آنلاین سود و قسط</h3>
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
          <div className="p-3.5 rounded-[6px] bg-[var(--brand-soft)] text-[13px] leading-[23px] text-[var(--content-neutral-stronger)] space-y-1">
            <p className="font-bold text-[var(--brand-primary)]">
              فرصت خرید را به تعویق نیندازید!
            </p>
            <p>
              اگر ملکی، خودرویی یا دارایی ارزشمندی دارید و قصد خرید ملک، خودرو یا کالای دیگری را دارید، در tahator.app درخواست خود را ثبت کنید.
            </p>
            <p>
              با امکان تهاتر بخشی از ارزش معامله و بررسی شرایط پرداخت اقساطی، راهکار مناسب خود را برای انجام معامله پیدا کنید.
            </p>
            <p className="font-bold text-[var(--brand-primary)] pt-0.5">
              tahator.app هوشمندانه معامله کنید، آسان‌تر خرید کنید
            </p>
            <p className="text-[12px] text-[var(--content-neutral-default)]">
              برای محاسبه قسط و سود در خرید اقساطی گوشی، کالا و ... از پارامترهای کادر زیر را وارد کنید و روی محاسبه کلیک کنید.
            </p>
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
                <option value="annual">سالانه</option>
                <option value="monthly">ماهانه</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">
                تعداد قسط (ماه) *
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={monthsInput}
                onChange={(e) => setMonthsInput(e.target.value)}
                className="kt-input text-left dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium mb-1">
                مبلغ باقیمانده برای قسط‌بندی (تومان) *
              </label>
              <input
                type="number"
                min={0}
                step={1_000_000}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="kt-input text-left dir-ltr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1">نرخ سود (%) *</label>
              <input
                type="number"
                min={0}
                max={100}
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
              📊 محاسبه
            </button>
          </div>

          {/* Output Breakdown */}
          <div className="p-4 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--content-neutral-default)]">
                مبلغ هر قسط:
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
                <span>اصل مبلغ ({toPersianDigits(100 - calculation.interestRatio)}٪)</span>
                <span>سود ({toPersianDigits(calculation.interestRatio)}٪)</span>
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
        className="w-full max-w-[560px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-[17px] font-bold">شرایط خرید اقساطی و تهاتر ۵۰/۵۰</h3>
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
          <div className="p-4 rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand-primary)]">
            <div className="font-bold text-[15px] mb-1">
              ۵۰٪ تهاتر کالا، ملک یا خودرو + ۵۰٪ اقساط بانکی بلندمدت
            </div>
            <p className="text-[13px]">
              در پلتفرم تهاتر آپ (tahator.app)، اگر کالا یا ملک شما نیمی از ارزش معامله را پوشش دهد، مابه‌التفاوت آن از طریق تسهیلات اقساطی بین ۶ تا ۳۶ ماه تقسیط می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)]">
              <div className="font-bold text-[13px] mb-1">۱. انتخاب و کارشناسی</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                انتخاب آگهی و ارزش‌گذاری عادلانه دو طرف با حضور کارشناس.
              </p>
            </div>
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)]">
              <div className="font-bold text-[13px] mb-1">۲. تهاتر بخش اول</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                پرداخت یا تحویل بخشی از ارزش معامله به صورت نقد یا تهاتر کالا و خودرو.
              </p>
            </div>
            <div className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)]">
              <div className="font-bold text-[13px] mb-1">۳. تقسیط باقیمانده</div>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                بررسی شرایط پرداخت اقساطی متناسب با توان پرداخت خریدار.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-weak)] flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 font-medium">
              <Phone className="w-4 h-4 text-[var(--brand-action)]" />
              <span>خط مستقیم مشاوره اقساط و تهاتر:</span>
            </span>
            <span className="font-bold dir-ltr">{toPersianDigits('02191016487')}</span>
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
              <span>محاسبه آنلاین سود و قسط</span>
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
              <span>گفتگو با کارشناس</span>
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
}

export function ChatModal({
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onClose,
}: ChatModalProps) {
  const [input, setInput] = useState('');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

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
                  {[
                    'سلام، امکان معاوضه با خودرو دارید؟',
                    'آیا طرح اقساط ۵۰/۵۰ شامل این آگهی می‌شود؟',
                    'زمان بازدید حضوری چه ساعتی است؟',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => onSendMessage(activeThread.id, chip)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[var(--content-neutral-default)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                      {chip}
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
/* 6. My Tahator Modal (تهاتر من / آگهی‌های من / ثبت نام / نشان‌ها)         */
/* -------------------------------------------------------------------------- */
interface MyTahatorModalProps {
  initialTab?: 'myAds' | 'bookmarks' | 'notes' | 'recent';
  user: { name: string; phone: string } | null;
  onLogin: (user: { name: string; phone: string }) => void;
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
  onLogin,
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
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

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
            <h3 className="text-[17px] font-bold">تهاتر من (آگهی‌های من و ثبت نام)</h3>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!phoneInput.trim()) return;
                onLogin({
                  name: nameInput.trim() || 'کاربر تهاتر آپ',
                  phone: phoneInput.trim(),
                });
              }}
              className="space-y-2.5"
            >
              <div className="text-[13px] font-medium text-[var(--content-neutral-stronger)]">
                برای مدیریت آگهی‌ها، ثبت آگهی و دسترسی به تهاتر من وارد شوید یا ثبت نام کنید:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="kt-input !h-[36px] text-[13px]"
                />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="شماره موبایل (0912...)"
                  className="kt-input !h-[36px] text-[13px] text-left dir-ltr"
                />
                <button type="submit" className="kt-button--primary !h-[36px] text-[13px]">
                  ثبت نام / ورود
                </button>
              </div>
            </form>
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
                      src={ad.images[0]}
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
}: {
  onClose: () => void;
  onOpenAdminChat: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--surface-neutral-weaker)] rounded-[8px] shadow-2xl overflow-hidden"
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

        <div className="p-5 space-y-4 text-[13px] leading-[24px]">
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

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdminChat();
            }}
            className="kt-button--primary w-full"
          >
            <Headphones className="w-4 h-4" />
            <span>شروع گفتگو با ادمین سایت</span>
          </button>
        </div>
      </div>
    </div>
  );
}
