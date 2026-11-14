'use client';

import React, { useState } from 'react';
import {
  Camera,
  Video,
  MessageCircle,
  Bookmark,
  ArrowLeftRight,
  ImageOff,
  TrendingUp,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';

interface PostCardProps {
  listing: Listing;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (listing: Listing) => void;
  layoutMode?: 'horizontal' | 'vertical';
}

export default function PostCard({
  listing,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  layoutMode = 'horizontal',
}: PostCardProps) {
  const [imgError, setImgError] = useState(false);

  const primaryPriceDisplay = () => {
    if (listing.deposit && listing.rent) {
      return (
        <div className="space-y-0.5">
          <div className="truncate">ودیعه: {formatToman(listing.deposit)}</div>
          <div className="truncate">اجاره: {formatToman(listing.rent)}</div>
        </div>
      );
    }
    if (listing.priceLabel) {
      return <div className="truncate">{listing.priceLabel}</div>;
    }
    if (listing.price > 0) {
      return (
        <div className="truncate font-medium text-[var(--content-neutral-default)]">
          {formatToman(listing.price)}
        </div>
      );
    }
    return <div className="truncate">توافقی</div>;
  };

  if (layoutMode === 'vertical') {
    return (
      <article
        onClick={() => onSelect(listing)}
        className="border border-[var(--border-neutral-weaker)] rounded-[8px] bg-[var(--surface-neutral-weaker)] overflow-hidden flex flex-col hover:border-[var(--border-neutral-weak)] hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="relative w-full h-[180px] bg-[var(--surface-neutral-weak)] overflow-hidden">
          {!imgError && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--content-neutral-weak)]">
              <ImageOff className="w-8 h-8" />
            </div>
          )}

          {listing.hasExchange && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[4px] bg-[var(--brand-action)] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <ArrowLeftRight className="w-3 h-3" />
              <span>امکان معاوضه</span>
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(listing.id);
            }}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
            aria-label="نشان کردن آگهی"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked
                  ? 'fill-[var(--brand-action)] text-[var(--brand-action)]'
                  : 'text-[var(--content-neutral-default)]'
              }`}
            />
          </button>

          {listing.images.length > 0 && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-[4px] bg-black/60 text-white text-[11px] flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>{toPersianDigits(listing.images.length)}</span>
            </span>
          )}
        </div>

        <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-[24px] text-[var(--content-neutral-stronger)] line-clamp-2">
            {listing.title}
          </h3>

          <div className="space-y-1.5">
            {listing.hasExchange && listing.exchangeWith && (
              <div className="text-[11px] text-[var(--brand-primary)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-[4px] truncate">
                معاوضه با: {listing.exchangeWith}
              </div>
            )}
            <div className="text-[14px] font-bold text-[var(--brand-primary)]">
              {primaryPriceDisplay()}
            </div>
            <div className="flex items-center justify-between text-[12px] text-[var(--content-neutral-default)] pt-1 border-t border-[var(--border-neutral-weaker)]">
              <span className="truncate">
                {listing.city} · {listing.neighborhood}
              </span>
              <span className="shrink-0">{listing.publishedAt}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article onClick={() => onSelect(listing)} className="kt-post-card group relative">
      {/* Right Info Column (Start in RTL) */}
      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div>
          <h2 className="text-[16px] font-medium leading-[26px] text-[var(--content-neutral-stronger)] line-clamp-2 group-hover:text-[var(--brand-action)] transition-colors">
            {listing.title}
          </h2>
        </div>

        <div className="mt-auto space-y-1 pt-2">
          {/* Barter Tag Line */}
          {listing.hasExchange && (
            <div className="flex items-center gap-1 text-[12px] text-[var(--brand-primary)] truncate">
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {listing.exchangeWith ? `معاوضه: ${listing.exchangeWith}` : 'امکان معاوضه دارد'}
              </span>
            </div>
          )}

          {/* Price / Status Description */}
          <div className="text-[14px] leading-[22px] text-[var(--content-neutral-default)]">
            {primaryPriceDisplay()}
          </div>

          {/* Bottom Metadata Line */}
          <div className="flex items-center justify-between gap-2 pt-0.5 text-[12px] leading-[20px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              {listing.badge && (
                <span className="text-[var(--brand-action)] font-medium shrink-0">
                  {listing.badge}
                </span>
              )}
              <span className="text-[var(--content-neutral-default)] truncate">
                {listing.city} · {listing.publishedAt}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="text-[var(--content-neutral-weak)] hover:text-[var(--content-neutral-default)]"
                title="امکان چت فعال است"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(listing.id);
                }}
                className="p-0.5 rounded hover:bg-[var(--surface-neutral-weak)] transition-colors"
                aria-label="نشان کردن"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isBookmarked
                      ? 'fill-[var(--brand-action)] text-[var(--brand-action)]'
                      : 'text-[var(--content-neutral-weak)] hover:text-[var(--content-neutral-default)]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Left 136x136 Square Thumbnail */}
      <div className="w-[136px] h-[136px] shrink-0 relative rounded-[4px] overflow-hidden bg-[var(--surface-neutral-weak)] border border-[var(--border-neutral-weaker)]/50">
        {!imgError && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--content-neutral-weak)] gap-1">
            <ImageOff className="w-6 h-6" />
            <span className="text-[10px]">بدون تصویر</span>
          </div>
        )}

        {/* Top-left Photo/Video Count Pill */}
        {(listing.images.length > 0 || listing.hasVideo) && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[4px] bg-black/60 text-white text-[11px] font-medium flex items-center gap-1">
            {listing.hasVideo ? (
              <Video className="w-3 h-3" />
            ) : (
              <>
                <Camera className="w-3 h-3" />
                <span>{toPersianDigits(listing.images.length)}</span>
              </>
            )}
          </div>
        )}

        {/* Top-right Special Badge */}
        {listing.badge === 'پله شده' && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-[4px] bg-black/65 text-white text-[10px] font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>پله</span>
          </div>
        )}

        {listing.hasExchange && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[3px] bg-[var(--brand-action)]/95 text-white text-[10px] font-medium shadow-sm">
            معاوضه
          </div>
        )}
      </div>
    </article>
  );
}
