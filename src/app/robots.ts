import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tahator.app').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/ads/', '/about', '/faq', '/terms'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
