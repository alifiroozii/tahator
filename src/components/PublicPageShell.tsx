'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Moon, ShieldCheck, Sun } from 'lucide-react';

export default function PublicPageShell({
  children,
  activePath = '',
}: {
  children: React.ReactNode;
  activePath?: string;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  const toggleDark = () => {
    const nextDark = !isDark;
    const nextTheme = nextDark ? 'dark' : 'light';
    setIsDark(nextDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('tahator_theme', nextTheme);
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-neutral-weaker)] text-[var(--content-neutral-stronger)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)]/95 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-extrabold text-[17px] text-[var(--brand-primary)] shrink-0"
            >
              <span className="w-8 h-8 rounded-[6px] bg-[var(--brand-action)] text-white flex items-center justify-center text-[15px]">
                ت
              </span>
              <span>تهاتر آپ</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium mr-3">
              {[
                { href: '/', label: 'آگهی‌های تهاتر' },
                { href: '/blog', label: 'مجله و وبلاگ' },
                { href: '/about', label: 'درباره ما' },
                { href: '/faq', label: 'سوالات متداول' },
                { href: '/terms', label: 'قوانین' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-[6px] transition-colors ${
                    activePath === item.href
                      ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold'
                      : 'text-[var(--content-neutral-default)] hover:bg-[var(--surface-neutral-weak)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleDark}
              className="kt-button--ghost !h-[34px] !w-[34px] !px-0 justify-center"
              aria-label="تغییر تم شب و روز"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/" className="kt-button--outlined !h-[34px] !px-3 text-[12px] flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>بازگشت به بازار</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-6 sm:py-8">{children}</main>

      <footer className="border-t border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] py-6 mt-10">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--content-neutral-default)]">
          <div className="flex items-center gap-2 font-bold text-[var(--content-neutral-stronger)]">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>سامانه هوشمند تهاتر و معاوضه املاک، خودرو و موتورسیکلت (tahator.app)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/blog" className="hover:text-[var(--brand-primary)] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>وبلاگ</span>
            </Link>
            <Link href="/about" className="hover:text-[var(--brand-primary)]">
              درباره ما
            </Link>
            <Link href="/faq" className="hover:text-[var(--brand-primary)]">
              سوالات متداول
            </Link>
            <Link href="/terms" className="hover:text-[var(--brand-primary)]">
              قوانین و حریم خصوصی
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
