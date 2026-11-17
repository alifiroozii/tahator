'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Percent, Phone } from 'lucide-react';
import { formatToman, toPersianDigits } from '@/data/mockData';

export default function AdInstallmentBox({
  listingCode,
  price,
  contactPhone,
}: {
  listingCode: string;
  price: number;
  contactPhone?: string;
}) {
  const [months, setMonths] = useState<number>(36);
  const [zeroCashBarter, setZeroCashBarter] = useState<boolean>(true);

  const calc = useMemo(() => {
    const downPayment = Math.round(price * 0.5);
    const loan = Math.max(0, price - downPayment);
    const totalPayable = Math.round(loan * (1 + 0.22 * (months / 12)));
    const monthly = months > 0 ? Math.round(totalPayable / months) : 0;
    return { downPayment, loan, monthly, totalPayable };
  }, [price, months]);

  if (!price || price <= 0) {
    return (
      <div className="p-4 rounded-[8px] border border-[var(--brand-action)]/30 bg-[var(--brand-soft)]/35 space-y-2">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand-primary)]">
          <Percent className="w-4 h-4" />
          <span>امکان خرید اقساطی ۵۰/۵۰ (۱ تا ۵ سال)</span>
        </div>
        <p className="text-[12px] text-[var(--content-neutral-default)] leading-[22px]">
          پس از توافق روی ارزش معامله، ۵۰٪ از مبلغ به‌صورت نقد یا تهاتر دارایی غیرنقدی (حتی بدون پیش‌پرداخت نقدی) و ۵۰٪ مابقی طی ۱۲ تا ۶۰ ماه تسویه می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-[8px] border border-[var(--brand-action)]/35 bg-[var(--brand-soft)]/35 space-y-3">
      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--brand-primary)]">
        <Percent className="w-4 h-4 shrink-0" />
        <span>تسهیلات و اقساط ۵۰/۵۰ (۱ تا ۵ سال · حتی بدون نقد)</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { m: 12, label: '۱ سال' },
          { m: 24, label: '۲ سال' },
          { m: 36, label: '۳ سال' },
          { m: 48, label: '۴ سال' },
          { m: 60, label: '۵ سال' },
        ].map((t) => (
          <button
            key={t.m}
            type="button"
            onClick={() => setMonths(t.m)}
            className={`px-2.5 py-1 rounded-[5px] text-[11px] font-bold border transition-colors ${
              months === t.m
                ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)]'
                : 'bg-[var(--surface-neutral-default)] text-[var(--content-neutral-stronger)] border-[var(--border-neutral-weaker)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setZeroCashBarter(false)}
          className={`py-1.5 px-2 rounded-[5px] border text-[11px] font-bold transition-colors ${
            !zeroCashBarter
              ? 'bg-[var(--surface-neutral-default)] border-[var(--brand-action)] text-[var(--brand-primary)]'
              : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
          }`}
        >
          ۵۰٪ پیش‌پرداخت نقد
        </button>
        <button
          type="button"
          onClick={() => setZeroCashBarter(true)}
          className={`py-1.5 px-2 rounded-[5px] border text-[11px] font-bold transition-colors ${
            zeroCashBarter
              ? 'bg-[var(--semantic-positive-soft)] border-[var(--semantic-positive)] text-[var(--semantic-positive)]'
              : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
          }`}
        >
          بدون نقد (با تهاتر)
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11.5px]">
        <div className="p-2 rounded-[6px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)]">
          <div className="text-[10px] text-[var(--content-neutral-default)]">
            {zeroCashBarter ? '۵۰٪ آورده تهاتری' : '۵۰٪ پیش‌پرداخت'}
          </div>
          <div className="font-bold mt-0.5 truncate">{formatToman(calc.downPayment)}</div>
        </div>
        <div className="p-2 rounded-[6px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)]">
          <div className="text-[10px] text-[var(--content-neutral-default)]">۵۰٪ تسهیلات</div>
          <div className="font-bold text-[var(--brand-primary)] mt-0.5 truncate">
            {formatToman(calc.loan)}
          </div>
        </div>
        <div className="p-2 rounded-[6px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)]">
          <div className="text-[10px] text-[var(--content-neutral-default)]">
            قسط ماهانه ({toPersianDigits(months)}م)
          </div>
          <div className="font-extrabold text-[var(--semantic-positive)] mt-0.5 truncate">
            {formatToman(calc.monthly)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href={`/?q=${encodeURIComponent(listingCode)}`}
          className="kt-button--primary flex-1 !h-[36px] text-[12px] flex items-center justify-center gap-1.5"
        >
          <Percent className="w-3.5 h-3.5" />
          <span>ثبت درخواست تسهیلات روی این آگهی</span>
        </Link>
        {contactPhone && !contactPhone.startsWith('محافظت') && (
          <a
            href={`tel:${contactPhone}`}
            className="kt-button--outlined !h-[36px] !px-3 text-[12px] flex items-center gap-1.5 dir-ltr"
          >
            <Phone className="w-3.5 h-3.5 text-[var(--brand-action)]" />
            <span>{toPersianDigits(contactPhone)}</span>
          </a>
        )}
      </div>
    </div>
  );
}
