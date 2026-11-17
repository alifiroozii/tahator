'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle2, MapPin, Navigation, X } from 'lucide-react';
import { formatToman, toPersianDigits } from '@/data/mockData';
import { IRAN_CITY_COORDS } from '@/components/InteractiveMap';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[270px] w-full flex items-center justify-center bg-[var(--surface-neutral-weak)] text-[12px] text-[var(--content-neutral-default)] rounded-[6px]">
      در حال بارگذاری نقشه...
    </div>
  ),
});

export interface UnpinnedListingPromptItem {
  id: string;
  code: string;
  title: string;
  neighborhood: string;
  streetHint?: string | null;
  price: string | number;
  city: { name: string; slug: string };
}

export default function MissingLocationModal({
  listings,
  isManual = false,
  onSaveLocation,
  onDismiss,
}: {
  listings: UnpinnedListingPromptItem[];
  isManual?: boolean;
  onSaveLocation: (
    listingId: string,
    coords: { lat: number; lng: number; isApproximate: boolean; streetHint?: string }
  ) => Promise<void>;
  onDismiss: (markCompletedPermanently: boolean) => Promise<void> | void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIdx = Math.min(activeIndex, Math.max(0, listings.length - 1));
  const current = listings[safeIdx];

  const defaultCityCoords =
    (current?.city?.name && IRAN_CITY_COORDS[current.city.name]) || IRAN_CITY_COORDS['تهران'];

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultCityCoords[0],
    lng: defaultCityCoords[1],
  });
  const [isApproximate, setIsApproximate] = useState(false);
  const [streetHint, setStreetHint] = useState(current?.streetHint || current?.neighborhood || '');
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  if (!current) return null;

  const remaining = listings.filter((item) => !savedIds.includes(item.id));

  const selectItem = (idx: number) => {
    const nextItem = listings[idx];
    if (!nextItem) return;
    setActiveIndex(idx);
    const cityBase = IRAN_CITY_COORDS[nextItem.city?.name] || IRAN_CITY_COORDS['تهران'];
    setCoords({ lat: cityBase[0], lng: cityBase[1] });
    setStreetHint(nextItem.streetHint || nextItem.neighborhood || '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveLocation(current.id, {
        lat: coords.lat,
        lng: coords.lng,
        isApproximate,
        streetHint: streetHint.trim() || current.neighborhood,
      });
      const updatedSaved = [...savedIds, current.id];
      setSavedIds(updatedSaved);
      const nextRemainingIdx = listings.findIndex((item) => !updatedSaved.includes(item.id));
      if (nextRemainingIdx !== -1) {
        selectItem(nextRemainingIdx);
      } else {
        await onDismiss(!isManual);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4"
      onClick={() => void onDismiss(false)}
    >
      <div
        className="w-full max-w-[660px] bg-[var(--surface-neutral-weaker)] border border-[var(--border-neutral-weaker)] rounded-[10px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border-neutral-weaker)] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--brand-primary)] font-extrabold text-[16px]">
              <MapPin className="w-5 h-5" />
              <span>تثبیت موقعیت مکانی آگهی‌ها روی نقشه</span>
            </div>
            <p className="text-[12px] text-[var(--content-neutral-default)] leading-[21px]">
              {isManual
                ? 'پین قرمز نقشه را روی موقعیت دقیق یا محدوده آگهی خود تنظیم کنید.'
                : 'مختصات نقشه برای آگهی‌های ثبت‌شدهٔ شما تکمیل نشده است. یک‌بار محل هر آگهی را روی نقشه دیوارگونه مشخص کنید تا بازدیدکنندگان دقیق‌تر پیدایش کنند.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onDismiss(false)}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center shrink-0"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {listings.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {listings.map((item, idx) => {
                const isDone = savedIds.includes(item.id);
                const isActive = idx === safeIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(idx)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-colors ${
                      isDone
                        ? 'bg-[var(--semantic-positive-soft)] border-[var(--semantic-positive)] text-[var(--semantic-positive)]'
                        : isActive
                          ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)]'
                          : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3 h-3" />}
                    <span className="max-w-[160px] truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-3 rounded-[8px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-[var(--content-neutral-stronger)] truncate">
                {current.title}
              </div>
              <div className="text-[11.5px] text-[var(--content-neutral-default)] mt-0.5">
                {current.city?.name || 'تهران'} · {current.neighborhood} · کد{' '}
                {toPersianDigits(current.code)} · باقیمانده:{' '}
                {toPersianDigits(remaining.length)} مورد
              </div>
            </div>
            <div className="text-[12.5px] font-bold text-[var(--brand-primary)]">
              {Number(current.price) > 0 ? formatToman(Number(current.price)) : 'توافقی'}
            </div>
          </div>

          <InteractiveMap
            mode="picker"
            selectedCity={current.city?.name || 'تهران'}
            selectedNeighborhood={current.neighborhood}
            centerLat={coords.lat}
            centerLng={coords.lng}
            isApproximate={isApproximate}
            onToggleApproximate={setIsApproximate}
            onPickLocation={(picked) => {
              setCoords({ lat: picked.lat, lng: picked.lng });
              if (typeof picked.isApproximate === 'boolean') {
                setIsApproximate(picked.isApproximate);
              }
            }}
            heightClassName="h-[260px]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-8">
              <label className="block text-[12px] font-medium mb-1">
                توضیح کوتاه محدوده / خیابان (نمایش در آگهی)
              </label>
              <input
                type="text"
                value={streetHint}
                onChange={(e) => setStreetHint(e.target.value)}
                placeholder={`مثلاً: محدوده ${current.neighborhood}`}
                className="kt-input !h-[38px] text-[12.5px]"
              />
            </div>
            <div className="sm:col-span-4 text-[11px] text-[var(--content-neutral-default)] dir-ltr text-left pb-2">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-neutral-weaker)]">
            {!isManual ? (
              <button
                type="button"
                onClick={() => void onDismiss(true)}
                className="kt-button--outlined !h-[38px] text-[12px] text-[var(--content-neutral-default)]"
              >
                بعداً انجام می‌دهم (دیگر نمایش نده)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onDismiss(false)}
                className="kt-button--outlined !h-[38px] text-[12px]"
              >
                انصراف
              </button>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="kt-button--primary !h-[38px] !px-5 text-[12.5px]"
            >
              <Navigation className="w-4 h-4" />
              <span>{saving ? 'در حال ذخیره موقعیت...' : 'ثبت موقعیت روی نقشه'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
