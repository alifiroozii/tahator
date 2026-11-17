import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads/', '/blog', '/ai', '/facilities', '/about', '/faq', '/terms'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
