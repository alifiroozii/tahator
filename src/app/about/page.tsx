import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

export const metadata: Metadata = {
  title: 'درباره تهاتر آپ',
  description:
    'آشنایی با سامانه هوشمند تهاتر و معاوضه املاک، خودرو و موتورسیکلت تهاتر آپ (tahator.app)، زنجیره تهاتر سه‌طرفه و تسهیلات ۵۰/۵۰.',
};

export default function AboutPage() {
  return (
    <PublicPageShell activePath="/about">
      <div className="max-w-[880px] mx-auto space-y-8">
        <section className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
            درباره تهاتر آپ (tahator.app)
          </span>
          <h1 className="text-[26px] sm:text-[32px] font-extrabold leading-[44px]">
            نخستین پلتفرم هوشمند تهاتر چندجانبه املاک، خودرو و موتورسیکلت در ایران
          </h1>
          <p className="text-[15px] leading-[30px] text-[var(--content-neutral-default)]">
            تهاتر آپ با هدف شکستن بن‌بست نقدینگی در معاملات سرمایه‌ای طراحی شده است. در این سامانه مالکان املاک، خودروهای سواری، سنگین، ماشین‌آلات کشاورزی و موتورسیکلت می‌توانند بدون نیاز به فروش نقدی اولیه، دارایی خود را با قیمت منصفانه کارشناسی‌شده مستقیماً معاوضه کنند.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Sparkles,
              title: 'موتور تطبیق و زنجیره سه‌طرفه',
              desc: 'الگوریتم هوشمند سامانه حلقه‌های معاوضه میان ۲ یا ۳ معامله‌گر را به‌صورت خودکار شناسایی و معرفی می‌کند.',
            },
            {
              icon: ArrowLeftRight,
              title: 'تسهیلات ۵۰/۵۰ مابه‌التفاوت',
              desc: 'پوشش مابه‌التفاوت ارزش دارایی‌ها با تسهیلات اقساطی ۶ تا ۲۴ ماهه تحت نظارت افسر اعتبار سامانه.',
            },
            {
              icon: ShieldCheck,
              title: '۹ میز تخصصی امنیت و داوری',
              desc: 'از کارشناسی میدانی دارایی تا داور حقوقی تفاهم‌نامه و سپر ضد فیشینگ گفتگوها برای امنیت کامل معامله.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2.5"
              >
                <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
                <h2 className="text-[15px] font-bold">{card.title}</h2>
                <p className="text-[13px] leading-[24px] text-[var(--content-neutral-default)]">{card.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="p-6 rounded-[10px] border border-[var(--border-neutral-weaker)] space-y-3">
          <h2 className="text-[18px] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--semantic-positive)]" />
            <span>حوزه‌های تخصصی فعال</span>
          </h2>
          <p className="text-[14px] leading-[28px] text-[var(--content-neutral-default)]">
            برای حفظ کیفیت کارشناسی و تمرکز بر معاملات اصیل، پلتفرم تهاتر آپ به‌صورت تخصصی روی سه دسته <strong>املاک و مستغلات</strong>، <strong>انواع خودرو (سبک، سنگین، راه‌سازی و کشاورزی)</strong> و <strong>موتورسیکلت</strong> متمرکز است.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/" className="kt-button--primary !h-[38px] !px-5 text-[13px]">
              مشاهده آگهی‌های تهاتر
            </Link>
            <Link href="/blog" className="kt-button--outlined !h-[38px] !px-5 text-[13px]">
              مطالعه راهنمای تهاتر در وبلاگ
            </Link>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
