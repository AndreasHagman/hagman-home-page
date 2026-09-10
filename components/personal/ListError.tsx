'use client'

import Link from 'next/link'
import { SESSION_EXPIRED, type EditableListError } from '@/hooks/useEditableList'

interface ListErrorProps {
  error: EditableListError | null
  /** Render only when the error belongs to this item. `null` matches an add. */
  itemId: string | null
  className?: string
}

/**
 * Save failures for an editable list. An expired session is actionable, so it
 * links to the login page instead of leaving the admin to work out the fix.
 */
export default function ListError({ error, itemId, className = '' }: ListErrorProps) {
  if (!error || error.itemId !== itemId) return null

  return (
    <p className={`text-[11px] font-mono text-red-400 ${className}`.trim()}>
      {error.message === SESSION_EXPIRED ? (
        <Link href="/admin" className="underline underline-offset-2 hover:text-accent transition-colors duration-200">
          {error.message}
        </Link>
      ) : (
        error.message
      )}
    </p>
  )
}
