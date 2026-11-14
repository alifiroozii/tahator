'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  MessageSquareText,
  Pencil,
  Sparkles,
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
import { UserRole } from '@/types/platform';

interface AuthOtpModalProps {
  initialPhone?: string;
  knownPhone?: string;
  knownName?: string;
  knownCity?: string;
  onCompleteAuth: (payload: {
    phone: string;
    name: string;
    city: string;
    role: UserRole;
    preferredCategories: string[];
    isNewUser: boolean;
  }) => void;
  onClose: () => void;
}

function generateRandomSixDigitCode(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return String(100000 + (arr[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
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
  knownPhone = '09123456789',
  knownName = 'علی فیروزی',
  knownCity = 'تهران',
  onCompleteAuth,
  onClose,
}: AuthOtpModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'onboarding'>('phone');
  const [phoneDigits, setPhoneDigits] = useState<string>(
    normalizeDigits(initialPhone).replace(/\D/g, '').slice(0, 11)
  );
  const [phoneError, setPhoneError] = useState<string>('');
  const [showTerms, setShowTerms] = useState<'tos' | 'privacy' | null>(null);

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [otpSuccessFlash, setOtpSuccessFlash] = useState<boolean>(false);
  const [resendSeconds, setResendSeconds] = useState<number>(120);

  // Onboarding states (for brand-new mobile numbers)
  const [fullName, setFullName] = useState<string>('');
  const [city, setCity] = useState<string>(knownCity || 'تهران');
  const [accountType, setAccountType] = useState<'user' | 'business'>('user');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([
    'املاک',
    'وسایل نقلیه',
  ]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoLoginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoLoginTimerRef.current) clearTimeout(autoLoginTimerRef.current);
    };
  }, []);

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
        inputRefs.current[0]?.focus();
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

  const issueNewOtpAndMove = (targetPhone: string) => {
    const clean = normalizeDigits(targetPhone).replace(/\D/g, '').slice(0, 11);
    if (!/^09\d{9}$/.test(clean)) {
      setPhoneError('شمارهٔ موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود)');
      return;
    }
    setPhoneError('');
    const nextCode = generateRandomSixDigitCode();
    setGeneratedOtp(nextCode);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setOtpSuccessFlash(false);
    setResendSeconds(120);
    setStep('otp');
  };

  const finalizeVerifiedPhone = (cleanPhone: string) => {
    const normalizedKnown = normalizeDigits(knownPhone).replace(/\D/g, '');
    if (cleanPhone === normalizedKnown || cleanPhone === '09123456789') {
      onCompleteAuth({
        phone: cleanPhone,
        name: cleanPhone === '09123456789' ? knownName || 'علی فیروزی' : knownName,
        city: knownCity || 'تهران',
        role: 'user',
        preferredCategories: ['املاک', 'وسایل نقلیه', 'کالای دیجیتال'],
        isNewUser: false,
      });
      onClose();
      return;
    }
    setStep('onboarding');
  };

  const verifyOtpCode = (digitsArray: string[]) => {
    const entered = digitsArray.join('');
    if (entered.length !== 6) {
      setOtpError('لطفاً هر ۶ رقم کد تایید را وارد کنید.');
      return;
    }
    if (entered !== generatedOtp) {
      setOtpError('کد تایید واردشده اشتباه است. می‌توانید روی کد پیامکی بالا کلیک کنید.');
      return;
    }
    setOtpError('');
    setOtpSuccessFlash(true);
    finalizeVerifiedPhone(phoneDigits);
  };

  const handleClickSimulatedSmsCode = () => {
    if (!generatedOtp || generatedOtp.length !== 6) return;
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    setOtpError('');
    setOtpSuccessFlash(true);
    if (autoLoginTimerRef.current) clearTimeout(autoLoginTimerRef.current);
    autoLoginTimerRef.current = setTimeout(() => {
      finalizeVerifiedPhone(phoneDigits);
    }, 320);
  };

  const handleOtpBoxChange = (idx: number, rawVal: string) => {
    const clean = normalizeDigits(rawVal).replace(/\D/g, '');
    if (clean.length > 1) {
      // Handle multi-digit paste
      const pasted = clean.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      pasted.forEach((ch, i) => {
        next[i] = ch;
      });
      setOtpDigits(next);
      setOtpError('');
      const nextFocus = Math.min(5, pasted.length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[idx] = clean;
    setOtpDigits(next);
    setOtpError('');
    if (clean && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      verifyOtpCode(otpDigits);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${toPersianDigits(String(m).padStart(2, '0'))}:${toPersianDigits(String(s).padStart(2, '0'))}`;
  };

  const togglePrefCategory = (catName: string) => {
    setPreferredCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-[var(--surface-neutral-weaker)] rounded-[10px] shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center text-[var(--content-neutral-default)]"
            aria-label="بستن پنجره ورود"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-[16px] font-bold text-[var(--content-neutral-stronger)]">
            {step === 'onboarding' ? 'تکمیل پروفایل عضو جدید' : 'ورود یا عضویت با شماره موبایل'}
          </h3>
          <div className="w-8" />
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {step === 'phone' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                issueNewOtpAndMove(phoneDigits);
              }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--content-neutral-stronger)]">
                    شمارهٔ موبایل خود را وارد کنید
                  </h4>
                  <p className="text-[12px] text-[var(--content-neutral-default)] mt-1 leading-6">
                    برای مشاهده حساب کاربری، مدیریت آگهی‌ها، ثبت پیشنهاد معاوضه و اقساط ۵۰/۵۰ شماره موبایل خود را وارد کنید.
                  </p>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    value={formatMaskedIranPhone(phoneDigits)}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                    className={`w-full h-[46px] px-4 rounded-[6px] border text-center text-[16px] font-bold tracking-wider bg-white focus:outline-none transition-colors ${
                      phoneError
                        ? 'border-[var(--semantic-negative)] ring-2 ring-[var(--semantic-negative)]/15'
                        : isPhoneValid
                        ? 'border-[var(--semantic-positive)] ring-2 ring-[var(--semantic-positive)]/15'
                        : 'border-[var(--border-neutral-weak)] focus:border-[var(--brand-action)]'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[12px] font-medium text-[var(--semantic-negative)] mt-1.5">
                    {phoneError}
                  </p>
                )}
              </div>

              {/* Quick Demo Phone Shortcuts */}
              <div className="p-3 rounded-[8px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] space-y-2">
                <div className="text-[11px] font-bold text-[var(--content-neutral-default)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                  <span>شماره‌های آزمایشی سریع (حالت بدون پنل پیامک):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneDigits('09123456789');
                      setPhoneError('');
                    }}
                    className="px-2.5 py-1.5 rounded-[5px] bg-white border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[11px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
                  >
                    حساب فعال: {toPersianDigits('09123456789')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneDigits('09357778899');
                      setPhoneError('');
                    }}
                    className="px-2.5 py-1.5 rounded-[5px] bg-white border border-[var(--border-neutral-weaker)] hover:border-[var(--brand-action)] text-[11px] font-medium text-[var(--content-neutral-stronger)] transition-colors"
                  >
                    عضو جدید: {toPersianDigits('09357778899')}
                  </button>
                </div>
              </div>

              {/* Terms & Privacy Notice */}
              <div className="text-[12px] text-[var(--content-neutral-default)] leading-6">
                با ورود به تهاتر آپ،{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(showTerms === 'tos' ? null : 'tos')}
                  className="text-[var(--brand-primary)] font-bold hover:underline"
                >
                  شرایط و قوانین استفاده
                </button>{' '}
                و{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(showTerms === 'privacy' ? null : 'privacy')}
                  className="text-[var(--brand-primary)] font-bold hover:underline"
                >
                  سیاست‌نامهٔ حریم خصوصی
                </button>{' '}
                را می‌پذیرم.
              </div>

              {showTerms && (
                <div className="p-3 rounded-[6px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] text-[11px] leading-6 text-[var(--content-neutral-default)]">
                  {showTerms === 'tos'
                    ? 'کاربران متعهد می‌شوند اطلاعات واقعی کالا یا ملک قابل معاوضه را ثبت کنند و تا زمان کارشناسی حضوری یا قرارداد رسمی از پرداخت بیعانه خارج از چهارچوب امن خودداری کنند.'
                    : 'شماره موبایل شما صرفاً برای تایید هویت، محافظت از آگهی‌ها و نمایش اختیاری در معاملات استفاده می‌شود و بدون رضایت شما در چت نمایش داده نمی‌شود.'}
                </div>
              )}

              <button
                type="submit"
                className="w-full kt-button--primary !h-[44px] text-[14px] font-bold"
              >
                <span>دریافت کد تایید پیامکی</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtpCode(otpDigits);
              }}
              className="space-y-4"
            >
              {/* Formatted Phone + Edit Button */}
              <div className="p-3 rounded-[8px] bg-[var(--surface-neutral-subtle)] border border-[var(--border-neutral-weaker)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="text-[14px] font-bold dir-ltr text-[var(--content-neutral-stronger)]">
                    {formatMaskedIranPhone(phoneDigits)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--brand-primary)] hover:underline"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>ویرایش شماره</span>
                </button>
              </div>

              <div className="text-[13px] text-[var(--content-neutral-stronger)]">
                کد تایید ۶ رقمی به شمارهٔ بالا ارسال شد.
              </div>

              {/* Simulated Incoming SMS Notification Box (Click-to-Fill & Login!) */}
              <div className="p-3.5 rounded-[8px] border-2 border-[var(--semantic-positive)]/50 bg-[var(--semantic-positive-soft)]/70 space-y-2 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--semantic-positive)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--semantic-positive)] animate-pulse" />
                    <span>پیامک شبیه‌سازی‌شده تهاتر آپ (بدون پنل SMS)</span>
                  </span>
                  <span className="text-[10px] text-[var(--content-neutral-default)]">
                    هم‌اکنون
                  </span>
                </div>
                <p className="text-[12px] text-[var(--content-neutral-stronger)]">
                  کد ورود شما به تهاتر آپ آماده است. روی کادر زیر کلیک کنید تا کد خودکار جای‌گذاری و وارد شوید:
                </p>
                <button
                  type="button"
                  onClick={handleClickSimulatedSmsCode}
                  data-testid="simulated-sms-code-btn"
                  className="w-full py-2.5 px-3 rounded-[6px] bg-white hover:bg-[var(--semantic-positive)] hover:text-white border border-[var(--semantic-positive)] text-[var(--semantic-positive)] transition-all flex items-center justify-between gap-2 group shadow-sm"
                >
                  <span className="text-[12px] font-bold">
                    کلیک برای جای‌گذاری و ورود سریع
                  </span>
                  <span
                    dir="ltr"
                    className="px-3 py-0.5 rounded bg-[var(--semantic-positive-soft)] group-hover:bg-white/20 text-[16px] font-extrabold tracking-[0.22em]"
                  >
                    {toPersianDigits(generatedOtp)}
                  </span>
                </button>
              </div>

              {/* 6 Individual OTP Digit Boxes */}
              <div dir="ltr" className="grid grid-cols-6 gap-2 pt-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit ? toPersianDigits(digit) : ''}
                    onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    aria-label={`رقم ${idx + 1} کد تایید`}
                    className={`h-[48px] text-center text-[18px] font-extrabold rounded-[6px] border bg-white focus:outline-none transition-all ${
                      otpError
                        ? 'border-[var(--semantic-negative)] ring-2 ring-[var(--semantic-negative)]/15'
                        : otpSuccessFlash
                        ? 'border-[var(--semantic-positive)] bg-[var(--semantic-positive-soft)]/50 text-[var(--semantic-positive)]'
                        : digit
                        ? 'border-[var(--brand-action)]'
                        : 'border-[var(--border-neutral-weak)] focus:border-[var(--brand-action)]'
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-[12px] font-medium text-[var(--semantic-negative)]">
                  {otpError}
                </p>
              )}
              {otpSuccessFlash && (
                <p className="text-[12px] font-bold text-[var(--semantic-positive)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>کد تایید شد! در حال ورود به پروفایل کاربری...</span>
                </p>
              )}

              {/* Resend timer row */}
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--content-neutral-default)]">
                  {resendSeconds > 0
                    ? `ارسال مجدد کد تا ${formatTimer(resendSeconds)}`
                    : 'امکان دریافت کد جدید فعال است'}
                </span>
                <button
                  type="button"
                  disabled={resendSeconds > 0}
                  onClick={() => issueNewOtpAndMove(phoneDigits)}
                  className={`inline-flex items-center gap-1 font-bold ${
                    resendSeconds > 0
                      ? 'text-[var(--content-neutral-weak)] cursor-not-allowed'
                      : 'text-[var(--brand-primary)] hover:underline'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>درخواست دوباره کد</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full kt-button--primary !h-[44px] text-[14px] font-bold"
              >
                تایید و ورود به حساب
              </button>
            </form>
          )}

          {step === 'onboarding' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onCompleteAuth({
                  phone: phoneDigits,
                  name: fullName.trim() || `کاربر ${toPersianDigits(phoneDigits.slice(-4))}`,
                  city,
                  role: accountType === 'business' ? 'business' : 'user',
                  preferredCategories,
                  isNewUser: true,
                });
                onClose();
              }}
              className="space-y-4"
            >
              <div className="p-3 rounded-[8px] bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)] text-[12px] font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>
                  شماره {formatMaskedIranPhone(phoneDigits)} با موفقیت تایید شد! پروفایل خود را سریع تنظیم کنید:
                </span>
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: رضا کریمی"
                  className="kt-input !h-[40px] text-[13px]"
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
                    {CITIES.map((c) => (
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
                      onClick={() => setAccountType('user')}
                      className={`h-[40px] px-2 rounded-[6px] border text-[12px] font-medium flex items-center justify-center gap-1 ${
                        accountType === 'user'
                          ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)] font-bold'
                          : 'border-[var(--border-neutral-weaker)] bg-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>شخصی</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('business')}
                      className={`h-[40px] px-2 rounded-[6px] border text-[12px] font-medium flex items-center justify-center gap-1 ${
                        accountType === 'business'
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
                  علاقه‌مندی‌های شما برای پیشنهادهای هوشمند تهاتر (اختیاری):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter((c) => c.showInSidebar).map((cat) => {
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

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 kt-button--primary !h-[42px] text-[13px] font-bold"
                >
                  تکمیل عضویت و ورود به پروفایل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCompleteAuth({
                      phone: phoneDigits,
                      name: fullName.trim() || `کاربر ${toPersianDigits(phoneDigits.slice(-4))}`,
                      city,
                      role: 'user',
                      preferredCategories,
                      isNewUser: true,
                    });
                    onClose();
                  }}
                  className="kt-button--outlined !h-[42px] !px-3.5 text-[12px]"
                >
                  ورود سریع
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="px-5 py-3 bg-[var(--surface-neutral-subtle)] border-t border-[var(--border-neutral-weaker)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--content-neutral-default)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--semantic-positive)]" />
          <span>احراز هویت دو مرحله‌ای موبایل تهاتر آپ</span>
        </div>
      </div>
    </div>
  );
}
