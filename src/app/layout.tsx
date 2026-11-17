import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'سایت تهاتر کالا | تهاتر آپ — سامانه هوشمند معاوضه و خرید و فروش',
    template: '%s | تهاتر آپ',
  },
  description:
    'مرجع تخصصی تهاتر، معاوضه و خرید و فروش تخصصی املاک، انواع خودرو (سبک، سنگین، کشاورزی و غیرکشاورزی) و موتورسیکلت در سراسر ایران — تهاتر آپ (tahator.app)',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'تهاتر آپ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tahator_theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[var(--surface-neutral-weaker)] text-[var(--content-neutral-stronger)] min-h-screen transition-colors">
        {children}
      </body>
    </html>
  );
}
