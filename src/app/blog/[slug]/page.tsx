import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Calendar, Clock, Eye, Tag } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import BlogCommentSection from '@/components/blog/BlogCommentSection';
import { fetchBackendPublic } from '@/lib/serverApi';
import type { BlogPostItem } from '@/types/platform';
import { toPersianDigits } from '@/data/mockData';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await fetchBackendPublic<BlogPostItem>(
    `/blog/posts/${encodeURIComponent(decodedSlug)}`
  );

  if (!post) {
    return { title: 'مقاله یافت نشد' };
  }

  return buildPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${encodeURIComponent(post.slug)}`,
    image: post.coverImage || undefined,
    type: 'article',
    keywords: Array.isArray(post.tags) ? post.tags : [],
  });
}

function renderInlineRichText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-extrabold text-[var(--content-neutral-stronger)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderContentBlocks(content: string) {
  const lines = content.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listBuffer.length === 0) return;
    const items = [...listBuffer];
    listBuffer = [];
    nodes.push(
      <ul
        key={`list-${keyPrefix}`}
        className="list-disc pr-6 space-y-1.5 text-[14.5px] leading-[28px] text-[var(--content-neutral-stronger)]"
      >
        {items.map((li, i) => (
          <li key={i}>{renderInlineRichText(li)}</li>
        ))}
      </ul>
    );
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(String(idx));
      return;
    }
    if (line.startsWith('### ')) {
      flushList(String(idx));
      nodes.push(
        <h2
          key={`h2-${idx}`}
          className="text-[18px] sm:text-[20px] font-extrabold text-[var(--content-neutral-stronger)] pt-3"
        >
          {line.replace(/^###\s+/, '')}
        </h2>
      );
      return;
    }
    if (line.startsWith('- ')) {
      listBuffer.push(line.replace(/^-\s+/, '').trim());
      return;
    }
    flushList(String(idx));
    nodes.push(
      <p
        key={`p-${idx}`}
        className="text-[14.5px] sm:text-[15px] leading-[30px] text-[var(--content-neutral-stronger)]"
      >
        {renderInlineRichText(line)}
      </p>
    );
  });

  flushList('end');
  return nodes;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await fetchBackendPublic<BlogPostItem>(
    `/blog/posts/${encodeURIComponent(decodedSlug)}`
  );

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    author: { '@type': 'Person', name: post.author?.fullName || 'تحریریه تهاتر آپ' },
    datePublished: post.publishedAt || post.createdAt,
    image: post.coverImage || undefined,
  };

  return (
    <PublicPageShell activePath="/blog">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-[840px] mx-auto space-y-6">
        <div className="flex items-center gap-2 text-[12px] text-[var(--content-neutral-default)]">
          <Link href="/blog" className="hover:text-[var(--brand-primary)] flex items-center gap-1 font-bold">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به وبلاگ</span>
          </Link>
          <span>•</span>
          <span>{post.category?.name}</span>
        </div>

        <header className="space-y-3">
          <h1 className="text-[24px] sm:text-[30px] font-extrabold leading-[42px] text-[var(--content-neutral-stronger)]">
            {post.title}
          </h1>
          <p className="text-[15px] leading-[28px] text-[var(--content-neutral-default)]">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--content-neutral-default)] pt-1">
            <span>نویسنده: {post.author?.fullName || 'تحریریه تهاتر آپ'}</span>
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('fa-IR')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {toPersianDigits(post.readMinutes)} دقیقه مطالعه
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {toPersianDigits(post.viewsCount)} بازدید
            </span>
          </div>
        </header>

        <div className="rounded-[12px] overflow-hidden border border-[var(--border-neutral-weaker)] bg-zinc-900">
          <img
            src={post.coverImage || '/blog/barter-chain.svg'}
            alt={post.title}
            className="w-full max-h-[380px] object-cover"
          />
        </div>

        <div className="space-y-4">{renderContentBlocks(post.content || '')}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-neutral-weaker)]">
            <Tag className="w-4 h-4 text-[var(--brand-primary)]" />
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-[var(--surface-neutral-weak)] text-[11.5px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <BlogCommentSection
          slug={post.slug}
          initialComments={post.comments || []}
        />

        {(() => {
          const relatedList = post.relatedPosts || post.related || [];
          return relatedList.length > 0 ? (
            <section className="pt-6 border-t border-[var(--border-neutral-weaker)] space-y-4">
              <h3 className="text-[17px] font-bold">مقالات مرتبط</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedList.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${encodeURIComponent(rel.slug)}`}
                    className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] space-y-2 transition-colors"
                  >
                    <div className="text-[11px] font-bold text-[var(--brand-primary)]">
                      {rel.category?.name}
                    </div>
                    <div className="text-[13px] font-bold line-clamp-2">{rel.title}</div>
                    <div className="text-[11px] text-[var(--content-neutral-default)]">
                      {toPersianDigits(rel.readMinutes)} دقیقه مطالعه
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null;
        })()}
      </article>
    </PublicPageShell>
  );
}
