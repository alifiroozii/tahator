'use client';

export interface BackendUserSummary {
  id: string;
  phone: string;
  fullName: string;
  accountType?: string;
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  isVerified: boolean;
  trustScore: number;
  roles: string[];
  permissions: string[];
}

export interface BackendProfileResponse {
  id: string;
  phone: string;
  fullName: string;
  accountType?: string;
  onboardingCompleted: boolean;
  requiresOnboarding: boolean;
  locationPromptCompleted?: boolean;
  shouldPromptMapLocation?: boolean;
  unpinnedListings?: {
    id: string;
    code: string;
    title: string;
    neighborhood: string;
    streetHint?: string | null;
    price: string | number;
    city: { name: string; slug: string };
  }[];
  city: { id: string; name: string; slug: string } | null;
  ibanMasked: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  simOwnershipRevoked: boolean;
  autoOfficialInvoice: boolean;
  uiTheme: 'LIGHT' | 'DARK' | 'SYSTEM';
  personalizedFeed: boolean;
  hidePhoneInChat: boolean;
  harassmentShieldOn: boolean;
  allowCallHours: string | null;
  preferredCategories: string[];
  trustScore: number;
  completionPercent: number;
  wallet: {
    availableBalance: string;
    lockedBalance: string;
    currency: string;
  } | null;
  dashboards: {
    roleCode: string;
    titleFa: string;
    shortTitleFa: string;
    dashboardKey: string;
  }[];
}

export interface BackendListingItem {
  id: string;
  code: string;
  externalSourceId?: string | null;
  title: string;
  description: string;
  price: number | string;
  priceLabel?: string | null;
  subcategory: string;
  neighborhood: string;
  streetHint?: string | null;
  isNegotiable: boolean;
  hasExchange: boolean;
  exchangeWith?: string | null;
  hasInstallmentPlan: boolean;
  isVerifiedPhotos: boolean;
  isUrgent: boolean;
  isTraded?: boolean;
  badge?: string | null;
  sourceDateFa?: string | null;
  contactPhone?: string | null;
  images: string[];
  specsJson?: { label: string; value: string }[];
  detailsJson?: { label: string; value: string }[];
  amenitiesJson?: string[];
  lat?: number | null;
  lng?: number | null;
  isApproximateLocation?: boolean;
  viewsCount: number;
  moderationStatus?: string;
  createdAt: string;
  updatedAt?: string;
  ladderedAt?: string;
  category: { id: string; slug: string; name: string; emoji?: string };
  city: { id: string; slug: string; name: string; province?: string };
  owner?: { id: string; fullName: string; isVerified: boolean; phone?: string; allowCallHours?: string };
}

export class ApiClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let activeRefreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (activeRefreshPromise) return activeRefreshPromise;

  activeRefreshPromise = (async () => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  if (
    res.status === 401 &&
    allowRefresh &&
    !path.startsWith('/auth/otp/') &&
    !path.startsWith('/auth/refresh')
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
    if (typeof window !== 'undefined' && !path.startsWith('/auth/logout')) {
      window.dispatchEvent(new Event('tahator:unauthorized'));
    }
  } else if (
    res.status === 401 &&
    !path.startsWith('/auth/otp/') &&
    !path.startsWith('/auth/refresh') &&
    !path.startsWith('/auth/logout') &&
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(new Event('tahator:unauthorized'));
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const payload = (data && typeof data === 'object' ? data : {}) as {
      message?: string | string[];
    };
    const msg = Array.isArray(payload.message)
      ? payload.message.join(' - ')
      : payload.message || 'خطا در ارتباط با سرور رخ داد.';
    throw new ApiClientError(msg, res.status);
  }

  return data as T;
}

export const tahatorApi = {
  requestOtp(phone: string) {
    return apiRequest<{
      success: boolean;
      message: string;
      expiresInSeconds: number;
      isSimulated?: boolean;
      demoCode?: string;
    }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp(payload: { phone: string; code: string; fullName?: string; deviceLabel?: string }) {
    return apiRequest<{
      success: boolean;
      user: BackendUserSummary;
      sessionId: string;
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return apiRequest<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  getMyProfile() {
    return apiRequest<BackendProfileResponse>('/users/me');
  },

  updateMyProfile(payload: Record<string, unknown>) {
    return apiRequest<BackendProfileResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  submitKyc(payload: { nationalId: string; iban?: string; fullName?: string }) {
    return apiRequest<{
      success: boolean;
      isVerified?: boolean;
      ibanMasked?: string | null;
      message: string;
      user?: {
        id: string;
        fullName: string;
        isVerified: boolean;
        verifiedAt: string | null;
        ibanMasked: string | null;
        trustScore: number;
      };
    }>('/users/me/kyc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  revokeSim(phone: string) {
    return apiRequest<{ success: boolean; message: string }>('/users/me/sim-revocation', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  getMyWallet() {
    return apiRequest<{
      availableBalance: string;
      lockedBalance: string;
      autoOfficialInvoice?: boolean;
      refundPolicyNoticeFa?: string;
      transactions: {
        id: string;
        title?: string;
        titleFa?: string;
        amount: string;
        type?: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND';
        txType?: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
        status: string;
        createdAt: string;
      }[];
    }>('/wallet/mine');
  },

  topUpWallet(amount: number, idempotencyKey?: string) {
    return apiRequest<{
      success: boolean;
      availableBalance: string;
      message: string;
    }>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, idempotencyKey }),
    });
  },

  initiateWalletGateway(amount: number, idempotencyKey?: string) {
    return apiRequest<{
      transactionId: string;
      authority: string;
      amount: string | number;
      gatewayMode: string;
      bankName: string;
    }>('/wallet/gateway/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount, idempotencyKey }),
    });
  },

  verifyWalletGateway(authority: string, paid: boolean) {
    return apiRequest<{
      success: boolean;
      availableBalance: string | number;
      message: string;
    }>('/wallet/gateway/verify', {
      method: 'POST',
      body: JSON.stringify({ authority, paid }),
    });
  },

  getMySessions() {
    return apiRequest<
      {
        id: string;
        deviceLabel: string;
        ipAddress: string | null;
        lastUsedAt: string;
        isCurrent: boolean;
      }[]
    >('/auth/sessions');
  },

  revokeSession(sessionId: string) {
    return apiRequest<{ success: boolean }>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
  },

  getListingsMeta() {
    return apiRequest<{
      categories: { id: string; slug: string; name: string; emoji: string; sortOrder: number; showInSidebar: boolean }[];
      cities: { id: string; slug: string; name: string; province: string; isPopular: boolean; adCount?: number }[];
    }>('/listings/meta');
  },

  getPublicListings(params: {
    q?: string;
    city?: string;
    category?: string;
    subcategory?: string;
    neighborhood?: string;
    minPrice?: number;
    maxPrice?: number;
    withPhoto?: boolean;
    exchange?: boolean;
    installment?: boolean;
    urgent?: boolean;
    sort?: 'newest' | 'cheapest' | 'expensive';
    page?: number;
    limit?: number;
  } = {}) {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.city) qs.set('city', params.city);
    if (params.category) qs.set('category', params.category);
    if (params.subcategory) qs.set('subcategory', params.subcategory);
    if (params.neighborhood) qs.set('neighborhood', params.neighborhood);
    if (params.minPrice !== undefined) qs.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice));
    if (params.withPhoto) qs.set('withPhoto', 'true');
    if (params.exchange) qs.set('exchange', 'true');
    if (params.installment) qs.set('installment', 'true');
    if (params.urgent) qs.set('urgent', 'true');
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    qs.set('limit', String(params.limit ?? 250));
    return apiRequest<{
      items: BackendListingItem[];
      total: number;
      page?: number;
      totalPages?: number;
    }>(`/listings?${qs.toString()}`);
  },

  getPublicListingDetail(id: string) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}`);
  },

  getListingByCode(code: string) {
    return apiRequest<BackendListingItem>(`/listings/by-code/${encodeURIComponent(code)}`);
  },

  getMyListings(group?: 'active' | 'incomplete' | 'archived') {
    const query = group ? `?group=${group}` : '';
    return apiRequest<BackendListingItem[]>(`/listings/mine${query}`);
  },

  createListing(payload: {
    categoryId?: string;
    categoryName?: string;
    subcategory: string;
    cityId?: string;
    cityName?: string;
    neighborhood: string;
    streetHint?: string;
    title: string;
    description: string;
    price: number;
    priceLabel?: string;
    hasExchange?: boolean;
    exchangeWith?: string;
    hasInstallmentPlan?: boolean;
    lat?: number;
    lng?: number;
    isApproximateLocation?: boolean;
    images?: string[];
    saveAsDraft?: boolean;
  }) {
    return apiRequest<BackendListingItem>('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateMyListing(
    id: string,
    payload: {
      categoryId?: string;
      categoryName?: string;
      subcategory?: string;
      cityId?: string;
      cityName?: string;
      title?: string;
      description?: string;
      price?: number;
      priceLabel?: string;
      isNegotiable?: boolean;
      contactPhone?: string;
      neighborhood?: string;
      streetHint?: string;
      hasExchange?: boolean;
      exchangeWith?: string;
      hasInstallmentPlan?: boolean;
      lat?: number;
      lng?: number;
      isApproximateLocation?: boolean;
      images?: string[];
    },
  ) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  archiveMyListing(id: string, reason: string) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  restoreMyListing(id: string) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  upgradeMyListing(id: string, action: 'ladder' | 'urgent') {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  renewMyListing(id: string) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}/renew`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  trackListingContact(id: string) {
    return apiRequest<{ success: boolean }>(`/listings/${encodeURIComponent(id)}/track-contact`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  trackListingChat(id: string) {
    return apiRequest<{ success: boolean }>(`/listings/${encodeURIComponent(id)}/track-chat`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Secure local media upload
  uploadImages(files: File[]) {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return apiRequest<{
      items: { id: string; url: string; mimeType: string; sizeBytes: number }[];
    }>('/uploads/images', {
      method: 'POST',
      body: fd,
    });
  },

  // Bookmarks, notes, saved searches & recent views
  getSavedBundle() {
    return apiRequest<{
      bookmarks: Array<{ listing: BackendListingItem; createdAt: string }>;
      notes: Array<{ listingId: string; content: string; updatedAt: string; listing?: { title: string } }>;
      savedSearches: Array<{
        id: string;
        title: string;
        query: string;
        categorySlug?: string | null;
        cityLabel: string;
        onlyExchange: boolean;
        notifyEnabled: boolean;
        createdAt: string;
      }>;
      recentViews: Array<{ listing: BackendListingItem; viewedAt: string }>;
    }>('/listings/saved/bundle');
  },

  toggleBookmark(listingId: string) {
    return apiRequest<{ bookmarked: boolean }>(`/listings/${encodeURIComponent(listingId)}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  upsertListingNote(listingId: string, content: string) {
    return apiRequest<{ id: string; content: string }>(`/listings/${encodeURIComponent(listingId)}/note`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deleteListingNote(listingId: string) {
    return apiRequest<{ success: boolean }>(`/listings/${encodeURIComponent(listingId)}/note`, {
      method: 'DELETE',
    });
  },

  createSavedSearch(payload: {
    title: string;
    query?: string;
    categorySlug?: string;
    cityLabel?: string;
    onlyExchange?: boolean;
  }) {
    return apiRequest<{ id: string }>('/listings/saved-searches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteSavedSearch(id: string) {
    return apiRequest<{ success: boolean }>(`/listings/saved-searches/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  clearRecentViews() {
    return apiRequest<{ success: boolean }>('/listings/recent-views', {
      method: 'DELETE',
    });
  },

  // Barter Assets, Offers, Agreements, 3-Way Chains & Legal Arbitration
  listBarterAssets() {
    return apiRequest<
      Array<{
        id: string;
        title: string;
        estimatedValue: string | number;
        condition: string;
        cityName: string;
        swapPreference: string;
        note?: string | null;
        isAvailable: boolean;
        createdAt: string;
        category?: { name: string; slug: string };
      }>
    >('/barter/assets');
  },

  createBarterAsset(payload: {
    categoryId: string;
    title: string;
    estimatedValue: number;
    condition: 'NEW' | 'LIKE_NEW' | 'USED';
    cityName: string;
    swapPreference: string;
    note?: string;
  }) {
    return apiRequest<{ id: string }>('/barter/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteBarterAsset(id: string) {
    return apiRequest<{ success: boolean }>(`/barter/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getAssetAiMatches(assetId: string) {
    return apiRequest<{
      asset: { id: string; title: string; estimatedValue: string | number };
      matches: Array<{
        listing: BackendListingItem;
        matchPercent: number;
        cashDiff: number;
        installmentEligible: boolean;
      }>;
    }>(`/barter/assets/${encodeURIComponent(assetId)}/ai-matches`);
  },

  listThreeWayChains() {
    return apiRequest<
      Array<{
        id: string;
        compatibilityScore: number;
        summary: string;
        nodeA: { title: string; city: string; price: number };
        nodeB: { title: string; city: string; price: number };
        nodeC: { title: string; city: string; price: number };
      }>
    >('/barter/three-way-chains');
  },

  listBarterOffers(direction?: 'received' | 'sent') {
    const q = direction ? `?direction=${direction}` : '';
    return apiRequest<Array<Record<string, unknown>>>(`/barter/offers${q}`);
  },

  createBarterOffer(payload: {
    listingId: string;
    offeredAssetId?: string;
    offeredItemTitle: string;
    offeredEstimatedPrice: number;
    installmentRequested?: boolean;
    note: string;
  }) {
    return apiRequest<Record<string, unknown>>('/barter/offers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  respondBarterOffer(offerId: string, status: 'ACCEPTED' | 'REJECTED') {
    return apiRequest<Record<string, unknown>>(`/barter/offers/${encodeURIComponent(offerId)}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  signBarterAgreement(agreementId: string) {
    return apiRequest<Record<string, unknown>>(`/barter/agreements/${encodeURIComponent(agreementId)}/sign`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  getArbitrationQueue() {
    return apiRequest<Array<Record<string, unknown>>>('/barter/arbitration/queue');
  },

  arbitrateAgreement(
    agreementId: string,
    payload: {
      milestoneStage: 'NEGOTIATION' | 'ASSET_INSPECTION' | 'ESCROW_PAYMENT' | 'FINAL_HANDOVER';
      arbitrationNotes: string;
      markCompleted?: boolean;
    },
  ) {
    return apiRequest<Record<string, unknown>>(`/barter/agreements/${encodeURIComponent(agreementId)}/arbitrate`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Installments (50/50)
  calculateInstallment(payload: {
    totalAmount: number;
    barterCoveredAmount: number;
    months: number;
    method?: 'monthly' | 'yearly';
    customRatePercent?: number;
  }) {
    return apiRequest<{
      totalAmount: number;
      barterCoveredAmount: number;
      loanAmount: number;
      months: number;
      method: 'monthly' | 'yearly';
      annualRatePercent: number;
      totalInterest: number;
      monthlyInstallment: number;
      totalPayable: number;
      barterRatioPercent: number;
    }>('/installments/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  applyInstallment(payload: {
    listingId: string;
    barterOfferId?: string;
    totalAmount: number;
    barterCoveredAmount: number;
    months: number;
    method?: 'monthly' | 'yearly';
    customRatePercent?: number;
  }) {
    return apiRequest<Record<string, unknown>>('/installments/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listMyInstallments() {
    return apiRequest<Array<Record<string, unknown>>>('/installments/mine');
  },

  listInstallmentQueue() {
    return apiRequest<Array<Record<string, unknown>>>('/installments/queue');
  },

  reviewInstallment(
    id: string,
    payload: {
      status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'COMPLETED';
      creditScore?: number;
      reviewNote?: string;
    },
  ) {
    return apiRequest<Record<string, unknown>>(`/installments/${encodeURIComponent(id)}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Appraisals (Asset Expert)
  requestAppraisal(payload: { listingId?: string; barterAssetId?: string }) {
    return apiRequest<Record<string, unknown>>('/appraisals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listMyAppraisals() {
    return apiRequest<Array<Record<string, unknown>>>('/appraisals/mine');
  },

  listAppraisalQueue() {
    return apiRequest<Array<Record<string, unknown>>>('/appraisals/queue');
  },

  claimAppraisal(id: string) {
    return apiRequest<Record<string, unknown>>(`/appraisals/${encodeURIComponent(id)}/claim`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  },

  submitAppraisalReport(
    id: string,
    payload: {
      estimatedMarketValue: number;
      reportSummary: string;
      checklistJson?: Record<string, unknown>;
    },
  ) {
    return apiRequest<Record<string, unknown>>(`/appraisals/${encodeURIComponent(id)}/report`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Business Store & Agent Desk
  getMyBusiness() {
    return apiRequest<Record<string, unknown> | null>('/business/mine');
  },

  upsertMyBusiness(payload: {
    storeName: string;
    cityName?: string;
    specialty?: string;
    bio?: string;
  }) {
    return apiRequest<Record<string, unknown>>('/business/mine', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getMyBusinessAnalytics() {
    return apiRequest<{
      business: Record<string, unknown> | null;
      activeListingsCount: number;
      totalViews: number;
      totalContactClicks: number;
      totalChatClicks: number;
      pendingOffersCount: number;
      advisorsCount: number;
      topListings: Array<Record<string, unknown>>;
    }>('/business/mine/analytics');
  },

  addBusinessAdvisor(payload: { phone: string; titleLabel?: string }) {
    return apiRequest<Record<string, unknown>>('/business/mine/advisors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeBusinessAdvisor(memberId: string) {
    return apiRequest<{ success: boolean }>(`/business/mine/advisors/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    });
  },

  getBusinessAgentDesk() {
    return apiRequest<{
      memberships: Array<Record<string, unknown>>;
      myListings: BackendListingItem[];
      leadOffers: Array<Record<string, unknown>>;
    }>('/business/agent/desk');
  },

  // Real-time / Secure Chat
  listChatThreads() {
    return apiRequest<Array<Record<string, unknown>>>('/chat/threads');
  },

  startChatThread(payload: { listingId: string; initialMessage: string }) {
    return apiRequest<{ thread: Record<string, unknown>; message: Record<string, unknown> }>(
      '/chat/threads',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  sendChatMessage(threadId: string, body: string) {
    return apiRequest<Record<string, unknown>>(`/chat/threads/${encodeURIComponent(threadId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  // Moderation & Reports
  submitAdReport(payload: { listingId: string; reason: string; details: string }) {
    return apiRequest<Record<string, unknown>>('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getModerationQueue() {
    return apiRequest<Array<BackendListingItem>>('/moderation/queue');
  },

  getModerationListings(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<Array<BackendListingItem>>(`/moderation/listings${q}`);
  },

  moderateListing(
    id: string,
    payload: {
      status: 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
      moderationNote?: string;
      isVerifiedPhotos?: boolean;
    },
  ) {
    return apiRequest<BackendListingItem>(`/moderation/listings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getAdReports() {
    return apiRequest<Array<Record<string, unknown>>>('/moderation/reports');
  },

  resolveAdReport(
    id: string,
    payload: { status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'; resolutionNote?: string },
  ) {
    return apiRequest<Record<string, unknown>>(`/moderation/reports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Support Tickets
  createSupportTicket(payload: {
    subject: string;
    category: 'TECHNICAL' | 'BARTER_ARBITRATION' | 'INSTALLMENT_FINANCE' | 'VIOLATION_REPORT';
    priority?: 'NORMAL' | 'URGENT';
    message: string;
  }) {
    return apiRequest<Record<string, unknown>>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMySupportTickets() {
    return apiRequest<Array<Record<string, unknown>>>('/support/tickets/mine');
  },

  getSupportQueue() {
    return apiRequest<Array<Record<string, unknown>>>('/support/tickets/queue');
  },

  replySupportTicket(
    id: string,
    payload: { body: string; status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'CLOSED' },
  ) {
    return apiRequest<Record<string, unknown>>(`/support/tickets/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Notifications & User Blocks
  listNotifications() {
    return apiRequest<Array<{ id: string; title: string; body: string; isRead: boolean; createdAt: string }>>(
      '/users/me/notifications',
    );
  },

  markNotificationsRead() {
    return apiRequest<{ success: boolean }>('/users/me/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  listBlocks() {
    return apiRequest<
      Array<{ id: string; blockedUserId: string; blockedUser?: { id: string; fullName: string; phone: string } }>
    >('/users/me/blocks');
  },

  blockUser(blockedUserId: string, reason?: string) {
    return apiRequest<Record<string, unknown>>('/users/me/blocks', {
      method: 'POST',
      body: JSON.stringify({ blockedUserId, reason }),
    });
  },

  unblockUser(blockedUserId: string) {
    return apiRequest<{ success: boolean }>(`/users/me/blocks/${encodeURIComponent(blockedUserId)}`, {
      method: 'DELETE',
    });
  },

  // Editorial Blog & CMS
  getBlogCategories() {
    return apiRequest<Array<Record<string, unknown>>>('/blog/categories');
  },

  getBlogPosts(params: { q?: string; category?: string; featured?: boolean; page?: number; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.featured) qs.set('featured', 'true');
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return apiRequest<{ items: Array<Record<string, unknown>>; total: number; page: number; totalPages: number }>(
      `/blog/posts?${qs.toString()}`,
    );
  },

  getBlogPostBySlug(slug: string) {
    return apiRequest<Record<string, unknown>>(`/blog/posts/${encodeURIComponent(slug)}`);
  },

  addBlogComment(slug: string, body: string) {
    return apiRequest<Record<string, unknown>>(`/blog/posts/${encodeURIComponent(slug)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  getAdminBlogPosts() {
    return apiRequest<Array<Record<string, unknown>>>('/blog/admin/posts');
  },

  createBlogPost(payload: {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    categoryId: string;
    coverImage?: string;
    tags?: string[];
    readMinutes?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    isFeatured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    return apiRequest<Record<string, unknown>>('/blog/admin/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateBlogPost(id: string, payload: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>(`/blog/admin/posts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteBlogPost(id: string) {
    return apiRequest<{ success: boolean }>(`/blog/admin/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Admin, Dynamic RBAC & Security Audit Logs
  getAdminOverview() {
    return apiRequest<{
      usersCount: number;
      listingsCount: number;
      pendingListingsCount: number;
      openReportsCount: number;
      openTicketsCount: number;
      pendingInstallmentsCount: number;
      pendingAppraisalsCount: number;
    }>('/admin/overview');
  },

  getAdminUsers() {
    return apiRequest<Array<Record<string, unknown>>>('/admin/users');
  },

  updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED', reason?: string) {
    return apiRequest<Record<string, unknown>>(`/admin/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  getAdminListings() {
    return apiRequest<Array<Record<string, unknown>>>('/admin/listings');
  },

  deleteAdminListing(id: string) {
    return apiRequest<{ success: boolean }>(`/admin/listings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getAdminSettings() {
    return apiRequest<{
      tariffs: {
        ladderFee: number;
        urgentFee: number;
        aiExpertiseFee: number;
        installmentBaseRate: number;
      };
      aiConfig: Record<string, unknown>;
    }>('/admin/settings');
  },

  updateTariffs(payload: {
    ladderFee?: number;
    urgentFee?: number;
    aiExpertiseFee?: number;
    installmentBaseRate?: number;
  }) {
    return apiRequest<Record<string, unknown>>('/admin/settings/tariffs', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateAiConfig(payload: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>('/admin/settings/ai', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getMyDashboards() {
    return apiRequest<
      Array<{ roleCode: string; titleFa: string; shortTitleFa: string; dashboardKey: string }>
    >('/rbac/my-dashboards');
  },

  listRbacRoles() {
    return apiRequest<Array<Record<string, unknown>>>('/rbac/roles');
  },

  listRbacPermissions() {
    return apiRequest<Array<{ id: string; code: string; module: string; titleFa: string }>>('/rbac/permissions');
  },

  createRbacRole(payload: {
    code: string;
    titleFa: string;
    shortTitleFa: string;
    descriptionFa: string;
    dashboardKey: string;
    hierarchyRank?: number;
    permissionCodes: string[];
  }) {
    return apiRequest<Record<string, unknown>>('/rbac/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  assignRbacRole(payload: { targetUserId: string; roleCode: string }) {
    return apiRequest<Record<string, unknown>>('/rbac/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  revokeRbacRole(payload: { targetUserId: string; roleCode: string }) {
    return apiRequest<{ success: boolean }>('/rbac/revoke', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAuditLogs(limit = 60, action?: string) {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (action) qs.set('action', action);
    return apiRequest<Array<Record<string, unknown>>>(`/audit-logs?${qs.toString()}`);
  },

  queryAiAssistant(payload: { message: string; listingId?: string; months?: number }) {
    return apiRequest<{
      replyFa: string;
      supportPhoneFa: string;
      installmentSummary: {
        totalAmount: number;
        totalAmountFa: string;
        downOrBarterFa: string;
        loanPrincipalFa: string;
        months: number;
        monthsFa: string;
        ratePercentFa: string;
        monthlyInstallment: number;
        monthlyInstallmentFa: string;
        totalPayableFa: string;
      };
      suggestedListings: Array<{
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
      }>;
    }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
