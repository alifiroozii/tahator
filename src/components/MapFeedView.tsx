'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ArrowLeftRight, X, Percent, RotateCcw } from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { resolveCityOrNeighborhoodCoords } from '@/components/InteractiveMap';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] sm:h-[420px] w-full flex items-center justify-center bg-[var(--surface-neutral-weak)] text-[12px] text-[var(--content-neutral-default)]">
      در حال بارگذاری نقشه دقیق دیوار...
    </div>
  ),
});

interface MapFeedViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onFilterCity: (city: string) => void;
  onCloseMap: () => void;
}

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
    }));
  }, [listings]);

  const [activeCity, setActiveCity] = useState<string>(
    clusters[0]?.city || 'همه شهرها'
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [boundsBox, setBoundsBox] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  const selectedCluster =
    activeCity === 'همه شهرها'
      ? { city: 'همه شهرها', items: listings }
      : clusters.find((c) => c.city === activeCity) || clusters[0];

  const visibleItems = useMemo(() => {
    const base = selectedCluster?.items || [];
    if (!boundsBox) return base;
    return base.filter((item, idx) => {
      const { coords } = resolveCityOrNeighborhoodCoords(
        item.city,
        item.neighborhood,
        item.coordinates?.lat,
        item.coordinates?.lng,
        idx
      );
      return (
        coords[0] <= boundsBox.north &&
        coords[0] >= boundsBox.south &&
        coords[1] <= boundsBox.east &&
        coords[1] >= boundsBox.west
      );
    });
  }, [selectedCluster, boundsBox]);

  return (
    <div className="mb-6 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-neutral-subtle)]">
        <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--content-neutral-stronger)]">
          <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>نمای نقشه دقیق (کیفیت نقشه دیوار)</span>
          <span className="text-[11px] font-normal text-[var(--content-neutral-default)]">
            ({toPersianDigits(visibleItems.length)} آگهی در محدوده)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {boundsBox && (
            <button
              type="button"
              onClick={() => setBoundsBox(null)}
              className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی محدوده</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMap}
            className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
          >
            <X className="w-3.5 h-3.5" />
            <span>بستن نقشه</span>
          </button>
        </div>
      </div>

      {clusters.length > 0 && (
        <div className="px-3.5 py-2 border-b border-[var(--border-neutral-weaker)] flex items-center gap-1.5 overflow-x-auto bg-[var(--surface-neutral-weaker)]">
          <button
            type="button"
            onClick={() => {
              setActiveCity('همه شهرها');
              setBoundsBox(null);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
              activeCity === 'همه شهرها'
                ? 'bg-[var(--brand-action)] text-white'
                : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] hover:bg-[var(--brand-soft)]'
            }`}
          >
            همه شهرها ({toPersianDigits(listings.length)})
          </button>
          {clusters.map((cluster) => (
            <button
              key={cluster.city}
              type="button"
              onClick={() => {
                setActiveCity(cluster.city);
                setBoundsBox(null);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                activeCity === cluster.city
                  ? 'bg-[var(--brand-action)] text-white'
                  : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] hover:bg-[var(--brand-soft)]'
              }`}
            >
              {cluster.city} ({toPersianDigits(cluster.items.length)})
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-l border-[var(--border-neutral-weaker)] p-2 bg-[var(--surface-neutral-subtle)]">
          <InteractiveMap
            mode="feed"
            listings={listings}
            selectedCity={activeCity}
            highlightedListingId={hoveredId}
            onSelectListing={onSelectListing}
            onFilterByBounds={setBoundsBox}
            heightClassName="h-[340px] sm:h-[420px]"
          />
        </div>

        <div className="lg:col-span-5 p-3.5 max-h-[436px] overflow-y-auto space-y-2.5 bg-[var(--surface-neutral-weaker)]">
          {selectedCluster ? (
            <>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-neutral-weaker)]">
                <div className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                  آگهی‌های محدوده {selectedCluster.city} (
                  {toPersianDigits(visibleItems.length)})
                </div>
                {selectedCluster.city !== 'همه شهرها' && (
                  <button
                    type="button"
                    onClick={() => onFilterCity(selectedCluster.city)}
                    className="text-[11px] font-bold text-[var(--brand-action)] hover:underline"
                  >
                    فیلتر فقط {selectedCluster.city} ‹
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {visibleItems.slice(0, 12).map((item) => {
                  const monthlyEst =
                    item.price > 0 ? Math.round(((item.price * 0.5) * 1.66) / 36) : 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => onSelectListing(item)}
                      className="w-full p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] flex items-center gap-2.5 text-right transition-colors bg-[var(--surface-neutral-subtle)]"
                    >
                      <img
                        src={item.images[0] || '/ads/no-image.svg'}
                        alt={item.title}
                        className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-[12.5px] font-bold truncate text-[var(--content-neutral-stronger)]">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--brand-primary)] font-bold">
                          {item.hasExchange && <ArrowLeftRight className="w-3 h-3 shrink-0" />}
                          <span className="truncate">
                            {item.price > 0 ? formatToman(item.price) : 'توافقی'}
                          </span>
                        </div>
                        {monthlyEst > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--semantic-warning)]">
                            <Percent className="w-2.5 h-2.5 shrink-0" />
                            <span>اقساط ۵۰/۵۰: ~ {formatToman(monthlyEst)} / ماه</span>
                          </div>
                        )}
                        <div className="text-[10px] text-[var(--content-neutral-default)]">
                          {item.city} · {item.neighborhood} · {item.publishedAt}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {visibleItems.length === 0 && (
                  <div className="py-8 text-center text-[12px] text-[var(--content-neutral-default)]">
                    در کادر فعلی نقشه آگهی‌ای یافت نشد؛ محدوده را جابه‌جا کنید یا بازنشانی بزنید.
                  </div>
                )}
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
