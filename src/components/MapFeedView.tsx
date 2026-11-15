'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, ArrowLeftRight, X } from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';

interface MapFeedViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onFilterCity: (city: string) => void;
  onCloseMap: () => void;
}

const CITY_MAP_POSITIONS: Record<
  string,
  { x: number; y: number; label: string }
> = {
  تبریز: { x: 20, y: 20, label: 'آذربایجان (تبریز)' },
  رشت: { x: 38, y: 22, label: 'گیلان (رشت)' },
  ساری: { x: 56, y: 23, label: 'مازندران (نوشهر/ساری)' },
  مشهد: { x: 84, y: 28, label: 'خراسان (مشهد)' },
  کرج: { x: 42, y: 34, label: 'البرز (کرج)' },
  تهران: { x: 49, y: 37, label: 'تهران بزرگ' },
  قم: { x: 48, y: 47, label: 'قم' },
  اصفهان: { x: 52, y: 59, label: 'اصفهان' },
  اهواز: { x: 35, y: 69, label: 'خوزستان (اهواز)' },
  شیراز: { x: 55, y: 78, label: 'فارس (شیراز)' },
};

export default function MapFeedView({
  listings,
  onSelectListing,
  onFilterCity,
  onCloseMap,
}: MapFeedViewProps) {
  const clusters = useMemo(() => {
    const grouped = new Map<string, Listing[]>();
    listings.forEach((item) => {
      const list = grouped.get(item.city) || [];
      list.push(item);
      grouped.set(item.city, list);
    });
    return Array.from(grouped.entries()).map(([city, items]) => ({
      city,
      items,
      pos: CITY_MAP_POSITIONS[city] || { x: 50, y: 50, label: city },
    }));
  }, [listings]);

  const [activeCity, setActiveCity] = useState<string>(
    clusters[0]?.city || 'تهران'
  );

  const selectedCluster =
    clusters.find((c) => c.city === activeCity) || clusters[0];

  return (
    <div className="mb-6 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-neutral-subtle)]">
        <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--content-neutral-stronger)]">
          <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>نمای نقشه و پراکندگی آگهی‌های تهاتر آپ</span>
          <span className="text-[11px] font-normal text-[var(--content-neutral-default)]">
            ({toPersianDigits(listings.length)} آگهی روی نقشه)
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMap}
          className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
        >
          <X className="w-3.5 h-3.5" />
          <span>بستن نقشه</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Stylized Interactive Map Canvas */}
        <div className="lg:col-span-7 relative h-[280px] sm:h-[340px] bg-[#eef3f7] overflow-hidden select-none border-b lg:border-b-0 lg:border-l border-[var(--border-neutral-weaker)]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full opacity-80"
          >
            <rect width="100" height="100" fill="#eef3f7" />
            {/* Stylized topography & road grid */}
            <path
              d="M8 32 Q25 10 58 18 Q84 20 92 48 Q86 80 56 88 Q26 84 14 58 Z"
              fill="#f9fafb"
              stroke="#d4dce4"
              strokeWidth="0.6"
            />
            <path
              d="M0 37 L100 37 M49 0 L49 100 M20 20 L49 37 L84 28 M49 37 L52 59 L55 78 M49 37 L35 69"
              stroke="#e2e8f0"
              strokeWidth="0.8"
              strokeDasharray="1.5 1.5"
              fill="none"
            />
            <ellipse cx="47" cy="14" rx="14" ry="5" fill="#dbeafe" />
            <ellipse cx="52" cy="94" rx="28" ry="6" fill="#dbeafe" />
          </svg>

          {clusters.map((cluster) => {
            const isSelected = selectedCluster?.city === cluster.city;
            return (
              <button
                key={cluster.city}
                type="button"
                onClick={() => setActiveCity(cluster.city)}
                style={{
                  left: `${cluster.pos.x}%`,
                  top: `${cluster.pos.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[var(--brand-action)] text-white border-white scale-110 z-20'
                    : 'bg-white text-[var(--content-neutral-stronger)] border-[var(--brand-action)]/40 hover:scale-105 z-10'
                }`}
              >
                <span>{cluster.city}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white text-[var(--brand-primary)]'
                      : 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                  }`}
                >
                  {toPersianDigits(cluster.items.length)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Cluster Listing Preview */}
        <div className="lg:col-span-5 p-3.5 max-h-[340px] overflow-y-auto space-y-2.5 bg-white">
          {selectedCluster ? (
            <>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-neutral-weaker)]">
                <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                  آگهی‌های محدوده {selectedCluster.city} (
                  {toPersianDigits(selectedCluster.items.length)})
                </div>
                <button
                  type="button"
                  onClick={() => onFilterCity(selectedCluster.city)}
                  className="text-[11px] font-bold text-[var(--brand-action)] hover:underline"
                >
                  فیلتر فقط {selectedCluster.city} ‹
                </button>
              </div>
              <div className="space-y-2">
                {selectedCluster.items.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectListing(item)}
                    className="w-full p-2 rounded-[6px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] flex items-center gap-2.5 text-right transition-colors"
                  >
                    <img
                      src={item.images[0] || '/ads/no-image.svg'}
                      alt={item.title}
                      className="w-12 h-12 rounded-[4px] object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-bold truncate text-[var(--content-neutral-stronger)]">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--brand-primary)] mt-0.5">
                        {item.hasExchange && <ArrowLeftRight className="w-3 h-3 shrink-0" />}
                        <span className="truncate">
                          {item.price > 0 ? formatToman(item.price) : 'توافقی'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--content-neutral-default)]">
                        {item.neighborhood} · {item.publishedAt}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-[13px] text-[var(--content-neutral-default)]">
              آگهی‌ای با فیلتر فعلی روی نقشه وجود ندارد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
