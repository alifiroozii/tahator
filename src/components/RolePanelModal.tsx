'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Scale,
  Briefcase,
  Percent,
  FileSearch,
  BookOpen,
  Plus,
  RefreshCw,
  History,
  KeyRound,
} from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { AiConfig } from '@/lib/offlineAi';
import { tahatorApi } from '@/lib/apiClient';
import {
  ALL_ROLE_ORDER,
  AdModerationStatus,
  AdReport,
  InstallmentRequest,
  ListingAnalyticsMeta,
  PlatformUserAccount,
  ROLE_META,
  SupportTicket,
  TariffConfig,
  UserRole,
  getRoleMeta,
  normalizeUserRole,
} from '@/types/platform';

interface RolePanelModalProps {
  activeRole: UserRole;
  allowedRoles?: UserRole[];
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
  onReplySupportTicket: (
    ticketId: string,
    replyText: string,
    newStatus?: SupportTicket['status']
  ) => void;
  installmentRequests: InstallmentRequest[];
  onUpdateInstallmentStatus: (reqId: string, status: InstallmentRequest['status']) => void;
  tariffs: TariffConfig;
  onUpdateTariffs: (partial: Partial<TariffConfig>) => void;
  aiConfig: AiConfig;
  onUpdateAiConfig: (partial: Partial<AiConfig>) => void;
  onSelectListing: (listing: Listing) => void;
  onRefreshCatalog?: () => void;
  onClose: () => void;
}

const ROLE_ICON: Record<UserRole, React.ElementType> = {
  user: User,
  business: Store,
  business_agent: Briefcase,
  moderator: FileCheck2,
  appraiser: FileSearch,
  credit_officer: Percent,
  support: Headphones,
  arbitrator: Scale,
  admin: Shield,
};

export default function RolePanelModal({
  activeRole,
  allowedRoles,
  onSwitchRole,
  onOpenUserDashboard,
  onRefreshCatalog,
  onUpdateTariffs,
  onUpdateAiConfig,
  tariffs,
  aiConfig,
  onClose,
}: RolePanelModalProps) {
  const isAdmin =
    activeRole === 'admin' || Boolean(allowedRoles?.includes('admin'));

  const visibleRoles = useMemo<UserRole[]>(() => {
    if (isAdmin) return ALL_ROLE_ORDER;
    const set = new Set<UserRole>(allowedRoles && allowedRoles.length > 0 ? allowedRoles : [activeRole]);
    return ALL_ROLE_ORDER.filter((r) => set.has(r));
  }, [activeRole, allowedRoles, isAdmin]);

  const currentRole = visibleRoles.includes(activeRole) ? activeRole : visibleRoles[0] || 'user';
  const meta = getRoleMeta(currentRole);

  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Moderator & Blog CMS state
  const [modSubTab, setModSubTab] = useState<'queue' | 'reports' | 'blog'>('queue');
  const [modListings, setModListings] = useState<Array<Record<string, unknown>>>([]);
  const [modReports, setModReports] = useState<Array<Record<string, unknown>>>([]);
  const [modNoteInput, setModNoteInput] = useState<Record<string, string>>({});

  // Blog CMS state (shared by moderator & admin)
  const [blogCategories, setBlogCategories] = useState<Array<Record<string, unknown>>>([]);
  const [adminPosts, setAdminPosts] = useState<Array<Record<string, unknown>>>([]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    coverImage: '/blog/barter-chain.svg',
    tagsText: 'تهاتر, هوش مصنوعی',
    readMinutes: 5,
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    isFeatured: false,
  });

  // Business state
  const [bizAnalytics, setBizAnalytics] = useState<{
    business: Record<string, unknown> | null;
    activeListingsCount: number;
    totalViews: number;
    totalContactClicks: number;
    totalChatClicks: number;
    pendingOffersCount: number;
    advisorsCount: number;
    topListings: Array<Record<string, unknown>>;
  } | null>(null);
  const [bizForm, setBizForm] = useState({
    storeName: '',
    cityName: 'تهران',
    specialty: 'املاک و خودرو',
    bio: '',
  });
  const [advisorPhone, setAdvisorPhone] = useState('');
  const [advisorLabel, setAdvisorLabel] = useState('مشاور فروش');

  // Business Agent Desk state
  const [agentDesk, setAgentDesk] = useState<{
    memberships: Array<Record<string, unknown>>;
    myListings: Array<Record<string, unknown>>;
    leadOffers: Array<Record<string, unknown>>;
  } | null>(null);

  // Appraiser Desk state
  const [appraisalQueue, setAppraisalQueue] = useState<Array<Record<string, unknown>>>([]);
  const [appraisalValues, setAppraisalValues] = useState<Record<string, { value: string; summary: string }>>({});

  // Credit Officer Desk state
  const [installmentQueue, setInstallmentQueue] = useState<Array<Record<string, unknown>>>([]);
  const [creditReviewNote, setCreditReviewNote] = useState<Record<string, string>>({});
  const [creditScores, setCreditScores] = useState<Record<string, string>>({});

  // Support Desk state
  const [supportQueue, setSupportQueue] = useState<Array<Record<string, unknown>>>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Arbitrator Desk state
  const [arbitrationQueue, setArbitrationQueue] = useState<Array<Record<string, unknown>>>([]);
  const [arbForm, setArbForm] = useState<
    Record<
      string,
      {
        milestoneStage: 'NEGOTIATION' | 'ASSET_INSPECTION' | 'ESCROW_PAYMENT' | 'FINAL_HANDOVER';
        arbitrationNotes: string;
        markCompleted: boolean;
      }
    >
  >({});

  // Admin Control Center state
  const [adminSubTab, setAdminSubTab] = useState<
    'overview' | 'users' | 'roles' | 'listings' | 'settings' | 'blog' | 'audit'
  >('overview');
  const [adminOverview, setAdminOverview] = useState<{
    usersCount: number;
    listingsCount: number;
    pendingListingsCount: number;
    openReportsCount: number;
    openTicketsCount: number;
    pendingInstallmentsCount: number;
    pendingAppraisalsCount: number;
  } | null>(null);
  const [adminUsers, setAdminUsers] = useState<Array<Record<string, unknown>>>([]);
  const [adminListings, setAdminListings] = useState<Array<Record<string, unknown>>>([]);
  const [rbacRoles, setRbacRoles] = useState<Array<Record<string, unknown>>>([]);
  const [rbacPerms, setRbacPerms] = useState<Array<{ id: string; code: string; module: string; titleFa: string }>>([]);
  const [auditLogs, setAuditLogs] = useState<Array<Record<string, unknown>>>([]);
  const [tariffDraft, setTariffDraft] = useState<TariffConfig>(tariffs);
  const [aiDraft, setAiDraft] = useState<AiConfig>(aiConfig);
  const [newRoleForm, setNewRoleForm] = useState({
    code: '',
    titleFa: '',
    shortTitleFa: '',
    descriptionFa: '',
    dashboardKey: 'custom_desk',
    permissionCodes: [] as string[],
  });

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => setStatusBanner(null), 5000);
  };

  const loadRoleData = useCallback(async (roleToLoad: UserRole) => {
    setLoading(true);
    try {
      if (roleToLoad === 'business') {
        const res = await tahatorApi.getMyBusinessAnalytics();
        setBizAnalytics(res);
        if (res.business) {
          setBizForm({
            storeName: String(res.business.storeName || ''),
            cityName: String(res.business.cityName || 'تهران'),
            specialty: String(res.business.specialty || 'املاک و خودرو'),
            bio: String(res.business.bio || ''),
          });
        }
      } else if (roleToLoad === 'business_agent') {
        const res = await tahatorApi.getBusinessAgentDesk();
        setAgentDesk({
          memberships: res.memberships || [],
          myListings: (res.myListings as unknown as Array<Record<string, unknown>>) || [],
          leadOffers: res.leadOffers || [],
        });
      } else if (roleToLoad === 'moderator') {
        const [l, r, cats, posts] = await Promise.all([
          tahatorApi.getModerationListings().catch(() => []),
          tahatorApi.getAdReports().catch(() => []),
          tahatorApi.getBlogCategories().catch(() => []),
          tahatorApi.getAdminBlogPosts().catch(() => []),
        ]);
        setModListings(l as unknown as Array<Record<string, unknown>>);
        setModReports(r);
        setBlogCategories(cats);
        setAdminPosts(posts);
        if (cats.length > 0) {
          setBlogForm((prev) => ({
            ...prev,
            categoryId: prev.categoryId || String(cats[0].id || ''),
          }));
        }
      } else if (roleToLoad === 'appraiser') {
        const q = await tahatorApi.listAppraisalQueue();
        setAppraisalQueue(q);
      } else if (roleToLoad === 'credit_officer') {
        const q = await tahatorApi.listInstallmentQueue();
        setInstallmentQueue(q);
      } else if (roleToLoad === 'support') {
        const q = await tahatorApi.getSupportQueue();
        setSupportQueue(q);
      } else if (roleToLoad === 'arbitrator') {
        const q = await tahatorApi.getArbitrationQueue();
        setArbitrationQueue(q);
      } else if (roleToLoad === 'admin') {
        const [ov, users, listingsRes, roles, perms, settings, logs, cats, posts] =
          await Promise.all([
            tahatorApi.getAdminOverview(),
            tahatorApi.getAdminUsers(),
            tahatorApi.getAdminListings(),
            tahatorApi.listRbacRoles(),
            tahatorApi.listRbacPermissions(),
            tahatorApi.getAdminSettings(),
            tahatorApi.getAuditLogs(50),
            tahatorApi.getBlogCategories(),
            tahatorApi.getAdminBlogPosts(),
          ]);
        setAdminOverview(ov);
        setAdminUsers(users);
        setAdminListings(listingsRes);
        setRbacRoles(roles);
        setRbacPerms(perms);
        setAuditLogs(logs);
        setBlogCategories(cats);
        setAdminPosts(posts);
        if (cats.length > 0) {
          setBlogForm((prev) => ({
            ...prev,
            categoryId: prev.categoryId || String(cats[0].id || ''),
          }));
        }
        if (settings?.tariffs) {
          setTariffDraft({
            ladderFee: Number(settings.tariffs.ladderFee ?? tariffs.ladderFee),
            urgentFee: Number(settings.tariffs.urgentFee ?? tariffs.urgentFee),
            aiExpertiseFee: Number(settings.tariffs.aiExpertiseFee ?? tariffs.aiExpertiseFee),
            installmentBaseRate: Number(
              settings.tariffs.installmentBaseRate ?? tariffs.installmentBaseRate
            ),
          });
        }
      }
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'خطا در دریافت اطلاعات میز کار از سرور');
    } finally {
      setLoading(false);
    }
  }, [tariffs]);

  useEffect(() => {
    void loadRoleData(currentRole);
  }, [currentRole, loadRoleData]);

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = blogForm.tagsText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      await tahatorApi.createBlogPost({
        title: blogForm.title,
        slug: blogForm.slug || undefined,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        categoryId: blogForm.categoryId,
        coverImage: blogForm.coverImage || '/blog/barter-chain.svg',
        tags,
        readMinutes: Number(blogForm.readMinutes) || 5,
        status: blogForm.status,
        isFeatured: blogForm.isFeatured,
      });
      notify('ok', 'مقاله با موفقیت در پایگاه‌داده منتشر/ذخیره شد.');
      setBlogForm((prev) => ({ ...prev, title: '', slug: '', excerpt: '', content: '' }));
      const refreshed = await tahatorApi.getAdminBlogPosts();
      setAdminPosts(refreshed);
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'خطا در ثبت مقاله');
    }
  };

  const renderBlogCms = () => (
    <div className="space-y-5">
      <form
        onSubmit={handleSaveBlogPost}
        className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-[14px] font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>انتشار مقاله جدید در مجله تهاتر آپ</span>
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={blogForm.title}
            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
            placeholder="عنوان مقاله (مثلاً: راهنمای تهاتر آپارتمان با خودروی صفر)..."
            className="kt-input text-[13px]"
          />
          <input
            type="text"
            value={blogForm.slug}
            onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
            placeholder="نامک URL (اختیاری، انگلیسی یا فارسی)..."
            className="kt-input text-[13px] dir-ltr text-left"
          />
          <select
            value={blogForm.categoryId}
            onChange={(e) => setBlogForm({ ...blogForm, categoryId: e.target.value })}
            className="kt-input text-[13px]"
          >
            {blogCategories.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {String(c.name)}
              </option>
            ))}
          </select>
          <select
            value={blogForm.coverImage}
            onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
            className="kt-input text-[13px]"
          >
            <option value="/blog/barter-chain.svg">کاور گرافیکی زنجیره تهاتر</option>
            <option value="/blog/installment-5050.svg">کاور تسهیلات ۵۰/۵۰</option>
            <option value="/blog/ai-valuation.svg">کاور ارزش‌گذاری هوش مصنوعی</option>
            <option value="/blog/legal-security.svg">کاور امنیت حقوقی قرارداد</option>
            <option value="/blog/vehicle-inspection.svg">کاور کارشناسی خودرو</option>
            <option value="/blog/chat-security.svg">کاور سپر ایمنی چت</option>
          </select>
        </div>
        <textarea
          rows={2}
          required
          value={blogForm.excerpt}
          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
          placeholder="خلاصه جذاب و سئوپسند مقاله (حداقل ۱۵ کاراکتر)..."
          className="w-full p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] text-[13px]"
        />
        <textarea
          rows={5}
          required
          value={blogForm.content}
          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
          placeholder="متن کامل مقاله (پشتیبانی از پاراگراف و تیترهای ###)..."
          className="w-full p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] text-[13px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={blogForm.tagsText}
              onChange={(e) => setBlogForm({ ...blogForm, tagsText: e.target.value })}
              placeholder="برچسب‌ها با ویرگول..."
              className="kt-input !h-[34px] text-[12px] w-48"
            />
            <select
              value={blogForm.status}
              onChange={(e) =>
                setBlogForm({
                  ...blogForm,
                  status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
                })
              }
              className="kt-input !h-[34px] text-[12px] w-36"
            >
              <option value="PUBLISHED">انتشار عمومی</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="ARCHIVED">بایگانی</option>
            </select>
            <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={blogForm.isFeatured}
                onChange={(e) => setBlogForm({ ...blogForm, isFeatured: e.target.checked })}
                className="accent-[var(--brand-primary)]"
              />
              <span>مقاله ویژه بالای صفحه</span>
            </label>
          </div>
          <button type="submit" className="kt-button--primary !h-[36px] !px-5 text-[12px]">
            انتشار در وبلاگ
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h4 className="text-[14px] font-bold">مقالات ثبت‌شده ({toPersianDigits(adminPosts.length)})</h4>
        {adminPosts.map((post) => (
          <div
            key={String(post.id)}
            className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-neutral-weaker)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold truncate">{String(post.title)}</span>
                <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[10px] font-bold">
                  {String(post.status)}
                </span>
              </div>
              <div className="text-[11px] text-[var(--content-neutral-default)] mt-1">
                دسته: {String((post.category as { name?: string })?.name || 'عمومی')} • اسلاگ: /blog/
                {String(post.slug)} • بازدید: {toPersianDigits(Number(post.viewsCount || 0))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await tahatorApi.updateBlogPost(String(post.id), {
                    status: post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                  });
                  const refreshed = await tahatorApi.getAdminBlogPosts();
                  setAdminPosts(refreshed);
                  notify('ok', 'وضعیت انتشار مقاله تغییر کرد.');
                }}
                className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
              >
                {post.status === 'PUBLISHED' ? 'تبدیل به پیش‌نویس' : 'انتشار فوری'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await tahatorApi.deleteBlogPost(String(post.id));
                  setAdminPosts((prev) => prev.filter((p) => p.id !== post.id));
                  notify('ok', 'مقاله حذف شد.');
                }}
                className="px-2.5 h-[30px] rounded-[6px] border border-[var(--semantic-negative)] text-[var(--semantic-negative)] text-[11px] font-bold"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1160px] bg-[var(--surface-neutral-weaker)] rounded-[10px] shadow-2xl overflow-hidden flex flex-col max-h-[93vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Center Bar */}
        <div className="px-5 py-3.5 bg-[var(--surface-neutral-subtle)] border-b border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[8px] bg-[var(--brand-soft)] text-[var(--brand-primary)] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--content-neutral-stronger)]">
                مرکز کنترل ۹ نقشی تهاتر آپ — {meta.title}
              </h2>
              <p className="text-[11px] text-[var(--content-neutral-default)]">{meta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadRoleData(currentRole)}
              className="kt-button--outlined !h-[32px] !px-2.5 text-[11px]"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>بروزرسانی</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUserDashboard();
              }}
              className="kt-button--outlined !h-[32px] !px-3 text-[11px]"
            >
              تهاتر من
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--surface-neutral-weak)] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authorized Role Switcher Strip */}
        <div className="px-5 py-2.5 border-b border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-weaker)] flex items-center gap-1.5 overflow-x-auto">
          {visibleRoles.map((r) => {
            const Icon = ROLE_ICON[r] || User;
            const active = currentRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSwitchRole(r)}
                className={`px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[var(--brand-action)] text-white font-bold shadow-sm'
                    : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)] hover:bg-[var(--brand-soft)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ROLE_META[r].shortTitle}</span>
              </button>
            );
          })}
        </div>

        {statusBanner && (
          <div
            className={`mx-5 mt-3 px-4 py-2.5 rounded-[6px] text-[12px] font-bold flex items-center gap-2 ${
              statusBanner.type === 'ok'
                ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                : 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
            }`}
          >
            {statusBanner.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* Workspace Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. USER */}
          {currentRole === 'user' && (
            <div className="p-5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-3">
              <h3 className="text-[15px] font-bold">داشبورد کاربری و خرید/فروش تهاتری</h3>
              <p className="text-[13px] text-[var(--content-neutral-default)] leading-7">
                مدیریت آگهی‌ها، سبد دارایی‌ها، پیشنهادهای معاوضه و کیف‌پول در پنجره «تهاتر من» در دسترس است.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUserDashboard();
                }}
                className="kt-button--primary"
              >
                ورود به داشبورد «تهاتر من»
              </button>
            </div>
          )}

          {/* 2. BUSINESS */}
          {currentRole === 'business' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'آگهی‌های فعال فروشگاه', val: bizAnalytics?.activeListingsCount ?? 0 },
                  { label: 'کل بازدید آگهی‌ها', val: bizAnalytics?.totalViews ?? 0 },
                  { label: 'نمایش اطلاعات تماس', val: bizAnalytics?.totalContactClicks ?? 0 },
                  { label: 'کلیک شروع گفتگو', val: bizAnalytics?.totalChatClicks ?? 0 },
                  { label: 'پیشنهادهای منتظر پاسخ', val: bizAnalytics?.pendingOffersCount ?? 0 },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]"
                  >
                    <div className="text-[11px] text-[var(--content-neutral-default)]">{k.label}</div>
                    <div className="text-[18px] font-extrabold text-[var(--brand-primary)] mt-1">
                      {toPersianDigits(k.val)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await tahatorApi.upsertMyBusiness(bizForm);
                      notify('ok', 'اطلاعات فروشگاه کسب‌وکار ذخیره شد.');
                      void loadRoleData('business');
                    } catch (err) {
                      notify('err', err instanceof Error ? err.message : 'خطا در ذخیره فروشگاه');
                    }
                  }}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3"
                >
                  <h4 className="text-[14px] font-bold">پروفایل فروشگاه / نمایشگاه / آژانس</h4>
                  <input
                    type="text"
                    required
                    value={bizForm.storeName}
                    onChange={(e) => setBizForm({ ...bizForm, storeName: e.target.value })}
                    placeholder="نام نمایشگاه یا آژانس..."
                    className="kt-input text-[13px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={bizForm.cityName}
                      onChange={(e) => setBizForm({ ...bizForm, cityName: e.target.value })}
                      placeholder="شهر..."
                      className="kt-input text-[13px]"
                    />
                    <input
                      type="text"
                      value={bizForm.specialty}
                      onChange={(e) => setBizForm({ ...bizForm, specialty: e.target.value })}
                      placeholder="تخصص..."
                      className="kt-input text-[13px]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={bizForm.bio}
                    onChange={(e) => setBizForm({ ...bizForm, bio: e.target.value })}
                    placeholder="معرفی فعالیت فروشگاه..."
                    className="w-full p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] text-[13px]"
                  />
                  <button type="submit" className="kt-button--primary !h-[36px] !px-5 text-[12px]">
                    ذخیره تنظیمات فروشگاه
                  </button>
                </form>

                <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                  <h4 className="text-[14px] font-bold">مدیریت مشاوران فروش زیرمجموعه</h4>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="tel"
                      value={advisorPhone}
                      onChange={(e) => setAdvisorPhone(e.target.value)}
                      placeholder="موبایل مشاور (09...)"
                      className="kt-input !h-[36px] text-[12px] flex-1 dir-ltr text-left"
                    />
                    <input
                      type="text"
                      value={advisorLabel}
                      onChange={(e) => setAdvisorLabel(e.target.value)}
                      placeholder="سمت (مثلاً مشاور ارشد)"
                      className="kt-input !h-[36px] text-[12px] w-36"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await tahatorApi.addBusinessAdvisor({
                            phone: advisorPhone,
                            titleLabel: advisorLabel,
                          });
                          setAdvisorPhone('');
                          notify('ok', 'مشاور به تیم فروشگاه اضافه شد و نقش مشاور فروش گرفت.');
                          void loadRoleData('business');
                        } catch (err) {
                          notify('err', err instanceof Error ? err.message : 'خطا در افزودن مشاور');
                        }
                      }}
                      className="kt-button--primary !h-[36px] !px-4 text-[12px]"
                    >
                      افزودن مشاور
                    </button>
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {((bizAnalytics?.business?.members as Array<Record<string, unknown>>) || []).map(
                      (m) => {
                        const u = (m.user as { fullName?: string; phone?: string }) || {};
                        return (
                          <div
                            key={String(m.id)}
                            className="p-2.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] flex items-center justify-between text-[12px]"
                          >
                            <div>
                              <span className="font-bold">{u.fullName || u.phone}</span>{' '}
                              <span className="text-[var(--content-neutral-default)]">
                                ({String(m.titleLabel || m.memberRole)})
                              </span>
                            </div>
                            {m.memberRole !== 'OWNER' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await tahatorApi.removeBusinessAdvisor(String(m.id));
                                  void loadRoleData('business');
                                }}
                                className="text-[var(--semantic-negative)] font-bold"
                              >
                                حذف
                              </button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. BUSINESS AGENT */}
          {currentRole === 'business_agent' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                  <div className="text-[11px] text-[var(--content-neutral-default)]">عضویت در آژانس / نمایشگاه</div>
                  <div className="text-[18px] font-extrabold mt-1">
                    {toPersianDigits(agentDesk?.memberships.length ?? 0)} مورد
                  </div>
                </div>
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                  <div className="text-[11px] text-[var(--content-neutral-default)]">فایل‌های سپرده‌شده من</div>
                  <div className="text-[18px] font-extrabold mt-1">
                    {toPersianDigits(agentDesk?.myListings.length ?? 0)} آگهی
                  </div>
                </div>
                <div className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]">
                  <div className="text-[11px] text-[var(--content-neutral-default)]">سرنخ‌ها و پیشنهادهای مشتریان</div>
                  <div className="text-[18px] font-extrabold mt-1 text-[var(--brand-primary)]">
                    {toPersianDigits(agentDesk?.leadOffers.length ?? 0)} پیشنهاد
                  </div>
                </div>
              </div>

              {agentDesk?.leadOffers.length === 0 ? (
                <div className="p-6 text-center rounded-[8px] border border-dashed border-[var(--border-neutral-weak)] text-[13px] text-[var(--content-neutral-default)]">
                  در حال حاضر پیشنهاد معاوضه جدیدی در کارتابل مشاور ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {agentDesk?.leadOffers.map((offer) => (
                    <div
                      key={String(offer.id)}
                      className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-[13px] font-bold">
                          پیشنهاد: {String(offer.offeredItemTitle)}
                        </div>
                        <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                          برای آگهی: {String((offer.listing as { title?: string })?.title || '')} • وضعیت:{' '}
                          {String(offer.status)}
                        </div>
                      </div>
                      {offer.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.respondBarterOffer(String(offer.id), 'ACCEPTED');
                              notify('ok', 'پیشنهاد مشتری تایید و تفاهم‌نامه فعال شد.');
                              void loadRoleData('business_agent');
                            }}
                            className="kt-button--primary !h-[30px] !px-3 text-[11px]"
                          >
                            پذیرش سرنخ
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.respondBarterOffer(String(offer.id), 'REJECTED');
                              void loadRoleData('business_agent');
                            }}
                            className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
                          >
                            رد
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. MODERATOR (+ Blog CMS) */}
          {currentRole === 'moderator' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 border-b border-[var(--border-neutral-weaker)] pb-3">
                {[
                  { id: 'queue' as const, label: `ممیزی آگهی‌ها (${toPersianDigits(modListings.length)})` },
                  { id: 'reports' as const, label: `گزارش‌های تخلف (${toPersianDigits(modReports.length)})` },
                  { id: 'blog' as const, label: `مدیریت وبلاگ (${toPersianDigits(adminPosts.length)})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModSubTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold ${
                      modSubTab === t.id
                        ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                        : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-default)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {modSubTab === 'queue' && (
                <div className="space-y-2.5">
                  {modListings.slice(0, 25).map((item) => {
                    const id = String(item.id);
                    return (
                      <div
                        key={id}
                        className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold">{String(item.title)}</span>
                            <span className="px-2 py-0.5 rounded bg-[var(--surface-neutral-weak)] text-[10px] font-bold">
                              {String(item.moderationStatus || 'PUBLISHED')}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--content-neutral-default)]">
                            کد: {String(item.code)} • قیمت: {formatToman(Number(item.price || 0))} • امتیاز هوش مصنوعی:{' '}
                            {toPersianDigits(Number(item.aiAuditScore || 80))}٪
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={modNoteInput[id] || ''}
                            onChange={(e) => setModNoteInput({ ...modNoteInput, [id]: e.target.value })}
                            placeholder="یادداشت ممیزی..."
                            className="kt-input !h-[30px] text-[11px] w-40"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.moderateListing(id, {
                                status: 'PUBLISHED',
                                moderationNote: modNoteInput[id] || 'تایید ناظر سامانه',
                                isVerifiedPhotos: true,
                              });
                              notify('ok', 'آگهی تایید و منتشر شد.');
                              onRefreshCatalog?.();
                              void loadRoleData('moderator');
                            }}
                            className="kt-button--primary !h-[30px] !px-3 text-[11px]"
                          >
                            تایید انتشار + نشان اصالت
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.moderateListing(id, {
                                status: 'REJECTED',
                                moderationNote: modNoteInput[id] || 'عدم انطباق با قوانین انتشار',
                              });
                              notify('ok', 'آگهی رد شد.');
                              onRefreshCatalog?.();
                              void loadRoleData('moderator');
                            }}
                            className="kt-button--outlined !h-[30px] !px-3 text-[11px] text-[var(--semantic-negative)]"
                          >
                            رد آگهی
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {modSubTab === 'reports' && (
                <div className="space-y-2.5">
                  {modReports.map((rep) => (
                    <div
                      key={String(rep.id)}
                      className="p-3.5 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-[13px] font-bold">
                          گزارش: {String(rep.reason)} ({String(rep.status)})
                        </div>
                        <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                          آگهی: {String((rep.listing as { title?: string })?.title || '')} —{' '}
                          {String(rep.details || '')}
                        </div>
                      </div>
                      {rep.status === 'OPEN' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.resolveAdReport(String(rep.id), {
                                status: 'RESOLVED',
                                resolutionNote: 'بررسی و اقدام شد',
                              });
                              void loadRoleData('moderator');
                            }}
                            className="kt-button--primary !h-[30px] !px-3 text-[11px]"
                          >
                            تایید و رسیدگی
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.resolveAdReport(String(rep.id), { status: 'DISMISSED' });
                              void loadRoleData('moderator');
                            }}
                            className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
                          >
                            رد گزارش
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {modSubTab === 'blog' && renderBlogCms()}
            </div>
          )}

          {/* 5. APPRAISER */}
          {currentRole === 'appraiser' && (
            <div className="space-y-3">
              <div className="text-[14px] font-bold">
                صف پرونده‌های کارشناسی دارایی و ملک/خودرو ({toPersianDigits(appraisalQueue.length)})
              </div>
              {appraisalQueue.length === 0 ? (
                <div className="p-6 text-center rounded-[8px] border border-dashed border-[var(--border-neutral-weak)] text-[13px]">
                  درخواست کارشناسی فعالی در صف نیست.
                </div>
              ) : (
                appraisalQueue.map((task) => {
                  const id = String(task.id);
                  const draft = appraisalValues[id] || {
                    value: String(task.estimatedMarketValue || '1500000000'),
                    summary: String(task.reportSummary || ''),
                  };
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[13px] font-bold">
                          پرونده:{' '}
                          {String(
                            (task.listing as { title?: string })?.title ||
                              (task.barterAsset as { title?: string })?.title ||
                              id
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          {String(task.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.status === 'REQUESTED' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await tahatorApi.claimAppraisal(id);
                              notify('ok', 'پرونده کارشناسی به نام شما رزرو شد.');
                              void loadRoleData('appraiser');
                            }}
                            className="kt-button--outlined !h-[32px] !px-3 text-[11px]"
                          >
                            قبول و رزرو پرونده
                          </button>
                        )}
                        <input
                          type="number"
                          value={draft.value}
                          onChange={(e) =>
                            setAppraisalValues({
                              ...appraisalValues,
                              [id]: { ...draft, value: e.target.value },
                            })
                          }
                          placeholder="ارزش منصفانه (تومان)"
                          className="kt-input !h-[32px] text-[12px] w-44 dir-ltr text-left"
                        />
                        <input
                          type="text"
                          value={draft.summary}
                          onChange={(e) =>
                            setAppraisalValues({
                              ...appraisalValues,
                              [id]: { ...draft, summary: e.target.value },
                            })
                          }
                          placeholder="خلاصه گزارش سلامت فنی و سند..."
                          className="kt-input !h-[32px] text-[12px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await tahatorApi.submitAppraisalReport(id, {
                              estimatedMarketValue: Number(draft.value) || 500_000_000,
                              reportSummary:
                                draft.summary || 'کارشناسی میدانی تایید و ارزش‌گذاری منصفانه ثبت گردید.',
                            });
                            notify('ok', 'گزارش کارشناسی نهایی ثبت شد.');
                            void loadRoleData('appraiser');
                          }}
                          className="kt-button--primary !h-[32px] !px-4 text-[11px]"
                        >
                          ثبت گزارش نهایی
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 6. CREDIT OFFICER */}
          {currentRole === 'credit_officer' && (
            <div className="space-y-3">
              <div className="text-[14px] font-bold">
                صف پرونده‌های تسهیلات ۵۰/۵۰ تهاتری ({toPersianDigits(installmentQueue.length)})
              </div>
              {installmentQueue.length === 0 ? (
                <div className="p-6 text-center rounded-[8px] border border-dashed border-[var(--border-neutral-weak)] text-[13px]">
                  درخواست اقساط جدیدی وجود ندارد.
                </div>
              ) : (
                installmentQueue.map((req) => {
                  const id = String(req.id);
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-bold">
                            متقاضی: {String((req.user as { fullName?: string })?.fullName || 'کاربر')} — آگهی:{' '}
                            {String((req.listing as { title?: string })?.title || '')}
                          </div>
                          <div className="text-[11px] text-[var(--content-neutral-default)] mt-0.5">
                            کل معامله: {formatToman(Number(req.totalAmount || 0))} • پوشش تهاتر:{' '}
                            {formatToman(Number(req.barterCoveredAmount || 0))} • قسط ماهانه:{' '}
                            {formatToman(Number(req.monthlyInstallment || 0))} ({toPersianDigits(Number(req.months || 12))}{' '}
                            ماه)
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          {String(req.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          value={creditScores[id] || String(req.creditScore || 720)}
                          onChange={(e) => setCreditScores({ ...creditScores, [id]: e.target.value })}
                          placeholder="امتیاز اعتباری"
                          className="kt-input !h-[32px] text-[12px] w-28 dir-ltr text-left"
                        />
                        <input
                          type="text"
                          value={creditReviewNote[id] || ''}
                          onChange={(e) =>
                            setCreditReviewNote({ ...creditReviewNote, [id]: e.target.value })
                          }
                          placeholder="یادداشت افسر اعتبار..."
                          className="kt-input !h-[32px] text-[12px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await tahatorApi.reviewInstallment(id, {
                              status: 'APPROVED',
                              creditScore: Number(creditScores[id]) || 720,
                              reviewNote:
                                creditReviewNote[id] || 'اعتبارسنجی تایید و دفترچه اقساط صادر گردید.',
                            });
                            notify('ok', 'پرونده اقساط تایید و دفترچه اقساط فعال شد.');
                            void loadRoleData('credit_officer');
                          }}
                          className="kt-button--primary !h-[32px] !px-4 text-[11px]"
                        >
                          تایید و صدور اقساط
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await tahatorApi.reviewInstallment(id, {
                              status: 'REJECTED',
                              reviewNote: creditReviewNote[id] || 'کسری مدارک ضمانت',
                            });
                            notify('ok', 'پرونده رد شد.');
                            void loadRoleData('credit_officer');
                          }}
                          className="kt-button--outlined !h-[32px] !px-3 text-[11px] text-[var(--semantic-negative)]"
                        >
                          رد درخواست
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 7. SUPPORT */}
          {currentRole === 'support' && (
            <div className="space-y-3">
              <div className="text-[14px] font-bold">
                صندوق تیکت‌ها و پشتیبانی کاربران ({toPersianDigits(supportQueue.length)})
              </div>
              {supportQueue.length === 0 ? (
                <div className="p-6 text-center rounded-[8px] border border-dashed border-[var(--border-neutral-weak)] text-[13px]">
                  هیچ تیکتی در صف پشتیبانی نیست.
                </div>
              ) : (
                supportQueue.map((ticket) => {
                  const id = String(ticket.id);
                  const msgs = (ticket.messages as Array<{ body: string; senderType: string }>) || [];
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[13px] font-bold">
                          {String(ticket.subject)} —{' '}
                          <span className="font-normal text-[var(--content-neutral-default)]">
                            {String((ticket.user as { fullName?: string; phone?: string })?.fullName || '')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          {String(ticket.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-[12px] bg-[var(--surface-neutral-subtle)] p-2.5 rounded-[6px]">
                        {msgs.slice(-3).map((m, i) => (
                          <div key={i}>
                            <span className="font-bold">
                              {m.senderType === 'support' ? 'پشتیبان: ' : 'کاربر: '}
                            </span>
                            <span>{m.body}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={ticketReplies[id] || ''}
                          onChange={(e) => setTicketReplies({ ...ticketReplies, [id]: e.target.value })}
                          placeholder="پاسخ کارشناس پشتیبانی..."
                          className="kt-input !h-[34px] text-[12px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!ticketReplies[id]?.trim()) return;
                            await tahatorApi.replySupportTicket(id, {
                              body: ticketReplies[id].trim(),
                              status: 'WAITING_USER',
                            });
                            setTicketReplies({ ...ticketReplies, [id]: '' });
                            notify('ok', 'پاسخ پشتیبانی ارسال شد.');
                            void loadRoleData('support');
                          }}
                          className="kt-button--primary !h-[34px] !px-4 text-[11px] flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ارسال پاسخ</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 8. ARBITRATOR */}
          {currentRole === 'arbitrator' && (
            <div className="space-y-3">
              <div className="text-[14px] font-bold">
                پرونده‌های داوری حقوقی تفاهم‌نامه‌های تهاتر ({toPersianDigits(arbitrationQueue.length)})
              </div>
              {arbitrationQueue.length === 0 ? (
                <div className="p-6 text-center rounded-[8px] border border-dashed border-[var(--border-neutral-weak)] text-[13px]">
                  در حال حاضر تفاهم‌نامه‌ای برای داوری حقوقی ثبت نشده است.
                </div>
              ) : (
                arbitrationQueue.map((ag) => {
                  const id = String(ag.id);
                  const draft = arbForm[id] || {
                    milestoneStage: (ag.milestoneStage as
                      | 'NEGOTIATION'
                      | 'ASSET_INSPECTION'
                      | 'ESCROW_PAYMENT'
                      | 'FINAL_HANDOVER') || 'ASSET_INSPECTION',
                    arbitrationNotes: String(ag.arbitrationNotes || ''),
                    markCompleted: Boolean(ag.completedAt),
                  };
                  return (
                    <div
                      key={id}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[13px] font-bold">
                          قرارداد تهاتر شماره {String(ag.id).slice(0, 8)} — آگهی:{' '}
                          {String(
                            ((ag.offer as { listing?: { title?: string } })?.listing?.title) || ''
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[11px] font-bold">
                          مرحله: {String(ag.milestoneStage)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={draft.milestoneStage}
                          onChange={(e) =>
                            setArbForm({
                              ...arbForm,
                              [id]: {
                                ...draft,
                                milestoneStage: e.target.value as typeof draft.milestoneStage,
                              },
                            })
                          }
                          className="kt-input !h-[34px] text-[12px] w-48"
                        >
                          <option value="NEGOTIATION">مذاکره اولیه</option>
                          <option value="ASSET_INSPECTION">کارشناسی دارایی‌ها</option>
                          <option value="ESCROW_PAYMENT">تسویه و ضمانت</option>
                          <option value="FINAL_HANDOVER">تحویل نهایی و اسناد</option>
                        </select>
                        <input
                          type="text"
                          value={draft.arbitrationNotes}
                          onChange={(e) =>
                            setArbForm({
                              ...arbForm,
                              [id]: { ...draft, arbitrationNotes: e.target.value },
                            })
                          }
                          placeholder="رای و دستور داور حقوقی..."
                          className="kt-input !h-[34px] text-[12px] flex-1"
                        />
                        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draft.markCompleted}
                            onChange={(e) =>
                              setArbForm({
                                ...arbForm,
                                [id]: { ...draft, markCompleted: e.target.checked },
                              })
                            }
                          />
                          <span>مختومه‌سازی</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            await tahatorApi.arbitrateAgreement(id, {
                              milestoneStage: draft.milestoneStage,
                              arbitrationNotes:
                                draft.arbitrationNotes || 'بررسی حقوقی انجام و مرحله جدید تثبیت شد.',
                              markCompleted: draft.markCompleted,
                            });
                            notify('ok', 'رای داوری در تفاهم‌نامه ثبت شد.');
                            void loadRoleData('arbitrator');
                          }}
                          className="kt-button--primary !h-[34px] !px-4 text-[11px]"
                        >
                          ثبت رای داوری
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 9. SUPER ADMIN */}
          {currentRole === 'admin' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5 border-b border-[var(--border-neutral-weaker)] pb-3">
                {[
                  { id: 'overview' as const, label: 'نمای کل سامانه', icon: TrendingUp },
                  { id: 'users' as const, label: 'کاربران و انتصاب نقش', icon: Users },
                  { id: 'roles' as const, label: 'ساخت نقش و داشبورد پویا', icon: KeyRound },
                  { id: 'listings' as const, label: 'مدیریت کل آگهی‌ها', icon: FileCheck2 },
                  { id: 'settings' as const, label: 'تعرفه‌ها و هوش مصنوعی', icon: Sliders },
                  { id: 'blog' as const, label: 'مدیریت وبلاگ', icon: BookOpen },
                  { id: 'audit' as const, label: 'گزارش امنیتی (Audit Log)', icon: History },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAdminSubTab(tab.id)}
                      className={`px-3 py-1.5 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 ${
                        adminSubTab === tab.id
                          ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
                          : 'bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-default)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {adminSubTab === 'overview' && adminOverview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'کل کاربران ثبت‌شده', val: adminOverview.usersCount },
                    { label: 'کل آگهی‌های فعال', val: adminOverview.listingsCount },
                    { label: 'صف انتظار تایید آگهی', val: adminOverview.pendingListingsCount },
                    { label: 'گزارش‌های تخلف باز', val: adminOverview.openReportsCount },
                    { label: 'تیکت‌های باز پشتیبانی', val: adminOverview.openTicketsCount },
                    { label: 'درخواست اقساط باز', val: adminOverview.pendingInstallmentsCount },
                    { label: 'درخواست کارشناسی باز', val: adminOverview.pendingAppraisalsCount },
                    { label: 'مقالات وبلاگ', val: adminPosts.length },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)]"
                    >
                      <div className="text-[11px] text-[var(--content-neutral-default)]">{s.label}</div>
                      <div className="text-[22px] font-extrabold text-[var(--brand-primary)] mt-1">
                        {toPersianDigits(s.val)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubTab === 'users' && (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                  {adminUsers.map((u) => {
                    const uid = String(u.id);
                    const rolesList = ((u.roleAssignments as Array<{ role?: { code?: string; shortTitleFa?: string } }>) || [])
                      .map((ra) => ra.role?.code)
                      .filter(Boolean) as string[];
                    return (
                      <div
                        key={uid}
                        className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div>
                          <div className="text-[13px] font-bold">
                            {String(u.fullName || 'کاربر')} —{' '}
                            <span className="dir-ltr inline-block text-[12px] text-[var(--content-neutral-default)]">
                              {String(u.phone)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rolesList.map((rc) => (
                              <span
                                key={rc}
                                className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-primary)] text-[10px] font-bold"
                              >
                                {getRoleMeta(normalizeUserRole(rc)).shortTitle}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={async (e) => {
                              const roleCode = e.target.value;
                              if (!roleCode) return;
                              await tahatorApi.assignRbacRole({ targetUserId: uid, roleCode });
                              notify('ok', `نقش ${roleCode} به کاربر تخصیص داده شد.`);
                              void loadRoleData('admin');
                              e.target.value = '';
                            }}
                            className="kt-input !h-[30px] text-[11px] w-40"
                          >
                            <option value="">+ افزودن نقش...</option>
                            {rbacRoles.map((r) => (
                              <option key={String(r.code)} value={String(r.code)}>
                                {String(r.shortTitleFa || r.code)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              const nextStatus = u.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
                              await tahatorApi.updateUserStatus(uid, nextStatus);
                              notify('ok', 'وضعیت مسدودی حساب کاربر بروزرسانی شد.');
                              void loadRoleData('admin');
                            }}
                            className="kt-button--outlined !h-[30px] !px-2.5 text-[11px] flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>{u.status === 'BANNED' ? 'رفع مسدودی' : 'مسدودسازی'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {adminSubTab === 'roles' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await tahatorApi.createRbacRole(newRoleForm);
                      notify('ok', 'نقش و داشبورد جدید در ساختار RBAC ایجاد شد.');
                      setNewRoleForm({
                        code: '',
                        titleFa: '',
                        shortTitleFa: '',
                        descriptionFa: '',
                        dashboardKey: 'custom_desk',
                        permissionCodes: [],
                      });
                      void loadRoleData('admin');
                    } catch (err) {
                      notify('err', err instanceof Error ? err.message : 'خطا در ساخت نقش');
                    }
                  }}
                  className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3"
                >
                  <h4 className="text-[14px] font-bold">ساخت نقش جدید با مجوزهای پویا</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      value={newRoleForm.code}
                      onChange={(e) => setNewRoleForm({ ...newRoleForm, code: e.target.value })}
                      placeholder="کد انگلیسی (مثلاً senior_auditor)"
                      className="kt-input text-[12px] dir-ltr text-left"
                    />
                    <input
                      type="text"
                      required
                      value={newRoleForm.shortTitleFa}
                      onChange={(e) =>
                        setNewRoleForm({ ...newRoleForm, shortTitleFa: e.target.value })
                      }
                      placeholder="نام کوتاه فارسی"
                      className="kt-input text-[12px]"
                    />
                    <input
                      type="text"
                      required
                      value={newRoleForm.titleFa}
                      onChange={(e) => setNewRoleForm({ ...newRoleForm, titleFa: e.target.value })}
                      placeholder="عنوان کامل داشبورد"
                      className="kt-input text-[12px]"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={newRoleForm.descriptionFa}
                    onChange={(e) =>
                      setNewRoleForm({ ...newRoleForm, descriptionFa: e.target.value })
                    }
                    placeholder="شرح وظایف این نقش..."
                    className="kt-input text-[12px]"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rbacPerms.map((p) => {
                      const checked = newRoleForm.permissionCodes.includes(p.code);
                      return (
                        <label
                          key={p.code}
                          className="flex items-center gap-1.5 text-[11px] p-2 rounded border border-[var(--border-neutral-weaker)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setNewRoleForm((prev) => ({
                                ...prev,
                                permissionCodes: e.target.checked
                                  ? [...prev.permissionCodes, p.code]
                                  : prev.permissionCodes.filter((c) => c !== p.code),
                              }));
                            }}
                          />
                          <span>{p.titleFa}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button type="submit" className="kt-button--primary !h-[36px] !px-5 text-[12px]">
                    ایجاد نقش سازمانی جدید
                  </button>
                </form>
              )}

              {adminSubTab === 'listings' && (
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {adminListings.map((l) => (
                    <div
                      key={String(l.id)}
                      className="p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold truncate">{String(l.title)}</div>
                        <div className="text-[11px] text-[var(--content-neutral-default)]">
                          کد: {String(l.code)} • وضعیت: {String(l.moderationStatus)} • بازدید:{' '}
                          {toPersianDigits(Number(l.viewsCount || 0))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await tahatorApi.deleteAdminListing(String(l.id));
                          setAdminListings((prev) => prev.filter((item) => item.id !== l.id));
                          notify('ok', 'آگهی حذف شد.');
                          onRefreshCatalog?.();
                        }}
                        className="px-2.5 h-[30px] rounded-[6px] border border-[var(--semantic-negative)] text-[var(--semantic-negative)] text-[11px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف آگهی</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {adminSubTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                    <h4 className="text-[14px] font-bold">تعرفه‌های پلتفرم (تومان / درصد)</h4>
                    <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                      <label>
                        هزینه نردبان:
                        <input
                          type="number"
                          value={tariffDraft.ladderFee}
                          onChange={(e) =>
                            setTariffDraft({ ...tariffDraft, ladderFee: Number(e.target.value) })
                          }
                          className="kt-input mt-1 dir-ltr text-left"
                        />
                      </label>
                      <label>
                        هزینه نشان فوری:
                        <input
                          type="number"
                          value={tariffDraft.urgentFee}
                          onChange={(e) =>
                            setTariffDraft({ ...tariffDraft, urgentFee: Number(e.target.value) })
                          }
                          className="kt-input mt-1 dir-ltr text-left"
                        />
                      </label>
                      <label>
                        تعرفه کارشناسی:
                        <input
                          type="number"
                          value={tariffDraft.aiExpertiseFee}
                          onChange={(e) =>
                            setTariffDraft({
                              ...tariffDraft,
                              aiExpertiseFee: Number(e.target.value),
                            })
                          }
                          className="kt-input mt-1 dir-ltr text-left"
                        />
                      </label>
                      <label>
                        نرخ سالانه اقساط (٪):
                        <input
                          type="number"
                          value={tariffDraft.installmentBaseRate}
                          onChange={(e) =>
                            setTariffDraft({
                              ...tariffDraft,
                              installmentBaseRate: Number(e.target.value),
                            })
                          }
                          className="kt-input mt-1 dir-ltr text-left"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await tahatorApi.updateTariffs(tariffDraft);
                        onUpdateTariffs(tariffDraft);
                        notify('ok', 'تعرفه‌های سامانه بروزرسانی شد.');
                      }}
                      className="kt-button--primary !h-[36px] !px-5 text-[12px]"
                    >
                      ذخیره تعرفه‌ها
                    </button>
                  </div>

                  <div className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] space-y-3">
                    <h4 className="text-[14px] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
                      <span>ماژول‌های هوش مصنوعی و سپر امنیت</span>
                    </h4>
                    {[
                      { key: 'enabled' as const, label: 'فعال‌سازی کل موتور هوش مصنوعی تهاتر' },
                      { key: 'priceEstimator' as const, label: 'ممیزی خودکار قیمت آگهی‌ها' },
                      { key: 'chatSafetyShield' as const, label: 'سپر ضد فیشینگ و کلاهبرداری چت' },
                      { key: 'barterMatcher' as const, label: 'تطبیق هوشمند و زنجیره سه‌طرفه' },
                    ].map((row) => (
                      <label key={row.key} className="flex items-center justify-between text-[12px] cursor-pointer">
                        <span>{row.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(aiDraft[row.key])}
                          onChange={(e) =>
                            setAiDraft({ ...aiDraft, [row.key]: e.target.checked })
                          }
                          className="accent-[var(--brand-primary)]"
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={async () => {
                        await tahatorApi.updateAiConfig({
                          enabled: aiDraft.enabled,
                          autoPriceAudit: aiDraft.priceEstimator,
                          chatSafetyShield: aiDraft.chatSafetyShield,
                          threeWayBarterMatching: aiDraft.barterMatcher,
                        });
                        onUpdateAiConfig(aiDraft);
                        notify('ok', 'تنظیمات هوش مصنوعی ذخیره شد.');
                      }}
                      className="kt-button--primary !h-[36px] !px-5 text-[12px]"
                    >
                      ذخیره تنظیمات AI
                    </button>
                  </div>
                </div>
              )}

              {adminSubTab === 'blog' && renderBlogCms()}

              {adminSubTab === 'audit' && (
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={String(log.id)}
                      className="p-2.5 rounded-[6px] border border-[var(--border-neutral-weaker)] text-[11px] flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-[var(--brand-primary)]">{String(log.action)}</span>{' '}
                        • موجودیت: {String(log.targetEntity)} • عامل:{' '}
                        {String((log.actor as { fullName?: string; phone?: string })?.fullName || 'سیستم')}
                      </div>
                      <span className="text-[var(--content-neutral-default)] dir-ltr">
                        {new Date(String(log.createdAt)).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
