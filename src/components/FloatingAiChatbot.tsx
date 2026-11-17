'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Calculator,
  ExternalLink,
  MessageSquareHeart,
  Percent,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { tahatorApi } from '@/lib/apiClient';
import { toPersianDigits } from '@/data/mockData';

interface SuggestedItem {
  id: string;
  code: string;
  title: string;
  category: string;
  city: string;
  neighborhood: string;
  price: number;
  priceFa: string;
  hasExchange: boolean;
  monthlyEstFa: string;
  monthsFa: string;
  image: string;
}

interface ChatEntry {
  id: string;
  role: 'bot' | 'user';
  text: string;
  installmentSummary?: {
    totalAmountFa: string;
    downOrBarterFa: string;
    loanPrincipalFa: string;
    monthsFa: string;
    monthlyInstallmentFa: string;
    totalPayableFa: string;
  };
  suggestedListings?: SuggestedItem[];
}

export function openGlobalChatbot(detail?: { prefill?: string; listingId?: string }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tahator:open-chatbot', { detail }));
  }
}

export default function FloatingAiChatbot() {
  const [open, setOpen] = useState(false);
  const [showPromoTip, setShowPromoTip] = useState(false);
  const [input, setInput] = useState('');
  const [months, setMonths] = useState<number>(60);
  const [contextListingId, setContextListingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'سلام! من مشاور هوشمند تهاتر آپ هستم.\n\n• تمام معاملات با حضور کارشناس رسمی و قرارداد امن ثبت می‌شوند تا با خیال راحت معامله کنید.\n• اگر پولتان کم است، نگران نباشید! تا ۵۰٪ ارزش ملک یا خودرو را با بازپرداخت ۱ تا ۵ سال به شما وام و تسهیلات می‌دهیم و ۵۰٪ اول هم با تهاتر دارایی (حتی بدون پیش‌پرداخت نقدی) قابل تأمین است.\n\nچطور کمکتان کنم؟',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendQuery = async (rawText: string, overrideListingId?: string, overrideMonths?: number) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: toPersianDigits(trimmed),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await tahatorApi.queryAiAssistant({
        message: trimmed,
        listingId: overrideListingId ?? contextListingId,
        months: overrideMonths ?? months,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: toPersianDigits(res.replyFa),
          installmentSummary: res.installmentSummary,
          suggestedListings: res.suggestedListings,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          role: 'bot',
          text: 'در هر معامله ملک، خودرو یا موتورسیکلت می‌توانید ۵۰٪ مبلغ را نقد یا با تهاتر دارایی پوشش دهید و مابقی را در اقساط ۱۲ تا ۶۰ ماهه بپردازید. برای بررسی دقیق و معرفی فایل‌های هم‌بودجه می‌توانید با خط مستقیم ۰۲۱-۹۱۰۱۶۴۸۷ نیز تماس بگیرید.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (ev: Event) => {
      const custom = ev as CustomEvent<{ prefill?: string; listingId?: string }>;
      setOpen(true);
      setShowPromoTip(false);
      if (custom.detail?.listingId) {
        setContextListingId(custom.detail.listingId);
      }
      if (custom.detail?.prefill) {
        void sendQuery(custom.detail.prefill, custom.detail?.listingId, months);
      }
    };
    window.addEventListener('tahator:open-chatbot', handler);
    return () => window.removeEventListener('tahator:open-chatbot', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months, contextListingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  return (
    <div
      className={`fixed bottom-20 lg:bottom-5 left-3 sm:left-5 flex flex-col items-end gap-2.5 ${
        open ? 'z-[60]' : 'z-30'
      }`}
      dir="rtl"
    >
      {open && (
        <div className="w-[calc(100vw-24px)] sm:w-[395px] h-[520px] max-h-[78vh] rounded-[12px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--brand-primary)] text-white flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-extrabold truncate">
                  مشاور هوشمند تهاتر و وام ۵۰/۵۰
                </div>
                <div className="text-[10.5px] text-white/85 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>کارشناسی رسمی · اقساط ۱ تا ۵ سال · معرفی فایل</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center shrink-0"
              aria-label="بستن چت‌بات"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Term switcher inside chat */}
          <div className="px-3 py-2 border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] flex items-center justify-between gap-2 text-[11px] shrink-0">
            <span className="font-bold text-[var(--content-neutral-default)] flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>دوره محاسبه وام:</span>
            </span>
            <div className="flex items-center gap-1">
              {[12, 24, 36, 48, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`px-2 py-0.5 rounded-[4px] font-bold transition-colors ${
                    months === m
                      ? 'bg-[var(--brand-action)] text-white'
                      : 'bg-[var(--surface-neutral-default)] text-[var(--content-neutral-stronger)] border border-[var(--border-neutral-weaker)]'
                  }`}
                >
                  {toPersianDigits(m / 12)} سال
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 text-[12.5px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[92%] rounded-[10px] p-3 leading-[22px] whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[var(--brand-action)] text-white rounded-tr-none'
                      : 'bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)] rounded-tl-none'
                  }`}
                >
                  {msg.text}

                  {msg.installmentSummary && (
                    <div className="mt-2.5 p-2.5 rounded-[8px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)] space-y-1 text-[11.5px]">
                      <div className="flex items-center justify-between font-bold text-[var(--brand-primary)]">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          <span>برآورد قسط {msg.installmentSummary.monthsFa} ماهه:</span>
                        </span>
                        <span>{msg.installmentSummary.monthlyInstallmentFa} / ماه</span>
                      </div>
                      <div className="flex justify-between text-[var(--content-neutral-default)]">
                        <span>۵۰٪ نقد یا تهاتر دارایی:</span>
                        <span>{msg.installmentSummary.downOrBarterFa}</span>
                      </div>
                      <div className="flex justify-between text-[var(--content-neutral-default)]">
                        <span>۵۰٪ مبلغ وام و تسهیلات:</span>
                        <span>{msg.installmentSummary.loanPrincipalFa}</span>
                      </div>
                    </div>
                  )}

                  {msg.suggestedListings && msg.suggestedListings.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {msg.suggestedListings.map((ad) => (
                        <Link
                          key={ad.id}
                          href={`/ads/${encodeURIComponent(ad.code)}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-[8px] bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] transition-colors"
                        >
                          <img
                            src={ad.image || '/ads/no-image.svg'}
                            alt={ad.title}
                            className="w-11 h-11 rounded-[6px] object-cover shrink-0 bg-[var(--surface-neutral-weak)]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-[11.5px] text-[var(--content-neutral-stronger)] truncate">
                              {toPersianDigits(ad.title)}
                            </div>
                            <div className="text-[10.5px] text-[var(--content-neutral-default)] truncate">
                              {ad.city} · {ad.priceFa}
                            </div>
                            {ad.price > 0 && (
                              <div className="text-[10px] font-bold text-[var(--semantic-positive)] truncate">
                                قسط {ad.monthsFa}م: {ad.monthlyEstFa}
                              </div>
                            )}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-[11.5px] text-[var(--content-neutral-default)] px-2">
                در حال بررسی آگهی‌ها و محاسبه شرایط اقساط...
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-1.5 border-t border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              'اگر پولم کم بود چقدر وام می‌دید؟',
              'معرفی ملک اقساطی تهران تا ۲۰ میلیارد',
              'معرفی خودرو قسطی با تهاتر',
              'چطور معامله حضوری و امن انجام میشه؟',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => void sendQuery(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[var(--surface-neutral-default)] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[10.5px] font-medium text-[var(--content-neutral-stronger)]"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Support / Trust Footer CTA + Input */}
          <div className="p-2.5 border-t border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-[var(--semantic-positive)] font-bold">
                بیایید با کارشناس ما امن معامله کنید
              </span>
              <a
                href="tel:02191016487"
                className="inline-flex items-center gap-1 font-bold text-[var(--brand-primary)] hover:underline dir-ltr"
              >
                <Phone className="w-3 h-3" />
                <span>{toPersianDigits('02191016487')}</span>
              </a>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendQuery(input);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="بودجه، سوال اقساط یا کالای موردنظر را بنویسید..."
                className="kt-input !h-[36px] text-[12px] flex-1 min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="kt-button--primary !h-[36px] !px-3 shrink-0 disabled:opacity-50"
                aria-label="ارسال پیام به دستیار هوشمند"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!open && showPromoTip && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-neutral-weaker)] border border-[var(--brand-action)]/35 shadow-lg text-[11.5px] font-bold text-[var(--content-neutral-stronger)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
          <span>سوالی درباره وام ۵۰/۵۰ یا معرفی ملک و خودرو دارید؟</span>
          <button
            type="button"
            onClick={() => setShowPromoTip(false)}
            className="text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]"
            aria-label="بستن یادآور"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setShowPromoTip(false);
        }}
        className="h-[48px] px-4 rounded-full bg-[var(--brand-action)] hover:bg-[var(--brand-primary)] text-white shadow-xl flex items-center gap-2 font-extrabold text-[13px] transition-transform hover:scale-[1.03]"
        aria-label="مشاور هوشمند و چت‌بات تهاتر آپ"
      >
        <MessageSquareHeart className="w-5 h-5" />
        <span>مشاور هوشمند و وام</span>
      </button>
    </div>
  );
}
