'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as LeafletType from 'leaflet';
import { Crosshair, EyeOff, LocateFixed, Minus, Navigation, Plus, Search } from 'lucide-react';
import type { Listing } from '@/data/mockData';
import { formatToman, toPersianDigits } from '@/data/mockData';

export const IRAN_CITY_COORDS: Record<string, [number, number]> = {
  تهران: [35.6997, 51.338],
  مشهد: [36.2972, 59.6067],
  اصفهان: [32.6539, 51.666],
  شیراز: [29.5926, 52.5836],
  تبریز: [38.0962, 46.2738],
  کرج: [35.84, 50.9391],
  قم: [34.6416, 50.8746],
  اهواز: [31.3183, 48.6706],
  رشت: [37.2808, 49.5832],
  ساری: [36.5659, 53.0586],
  کیش: [26.5328, 53.9803],
  قشم: [26.9581, 56.2719],
  یزد: [31.8974, 54.3569],
  کرمان: [30.2839, 57.0834],
  همدان: [34.799, 48.515],
  ارومیه: [37.5527, 45.0761],
  قزوین: [36.2797, 50.0049],
  بندرعباس: [27.1832, 56.2666],
  بوشهر: [28.9234, 50.8203],
  اراک: [34.0954, 49.7013],
  زنجان: [36.6769, 48.4963],
  گرگان: [36.8456, 54.4393],
  کرمانشاه: [34.3142, 47.065],
  بابل: [36.5449, 52.6787],
  لاهیجان: [37.2071, 50.0034],
  انزلی: [37.4727, 49.4622],
  نوشهر: [36.649, 51.4962],
  چمستان: [36.479, 52.118],
  هشتگرد: [35.9619, 50.68],
};

export const IRAN_NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  زعفرانیه: [35.809, 51.412],
  الهیه: [35.788, 51.425],
  نیاوران: [35.814, 51.466],
  فرمانیه: [35.802, 51.462],
  کامرانیه: [35.803, 51.454],
  اقدسیه: [35.798, 51.48],
  ولنجک: [35.805, 51.396],
  محمودیه: [35.797, 51.409],
  سعادت‌آباد: [35.78, 51.375],
  'شهرک غرب': [35.759, 51.375],
  ونک: [35.756, 51.41],
  جردن: [35.768, 51.417],
  گیشا: [35.736, 51.377],
  مرزداران: [35.736, 51.351],
  ستارخان: [35.716, 51.363],
  صادقیه: [35.722, 51.334],
  پونک: [35.761, 51.335],
  جنت‌آباد: [35.753, 51.309],
  تهرانپارس: [35.735, 51.529],
  نارمک: [35.734, 51.49],
  افسریه: [35.643, 51.494],
  پیروزی: [35.691, 51.471],
  رسالت: [35.738, 51.478],
  دولت‌آباد: [35.623, 51.461],
  'دولت‌خواه': [35.619, 51.349],
  'مهرآباد جنوبی': [35.676, 51.326],
  کن: [35.756, 51.281],
  شریعتی: [35.747, 51.445],
  ولیعصر: [35.715, 51.407],
  امام‌خمینی: [35.687, 51.364],
  گلشهر: [35.829, 50.931],
  الهیه_مشهد: [36.378, 59.479],
};

function formatCompactPillPrice(price: number): string {
  if (!price || price <= 0) return 'توافقی';
  if (price >= 1_000_000_000) {
    const b = price / 1_000_000_000;
    const formatted = Number.isInteger(b) ? String(b) : b.toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(formatted)} میلیارد`;
  }
  if (price >= 1_000_000) {
    const mil = Math.round(price / 1_000_000);
    return `${toPersianDigits(mil)} م`;
  }
  return `${toPersianDigits(price)} ت`;
}

const PRIMARY_TILE_URL = 'https://mt{s}.google.com/vt/lyrs=m&hl=fa&x={x}&y={y}&z={z}';
const FALLBACK_TILE_URL = 'https://tile.openstreetmap.de/{z}/{x}/{y}.png';

export function resolveCityOrNeighborhoodCoords(
  city?: string,
  neighborhood?: string,
  lat?: number | null,
  lng?: number | null,
  jitterIndex = 0
): { coords: [number, number]; isFallback: boolean } {
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat !== 35.6997 &&
    lng !== 51.338
  ) {
    return { coords: [lat, lng], isFallback: false };
  }
  if (neighborhood && IRAN_NEIGHBORHOOD_COORDS[neighborhood]) {
    const baseN = IRAN_NEIGHBORHOOD_COORDS[neighborhood];
    const angle = (jitterIndex * 137.5 * Math.PI) / 180;
    const r = jitterIndex === 0 ? 0 : 0.004 + (jitterIndex % 4) * 0.002;
    return {
      coords: [baseN[0] + Math.sin(angle) * r, baseN[1] + Math.cos(angle) * r],
      isFallback: true,
    };
  }
  const base = (city && IRAN_CITY_COORDS[city]) || IRAN_CITY_COORDS['تهران'];
  const angle = (jitterIndex * 137.5 * Math.PI) / 180;
  const radius = jitterIndex === 0 ? 0 : 0.011 + (jitterIndex % 6) * 0.005;
  return {
    coords: [base[0] + Math.sin(angle) * radius, base[1] + Math.cos(angle) * radius],
    isFallback: true,
  };
}

export interface InteractiveMapProps {
  mode: 'feed' | 'detail' | 'picker';
  listings?: Listing[];
  selectedCity?: string;
  selectedNeighborhood?: string;
  centerLat?: number | null;
  centerLng?: number | null;
  isApproximate?: boolean;
  onToggleApproximate?: (val: boolean) => void;
  highlightedListingId?: string | null;
  onSelectListing?: (listing: Listing) => void;
  onPickLocation?: (coords: { lat: number; lng: number; isApproximate?: boolean }) => void;
  onFilterByBounds?: (bounds: { north: number; south: number; east: number; west: number } | null) => void;
  className?: string;
  heightClassName?: string;
}

export default function InteractiveMap({
  mode,
  listings = [],
  selectedCity = 'تهران',
  selectedNeighborhood,
  centerLat,
  centerLng,
  isApproximate = false,
  onToggleApproximate,
  highlightedListingId = null,
  onSelectListing,
  onPickLocation,
  onFilterByBounds,
  className = '',
  heightClassName = 'h-[420px]',
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const tileLayerRef = useRef<LeafletType.TileLayer | null>(null);
  const layerGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const approxCircleRef = useRef<LeafletType.Circle | null>(null);
  const [tileError, setTileError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [pickerCenter, setPickerCenter] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const resolvedInitial = useMemo(() => {
    const r = resolveCityOrNeighborhoodCoords(
      selectedCity,
      selectedNeighborhood,
      centerLat,
      centerLng,
      0
    );
    if (mode === 'feed' && (!selectedCity || selectedCity === 'همه شهرها')) {
      return { coords: [32.9, 52.8] as [number, number], zoom: 5 };
    }
    if (mode === 'detail') return { coords: r.coords, zoom: isApproximate ? 13 : 15 };
    if (mode === 'picker') return { coords: r.coords, zoom: 13 };
    return { coords: r.coords, zoom: 11 };
  }, [selectedCity, selectedNeighborhood, centerLat, centerLng, mode, isApproximate]);

  // Initialize Leaflet Map instance (dark theme styled smoothly via [data-theme="dark"] .leaflet-tile-pane CSS)
  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    import('leaflet').then((L) => {
      if (!mounted || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center: resolvedInitial.coords,
        zoom: resolvedInitial.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      let switchedFallback = false;
      const attachTiles = (url: string, subdomains: string[]) => {
        if (tileLayerRef.current) tileLayerRef.current.remove();
        const tiles = L.tileLayer(url, {
          maxZoom: 19,
          ...(subdomains.length > 0 ? { subdomains } : {}),
        });
        tiles.on('tileerror', () => {
          if (!switchedFallback && mapRef.current) {
            switchedFallback = true;
            attachTiles(FALLBACK_TILE_URL, []);
          } else {
            setTileError(true);
          }
        });
        tiles.on('tileload', () => setTileError(false));
        tiles.addTo(map);
        tileLayerRef.current = tiles;
      };
      attachTiles(PRIMARY_TILE_URL, ['0', '1', '2', '3']);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = group;
      setMapReady(true);

      if (mode === 'picker') {
        const initLat = resolvedInitial.coords[0];
        const initLng = resolvedInitial.coords[1];
        setPickerCenter([initLat, initLng]);

        const circle = L.circle([initLat, initLng], {
          radius: 450,
          color: '#A62626',
          fillColor: '#A62626',
          fillOpacity: isApproximate ? 0.18 : 0,
          opacity: isApproximate ? 0.75 : 0,
          weight: 2,
        }).addTo(map);
        approxCircleRef.current = circle;

        map.on('movestart', () => setIsDragging(true));
        map.on('move', () => {
          const c = map.getCenter();
          circle.setLatLng(c);
        });
        map.on('moveend', () => {
          setIsDragging(false);
          const c = map.getCenter();
          const lat = Number(c.lat.toFixed(6));
          const lng = Number(c.lng.toFixed(6));
          setPickerCenter([lat, lng]);
          circle.setLatLng([lat, lng]);
          onPickLocation?.({ lat, lng, isApproximate });
        });
        map.on('click', (e: LeafletType.LeafletMouseEvent) => {
          map.panTo(e.latlng, { animate: true });
        });
      }

      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {}
      }, 150);
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerGroupRef.current = null;
      tileLayerRef.current = null;
      approxCircleRef.current = null;
      setMapReady(false);
    };
    // Initialize once per mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Toggle approximate circle in Divar picker mode without remounting map
  useEffect(() => {
    const circle = approxCircleRef.current;
    if (mode !== 'picker' || !circle) return;
    circle.setStyle({
      fillOpacity: isApproximate ? 0.18 : 0,
      opacity: isApproximate ? 0.75 : 0,
    });
    if (pickerCenter) {
      onPickLocation?.({
        lat: pickerCenter[0],
        lng: pickerCenter[1],
        isApproximate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproximate, mode]);

  // Fly map when city/neighborhood or explicit coordinates change externally
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    const dist =
      Math.abs(c.lat - resolvedInitial.coords[0]) + Math.abs(c.lng - resolvedInitial.coords[1]);
    if (dist > 0.0005 || mode !== 'picker') {
      map.setView(resolvedInitial.coords, resolvedInitial.zoom, { animate: true });
      if (mode === 'picker') {
        setPickerCenter(resolvedInitial.coords);
        approxCircleRef.current?.setLatLng(resolvedInitial.coords);
      }
    }
  }, [resolvedInitial.coords, resolvedInitial.zoom, mode]);

  // Render Divar Price Pills in Feed Mode or Pin/Circle in Detail Mode
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    import('leaflet').then((L) => {
      if (!layerGroupRef.current) return;
      layerGroupRef.current.clearLayers();

      if (mode === 'detail') {
        const [lat, lng] = resolvedInitial.coords;
        if (isApproximate) {
          L.circle([lat, lng], {
            radius: 480,
            color: '#A62626',
            fillColor: '#A62626',
            fillOpacity: 0.18,
            weight: 2,
          }).addTo(layerGroupRef.current);
        } else {
          L.circle([lat, lng], {
            radius: 320,
            color: '#A62626',
            fillColor: '#A62626',
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(layerGroupRef.current);
          L.circleMarker([lat, lng], {
            radius: 9,
            fillColor: '#A62626',
            color: '#FFFFFF',
            weight: 3,
            fillOpacity: 1,
          }).addTo(layerGroupRef.current);
        }
        return;
      }

      if (mode === 'feed') {
        const sliced = listings.slice(0, 180);
        sliced.forEach((item, idx) => {
          const { coords } = resolveCityOrNeighborhoodCoords(
            item.city,
            item.neighborhood,
            item.coordinates?.lat,
            item.coordinates?.lng,
            idx
          );
          const isSelected = highlightedListingId === item.id;
          const label = formatCompactPillPrice(item.price);
          const bgColor = isSelected
            ? '#18181b'
            : item.hasInstallmentPlan
            ? '#A62626'
            : item.hasExchange
            ? '#c32e2e'
            : '#334155';

          const icon = L.divIcon({
            className: 'tahator-divar-pill',
            html: `<div style="direction:rtl;font-family:Vazirmatn,sans-serif;width:max-content;white-space:nowrap;padding:3px 9px;border-radius:999px;background:${bgColor};color:#ffffff;font-size:11px;font-weight:800;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.28);transform:translate(-50%,-50%) ${
              isSelected ? 'scale(1.14)' : 'scale(1)'
            };transition:transform 0.15s ease;">${label}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const marker = L.marker(coords, { icon });
          const halfPrice = Math.round((item.price || 0) * 0.5);
          const estMonthly36 =
            halfPrice > 0 ? Math.round((halfPrice * (1 + 0.22 * 3)) / 36) : 0;

          const popupEl = document.createElement('div');
          popupEl.dir = 'rtl';
          popupEl.style.fontFamily = 'Vazirmatn, sans-serif';
          popupEl.style.minWidth = '210px';
          popupEl.innerHTML = `
            <div style="font-weight:800;font-size:12.5px;margin-bottom:4px;line-height:1.5">${item.title
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')}</div>
            <div style="font-size:11px;color:#71717A;margin-bottom:6px">${item.city} · ${item.neighborhood}</div>
            <div style="font-weight:800;font-size:12.5px;color:#A62626;margin-bottom:4px">${
              item.price > 0 ? formatToman(item.price) : 'توافقی'
            }</div>
            ${
              estMonthly36 > 0
                ? `<div style="font-size:10.5px;background:#fef6ec;color:#b45309;padding:3px 6px;border-radius:4px;margin-bottom:8px;font-weight:700">تسهیلات ۵۰/۵۰: قسط ماهی ~ ${formatToman(
                    estMonthly36
                  )}</div>`
                : ''
            }
            <button type="button" style="width:100%;background:#A62626;color:#fff;border:none;border-radius:6px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer">مشاهده آگهی و شرایط اقساط</button>
          `;
          const btn = popupEl.querySelector('button');
          if (btn && onSelectListing) {
            btn.addEventListener('click', () => onSelectListing(item));
          }

          marker.bindPopup(popupEl);
          marker.addTo(layerGroupRef.current!);
        });
      }
    });
  }, [listings, mode, resolvedInitial.coords, highlightedListingId, isApproximate, onSelectListing, mapReady]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('مرورگر شما از موقعیت‌یاب پشتیبانی نمی‌کند.');
      return;
    }
    setLocatingGps(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        mapRef.current?.flyTo([lat, lng], 15, { animate: true });
      },
      () => {
        setLocatingGps(false);
        setGpsError('دسترسی به موقعیت دستگاه مجاز نشد؛ نقشه را به‌صورت دستی جابه‌جا کنید.');
      },
      { timeout: 6000 }
    );
  }, []);

  const mapLat = pickerCenter?.[0] ?? resolvedInitial.coords[0];
  const mapLng = pickerCenter?.[1] ?? resolvedInitial.coords[1];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[8px] border border-[var(--border-neutral-weak)] bg-[var(--surface-neutral-weak)] ${heightClassName} ${className}`}
    >
      <div ref={containerRef} className="w-full h-full z-10" />

      {/* Divar-style Fixed Center Crosshair Pin in Picker Mode */}
      {mode === 'picker' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="relative flex flex-col items-center -mt-7">
            <div
              className={`w-9 h-9 rounded-full bg-[var(--brand-action)] text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform duration-150 ${
                isDragging ? '-translate-y-2 scale-110' : 'translate-y-0 scale-100'
              }`}
            >
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="w-0.5 h-3 bg-[var(--brand-action)]" />
            <div
              className={`w-3 h-1.5 rounded-full bg-black/35 blur-[1px] transition-all ${
                isDragging ? 'scale-75 opacity-60' : 'scale-100 opacity-90'
              }`}
            />
          </div>
        </div>
      )}

      {/* Divar Floating Zoom +/- and Locate Me Controls */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="w-8 h-8 rounded-[6px] bg-[var(--surface-neutral-weaker)]/95 text-[var(--content-neutral-stronger)] border border-[var(--border-neutral-weak)] shadow-md flex items-center justify-center hover:bg-[var(--surface-neutral-weak)]"
          aria-label="بزرگنمایی نقشه"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="w-8 h-8 rounded-[6px] bg-[var(--surface-neutral-weaker)]/95 text-[var(--content-neutral-stronger)] border border-[var(--border-neutral-weak)] shadow-md flex items-center justify-center hover:bg-[var(--surface-neutral-weak)]"
          aria-label="کوچکنمایی نقشه"
        >
          <Minus className="w-4 h-4" />
        </button>
        {mode === 'picker' && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingGps}
            className="w-8 h-8 rounded-[6px] bg-[var(--surface-neutral-weaker)]/95 text-[var(--brand-primary)] border border-[var(--border-neutral-weak)] shadow-md flex items-center justify-center hover:bg-[var(--brand-soft)]"
            title="مکان فعلی من (GPS)"
            aria-label="مکان فعلی من"
          >
            <LocateFixed className={`w-4 h-4 ${locatingGps ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Divar "Search in this area" in Feed Mode */}
      {mode === 'feed' && onFilterByBounds && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const b = mapRef.current?.getBounds();
              if (!b) return;
              onFilterByBounds({
                north: b.getNorth(),
                south: b.getSouth(),
                east: b.getEast(),
                west: b.getWest(),
              });
            }}
            className="px-3 py-1.5 rounded-full bg-[var(--surface-neutral-weaker)]/95 text-[var(--content-neutral-stronger)] border border-[var(--border-neutral-weak)] shadow-md text-[11px] font-bold flex items-center gap-1.5 hover:border-[var(--brand-action)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>جستجو در این محدوده</span>
          </button>
        </div>
      )}

      {/* Divar Approximate Circle Privacy Toggle & Instructions in Picker Mode */}
      {mode === 'picker' && (
        <div className="absolute bottom-2 inset-x-2 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto px-2.5 py-1.5 rounded-[6px] bg-[var(--surface-neutral-weaker)]/95 border border-[var(--border-neutral-weak)] shadow text-[11px] font-bold text-[var(--content-neutral-stronger)]">
            {isDragging ? 'در حال تنظیم موقعیت...' : 'نقشه را بکشید تا پین روی موقعیت دقیق قرار گیرد'}
          </div>
          {onToggleApproximate && (
            <button
              type="button"
              onClick={() => onToggleApproximate(!isApproximate)}
              className={`pointer-events-auto px-2.5 py-1.5 rounded-[6px] border shadow text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                isApproximate
                  ? 'bg-[var(--brand-action)] text-white border-white'
                  : 'bg-[var(--surface-neutral-weaker)]/95 text-[var(--content-neutral-stronger)] border-[var(--border-neutral-weak)]'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isApproximate ? 'محدوده تقریبی فعال است' : 'نمایش محدوده تقریبی'}</span>
            </button>
          )}
        </div>
      )}

      {/* Detail Mode Navigation Shortcut */}
      {mode === 'detail' && (
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5">
          <a
            href={`https://neshan.org/maps#c${mapLat}-${mapLng}-15z-0p`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-[6px] bg-[var(--surface-neutral-weaker)]/95 text-[var(--content-neutral-stronger)] border border-[var(--border-neutral-weak)] shadow text-[11px] font-bold flex items-center gap-1 hover:text-[var(--brand-primary)]"
          >
            <Navigation className="w-3 h-3 text-[var(--brand-primary)]" />
            <span>مسیریابی نشان</span>
          </a>
        </div>
      )}

      {(tileError || gpsError) && (
        <div className="pointer-events-none absolute top-2 right-2 z-20 rounded-md bg-[var(--surface-neutral-weaker)]/90 px-2.5 py-1 text-[10px] font-medium text-[var(--content-neutral-default)] border border-[var(--border-neutral-weak)] shadow-sm">
          {gpsError || 'در حال بارگذاری لایه نقشه...'}
        </div>
      )}
    </div>
  );
}
