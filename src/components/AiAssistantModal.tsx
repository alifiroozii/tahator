'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  ArrowLeftRight,
  Calculator,
  Send,
  ShieldCheck,
  Network,
} from 'lucide-react';
import {
  CATEGORIES,
  CITIES,
  Listing,
  TEHRAN_NEIGHBORHOODS,
  formatToman,
  toPersianDigits,
} from '@/data/mockData';
import {
  answerOfflineAiQuery,
  compareTwoListings,
  estimateMarketPriceByForm,
  findThreeWayBarterChains,
} from '@/lib/offlineAi';

interface AiAssistantModalProps {
  allListings: Listing[];
  initialTab?: 'chat' | 'compare' | 'estimator' | 'chain';
  initialListingAId?: string;
  onSelectListing: (listing: Listing) => void;
  onClose: () => void;
}

interface AiChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  matchedListings?: Listing[];
}

export default function AiAssistantModal({
  allListings,
  initialTab = 'chat',
  initialListingAId,
  onSelectListing,
  onClose,
}: AiAssistantModalProps) {
  const [tab, setTab] = useState<'chat' | 'compare' | 'estimator' | 'chain'>(initialTab);
  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<AiChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'سلام! من دستیار هوشمند تهاتر آپ (نسخه آفلاین) هستم. می‌توانید بودجه، شهر، دسته‌بندی یا کالای مورد نظر برای معاوضه را بنویسید تا بهترین گزینه‌ها و مشاوره قیمت را فوراً پیشنهاد دهم.',
      matchedListings: allListings.filter((l) => l.hasExchange).slice(0, 2),
    },
  ]);

  // Comparator state
  const [idA, setIdA] = useState<string>(initialListingAId || allListings[0]?.id || '');
  const [idB, setIdB] = useState<string>(allListings[1]?.id || allListings[0]?.id || '');

  // Estimator state
  const [estCategory, setEstCategory] = useState(CATEGORIES[0].name);
  const [estSub, setEstSub] = useState(CATEGORIES[0].subcategories[0]);
  const [estCity, setEstCity] = useState(CITIES[0].name);
  const [estNb, setEstNb] = useState(TEHRAN_NEIGHBORHOODS[8]);
  const [estCond, setEstCond] = useState<'new' | 'like-new' | 'used'>('like-new');
  const [estSpec, setEstSpec] = useState('85');

  useEffect(() => {
    setTab(initialTab);
    if (initialListingAId) setIdA(initialListingAId);
  }, [initialTab, initialListingAId]);

  const handleSendQuery = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const res = answerOfflineAiQuery(clean, allListings);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: clean },
      {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        text: res.answer,
        matchedListings: res.matchedListings,
      },
    ]);
    setQueryInput('');
  };

  const listingA = allListings.find((l) => l.id === idA) || allListings[0];
  const listingB = allListings.find((l) => l.id === idB) || allListings[1] || allListings[0];
  const comparison =
    listingA && listingB ? compareTwoListings(listingA, listingB) : null;
  const barterChains = listingA
    ? findThreeWayBarterChains(listingA, allListings)
    : [];

  const estCatObj = CATEGORIES.find((c) => c.name === estCategory) || CATEGORIES[0];
  const estimatedResult = estimateMarketPriceByForm({
    category: estCategory,
    subcategory: estSub,
    city: estCity,
    neighborhood: estNb,
    condition: estCond,
    areaOrSpec: estSpec,
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[880px] h-[100dvh] sm:h-[88vh] bg-[var(--surface-neutral-weaker)] sm:rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] sm:text-[17px] font-bold">
                  هوش مصنوعی تهاتر آپ
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>موتور آفلاین فعال</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--content-neutral-default)] truncate">
                تخمین قیمت بازار، جستجوی هوشمند، تطبیق معاوضه ۵۰/۵۰ و سپر امنیت معامله بدون نیاز به اینترنت ابری
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Mode Tabs (Scrollable on Mobile) */}
        <div className="flex border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] text-[12px] sm:text-[13px] overflow-x-auto no-scrollbar">
          {[
            { id: 'chat', label: 'چت‌بات هوش‌یار تهاتر', icon: MessageSquare },
            { id: 'compare', label: 'مقایسه دو آگهی', icon: ArrowLeftRight },
            { id: 'chain', label: 'زنجیره تهاتر ۳ ضلعی', icon: Network },
            { id: 'estimator', label: 'تخمین‌گر قیمت بازار', icon: Calculator },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as typeof tab)}
                className={`shrink-0 sm:flex-1 py-3 px-3 sm:px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? 'border-[var(--brand-action)] text-[var(--brand-primary)] font-bold bg-white'
                    : 'border-transparent text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        {tab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--surface-neutral-subtle)]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-start' : 'items-end'
                  } space-y-2`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-[8px] text-[13px] leading-[24px] ${
                      m.role === 'user'
                        ? 'bg-[var(--brand-action)] text-white rounded-tr-none'
                        : 'bg-white border border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)] rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.matchedListings && m.matchedListings.length > 0 && (
                    <div className="w-full max-w-[88%] grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.matchedListings.map((ad) => (
                        <button
                          key={ad.id}
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectListing(ad);
                          }}
                          className="p-2 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] flex items-center gap-2.5 text-right transition-colors"
                        >
                          <img
                            src={ad.images[0] || '/ads/fake-1.svg'}
                            alt={ad.title}
                            className="w-11 h-11 rounded-[4px] object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-bold truncate">{ad.title}</div>
                            <div className="text-[11px] text-[var(--brand-primary)] mt-0.5">
                              {ad.price > 0 ? formatToman(ad.price) : 'توافقی'} · {ad.city}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 pt-2 flex flex-wrap gap-1.5 bg-white border-t border-[var(--border-neutral-weaker)]">
              {[
                'آپارتمان قابل معاوضه در تهران',
                'گوشی زیر ۱۵۰ میلیون',
                'خودرو برای تهاتر',
                'شرایط اقساط ۵۰/۵۰ چطور است؟',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendQuery(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--surface-neutral-weak)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(queryInput);
              }}
              className="p-3 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="از دستیار هوشمند آفلاین بپرسید (مثلاً: آپارتمان معاوضه با خودرو در غرب تهران)..."
                className="kt-input flex-1 text-[13px]"
              />
              <button type="submit" className="kt-button--primary !px-4">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {tab === 'compare' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold mb-1">آگهی اول (دارایی شما / مبدا)</label>
                <select
                  value={idA}
                  onChange={(e) => setIdA(e.target.value)}
                  className="kt-input text-[13px]"
                >
                  {allListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.price > 0 ? formatToman(l.price) : 'توافقی'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">آگهی دوم (هدف معاوضه)</label>
                <select
                  value={idB}
                  onChange={(e) => setIdB(e.target.value)}
                  className="kt-input text-[13px]"
                >
                  {allListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.price > 0 ? formatToman(l.price) : 'توافقی'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {comparison && listingA && listingB && (
              <div className="p-4 sm:p-5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-neutral-weaker)]">
                  <div>
                    <div className="text-[12px] text-[var(--content-neutral-default)]">
                      نتیجه تحلیل تطبیقی هوش مصنوعی آفلاین
                    </div>
                    <div className="text-[16px] font-extrabold text-[var(--brand-primary)] mt-0.5">
                      {comparison.verdict}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-[8px] bg-[var(--brand-action)] text-white text-center">
                    <div className="text-[11px] opacity-90">ضریب تطابق</div>
                    <div className="text-[18px] font-extrabold">
                      {toPersianDigits(comparison.matchPercent)}٪
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
                  <div className="p-3 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                    <div className="text-[11px] text-[var(--content-neutral-default)]">ارزش آگهی اول</div>
                    <div className="font-bold mt-1">
                      {comparison.priceA > 0 ? formatToman(comparison.priceA) : 'توافقی'}
                    </div>
                  </div>
                  <div className="p-3 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)]">
                    <div className="text-[11px] text-[var(--content-neutral-default)]">ارزش آگهی دوم</div>
                    <div className="font-bold mt-1">
                      {comparison.priceB > 0 ? formatToman(comparison.priceB) : 'توافقی'}
                    </div>
                  </div>
                  <div className="p-3 rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand-primary)]">
                    <div className="text-[11px]">مابه‌التفاوت ارزش</div>
                    <div className="font-extrabold mt-1">
                      {comparison.absDelta > 0 ? formatToman(comparison.absDelta) : 'برابر (صفر)'}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-[6px] bg-white border border-[var(--border-neutral-weaker)] text-[13px] space-y-1">
                  <div>
                    <strong>جهت تسویه:</strong> {comparison.payerName}
                  </div>
                  {comparison.installmentEstimateMonthly > 0 && (
                    <div className="text-[var(--content-neutral-default)]">
                      پیشنهاد اقساط ۵۰/۵۰: مبلغ مابه‌التفاوت را می‌توانید با حدود{' '}
                      <strong className="text-[var(--brand-primary)]">
                        {formatToman(comparison.installmentEstimateMonthly)}
                      </strong>{' '}
                      در ماه (طی ۱۲ قسط) تقسیط کنید.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'estimator' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium mb-1">دسته‌بندی</label>
                <select
                  value={estCategory}
                  onChange={(e) => {
                    setEstCategory(e.target.value);
                    const obj = CATEGORIES.find((c) => c.name === e.target.value);
                    if (obj && obj.subcategories[0]) setEstSub(obj.subcategories[0]);
                  }}
                  className="kt-input text-[13px]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">زیردسته</label>
                <select
                  value={estSub}
                  onChange={(e) => setEstSub(e.target.value)}
                  className="kt-input text-[13px]"
                >
                  {estCatObj.subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">شهر</label>
                <select
                  value={estCity}
                  onChange={(e) => setEstCity(e.target.value)}
                  className="kt-input text-[13px]"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">محله (تهران)</label>
                <select
                  value={estNb}
                  onChange={(e) => setEstNb(e.target.value)}
                  className="kt-input text-[13px]"
                >
                  {TEHRAN_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">وضعیت سلامت / کارکرد</label>
                <select
                  value={estCond}
                  onChange={(e) => setEstCond(e.target.value as typeof estCond)}
                  className="kt-input text-[13px]"
                >
                  <option value="new">نو / آکبند / نوساز</option>
                  <option value="like-new">در حد نو / کم‌کارکرد</option>
                  <option value="used">کارکرده / نیازمند بازدید</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">
                  متراژ (برای املاک) یا مشخصه عددی
                </label>
                <input
                  type="text"
                  value={estSpec}
                  onChange={(e) => setEstSpec(e.target.value)}
                  placeholder="مثلاً: 85"
                  className="kt-input text-[13px] text-left dir-ltr"
                />
              </div>
            </div>

            <div className="p-5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--brand-soft)] space-y-3">
              <div className="text-[13px] font-bold text-[var(--brand-primary)]">
                بازه قیمت کارشناسی منصفانه (تخمین هوشمند آفلاین):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-[6px] bg-white">
                  <div className="text-[11px] text-[var(--content-neutral-default)]">حداقل بازار</div>
                  <div className="font-bold text-[14px] mt-1">{formatToman(estimatedResult.minFair)}</div>
                </div>
                <div className="p-3 rounded-[6px] bg-[var(--brand-action)] text-white">
                  <div className="text-[11px] opacity-90">قیمت متعادل پیشنهادی</div>
                  <div className="font-extrabold text-[15px] mt-1">
                    {formatToman(estimatedResult.estimatedCenter)}
                  </div>
                </div>
                <div className="p-3 rounded-[6px] bg-white">
                  <div className="text-[11px] text-[var(--content-neutral-default)]">حداکثر بازار</div>
                  <div className="font-bold text-[14px] mt-1">{formatToman(estimatedResult.maxFair)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'chain' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            <div className="p-3.5 rounded-[8px] bg-[var(--brand-soft)]/50 border border-[var(--brand-action)]/25 space-y-2">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--brand-primary)]">
                <Network className="w-4 h-4" />
                <span>کشف حلقه‌های تهاتر ۳ ضلعی (Multi-Hop Barter AI)</span>
              </div>
              <p className="text-[12px] text-[var(--content-neutral-default)] leading-[22px]">
                وقتی مالک هدف مستقیماً به کالای شما نیاز ندارد، موتور آفلاین یک طرف سوم واسط در پلتفرم پیدا می‌کند تا هر سه معامله همزمان با کمترین سرانه نقدی قفل و نهایی شود.
              </p>
              <div className="pt-1">
                <label className="block text-[11px] font-bold mb-1">انتخاب آگهی مبدا شما برای یافتن زنجیره:</label>
                <select
                  value={idA}
                  onChange={(e) => setIdA(e.target.value)}
                  className="kt-input text-[12px] bg-white"
                >
                  {allListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {barterChains.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-[var(--content-neutral-stronger)]">
                      زنجیره پیشنهادی #{toPersianDigits(idx + 1)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11px] font-bold">
                      {toPersianDigits(ch.compatibilityPercent)}٪ شانس بستن معامله
                    </span>
                  </div>

                  {/* 3-Node Visual Loop */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {[
                      { label: 'ضلع اول (مبدا)', item: ch.nodeA },
                      { label: 'ضلع دوم (واسط تهاتر)', item: ch.nodeB },
                      { label: 'ضلع سوم (تکمیل چرخه)', item: ch.nodeC },
                    ].map((node) => (
                      <button
                        key={node.label}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectListing(node.item);
                        }}
                        className="p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] bg-[var(--surface-neutral-subtle)] text-right flex items-center gap-2.5 transition-colors"
                      >
                        <img
                          src={node.item.images[0] || '/ads/fake-1.svg'}
                          alt={node.item.title}
                          className="w-11 h-11 rounded-[4px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-[var(--brand-primary)]">
                            {node.label}
                          </div>
                          <div className="text-[12px] font-bold truncate text-[var(--content-neutral-stronger)]">
                            {node.item.title}
                          </div>
                          <div className="text-[10px] text-[var(--content-neutral-default)] truncate">
                            {node.item.city} ·{' '}
                            {node.item.price > 0 ? formatToman(node.item.price) : 'توافقی'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] text-[12px] space-y-1">
                    <div className="text-[var(--content-neutral-stronger)]">{ch.narrative}</div>
                    <div className="text-[var(--semantic-positive)] font-bold">
                      تراز مالی زنجیره: {ch.netCashSettlement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
