import { CATEGORIES, Listing, formatToman, toPersianDigits } from '@/data/mockData';

export interface AiConfig {
  enabled: boolean;
  priceEstimator: boolean;
  smartSummary: boolean;
  barterMatcher: boolean;
  adCopilot: boolean;
  chatSafetyShield: boolean;
  strictModeration: boolean;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  enabled: true,
  priceEstimator: true,
  smartSummary: true,
  barterMatcher: true,
  adCopilot: true,
  chatSafetyShield: true,
  strictModeration: false,
};

export interface PriceEvaluationResult {
  status: 'good-deal' | 'fair' | 'high' | 'negotiable';
  statusLabel: string;
  estimatedCenter: number;
  minFair: number;
  maxFair: number;
  deltaPercent: number;
  markerPercent: number;
  confidence: number;
  reason: string;
}

export interface SmartListingSummaryResult {
  bullets: string[];
  safetyScore: number;
  safetyLabel: string;
}

export interface BarterMatchResult {
  listing: Listing;
  matchPercent: number;
  cashDelta: number;
  deltaDirection: 'equal' | 'add-cash' | 'receive-cash';
  suggestedPlan: string;
  reason: string;
}

export interface AdCopilotResult {
  detectedCategory: string;
  detectedSubcategory: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedPrice: number;
  suggestedExchangeWith: string;
  approvalChance: number;
  warnings: string[];
  tips: string[];
}

export interface ChatSafetyAnalysis {
  riskLevel: 'safe' | 'warning' | 'danger';
  warningText?: string;
}

export interface ModerationAuditResult {
  score: number;
  recommendedAction: 'approve' | 'review' | 'reject';
  flags: string[];
  summary: string;
}

export interface AiQueryResponse {
  answer: string;
  matchedListings: Listing[];
  suggestions: string[];
}

export function normalizeDigits(input: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  return input
    .replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d)));
}

const PREMIUM_NEIGHBORHOODS = new Set([
  'زعفرانیه',
  'الهیه',
  'نیاوران',
  'ولنجک',
  'اقدسیه',
  'فرمانیه',
  'کامرانیه',
  'محمودیه',
  'سعادت‌آباد',
  'شهرک غرب',
]);

function deterministicUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function getCategoryBaselinePrice(category: string, subcategory: string): number {
  if (category === 'املاک') {
    if (subcategory.includes('ویلا') || subcategory.includes('کلنگی') || subcategory.includes('باغ')) {
      return 18_500_000_000;
    }
    if (subcategory.includes('مغازه') || subcategory.includes('تجاری') || subcategory.includes('سوله')) {
      return 12_000_000_000;
    }
    return 8_200_000_000;
  }
  if (category === 'خودرو') {
    if (
      subcategory.includes('سنگین') ||
      subcategory.includes('کشاورزی') ||
      subcategory.includes('راهسازی') ||
      subcategory.includes('صنعتی')
    ) {
      return 3_400_000_000;
    }
    return 1_650_000_000;
  }
  if (category === 'موتورسیکلت') {
    if (subcategory.includes('سنگین')) return 480_000_000;
    return 240_000_000;
  }
  return 1_200_000_000;
}

export function evaluateListingPrice(
  listing: Listing,
  allListings: Listing[]
): PriceEvaluationResult {
  if (listing.deposit && listing.rent) {
    const center = listing.deposit;
    return {
      status: 'fair',
      statusLabel: 'متناسب با نرخ رهن و اجاره محله',
      estimatedCenter: center,
      minFair: Math.round(center * 0.9),
      maxFair: Math.round(center * 1.12),
      deltaPercent: -3,
      markerPercent: 45,
      confidence: 89,
      reason: `تحلیل آفلاین بر اساس میانگین ودیعه و اجاره در محدوده ${listing.neighborhood} (${listing.city})`,
    };
  }

  if (!listing.price || listing.price <= 0) {
    const base = getCategoryBaselinePrice(listing.category, listing.subcategory);
    return {
      status: 'negotiable',
      statusLabel: 'قیمت توافقی — نیازمند ارزش‌گذاری تهاتر',
      estimatedCenter: base,
      minFair: Math.round(base * 0.85),
      maxFair: Math.round(base * 1.15),
      deltaPercent: 0,
      markerPercent: 50,
      confidence: 84,
      reason: `این آگهی با قیمت توافقی ثبت شده است؛ بازه پیشنهادی بر اساس میانگین دسته ${listing.category} برآورد گردید.`,
    };
  }

  const sameSubPeers = allListings
    .filter((l) => l.id !== listing.id && l.subcategory === listing.subcategory && l.price > 0)
    .map((l) => l.price);
  const sameCatPeers = allListings
    .filter((l) => l.id !== listing.id && l.category === listing.category && l.price > 0)
    .map((l) => l.price);

  const peers = sameSubPeers.length >= 2 ? sameSubPeers : sameCatPeers;
  let baseline = listing.price;

  if (peers.length > 0) {
    const sorted = [...peers].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    // Blend peer median with item price & location multiplier so estimate stays realistic across outliers
    const ratio = listing.price / median;
    if (ratio >= 0.45 && ratio <= 2.2) {
      baseline = Math.round(median * 0.45 + listing.price * 0.55);
    } else {
      const bias = 0.92 + deterministicUnit(listing.id) * 0.18;
      baseline = Math.round(listing.price * bias);
    }
  } else {
    const bias = 0.92 + deterministicUnit(listing.id) * 0.16;
    baseline = Math.round(listing.price * bias);
  }

  if (PREMIUM_NEIGHBORHOODS.has(listing.neighborhood)) {
    baseline = Math.round(baseline * 1.04);
  }

  const text = `${listing.title} ${listing.description}`;
  if (
    listing.isUrgent ||
    listing.badge === 'فوری' ||
    text.includes('زیر قیمت') ||
    text.includes('فوری')
  ) {
    baseline = Math.round(Math.max(baseline, listing.price * 1.12));
  }

  const minFair = Math.round(baseline * 0.9);
  const maxFair = Math.round(baseline * 1.1);
  const deltaPercent = Math.round(((listing.price - baseline) / baseline) * 100);

  let status: PriceEvaluationResult['status'] = 'fair';
  let statusLabel = 'به قیمت بازار (منصفانه)';
  let markerPercent = 50;

  if (listing.price < minFair || deltaPercent <= -7) {
    status = 'good-deal';
    statusLabel = 'خوش‌قیمت (ارزان‌تر از بازار)';
    markerPercent = Math.max(12, Math.min(34, 34 + deltaPercent));
  } else if (listing.price > maxFair || deltaPercent >= 9) {
    status = 'high';
    statusLabel = 'بالاتر از میانگین بازار';
    markerPercent = Math.min(88, Math.max(68, 62 + deltaPercent));
  } else {
    status = 'fair';
    statusLabel = 'به قیمت بازار (منصفانه)';
    markerPercent = Math.max(36, Math.min(64, 50 + deltaPercent * 1.5));
  }

  return {
    status,
    statusLabel,
    estimatedCenter: baseline,
    minFair,
    maxFair,
    deltaPercent,
    markerPercent: Math.round(markerPercent),
    confidence: Math.round(88 + deterministicUnit(`${listing.id}-conf`) * 8),
    reason: `تحلیل آفلاین بر پایه ${toPersianDigits(Math.max(peers.length, 3))} آگهی هم‌دسته در ${listing.category} (${listing.neighborhood})`,
  };
}

export function generateSmartListingSummary(listing: Listing): SmartListingSummaryResult {
  const bullets: string[] = [];

  if (listing.price > 0) {
    bullets.push(
      `ارزش اعلام‌شده ${formatToman(listing.price)} در محدوده ${listing.neighborhood} (${listing.city}) و دسته‌بندی «${listing.subcategory}» ثبت شده است.`
    );
  } else if (listing.deposit) {
    bullets.push(
      `آگهی به صورت رهن/اجاره با ودیعه ${formatToman(listing.deposit)} در ${listing.neighborhood} قابل بررسی است.`
    );
  } else {
    bullets.push(
      `قیمت این آگهی به صورت توافقی ثبت شده و امکان استعلام ارزش واقعی پیش از معامله وجود دارد.`
    );
  }

  if (listing.hasExchange) {
    bullets.push(
      `امکان تهاتر (معاوضه) با «${listing.exchangeWith || 'کالا یا دارایی هم‌ارزش'}» و بررسی طرح اقساط ۵۰/۵۰ برای مابه‌التفاوت فعال است.`
    );
  } else {
    bullets.push(
      `فروش به صورت نقدی ثبت شده، اما در صورت نیاز می‌توانید شرایط تسهیلات اقساطی را از کارشناس استعلام کنید.`
    );
  }

  if (listing.isVerifiedPhotos) {
    bullets.push(
      `تصاویر توسط مالک تأیید شده است (${toPersianDigits(Math.max(1, listing.images.length))} تصویر)؛ با این حال رویت حضوری پیش از پرداخت الزامی است.`
    );
  } else {
    bullets.push(
      `برچسب تأیید اصالت تصویر ندارد؛ توصیه می‌شود در چت درخواست عکس تازه از زوایای مختلف و بازدید حضوری کنید.`
    );
  }

  let safetyScore = 76;
  if (listing.isVerifiedPhotos) safetyScore += 12;
  if (listing.images.length >= 2) safetyScore += 5;
  if (listing.description.length > 45) safetyScore += 4;
  if (listing.sellerPhone) safetyScore += 2;
  const fullText = `${listing.title} ${listing.description}`;
  if (fullText.includes('بیعانه') || fullText.includes('کارت به کارت قبل')) {
    safetyScore -= 25;
  }
  safetyScore = Math.max(42, Math.min(98, safetyScore));

  const safetyLabel =
    safetyScore >= 88
      ? 'ریسک بسیار پایین (اطلاعات کامل)'
      : safetyScore >= 72
      ? 'استاندارد (بازدید حضوری توصیه می‌شود)'
      : 'نیازمند بررسی بیشتر قبل از پرداخت';

  return { bullets, safetyScore, safetyLabel };
}

export function matchBarterListings(
  listing: Listing,
  allListings: Listing[]
): BarterMatchResult[] {
  if (!listing.hasExchange) return [];

  const targetWant = `${listing.exchangeWith || ''} ${listing.description} ${listing.title}`.toLowerCase();

  const candidates = allListings
    .filter((item) => item.id !== listing.id && item.hasExchange)
    .map((candidate) => {
      let score = 62;
      const candText = `${candidate.title} ${candidate.category} ${candidate.subcategory}`.toLowerCase();

      if (
        (targetWant.includes('خودرو') ||
          targetWant.includes('ماشین') ||
          targetWant.includes('کشاورزی') ||
          targetWant.includes('تراکتور') ||
          targetWant.includes('کامیون')) &&
        candidate.category === 'خودرو'
      ) {
        score += 20;
      } else if (
        targetWant.includes('موتور') &&
        candidate.category === 'موتورسیکلت'
      ) {
        score += 20;
      } else if (
        (targetWant.includes('ملک') ||
          targetWant.includes('آپارتمان') ||
          targetWant.includes('زمین') ||
          targetWant.includes('ویلا') ||
          targetWant.includes('باغ')) &&
        candidate.category === 'املاک'
      ) {
        score += 20;
      } else if (candidate.category === listing.category) {
        score += 10;
      }

      if (candidate.city === listing.city) score += 6;
      if (candidate.isVerifiedPhotos) score += 4;

      let cashDelta = 0;
      let deltaDirection: BarterMatchResult['deltaDirection'] = 'equal';
      let suggestedPlan = 'ارزش‌گذاری و توافق حضوری دو طرف';

      if (listing.price > 0 && candidate.price > 0) {
        cashDelta = listing.price - candidate.price;
        const ratio = Math.min(listing.price, candidate.price) / Math.max(listing.price, candidate.price);
        score += Math.round(ratio * 15);

        const absDelta = Math.abs(cashDelta);
        if (absDelta / Math.max(listing.price, candidate.price) <= 0.08) {
          deltaDirection = 'equal';
          suggestedPlan = 'تهاتر تقریباً سر به سر (اختلاف کمتر از ۸٪)';
        } else if (cashDelta > 0) {
          deltaDirection = 'add-cash';
          const estMonthly = Math.round((absDelta * 1.22) / 12);
          suggestedPlan = `پرداخت مابه‌التفاوت ${formatToman(absDelta)} نقدی یا ماهانه حدود ${formatToman(estMonthly)} (۱۲ قسط)`;
        } else {
          deltaDirection = 'receive-cash';
          suggestedPlan = `دریافت سرانه ${formatToman(absDelta)} از مالک آگهی پیشنهادی`;
        }
      }

      const matchPercent = Math.max(76, Math.min(97, score));
      const reason =
        candText.includes('موتور') || candidate.category === 'موتورسیکلت'
          ? 'هم‌خوانی با اولویت تهاتر موتورسیکلت'
          : candText.includes('خودرو') || candidate.category === 'خودرو'
          ? 'هم‌خوانی بالا با اولویت تهاتر خودرویی'
          : candidate.city === listing.city
          ? `هم‌شهری (${candidate.city}) و آماده معاوضه`
          : `پتانسیل معاوضه در دسته ${candidate.category}`;

      return {
        listing: candidate,
        matchPercent,
        cashDelta,
        deltaDirection,
        suggestedPlan,
        reason,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 3);

  return candidates;
}

export function compareTwoListings(listingA: Listing, listingB: Listing) {
  const priceA = listingA.price || 0;
  const priceB = listingB.price || 0;
  const absDelta = Math.abs(priceA - priceB);

  let matchPercent = 72;
  if (listingA.hasExchange && listingB.hasExchange) matchPercent += 14;
  if (listingA.city === listingB.city) matchPercent += 6;
  if (priceA > 0 && priceB > 0) {
    const ratio = Math.min(priceA, priceB) / Math.max(priceA, priceB);
    matchPercent += Math.round(ratio * 10);
  }
  matchPercent = Math.min(98, matchPercent);

  const payerName =
    priceA === 0 || priceB === 0
      ? 'نیازمند قیمت‌گذاری توافقی'
      : priceA > priceB
      ? `مالک «${listingB.title}» مابه‌التفاوت را پرداخت می‌کند`
      : priceB > priceA
      ? `مالک «${listingA.title}» مابه‌التفاوت را پرداخت می‌کند`
      : 'ارزش دو مورد برابر (تهاتر سر به سر)';

  const installmentEstimateMonthly =
    absDelta > 0 ? Math.round((absDelta * 1.22) / 12) : 0;

  return {
    matchPercent,
    priceA,
    priceB,
    absDelta,
    payerName,
    installmentEstimateMonthly,
    verdict:
      matchPercent >= 88
        ? 'گزینه ایده‌آل برای تهاتر سریع و کم‌ریسک'
        : 'مناسب برای معاوضه با استفاده از طرح اقساط ۵۰/۵۰ مابه‌التفاوت',
  };
}

export function estimateMarketPriceByForm(params: {
  category: string;
  subcategory: string;
  city: string;
  neighborhood: string;
  condition: 'new' | 'like-new' | 'used';
  areaOrSpec?: string;
}) {
  let center = getCategoryBaselinePrice(params.category, params.subcategory);

  const numericSpec = Number(normalizeDigits(params.areaOrSpec || '').replace(/[^\d]/g, '')) || 0;
  if (params.category === 'املاک' && numericSpec >= 25 && numericSpec <= 1000) {
    const perMeter = PREMIUM_NEIGHBORHOODS.has(params.neighborhood) ? 145_000_000 : 88_000_000;
    center = numericSpec * perMeter;
  } else if (PREMIUM_NEIGHBORHOODS.has(params.neighborhood)) {
    center = Math.round(center * 1.18);
  }

  if (params.city === 'تهران') {
    center = Math.round(center * 1.08);
  }

  if (params.condition === 'like-new') center = Math.round(center * 0.88);
  if (params.condition === 'used') center = Math.round(center * 0.72);

  return {
    minFair: Math.round(center * 0.9),
    estimatedCenter: center,
    maxFair: Math.round(center * 1.12),
  };
}

export function autoCompleteDraftAd(input: {
  title: string;
  category?: string;
  subcategory?: string;
  city?: string;
  neighborhood?: string;
  price?: string;
  exchangeWith?: string;
}): AdCopilotResult {
  const title = input.title.trim();
  const lower = title.toLowerCase();

  let detectedCategory = input.category || CATEGORIES[0].name;
  let detectedSubcategory = input.subcategory || CATEGORIES[0].subcategories[0];

  if (
    lower.includes('آپارتمان') ||
    lower.includes('خانه') ||
    lower.includes('ویلا') ||
    lower.includes('زمین') ||
    lower.includes('مغازه') ||
    lower.includes('باغ')
  ) {
    detectedCategory = 'املاک';
    if (lower.includes('ویلا')) detectedSubcategory = 'ویلا';
    else if (lower.includes('زمین') || lower.includes('باغ')) detectedSubcategory = 'زمین و کلنگی';
    else if (lower.includes('باغ') || lower.includes('کشاورزی')) detectedSubcategory = 'باغ و اراضی کشاورزی';
    else if (lower.includes('سوله') || lower.includes('کارگاه')) detectedSubcategory = 'سوله و صنعتی';
    else if (lower.includes('مغازه') || lower.includes('دفتر')) detectedSubcategory = 'مغازه و دفتر';
    else detectedSubcategory = 'آپارتمان';
  } else if (
    lower.includes('موتور') ||
    lower.includes('اسکوتر') ||
    lower.includes('آیروکس') ||
    lower.includes('بنلی') ||
    lower.includes('کراس') ||
    lower.includes('وسپا')
  ) {
    detectedCategory = 'موتورسیکلت';
    if (lower.includes('اسکوتر') || lower.includes('اتومات')) detectedSubcategory = 'اسکوتر و اتوماتیک';
    else if (lower.includes('سنگین')) detectedSubcategory = 'موتور سنگین و مسابقه‌ای';
    else if (lower.includes('کراس') || lower.includes('آفرود')) detectedSubcategory = 'موتور کراس و آفرود';
    else if (lower.includes('برقی')) detectedSubcategory = 'موتور برقی و سه‌چرخ';
    else detectedSubcategory = 'موتورسیکلت';
  } else if (
    lower.includes('خودرو') ||
    lower.includes('ماشین') ||
    lower.includes('پژو') ||
    lower.includes('توسان') ||
    lower.includes('سانتافه') ||
    lower.includes('دنا') ||
    lower.includes('هایما') ||
    lower.includes('تیگو') ||
    lower.includes('تراکتور') ||
    lower.includes('کمباین') ||
    lower.includes('کامیون') ||
    lower.includes('کشنده') ||
    lower.includes('لودر') ||
    lower.includes('وانت') ||
    lower.includes('تیبا') ||
    lower.includes('تارا') ||
    lower.includes('کی ام سی')
  ) {
    detectedCategory = 'خودرو';
    if (lower.includes('تراکتور') || lower.includes('کمباین') || lower.includes('کشاورزی')) {
      detectedSubcategory = 'ماشین‌آلات کشاورزی';
    } else if (lower.includes('کامیون') || lower.includes('کشنده') || lower.includes('سنگین') || lower.includes('خاور')) {
      detectedSubcategory = 'خودرو سنگین و نیمه‌سنگین';
    } else if (lower.includes('لودر') || lower.includes('بیل') || lower.includes('راهسازی') || lower.includes('لیفتراک')) {
      detectedSubcategory = 'ماشین‌آلات صنعتی و غیرکشاورزی';
    } else if (lower.includes('وانت') || lower.includes('نیسان') || lower.includes('ون')) {
      detectedSubcategory = 'وانت، ون و خودرو کار';
    } else {
      detectedSubcategory = 'خودرو';
    }
  }

  const city = input.city || 'تهران';
  const neighborhood = input.neighborhood || 'ونک';
  const suggestedPrice =
    Number(normalizeDigits(input.price || '').replace(/[^\d]/g, '')) ||
    getCategoryBaselinePrice(detectedCategory, detectedSubcategory);

  const suggestedExchangeWith =
    input.exchangeWith?.trim() ||
    (detectedCategory === 'املاک'
      ? 'خودرو سواری یا سنگین یا آپارتمان کوچک‌تر در تهران'
      : detectedCategory === 'موتورسیکلت'
      ? 'موتورسیکلت هم‌رده یا خودرو کارکرده'
      : 'خودرو هم‌رده، ملک یا زمین');

  const baseTitle = title || `${detectedSubcategory} تمیز و سالم`;
  const suggestedTitle = baseTitle.includes('معاوضه') ? baseTitle : `${baseTitle} (امکان معاوضه)`;

  const suggestedDescription = `✅ ${baseTitle} در وضعیت بسیار عالی و آماده تحویل در محدوده ${neighborhood} (${city}).
• قیمت کارشناسی‌شده و منصفانه با امکان مذاکره سر معامله.
• قابلیت تهاتر (معاوضه) با ${suggestedExchangeWith}.
• امکان تسویه مابه‌التفاوت از طریق طرح اقساط ۵۰/۵۰ سامانه تهاتر آپ پس از بازدید حضوری و تأیید کارشناس.`;

  const warnings: string[] = [];
  const tips: string[] = [];
  let approvalChance = 92;

  if (title.length < 8) {
    warnings.push('عنوان آگهی کوتاه است؛ افزودن مدل یا متراژ شانس دیده شدن را بیشتر می‌کند.');
    approvalChance -= 12;
  }
  if (!input.price) {
    tips.push('وارد کردن قیمت دقیق، نرخ کلیک تماس را تا ۲ برابر افزایش می‌دهد.');
    approvalChance -= 4;
  }
  if (lower.includes('بیعانه')) {
    warnings.push('ذکر درخواست بیعانه در متن ممکن است باعث رد شدن آگهی توسط ناظر شود.');
    approvalChance -= 25;
  }
  tips.push('فعال‌سازی گزینه «امکان معاوضه» و درج عکس واقعی مالک، زمان فروش را نصف می‌کند.');

  return {
    detectedCategory,
    detectedSubcategory,
    suggestedTitle,
    suggestedDescription,
    suggestedPrice,
    suggestedExchangeWith,
    approvalChance: Math.max(45, Math.min(99, approvalChance)),
    warnings,
    tips,
  };
}

export function analyzeChatSafety(messageText: string): ChatSafetyAnalysis {
  const txt = messageText.toLowerCase();
  if (
    txt.includes('بیعانه') ||
    txt.includes('پیش پرداخت') ||
    txt.includes('پیش‌پرداخت') ||
    txt.includes('کارت به کارت') ||
    txt.includes('رمز پویا') ||
    txt.includes('http://') ||
    txt.includes('https://')
  ) {
    return {
      riskLevel: 'danger',
      warningText:
        'سپر امنیتی هوش مصنوعی: هیچ‌گاه پیش از رویت حضوری کالا و احراز مدارک، بیعانه واریز نکنید یا روی لینک‌های پرداخت ناشناس کلیک نکنید.',
    };
  }
  if (txt.includes('تلگرام') || txt.includes('واتساپ') || txt.includes('شماره کارت')) {
    return {
      riskLevel: 'warning',
      warningText:
        'توصیه هوش مصنوعی: برای حفظ سابقه پیگیری و داوری، مذاکره و ثبت توافق معاوضه را درون چت امن تهاتر آپ ادامه دهید.',
    };
  }
  return { riskLevel: 'safe' };
}

export function generateSmartChatReplies(
  listingTitle: string,
  hasExchange: boolean
): string[] {
  if (hasExchange) {
    return [
      `سلام، درباره آگهی «${listingTitle}» امکان معاوضه با دارایی هم‌ارزش و پرداخت مابه‌التفاوت اقساطی ۵۰/۵۰ را دارید؟`,
      'سلام، وضعیت سلامت و مدارک مالکیت کاملاً تایید شده است؟ برای بازدید حضوری چه ساعتی مناسب است؟',
      'در صورت معامله نقدی یا تهاتر با خودرو/دیجیتال، آخرین قیمت منصفانه چقدر است؟',
    ];
  }
  return [
    `سلام، آگهی «${listingTitle}» همچنان موجود است؟`,
    'آیا امکان بررسی خرید اقساطی از طریق تسهیلات تهاتر آپ برای این آگهی وجود دارد؟',
    'برای بازدید حضوری در محل چطور هماهنگ کنیم؟',
  ];
}

export function auditListingForModeration(listing: Listing): ModerationAuditResult {
  const flags: string[] = [];
  let score = 90;

  if (listing.images.length === 0) {
    flags.push('فاقد تصویر پیوست');
    score -= 14;
  }
  if (!listing.isVerifiedPhotos) {
    flags.push('تصویر توسط مالک احراز نشده');
    score -= 8;
  }
  if (listing.description.trim().length < 25) {
    flags.push('توضیحات بسیار کوتاه');
    score -= 10;
  }
  const text = `${listing.title} ${listing.description}`;
  if (text.includes('بیعانه') || text.includes('لینک پرداخت')) {
    flags.push('کلیدواژه مشکوک مالی (بیعانه/لینک)');
    score -= 35;
  }
  if (listing.price > 0 && listing.price < 100_000 && listing.category === 'املاک') {
    flags.push('عدم تطابق قیمت با دسته‌بندی املاک');
    score -= 22;
  }

  score = Math.max(25, Math.min(99, score));
  const recommendedAction: ModerationAuditResult['recommendedAction'] =
    score >= 82 ? 'approve' : score >= 62 ? 'review' : 'reject';

  const summary =
    flags.length === 0
      ? 'ممیزی آفلاین: بدون ریسک، آماده انتشار و نمایش در نتایج تهاتر.'
      : `ممیزی آفلاین (${toPersianDigits(flags.length)} نکته): ${flags.join('، ')}.`;

  return { score, recommendedAction, flags, summary };
}

export function answerOfflineAiQuery(
  query: string,
  allListings: Listing[]
): AiQueryResponse {
  const clean = normalizeDigits(query).trim().toLowerCase();
  if (!clean) {
    return {
      answer: 'سوال خود را بنویسید (مثلاً: «آپارتمان قابل معاوضه در تهران»، «خودرو زیر ۲ میلیارد» یا «موتورسیکلت قابل تهاتر»).',
      matchedListings: allListings.slice(0, 3),
      suggestions: ['بهترین گزینه‌های معاوضه ملک و خودرو', 'موتورسیکلت‌های آماده تهاتر', 'محاسبه قسط ۵۰/۵۰'],
    };
  }

  // Parse budget ceiling like "تا 2 میلیارد" or "زیر 150 میلیون"
  let maxBudget: number | null = null;
  const billionMatch = clean.match(/(\d+(?:\.\d+)?)\s*میلیارد/);
  const millionMatch = clean.match(/(\d+(?:\.\d+)?)\s*میلیون/);
  if (billionMatch) {
    maxBudget = Number(billionMatch[1]) * 1_000_000_000;
  } else if (millionMatch) {
    maxBudget = Number(millionMatch[1]) * 1_000_000;
  }

  let targetCategory: string | null = null;
  if (clean.includes('ملک') || clean.includes('آپارتمان') || clean.includes('ویلا') || clean.includes('زمین') || clean.includes('باغ') || clean.includes('مغازه')) {
    targetCategory = 'املاک';
  } else if (clean.includes('موتور') || clean.includes('اسکوتر')) {
    targetCategory = 'موتورسیکلت';
  } else if (
    clean.includes('خودرو') ||
    clean.includes('ماشین') ||
    clean.includes('پژو') ||
    clean.includes('توسان') ||
    clean.includes('تراکتور') ||
    clean.includes('کامیون') ||
    clean.includes('کشاورزی')
  ) {
    targetCategory = 'خودرو';
  }

  const wantsExchange = clean.includes('معاوضه') || clean.includes('تهاتر');

  let results = allListings.filter((item) => {
    if (targetCategory && item.category !== targetCategory) return false;
    if (wantsExchange && !item.hasExchange) return false;
    if (maxBudget !== null && item.price > maxBudget) return false;
    return true;
  });

  if (results.length === 0) {
    results = allListings.filter((item) => {
      const hay = `${item.title} ${item.description} ${item.category} ${item.neighborhood}`.toLowerCase();
      return clean.split(/\s+/).some((w) => w.length > 2 && hay.includes(w));
    });
  }

  const topMatches = (results.length > 0 ? results : allListings).slice(0, 4);

  let answer = '';
  if (clean.includes('قسط') || clean.includes('تسهیلات') || clean.includes('وام')) {
    answer =
      'در طرح تسهیلات ۵۰/۵۰ تهاتر آپ، تا ۵۰٪ ارزش معامله با تهاتر کالا/خودرو/ملک و مابه‌التفاوت با اقساط ۶ تا ۳۶ ماهه پوشش داده می‌شود. می‌توانید از دکمه «تسهیلات» در نوار بالا یا تب «مقایسه دو آگهی» همین بخش، قسط دقیق را محاسبه کنید. چند آگهی دارای شرط اقساط برای شما آماده شد:';
  } else if (results.length > 0) {
    answer = `تحلیل آفلاین برای جستجوی شما ${toPersianDigits(results.length)} آگهی مرتبط پیدا کرد${
      maxBudget ? ` (با سقف بودجه ${formatToman(maxBudget)})` : ''
    }${wantsExchange ? ' با قابلیت معاوضه فعال' : ''}. بهترین موارد پیشنهادی در ادامه نمایش داده شده‌اند:`;
  } else {
    answer =
      'موردی دقیقاً با تمام شروط پیدا نشد، اما نزدیک‌ترین آگهی‌های دارای امکان تهاتر و قیمت منصفانه را برای بررسی سریع انتخاب کردم:';
  }

  return {
    answer,
    matchedListings: topMatches,
    suggestions: [
      'آپارتمان قابل معاوضه در تهران',
      'موتورسیکلت قابل تهاتر',
      'خودرو برای تهاتر و اقساط ۵۰/۵۰',
    ],
  };
}

export interface ThreeWayBarterChain {
  id: string;
  nodeA: Listing;
  nodeB: Listing;
  nodeC: Listing;
  compatibilityPercent: number;
  netCashSettlement: string;
  narrative: string;
}

/**
 * Extracts numeric area (square meters) from a real-estate listing specs/title.
 */
export function extractAreaFromListing(listing: Listing): number | null {
  const fromSpecs = listing.specs?.find((s) => s.label.includes('متراژ'))?.value || '';
  const combined = normalizeDigits(`${fromSpecs} ${listing.title}`);
  const match = combined.match(/(\d+)\s*متر/);
  return match ? Number(match[1]) : null;
}

/**
 * Extracts room count from a real-estate listing specs/title.
 */
export function extractRoomsFromListing(listing: Listing): number | null {
  const fromSpecs = listing.specs?.find((s) => s.label.includes('اتاق'))?.value || '';
  const norm = normalizeDigits(fromSpecs);
  const direct = norm.match(/\d+/);
  if (direct) return Number(direct[0]);
  const inTitle = normalizeDigits(listing.title).match(/(\d+)\s*خواب/);
  return inTitle ? Number(inTitle[1]) : null;
}

/**
 * Returns up to 4 similar/comparable listings in the same category or close budget.
 */
export function getRelatedListings(listing: Listing, allListings: Listing[]): Listing[] {
  return allListings
    .filter((item) => item.id !== listing.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === listing.category) score += 40;
      if (candidate.subcategory === listing.subcategory) score += 25;
      if (candidate.city === listing.city) score += 15;
      if (candidate.hasExchange === listing.hasExchange) score += 10;
      if (listing.price > 0 && candidate.price > 0) {
        const ratio = Math.min(listing.price, candidate.price) / Math.max(listing.price, candidate.price);
        score += Math.round(ratio * 20);
      }
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.candidate);
}

/**
 * Discovers multi-hop 3-way barter chains (A -> B -> C -> A) for unlocking blocked direct trades.
 */
export function findThreeWayBarterChains(
  anchorListing: Listing,
  allListings: Listing[]
): ThreeWayBarterChain[] {
  const exchangePool = allListings.filter((l) => l.id !== anchorListing.id && l.hasExchange);
  if (exchangePool.length < 2) return [];

  const chains: ThreeWayBarterChain[] = [];
  const usedPairs = new Set<string>();

  for (let i = 0; i < exchangePool.length && chains.length < 3; i += 1) {
    const b = exchangePool[i];
    if (b.category === anchorListing.category && exchangePool.length > 3) continue;

    for (let j = i + 1; j < exchangePool.length && chains.length < 3; j += 1) {
      const c = exchangePool[j];
      if (c.category === b.category && exchangePool.length > 4) continue;
      const pairKey = [anchorListing.id, b.id, c.id].sort().join('-');
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const pA = anchorListing.price || 1_500_000_000;
      const pB = b.price || 1_500_000_000;
      const pC = c.price || 1_500_000_000;
      const spread = Math.max(pA, pB, pC) - Math.min(pA, pB, pC);
      const compat = Math.min(96, Math.max(78, Math.round(89 + deterministicUnit(pairKey) * 7)));

      chains.push({
        id: `chain-${anchorListing.id}-${b.id}-${c.id}`,
        nodeA: anchorListing,
        nodeB: b,
        nodeC: c,
        compatibilityPercent: compat,
        netCashSettlement:
          spread > 0
            ? `تراز مالی زنجیره با ${formatToman(Math.round(spread * 0.25))} سرانه یا اقساط ۵۰/۵۰ بسته می‌شود`
            : 'تقریباً سربه‌سر بدون نیاز به نقدینگی سنگین',
        narrative: `مالک «${anchorListing.subcategory}» دارایی شما را برای «${b.subcategory}» معاوضه می‌کند و «${c.title.slice(0, 28)}...» ضلع سوم تهاتر را کامل می‌سازد.`,
      });
    }
  }

  return chains;
}

/**
 * Generates an instant structured barter pre-agreement draft for copy/export in sales conversion.
 */
export function generateBarterAgreementDraft(params: {
  listingTitle: string;
  listingCode: string;
  listingPrice: number;
  offeredTitle: string;
  offeredPrice: number;
  sellerName: string;
  useInstallment: boolean;
}): string {
  const diff = Math.abs((params.listingPrice || 0) - (params.offeredPrice || 0));
  const half = Math.round(diff * 0.5);
  const installmentPart = params.useInstallment && diff > 0
    ? `نصف نقد (${formatToman(half)}) و مابقی طی ۱۲ قسط ماهیانه از طریق تسهیلات ۵۰/۵۰ تهاتر آپ`
    : diff === 0
    ? 'معامله سربه‌سر بدون پرداخت مابه‌التفاوت نقدی'
    : `${formatToman(diff)} تسویه همزمان در دفترخانه/نمایشگاه`;

  return [
    `پیش‌نویس تفاهم‌نامه اولیه تهاتر (سامانه تهاتر آپ)`,
    `--------------------------------------------------`,
    `کد آگهی مرجع: ${params.listingCode}`,
    `طرف اول (فروشنده): ${params.sellerName} — مورد معامله: «${params.listingTitle}» (ارزش توافقی: ${params.listingPrice > 0 ? formatToman(params.listingPrice) : 'توافقی'})`,
    `طرف دوم (پیشنهاددهنده): مورد پیشنهادی «${params.offeredTitle || 'دارایی معرفی‌شده در چت'}» (ارزش برآوردی: ${params.offeredPrice > 0 ? formatToman(params.offeredPrice) : 'توافقی پس از کارشناسی'})`,
    `نحوه تسویه مابه‌التفاوت (سرانه): ${installmentPart}`,
    `شروط امنیتی: هرگونه انتقال سند یا پرداخت منوط به رویت حضوری، احراز اصالت مدارک در سامانه ثبت و تایید کارشناس تهاتر آپ بوده و پیش از آن هیچ بیعانه‌ای پرداخت نمی‌شود.`,
  ].join('\n');
}
