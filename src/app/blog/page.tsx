import type { Metadata } from 'next';
import PublicPageShell from '@/components/PublicPageShell';
import BlogListClient from '@/components/blog/BlogListClient';
import { fetchBackendPublic } from '@/lib/serverApi';
import type { BlogCategory, BlogPostItem } from '@/types/platform';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'مجله تخصصی و راهنمای تهاتر',
  description:
    'مقالات آموزشی تهاتر سه‌طرفه، تسهیلات ۵۰/۵۰، ارزش‌گذاری هوشمند و نکات حقوقی معاملات امن ملک و خودرو در تهاتر آپ.',
};

export default async function BlogIndexPage() {
  const [categories, postsPayload] = await Promise.all([
    fetchBackendPublic<BlogCategory[]>('/blog/categories'),
    fetchBackendPublic<{ items: BlogPostItem[]; total: number }>('/blog/posts?limit=30'),
  ]);

  return (
    <PublicPageShell activePath="/blog">
      <section className="mb-7 space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
          آکادمی و مجله تخصصی تهاتر آپ
        </span>
        <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[var(--content-neutral-stronger)]">
          راهنمای جامع معاوضه امن، تحلیل بازار و تسهیلات ۵۰/۵۰
        </h1>
        <p className="text-[14px] text-[var(--content-neutral-default)] max-w-2xl leading-7">
          جدیدترین تحلیل‌های تخصصی درباره معاملات تهاتری ملک، خودرو و موتورسیکلت، مکانیزم زنجیره سه‌طرفه و چک‌لیست‌های حقوقی.
        </p>
      </section>

      <BlogListClient
        categories={categories || []}
        posts={postsPayload?.items || []}
      />
    </PublicPageShell>
  );
}
