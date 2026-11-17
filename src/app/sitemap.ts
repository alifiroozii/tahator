import type { MetadataRoute } from 'next';
import { fetchBackendPublic } from '@/lib/serverApi';
import { getSiteBaseUrl } from '@/lib/seo';
import { IRAN_PROVINCE_CITIES } from '@/data/iranLocations';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/facilities`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/ai`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const [blogRes, listingsRes] = await Promise.all([
    fetchBackendPublic<{ items: Array<{ slug: string; publishedAt?: string | null }> }>(
      '/blog/posts?limit=100'
    ),
    fetchBackendPublic<{ items: Array<{ code: string; updatedAt?: string | null }> }>(
      '/listings?limit=500'
    ),
  ]);

  const blogEntries: MetadataRoute.Sitemap = (blogRes?.items || []).map((post) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const listingEntries: MetadataRoute.Sitemap = (listingsRes?.items || []).map((ad) => ({
    url: `${baseUrl}/ads/${encodeURIComponent(ad.code)}`,
    lastModified: ad.updatedAt ? new Date(ad.updatedAt) : now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const cityEntries: MetadataRoute.Sitemap = IRAN_PROVINCE_CITIES.filter((c) => c.popular).map((c) => ({
    url: `${baseUrl}/?city=${encodeURIComponent(c.name)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogEntries, ...listingEntries, ...cityEntries];
}
