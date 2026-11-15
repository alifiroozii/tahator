'use client';

export interface BackendUserSummary {
  id: string;
  phone: string;
  fullName: string;
  isVerified: boolean;
  trustScore: number;
  roles: string[];
  permissions: string[];
}

export interface BackendProfileResponse {
  id: string;
  phone: string;
  fullName: string;
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
};
