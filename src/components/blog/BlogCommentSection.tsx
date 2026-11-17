'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send } from 'lucide-react';
import { tahatorApi } from '@/lib/apiClient';
import { toPersianDigits } from '@/data/mockData';

interface CommentRow {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export default function BlogCommentSection({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: CommentRow[];
}) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 3) {
      setFeedback({ type: 'err', text: 'متن دیدگاه باید حداقل ۳ کاراکتر باشد.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const created = (await tahatorApi.addBlogComment(slug, body.trim())) as unknown as CommentRow;
      setComments((prev) => [created, ...prev]);
      setBody('');
      setFeedback({ type: 'ok', text: 'دیدگاه شما با موفقیت ثبت شد.' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text:
          err instanceof Error && err.message.includes('401')
            ? 'برای ثبت دیدگاه ابتدا در صفحه اصلی با شماره موبایل وارد حساب شوید.'
            : err instanceof Error
            ? err.message
            : 'برای ارسال دیدگاه ابتدا از صفحه اصلی وارد حساب کاربری شوید.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-[var(--border-neutral-weaker)] space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>دیدگاه کاربران ({toPersianDigits(comments.length)})</span>
        </h3>
        <Link href="/" className="text-[12px] font-bold text-[var(--brand-primary)] hover:underline">
          ورود به حساب در صفحه اصلی ‹
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="سوال یا تجربه خود درباره این موضوع را بنویسید..."
          className="w-full p-3 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] text-[13px] focus:outline-none focus:border-[var(--brand-action)]"
        />
        {feedback && (
          <div
            className={`p-2.5 rounded-[6px] text-[12px] font-medium ${
              feedback.type === 'ok'
                ? 'bg-[var(--semantic-positive-soft)] text-[var(--semantic-positive)]'
                : 'bg-[var(--brand-soft)] text-[var(--brand-primary)]'
            }`}
          >
            {feedback.text}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="kt-button--primary !h-[38px] !px-5 text-[12px] flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'در حال ارسال...' : 'ارسال دیدگاه'}</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="p-4 rounded-[8px] bg-[var(--surface-neutral-subtle)] text-[12.5px] text-[var(--content-neutral-default)]">
            هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-[8px] border border-[var(--border-neutral-weaker)] bg-[var(--surface-neutral-subtle)] space-y-1.5"
            >
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-[var(--content-neutral-stronger)]">{c.authorName}</span>
                <span className="text-[var(--content-neutral-default)]">
                  {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <p className="text-[13px] leading-6 text-[var(--content-neutral-stronger)]">{c.body}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
