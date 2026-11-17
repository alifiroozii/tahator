import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

export const metadata: Metadata = {
  title: 'سوالات متداول',
  description:
    'پاسخ به پرسش‌های پرتکرار درباره ثبت آگهی، تهاتر سه‌طرفه، تسهیلات ۵۰/۵۰، کارشناسی دارایی و امنیت معاملات در تهاتر آپ.',
};

const FAQ_ITEMS = [
  {
    q: 'تهاتر سه‌طرفه در تهاتر آپ چگونه کار می‌کند؟',
    a: 'وقتی دارایی شما مستقیماً مورد نیاز فروشنده هدف نباشد، الگوریتم هوشمند سامانه یک نفر سوم را پیدا می‌کند تا حلقه بسته معاوضه بین سه نفر کامل شود و همه بدون فروش نقدی به هدف خود برسند.',
  },
  {
    q: 'شرایط دریافت تسهیلات ۵۰/۵۰ چیست؟',
    a: 'چنانچه حداقل نیمی از ارزش معامله از طریق دارایی تهاتری پوشش داده شود، مابه‌التفاوت باقی‌مانده قابل تقسیط در اقساط ۶ تا ۲۴ ماهه با بررسی افسر اعتبار سامانه است.',
  },
  {
    q: 'آیا ثبت آگهی در تهاتر آپ هزینه دارد؟',
    a: 'ثبت آگهی استاندارد و ارسال پیشنهاد معاوضه رایگان است. تنها خدمات اختیاری ارتقا شامل نردبان، نشان فوری و درخواست کارشناسی رسمی طبق تعرفه شفاف کیف پول محاسبه می‌شوند.',
  },
  {
    q: 'چگونه از واقعی بودن قیمت و سلامت ملک یا خودرو مطمئن شویم؟',
    a: 'هر کاربر می‌تواند برای آگهی یا دارایی سبد خود درخواست «کارشناسی ارزیاب» ثبت کند تا کارشناس رسمی قیمت منصفانه و سلامت فنی/سند را در سیستم تایید و پیوست نماید.',
  },
  {
    q: 'در صورت تغییر مالکیت سیم‌کارت چه اقدامی باید انجام داد؟',
    a: 'از بخش «مقابله با مزاحمت و کلاهبرداری» در پنل کاربری تهاتر من، گزینه اعلام واگذاری سیم‌کارت را بزنید تا بلافاصله تاییدیه امنیتی و نشست‌های قبلی محافظت شوند.',
  },
];

export default function FaqPage() {
  return (
    <PublicPageShell activePath="/faq">
      <div className="max-w-[840px] mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[var(--brand-primary)]" />
            <span>سوالات متداول تهاتر آپ</span>
          </h1>
          <p className="text-[13.5px] text-[var(--content-neutral-default)]">
            پاسخ پرسش‌های رایج کاربران درباره معاملات معاوضه، اقساط، کارشناسی و امنیت حساب.
          </p>
        </header>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              open
              className="p-4 sm:p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]"
            >
              <summary className="cursor-pointer font-bold text-[15px] text-[var(--content-neutral-stronger)]">
                {item.q}
              </summary>
              <p className="mt-2.5 text-[13.5px] leading-[27px] text-[var(--content-neutral-default)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13.5px] font-bold">پاسخ سوال خود را پیدا نکردید؟</span>
          <div className="flex gap-2">
            <Link href="/blog" className="kt-button--outlined !h-[36px] !px-4 text-[12px]">
              آموزش‌ها در وبلاگ
            </Link>
            <Link href="/" className="kt-button--primary !h-[36px] !px-4 text-[12px]">
              ارتباط با پشتیبانی در سایت
            </Link>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
