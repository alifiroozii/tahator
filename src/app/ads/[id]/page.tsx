import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftRight, ArrowRight, CheckCircle2, MapPin, Percent, Phone } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import AdMapClientWrapper from '@/components/AdMapClientWrapper';
import AdInstallmentBox from '@/components/AdInstallmentBox';
import { fetchBackendPublic } from '@/lib/serverApi';
import type { BackendListingItem } from '@/lib/apiClient';
import { formatToman, toPersianDigits } from '@/data/mockData';

export const dynamic = 'force-dynamic';

async function loadListing(idOrCode: string): Promise<BackendListingItem | null> {
  const clean = decodeURIComponent(idOrCode);
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean);
  if (isUuid) {
    return fetchBackendPublic<BackendListingItem>(`/listings/${encodeURIComponent(clean)}`);
  }
  return fetchBackendPublic<BackendListingItem>(`/listings/by-code/${encodeURIComponent(clean)}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await loadListing(id);
  if (!item) return { title: 'آگهی یافت نشد' };

  const cityName = item.city?.name || 'ایران';
  const catName = item.category?.name || 'تهاتر';
  return {
    title: `${item.title} | ${catName} در ${cityName}`,
    description: (item.description || item.title).slice(0, 160),
    openGraph: {
      title: item.title,
      description: (item.description || item.title).slice(0, 160),
      images: item.images?.[0] ? [{ url: item.images[0] }] : undefined,
    },
  };
}

export default async function PublicAdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await loadListing(id);

  if (!item) {
    notFound();
  }

  const priceNum = Number(item.price) || 0;
  const cityName = item.city?.name || 'تهران';
  const catName = item.category?.name || 'تهاتر';
  const rawContact = item.contactPhone?.trim();
  const displayPhone =
    rawContact && rawContact !== '02191016487'
      ? rawContact
      : item.owner?.phone || rawContact || '02191016487';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.description,
    category: `${catName} - ${item.subcategory}`,
    image: item.images && item.images.length > 0 ? item.images : ['/ads/no-image.svg'],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: priceNum * 10,
      availability: item.isTraded ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
  };

  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--content-neutral-default)]">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="font-bold text-[var(--brand-primary)] flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>بازگشت به همه آگهی‌ها</span>
            </Link>
            <span>/</span>
            <span>{catName}</span>
            <span>/</span>
            <span>{item.subcategory}</span>
          </div>
          <span>کد آگهی: {toPersianDigits(item.code)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-[10px] overflow-hidden border border-[var(--border-neutral-weaker)] bg-zinc-950 h-[280px] sm:h-[380px]">
              <img
                src={item.images?.[0] || '/ads/no-image.svg'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {item.images.slice(1, 7).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${item.title} - ${i + 2}`}
                    className="h-16 w-full object-cover rounded-[6px] border border-[var(--border-neutral-weaker)]"
                  />
                ))}
              </div>
            )}

            <div className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
              <h2 className="text-[16px] font-bold">توضیحات کامل آگهی</h2>
              <p className="text-[14.5px] leading-[28px] whitespace-pre-line">{item.description}</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] space-y-4">
              <h1 className="text-[20px] sm:text-[22px] font-extrabold leading-[34px]">
                {item.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {item.hasExchange && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11.5px] font-bold">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>امکان معاوضه (تهاتر)</span>
                  </span>
                )}
                {item.hasInstallmentPlan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11.5px] font-bold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>اقساط ۵۰/۵۰</span>
                  </span>
                )}
                {item.isVerifiedPhotos && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[11.5px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تصاویر تاییدشده</span>
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-neutral-weaker)] flex items-center justify-between">
                <span className="text-[13px] text-[var(--content-neutral-default)]">ارزش / قیمت پیشنهادی</span>
                <span className="text-[18px] font-extrabold text-[var(--brand-primary)]">
                  {priceNum > 0 ? formatToman(priceNum) : item.priceLabel || 'توافقی'}
                </span>
              </div>

              {item.exchangeWith && (
                <div className="p-3 rounded-[8px] bg-[var(--surface-neutral-subtle)] text-[12.5px]">
                  <span className="font-bold">مورد ترجیحی برای معاوضه: </span>
                  <span>{item.exchangeWith}</span>
                </div>
              )}

              <div className="text-[12.5px] text-[var(--content-neutral-default)] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>
                  {cityName}، {item.neighborhood}
                  {item.streetHint ? ` (${item.streetHint})` : ''}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href={`/?q=${encodeURIComponent(item.code)}`}
                  className="kt-button--primary w-full !h-[42px] text-[13px] flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>ثبت پیشنهاد تهاتر و گفتگو در سامانه</span>
                </Link>
              </div>
            </div>

            <AdInstallmentBox
              listingCode={item.code}
              price={priceNum}
              contactPhone={displayPhone}
            />

            <div className="rounded-[10px] border border-[var(--border-neutral-weaker)] overflow-hidden">
              <AdMapClientWrapper
                city={cityName}
                lat={item.lat}
                lng={item.lng}
                isApproximate={Boolean(item.isApproximateLocation || typeof item.lat !== 'number')}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
