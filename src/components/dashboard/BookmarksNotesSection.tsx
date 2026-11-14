'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Search, Sparkles, StickyNote, Trash2 } from 'lucide-react';
import { Listing, formatToman, toPersianDigits } from '@/data/mockData';
import { SavedSearch } from '@/types/platform';

interface BookmarksNotesSectionProps {
  initialSubTab?: 'adsAndNotes' | 'searches';
  bookmarkedAds: Listing[];
  allListings: Listing[];
  notes: Record<string, string>;
  savedSearches: SavedSearch[];
  onSelectListing: (listing: Listing) => void;
  onOpenCompareWith: (listing: Listing) => void;
  onToggleBookmark: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
  onToggleSavedSearchNotify: (id: string) => void;
  onApplySavedSearch: (search: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  onClose: () => void;
}

export default function BookmarksNotesSection({
  initialSubTab = 'adsAndNotes',
  bookmarkedAds,
  allListings,
  notes,
  savedSearches,
  onSelectListing,
  onOpenCompareWith,
  onToggleBookmark,
  onSaveNote,
  onToggleSavedSearchNotify,
  onApplySavedSearch,
  onDeleteSavedSearch,
  onClose,
}: BookmarksNotesSectionProps) {
  const [subTab, setSubTab] = useState<'adsAndNotes' | 'searches'>(initialSubTab);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Combine bookmarked ads + any other ad that has a saved personal note
  const bookmarkedIds = new Set(bookmarkedAds.map((a) => a.id));
  const extraNotedAds = Object.entries(notes)
    .filter(([id, text]) => !bookmarkedIds.has(id) && text.trim().length > 0)
    .map(([id]) => allListings.find((l) => l.id === id))
    .filter((ad): ad is Listing => Boolean(ad));

  const combinedItems = [...bookmarkedAds, ...extraNotedAds];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-[var(--content-neutral-stronger)]">
          نشان‌ها و یادداشت‌ها
        </h2>
        <p className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
          آگهی‌های ذخیره‌شده، یادداشت‌های خصوصی شما روی آگهی‌ها و جستجوهای هوشمند تهاتر
        </p>
      </div>

      {/* Underlined 2-Tab Header: آگهی‌ها و یادداشت‌ها | جستجوها */}
      <div className="flex items-center gap-6 border-b border-[var(--border-neutral-weaker)]">
        {[
          { id: 'adsAndNotes' as const, label: 'آگهی‌ها و یادداشت‌ها', count: combinedItems.length },
          { id: 'searches' as const, label: 'جستجوها', count: savedSearches.length },
        ].map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`pb-3 text-[14px] transition-colors relative flex items-center gap-1.5 ${
                active
                  ? 'text-[var(--brand-primary)] font-bold'
                  : 'text-[var(--content-neutral-default)] hover:text-[var(--content-neutral-stronger)]'
              }`}
            >
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--surface-neutral-weak)] text-[var(--content-neutral-stronger)]">
                  {toPersianDigits(t.count)}
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--brand-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: COMBINED BOOKMARKS + PERSONAL NOTES */}
      {subTab === 'adsAndNotes' && (
        <div>
          {combinedItems.length === 0 ? (
            <div className="py-14 text-center space-y-1.5">
              <p className="text-[14px] text-[var(--content-neutral-default)]">
                آگهی نشان‌شده یا یادداشتی ندارید.
              </p>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                از نوار بالای هر آگهی می‌توانید آن را نشان کرده و یا یادداشتی روی آن بگذارید.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-neutral-weaker)] border-y border-[var(--border-neutral-weaker)]">
              {combinedItems.map((ad) => {
                const isBookmarked = bookmarkedIds.has(ad.id);
                const noteText = notes[ad.id]?.trim() || '';
                const isEditing = editingNoteId === ad.id;

                return (
                  <div key={ad.id} className="py-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        onClick={() => {
                          onSelectListing(ad);
                          onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <img
                          src={ad.images[0] || '/ads/fake-1.svg'}
                          alt={ad.title}
                          className="w-14 h-14 rounded-[4px] object-cover shrink-0 border border-[var(--border-neutral-weaker)]"
                        />
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)] truncate">
                            {ad.title}
                          </div>
                          <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                            {ad.city} · {ad.price > 0 ? formatToman(ad.price) : 'توافقی'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCompareWith(ad);
                          }}
                          className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-action)]" />
                          <span>مقایسه هوش مصنوعی</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(ad.id);
                            setEditingNoteText(noteText);
                          }}
                          className="kt-button--outlined !h-[30px] !px-2.5 text-[11px]"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{noteText ? 'ویرایش یادداشت' : 'افزودن یادداشت'}</span>
                        </button>
                        {isBookmarked && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(ad.id)}
                            className="kt-button--ghost !h-[30px] text-[11px] text-[var(--semantic-negative)]"
                          >
                            حذف نشان
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Personal Note Box */}
                    {isEditing ? (
                      <div className="flex gap-2 bg-[var(--surface-neutral-subtle)] p-2.5 rounded-[6px]">
                        <input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          placeholder="یادداشت خصوصی شما درباره این آگهی..."
                          className="kt-input !h-[34px] text-[12px] flex-1 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onSaveNote(ad.id, editingNoteText);
                            setEditingNoteId(null);
                          }}
                          className="kt-button--primary !h-[34px] !px-4 text-[12px]"
                        >
                          ذخیره
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="kt-button--outlined !h-[34px] !px-3 text-[12px]"
                        >
                          لغو
                        </button>
                      </div>
                    ) : (
                      noteText && (
                        <div className="p-2.5 rounded-[6px] bg-[var(--surface-neutral-subtle)] flex items-start justify-between gap-2 text-[12px]">
                          <div className="flex items-start gap-2 text-[var(--content-neutral-stronger)]">
                            <StickyNote className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                            <span>{noteText}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSaveNote(ad.id, '')}
                            className="text-[11px] text-[var(--semantic-negative)] hover:underline shrink-0"
                          >
                            حذف یادداشت
                          </button>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SAVED SEARCHES */}
      {subTab === 'searches' && (
        <div>
          {savedSearches.length === 0 ? (
            <div className="py-14 text-center space-y-1.5">
              <p className="text-[14px] text-[var(--content-neutral-default)]">
                جستجویی ذخیره نشده است.
              </p>
              <p className="text-[12px] text-[var(--content-neutral-default)]">
                در صفحه اصلی با دکمه «ذخیره جستجو» فیلتر دلخواه خود را به این فهرست اضافه کنید.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-neutral-weaker)] border-y border-[var(--border-neutral-weaker)]">
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-[14px] font-bold text-[var(--content-neutral-stronger)]">
                      {s.title}
                    </div>
                    <div className="text-[12px] text-[var(--content-neutral-default)] mt-0.5">
                      شهر: {s.cityLabel} · دسته: {s.category || 'همه دسته‌ها'}{' '}
                      {s.onlyExchange ? '· فقط معاوضه' : ''} · {s.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleSavedSearchNotify(s.id)}
                      className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium border ${
                        s.notifyEnabled
                          ? 'bg-[var(--semantic-positive-soft)] border-[var(--semantic-positive)] text-[var(--semantic-positive)]'
                          : 'border-[var(--border-neutral-weaker)] text-[var(--content-neutral-default)]'
                      }`}
                    >
                      {s.notifyEnabled ? 'اعلان فعال ✓' : 'اعلان خاموش'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApplySavedSearch(s);
                        onClose();
                      }}
                      className="kt-button--outlined !h-[30px] !px-3 text-[11px]"
                    >
                      <Search className="w-3 h-3" />
                      <span>اجرا</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedSearch(s.id)}
                      className="p-1.5 rounded text-[var(--semantic-negative)] hover:bg-[var(--brand-soft)]"
                      title="حذف جستجو"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
