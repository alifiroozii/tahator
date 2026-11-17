'use client';

import React, { useMemo } from 'react';
import { Bot, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { evaluateListingPrice, generateSmartListingSummary } from '@/lib/offlineAi';
import { openGlobalChatbot } from '@/components/FloatingAiChatbot';

export default function InlineAdAiSection({
  listing,
  allListings = [],
}: {
  listing: Listing;
  allListings?: Listing[];
}) {
  const priceEval = useMemo(
    () => evaluateListingPrice(listing, allListings.length > 0 ? allListings : [listing]),
    [listing, allListings],
  );
  const summary = useMemo(() => generateSmartListingSummary(listing), [listing]);

  const isVehicle = listing.category === 'خودرو' || listing.category === 'موتورسیکلت';
  const checklist = isVehicle
    ? [
        'بررسی اصالت برگ سبز، کارت ماشین، پلاک موتور و تطبیق شماره شاسی',
        'کارشناسی رنگ، شاسی‌ها و تست فنی پیشرانه و گیربکس پیش از قولنامه',
        'استعلام خلافی، عوارض آزادراهی و وضعیت بیمه شخص ثالث',
      ]
    : [
        'استعلام ثبتی اصالت سند (تک‌برگ/دفترچه‌ای/بنچاق) و نبود بازداشتی',
        'بررسی پایان کار، عوارض شهرداری و تطبیق متراژ سندی با وضعیت موجود',
        'تنظیم تفاهم‌نامه رسمی و توافق کارشناسی ارزش‌گذاری در حضور مشاور',
      ];

  return (
    <section className="p-4 rounded-[8px] border border-[var(--brand-action)]/25 bg-[var(--surface-neutral-subtle)] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-[var(--brand-primary)]">
          <Sparkles className="w-4 h-4" />
          <span>تحلیل هوشمند دیوارگونه و کارشناسی آگهی</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>شاخص شفافیت: {toPersianDigits(summary.safetyScore)}٪</span>
        </span>
      </div>

      {listing.price > 0 && (
        <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)] space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-1 font-bold text-[var(--content-neutral-stronger)]">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>ارزیابی قیمت نسبت به بازار {listing.city}:</span>
            </span>
            <span className="font-extrabold text-[var(--brand-primary)]">{priceEval.statusLabel}</span>
          </div>
          <div className="flex flex-wrap justify-between text-[11px] text-[var(--content-neutral-default)]">
            <span>بازه منصفانه برآوردی: {formatToman(priceEval.minFair)} تا {formatToman(priceEval.maxFair)}</span>
            <span>دقت تخمین: {toPersianDigits(priceEval.confidence)}٪</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="text-[12px] font-bold text-[var(--content-neutral-stronger)]">
          نکات کلیدی این {isVehicle ? 'وسیله نقلیه' : 'ملک'} قبل از بازدید:
        </div>
        <ul className="space-y-1 text-[11.5px] text-[var(--content-neutral-default)]">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--semantic-positive)] shrink-0 mt-0.5" />
              <span>{toPersianDigits(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-neutral-weaker)]">
        <span className="text-[11px] font-medium text-[var(--content-neutral-default)]">
          {listing.hasExchange
            ? 'فروشنده امکان معاوضه را تایید کرده و تسهیلات ۵۰/۵۰ نیز فعال است.'
            : 'فروش نقدی است، اما در صورت کسری نقدینگی می‌توانید از وام ۵۰/۵۰ تهاتر آپ استفاده کنید.'}
        </span>
        <button
          type="button"
          onClick={() =>
            openGlobalChatbot({
              listingId: listing.id,
              prefill: `درباره آگهی «${listing.title}» با کد ${listing.code} راهنمایی کن؛ اگر نقدینگی کامل نداشته باشم قسط ۵ ساله چقدر می‌شود؟`,
            })
          }
          className="kt-button--outlined !h-[32px] !px-3 text-[11.5px] !border-[var(--brand-action)]/40 text-[var(--brand-primary)] hover:!bg-[var(--brand-soft)]"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>مشورت با چت‌بات درباره این آگهی</span>
        </button>
      </div>
    </section>
  );
}
