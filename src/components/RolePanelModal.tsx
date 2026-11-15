'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  Users,
  FileCheck2,
  Headphones,
  Store,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Send,
  TrendingUp,
  Trash2,
  Sliders,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { AiConfig, auditListingForModeration } from '@/lib/offlineAi';
import {
  AdModerationStatus,
  AdReport,
  InstallmentRequest,
  ListingAnalyticsMeta,
  PlatformUserAccount,
  ROLE_META,
  getRoleMeta,
  SupportTicket,
  TariffConfig,
  UserRole,
} from '@/types/platform';

interface RolePanelModalProps {
  activeRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onOpenUserDashboard: () => void;
  listings: Listing[];
  listingMeta: Record<string, ListingAnalyticsMeta>;
  onUpdateListingModeration: (
    listingId: string,
    status: AdModerationStatus,
    note?: string,
    verifyPhotos?: boolean
  ) => void;
  onDeleteAnyListing: (listingId: string) => void;
  platformUsers: PlatformUserAccount[];
  onChangePlatformUserRole: (userId: string, role: UserRole) => void;
  onTogglePlatformUserBan: (userId: string) => void;
  adReports: AdReport[];
  onResolveAdReport: (reportId: string, status: 'resolved' | 'dismissed') => void;
  supportTickets: SupportTicket[];
  onReplySupportTicket: (ticketId: string, replyText: string, newStatus?: SupportTicket['status']) => void;
  installmentRequests: InstallmentRequest[];
  onUpdateInstallmentStatus: (reqId: string, status: InstallmentRequest['status']) => void;
  tariffs: TariffConfig;
  onUpdateTariffs: (partial: Partial<TariffConfig>) => void;
  aiConfig: AiConfig;
  onUpdateAiConfig: (partial: Partial<AiConfig>) => void;
  onSelectListing: (listing: Listing) => void;
  onClose: () => void;
}

export default function RolePanelModal({
  activeRole,
  onSwitchRole,
  onOpenUserDashboard,
  listings,
  listingMeta,
  onUpdateListingModeration,
  onDeleteAnyListing,
  platformUsers,
  onChangePlatformUserRole,
  onTogglePlatformUserBan,
  adReports,
  onResolveAdReport,
  supportTickets,
  onReplySupportTicket,
  installmentRequests,
  onUpdateInstallmentStatus,
  tariffs,
  onUpdateTariffs,
  aiConfig,
  onUpdateAiConfig,
  onSelectListing,
  onClose,
}: RolePanelModalProps) {
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'ads' | 'tariffs' | 'ai'>('users');
  const [modNoteByAd, setModNoteByAd] = useState<Record<string, string>>({});
  const [ticketReplyById, setTicketReplyById] = useState<Record<string, string>>({});
  const [businessAgents, setBusinessAgents] = useState<string[]>([
    'امیرمحمد شریفی (مشاور منطقه ۱ تا ۳)',
    'پریسا نوری (کارشناس معاوضه خودرو)',
  ]);
  const [newAgentName, setNewAgentName] = useState('');

  const roleOrder: UserRole[] = ['user', 'business', 'moderator', 'support', 'admin'];

  const roleIcon = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'moderator':
        return <FileCheck2 className="w-4 h-4" />;
      case 'support':
        return <Headphones className="w-4 h-4" />;
      case 'business':
        return <Store className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const openReportsCount = adReports.filter((r) => r.status === 'open').length;
  const openTicketsCount = supportTickets.filter((t) => t.status !== 'بسته‌شده').length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1080px] h-[100dvh] sm:h-[90vh] bg-[var(--surface-neutral-weaker)] sm:rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0">
              {roleIcon(activeRole)}
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--content-neutral-stronger)] truncate">
                مرکز مدیریت نقش‌ها — {getRoleMeta(activeRole).title}
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[var(--content-neutral-default)] truncate">
                {getRoleMeta(activeRole).description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Role Switcher Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[var(--surface-neutral-subtle)] border-b border-[var(--border-neutral-weaker)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[12px] font-bold text-[var(--content-neutral-default)] shrink-0 ml-1">
            تغییر نقش فعال:
          </span>
          {roleOrder.map((r) => {
            const active = activeRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSwitchRole(r)}
                className={`shrink-0 h-[34px] px-3 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 border transition-colors ${
                  active
                    ? 'bg-[var(--brand-action)] text-white border-[var(--brand-action)] font-bold shadow-sm'
                    : 'bg-white border-[var(--border-neutral-weaker)] text-[var(--content-neutral-stronger)] hover:border-[var(--brand-action)]'
                }`}
              >
                {roleIcon(r)}
                <span>{ROLE_META[r].shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* ============================================================== */}
          {/* ROLE 1: ADMIN                                                  */}
          {/* ============================================================== */}
          {activeRole === 'admin' && (
            <div className="space-y-5">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">کل آگهی‌های فعال</div>
                  <div className="text-[20px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                    {toPersianDigits(listings.length)}
                  </div>
                </div>
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">کاربران ثبت‌شده</div>
                  <div className="text-[20px] font-extrabold text-[var(--content-neutral-stronger)] mt-1">
                    {toPersianDigits(platformUsers.length)}
                  </div>
                </div>
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--brand-soft)]">
                  <div className="text-[12px] text-[var(--brand-primary)]">گزارش‌های تخلف باز</div>
                  <div className="text-[20px] font-extrabold text-[var(--brand-primary)] mt-1">
                    {toPersianDigits(openReportsCount)}
                  </div>
                </div>
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--semantic-warning-soft)]">
                  <div className="text-[12px] text-[var(--semantic-warning)]">تیکت‌های در جریان</div>
                  <div className="text-[20px] font-extrabold text-[var(--semantic-warning)] mt-1">
                    {toPersianDigits(openTicketsCount)}
                  </div>
                </div>
              </div>

              {/* Admin Sub-tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[var(--border-neutral-weaker)] pb-3">
                {[
                  { id: 'users', label: 'مدیریت کاربران و نقش‌ها', icon: Users },
                  { id: 'ads', label: 'مدیریت کل آگهی‌ها', icon: FileCheck2 },
                  { id: 'tariffs', label: 'تعرفه‌ها و نرخ اقساط', icon: Sliders },
                  { id: 'ai', label: 'تنظیمات هوش مصنوعی آفلاین', icon: Sparkles },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAdminSubTab(st.id as typeof adminSubTab)}
                      className={`px-3.5 py-2 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 border ${
                        adminSubTab === st.id
                          ? 'bg-[var(--brand-soft)] border-[var(--brand-action)] text-[var(--brand-primary)]'
                          : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {adminSubTab === 'users' && (
                <div className="border border-[var(--border-neutral-weaker)] rounded-[8px] overflow-x-auto">
                  <table className="w-full text-right text-[12px] sm:text-[13px]">
                    <thead className="bg-[var(--surface-neutral-subtle)] border-b border-[var(--border-neutral-weaker)]">
                      <tr>
                        <th className="p-3">نام کاربر</th>
                        <th className="p-3">موبایل</th>
                        <th className="p-3">نقش فعلی</th>
                        <th className="p-3">وضعیت</th>
                        <th className="p-3">عملیات مدیریتی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-neutral-weaker)]">
                      {platformUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="p-3 font-bold">
                            {u.name}
                            {u.verified && (
                              <span className="mr-1.5 text-[10px] text-[var(--semantic-positive)]">✓</span>
                            )}
                          </td>
                          <td className="p-3 dir-ltr text-right">{toPersianDigits(u.phone)}</td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                onChangePlatformUserRole(u.id, e.target.value as UserRole)
                              }
                              className="kt-input !h-[32px] text-[12px] max-w-[140px]"
                            >
                              {roleOrder.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_META[r].shortTitle}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                u.status === 'فعال'
                                  ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                                  : 'bg-[var(--brand-soft)] text-[var(--semantic-negative)]'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => onTogglePlatformUserBan(u.id)}
                              className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
                            >
                              <Ban className="w-3.5 h-3.5 text-[var(--semantic-negative)]" />
                              <span>{u.status === 'فعال' ? 'مسدود موقت' : 'رفع مسدودی'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminSubTab === 'ads' && (
                <div className="space-y-2.5">
                  {listings.slice(0, 10).map((ad) => {
                    const audit = auditListingForModeration(ad);
                    const meta = listingMeta[ad.id]?.moderationStatus || 'published';
                    return (
                      <div
                        key={ad.id}
                        className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[13px] truncate">{ad.title}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-neutral-weak)]">
                              {meta === 'published'
                                ? 'منتشرشده'
                                : meta === 'pending'
                                ? 'در انتظار'
                                : meta === 'needs_edit'
                                ? 'نیازمند اصلاح'
                                : 'رد شده'}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                            امتیاز هوش مصنوعی آفلاین: {toPersianDigits(audit.score)} از ۱۰۰ · {audit.summary}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateListingModeration(ad.id, 'published', undefined, true)}
                            className="kt-button--outlined !h-[30px] !px-2.5 text-[11px] text-[var(--semantic-positive)]"
                          >
                            تایید انتشار
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteAnyListing(ad.id)}
                            className="p-1.5 rounded border border-[var(--border-neutral-weaker)] text-[var(--semantic-negative)] hover:bg-[var(--brand-soft)]"
                            title="حذف کامل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {adminSubTab === 'tariffs' && (
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1">تعرفه نردبان آگهی (تومان)</label>
                    <input
                      type="number"
                      value={tariffs.ladderFee}
                      onChange={(e) => onUpdateTariffs({ ladderFee: Number(e.target.value) || 0 })}
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">تعرفه نشان «فوری» (تومان)</label>
                    <input
                      type="number"
                      value={tariffs.urgentFee}
                      onChange={(e) => onUpdateTariffs({ urgentFee: Number(e.target.value) || 0 })}
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">
                      هزینه کارشناسی هوشمند قیمت و تهاتر (تومان)
                    </label>
                    <input
                      type="number"
                      value={tariffs.aiExpertiseFee}
                      onChange={(e) =>
                        onUpdateTariffs({ aiExpertiseFee: Number(e.target.value) || 0 })
                      }
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">
                      نرخ پایه سود سالانه تسهیلات ۵۰/۵۰ (٪)
                    </label>
                    <input
                      type="number"
                      value={tariffs.installmentBaseRate}
                      onChange={(e) =>
                        onUpdateTariffs({ installmentBaseRate: Number(e.target.value) || 0 })
                      }
                      className="kt-input text-left dir-ltr"
                    />
                  </div>
                </div>
              )}

              {adminSubTab === 'ai' && (
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--brand-primary)]">
                    <Sparkles className="w-4 h-4" />
                    <span>تنظیمات موتور هوش مصنوعی آفلاین تهاتر آپ</span>
                  </div>
                  <p className="text-[12px] text-[var(--content-neutral-default)]">
                    تمامی ماژول‌های زیر به صورت محلی و بدون نیاز به اتصال کلید ابری روی پلتفرم فعال هستند و پس از اتصال مدل آنلاین قابل ارتقا خواهند بود.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(
                      [
                        { key: 'enabled', label: 'فعال بودن کل هسته هوش مصنوعی آفلاین' },
                        { key: 'priceEstimator', label: 'تخمین قیمت و دماسنج ارزش در صفحه آگهی' },
                        { key: 'smartSummary', label: 'خلاصه ۳ نقطه‌ای و امتیاز سلامت آگهی' },
                        { key: 'barterMatcher', label: 'تطبیق هوشمند معاوضه و محاسبه مابه‌التفاوت' },
                        { key: 'adCopilot', label: 'تکمیل خودکار متن و دسته‌بندی در ثبت آگهی' },
                        { key: 'chatSafetyShield', label: 'سپر ضدکلاهبرداری بیعانه و لینک در چت امن' },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.key}
                        className="p-3 rounded-[6px] border border-[var(--border-neutral-weaker)] flex items-center justify-between cursor-pointer bg-white"
                      >
                        <span className="text-[12px] font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={aiConfig[item.key]}
                          onChange={(e) => onUpdateAiConfig({ [item.key]: e.target.checked })}
                          className="accent-[var(--brand-action)] w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* ROLE 2: MODERATOR                                              */}
          {/* ============================================================== */}
          {activeRole === 'moderator' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold mb-3">
                  صف ممیزی و بررسی آگهی‌ها (همراه با تحلیل هوش مصنوعی آفلاین)
                </h3>
                <div className="space-y-3">
                  {listings.slice(0, 8).map((ad) => {
                    const audit = auditListingForModeration(ad);
                    const curStatus = listingMeta[ad.id]?.moderationStatus || 'published';
                    return (
                      <div
                        key={ad.id}
                        className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectListing(ad);
                              onClose();
                            }}
                            className="font-bold text-[14px] hover:text-[var(--brand-primary)] text-right"
                          >
                            {ad.title} ({ad.city})
                          </button>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                audit.score >= 82
                                  ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                                  : 'bg-[var(--semantic-warning-soft)] text-[var(--semantic-warning)]'
                              }`}
                            >
                              امتیاز سلامت AI: {toPersianDigits(audit.score)}٪
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[var(--surface-neutral-weak)] text-[11px]">
                              وضعیت: {curStatus === 'published' ? 'منتشرشده' : curStatus === 'needs_edit' ? 'نیازمند اصلاح' : 'در انتظار'}
                            </span>
                          </div>
                        </div>
                        <div className="text-[12px] text-[var(--content-neutral-default)]">
                          {audit.summary}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={modNoteByAd[ad.id] || ''}
                            onChange={(e) =>
                              setModNoteByAd((prev) => ({ ...prev, [ad.id]: e.target.value }))
                            }
                            placeholder="یادداشت ناظر برای مالک (مثلاً عکس واضح‌تر اضافه شود)..."
                            className="kt-input !h-[34px] text-[12px] flex-1"
                          />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateListingModeration(ad.id, 'published', undefined, true)
                              }
                              className="kt-button--primary !h-[34px] !px-3 text-[11px]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تایید و اصالت تصویر</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateListingModeration(
                                  ad.id,
                                  'needs_edit',
                                  modNoteByAd[ad.id] || 'لطفاً توضیحات و تصاویر واضح‌تر ثبت کنید.'
                                )
                              }
                              className="kt-button--outlined !h-[34px] !px-3 text-[11px]"
                            >
                              نیازمند اصلاح
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold mb-3">
                  کارتابل گزارش‌های تخلف کاربران ({toPersianDigits(adReports.length)})
                </h3>
                <div className="space-y-2.5">
                  {adReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[var(--semantic-warning)]" />
                          <span className="font-bold text-[13px]">{rep.listingTitle}</span>
                        </div>
                        <div className="text-[12px] text-[var(--content-neutral-default)] mt-1">
                          علت: {rep.reason} · {rep.details} ({rep.createdAt})
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rep.status === 'open' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onResolveAdReport(rep.id, 'resolved')}
                              className="kt-button--primary !h-[32px] !px-3 text-[11px]"
                            >
                              تایید و رسیدگی
                            </button>
                            <button
                              type="button"
                              onClick={() => onResolveAdReport(rep.id, 'dismissed')}
                              className="kt-button--outlined !h-[32px] !px-3 text-[11px]"
                            >
                              رد گزارش
                            </button>
                          </>
                        ) : (
                          <span className="text-[12px] font-bold text-[var(--semantic-positive)]">
                            {rep.status === 'resolved' ? 'رسیدگی شد ✓' : 'رد شده'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ROLE 3: SUPPORT                                                */}
          {/* ============================================================== */}
          {activeRole === 'support' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-bold mb-3">
                  صندوق تیکت‌های پشتیبانی و داوری ({toPersianDigits(supportTickets.length)})
                </h3>
                <div className="space-y-3">
                  {supportTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-[14px]">{tkt.subject}</div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                            کاربر: {tkt.userName} ({toPersianDigits(tkt.userPhone)}) · بخش: {tkt.category} · اولویت: {tkt.priority}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            tkt.status === 'بسته‌شده'
                              ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                              : 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                          }`}
                        >
                          {tkt.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 bg-[var(--surface-neutral-subtle)] p-3 rounded-[6px]">
                        {tkt.messages.map((m, idx) => (
                          <div key={idx} className="text-[12px]">
                            <strong className="text-[var(--brand-primary)]">
                              {m.sender === 'support' ? 'پشتیبان: ' : `${tkt.userName}: `}
                            </strong>
                            <span>{m.text}</span>
                            <span className="text-[10px] text-[var(--content-neutral-default)] mr-2">
                              ({m.time})
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={ticketReplyById[tkt.id] || ''}
                          onChange={(e) =>
                            setTicketReplyById((prev) => ({ ...prev, [tkt.id]: e.target.value }))
                          }
                          placeholder="پاسخ رسمی پشتیبان را بنویسید..."
                          className="kt-input !h-[36px] text-[12px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const txt = (ticketReplyById[tkt.id] || '').trim();
                            if (!txt) return;
                            onReplySupportTicket(tkt.id, txt, 'در حال پیگیری');
                            setTicketReplyById((prev) => ({ ...prev, [tkt.id]: '' }));
                          }}
                          className="kt-button--primary !h-[36px] !px-4 text-[12px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ارسال پاسخ</span>
                        </button>
                        {tkt.status !== 'بسته‌شده' && (
                          <button
                            type="button"
                            onClick={() =>
                              onReplySupportTicket(
                                tkt.id,
                                'پرونده پس از پیگیری و هماهنگی بسته شد.',
                                'بسته‌شده'
                              )
                            }
                            className="kt-button--outlined !h-[36px] !px-3 text-[12px]"
                          >
                            بستن تیکت
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[16px] font-bold mb-3">
                  پیگیری پرونده‌های تسهیلات اقساطی ۵۰/۵۰
                </h3>
                <div className="space-y-2.5">
                  {installmentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-[13px]">{req.listingTitle}</div>
                        <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                          وام درخواستی: {formatToman(req.loanAmount)} · {toPersianDigits(req.months)} ماه · وضعیت فعلی: {req.status}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateInstallmentStatus(req.id, 'تایید شده')}
                        className="kt-button--primary !h-[32px] !px-3.5 text-[12px] shrink-0"
                      >
                        تأیید نهایی اعتبارسنجی
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ROLE 4: BUSINESS                                               */}
          {/* ============================================================== */}
          {activeRole === 'business' && (
            <div className="space-y-5">
              <div className="p-4 rounded-[8px] bg-[var(--brand-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-bold text-[var(--brand-primary)]">
                    پنل اختصاصی کسب‌وکار — بازرگانی و املاک تهاتر پلاس
                  </div>
                  <div className="text-[12px] text-[var(--content-neutral-stronger)] mt-0.5">
                    دسترسی ویژه نمایشگاه‌داران خودرو (سبک، سنگین و کشاورزی)، موتورسیکلت و آژانس‌های املاک
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white text-[var(--brand-primary)] text-[12px] font-bold">
                  بسته حرفه‌ای فعال ✓
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)]">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">بازدید هفته اخیر فروشگاه</div>
                  <div className="text-[22px] font-extrabold mt-1">{toPersianDigits(4820)}</div>
                </div>
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)]">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">تماس و چت ورودی</div>
                  <div className="text-[22px] font-extrabold mt-1">{toPersianDigits(194)}</div>
                </div>
                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)]">
                  <div className="text-[12px] text-[var(--content-neutral-default)]">نردبان هدیه باقی‌مانده</div>
                  <div className="text-[22px] font-extrabold text-[var(--brand-primary)] mt-1">
                    {toPersianDigits(8)} عدد
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                <h4 className="font-bold text-[14px]">مدیریت کارشناسان و مشاوران زیرمجموعه</h4>
                <div className="space-y-2">
                  {businessAgents.map((ag, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-[var(--surface-neutral-subtle)] flex items-center justify-between text-[13px]"
                    >
                      <span>{ag}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setBusinessAgents((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-[11px] text-[var(--semantic-negative)]"
                      >
                        حذف دسترسی
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="نام مشاور جدید و حوزه فعالیت..."
                    className="kt-input !h-[36px] text-[12px] flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAgentName.trim()) return;
                      setBusinessAgents((prev) => [...prev, newAgentName.trim()]);
                      setNewAgentName('');
                    }}
                    className="kt-button--primary !h-[36px] !px-4 text-[12px]"
                  >
                    + افزودن مشاور
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ROLE 5: NORMAL USER                                            */}
          {/* ============================================================== */}
          {activeRole === 'user' && (
            <div className="p-6 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-4">
              <div className="text-[16px] font-bold text-[var(--content-neutral-stronger)]">
                شما هم‌اکنون در نقش «کاربر عادی» هستید
              </div>
              <p className="text-[13px] leading-[24px] text-[var(--content-neutral-default)]">
                تمام امکانات خرید، فروش، معاوضه، کیف پول، آگهی‌های من، پیشنهادهای تهاتر، یادداشت‌ها و جستجوهای ذخیره‌شده در داشبورد «تهاتر من» در دسترس شماست. برای تست دسترسی‌های مدیریتی، می‌توانید از نوار بالا نقش‌های «کسب‌وکار»، «ناظر آگهی»، «پشتیبان» یا «مدیر ارشد» را انتخاب کنید.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUserDashboard();
                  }}
                  className="kt-button--primary !px-5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>ورود به داشبورد کامل تهاتر من</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('admin')}
                  className="kt-button--outlined !px-4 text-[12px]"
                >
                  مشاهده پنل مدیر ارشد
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('support')}
                  className="kt-button--outlined !px-4 text-[12px]"
                >
                  مشاهده پنل پشتیبان
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
