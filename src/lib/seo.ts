import type { Metadata } from 'next';

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://tahator-web.liara.run'
  ).replace(/\/+$/, '');
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
}): Metadata {
  const baseUrl = getSiteBaseUrl();
  const cleanPath = opts.path ? (opts.path.startsWith('/') ? opts.path : `/${opts.path}`) : '/';
  const canonicalUrl = `${baseUrl}${cleanPath}`;
  const ogImage = opts.image
    ? opts.image.startsWith('http')
      ? opts.image
      : `${baseUrl}${opts.image.startsWith('/') ? '' : '/'}${opts.image}`
    : `${baseUrl}/blog/installment-5050.svg`;

  return {
    title: opts.title,
    description: opts.description,
    keywords: [
      'تهاتر آپ',
      'معاوضه ملک',
      'معاوضه خودرو',
      'خرید اقساطی ملک',
      'خرید اقساطی خودرو',
      'تسهیلات ۵۰/۵۰',
      'تهاتر بدون پیش‌پرداخت نقدی',
      'موتورسیکلت اقساطی',
      ...(opts.keywords || []),
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: opts.type || 'website',
      locale: 'fa_IR',
      url: canonicalUrl,
      siteName: 'تهاتر آپ',
      title: opts.title,
      description: opts.description,
      images: [{ url: ogImage, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  };
}

export function buildWebsiteAndOrgJsonLd() {
  const baseUrl = getSiteBaseUrl();
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'تهاتر آپ',
      alternateName: 'Tahator App',
      url: baseUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+98-21-91016487',
        contactType: 'customer service',
        areaServed: 'IR',
        availableLanguage: 'Persian',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'تهاتر آپ — سامانه هوشمند معاوضه و خرید اقساطی ملک و خودرو',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function buildListingSeoJsonLd(item: {
  id: string;
  code: string;
  title: string;
  description: string;
  priceNum: number;
  cityName: string;
  province?: string;
  neighborhood: string;
  categoryName: string;
  subcategory: string;
  hasExchange: boolean;
  isTraded?: boolean;
  images?: string[];
  lat?: number | null;
  lng?: number | null;
}) {
  const baseUrl = getSiteBaseUrl();
  const adUrl = `${baseUrl}/ads/${encodeURIComponent(item.code)}`;
  const schemaType =
    item.categoryName === 'خودرو' || item.categoryName === 'موتورسیکلت'
      ? 'Vehicle'
      : 'Product';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: baseUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: item.categoryName,
          item: `${baseUrl}/?category=${encodeURIComponent(item.categoryName)}`,
        },
        { '@type': 'ListItem', position: 3, name: item.title, item: adUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: item.title,
      description: item.description.slice(0, 300),
      sku: item.code,
      url: adUrl,
      category: `${item.categoryName} - ${item.subcategory}`,
      image: item.images && item.images.length > 0 ? item.images : [`${baseUrl}/ads/no-image.svg`],
      ...(typeof item.lat === 'number' && typeof item.lng === 'number'
        ? {
            contentLocation: {
              '@type': 'Place',
              name: `${item.cityName}، ${item.neighborhood}`,
              geo: {
                '@type': 'GeoCoordinates',
                latitude: item.lat,
                longitude: item.lng,
              },
            },
          }
        : {}),
      offers: {
        '@type': 'Offer',
        url: adUrl,
        priceCurrency: 'IRR',
        price: item.priceNum > 0 ? item.priceNum * 10 : 0,
        availability: item.isTraded ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/UsedCondition',
      },
    },
  ];
}

export function buildAiPageJsonLd() {
  const baseUrl = getSiteBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'دستیار و کارشناس هوش مصنوعی تهاتر آپ',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${baseUrl}/ai`,
    inLanguage: 'fa-IR',
    description:
      'تحلیل قیمت ملک و خودرو با هوش مصنوعی، پیشنهاد هوشمند زنجیره تهاتر و محاسبه لحظه‌ای اقساط ۱ تا ۵ سال ۵۰/۵۰.',
  };
}

export function buildFacilitiesPageJsonLd() {
  const baseUrl = getSiteBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'طرح تسهیلات و خرید اقساطی ۵۰/۵۰ تهاتر آپ (۱ تا ۵ سال)',
    url: `${baseUrl}/facilities`,
    description:
      'تأمین ۵۰٪ ارزش معامله با نقد یا تهاتر دارایی غیرنقدی (حتی بدون پیش‌پرداخت نقدی) و پرداخت ۵۰٪ باقیمانده در اقساط ۱۲ تا ۶۰ ماهه.',
    provider: {
      '@type': 'Organization',
      name: 'تهاتر آپ',
      telephone: '+98-21-91016487',
    },
  };
}
