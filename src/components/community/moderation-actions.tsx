'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { approvePost, rejectPost, type CommunityState } from '@/app/actions/community'
import { cn } from '@/lib/utils'

function ActionButton({ label, tone }: { label: string; tone: 'approve' | 'reject' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50',
        tone === 'approve'
          ? 'bg-gold-500 text-navy-900 hover:bg-gold-300'
          : 'border border-navy-900/15 text-muted hover:border-red-300 hover:text-red-600',
      )}
    >
      {pending ? '…' : label}
    </button>
  )
}

export function ModerationActions({ postId }: { postId: string }) {
  const [approveState, approve] = useActionState<CommunityState, FormData>(approvePost, null)
  const [rejectState, reject] = useActionState<CommunityState, FormData>(rejectPost, null)
  const state = approveState ?? rejectState

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <form action={approve}>
          <input type="hidden" name="postId" value={postId} />
          <ActionButton label="نشر" tone="approve" />
        </form>

        <form action={reject}>
          <input type="hidden" name="postId" value={postId} />
          <ActionButton label="رفض" tone="reject" />
        </form>
      </div>

      {state && (
        <p role="status" className={cn('mt-2 text-xs', state.ok ? 'text-gold-600' : 'text-red-600')}>
          {state.messageAr}
        </p>
      )}
    </div>
  )
}
