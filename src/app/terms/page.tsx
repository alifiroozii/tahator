import type { Metadata } from 'next';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';

export const metadata: Metadata = {
  title: 'قوانین، مقررات و حریم خصوصی',
  description:
    'شرایط استفاده، سیاست‌های حریم خصوصی، احراز هویت امن، و ضوابط حقوقی معاوضه در سامانه تهاتر آپ.',
};

export default function TermsPage() {
  return (
    <PublicPageShell activePath="/terms">
      <div className="max-w-[840px] mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[var(--brand-primary)]" />
            <span>قوانین، مقررات و حریم خصوصی تهاتر آپ</span>
          </h1>
          <p className="text-[13.5px] text-[var(--content-neutral-default)]">
            استفاده از خدمات سامانه هوشمند تهاتر آپ به منزله مطالعه و پذیرش اصول زیر است:
          </p>
        </header>

        <div className="space-y-4">
          {[
            {
              title: '۱. اصالت دارایی‌ها و دسته‌بندی‌های مجاز',
              text: 'ثبت آگهی صرفاً در سه دسته‌بندی مجاز املاک، خودرو (سبک/سنگین/کشاورزی) و موتورسیکلت با مشخصات واقعی و قیمت کارشناسی شفاف مجاز است. آگهی‌های نامرتبط، قطعات متفرقه یا قیمت‌های صوری توسط تیم نظارت رد می‌شوند.',
            },
            {
              title: '۲. امنیت مالی و پرهیز از بیعانه پیش از رویت',
              text: 'کاربران موظف‌اند پیش از هرگونه پرداخت وجه یا جابه‌جایی مدارک، اصالت سند تک‌برگ، برگ سبز خودرو و هویت مالک را با استعلام رسمی و حضور کارشناس ارزیاب بررسی کنند. تمام پرداخت‌های کارمزد در سامانه صرفاً از طریق درگاه رسمی شاپرک انجام می‌شود.',
            },
            {
              title: '۳. محرمانگی اطلاعات هویتی و رمزنگاری داده‌ها',
              text: 'کد ملی و شماره شبای کاربران پس از اعتبارسنجی به صورت رمزنگاری‌شده نگهداری شده و هیچ‌گاه در خروجی‌های عمومی یا لاگ‌ها افشا نمی‌گردد. نشست‌های ورود با کوکی امن HttpOnly محافظت می‌شوند.',
            },
            {
              title: '۴. سیاست بازگشت وجه ۷۲ ساعته',
              text: 'در صورتی که مبلغی در تراکنش ناموفق بانکی از حساب شما کسر و به کیف پول اضافه نشود، تسویه و بازگشت خودکار بانکی حداکثر ظرف ۷۲ ساعت کاری انجام می‌پذیرد.',
            },
            {
              title: '۵. داوری حقوقی تفاهم‌نامه‌های تهاتر',
              text: 'تفاهم‌نامه‌های ثبت‌شده در سامانه دارای ردیابی ۴ مرحله‌ای هستند و در صورت بروز اختلاف میان طرفین معامله، پرونده توسط کارشناس داور حقوقی سامانه بررسی و رای اجرایی صادر می‌گردد.',
            },
          ].map((rule) => (
            <section
              key={rule.title}
              className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-2"
            >
              <h2 className="text-[15.5px] font-bold">{rule.title}</h2>
              <p className="text-[13.5px] leading-[27px] text-[var(--content-neutral-default)]">{rule.text}</p>
            </section>
          ))}
        </div>

        <div className="p-4 rounded-[8px] bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[13px] flex items-center gap-2 font-medium">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>در صورت مشاهده هرگونه تخلف، لینک مشکوک یا رفتار فیشینگ، بلافاصله از گزینه «گزارش آگهی» استفاده کنید.</span>
        </div>
      </div>
    </PublicPageShell>
  );
}
