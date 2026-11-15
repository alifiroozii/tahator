import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سایت تهاتر کالا | تهاتر آپ — سامانه هوشمند معاوضه و خرید و فروش',
  description:
    'مرجع تخصصی تهاتر، معاوضه و خرید و فروش تخصصی املاک، انواع خودرو (سبک، سنگین، کشاورزی و غیرکشاورزی) و موتورسیکلت در سراسر ایران — تهاتر آپ (tahator.app)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="font-sans antialiased bg-[var(--surface-neutral-weaker)] text-[var(--content-neutral-stronger)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
