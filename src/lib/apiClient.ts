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
  if (options.body && !headers.has('Content-Type')) {
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
      isVerified: boolean;
      ibanMasked: string | null;
      message: string;
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
      transactions: {
        id: string;
        titleFa: string;
        amount: string;
        txType: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
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
      cities: { id: string; slug: string; name: string; province: string; isPopular: boolean; adCount: number }[];
    }>('/listings/meta');
  },

  getPublicListings(params: {
    q?: string;
    city?: string;
    category?: string;
    exchange?: boolean;
    installment?: boolean;
    urgent?: boolean;
    limit?: number;
  } = {}) {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.city) qs.set('city', params.city);
    if (params.category) qs.set('category', params.category);
    if (params.exchange) qs.set('exchange', 'true');
    if (params.installment) qs.set('installment', 'true');
    if (params.urgent) qs.set('urgent', 'true');
    qs.set('limit', String(params.limit ?? 250));
    return apiRequest<{ items: BackendListingItem[]; total: number }>(`/listings?${qs.toString()}`);
  },

  getPublicListingDetail(id: string) {
    return apiRequest<BackendListingItem>(`/listings/${encodeURIComponent(id)}`);
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
    title: string;
    description: string;
    price: number;
    priceLabel?: string;
    hasExchange?: boolean;
    exchangeWith?: string;
    hasInstallmentPlan?: boolean;
    images?: string[];
    saveAsDraft?: boolean;
  }) {
    return apiRequest<BackendListingItem>('/listings', {
      method: 'POST',
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
};
