import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Percent, Phone, ShieldCheck } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import AdInstallmentBox from '@/components/AdInstallmentBox';
import { buildFacilitiesPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { toPersianDigits } from '@/data/mockData';

export const metadata: Metadata = buildPageMetadata({
  title: 'تسهیلات و خرید اقساطی ۵۰/۵۰ ملک و خودرو (۱ تا ۵ سال · حتی بدون نقد)',
  description:
    'با طرح ۵۰/۵۰ تهاتر آپ، ۵۰٪ ارزش ملک یا خودرو را نقد یا با تهاتر دارایی غیرنقدی (حتی بدون پیش‌پرداخت نقدی) بپردازید و ۵۰٪ مابقی را در اقساط ۱۲ تا ۶۰ ماهه تسویه کنید.',
  path: '/facilities',
  keywords: ['وام خرید ملک', 'اقساط ۵۰/۵۰ خودرو', 'تهاتر بدون پیش‌پرداخت', 'تسهیلات ۱ تا ۵ سال'],
});

export default function FacilitiesSeoPage() {
  const jsonLd = buildFacilitiesPageJsonLd();

  return (
    <PublicPageShell activePath="/facilities">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        <section className="p-6 sm:p-8 rounded-[12px] border border-[var(--brand-action)]/30 bg-[var(--brand-soft)]/50 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-action)] text-white text-[12px] font-bold">
            <Percent className="w-4 h-4" />
            <span>طرح اختصاصی تسهیلات و اقساط ۵۰/۵۰ (۱۲ تا ۶۰ ماه)</span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-extrabold leading-[40px]">
            کمبود نقدینگی دارید؟ تا ۵۰٪ ارزش ملک و خودرو را در ۱ تا ۵ سال اقساط بپردازید
          </h1>
          <p className="text-[14.5px] leading-[28px] text-[var(--content-neutral-default)] max-w-3xl">
            در سامانه تهاتر آپ، ۵۰٪ اول معامله به انتخاب شما می‌تواند نقدی یا{' '}
            <strong>حتی بدون پیش‌پرداخت نقدی از طریق تهاتر ملک، خودرو یا موتورسیکلت</strong>{' '}
            تأمین شود و ۵۰٪ دوم طی اقساط منعطف {toPersianDigits('1')} تا {toPersianDigits('5')} سال (۱۲ تا ۶۰ ماه) تقسیط گردد.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-[18px] font-bold">مراحل دریافت تسهیلات و معامله مطمئن در تهاتر آپ</h2>
            <div className="space-y-3">
              {[
                {
                  step: '۱. انتخاب ملک، خودرو یا موتورسیکلت از آگهی‌ها',
                  detail: 'حتی اگر در آگهی فروشنده گزینه «امکان معاوضه» غیرفعال باشد، ما با پرداخت نقدی به فروشنده و تقسیط ۵۰٪ برای شما معامله را ممکن می‌کنیم.',
                },
                {
                  step: '۲. کارشناسی رسمی قیمت و اصالت مدارک',
                  detail: 'تیم کارشناسی و حقوقی تهاتر آپ ارزش واقعی دارایی شما و فروشنده را در حضور طرفین تایید و قرارداد رسمی تنظیم می‌کند.',
                },
                {
                  step: '۳. تقسیط ۱۲ تا ۶۰ ماهه بدون دغدغه',
                  detail: 'بازپرداخت منعطف ۵۰٪ تسهیلات طی ۱ تا ۵ سال متناسب با توان مالی شما و پشتیبانی مستقیم تا تحویل سند.',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-1.5"
                >
                  <div className="font-bold text-[14.5px] flex items-center gap-2 text-[var(--brand-primary)]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{s.step}</span>
                  </div>
                  <p className="text-[13px] leading-[24px] text-[var(--content-neutral-default)]">{s.detail}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[8px] border border-[var(--semantic-positive)]/30 bg-[var(--semantic-positive-soft)]/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--semantic-positive)]">
                <ShieldCheck className="w-5 h-5" />
                <span>مشاوره حضوری و بررسی فوری مدارک وام:</span>
              </div>
              <a href="tel:02191016487" className="kt-button--primary !h-[38px] !px-4 text-[12.5px] flex items-center gap-1.5 dir-ltr">
                <Phone className="w-4 h-4" />
                <span>{toPersianDigits('02191016487')}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-[17px] font-bold">شبیه‌ساز نمونه برای ملک یا خودرو ۲ میلیارد تومانی</h2>
            <AdInstallmentBox
              listingCode="TH-310"
              price={2_000_000_000}
              contactPhone="02191016487"
            />
            <Link href="/" className="kt-button--outlined w-full !h-[40px] text-[13px] flex items-center justify-center">
              مشاهده همه آگهی‌های دارای اقساط ۵۰/۵۰
            </Link>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
