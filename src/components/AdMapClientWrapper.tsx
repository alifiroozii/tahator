'use client';

import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full rounded-[8px] flex items-center justify-center bg-[var(--surface-neutral-weak)] text-[12px] text-[var(--content-neutral-default)]">
      در حال بارگذاری نقشه...
    </div>
  ),
});

export default function AdMapClientWrapper({
  city,
  lat,
  lng,
  isApproximate = false,
}: {
  city: string;
  lat?: number | null;
  lng?: number | null;
  isApproximate?: boolean;
}) {
  return (
    <InteractiveMap
      mode="detail"
      selectedCity={city}
      centerLat={lat}
      centerLng={lng}
      isApproximate={isApproximate}
      heightClassName="h-[240px]"
    />
  );
}
