import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftRight, ArrowRight, CheckCircle2, MapPin, Percent, Phone, XCircle } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import AdMapClientWrapper from '@/components/AdMapClientWrapper';
import AdInstallmentBox from '@/components/AdInstallmentBox';
import InlineAdAiSection from '@/components/InlineAdAiSection';
import ShareActionsBar from '@/components/ShareActionsBar';
import { fetchBackendPublic } from '@/lib/serverApi';
import type { BackendListingItem } from '@/lib/apiClient';
import { mapBackendListingToUi } from '@/lib/listingMapper';
import { buildListingSeoJsonLd, buildPageMetadata } from '@/lib/seo';
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
  const titleFa = toPersianDigits(item.title);
  const priceNum = Number(item.price) || 0;
  const priceText = priceNum > 0 ? formatToman(priceNum) : item.priceLabel || 'توافقی';

  return buildPageMetadata({
    title: `${titleFa} | ${catName} در ${cityName}`,
    description: `${titleFa} — ${priceText} در ${cityName} (${item.neighborhood}). ${
      item.hasExchange ? 'امکان معاوضه دارد.' : 'فروش نقدی و اقساط ۵۰/۵۰.'
    } ${toPersianDigits((item.description || '').slice(0, 120))}`,
    path: `/ads/${encodeURIComponent(item.code)}`,
    image: item.images?.[0],
    keywords: [cityName, catName, item.subcategory, item.neighborhood, 'خرید اقساطی ۵۰/۵۰'],
  });
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

  const uiListing = mapBackendListingToUi(item);
  const priceNum = Number(item.price) || 0;
  const cityName = item.city?.name || 'تهران';
  const catName = item.category?.name || 'تهاتر';
  const rawContact = item.contactPhone?.trim();
  const displayPhone =
    rawContact && rawContact !== '02191016487'
      ? rawContact
      : item.owner?.phone || rawContact || '02191016487';

  const jsonLd = buildListingSeoJsonLd({
    id: item.id,
    code: item.code,
    title: toPersianDigits(item.title),
    description: toPersianDigits(item.description || item.title),
    priceNum,
    cityName,
    province: item.city?.province,
    neighborhood: item.neighborhood,
    categoryName: catName,
    subcategory: item.subcategory,
    hasExchange: Boolean(item.hasExchange),
    isTraded: Boolean(item.isTraded),
    images: item.images,
    lat: item.lat,
    lng: item.lng,
  });

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
            <div className="rounded-[10px] overflow-hidden border border-[var(--border-neutral-weaker)] bg-zinc-950 h-[280px] sm:h-[380px] relative">
              <img
                src={item.images?.[0] || '/ads/no-image.svg'}
                alt={uiListing.title}
                className="w-full h-full object-cover"
              />
              {item.isTraded && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded bg-[#1a237e] text-white text-[12px] font-bold shadow">
                  تهاتر شده
                </div>
              )}
            </div>

            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {item.images.slice(1, 7).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${uiListing.title} - ${toPersianDigits(i + 2)}`}
                    className="h-16 w-full object-cover rounded-[6px] border border-[var(--border-neutral-weaker)]"
                  />
                ))}
              </div>
            )}

            <div className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
              <h2 className="text-[16px] font-bold">توضیحات کامل آگهی</h2>
              <p className="text-[14.5px] leading-[28px] whitespace-pre-line">
                {uiListing.description}
              </p>
            </div>

            <InlineAdAiSection listing={uiListing} />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[10px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] space-y-4">
              <h1 className="text-[20px] sm:text-[22px] font-extrabold leading-[34px]">
                {uiListing.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {item.hasExchange ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11.5px] font-bold">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>امکان معاوضه: بله</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-default)] text-[11.5px] font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>امکان معاوضه: خیر (نقدی / اقساط ۵۰/۵۰)</span>
                  </span>
                )}
                {item.hasInstallmentPlan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)] text-[11.5px] font-bold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>اقساط ۵۰/۵۰ (۱ تا ۵ سال)</span>
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
                  {priceNum > 0 ? formatToman(priceNum) : uiListing.priceLabel || 'توافقی'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[12.5px] pt-2 border-t border-[var(--border-neutral-weaker)]">
                <span className="text-[var(--content-neutral-default)]">تاریخ ثبت آگهی</span>
                <span className="font-bold text-[var(--content-neutral-stronger)]">{uiListing.publishedAt}</span>
              </div>

              {item.hasExchange && item.exchangeWith && (
                <div className="p-3 rounded-[8px] bg-[var(--surface-neutral-subtle)] text-[12.5px]">
                  <span className="font-bold">مورد ترجیحی برای معاوضه: </span>
                  <span>{toPersianDigits(item.exchangeWith)}</span>
                </div>
              )}

              <div className="text-[12.5px] text-[var(--content-neutral-default)] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <span>
                  {cityName}، {item.neighborhood}
                  {uiListing.coordinates.streetHint ? ` (${uiListing.coordinates.streetHint})` : ''}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href={`/?q=${encodeURIComponent(item.code)}`}
                  className="kt-button--primary w-full !h-[42px] text-[13px] flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>ثبت درخواست معامله، معاوضه و کارشناسی در سامانه</span>
                </Link>
              </div>
            </div>

            <ShareActionsBar
              listingCode={item.code}
              listingTitle={uiListing.title}
              cityName={cityName}
              neighborhood={item.neighborhood}
              streetHint={uiListing.coordinates.streetHint}
              lat={uiListing.coordinates.lat}
              lng={uiListing.coordinates.lng}
            />

            <AdInstallmentBox
              listingCode={item.code}
              price={priceNum}
              contactPhone={displayPhone}
            />

            <div id="map" className="rounded-[10px] border border-[var(--border-neutral-weaker)] overflow-hidden">
              <AdMapClientWrapper
                city={cityName}
                lat={uiListing.coordinates.lat}
                lng={uiListing.coordinates.lng}
                isApproximate={uiListing.coordinates.isApproximate}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
