'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  MessageSquareText,
  Pencil,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Store,
  User,
} from 'lucide-react';
import { CATEGORIES, CITIES, toPersianDigits } from '@/data/mockData';
import { normalizeDigits } from '@/lib/offlineAi';
import { ApiClientError, tahatorApi } from '@/lib/apiClient';
import { UserRole } from '@/types/platform';

interface AuthOtpModalProps {
  initialPhone?: string;
  availableCities?: { id: string; name: string; province: string }[];
  availableCategories?: { id: string; name: string; emoji: string; showInSidebar?: boolean }[];
  onCompleteAuth: (payload: {
    phone: string;
    name: string;
    city: string;
    accountType?: string;
    role: UserRole;
    preferredCategories: string[];
    isNewUser: boolean;
    isVerified?: boolean;
    sessionId?: string;
    onboardingCompleted: boolean;
  }) => void;
  onClose: () => void;
}

function formatMaskedIranPhone(digits: string): string {
  const clean = normalizeDigits(digits).replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 4) return toPersianDigits(clean);
  if (clean.length <= 7) {
    return `${toPersianDigits(clean.slice(0, 4))} ${toPersianDigits(clean.slice(4))}`;
  }
  return `${toPersianDigits(clean.slice(0, 4))} ${toPersianDigits(clean.slice(4, 7))} ${toPersianDigits(clean.slice(7))}`;
}

export default function AuthOtpModal({
  initialPhone = '',
  availableCities,
  availableCategories,
  onCompleteAuth,
  onClose,
}: AuthOtpModalProps) {
  const cityOptions =
    availableCities && availableCities.length > 0
      ? availableCities
      : CITIES.map((c) => ({ id: c.id, name: c.name, province: c.province }));
  const categoryOptions =
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : CATEGORIES.filter((c) => c.showInSidebar).map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          showInSidebar: c.showInSidebar,
        }));

  const [step, setStep] = useState<'phone' | 'otp' | 'onboarding'>('phone');
  const [phoneDigits, setPhoneDigits] = useState<string>(
    normalizeDigits(initialPhone).replace(/\D/g, '').slice(0, 11)
  );
  const [phoneError, setPhoneError] = useState<string>('');
  const [showTerms, setShowTerms] = useState<'tos' | 'privacy' | null>(null);

  // Real Melipayamak OTP state (4..12 digits)
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [otpSuccessFlash, setOtpSuccessFlash] = useState<boolean>(false);
  const [resendSeconds, setResendSeconds] = useState<number>(180);
  const [isRequestingOtp, setIsRequestingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState<boolean>(false);
  const [onboardingError, setOnboardingError] = useState<string>('');
  const [verifiedServerUser, setVerifiedServerUser] = useState<{
    sessionId: string;
    isVerified: boolean;
    role: UserRole;
  } | null>(null);

  // Onboarding state (shown ONLY on first login when onboardingCompleted === false)
  const [fullName, setFullName] = useState<string>('');
  const [city, setCity] = useState<string>(cityOptions[0]?.name || 'تهران');
  const [accountType, setAccountType] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  const otpFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step !== 'otp' || resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step, resendSeconds]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpFieldRef.current?.focus();
      }, 60);
    }
  }, [step]);

  const isPhoneValid = /^09\d{9}$/.test(phoneDigits);

  const handlePhoneInputChange = (rawVal: string) => {
    const clean = normalizeDigits(rawVal).replace(/\D/g, '').slice(0, 11);
    setPhoneDigits(clean);
    if (/^09\d{9}$/.test(clean)) {
      setPhoneError('');
    }
  };

  const issueNewOtpAndMove = async (targetPhone: string) => {
    if (isRequestingOtp) return;
    const clean = normalizeDigits(targetPhone).replace(/\D/g, '').slice(0, 11);
    if (!/^09\d{9}$/.test(clean)) {
      setPhoneError('شمارهٔ موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود).');
      return;
    }

    setPhoneError('');
    setIsRequestingOtp(true);
    try {
      const res = await tahatorApi.requestOtp(clean);
      setOtpInput('');
      setOtpError('');
      setOtpSuccessFlash(false);
      setResendSeconds(res.expiresInSeconds || 180);
      setStep('otp');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setPhoneError(err.message);
      } else {
        setPhoneError('ارسال پیامک کد تایید انجام نشد. لطفاً لحظاتی دیگر دوباره تلاش کنید.');
      }
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const submitOtpVerification = async (rawCode: string) => {
    const cleanCode = normalizeDigits(rawCode).replace(/\D/g, '').slice(0, 12);
    if (cleanCode.length < 4 || cleanCode.length > 12) {
      setOtpError('لطفاً کد تایید پیامکی (۴ تا ۱۲ رقم) را کامل وارد کنید.');
      return;
    }

    if (isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await tahatorApi.verifyOtp({
        phone: phoneDigits,
        code: cleanCode,
        deviceLabel: 'مرورگر وب تهاتر',
      });
      setOtpSuccessFlash(true);
      const primaryRole = (res.user.roles?.[0] as UserRole) || 'user';

      if (res.user.requiresOnboarding) {
        setVerifiedServerUser({
          sessionId: res.sessionId,
          isVerified: res.user.isVerified,
          role: primaryRole,
        });
        const initialName =
          res.user.fullName &&
          res.user.fullName !== 'کاربر تهاتر' &&
          res.user.fullName !== 'کاربر جدید' &&
          res.user.fullName !== 'کاربر تهاتر آپ'
            ? res.user.fullName
            : '';
        setFullName(initialName);
        setStep('onboarding');
        return;
      }

      let resolvedCity = cityOptions[0]?.name || 'تهران';
      let resolvedPreferred: string[] = [];
      let resolvedAccountType = res.user.accountType || 'PERSONAL';
      try {
        const profile = await tahatorApi.getMyProfile();
        if (profile.city?.name) resolvedCity = profile.city.name;
        if (Array.isArray(profile.preferredCategories)) {
          resolvedPreferred = profile.preferredCategories;
        }
        if (profile.accountType) resolvedAccountType = profile.accountType;
      } catch {
        // Fallback smoothly if profile summary endpoint wasn't ready
      }

      onCompleteAuth({
        phone: res.user.phone,
        name: res.user.fullName,
        city: resolvedCity,
        accountType: resolvedAccountType,
        role: primaryRole,
        preferredCategories: resolvedPreferred,
        isNewUser: false,
        isVerified: res.user.isVerified,
        sessionId: res.sessionId,
        onboardingCompleted: true,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setOtpError(err.message);
      } else {
        setOtpError('خطا در بررسی کد تایید. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpInputChange = (val: string) => {
    const clean = normalizeDigits(val).replace(/\D/g, '').slice(0, 12);
    setOtpInput(clean);
    if (otpError) setOtpError('');
  };

  const togglePrefCategory = (catName: string) => {
    setPreferredCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const mm = String(Math.floor(resendSeconds / 60));
  const ss = String(resendSeconds % 60).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[10px] shadow-2xl w-full max-w-[460px] overflow-hidden border border-[var(--border-neutral-weaker)] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-neutral-weaker)]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-[15px] font-bold text-[var(--content-neutral-strong)]">
              {step === 'onboarding'
                ? 'تکمیل مشخصات ورود اول'
                : 'ورود با شماره موبایل'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--surface-neutral-subtle)] text-[var(--content-neutral-default)]"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 'phone' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void issueNewOtpAndMove(phoneDigits);
              }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-[15px] font-bold text-[var(--content-neutral-strong)] mb-1">
                  شمارهٔ موبایل خود را وارد کنید
                </h3>
                <p className="text-[12.5px] leading-6 text-[var(--content-neutral-default)]">
                  برای ثبت آگهی، مدیریت «تهاتر من» و پیگیری پیشنهادهای معاوضه، کد یک‌بار مصرف از طریق پیامک به شماره شما ارسال می‌شود.
                </p>
              </div>

              <div>
                <div className="relative flex items-center" dir="ltr">
                  <span className="absolute left-3 px-2 py-0.5 rounded bg-[var(--surface-neutral-subtle)] text-[12px] font-bold text-[var(--content-neutral-default)] border border-[var(--border-neutral-weaker)]">
                    +۹۸
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    dir="ltr"
                    value={phoneDigits}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder="0912..."
                    className={`kt-input !h-[46px] !pl-16 !pr-4 text-left font-bold tracking-[0.06em] text-[15px] ${
                      phoneError ? '!border-[var(--brand-primary)]' : ''
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[12px] text-[var(--brand-primary)] font-medium mt-1.5">
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="text-[12px] leading-6 text-[var(--content-neutral-default)]">
                ورود با کد یک‌بار مصرف به منزلهٔ پذیرش{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(showTerms === 'tos' ? null : 'tos')}
                  className="text-[var(--brand-primary)] font-bold hover:underline"
                >
                  شرایط استفاده از خدمات
                </button>{' '}
                و{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(showTerms === 'privacy' ? null : 'privacy')}
                  className="text-[var(--brand-primary)] font-bold hover:underline"
                >
                  حریم خصوصی
                </button>{' '}
                است.
              </div>

              {showTerms && (
                <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] text-[11.5px] leading-5 text-[var(--content-neutral-default)]">
                  {showTerms === 'tos'
                    ? 'شماره موبایل شما صرفاً برای ارسال رمز یک‌بار مصرف پیامکی، بازیابی آگهی‌های ثبت‌شده و امنیت معاملات تهاتر استفاده می‌شود.'
                    : 'نشست شما با کوکی HttpOnly ایمن مدیریت می‌شود و در پیام‌رسان تهاتر، نمایش شماره تماس تحت کنترل تنظیمات حریم خصوصی شماست.'}
                </div>
              )}

              <button
                type="submit"
                disabled={!isPhoneValid || isRequestingOtp}
                className={`w-full !h-[44px] rounded-[6px] text-[14px] font-bold transition-colors ${
                  isPhoneValid && !isRequestingOtp
                    ? 'kt-button--primary'
                    : 'bg-[var(--surface-neutral-subtle)] text-[var(--content-neutral-weak)] cursor-not-allowed'
                }`}
              >
                {isRequestingOtp ? 'در حال ارسال پیامک کد تایید...' : 'ارسال رمز یک‌بار مصرف'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitOtpVerification(otpInput);
              }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--content-neutral-strong)] mb-1">
                    کد تایید پیامکی را وارد کنید
                  </h3>
                  <p className="text-[12.5px] leading-6 text-[var(--content-neutral-default)]">
                    رمز یک‌بار مصرف به شماره{' '}
                    <span dir="ltr" className="font-bold text-[var(--content-neutral-strong)]">
                      {formatMaskedIranPhone(phoneDigits)}
                    </span>{' '}
                    پیامک شد.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpError('');
                  }}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-neutral-weaker)] text-[11.5px] font-medium hover:bg-[var(--surface-neutral-subtle)]"
                >
                  <Pencil className="w-3 h-3" />
                  <span>تغییر شماره</span>
                </button>
              </div>

              <div className="rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] p-3 flex items-center gap-2.5 text-[12px] text-[var(--content-neutral-default)]">
                <MessageSquareText className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <span>
                  پیامک حاوی کد تایید ارسال شده است. پس از دریافت، کد عددی را در کادر زیر وارد کنید.
                </span>
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1.5 text-[var(--content-neutral-strong)]">
                  کد تایید ارسال‌شده:
                </label>
                <input
                  ref={otpFieldRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  maxLength={12}
                  value={otpInput}
                  onChange={(e) => handleOtpInputChange(e.target.value)}
                  placeholder="مثلاً کد پیامک‌شده را وارد کنید"
                  className={`kt-input !h-[52px] text-center text-[20px] font-bold tracking-[0.22em] ${
                    otpError
                      ? '!border-[var(--brand-primary)] bg-[#fff5f5]'
                      : otpSuccessFlash
                      ? '!border-[var(--semantic-positive)] bg-[var(--semantic-positive-soft)]'
                      : ''
                  }`}
                />
              </div>

              {otpError && (
                <p className="text-[12px] font-medium text-[var(--brand-primary)] text-center">
                  {otpError}
                </p>
              )}

              {otpSuccessFlash && (
                <div className="flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-[var(--semantic-positive)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>شماره با موفقیت تایید شد!</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[12px] pt-1">
                {resendSeconds > 0 ? (
                  <span className="text-[var(--content-neutral-default)]">
                    ارسال مجدد کد تا{' '}
                    <strong dir="ltr" className="text-[var(--content-neutral-strong)]">
                      {toPersianDigits(mm)}:{toPersianDigits(ss)}
                    </strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void issueNewOtpAndMove(phoneDigits)}
                    disabled={isRequestingOtp}
                    className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-bold hover:underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRequestingOtp ? 'animate-spin' : ''}`} />
                    <span>درخواست کد جدید</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpError('');
                  }}
                  className="inline-flex items-center gap-1 text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-strong)]"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>بازگشت</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={otpInput.length < 4 || isVerifyingOtp}
                className={`w-full !h-[44px] rounded-[6px] text-[14px] font-bold transition-colors ${
                  otpInput.length >= 4 && !isVerifyingOtp
                    ? 'kt-button--primary'
                    : 'bg-[var(--surface-neutral-subtle)] text-[var(--content-neutral-weak)] cursor-not-allowed'
                }`}
              >
                {isVerifyingOtp ? 'در حال بررسی رمز یک‌بار مصرف...' : 'تایید و ورود'}
              </button>
            </form>
          )}

          {step === 'onboarding' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSavingOnboarding) return;
                const trimmedName = fullName.trim();
                if (trimmedName.length < 2) {
                  setOnboardingError('لطفاً نام و نام خانوادگی خود را (حداقل ۲ حرف) وارد کنید.');
                  return;
                }
                setOnboardingError('');
                setIsSavingOnboarding(true);
                try {
                  await tahatorApi.updateMyProfile({
                    fullName: trimmedName,
                    cityName: city,
                    accountType,
                    preferredCategories,
                    completeOnboarding: true,
                  });
                  onCompleteAuth({
                    phone: phoneDigits,
                    name: trimmedName,
                    city,
                    accountType,
                    role: verifiedServerUser?.role || 'user',
                    preferredCategories,
                    isNewUser: true,
                    isVerified: verifiedServerUser?.isVerified ?? false,
                    sessionId: verifiedServerUser?.sessionId,
                    onboardingCompleted: true,
                  });
                  onClose();
                } catch (err) {
                  setOnboardingError(
                    err instanceof ApiClientError
                      ? err.message
                      : 'ذخیره اطلاعات تکمیلی با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
                  );
                } finally {
                  setIsSavingOnboarding(false);
                }
              }}
              className="space-y-4"
            >
              <div className="p-3 rounded-[8px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>
                  شماره {formatMaskedIranPhone(phoneDigits)} تایید شد! این فرم فقط در اولین ورود شما نمایش داده می‌شود:
                </span>
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1">
                  نام و نام خانوادگی <span className="text-[var(--brand-primary)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (onboardingError) setOnboardingError('');
                  }}
                  placeholder="مثلاً: رضا کریمی"
                  className="kt-input !h-[42px] text-[13px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold mb-1">شهر اصلی فعالیت</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="kt-input !h-[40px] text-[13px] bg-white"
                  >
                    {cityOptions.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold mb-1">نوع حساب</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAccountType('PERSONAL')}
                      className={`h-[40px] px-2 rounded-[6px] border text-[12px] font-medium flex items-center justify-center gap-1 ${
                        accountType === 'PERSONAL'
                          ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                          : 'border-[var(--border-neutral-weaker)] bg-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>شخصی</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('BUSINESS')}
                      className={`h-[40px] px-2 rounded-[6px] border text-[12px] font-medium flex items-center justify-center gap-1 ${
                        accountType === 'BUSINESS'
                          ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                          : 'border-[var(--border-neutral-weaker)] bg-white'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>کسب‌وکار</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1.5">
                  دسته‌بندی‌های مورد علاقه برای تهاتر (اختیاری):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((cat) => {
                    const active = preferredCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => togglePrefCategory(cat.name)}
                        className={`px-2.5 py-1.5 rounded-full text-[11px] border transition-colors ${
                          active
                            ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                            : 'bg-white border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                        }`}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {onboardingError && (
                <p className="text-[12px] text-[var(--brand-primary)] font-medium">
                  {onboardingError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingOnboarding}
                className="w-full kt-button--primary !h-[44px] text-[13px] font-bold disabled:opacity-70"
              >
                {isSavingOnboarding
                  ? 'در حال ثبت اطلاعات...'
                  : 'ثبت مشخصات و ورود به حساب کاربری'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="px-5 py-3 bg-[var(--surface-neutral-subtle)] border-t border-[var(--border-neutral-weaker)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--content-neutral-default)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
          <span>ورود امن با رمز یک‌بار مصرف پیامکی (OTP)</span>
        </div>
      </div>
    </div>
  );
}
