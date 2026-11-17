import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, Calculator, CheckCircle2, Percent, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import { buildAiPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { toPersianDigits } from '@/data/mockData';

export const metadata: Metadata = buildPageMetadata({
  title: 'دستیار و کارشناس هوش مصنوعی تهاتر آپ | ارزیابی قیمت ملک و خودرو',
  description:
    'تحلیل هوشمند قیمت منصفانه املاک و خودرو در بازار، زنجیره معاوضه چندجانبه، چک‌لیست کارشناسی حقوقی و محاسبه لحظه‌ای اقساط ۵۰/۵۰ (۱ تا ۵ سال).',
  path: '/ai',
  keywords: ['هوش مصنوعی تهاتر', 'قیمت‌گذاری هوشمند ملک', 'ارزیابی خودرو با هوش مصنوعی', 'مشاوره وام اقساطی'],
});

export default function AiOverviewPage() {
  const jsonLd = buildAiPageJsonLd();

  return (
    <PublicPageShell activePath="/ai">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        <section className="p-6 sm:p-8 rounded-[12px] border border-[var(--brand-action)]/30 bg-[var(--brand-soft)]/50 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-action)] text-white text-[12px] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>سیستم هوش مصنوعی دیوارگونه در تمام بخش‌های تهاتر آپ</span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-extrabold leading-[40px] text-[var(--content-neutral-stronger)]">
            کارشناس و دستیار هوشمند تهاتر آپ: درک بازار، مقایسه منصفانه و پیشنهاد اقساط
          </h1>
          <p className="text-[14.5px] leading-[28px] text-[var(--content-neutral-default)] max-w-3xl">
            هوش مصنوعی تهاتر آپ درست داخل هر صفحه آگهی و در چت‌بات مشاور، وضعیت قیمت را با آگهی‌های هم‌رده شهر شما مقایسه می‌کند، چک‌لیست تخصصی بررسی سند یا شاسی را نمایش می‌دهد و در صورت کمبود نقدینگی بهترین ساختار وام ۵۰/۵۰ (۱ تا ۵ سال) را پیشنهاد می‌کند.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/" className="kt-button--primary !h-[42px] !px-5 text-[13px] flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>مشاهده آگهی‌ها همراه تحلیل هوشمند</span>
            </Link>
            <Link href="/facilities" className="kt-button--outlined !h-[42px] !px-5 text-[13px] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>محاسبه تسهیلات ۱ تا ۵ سال</span>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: 'ارزیابی لحظه‌ای قیمت در همان صفحه',
              desc: 'روی هر آگهی ملک یا خودرو، بازه منصفانه بازار بر اساس متراژ، شهر و آگهی‌های مشابه همان لحظه نمایش داده می‌شود.',
            },
            {
              icon: Percent,
              title: 'تأمین کسری بودجه و معرفی فایل هم‌بودجه',
              desc: 'کافی است بودجه یا مدل دلخواهتان را به چت‌بات بگویید تا فایل‌های مناسب را همراه قسط ۱ تا ۵ ساله معرفی کند.',
            },
            {
              icon: ShieldCheck,
              title: 'چک‌لیست امنیت، سند و حضور کارشناس',
              desc: 'هشدارهای هوشمند پیش از بازدید و چک‌لیست تخصصی اصالت سند، پایان کار و فنی خودرو روی تک‌تک آگهی‌ها فعال است.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5"
            >
              <card.icon className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-[16px] font-bold">{card.title}</h2>
              <p className="text-[13px] leading-[24px] text-[var(--content-neutral-default)]">
                {toPersianDigits(card.desc)}
              </p>
            </div>
          ))}
        </section>

        <section className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] space-y-3">
          <h2 className="text-[17px] font-bold">پاسخ به سوالات رایج درباره هوش مصنوعی و معامله امن</h2>
          <div className="space-y-2 text-[13.5px] leading-[26px] text-[var(--content-neutral-default)]">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--semantic-positive)] shrink-0 mt-1" />
              <span>تمامی برآوردهای هوش مصنوعی جهت تصمیم‌گیری سریع‌تر هستند و معامله نهایی در حضور کارشناس رسمی تهاتر آپ نهایی می‌شود.</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--semantic-positive)] shrink-0 mt-1" />
              <span>خط مستقیم مشاوره و کارشناسی حضوری: <strong className="dir-ltr">{toPersianDigits('02191016487')}</strong></span>
            </p>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
