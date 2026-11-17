import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
import GlobalChatbotMount from '@/components/GlobalChatbotMount';
import { buildPageMetadata, buildWebsiteAndOrgJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'سایت تهاتر کالا | تهاتر آپ — سامانه هوشمند معاوضه، خرید اقساطی ملک و خودرو',
    description:
      'مرجع تخصصی معاوضه، خرید و فروش و تسهیلات اقساطی ۵۰/۵۰ (۱ تا ۵ سال حتی بدون پیش‌پرداخت نقدی) ملک، مسکن، خودرو و موتورسیکلت در تمام ۳۱ استان ایران — تهاتر آپ (tahator.app)',
    path: '/',
  }),
  title: {
    default: 'سایت تهاتر کالا | تهاتر آپ — سامانه هوشمند معاوضه و خرید و فروش',
    template: '%s | تهاتر آپ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildWebsiteAndOrgJsonLd();

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tahator_theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[var(--surface-neutral-weaker)] text-[var(--content-neutral-stronger)] min-h-screen transition-colors">
        {children}
        <GlobalChatbotMount />
      </body>
    </html>
  );
}
