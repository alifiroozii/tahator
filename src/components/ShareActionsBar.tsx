'use client';

import React, { useState } from 'react';
import { Check, Copy, MapPin, Navigation, Share2 } from 'lucide-react';
import { toPersianDigits } from '@/data/mockData';

export default function ShareActionsBar({
  listingCode,
  listingTitle,
  cityName,
  neighborhood,
  streetHint,
  lat,
  lng,
}: {
  listingCode: string;
  listingTitle: string;
  cityName: string;
  neighborhood?: string;
  streetHint?: string;
  lat?: number | null;
  lng?: number | null;
}) {
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [copiedMap, setCopiedMap] = useState(false);

  const getProductUrl = () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://tahator-web.liara.run';
    return `${origin}/ads/${encodeURIComponent(listingCode)}`;
  };

  const hasValidCoords =
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);

  const getMapShareUrl = () => {
    if (hasValidCoords) {
      return `https://maps.google.com/?q=${lat!.toFixed(6)},${lng!.toFixed(6)}`;
    }
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://tahator-web.liara.run';
    return `${origin}/ads/${encodeURIComponent(listingCode)}#map`;
  };

  const getNeshanUrl = () => {
    if (!hasValidCoords) return '';
    return `https://nshn.ir/?lat=${lat!.toFixed(6)}&lng=${lng!.toFixed(6)}`;
  };

  const copyProductLink = async () => {
    const url = getProductUrl();
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: toPersianDigits(listingTitle),
          text: `${toPersianDigits(listingTitle)} (${cityName}) در تهاتر آپ:`,
          url,
        });
        return;
      }
    } catch {
      // fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCopiedProduct(true);
    setTimeout(() => setCopiedProduct(false), 2200);
  };

  const copyMapLink = async () => {
    const mapUrl = getMapShareUrl();
    const locLabel = [cityName, neighborhood, streetHint].filter(Boolean).join('، ');
    const shareMsg = `موقعیت مکانی «${toPersianDigits(listingTitle)}» (${toPersianDigits(locLabel)}):\n${mapUrl}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `موقعیت نقشه: ${toPersianDigits(listingTitle)}`,
          text: shareMsg,
          url: mapUrl,
        });
        return;
      }
    } catch {
      // fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(shareMsg);
    } catch {}
    setCopiedMap(true);
    setTimeout(() => setCopiedMap(false), 2200);
  };

  const whatsappProductHref = `https://wa.me/?text=${encodeURIComponent(
    `${toPersianDigits(listingTitle)} در تهاتر آپ:\n${getProductUrl()}`,
  )}`;
  const telegramProductHref = `https://t.me/share/url?url=${encodeURIComponent(
    getProductUrl(),
  )}&text=${encodeURIComponent(toPersianDigits(listingTitle))}`;
  const whatsappMapHref = `https://wa.me/?text=${encodeURIComponent(
    `موقعیت نقشه «${toPersianDigits(listingTitle)}» (${cityName}):\n${getMapShareUrl()}`,
  )}`;

  return (
    <div className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void copyProductLink()}
          className="kt-button--outlined !h-[34px] !px-3 text-[11.5px] flex items-center gap-1.5"
        >
          {copiedProduct ? (
            <Check className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          )}
          <span>{copiedProduct ? 'لینک آگهی کپی شد ✓' : 'ارسال لینک آگهی'}</span>
        </button>

        <button
          type="button"
          onClick={() => void copyMapLink()}
          className="kt-button--outlined !h-[34px] !px-3 text-[11.5px] flex items-center gap-1.5"
        >
          {copiedMap ? (
            <Check className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          )}
          <span>{copiedMap ? 'لینک نقشه کپی شد ✓' : 'ارسال لینک نقشه'}</span>
        </button>

        {hasValidCoords && (
          <a
            href={getNeshanUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="kt-button--outlined !h-[34px] !px-3 text-[11.5px] flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-[var(--semantic-info)]" />
            <span>مسیریابی نشان</span>
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--content-neutral-default)]">
        <a
          href={whatsappProductHref}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--brand-primary)] underline"
        >
          ارسال محصول در واتساپ
        </a>
        <span>•</span>
        <a
          href={telegramProductHref}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--brand-primary)] underline"
        >
          ارسال محصول در تلگرام
        </a>
        <span>•</span>
        <a
          href={whatsappMapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--brand-primary)] underline flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          <span>ارسال موقعیت نقشه در واتساپ</span>
        </a>
      </div>
    </div>
  );
}
