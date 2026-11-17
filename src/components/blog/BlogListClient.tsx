'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Eye, Search, Sparkles, Tag } from 'lucide-react';
import type { BlogCategory, BlogPostItem } from '@/types/platform';
import { toPersianDigits } from '@/data/mockData';

export default function BlogListClient({
  categories,
  posts,
}: {
  categories: BlogCategory[];
  posts: BlogPostItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (selectedCategory !== 'all' && p.category?.slug !== selectedCategory) return false;
      if (q) {
        const hay = `${p.title} ${p.excerpt} ${(p.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, query]);

  const featured = useMemo(() => {
    if (selectedCategory !== 'all' || query.trim()) return null;
    return filtered.find((p) => p.isFeatured) || filtered[0] || null;
  }, [filtered, selectedCategory, query]);

  const gridPosts = useMemo(() => {
    if (!featured) return filtered;
    return filtered.filter((p) => p.id !== featured.id);
  }, [filtered, featured]);

  return (
    <div className="space-y-6">
      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[var(--brand-action)] text-white'
                : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] hover:bg-[var(--brand-soft)]'
            }`}
          >
            همه مقالات ({toPersianDigits(posts.length)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-[var(--brand-action)] text-white'
                  : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] hover:bg-[var(--brand-soft)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[var(--content-neutral-default)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در مقالات و راهنماها..."
            className="kt-input !pr-9 !h-[38px] text-[13px]"
          />
        </div>
      </div>

      {/* Featured Article Hero */}
      {featured && (
        <Link
          href={`/blog/${encodeURIComponent(featured.slug)}`}
          className="group block rounded-[12px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] overflow-hidden hover:border-[var(--brand-action)] transition-all shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 h-[220px] sm:h-[280px] overflow-hidden bg-zinc-900">
              <img
                src={featured.coverImage || '/blog/barter-chain.svg'}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>مقاله ویژه</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-default)]">
                    {featured.category?.name}
                  </span>
                </div>
                <h2 className="text-[19px] sm:text-[22px] font-extrabold leading-[34px] text-[var(--content-neutral-stronger)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[13.5px] leading-[26px] text-[var(--content-neutral-default)] line-clamp-3">
                  {featured.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[var(--content-neutral-default)] pt-2 border-t border-[var(--border-neutral-weaker)]">
                <span>نویسنده: {featured.author?.fullName || 'تحریریه تهاتر آپ'}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {toPersianDigits(featured.readMinutes)} دقیقه مطالعه
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {toPersianDigits(featured.viewsCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center rounded-[10px] border border-dashed border-[var(--border-neutral-weak)] text-[14px] text-[var(--content-neutral-default)]">
          مقاله‌ای با جستجو یا دسته‌بندی انتخاب‌شده یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${encodeURIComponent(post.slug)}`}
              className="group rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] overflow-hidden hover:border-[var(--brand-action)] transition-all flex flex-col shadow-sm"
            >
              <div className="h-[175px] overflow-hidden bg-zinc-900">
                <img
                  src={post.coverImage || '/blog/barter-chain.svg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--brand-primary)]">{post.category?.name}</span>
                    <span className="text-[var(--content-neutral-default)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {toPersianDigits(post.readMinutes)} دقیقه
                    </span>
                  </div>
                  <h3 className="text-[15px] font-extrabold leading-[26px] text-[var(--content-neutral-stronger)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[12.5px] leading-[22px] text-[var(--content-neutral-default)] line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-neutral-weaker)] flex items-center justify-between text-[11px] text-[var(--content-neutral-default)]">
                  <div className="flex items-center gap-1 truncate">
                    <Tag className="w-3 h-3 shrink-0" />
                    <span className="truncate">{(post.tags || []).slice(0, 2).join('، ')}</span>
                  </div>
                  <span className="font-bold text-[var(--brand-primary)] shrink-0">مطالعه مقاله ‹</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
